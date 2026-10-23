import type { DiscussionTarget, UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { canReviewContent, isContributorOrAbove } from '@/lib/role-utils';
import {
  canOnCourse,
  canViewContributionForReview,
  contributionCourseId,
  isBlockedOnCourse,
  type Viewer,
} from '@/lib/permissions/course-roles';
import { getLessonForViewerById } from '@/lib/services/content-service';

/**
 * Discussion threads (proposal §6.17): staff-only, plain text, one thread per target.
 * Every check is done here, server side, per request; the UI hides nothing on its own.
 * Callers answer 404 when a thread is not readable, so hidden targets don't leak.
 */

export const DISCUSSION_TARGETS: readonly DiscussionTarget[] = [
  'LESSON',
  'CHAPTER',
  'LIBRARY_ENTRY',
  'CONTRIBUTION',
  'REVIEW_REQUEST',
];

export function isDiscussionTarget(v: string): v is DiscussionTarget {
  return (DISCUSSION_TARGETS as readonly string[]).includes(v);
}

export const COMMENT_MAX_LENGTH = 4000;
/** Authors may edit their own comment for this long. */
export const COMMENT_EDIT_WINDOW_MS = 15 * 60 * 1000;

export interface ThreadTargetInfo {
  /** Course of the target (visibility, per-course blocks); null for chapters, entries, new courses. */
  courseId: string | null;
  /** Who "owns" the target and gets every comment: the contribution author / the requester. */
  ownerIds: string[];
}

/**
 * Resolves the target when `viewer` may read its thread; null otherwise (missing OR hidden
 * from them — the caller answers 404 for both).
 */
export async function resolveReadableTarget(
  viewer: Viewer,
  targetType: DiscussionTarget,
  targetId: string
): Promise<ThreadTargetInfo | null> {
  if (!isContributorOrAbove(viewer.role)) return null;

  switch (targetType) {
    case 'LESSON': {
      const lesson = await getLessonForViewerById(targetId, viewer);
      return lesson ? { courseId: lesson.courseId, ownerIds: [] } : null;
    }
    case 'CHAPTER': {
      const ch = await prisma.chapter.findUnique({
        where: { id: targetId },
        select: { isActive: true, story: { select: { isActive: true, character: { select: { isActive: true } } } } },
      });
      if (!ch) return null;
      const visible = ch.isActive && ch.story.isActive && ch.story.character.isActive;
      // Hidden chapters: global reviewers and admins only (CLAUDE.md, hidden content rule).
      return visible || canReviewContent(viewer.role) ? { courseId: null, ownerIds: [] } : null;
    }
    case 'LIBRARY_ENTRY': {
      const e = await prisma.libraryEntry.findUnique({ where: { id: targetId }, select: { isActive: true } });
      if (!e) return null;
      return e.isActive || canReviewContent(viewer.role) ? { courseId: null, ownerIds: [] } : null;
    }
    case 'CONTRIBUTION': {
      const c = await prisma.contribution.findUnique({
        where: { id: targetId },
        select: { type: true, targetId: true, contributorId: true },
      });
      if (!c) return null;
      if (c.contributorId !== viewer.id && !(await canViewContributionForReview(viewer, c))) return null;
      return { courseId: await contributionCourseId(c), ownerIds: [c.contributorId] };
    }
    case 'REVIEW_REQUEST': {
      const r = await prisma.reviewRequest.findUnique({
        where: { id: targetId },
        select: { courseId: true, requestedById: true, reviewers: { select: { userId: true } } },
      });
      if (!r) return null;
      // Same rule as the request page (canViewReviewRequest): admins, or anyone who CURRENTLY
      // holds READ_HISTORY on the course. Losing a grant (or admin rights) ends access.
      const allowed = viewer.role === 'ADMIN' || (await canOnCourse(viewer, r.courseId, 'READ_HISTORY'));
      if (!allowed) return null;
      return { courseId: r.courseId, ownerIds: r.requestedById ? [r.requestedById] : [] };
    }
    default:
      return null;
  }
}

export async function canReadThread(viewer: Viewer, targetType: DiscussionTarget, targetId: string): Promise<boolean> {
  return (await resolveReadableTarget(viewer, targetType, targetId)) !== null;
}

export type WriteCheck =
  | { ok: true; target: ThreadTargetInfo }
  | { ok: false; reason: 'NOT_FOUND' | 'BLOCKED' | 'ACCOUNT' };

/**
 * Who may write: everyone who may read, unless blocked on the target's course (CourseBlock)
 * or the account is banned/deleted (re-read from the DB, not the JWT).
 */
export async function checkWriteThread(
  viewer: Viewer,
  targetType: DiscussionTarget,
  targetId: string
): Promise<WriteCheck> {
  const target = await resolveReadableTarget(viewer, targetType, targetId);
  if (!target) return { ok: false, reason: 'NOT_FOUND' };
  const user = await prisma.user.findUnique({ where: { id: viewer.id }, select: { isBanned: true, deletedAt: true } });
  if (!user || user.isBanned || user.deletedAt) return { ok: false, reason: 'ACCOUNT' };
  if (target.courseId && (await isBlockedOnCourse(target.courseId, viewer.id))) return { ok: false, reason: 'BLOCKED' };
  return { ok: true, target };
}

export async function canWriteThread(viewer: Viewer, targetType: DiscussionTarget, targetId: string): Promise<boolean> {
  return (await checkWriteThread(viewer, targetType, targetId)).ok;
}

/** Staff page where a thread's target (and so its discussion) lives. */
export function threadTargetHref(
  targetType: DiscussionTarget,
  targetId: string,
  opts: { viewerIsAuthor?: boolean } = {}
): string {
  switch (targetType) {
    case 'LESSON':
      return `/contributor/lessons/${targetId}`;
    case 'CHAPTER':
      return `/contributor/chapters/${targetId}`;
    case 'LIBRARY_ENTRY':
      return `/contributor/library/${targetId}`;
    case 'CONTRIBUTION':
      return opts.viewerIsAuthor ? `/contributor/contributions/${targetId}/edit` : `/contributor/reviews/${targetId}`;
    case 'REVIEW_REQUEST':
      return `/contributor/review-requests/${targetId}`;
  }
}

export function viewerFromSession(user: { id: string; role: unknown }): Viewer {
  return { id: user.id, role: user.role as UserRole };
}
