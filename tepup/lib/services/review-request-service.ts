import type { Prisma, ReviewerDisclosure, ReviewVerdict, UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { canOnCourse, type Viewer } from '@/lib/permissions/course-roles';
import { staffName } from '@/lib/credit';
import { sanitizeAdminBlocks } from '@/lib/schemas/content-validation';
import type { PublicEndorsement } from '@/lib/types/lesson-notices';

/**
 * "Gửi người duyệt" (proposal §6.15, §6.14a, decision 15). An admin sends a team-written
 * lesson version to reviewers; each asked reviewer records an advisory opinion. The request
 * holds a fixed snapshot: later draft edits don't change it. Publishing the lesson closes
 * open requests; a request whose snapshot is exactly the published version keeps the
 * revision id, and its ENDORSED opinions show to learners while that revision is live.
 *
 * Who may do what (checked in every API route, never only in the UI):
 *   - open a request:  admins, and course roles with READ_HISTORY on its course (trusted
 *                      reviewers, maintainers, global reviewers). An asked reviewer who lost
 *                      their grant loses access on the next request.
 *   - give an opinion: ASKED reviewers who still hold OPINION on the course (trusted
 *                      reviewer of the course, global REVIEWER, ADMIN), while OPEN.
 */

type Tx = Prisma.TransactionClient;

// --- normalised comparison ----------------------------------------------------------------

/** JSON with sorted object keys and no undefined values, for deep-equality checks. */
export function normalisedJson(value: unknown): string {
  return JSON.stringify(value, (_key, v: unknown) => {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const sorted: Record<string, unknown> = {};
      for (const k of Object.keys(v as Record<string, unknown>).sort()) sorted[k] = (v as Record<string, unknown>)[k];
      return sorted;
    }
    return v;
  });
}

function sameVersion(a: { title: string; blocks: unknown }, b: { title: string; blocks: unknown }): boolean {
  return a.title.trim() === b.title.trim() && normalisedJson(a.blocks ?? []) === normalisedJson(b.blocks ?? []);
}

// --- publish hook ---------------------------------------------------------------------------

/**
 * Called inside the transaction of every lesson publish (admin editor, approved
 * EDIT_LESSON_CONTENT, restore), after the new version has been recorded. Closes OPEN requests for the lesson; a request whose snapshot equals
 * the published { title, blocks } records `publishedRevisionId` (its endorsements then show
 * to learners while that revision is the lesson's latest). `published.blocks` is already
 * trimmed and sanitised the same way as the request snapshot (see the POST route).
 */
/**
 * Blocks as a request snapshot stores them (admin-sanitised), for the comparison in
 * closeReviewRequestsOnPublish when the publish path stored them another way (a
 * contributor's strictly validated blocks). Falls back to the blocks as given.
 */
export function blocksForRequestCompare(blocks: unknown): unknown {
  const cleaned = sanitizeAdminBlocks(blocks);
  return cleaned.ok ? cleaned.value : blocks;
}

export async function closeReviewRequestsOnPublish(
  tx: Prisma.TransactionClient,
  lessonId: string,
  published: { title: string; blocks: unknown },
  revisionId: string
): Promise<void> {
  // Lock the open requests: the opinion route re-checks OPEN under the same row lock, so no
  // opinion can change after the request is closed by this publish.
  const open = await tx.$queryRaw<{ id: string; title: string; blocks: unknown }[]>`
    select "id", "title", "blocks" from "ReviewRequest"
    where "lessonId" = ${lessonId} and "status" = 'OPEN'
    order by "id" for update`;
  if (!open.length) return;
  const now = new Date();
  const matching = open.filter((r) => sameVersion({ title: r.title, blocks: r.blocks }, published)).map((r) => r.id);
  const others = open.map((r) => r.id).filter((id) => !matching.includes(id));
  if (matching.length) {
    await tx.reviewRequest.updateMany({
      where: { id: { in: matching } },
      data: { status: 'CLOSED', closedAt: now, publishedRevisionId: revisionId },
    });
  }
  if (others.length) {
    await tx.reviewRequest.updateMany({
      where: { id: { in: others } },
      data: { status: 'CLOSED', closedAt: now },
    });
  }
}

// --- public endorsements ---------------------------------------------------------------------

