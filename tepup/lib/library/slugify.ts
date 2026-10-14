import { ENTRY_SLUG_MAX } from './refs';

/** "Tính khả đọc (legibility)" → "tinh-kha-doc-legibility". Bỏ dấu, đ → d. */
export function slugifyEntry(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, ENTRY_SLUG_MAX)
    .replace(/-+$/g, '');
}
