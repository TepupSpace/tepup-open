import { NextResponse } from 'next/server';
import { revalidateContent, revalidateLibrary } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { rebuildUsage } from '@/lib/library/usage-service';
import { blocksSnapshot, lockCourse, lockLessonContent, recordRevision } from '@/lib/services/revision-service';
import { buildOutline, recordOutlineRevision } from '@/lib/services/outline-service';
import { audit } from '@/lib/services/audit-service';

// GET /api/admin/lessons/[id] - Get single lesson
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        content: true,
        exercises: {
          orderBy: { sortOrder: 'asc' },
        },
        level: {
          include: {
            course: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    return NextResponse.json({ data: lesson });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lesson' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/lessons/[id] - Update lesson
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);
    // A JSON `null`, array or malformed body is a client error, not a 500.
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }
    const { name, sortOrder } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Tên bài học là bắt buộc' },
        { status: 400 }
      );
    }

    const existing = await prisma.lesson.findUnique({ where: { id }, select: { courseId: true } });
    if (!existing) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const lesson = await prisma.$transaction(async (tx) => {
      // Outline history (proposal §12): lesson names and order are part of the outline.
      await lockCourse(tx, existing.courseId);
      const outlineBefore = await buildOutline(tx, existing.courseId);
      const updated = await tx.lesson.update({
        where: { id },
        data: {
          name: name.trim(),
          sortOrder: sortOrder ?? undefined,
        },
      });
      const before = outlineBefore?.lessons.find((l) => l.id === id);
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
    return NextResponse.json({ data: lesson });
  } catch (error) {
    console.error('Error updating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to update lesson' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/lessons/[id] - Delete lesson
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const found = await prisma.$transaction(async (tx) => {
      const found = await tx.lesson.findUnique({ where: { id }, select: { courseId: true } });
      if (!found) return false;
      // The outline changes: lock order Course → Lesson → content, like every outline writer.
      await lockCourse(tx, found.courseId);
      // History outlives the lesson: keep its last content as a DELETED revision
      // (revisions have no FK to Lesson, so the delete leaves them in place).
      const live = await lockLessonContent(tx, id);
      // Re-read under the locks: it may have been deleted (or moved) while we waited.
      const lesson = await tx.lesson.findUnique({ where: { id }, select: { name: true, courseId: true } });
      if (!lesson || lesson.courseId !== found.courseId) return false;
      if (live) {
        await recordRevision(tx, {
          targetType: 'LESSON',
          targetId: id,
          courseId: lesson.courseId,
          label: lesson.name,
          snapshot: blocksSnapshot(live.title, live.blocks),
          source: 'DELETED',
          actorId: session.user.id,
          autoPatrol: true,
        });
      }
      const outlineBefore = await buildOutline(tx, lesson.courseId);
      // Drop this lesson from library entries' "Xuất hiện trong".
      await rebuildUsage(tx, 'LESSON', id, []);
      await tx.lesson.delete({ where: { id } });
      await recordOutlineRevision(tx, lesson.courseId, {
        source: 'ADMIN_PUBLISH',
        actorId: session.user.id,
        previous: outlineBefore,
        autoPatrol: true,
      });
      await audit(tx, {
        actorId: session.user.id,
        action: 'LESSON_DELETED',
        targetType: 'LESSON',
        targetId: id,
        details: { name: lesson.name, courseId: lesson.courseId },
      });
      return true;
    });
    if (!found) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // A deleted lesson must disappear for learners now, not after the cache TTL.
    revalidateContent();
    revalidateLibrary();
    return NextResponse.json({ message: 'Lesson deleted' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json(
      { error: 'Failed to delete lesson' },
      { status: 500 }
    );
  }
}