const DISCLOSURE_ORDER: Record<PublicEndorsement['disclosure'], number> = { FULL: 0, CREDENTIAL: 1, ANONYMOUS: 2 };

/**
 * Public endorsements of the lesson's LIVE version (proposal §6.14a).
 * ENDORSED opinions on requests whose published version is the lesson's live version (the
 * latest revision, or an earlier one with identical title and blocks);
 * each reviewer's disclosure = CourseMember.disclosure ?? ReviewerProfile.disclosure (NONE
 * by default); NONE → omitted; CREDENTIAL/FULL degrade to ANONYMOUS unless the profile is
 * verified. Reviewers who lost their grant since still count (they endorsed then); deleted
 * accounts show as ANONYMOUS at most. Same for every visitor (cached under CONTENT_TAG).
 */
export async function getLessonEndorsements(lessonId: string): Promise<PublicEndorsement[]> {
  const latest = await prisma.contentRevision.findFirst({
    where: { targetType: 'LESSON', targetId: lessonId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: { id: true, source: true, snapshot: true },
  });
  if (!latest || latest.source === 'DELETED') return [];
  const latestVersion = latest.snapshot as { title?: unknown; blocks?: unknown } | null;

  // Requests published by the latest revision, or by an earlier one with exactly the same
  // content (a later publish that changed only settings, or re-published the same text,
  // keeps the endorsement; any content change drops it).
  const candidates = await prisma.reviewRequest.findMany({
    where: { lessonId, publishedRevisionId: { not: null } },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      courseId: true,
      requestedById: true,
      publishedRevisionId: true,
      title: true,
      blocks: true,
      opinions: {
        where: { verdict: 'ENDORSED' },
        orderBy: { createdAt: 'asc' },
        select: {
          reviewerId: true,
          reviewer: {
            select: {
              deletedAt: true,
              reviewerProfile: {
                select: { disclosure: true, verifiedAt: true, publicName: true, credential: true, affiliation: true },
              },
              courseMemberships: { select: { courseId: true, disclosure: true } },
            },
          },
        },
      },
    },
  });

  const requests = candidates.filter(
    (r) =>
      r.publishedRevisionId === latest.id ||
      (typeof latestVersion?.title === 'string' &&
        sameVersion({ title: r.title, blocks: r.blocks }, { title: latestVersion.title, blocks: latestVersion.blocks }))
  );

  const seen = new Set<string>();
  const out: PublicEndorsement[] = [];
  for (const req of requests) {
    for (const op of req.opinions) {
      // Defence in depth: the requester's own opinion is never an endorsement.
      if (op.reviewerId === req.requestedById) continue;
      if (seen.has(op.reviewerId)) continue;
      seen.add(op.reviewerId);
      const r = op.reviewer;
      const profile = r.reviewerProfile;
      const override = r.courseMemberships.find((m) => m.courseId === req.courseId)?.disclosure ?? null;
      let disclosure: ReviewerDisclosure = override ?? profile?.disclosure ?? 'NONE';
      if (disclosure === 'NONE') continue;
      if ((disclosure === 'CREDENTIAL' || disclosure === 'FULL') && !profile?.verifiedAt) disclosure = 'ANONYMOUS';
      if (r.deletedAt) disclosure = 'ANONYMOUS';

      if (disclosure === 'ANONYMOUS') {
        out.push({ disclosure: 'ANONYMOUS' });
        continue;
      }
      const credential = profile?.credential?.trim() || undefined;
      const affiliation = profile?.affiliation?.trim() || undefined;
      const publicName = profile?.publicName?.trim() || undefined;
      // The affiliation shows only with FULL: it can identify someone who chose not to be
      // named (same rule as credits-service and the profile settings).
      if (disclosure === 'CREDENTIAL') {
        // Nothing to show beyond "a reviewer checked it" without a credential.
        out.push(credential ? { disclosure: 'CREDENTIAL', credential } : { disclosure: 'ANONYMOUS' });
        continue;
      }
      // FULL: a name typed by the reviewer (never derived from the username).
      if (publicName) out.push({ disclosure: 'FULL', publicName, credential, affiliation });
      else out.push(credential ? { disclosure: 'CREDENTIAL', credential } : { disclosure: 'ANONYMOUS' });
    }
  }
  return out.sort((a, b) => DISCLOSURE_ORDER[a.disclosure] - DISCLOSURE_ORDER[b.disclosure]);
}

