import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { revalidateContent, revalidateLibrary } from '@/lib/cache';
import { isSupportedContributionType, validateContributionData } from '@/lib/schemas/content-validation';
import { audit } from '@/lib/services/audit-service';
import { notify } from '@/lib/services/notification-service';
import {
  ContributionInvalidError,
  ContributionNotPendingError,
  PUBLISHERS,
} from '@/lib/services/publishers';

export {
  ContributionInvalidError,
  ContributionNotPendingError,
  StaleContributionError,
} from '@/lib/services/publishers';

type Tx = Prisma.TransactionClient;

/** The contribution was escalated to admins after the caller's permission check (→ 403). */
export class ContributionEscalatedError extends Error {
  constructor() {
    super('Contribution is escalated to admins');
    this.name = 'ContributionEscalatedError';
  }
}

/**
 * Claims a PENDING_REVIEW contribution for a decision, atomically. Escalated items are for
 * admins only: the escalation is re-checked here, inside the transaction, since it may have
 * happened after the route's canDecideContribution() check.
 */
async function claimPending(
  tx: Tx,
  contributionId: string,
  reviewerId: string,
  data: Prisma.ContributionUpdateManyMutationInput
): Promise<void> {
  const reviewer = await tx.user.findUnique({ where: { id: reviewerId }, select: { role: true } });
  const adminOnly = reviewer?.role !== 'ADMIN';
  const claimed = await tx.contribution.updateMany({
    where: { id: contributionId, status: 'PENDING_REVIEW', ...(adminOnly && { escalatedAt: null }) },
    data,
  });
  if (claimed.count === 1) return;
  if (adminOnly) {
    const row = await tx.contribution.findUnique({
      where: { id: contributionId },
      select: { status: true, escalatedAt: true },
    });
    if (row?.status === 'PENDING_REVIEW' && row.escalatedAt) throw new ContributionEscalatedError();
  }
  throw new ContributionNotPendingError();
}

/**
 * Approve and publish, in ONE transaction: the claim, the content write and its history
 * (ContentRevision, written by the type's publisher in lib/services/publishers/), the Review
 * row, the linked suggestion and the author's notification all commit together or not at
 * all. A failure never leaves an APPROVED contribution without a review or half-written content.
 *
 * Permission (who may approve) is checked by the caller: canDecideContribution(); the
 * escalation part is re-checked under the claim (ContributionEscalatedError).
 * `force`: the reviewer chose "Vẫn duyệt, ghi đè" over a newer live version; it is recorded
 * in the review feedback and the audit log.
 */
export async function publishContribution(
  contributionId: string,
  reviewerId: string,
  opts: { force?: boolean } = {}
) {
  const force = opts.force === true;

  await prisma.$transaction(
    async (tx) => {
      // Claim it atomically so two reviewers clicking "approve" can't publish it twice.
      await claimPending(tx, contributionId, reviewerId, { status: 'APPROVED', resolvedAt: new Date() });

      const contribution = await tx.contribution.findUniqueOrThrow({ where: { id: contributionId } });

      // An edit adapts someone else's work: the licence is what allows it (proposal §6.11).
      if (!contribution.licenceVersion) {
        throw new ContributionInvalidError('Contribution has no licence consent');
      }

      // Re-validate at publish time (defence in depth): rows saved before validation existed,
      // or written some other way, must not reach learners unchecked.
      const publisher = PUBLISHERS[contribution.type];
      if (!publisher || !isSupportedContributionType(contribution.type)) {
        throw new ContributionInvalidError(`Unsupported contribution type: ${contribution.type}`);
      }
      const checked = validateContributionData(contribution.type, contribution.data, { allowCustom: false });
      if (!checked.ok) {
        throw new ContributionInvalidError(
          `Contribution content failed validation: ${checked.issues.map((i) => i.path).join(', ')}`
        );
      }

      const result = await publisher({ tx, contribution, data: checked.value, reviewerId, force });

      await tx.review.create({
        data: {
          contributionId,
          reviewerId,
          action: 'APPROVED',
          ...(result.forced && { feedback: 'Duyệt ghi đè: nội dung đã thay đổi sau khi đề xuất bắt đầu (force).' }),
        },
      });
      if (result.forced) {
        await audit(tx, {
          actorId: reviewerId,
          action: 'CONTRIBUTION_FORCE_APPROVED',
          targetType: 'CONTRIBUTION',
          targetId: contributionId,
        });
      }

      // A proposal made from a reader suggestion applies it (proposal §6.9).
      if (contribution.suggestionId) {
        await tx.suggestion.updateMany({
          where: { id: contribution.suggestionId, status: 'ACCEPTED' },
          data: { status: 'APPLIED', resolvedAt: new Date() },
        });
      }

      await notify(tx, [contribution.contributorId], {
        kind: 'CONTRIBUTION_DECIDED',
        targetType: 'CONTRIBUTION',
        targetId: contributionId,
        actorId: reviewerId,
      });
    },
    // A NEW_COURSE can hold up to 50 levels × 200 lessons; the 5 s default is too short.
    { maxWait: 10_000, timeout: 60_000 }
  );

  // Learners see approved content now, not after the cache TTL (CLAUDE.md).
  revalidateContent();
  revalidateLibrary();

  // Promotion to TRUSTED_AUTHOR is a manual admin decision (Admin → Users);
  // automatic promotion after N approvals was removed as too easy to game.
}

