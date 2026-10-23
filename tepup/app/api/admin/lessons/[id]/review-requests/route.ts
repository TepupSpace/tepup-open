import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { staffName } from '@/lib/credit';
import { prepareBlocksForSave } from '@/lib/ai-import/normalize';
import { trimEmptyBlocks } from '@/lib/editor/trim-empty-blocks';
import { contentErrorBody, sanitizeAdminBlocks } from '@/lib/schemas/content-validation';
import { blocksSnapshot } from '@/lib/services/revision-service';
import { notify } from '@/lib/services/notification-service';
import {
  listLessonReviewRequests,
  validReviewerIds,
  type ReviewerCandidateDTO,
} from '@/lib/services/review-request-service';

const MAX_MESSAGE = 2000;
const MAX_REVIEWERS = 50;

// GET /api/admin/lessons/[id]/review-requests
// → { data: { requests: ReviewRequestSummaryDTO[], candidates: ReviewerCandidateDTO[] } }
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: lessonId } = await params;

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { courseId: true } });
  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

  const active = { deletedAt: null, isBanned: false } as const;
  const userSelect = { id: true, username: true, name: true, publicHandle: true, deletedAt: true } as const;
  const [requests, trusted, globals] = await Promise.all([
    listLessonReviewRequests(lessonId, session.user.id),
    prisma.courseMember.findMany({
      where: { courseId: lesson.courseId, role: 'TRUSTED_REVIEWER', user: active },
      select: { user: { select: userSelect } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.user.findMany({
      where: { role: 'REVIEWER', ...active },
      select: userSelect,
      orderBy: { username: 'asc' },
    }),
  ]);

  const candidates: ReviewerCandidateDTO[] = [];
  const seen = new Set<string>([session.user.id]);
  for (const t of trusted) {
    if (seen.has(t.user.id)) continue;
    seen.add(t.user.id);
    candidates.push({ id: t.user.id, name: staffName(t.user), trusted: true });
  }
  for (const u of globals) {
    if (seen.has(u.id)) continue;
    seen.add(u.id);
    candidates.push({ id: u.id, name: staffName(u), trusted: false });
  }

  return NextResponse.json({ data: { requests, candidates } });
}

// POST /api/admin/lessons/[id]/review-requests  ("Gửi người duyệt", proposal §6.15)
// Body: { title, blocks, message?, reviewerIds: string[] }. The editor sends its CURRENT
// title and blocks; they are trimmed and checked exactly like "Xuất bản", so publishing the
// same version later matches the snapshot (closeReviewRequestsOnPublish).
// → 201 { data: { id } } | 400 { error, details? } | 404
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id: lessonId } = await params;

    const body = (await request.json().catch(() => null)) as {
      title?: unknown;
      blocks?: unknown;
      message?: unknown;
      reviewerIds?: unknown;
    } | null;
    if (!body) return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });

    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) return NextResponse.json({ error: 'Tiêu đề là bắt buộc' }, { status: 400 });

    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (message.length > MAX_MESSAGE) {
      return NextResponse.json({ error: `Lời nhắn tối đa ${MAX_MESSAGE} ký tự` }, { status: 400 });
    }

    const reviewerIds = Array.isArray(body.reviewerIds)
      ? [...new Set(body.reviewerIds.filter((x): x is string => typeof x === 'string' && x.length > 0))]
      : [];
    if (!reviewerIds.length) {
      return NextResponse.json({ error: 'Chọn ít nhất một người duyệt' }, { status: 400 });
    }
    if (reviewerIds.length > MAX_REVIEWERS) {
      return NextResponse.json({ error: 'Quá nhiều người duyệt' }, { status: 400 });
    }
    // Nobody reviews their own work (proposal §5): the UI never offers the requester, but
    // the server must refuse it too.
    if (reviewerIds.includes(session.user.id)) {
      return NextResponse.json({ error: 'Bạn không thể tự mời chính mình duyệt' }, { status: 400 });
    }

    // Same checks as the publish route (app/api/admin/lessons/[id]/content).
    const prepared = prepareBlocksForSave(trimEmptyBlocks(body.blocks).blocks);
    if (prepared.errors.length) {
      return NextResponse.json({ error: 'Có block sai cấu trúc', details: prepared.errors }, { status: 400 });
    }
    const cleaned = sanitizeAdminBlocks(prepared.blocks);
    if (!cleaned.ok) return NextResponse.json(contentErrorBody(cleaned.issues), { status: 400 });
    const safeBlocks = cleaned.value as Prisma.InputJsonValue;

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { courseId: true } });
    if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

    const created = await prisma.$transaction(async (tx) => {
      const valid = await validReviewerIds(tx, lesson.courseId, reviewerIds);
      const invalid = reviewerIds.filter((id) => !valid.has(id));
      if (invalid.length) return { invalid } as const;

      // The base: what learners see right now.
      const live = await tx.lessonContent.findUnique({
        where: { lessonId },
        select: { title: true, blocks: true, updatedAt: true },
      });
      const req = await tx.reviewRequest.create({
        data: {
          lessonId,
          courseId: lesson.courseId,
          requestedById: session.user.id,
          title,
          blocks: safeBlocks,
          baseSnapshot: live ? blocksSnapshot(live.title, live.blocks) : Prisma.JsonNull,
          baseUpdatedAt: live?.updatedAt ?? null,
          message: message || null,
          reviewers: { create: reviewerIds.map((userId) => ({ userId })) },
        },
        select: { id: true },
      });
      await notify(tx, reviewerIds, {
        kind: 'REVIEW_REQUESTED',
        targetType: 'REVIEW_REQUEST',
        targetId: req.id,
        actorId: session.user.id,
      });
      return { id: req.id } as const;
    });

    if ('invalid' in created) {
      return NextResponse.json(
        { error: 'Có người được chọn không còn là người duyệt của khoá này. Tải lại trang rồi thử lại.' },
        { status: 400 }
      );
    }
    return NextResponse.json({ data: { id: created.id } }, { status: 201 });
  } catch (error) {
    console.error('Error creating review request:', error);
    return NextResponse.json({ error: 'Không thể gửi yêu cầu duyệt' }, { status: 500 });
  }
}
