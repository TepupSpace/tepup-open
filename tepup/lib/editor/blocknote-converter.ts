/**
 * Two-way converter between the canonical `ContentBlock[]` (stored in DB) and
 * BlockNote's document JSON (`PartialBlock[]`). BlockNote is only an editing layer;
 * `ContentBlock[]` stays the source of truth, so the learner renderer never changes.
 *
 * Native rich-text blocks (paragraph/heading/lists/quote/code/table/media/toggle) map
 * to their `ContentBlock` counterparts. Every Tepup widget (callout, question, the
 * interactive blocks, custom) is carried opaquely inside a single custom BlockNote
 * block `tepup-widget` whose `props.payload` is the JSON of the original ContentBlock —
 * so adding a new widget type never touches this converter.
 *
 * Pure & DOM-free (uses `inline-html` helpers) so it round-trips in Node tests.
 */
import type { ContentBlock, ListItem, CheckListItem } from '@/lib/types/content';
import { inlineToHtml, htmlToInline, type InlineContent } from './inline-html';

// Minimal shape of a BlockNote block (subset of PartialBlock we read/write).
export interface BNBlock {
  id?: string;
  type: string;
  props?: Record<string, unknown>;
  content?: unknown;
  children?: BNBlock[];
}

/** Block `type`s that are Tepup widgets (edited via the drawer, stored opaquely). */
const WIDGET_TYPES = new Set([
  'callout',
  'question',
  'library-document',
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
]);

// ---------- helpers ----------
function asInline(content: unknown): InlineContent[] {
  return Array.isArray(content) ? (content as InlineContent[]) : [];
}

/** Plain text of inline content (for code blocks). */
function inlineToText(content: unknown): string {
  return asInline(content)
    .map((n) => (n.type === 'link' ? n.content.map((t) => t.text).join('') : n.text))
    .join('');
}

function textInline(text: string): InlineContent[] {
  return text ? [{ type: 'text', text, styles: {} }] : [];
}

function clampLevel(v: unknown): 1 | 2 | 3 {
  const n = typeof v === 'number' ? v : 1;
  return (n <= 1 ? 1 : n >= 3 ? 3 : 2) as 1 | 2 | 3;
}

// ---------- BlockNote -> ContentBlock ----------
function listItemsToContent(children: BNBlock[] | undefined, listTypes: string[]): ListItem[] {
  const items: ListItem[] = [];
  for (const c of children ?? []) {
    if (!listTypes.includes(c.type)) continue;
    const nested = listItemsToContent(c.children, listTypes);
    const item: ListItem = { html: inlineToHtml(asInline(c.content)) };
    if (nested.length) item.children = nested;
    items.push(item);
  }
  return items;
}

function checkItemsToContent(children: BNBlock[] | undefined): CheckListItem[] {
  const items: CheckListItem[] = [];
  for (const c of children ?? []) {
    if (c.type !== 'checkListItem') continue;
    const nested = checkItemsToContent(c.children);
    const item: CheckListItem = {
      html: inlineToHtml(asInline(c.content)),
      checked: Boolean((c.props ?? {}).checked),
    };
    if (nested.length) item.children = nested;
    items.push(item);
  }
  return items;
}

function tableRowsToContent(content: unknown): string[][] {
  const rows = (content as { rows?: Array<{ cells?: unknown[] }> } | undefined)?.rows ?? [];
  return rows.map((r) =>
    (r.cells ?? []).map((cell) =>
      // cells may be InlineContent[] or { content: InlineContent[] } depending on version
      inlineToHtml(Array.isArray(cell) ? (cell as InlineContent[]) : asInline((cell as { content?: unknown })?.content))
    )
  );
}

function bnBlockToContent(b: BNBlock): ContentBlock | null {
  const props = b.props ?? {};
  const id = b.id;
  const withId = <T extends object>(o: T): ContentBlock => ({ ...(o as object), ...(id ? { id } : {}) }) as ContentBlock;

  switch (b.type) {
    case 'paragraph':
      return withId({ type: 'text', paragraphs: [], html: inlineToHtml(asInline(b.content)) });
    case 'heading':
      return withId({ type: 'heading', level: clampLevel(props.level), html: inlineToHtml(asInline(b.content)) });
    case 'quote':
      return withId({ type: 'quote', html: inlineToHtml(asInline(b.content)) });
    case 'codeBlock':
      return withId({ type: 'code', language: (props.language as string) || undefined, code: inlineToText(b.content) });
    case 'toggleListItem':
      return withId({ type: 'toggle', html: inlineToHtml(asInline(b.content)), children: toContentBlocks(b.children ?? []) });
    case 'table':
      return withId({ type: 'table', rows: tableRowsToContent(b.content) });
    case 'image':
      return withId({ type: 'image', src: (props.url as string) || '', alt: (props.name as string) || (props.caption as string) || '', caption: (props.caption as string) || undefined });
    case 'video':
      return withId({ type: 'video', url: (props.url as string) || '', caption: (props.caption as string) || undefined });
    case 'audio':
      return withId({ type: 'audio', url: (props.url as string) || '', caption: (props.caption as string) || undefined });
    case 'file':
      return withId({ type: 'file', url: (props.url as string) || '', name: (props.name as string) || undefined, caption: (props.caption as string) || undefined });
    case 'step-break':
      return withId({ type: 'step-break', ...(props.label ? { label: props.label as string } : {}) });
    case 'tepup-widget': {
      try {
        const payload = JSON.parse(String(props.payload ?? 'null'));
        if (payload && typeof payload === 'object') return (id ? { ...payload, id } : payload) as ContentBlock;
      } catch { /* fall through */ }
      return null;
    }
    default:
      return null; // list items handled by the run-grouping loop; unknown types dropped
  }
}

