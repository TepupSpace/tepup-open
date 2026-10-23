import { align } from './lcs';
import { diffFields, flatten, stableStringify, type FieldChange } from './fields';
import { excerpt, stripTags, wordDiff, type Segment } from './text';

/**
 * Block-level diff of lesson/chapter content (proposal §6.5).
 *
 * Blocks have no stable ids, so they are matched by LCS over their normalised JSON
 * (stable key order). Inside each run of changes, a removed block and an added block of
 * the same type, in order, are paired as CHANGED and get a field diff (word diff for
 * text fields, a list of changed fields for interactive blocks).
 */

export type BlockDiffEntry =
  | { kind: 'same'; beforeIndex: number; afterIndex: number; type: string }
  | { kind: 'added'; afterIndex: number; type: string; text: string }
  | { kind: 'removed'; beforeIndex: number; type: string; text: string }
  | {
      kind: 'changed';
      beforeIndex: number;
      afterIndex: number;
      type: string;
      fields: FieldChange[];
      /** Changed fields left out of `fields` (MAX_FIELD_CHANGES). */
      truncated: number;
    };

export interface BlockListDiff {
  entries: BlockDiffEntry[];
  summary: { added: number; removed: number; changed: number; unchanged: number };
  /** The lesson was too large for a full LCS; blocks were paired by position. */
  approximate: boolean;
}

export interface BlocksVersionLike {
  title: string;
  blocks: unknown[];
}

export interface BlocksVersionDiff extends BlockListDiff {
  title: { before: string | null; after: string; changed: boolean; words: Segment[] };
}

export function blockType(block: unknown): string {
  if (block && typeof block === 'object' && typeof (block as { type?: unknown }).type === 'string') {
    return (block as { type: string }).type;
  }
  return '?';
}

function hasHtml(block: unknown): boolean {
  return !!block && typeof block === 'object' && typeof (block as { html?: unknown }).html === 'string';
}

/** Paths that are noise in a block diff. */
function skipFor(a: unknown, b: unknown) {
  // Text blocks keep legacy `paragraphs` next to `html`; learners see `html`.
  const legacyParagraphs = hasHtml(a) && hasHtml(b);
  return (path: string) => path === 'type' || (legacyParagraphs && /^paragraphs(\[|$)/.test(path));
}

const QUIET_KEY = /(^|\.)(type|id|[a-zA-Z]*Id|color|icon|format|variant)$/;

/** The readable text of a block, for "added"/"removed" rows (tags stripped, shortened). */
export function blockText(block: unknown, max = 400): string {
  const leaves = flatten(block);
  const html = hasHtml(block);
  const parts: string[] = [];
  for (const [path, leaf] of leaves) {
    if (!leaf.isString || !leaf.value.trim()) continue;
    if (QUIET_KEY.test(path.replace(/\[\d+\]/g, ''))) continue;
    if (html && /^paragraphs(\[|$)/.test(path)) continue;
    parts.push(stripTags(leaf.value));
  }
  return excerpt(parts.join(' · '), max);
}

/** Diff of two block arrays. */
export function diffBlockLists(before: readonly unknown[], after: readonly unknown[]): BlockListDiff {
  const keysA = before.map(stableStringify);
  const keysB = after.map(stableStringify);
  const { ops, approximate } = align(keysA, keysB);

  const entries: BlockDiffEntry[] = [];
  const summary = { added: 0, removed: 0, changed: 0, unchanged: 0 };

  const flushHunk = (dels: number[], ins: number[]) => {
    if (!dels.length && !ins.length) return;
    // Pair in order: each removed block with the next added block of the same type.
    const pairs: [number, number][] = [];
    let from = 0;
    for (const d of dels) {
      const t = blockType(before[d]);
      for (let k = from; k < ins.length; k++) {
        if (blockType(after[ins[k]]) === t) {
          pairs.push([d, ins[k]]);
          from = k + 1;
          break;
        }
      }
    }
    const pairedA = new Set(pairs.map((p) => p[0]));
    const pairedB = new Set(pairs.map((p) => p[1]));
    let di = 0;
    let ii = 0;
    const emitRemovedUntil = (limit: number) => {
      while (di < dels.length && dels[di] < limit) {
        const d = dels[di++];
        if (pairedA.has(d)) continue;
        entries.push({ kind: 'removed', beforeIndex: d, type: blockType(before[d]), text: blockText(before[d]) });
        summary.removed++;
      }
    };
    const emitAddedUntil = (limit: number) => {
      while (ii < ins.length && ins[ii] < limit) {
        const n = ins[ii++];
        if (pairedB.has(n)) continue;
        entries.push({ kind: 'added', afterIndex: n, type: blockType(after[n]), text: blockText(after[n]) });
        summary.added++;
      }
    };
    for (const [d, n] of pairs) {
      emitRemovedUntil(d);
      emitAddedUntil(n);
      const { changes, truncated } = diffFields(before[d], after[n], skipFor(before[d], after[n]));
      entries.push({ kind: 'changed', beforeIndex: d, afterIndex: n, type: blockType(after[n]), fields: changes, truncated });
      summary.changed++;
    }
    emitRemovedUntil(Infinity);
    emitAddedUntil(Infinity);
  };

  let dels: number[] = [];
  let ins: number[] = [];
  for (const o of ops) {
    if (o.op === 'eq') {
      flushHunk(dels, ins);
      dels = [];
      ins = [];
      entries.push({ kind: 'same', beforeIndex: o.a, afterIndex: o.b, type: blockType(after[o.b]) });
      summary.unchanged++;
    } else if (o.op === 'del') dels.push(o.a);
    else ins.push(o.b);
  }
  flushHunk(dels, ins);
  return { entries, summary, approximate };
}

function asBlocks(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

/** Diff of two `{ title, blocks }` versions. `before` null: there was no content. */
export function diffBlocksVersion(before: BlocksVersionLike | null, after: BlocksVersionLike): BlocksVersionDiff {
  const list = diffBlockLists(asBlocks(before?.blocks), asBlocks(after.blocks));
  const beforeTitle = before ? String(before.title ?? '') : null;
  const afterTitle = String(after.title ?? '');
  const changed = beforeTitle !== null && beforeTitle !== afterTitle;
  return {
    ...list,
    title: {
      before: beforeTitle,
      after: afterTitle,
      changed,
      words: changed ? wordDiff(beforeTitle ?? '', afterTitle) : [],
    },
  };
}

/** Collapses runs of unchanged blocks for display: `{ kind: 'same-run', count, from, to }`. */
export type DisplayEntry =
  | Exclude<BlockDiffEntry, { kind: 'same' }>
  | { kind: 'same-run'; count: number; fromAfter: number; toAfter: number };

export function collapseSame(entries: readonly BlockDiffEntry[]): DisplayEntry[] {
  const out: DisplayEntry[] = [];
  for (const e of entries) {
    if (e.kind !== 'same') {
      out.push(e);
      continue;
    }
    const last = out[out.length - 1];
    if (last && last.kind === 'same-run') {
      last.count++;
      last.toAfter = e.afterIndex;
    } else out.push({ kind: 'same-run', count: 1, fromAfter: e.afterIndex, toAfter: e.afterIndex });
  }
  return out;
}
