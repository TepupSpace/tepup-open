import { z } from 'zod';
import type { ContentResult } from '@/lib/schemas/content-validation';
import {
  acronymMeta,
  bodySchema,
  conceptMeta,
  entryInput,
  linkInput,
  sourceMeta,
  toolMeta,
  type EntryBody,
  type EntryType,
} from '@/lib/library/schemas';

/**
 * EDIT_LIBRARY_ENTRY data: the contributor-safe subset of a library entry (proposal §2
 * decision 13). Pure: safe in client and server code.
 *
 *  - title, summary, body sections: same limits as the admin entry form (lib/library/schemas.ts);
 *  - meta: only DESCRIPTIVE keys (CONTRIBUTOR_META_KEYS). Admin-only keys (a tool's owner and
 *    review date, a source's lastCheckedAt) are never accepted; on publish they come from the
 *    live entry;
 *  - links: RELATED and CITES only. EXPANDS_TO stays admin-only; MENTIONS is rebuilt by the
 *    server from /tv/ links on every save.
 *
 * Never accepted: slug, type, isActive, sourceKey. The validator does not know the entry's
 * type (save routes only see `data`), so it accepts the union of descriptive keys; the
 * publisher keeps only the keys of the live entry's type and runs the full admin checks
 * (meta per type, link rules, source duplicates).
 */

export const CONTRIBUTOR_LINK_KINDS = ['RELATED', 'CITES'] as const;
export type ContributorLinkKind = (typeof CONTRIBUTOR_LINK_KINDS)[number];

/** Meta keys a contributor may propose, per entry type. Everything else is admin-only. */
export const CONTRIBUTOR_META_KEYS: Record<EntryType, readonly string[]> = {
  CONCEPT: ['titleEn', 'pronunciation'],
  SOURCE: [
    'sourceType',
    'authors',
    'year',
    'date',
    'containerTitle',
    'publisher',
    'url',
    'archivedUrl',
    'accessedAt',
    'language',
    'identifier',
    'durationMin',
  ],
  ACRONYM: ['expansion', 'expansionVi'],
  TOOL: ['tiers'],
};

const ALL_META_KEYS = [...new Set(Object.values(CONTRIBUTOR_META_KEYS).flat())];

// Every key optional: the type-specific "required" rules run at publish (parseMeta).
const descriptiveMeta = z.object({
  titleEn: conceptMeta.shape.titleEn,
  pronunciation: conceptMeta.shape.pronunciation,
  sourceType: sourceMeta.shape.sourceType.optional(),
  authors: z.array(z.string().trim().min(1).max(200)).max(50).optional(),
  year: sourceMeta.shape.year,
  date: sourceMeta.shape.date,
  containerTitle: sourceMeta.shape.containerTitle,
  publisher: sourceMeta.shape.publisher,
  url: sourceMeta.shape.url,
  archivedUrl: sourceMeta.shape.archivedUrl,
  accessedAt: sourceMeta.shape.accessedAt,
  language: z.string().regex(/^[a-z]{2}$/).optional(),
  identifier: sourceMeta.shape.identifier,
  durationMin: sourceMeta.shape.durationMin,
  expansion: acronymMeta.shape.expansion.optional(),
  expansionVi: acronymMeta.shape.expansionVi,
  tiers: toolMeta.shape.tiers.optional(),
});

const proposalLink = linkInput.extend({ kind: z.enum(CONTRIBUTOR_LINK_KINDS) });

const libraryEntryProposalSchema = z.object({
  title: entryInput.shape.title,
  summary: entryInput.shape.summary,
  body: bodySchema.nullable().optional(),
  meta: z.record(z.string(), z.unknown()).optional().default({}),
  links: z.array(proposalLink).max(200).optional().default([]),
});

export interface LibraryEntryProposal {
  title: string;
  summary: string;
  body: EntryBody | null;
  meta: Record<string, unknown>;
  links: { toId: string; kind: ContributorLinkKind; order: number }[];
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

function zodPath(base: string, path: PropertyKey[]): string {
  return path.reduce<string>((acc, k) => (typeof k === 'number' ? `${acc}[${k}]` : `${acc}.${String(k)}`), base);
}

/** Validates and cleans an EDIT_LIBRARY_ENTRY payload. Unknown keys are dropped. */
export function validateLibraryEntryProposal(data: unknown): ContentResult<LibraryEntryProposal> {
  const parsed = libraryEntryProposalSchema.safeParse(data);
  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.slice(0, 50).map((i) => ({ path: zodPath('data', i.path), message: i.message })),
    };
  }
  // Only the descriptive keys the author actually sent (no defaults injected), each checked
  // with the admin schema's rule for that field.
  const rawMeta = parsed.data.meta;
  const sent = Object.fromEntries(
    Object.entries(rawMeta).filter(([k, v]) => ALL_META_KEYS.includes(k) && v !== undefined && v !== null && v !== '')
  );
  const meta = descriptiveMeta.safeParse(sent);
  if (!meta.success) {
    return {
      ok: false,
      issues: meta.error.issues.slice(0, 50).map((i) => ({ path: zodPath('data.meta', i.path), message: i.message })),
    };
  }
  const cleanMeta = Object.fromEntries(Object.entries(meta.data).filter(([k, v]) => k in sent && v !== undefined));

  const seen = new Set<string>();
  const links = parsed.data.links.filter((l) => {
    const key = `${l.toId}:${l.kind}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    ok: true,
    value: {
      title: parsed.data.title,
      summary: parsed.data.summary,
      body: parsed.data.body ?? null,
      meta: cleanMeta,
      links,
    },
  };
}

/** The descriptive meta of `type`, picked from a (live or proposed) meta object. */
export function pickContributorMeta(type: EntryType, meta: unknown): Record<string, unknown> {
  if (!isObj(meta)) return {};
  const keys = CONTRIBUTOR_META_KEYS[type];
  return Object.fromEntries(Object.entries(meta).filter(([k, v]) => keys.includes(k) && v !== undefined));
}

/**
 * The contributor-editable subset of a live entry: the base snapshot of a proposal, and the
 * snapshot of LIBRARY_ENTRY revisions. Links sorted, so equal versions compare equal.
 */
export function entryProposalSnapshot(entry: {
  type: EntryType | string;
  title: string;
  summary: string;
  body: unknown;
  meta: unknown;
  linksFrom?: { toId: string; kind: string; order: number }[];
}): LibraryEntryProposal {
  const links = (entry.linksFrom ?? [])
    .filter((l): l is { toId: string; kind: ContributorLinkKind; order: number } =>
      (CONTRIBUTOR_LINK_KINDS as readonly string[]).includes(l.kind)
    )
    .map((l) => ({ toId: l.toId, kind: l.kind, order: l.order }))
    .sort((a, b) => a.kind.localeCompare(b.kind) || a.order - b.order || a.toId.localeCompare(b.toId));
  const body = isObj(entry.body) && Array.isArray(entry.body.sections) ? (entry.body as unknown as EntryBody) : null;
  return {
    title: entry.title,
    summary: entry.summary,
    body,
    meta: pickContributorMeta(entry.type as EntryType, entry.meta),
    links,
  };
}
