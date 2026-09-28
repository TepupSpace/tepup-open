import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    const { status, adminNote } = body;

    const data: Record<string, unknown> = {};
    if (status && ['PENDING', 'IN_PROGRESS', 'DONE', 'REJECTED'].includes(status)) {
      data.status = status;
    }
    if (adminNote !== undefined) {
      data.adminNote = adminNote;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Không có dữ liệu cập nhật' }, { status: 400 });
    }

    const updated = await prisma.featureRequest.update({
      where: { id },
      data,
    });

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}
