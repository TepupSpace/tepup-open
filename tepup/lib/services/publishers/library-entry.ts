import { entrySnapshotJson, readEntrySnapshot } from '@/lib/library/entry-snapshot';
import { EntryValidationError, prepareEntryWrite, updateEntryInTx } from '@/lib/library/entry-service';
import type { EntryInput, EntryType } from '@/lib/library/schemas';
import {
  CONTRIBUTOR_META_KEYS,
  pickContributorMeta,
  type LibraryEntryProposal,
} from '@/lib/schemas/contribution-types/library-entry';
import { lockLibraryEntry, recordRevision } from '@/lib/services/revision-service';
import { ContributionInvalidError, StaleContributionError, isStale, type Publisher } from './types';

/**
 * EDIT_LIBRARY_ENTRY: merges the proposal's contributor-editable subset into the live entry.
 * Admin-only fields come from the live entry: slug, type, isActive, sourceKey (recomputed
 * by entry-service), admin-only meta keys (tool owner/review date, source lastCheckedAt) and
 * EXPANDS_TO links. The same checks as an admin save run (entry-service validate). The core
 * calls revalidateLibrary() after commit.
 */
export const publishLibraryEntry: Publisher = async ({ tx, contribution, data, reviewerId, force }) => {
  const entryId = contribution.targetId;
  if (!entryId) throw new ContributionInvalidError('Edit has no target entry');
  const proposal = data as LibraryEntryProposal;

  const lock = await lockLibraryEntry(tx, entryId);
  if (!lock) throw new ContributionInvalidError('Target entry not found');
  const stale = isStale(lock.updatedAt, contribution.baseUpdatedAt);
  if (stale && !force) throw new StaleContributionError(lock.updatedAt);

  // History stores the full editable snapshot (lib/library/entry-snapshot.ts), like every
  // other writer of entries, so diffs and restores stay consistent.
  const before = await readEntrySnapshot(tx, entryId);
  const live = await tx.libraryEntry.findUniqueOrThrow({
    where: { id: entryId },
    include: { linksFrom: { select: { toId: true, kind: true, order: true } } },
  });
  const type = live.type as EntryType;
  const liveMeta = (live.meta && typeof live.meta === 'object' && !Array.isArray(live.meta) ? live.meta : {}) as Record<
    string,
    unknown
  >;

  // Admin-only meta keys stay as they are; descriptive keys of this type come from the proposal
  // (a key the proposal dropped is removed).
  const editable = CONTRIBUTOR_META_KEYS[type];
  const adminMeta = Object.fromEntries(Object.entries(liveMeta).filter(([k]) => !editable.includes(k)));
  const meta = { ...adminMeta, ...pickContributorMeta(type, proposal.meta) };

  const input: EntryInput = {
    slug: live.slug,
    type,
    title: proposal.title,
    summary: proposal.summary,
    body: proposal.body ?? null,
    meta,
    isActive: live.isActive,
    links: [
      ...proposal.links,
      // EXPANDS_TO is admin-only: keep the live ones. MENTIONS are rebuilt by writeLinks.
      ...live.linksFrom
        .filter((l) => l.kind === 'EXPANDS_TO')
        .map((l) => ({ toId: l.toId, kind: 'EXPANDS_TO' as const, order: l.order })),
    ],
  };

  let updated;
  try {
    const prepared = await prepareEntryWrite(input, entryId);
    updated = await updateEntryInTx(tx, entryId, input, prepared);
  } catch (e) {
    if (e instanceof EntryValidationError) {
      throw new ContributionInvalidError(`Library entry failed validation: ${e.issues.join('; ')}`);
    }
    throw e;
  }

  const after = await readEntrySnapshot(tx, entryId);
  if (!after) throw new ContributionInvalidError('Target entry not found');
  await recordRevision(tx, {
    targetType: 'LIBRARY_ENTRY',
    targetId: entryId,
    courseId: null,
    label: updated.title,
    snapshot: entrySnapshotJson(after.snapshot),
    source: 'CONTRIBUTION',
    actorId: reviewerId,
    authorId: contribution.contributorId,
    contributionId: contribution.id,
    previous: before ? entrySnapshotJson(before.snapshot) : null,
  });
  return { forced: stale, courseId: null };
};
