import type { RevisionTarget, UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { canReviewContent } from '@/lib/role-utils';
import { canOnCourse, courseIdsWhere, type Viewer } from '@/lib/permissions/course-roles';
import { staffName } from '@/lib/credit';

/**
 * Who may read history, restore and patrol (proposal §5, §6.10, §6.18 revised).
 * Shared by the /api/history routes and the history pages (server side). Every check is
 * made here, on the server; the UI only hides buttons.
 *
 *   LESSON, COURSE_OUTLINE  read: canOnCourse(READ_HISTORY); restore: admin, or ROLLBACK on
 *                           the course; patrol: canOnCourse(PATROL)
 *   CHAPTER, LIBRARY_ENTRY  read and patrol: global reviewers and admins; restore: admin
 *
 * (`_lib` is a private folder: Next does not route it.)
 */

export const TARGET_TYPES = ['LESSON', 'CHAPTER', 'LIBRARY_ENTRY', 'COURSE_OUTLINE'] as const satisfies readonly RevisionTarget[];

export function parseTargetType(v: unknown): RevisionTarget | null {
  return typeof v === 'string' && (TARGET_TYPES as readonly string[]).includes(v) ? (v as RevisionTarget) : null;
}

export function viewerOf(user: { id: string; role: UserRole }): Viewer {
  return { id: user.id, role: user.role };
}

/** The course a LESSON/COURSE_OUTLINE target belongs to; for a deleted lesson, the one on its revisions. */
export async function targetCourseId(targetType: RevisionTarget, targetId: string): Promise<string | null> {
  if (targetType === 'COURSE_OUTLINE') {
    const [course, rev] = await Promise.all([
      prisma.course.findUnique({ where: { id: targetId }, select: { id: true } }),
      prisma.contentRevision.findFirst({ where: { targetType, targetId }, select: { id: true } }),
    ]);
    return course || rev ? targetId : null;
  }
  if (targetType === 'LESSON') {
    const lesson = await prisma.lesson.findUnique({ where: { id: targetId }, select: { courseId: true } });
    if (lesson) return lesson.courseId;
    const rev = await prisma.contentRevision.findFirst({
      where: { targetType, targetId, courseId: { not: null } },
      orderBy: { createdAt: 'desc' },
      select: { courseId: true },
    });
    return rev?.courseId ?? null;
  }
  return null;
}

export interface HistoryAccess {
  courseId: string | null;
  isAdmin: boolean;
  /** May restore a revision of this target (lesson content is re-validated strictly for non-admins). */
  canRestore: boolean;
  canPatrol: boolean;
}

/** null: the viewer may not read this target's history (answer 404). */
export async function historyAccess(viewer: Viewer, targetType: RevisionTarget, targetId: string): Promise<HistoryAccess | null> {
  const isAdmin = viewer.role === 'ADMIN';
  if (targetType === 'CHAPTER' || targetType === 'LIBRARY_ENTRY') {
    if (!canReviewContent(viewer.role)) return null;
    return { courseId: null, isAdmin, canRestore: isAdmin, canPatrol: true };
  }
  const courseId = await targetCourseId(targetType, targetId);
  if (!courseId) return null;
  if (!(await canOnCourse(viewer, courseId, 'READ_HISTORY'))) return null;
  const [canRestore, canPatrol] = await Promise.all([
    isAdmin || canOnCourse(viewer, courseId, 'ROLLBACK'),
    canOnCourse(viewer, courseId, 'PATROL'),
  ]);
  return { courseId, isAdmin, canRestore, canPatrol };
}

/** May `viewer` read this revision? Uses the course stored on the revision. */
export async function canReadRevision(viewer: Viewer, rev: { targetType: RevisionTarget; courseId: string | null }): Promise<boolean> {
  if (rev.targetType === 'CHAPTER' || rev.targetType === 'LIBRARY_ENTRY') return canReviewContent(viewer.role);
  if (!rev.courseId) return viewer.role === 'ADMIN';
  return canOnCourse(viewer, rev.courseId, 'READ_HISTORY');
}

export async function canPatrolRevision(viewer: Viewer, rev: { targetType: RevisionTarget; courseId: string | null }): Promise<boolean> {
  if (canReviewContent(viewer.role)) return true;
  if (rev.targetType === 'CHAPTER' || rev.targetType === 'LIBRARY_ENTRY' || !rev.courseId) return false;
  return canOnCourse(viewer, rev.courseId, 'PATROL');
}

/**
 * Scope for lists (recent changes): null = everything (admins, global reviewers);
 * otherwise the course ids where the viewer holds a course role that reads history.
 */
export async function recentChangesScope(viewer: Viewer): Promise<string[] | null> {
  if (canReviewContent(viewer.role)) return null;
  return courseIdsWhere(viewer.id, 'READ_HISTORY');
}

export const USER_NAME_SELECT = { id: true, username: true, name: true, publicHandle: true, deletedAt: true } as const;

export function nameOf(
  u: { username: string | null; name: string | null; publicHandle: string | null; deletedAt: Date | null } | null,
): string | null {
  return u ? staffName(u) : null;
}

/** Display names for user ids (patrollers have no relation on RevisionPatrol). */
export async function namesById(ids: (string | null | undefined)[]): Promise<Map<string, string>> {
  const unique = [...new Set(ids.filter((x): x is string => !!x))];
  if (!unique.length) return new Map();
  const users = await prisma.user.findMany({ where: { id: { in: unique } }, select: USER_NAME_SELECT });
  return new Map(users.map((u) => [u.id, staffName(u)]));
}
