import { auth } from './auth';
import { redirect } from 'next/navigation';
import { hasMinRole, isContributorOrAbove, canReviewContent } from './role-utils';

export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin');
  }

  return session;
}

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/admin');
  }

  return session;
}

export async function getAdminSession() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    return null;
  }

  return session;
}

export async function requireContributor() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/contributor');
  }

  if (!isContributorOrAbove(session.user.role)) {
    redirect('/');
  }

  return session;
}

export async function requireReviewer() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/contributor/reviews');
  }

  if (!canReviewContent(session.user.role)) {
    redirect('/contributor');
  }

  return session;
}

export async function getContributorSession() {
  const session = await auth();

  if (!session?.user || !isContributorOrAbove(session.user.role)) {
    return null;
  }

  return session;
}
