import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getContributorSession } from '@/lib/admin-auth';
import { revalidateContent } from '@/lib/cache';
import { notify } from '@/lib/services/notification-service';
import { canGiveOpinion, canViewReviewRequest } from '@/lib/services/review-request-service';
import { rateLimit } from '@/lib/security/rate-limit';

const MAX_NOTE = 4000;

// PUT /api/contributor/review-requests/[id]/opinion  Body: { verdict: 'ENDORSED' | 'CHANGES_SUGGESTED', note? }
// Only ASKED reviewers who still hold OPINION on the course (trusted reviewer of the course,
// global REVIEWER, ADMIN), only while the request is OPEN. Opinions are advisory.
// → 200 { data: { verdict, note, updatedAt } } | 400 | 403 (can see, wasn't asked) | 404 | 409 (closed) | 429
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getContributorSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const viewer = { id: session.user.id, role: session.user.role };
    const { id } = await params;

    const req = await prisma.reviewRequest.findUnique({
      where: { id },
      select: { id: true, courseId: true, status: true, requestedById: true, publishedRevisionId: true },
    });
    if (!req || !(await canViewReviewRequest(viewer, req))) {
      return NextResponse.json({ error: 'Không tìm thấy yêu cầu' }, { status: 404 });
    }
    if (!(await canGiveOpinion(viewer, req))) {
      return NextResponse.json({ error: 'Bạn không được mời góp ý cho yêu cầu này' }, { status: 403 });
    }
    if (req.status !== 'OPEN') {
      return NextResponse.json({ error: 'Yêu cầu đã đóng, không thể đổi ý kiến' }, { status: 409 });
    }

    const limit = rateLimit('review-opinion', viewer.id, 30, 60 * 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json({ error: 'Bạn thao tác quá nhanh, thử lại sau ít phút' }, { status: 429 });
    }

    const body = (await request.json().catch(() => null)) as { verdict?: unknown; note?: unknown } | null;
    const verdict = body?.verdict;
    if (verdict !== 'ENDORSED' && verdict !== 'CHANGES_SUGGESTED') {
      return NextResponse.json({ error: 'Chọn "Đồng ý xuất bản" hoặc "Cần sửa"' }, { status: 400 });
    }
    const note = typeof body?.note === 'string' ? body.note.trim() : '';
    if (note.length > MAX_NOTE) {
      return NextResponse.json({ error: `Ghi chú tối đa ${MAX_NOTE} ký tự` }, { status: 400 });
    }

    const saved = await prisma.$transaction(async (tx) => {
      // Re-check under a row lock: the request may have closed (publish) meanwhile. A publish
      // closing it (closeReviewRequestsOnPublish) takes the same lock, so either this opinion
      // commits first, or this read waits for the publish and then sees CLOSED.
      const still = await tx.$queryRaw<{ id: string }[]>`
        select "id" from "ReviewRequest" where "id" = ${id} and "status" = 'OPEN' for update`;
      if (!still.length) return null;
      const op = await tx.reviewOpinion.upsert({
        where: { requestId_reviewerId: { requestId: id, reviewerId: viewer.id } },
        create: { requestId: id, reviewerId: viewer.id, verdict, note: note || null },
        update: { verdict, note: note || null },
        select: { verdict: true, note: true, updatedAt: true },
      });
      if (req.requestedById) {
        await notify(tx, [req.requestedById], {
          kind: 'REVIEW_OPINION',
          targetType: 'REVIEW_REQUEST',
          targetId: id,
          actorId: viewer.id,
        });
      }
      return op;
    });
    if (!saved) {
      return NextResponse.json({ error: 'Yêu cầu đã đóng, không thể đổi ý kiến' }, { status: 409 });
    }
    // Endorsements of a published version are public (lesson notices, cached).
    if (req.publishedRevisionId) revalidateContent();

    return NextResponse.json({ data: { ...saved, updatedAt: saved.updatedAt.toISOString() } });
  } catch (error) {
    console.error('Error saving review opinion:', error);
    return NextResponse.json({ error: 'Không thể lưu ý kiến' }, { status: 500 });
  }
}
