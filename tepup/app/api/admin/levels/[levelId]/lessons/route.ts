import { NextResponse } from 'next/server';
import { revalidateContent } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { lessonSlugInCourse } from '@/lib/api-helpers';

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
    const body = await request.json();
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

    // Get max sortOrder
    const maxSortOrder = await prisma.lesson.aggregate({
      where: { levelId },
      _max: { sortOrder: true },
    });

    const slug = await lessonSlugInCourse(level.courseId, name.trim());

    const lesson = await prisma.lesson.create({
      data: {
        name: name.trim(),
        slug,
        levelId,
        courseId: level.courseId,
        sortOrder: (maxSortOrder._max.sortOrder || 0) + 1,
      },
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
