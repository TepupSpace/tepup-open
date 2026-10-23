import { NextResponse } from 'next/server';
import { revalidateContent } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { lockCourse } from '@/lib/services/revision-service';
import { buildOutline, recordOutlineRevision } from '@/lib/services/outline-service';
import { audit } from '@/lib/services/audit-service';

// PUT /api/admin/courses/[id]/levels/[levelId] - Update level
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; levelId: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { levelId } = await params;
    const body = await request.json().catch(() => null);
    // A JSON `null`, array or malformed body is a client error, not a 500.
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }
    const { name, sortOrder } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Tên level là bắt buộc' },
        { status: 400 }
      );
    }

    const existing = await prisma.level.findUnique({ where: { id: levelId }, select: { courseId: true } });
    if (!existing) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }

    const level = await prisma.$transaction(async (tx) => {
      // Outline history (proposal §12): level names and order are part of the outline.
      await lockCourse(tx, existing.courseId);
      const outlineBefore = await buildOutline(tx, existing.courseId);
      const updated = await tx.level.update({
        where: { id: levelId },
        data: {
          name: name.trim(),
          sortOrder: sortOrder ?? undefined,
        },
        include: {
          lessons: true,
        },
      });
      const before = outlineBefore?.levels.find((l) => l.id === levelId);
      if (before && (before.name !== updated.name || before.sortOrder !== updated.sortOrder)) {
        await recordOutlineRevision(tx, existing.courseId, {
          source: 'ADMIN_PUBLISH',
          actorId: session.user.id,
          authorId: session.user.id,
          previous: outlineBefore,
          autoPatrol: true,
        });
      }
      return updated;
    });

    revalidateContent();
    return NextResponse.json({ data: level });
  } catch (error) {
    console.error('Error updating level:', error);
    return NextResponse.json(
      { error: 'Failed to update level' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/courses/[id]/levels/[levelId] - Delete level
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; levelId: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { levelId } = await params;

    const hasLessons = (n: number) =>
      NextResponse.json(
        { error: `Không thể xóa level có ${n} bài học. Vui lòng xóa các bài học trước.` },
        { status: 400 }
      );

    // Check if level has lessons (fast path; re-checked under the course lock below)
    const lessonsCount = await prisma.lesson.count({
      where: { levelId },
    });

    if (lessonsCount > 0) return hasLessons(lessonsCount);

    const result = await prisma.$transaction(async (tx): Promise<'deleted' | 'not-found' | number> => {
      const found = await tx.level.findUnique({ where: { id: levelId }, select: { courseId: true } });
      if (!found) return 'not-found';
      await lockCourse(tx, found.courseId);
      // Re-check under the lock: an outline publish may have moved a lesson in meanwhile,
      // and the cascade would delete it (and its content) without any history.
      const level = await tx.level.findUnique({ where: { id: levelId }, select: { courseId: true, name: true } });
      if (!level || level.courseId !== found.courseId) return 'not-found';
      const n = await tx.lesson.count({ where: { levelId } });
      if (n > 0) return n;
      const outlineBefore = await buildOutline(tx, level.courseId);
      await tx.level.delete({
        where: { id: levelId },
      });
      await recordOutlineRevision(tx, level.courseId, {
        source: 'ADMIN_PUBLISH',
        actorId: session.user.id,
        authorId: session.user.id,
        previous: outlineBefore,
        autoPatrol: true,
      });
      await audit(tx, {
        actorId: session.user.id,
        action: 'LEVEL_DELETED',
        targetType: 'LEVEL',
        targetId: levelId,
        details: { name: level.name, courseId: level.courseId },
      });
      return 'deleted';
    });
    if (result === 'not-found') {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }
    if (typeof result === 'number') return hasLessons(result);

    revalidateContent();
    return NextResponse.json({ message: 'Level deleted' });
  } catch (error) {
    console.error('Error deleting level:', error);
    return NextResponse.json(
      { error: 'Failed to delete level' },
      { status: 500 }
    );
  }
}
