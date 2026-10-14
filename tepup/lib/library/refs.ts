/**
 * Link tham chiếu tới thư viện: `/tv/<slug>` hoặc `/tv/<slug>#<phần>`.
 *
 * Đây là dạng link DUY NHẤT trỏ nội bộ được phép đi qua bộ lọc HTML và trình
 * render markdown (xem `lib/security/safe-url.ts`). Mẫu cố tình hẹp: slug chỉ gồm
 * a-z, 0-9 và gạch ngang, không có `..`, không có đường dẫn con, nên không thể
 * dùng nó để trỏ sang trang khác của site.
 *
 * Thiết kế: docs/design-reference-library.md §5.
 */

export const TV_PREFIX = '/tv/';

/** Slug mục thư viện: chữ thường không dấu, số, gạch ngang giữa các cụm. */
export const ENTRY_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const ENTRY_SLUG_MAX = 80;

const TV_HREF_RE = /^\/tv\/([a-z0-9]+(?:-[a-z0-9]+)*)(?:#(\d{1,3}))?$/;

export interface TvRef {
  slug: string;
  /** Chỉ số phần (0-based) trong thân bài của mục, nếu link có `#n`. */
  section?: number;
}

export function isValidEntrySlug(slug: unknown): slug is string {
  return typeof slug === 'string' && slug.length <= ENTRY_SLUG_MAX && ENTRY_SLUG_RE.test(slug);
}

/** `href` có đúng dạng link tham chiếu không. So khớp nguyên chuỗi, không trim. */
export function isTvHref(href: unknown): href is string {
  return typeof href === 'string' && href.length <= 4 + ENTRY_SLUG_MAX + 4 && TV_HREF_RE.test(href);
}

export function parseTvHref(href: unknown): TvRef | null {
  if (!isTvHref(href)) return null;
  const m = TV_HREF_RE.exec(href)!;
  return m[2] === undefined ? { slug: m[1] } : { slug: m[1], section: Number(m[2]) };
}

export function tvHref(slug: string, section?: number): string {
  return section === undefined ? `${TV_PREFIX}${slug}` : `${TV_PREFIX}${slug}#${section}`;
}

/**
 * Tìm link tham chiếu trong một chuỗi bất kỳ của nội dung: `href="/tv/x"` trong rich
 * text hoặc `](/tv/x)` trong markdown. Phải đứng sau dấu nháy hoặc ngoặc đơn, để
 * `https://site.khac/tv/x` không bị tính.
 */
const TV_IN_TEXT_RE = /(?:^|["'(])\/tv\/([a-z0-9]+(?:-[a-z0-9]+)*)(?:#\d{1,3})?(?=["')]|$)/g;

/** Đếm số lần mỗi slug được trỏ tới trong một giá trị JSON (đi sâu mọi chuỗi). */
export function collectTvSlugs(value: unknown, into: Map<string, number> = new Map()): Map<string, number> {
  if (typeof value === 'string') {
    if (value.includes(TV_PREFIX)) {
      for (const m of value.matchAll(TV_IN_TEXT_RE)) {
        into.set(m[1], (into.get(m[1]) ?? 0) + 1);
      }
    }
  } else if (Array.isArray(value)) {
    for (const v of value) collectTvSlugs(v, into);
  } else if (value && typeof value === 'object') {
    for (const v of Object.values(value)) collectTvSlugs(v, into);
  }
  return into;
}

/**
 * Tài liệu mà các block `library-document` (chế độ tham chiếu) trỏ tới, theo id hoặc
 * slug. Dùng cho chỉ mục ngược sau khi LibraryDocument được chuyển sang LibraryEntry
 * (giữ nguyên id/slug — giai đoạn 5).
 */
export function collectLibraryDocumentRefs(blocks: unknown): { ids: string[]; slugs: string[] } {
  const ids: string[] = [];
  const slugs: string[] = [];
  const walk = (v: unknown) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') {
      const o = v as Record<string, unknown>;
      if (o.type === 'library-document' && o.mode !== 'inline') {
        if (typeof o.documentId === 'string' && o.documentId) ids.push(o.documentId);
        else if (typeof o.documentSlug === 'string' && o.documentSlug) slugs.push(o.documentSlug);
      }
      Object.values(o).forEach(walk);
    }
  };
  walk(blocks);
  return { ids, slugs };
}

/**
 * Tiêu đề bỏ phần định hướng trong ngoặc ở cuối: "Giám sát (dịch tễ)" → "Giám sát".
 * Hai mục cùng tên khác nghĩa ghi rõ nghĩa trong ngoặc, như trang định hướng của Wikipedia.
 */
export function baseTitle(title: string): string {
  return title.replace(/\s*\([^)]*\)\s*$/, '').trim();
}
