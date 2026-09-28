/**
 * Seed the rewritten story layer: 6 nhân vật × 4 course.
 *
 * Everything is upserted by slug, so re-running is safe and idempotent.
 *
 *   npx tsx scripts/seed-stories-v2.ts --env=<path>                    # dry run
 *   npx tsx scripts/seed-stories-v2.ts --env=<path> --apply            # writes
 *   npx tsx scripts/seed-stories-v2.ts --env=<path> --only=logic-101   # one course
 *   npx tsx scripts/seed-stories-v2.ts --env=<path> --only=minh-logic  # one story
 *
 * `--env` is REQUIRED and has no default — this script can target the live
 * production database.
 *
 *   staging:    --env=.env
 *   production: --env='tepup-(.env)/.env.production'
 *
 * Maintenance steps, each opt-in:
 *   --fix-orphans  hide stories with no matching course; drop empty chapters
 *   --merge-duc    fold duc-lao-dong-so's 7 short chapters into 2 long ones
 *   --links        rebuild CourseStoryRecommendation (currently EMPTY on prod)
 *
 * Authored chapters must pass scripts/stories-v2/validate.ts. --apply refuses
 * to write a story that fails; a dry run reports the numbers either way.
 */
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import type { ContentBlock } from '../lib/types/content';
import { CHARACTERS } from './stories-v2/characters';
import { ALL_STORIES, ORPHAN_STORY_SLUGS, DUC_STORY_SLUG, DUC_COURSE_SLUGS } from './stories-v2/index';
import { validateStory, formatStats } from './stories-v2/validate';
import type { StorySeed } from './stories-v2/types';

// ─── args ─────────────────────────────────────────────────────────────────────

const APPLY = process.argv.includes('--apply');
const FIX_ORPHANS = process.argv.includes('--fix-orphans');
const MERGE_DUC = process.argv.includes('--merge-duc');
const LINKS = process.argv.includes('--links');
const onlyArg = process.argv.find((a) => a.startsWith('--only='));
const ONLY = onlyArg?.slice('--only='.length);

const envArg = process.argv.find((a) => a.startsWith('--env='));
if (!envArg) {
  console.error('ERROR: --env=<path to env file> is required.');
  console.error("  staging:    --env=.env");
  console.error("  production: --env='tepup-(.env)/.env.production'");
  process.exit(1);
}

const envPath = envArg.slice('--env='.length);
const parsed = dotenv.config({ path: envPath, override: true });
const databaseUrl = parsed.parsed?.DATABASE_URL;
if (!databaseUrl) {
  console.error(`ERROR: no DATABASE_URL found in ${envPath}`);
  process.exit(1);
}

const projectRef = databaseUrl.match(/postgres\.([a-z]+)/)?.[1] ?? 'unknown';
const KNOWN: Record<string, string> = {}; // add your Supabase project refs: { '<ref>': 'STAGING' | 'PRODUCTION' }
const targetLabel = KNOWN[projectRef as keyof typeof KNOWN] ?? `UNKNOWN (${projectRef})`;

const pool = new pg.Pool({ connectionString: databaseUrl, max: 5, connectionTimeoutMillis: 15_000 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool), log: ['error'] });

/** Thứ tự hiển thị các câu chuyện của một nhân vật, theo thứ tự khoá học.
 *  Đặt ở đây thay vì trong từng file story để bốn câu chuyện của mỗi nhân vật
 *  luôn xếp cùng một trật tự, không phụ thuộc vào việc file nào được viết trước. */
const COURSE_ORDER: Record<string, number> = {
  'logic-101': 0,
  thue: 1,
  'nguoi-la-biet-gi-ve-ban': 2,
  'dan-chu-101': 3,
};

/** Ước lượng thời gian đọc từ chính nội dung, làm tròn tới 5 phút.
 *  ~1000 ký tự mỗi phút cho văn xuôi tiếng Việt, cộng 30 giây cho mỗi câu hỏi. */
function estimateTime(story: StorySeed): string {
  const stats = validateStory(story);
  const chars = stats.chapters.reduce((n, c) => n + c.chars, 0);
  const questions = stats.chapters.reduce((n, c) => n + c.questions, 0);
  const minutes = Math.round((chars / 1000 + questions * 0.5) / 5) * 5;
  return `~${minutes} phút`;
}

function plan(msg: string) {
  console.log(`  ${msg}`);
}

