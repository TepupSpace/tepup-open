/**
 * Kiểm tra + làm sạch nội dung bài học ở SERVER, trước khi lưu.
 *
 * Hai mức tin cậy:
 *  - `validateContributionData` / `validateContributorBlocks` — contributor (tự đăng
 *    ký, KHÔNG tin cậy): schema chặt cho từng loại block, từ chối loại lạ và `custom`,
 *    kiểm tra URL media, cú pháp công thức, và lọc HTML.
 *  - `sanitizeAdminBlocks` — admin (tin cậy hơn, nhưng một phiên admin bị chiếm vẫn
 *    không được lưu script): không ép schema (không làm vỡ nội dung cũ/`custom`), chỉ
 *    lọc HTML và từ chối URL media ngoài allowlist.
 *
 * Lọc HTML lúc render (`components/learn/*`) vẫn là lớp chặn chính cho nội dung đã
 * nằm sẵn trong database; đây là lớp thứ hai.
 */
import { z } from 'zod';
import { STRICT_BLOCK_SCHEMAS, isStrictBlockType, CONTENT_LIMITS } from './blocks';
import { sanitizeInlineHtml } from '@/lib/security/sanitize-html';
import { isAllowedMediaUrl, ALLOWED_MEDIA_HOSTS_LABEL } from '@/lib/security/safe-url';
import { checkExpr } from '@/lib/security/safe-expr';
import { trimEmptyBlocks } from '@/lib/editor/trim-empty-blocks';
import type { ContentBlock } from '@/lib/types/content';

export interface ContentIssue {
  path: string;
  message: string;
}

export type ContentResult<T> = { ok: true; value: T } | { ok: false; issues: ContentIssue[] };

/** Toàn bộ payload một đóng góp, tính theo độ dài JSON. */
const MAX_PAYLOAD_CHARS = 2_000_000;
const MAX_ISSUES = 50;

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

class Issues {
  list: ContentIssue[] = [];
  add(path: string, message: string) {
    if (this.list.length < MAX_ISSUES) this.list.push({ path, message });
  }
  get empty() {
    return this.list.length === 0;
  }
}

// --- shared walkers --------------------------------------------------------

function sanitizeListItems(items: unknown): unknown {
  if (!Array.isArray(items)) return items;
  return items.map((it) => {
    if (!isObj(it)) return it;
    const out: Obj = { ...it, html: sanitizeInlineHtml(it.html) };
    if (Array.isArray(it.children)) out.children = sanitizeListItems(it.children);
    return out;
  });
}

/** Lọc mọi trường HTML của một block (không đệ quy vào `toggle.children`). */
function sanitizeHtmlFields(block: Obj): Obj {
  switch (block.type) {
    case 'text':
      return typeof block.html === 'string' ? { ...block, html: sanitizeInlineHtml(block.html) } : block;
    case 'heading':
    case 'quote':
    case 'toggle':
      return { ...block, html: sanitizeInlineHtml(block.html) };
    case 'bullet-list':
    case 'numbered-list':
    case 'check-list':
      return { ...block, items: sanitizeListItems(block.items) };
    case 'table':
      return Array.isArray(block.rows)
        ? {
            ...block,
            rows: block.rows.map((row) => (Array.isArray(row) ? row.map((c) => sanitizeInlineHtml(c)) : row)),
          }
        : block;
    default:
      return block;
  }
}

const MEDIA_MSG = `URL media không được phép — chỉ dùng ảnh/tệp đã tải lên kho của Tépup hoặc Wikimedia / media URL not allowed (allowed: ${ALLOWED_MEDIA_HOSTS_LABEL}, or a same-site path)`;

/** URL media: rỗng = tác giả chưa chọn (bản nháp) — cho qua; còn lại phải trong allowlist. */
function checkMedia(url: unknown, path: string, issues: Issues) {
  if (url === undefined || url === '') return;
  if (!isAllowedMediaUrl(url)) issues.add(path, MEDIA_MSG);
}

function checkMediaFields(block: Obj, path: string, issues: Issues) {
  switch (block.type) {
    case 'image':
      checkMedia(block.src, `${path}.src`, issues);
      break;
    case 'video':
    case 'audio':
    case 'file':
      checkMedia(block.url, `${path}.url`, issues);
      break;
    case 'flip-card':
      if (Array.isArray(block.cards)) {
        block.cards.forEach((card, i) => {
          if (!isObj(card)) return;
          for (const side of ['front', 'back'] as const) {
            const face = card[side];
            if (isObj(face) && face.kind === 'image') checkMedia(face.src, `${path}.cards[${i}].${side}.src`, issues);
          }
        });
      }
      break;
  }
}

function checkFormula(src: unknown, path: string, issues: Issues) {
  if (typeof src !== 'string' || src.trim() === '') return; // draft: not written yet
  const err = checkExpr(src);
  if (err) {
    issues.add(path, `Công thức không hợp lệ / invalid formula: ${err} (dùng + - * / % **, so sánh, && || ?:, Math.min/max/round…)`);
  }
}

