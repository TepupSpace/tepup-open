import { stripTags, wordDiff, type Segment } from './text';

/** JSON.stringify with object keys sorted at every level: equal content → equal string. */
export function stableStringify(value: unknown): string {
  if (value === undefined) return 'null';
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj)
    .filter((k) => obj[k] !== undefined)
    .sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
}

export interface Leaf {
  /** Display value: the string itself, or the JSON of a number/boolean/null/empty container. */
  value: string;
  isString: boolean;
}

/** Flattens JSON into `path → leaf` (paths like `options[1].text`). */
export function flatten(value: unknown, prefix = '', out = new Map<string, Leaf>()): Map<string, Leaf> {
  if (Array.isArray(value)) {
    if (value.length === 0) out.set(prefix, { value: '[]', isString: false });
    value.forEach((v, i) => flatten(v, `${prefix}[${i}]`, out));
  } else if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).filter((k) => obj[k] !== undefined);
    if (keys.length === 0) out.set(prefix, { value: '{}', isString: false });
    for (const k of keys.sort()) flatten(obj[k], prefix ? `${prefix}.${k}` : k, out);
  } else if (typeof value === 'string') {
    out.set(prefix, { value, isString: true });
  } else {
    out.set(prefix, { value: value === undefined ? 'null' : JSON.stringify(value), isString: false });
  }
  return out;
}

export interface FieldChange {
  /** Raw path (`options[1].isCorrect`); see humanizePath for display. */
  path: string;
  kind: 'changed' | 'added' | 'removed';
  /** Plain text (tags stripped) or JSON for non-strings. */
  before?: string;
  after?: string;
  /** Word diff, for a changed text field. */
  words?: Segment[];
  /** Only the inline markup changed (bold, links…); the text is the same. */
  markupOnly?: boolean;
}

export const MAX_FIELD_CHANGES = 100;

const collator = new Intl.Collator('en', { numeric: true });

/**
 * Field-level diff of two JSON values (both flattened). Text fields get a word diff.
 * `skip(path)` drops paths that are noise (the block `type`, a text block's legacy
 * `paragraphs` when both sides have `html`…).
 */
export function diffFields(
  before: unknown,
  after: unknown,
  skip: (path: string) => boolean = () => false,
): { changes: FieldChange[]; truncated: number } {
  const a = flatten(before);
  const b = flatten(after);
  const paths = [...new Set([...a.keys(), ...b.keys()])].filter((p) => !skip(p)).sort(collator.compare);
  const changes: FieldChange[] = [];
  let truncated = 0;
  for (const path of paths) {
    const x = a.get(path);
    const y = b.get(path);
    if (x && y && x.value === y.value && x.isString === y.isString) continue;
    if (changes.length >= MAX_FIELD_CHANGES) {
      truncated++;
      continue;
    }
    const show = (l: Leaf) => (l.isString ? stripTags(l.value) : l.value);
    if (!x) changes.push({ path, kind: 'added', after: show(y!) });
    else if (!y) changes.push({ path, kind: 'removed', before: show(x) });
    else if (x.isString && y.isString) {
      const before = stripTags(x.value);
      const after = stripTags(y.value);
      if (before === after) changes.push({ path, kind: 'changed', before, after, markupOnly: true });
      else changes.push({ path, kind: 'changed', before, after, words: wordDiff(before, after) });
    } else changes.push({ path, kind: 'changed', before: show(x), after: show(y) });
  }
  return { changes, truncated };
}

/** `options[1].text` → `options #2 › text` (1-based, like the editor's numbering). */
export function humanizePath(path: string, labels: Record<string, string> = {}): string {
  if (!path) return '(giá trị)';
  return path
    .replace(/\[(\d+)\]/g, (_m, i: string) => ` #${Number(i) + 1}`)
    .split('.')
    .map((part) => {
      const [key, ...rest] = part.split(' ');
      return [labels[key] ?? key, ...rest].join(' ');
    })
    .join(' › ');
}
