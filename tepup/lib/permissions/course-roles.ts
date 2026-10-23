import type { CourseRole, UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { canReviewContent } from '@/lib/role-utils';

/**
 * Course-scoped permissions (proposal §5, §6.8, §6.14). Every course-scoped API checks these
 * ITSELF; layouts and UI hiding are never the protection. Nothing here is cached in the
 * JWT: removing a grant takes effect on the next request.
 *
 *   COURSE_LEAD        review proposals for the course, accept suggestions, show/hide
 *                     lessons in an active course, roll back, flags, escalate
 *   TRUSTED_REVIEWER  review proposals for the course, opinions on "Gửi người duyệt",
 *                     read history, flags, escalate. No show/hide, suggestions or rollback.
 *
 * Global REVIEWER/ADMIN keep their global powers (canReviewContent).
 */

export interface Viewer {
  id: string;
  role: UserRole;
}

export type CourseAction =
  | 'SEE_HIDDEN'
  | 'REVIEW_PROPOSAL'
  | 'OPINION'
  | 'READ_HISTORY'
  | 'ROLLBACK'
  | 'TOGGLE_LESSON'
  | 'ACCEPT_SUGGESTION'
  | 'FLAG'
  | 'ESCALATE'
  | 'PATROL';

const ROLE_ACTIONS: Record<CourseRole, ReadonlySet<CourseAction>> = {
  COURSE_LEAD: new Set<CourseAction>([
    'SEE_HIDDEN',
    'REVIEW_PROPOSAL',
    'READ_HISTORY',
    'ROLLBACK',
    'TOGGLE_LESSON',
    'ACCEPT_SUGGESTION',
    'FLAG',
    'ESCALATE',
    'PATROL',
  ]),
  TRUSTED_REVIEWER: new Set<CourseAction>([
    'SEE_HIDDEN',
    'REVIEW_PROPOSAL',
    'OPINION',
    'READ_HISTORY',
    'FLAG',
    'ESCALATE',
    'PATROL',
  ]),
};

/** What global REVIEWERs may do on any course (ADMIN may do everything). */
const GLOBAL_REVIEWER_ACTIONS: ReadonlySet<CourseAction> = new Set<CourseAction>([
  'SEE_HIDDEN',
  'REVIEW_PROPOSAL',
  'OPINION',
  'READ_HISTORY',
  'ACCEPT_SUGGESTION',
  'FLAG',
  'ESCALATE',
  'PATROL',
]);

export async function getCourseRole(courseId: string, userId: string): Promise<CourseRole | null> {
  const m = await prisma.courseMember.findUnique({
    where: { courseId_userId: { courseId, userId } },
    select: { role: true },
  });
  return m?.role ?? null;
}

/** May `viewer` perform `action` on course `courseId`? */
export async function canOnCourse(viewer: Viewer, courseId: string, action: CourseAction): Promise<boolean> {
  if (viewer.role === 'ADMIN') return true;
  if (viewer.role === 'REVIEWER' && GLOBAL_REVIEWER_ACTIONS.has(action)) return true;
  const role = await getCourseRole(courseId, viewer.id);
  if (role && ROLE_ACTIONS[role].has(action)) return true;
  // Course author: sees hidden lessons of their own course (existing rule, Course.createdById).
  if (action === 'SEE_HIDDEN') {
    const owned = await prisma.course.count({ where: { id: courseId, createdById: viewer.id } });
    return owned > 0;
  }
  return false;
}

/** Courses where the user holds any course role: { courseId → role }. */
export async function getMemberships(userId: string): Promise<Map<string, CourseRole>> {
  const rows = await prisma.courseMember.findMany({ where: { userId }, select: { courseId: true, role: true } });
  return new Map(rows.map((r) => [r.courseId, r.role]));
}

/** Course ids where the user may do `action` through a course role (not counting global roles). */
export async function courseIdsWhere(userId: string, action: CourseAction): Promise<string[]> {
  const memberships = await getMemberships(userId);
  return [...memberships].filter(([, role]) => ROLE_ACTIONS[role].has(action)).map(([id]) => id);
}

/** Blocked from proposing, commenting and claiming on this course (CourseBlock). */
export async function isBlockedOnCourse(courseId: string, userId: string): Promise<boolean> {
  const b = await prisma.courseBlock.findUnique({
    where: { courseId_userId: { courseId, userId } },
    select: { userId: true },
  });
  return !!b;
}

/** Global role check, re-exported so callers import one module. */
export function isGlobalReviewer(role: UserRole): boolean {
  return canReviewContent(role);
}

/**
 * The course a contribution belongs to, for course-scoped review: the target lesson's course
 * (EDIT_LESSON_CONTENT), the target course (EDIT_COURSE). Chapters, library entries and new
 * courses have no course: only global reviewers review them.
 */
export async function contributionCourseId(c: { type: string; targetId: string | null }): Promise<string | null> {
  if (!c.targetId) return null;
  if (c.type === 'EDIT_LESSON_CONTENT') {
    const l = await prisma.lesson.findUnique({ where: { id: c.targetId }, select: { courseId: true } });
    return l?.courseId ?? null;
  }
  if (c.type === 'EDIT_COURSE') return c.targetId;
  return null;
}

/**
 * May `viewer` decide (approve / reject / request changes) on this contribution?
 * Never their own; escalated items only by an admin; course roles only for their course.
 */
export async function canDecideContribution(
  viewer: Viewer,
  c: { type: string; targetId: string | null; contributorId: string; escalatedAt: Date | null }
): Promise<boolean> {
  if (c.contributorId === viewer.id) return false;
  if (c.escalatedAt) return viewer.role === 'ADMIN';
  if (canReviewContent(viewer.role)) return true;
  const courseId = await contributionCourseId(c);
  return courseId ? canOnCourse(viewer, courseId, 'REVIEW_PROPOSAL') : false;
}

/** May `viewer` open (read) this contribution in the review screens? */
export async function canViewContributionForReview(
  viewer: Viewer,
  c: { type: string; targetId: string | null; contributorId: string }
): Promise<boolean> {
  if (canReviewContent(viewer.role)) return true;
  const courseId = await contributionCourseId(c);
  return courseId ? canOnCourse(viewer, courseId, 'REVIEW_PROPOSAL') : false;
}

/**
 * Where `viewer` may do `action`: null = every course (global REVIEWER/ADMIN power),
 * otherwise the course ids granted through course roles (possibly empty).
 * Use it to filter lists (review queue, suggestions) in one query instead of per row.
 */
export async function courseScope(viewer: Viewer, action: CourseAction): Promise<string[] | null> {
  if (viewer.role === 'ADMIN') return null;
  if (viewer.role === 'REVIEWER' && GLOBAL_REVIEWER_ACTIONS.has(action)) return null;
  return courseIdsWhere(viewer.id, action);
}
