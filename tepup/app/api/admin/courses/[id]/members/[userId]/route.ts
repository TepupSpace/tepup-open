import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { audit } from '@/lib/services/audit-service';
import { notify } from '@/lib/services/notification-service';
import { isCourseRole, notifyIfOrphaned, removeCourseMember } from '@/lib/services/course-roles-service';
import { revalidateContent } from '@/lib/cache';

/**
 * Admin: change or remove one course role.
 * PATCH { role } → { ok, orphaned } · DELETE → { ok, orphaned }
 * 400 bad role · 404 no such grant. Takes effect on the next request (nothing in the JWT).
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: courseId, userId } = await params;
  const body = await req.json().catch(() => null);
  // A JSON `null`, array or malformed body is a client error, not a 500.
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }
  if (!isCourseRole(body.role)) {
    return NextResponse.json({ error: 'Vai trò không hợp lệ' }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.courseMember.findUnique({
      where: { courseId_userId: { courseId, userId } },
      select: { role: true },
    });
    if (!existing) return null;
    if (existing.role === body.role) return { orphaned: false };
    await tx.courseMember.update({
      where: { courseId_userId: { courseId, userId } },
      // The disclosure override only means something for trusted reviewers.
      data: { role: body.role, ...(body.role === 'COURSE_LEAD' ? { disclosure: null } : {}) },
    });
    await audit(tx, {
      actorId: session.user.id,
      action: 'COURSE_ROLE_CHANGED',
      targetType: 'COURSE',
      targetId: courseId,
      details: { userId, from: existing.role, to: body.role },
    });
    await notify(tx, [userId], { kind: 'COURSE_ROLE_GRANTED', targetType: 'COURSE', targetId: courseId, actorId: session.user.id });
    const orphaned = existing.role === 'COURSE_LEAD' ? await notifyIfOrphaned(tx, courseId, session.user.id) : false;
    return { orphaned };
  });
  if (!result) return NextResponse.json({ error: 'Không tìm thấy vai trò này' }, { status: 404 });

  revalidateContent();
  return NextResponse.json({ ok: true, orphaned: result.orphaned });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: courseId, userId } = await params;

  const result = await prisma.$transaction((tx) => removeCourseMember(tx, courseId, userId, session.user.id, 'ADMIN'));
  if (!result.removed) return NextResponse.json({ error: 'Không tìm thấy vai trò này' }, { status: 404 });

  revalidateContent();
  return NextResponse.json({ ok: true, orphaned: result.orphaned });
}