export function toContentBlocks(bnBlocks: BNBlock[]): ContentBlock[] {
  const out: ContentBlock[] = [];
  for (let i = 0; i < bnBlocks.length; i++) {
    const b = bnBlocks[i];
    // Group a run of consecutive list items of the same kind into one list block.
    if (b.type === 'bulletListItem' || b.type === 'numberedListItem' || b.type === 'checkListItem') {
      const kind = b.type;
      const run: BNBlock[] = [];
      while (i < bnBlocks.length && bnBlocks[i].type === kind) run.push(bnBlocks[i++]);
      i--; // step back; outer loop will ++
      const id = run[0].id;
      if (kind === 'checkListItem') {
        out.push({ type: 'check-list', items: checkItemsToContent(run), ...(id ? { id } : {}) });
      } else {
        const listTypes = [kind];
        const items = listItemsToContent(run, listTypes);
        out.push({ type: kind === 'bulletListItem' ? 'bullet-list' : 'numbered-list', items, ...(id ? { id } : {}) });
      }
      continue;
    }
    const cb = bnBlockToContent(b);
    if (cb) out.push(cb);
  }
  return out;
}

// ---------- ContentBlock -> BlockNote ----------
function listItemsToBN(items: ListItem[], type: 'bulletListItem' | 'numberedListItem'): BNBlock[] {
  return items.map((it) => ({
    type,
    content: htmlToInline(it.html),
    ...(it.children && it.children.length ? { children: listItemsToBN(it.children, type) } : {}),
  }));
}

function checkItemsToBN(items: CheckListItem[]): BNBlock[] {
  return items.map((it) => ({
    type: 'checkListItem',
    props: { checked: it.checked },
    content: htmlToInline(it.html),
    ...(it.children && it.children.length ? { children: checkItemsToBN(it.children) } : {}),
  }));
}

/** Convert one ContentBlock into one-or-more BlockNote blocks. */
function contentBlockToBN(block: ContentBlock): BNBlock[] {
  const id = block.id;
  const withId = (b: BNBlock): BNBlock => (id ? { id, ...b } : b);

  switch (block.type) {
    case 'text': {
      if (block.html !== undefined) return [withId({ type: 'paragraph', content: htmlToInline(block.html) })];
      // Legacy: optional title + array of plain paragraphs -> heading + paragraphs
      const blocks: BNBlock[] = [];
      if (block.title) blocks.push({ type: 'heading', props: { level: 3 }, content: textInline(block.title) });
      for (const p of block.paragraphs ?? []) blocks.push({ type: 'paragraph', content: textInline(p) });
      if (blocks.length === 0) blocks.push({ type: 'paragraph', content: [] });
      return blocks;
    }
    case 'heading':
      return [withId({ type: 'heading', props: { level: block.level }, content: htmlToInline(block.html) })];
    case 'quote':
      return [withId({ type: 'quote', content: htmlToInline(block.html) })];
    case 'code':
      return [withId({ type: 'codeBlock', props: { language: block.language || 'text' }, content: textInline(block.code) })];
    case 'bullet-list':
      return listItemsToBN(block.items, 'bulletListItem');
    case 'numbered-list':
      return listItemsToBN(block.items, 'numberedListItem');
    case 'check-list':
      return checkItemsToBN(block.items);
    case 'toggle':
      return [withId({ type: 'toggleListItem', content: htmlToInline(block.html), children: toBlockNote(block.children) })];
    case 'table':
      return [withId({ type: 'table', content: { type: 'tableContent', rows: block.rows.map((cells) => ({ cells: cells.map((c) => htmlToInline(c)) })) } })];
    case 'image':
      return [withId({ type: 'image', props: { url: block.src, caption: block.caption ?? '', name: block.alt ?? '' } })];
    case 'video':
      return [withId({ type: 'video', props: { url: block.url, caption: block.caption ?? '' } })];
    case 'audio':
      return [withId({ type: 'audio', props: { url: block.url, caption: block.caption ?? '' } })];
    case 'file':
      return [withId({ type: 'file', props: { url: block.url, name: block.name ?? '', caption: block.caption ?? '' } })];
    case 'step-break':
      return [withId({ type: 'step-break', props: { label: block.label ?? '' } })];
    default:
      // Any Tepup widget -> opaque payload node.
      if (WIDGET_TYPES.has(block.type)) {
        return [withId({ type: 'tepup-widget', props: { payload: JSON.stringify(block) } })];
      }
      return [];
  }
}

export function toBlockNote(blocks: ContentBlock[]): BNBlock[] {
  return blocks.flatMap(contentBlockToBN);
}
