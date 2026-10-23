import { unstable_cache } from 'next/cache';
import type { CreditMode, ReviewerDisclosure } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { CONTENT_TAG } from '@/lib/cache';
import { publicCredit } from '@/lib/credit';

/**
 * Public credits for a course page (proposal §6.12, §6.14a). Cached and the same for every
 * visitor (CONTENT_TAG: changes to credit mode, disclosure, verification and course roles
 * call revalidateContent()).
 *
 *  - "Tác giả và người đóng góp": the course creator, its maintainers, and every author of
 *    an approved contribution to the course (ContentRevision.authorId on LESSON and
 *    COURSE_OUTLINE revisions from CONTRIBUTION, plus approved contributions from before
 *    history existed). Each through publicCredit(): keyed by user id, deleted → pseudonym.
 *  - "Người thẩm định": trusted reviewers whose effective disclosure
 *    (CourseMember.disclosure ?? ReviewerProfile.disclosure) is not NONE. CREDENTIAL and
 *    FULL show only after an admin verified the profile; until then they count as ANONYMOUS.
 */

export type CreditRole = 'CREATOR' | 'COURSE_LEAD' | 'CONTRIBUTOR';

export interface CourseCreditPerson {
  /** Opaque key for React lists (not the user id: nothing on the public page links to accounts). */
  key: string;
  name: string;
  roles: CreditRole[];
}

export interface CourseReviewerCredit {
  key: string;
  /** FULL: the reviewer's typed public name; CREDENTIAL: null. */
  name: string | null;
  credential: string;
  /** Only with FULL (an affiliation can identify someone). */
  affiliation: string | null;
}

export interface CourseCreditsData {
  people: CourseCreditPerson[];
  reviewers: CourseReviewerCredit[];
  anonymousReviewers: number;
}

interface CreditUser {
  id: string;
  username: string | null;
  creditMode: CreditMode;
  publicHandle: string | null;
  deletedAt: Date | null;
}

/** What learners see for a trusted reviewer: NONE, ANONYMOUS, or a verified credential/name. */
export function effectiveDisclosure(
  memberOverride: ReviewerDisclosure | null,
  profile: { disclosure: ReviewerDisclosure; verifiedAt: Date | null; credential: string | null; publicName: string | null } | null
): ReviewerDisclosure {
  const chosen = memberOverride ?? profile?.disclosure ?? 'NONE';
  if (chosen === 'NONE' || chosen === 'ANONYMOUS') return chosen;
  // CREDENTIAL / FULL need an admin-verified profile with a credential.
  if (!profile?.verifiedAt || !profile.credential?.trim()) return 'ANONYMOUS';
  if (chosen === 'FULL' && !profile.publicName?.trim()) return 'CREDENTIAL';
  return chosen;
}

async function loadCourseCredits(courseId: string): Promise<CourseCreditsData> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      createdById: true,
      members: {
        select: {
          userId: true,
          role: true,
          disclosure: true,
          createdAt: true,
          user: {
            select: {
              deletedAt: true,
              isBanned: true,
              reviewerProfile: {
                select: {
                  publicName: true,
                  credential: true,
                  affiliation: true,
                  disclosure: true,
                  verifiedAt: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
  if (!course) return { people: [], reviewers: [], anonymousReviewers: 0 };

  const [revisionAuthors, lessonIds] = await Promise.all([
    prisma.contentRevision.findMany({
      where: {
        courseId,
        targetType: { in: ['LESSON', 'COURSE_OUTLINE'] },
        source: 'CONTRIBUTION',
        authorId: { not: null },
      },
      select: { authorId: true },
      distinct: ['authorId'],
      orderBy: { authorId: 'asc' },
    }),
    prisma.lesson.findMany({ where: { courseId }, select: { id: true } }),
  ]);
  // Approved contributions from before history was recorded.
  const approved = await prisma.contribution.findMany({
    where: {
      status: 'APPROVED',
      OR: [
        { type: { in: ['NEW_COURSE', 'EDIT_COURSE'] }, targetId: courseId },
        { type: 'EDIT_LESSON_CONTENT', targetId: { in: lessonIds.map((l) => l.id) } },
      ],
    },
    select: { contributorId: true, resolvedAt: true },
    orderBy: { resolvedAt: 'asc' },
  });

  // Order: creator, maintainers, contributors (first approval first).
  const roles = new Map<string, Set<CreditRole>>();
  const order: string[] = [];
  const addRole = (id: string | null | undefined, role: CreditRole) => {
    if (!id) return;
    if (!roles.has(id)) {
      roles.set(id, new Set());
      order.push(id);
    }
    roles.get(id)!.add(role);
  };
  addRole(course.createdById, 'CREATOR');
  for (const m of course.members) if (m.role === 'COURSE_LEAD' && !m.user.deletedAt) addRole(m.userId, 'COURSE_LEAD');
  for (const c of approved) addRole(c.contributorId, 'CONTRIBUTOR');
  for (const r of revisionAuthors) addRole(r.authorId, 'CONTRIBUTOR');

  const users: CreditUser[] = order.length
    ? await prisma.user.findMany({
        where: { id: { in: order } },
        select: { id: true, username: true, creditMode: true, publicHandle: true, deletedAt: true },
      })
    : [];
  const userById = new Map(users.map((u) => [u.id, u]));

  const people: CourseCreditPerson[] = [];
  order.forEach((id, i) => {
    const u = userById.get(id);
    if (!u) return;
    const r = roles.get(id)!;
    // A creator who also contributed later is listed once, as creator.
    const list: CreditRole[] = (['CREATOR', 'COURSE_LEAD', 'CONTRIBUTOR'] as const).filter((x) => r.has(x));
    people.push({ key: `p${i}`, name: publicCredit(u), roles: list });
  });

  const reviewers: CourseReviewerCredit[] = [];
  let anonymousReviewers = 0;
  for (const m of course.members) {
    if (m.role !== 'TRUSTED_REVIEWER' || m.user.deletedAt || m.user.isBanned) continue;
    const profile = m.user.reviewerProfile;
    const level = effectiveDisclosure(m.disclosure, profile);
    if (level === 'NONE') continue;
    if (level === 'ANONYMOUS') {
      anonymousReviewers++;
      continue;
    }
    reviewers.push({
      key: `r${reviewers.length}`,
      name: level === 'FULL' ? profile!.publicName!.trim() : null,
      credential: profile!.credential!.trim(),
      affiliation: level === 'FULL' ? profile!.affiliation?.trim() || null : null,
    });
  }

  return { people, reviewers, anonymousReviewers };
}

/** Cached per course; invalidated by revalidateContent(). */
export function getCourseCredits(courseId: string): Promise<CourseCreditsData> {
  return unstable_cache(() => loadCourseCredits(courseId), ['course-credits-v1', courseId], {
    revalidate: 300,
    tags: [CONTENT_TAG],
  })();
}
