import type { Prisma } from '@prisma/client';
import { slugifyUnique } from '@/lib/utils/slug';
import { lockCourse } from '@/lib/services/revision-service';
import { buildOutline, outlineHash, recordOutlineRevision } from '@/lib/services/outline-service';
import {
  checkOutlineAgainstLive,
  levelKey,
  type CourseOutlineProposal,
} from '@/lib/schemas/contribution-types/course-outline';
import { isOutlineBaseSnapshot } from '@/lib/services/outline-proposal';
import { ContributionInvalidError, StaleContributionError, type Publisher } from './types';

type Tx = Prisma.TransactionClient;

/** Lesson slug unique within the course, read inside the transaction (lessonSlugInCourse uses prisma). */
function nextLessonSlug(name: string, taken: Set<string>): string {
  const slug = slugifyUnique(name, taken, 'bai-hoc');
  taken.add(slug);
  return slug;
}

async function takenLessonSlugs(tx: Tx, courseId: string): Promise<Set<string>> {
  const rows = await tx.lesson.findMany({ where: { courseId }, select: { slug: true } });
  return new Set(rows.map((r) => r.slug));
}

/**
 * EDIT_COURSE (proposal §6.7, §12): applies a proposed outline to the course.
 *
 * Under the course row lock: refuses a stale base (the live outline's hash differs from the
 * one the proposal started from) unless `force`; renames the course, levels and lessons
 * (slugs are kept, so links keep working); applies the order and moves between levels;
 * creates inserted levels, and inserted lessons HIDDEN with no content. Nothing is deleted.
 * Records the new outline as a COURSE_OUTLINE revision.
 *
 * With `force` on a stale base, the proposal is applied as far as it still fits: ids that no
 * longer exist are skipped, and lessons/levels added meanwhile keep their place after the
 * proposed ones.
 */
export const publishCourseOutline: Publisher = async ({ tx, contribution, data, reviewerId, force }) => {
  const courseId = contribution.targetId;
  if (!courseId) throw new ContributionInvalidError('Outline proposal has no target course');
  const proposal = data as CourseOutlineProposal;

  const locked = await lockCourse(tx, courseId);
  if (!locked) throw new ContributionInvalidError('Target course not found');
  const live = await buildOutline(tx, courseId);
  if (!live) throw new ContributionInvalidError('Target course not found');

  const base = contribution.baseSnapshot;
  if (!isOutlineBaseSnapshot(base)) throw new ContributionInvalidError('Outline proposal has no base');
  const stale = outlineHash(live) !== base.hash;
  if (stale && !force) throw new StaleContributionError(null);

  if (!stale) {
    // Same outline as the base: the proposal must account for every level and lesson.
    const issues = checkOutlineAgainstLive(proposal, live);
    if (issues.length) {
      throw new ContributionInvalidError(`Outline does not match the course: ${issues.map((i) => i.message).join('; ')}`);
    }
  }

  const liveLevels = new Map(live.levels.map((l) => [l.id, l]));
  const liveLessons = new Map(live.lessons.map((l) => [l.id, l]));

  // --- course name and description ---
  const name = proposal.course.name.trim();
  const description = proposal.course.description.trim() || null;
  if (name !== live.course.name || description !== (live.course.description || null)) {
    await tx.course.update({ where: { id: courseId }, data: { name, description } });
  }

  // --- levels: proposed order (skipping ids gone meanwhile), then any added meanwhile ---
  const levelIdByKey = new Map<string, string>();
  const levelOrder: string[] = [];
  for (const lv of proposal.levels) {
    if (lv.id) {
      if (!liveLevels.has(lv.id)) continue; // deleted since the base (force only)
      levelIdByKey.set(levelKey(lv), lv.id);
      levelOrder.push(lv.id);
      const cur = liveLevels.get(lv.id)!;
      const newName = lv.name.trim();
      const sortOrder = levelOrder.length;
      if (cur.name !== newName || cur.sortOrder !== sortOrder) {
        await tx.level.update({ where: { id: lv.id }, data: { name: newName, sortOrder } });
      }
    } else {
      const created = await tx.level.create({
        data: { courseId, name: lv.name.trim(), sortOrder: levelOrder.length + 1 },
        select: { id: true },
      });
      levelIdByKey.set(levelKey(lv), created.id);
      levelOrder.push(created.id);
    }
  }
  for (const lv of live.levels) {
    if (levelOrder.includes(lv.id)) continue;
    levelOrder.push(lv.id);
    if (lv.sortOrder !== levelOrder.length) {
      await tx.level.update({ where: { id: lv.id }, data: { sortOrder: levelOrder.length } });
    }
  }

  // --- lessons: order within each level follows the array order ---
  const slugs = await takenLessonSlugs(tx, courseId);
  const position = new Map<string, number>(); // levelId → lessons placed so far
  const placed = new Set<string>();
  const nextPos = (levelId: string) => {
    const n = (position.get(levelId) ?? 0) + 1;
    position.set(levelId, n);
    return n;
  };

  for (const ls of proposal.lessons) {
    const levelId = levelIdByKey.get(ls.levelRef);
    if (ls.id) {
      const cur = liveLessons.get(ls.id);
      if (!cur) continue; // deleted since the base (force only)
      // Its level was deleted meanwhile (force only): leave the lesson where it is now.
      const targetLevel = levelId ?? cur.levelId;
      const sortOrder = nextPos(targetLevel);
      placed.add(ls.id);
      const newName = ls.name.trim();
      if (cur.name !== newName || cur.levelId !== targetLevel || cur.sortOrder !== sortOrder) {
        // The slug is NOT touched: renaming keeps the URL.
        await tx.lesson.update({ where: { id: ls.id }, data: { name: newName, levelId: targetLevel, sortOrder } });
      }
    } else {
      if (!levelId) throw new ContributionInvalidError('A new lesson points at a level that no longer exists');
      const lessonName = ls.name.trim();
      // Hidden, with no LessonContent: filled later by a lesson-content proposal (§6.7).
      await tx.lesson.create({
        data: {
          name: lessonName,
          slug: nextLessonSlug(lessonName, slugs),
          courseId,
          levelId,
          sortOrder: nextPos(levelId),
          isActive: false,
        },
      });
    }
  }
  // Lessons added meanwhile (force only) stay in their level, after the proposed ones.
  for (const ls of live.lessons) {
    if (placed.has(ls.id)) continue;
    const sortOrder = nextPos(ls.levelId);
    if (ls.sortOrder !== sortOrder) await tx.lesson.update({ where: { id: ls.id }, data: { sortOrder } });
  }

  await recordOutlineRevision(tx, courseId, {
    source: 'CONTRIBUTION',
    actorId: reviewerId,
    authorId: contribution.contributorId,
    contributionId: contribution.id,
    previous: live,
  });

  return { forced: stale, courseId };
};
