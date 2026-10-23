import type { Contribution, Prisma } from '@prisma/client';

/** Publishing refused: the live content changed after the proposal started (API: 409). */
export class StaleContributionError extends Error {
  constructor(readonly liveUpdatedAt: Date | null) {
    super('Contribution is stale');
  }
}

/** Not in PENDING_REVIEW (already decided, or never submitted). API: 409. */
export class ContributionNotPendingError extends Error {
  constructor() {
    super('Contribution is not pending review');
  }
}

/** The content or the target is not publishable. API: 400. */
export class ContributionInvalidError extends Error {}

export interface PublishContext {
  tx: Prisma.TransactionClient;
  contribution: Contribution;
  /** `contribution.data` after strict re-validation (validateContributionData). */
  data: unknown;
  reviewerId: string;
  /** The reviewer chose "Vẫn duyệt, ghi đè" over a newer live version. */
  force: boolean;
}

export interface PublishResult {
  /** True when a newer live version was overwritten because of `force`. */
  forced: boolean;
  /** Course the published content belongs to, if any (notifications, credits). */
  courseId?: string | null;
}

/**
 * One publisher per contribution type (lib/services/publishers/*.ts). It runs inside the
 * approval transaction and must:
 *  - lock the live row and refuse a stale base (StaleContributionError) unless ctx.force;
 *  - write the content (trimEmptyBlocks for blocks; leave updatedAt to Prisma);
 *  - record the written version with recordRevision (source CONTRIBUTION,
 *    actorId = reviewer, authorId = contributor, contributionId);
 *  - call rebuildUsage for lesson/chapter blocks.
 * It must NOT create the Review row, notify, or revalidate: publishContribution does that.
 */
export type Publisher = (ctx: PublishContext) => Promise<PublishResult>;

/** Shared stale rule: base null = target had no content when the proposal started. */
export function isStale(liveUpdatedAt: Date | null | undefined, baseUpdatedAt: Date | null): boolean {
  if (liveUpdatedAt) return !baseUpdatedAt || liveUpdatedAt.getTime() !== baseUpdatedAt.getTime();
  return baseUpdatedAt !== null;
}
