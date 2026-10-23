import { NextResponse } from 'next/server';
import type { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getContributorSession } from '@/lib/admin-auth';
import { isBlockedOnCourse } from '@/lib/permissions/course-roles';
import { rateLimit, retryAfterMinutes } from '@/lib/security/rate-limit';
import { CLAIM_KEEPING_STATUSES, isClaimActive } from '@/lib/suggestions';
import { createEditProposal, type ProposalTargetType } from '@/lib/services/proposal-service';
import { CLAIMABLE_TARGETS, resolveClaimTarget, type ClaimableTarget } from '../../claimable/list-claimable';

const PROPOSAL_TYPE: Record<ClaimableTarget, ProposalTargetType> = {
  LESSON: 'EDIT_LESSON_CONTENT',
  CHAPTER: 'EDIT_CHAPTER_CONTENT',
  LIBRARY_ENTRY: 'EDIT_LIBRARY_ENTRY',
};

const editHref = (id: string) => `/contributor/contributions/${id}/edit`;

/**
 * POST: "Nhận làm" an ACCEPTED reader suggestion (proposal §6.9). Claims it (free, or the
 * previous claim expired: 14 days without a submitted proposal) and creates the edit proposal
 * with `suggestionId`, so approving the proposal marks the suggestion APPLIED.
 *
 * 200 { id, href }            the proposal to open (new, or the user's existing open one)
 * 404                         no such suggestion, not claimable, or its target is hidden from the user
 * 403                         blocked on the course
 * 409                         already claimed by someone else / not ACCEPTED any more
 * other                       createEditProposal's error (caps, rate limit…); the claim is released
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getContributorSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = { id: session.user.id, role: session.user.role as UserRole };
  const { id } = await params;

  const limit = rateLimit('suggestion-claim', user.id, 30, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Bạn nhận góp ý quá nhanh. Thử lại sau ${retryAfterMinutes(limit.retryAfterSeconds)} phút.` },
      { status: 429 }
    );
  }

  const s = await prisma.suggestion.findUnique({ where: { id } });
  if (!s || !(CLAIMABLE_TARGETS as readonly string[]).includes(s.targetType)) {
    return NextResponse.json({ error: 'Không tìm thấy góp ý' }, { status: 404 });
  }
  const target = await resolveClaimTarget(user, s.targetType, s.targetId);
  if (!target) return NextResponse.json({ error: 'Không tìm thấy góp ý' }, { status: 404 });
  if (s.status !== 'ACCEPTED') {
    return NextResponse.json({ error: 'Góp ý này không còn chờ người làm' }, { status: 409 });
  }
  if (target.courseId && (await isBlockedOnCourse(target.courseId, user.id))) {
    return NextResponse.json({ error: 'Bạn không thể đóng góp cho khóa học này' }, { status: 403 });
  }

  const submitted =
    !!s.claimedById &&
    (await prisma.contribution.count({
      where: { suggestionId: s.id, contributorId: s.claimedById, status: { in: [...CLAIM_KEEPING_STATUSES] } },
    })) > 0;
  const active = isClaimActive(s, { hasSubmittedProposal: submitted });
  if (active && s.claimedById !== user.id) {
    return NextResponse.json({ error: 'Đã có người nhận góp ý này' }, { status: 409 });
  }
  const alreadyMine = active && s.claimedById === user.id;

  if (!alreadyMine) {
    // Conditional on the claim we just read, so two contributors can't both take it.
    const claimed = await prisma.suggestion.updateMany({
      where: { id, status: 'ACCEPTED', claimedById: s.claimedById, claimedAt: s.claimedAt },
      data: { claimedById: user.id, claimedAt: new Date() },
    });
    if (claimed.count !== 1) {
      return NextResponse.json({ error: 'Góp ý vừa được người khác nhận' }, { status: 409 });
    }
  }

  const created = await createEditProposal(user, {
    type: PROPOSAL_TYPE[s.targetType as ClaimableTarget],
    targetId: s.targetId,
    suggestionId: s.id,
  });
  if (created.ok) {
    return NextResponse.json({ id: created.contribution.id, href: editHref(created.contribution.id) });
  }

  if (created.status === 409 && created.existingId) {
    // The user already has an open proposal for this target: link the suggestion to it,
    // unless it already carries another one.
    const linked = await prisma.contribution.updateMany({
      where: { id: created.existingId, contributorId: user.id, suggestionId: null },
      data: { suggestionId: s.id },
    });
    return NextResponse.json({ id: created.existingId, href: editHref(created.existingId), linked: linked.count === 1 });
  }

  if (!alreadyMine) {
    // Couldn't create the proposal: give the suggestion back as it was.
    await prisma.suggestion.updateMany({
      where: { id, claimedById: user.id },
      data: { claimedById: s.claimedById, claimedAt: s.claimedAt },
    });
  }
  return NextResponse.json(
    { error: created.error, ...(created.existingId ? { existingId: created.existingId } : {}), details: created.details },
    { status: created.status }
  );
}

/**
 * DELETE: "Bỏ nhận" — releases the user's own claim. The user's DRAFT proposals stop being
 * linked to the suggestion (a submitted one keeps the link, so its approval still applies it).
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getContributorSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const released = await prisma.$transaction(async (tx) => {
    const r = await tx.suggestion.updateMany({
      where: { id, claimedById: session.user.id },
      data: { claimedById: null, claimedAt: null },
    });
    if (r.count === 1) {
      await tx.contribution.updateMany({
        where: { suggestionId: id, contributorId: session.user.id, status: 'DRAFT' },
        data: { suggestionId: null },
      });
    }
    return r.count === 1;
  });
  if (!released) return NextResponse.json({ error: 'Bạn chưa nhận góp ý này' }, { status: 409 });
  return NextResponse.json({ ok: true });
}
