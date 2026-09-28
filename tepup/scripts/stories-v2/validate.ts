/**
 * Hard length + structure guard for authored story chapters.
 *
 * Writing ~77 chapters across many sessions has one predictable failure mode:
 * the later chapters get shorter than the earlier ones. This module is the
 * mechanical defence — the seeder refuses to `--apply` anything that fails it,
 * and prints the numbers on every dry run so drift is visible immediately.
 */
import type { ContentBlock } from '../../lib/types/content';
import type { StorySeed } from './types';

/** Mirrors INTERACTIVE_BLOCK_MAP in components/learn/BlockRenderer.tsx.
 *  Any other block type is dropped silently by the renderer, so authoring one
 *  is the same as authoring nothing. Keep these two lists in sync. */
export const INTERACTIVE_BLOCK_TYPES = [
  'calculator',
  'slider-simulator',
  'budget-allocator',
  'bias-detector',
  'perspective-switch',
  'hot-cold-guess',
  'pair-match',
  'flip-card',
  'sort-bucket',
  'custom',
] as const;

/** Basic + native block types that BlockRenderer / NativeBlock actually draw. */
const RENDERABLE = new Set([
  'text', 'callout', 'image', 'question', 'library-document', 'step-break',
  'heading', 'quote', 'code', 'bullet-list', 'numbered-list',
  'check-list', 'toggle', 'table', 'video', 'audio', 'file',
]);

export const RULES = {
  minBlocks: 20,
  maxBlocks: 28,
  minQuestions: 2,
  minProseChars: 3_500,
  /** A closing success callout must appear within this many blocks of the end. */
  closingWindow: 3,
} as const;

/** Keys whose values are machine identifiers, not prose. */
const NON_PROSE_KEYS = new Set([
  'type', 'id', 'icon', 'variant', 'mode', 'src', 'documentId', 'documentSlug',
  'color', 'slug', 'unit', 'format', 'language', 'kind', 'bucketId', 'calculatorType',
  'formula', 'condition', 'url', 'biasType',
]);

function proseChars(value: unknown, key?: string): number {
  if (typeof value === 'string') return key && NON_PROSE_KEYS.has(key) ? 0 : value.length;
  if (Array.isArray(value)) return value.reduce<number>((n, v) => n + proseChars(v), 0);
  if (value && typeof value === 'object') {
    return Object.entries(value).reduce<number>((n, [k, v]) => n + proseChars(v, k), 0);
  }
  return 0;
}

export interface ChapterStats {
  slug: string;
  title: string;
  blocks: number;
  questions: number;
  interactive: number;
  chars: number;
  errors: string[];
}

export interface StoryStats {
  slug: string;
  chapters: ChapterStats[];
  interactive: number;
  errors: string[];
  get ok(): boolean;
}

function checkChapter(slug: string, title: string, blocks: ContentBlock[]): ChapterStats {
  const errors: string[] = [];
  const types = blocks.map((b) => (b as { type: string }).type);
  const questions = types.filter((t) => t === 'question').length;
  const interactive = types.filter((t) => (INTERACTIVE_BLOCK_TYPES as readonly string[]).includes(t)).length;
  const chars = proseChars(blocks);

  if (blocks.length < RULES.minBlocks) errors.push(`chỉ ${blocks.length} block (tối thiểu ${RULES.minBlocks})`);
  if (blocks.length > RULES.maxBlocks) errors.push(`${blocks.length} block (tối đa ${RULES.maxBlocks})`);
  if (questions < RULES.minQuestions) errors.push(`chỉ ${questions} câu hỏi (tối thiểu ${RULES.minQuestions})`);
  if (chars < RULES.minProseChars) errors.push(`chỉ ${chars} ký tự nội dung (tối thiểu ${RULES.minProseChars})`);

  const closing = blocks.slice(-RULES.closingWindow);
  const hasSuccess = closing.some(
    (b) => (b as { type: string }).type === 'callout' && (b as { variant?: string }).variant === 'success'
  );
  if (!hasSuccess) errors.push(`không có callout success trong ${RULES.closingWindow} block cuối`);

  const unknown = types.filter(
    (t) => !RENDERABLE.has(t) && !(INTERACTIVE_BLOCK_TYPES as readonly string[]).includes(t)
  );
  if (unknown.length) errors.push(`block type không render được: ${[...new Set(unknown)].join(', ')}`);

  return { slug, title, blocks: blocks.length, questions, interactive, chars, errors };
}

export function validateStory(story: StorySeed): StoryStats {
  const chapters = story.part.chapters.map((c) => checkChapter(c.slug, c.title, c.blocks));
  const interactive = chapters.reduce((n, c) => n + c.interactive, 0);
  const errors: string[] = [];

  if (story.part.chapters.length < 2) errors.push(`chỉ ${story.part.chapters.length} chương`);
  if (interactive < 1) errors.push('không có block tương tác nào (cần 1-2 mỗi story)');
  if (!story.courseSlugs.length) errors.push('chưa gắn course nào');

  const dupes = story.part.chapters
    .map((c) => c.slug)
    .filter((s, i, a) => a.indexOf(s) !== i);
  if (dupes.length) errors.push(`slug chương trùng: ${[...new Set(dupes)].join(', ')}`);

  return {
    slug: story.slug,
    chapters,
    interactive,
    errors,
    get ok() {
      return this.errors.length === 0 && this.chapters.every((c) => c.errors.length === 0);
    },
  };
}

/** One aligned line per chapter, so drift between stories is obvious at a glance. */
export function formatStats(stats: StoryStats): string[] {
  const out = [
    `  ${stats.slug}  —  ${stats.chapters.length} chương, ${stats.interactive} block tương tác`,
  ];
  for (const c of stats.chapters) {
    const flag = c.errors.length ? '✗' : '✓';
    out.push(
      `    ${flag} ${c.slug.padEnd(34)} ${String(c.blocks).padStart(2)} block  ` +
        `${String(c.questions)} hỏi  ${String(c.chars).padStart(5)} ký tự` +
        (c.errors.length ? `\n        └ ${c.errors.join('; ')}` : '')
    );
  }
  for (const e of stats.errors) out.push(`    ✗ ${e}`);
  return out;
}
