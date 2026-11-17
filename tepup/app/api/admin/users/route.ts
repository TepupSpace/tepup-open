import { NextRequest, NextResponse } from 'next/server';
import type { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

const VALID_ROLES: readonly string[] = ['LEARNER', 'AUTHOR', 'TRUSTED_AUTHOR', 'REVIEWER', 'ADMIN'];

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  // An unknown value would make Prisma throw (500): refuse it as a client error instead.
  const roleParam = searchParams.get('role');
  if (roleParam && !VALID_ROLES.includes(roleParam)) {
    return NextResponse.json({ error: 'Role không hợp lệ' }, { status: 400 });
  }
  const role = roleParam as UserRole | null;
  const search = searchParams.get('search');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
  const limit = 20;

  // Deleted accounts (tombstones) are hidden unless asked for: ?deleted=1 includes them.
  const includeDeleted = searchParams.get('deleted') === '1';

  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (!includeDeleted) where.deletedAt = null;
  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
        deletedAt: true,
        publicHandle: true,
        createdAt: true,
        _count: { select: { contributions: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ users, total, page, totalPages: Math.ceil(total / limit) });
}
