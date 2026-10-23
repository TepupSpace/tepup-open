import { createHash } from 'node:crypto';
import type { Prisma, RevisionSource } from '@prisma/client';
import { recordRevision } from '@/lib/services/revision-service';

/**
 * A course's outline: names, order and visibility (proposal §6.7, §12). Versioned as
 * ContentRevision targetType COURSE_OUTLINE. Every outline change (approved EDIT_COURSE,
 * maintainer show/hide, admin course/level/lesson edits) records the new outline.
 */
import type { CourseOutline } from '@/lib/types/outline';

export type { CourseOutline };

type Tx = Prisma.TransactionClient;

export async function buildOutline(tx: Tx, courseId: string): Promise<CourseOutline | null> {
  const course = await tx.course.findUnique({
    where: { id: courseId },
    select: {
      name: true,
      description: true,
      levels: { select: { id: true, name: true, sortOrder: true }, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
      lessons: {
        select: { id: true, name: true, levelId: true, sortOrder: true, isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      },
    },
  });
  if (!course) return null;
  return {
    course: { name: course.name, description: course.description },
    levels: course.levels,
    lessons: course.lessons,
  };
}

/** Stable hash of an outline: the base of an EDIT_COURSE proposal (stale check). */
export function outlineHash(o: CourseOutline): string {
  return createHash('sha256').update(JSON.stringify(o)).digest('hex').slice(0, 32);
}

/**
 * Records the course's CURRENT outline as a new version. Call it AFTER the outline change,
 * in the same transaction, passing the outline from BEFORE the change as `previous`
 * (stored as BASELINE when the course has no outline history yet).
 */
export async function recordOutlineRevision(
  tx: Tx,
  courseId: string,
  opts: {
    source: RevisionSource;
    actorId?: string | null;
    authorId?: string | null;
    contributionId?: string | null;
    previous?: CourseOutline | null;
    autoPatrol?: boolean;
  }
): Promise<string | null> {
  const now = await buildOutline(tx, courseId);
  if (!now) return null;
  return recordRevision(tx, {
    targetType: 'COURSE_OUTLINE',
    targetId: courseId,
    courseId,
    label: now.course.name,
    snapshot: now as unknown as Prisma.InputJsonValue,
    source: opts.source,
    actorId: opts.actorId,
    authorId: opts.authorId,
    contributionId: opts.contributionId,
    previous: (opts.previous ?? null) as unknown as Prisma.InputJsonValue | null,
    autoPatrol: opts.autoPatrol,
  });
}
