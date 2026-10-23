import type { Contribution, Prisma, UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { canReviewContent, isContributorOrAbove } from '@/lib/role-utils';
import { canOnCourse, isBlockedOnCourse } from '@/lib/permissions/course-roles';
import { prepareContributionData } from '@/lib/ai-import/normalize';
import { contentErrorBody, validateContributionData } from '@/lib/schemas/content-validation';
import { entryProposalSnapshot } from '@/lib/schemas/contribution-types/library-entry';
import type { EntryType } from '@/lib/library/schemas';
import { buildOutline, outlineHash } from '@/lib/services/outline-service';
import { isOutlineBaseSnapshot, startOutlineProposal } from '@/lib/services/outline-proposal';
import { isStale } from '@/lib/services/publishers/types';
import { rateLimit, refundRateLimit, retryAfterMinutes } from '@/lib/security/rate-limit';

/**
 * Creating edit proposals (proposal §6.2) and reading their targets.
 *
 * Checks, in order: the target exists AND the user may see it (else 404 — never reveal
 * hidden targets), the user is not blocked on the target's course (403), one open proposal
 * per user per target (409 with existingId), the open-proposal cap and the hourly rate limit
 * (429). Licence consent is checked at submit. The server snapshots the live version into
 * `baseSnapshot`/`baseUpdatedAt`; `data` starts from the live version when none is given.
 *
 * Visibility (proposal §5, BRIEF "Hidden content rule"):
 *  - lesson: lesson and course active, else canOnCourse(SEE_HIDDEN) (same as the staff view);
 *  - chapter: chapter, story and character active, else global reviewers only;
 *  - library entry: isActive, else global reviewers only;
 *  - course outline: course active and no hidden lessons, else canOnCourse(SEE_HIDDEN).
 */
export type ProposalTargetType = 'EDIT_LESSON_CONTENT' | 'EDIT_CHAPTER_CONTENT' | 'EDIT_LIBRARY_ENTRY' | 'EDIT_COURSE';

export const EDIT_PROPOSAL_TYPES: readonly ProposalTargetType[] = [
  'EDIT_LESSON_CONTENT',
  'EDIT_CHAPTER_CONTENT',
  'EDIT_LIBRARY_ENTRY',
  'EDIT_COURSE',
];

export function isEditProposalType(t: unknown): t is ProposalTargetType {
  return typeof t === 'string' && (EDIT_PROPOSAL_TYPES as readonly string[]).includes(t);
}

/** "Open" = still the author's or the reviewers' business. */
export const OPEN_PROPOSAL_STATUSES = ['DRAFT', 'PENDING_REVIEW', 'CHANGES_REQUESTED'] as const;

/** Open edit proposals per user (proposal §6.4): one constant, both tiers. */
export const PROPOSAL_CAPS = { AUTHOR: 10, TRUSTED_AND_ABOVE: 30 } as const;

export function proposalCap(role: UserRole): number {
  return role === 'AUTHOR' || role === 'LEARNER' ? PROPOSAL_CAPS.AUTHOR : PROPOSAL_CAPS.TRUSTED_AND_ABOVE;
}

/** New proposals per user per hour (proposal §6.20), in memory like the other limits. */
export const PROPOSAL_RATE_LIMIT = { scope: 'edit-proposal', limit: 10, windowMs: 60 * 60 * 1000 } as const;

export type CreateProposalResult =
  | { ok: true; contribution: Contribution }
  | { ok: false; status: 400 | 403 | 404 | 409 | 422 | 429; error: string; existingId?: string; details?: unknown };

interface Viewer {
  id: string;
  role: UserRole;
}

// ---------------------------------------------------------------------------------------
// Live targets
// ---------------------------------------------------------------------------------------

export interface LiveTarget {
  type: ProposalTargetType;
  id: string;
  /** Lesson name, chapter title, entry title or course name. */
  name: string;
  /** Where the content is read (public URL; signed-in staff get the staff view there). */
  href: string;
  /** Contributor hub for the target. */
  hubHref: string;
  /** Course of a lesson or outline (blocks, notifications); null for chapters and entries. */
  courseId: string | null;
  /** Hidden from learners. */
  hidden: boolean;
  /**
   * The live version in the proposal's base shape: `{title, blocks}` (lesson, chapter), the
   * entry's contributor-editable subset, or `{outline, hash}` (course, like outline-proposal.ts).
   */
  snapshot: unknown;
  /** updatedAt of the live content (null: none yet). Always null for outlines (hash instead). */
  updatedAt: Date | null;
  /** Course outlines: hash of the live outline. */
  hash?: string;
  /** Library entries: the entry's type (the editor shows the fields of that type). */
  entryType?: EntryType;
}

/** The target as `viewer` may see it now, or null (missing OR hidden from them). */
export async function getLiveTarget(viewer: Viewer, type: string, targetId: string | null): Promise<LiveTarget | null> {
  if (!targetId || !isContributorOrAbove(viewer.role)) return null;

  if (type === 'EDIT_LESSON_CONTENT') {
    const lesson = await prisma.lesson.findUnique({
      where: { id: targetId },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        courseId: true,
        course: { select: { isActive: true, slug: true } },
        content: { select: { title: true, blocks: true, updatedAt: true } },
      },
    });
    if (!lesson) return null;
    const hidden = !lesson.isActive || !lesson.course.isActive;
    if (hidden && !(await canOnCourse(viewer, lesson.courseId, 'SEE_HIDDEN'))) return null;
    return {
      type,
      id: lesson.id,
      name: lesson.name,
      href: `/courses/${lesson.course.slug}/${lesson.slug}`,
      hubHref: `/contributor/lessons/${lesson.id}`,
      courseId: lesson.courseId,
      hidden,
      snapshot: { title: lesson.content?.title ?? lesson.name, blocks: lesson.content?.blocks ?? [] },
      updatedAt: lesson.content?.updatedAt ?? null,
    };
  }

  if (type === 'EDIT_CHAPTER_CONTENT') {
    const chapter = await prisma.chapter.findUnique({
      where: { id: targetId },
      select: {
        id: true,
        title: true,
        slug: true,
        isActive: true,
        story: { select: { slug: true, isActive: true, character: { select: { slug: true, isActive: true } } } },
        content: { select: { title: true, blocks: true, updatedAt: true } },
      },
    });
    if (!chapter) return null;
    const hidden = !chapter.isActive || !chapter.story.isActive || !chapter.story.character.isActive;
    if (hidden && !canReviewContent(viewer.role)) return null;
    return {
      type,
      id: chapter.id,
      name: chapter.title,
      href: `/story/${chapter.story.character.slug}/${chapter.story.slug}/${chapter.slug}`,
      hubHref: `/contributor/chapters/${chapter.id}`,
      courseId: null,
      hidden,
      snapshot: { title: chapter.content?.title ?? chapter.title, blocks: chapter.content?.blocks ?? [] },
      updatedAt: chapter.content?.updatedAt ?? null,
    };
  }

  if (type === 'EDIT_LIBRARY_ENTRY') {
    const entry = await prisma.libraryEntry.findUnique({
      where: { id: targetId },
      include: { linksFrom: { select: { toId: true, kind: true, order: true } } },
    });
    if (!entry) return null;
    if (!entry.isActive && !canReviewContent(viewer.role)) return null;
    return {
      type,
      id: entry.id,
      name: entry.title,
      href: `/thu-vien/muc/${entry.slug}`,
      hubHref: `/contributor/library/${entry.id}`,
      courseId: null,
      hidden: !entry.isActive,
      snapshot: entryProposalSnapshot(entry),
      updatedAt: entry.updatedAt,
      entryType: entry.type as EntryType,
    };
  }

  if (type === 'EDIT_COURSE') {
    const course = await prisma.course.findUnique({
      where: { id: targetId },
      select: { id: true, name: true, slug: true, isActive: true },
    });
    if (!course) return null;
    const seeHidden = await canOnCourse(viewer, course.id, 'SEE_HIDDEN');
    if (!course.isActive && !seeHidden) return null;
    const outline = await buildOutline(prisma, course.id);
    if (!outline) return null;
    // An outline lists every lesson, hidden ones included: without SEE_HIDDEN the whole
    // outline is off limits (same neutral null/404 as a hidden course, so every caller —
    // create, rebase, detail GET, review views — neither returns nor stores hidden names).
    if (!seeHidden && outline.lessons.some((l) => !l.isActive)) return null;
    const hash = outlineHash(outline);
    return {
      type,
      id: course.id,
      name: course.name,
      href: `/courses/${course.slug}`,
      hubHref: `/contributor/courses#course-${course.id}`,
      courseId: course.id,
      hidden: !course.isActive,
      snapshot: { outline, hash },
      updatedAt: null,
      hash,
    };
  }

  return null;
}

