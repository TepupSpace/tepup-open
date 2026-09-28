import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { getAdminSession } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role, title, description } = body;

    if (!role || !['LEARNER', 'CONTRIBUTOR'].includes(role)) {
      return NextResponse.json({ error: 'Vai trò không hợp lệ' }, { status: 400 });
    }
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Tiêu đề không được để trống' }, { status: 400 });
    }
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json({ error: 'Mô tả không được để trống' }, { status: 400 });
    }

    // Optionally attach userId if logged in
    let userId: string | null = null;
    try {
      const session = await auth();
      if (session?.user?.id) {
        userId = session.user.id;
      }
    } catch {
      // Not logged in, that's fine
    }

    const featureRequest = await prisma.featureRequest.create({
      data: {
        role,
        title: title.trim(),
        description: description.trim(),
        userId,
      },
    });

    return NextResponse.json({ data: featureRequest }, { status: 201 });
  } catch (err) {
    console.error('Feature request POST error:', err);
    return NextResponse.json({ error: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const role = searchParams.get('role');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (role) where.role = role;

  const [requests, total] = await Promise.all([
    prisma.featureRequest.findMany({
      where,
      include: { user: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.featureRequest.count({ where }),
  ]);

  return NextResponse.json({ data: requests, total, page, totalPages: Math.ceil(total / limit) });
}
