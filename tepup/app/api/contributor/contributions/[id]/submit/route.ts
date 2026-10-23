import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getContributorSession } from '@/lib/admin-auth';
import { contributionCourseId, isBlockedOnCourse } from '@/lib/permissions/course-roles';
import { courseMemberIds, notify } from '@/lib/services/notification-service';
import {
  contentErrorBody,
  isSupportedContributionType,
  validateContributionData,
} from '@/lib/schemas/content-validation';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getContributorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const contribution = await prisma.contribution.findFirst({
    where: { id, contributorId: session.user.id },
  });

  if (!contribution) {
    return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  }

  if (!['DRAFT', 'CHANGES_REQUESTED'].includes(contribution.status)) {
    return NextResponse.json(
      { error: 'Chỉ có thể gửi duyệt bản nháp hoặc đóng góp cần chỉnh sửa' },
      { status: 400 }
    );
  }

  // Drafts saved before server-side validation existed may still hold unsafe
  // content; nothing reaches the review queue without passing the same checks.
  if (!isSupportedContributionType(contribution.type)) {
    return NextResponse.json(
      { error: 'Loại đóng góp không được hỗ trợ / Unsupported contribution type' },
      { status: 400 }
    );
  }
  // Submit copies the author's licence consent onto the contribution (proposal §6.11);
  // publish refuses a contribution without one.
  const author = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { licenceVersion: true },
  });
  if (!author?.licenceVersion) {
    return NextResponse.json(
      { error: 'Bạn cần đồng ý giấy phép nội dung trước khi gửi (Cài đặt).', needsLicence: true },
      { status: 403 }
    );
  }

  const checked = validateContributionData(contribution.type, contribution.data, {
    allowCustom: session.user.role === 'ADMIN',
  });
  if (!checked.ok) {
    return NextResponse.json(contentErrorBody(checked.issues, contribution.data), { status: 400 });
  }

  // Proposals on a course (lesson edits, outline) notify its maintainers and trusted reviewers.
  const courseId = await contributionCourseId(contribution);
  // A user blocked on the course can't put a proposal (back) into its review queue.
  if (courseId && (await isBlockedOnCourse(courseId, session.user.id))) {
    return NextResponse.json({ error: 'Bạn không thể đóng góp cho khóa học này' }, { status: 403 });
  }
  const updated = await prisma.$transaction(async (tx) => {
    // Conditional on the status read above: a block (closeOpenProposalsOnCourse) or account
    // deletion may have closed it as REJECTED meanwhile, and must not be undone.
    const claimed = await tx.contribution.updateMany({
      where: { id, contributorId: session.user.id, status: { in: ['DRAFT', 'CHANGES_REQUESTED'] } },
      data: {
        data: checked.value as object,
        status: 'PENDING_REVIEW',
        submittedAt: new Date(),
        licenceVersion: author.licenceVersion,
        // A resubmission after "changes requested" is undecided again: drop the old
        // decision date, or "Đã gửi" would show a stale "Duyệt: <date>".
        resolvedAt: null,
      },
    });
    if (claimed.count !== 1) return null;
    const row = await tx.contribution.findUniqueOrThrow({ where: { id } });
    if (courseId) {
      await notify(tx, await courseMemberIds(tx, courseId), {
        kind: 'CONTRIBUTION_SUBMITTED',
        targetType: 'CONTRIBUTION',
        targetId: id,
        actorId: session.user.id,
      });
    }
    return row;
  });
  if (!updated) {
    return NextResponse.json(
      { error: 'Đóng góp này vừa thay đổi trạng thái (đã gửi hoặc đã đóng). Hãy tải lại trang.' },
      { status: 409 }
    );
  }

  return NextResponse.json(updated);
}
