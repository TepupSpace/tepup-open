import { diffFields, humanizePath, type FieldChange } from './fields';

/**
 * Diff of two versions of a library entry's editable fields (the ContentRevision
 * snapshot, lib/library/entry-snapshot.ts): title, summary, body sections, meta, links.
 */

export interface EntryLinkLike {
  toId: string;
  kind: string;
  order: number;
}

export interface EntrySnapshotLike {
  title: string;
  summary: string;
  body: unknown;
  meta: Record<string, unknown>;
  links: EntryLinkLike[];
}

export interface EntryDiffResult {
  fields: FieldChange[];
  truncated: number;
  links: { added: EntryLinkLike[]; removed: EntryLinkLike[]; reordered: EntryLinkLike[] };
  summary: { fields: number; linksAdded: number; linksRemoved: number; linksReordered: number };
}

/** Accepts anything (old or malformed snapshots) and returns a well-formed snapshot. */
export function normalizeEntrySnapshot(v: unknown): EntrySnapshotLike {
  const o = v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
  const links = Array.isArray(o.links) ? o.links : [];
  return {
    title: typeof o.title === 'string' ? o.title : '',
    summary: typeof o.summary === 'string' ? o.summary : '',
    body: o.body ?? null,
    meta: o.meta && typeof o.meta === 'object' && !Array.isArray(o.meta) ? (o.meta as Record<string, unknown>) : {},
    links: links
      .filter((l): l is Record<string, unknown> => !!l && typeof l === 'object')
      .map((l) => ({ toId: String(l.toId ?? ''), kind: String(l.kind ?? ''), order: Number(l.order) || 0 })),
  };
}

const linkKey = (l: EntryLinkLike) => `${l.kind}:${l.toId}`;

export function diffEntry(beforeRaw: unknown | null, afterRaw: unknown): EntryDiffResult {
  const before = beforeRaw == null ? null : normalizeEntrySnapshot(beforeRaw);
  const after = normalizeEntrySnapshot(afterRaw);
  const pick = (s: EntrySnapshotLike | null) =>
    s ? { title: s.title, summary: s.summary, body: s.body, meta: s.meta } : {};
  const { changes, truncated } = diffFields(pick(before), pick(after));

  const a = new Map((before?.links ?? []).map((l) => [linkKey(l), l]));
  const b = new Map(after.links.map((l) => [linkKey(l), l]));
  const added = after.links.filter((l) => !a.has(linkKey(l)));
  const removed = (before?.links ?? []).filter((l) => !b.has(linkKey(l)));
  const reordered = after.links.filter((l) => {
    const old = a.get(linkKey(l));
    return !!old && old.order !== l.order;
  });
  return {
    fields: changes,
    truncated,
    links: { added, removed, reordered },
    summary: {
      fields: changes.length + truncated,
      linksAdded: added.length,
      linksRemoved: removed.length,
      linksReordered: reordered.length,
    },
  };
}

const ENTRY_LABELS: Record<string, string> = {
  title: 'Tiêu đề',
  summary: 'Xem nhanh',
  body: 'Thân bài',
  sections: 'phần',
  heading: 'tiêu đề',
  paragraphs: 'đoạn',
  meta: 'Thông tin thêm',
};

/** `body.sections[0].paragraphs[2]` → `Thân bài › phần #1 › đoạn #3`. */
export function entryFieldLabel(path: string): string {
  return humanizePath(path, ENTRY_LABELS);
}
