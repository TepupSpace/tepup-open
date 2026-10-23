import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getContributorSession } from '@/lib/admin-auth';
import { canReviewContent } from '@/lib/role-utils';
import { canOnCourse } from '@/lib/permissions/course-roles';
import { SUGGESTION_LIMITS, SUGGESTION_TRANSITIONS, cleanSuggestionText } from '@/lib/suggestions';
import type { SuggestionStatus, UserRole } from '@prisma/client';

/**
 * Reviewer decision on an anonymous suggestion.
 * ACCEPTED = valid, an editor still has to apply it · APPLIED = done · REJECTED = won't apply.
 * Changing the lesson itself always happens in the content editor, not here.
 *
 * Global reviewers decide on any suggestion. Maintainers (ACCEPT_SUGGESTION) only on
 * suggestions about LESSONs of their courses; anything else is a 404 for them.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getContributorSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const viewer = { id: session.user.id, role: session.user.role as UserRole };

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }
  const status = body.status as SuggestionStatus;
  const note = cleanSuggestionText(body.note, SUGGESTION_LIMITS.reviewNote);

  if (!['ACCEPTED', 'APPLIED', 'REJECTED'].includes(status)) {
    return NextResponse.json({ error: 'Trạng thái không hợp lệ' }, { status: 400 });
  }
  if (note === undefined) {
    return NextResponse.json({ error: 'Ghi chú quá dài' }, { status: 400 });
  }
  // Only admins can edit lesson content, so only they can confirm a change was applied.
  if (status === 'APPLIED' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Chỉ quản trị viên mới đánh dấu đã áp dụng' }, { status: 403 });
  }

  const current = await prisma.suggestion.findUnique({
    where: { id },
    select: { status: true, targetType: true, targetId: true },
  });
  if (!current) {
    return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  }
  if (!canReviewContent(viewer.role)) {
    // Course roles: lesson suggestions of a course where they may accept suggestions only.
    const lesson =
      current.targetType === 'LESSON'
        ? await prisma.lesson.findUnique({ where: { id: current.targetId }, select: { courseId: true } })
        : null;
    if (!lesson || !(await canOnCourse(viewer, lesson.courseId, 'ACCEPT_SUGGESTION'))) {
      return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
    }
  }
  if (!SUGGESTION_TRANSITIONS[current.status].includes(status)) {
    return NextResponse.json({ error: 'Góp ý này đã được xử lý' }, { status: 409 });
  }

  // Conditional update so two reviewers can't overwrite each other's decision.
  const updated = await prisma.suggestion.updateMany({
    where: { id, status: current.status },
    data: {
      status,
      reviewerId: session.user.id,
      // Keep an earlier reviewer's note (e.g. from ACCEPTED) unless a new one is written.
      ...(note ? { reviewNote: note } : {}),
      resolvedAt: status === 'ACCEPTED' ? null : new Date(),
    },
  });
  if (updated.count !== 1) {
    return NextResponse.json({ error: 'Góp ý này vừa được người khác xử lý' }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
