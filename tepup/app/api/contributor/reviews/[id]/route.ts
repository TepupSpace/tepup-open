import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { isContributorOrAbove } from '@/lib/role-utils';
import { canDecideContribution, canViewContributionForReview } from '@/lib/permissions/course-roles';
import {
  ContributionEscalatedError,
  ContributionInvalidError,
  ContributionNotPendingError,
  StaleContributionError,
  publishContribution,
  rejectContribution,
} from '@/lib/services/contribution-service';
import type { UserRole } from '@prisma/client';

/** Review feedback cap (same as comments and opinions). */
const FEEDBACK_MAX = 4000;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !isContributorOrAbove(session.user.role as UserRole)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const viewer = { id: session.user.id, role: session.user.role as UserRole };

  const contribution = await prisma.contribution.findUnique({
    where: { id },
    include: {
      contributor: {
        select: { username: true, name: true, role: true, createdAt: true },
      },
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: { reviewer: { select: { username: true, name: true } } },
      },
    },
  });

  // Global reviewers see everything; maintainers and trusted reviewers only their courses.
  // 404 either way, so ids of other courses' proposals don't leak.
  if (!contribution || !(await canViewContributionForReview(viewer, contribution))) {
    return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  }

  return NextResponse.json({ ...contribution, canDecide: await canDecideContribution(viewer, contribution) });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !isContributorOrAbove(session.user.role as UserRole)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const viewer = { id: session.user.id, role: session.user.role as UserRole };
  const raw: unknown = await req.json().catch(() => null);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }
  const body = raw as { action?: unknown; feedback?: unknown; force?: unknown };
  const action = body.action;
  // Plain text, trimmed, capped like the other review messages (comments, opinions).
  const feedback = typeof body.feedback === 'string' ? body.feedback.trim() : '';
  // "Vẫn duyệt, ghi đè": approve even though the live lesson changed since the proposal started.
  const force = body.force === true;

  if (action !== 'APPROVED' && action !== 'REJECTED' && action !== 'CHANGES_REQUESTED') {
    return NextResponse.json({ error: 'Action không hợp lệ' }, { status: 400 });
  }
  if (action !== 'APPROVED' && feedback.length > FEEDBACK_MAX) {
    return NextResponse.json({ error: `Feedback quá dài (tối đa ${FEEDBACK_MAX} ký tự)` }, { status: 400 });
  }

  const target = await prisma.contribution.findUnique({
    where: { id },
    select: { contributorId: true, type: true, targetId: true, escalatedAt: true },
  });
  if (!target || !(await canViewContributionForReview(viewer, target))) {
    return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  }

  // Editorial review must be done by someone other than the author.
  if (target.contributorId === session.user.id) {
    return NextResponse.json(
      { error: 'Bạn không thể tự duyệt đóng góp của chính mình' },
      { status: 403 }
    );
  }

  // Global REVIEWER/ADMIN decide anything; maintainers and trusted reviewers only proposals
  // for their course (like Wikipedia's "pending changes" reviewers). Escalated items: admins.
  if (!(await canDecideContribution(viewer, target))) {
    return NextResponse.json(
      {
        error: target.escalatedAt
          ? 'Đóng góp này đã được chuyển quản trị viên quyết định'
          : 'Bạn không có quyền duyệt đóng góp này',
      },
      { status: 403 }
    );
  }

  try {
    if (action === 'APPROVED') {
      await publishContribution(id, session.user.id, { force });
    } else {
      if (!feedback) {
        return NextResponse.json(
          { error: 'Vui lòng nhập feedback khi từ chối hoặc yêu cầu chỉnh sửa' },
          { status: 400 }
        );
      }
      await rejectContribution(id, session.user.id, feedback, action);
    }

    return NextResponse.json({ message: 'Đã xử lý' });
  } catch (error) {
    if (error instanceof StaleContributionError) {
      return NextResponse.json(
        {
          error:
            'Nội dung đã được cập nhật sau khi đề xuất này bắt đầu. Hãy yêu cầu tác giả cập nhật, hoặc duyệt ghi đè.',
          stale: true,
          liveUpdatedAt: error.liveUpdatedAt?.toISOString() ?? null,
        },
        { status: 409 }
      );
    }
    if (error instanceof ContributionEscalatedError) {
      return NextResponse.json({ error: 'Đóng góp này đã được chuyển quản trị viên quyết định' }, { status: 403 });
    }
    if (error instanceof ContributionNotPendingError) {
      return NextResponse.json({ error: 'Đóng góp này đã được xử lý hoặc chưa được gửi duyệt' }, { status: 409 });
    }
    if (error instanceof ContributionInvalidError) {
      console.error('Review error:', error);
      return NextResponse.json({ error: 'Nội dung đóng góp không hợp lệ, không thể xuất bản' }, { status: 400 });
    }
    console.error('Review error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi xử lý review' },
      { status: 500 }
    );
  }
}
