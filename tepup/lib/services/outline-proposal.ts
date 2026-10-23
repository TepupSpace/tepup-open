import type { Prisma, UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { canOnCourse } from '@/lib/permissions/course-roles';
import { buildOutline, outlineHash } from '@/lib/services/outline-service';
import {
  checkOutlineAgainstLive,
  outlineToProposal,
  validateCourseOutlineProposal,
  type CourseOutlineProposal,
} from '@/lib/schemas/contribution-types/course-outline';
import type { CourseOutline } from '@/lib/types/outline';

/**
 * `Contribution.baseSnapshot` of an EDIT_COURSE proposal: the live outline when it started and
 * its hash. Publishing compares the hash with the live outline's (proposal §6.7: STALE).
 * `baseUpdatedAt` stays null for outline proposals.
 */
export interface OutlineBaseSnapshot {
  outline: CourseOutline;
  hash: string;
}

export function isOutlineBaseSnapshot(v: unknown): v is OutlineBaseSnapshot {
  return (
    !!v &&
    typeof v === 'object' &&
    typeof (v as { hash?: unknown }).hash === 'string' &&
    !!(v as { outline?: unknown }).outline &&
    typeof (v as { outline?: unknown }).outline === 'object'
  );
}

export type StartOutlineProposalResult =
  | {
      ok: true;
      data: CourseOutlineProposal;
      baseSnapshot: Prisma.InputJsonValue;
      baseUpdatedAt: null;
    }
  | { ok: false; status: 400 | 403 | 404; error: string; details?: unknown };

/**
 * Starting point of an EDIT_COURSE proposal (called by createEditProposal). Checks only what
 * is specific to outlines; the caller handles blocks, caps, one-open-per-target and rate limits.
 *
 * - 404 when the course doesn't exist or is hidden from the user (never reveal hidden courses);
 * - 404 too when the course has hidden lessons and the user may not see hidden content there:
 *   an outline lists every lesson, and hiding some would mean deleting them, so only course
 *   roles (SEE_HIDDEN) propose outline changes there. Neither hidden names nor their
 *   existence leak (same answer as a hidden course);
 * - `data` (optional) must be a valid proposal matching the live outline; default = live outline.
 */
export async function startOutlineProposal(
  user: { id: string; role: UserRole },
  courseId: string,
  data?: unknown
): Promise<StartOutlineProposalResult> {
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { isActive: true } });
  if (!course) return { ok: false, status: 404, error: 'Không tìm thấy khóa học' };
  const seeHidden = await canOnCourse(user, courseId, 'SEE_HIDDEN');
  if (!course.isActive && !seeHidden) return { ok: false, status: 404, error: 'Không tìm thấy khóa học' };

  const outline = await buildOutline(prisma, courseId);
  if (!outline) return { ok: false, status: 404, error: 'Không tìm thấy khóa học' };
  // Same neutral 404 as a hidden course: a distinct 403 would reveal that hidden lessons exist.
  if (!seeHidden && outline.lessons.some((l) => !l.isActive)) {
    return { ok: false, status: 404, error: 'Không tìm thấy khóa học' };
  }

  let proposal: CourseOutlineProposal;
  if (data === undefined || data === null) {
    proposal = outlineToProposal(outline);
  } else {
    const checked = validateCourseOutlineProposal(data);
    if (!checked.ok) return { ok: false, status: 400, error: 'Mục lục không hợp lệ', details: checked.issues };
    const issues = checkOutlineAgainstLive(checked.value, outline);
    if (issues.length) return { ok: false, status: 400, error: 'Mục lục không khớp với khóa học', details: issues };
    proposal = checked.value;
  }

  const base: OutlineBaseSnapshot = { outline, hash: outlineHash(outline) };
  return {
    ok: true,
    data: proposal,
    baseSnapshot: base as unknown as Prisma.InputJsonValue,
    baseUpdatedAt: null,
  };
}
