/**
 * Drops empty lines from lesson / chapter content before it is saved.
 *
 * Every BlockNote paragraph becomes its own `text` block, so each press of Enter on an
 * empty line (and the empty paragraph BlockNote keeps at the end of the document) used
 * to be saved as an empty block. Without `step-break` markers the player reveals one
 * block per tap, so learners had to tap "Tiếp tục" through blank steps.
 *
 * Pure and DOM-free: the editors use it on what they send (drafts and publish), and the
 * publish paths run it again on the server. Block numbers in the editor and in error
 * messages ("Block #N") count the blocks that survive this, so they match.
 */
import type { ContentBlock, ListItem } from '@/lib/types/content';

/** Line breaks, non-breaking spaces and whitespace at either end of inline HTML. */
const EDGE_BLANKS = /^(?:\s|&nbsp;|&#160;| |<br\s*\/?>)+|(?:\s|&nbsp;|&#160;| |<br\s*\/?>)+$/gi;

/** True when inline HTML has no visible text (only tags, breaks and spaces). */
export function isBlankHtml(html: unknown): boolean {
  if (html === undefined || html === null || html === '') return true;
  if (typeof html !== 'string') return false; // malformed: not ours to drop
  return (
    html
      .replace(/<br\s*\/?>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;|&#160;| /gi, '')
      .trim() === ''
  );
}

/** Removes blank lines at the start and end of inline HTML; inner breaks stay. */
export function trimHtmlEdges(html: string): string {
  return html.replace(EDGE_BLANKS, '');
}

// Content can come from untrusted contributors, so nothing here may throw on a
// malformed block: anything unexpected counts as "not empty" and is left for the
// validator to report.
const isBlankString = (v: unknown) => v === undefined || v === null || (typeof v === 'string' && !v.trim());
const optionalList = (v: unknown): unknown[] | null => (v === undefined || v === null ? [] : Array.isArray(v) ? v : null);

function isBlankListItem(item: unknown): boolean {
  if (!item || typeof item !== 'object') return false;
  const { html, children } = item as ListItem;
  const kids = optionalList(children);
  return isBlankHtml(html) && kids !== null && kids.every(isBlankListItem);
}

/**
 * True for blocks that render as nothing but empty space: a text, heading or quote
 * without visible text, or a list whose items are all empty. Widgets, media, tables,
 * toggles and step-breaks are never "empty" here: half-finished widgets are the
 * validator's job, not this function's.
 */
export function isEmptyBlock(block: ContentBlock): boolean {
  if (!block || typeof block !== 'object') return false;
  switch (block.type) {
    case 'text': {
      const paragraphs = optionalList(block.paragraphs);
      return (
        isBlankString(block.title) &&
        isBlankHtml(block.html) &&
        paragraphs !== null &&
        paragraphs.every(isBlankString)
      );
    }
    case 'heading':
    case 'quote':
      return isBlankHtml(block.html);
    case 'bullet-list':
    case 'numbered-list':
    case 'check-list': {
      const items = optionalList(block.items);
      return items !== null && items.every(isBlankListItem);
    }
    default:
      return false;
  }
}

function trimBlock(block: ContentBlock): ContentBlock {
  if (block.type === 'text' && typeof block.html === 'string') {
    const html = trimHtmlEdges(block.html);
    return html === block.html ? block : { ...block, html };
  }
  if (block.type === 'toggle' && Array.isArray(block.children)) {
    const { blocks: children, removed } = trimEmptyBlocks(block.children);
    return removed ? { ...block, children } : block;
  }
  return block;
}

/**
 * Returns the blocks without empty ones (top, bottom and in between, including inside
 * toggles) and with blank lines trimmed from the edges of text blocks, plus how many
 * blocks were dropped. Idempotent; unchanged blocks keep their identity. Anything that
 * isn't an array is returned as is, for the validator to reject.
 */
export function trimEmptyBlocks<T>(blocks: T): { blocks: T; removed: number } {
  if (!Array.isArray(blocks)) return { blocks, removed: 0 };
  const out: ContentBlock[] = [];
  let removed = 0;
  for (const raw of blocks as ContentBlock[]) {
    if (!raw || typeof raw !== 'object') {
      out.push(raw); // malformed: leave it for the validator to report
      continue;
    }
    const block = trimBlock(raw);
    if (isEmptyBlock(block)) removed++;
    else out.push(block);
  }
  return { blocks: out as unknown as T, removed };
}
