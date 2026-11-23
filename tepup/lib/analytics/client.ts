'use client';

/**
 * Gửi số liệu ẩn danh: hàng đợi trong bộ nhớ → lô ≤50 → POST /api/events (sendBeacon
 * khi rời trang). Không bao giờ ném lỗi ra ngoài, không bao giờ chặn giao diện.
 *
 * Quy tắc (CLAUDE.md › Analytics):
 * - Tracking tắt (công tắc hoặc GPC): chỉ gửi bộ đếm tổng + event `error`, không mã nào.
 * - Khu vực nhân viên không gửi gì; server còn bỏ lô của người đang đăng nhập.
 * - Không gửi nội dung người học gõ, không gửi query string.
 */

import { firstSeenBucket, lessonsDoneBucket, STAFF_AREAS } from './buckets';
import { isTrackingEnabled } from './consent';
import { ensureFirstSeen, getAnonId, getFirstSeen, getSession } from './ids';
import type { AnalyticsBatch, AnalyticsEventInput, AnalyticsTallyInput } from './schema';

type EventWithoutT = AnalyticsEventInput extends infer E ? (E extends AnalyticsEventInput ? Omit<E, 't'> : never) : never;

const ENDPOINT = '/api/events';
const MAX_PER_BATCH = 50;
const FLUSH_MS = 10_000;
const PROGRESS_KEY = 'tepup_progress_v2';

let events: AnalyticsEventInput[] = [];
let tallies: AnalyticsTallyInput[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let sessionStart = 0;

function inBrowser(): boolean {
  return typeof window !== 'undefined';
}

function inStaffArea(): boolean {
  return STAFF_AREAS.test(window.location.pathname);
}

function completedLessons(): number {
  try {
    const data = JSON.parse(window.localStorage.getItem(PROGRESS_KEY) ?? '{}') as {
      progress?: Record<string, { contentType?: string; completed?: boolean }>;
    };
    return Object.values(data.progress ?? {}).filter((p) => p.contentType === 'lesson' && p.completed).length;
  } catch {
    return 0;
  }
}

function hasLocalProgress(): boolean {
  try {
    return window.localStorage.getItem(PROGRESS_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Gọi một lần khi app mở. Trình duyệt chưa từng có dấu "ngày đầu tiên" và chưa có tiến độ học
 * → cộng 1 vào bộ đếm `new_browser` (không mã, ai cũng cộng như các bộ đếm tổng khác).
 * Trình duyệt đã học trước khi có bộ đếm này (có tiến độ) không bị tính là mới.
 */
export function noteFirstVisit(): void {
  try {
    if (!inBrowser() || inStaffArea()) return;
    const hadProgress = hasLocalProgress();
    const { created } = ensureFirstSeen();
    if (created && !hadProgress) tally({ metric: 'new_browser' });
  } catch {
    /* ignore */
  }
}

function schedule() {
  if (timer) return;
  timer = setTimeout(() => {
    timer = null;
    flush(false);
  }, FLUSH_MS);
}

/** Ghi một event. Bỏ qua khi tracking tắt, trừ `error` (gửi không mã). */
export function track(event: EventWithoutT): void {
  try {
    if (!inBrowser() || inStaffArea()) return;
    const enabled = isTrackingEnabled();
    if (!enabled && event.name !== 'error') return;
    const now = Date.now();
    let t = 0;
    if (enabled) {
      const s = getSession(now);
      sessionStart = s.start;
      t = Math.max(0, Math.round((now - s.start) / 1000));
    }
    events.push({ ...event, t } as AnalyticsEventInput);
    if (events.length >= MAX_PER_BATCH) flush(false);
    else schedule();
  } catch {
    /* analytics không bao giờ làm hỏng trang */
  }
}

/** Cộng vào bộ đếm tổng không mã. Ai cũng gửi, kể cả khi tracking tắt. */
export function tally(entry: AnalyticsTallyInput): void {
  try {
    if (!inBrowser() || inStaffArea()) return;
    tallies.push(entry);
    if (tallies.length >= MAX_PER_BATCH) flush(false);
    else schedule();
  } catch {
    /* ignore */
  }
}

function send(batch: AnalyticsBatch, leaving: boolean) {
  const body = JSON.stringify(batch);
  try {
    if (leaving && navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: 'application/json' }))) return;
    void fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
      credentials: 'same-origin',
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

/** Gửi hết hàng đợi. `leaving`: trang đang ẩn/đóng → dùng sendBeacon. */
export function flush(leaving: boolean): void {
  if (!inBrowser()) return;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  // Phòng khi lô đầu tiên được gửi trước khi AnalyticsProvider kịp gọi (getFirstSeen bên dưới
  // sẽ ghi dấu ngày và làm mất lượt "mới"). Gọi lại vô hại: lần sau `created` luôn false.
  noteFirstVisit();
  if (!events.length && !tallies.length) return;
  const enabled = isTrackingEnabled();
  const pendingEvents = enabled ? events : events.filter((e) => e.name === 'error');
  const pendingTallies = tallies;
  events = [];
  tallies = [];

  let ctx: AnalyticsBatch['ctx'];
  if (enabled && pendingEvents.length) {
    const now = Date.now();
    ctx = {
      anonId: getAnonId(now),
      sessionId: getSession(now).id,
      sessionStart: sessionStart || now,
      firstSeen: firstSeenBucket(getFirstSeen(now), now),
      lessonsDone: lessonsDoneBucket(completedLessons()),
    };
  }

  for (let i = 0; i < Math.max(pendingEvents.length, pendingTallies.length); i += MAX_PER_BATCH) {
    send(
      {
        v: 1,
        ...(ctx ? { ctx } : {}),
        events: pendingEvents.slice(i, i + MAX_PER_BATCH),
        tallies: pendingTallies.slice(i, i + MAX_PER_BATCH),
      },
      leaving,
    );
  }
}

/** Chỉ cho test. */
export function __resetAnalyticsQueue() {
  events = [];
  tallies = [];
  sessionStart = 0;
  if (timer) clearTimeout(timer);
  timer = null;
}
