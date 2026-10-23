import type { LessonFlagKind } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { PublicFlagKind } from '@/lib/types/lesson-notices';

/**
 * Maintenance flags (proposal §6.21). Course roles with FLAG (maintainers, trusted reviewers,
 * global reviewers, admins) set and resolve them; learners see a fixed banner for the public
 * kinds, through the cached lesson read (lesson-notices). Notes are staff-only and never
 * reach a cached public page. Every change calls revalidateContent().
 */

export const PUBLIC_FLAG_KINDS: readonly PublicFlagKind[] = ['NEEDS_SOURCES', 'UNDER_REVIEW', 'OUTDATED'];
export const ALL_FLAG_KINDS: readonly LessonFlagKind[] = ['NEEDS_SOURCES', 'UNDER_REVIEW', 'OUTDATED', 'NEEDS_ACCESSIBILITY'];

export function isFlagKind(v: unknown): v is LessonFlagKind {
  return typeof v === 'string' && (ALL_FLAG_KINDS as readonly string[]).includes(v);
}

export function isPublicFlagKind(k: LessonFlagKind): k is PublicFlagKind {
  return (PUBLIC_FLAG_KINDS as readonly string[]).includes(k);
}

/** Max length of a staff note on a flag. */
export const FLAG_NOTE_MAX = 1_000;

/** Unresolved flags of the lesson whose kind has a learner banner, once per kind, in a fixed order. */
export async function getPublicLessonFlags(lessonId: string): Promise<PublicFlagKind[]> {
  const rows = await prisma.lessonFlag.findMany({
    where: { lessonId, resolvedAt: null, kind: { in: [...PUBLIC_FLAG_KINDS] } },
    select: { kind: true },
  });
  const open = new Set(rows.map((r) => r.kind));
  return PUBLIC_FLAG_KINDS.filter((k) => open.has(k));
}

export interface LessonFlagView {
  id: string;
  kind: LessonFlagKind;
  /** Only for users with FLAG on the course. */
  note: string | null;
  createdAt: string;
  createdBy: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
}

/** How long resolved flags stay listed in the lesson hub. */
const RECENT_RESOLVED_DAYS = 90;

/**
 * Open flags plus flags resolved in the last 90 days (at most 10), for the lesson hub.
 * Notes and names only when `staff` (FLAG on the course). The caller checks lesson visibility.
 */
export async function listLessonFlags(lessonId: string, staff: boolean): Promise<{ open: LessonFlagView[]; resolved: LessonFlagView[] }> {
  const since = new Date(Date.now() - RECENT_RESOLVED_DAYS * 24 * 60 * 60 * 1000);
  const [open, resolved] = await Promise.all([
    prisma.lessonFlag.findMany({ where: { lessonId, resolvedAt: null }, orderBy: { createdAt: 'desc' } }),
    prisma.lessonFlag.findMany({
      where: { lessonId, resolvedAt: { gte: since } },
      orderBy: { resolvedAt: 'desc' },
      take: 10,
    }),
  ]);
  const userIds = staff
    ? [...new Set([...open, ...resolved].flatMap((f) => [f.createdById, f.resolvedById]).filter((id): id is string => !!id))]
    : [];
  const users = userIds.length
    ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, username: true } })
    : [];
  const name = new Map(users.map((u) => [u.id, u.username ?? null]));
  const view = (f: (typeof open)[number]): LessonFlagView => ({
    id: f.id,
    kind: f.kind,
    note: staff ? f.note : null,
    createdAt: f.createdAt.toISOString(),
    createdBy: staff && f.createdById ? (name.get(f.createdById) ?? null) : null,
    resolvedAt: f.resolvedAt ? f.resolvedAt.toISOString() : null,
    resolvedBy: staff && f.resolvedById ? (name.get(f.resolvedById) ?? null) : null,
  });
  return { open: open.map(view), resolved: resolved.map(view) };
}
