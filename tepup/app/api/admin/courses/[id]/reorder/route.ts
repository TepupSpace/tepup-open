import { NextResponse } from 'next/server';
import { revalidateContent } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

interface ReorderLevel {
  id: string;
  lessonIds: string[];
}

/**
 * PUT /api/admin/courses/[id]/reorder — rewrite the whole ordering tree at once.
 *
 * Body: `{ levels: [{ id, lessonIds: [...] }, ...] }` — the arrays ARE the order,
 * the server assigns `sortOrder: index` (same contract as /api/admin/recommendations).
 * A lesson listed under a different level than it currently sits in is moved there,
 * so this one call covers level reorder, lesson reorder and cross-level moves.
 *
 * Neither `Level.sortOrder` nor `Lesson.sortOrder` is unique, so the indexes can be
 * overwritten straight through — no two-phase shuffle needed.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: courseId } = await params;
    const body = await request.json();
    const levels = body?.levels as ReorderLevel[] | undefined;

    if (!Array.isArray(levels)) {
      return NextResponse.json({ error: 'Thiếu danh sách levels' }, { status: 400 });
    }
    if (
      levels.some(
        (l) => typeof l?.id !== 'string' || !Array.isArray(l?.lessonIds) ||
          l.lessonIds.some((x) => typeof x !== 'string')
      )
    ) {
      return NextResponse.json({ error: 'Dữ liệu sắp xếp không hợp lệ' }, { status: 400 });
    }

    // Everything being reordered must belong to THIS course — otherwise a crafted
    // payload could reparent another course's lessons into this one.
    const levelIds = levels.map((l) => l.id);
    const lessonIds = levels.flatMap((l) => l.lessonIds);

    if (new Set(levelIds).size !== levelIds.length || new Set(lessonIds).size !== lessonIds.length) {
      return NextResponse.json({ error: 'Có id bị lặp trong yêu cầu' }, { status: 400 });
    }

    const [ownedLevels, ownedLessons] = await Promise.all([
      prisma.level.count({ where: { id: { in: levelIds }, courseId } }),
      prisma.lesson.count({ where: { id: { in: lessonIds }, courseId } }),
    ]);

    if (ownedLevels !== levelIds.length || ownedLessons !== lessonIds.length) {
      return NextResponse.json(
        { error: 'Level hoặc bài học không thuộc khoá học này' },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      ...levels.map((level, levelIndex) =>
        prisma.level.update({
          where: { id: level.id },
          data: { sortOrder: levelIndex },
        })
      ),
      ...levels.flatMap((level) =>
        level.lessonIds.map((lessonId, lessonIndex) =>
          prisma.lesson.update({
            where: { id: lessonId },
            // levelId too: a lesson listed under another level has been dragged there.
            data: { sortOrder: lessonIndex, levelId: level.id },
          })
        )
      ),
    ]);

    revalidateContent();
    return NextResponse.json({ message: 'Đã lưu thứ tự' });
  } catch (error) {
    console.error('Error reordering course:', error);
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 });
  }
}
