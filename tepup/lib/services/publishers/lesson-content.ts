import type { ContentBlock } from '@/components/admin/editor/BlockEditor';
import { trimEmptyBlocks } from '@/lib/editor/trim-empty-blocks';
import { rebuildUsage } from '@/lib/library/usage-service';
import { blocksSnapshot, lockLessonContent, recordRevision } from '@/lib/services/revision-service';
import { blocksForRequestCompare, closeReviewRequestsOnPublish } from '@/lib/services/review-request-service';
import { ContributionInvalidError, StaleContributionError, isStale, type Publisher } from './types';

/** EDIT_LESSON_CONTENT: `{ title?, blocks }` replaces the live lesson content. */
export const publishLessonContent: Publisher = async ({ tx, contribution, data, reviewerId, force }) => {
  const lessonId = contribution.targetId;
  if (!lessonId) throw new ContributionInvalidError('Edit has no target lesson');
  const { title: newTitle, blocks: rawBlocks } = data as { title?: string; blocks: ContentBlock[] };

  const lesson = await tx.lesson.findUnique({ where: { id: lessonId }, select: { name: true, courseId: true } });
  if (!lesson) throw new ContributionInvalidError('Target lesson not found');

  // Under the row lock: has the live lesson changed since the proposal started?
  const live = await lockLessonContent(tx, lessonId);
  const stale = isStale(live?.updatedAt, contribution.baseUpdatedAt);
  if (stale && !force) throw new StaleContributionError(live?.updatedAt ?? null);

  // Empty lines would be blank steps in the player (lib/editor/trim-empty-blocks.ts).
  // updatedAt is left to Prisma, so the admin editor's conflict check still sees this write.
  const blocks = JSON.parse(JSON.stringify(trimEmptyBlocks(rawBlocks).blocks));
  const title = newTitle || live?.title || lesson.name;
  await tx.lessonContent.upsert({
    where: { lessonId },
    create: { lessonId, title, blocks },
    update: { title, blocks },
  });
  const revisionId = await recordRevision(tx, {
    targetType: 'LESSON',
    targetId: lessonId,
    courseId: lesson.courseId,
    label: lesson.name,
    snapshot: blocksSnapshot(title, blocks),
    source: 'CONTRIBUTION',
    actorId: reviewerId,
    authorId: contribution.contributorId,
    contributionId: contribution.id,
    previous: live && blocksSnapshot(live.title, live.blocks),
  });
  // A new live version: open "Gửi người duyệt" requests for the lesson close.
  await closeReviewRequestsOnPublish(tx, lessonId, { title, blocks: blocksForRequestCompare(blocks) }, revisionId);
  // "Xuất hiện trong" of every library entry the lesson links to.
  await rebuildUsage(tx, 'LESSON', lessonId, blocks);
  return { forced: stale, courseId: lesson.courseId };
};
