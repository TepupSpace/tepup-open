import type { CourseRole, DiscussionTarget, Notification, NotificationKind, ReviewAction } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { staffName } from '@/lib/credit';
import { canReviewContent } from '@/lib/role-utils';
import { canOnCourse, type CourseAction, type Viewer } from '@/lib/permissions/course-roles';
import { threadTargetHref } from '@/lib/services/discussion-service';

/**
 * Renders inbox rows (proposal §6.16). Notifications store no content: the text is built here,
 * at read time, from the CURRENT data, and every entry whose target the viewer can no longer
 * see is dropped. Names of hidden lessons/chapters/entries/courses only appear when the viewer
 * may see them.
 *
 * Queries are batched per target table (one findMany each), plus one memoised canOnCourse per
 * distinct (course, action) — a page holds at most a few dozen rows.
 */

export interface RenderedNotification {
  id: string;
  kind: NotificationKind;
  text: string;
  href: string;
  createdAt: string;
  read: boolean;
}

export interface RenderOptions {
  /** Admins go to admin screens where one exists (course members). */
  isAdmin?: boolean;
}

type Row = Pick<Notification, 'id' | 'kind' | 'targetType' | 'targetId' | 'actorId' | 'createdAt' | 'readAt'>;

const ROLE_LABEL: Record<CourseRole, string> = {
  COURSE_LEAD: 'trưởng khóa học',
  TRUSTED_REVIEWER: 'người duyệt tin cậy',
};

const q = (s: string) => `“${s}”`;

