import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { canReviewContent } from '@/lib/role-utils';
import type { UserRole } from '@prisma/client';

export async function GET() {
  const session = await auth();
  if (!session?.user || !canReviewContent(session.user.role as UserRole)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const contributions = await prisma.contribution.findMany({
    where: { status: 'PENDING_REVIEW' },
    include: {
      contributor: {
        select: { username: true, name: true },
      },
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { submittedAt: 'asc' },
  });

  return NextResponse.json(contributions);
}
