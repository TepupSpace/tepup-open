/**
 * Tuỳ chọn đọc của người học: giao diện sáng/tối, phông dễ đọc, cỡ chữ.
 *
 * Lưu ở localStorage, áp lên <html> bằng ba thuộc tính `data-reader-*`. CSS trong
 * `app/reader.css` chỉ phản ứng khi trang có phần tử `.reader` (trang khoá học, câu
 * chuyện, trình phát bài), nên /courses, trang chủ và admin không bị ảnh hưởng.
 *
 * Không dùng cookie: các trang học là ISR và được Cloudflare cache bỏ qua cookie,
 * nên tuỳ chọn phải áp ở trình duyệt — bằng `READER_PREFS_SCRIPT` chạy trước khi
 * vẽ trang để không bị loé giao diện sáng.
 */

export type ReaderTheme = 'system' | 'light' | 'dark';
export type ReaderFont = 'default' | 'readable';

export interface ReaderPrefs {
  theme: ReaderTheme;
  font: ReaderFont;
  /** Bậc cỡ chữ 1–5; 2 là cỡ gốc (100%). Xem READER_SIZES. */
  size: number;
}

export const READER_PREFS_KEY = 'tepup_reader_prefs';
export const READER_PREFS_EVENT = 'tepup_reader_prefs_change';

/** Nhãn từng bậc cỡ chữ; giá trị phần trăm nằm trong reader.css. */
export const READER_SIZES = [
  { step: 1, label: '90%' },
  { step: 2, label: '100%' },
  { step: 3, label: '112%' },
  { step: 4, label: '125%' },
  { step: 5, label: '150%' },
] as const;

export const DEFAULT_READER_PREFS: ReaderPrefs = { theme: 'system', font: 'default', size: 2 };

function normalize(raw: unknown): ReaderPrefs {
  const p = (raw && typeof raw === 'object' ? raw : {}) as Partial<ReaderPrefs>;
  const size = Number(p.size);
  return {
    theme: p.theme === 'light' || p.theme === 'dark' ? p.theme : 'system',
    font: p.font === 'readable' ? 'readable' : 'default',
    size: Number.isInteger(size) && size >= 1 && size <= 5 ? size : DEFAULT_READER_PREFS.size,
  };
}

export function readReaderPrefs(): ReaderPrefs {
  try {
    return normalize(JSON.parse(localStorage.getItem(READER_PREFS_KEY) ?? '{}'));
  } catch {
    return DEFAULT_READER_PREFS;
  }
}

export function resolveTheme(theme: ReaderTheme): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyReaderPrefs(prefs: ReaderPrefs) {
  const root = document.documentElement;
  root.dataset.readerTheme = resolveTheme(prefs.theme);
  root.dataset.readerFont = prefs.font;
  root.dataset.readerSize = String(prefs.size);
}

export function writeReaderPrefs(prefs: ReaderPrefs) {
  try {
    localStorage.setItem(READER_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Chế độ riêng tư / bộ nhớ đầy: vẫn áp cho phiên hiện tại.
  }
  applyReaderPrefs(prefs);
  window.dispatchEvent(new CustomEvent(READER_PREFS_EVENT, { detail: prefs }));
}

/**
 * Bản rút gọn của read + apply, nhúng thẳng vào <head> (root layout). Giữ đồng bộ
 * với `normalize`/`applyReaderPrefs` ở trên. Khi bật CSP `script-src` (đang dự
 * định), cần thêm hash của chuỗi này vào chính sách.
 */
export const READER_PREFS_SCRIPT = `(function(){try{var p=JSON.parse(localStorage.getItem('${READER_PREFS_KEY}')||'{}')||{};var d=document.documentElement;var t=p.theme;if(t!=='light'&&t!=='dark'){t=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}d.dataset.readerTheme=t;d.dataset.readerFont=p.font==='readable'?'readable':'default';var s=Number(p.size);d.dataset.readerSize=(s>=1&&s<=5&&s%1===0)?String(s):'2'}catch(e){}})();`;
