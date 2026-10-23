import { NextResponse } from 'next/server';
import type { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getContributorSession } from '@/lib/admin-auth';
import { canOnCourse } from '@/lib/permissions/course-roles';
import { getLessonForViewerById } from '@/lib/services/content-service';
import { audit } from '@/lib/services/audit-service';
import { courseMemberIds, notify } from '@/lib/services/notification-service';
import { FLAG_NOTE_MAX, isFlagKind, listLessonFlags } from '@/lib/services/flags-service';
import { cleanSuggestionText } from '@/lib/suggestions';
import { revalidateContent } from '@/lib/cache';

/**
 * Maintenance flags of a lesson (proposal §6.21).
 *
 * GET  → { canFlag, open: LessonFlagView[], resolved: LessonFlagView[] }
 *        404 if the lesson doesn't exist or is hidden from the user. Notes and names only
 *        for users with FLAG on the course.
 * POST { kind, note? } → 201 { id }   FLAG permission (403 otherwise); 409 if a flag of that
 *        kind is already open on the lesson; 400 for an unknown kind or a note too long.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getContributorSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const viewer = { id: session.user.id, role: session.user.role as UserRole };
  const { id } = await params;

  const lesson = await getLessonForViewerById(id, viewer);
  if (!lesson) return NextResponse.json({ error: 'Không tìm thấy bài học' }, { status: 404 });
  const canFlag = await canOnCourse(viewer, lesson.courseId, 'FLAG');
  const flags = await listLessonFlags(id, canFlag);
  return NextResponse.json({ canFlag, ...flags });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getContributorSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const viewer = { id: session.user.id, role: session.user.role as UserRole };
  const { id } = await params;

  const lesson = await getLessonForViewerById(id, viewer);
  if (!lesson) return NextResponse.json({ error: 'Không tìm thấy bài học' }, { status: 404 });
  if (!(await canOnCourse(viewer, lesson.courseId, 'FLAG'))) {
    return NextResponse.json({ error: 'Bạn không có quyền gắn cờ cho bài này' }, { status: 403 });
  }

  const raw: unknown = await req.json().catch(() => null);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }
  const body = raw as { kind?: unknown; note?: unknown };
  if (!isFlagKind(body.kind)) return NextResponse.json({ error: 'Loại cờ không hợp lệ' }, { status: 400 });
  const kind = body.kind;
  const note = cleanSuggestionText(body.note, FLAG_NOTE_MAX);
  if (note === undefined) {
    return NextResponse.json({ error: `Ghi chú tối đa ${FLAG_NOTE_MAX} ký tự` }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    // Serialise flag changes on this lesson, so "one open flag per kind" holds under races.
    await tx.$queryRaw`select "id" from "Lesson" where "id" = ${id} for update`;
    const existing = await tx.lessonFlag.findFirst({ where: { lessonId: id, kind, resolvedAt: null }, select: { id: true } });
    if (existing) return { conflict: existing.id } as const;

    const flag = await tx.lessonFlag.create({
      data: { lessonId: id, courseId: lesson.courseId, kind, note: note || null, createdById: viewer.id },
      select: { id: true },
    });
    await audit(tx, {
      actorId: viewer.id,
      action: 'FLAG_SET',
      targetType: 'LESSON',
      targetId: id,
      details: { flagId: flag.id, kind, courseId: lesson.courseId },
    });
    await notify(tx, await courseMemberIds(tx, lesson.courseId), {
      kind: 'FLAG_CHANGED',
      targetType: 'LESSON',
      targetId: id,
      actorId: viewer.id,
    });
    return { id: flag.id } as const;
  });

  if ('conflict' in result) {
    return NextResponse.json({ error: 'Bài này đã có cờ loại này đang mở', existingId: result.conflict }, { status: 409 });
  }
  // The learner banner comes from the cached lesson read.
  revalidateContent();
  return NextResponse.json({ id: result.id }, { status: 201 });
}