// --- access ---------------------------------------------------------------------------------

/** May `viewer` open this request (detail, discussion)? API routes return 404 otherwise. */
export async function canViewReviewRequest(viewer: Viewer, req: { courseId: string }): Promise<boolean> {
  if (viewer.role === 'ADMIN') return true;
  return canOnCourse(viewer, req.courseId, 'READ_HISTORY');
}

/** May `viewer` record an opinion? Asked, still holding OPINION on the course. (Status checked separately.) */
export async function canGiveOpinion(
  viewer: Viewer,
  req: { id: string; courseId: string; requestedById?: string | null }
): Promise<boolean> {
  // Nobody reviews their own work: the requester never gives an opinion on their request.
  if (req.requestedById && req.requestedById === viewer.id) return false;
  const asked = await prisma.reviewRequestReviewer.findUnique({
    where: { requestId_userId: { requestId: req.id, userId: viewer.id } },
    select: { userId: true },
  });
  if (!asked) return false;
  return canOnCourse(viewer, req.courseId, 'OPINION');
}

/** User ids an admin may ask for this course: trusted reviewers of it, global REVIEWER/ADMIN. Active accounts only. */
export async function validReviewerIds(db: Tx | typeof prisma, courseId: string, ids: string[]): Promise<Set<string>> {
  if (!ids.length) return new Set();
  const rows = await db.user.findMany({
    where: {
      id: { in: ids },
      deletedAt: null,
      isBanned: false,
      OR: [
        { role: { in: ['REVIEWER', 'ADMIN'] } },
        { courseMemberships: { some: { courseId, role: 'TRUSTED_REVIEWER' } } },
      ],
    },
    select: { id: true },
  });
  return new Set(rows.map((r) => r.id));
}

// --- DTOs -------------------------------------------------------------------------------------

/** Someone the admin may ask ("Gửi người duyệt" dialog). */
export interface ReviewerCandidateDTO {
  id: string;
  name: string;
  /** TRUSTED_REVIEWER of the lesson's course (pre-ticked); otherwise a global REVIEWER. */
  trusted: boolean;
}

export interface ReviewerOpinionDTO {
  userId: string;
  name: string;
  /** Trusted reviewer of this course (as opposed to a global reviewer). */
  trusted: boolean;
  verdict: ReviewVerdict | null;
  note: string | null;
  updatedAt: string | null;
}

export interface ReviewRequestSummaryDTO {
  id: string;
  lessonId: string;
  lessonName: string;
  courseId: string;
  courseName: string;
  title: string;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
  closedAt: string | null;
  requestedBy: string | null;
  message: string | null;
  escalatedAt: string | null;
  published: boolean;
  reviewers: ReviewerOpinionDTO[];
  /** The viewer was asked. */
  asked: boolean;
  myVerdict: ReviewVerdict | null;
  myNote: string | null;
}

export interface ReviewRequestDetailDTO extends ReviewRequestSummaryDTO {
  blocks: unknown[];
  baseSnapshot: { title: string; blocks: unknown[] } | null;
  baseUpdatedAt: string | null;
  live: { title: string; blocks: unknown[]; updatedAt: string } | null;
  escalationNote: string | null;
  /** A newer request for the lesson exists, or live content changed since the snapshot. */
  newerExists: boolean;
  liveChanged: boolean;
  canOpinion: boolean;
  canEscalate: boolean;
  canClose: boolean;
}

const userSelect = { id: true, username: true, name: true, publicHandle: true, deletedAt: true } as const;

const requestInclude = {
  requestedBy: { select: userSelect },
  reviewers: { select: { user: { select: userSelect } } },
  opinions: { select: { reviewerId: true, verdict: true, note: true, updatedAt: true, reviewer: { select: userSelect } } },
} satisfies Prisma.ReviewRequestInclude;

type RequestRow = Prisma.ReviewRequestGetPayload<{ include: typeof requestInclude }>;