function checkFormulas(block: Obj, path: string, issues: Issues) {
  const each = (list: unknown, key: string, at: string) => {
    if (Array.isArray(list)) list.forEach((x, i) => isObj(x) && checkFormula(x[key], `${path}.${at}[${i}].${key}`, issues));
  };
  switch (block.type) {
    case 'calculator':
      checkFormula(block.formula, `${path}.formula`, issues);
      each(block.outputs, 'formula', 'outputs');
      break;
    case 'slider-simulator':
      each(block.outputs, 'formula', 'outputs');
      if (isObj(block.chart)) each(block.chart.bars, 'formula', 'chart.bars');
      each(block.breakpoints, 'condition', 'breakpoints');
      break;
    case 'budget-allocator':
      each(block.outcomes, 'condition', 'outcomes');
      break;
  }
}

function zodPath(base: string, issuePath: PropertyKey[]): string {
  return issuePath.reduce<string>(
    (acc, k) => (typeof k === 'number' ? `${acc}[${k}]` : `${acc}.${String(k)}`),
    base,
  );
}

// --- contributor (untrusted) ----------------------------------------------

interface ContributorOptions {
  /** Admin dùng luồng contributor: cho phép block `custom` (Sandpack). */
  allowCustom?: boolean;
}

function validateBlockList(
  blocks: unknown,
  path: string,
  issues: Issues,
  opts: ContributorOptions,
  depth: number,
): unknown[] {
  if (!Array.isArray(blocks)) {
    issues.add(path, 'Phải là danh sách block / must be an array of blocks');
    return [];
  }
  // Drop empty lines first (they'd be blank steps in the player; trimEmptyBlocks also
  // handles toggle children), so "Block #N" in issues matches the editor's numbering.
  if (depth === 0) blocks = trimEmptyBlocks(blocks as ContentBlock[]).blocks;
  if (!Array.isArray(blocks)) return [];
  if (blocks.length > CONTENT_LIMITS.blocksPerLesson) {
    issues.add(path, `Tối đa ${CONTENT_LIMITS.blocksPerLesson} block / too many blocks`);
    return [];
  }
  const out: unknown[] = [];
  blocks.forEach((raw, i) => {
    const at = `${path}[${i}]`;
    if (!isObj(raw)) {
      issues.add(at, 'Block không hợp lệ / invalid block');
      return;
    }
    if (raw.type === 'custom') {
      if (opts.allowCustom) out.push(raw);
      else issues.add(at, 'Chỉ admin được dùng block tuỳ chỉnh (custom) / custom blocks are admin-only');
      return;
    }
    if (!isStrictBlockType(raw.type)) {
      issues.add(at, `Loại block không được hỗ trợ / unsupported block type: ${String(raw.type).slice(0, 40)}`);
      return;
    }
    const parsed = (STRICT_BLOCK_SCHEMAS[raw.type] as z.ZodType<Obj>).safeParse(raw);
    if (!parsed.success) {
      for (const iss of parsed.error.issues) issues.add(zodPath(at, iss.path), iss.message);
      return;
    }
    let block = parsed.data;
    checkMediaFields(block, at, issues);
    checkFormulas(block, at, issues);
    block = sanitizeHtmlFields(block);
    if (block.type === 'toggle') {
      if (depth >= CONTENT_LIMITS.toggleDepth) {
        issues.add(at, `Toggle lồng quá ${CONTENT_LIMITS.toggleDepth} cấp / toggles nested too deep`);
        return;
      }
      block = { ...block, children: validateBlockList(block.children, `${at}.children`, issues, opts, depth + 1) };
    }
    out.push(block);
  });
  return out;
}

/** Kiểm tra + làm sạch một mảng block của contributor. */
export function validateContributorBlocks(
  blocks: unknown,
  opts: ContributorOptions = {},
  path = 'blocks',
): ContentResult<unknown[]> {
  const issues = new Issues();
  const value = validateBlockList(blocks, path, issues, opts, 0);
  return issues.empty ? { ok: true, value } : { ok: false, issues: issues.list };
}

// Level/lesson names may be blank mid-draft; only the course itself needs a name.
const name = z.string().max(200);
const courseContributionSchema = z.object({
  course: z.object({
    name: z.string().trim().min(1, 'Không được để trống / required').max(200),
    slug: z.string().max(200),
    description: z.string().max(CONTENT_LIMITS.text).optional().default(''),
    categoryId: z.string().min(1).max(CONTENT_LIMITS.id),
    icon: z.string().max(CONTENT_LIMITS.icon).optional().default(''),
  }),
  levels: z
    .array(
      z.object({
        name,
        sortOrder: z.number().int().min(0).max(10_000),
        lessons: z
          .array(
            z.object({
              name,
              sortOrder: z.number().int().min(0).max(10_000),
              content: z.object({
                title: z.string().max(CONTENT_LIMITS.short),
                blocks: z.array(z.unknown()),
              }),
            }),
          )
          .max(200),
      }),
    )
    .max(50),
});

const lessonContentContributionSchema = z.object({ blocks: z.array(z.unknown()) });

