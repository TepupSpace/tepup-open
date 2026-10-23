import type { NotificationKind, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

/**
 * In-app notifications (proposal §6.16). No email, by design. Write them in the SAME
 * transaction as the event. Store no content: the inbox renders text at read time from
 * kind + target and drops entries whose target the reader can no longer see, so a hidden
 * lesson's name never leaks through a notification.
 */
export type NotificationTargetType =
  | 'CONTRIBUTION'
  | 'REVIEW_REQUEST'
  | 'LESSON'
  | 'COURSE'
  | 'THREAD'
  | 'SUGGESTION';

type Db = Prisma.TransactionClient | typeof prisma;

export interface NotifyInput {
  kind: NotificationKind;
  targetType: NotificationTargetType;
  targetId: string;
  actorId?: string | null;
}

/** Notify each user once; never the actor themselves. */
export async function notify(db: Db, userIds: Iterable<string>, input: NotifyInput): Promise<void> {
  const ids = [...new Set(userIds)].filter((id) => id && id !== input.actorId);
  if (!ids.length) return;
  await db.notification.createMany({
    data: ids.map((userId) => ({
      userId,
      kind: input.kind,
      targetType: input.targetType,
      targetId: input.targetId,
      actorId: input.actorId ?? null,
    })),
  });
}

/** User ids holding a course role (optionally only some roles) on a course. Skips deleted/banned. */
export async function courseMemberIds(
  db: Db,
  courseId: string,
  roles?: ('COURSE_LEAD' | 'TRUSTED_REVIEWER')[]
): Promise<string[]> {
  const rows = await db.courseMember.findMany({
    where: {
      courseId,
      ...(roles ? { role: { in: roles } } : {}),
      user: { deletedAt: null, isBanned: false },
    },
    select: { userId: true },
  });
  return rows.map((r) => r.userId);
}

/** All active admins (escalations, orphaned courses). */
export async function adminIds(db: Db): Promise<string[]> {
  const rows = await db.user.findMany({
    where: { role: 'ADMIN', deletedAt: null, isBanned: false },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}
