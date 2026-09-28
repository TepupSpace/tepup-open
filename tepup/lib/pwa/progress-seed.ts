/**
 * Chuyển tiến độ học từ trình duyệt sang PWA vừa được cài.
 *
 * Trên iOS, web app đã thêm vào Màn hình chính chạy trong kho lưu trữ riêng,
 * tách khỏi Safari — localStorage không đi theo. Người học đã xong năm bài rồi
 * bấm cài đặt sẽ mở app ra với tiến độ trắng trơn.
 *
 * Cách vá: nhét tiến độ đã nén vào `start_url` của manifest ngay trước lúc cài,
 * để lần đầu mở app đọc lại từ query string. Client ghi seed vào href của thẻ
 * <link rel="manifest">, route manifest đọc seed rồi trả về start_url tương ứng.
 */

/** Khớp với khoá localStorage trong lib/contexts/ProgressContext.tsx */
export const PROGRESS_STORAGE_KEY = 'tepup_progress_v2';

export const SEED_PARAM = 'seed';

/**
 * Trần độ dài chuỗi seed. Trình duyệt hiện đại chịu được URL dài hơn nhiều, nhưng
 * start_url còn phải đi qua trình cài đặt của từng hệ điều hành nên giữ mức dè dặt.
 */
const MAX_SEED_LENGTH = 8000;

type ContentType = 'lesson' | 'chapter';

interface ProgressItem {
  contentType: ContentType;
  completed: boolean;
  score: number | null;
  completedAt: string | null;
}

interface StoredProgress {
  version: number;
  progress: Record<string, ProgressItem>;
  lastUpdated: string;
}

/** [contentId, 'l' | 'c', điểm, thời điểm hoàn thành tính bằng giây] */
type PackedItem = [string, 'l' | 'c', number | null, number | null];

interface SeedPayload {
  v: 2;
  i: PackedItem[];
}

function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * Nén tiến độ đã hoàn thành thành chuỗi an toàn cho URL.
 * Trả về null khi không có gì để chuyển, hoặc khi chuỗi vượt trần độ dài.
 */
export function encodeProgressSeed(raw: string | null): string | null {
  if (!raw) return null;

  let stored: StoredProgress;
  try {
    stored = JSON.parse(raw) as StoredProgress;
  } catch {
    return null;
  }
  if (!stored?.progress) return null;

  const items: PackedItem[] = [];
  for (const [contentId, item] of Object.entries(stored.progress)) {
    if (!item?.completed) continue;
    const at = item.completedAt ? Math.floor(Date.parse(item.completedAt) / 1000) : null;
    items.push([
      contentId,
      item.contentType === 'chapter' ? 'c' : 'l',
      item.score ?? null,
      Number.isFinite(at) ? at : null,
    ]);
  }
  if (items.length === 0) return null;

  const payload: SeedPayload = { v: 2, i: items };
  const encoded = toBase64Url(JSON.stringify(payload));
  return encoded.length > MAX_SEED_LENGTH ? null : encoded;
}

/**
 * Bung seed trở lại đúng định dạng mà ProgressContext đang đọc.
 * Trả về null nếu seed hỏng — mất tiến độ vẫn hơn là làm hỏng dữ liệu đang có.
 */
export function decodeProgressSeed(seed: string): StoredProgress | null {
  let payload: SeedPayload;
  try {
    payload = JSON.parse(fromBase64Url(seed)) as SeedPayload;
  } catch {
    return null;
  }
  if (payload?.v !== 2 || !Array.isArray(payload.i)) return null;

  const progress: Record<string, ProgressItem> = {};
  for (const entry of payload.i) {
    if (!Array.isArray(entry) || typeof entry[0] !== 'string') continue;
    const [contentId, type, score, at] = entry;
    progress[contentId] = {
      contentType: type === 'c' ? 'chapter' : 'lesson',
      completed: true,
      score: typeof score === 'number' ? score : null,
      completedAt: typeof at === 'number' ? new Date(at * 1000).toISOString() : null,
    };
  }
  if (Object.keys(progress).length === 0) return null;

  return { version: 2, progress, lastUpdated: new Date().toISOString() };
}
