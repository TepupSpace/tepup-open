import { NextRequest, NextResponse } from 'next/server';
import type { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getContributorSession } from '@/lib/admin-auth';
import { staffName } from '@/lib/credit';
import { rateLimit, refundRateLimit, retryAfterMinutes } from '@/lib/security/rate-limit';
import { courseMemberIds, notify } from '@/lib/services/notification-service';
import {
  COMMENT_EDIT_WINDOW_MS,
  COMMENT_MAX_LENGTH,
  checkWriteThread,
  isDiscussionTarget,
} from '@/lib/services/discussion-service';

const NOT_FOUND = { error: 'Không tìm thấy' };
const RATE_SCOPE = 'discussion-comment';
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000;

type Params = { params: Promise<{ targetType: string; targetId: string }> };

/**
 * GET /api/discussions/:targetType/:targetId
 * → { threadId, canWrite, writeBlocked: 'BLOCKED' | 'ACCOUNT' | null, isAdmin, maxLength,
 *     comments: [{ id, author, isOwn, createdAt, editedAt, editableUntil, hidden, body }] }
 * 404 when the viewer may not see the target (missing or hidden: same answer).
 * Hidden comments: body null, except for admins (who get the text with hidden: true).
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getContributorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { targetType, targetId } = await params;
  if (!isDiscussionTarget(targetType)) return NextResponse.json(NOT_FOUND, { status: 404 });

  const viewer = { id: session.user.id, role: session.user.role as UserRole };
  const check = await checkWriteThread(viewer, targetType, targetId);
  if (!check.ok && check.reason === 'NOT_FOUND') return NextResponse.json(NOT_FOUND, { status: 404 });
  const isAdmin = viewer.role === 'ADMIN';

  const thread = await prisma.discussionThread.findUnique({
    where: { targetType_targetId: { targetType, targetId } },
    select: {
      id: true,
      comments: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          authorId: true,
          body: true,
          createdAt: true,
          editedAt: true,
          hiddenAt: true,
          author: { select: { username: true, name: true, publicHandle: true, deletedAt: true } },
        },
      },
    },
  });

  const now = Date.now();
  const comments = (thread?.comments ?? []).map((c) => {
    const isOwn = !!c.authorId && c.authorId === viewer.id;
    const until = c.createdAt.getTime() + COMMENT_EDIT_WINDOW_MS;
    const hidden = !!c.hiddenAt;
    return {
      id: c.id,
      author: c.author ? staffName(c.author) : 'Tài khoản đã xóa',
      isOwn,
      createdAt: c.createdAt.toISOString(),
      editedAt: c.editedAt?.toISOString() ?? null,
      editableUntil: isOwn && !hidden && until > now && check.ok ? new Date(until).toISOString() : null,
      hidden,
      body: hidden && !isAdmin ? null : c.body,
    };
  });

  return NextResponse.json(
    {
      threadId: thread?.id ?? null,
      canWrite: check.ok,
      writeBlocked: check.ok ? null : check.reason,
      isAdmin,
      maxLength: COMMENT_MAX_LENGTH,
      comments,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

/**
 * POST /api/discussions/:targetType/:targetId  { body: string }
 * Plain text, trimmed, 1..4000 chars. 20 comments per user per hour (in memory).
 * → 201 { id } | 400 | 403 (blocked on the course / account) | 404 | 429
 */
export async function POST(req: NextRequest, { params }: Params) {
  const session = await getContributorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { targetType, targetId } = await params;
  if (!isDiscussionTarget(targetType)) return NextResponse.json(NOT_FOUND, { status: 404 });

  const viewer = { id: session.user.id, role: session.user.role as UserRole };
  const check = await checkWriteThread(viewer, targetType, targetId);
  if (!check.ok) {
    if (check.reason === 'NOT_FOUND') return NextResponse.json(NOT_FOUND, { status: 404 });
    return NextResponse.json(
      {
        error:
          check.reason === 'BLOCKED'
            ? 'Bạn đang bị chặn bình luận trong khóa học này.'
            : 'Tài khoản của bạn không thể bình luận.',
      },
      { status: 403 }
    );
  }

  const raw = (await req.json().catch(() => null)) as { body?: unknown } | null;
  const body = typeof raw?.body === 'string' ? raw.body.trim() : '';
  if (!body) return NextResponse.json({ error: 'Bình luận đang trống.', field: 'body' }, { status: 400 });
  if (body.length > COMMENT_MAX_LENGTH) {
    return NextResponse.json(
      { error: `Bình luận dài quá ${COMMENT_MAX_LENGTH} ký tự.`, field: 'body' },
      { status: 400 }
    );
  }

  const limited = rateLimit(RATE_SCOPE, viewer.id, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      {
        error: `Bạn đã bình luận ${RATE_LIMIT} lần trong một giờ. Thử lại sau ${retryAfterMinutes(limited.retryAfterSeconds)} phút.`,
      },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSeconds) } }
    );
  }

  const { courseId, ownerIds } = check.target;
  try {
    const comment = await prisma.$transaction(async (tx) => {
      const thread = await tx.discussionThread.upsert({
        where: { targetType_targetId: { targetType, targetId } },
        create: { targetType, targetId, courseId },
        update: {},
        select: { id: true },
      });
      const previous = await tx.discussionComment.findMany({
        where: { threadId: thread.id, authorId: { not: null } },
        distinct: ['authorId'],
        select: { authorId: true },
      });
      const created = await tx.discussionComment.create({
        data: { threadId: thread.id, authorId: viewer.id, body },
        select: { id: true },
      });

      const recipients = new Set<string>(ownerIds);
      for (const p of previous) if (p.authorId) recipients.add(p.authorId);
      // The author asking for a second look on their proposal reaches the course roles (§6.20).
      if (targetType === 'CONTRIBUTION' && courseId && ownerIds.includes(viewer.id)) {
        for (const id of await courseMemberIds(tx, courseId)) recipients.add(id);
      }
      // notify() never notifies the actor (the commenter).
      await notify(tx, recipients, { kind: 'COMMENT', targetType: 'THREAD', targetId: thread.id, actorId: viewer.id });
      return created;
    });
    return NextResponse.json({ id: comment.id }, { status: 201 });
  } catch (e) {
    // Nothing was saved: don't count it against the hourly limit.
    refundRateLimit(RATE_SCOPE, viewer.id);
    throw e;
  }
}
