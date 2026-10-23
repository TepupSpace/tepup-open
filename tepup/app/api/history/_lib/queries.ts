import type { Prisma, RevisionTarget } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { buildOutline } from '@/lib/services/outline-service';
import { readEntrySnapshot } from '@/lib/library/entry-snapshot';
import { normalizeEntrySnapshot } from '@/lib/diff';
import type { RevisionListItem, RevisionSourceName } from '@/components/history/types';
import { USER_NAME_SELECT, namesById, nameOf } from './access';

/** Reads for the history API and pages. Callers check access first (./access.ts). */

export const REVISION_LIST_SELECT = {
  id: true,
  createdAt: true,
  source: true,
  label: true,
  targetType: true,
  targetId: true,
  courseId: true,
  contributionId: true,
  actor: { select: USER_NAME_SELECT },
  author: { select: USER_NAME_SELECT },
  patrol: { select: { patrolledAt: true, patrolledById: true } },
} satisfies Prisma.ContentRevisionSelect;

type RevisionRow = Prisma.ContentRevisionGetPayload<{ select: typeof REVISION_LIST_SELECT }>;

/** Rows → list items (one query for patroller names). */
export async function toListItems(rows: RevisionRow[]): Promise<(RevisionListItem & { row: RevisionRow })[]> {
  const patrollers = await namesById(rows.map((r) => r.patrol?.patrolledById));
  return rows.map((r) => ({
    row: r,
    id: r.id,
    createdAt: r.createdAt.toISOString(),
    source: r.source as RevisionSourceName,
    label: r.label,
    actor: nameOf(r.actor),
    author: nameOf(r.author),
    contributionId: r.contributionId,
    patrolled: !!r.patrol,
    patrolledBy: r.patrol?.patrolledById ? (patrollers.get(r.patrol.patrolledById) ?? null) : null,
    patrolledAt: r.patrol ? r.patrol.patrolledAt.toISOString() : null,
  }));
}

export function stripRow<T extends { row: unknown }>(item: T): Omit<T, 'row'> {
  const { row, ...rest } = item;
  void row;
  return rest;
}

export const PAGE_SIZE = 100;

