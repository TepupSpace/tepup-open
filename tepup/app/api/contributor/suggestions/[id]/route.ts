import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { canReviewContent } from '@/lib/role-utils';
import { SUGGESTION_LIMITS, SUGGESTION_TRANSITIONS, cleanSuggestionText } from '@/lib/suggestions';
import type { SuggestionStatus, UserRole } from '@prisma/client';

/**
 * Reviewer decision on an anonymous suggestion.
 * ACCEPTED = valid, an editor still has to apply it · APPLIED = done · REJECTED = won't apply.
 * Changing the lesson itself always happens in the content editor, not here.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !canReviewContent(session.user.role as UserRole)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
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

  const current = await prisma.suggestion.findUnique({ where: { id }, select: { status: true } });
  if (!current) {
    return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
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
