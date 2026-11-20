import { z } from 'zod';
import type { CSSProperties } from 'react';

/**
 * Màu chủ đạo của một danh mục khoá học (cột `Category.color`).
 *
 * Admin chọn một khoá trong preset cố định này (không nhập hex tự do). Danh sách
 * phải khớp CHECK constraint trong prisma/sql/2026-11-19-category-color.sql và
 * bảng màu trong tepup-design-system (preview/paper-category-colors.html).
 *
 * - `base`: màu gốc, dùng cho nền loang của kệ (`--cat`, `--cat-rgb`).
 * - `fill`: thân folder, nằm sau tên khoá màu trắng 24px → ≥3:1 với trắng.
 * - `text`: chữ nhấn màu danh mục → ≥4,5:1 trên trắng và trên nền giấy #e8e8e8.
 *
 * Độ tương phản đã đo (WCAG 2.x):
 *   key      fill/trắng  text/trắng  text/#e8e8e8
 *   blue       3,33        5,57        4,55
 *   purple     3,39        5,56        4,54
 *   teal       3,02        5,61        4,58
 *   orange     3,04        5,57        4,55
 *   pink       3,43        5,58        4,56
 *   amber      3,05        5,53        4,51
 *   red        4,30        5,59        4,56
 *   green      3,01        5,65        4,61
 */

/** Thứ tự hiển thị trong bộ chọn của admin. Đỏ và xanh lá để cuối (trùng màu trạng thái chương). */
export const CATEGORY_COLOR_KEYS = [
  'blue',
  'purple',
  'teal',
  'orange',
  'pink',
  'amber',
  'red',
  'green',
] as const;

export type CategoryColor = (typeof CATEGORY_COLOR_KEYS)[number];

export const DEFAULT_CATEGORY_COLOR: CategoryColor = 'blue';

export interface CategoryColorPreset {
  key: CategoryColor;
  label: string;
  base: string;
  fill: string;
  text: string;
  /**
   * Hoạ tiết trên thân folder (lấy từ ảnh folder gốc của design): sóng
   * (`folder-blue.webp`) hoặc bong bóng (`folder-purple.webp`).
   */
  pattern: 'waves' | 'bubbles';
  /** Có ảnh folder gốc đúng màu này (xanh dương, tím): dùng nguyên ảnh, không tô lại. */
  artwork?: string;
}

export const CATEGORY_COLORS: Record<CategoryColor, CategoryColorPreset> = {
  blue: { key: 'blue', label: 'Xanh dương', base: '#2b90ed', fill: '#2b90ed', text: '#1069bc', pattern: 'waves', artwork: '/paper/folder-blue.webp' },
  purple: { key: 'purple', label: 'Tím', base: '#aa76cf', fill: '#aa76cf', text: '#8d47be', pattern: 'bubbles', artwork: '/paper/folder-purple.webp' },
  teal: { key: 'teal', label: 'Xanh ngọc', base: '#14a3b8', fill: '#14a3b8', text: '#0e7281', pattern: 'waves' },
  orange: { key: 'orange', label: 'Cam', base: '#f1922c', fill: '#de7a0f', text: '#9d560a', pattern: 'bubbles' },
  pink: { key: 'pink', label: 'Hồng', base: '#e65983', fill: '#e65983', text: '#c81e51', pattern: 'bubbles' },
  amber: { key: 'amber', label: 'Vàng hổ phách', base: '#f2b21b', fill: '#c08a0b', text: '#886208', pattern: 'bubbles' },
  red: { key: 'red', label: 'Đỏ', base: '#e03e28', fill: '#e03e28', text: '#c3301c', pattern: 'bubbles' },
  green: { key: 'green', label: 'Xanh lá', base: '#2cab8b', fill: '#2ba788', text: '#1e745e', pattern: 'waves' },
};

/** Danh sách theo thứ tự hiển thị, tiện cho bộ chọn. */
export const CATEGORY_COLOR_LIST: CategoryColorPreset[] = CATEGORY_COLOR_KEYS.map(
  (k) => CATEGORY_COLORS[k]
);

/** Dùng ở API admin: chỉ nhận đúng các khoá preset. */
export const categoryColorSchema = z.enum(CATEGORY_COLOR_KEYS);

export function isCategoryColor(value: unknown): value is CategoryColor {
  return typeof value === 'string' && (CATEGORY_COLOR_KEYS as readonly string[]).includes(value);
}

/** Giá trị lạ / cũ / thiếu (vd. cache trước khi có cột) → xanh dương. */
export function resolveCategoryColor(value: unknown): CategoryColorPreset {
  return CATEGORY_COLORS[isCategoryColor(value) ? value : DEFAULT_CATEGORY_COLOR];
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(rgb: number[]): string {
  return `#${rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`;
}

const PATTERN_SRC = {
  waves: '/paper/folder-blue.webp',
  bubbles: '/paper/folder-purple.webp',
} as const;

/**
 * Biến CSS cho `style` của phần tử bọc kệ / folder:
 * `--cat`, `--cat-rgb` (dạng "43 144 237" cho `rgb(var(--cat-rgb) / .5)`), `--cat-fill`,
 * `--cat-text`, và hai điểm dừng của dải sáng trên thân folder (`--cat-fill-top`
 * sáng hơn 30%, chỉ phủ phần mép trên không có chữ; `--cat-fill-bottom` tối hơn 14%,
 * nên độ tương phản với chữ trắng chỉ tăng).
 */
export function categoryColorStyle(value: unknown): CSSProperties {
  const c = resolveCategoryColor(value);
  const fill = hexToRgb(c.fill);
  return {
    '--cat': c.base,
    '--cat-rgb': hexToRgb(c.base).join(' '),
    '--cat-fill': c.fill,
    '--cat-fill-top': rgbToHex(fill.map((v) => v + (255 - v) * 0.3)),
    '--cat-fill-bottom': rgbToHex(fill.map((v) => v * 0.86)),
    '--cat-text': c.text,
    // Thân folder: màu có ảnh gốc thì dùng nguyên ảnh (đúng 100% design, hoạ tiết
    // có sẵn); màu khác tô dải màu và phủ hoạ tiết đơn sắc lên (folder-card.css).
    '--cat-folder-art': c.artwork ? `url('${c.artwork}')` : 'none',
    '--cat-pattern': `url('${PATTERN_SRC[c.pattern]}')`,
    '--cat-shape-opacity': c.artwork ? '0' : '1',
  } as CSSProperties;
}
