/**
 * Mã ẩn danh của trình duyệt. Mọi truy cập storage đều có thể ném lỗi (chế độ riêng
 * tư, bị chặn): khi đó trả mã chỉ sống trong bộ nhớ, không bao giờ làm hỏng trang.
 *
 * - anonId: ngẫu nhiên, CỐ ĐỊNH cho trình duyệt (quyết định 2026-11-22, docs/data-tracking-docs/du-lieu-va-bao-cao.md)
 *   cho đến khi người học tắt "Đóng góp số liệu ẩn danh" hoặc xoá dữ liệu trình duyệt. Mã mới
 *   KHÔNG được nối với mã cũ ở đâu cả.
 * - sessionId: sống trong tab (sessionStorage), đổi sau 30 phút không hoạt động.
 * - firstSeen: ngày đầu tiên thấy trình duyệt này; chỉ nhóm thô của nó được gửi đi.
 */

export const ANON_ID_KEY = 'tepup_aid_v1';
export const SESSION_KEY = 'tepup_sid_v1';
export const FIRST_SEEN_KEY = 'tepup_first_seen_v1';

export const SESSION_IDLE_MS = 30 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;

function uuid(): string {
  const c: Crypto = globalThis.crypto;
  if (typeof c.randomUUID === 'function') return c.randomUUID();
  // Trình duyệt cũ: vẫn ngẫu nhiên mật mã học.
  const b = c.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function read<T>(storage: () => Storage, key: string): T | null {
  try {
    const raw = storage().getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(storage: () => Storage, key: string, value: unknown): void {
  try {
    storage().setItem(key, JSON.stringify(value));
  } catch {
    /* bị chặn: dùng bản trong bộ nhớ */
  }
}

const local = () => window.localStorage;
const session = () => window.sessionStorage;

let memAnon: { id: string; createdAt: number } | null = null;
let memSession: { id: string; start: number; last: number } | null = null;

export function getAnonId(now = Date.now()): string {
  const stored = read<{ id: string; createdAt: number }>(local, ANON_ID_KEY) ?? memAnon;
  // Mã cũ (thời còn đổi sau 30 ngày) được giữ nguyên; không còn hạn dùng.
  if (stored && typeof stored.id === 'string' && /^[0-9a-f-]{36}$/.test(stored.id)) {
    return stored.id;
  }
  memAnon = { id: uuid(), createdAt: now };
  write(local, ANON_ID_KEY, memAnon);
  return memAnon.id;
}

/** Khi người học tắt tracking: bật lại sau này sẽ là một mã hoàn toàn mới. */
export function resetAnonId(): void {
  memAnon = null;
  memSession = null;
  try {
    local().removeItem(ANON_ID_KEY);
    session().removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function getSession(now = Date.now()): { id: string; start: number } {
  const stored = read<{ id: string; start: number; last: number }>(session, SESSION_KEY) ?? memSession;
  if (stored && typeof stored.id === 'string' && now - stored.last < SESSION_IDLE_MS && stored.start <= now) {
    memSession = { ...stored, last: now };
  } else {
    memSession = { id: uuid(), start: now, last: now };
  }
  write(session, SESSION_KEY, memSession);
  return { id: memSession.id, start: memSession.start };
}

/**
 * Ngày đầu tiên thấy trình duyệt này. `created`: lần này mới ghi VÀ ghi được (trình duyệt chưa
 * từng có dấu ngày này). Storage bị chặn thì không bao giờ "mới", để khỏi đếm mỗi lần tải trang.
 */
export function ensureFirstSeen(now = Date.now()): { day: number; created: boolean } {
  const stored = read<number>(local, FIRST_SEEN_KEY);
  if (typeof stored === 'number' && stored <= now) return { day: stored, created: false };
  const day = Math.floor(now / DAY) * DAY;
  write(local, FIRST_SEEN_KEY, day);
  return { day, created: read<number>(local, FIRST_SEEN_KEY) === day };
}

export function getFirstSeen(now = Date.now()): number {
  return ensureFirstSeen(now).day;
}
