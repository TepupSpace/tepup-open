/**
 * Kiểm tra dữ liệu mục thư viện (LibraryEntry) trước khi lưu.
 *
 * `meta` là JSON tự do trong database; mỗi loại mục có một schema riêng ở đây.
 * Các quy tắc cần tới database (viết tắt có ít nhất một EXPANDS_TO, đích của link
 * đúng loại, nguồn không trùng) nằm ở `entry-service.ts`.
 *
 * Thiết kế: docs/design-reference-library.md §4.
 */
import { z } from 'zod';
import { isSafeLinkHref } from '@/lib/security/safe-url';
import { ENTRY_SLUG_MAX, ENTRY_SLUG_RE } from './refs';

/**
 * Một loại cho mọi kiến thức (CONCEPT, "Mục từ") — không chia chủ đề/thuật ngữ/lĩnh vực.
 * Các mục nối với nhau thành mạng (RELATED, và link /tv/ trong thân bài), không xếp cây.
 * Nguồn, viết tắt và công cụ giữ loại riêng vì có trường riêng (trích dẫn, dạng đầy đủ,
 * mức làm theo). Quyết định 14.10.2026 — docs/design-reference-library.md §4, §12.
 */
export const ENTRY_TYPES = ['CONCEPT', 'SOURCE', 'ACRONYM', 'TOOL'] as const;
export type EntryType = (typeof ENTRY_TYPES)[number];

/** MENTIONS do server tự dựng từ link /tv/ trong thân bài (liên kết ngược); không sửa tay. */
export const LINK_KINDS = ['RELATED', 'CITES', 'EXPANDS_TO', 'MENTIONS'] as const;
export type LinkKind = (typeof LINK_KINDS)[number];
export const EDITABLE_LINK_KINDS = ['RELATED', 'CITES', 'EXPANDS_TO'] as const;

/** Xem nhanh tối đa 200 ký tự (§6.2). */
export const SUMMARY_MAX = 200;

const httpUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((u) => /^https?:\/\//i.test(u) && isSafeLinkHref(u), 'Phải là link http(s) hợp lệ');

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Dạng ngày yyyy-mm-dd');

export const bodySchema = z.object({
  sections: z
    .array(
      z.object({
        heading: z.string().max(200).optional(),
        paragraphs: z.array(z.string().max(5000)).max(60),
      }),
    )
    .max(40),
});
export type EntryBody = z.infer<typeof bodySchema>;

export const SOURCE_TYPES = [
  'sach',
  'bai-bao-khoa-hoc',
  'bao-chi',
  'van-ban-phap-luat',
  'podcast',
  'video',
  'trang-web',
  'du-lieu',
] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];
export const TOOL_TIERS = ['co-ban', 'tot-hon', 'ky-luong'] as const;

export const conceptMeta = z.object({
  /** Tên tiếng Anh (hoặc tên gốc), hiện cạnh tiêu đề. */
  titleEn: z.string().max(200).optional(),
  pronunciation: z.string().max(200).optional(),
});

export const sourceMeta = z
  .object({
    sourceType: z.enum(SOURCE_TYPES),
    authors: z.array(z.string().trim().min(1).max(200)).max(50).default([]),
    year: z.number().int().min(1000).max(2100).optional(),
    /** Ngày đăng/phát sóng, khi có (báo chí, podcast). */
    date: isoDate.optional(),
    /** Tạp chí, tờ báo, chương trình, kênh. */
    containerTitle: z.string().max(300).optional(),
    publisher: z.string().max(300).optional(),
    url: httpUrl.optional(),
    archivedUrl: httpUrl.optional(),
    accessedAt: isoDate.optional(),
    language: z.string().regex(/^[a-z]{2}$/).default('vi'),
    /** DOI, ISBN, số hiệu văn bản. */
    identifier: z.string().max(200).optional(),
    durationMin: z.number().int().min(1).max(10000).optional(),
    /** Dành cho bộ kiểm tra link chết (đang tạm gác — §11). */
    lastCheckedAt: z.string().optional(),
  })
  .refine(
    (m) => !!m.url || ((m.sourceType === 'sach' || m.sourceType === 'van-ban-phap-luat') && !!m.identifier),
    { message: 'Nguồn cần có link, trừ sách hoặc văn bản pháp luật đã có số hiệu/ISBN', path: ['url'] },
  );
