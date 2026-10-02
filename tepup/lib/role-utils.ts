import type { UserRole } from '@prisma/client';

const ROLE_LEVEL: Record<UserRole, number> = {
  USER: -1,
  CONTRIBUTOR: 0,
  TRUSTED_CONTRIBUTOR: 1,
  REVIEWER: 2,
  ADMIN: 3,
};

export function hasMinRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[requiredRole];
}

export function isContributorOrAbove(role: UserRole): boolean {
  return hasMinRole(role, 'CONTRIBUTOR');
}

export function canReviewContent(role: UserRole): boolean {
  return hasMinRole(role, 'REVIEWER');
}

export function canEditExistingContent(role: UserRole): boolean {
  return hasMinRole(role, 'TRUSTED_CONTRIBUTOR');
}

export function getRoleLevelNumber(role: UserRole): number {
  return ROLE_LEVEL[role];
}

export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    USER: 'Người dùng',
    CONTRIBUTOR: 'Contributor',
    TRUSTED_CONTRIBUTOR: 'Trusted Contributor',
    REVIEWER: 'Reviewer',
    ADMIN: 'Admin',
  };
  return names[role];
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
    case 'CONTRIBUTOR':
    case 'TRUSTED_CONTRIBUTOR':
      return '/contributor';
    default:
      return '/';
  }
}