/** `--only=` matches either a story slug or a course slug. */
function selected(story: StorySeed): boolean {
  if (!ONLY) return true;
  return story.slug === ONLY || story.courseSlugs.includes(ONLY);
}

// ─── steps ────────────────────────────────────────────────────────────────────

async function seedCharacters() {
  console.log('\n▸ Nhân vật');
  for (const c of CHARACTERS) {
    const existing = await prisma.character.findUnique({ where: { slug: c.slug } });
    plan(`${existing ? 'update' : 'create'}  ${c.slug.padEnd(14)} ${c.name} — ${c.role}`);
    if (!APPLY) continue;
    await prisma.character.upsert({
      where: { slug: c.slug },
      create: { ...c, isActive: true },
      update: {
        name: c.name,
        role: c.role,
        description: c.description,
        icon: c.icon,
        color: c.color,
        bgColor: c.bgColor,
        sortOrder: c.sortOrder,
        isActive: true,
      },
    });
  }
}

/**
 * Replace a story's parts/chapters wholesale. Chapters are keyed by
 * (storyId, slug) so re-seeding overwrites content in place; chapters that the
 * seed no longer lists are removed, which is what makes a rewrite a rewrite.
 */
async function seedStory(story: StorySeed) {
  const character = await prisma.character.findUnique({ where: { slug: story.characterSlug } });
  if (!character) {
    plan(`SKIP ${story.slug} — chưa có nhân vật "${story.characterSlug}"`);
    return;
  }

  const existing = await prisma.story.findUnique({
    where: { slug: story.slug },
    include: { parts: { include: { chapters: true } } },
  });

  const sortOrder = COURSE_ORDER[story.courseSlugs[0]] ?? story.sortOrder;
  const estimatedTime = estimateTime(story);

  const oldChapters = existing?.parts.flatMap((p) => p.chapters) ?? [];
  const keep = new Set(story.part.chapters.map((c) => c.slug));
  const dropping = oldChapters.filter((c) => !keep.has(c.slug));

  plan(
    `${existing ? 'rewrite' : 'create '} ${story.slug.padEnd(18)} ${estimatedTime.padEnd(10)} "${story.title}"` +
      (dropping.length ? `  (xoá ${dropping.length} chương cũ: ${dropping.map((c) => c.slug).join(', ')})` : '')
  );
  if (!APPLY) return;

  const saved = await prisma.story.upsert({
    where: { slug: story.slug },
    create: {
      slug: story.slug,
      characterId: character.id,
      title: story.title,
      teaser: story.teaser,
      icon: story.icon,
      estimatedTime,
      sortOrder,
      isActive: true,
    },
    update: {
      characterId: character.id,
      title: story.title,
      teaser: story.teaser,
      icon: story.icon,
      estimatedTime,
      sortOrder,
      isActive: true,
    },
  });

  // One StoryPart per story. Extra parts left over from an older shape are removed.
  const parts = await prisma.storyPart.findMany({ where: { storyId: saved.id }, orderBy: { sortOrder: 'asc' } });
  let partId: string;
  if (parts.length === 0) {
    partId = (await prisma.storyPart.create({ data: { storyId: saved.id, name: story.part.name, sortOrder: 0 } })).id;
  } else {
    partId = parts[0].id;
    await prisma.storyPart.update({ where: { id: partId }, data: { name: story.part.name, sortOrder: 0 } });
    for (const extra of parts.slice(1)) {
      await prisma.chapter.updateMany({ where: { partId: extra.id }, data: { partId } });
      await prisma.storyPart.delete({ where: { id: extra.id } });
    }
  }

  for (const [i, ch] of story.part.chapters.entries()) {
    const chapter = await prisma.chapter.upsert({
      where: { storyId_slug: { storyId: saved.id, slug: ch.slug } },
      create: { slug: ch.slug, partId, storyId: saved.id, title: ch.title, sortOrder: i, isActive: true },
      update: { partId, title: ch.title, sortOrder: i, isActive: true },
    });
    await prisma.chapterContent.upsert({
      where: { chapterId: chapter.id },
      create: { chapterId: chapter.id, title: ch.title, blocks: ch.blocks as object },
      update: { title: ch.title, blocks: ch.blocks as object },
    });
  }

  for (const gone of dropping) await prisma.chapter.delete({ where: { id: gone.id } });
}

/** The bug this fixes: CourseStoryRecommendation is empty on production, so no
 *  course page shows a story and no story page shows a course. */
