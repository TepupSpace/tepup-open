import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

// POST /api/admin/review-requests/[id]/close  ("Đóng yêu cầu", proposal §6.15)
// Closes an OPEN request without publishing. → 200 { data: { id, status } } | 404
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const req = await prisma.reviewRequest.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!req) return NextResponse.json({ error: 'Không tìm thấy yêu cầu' }, { status: 404 });
  if (req.status === 'OPEN') {
    await prisma.reviewRequest.updateMany({
      where: { id, status: 'OPEN' },
      data: { status: 'CLOSED', closedAt: new Date() },
    });
  }
  return NextResponse.json({ data: { id, status: 'CLOSED' } });
}
