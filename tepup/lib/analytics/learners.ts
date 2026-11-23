import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

/**
 * Danh sách mã gần đây và hành trình của một mã (quyết định 2026-11-22, docs/data-tracking-docs/du-lieu-va-bao-cao.md).
 * Chỉ admin. Mỗi lần xem ghi AuditLog (không ghi mã). Mã không bao giờ nằm trên URL: hành trình
 * được mở bằng POST /api/admin/analytics/learners/journey với mã trong body.
 */

export const ANON_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const LIST_DAYS = 90;
const MAX_EVENTS = 3000;

export type LearnerRow = {
  anonId: string;
  firstAt: string;
  lastAt: string;
  sessions: number;
  started: number;
  completed: number;
  country: string | null;
  device: string | null;
};

/** 100 mã hoạt động gần nhất trong 90 ngày; `lessonId`: chỉ những mã đã mở bài/chương đó. */
export async function recentLearners(lessonId: string | null): Promise<LearnerRow[]> {
  const filter = lessonId
    ? Prisma.sql`AND "anonId" IN (
        SELECT "anonId" FROM "AnalyticsEvent"
         WHERE "contentId" = ${lessonId} AND "name" = 'content_start' AND "anonId" IS NOT NULL
           AND "sessionHour" >= now() - make_interval(days => ${LIST_DAYS}::int))`
    : Prisma.empty;
  const rows = await prisma.$queryRaw<
    { anonId: string; firstAt: Date; lastAt: Date; sessions: bigint; started: bigint; completed: bigint; country: string | null; device: string | null }[]
  >(Prisma.sql`
    SELECT "anonId"::text AS "anonId", MIN("sessionHour") AS "firstAt", MAX("sessionHour") AS "lastAt",
           COUNT(DISTINCT "sessionId") AS sessions,
           COUNT(DISTINCT "contentId") FILTER (WHERE "name" = 'content_start') AS started,
           COUNT(DISTINCT "contentId") FILTER (WHERE "name" = 'content_complete') AS completed,
           MODE() WITHIN GROUP (ORDER BY "country") AS country,
           MODE() WITHIN GROUP (ORDER BY "device") AS device
      FROM "AnalyticsEvent"
     WHERE "anonId" IS NOT NULL AND "sessionHour" >= now() - make_interval(days => ${LIST_DAYS}::int) ${filter}
     GROUP BY "anonId"
     ORDER BY "lastAt" DESC
     LIMIT 100`);
  return rows.map((r) => ({
    anonId: r.anonId,
    firstAt: r.firstAt.toISOString(),
    lastAt: r.lastAt.toISOString(),
    sessions: Number(r.sessions),
    started: Number(r.started),
    completed: Number(r.completed),
    country: r.country,
    device: r.device,
  }));
}

export type JourneyLine = { t: number; text: string };
export type JourneySession = { sessionHour: string; country: string | null; device: string | null; lines: JourneyLine[] };
export type LearnerJourney = { short: string; sessions: JourneySession[]; truncated: boolean };

type EventRow = {
  sessionId: string | null;
  sessionHour: Date;
  tOffsetS: number;
  name: string;
  contentId: string | null;
  contentName: string | null;
  blockIndex: number | null;
  blockType: string | null;
  routeType: string | null;
  props: Record<string, unknown> | null;
  country: string | null;
  device: string | null;
};

const ROUTE_LABELS: Record<string, string> = {
  landing: 'trang chủ',
  courses: 'danh sách khoá',
  course: 'trang khoá',
  lesson: 'bài học',
  story: 'câu chuyện',
  chapter: 'chương truyện',
  library: 'thư viện',
  entry: 'mục thư viện',
  other: 'trang khác',
};

