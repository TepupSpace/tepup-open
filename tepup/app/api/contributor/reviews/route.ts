import { NextRequest, NextResponse } from 'next/server';
import { getContributorSession } from '@/lib/admin-auth';
import { getReviewQueue } from '@/lib/services/review-queue-service';
import type { UserRole } from '@prisma/client';

/**
 * Review queue. Global reviewers: every PENDING_REVIEW contribution. Course roles: only
 * proposals for courses where they may REVIEW_PROPOSAL (never their own). Anyone else: 403.
 * Optional `?course=<id>` narrows to one course.
 */
export async function GET(req: NextRequest) {
  const session = await getContributorSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const viewer = { id: session.user.id, role: session.user.role as UserRole };
  const courseId = req.nextUrl.searchParams.get('course');
  const queue = await getReviewQueue(viewer, { courseId });
  if (queue.scope === 'NONE') {
    return NextResponse.json({ error: 'Bạn không có quyền duyệt nội dung' }, { status: 403 });
  }
  return NextResponse.json({ scope: queue.scope, items: queue.items, courses: queue.courses });
}
