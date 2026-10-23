import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

/**
 * Append-only audit log of privileged actions (proposal §6.19). Write it in the SAME
 * transaction as the action. Never put passwords or other secrets in `details`.
 * Read only by admins (/admin/audit-log). The app role cannot update or delete rows.
 */
export type AuditAction =
  | 'USER_ROLE_CHANGED'
  | 'USER_BANNED'
  | 'USER_UNBANNED'
  | 'USER_DELETED'
  | 'USER_SELF_DELETED'
  | 'COURSE_ROLE_ADDED'
  | 'COURSE_ROLE_REMOVED'
  | 'COURSE_ROLE_CHANGED'
  | 'COURSE_BLOCK_ADDED'
  | 'COURSE_BLOCK_REMOVED'
  | 'REVIEWER_VERIFIED'
  | 'REVIEWER_UNVERIFIED'
  | 'LESSON_VISIBILITY_CHANGED'
  | 'LESSON_DELETED'
  | 'LEVEL_DELETED'
  | 'COURSE_DELETED'
  | 'CONTENT_ROLLED_BACK'
  | 'CONTRIBUTION_FORCE_APPROVED'
  | 'CONTRIBUTION_ESCALATED'
  | 'REVIEW_REQUEST_ESCALATED'
  | 'COMMENT_HIDDEN'
  | 'REVISION_PATROLLED'
  | 'FLAG_SET'
  | 'FLAG_RESOLVED';

export interface AuditInput {
  actorId: string | null;
  action: AuditAction;
  targetType: string;
  targetId: string;
  details?: Prisma.InputJsonValue;
}

type Db = Prisma.TransactionClient | typeof prisma;

export async function audit(db: Db, input: AuditInput): Promise<void> {
  await db.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      details: input.details ?? undefined,
    },
  });
}
