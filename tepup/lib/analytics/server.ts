import type { Prisma } from '@prisma/client';
import type { AnalyticsBatch, AnalyticsTallyInput } from './schema';

/**
 * Phần thuần (không đụng DB) của POST /api/events, tách ra để test được.
 * Mọi thứ định danh (IP, UA đầy đủ, cookie) chỉ được dùng ở đây để rút ra giá trị
 * thô rồi bỏ đi; không giá trị nào trong số đó được trả ra ngoài.
 */

const HOUR = 60 * 60 * 1000;
const VN_OFFSET = 7 * HOUR;
/** Ngày "không gắn ngày" của bộ đếm đáp án quiz. */
export const NO_DAY = new Date('1970-01-01T00:00:00Z');

export const SESSION_COOKIE = /^(__Secure-)?authjs\.session-token(\.\d+)?$/;
const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|preview|python|curl|wget/i;

export function isBot(ua: string | null): boolean {
  return !ua || BOT_UA.test(ua);
}

export function deviceFromUa(ua: string): 'mobile' | 'tablet' | 'desktop' {
  if (/iPad|Tablet|Nexus (7|9|10)|SM-T\d/i.test(ua)) return 'tablet';
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return 'mobile';
  return 'desktop';
}

export function browserFromUa(ua: string): string {
  if (/coc_coc_browser/i.test(ua)) return 'coccoc';
  if (/Edg(e|A|iOS)?\//.test(ua)) return 'edge';
  if (/OPR\/|Opera/.test(ua)) return 'opera';
  if (/SamsungBrowser/.test(ua)) return 'samsung';
  if (/Zalo/i.test(ua)) return 'zalo';
  if (/FBAN|FBAV|FB_IAB/.test(ua)) return 'facebook';
  if (/Firefox|FxiOS/.test(ua)) return 'firefox';
  if (/Chrome|CriOS/.test(ua)) return 'chrome';
  if (/Safari/.test(ua)) return 'safari';
  return 'other';
}

export function countryFromHeaders(headers: Headers): string | null {
  const c = (headers.get('cf-ipcountry') ?? headers.get('x-vercel-ip-country') ?? '').toUpperCase();
  return /^[A-Z]{2}$/.test(c) && c !== 'XX' ? c : null;
}

export function floorToHour(ms: number): Date {
  return new Date(Math.floor(ms / HOUR) * HOUR);
}

/** Giờ bắt đầu phiên đã làm tròn; giá trị lệch quá 2 ngày so với giờ server thì dùng giờ server. */
export function sessionHourFrom(sessionStart: number | undefined, now: number): Date {
  const ok = typeof sessionStart === 'number' && sessionStart <= now + 5 * 60_000 && now - sessionStart <= 48 * HOUR;
  return floorToHour(ok ? sessionStart! : now);
}

export function vnDay(now: number): Date {
  return new Date(`${new Date(now + VN_OFFSET).toISOString().slice(0, 10)}T00:00:00Z`);
}

export type TallyRow = { metric: string; targetId: string; key: string; day: Date; count: number };

/** Gộp các lượt cùng khoá trong một lô thành một dòng (+n). */
export function tallyRows(tallies: AnalyticsTallyInput[], now: number): TallyRow[] {
  const day = vnDay(now);
  const rows = new Map<string, TallyRow>();
  for (const t of tallies) {
    let row: Omit<TallyRow, 'count'>;
    switch (t.metric) {
      case 'content_start':
      case 'content_complete':
        row = { metric: t.metric, targetId: t.contentId, key: t.contentType, day };
        break;
      case 'course_complete':
        row = { metric: t.metric, targetId: t.courseId, key: '', day };
        break;
      case 'new_browser':
        row = { metric: t.metric, targetId: '', key: '', day };
        break;
      case 'quiz_option':
        // Đáp án có thể lộ quan điểm: không mã, KHÔNG ngày.
        row = { metric: t.metric, targetId: t.contentId, key: `${t.blockKey}:${t.optionId}`, day: NO_DAY };
        break;
    }
    const k = `${row.metric}|${row.targetId}|${row.key}|${row.day.toISOString()}`;
    const prev = rows.get(k);
    if (prev) prev.count += 1;
    else rows.set(k, { ...row, count: 1 });
  }
  return [...rows.values()];
}

export type EventMeta = { country: string | null; device: string | null; browser: string | null };

/**
 * Biến lô đã kiểm tra thành các dòng AnalyticsEvent. `signedIn`: chỉ giữ event `error`, không mã.
 * Không có `ctx` (tracking tắt) thì cũng chỉ giữ `error`.
 */
export function eventRows(
  batch: AnalyticsBatch,
  meta: EventMeta,
  now: number,
  signedIn: boolean,
): Prisma.AnalyticsEventCreateManyInput[] {
  const ctx = signedIn ? undefined : batch.ctx;
  const sessionHour = sessionHourFrom(ctx?.sessionStart, now);
  return batch.events
    .filter((e) => ctx || e.name === 'error')
    .map((e) => {
      const { name, t, ...rest } = e as Record<string, unknown> & { name: string; t: number };
      const r = rest as Record<string, unknown>;
      const pick = (k: string) => {
        const v = r[k];
        delete r[k];
        return v;
      };
      const contentType = pick('contentType') as string | undefined;
      const contentId = pick('contentId') as string | undefined;
      const blockIndex = pick('blockIndex') as number | undefined;
      const blockType = pick('blockType') as string | undefined;
      const routeType = pick('routeType') as string | undefined;
      return {
        name,
        anonId: ctx?.anonId ?? null,
        sessionId: ctx?.sessionId ?? null,
        sessionHour,
        tOffsetS: ctx ? Math.min(t, 7 * 24 * 3600) : 0,
        routeType: routeType ?? null,
        contentType: contentType ?? null,
        contentId: contentId ?? null,
        blockIndex: blockIndex ?? null,
        blockType: blockType ?? null,
        props: Object.keys(r).length ? (r as Prisma.InputJsonValue) : undefined,
        country: meta.country,
        device: meta.device,
        browser: meta.browser,
        firstSeenBucket: ctx?.firstSeen ?? null,
        lessonsDoneBucket: ctx?.lessonsDone ?? null,
      };
    });
}
