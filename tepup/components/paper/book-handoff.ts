/**
 * Bàn giao "sổ trượt" từ /courses sang /story/<nhân vật> (client-only).
 *
 * Demo giữ một cuốn sổ duy nhất và trượt nó giữa hai màn. Ở app, hai trang là
 * hai route khác layout nên sổ được dựng lại; trang listing ghi lại vị trí sổ
 * (toạ độ viewport) và dáng tem chính lúc bấm, trang câu chuyện đọc nó lúc
 * mount rồi chạy `glide` từ chỗ cũ về chỗ mới. Biến cấp module: sống qua điều
 * hướng phía client, tự mất khi tải lại trang (không có gì để trượt).
 * Cùng kiểu với lib/paper/stamp-handoff.ts.
 */

export interface BookHandoff {
  /** pathname đích; chỉ trang khớp mới nhận. */
  href: string;
  rect: { left: number; top: number; width: number; height: number };
  /** transform tính được của tem chính (dáng hover) ngay trước khi rời trang. */
  frontTransform: string | null;
  at: number;
}

let pending: BookHandoff | null = null;
const TTL_MS = 4000;

export function setBookHandoff(h: Omit<BookHandoff, 'at'>): void {
  pending = { ...h, at: Date.now() };
}

export function takeBookHandoff(pathname: string): BookHandoff | null {
  const h = pending;
  pending = null;
  if (!h || Date.now() - h.at > TTL_MS) return null;
  return decodeURI(h.href) === decodeURI(pathname) ? h : null;
}

/** Sổ chỉ mở (intro) một lần mỗi lần tải trang, như demo. */
let introPlayed = false;
export function hasIntroPlayed(): boolean {
  return introPlayed;
}
export function markIntroPlayed(): void {
  introPlayed = true;
}
