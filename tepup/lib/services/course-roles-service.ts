import type { CourseRole, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/services/audit-service';
import { adminIds, notify } from '@/lib/services/notification-service';

/**
 * Writes for course roles and per-course blocks (proposal §6.8, §6.14a, §6.20), shared by
 * the admin routes and the self-service "Rời vai trò". Callers check permissions first and
 * call revalidateContent() after commit (course credits list maintainers and reviewers).
 */

type Tx = Prisma.TransactionClient;

export const COURSE_ROLES: readonly CourseRole[] = ['COURSE_LEAD', 'TRUSTED_REVIEWER'];

export function isCourseRole(v: unknown): v is CourseRole {
  return typeof v === 'string' && (COURSE_ROLES as readonly string[]).includes(v);
}

/** Usernames are stored lowercase; match case-insensitively like login does. */
export async function findUserByUsername(username: unknown) {
  if (typeof username !== 'string') return null;
  const name = username.trim().replace(/^@/, '').toLowerCase();
  if (!name || name.length > 100) return null;
  return prisma.user.findFirst({
    where: { username: { equals: name, mode: 'insensitive' } },
    select: { id: true, username: true, role: true, isBanned: true, deletedAt: true },
  });
}

/** When a course has no COURSE_LEAD left, tell every admin (dashboard + inbox). */
export async function notifyIfOrphaned(tx: Tx, courseId: string, actorId: string | null): Promise<boolean> {
  const left = await tx.courseMember.count({
    where: { courseId, role: 'COURSE_LEAD', user: { deletedAt: null, isBanned: false } },
  });
  if (left > 0) return false;
  await notify(tx, await adminIds(tx), { kind: 'COURSE_ORPHANED', targetType: 'COURSE', targetId: courseId, actorId });
  return true;
}

/**
 * Removes a course role (admin removal or stepping down). Returns false when there was no
 * such grant. Audits COURSE_ROLE_REMOVED; notifies admins if the course lost its last maintainer.
 */
export async function removeCourseMember(
  tx: Tx,
  courseId: string,
  userId: string,
  actorId: string,
  how: 'ADMIN' | 'SELF'
): Promise<{ removed: boolean; orphaned: boolean }> {
  const existing = await tx.courseMember.findUnique({
    where: { courseId_userId: { courseId, userId } },
    select: { role: true },
  });
  if (!existing) return { removed: false, orphaned: false };
  await tx.courseMember.delete({ where: { courseId_userId: { courseId, userId } } });
  await audit(tx, {
    actorId,
    action: 'COURSE_ROLE_REMOVED',
    targetType: 'COURSE',
    targetId: courseId,
    details: { userId, role: existing.role, how },
  });
  const orphaned = existing.role === 'COURSE_LEAD' ? await notifyIfOrphaned(tx, courseId, actorId) : false;
  return { removed: true, orphaned };
}

/**
 * Closes a blocked user's open proposals on a course (lessons of the course, EDIT_COURSE on
 * it) as REJECTED, with a Review row by the blocking admin and a notification. Returns the
 * number closed.
 */
export async function closeOpenProposalsOnCourse(tx: Tx, courseId: string, userId: string, adminId: string): Promise<number> {
  const lessons = await tx.lesson.findMany({ where: { courseId }, select: { id: true } });
  const open = await tx.contribution.findMany({
    where: {
      contributorId: userId,
      status: { in: ['DRAFT', 'PENDING_REVIEW', 'CHANGES_REQUESTED'] },
      OR: [
        { type: 'EDIT_COURSE', targetId: courseId },
        { type: 'EDIT_LESSON_CONTENT', targetId: { in: lessons.map((l) => l.id) } },
      ],
    },
    select: { id: true },
  });
  if (!open.length) return 0;
  // Lock and re-check: a reviewer may have approved (or the author withdrawn) one of them
  // since the read above. Only rows still open are closed; an APPROVED one stays approved.
  const locked = await tx.$queryRaw<{ id: string }[]>`
    select "id" from "Contribution"
    where "id" = any(${open.map((c) => c.id)}) and "status" in ('DRAFT', 'PENDING_REVIEW', 'CHANGES_REQUESTED')
    order by "id" for update`;
  if (!locked.length) return 0;
  const ids = locked.map((c) => c.id);
  await tx.contribution.updateMany({
    where: { id: { in: ids }, status: { in: ['DRAFT', 'PENDING_REVIEW', 'CHANGES_REQUESTED'] } },
    data: { status: 'REJECTED', resolvedAt: new Date() },
  });
  await tx.review.createMany({
    data: ids.map((contributionId) => ({
      contributionId,
      reviewerId: adminId,
      action: 'REJECTED' as const,
      feedback: 'Đề xuất đã đóng vì tài khoản của bạn bị chặn đóng góp cho khóa học này.',
    })),
  });
  for (const id of ids) {
    await notify(tx, [userId], { kind: 'CONTRIBUTION_DECIDED', targetType: 'CONTRIBUTION', targetId: id, actorId: adminId });
  }
  return ids.length;
}
