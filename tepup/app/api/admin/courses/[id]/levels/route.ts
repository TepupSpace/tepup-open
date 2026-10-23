import { NextResponse } from 'next/server';
import { revalidateContent } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { lockCourse } from '@/lib/services/revision-service';
import { buildOutline, recordOutlineRevision } from '@/lib/services/outline-service';

// GET /api/admin/courses/[id]/levels - Get course levels
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

    const levels = await prisma.level.findMany({
      where: { courseId: id },
      orderBy: { sortOrder: 'asc' },
      include: {
        lessons: {
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: {
              select: { exercises: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ data: levels });
  } catch (error) {
    console.error('Error fetching levels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch levels' },
      { status: 500 }
    );
  }
}

// POST /api/admin/courses/[id]/levels - Add level to course
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: courseId } = await params;
    const body = await request.json().catch(() => null);
    // A JSON `null`, array or malformed body is a client error, not a 500.
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }
    const { name } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Tên level là bắt buộc' },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const level = await prisma.$transaction(async (tx) => {
      // Outline history (proposal §12): record the outline with the new level.
      await lockCourse(tx, courseId);
      const outlineBefore = await buildOutline(tx, courseId);

      // Get max sortOrder
      const maxSortOrder = await tx.level.aggregate({
        where: { courseId },
        _max: { sortOrder: true },
      });

      const created = await tx.level.create({
        data: {
          name: name.trim(),
          courseId,
          sortOrder: (maxSortOrder._max.sortOrder || 0) + 1,
        },
        include: {
          lessons: true,
        },
      });
      await recordOutlineRevision(tx, courseId, {
        source: 'ADMIN_PUBLISH',
        actorId: session.user.id,
        authorId: session.user.id,
        previous: outlineBefore,
        autoPatrol: true,
      });
      return created;
    });

    revalidateContent();
    return NextResponse.json({ data: level }, { status: 201 });
  } catch (error) {
    console.error('Error creating level:', error);
    return NextResponse.json(
      { error: 'Failed to create level' },
      { status: 500 }
    );
  }
}
