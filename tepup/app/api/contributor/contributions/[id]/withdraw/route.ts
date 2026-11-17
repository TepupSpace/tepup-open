import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getContributorSession } from '@/lib/admin-auth';

/**
 * POST: withdraw your own PENDING_REVIEW contribution back to DRAFT ("Rút lại để sửa").
 * The conditional updateMany is the race guard: a reviewer deciding at the same moment
 * claims the row first (claimPending), and this then answers 409.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getContributorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const exists = await prisma.contribution.findFirst({
    where: { id, contributorId: session.user.id },
    select: { status: true },
  });
  if (!exists) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });

  const { count } = await prisma.contribution.updateMany({
    where: { id, contributorId: session.user.id, status: 'PENDING_REVIEW' },
    data: { status: 'DRAFT', submittedAt: null },
  });
  if (count === 0) {
    return NextResponse.json(
      { error: 'Đóng góp này vừa được xử lý, không rút lại được nữa' },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}
