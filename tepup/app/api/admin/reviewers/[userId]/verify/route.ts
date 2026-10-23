import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { audit } from '@/lib/services/audit-service';
import { revalidateContent } from '@/lib/cache';

/**
 * Admin verifies a trusted reviewer's credential (proposal §6.14a). Until verified, learners
 * see at most "đã được người duyệt tin cậy kiểm tra" (ANONYMOUS), whatever the reviewer chose.
 * PUT { note, profileUpdatedAt } → { ok, verifiedAt }
 *   note: required, how it was checked (never copies of documents);
 *   profileUpdatedAt: the profile's updatedAt the admin saw. The verification applies only to
 *   that exact version: 409 when the reviewer changed their profile since (reload, look again).
 * DELETE → { ok } (unverify). 400 no note / no credential · 404 no profile · 409 changed.
 * The audit row records only that a verification happened and of which profile version: the
 * name, credential and note stay on ReviewerProfile, which account deletion removes.
 * Editing the credential or public name later clears verifiedAt (reviewer-profile route).
 */
const NOTE_MAX = 1000;

export async function PUT(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { userId } = await params;
  const raw: unknown = await req.json().catch(() => null);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }
  const body = raw as { note?: unknown; profileUpdatedAt?: unknown };
  const note = typeof body.note === 'string' ? body.note.trim() : '';
  const seenAt = typeof body.profileUpdatedAt === 'string' ? new Date(body.profileUpdatedAt) : null;
  if (!seenAt || Number.isNaN(seenAt.getTime())) {
    return NextResponse.json({ error: 'Thiếu phiên bản hồ sơ đã xem. Tải lại trang rồi thử lại.' }, { status: 400 });
  }
  if (!note) {
    return NextResponse.json({ error: 'Ghi rõ đã xác minh bằng cách nào' }, { status: 400 });
  }
  if (note.length > NOTE_MAX) {
    return NextResponse.json({ error: `Ghi chú tối đa ${NOTE_MAX} ký tự` }, { status: 400 });
  }

  const profile = await prisma.reviewerProfile.findUnique({
    where: { userId },
    select: { credential: true, publicName: true, user: { select: { deletedAt: true } } },
  });
  if (!profile || profile.user.deletedAt) {
    return NextResponse.json({ error: 'Người này chưa có hồ sơ người duyệt' }, { status: 404 });
  }
  if (!profile.credential?.trim()) {
    return NextResponse.json({ error: 'Hồ sơ chưa ghi chuyên môn, chưa có gì để xác minh' }, { status: 400 });
  }

  const verifiedAt = new Date();
  // Conditional on the version the admin saw: an edit in between (new credential or name)
  // must not get verified unseen.
  const applied = await prisma.$transaction(async (tx) => {
    const res = await tx.reviewerProfile.updateMany({
      where: { userId, updatedAt: seenAt },
      data: { verifiedAt, verifiedById: session.user.id, verificationNote: note },
    });
    if (res.count !== 1) return false;
    await audit(tx, {
      actorId: session.user.id,
      action: 'REVIEWER_VERIFIED',
      targetType: 'USER',
      targetId: userId,
      details: { verified: true, profileUpdatedAt: seenAt.toISOString() },
    });
    return true;
  });
  if (!applied) {
    return NextResponse.json({ error: 'Hồ sơ vừa thay đổi, tải lại trang để xem bản mới.' }, { status: 409 });
  }

  revalidateContent();
  return NextResponse.json({ ok: true, verifiedAt });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { userId } = await params;

  const profile = await prisma.reviewerProfile.findUnique({ where: { userId }, select: { verifiedAt: true } });
  if (!profile) return NextResponse.json({ error: 'Người này chưa có hồ sơ người duyệt' }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.reviewerProfile.update({
      where: { userId },
      data: { verifiedAt: null, verifiedById: null, verificationNote: null },
    });
    await audit(tx, {
      actorId: session.user.id,
      action: 'REVIEWER_UNVERIFIED',
      targetType: 'USER',
      targetId: userId,
      details: { wasVerifiedAt: profile.verifiedAt?.toISOString() ?? null },
    });
  });

  revalidateContent();
  return NextResponse.json({ ok: true });
}