export async function rejectContribution(
  contributionId: string,
  reviewerId: string,
  feedback: string,
  action: 'REJECTED' | 'CHANGES_REQUESTED'
) {
  // Status, Review row and the author's notification together.
  await prisma.$transaction(async (tx) => {
    await claimPending(tx, contributionId, reviewerId, { status: action, resolvedAt: new Date() });

    const c = await tx.contribution.findUniqueOrThrow({ where: { id: contributionId }, select: { contributorId: true } });
    await tx.review.create({
      data: {
        contributionId,
        reviewerId,
        action,
        feedback,
      },
    });
    await notify(tx, [c.contributorId], {
      kind: 'CONTRIBUTION_DECIDED',
      targetType: 'CONTRIBUTION',
      targetId: contributionId,
      actorId: reviewerId,
    });
  });
}

export interface ContributionCourse {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

/**
 * The course each approved NEW_COURSE contribution created, keyed by contribution id.
 * New approvals store it in `targetId`; for approvals from before that, fall back to the
 * contributor's own course with the same name (`Course.createdById`).
 */
export async function getCoursesForContributions(
  contributions: { id: string; type: string; status: string; targetId: string | null; contributorId: string; data: unknown }[]
): Promise<Map<string, ContributionCourse>> {
  const approved = contributions.filter((c) => c.type === 'NEW_COURSE' && c.status === 'APPROVED');
  const out = new Map<string, ContributionCourse>();
  if (!approved.length) return out;

  const select = { id: true, name: true, slug: true, isActive: true, createdById: true, createdAt: true } as const;
  const ids = approved.map((c) => c.targetId).filter((id): id is string => !!id);
  const byId = new Map(
    (ids.length ? await prisma.course.findMany({ where: { id: { in: ids } }, select }) : []).map((c) => [c.id, c])
  );

  const legacy = approved.filter((c) => !c.targetId);
  const nameOf = (data: unknown) => {
    const course = data && typeof data === 'object' ? (data as { course?: { name?: unknown } }).course : undefined;
    return typeof course?.name === 'string' ? course.name : '';
  };
  const legacyCourses = legacy.length
    ? await prisma.course.findMany({
        where: {
          createdById: { in: [...new Set(legacy.map((c) => c.contributorId))] },
          name: { in: legacy.map((c) => nameOf(c.data)).filter(Boolean) },
        },
        orderBy: { createdAt: 'desc' },
        select,
      })
    : [];

  for (const c of approved) {
    const course = c.targetId
      ? byId.get(c.targetId)
      : legacyCourses.find((k) => k.createdById === c.contributorId && k.name === nameOf(c.data));
    if (course) out.set(c.id, { id: course.id, name: course.name, slug: course.slug, isActive: course.isActive });
  }
  return out;
}
