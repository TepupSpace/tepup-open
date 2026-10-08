/**
 * Accessibility checks for lesson content that never block a save.
 *
 * Validation (`lib/schemas/blocks.ts`) only checks structure, so a half-written block
 * still saves. These checks are the soft layer on top: they list what learners using a
 * screen reader or without sound would miss, in Vietnamese, for the author to fix.
 *
 * Pure and DOM-free: the editor shows them live, and the save routes may return them
 * next to (never instead of) a successful save.
 */
import type { ImageBlock } from '@/lib/types/content';

/**
 * A bare file name, such as "IMG_2041.jpg" or "Flag_of_Vietnam.svg". Before October
 * 2026 the editor saved the uploaded file's name as the image alt text, so saved
 * lessons still contain these. They describe nothing and are treated as missing.
 */
const FILE_NAME = /^[^\n/\\]{1,200}\.(?:jpe?g|png|gif|webp|avif|svg|bmp|tiff?|heic|heif)$/i;

export function looksLikeFileName(text: string): boolean {
  return FILE_NAME.test(text.trim());
}

/** The alt text an author actually wrote: '' when it is empty or only a file name. */
export function authoredAlt(alt: unknown): string {
  if (typeof alt !== 'string') return '';
  const t = alt.trim();
  return t && !looksLikeFileName(t) ? t : '';
}

/**
 * The `alt` to render: '' for a decorative image, else the author's description,
 * else the caption, else ''. Never the file name.
 */
export function imageAltText(block: Pick<ImageBlock, 'alt' | 'caption' | 'decorative'>): string {
  if (block.decorative) return '';
  return authoredAlt(block.alt) || (typeof block.caption === 'string' ? block.caption.trim() : '');
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const hasText = (v: unknown) => typeof v === 'string' && v.trim() !== '';

function blockWarning(block: Obj): string | null {
  switch (block.type) {
    case 'image':
      if (!hasText(block.src) || block.decorative === true || authoredAlt(block.alt)) return null;
      return 'Ảnh chưa có mô tả (alt). Viết một câu mô tả nội dung ảnh, hoặc đánh dấu "Ảnh trang trí".';
    case 'video':
      if (!hasText(block.url) || hasText(block.captionsUrl) || hasText(block.transcript)) return null;
      return 'Video chưa có phụ đề hay bản ghi lời. Thêm tệp phụ đề .vtt hoặc bản ghi lời.';
    case 'audio':
      if (!hasText(block.url) || hasText(block.captionsUrl) || hasText(block.transcript)) return null;
      return 'Âm thanh chưa có bản ghi lời. Thêm bản ghi lời để người không nghe được vẫn theo dõi được.';
    default:
      return null;
  }
}

/**
 * Non-blocking accessibility warnings for a lesson's blocks, one line per problem:
 * `Block #N (image) — …`. N counts from 1 over the array passed in, so pass the
 * trimmed array (`trimEmptyBlocks`) for N to match the editor gutter. Problems inside
 * a toggle are reported on the toggle's own number.
 */
export function accessibilityWarnings(blocks: unknown): string[] {
  if (!Array.isArray(blocks)) return [];
  const out: string[] = [];
  const walk = (list: unknown[], label: string, depth: number) => {
    for (const block of list) {
      if (!isObj(block)) continue;
      const w = blockWarning(block);
      if (w) out.push(`${label} (${String(block.type)}) — ${w}`);
      if (block.type === 'toggle' && Array.isArray(block.children) && depth < 10) {
        walk(block.children, `${label} › trong toggle`, depth + 1);
      }
    }
  };
  blocks.forEach((block, i) => walk([block], `Block #${i + 1}`, 0));
  return out;
}
