/**
 * Words for people and roles, in one place (decided 2026-10-20). Pure: client- and server-safe.
 *
 * - Everyone outside the core team who writes, reviews or maintains content is a
 *   "người đóng góp"; their area is "Khu đóng góp". Never use "cộng tác viên" for this.
 * - Access levels (UserRole) are named by what the person can do: "Người học", "Người soạn
 *   thảo", "Người soạn thảo tin cậy", "Người duyệt", "Quản trị viên". Course roles:
 *   "Trưởng khóa học" (COURSE_LEAD), "Người duyệt tin cậy" (TRUSTED_REVIEWER).
 * - The public pseudonym is "Người đóng góp #<handle>".
 *
 * Change a word here, not in the components. (Wording revised 2026-10-20; the enum values in
 * the database keep their names.)
 */
import type { CourseRole, UserRole } from '@prisma/client';

export const TERMS = {
  /** Anyone who contributes (collective). */
  contributor: 'người đóng góp',
  Contributor: 'Người đóng góp',
  contributors: 'những người đóng góp',
  /** The signed-in area for contributors. */
  area: 'Khu đóng góp',
  /** Sign-up. */
  signUp: 'Đăng ký làm người đóng góp',
  /** Staff tools at a lesson (staff view). */
  lessonTools: 'Công cụ người đóng góp',
  /** Prefix of the public pseudonym. */
  pseudonymPrefix: 'Người đóng góp',
} as const;

/** Access levels (global roles), named by what the person can do. */
export const ROLE_LABEL: Record<UserRole, string> = {
  LEARNER: 'Người học',
  AUTHOR: 'Người soạn thảo',
  TRUSTED_AUTHOR: 'Người soạn thảo tin cậy',
  REVIEWER: 'Người duyệt',
  ADMIN: 'Quản trị viên',
};

/** Roles on one course. */
export const COURSE_ROLE_TERM: Record<CourseRole, string> = {
  COURSE_LEAD: 'Trưởng khóa học',
  TRUSTED_REVIEWER: 'Người duyệt tin cậy',
};

/**
 * The badge next to a user's name: the most specific role they hold. Global REVIEWER/ADMIN
 * win; otherwise a course role ("Người duyệt tin cậy · Demo 101", "+ 2 khóa khác");
 * otherwise the access level.
 */
export function roleBadge(
  role: UserRole,
  courseRoles: { role: CourseRole; courseName: string }[] = []
): string {
  if (role === 'ADMIN' || role === 'REVIEWER' || courseRoles.length === 0) return ROLE_LABEL[role];
  // A course lead (COURSE_LEAD) outranks a trusted reviewer for the badge.
  const sorted = [...courseRoles].sort((a, b) => (a.role === b.role ? 0 : a.role === 'COURSE_LEAD' ? -1 : 1));
  const top = sorted[0];
  const more = sorted.length - 1;
  return `${COURSE_ROLE_TERM[top.role]} · ${top.courseName}${more > 0 ? ` (+${more} khóa khác)` : ''}`;
}