export async function renderNotifications(
  rows: Row[],
  viewer: Viewer,
  opts: RenderOptions = {}
): Promise<RenderedNotification[]> {
  if (!rows.length) return [];
  const isGlobalReviewer = canReviewContent(viewer.role);

  // ── 1. First hop: threads and suggestions point at other targets ──────────────────────
  const idsOf = (type: string) => [...new Set(rows.filter((r) => r.targetType === type).map((r) => r.targetId))];

  const [threads, suggestions] = await Promise.all([
    idsOf('THREAD').length
      ? prisma.discussionThread.findMany({
          where: { id: { in: idsOf('THREAD') } },
          select: { id: true, targetType: true, targetId: true },
        })
      : [],
    idsOf('SUGGESTION').length
      ? prisma.suggestion.findMany({
          where: { id: { in: idsOf('SUGGESTION') } },
          select: { id: true, targetType: true, targetId: true },
        })
      : [],
  ]);
  const threadMap = new Map(threads.map((t) => [t.id, t]));
  const suggestionMap = new Map(suggestions.map((s) => [s.id, s]));

  const lessonIds = new Set(idsOf('LESSON'));
  const chapterIds = new Set<string>();
  const entryIds = new Set<string>();
  const courseIds = new Set(idsOf('COURSE'));
  const contributionIds = new Set(idsOf('CONTRIBUTION'));
  const requestIds = new Set(idsOf('REVIEW_REQUEST'));

  const addDiscussionTarget = (type: DiscussionTarget, id: string) => {
    if (type === 'LESSON') lessonIds.add(id);
    else if (type === 'CHAPTER') chapterIds.add(id);
    else if (type === 'LIBRARY_ENTRY') entryIds.add(id);
    else if (type === 'CONTRIBUTION') contributionIds.add(id);
    else if (type === 'REVIEW_REQUEST') requestIds.add(id);
  };
  for (const t of threads) addDiscussionTarget(t.targetType, t.targetId);
  for (const s of suggestions) {
    if (s.targetType === 'LESSON') lessonIds.add(s.targetId);
    else if (s.targetType === 'CHAPTER') chapterIds.add(s.targetId);
    else if (s.targetType === 'LIBRARY_ENTRY') entryIds.add(s.targetId);
    else {
      // NEW_ENTRY: a lesson id, a chapter id or 'thu-vien'.
      lessonIds.add(s.targetId);
      chapterIds.add(s.targetId);
    }
  }

  // ── 2. Second hop: contributions and review requests point at content ─────────────────
  const [contributions, requests] = await Promise.all([
    contributionIds.size
      ? prisma.contribution.findMany({
          where: { id: { in: [...contributionIds] } },
          select: {
            id: true,
            type: true,
            targetId: true,
            contributorId: true,
            data: true,
            reviews: { orderBy: { createdAt: 'desc' }, take: 1, select: { action: true } },
          },
        })
      : [],
    requestIds.size
      ? prisma.reviewRequest.findMany({
          where: { id: { in: [...requestIds] } },
          select: { id: true, courseId: true, title: true, requestedById: true, reviewers: { select: { userId: true } } },
        })
      : [],
  ]);
  const contributionMap = new Map(contributions.map((c) => [c.id, c]));
  const requestMap = new Map(requests.map((r) => [r.id, r]));
  for (const c of contributions) {
    if (!c.targetId) continue;
    if (c.type === 'EDIT_LESSON_CONTENT') lessonIds.add(c.targetId);
    else if (c.type === 'EDIT_CHAPTER_CONTENT') chapterIds.add(c.targetId);
    else if (c.type === 'EDIT_LIBRARY_ENTRY') entryIds.add(c.targetId);
    else if (c.type === 'EDIT_COURSE') courseIds.add(c.targetId);
  }

  // ── 3. Content rows, actors and the viewer's course roles ─────────────────────────────
  const actorIds = [...new Set(rows.map((r) => r.actorId).filter((x): x is string => !!x))];
  const [lessons, chapters, entries, courses, actors, memberships] = await Promise.all([
    lessonIds.size
      ? prisma.lesson.findMany({
          where: { id: { in: [...lessonIds] } },
          select: { id: true, name: true, isActive: true, courseId: true, course: { select: { isActive: true } } },
        })
      : [],
    chapterIds.size
      ? prisma.chapter.findMany({
          where: { id: { in: [...chapterIds] } },
          select: {
            id: true,
            title: true,
            isActive: true,
            story: { select: { isActive: true, character: { select: { isActive: true } } } },
          },
        })
      : [],
    entryIds.size
      ? prisma.libraryEntry.findMany({
          where: { id: { in: [...entryIds] } },
          select: { id: true, title: true, isActive: true },
        })
      : [],
    courseIds.size
      ? prisma.course.findMany({ where: { id: { in: [...courseIds] } }, select: { id: true, name: true, isActive: true } })
      : [],
    actorIds.length
      ? prisma.user.findMany({
          where: { id: { in: actorIds } },
          select: { id: true, username: true, name: true, publicHandle: true, deletedAt: true },
        })
      : [],
    courseIds.size
      ? prisma.courseMember.findMany({
          where: { userId: viewer.id, courseId: { in: [...courseIds] } },
          select: { courseId: true, role: true },
        })
      : [],
  ]);
  const lessonMap = new Map(lessons.map((l) => [l.id, l]));
  const chapterMap = new Map(chapters.map((c) => [c.id, c]));
  const entryMap = new Map(entries.map((e) => [e.id, e]));
  const courseMap = new Map(courses.map((c) => [c.id, c]));
  const actorMap = new Map(actors.map((a) => [a.id, a]));
  const roleMap = new Map(memberships.map((m) => [m.courseId, m.role]));

  // ── 4. Visibility (same rules as content-service / course-roles, memoised) ────────────
  const canMemo = new Map<string, Promise<boolean>>();
  const can = (courseId: string, action: CourseAction) => {
    const key = `${courseId}:${action}`;
    let p = canMemo.get(key);
    if (!p) {
      p = canOnCourse(viewer, courseId, action);
      canMemo.set(key, p);
    }
    return p;
  };

  const lessonVisible = async (id: string) => {
    const l = lessonMap.get(id);
    if (!l) return false;
    return (l.isActive && l.course.isActive) || can(l.courseId, 'SEE_HIDDEN');
  };
  const chapterVisible = (id: string) => {
    const c = chapterMap.get(id);
    if (!c) return false;
    return (c.isActive && c.story.isActive && c.story.character.isActive) || isGlobalReviewer;
  };
  const entryVisible = (id: string) => {
    const e = entryMap.get(id);
    if (!e) return false;
    return e.isActive || isGlobalReviewer;
  };
  const courseVisible = async (id: string) => {
    const c = courseMap.get(id);
    if (!c) return false;
    return c.isActive || can(c.id, 'SEE_HIDDEN');
  };
  /** Mirrors canViewContributionForReview + ownership, without one lesson query per row. */
  const contributionVisible = async (id: string) => {
    const c = contributionMap.get(id);
    if (!c) return false;
    if (c.contributorId === viewer.id || isGlobalReviewer) return true;
    let courseId: string | null = null;
    if (c.type === 'EDIT_LESSON_CONTENT' && c.targetId) courseId = lessonMap.get(c.targetId)?.courseId ?? null;
    else if (c.type === 'EDIT_COURSE') courseId = c.targetId;
    return courseId ? can(courseId, 'REVIEW_PROPOSAL') : false;
  };
  /** Same rule as the request page and its thread (canViewReviewRequest): admin or READ_HISTORY now. */
  const requestVisible = async (id: string) => {
    const r = requestMap.get(id);
    if (!r) return false;
    if (viewer.role === 'ADMIN') return true;
    return can(r.courseId, 'READ_HISTORY');
  };
  const discussionTargetVisible = (type: DiscussionTarget, id: string): Promise<boolean> | boolean => {
    switch (type) {
      case 'LESSON':
        return lessonVisible(id);
      case 'CHAPTER':
        return chapterVisible(id);
      case 'LIBRARY_ENTRY':
        return entryVisible(id);
      case 'CONTRIBUTION':
        return contributionVisible(id);
      case 'REVIEW_REQUEST':
        return requestVisible(id);
    }
  };

  // ── 5. Labels (names only when visible) ───────────────────────────────────────────────
  const lessonLabel = async (id: string) =>
    (await lessonVisible(id)) ? `bài ${q(lessonMap.get(id)!.name)}` : 'một bài học';
  const chapterLabel = (id: string) => (chapterVisible(id) ? `chương ${q(chapterMap.get(id)!.title)}` : 'một chương truyện');
  const entryLabel = (id: string) => (entryVisible(id) ? `mục thư viện ${q(entryMap.get(id)!.title)}` : 'một mục thư viện');
  const courseLabel = async (id: string) =>
    (await courseVisible(id)) ? `khóa ${q(courseMap.get(id)!.name)}` : 'một khóa học';

  const contributionLabel = async (id: string): Promise<string> => {
    const c = contributionMap.get(id)!;
    switch (c.type) {
      case 'NEW_COURSE': {
        const data = c.data as { course?: { name?: unknown } } | null;
        const name = typeof data?.course?.name === 'string' ? data.course.name.trim() : '';
        return name ? `đề xuất khóa học mới ${q(name)}` : 'đề xuất khóa học mới';
      }
      case 'NEW_LEVEL':
        return 'đề xuất cấp độ mới';
      case 'NEW_LESSON':
        return 'đề xuất bài học mới';
      case 'EDIT_LESSON_CONTENT':
        return c.targetId ? `đề xuất sửa ${await lessonLabel(c.targetId)}` : 'đề xuất sửa bài học';
      case 'EDIT_COURSE':
        return c.targetId ? `đề xuất sửa dàn ý ${await courseLabel(c.targetId)}` : 'đề xuất sửa khóa học';
      case 'EDIT_CHAPTER_CONTENT':
        return c.targetId ? `đề xuất sửa ${chapterLabel(c.targetId)}` : 'đề xuất sửa chương truyện';
      case 'EDIT_LIBRARY_ENTRY':
        return c.targetId ? `đề xuất sửa ${entryLabel(c.targetId)}` : 'đề xuất sửa mục thư viện';
      default:
        return 'một đề xuất';
    }
  };
  const requestLabel = (id: string) => `yêu cầu duyệt bài ${q(requestMap.get(id)!.title)}`;
  const discussionTargetLabel = async (type: DiscussionTarget, id: string): Promise<string> => {
    switch (type) {
      case 'LESSON':
        return lessonLabel(id);
      case 'CHAPTER':
        return chapterLabel(id);
      case 'LIBRARY_ENTRY':
        return entryLabel(id);
      case 'CONTRIBUTION':
        return contributionLabel(id);
      case 'REVIEW_REQUEST':
        return requestLabel(id);
    }
  };

  const actorName = (id: string | null) => {
    if (!id) return 'Hệ thống';
    const a = actorMap.get(id);
    return a ? staffName(a) : 'Một tài khoản đã xóa';
  };

  const contributionHref = (id: string) =>
    threadTargetHref('CONTRIBUTION', id, { viewerIsAuthor: contributionMap.get(id)?.contributorId === viewer.id });
  const courseHref = (id: string) =>
    opts.isAdmin || viewer.role === 'ADMIN' ? `/admin/courses/${id}/members` : `/contributor/maintain/${id}`;

  // ── 6. Build each entry; null = drop ──────────────────────────────────────────────────
  const out: RenderedNotification[] = [];
  for (const r of rows) {
    const actor = actorName(r.actorId);
    let text: string | null = null;
    let href: string | null = null;

    switch (r.targetType) {
      case 'CONTRIBUTION': {
        if (!(await contributionVisible(r.targetId))) break;
        const c = contributionMap.get(r.targetId)!;
        const label = await contributionLabel(r.targetId);
        const mine = c.contributorId === viewer.id ? ' của bạn' : '';
        href = contributionHref(r.targetId);
        if (r.kind === 'CONTRIBUTION_DECIDED') {
          const action: ReviewAction | undefined = c.reviews[0]?.action;
          text =
            action === 'APPROVED'
              ? `${actor} đã duyệt ${label}${mine}.`
              : action === 'REJECTED'
                ? `${actor} đã từ chối ${label}${mine}.`
                : action === 'CHANGES_REQUESTED'
                  ? `${actor} yêu cầu chỉnh sửa ${label}${mine}.`
                  : `${capitalise(label)}${mine} đã có quyết định.`;
        } else if (r.kind === 'CONTRIBUTION_SUBMITTED') {
          text = `${actor} đã gửi ${label} chờ duyệt.`;
        } else if (r.kind === 'ESCALATED') {
          text = `${actor} đã chuyển ${label} cho quản trị viên quyết định.`;
        } else {
          text = `Có cập nhật về ${label}${mine}.`;
        }
        break;
      }
      case 'REVIEW_REQUEST': {
        if (!(await requestVisible(r.targetId))) break;
        const label = requestLabel(r.targetId);
        href = `/contributor/review-requests/${r.targetId}`;
        if (r.kind === 'REVIEW_REQUESTED') text = `${actor} gửi bạn ${label}.`;
        else if (r.kind === 'REVIEW_OPINION') text = `${actor} đã cho ý kiến về ${label}.`;
        else if (r.kind === 'ESCALATED') text = `${actor} đã chuyển ${label} cho quản trị viên quyết định.`;
        else text = `Có cập nhật về ${label}.`;
        break;
      }
      case 'LESSON': {
        if (!(await lessonVisible(r.targetId))) break;
        const label = await lessonLabel(r.targetId);
        href = `/contributor/lessons/${r.targetId}`;
        if (r.kind === 'FLAG_CHANGED') text = `${actor} đã cập nhật nhãn bảo trì của ${label}.`;
        else if (r.kind === 'ESCALATED') text = `${actor} đã chuyển một việc về ${label} cho quản trị viên.`;
        else text = `Có cập nhật về ${label}.`;
        break;
      }
      case 'COURSE': {
        if (!(await courseVisible(r.targetId))) break;
        const label = await courseLabel(r.targetId);
        href = courseHref(r.targetId);
        if (r.kind === 'COURSE_ROLE_GRANTED') {
          const role = roleMap.get(r.targetId);
          text = role
            ? `${actor} đã giao cho bạn vai trò ${ROLE_LABEL[role]} của ${label}.`
            : `${actor} đã giao cho bạn một vai trò trong ${label} (vai trò này không còn).`;
        } else if (r.kind === 'COURSE_ORPHANED') {
          text = `${capitalise(label)} không còn trưởng khóa học nào.`;
        } else {
          text = `Có cập nhật về ${label}.`;
        }
        break;
      }
      case 'THREAD': {
        const t = threadMap.get(r.targetId);
        if (!t || !(await discussionTargetVisible(t.targetType, t.targetId))) break;
        const label = await discussionTargetLabel(t.targetType, t.targetId);
        href = threadTargetHref(t.targetType, t.targetId, {
          viewerIsAuthor: t.targetType === 'CONTRIBUTION' && contributionMap.get(t.targetId)?.contributorId === viewer.id,
        });
        text =
          r.kind === 'COMMENT'
            ? `${actor} đã bình luận trong thảo luận về ${label}.`
            : `Có cập nhật trong thảo luận về ${label}.`;
        break;
      }
      case 'SUGGESTION': {
        const s = suggestionMap.get(r.targetId);
        if (!s) break;
        let visible: boolean;
        if (s.targetType === 'LESSON') visible = await lessonVisible(s.targetId);
        else if (s.targetType === 'CHAPTER') visible = chapterVisible(s.targetId);
        else if (s.targetType === 'LIBRARY_ENTRY') visible = entryVisible(s.targetId);
        else if (lessonMap.has(s.targetId)) visible = await lessonVisible(s.targetId);
        else if (chapterMap.has(s.targetId)) visible = chapterVisible(s.targetId);
        else visible = true; // NEW_ENTRY from the library itself
        if (!visible) break;
        href = '/contributor/suggestions';
        text = r.actorId
          ? `${actor} đã cập nhật một góp ý của người đọc.`
          : 'Một góp ý của người đọc bạn đã nhận làm vừa có thay đổi.';
        break;
      }
      default:
        break;
    }

    if (text && href) {
      out.push({
        id: r.id,
        kind: r.kind,
        text,
        href,
        createdAt: r.createdAt.toISOString(),
        read: !!r.readAt,
      });
    }
  }
  return out;
}

function capitalise(s: string): string {
  return s.charAt(0).toLocaleUpperCase('vi') + s.slice(1);
}

/** Unread rows looked at for the badge; more than this shows as "99+". */
export const UNREAD_SCAN_LIMIT = 100;

/** Unread notifications the viewer can still see (dropped ones don't count). */
export async function countVisibleUnread(viewer: Viewer, opts: RenderOptions = {}): Promise<number> {
  const rows = await prisma.notification.findMany({
    where: { userId: viewer.id, readAt: null },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: UNREAD_SCAN_LIMIT,
    select: { id: true, kind: true, targetType: true, targetId: true, actorId: true, createdAt: true, readAt: true },
  });
  return (await renderNotifications(rows, viewer, opts)).length;
}
