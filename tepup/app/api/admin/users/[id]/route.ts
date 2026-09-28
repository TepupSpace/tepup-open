import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
      isBanned: true,
      bannedAt: true,
      bannedReason: true,
      createdAt: true,
      _count: { select: { contributions: true, reviews: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { role, isBanned, bannedReason } = body;

  const updateData: Record<string, unknown> = {};

  if (role) {
    const validRoles = ['USER', 'CONTRIBUTOR', 'TRUSTED_CONTRIBUTOR', 'REVIEWER', 'ADMIN'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Role không hợp lệ' }, { status: 400 });
    }
    updateData.role = role;
  }

  if (isBanned !== undefined) {
    updateData.isBanned = isBanned;
    if (isBanned) {
      updateData.bannedAt = new Date();
      updateData.bannedReason = bannedReason || null;
    } else {
      updateData.bannedAt = null;
      updateData.bannedReason = null;
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
      isBanned: true,
    },
  });

  return NextResponse.json(user);
}
