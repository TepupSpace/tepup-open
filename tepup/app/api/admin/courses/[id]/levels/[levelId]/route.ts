import { NextResponse } from 'next/server';
import { revalidateContent } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

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
    const body = await request.json();
    const { name, sortOrder } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Tên level là bắt buộc' },
        { status: 400 }
      );
    }

    const level = await prisma.level.update({
      where: { id: levelId },
      data: {
        name: name.trim(),
        sortOrder: sortOrder ?? undefined,
      },
      include: {
        lessons: true,
      },
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

    // Check if level has lessons
    const lessonsCount = await prisma.lesson.count({
      where: { levelId },
    });

    if (lessonsCount > 0) {
      return NextResponse.json(
        { error: `Không thể xóa level có ${lessonsCount} bài học. Vui lòng xóa các bài học trước.` },
        { status: 400 }
      );
    }

    await prisma.level.delete({
      where: { id: levelId },
    });

    return NextResponse.json({ message: 'Level deleted' });
  } catch (error) {
    console.error('Error deleting level:', error);
    return NextResponse.json(
      { error: 'Failed to delete level' },
      { status: 500 }
    );
  }
}
