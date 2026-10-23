import type { Prisma } from '@prisma/client';
import { EDITABLE_LINK_KINDS, type EntryBody } from './schemas';

/**
 * The editable fields of a library entry as stored in a ContentRevision snapshot
 * (targetType LIBRARY_ENTRY). One builder for every writer (admin create/publish/delete,
 * EDIT_LIBRARY_ENTRY publishing, rollback), so diffs compare like with like.
 *
 * Always build the snapshot from the DATABASE row (`readEntrySnapshot`) inside the write's
 * transaction, before and after the write: the stored links are what `writeLinks()`
 * actually kept (a RELATED link that already exists the other way round is dropped), and
 * `meta` is the normalised meta. MENTIONS links are derived from the text and left out.
 *
 * slug, type and visibility are not part of the snapshot: a restore keeps the live values.
 */
export interface EntrySnapshot {
  title: string;
  summary: string;
  body: EntryBody | null;
  meta: Record<string, unknown>;
  links: { toId: string; kind: string; order: number }[];
}

const EDITABLE = new Set<string>(EDITABLE_LINK_KINDS);

/** Snapshot from entry fields + its outgoing links (any order; MENTIONS are dropped). */
export function entrySnapshot(e: {
  title: string;
  summary: string;
  body?: unknown;
  meta?: unknown;
  links: { toId: string; kind: string; order?: number | null }[];
}): EntrySnapshot {
  return {
    title: e.title,
    summary: e.summary,
    body: (e.body ?? null) as EntryBody | null,
    meta: e.meta && typeof e.meta === 'object' && !Array.isArray(e.meta) ? (e.meta as Record<string, unknown>) : {},
    links: e.links
      .filter((l) => EDITABLE.has(l.kind))
      .map((l) => ({ toId: l.toId, kind: l.kind, order: l.order ?? 0 }))
      .sort((a, b) => a.order - b.order || a.kind.localeCompare(b.kind) || a.toId.localeCompare(b.toId)),
  };
}

export interface LiveEntrySnapshot {
  /** Entry title: the revision label. */
  label: string;
  snapshot: EntrySnapshot;
}

/** Reads the live entry as a snapshot (null: no such entry). Use the transaction client. */
export async function readEntrySnapshot(tx: Prisma.TransactionClient, entryId: string): Promise<LiveEntrySnapshot | null> {
  const e = await tx.libraryEntry.findUnique({
    where: { id: entryId },
    select: {
      title: true,
      summary: true,
      body: true,
      meta: true,
      linksFrom: { select: { toId: true, kind: true, order: true } },
    },
  });
  if (!e) return null;
  return { label: e.title, snapshot: entrySnapshot({ ...e, links: e.linksFrom }) };
}

/** For recordRevision's `snapshot` / `previous`. */
export function entrySnapshotJson(s: EntrySnapshot): Prisma.InputJsonValue {
  return s as unknown as Prisma.InputJsonValue;
}
