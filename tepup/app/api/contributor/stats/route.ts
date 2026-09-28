import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getContributorSession } from '@/lib/admin-auth';

export async function GET() {
  const session = await getContributorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  const [draft, pending, approved, rejected, changesRequested] = await Promise.all([
    prisma.contribution.count({ where: { contributorId: userId, status: 'DRAFT' } }),
    prisma.contribution.count({ where: { contributorId: userId, status: 'PENDING_REVIEW' } }),
    prisma.contribution.count({ where: { contributorId: userId, status: 'APPROVED' } }),
    prisma.contribution.count({ where: { contributorId: userId, status: 'REJECTED' } }),
    prisma.contribution.count({ where: { contributorId: userId, status: 'CHANGES_REQUESTED' } }),
  ]);

  return NextResponse.json({ draft, pending, approved, rejected, changesRequested });
}