async function toSummaries(rows: RequestRow[], viewerId: string): Promise<ReviewRequestSummaryDTO[]> {
  if (!rows.length) return [];
  const lessonIds = [...new Set(rows.map((r) => r.lessonId))];
  const courseIds = [...new Set(rows.map((r) => r.courseId))];
  const [lessons, courses, trusted] = await Promise.all([
    prisma.lesson.findMany({ where: { id: { in: lessonIds } }, select: { id: true, name: true } }),
    prisma.course.findMany({ where: { id: { in: courseIds } }, select: { id: true, name: true } }),
    prisma.courseMember.findMany({
      where: { courseId: { in: courseIds }, role: 'TRUSTED_REVIEWER' },
      select: { courseId: true, userId: true },
    }),
  ]);
  const lessonName = new Map(lessons.map((l) => [l.id, l.name]));
  const courseName = new Map(courses.map((c) => [c.id, c.name]));
  const trustedKey = new Set(trusted.map((t) => `${t.courseId}:${t.userId}`));

  return rows.map((r) => {
    const opinionBy = new Map(r.opinions.map((o) => [o.reviewerId, o]));
    const reviewerUsers = new Map(r.reviewers.map((x) => [x.user.id, x.user]));
    // An opinion whose reviewer row is somehow missing still shows.
    for (const o of r.opinions) if (!reviewerUsers.has(o.reviewerId)) reviewerUsers.set(o.reviewerId, o.reviewer);
    const reviewers: ReviewerOpinionDTO[] = [...reviewerUsers.values()].map((u) => {
      const o = opinionBy.get(u.id);
      return {
        userId: u.id,
        name: staffName(u),
        trusted: trustedKey.has(`${r.courseId}:${u.id}`),
        verdict: o?.verdict ?? null,
        note: o?.note ?? null,
        updatedAt: o?.updatedAt.toISOString() ?? null,
      };
    });
    return {
      id: r.id,
      lessonId: r.lessonId,
      lessonName: lessonName.get(r.lessonId) ?? r.title,
      courseId: r.courseId,
      courseName: courseName.get(r.courseId) ?? '',
      title: r.title,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      closedAt: r.closedAt?.toISOString() ?? null,
      requestedBy: r.requestedBy ? staffName(r.requestedBy) : null,
      message: r.message,
      escalatedAt: r.escalatedAt?.toISOString() ?? null,
      published: !!r.publishedRevisionId,
      reviewers,
      asked: r.reviewers.some((x) => x.user.id === viewerId),
      myVerdict: opinionBy.get(viewerId)?.verdict ?? null,
      myNote: opinionBy.get(viewerId)?.note ?? null,
    };
  });
}

