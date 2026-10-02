import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getContributorSession } from '@/lib/admin-auth';
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
  const checked = validateContributionData(contribution.type, contribution.data, {
    allowCustom: session.user.role === 'ADMIN',
  });
  if (!checked.ok) {
    return NextResponse.json(contentErrorBody(checked.issues, contribution.data), { status: 400 });
  }

  const updated = await prisma.contribution.update({
    where: { id },
    data: {
      data: checked.value as object,
      status: 'PENDING_REVIEW',
      submittedAt: new Date(),
      // A resubmission after "changes requested" is undecided again: drop the old
      // decision date, or "Đã gửi" would show a stale "Duyệt: <date>".
      resolvedAt: null,
    },
  });

  return NextResponse.json(updated);
}
