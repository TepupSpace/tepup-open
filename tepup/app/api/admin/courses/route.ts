import { NextResponse } from 'next/server';
import { revalidateContent } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { requireAdminSession, validateRequired, validateSlugUnique, getNextSortOrder, uniqueSlugForModel } from '@/lib/api-helpers';

// GET /api/admin/courses - List all courses
export async function GET(request: Request) {
  try {
    const { session, error } = await requireAdminSession();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    // Đếm bài học ngay trong query danh sách. Trước đây đoạn này bắn thêm một
    // lệnh `lesson.count` cho MỖI khoá học — N+1 tường minh, lại chạy song song
    // trên một pool chỉ có 5 kết nối.
    const courses = await prisma.course.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }],
      include: {
        category: {
          select: { id: true, name: true },
        },
        _count: {
          select: { levels: true },
        },
        // Cố ý đếm QUA level chứ không dùng `Course.lessons` trực tiếp: bản cũ
        // đếm `lesson.count({ where: { level: { courseId } } })`, mà `Lesson` giữ
        // cả `courseId` lẫn `levelId` nên hai đường có thể ra số khác nhau.
        levels: {
          select: { _count: { select: { lessons: true } } },
        },
      },
    });

    const coursesWithLessonCount = courses.map(({ levels, ...course }) => ({
      ...course,
      lessonCount: levels.reduce((sum, lvl) => sum + lvl._count.lessons, 0),
    }));

    return NextResponse.json({ data: coursesWithLessonCount });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST /api/admin/courses - Create new course
export async function POST(request: Request) {
  try {
    const { session, error } = await requireAdminSession();
    if (error) return error;

    const body = await request.json();
    const { name, slug, description, icon, categoryId, isNew, imageUrl } = body;

    const validationError = validateRequired(
      { name, categoryId },
      { name: 'Tên khóa học là bắt buộc', categoryId: 'Danh mục là bắt buộc' }
    );
    if (validationError) return validationError;

    // Slug is optional: derived from the name unless the admin typed one.
    if (slug && slug.trim()) {
      const slugError = await validateSlugUnique('course', slug);
      if (slugError) return slugError;
    }
    const finalSlug = await uniqueSlugForModel('course', name, slug);

    const sortOrder = await getNextSortOrder('course', { categoryId });

    const course = await prisma.course.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        description: description?.trim() || null,
        icon: icon || 'book-open',
        categoryId,
        isNew: isNew ?? false,
        imageUrl: imageUrl?.trim() || null,
        sortOrder,
        createdById: session.user.id,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    revalidateContent();
    return NextResponse.json({ data: course }, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
