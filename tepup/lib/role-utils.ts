import type { UserRole } from '@prisma/client';
import { ROLE_LABEL } from './terms';

const ROLE_LEVEL: Record<UserRole, number> = {
  LEARNER: -1,
  AUTHOR: 0,
  TRUSTED_AUTHOR: 1,
  REVIEWER: 2,
  ADMIN: 3,
};

export function hasMinRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[requiredRole];
}

export function isContributorOrAbove(role: UserRole): boolean {
  return hasMinRole(role, 'AUTHOR');
}

export function canReviewContent(role: UserRole): boolean {
  return hasMinRole(role, 'REVIEWER');
}

export function canEditExistingContent(role: UserRole): boolean {
  return hasMinRole(role, 'TRUSTED_AUTHOR');
}

export function getRoleLevelNumber(role: UserRole): number {
  return ROLE_LEVEL[role];
}

export function getRoleDisplayName(role: UserRole): string {
  // Names live in lib/terms.ts (access levels are not "cộng tác viên").
  return ROLE_LABEL[role];
}

/**
 * Where a signed-in user lands after login (or on visiting /login) when no valid
 * `callbackUrl` was given. Learners have no accounts, so every role here is staff.
 */
export function homePathForRole(role: UserRole | null | undefined): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'REVIEWER':
      return '/admin/reviews';
    case 'AUTHOR':
    case 'TRUSTED_AUTHOR':
      return '/contributor';
    default:
      return '/';
  }
}
