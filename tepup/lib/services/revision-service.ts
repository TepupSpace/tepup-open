import type { Prisma, RevisionSource, RevisionTarget } from '@prisma/client';

/**
 * Content history (ContentRevision). Rule: every write to lesson content, chapter content,
 * a library entry or a course outline records the version it WRITES, in the same
 * transaction:
 *
 *   await prisma.$transaction(async (tx) => {
 *     const live = await lockLessonContent(tx, lessonId);      // lock + read live
 *     ...conflict check against live?.updatedAt...
 *     await tx.lessonContent.upsert(...);                       // the write
 *     await recordRevision(tx, { targetType: 'LESSON', targetId: lessonId, courseId,
 *       label, snapshot: { title, blocks }, source: 'ADMIN_PUBLISH', actorId,
 *       previous: live && { title: live.title, blocks: live.blocks } });
 *   });
 *
 * `previous` is the live version before the write. When the target has no history yet it
 * is stored first as BASELINE, so history is complete from the first recorded change
 * without a backfill. Deleting a target records source DELETED with its last version.
 *
 * Revisions have no FKs to content (history outlives deletion) and are append-only for
 * the app role (prisma/sql/2026-10-17-contributor-system.sql).
 */

type Tx = Prisma.TransactionClient;

export interface RecordRevisionInput {
  targetType: RevisionTarget;
  targetId: string;
  courseId?: string | null;
  label: string;
  snapshot: Prisma.InputJsonValue;
  source: RevisionSource;
  actorId?: string | null;
  authorId?: string | null;
  contributionId?: string | null;
  /** Live version before this write (null/undefined: there was none). */
  previous?: Prisma.InputJsonValue | null;
  /** Mark as patrolled at once (admin changes are auto-patrolled, proposal §6.18). */
  autoPatrol?: boolean;
}

/** Records a version. Returns the new revision id. */
export async function recordRevision(tx: Tx, input: RecordRevisionInput): Promise<string> {
  const now = Date.now();
  if (input.previous != null) {
    const existing = await tx.contentRevision.count({
      where: { targetType: input.targetType, targetId: input.targetId },
    });
    if (existing === 0) {
      const baseline = await tx.contentRevision.create({
        data: {
          targetType: input.targetType,
          targetId: input.targetId,
          courseId: input.courseId ?? null,
          label: input.label,
          snapshot: input.previous,
          source: 'BASELINE',
          // One millisecond earlier, so ordering by createdAt is stable inside one transaction.
          createdAt: new Date(now - 1),
        },
        select: { id: true },
      });
      // A baseline is not a change anyone needs to check.
      await tx.revisionPatrol.create({ data: { revisionId: baseline.id } });
    }
  }

  const revision = await tx.contentRevision.create({
    data: {
      targetType: input.targetType,
      targetId: input.targetId,
      courseId: input.courseId ?? null,
      label: input.label,
      snapshot: input.snapshot,
      source: input.source,
      actorId: input.actorId ?? null,
      authorId: input.authorId ?? null,
      contributionId: input.contributionId ?? null,
      createdAt: new Date(now),
    },
    select: { id: true },
  });
  if (input.autoPatrol) {
    await tx.revisionPatrol.create({ data: { revisionId: revision.id, patrolledById: input.actorId ?? null } });
  }
  return revision.id;
}

// --- row locks: lock + read the live version before a write -----------------------------

export interface LiveBlocksContent {
  title: string;
  blocks: Prisma.JsonValue;
  updatedAt: Date;
}

/*
 * Lock order (avoids deadlocks): Course → Lesson/Chapter → its content row → anything else.
 * A transaction that also changes the outline takes lockCourse BEFORE lockLessonContent.
 *
 * The parent Lesson/Chapter row is locked first because it always exists: a lesson with no
 * LessonContent yet (new, or created by an outline proposal) has no content row to lock,
 * and two first publishes would otherwise both pass the conflict check. `for no key update`
 * serialises every writer and Lesson/Chapter update/delete, but still lets unrelated rows
 * that reference the lesson (progress, exercises) be inserted meanwhile.
 */

/**
 * Locks the lesson (and its LessonContent row) until the transaction ends and returns the
 * content (null: no content yet). Two publishers of the same lesson then run one after the
 * other, so a conflict check made after this call can't be passed by both.
 */
export async function lockLessonContent(tx: Tx, lessonId: string): Promise<LiveBlocksContent | null> {
  await tx.$queryRaw`select "id" from "Lesson" where "id" = ${lessonId} for no key update`;
  const rows = await tx.$queryRaw<LiveBlocksContent[]>`
    select "title", "blocks", "updatedAt" from "LessonContent" where "lessonId" = ${lessonId} for update`;
  return rows[0] ?? null;
}

/** Same as lockLessonContent, for Chapter + ChapterContent. */
export async function lockChapterContent(tx: Tx, chapterId: string): Promise<LiveBlocksContent | null> {
  await tx.$queryRaw`select "id" from "Chapter" where "id" = ${chapterId} for no key update`;
  const rows = await tx.$queryRaw<LiveBlocksContent[]>`
    select "title", "blocks", "updatedAt" from "ChapterContent" where "chapterId" = ${chapterId} for update`;
  return rows[0] ?? null;
}

/** Locks a LibraryEntry row; returns its updatedAt (null: no such entry). */
export async function lockLibraryEntry(tx: Tx, entryId: string): Promise<{ updatedAt: Date } | null> {
  const rows = await tx.$queryRaw<{ updatedAt: Date }[]>`
    select "updatedAt" from "LibraryEntry" where "id" = ${entryId} for update`;
  return rows[0] ?? null;
}

/** Locks the Course row: outline changes (names, order, visibility) serialise on it. */
export async function lockCourse(tx: Tx, courseId: string): Promise<{ updatedAt: Date } | null> {
  const rows = await tx.$queryRaw<{ updatedAt: Date }[]>`
    select "updatedAt" from "Course" where "id" = ${courseId} for update`;
  return rows[0] ?? null;
}

/** Snapshot shape for LESSON and CHAPTER revisions. */
export function blocksSnapshot(title: string, blocks: unknown): Prisma.InputJsonValue {
  return { title, blocks: (blocks ?? []) as Prisma.InputJsonValue };
}
