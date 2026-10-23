import { NextResponse } from 'next/server';
import { revalidateContent } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { lessonSlugInCourse } from '@/lib/api-helpers';
import { lockCourse } from '@/lib/services/revision-service';
import { buildOutline, recordOutlineRevision } from '@/lib/services/outline-service';

// POST /api/admin/levels/[levelId]/lessons - Create lesson
export async function POST(
  request: Request,
  { params }: { params: Promise<{ levelId: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { levelId } = await params;
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }
    const { name } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Tên bài học là bắt buộc' },
        { status: 400 }
      );
    }

    // Check if level exists
    const level = await prisma.level.findUnique({
      where: { id: levelId },
    });

    if (!level) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }

    const slug = await lessonSlugInCourse(level.courseId, name.trim());

    const lesson = await prisma.$transaction(async (tx) => {
      // Outline history (proposal §12): record the outline with the new lesson.
      await lockCourse(tx, level.courseId);
      const outlineBefore = await buildOutline(tx, level.courseId);

      // Get max sortOrder
      const maxSortOrder = await tx.lesson.aggregate({
        where: { levelId },
        _max: { sortOrder: true },
      });

      const created = await tx.lesson.create({
        data: {
          name: name.trim(),
          slug,
          levelId,
          courseId: level.courseId,
          sortOrder: (maxSortOrder._max.sortOrder || 0) + 1,
          // New lessons start hidden. The first "Xuất bản" in the editor asks before it
          // makes the lesson visible to learners.
          isActive: false,
        },
      });
      await recordOutlineRevision(tx, level.courseId, {
        source: 'ADMIN_PUBLISH',
        actorId: session.user.id,
        authorId: session.user.id,
        previous: outlineBefore,
        autoPatrol: true,
      });
      return created;
    });

    revalidateContent();
    return NextResponse.json({ data: lesson }, { status: 201 });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    );
  }
}