/** Revisions of one target, newest first. `cursor` = id of the last row of the previous page. */
export async function listRevisions(targetType: RevisionTarget, targetId: string, cursor?: string | null, take = PAGE_SIZE) {
  const rows = await prisma.contentRevision.findMany({
    where: { targetType, targetId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: REVISION_LIST_SELECT,
  });
  const more = rows.length > take;
  const page = more ? rows.slice(0, take) : rows;
  return { items: await toListItems(page), nextCursor: more ? page[page.length - 1].id : null };
}

/** Does the target still exist? */
export async function targetExists(targetType: RevisionTarget, targetId: string): Promise<boolean> {
  switch (targetType) {
    case 'LESSON':
      return (await prisma.lesson.count({ where: { id: targetId } })) > 0;
    case 'CHAPTER':
      return (await prisma.chapter.count({ where: { id: targetId } })) > 0;
    case 'LIBRARY_ENTRY':
      return (await prisma.libraryEntry.count({ where: { id: targetId } })) > 0;
    case 'COURSE_OUTLINE':
      return (await prisma.course.count({ where: { id: targetId } })) > 0;
  }
}

/** Existing target ids per type, for a batch of rows (recent changes). */
export async function existingTargets(rows: { targetType: RevisionTarget; targetId: string }[]): Promise<Set<string>> {
  const ids = (t: RevisionTarget) => [...new Set(rows.filter((r) => r.targetType === t).map((r) => r.targetId))];
  const [lessons, chapters, entries, courses] = await Promise.all([
    ids('LESSON').length ? prisma.lesson.findMany({ where: { id: { in: ids('LESSON') } }, select: { id: true } }) : [],
    ids('CHAPTER').length ? prisma.chapter.findMany({ where: { id: { in: ids('CHAPTER') } }, select: { id: true } }) : [],
    ids('LIBRARY_ENTRY').length
      ? prisma.libraryEntry.findMany({ where: { id: { in: ids('LIBRARY_ENTRY') } }, select: { id: true } })
      : [],
    ids('COURSE_OUTLINE').length
      ? prisma.course.findMany({ where: { id: { in: ids('COURSE_OUTLINE') } }, select: { id: true } })
      : [],
  ]);
  return new Set([
    ...lessons.map((x) => `LESSON:${x.id}`),
    ...chapters.map((x) => `CHAPTER:${x.id}`),
    ...entries.map((x) => `LIBRARY_ENTRY:${x.id}`),
    ...courses.map((x) => `COURSE_OUTLINE:${x.id}`),
  ]);
}

/** The live version, in the same shape as a revision snapshot (null: none / deleted). */
export async function liveVersion(targetType: RevisionTarget, targetId: string): Promise<unknown | null> {
  switch (targetType) {
    case 'LESSON': {
      const c = await prisma.lessonContent.findUnique({ where: { lessonId: targetId }, select: { title: true, blocks: true } });
      return c ? { title: c.title, blocks: c.blocks ?? [] } : null;
    }
    case 'CHAPTER': {
      const c = await prisma.chapterContent.findUnique({ where: { chapterId: targetId }, select: { title: true, blocks: true } });
      return c ? { title: c.title, blocks: c.blocks ?? [] } : null;
    }
    case 'LIBRARY_ENTRY':
      return (await readEntrySnapshot(prisma as unknown as Prisma.TransactionClient, targetId))?.snapshot ?? null;
    case 'COURSE_OUTLINE':
      return buildOutline(prisma as unknown as Prisma.TransactionClient, targetId);
  }
}

/** Current display name of a target (falls back to the newest revision's label). */
export async function targetLabel(targetType: RevisionTarget, targetId: string): Promise<string | null> {
  switch (targetType) {
    case 'LESSON':
      return (await prisma.lesson.findUnique({ where: { id: targetId }, select: { name: true } }))?.name ?? null;
    case 'CHAPTER':
      return (await prisma.chapter.findUnique({ where: { id: targetId }, select: { title: true } }))?.title ?? null;
    case 'LIBRARY_ENTRY':
      return (await prisma.libraryEntry.findUnique({ where: { id: targetId }, select: { title: true } }))?.title ?? null;
    case 'COURSE_OUTLINE':
      return (await prisma.course.findUnique({ where: { id: targetId }, select: { name: true } }))?.name ?? null;
  }
}

/** Titles of library entries linked from any of the given entry snapshots. */
export async function entryLinkTitles(snapshots: unknown[]): Promise<Record<string, string>> {
  const ids = new Set<string>();
  for (const s of snapshots) if (s) for (const l of normalizeEntrySnapshot(s).links) ids.add(l.toId);
  if (!ids.size) return {};
  const rows = await prisma.libraryEntry.findMany({ where: { id: { in: [...ids] } }, select: { id: true, title: true } });
  return Object.fromEntries(rows.map((r) => [r.id, r.title]));
}

/** The revision just before `rev` for the same target (null: it is the first). */
export async function previousRevision(rev: { id: string; targetType: RevisionTarget; targetId: string; createdAt: Date }) {
  return prisma.contentRevision.findFirst({
    where: {
      targetType: rev.targetType,
      targetId: rev.targetId,
      OR: [{ createdAt: { lt: rev.createdAt } }, { createdAt: rev.createdAt, id: { lt: rev.id } }],
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: { id: true, createdAt: true, source: true, snapshot: true },
  });
}

export async function latestRevisionId(targetType: RevisionTarget, targetId: string): Promise<string | null> {
  const r = await prisma.contentRevision.findFirst({
    where: { targetType, targetId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: { id: true },
  });
  return r?.id ?? null;
}
