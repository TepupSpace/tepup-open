import type { ContentBlock } from '@/components/admin/editor/BlockEditor';
import { trimEmptyBlocks } from '@/lib/editor/trim-empty-blocks';
import { rebuildUsage } from '@/lib/library/usage-service';
import { blocksSnapshot, lockChapterContent, recordRevision } from '@/lib/services/revision-service';
import { ContributionInvalidError, StaleContributionError, isStale, type Publisher } from './types';

/** EDIT_CHAPTER_CONTENT: `{ title?, blocks }` replaces the live chapter content. */
export const publishChapterContent: Publisher = async ({ tx, contribution, data, reviewerId, force }) => {
  const chapterId = contribution.targetId;
  if (!chapterId) throw new ContributionInvalidError('Edit has no target chapter');
  const { title: newTitle, blocks: rawBlocks } = data as { title?: string; blocks: ContentBlock[] };

  const chapter = await tx.chapter.findUnique({ where: { id: chapterId }, select: { title: true } });
  if (!chapter) throw new ContributionInvalidError('Target chapter not found');

  // Under the row lock: has the live chapter changed since the proposal started?
  const live = await lockChapterContent(tx, chapterId);
  const stale = isStale(live?.updatedAt, contribution.baseUpdatedAt);
  if (stale && !force) throw new StaleContributionError(live?.updatedAt ?? null);

  // Empty lines would be blank steps in the player; updatedAt is left to Prisma, so the
  // admin chapter editor's conflict check still sees this write.
  const blocks = JSON.parse(JSON.stringify(trimEmptyBlocks(rawBlocks).blocks));
  const title = newTitle || live?.title || chapter.title;
  await tx.chapterContent.upsert({
    where: { chapterId },
    create: { chapterId, title, blocks },
    update: { title, blocks },
  });
  await recordRevision(tx, {
    targetType: 'CHAPTER',
    targetId: chapterId,
    courseId: null,
    label: chapter.title,
    snapshot: blocksSnapshot(title, blocks),
    source: 'CONTRIBUTION',
    actorId: reviewerId,
    authorId: contribution.contributorId,
    contributionId: contribution.id,
    previous: live && blocksSnapshot(live.title, live.blocks),
  });
  // "Xuất hiện trong" of every library entry the chapter links to.
  await rebuildUsage(tx, 'CHAPTER', chapterId, blocks);
  return { forced: stale, courseId: null };
};
