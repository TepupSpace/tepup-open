import { prisma } from '@/lib/prisma';
import type { UserRole } from '@prisma/client';

const PROMOTE_THRESHOLD = 5; // minimum approved contributions
const PROMOTE_DAYS = 7; // minimum account age in days

/**
 * Not called automatically any more — promotion is a manual admin decision.
 * Kept for an admin-triggered "suggest promotions" feature.
 */
export async function checkAndPromote(userId: string): Promise<UserRole | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, createdAt: true },
  });

  if (!user || user.role !== 'CONTRIBUTOR') return null;

  const approvedCount = await prisma.contribution.count({
    where: { contributorId: userId, status: 'APPROVED' },
  });

  const accountAgeDays = Math.floor(
    (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (approvedCount >= PROMOTE_THRESHOLD && accountAgeDays >= PROMOTE_DAYS) {
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'TRUSTED_CONTRIBUTOR' },
    });
    return 'TRUSTED_CONTRIBUTOR';
  }

  return null;
}