async function seedLinks() {
  console.log('\n▸ Liên kết Course ↔ Story');
  const wanted: { storySlug: string; courseSlugs: string[] }[] = [
    ...ALL_STORIES.filter(selected).map((s) => ({ storySlug: s.slug, courseSlugs: s.courseSlugs })),
  ];
  if (!ONLY || ONLY === DUC_STORY_SLUG || DUC_COURSE_SLUGS.includes(ONLY)) {
    wanted.push({ storySlug: DUC_STORY_SLUG, courseSlugs: DUC_COURSE_SLUGS });
  }

  for (const { storySlug, courseSlugs } of wanted) {
    const story = await prisma.story.findUnique({ where: { slug: storySlug } });
    if (!story) {
      plan(`SKIP ${storySlug} — chưa có trên DB`);
      continue;
    }
    for (const [i, courseSlug] of courseSlugs.entries()) {
      const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
      if (!course) {
        plan(`SKIP ${storySlug} → ${courseSlug} — không có course này`);
        continue;
      }
      const existing = await prisma.courseStoryRecommendation.findUnique({
        where: { courseId_storyId: { courseId: course.id, storyId: story.id } },
      });
      plan(`${existing ? 'ok    ' : 'link  '} ${storySlug.padEnd(18)} → ${courseSlug}`);
      if (!APPLY || existing) continue;
      await prisma.courseStoryRecommendation.create({
        data: { courseId: course.id, storyId: story.id, sortOrder: i },
      });
    }
  }
}

async function fixOrphans() {
  console.log('\n▸ Dọn dẹp');
  for (const slug of ORPHAN_STORY_SLUGS) {
    const story = await prisma.story.findUnique({ where: { slug } });
    if (!story) {
      plan(`bỏ qua  ${slug} — không tồn tại`);
      continue;
    }
    if (!story.isActive) {
      plan(`ok      ${slug} — đã ẩn`);
      continue;
    }
    plan(`ẩn      ${slug} — không còn course tương ứng`);
    if (APPLY) await prisma.story.update({ where: { id: story.id }, data: { isActive: false } });
  }

  // Chapters with no ChapterContent render as "Chương này chưa có nội dung."
  const empty = await prisma.chapter.findMany({ where: { content: null }, include: { story: true } });
  for (const ch of empty) {
    plan(`xoá     chương rỗng ${ch.story.slug}/${ch.slug} — "${ch.title}"`);
    if (APPLY) await prisma.chapter.delete({ where: { id: ch.id } });
  }
  if (!empty.length) plan('ok      không còn chương rỗng nào');
}

/**
 * Đức's story was 2 parts × 7 short chapters (6–7 blocks each), well under the
 * length the rest of the rewrite targets. Fold each part's chapters into one
 * long chapter, then collapse the two parts into one — the original prose is
 * kept verbatim, only re-sectioned.
 */