function describe(e: EventRow): string {
  const p = e.props ?? {};
  const name = e.contentName ? `“${e.contentName}”` : '(bài đã xoá)';
  const block = e.blockIndex === null ? '' : `block #${e.blockIndex + 1}`;
  switch (e.name) {
    case 'page_view':
      return `Xem ${ROUTE_LABELS[e.routeType ?? ''] ?? 'trang'}${typeof p.slug === 'string' ? ` (${p.slug})` : ''}`;
    case 'content_start':
      return `Mở ${name}`;
    case 'content_complete':
      return `Học xong ${name}`;
    case 'content_exit':
      return `Rời ${name} ở ${block}${typeof p.totalBlocks === 'number' ? `/${p.totalBlocks}` : ''}`;
    case 'block_complete':
      return `Làm xong ${block} (${e.blockType ?? ''}) của ${name}`;
    case 'question_answer':
      return `Trả lời câu hỏi ở ${block} của ${name}: ${p.correct === true ? 'đúng' : 'sai'}`;
    case 'ref_open':
      return `Mở thư viện: ${typeof p.slug === 'string' ? p.slug : ''} (${p.mode === 'panel' ? 'bảng bên' : 'xem nhanh'})`;
    case 'chat_send':
      return 'Gửi một câu hỏi cho trợ lý AI';
    case 'setting_change':
      return `Đổi cài đặt: ${String(p.setting ?? '')} → ${String(p.value ?? '')}`;
    case 'error':
      return `Gặp lỗi: ${String(p.errorName ?? '')}`;
    default:
      return e.name;
  }
}

/** Gộp các `block_view` liên tiếp của cùng một bài thành một dòng "Tới block #a → #b". */
function linesOf(events: EventRow[]): JourneyLine[] {
  const out: JourneyLine[] = [];
  let run: { t: number; contentId: string | null; name: string | null; from: number; to: number } | null = null;
  const closeRun = () => {
    if (!run) return;
    const range = run.from === run.to ? `block #${run.from + 1}` : `block #${run.from + 1} → #${run.to + 1}`;
    out.push({ t: run.t, text: `Tới ${range} của ${run.name ? `“${run.name}”` : '(bài đã xoá)'}` });
    run = null;
  };
  for (const e of events) {
    if (e.name === 'block_view' && e.blockIndex !== null) {
      if (run && run.contentId === e.contentId) {
        run.from = Math.min(run.from, e.blockIndex);
        run.to = Math.max(run.to, e.blockIndex);
        continue;
      }
      closeRun();
      run = { t: e.tOffsetS, contentId: e.contentId, name: e.contentName, from: e.blockIndex, to: e.blockIndex };
      continue;
    }
    closeRun();
    out.push({ t: e.tOffsetS, text: describe(e) });
  }
  closeRun();
  return out;
}

export async function learnerJourney(anonId: string): Promise<LearnerJourney | null> {
  if (!ANON_ID_RE.test(anonId)) return null;
  const rows = await prisma.$queryRaw<EventRow[]>(Prisma.sql`
    SELECT e."sessionId"::text AS "sessionId", e."sessionHour", e."tOffsetS", e."name", e."contentId",
           COALESCE(l."name", ch."title") AS "contentName",
           e."blockIndex", e."blockType", e."routeType", e."props", e."country", e."device"
      FROM "AnalyticsEvent" e
      LEFT JOIN "Lesson" l ON l."id" = e."contentId"
      LEFT JOIN "Chapter" ch ON ch."id" = e."contentId"
     WHERE e."anonId" = ${anonId}::uuid
     ORDER BY e."sessionHour" DESC, e."sessionId", e."tOffsetS", e."id"
     LIMIT ${MAX_EVENTS + 1}`);
  if (!rows.length) return null;
  const truncated = rows.length > MAX_EVENTS;
  const bySession = new Map<string, EventRow[]>();
  for (const r of rows.slice(0, MAX_EVENTS)) {
    const k = `${r.sessionHour.toISOString()}|${r.sessionId ?? ''}`;
    const list = bySession.get(k);
    if (list) list.push(r);
    else bySession.set(k, [r]);
  }
  const sessions: JourneySession[] = [...bySession.values()].map((evs) => ({
    sessionHour: evs[0].sessionHour.toISOString(),
    country: evs[0].country,
    device: evs[0].device,
    lines: linesOf(evs),
  }));
  return { short: anonId.slice(0, 8), sessions, truncated };
}
