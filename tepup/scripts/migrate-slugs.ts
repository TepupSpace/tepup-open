/**
 * One-time migration to the hierarchical slug scheme.
 *
 *   Lesson  -> /courses/<courseSlug>/<lessonSlug>   slug unique per course
 *   Chapter -> /story/<char>/<story>/<chapterSlug>  slug unique per story
 *
 * Also folds the legacy `Story.relatedCourses` string array (course slugs, no FK)
 * into the existing CourseStoryRecommendation join table.
 *
 * Run order — the schema must be at "beat 1" (courseId/storyId added as nullable,
 * global @unique on slug already dropped) before this runs, otherwise regenerating
 * slugs collides across courses.
 *
 *   npx tsx scripts/migrate-slugs.ts            # dry run, prints everything, writes nothing
 *   npx tsx scripts/migrate-slugs.ts --apply    # writes
 *
 * Idempotent: running it twice produces the same slugs and no duplicate rows.
 */
import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { slugify, uniqueSlug } from '../lib/utils/slug';

const APPLY = process.argv.includes('--apply');

type Change = { id: string; from: string | null; to: string; parent: string };

async function planLessons(): Promise<Change[]> {
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      slug: true,
      levels: {
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          lessons: {
            orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
            select: { id: true, slug: true, name: true },
          },
        },
      },
    },
  });

  const changes: Change[] = [];
  for (const course of courses) {
    // Uniqueness scope is the course, spanning every level inside it.
    const taken = new Set<string>();
    for (const level of course.levels) {
      for (const lesson of level.lessons) {
        const next = uniqueSlug(slugify(lesson.name) || `lesson-${lesson.id.slice(-6)}`, taken);
        taken.add(next);
        changes.push({ id: lesson.id, from: lesson.slug, to: next, parent: course.slug });
      }
    }
  }
  return changes;
}

async function planChapters(): Promise<Change[]> {
  const stories = await prisma.story.findMany({
    select: {
      id: true,
      slug: true,
      parts: {
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          chapters: {
            orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
            select: { id: true, slug: true, title: true },
          },
        },
      },
    },
  });

  const changes: Change[] = [];
  for (const story of stories) {
    const taken = new Set<string>();
    for (const part of story.parts) {
      for (const chapter of part.chapters) {
        const next = uniqueSlug(slugify(chapter.title) || `chapter-${chapter.id.slice(-6)}`, taken);
        taken.add(next);
        changes.push({ id: chapter.id, from: chapter.slug, to: next, parent: story.slug });
      }
    }
  }
  return changes;
}

function report(label: string, changes: Change[]) {
  console.log(`\n=== ${label} (${changes.length}) ===`);
  const moved = changes.filter((c) => c.from !== c.to);
  for (const c of changes) {
    const mark = c.from === c.to ? '  ' : c.from === null ? '+ ' : '~ ';
    console.log(`${mark}[${c.parent}] ${String(c.from ?? '(null)').padEnd(38)} -> ${c.to}`);
  }
  console.log(`-- unchanged: ${changes.length - moved.length}, renamed: ${moved.filter((c) => c.from !== null).length}, filled from null: ${moved.filter((c) => c.from === null).length}`);
}

async function planRecommendations() {
  const [stories, courses, existing] = await Promise.all([
    prisma.story.findMany({ select: { id: true, slug: true, relatedCourses: true } }),
    prisma.course.findMany({ select: { id: true, slug: true } }),
    prisma.courseStoryRecommendation.findMany({ select: { courseId: true, storyId: true } }),
  ]);

  const courseIdBySlug = new Map(courses.map((c) => [c.slug, c.id]));
  const already = new Set(existing.map((r) => `${r.courseId}:${r.storyId}`));

  const toCreate: { courseId: string; storyId: string; sortOrder: number; label: string }[] = [];
  const orphans: string[] = [];

  for (const story of stories) {
    story.relatedCourses.forEach((courseSlug, i) => {
      const courseId = courseIdBySlug.get(courseSlug);
      if (!courseId) {
        orphans.push(`${story.slug} -> ${courseSlug}`);
        return;
      }
      if (already.has(`${courseId}:${story.id}`)) return;
      already.add(`${courseId}:${story.id}`);
      toCreate.push({ courseId, storyId: story.id, sortOrder: i, label: `${story.slug} -> ${courseSlug}` });
    });
  }

  console.log(`\n=== CourseStoryRecommendation (${toCreate.length} new) ===`);
  toCreate.forEach((r) => console.log(`+ ${r.label}`));
  if (orphans.length) {
    console.log(`\n!! DROPPED — relatedCourses slug has no matching course (${orphans.length}):`);
    orphans.forEach((o) => console.log(`   x ${o}`));
  } else {
    console.log('   (no orphan course slugs)');
  }

  return toCreate;
}

