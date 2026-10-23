import { NextRequest, NextResponse } from 'next/server';
import type { ReviewerDisclosure } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getContributorSession } from '@/lib/admin-auth';
import { removeCourseMember } from '@/lib/services/course-roles-service';
import { revalidateContent } from '@/lib/cache';

const DISCLOSURES: ReviewerDisclosure[] = ['NONE', 'ANONYMOUS', 'CREDENTIAL', 'FULL'];

/**
 * Self-service on one of the user's own course roles.
 * DELETE → step down ("Rời vai trò"): audited; admins are notified if the course has no
 *          maintainer left. { ok, orphaned } · 404 no such role.
 * PATCH { disclosure: NONE|ANONYMOUS|CREDENTIAL|FULL|null } → per-course override for a
 *          TRUSTED_REVIEWER grant (null = use the profile default). { ok } · 400 · 404.
 */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const session = await getContributorSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { courseId } = await params;

  const result = await prisma.$transaction((tx) => removeCourseMember(tx, courseId, session.user.id, session.user.id, 'SELF'));
  if (!result.removed) return NextResponse.json({ error: 'Bạn không có vai trò ở khóa học này' }, { status: 404 });

  revalidateContent();
  return NextResponse.json({ ok: true, orphaned: result.orphaned });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const session = await getContributorSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { courseId } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  const disclosure = body.disclosure;
  if (disclosure !== null && !DISCLOSURES.includes(disclosure)) {
    return NextResponse.json({ error: 'Mức hiển thị không hợp lệ' }, { status: 400 });
  }

  const updated = await prisma.courseMember.updateMany({
    where: { courseId, userId: session.user.id, role: 'TRUSTED_REVIEWER' },
    data: { disclosure },
  });
  if (updated.count !== 1) {
    return NextResponse.json({ error: 'Bạn không phải người duyệt tin cậy của khóa học này' }, { status: 404 });
  }

  revalidateContent();
  return NextResponse.json({ ok: true });
}