/** Has the live target changed since the proposal's base? */
export function isProposalStale(
  c: { type: string; baseUpdatedAt: Date | null; baseSnapshot: unknown },
  live: Pick<LiveTarget, 'updatedAt' | 'hash'>
): boolean {
  if (c.type === 'EDIT_COURSE') {
    return !isOutlineBaseSnapshot(c.baseSnapshot) || c.baseSnapshot.hash !== live.hash;
  }
  return isStale(live.updatedAt, c.baseUpdatedAt);
}

/** The user's open proposal for a target, if any. */
export async function findOpenProposal(userId: string, type: ProposalTargetType, targetId: string) {
  return prisma.contribution.findFirst({
    where: { contributorId: userId, type, targetId, status: { in: [...OPEN_PROPOSAL_STATUSES] } },
    select: { id: true, status: true, updatedAt: true },
  });
}

// ---------------------------------------------------------------------------------------
// Names and "Bài đã thay đổi" for lists
// ---------------------------------------------------------------------------------------

export interface ProposalTargetInfo {
  /** Target name, or a neutral label when the viewer can no longer see it. */
  name: string;
  visible: boolean;
  hubHref: string | null;
  href: string | null;
  /** Open proposals only: the live target changed since the base. */
  stale: boolean;
}

/**
 * Names, links and the stale flag of many edit proposals at once (drafts, submissions,
 * dashboard, cap messages). Targets the viewer can't see now get a neutral name, so a hidden
 * lesson's name doesn't leak after access was lost.
 */