/** Các loại đóng góp mà hệ thống thật sự xuất bản được (xem contribution-service). */
export const SUPPORTED_CONTRIBUTION_TYPES = ['NEW_COURSE', 'EDIT_LESSON_CONTENT'] as const;
export type SupportedContributionType = (typeof SUPPORTED_CONTRIBUTION_TYPES)[number];

export function isSupportedContributionType(t: unknown): t is SupportedContributionType {
  return typeof t === 'string' && (SUPPORTED_CONTRIBUTION_TYPES as readonly string[]).includes(t);
}

/**
 * Kiểm tra toàn bộ `data` của một đóng góp theo loại. Trả về bản đã làm sạch (HTML
 * lọc, khoá lạ bị bỏ) để lưu thay cho bản gốc.
 */
export function validateContributionData(
  type: SupportedContributionType,
  data: unknown,
  opts: ContributorOptions = {},
): ContentResult<unknown> {
  let size = Infinity;
  try {
    size = JSON.stringify(data)?.length ?? 0;
  } catch {
    /* circular / BigInt — impossible from req.json(), treat as too big */
  }
  if (size > MAX_PAYLOAD_CHARS) {
    return { ok: false, issues: [{ path: 'data', message: 'Nội dung quá lớn / payload too large' }] };
  }

  const issues = new Issues();
  if (type === 'NEW_COURSE') {
    const parsed = courseContributionSchema.safeParse(data);
    if (!parsed.success) {
      for (const iss of parsed.error.issues) issues.add(zodPath('data', iss.path), iss.message);
      return { ok: false, issues: issues.list };
    }
    const value = parsed.data;
    value.levels.forEach((level, li) =>
      level.lessons.forEach((lesson, si) => {
        lesson.content.blocks = validateBlockList(
          lesson.content.blocks,
          `data.levels[${li}].lessons[${si}].content.blocks`,
          issues,
          opts,
          0,
        );
      }),
    );
    return issues.empty ? { ok: true, value } : { ok: false, issues: issues.list };
  }

  const parsed = lessonContentContributionSchema.safeParse(data);
  if (!parsed.success) {
    for (const iss of parsed.error.issues) issues.add(zodPath('data', iss.path), iss.message);
    return { ok: false, issues: issues.list };
  }
  const blocks = validateBlockList(parsed.data.blocks, 'data.blocks', issues, opts, 0);
  return issues.empty ? { ok: true, value: { blocks } } : { ok: false, issues: issues.list };
}

// --- admin (trusted, but defence in depth) ---------------------------------

function sanitizeAdminList(blocks: unknown[], path: string, issues: Issues, depth: number): unknown[] {
  return blocks.map((raw, i) => {
    const at = `${path}[${i}]`;
    if (!isObj(raw)) return raw;
    checkMediaFields(raw, at, issues);
    let block = sanitizeHtmlFields(raw);
    if (block.type === 'toggle' && Array.isArray(block.children) && depth < 10) {
      block = { ...block, children: sanitizeAdminList(block.children, `${at}.children`, issues, depth + 1) };
    }
    return block;
  });
}

/**
 * Nội dung admin lưu: lọc HTML ở mọi block, từ chối URL media ngoài allowlist.
 * Không ép schema — block `custom` và nội dung cũ đi qua nguyên vẹn.
 */
export function sanitizeAdminBlocks(blocks: unknown, path = 'blocks'): ContentResult<unknown[]> {
  if (blocks === undefined || blocks === null) return { ok: true, value: [] };
  if (!Array.isArray(blocks)) {
    return { ok: false, issues: [{ path, message: 'Phải là danh sách block / must be an array of blocks' }] };
  }
  const issues = new Issues();
  const value = sanitizeAdminList(blocks, path, issues, 0);
  return issues.empty ? { ok: true, value } : { ok: false, issues: issues.list };
}

// --- response helper -------------------------------------------------------

/**
 * `blocks[6].options[1]` → `Block #7 › options[1]`: the same 1-based number the editor
 * shows in its gutter (and that `prepareBlocksForSave` errors use), so authors can find
 * the block. Only the top-level block index is renumbered.
 */
export function describeContentPath(path: string): string {
  return path.replace(/(^|\.)blocks\[(\d+)\]\.?/, (_m, sep: string, i: string) =>
    `${sep ? ' › ' : ''}Block #${Number(i) + 1}${_m.endsWith('.') ? ' › ' : ''}`
  );
}

/**
 * Body JSON cho phản hồi 400. `error` chứa luôn lỗi đầu tiên vì giao diện hiện chỉ
 * hiển thị `data.error`; `details` liệt kê đủ để debug.
 */
export function contentErrorBody(issues: ContentIssue[]) {
  const readable = issues.map((iss) => ({ ...iss, path: describeContentPath(iss.path) }));
  const first = readable[0];
  const more = readable.length > 1 ? ` (+${readable.length - 1} lỗi khác / more)` : '';
  return {
    error: `Nội dung không hợp lệ / Invalid content — ${first ? `${first.path}: ${first.message}` : ''}${more}`,
    details: readable,
  };
}
