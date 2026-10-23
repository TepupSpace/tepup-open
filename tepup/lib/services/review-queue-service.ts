import type { ContributionType, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { courseScope, type Viewer } from '@/lib/permissions/course-roles';
import { contributionTypeLabel } from '@/lib/contribution-labels';
import { staffName } from '@/lib/credit';

/**
 * The review queue (proposal §5, §6.8): PENDING_REVIEW contributions the viewer may review.
 *
 *  - Global REVIEWER/ADMIN: everything pending (as before).
 *  - Course roles (COURSE_LEAD, TRUSTED_REVIEWER): only proposals whose course
 *    (`contributionCourseId`: the target lesson's course for EDIT_LESSON_CONTENT, the course
 *    for EDIT_COURSE) they may REVIEW_PROPOSAL on, never their own. Chapters, library
 *    entries and new courses have no course, so only global reviewers see them.
 *
 * Order: escalated items first for admins (only they can decide them), then proposals by
 * TRUSTED_AUTHOR authors, then oldest first.
 */

export interface ReviewQueueItem {
  id: string;
  type: ContributionType;
  typeLabel: string;
  /** What the proposal is about: lesson/chapter/entry/course name, or the new course's name. */
  title: string;
  courseId: string | null;
  courseName: string | null;
  contributorName: string;
  trustedAuthor: boolean;
  own: boolean;
  submittedAt: Date | null;
  escalatedAt: Date | null;
  escalationNote: string | null;
}

export interface ReviewQueue {
  /** ALL = global reviewer; COURSES = course roles only; NONE = nothing this user may review. */
  scope: 'ALL' | 'COURSES' | 'NONE';
  items: ReviewQueueItem[];
  /** Courses the viewer reviews through course roles (for the filter), empty for global reviewers. */
  courses: { id: string; name: string }[];
}

function dataName(data: unknown): string | null {
  const d = data as { course?: { name?: unknown }; name?: unknown; title?: unknown } | null;
  const v = d?.course?.name ?? d?.name ?? d?.title;
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

export async function getReviewQueue(viewer: Viewer, opts: { courseId?: string | null } = {}): Promise<ReviewQueue> {
  const scopeIds = await courseScope(viewer, 'REVIEW_PROPOSAL');
  const global = scopeIds === null;
  if (!global && scopeIds.length === 0) return { scope: 'NONE', items: [], courses: [] };

  // Course filter: global reviewers may filter by any course; course roles only by theirs.
  let courseIds: string[] | null = scopeIds;
  if (opts.courseId) {
    if (!global && !scopeIds.includes(opts.courseId)) {
      return { scope: 'COURSES', items: [], courses: await courseNames(scopeIds) };
    }
    courseIds = [opts.courseId];
  }

  let where: Prisma.ContributionWhereInput = { status: 'PENDING_REVIEW' };
  if (courseIds) {
    const lessons = await prisma.lesson.findMany({ where: { courseId: { in: courseIds } }, select: { id: true } });
    where = {
      status: 'PENDING_REVIEW',
      ...(global ? {} : { contributorId: { not: viewer.id } }),
      OR: [
        { type: 'EDIT_COURSE', targetId: { in: courseIds } },
        { type: 'EDIT_LESSON_CONTENT', targetId: { in: lessons.map((l) => l.id) } },
      ],
    };
  }

  const rows = await prisma.contribution.findMany({
    where,
    select: {
      id: true,
      type: true,
      targetId: true,
      data: true,
      contributorId: true,
      submittedAt: true,
      escalatedAt: true,
      escalationNote: true,
      contributor: { select: { username: true, name: true, publicHandle: true, deletedAt: true, role: true } },
    },
    orderBy: { submittedAt: 'asc' },
    take: 500,
  });

  const idsOf = (t: ContributionType) => rows.filter((r) => r.type === t && r.targetId).map((r) => r.targetId!);
  const [lessons, courses, chapters, entries] = await Promise.all([
    prisma.lesson.findMany({
      where: { id: { in: idsOf('EDIT_LESSON_CONTENT') } },
      select: { id: true, name: true, courseId: true, course: { select: { name: true } } },
    }),
    prisma.course.findMany({ where: { id: { in: idsOf('EDIT_COURSE') } }, select: { id: true, name: true } }),
    prisma.chapter.findMany({ where: { id: { in: idsOf('EDIT_CHAPTER_CONTENT') } }, select: { id: true, title: true } }),
    prisma.libraryEntry.findMany({ where: { id: { in: idsOf('EDIT_LIBRARY_ENTRY') } }, select: { id: true, title: true } }),
  ]);
  const lessonById = new Map(lessons.map((l) => [l.id, l]));
  const courseById = new Map(courses.map((c) => [c.id, c]));
  const chapterById = new Map(chapters.map((c) => [c.id, c]));
  const entryById = new Map(entries.map((e) => [e.id, e]));

  const items: ReviewQueueItem[] = rows.map((r) => {
    let title = dataName(r.data) ?? 'Chưa đặt tên';
    let courseId: string | null = null;
    let courseName: string | null = null;
    if (r.type === 'EDIT_LESSON_CONTENT' && r.targetId) {
      const l = lessonById.get(r.targetId);
      title = l?.name ?? '(bài học đã bị xóa)';
      courseId = l?.courseId ?? null;
      courseName = l?.course.name ?? null;
    } else if (r.type === 'EDIT_COURSE' && r.targetId) {
      const c = courseById.get(r.targetId);
      title = c?.name ?? '(khóa học đã bị xóa)';
      courseId = c?.id ?? null;
      courseName = c?.name ?? null;
    } else if (r.type === 'EDIT_CHAPTER_CONTENT' && r.targetId) {
      title = chapterById.get(r.targetId)?.title ?? '(chương đã bị xóa)';
    } else if (r.type === 'EDIT_LIBRARY_ENTRY' && r.targetId) {
      title = entryById.get(r.targetId)?.title ?? '(mục thư viện đã bị xóa)';
    }
    return {
      id: r.id,
      type: r.type,
      typeLabel: contributionTypeLabel(r.type),
      title,
      courseId,
      courseName,
      contributorName: staffName(r.contributor),
      trustedAuthor: r.contributor.role === 'TRUSTED_AUTHOR',
      own: r.contributorId === viewer.id,
      submittedAt: r.submittedAt,
      escalatedAt: r.escalatedAt,
      escalationNote: r.escalationNote,
    };
  });

  const isAdmin = viewer.role === 'ADMIN';
  items.sort((a, b) => {
    if (isAdmin) {
      const ea = a.escalatedAt ? 0 : 1;
      const eb = b.escalatedAt ? 0 : 1;
      if (ea !== eb) return ea - eb;
    }
    const ta = a.trustedAuthor ? 0 : 1;
    const tb = b.trustedAuthor ? 0 : 1;
    if (ta !== tb) return ta - tb;
    return (a.submittedAt?.getTime() ?? 0) - (b.submittedAt?.getTime() ?? 0);
  });

  return { scope: global ? 'ALL' : 'COURSES', items, courses: global ? [] : await courseNames(scopeIds) };
}

async function courseNames(ids: string[]): Promise<{ id: string; name: string }[]> {
  if (!ids.length) return [];
  return prisma.course.findMany({ where: { id: { in: ids } }, select: { id: true, name: true }, orderBy: { name: 'asc' } });
}