export async function describeProposalTargets(
  viewer: Viewer,
  items: { id: string; type: string; status: string; targetId: string | null; baseUpdatedAt: Date | null; baseSnapshot: unknown }[]
): Promise<Map<string, ProposalTargetInfo>> {
  const out = new Map<string, ProposalTargetInfo>();
  const edits = items.filter((c) => isEditProposalType(c.type) && c.targetId);
  if (!edits.length) return out;
  const idsOf = (t: ProposalTargetType) => [...new Set(edits.filter((c) => c.type === t).map((c) => c.targetId!))];

  const [lessons, chapters, entries, courses] = await Promise.all([
    idsOf('EDIT_LESSON_CONTENT').length
      ? prisma.lesson.findMany({
          where: { id: { in: idsOf('EDIT_LESSON_CONTENT') } },
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
            courseId: true,
            course: { select: { slug: true, isActive: true } },
            content: { select: { updatedAt: true } },
          },
        })
      : [],
    idsOf('EDIT_CHAPTER_CONTENT').length
      ? prisma.chapter.findMany({
          where: { id: { in: idsOf('EDIT_CHAPTER_CONTENT') } },
          select: {
            id: true,
            title: true,
            slug: true,
            isActive: true,
            story: { select: { slug: true, isActive: true, character: { select: { slug: true, isActive: true } } } },
            content: { select: { updatedAt: true } },
          },
        })
      : [],
    idsOf('EDIT_LIBRARY_ENTRY').length
      ? prisma.libraryEntry.findMany({
          where: { id: { in: idsOf('EDIT_LIBRARY_ENTRY') } },
          select: { id: true, title: true, slug: true, isActive: true, updatedAt: true },
        })
      : [],
    idsOf('EDIT_COURSE').length
      ? prisma.course.findMany({
          where: { id: { in: idsOf('EDIT_COURSE') } },
          select: { id: true, name: true, slug: true, isActive: true },
        })
      : [],
  ]);

  const seeHidden = new Map<string, Promise<boolean>>();
  const maySeeCourse = (courseId: string) => {
    if (!seeHidden.has(courseId)) seeHidden.set(courseId, canOnCourse(viewer, courseId, 'SEE_HIDDEN'));
    return seeHidden.get(courseId)!;
  };
  const globalReviewer = canReviewContent(viewer.role);
  const hashes = new Map<string, Promise<string | null>>();
  const liveHash = (courseId: string) => {
    if (!hashes.has(courseId)) {
      hashes.set(
        courseId,
        buildOutline(prisma, courseId).then((o) => (o ? outlineHash(o) : null))
      );
    }
    return hashes.get(courseId)!;
  };

  const lessonById = new Map(lessons.map((l) => [l.id, l]));
  const chapterById = new Map(chapters.map((c) => [c.id, c]));
  const entryById = new Map(entries.map((e) => [e.id, e]));
  const courseById = new Map(courses.map((c) => [c.id, c]));
  const hiddenName = 'Nội dung không còn xem được';

  for (const c of edits) {
    const open = (OPEN_PROPOSAL_STATUSES as readonly string[]).includes(c.status);
    let info: ProposalTargetInfo = { name: hiddenName, visible: false, hubHref: null, href: null, stale: false };
    if (c.type === 'EDIT_LESSON_CONTENT') {
      const l = lessonById.get(c.targetId!);
      const hidden = l && (!l.isActive || !l.course.isActive);
      if (l && (!hidden || (await maySeeCourse(l.courseId)))) {
        info = {
          name: l.name,
          visible: true,
          hubHref: `/contributor/lessons/${l.id}`,
          href: `/courses/${l.course.slug}/${l.slug}`,
          stale: open && isStale(l.content?.updatedAt ?? null, c.baseUpdatedAt),
        };
      }
    } else if (c.type === 'EDIT_CHAPTER_CONTENT') {
      const ch = chapterById.get(c.targetId!);
      const hidden = ch && (!ch.isActive || !ch.story.isActive || !ch.story.character.isActive);
      if (ch && (!hidden || globalReviewer)) {
        info = {
          name: ch.title,
          visible: true,
          hubHref: `/contributor/chapters/${ch.id}`,
          href: `/story/${ch.story.character.slug}/${ch.story.slug}/${ch.slug}`,
          stale: open && isStale(ch.content?.updatedAt ?? null, c.baseUpdatedAt),
        };
      }
    } else if (c.type === 'EDIT_LIBRARY_ENTRY') {
      const e = entryById.get(c.targetId!);
      if (e && (e.isActive || globalReviewer)) {
        info = {
          name: e.title,
          visible: true,
          hubHref: `/contributor/library/${e.id}`,
          href: `/thu-vien/muc/${e.slug}`,
          stale: open && isStale(e.updatedAt, c.baseUpdatedAt),
        };
      }
    } else if (c.type === 'EDIT_COURSE') {
      const k = courseById.get(c.targetId!);
      if (k && (k.isActive || (await maySeeCourse(k.id)))) {
        const hash = open ? await liveHash(k.id) : null;
        info = {
          name: `Mục lục: ${k.name}`,
          visible: true,
          hubHref: `/contributor/courses#course-${k.id}`,
          href: `/courses/${k.slug}`,
          stale: open && (!isOutlineBaseSnapshot(c.baseSnapshot) || c.baseSnapshot.hash !== hash),
        };
      }
    }
    out.set(c.id, info);
  }
  return out;
}

