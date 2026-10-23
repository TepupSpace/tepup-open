import { NextRequest, NextResponse } from 'next/server';
import type { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { isContributorOrAbove } from '@/lib/role-utils';
import { canDecideContribution, canViewContributionForReview } from '@/lib/permissions/course-roles';
import { staffName } from '@/lib/credit';
import { getLiveTarget, isEditProposalType, isProposalStale } from '@/lib/services/proposal-service';

/**
 * GET /api/contributor/reviews/[id]/live — the live version an edit proposal would replace,
 * for the review screen's "Bản đang chạy" tab and the stale warning (proposal §6.5).
 *
 * Same permission check as GET /api/contributor/reviews/[id] (404 otherwise). The live target
 * is read with the reviewer's own visibility (a hidden lesson only for course roles with
 * SEE_HIDDEN or global reviewers; hidden chapters/entries only for global reviewers).
 *
 * 200 {
 *   target: { type, id, name, href, hubHref, entryType? } | null,
 *   live: <same shape as baseSnapshot> | null, liveUpdatedAt, baseUpdatedAt, stale,
 *   adminDraft: boolean,            // an admin ContentDraft exists for the lesson/chapter/entry
 *   authorName,                     // staffName(): deleted accounts show "(đã xóa)"
 *   reviewerNames: { [reviewId]: string },
 *   decideBlockedReason: 'OWN' | 'ESCALATED' | 'NO_PERMISSION' | null,
 * }
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !isContributorOrAbove(session.user.role as UserRole)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const viewer = { id: session.user.id, role: session.user.role as UserRole };

  const contribution = await prisma.contribution.findUnique({
    where: { id },
    select: {
      id: true,
      type: true,
      targetId: true,
      contributorId: true,
      escalatedAt: true,
      baseUpdatedAt: true,
      baseSnapshot: true,
      contributor: { select: { username: true, name: true, publicHandle: true, deletedAt: true } },
      reviews: {
        select: { id: true, reviewer: { select: { username: true, name: true, publicHandle: true, deletedAt: true } } },
      },
    },
  });
  if (!contribution || !(await canViewContributionForReview(viewer, contribution))) {
    return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  }

  const canDecide = await canDecideContribution(viewer, contribution);
  const decideBlockedReason = canDecide
    ? null
    : contribution.contributorId === viewer.id
      ? 'OWN'
      : contribution.escalatedAt
        ? 'ESCALATED'
        : 'NO_PERMISSION';

  const names = {
    authorName: staffName(contribution.contributor),
    reviewerNames: Object.fromEntries(contribution.reviews.map((r) => [r.id, staffName(r.reviewer)])),
    decideBlockedReason,
  };

  if (!isEditProposalType(contribution.type)) {
    return NextResponse.json({
      target: null,
      live: null,
      liveUpdatedAt: null,
      baseUpdatedAt: null,
      stale: false,
      adminDraft: false,
      ...names,
    });
  }

  const live = await getLiveTarget(viewer, contribution.type, contribution.targetId);
  const draftTarget =
    contribution.type === 'EDIT_LESSON_CONTENT'
      ? 'LESSON'
      : contribution.type === 'EDIT_CHAPTER_CONTENT'
        ? 'CHAPTER'
        : contribution.type === 'EDIT_LIBRARY_ENTRY'
          ? 'LIBRARY_ENTRY'
          : null;
  const adminDraft =
    !!live && !!draftTarget
      ? (await prisma.contentDraft.count({ where: { targetType: draftTarget, targetId: live.id } })) > 0
      : false;

  return NextResponse.json({
    target: live
      ? { type: live.type, id: live.id, name: live.name, href: live.href, hubHref: live.hubHref, entryType: live.entryType }
      : null,
    live: live?.snapshot ?? null,
    liveUpdatedAt: live?.updatedAt?.toISOString() ?? null,
    baseUpdatedAt: contribution.baseUpdatedAt?.toISOString() ?? null,
    stale: live ? isProposalStale(contribution, live) : false,
    adminDraft,
    ...names,
  });
}
