/**
 * Lọc HTML rich-text do tác giả nhập — dùng ở MỌI chỗ `dangerouslySetInnerHTML` và
 * ở server khi lưu nội dung.
 *
 * Rich text trong ContentBlock (text/heading/quote/toggle/list item/table cell) chỉ
 * là HTML *inline* do `lib/editor/inline-html.ts` sinh ra: strong/em/u/s/code/a và
 * span[style=color]. Nội dung thật hiện có chỉ dùng strong, em và span màu. Allowlist
 * dưới đây giữ đúng tập đó (cộng vài thẻ inline vô hại) và bỏ mọi thứ khác: script,
 * style, iframe, svg, img, form, thuộc tính on*, class (Tailwind `fixed inset-0` là
 * đủ để phủ giả giao diện), và mọi CSS ngoài `color:`.
 *
 * Lọc lúc render là lớp phòng thủ cho cả nội dung ĐÃ nằm trong database; lọc lúc
 * lưu (API) là lớp thứ hai. `isomorphic-dompurify` chạy DOMPurify trên jsdom ở server
 * (jsdom nằm sẵn trong `serverExternalPackages` mặc định của Next) và trên DOM thật
 * ở trình duyệt, nên SSR và hydrate cho cùng một kết quả.
 */
import DOMPurify, { type UponSanitizeAttributeHookEvent } from 'isomorphic-dompurify';
import { isSafeLinkHref } from './safe-url';

const ALLOWED_TAGS = [
  'b', 'strong', 'i', 'em', 'u', 's', 'del', 'code', 'a', 'br', 'span', 'sub', 'sup', 'mark',
];
// `target`/`rel` are NOT allowed from input — they're forced onto every link below.
const ALLOWED_ATTR = ['href', 'style'];

/** Giá trị màu hợp lệ: tên màu, hex, rgb()/rgba() — không url(), không expression(). */
const COLOR_VALUE =
  /^(?:#[0-9a-f]{3,8}|[a-z]{3,20}|rgba?\(\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*(?:,\s*(?:0|1|0?\.\d+)\s*)?\))$/i;

function onAttribute(node: Element, data: UponSanitizeAttributeHookEvent) {
  if (data.attrName === 'style') {
    // Only `color:<value>` on a span, normalised to the exact form inline-html.ts
    // writes and parses back (`color:<value>`).
    const m = /^\s*color\s*:\s*([^;]+?)\s*;?\s*$/i.exec(data.attrValue);
    if (node.nodeName === 'SPAN' && m && COLOR_VALUE.test(m[1])) {
      data.attrValue = `color:${m[1]}`;
    } else {
      data.keepAttr = false;
    }
  } else if (data.attrName === 'href') {
    if (!isSafeLinkHref(data.attrValue)) data.keepAttr = false;
  }
}

function afterAttributes(node: Element) {
  if (node.nodeName === 'A' && node.hasAttribute('href')) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer nofollow');
  }
}

const CONFIG = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  ALLOWED_URI_REGEXP: /^(?:https?:|mailto:)/i,
  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: false,
  KEEP_CONTENT: true,
};

// The same strings are rendered on every reveal step; sanitise each one once.
const CACHE_LIMIT = 1000;
const cache = new Map<string, string>();

/**
 * Lọc một chuỗi HTML inline. Đầu vào không phải chuỗi → ''. Không bao giờ ném lỗi.
 *
 * Hook được gắn rồi gỡ ngay trong cùng một lời gọi đồng bộ, để không ảnh hưởng tới
 * instance DOMPurify dùng chung (BlockNote hay thư viện khác nếu có dùng).
 */
export function sanitizeInlineHtml(html: unknown): string {
  if (typeof html !== 'string' || html === '') return '';
  const hit = cache.get(html);
  if (hit !== undefined) return hit;

  let out = '';
  DOMPurify.addHook('uponSanitizeAttribute', onAttribute);
  DOMPurify.addHook('afterSanitizeAttributes', afterAttributes);
  try {
    out = String(DOMPurify.sanitize(html, CONFIG));
  } catch {
    out = '';
  } finally {
    DOMPurify.removeHook('uponSanitizeAttribute', onAttribute);
    DOMPurify.removeHook('afterSanitizeAttributes', afterAttributes);
  }

  if (cache.size >= CACHE_LIMIT) cache.clear();
  cache.set(html, out);
  return out;
}

/** Props cho `dangerouslySetInnerHTML` đã qua lọc — dùng thay cho `{ __html: raw }`. */
export function safeHtmlProps(html: unknown): { dangerouslySetInnerHTML: { __html: string } } {
  return { dangerouslySetInnerHTML: { __html: sanitizeInlineHtml(html) } };
}
