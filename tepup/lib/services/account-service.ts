import { randomBytes } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { audit } from '@/lib/services/audit-service';
import { notifyIfOrphaned } from '@/lib/services/course-roles-service';
import { ensurePublicHandle } from '@/lib/credit';

/**
 * Account deletion as a tombstone (proposal §6.13, §6.13a). The User row stays so foreign
 * keys and history stay intact; everything that identifies the person is removed, and the
 * username is freed at once.
 *
 * Run inside ONE transaction. Callers must call `revalidateContent()` after the commit (the
 * course credits list switches to the pseudonym), and should call
 * `ensurePublicHandle(prisma, userId)` before the transaction: a unique clash inside a
 * transaction aborts it, so the retry loop only works outside one.
 */

export class TombstoneError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

export interface TombstoneOptions {
  /** Who did it: the admin, or the user themselves. */
  actorId: string;
  /** Self-service deletion (USER_SELF_DELETED) versus an admin's (USER_DELETED). */
  self: boolean;
}

export interface TombstoneResult {
  orphanedCourseIds: string[];
  deletedDrafts: number;
  closedContributions: number;
  releasedSuggestions: number;
}

/**
 * `deleted-<random>`: the sign-up regex (letters, digits, underscore) can never produce it,
 * because of the hyphen. Random, not derived from the id or the old username.
 */
function tombstoneUsername(): string {
  return `deleted-${randomBytes(12).toString('hex')}`;
}

export async function tombstoneUser(
  tx: Prisma.TransactionClient,
  userId: string,
  { actorId, self }: TombstoneOptions
): Promise<TombstoneResult> {
  // Lock the row so two deletions (or a deletion and a role change) can't interleave.
  await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, deletedAt: true, publicHandle: true },
  });
  if (!user) throw new TombstoneError('Không tìm thấy', 404);
  if (user.deletedAt) throw new TombstoneError('Tài khoản này đã bị xóa', 409);

  const now = new Date();
  const publicHandle = user.publicHandle ?? (await ensurePublicHandle(tx, userId));

  // 1–4. Tombstone the row: deletedAt, freed username, no personal data, pseudonym credit.
  await tx.user.update({
    where: { id: userId },
    data: {
      deletedAt: now,
      username: tombstoneUsername(),
      password: null,
      name: null,
      email: null,
      emailVerified: null,
      image: null,
      creditMode: 'PSEUDONYM',
    },
  });
  await tx.account.deleteMany({ where: { userId } });
  await tx.session.deleteMany({ where: { userId } });

  // 5. Course roles. Admins hear about each course left with no maintainer.
  const memberships = await tx.courseMember.findMany({
    where: { userId },
    select: { courseId: true, role: true },
  });
  await tx.courseMember.deleteMany({ where: { userId } });
  const orphanedCourseIds: string[] = [];
  const maintainedCourseIds = [
    ...new Set(memberships.filter((m) => m.role === 'COURSE_LEAD').map((m) => m.courseId)),
  ];
  // Same rule as role removal (notifyIfOrphaned: banned maintainers don't count).
  for (const courseId of maintainedCourseIds) {
    // notify() skips the actor; an admin who deletes an account must see the warning too,
    // so the actor is only passed for self-deletion.
    if (await notifyIfOrphaned(tx, courseId, self ? actorId : null)) orphanedCourseIds.push(courseId);
  }

  // 6. Open contributions: private drafts go; pending ones are closed as rejected.
  const deletedDrafts = await tx.contribution.deleteMany({
    where: { contributorId: userId, status: 'DRAFT' },
  });
  const closed = await tx.contribution.updateMany({
    where: { contributorId: userId, status: { in: ['PENDING_REVIEW', 'CHANGES_REQUESTED'] } },
    data: { status: 'REJECTED', resolvedAt: now },
  });

  // 7. Release suggestions they had claimed ("Nhận làm").
  const released = await tx.suggestion.updateMany({
    where: { claimedById: userId },
    data: { claimedById: null, claimedAt: null },
  });

  // Trusted-reviewer details, pending review requests to them, and their inbox are personal.
  await tx.reviewerProfile.deleteMany({ where: { userId } });
  await tx.reviewRequestReviewer.deleteMany({ where: { userId } });
  await tx.notification.deleteMany({ where: { userId } });

  // Everything else stays: published content, revisions, reviews, opinions, comments, audit rows.
  await audit(tx, {
    actorId,
    action: self ? 'USER_SELF_DELETED' : 'USER_DELETED',
    targetType: 'USER',
    targetId: userId,
    // No old username here: it identified the person and may soon belong to someone else.
    details: {
      previousRole: user.role,
      publicHandle,
      orphanedCourseIds,
      deletedDrafts: deletedDrafts.count,
      closedContributions: closed.count,
      releasedSuggestions: released.count,
    },
  });

  return {
    orphanedCourseIds,
    deletedDrafts: deletedDrafts.count,
    closedContributions: closed.count,
    releasedSuggestions: released.count,
  };
}

/** Active (not deleted, not banned) admins other than `exceptUserId`. */
export async function otherActiveAdminCount(
  tx: Prisma.TransactionClient,
  exceptUserId: string
): Promise<number> {
  return tx.user.count({
    where: { role: 'ADMIN', deletedAt: null, isBanned: false, id: { not: exceptUserId } },
  });
}
