import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analyticsBatch } from '@/lib/analytics/schema';
import { scrubErrorMessage, scrubErrorName, safeDigest } from '@/lib/analytics/scrub';
import { classifyPath, firstSeenBucket, lessonsDoneBucket, STAFF_AREAS } from '@/lib/analytics/buckets';
import {
  NO_DAY,
  browserFromUa,
  countryFromHeaders,
  deviceFromUa,
  eventRows,
  isBot,
  sessionHourFrom,
  tallyRows,
  vnDay,
} from '@/lib/analytics/server';

const ctx = {
  anonId: '3f2a1b4c-5d6e-4f70-8a9b-0c1d2e3f4a5b',
  sessionId: '9a8b7c6d-5e4f-4a3b-9c1d-0e1f2a3b4c5d',
  sessionStart: Date.UTC(2026, 10, 20, 14, 37, 12),
  firstSeen: '1-7' as const,
  lessonsDone: '3-5' as const,
};

describe('analytics batch schema (closed list)', () => {
  it('accepts a normal batch', () => {
    const r = analyticsBatch.safeParse({
      v: 1,
      ctx,
      events: [
        { name: 'block_view', t: 12, contentType: 'lesson', contentId: 'cmabc123', blockIndex: 3, blockType: 'question' },
        { name: 'question_answer', t: 20, contentType: 'lesson', contentId: 'cmabc123', blockIndex: 3, correct: false },
      ],
      tallies: [{ metric: 'quiz_option', contentId: 'cmabc123', blockKey: 'i3', optionId: 'b' }],
    });
    expect(r.success).toBe(true);
  });

  it('rejects unknown keys anywhere (no smuggling ip, userId, text)', () => {
    expect(analyticsBatch.safeParse({ v: 1, ip: '1.2.3.4' }).success).toBe(false);
    expect(analyticsBatch.safeParse({ v: 1, ctx: { ...ctx, userId: 'u1' } }).success).toBe(false);
    expect(
      analyticsBatch.safeParse({ v: 1, ctx, events: [{ name: 'chat_send', t: 1, text: 'xin chào' }] }).success,
    ).toBe(false);
    expect(
      analyticsBatch.safeParse({
        v: 1,
        tallies: [{ metric: 'content_complete', contentType: 'lesson', contentId: 'x', anonId: ctx.anonId }],
      }).success,
    ).toBe(false);
  });

  it('rejects unknown event names, long messages and query strings in slugs', () => {
    expect(analyticsBatch.safeParse({ v: 1, ctx, events: [{ name: 'keystroke', t: 1 }] }).success).toBe(false);
    expect(
      analyticsBatch.safeParse({
        v: 1,
        events: [{ name: 'error', t: 0, source: 'window', routeType: 'lesson', errorName: 'Error', message: 'x'.repeat(201) }],
      }).success,
    ).toBe(false);
    expect(
      analyticsBatch.safeParse({ v: 1, ctx, events: [{ name: 'page_view', t: 0, routeType: 'lesson', slug: 'bai-1?ref=fb' }] }).success,
    ).toBe(false);
  });

  it('caps batch size', () => {
    const events = Array.from({ length: 51 }, () => ({ name: 'chat_send', t: 0 }));
    expect(analyticsBatch.safeParse({ v: 1, ctx, events }).success).toBe(false);
  });
});

describe('scrub', () => {
  it('drops query strings, emails, long numbers and quoted data', () => {
    const m = scrubErrorMessage(
      'Failed https://tepup.space/courses/a?token=abc#x for a@b.vn phone 0912 345 678 "một đoạn người học vừa gõ rất dài"',
    );
    expect(m).not.toMatch(/token|a@b\.vn|0912|người học/);
    expect(m).toContain('https://tepup.space/courses/a');
  });
  it('caps at 200 chars', () => {
    expect(scrubErrorMessage('x '.repeat(300)).length).toBeLessThanOrEqual(200);
  });
  it('keeps only plain error names and digests', () => {
    expect(scrubErrorName(new TypeError('x'))).toBe('TypeError');
    const weird = new Error('x');
    weird.name = 'Lỗi của <script>';
    expect(scrubErrorName(weird)).toBe('Error');
    expect(safeDigest('12345abc')).toBe('12345abc');
    expect(safeDigest('a b')).toBeUndefined();
  });
});

describe('buckets & paths', () => {
  it('buckets first-seen and lessons done', () => {
    const now = Date.UTC(2026, 10, 20);
    expect(firstSeenBucket(now, now)).toBe('0');
    expect(firstSeenBucket(now - 3 * 864e5, now)).toBe('1-7');
    expect(firstSeenBucket(now - 20 * 864e5, now)).toBe('8-30');
    expect(firstSeenBucket(now - 90 * 864e5, now)).toBe('30+');
    expect([0, 2, 4, 9].map(lessonsDoneBucket)).toEqual(['0', '1-2', '3-5', '6+']);
  });
  it('classifies routes without query strings', () => {
    expect(classifyPath('/')).toEqual({ routeType: 'landing' });
    expect(classifyPath('/courses/logic-101/bai-1')).toEqual({ routeType: 'lesson', slug: 'bai-1' });
    expect(classifyPath('/story/c1/s1/ch-2')).toEqual({ routeType: 'chapter', slug: 'ch-2' });
    expect(classifyPath('/thu-vien/muc/thue')).toEqual({ routeType: 'entry', slug: 'thue' });
    expect(classifyPath('/courses/A_B').slug).toBeUndefined();
  });
  it('treats staff areas as untracked', () => {
    expect(STAFF_AREAS.test('/admin/analytics')).toBe(true);
    expect(STAFF_AREAS.test('/staff-view/courses/x/y')).toBe(true);
    expect(STAFF_AREAS.test('/courses')).toBe(false);
  });
});