/** Requests for one lesson (admin editor side panel), newest first. */
export async function listLessonReviewRequests(lessonId: string, viewerId: string): Promise<ReviewRequestSummaryDTO[]> {
  const rows = await prisma.reviewRequest.findMany({
    where: { lessonId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: requestInclude,
  });
  return toSummaries(rows, viewerId);
}

export type ReviewRequestListScope = 'open' | 'closed';

/**
 * Requests `viewer` may see: ones they were asked about (while they still hold OPINION on
 * the course), plus — read-only — every request on courses where they may read history.
 * Admins and global reviewers: all. Escalated first, then newest.
 */
export async function listReviewRequestsForViewer(
  viewer: Viewer,
  scope: ReviewRequestListScope = 'open'
): Promise<ReviewRequestSummaryDTO[]> {
  const status = scope === 'open' ? 'OPEN' : 'CLOSED';
  const global = viewer.role === 'ADMIN' || viewer.role === 'REVIEWER';
  let where: Prisma.ReviewRequestWhereInput = { status };
  if (!global) {
    // Course roles: every role in ROLE_ACTIONS that has READ_HISTORY (maintainer, trusted reviewer).
    const memberships = await prisma.courseMember.findMany({
      where: { userId: viewer.id },
      select: { courseId: true },
    });
    const allowed: string[] = [];
    for (const m of memberships) {
      if (await canOnCourse(viewer, m.courseId, 'READ_HISTORY')) allowed.push(m.courseId);
    }
    if (!allowed.length) return [];
    where = { status, courseId: { in: allowed } };
  }
  const rows = await prisma.reviewRequest.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }],
    take: scope === 'open' ? 200 : 50,
    include: requestInclude,
  });
  const list = await toSummaries(rows, viewer.id);
  return list.sort((a, b) => {
    const ea = a.escalatedAt ? 1 : 0;
    const eb = b.escalatedAt ? 1 : 0;
    if (ea !== eb) return eb - ea;
    const wa = a.asked && !a.myVerdict ? 1 : 0;
    const wb = b.asked && !b.myVerdict ? 1 : 0;
    if (wa !== wb) return wb - wa;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

function asBlocksVersion(v: unknown): { title: string; blocks: unknown[] } | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as { title?: unknown; blocks?: unknown };
  return { title: typeof o.title === 'string' ? o.title : '', blocks: Array.isArray(o.blocks) ? o.blocks : [] };
}

/** One request for `viewer`, or null (not found OR not allowed: callers answer 404 for both). */
export async function getReviewRequestForViewer(viewer: Viewer, id: string): Promise<ReviewRequestDetailDTO | null> {
  const row = await prisma.reviewRequest.findUnique({ where: { id }, include: requestInclude });
  if (!row) return null;
  if (!(await canViewReviewRequest(viewer, row))) return null;

  const [summary] = await toSummaries([row], viewer.id);
  const [live, newer, canOpinionNow, canEscalate] = await Promise.all([
    prisma.lessonContent.findUnique({
      where: { lessonId: row.lessonId },
      select: { title: true, blocks: true, updatedAt: true },
    }),
    prisma.reviewRequest.count({ where: { lessonId: row.lessonId, createdAt: { gt: row.createdAt } } }),
    canGiveOpinion(viewer, row),
    canOnCourse(viewer, row.courseId, 'ESCALATE'),
  ]);
  const liveChanged = row.baseUpdatedAt
    ? !!live && live.updatedAt.getTime() !== row.baseUpdatedAt.getTime()
    : !!live;

  return {
    ...summary,
    blocks: Array.isArray(row.blocks) ? (row.blocks as unknown[]) : [],
    baseSnapshot: asBlocksVersion(row.baseSnapshot),
    baseUpdatedAt: row.baseUpdatedAt?.toISOString() ?? null,
    live: live
      ? {
          title: live.title,
          blocks: Array.isArray(live.blocks) ? (live.blocks as unknown[]) : [],
          updatedAt: live.updatedAt.toISOString(),
        }
      : null,
    escalationNote: row.escalationNote,
    newerExists: newer > 0,
    liveChanged,
    canOpinion: canOpinionNow && row.status === 'OPEN',
    canEscalate: canEscalate && row.status === 'OPEN',
    canClose: viewer.role === 'ADMIN' && row.status === 'OPEN',
  };
}

/** Dashboard: open requests where `userId` was asked, may still give an opinion, and hasn't yet. */
export async function pendingRequestsForReviewer(
  userId: string,
  role: UserRole,
  take = 5
): Promise<{ count: number; items: { id: string; lessonName: string; courseName: string; createdAt: Date }[] }> {
  const global = role === 'ADMIN' || role === 'REVIEWER';
  const where: Prisma.ReviewRequestWhereInput = {
    status: 'OPEN',
    reviewers: { some: { userId } },
    opinions: { none: { reviewerId: userId } },
    ...(global
      ? {}
      : {
          courseId: {
            in: (
              await prisma.courseMember.findMany({
                where: { userId, role: 'TRUSTED_REVIEWER' },
                select: { courseId: true },
              })
            ).map((m) => m.courseId),
          },
        }),
  };
  const [count, rows] = await Promise.all([
    prisma.reviewRequest.count({ where }),
    prisma.reviewRequest.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take,
      select: { id: true, lessonId: true, courseId: true, title: true, createdAt: true },
    }),
  ]);
  const [lessons, courses] = await Promise.all([
    prisma.lesson.findMany({ where: { id: { in: rows.map((r) => r.lessonId) } }, select: { id: true, name: true } }),
    prisma.course.findMany({ where: { id: { in: rows.map((r) => r.courseId) } }, select: { id: true, name: true } }),
  ]);
  const ln = new Map(lessons.map((l) => [l.id, l.name]));
  const cn = new Map(courses.map((c) => [c.id, c.name]));
  return {
    count,
    items: rows.map((r) => ({
      id: r.id,
      lessonName: ln.get(r.lessonId) ?? r.title,
      courseName: cn.get(r.courseId) ?? '',
      createdAt: r.createdAt,
    })),
  };
}