// ---------------------------------------------------------------------------------------
// Creating
// ---------------------------------------------------------------------------------------

export async function createEditProposal(
  user: { id: string; role: UserRole },
  input: {
    type: ProposalTargetType;
    targetId: string;
    /** Optional starting data; default = the live version. */
    data?: unknown;
    message?: string | null;
    /** Set when created from a claimed reader suggestion. */
    suggestionId?: string | null;
  }
): Promise<CreateProposalResult> {
  const { type, targetId } = input;
  if (!isEditProposalType(type)) return { ok: false, status: 400, error: 'Loại đề xuất không hợp lệ' };
  if (typeof targetId !== 'string' || !targetId || targetId.length > 64) {
    return { ok: false, status: 400, error: 'Thiếu nội dung cần sửa' };
  }

  // Rate limit first (cheap). The slot is taken now, synchronously, so parallel requests
  // can't all pass before any is counted; it's given back when no proposal gets created.
  const { scope, limit, windowMs } = PROPOSAL_RATE_LIMIT;
  const rate = rateLimit(scope, user.id, limit, windowMs);
  if (!rate.ok) {
    refundRateLimit(scope, user.id);
    return {
      ok: false,
      status: 429,
      error: `Bạn đã tạo ${limit} đề xuất trong một giờ qua. Hãy thử lại sau ${retryAfterMinutes(rate.retryAfterSeconds)} phút.`,
    };
  }
  let result: CreateProposalResult | undefined;
  try {
    result = await createEditProposalUnlimited(user, input, type, targetId);
    return result;
  } finally {
    if (!result?.ok) refundRateLimit(scope, user.id);
  }
}