async function mergeDuc() {
  console.log('\n▸ Gộp câu chuyện của Đức');
  const story = await prisma.story.findUnique({
    where: { slug: DUC_STORY_SLUG },
    include: {
      parts: { orderBy: { sortOrder: 'asc' }, include: { chapters: { orderBy: { sortOrder: 'asc' }, include: { content: true } } } },
    },
  });
  if (!story) {
    plan(`bỏ qua  ${DUC_STORY_SLUG} — không tồn tại`);
    return;
  }

  const TARGETS = [
    { slug: 'can-lao-thoi-dai-so', title: 'Cần lao thời đại số' },
    { slug: 'vung-xam-phap-ly', title: 'Vùng xám pháp lý' },
  ];

  // Đức's story sits in the Riêng Tư slot of his row, same as the other characters.
  if (story.sortOrder !== 2) {
    plan(`sortOrder ${story.sortOrder} → 2 (khớp vị trí Riêng Tư trong hàng của Đức)`);
    if (APPLY) await prisma.story.update({ where: { id: story.id }, data: { sortOrder: 2 } });
  }

  if (story.parts.length === 1 && story.parts[0].chapters.length === 2) {
    plan('ok      đã gộp rồi');
    return;
  }
  if (story.parts.length !== 2) {
    plan(`bỏ qua  hình dạng bất ngờ: ${story.parts.length} phần — cần kiểm tra tay`);
    return;
  }

  const merged = story.parts.map((part, pi) => {
    const blocks: ContentBlock[] = [];
    for (const [ci, ch] of part.chapters.entries()) {
      const own = (ch.content?.blocks ?? []) as unknown as ContentBlock[];
      // Each source chapter becomes a titled section of the merged chapter.
      blocks.push({ type: 'heading', level: 2, html: ch.title });
      // Only the final section keeps its closing "success" callout; the earlier
      // ones become mid-chapter recaps so the chapter reads as one arc.
      const isLast = ci === part.chapters.length - 1;
      for (const b of own) {
        if (!isLast && b.type === 'callout' && b.variant === 'success') {
          blocks.push({ ...b, variant: 'info' });
        } else {
          blocks.push(b);
        }
      }
    }
    return { ...TARGETS[pi], blocks, sourceCount: part.chapters.length };
  });

  for (const m of merged) {
    plan(`gộp     ${m.sourceCount} chương → ${m.slug.padEnd(22)} ${m.blocks.length} block`);
  }
  plan(`gộp     2 phần → 1 phần "Câu chuyện về Lao động Số"`);
  if (!APPLY) return;

  const keepPart = story.parts[0];
  await prisma.storyPart.update({ where: { id: keepPart.id }, data: { name: 'Câu chuyện về Lao động Số', sortOrder: 0 } });

  const oldChapterIds = story.parts.flatMap((p) => p.chapters.map((c) => c.id));

  for (const [i, m] of merged.entries()) {
    const chapter = await prisma.chapter.create({
      data: { slug: `${m.slug}-v2`, partId: keepPart.id, storyId: story.id, title: m.title, sortOrder: 100 + i },
    });
    await prisma.chapterContent.create({
      data: { chapterId: chapter.id, title: m.title, blocks: m.blocks as object },
    });
  }

  // Old chapters go only after the merged ones exist, so a crash mid-way never
  // leaves the story empty.
  await prisma.chapter.deleteMany({ where: { id: { in: oldChapterIds } } });
  for (const [i, m] of merged.entries()) {
    await prisma.chapter.update({
      where: { storyId_slug: { storyId: story.id, slug: `${m.slug}-v2` } },
      data: { slug: m.slug, sortOrder: i },
    });
  }
  await prisma.storyPart.deleteMany({ where: { storyId: story.id, id: { not: keepPart.id } } });
  await prisma.story.update({
    where: { id: story.id },
    data: { estimatedTime: '~40 phút', teaser: 'Đức chạy xe công nghệ 12 tiếng mỗi ngày. Người ra lệnh cho anh không phải một ông sếp, mà là một thuật toán.' },
  });
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('');
  console.log('═'.repeat(76));
  console.log(`  Story rewrite — 6 nhân vật × 4 course`);
  console.log(`  target : ${targetLabel}  [${projectRef}]`);
  console.log(`  env    : ${envPath}`);
  console.log(`  mode   : ${APPLY ? '*** APPLY — WILL WRITE ***' : 'dry run (no writes)'}`);
  if (ONLY) console.log(`  only   : ${ONLY}`);
  console.log('═'.repeat(76));

  const stories = ALL_STORIES.filter(selected);

  if (stories.length) {
    console.log('\n▸ Kiểm tra độ dài');
    const failed: string[] = [];
    for (const s of stories) {
      const stats = validateStory(s);
      formatStats(stats).forEach((l) => console.log(l));
      if (!stats.ok) failed.push(s.slug);
    }
    if (failed.length) {
      console.log(`\n  ✗ ${failed.length} story không đạt: ${failed.join(', ')}`);
      if (APPLY) {
        console.error('\nERROR: từ chối ghi nội dung không đạt chuẩn độ dài. Sửa rồi chạy lại.');
        process.exit(1);
      }
    } else {
      console.log(`\n  ✓ ${stories.length} story đạt chuẩn`);
    }
  } else if (ONLY) {
    console.log('\n  (chưa có story nào khớp --only)');
  }

  await seedCharacters();

  if (stories.length) {
    console.log('\n▸ Câu chuyện');
    for (const s of stories) await seedStory(s);
  }

  if (FIX_ORPHANS) await fixOrphans();
  if (MERGE_DUC) await mergeDuc();
  if (LINKS || stories.length) await seedLinks();

  console.log('\n' + '─'.repeat(76));
  console.log(APPLY ? '  Xong — đã ghi vào DB.' : '  Dry run — chưa ghi gì. Thêm --apply để thực hiện.');
  console.log('');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