describe('server helpers', () => {
  it('rounds session start down to the hour and rejects implausible values', () => {
    const now = Date.UTC(2026, 10, 20, 15, 5);
    expect(sessionHourFrom(ctx.sessionStart, now).toISOString()).toBe('2026-11-20T14:00:00.000Z');
    expect(sessionHourFrom(now + 3600_000, now).toISOString()).toBe('2026-11-20T15:00:00.000Z');
    expect(sessionHourFrom(0, now).toISOString()).toBe('2026-11-20T15:00:00.000Z');
  });

  it('uses the Vietnam calendar day', () => {
    expect(vnDay(Date.UTC(2026, 10, 20, 18, 0)).toISOString().slice(0, 10)).toBe('2026-11-21');
  });

  it('derives coarse device/browser/country only', () => {
    const iphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1';
    expect(deviceFromUa(iphone)).toBe('mobile');
    expect(browserFromUa(iphone)).toBe('safari');
    expect(browserFromUa('Mozilla/5.0 (Windows NT 10.0) Chrome/120 coc_coc_browser/120 Safari/537')).toBe('coccoc');
    expect(isBot('Googlebot/2.1')).toBe(true);
    expect(isBot(null)).toBe(true);
    expect(countryFromHeaders(new Headers({ 'cf-ipcountry': 'VN' }))).toBe('VN');
    expect(countryFromHeaders(new Headers({ 'cf-ipcountry': 'T1' }))).toBeNull();
  });

  it('aggregates tallies; quiz options carry no day', () => {
    const now = Date.UTC(2026, 10, 20, 3);
    const rows = tallyRows(
      [
        { metric: 'content_complete', contentType: 'lesson', contentId: 'L1' },
        { metric: 'content_complete', contentType: 'lesson', contentId: 'L1' },
        { metric: 'quiz_option', contentId: 'L1', blockKey: 'i4', optionId: 'c' },
      ],
      now,
    );
    expect(rows).toHaveLength(2);
    expect(rows.find((r) => r.metric === 'content_complete')?.count).toBe(2);
    expect(rows.find((r) => r.metric === 'quiz_option')?.day).toEqual(NO_DAY);
  });

  const meta = { country: 'VN', device: 'mobile', browser: 'chrome' };
  const batch = analyticsBatch.parse({
    v: 1,
    ctx,
    events: [
      { name: 'question_answer', t: 30, contentType: 'lesson', contentId: 'L1', blockIndex: 2, correct: true },
      { name: 'error', t: 31, source: 'window', routeType: 'lesson', errorName: 'TypeError', message: 'x' },
    ],
  });

  it('maps events to rows with rounded time and no identity beyond the rotating id', () => {
    const rows = eventRows(batch, meta, Date.UTC(2026, 10, 20, 15), false);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      name: 'question_answer',
      anonId: ctx.anonId,
      blockIndex: 2,
      props: { correct: true },
      tOffsetS: 30,
    });
    expect((rows[0].sessionHour as Date).toISOString()).toBe('2026-11-20T14:00:00.000Z');
    expect(JSON.stringify(rows)).not.toMatch(/ip|userAgent|userId/i);
  });

  it('signed-in requests keep only errors, without ids', () => {
    const rows = eventRows(batch, meta, Date.UTC(2026, 10, 20, 15), true);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ name: 'error', anonId: null, sessionId: null, tOffsetS: 0 });
  });

  it('batches without ctx (tracking off) keep only errors', () => {
    const off = analyticsBatch.parse({
      v: 1,
      events: [
        { name: 'chat_send', t: 0 },
        { name: 'error', t: 0, source: 'boundary', routeType: 'lesson', errorName: 'Error', message: 'm' },
      ],
    });
    const rows = eventRows(off, meta, Date.now(), false);
    expect(rows.map((r) => r.name)).toEqual(['error']);
    expect(rows[0].anonId).toBeNull();
  });
});

describe('rotating ids', () => {
  function stubStorage() {
    const mk = () => {
      const m = new Map<string, string>();
      return {
        getItem: (k: string) => m.get(k) ?? null,
        setItem: (k: string, v: string) => void m.set(k, v),
        removeItem: (k: string) => void m.delete(k),
      };
    };
    vi.stubGlobal('window', { localStorage: mk(), sessionStorage: mk() });
  }
  beforeEach(() => {
    vi.resetModules();
    stubStorage();
  });

  it('keeps the anon id for 30 days, then makes an unrelated new one', async () => {
    const { getAnonId, ANON_ID_TTL_MS } = await import('@/lib/analytics/ids');
    const t0 = Date.UTC(2026, 10, 1);
    const a = getAnonId(t0);
    expect(getAnonId(t0 + ANON_ID_TTL_MS - 1)).toBe(a);
    const b = getAnonId(t0 + ANON_ID_TTL_MS);
    expect(b).not.toBe(a);
    expect(b).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('resetAnonId gives a fresh id immediately', async () => {
    const { getAnonId, resetAnonId } = await import('@/lib/analytics/ids');
    const a = getAnonId(1_000);
    resetAnonId();
    expect(getAnonId(2_000)).not.toBe(a);
  });

  it('starts a new session after 30 minutes idle', async () => {
    const { getSession, SESSION_IDLE_MS } = await import('@/lib/analytics/ids');
    const s1 = getSession(1_000);
    expect(getSession(1_000 + SESSION_IDLE_MS - 1).id).toBe(s1.id);
    const later = 1_000 + 2 * SESSION_IDLE_MS;
    expect(getSession(later).id).not.toBe(s1.id);
  });
});
