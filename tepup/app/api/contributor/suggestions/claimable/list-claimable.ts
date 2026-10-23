import type { SuggestionTarget, UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { canReviewContent } from '@/lib/role-utils';
import { canOnCourse } from '@/lib/permissions/course-roles';
import { CLAIM_KEEPING_STATUSES, isClaimActive } from '@/lib/suggestions';

/**
 * Accepted reader suggestions a contributor may claim ("Nhận làm", proposal §6.9), shared by
 * GET /api/contributor/suggestions/claimable, /contributor/suggestions and the dashboard card.
 *
 * Only targets the viewer may see are listed (hidden lessons: SEE_HIDDEN on the course;
 * hidden chapters and library entries: global reviewers only), never on a course the viewer
 * is blocked on. NEW_ENTRY suggestions are not claimable (there is nothing to edit yet).
 * Who claimed a suggestion is shown to global reviewers only; others see "Đã có người nhận".
 */

export const CLAIMABLE_TARGETS = ['LESSON', 'CHAPTER', 'LIBRARY_ENTRY'] as const satisfies readonly SuggestionTarget[];
export type ClaimableTarget = (typeof CLAIMABLE_TARGETS)[number];

export type ClaimState = 'free' | 'mine' | 'taken';

export interface ClaimableSuggestion {
  id: string;
  targetType: ClaimableTarget;
  targetId: string;
  quote: string | null;
  proposal: string;
  reason: string | null;
  createdAt: string;
  target: { title: string; context: string; viewHref: string | null; hubHref: string | null; courseId: string | null };
  claim: {
    state: ClaimState;
    claimedAt: string | null;
    /** Global reviewers only. */
    claimerName: string | null;
    /** The viewer's own open proposal linked to this suggestion, if any. */
    myProposalId: string | null;
  };
}

type Viewer = { id: string; role: UserRole };

/** Can `viewer` see the target of a claimable suggestion, and the course it belongs to (for blocks). */
export async function resolveClaimTarget(
  viewer: Viewer,
  targetType: SuggestionTarget,
  targetId: string
): Promise<ClaimableSuggestion['target'] | null> {
  const map = await resolveTargets(viewer, [{ targetType, targetId }]);
  return map.get(`${targetType}:${targetId}`) ?? null;
}

async function resolveTargets(
  viewer: Viewer,
  items: { targetType: SuggestionTarget; targetId: string }[]
): Promise<Map<string, ClaimableSuggestion['target']>> {
  const ids = (t: SuggestionTarget) => [...new Set(items.filter((s) => s.targetType === t).map((s) => s.targetId))];
  const globalReviewer = canReviewContent(viewer.role);

  const [lessons, chapters, entries] = await Promise.all([
    prisma.lesson.findMany({
      where: { id: { in: ids('LESSON') } },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        courseId: true,
        course: { select: { name: true, slug: true, isActive: true } },
      },
    }),
    prisma.chapter.findMany({
      where: { id: { in: ids('CHAPTER') } },
      select: {
        id: true,
        title: true,
        slug: true,
        isActive: true,
        story: { select: { title: true, slug: true, isActive: true, character: { select: { slug: true, isActive: true } } } },
      },
    }),
    prisma.libraryEntry.findMany({
      where: { id: { in: ids('LIBRARY_ENTRY') } },
      select: { id: true, title: true, slug: true, isActive: true },
    }),
  ]);

  const out = new Map<string, ClaimableSuggestion['target']>();

  // Hidden lessons: one permission check per course.
  const seeHidden = new Map<string, boolean>();
  for (const l of lessons) {
    const hidden = !l.isActive || !l.course.isActive;
    if (hidden) {
      if (!seeHidden.has(l.courseId)) seeHidden.set(l.courseId, await canOnCourse(viewer, l.courseId, 'SEE_HIDDEN'));
      if (!seeHidden.get(l.courseId)) continue;
    }
    out.set(`LESSON:${l.id}`, {
      title: l.name,
      context: l.course.name,
      viewHref: `/courses/${l.course.slug}/${l.slug}`,
      hubHref: `/contributor/lessons/${l.id}`,
      courseId: l.courseId,
    });
  }
  for (const c of chapters) {
    if ((!c.isActive || !c.story.isActive || !c.story.character.isActive) && !globalReviewer) continue;
    out.set(`CHAPTER:${c.id}`, {
      title: c.title,
      context: c.story.title,
      viewHref: `/story/${c.story.character.slug}/${c.story.slug}/${c.slug}`,
      hubHref: null,
      courseId: null,
    });
  }
  for (const e of entries) {
    if (!e.isActive && !globalReviewer) continue;
    out.set(`LIBRARY_ENTRY:${e.id}`, {
      title: e.title,
      context: 'Thư viện',
      viewHref: `/thu-vien/muc/${e.slug}`,
      hubHref: null,
      courseId: null,
    });
  }
  return out;
}

export async function listClaimableSuggestions(viewer: Viewer): Promise<ClaimableSuggestion[]> {
  const suggestions = await prisma.suggestion.findMany({
    where: { status: 'ACCEPTED', targetType: { in: [...CLAIMABLE_TARGETS] } },
    orderBy: { createdAt: 'asc' },
    take: 300,
  });
  if (!suggestions.length) return [];

  const [targets, blocks, linked] = await Promise.all([
    resolveTargets(viewer, suggestions),
    prisma.courseBlock.findMany({ where: { userId: viewer.id }, select: { courseId: true } }),
    prisma.contribution.findMany({
      where: {
        suggestionId: { in: suggestions.map((s) => s.id) },
        status: { in: ['DRAFT', ...CLAIM_KEEPING_STATUSES] },
      },
      select: { id: true, suggestionId: true, status: true, contributorId: true },
    }),
  ]);
  const blocked = new Set(blocks.map((b) => b.courseId));

  const globalReviewer = canReviewContent(viewer.role);
  const claimerIds = globalReviewer
    ? [...new Set(suggestions.map((s) => s.claimedById).filter((id): id is string => !!id))]
    : [];
  const claimers = claimerIds.length
    ? await prisma.user.findMany({ where: { id: { in: claimerIds } }, select: { id: true, username: true } })
    : [];
  const claimerName = new Map(claimers.map((u) => [u.id, u.username ?? '(không tên)']));

  const items: ClaimableSuggestion[] = [];
  for (const s of suggestions) {
    const target = targets.get(`${s.targetType}:${s.targetId}`);
    if (!target) continue;
    if (target.courseId && blocked.has(target.courseId)) continue;

    const mine = linked.find((c) => c.suggestionId === s.id && c.contributorId === viewer.id) ?? null;
    const submitted = linked.some(
      (c) =>
        c.suggestionId === s.id &&
        c.contributorId === s.claimedById &&
        (CLAIM_KEEPING_STATUSES as readonly string[]).includes(c.status)
    );
    const active = isClaimActive(s, { hasSubmittedProposal: submitted });
    const state: ClaimState = !active ? 'free' : s.claimedById === viewer.id ? 'mine' : 'taken';

    items.push({
      id: s.id,
      targetType: s.targetType as ClaimableTarget,
      targetId: s.targetId,
      quote: s.quote,
      proposal: s.proposal,
      reason: s.reason,
      createdAt: s.createdAt.toISOString(),
      target,
      claim: {
        state,
        claimedAt: active && s.claimedAt ? s.claimedAt.toISOString() : null,
        claimerName: active && globalReviewer && s.claimedById ? (claimerName.get(s.claimedById) ?? null) : null,
        myProposalId: mine?.id ?? null,
      },
    });
  }
  return items;
}
