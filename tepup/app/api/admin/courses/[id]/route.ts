import { NextResponse } from 'next/server';
import { revalidateContent } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { lockCourse, recordRevision } from '@/lib/services/revision-service';
import { buildOutline, recordOutlineRevision } from '@/lib/services/outline-service';
import { audit } from '@/lib/services/audit-service';
import type { Prisma } from '@prisma/client';

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
    const body = await request.json().catch(() => null);
    // A JSON `null`, array or malformed body is a client error, not a 500.
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }
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

    const course = await prisma.$transaction(async (tx) => {
      // Outline history (proposal §12): name and description are part of the outline.
      await lockCourse(tx, id);
      const outlineBefore = await buildOutline(tx, id);
      const updated = await tx.course.update({
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
      // Course visibility (isActive) is not part of the outline; it stays admin-only.
      if (
        outlineBefore &&
        (outlineBefore.course.name !== updated.name || outlineBefore.course.description !== updated.description)
      ) {
        await recordOutlineRevision(tx, id, {
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

    const hasLevels = (n: number) =>
      NextResponse.json(
        { error: `Không thể xóa khóa học có ${n} level. Vui lòng xóa các level trước.` },
        { status: 400 }
      );

    // Check if course has levels (fast path; re-checked under the course lock below)
    const levelsCount = await prisma.level.count({
      where: { courseId: id },
    });

    if (levelsCount > 0) return hasLevels(levelsCount);

    const result = await prisma.$transaction(async (tx): Promise<'deleted' | 'not-found' | number> => {
      if (!(await lockCourse(tx, id))) return 'not-found';
      // Re-check under the lock: a level or lesson created meanwhile would be cascade-deleted
      // without any history.
      const levels = await tx.level.count({ where: { courseId: id } });
      const lessons = await tx.lesson.count({ where: { courseId: id } });
      // (Lessons always sit in a level; count them too so nothing is ever cascade-deleted.)
      if (levels > 0 || lessons > 0) return Math.max(levels, 1);
      // History outlives the course: keep its last outline as a DELETED revision.
      const last = await buildOutline(tx, id);
      if (last) {
        await recordRevision(tx, {
          targetType: 'COURSE_OUTLINE',
          targetId: id,
          courseId: id,
          label: last.course.name,
          snapshot: last as unknown as Prisma.InputJsonValue,
          source: 'DELETED',
          actorId: session.user.id,
          autoPatrol: true,
        });
      }
      await tx.course.delete({
        where: { id },
      });
      await audit(tx, {
        actorId: session.user.id,
        action: 'COURSE_DELETED',
        targetType: 'COURSE',
        targetId: id,
        details: { name: last?.course.name ?? null },
      });
      return 'deleted';
    });
    if (result === 'not-found') {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    if (typeof result === 'number') return hasLevels(result);

    // The catalogue and course pages are cached (CONTENT_TAG): drop the course now.
    revalidateContent();
    return NextResponse.json({ message: 'Course deleted' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
