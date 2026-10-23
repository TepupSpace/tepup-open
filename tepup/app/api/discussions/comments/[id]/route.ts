import { NextRequest, NextResponse } from 'next/server';
import type { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getContributorSession } from '@/lib/admin-auth';
import { audit } from '@/lib/services/audit-service';
import {
  COMMENT_EDIT_WINDOW_MS,
  COMMENT_MAX_LENGTH,
  checkWriteThread,
} from '@/lib/services/discussion-service';

const NOT_FOUND = { error: 'Không tìm thấy' };

/**
 * PATCH /api/discussions/comments/:id
 *   { body: string }        the author, within 15 minutes, while allowed to write the thread
 *   { hidden: true|false }  admins only; audited (COMMENT_HIDDEN, details.hidden)
 * → 200 { ok: true } | 400 | 403 | 404 (comment missing or its thread not readable)
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getContributorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const viewer = { id: session.user.id, role: session.user.role as UserRole };

  const comment = await prisma.discussionComment.findUnique({
    where: { id },
    select: {
      id: true,
      authorId: true,
      createdAt: true,
      hiddenAt: true,
      threadId: true,
      thread: { select: { targetType: true, targetId: true } },
    },
  });
  if (!comment) return NextResponse.json(NOT_FOUND, { status: 404 });

  const check = await checkWriteThread(viewer, comment.thread.targetType, comment.thread.targetId);
  if (!check.ok && check.reason === 'NOT_FOUND') return NextResponse.json(NOT_FOUND, { status: 404 });

  const raw = (await req.json().catch(() => null)) as { body?: unknown; hidden?: unknown } | null;

  if (typeof raw?.hidden === 'boolean') {
    if (viewer.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Chỉ quản trị viên được ẩn bình luận.' }, { status: 403 });
    }
    const hidden = raw.hidden;
    await prisma.$transaction(async (tx) => {
      await tx.discussionComment.update({
        where: { id },
        data: hidden ? { hiddenAt: new Date(), hiddenById: viewer.id } : { hiddenAt: null, hiddenById: null },
      });
      await audit(tx, {
        actorId: viewer.id,
        action: 'COMMENT_HIDDEN',
        targetType: 'COMMENT',
        targetId: id,
        details: {
          hidden,
          threadId: comment.threadId,
          threadTargetType: comment.thread.targetType,
          threadTargetId: comment.thread.targetId,
        },
      });
    });
    return NextResponse.json({ ok: true });
  }

  if (typeof raw?.body === 'string') {
    if (comment.authorId !== viewer.id) {
      return NextResponse.json({ error: 'Bạn chỉ sửa được bình luận của mình.' }, { status: 403 });
    }
    if (!check.ok) {
      return NextResponse.json({ error: 'Bạn không thể bình luận ở đây.' }, { status: 403 });
    }
    if (comment.hiddenAt) {
      return NextResponse.json({ error: 'Bình luận đã bị ẩn, không sửa được.' }, { status: 403 });
    }
    if (Date.now() > comment.createdAt.getTime() + COMMENT_EDIT_WINDOW_MS) {
      return NextResponse.json({ error: 'Đã quá 15 phút, không sửa được nữa.' }, { status: 403 });
    }
    const body = raw.body.trim();
    if (!body) return NextResponse.json({ error: 'Bình luận đang trống.', field: 'body' }, { status: 400 });
    if (body.length > COMMENT_MAX_LENGTH) {
      return NextResponse.json({ error: `Bình luận dài quá ${COMMENT_MAX_LENGTH} ký tự.`, field: 'body' }, { status: 400 });
    }
    await prisma.discussionComment.update({ where: { id }, data: { body, editedAt: new Date() } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Cần `body` hoặc `hidden`.' }, { status: 400 });
}
