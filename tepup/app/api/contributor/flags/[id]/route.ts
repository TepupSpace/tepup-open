import { NextResponse } from 'next/server';
import type { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getContributorSession } from '@/lib/admin-auth';
import { canOnCourse } from '@/lib/permissions/course-roles';
import { getLessonForViewerById } from '@/lib/services/content-service';
import { audit } from '@/lib/services/audit-service';
import { courseMemberIds, notify } from '@/lib/services/notification-service';
import { revalidateContent } from '@/lib/cache';

/**
 * DELETE: resolve (clear) a maintenance flag (proposal §6.21). FLAG permission on the course.
 * 200 { ok } · 404 unknown flag or lesson hidden from the user · 403 no FLAG · 409 already resolved.
 * The row stays, with resolvedAt/resolvedById, for history.
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getContributorSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const viewer = { id: session.user.id, role: session.user.role as UserRole };
  const { id } = await params;

  const flag = await prisma.lessonFlag.findUnique({
    where: { id },
    select: { id: true, lessonId: true, courseId: true, kind: true, resolvedAt: true },
  });
  if (!flag) return NextResponse.json({ error: 'Không tìm thấy cờ' }, { status: 404 });
  const lesson = await getLessonForViewerById(flag.lessonId, viewer);
  if (!lesson) return NextResponse.json({ error: 'Không tìm thấy cờ' }, { status: 404 });
  // The lesson's current course: the flag's courseId could be outdated if the lesson moved.
  if (!(await canOnCourse(viewer, lesson.courseId, 'FLAG'))) {
    return NextResponse.json({ error: 'Bạn không có quyền gỡ cờ của bài này' }, { status: 403 });
  }

  const resolved = await prisma.$transaction(async (tx) => {
    const r = await tx.lessonFlag.updateMany({
      where: { id, resolvedAt: null },
      data: { resolvedAt: new Date(), resolvedById: viewer.id },
    });
    if (r.count !== 1) return false;
    await audit(tx, {
      actorId: viewer.id,
      action: 'FLAG_RESOLVED',
      targetType: 'LESSON',
      targetId: flag.lessonId,
      details: { flagId: id, kind: flag.kind, courseId: lesson.courseId },
    });
    await notify(tx, await courseMemberIds(tx, lesson.courseId), {
      kind: 'FLAG_CHANGED',
      targetType: 'LESSON',
      targetId: flag.lessonId,
      actorId: viewer.id,
    });
    return true;
  });
  if (!resolved) return NextResponse.json({ error: 'Cờ này đã được gỡ' }, { status: 409 });

  revalidateContent();
  return NextResponse.json({ ok: true });
}