(async () => {
  console.log(APPLY ? '*** APPLY — writing to the database ***' : '*** DRY RUN — nothing will be written ***');

  const lessons = await planLessons();
  const chapters = await planChapters();
  report('Lesson slugs', lessons);
  report('Chapter slugs', chapters);
  const recommendations = await planRecommendations();

  // A slug is only valid if it is unique inside its parent — assert before writing.
  for (const [label, changes] of [['lesson', lessons], ['chapter', chapters]] as const) {
    const seen = new Set<string>();
    for (const c of changes) {
      const key = `${c.parent}/${c.to}`;
      if (seen.has(key)) throw new Error(`Duplicate ${label} slug within parent: ${key}`);
      if (!c.to) throw new Error(`Empty ${label} slug for id=${c.id}`);
      seen.add(key);
    }
  }

  if (!APPLY) {
    console.log('\nDry run complete. Re-run with --apply to write.');
    await prisma.$disconnect();
    return;
  }

  await prisma.$transaction(async (tx) => {
    // Backfill the denormalized parent FKs from the existing level/part links.
    await tx.$executeRaw`UPDATE "Lesson" l SET "courseId" = lv."courseId" FROM "Level" lv WHERE l."levelId" = lv.id`;
    await tx.$executeRaw`UPDATE "Chapter" c SET "storyId" = p."storyId" FROM "StoryPart" p WHERE c."partId" = p.id`;

    for (const c of lessons) {
      if (c.from === c.to) continue;
      await tx.lesson.update({ where: { id: c.id }, data: { slug: c.to } });
    }
    for (const c of chapters) {
      if (c.from === c.to) continue;
      await tx.chapter.update({ where: { id: c.id }, data: { slug: c.to } });
    }
    if (recommendations.length) {
      await tx.courseStoryRecommendation.createMany({
        data: recommendations.map(({ courseId, storyId, sortOrder }) => ({ courseId, storyId, sortOrder })),
        skipDuplicates: true,
      });
    }
  }, { timeout: 120_000 });

  // Raw SQL: the Prisma types already declare these columns non-null (the tightened
  // schema), but the database has not been tightened yet — that is exactly what we
  // are verifying here, so we have to ask Postgres directly.
  const [[{ count: nullLessonSlug }], [{ count: nullChapterSlug }], [{ count: nullCourseId }], [{ count: nullStoryId }]] =
    await Promise.all([
      prisma.$queryRaw<{ count: bigint }[]>`SELECT count(*) FROM "Lesson" WHERE slug IS NULL`,
      prisma.$queryRaw<{ count: bigint }[]>`SELECT count(*) FROM "Chapter" WHERE slug IS NULL`,
      prisma.$queryRaw<{ count: bigint }[]>`SELECT count(*) FROM "Lesson" WHERE "courseId" IS NULL`,
      prisma.$queryRaw<{ count: bigint }[]>`SELECT count(*) FROM "Chapter" WHERE "storyId" IS NULL`,
    ]);

  console.log('\n=== post-write check (all must be 0) ===');
  console.log('lesson.slug null     :', Number(nullLessonSlug));
  console.log('chapter.slug null    :', Number(nullChapterSlug));
  console.log('lesson.courseId null :', Number(nullCourseId));
  console.log('chapter.storyId null :', Number(nullStoryId));
  console.log('recommendation rows  :', await prisma.courseStoryRecommendation.count());

  if (Number(nullLessonSlug) || Number(nullChapterSlug) || Number(nullCourseId) || Number(nullStoryId)) {
    throw new Error('Migration left null values — do NOT tighten the schema yet.');
  }
  console.log('\nDone. Safe to apply the tightening schema (beat 3).');
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error('\nMIGRATION FAILED:', e);
  await prisma.$disconnect();
  process.exit(1);
});
