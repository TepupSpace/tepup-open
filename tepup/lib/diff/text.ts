import { align } from './lcs';

/**
 * Word-level text diff. Inline HTML is stripped first: diffs are compared and shown as
 * plain text, never rendered as HTML.
 */

export type SegmentOp = 'eq' | 'ins' | 'del';
export interface Segment {
  op: SegmentOp;
  text: string;
}

/** Above this many token pairs the changed middle is shown as one deletion + one insertion. */
export const WORD_MAX_CELLS = 600 * 600;

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/** Inline HTML → plain text (tags dropped, <br> and block ends become spaces, entities decoded). */
export function stripTags(input: string): string {
  if (!input.includes('<') && !input.includes('&')) return input;
  return input
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, code: string) => {
      if (code[0] === '#') {
        const n = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
        return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : m;
      }
      return ENTITIES[code.toLowerCase()] ?? m;
    });
}

// Words (letters with their combining marks, digits), whitespace runs, or one other character.
// Built with `new RegExp` so the ES2017 target doesn't reject \p{…}.
const TOKEN_RE = new RegExp('[\\p{L}\\p{M}\\p{N}_]+|\\s+|[^\\s\\p{L}\\p{M}\\p{N}_]', 'gu');

export function tokenize(text: string): string[] {
  return text.match(TOKEN_RE) ?? [];
}

function push(out: Segment[], op: SegmentOp, text: string) {
  if (!text) return;
  const last = out[out.length - 1];
  if (last && last.op === op) last.text += text;
  else out.push({ op, text });
}

/** Word diff of two plain strings. Equal inputs give a single `eq` segment. */
export function wordDiff(before: string, after: string, maxCells = WORD_MAX_CELLS): Segment[] {
  if (before === after) return before ? [{ op: 'eq', text: before }] : [];
  const a = tokenize(before);
  const b = tokenize(after);
  const { ops, approximate } = align(a, b, maxCells);
  const out: Segment[] = [];
  if (approximate) {
    // Keep the common prefix/suffix, show the middle as a whole replacement.
    const dels: string[] = [];
    const ins: string[] = [];
    let flushed = false;
    for (const o of ops) {
      if (o.op === 'eq') {
        if (!flushed && (dels.length || ins.length)) {
          push(out, 'del', dels.join(''));
          push(out, 'ins', ins.join(''));
          flushed = true;
        }
        push(out, 'eq', a[o.a]);
      } else if (o.op === 'del') dels.push(a[o.a]);
      else ins.push(b[o.b]);
    }
    if (!flushed) {
      push(out, 'del', dels.join(''));
      push(out, 'ins', ins.join(''));
    }
    return out;
  }
  // Group each run of changes as "deleted text, then inserted text" so it reads naturally.
  let dels = '';
  let ins = '';
  const flush = () => {
    push(out, 'del', dels);
    push(out, 'ins', ins);
    dels = '';
    ins = '';
  };
  for (let k = 0; k < ops.length; k++) {
    const o = ops[k];
    if (o.op === 'eq') {
      // A lone space between two changes reads better inside the change.
      const next = ops[k + 1];
      if ((dels || ins) && /^\s+$/.test(a[o.a]) && next && next.op !== 'eq') {
        dels += a[o.a];
        ins += a[o.a];
        continue;
      }
      flush();
      push(out, 'eq', a[o.a]);
    } else if (o.op === 'del') dels += a[o.a];
    else ins += b[o.b];
  }
  flush();
  return out;
}

/** Short excerpt for lists: collapses whitespace and cuts at `max` characters. */
export function excerpt(text: string, max = 400): string {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}
