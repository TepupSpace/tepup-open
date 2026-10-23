import { NextRequest, NextResponse } from 'next/server';
import type { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getContributorSession } from '@/lib/admin-auth';
import { canOnCourse } from '@/lib/permissions/course-roles';
import { buildOutline, recordOutlineRevision } from '@/lib/services/outline-service';
import { lockCourse } from '@/lib/services/revision-service';
import { audit } from '@/lib/services/audit-service';
import { revalidateContent } from '@/lib/cache';

/**
 * Maintainer shows or hides a lesson (proposal §5, §6.8). Body: { isActive: boolean }.
 * Allowed: TOGGLE_LESSON on the lesson's course (maintainers, admins), and only while the
 * course itself is active (admins always). Activating a whole course stays admin-only.
 * The outline change is versioned (COURSE_OUTLINE revision, source COURSE_LEAD) and audited.
 *
 * 200 { ok, isActive, changed } · 400 bad body · 401 · 404 no such lesson / not visible to
 * the caller · 403 visible but not allowed · 409 course hidden (non-admin).
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getContributorSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const viewer = { id: session.user.id, role: session.user.role as UserRole };
  const { id } = await params;

  const body = await req.json().catch(() => null);
  if (!body || typeof body.isActive !== 'boolean') {
    return NextResponse.json({ error: 'Thiếu isActive (true/false)' }, { status: 400 });
  }
  const isActive: boolean = body.isActive;

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    select: { id: true, name: true, isActive: true, courseId: true, course: { select: { isActive: true } } },
  });
  if (!lesson) {
    return NextResponse.json({ error: 'Không tìm thấy bài học' }, { status: 404 });
  }

  if (!(await canOnCourse(viewer, lesson.courseId, 'TOGGLE_LESSON'))) {
    // Don't reveal hidden lessons/courses to people who can't see them.
    const canSee =
      (lesson.isActive && lesson.course.isActive) || (await canOnCourse(viewer, lesson.courseId, 'SEE_HIDDEN'));
    return canSee
      ? NextResponse.json({ error: 'Bạn không có quyền hiện/ẩn bài học này' }, { status: 403 })
      : NextResponse.json({ error: 'Không tìm thấy bài học' }, { status: 404 });
  }
  const isAdmin = viewer.role === 'ADMIN';

  let changed = false;
  try {
    await prisma.$transaction(async (tx) => {
      // Outline changes serialise on the course row.
      await lockCourse(tx, lesson.courseId);
      const course = await tx.course.findUnique({ where: { id: lesson.courseId }, select: { isActive: true } });
      if (!course) throw new HttpError(404, 'Không tìm thấy bài học');
      if (!course.isActive && !isAdmin) {
        throw new HttpError(409, 'Khóa học đang ẩn. Chỉ quản trị viên được hiện hoặc ẩn bài trong khóa này.');
      }
      const current = await tx.lesson.findUnique({ where: { id }, select: { isActive: true } });
      if (!current) throw new HttpError(404, 'Không tìm thấy bài học');
      if (current.isActive === isActive) return; // nothing to do

      const previous = await buildOutline(tx, lesson.courseId);
      await tx.lesson.update({ where: { id }, data: { isActive } });
      await recordOutlineRevision(tx, lesson.courseId, {
        source: 'COURSE_LEAD',
        actorId: viewer.id,
        previous,
        autoPatrol: isAdmin,
      });
      await audit(tx, {
        actorId: viewer.id,
        action: 'LESSON_VISIBILITY_CHANGED',
        targetType: 'LESSON',
        targetId: id,
        details: { courseId: lesson.courseId, from: current.isActive, to: isActive },
      });
      changed = true;
    });
  } catch (e) {
    if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  if (changed) revalidateContent();
  return NextResponse.json({ ok: true, isActive, changed });
}

class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}
