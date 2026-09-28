import { NextResponse } from 'next/server';
import { revalidateContent } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

/** URL ảnh từ form: chuỗi rỗng → null; không gửi field → giữ nguyên (undefined). */
function imageField(v: unknown): string | null | undefined {
  if (v === undefined) return undefined;
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

// GET /api/admin/courses/[id] - Get single course with levels and lessons
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

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true },
        },
        levels: {
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
        },
        recommendations: {
          orderBy: { sortOrder: 'asc' },
          include: {
            story: {
              select: { id: true, title: true, slug: true },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ data: course });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/courses/[id] - Update course
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
    const body = await request.json();
    const { name, slug, description, icon, categoryId, isNew, isActive, sortOrder, imageUrl } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Tên khóa học là bắt buộc' },
        { status: 400 }
      );
    }

    if (!slug || slug.trim() === '') {
      return NextResponse.json(
        { error: 'Slug là bắt buộc' },
        { status: 400 }
      );
    }

    // Check if slug exists (excluding current course)
    const existingCourse = await prisma.course.findFirst({
      where: {
        slug: slug.trim(),
        NOT: { id },
      },
    });

    if (existingCourse) {
      return NextResponse.json(
        { error: 'Slug đã tồn tại. Vui lòng chọn slug khác.' },
        { status: 400 }
      );
    }

    const course = await prisma.course.update({
      where: { id },
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description?.trim() || null,
        icon: icon || 'book-open',
        categoryId: categoryId || undefined,
        isNew: isNew ?? false,
        imageUrl: imageField(imageUrl),
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? undefined,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    revalidateContent();
    return NextResponse.json({ data: course });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/courses/[id] - Delete course
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

    // Check if course has levels
    const levelsCount = await prisma.level.count({
      where: { courseId: id },
    });

    if (levelsCount > 0) {
      return NextResponse.json(
        { error: `Không thể xóa khóa học có ${levelsCount} level. Vui lòng xóa các level trước.` },
        { status: 400 }
      );
    }

    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Course deleted' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