export type SourceMeta = z.infer<typeof sourceMeta>;

export const acronymMeta = z.object({
  expansion: z.string().trim().min(1).max(300),
  expansionVi: z.string().max(300).optional(),
});

export const toolMeta = z.object({
  owner: z.string().trim().min(1).max(200),
  reviewBy: isoDate,
  tiers: z
    .array(
      z.object({
        level: z.enum(TOOL_TIERS),
        what: z.string().trim().min(1).max(2000),
        minutes: z.number().int().min(1).max(600).optional(),
        limits: z.string().max(1000).optional(),
        picks: z.array(z.object({ name: z.string().trim().min(1).max(200), url: httpUrl })).max(10).default([]),
      }),
    )
    .max(3)
    .default([]),
});
export type ToolMeta = z.infer<typeof toolMeta>;

export const META_SCHEMAS = {
  CONCEPT: conceptMeta,
  SOURCE: sourceMeta,
  ACRONYM: acronymMeta,
  TOOL: toolMeta,
} as const;

export const linkInput = z.object({
  toId: z.string().min(1),
  kind: z.enum(EDITABLE_LINK_KINDS),
  order: z.number().int().min(0).max(1000).default(0),
});
export type LinkInput = z.infer<typeof linkInput>;

/** Dữ liệu một mục khi admin tạo/sửa. `meta` được kiểm tra theo `type` sau. */
export const entryInput = z.object({
  slug: z
    .string()
    .trim()
    .max(ENTRY_SLUG_MAX)
    .regex(ENTRY_SLUG_RE, 'Slug chỉ gồm chữ thường không dấu, số và gạch ngang'),
  type: z.enum(ENTRY_TYPES),
  title: z.string().trim().min(1, 'Tiêu đề là bắt buộc').max(300),
  summary: z
    .string()
    .trim()
    .min(1, 'Phần xem nhanh là bắt buộc')
    .max(SUMMARY_MAX, `Phần xem nhanh tối đa ${SUMMARY_MAX} ký tự`),
  body: bodySchema.nullable().optional(),
  meta: z.record(z.string(), z.unknown()).default({}),
  isActive: z.boolean().default(true),
  links: z.array(linkInput).max(200).default([]),
});
export type EntryInput = z.infer<typeof entryInput>;

/** Kiểm tra `meta` theo loại; trả về meta đã chuẩn hoá hoặc danh sách lỗi. */
export function parseMeta(type: EntryType, meta: unknown):
  | { ok: true; meta: Record<string, unknown> }
  | { ok: false; errors: string[] } {
  const res = META_SCHEMAS[type].safeParse(meta ?? {});
  if (res.success) return { ok: true, meta: res.data as Record<string, unknown> };
  return {
    ok: false,
    errors: res.error.issues.map((i) => `${i.path.length ? `meta.${i.path.join('.')}: ` : ''}${i.message}`),
  };
}

/**
 * Link nào được phép đi từ loại nào tới loại nào. RELATED là quan hệ hai chiều, lưu một lần
 * (A→B hiện ở cả A lẫn B). Nguồn không trỏ đi đâu: mục nào dùng nguồn thì CITES nó, và
 * nguồn hiện "Được trích trong" từ các link đi vào.
 */
export const LINK_RULES: Record<LinkKind, { from: EntryType[]; to: EntryType[] }> = {
  RELATED: { from: ['CONCEPT', 'TOOL'], to: ['CONCEPT', 'TOOL'] },
  CITES: { from: ['CONCEPT', 'TOOL'], to: ['SOURCE'] },
  EXPANDS_TO: { from: ['ACRONYM'], to: ['CONCEPT', 'TOOL'] },
  MENTIONS: { from: ['CONCEPT', 'SOURCE', 'ACRONYM', 'TOOL'], to: ['CONCEPT', 'SOURCE', 'ACRONYM', 'TOOL'] },
};

export const TYPE_LABELS: Record<EntryType, string> = {
  CONCEPT: 'Mục từ',
  SOURCE: 'Nguồn',
  ACRONYM: 'Viết tắt',
  TOOL: 'Công cụ',
};

export const TOOL_TIER_LABELS: Record<(typeof TOOL_TIERS)[number], string> = {
  'co-ban': 'Cơ bản',
  'tot-hon': 'Tốt hơn',
  'ky-luong': 'Kỹ lưỡng',
};