async function createEditProposalUnlimited(
  user: { id: string; role: UserRole },
  input: Parameters<typeof createEditProposal>[1],
  type: ProposalTargetType,
  targetId: string
): Promise<CreateProposalResult> {
  // 404 for a missing target AND for one hidden from this user.
  const live = await getLiveTarget(user, type, targetId);
  if (!live) return { ok: false, status: 404, error: 'Không tìm thấy nội dung cần sửa' };

  if (live.courseId && (await isBlockedOnCourse(live.courseId, user.id))) {
    return { ok: false, status: 403, error: 'Bạn không thể đề xuất sửa nội dung của khóa học này.' };
  }

  // One open proposal per user per target: the UI opens the existing one.
  const existing = await findOpenProposal(user.id, type, live.id);
  if (existing) {
    return { ok: false, status: 409, error: 'Bạn đã có một đề xuất đang mở cho nội dung này.', existingId: existing.id };
  }

  // Cap on open edit proposals (proposal §6.4); the message names them.
  const cap = proposalCap(user.role);
  const open = await prisma.contribution.findMany({
    where: { contributorId: user.id, type: { in: [...EDIT_PROPOSAL_TYPES] }, status: { in: [...OPEN_PROPOSAL_STATUSES] } },
    select: { id: true, type: true, status: true, targetId: true, baseUpdatedAt: true, baseSnapshot: true },
    orderBy: { updatedAt: 'desc' },
  });
  if (open.length >= cap) {
    const names = await describeProposalTargets(user, open);
    const list = open.map((c) => `«${names.get(c.id)?.name ?? 'Đề xuất'}»`).join(', ');
    return {
      ok: false,
      status: 429,
      error: `Bạn đang có ${open.length} đề xuất sửa chưa xong (tối đa ${cap}): ${list}. Hãy gửi duyệt, chờ duyệt xong hoặc xóa bớt bản nháp trước khi tạo đề xuất mới.`,
      details: open.map((c) => ({ id: c.id, name: names.get(c.id)?.name ?? null, status: c.status })),
    };
  }

  let data: unknown;
  let baseSnapshot: Prisma.InputJsonValue;
  let baseUpdatedAt: Date | null;

  if (type === 'EDIT_COURSE') {
    // Outline specifics (hidden lessons, proposal shape) live in outline-proposal.ts.
    const started = await startOutlineProposal(user, live.id, input.data);
    if (!started.ok) return started;
    data = started.data;
    baseSnapshot = started.baseSnapshot;
    baseUpdatedAt = started.baseUpdatedAt;
  } else {
    baseSnapshot = JSON.parse(JSON.stringify(live.snapshot)) as Prisma.InputJsonValue;
    baseUpdatedAt = live.updatedAt;
    const startsFromLive = input.data === undefined || input.data === null;
    const raw = startsFromLive ? live.snapshot : input.data;

    // Normalise AI-pasted JSON and check block structure (lessons and chapters).
    const prepared = prepareContributionData(raw);
    if (prepared.errors.length && !startsFromLive) {
      return { ok: false, status: 400, error: 'Có block sai cấu trúc', details: prepared.errors };
    }
    // Contributors are untrusted: strict schema, no custom blocks, media allowlist, HTML sanitised.
    const checked = prepared.errors.length
      ? null
      : validateContributionData(type, prepared.data, { allowCustom: user.role === 'ADMIN' });
    if (!checked || !checked.ok) {
      if (startsFromLive) {
        // The live content holds something contributor content may not (e.g. a `custom`
        // block): only an admin can edit it.
        return {
          ok: false,
          status: 422,
          error: 'Nội dung này có phần mà chỉ quản trị viên sửa được, nên chưa thể đề xuất sửa.',
          details: checked && !checked.ok ? checked.issues : prepared.errors,
        };
      }
      return { ok: false, status: 400, ...contentErrorBody(checked && !checked.ok ? checked.issues : [], prepared.data) };
    }
    data = checked.value;
  }

  const contribution = await prisma.contribution.create({
    data: {
      contributorId: user.id,
      type,
      targetId: live.id,
      data: data as Prisma.InputJsonValue,
      message: input.message ?? undefined,
      status: 'DRAFT',
      baseSnapshot,
      baseUpdatedAt,
      suggestionId: input.suggestionId ?? null,
    },
  });
  return { ok: true, contribution };
}
