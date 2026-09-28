import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { canReviewContent } from '@/lib/role-utils';
import { publishContribution, rejectContribution } from '@/lib/services/contribution-service';
import type { UserRole } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !canReviewContent(session.user.role as UserRole)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

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

  if (!contribution) {
    return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  }

  return NextResponse.json(contribution);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !canReviewContent(session.user.role as UserRole)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action, feedback } = body;

  if (!action || !['APPROVED', 'REJECTED', 'CHANGES_REQUESTED'].includes(action)) {
    return NextResponse.json({ error: 'Action không hợp lệ' }, { status: 400 });
  }

  const target = await prisma.contribution.findUnique({
    where: { id },
    select: { contributorId: true, type: true },
  });
  if (!target) {
    return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  }

  // Editorial review must be done by someone other than the author.
  if (target.contributorId === session.user.id) {
    return NextResponse.json(
      { error: 'Bạn không thể tự duyệt đóng góp của chính mình' },
      { status: 403 }
    );
  }

  // Edits to live lessons are approved by REVIEWER or above: an admin-granted clearance level,
  // like Wikipedia's "pending changes" reviewers. That keeps review distributed instead of
  // bottlenecked on admins, while the self-review rule above still applies.

  try {
    if (action === 'APPROVED') {
      await publishContribution(id, session.user.id);
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
    console.error('Review error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi xử lý review' },
      { status: 500 }
    );
  }
}
