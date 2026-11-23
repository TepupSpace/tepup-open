import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

/**
 * Báo cáo cho /admin/analytics. Số TỔNG lấy từ AnalyticsTally (gồm cả người đã tắt
 * tracking); phân tích hành trình (drop-off, retention) lấy từ AnalyticsEvent.
 * Chỉ admin đọc (trang nằm dưới admin/(restricted), gọi requireAdmin()).
 */

const NO_DAY = '1970-01-01';

export type LessonRow = {
  contentId: string;
  name: string;
  course: string;
  starts: number;
  completes: number;
};

export async function lessonTotals(days: number): Promise<LessonRow[]> {
  const rows = await prisma.$queryRaw<{ contentId: string; name: string | null; course: string | null; starts: bigint; completes: bigint }[]>(Prisma.sql`
    SELECT t."targetId" AS "contentId",
           COALESCE(l."name", ch."title") AS "name",
           COALESCE(c."name", '(câu chuyện)') AS "course",
           SUM(CASE WHEN t."metric" = 'content_start' THEN t."count" ELSE 0 END) AS "starts",
           SUM(CASE WHEN t."metric" = 'content_complete' THEN t."count" ELSE 0 END) AS "completes"
      FROM "AnalyticsTally" t
      LEFT JOIN "Lesson" l ON l."id" = t."targetId"
      LEFT JOIN "Course" c ON c."id" = l."courseId"
      LEFT JOIN "Chapter" ch ON ch."id" = t."targetId"
     WHERE t."metric" IN ('content_start', 'content_complete')
       AND t."day" >= (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date - ${days}::int
     GROUP BY 1, 2, 3
     ORDER BY "starts" DESC
     LIMIT 200`);
  return rows.map((r) => ({
    contentId: r.contentId,
    name: r.name ?? '(đã xoá)',
    course: r.course ?? '',
    starts: Number(r.starts),
    completes: Number(r.completes),
  }));
}

export async function courseCompletions(days: number) {
  const rows = await prisma.$queryRaw<{ name: string | null; n: bigint }[]>(Prisma.sql`
    SELECT c."name", SUM(t."count") AS n
      FROM "AnalyticsTally" t LEFT JOIN "Course" c ON c."id" = t."targetId"
     WHERE t."metric" = 'course_complete'
       AND t."day" >= (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date - ${days}::int
     GROUP BY 1 ORDER BY n DESC`);
  return rows.map((r) => ({ name: r.name ?? '(đã xoá)', n: Number(r.n) }));
}

/** Số phiên đã thấy từng block (drop-off). */
export async function blockFunnel(contentId: string, days: number) {
  const rows = await prisma.$queryRaw<{ blockIndex: number; blockType: string | null; sessions: bigint }[]>(Prisma.sql`
    SELECT "blockIndex", MIN("blockType") AS "blockType", COUNT(DISTINCT "sessionId") AS sessions
      FROM "AnalyticsEvent"
     WHERE "name" = 'block_view' AND "contentId" = ${contentId}
       AND "sessionHour" >= now() - make_interval(days => ${days}::int)
     GROUP BY 1 ORDER BY 1`);
  return rows.map((r) => ({ blockIndex: r.blockIndex, blockType: r.blockType ?? '', sessions: Number(r.sessions) }));
}

export async function questionStats(contentId: string, days: number) {
  const rows = await prisma.$queryRaw<{ blockIndex: number; answers: bigint; correct: bigint }[]>(Prisma.sql`
    SELECT "blockIndex", COUNT(*) AS answers,
           COUNT(*) FILTER (WHERE ("props"->>'correct')::boolean) AS correct
      FROM "AnalyticsEvent"
     WHERE "name" = 'question_answer' AND "contentId" = ${contentId}
       AND "sessionHour" >= now() - make_interval(days => ${days}::int)
     GROUP BY 1 ORDER BY 1`);
  return rows.map((r) => ({ blockIndex: r.blockIndex, answers: Number(r.answers), correct: Number(r.correct) }));
}

/** Phân bố đáp án (toàn thời gian: bộ đếm này không có ngày). key = `<blockKey>:<optionId>`. */
export async function optionTally(contentId: string) {
  const rows = await prisma.$queryRaw<{ key: string; count: number }[]>(Prisma.sql`
    SELECT "key", "count" FROM "AnalyticsTally"
     WHERE "metric" = 'quiz_option' AND "targetId" = ${contentId} AND "day" = ${NO_DAY}::date
     ORDER BY "key"`);
  return rows;
}

export async function topErrors(days: number) {
  const rows = await prisma.$queryRaw<{ errorName: string; message: string; routeType: string | null; source: string; n: bigint }[]>(Prisma.sql`
    SELECT "props"->>'errorName' AS "errorName", "props"->>'message' AS "message",
           "routeType", "props"->>'source' AS "source", COUNT(*) AS n
      FROM "AnalyticsEvent"
     WHERE "name" = 'error' AND "sessionHour" >= now() - make_interval(days => ${days}::int)
     GROUP BY 1, 2, 3, 4 ORDER BY n DESC LIMIT 30`);
  return rows.map((r) => ({ ...r, n: Number(r.n) }));
}

export async function featureUsage(days: number) {
  const rows = await prisma.$queryRaw<{ feature: string; events: bigint; sessions: bigint }[]>(Prisma.sql`
    SELECT CASE WHEN "name" = 'ref_open' THEN 'ref_open:' || ("props"->>'mode')
                WHEN "name" = 'setting_change' THEN 'setting:' || ("props"->>'setting')
                ELSE "name" END AS feature,
           COUNT(*) AS events, COUNT(DISTINCT "sessionId") AS sessions
      FROM "AnalyticsEvent"
     WHERE "name" IN ('ref_open', 'chat_send', 'setting_change', 'block_complete')
       AND "sessionHour" >= now() - make_interval(days => ${days}::int)
     GROUP BY 1 ORDER BY events DESC`);
  return rows.map((r) => ({ feature: r.feature, events: Number(r.events), sessions: Number(r.sessions) }));
}

/** Phiên theo ngày (giờ VN) và nhóm "đã biết Tepup bao lâu". */
export async function sessionsByDay(days: number) {
  const rows = await prisma.$queryRaw<{ day: Date; sessions: bigint; returning: bigint }[]>(Prisma.sql`
    SELECT ("sessionHour" AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS day,
           COUNT(DISTINCT "sessionId") AS sessions,
           COUNT(DISTINCT "sessionId") FILTER (WHERE "firstSeenBucket" <> '0') AS returning
      FROM "AnalyticsEvent"
     WHERE "sessionId" IS NOT NULL AND "sessionHour" >= now() - make_interval(days => ${days}::int)
     GROUP BY 1 ORDER BY 1`);
  return rows.map((r) => ({ day: r.day.toISOString().slice(0, 10), sessions: Number(r.sessions), returning: Number(r.returning) }));
}

/**
 * Retention theo mã ẩn danh (mã cố định từ 2026-11-22):
 * - D1/D7: các mã xuất hiện lần đầu trong khoảng [days, 8] ngày trước, bao nhiêu % quay lại
 *   sau ≥1 ngày và ≥7 ngày.
 * - D30: các mã xuất hiện lần đầu trong khoảng [days + 30, 31] ngày trước, bao nhiêu % quay lại
 *   sau ≥30 ngày.
 * Trước 2026-11-22 mã tự đổi sau 30 ngày, nên D30 của các nhóm cũ hơn thấp hơn thực tế.
 */
export async function retention(days: number) {
  const [r] = await prisma.$queryRaw<{ cohort: bigint; d1: bigint; d7: bigint; cohort30: bigint; d30: bigint }[]>(Prisma.sql`
    WITH firsts AS (
      SELECT "anonId", MIN("sessionHour") AS first_at, MAX("sessionHour") AS last_at
        FROM "AnalyticsEvent" WHERE "anonId" IS NOT NULL
       GROUP BY 1
    )
    SELECT COUNT(*) FILTER (WHERE w7) AS cohort,
           COUNT(*) FILTER (WHERE w7 AND last_at >= first_at + interval '1 day') AS d1,
           COUNT(*) FILTER (WHERE w7 AND last_at >= first_at + interval '7 days') AS d7,
           COUNT(*) FILTER (WHERE w30) AS cohort30,
           COUNT(*) FILTER (WHERE w30 AND last_at >= first_at + interval '30 days') AS d30
      FROM (
        SELECT first_at, last_at,
               (first_at >= now() - make_interval(days => ${days}::int) AND first_at < now() - interval '8 days') AS w7,
               (first_at >= now() - make_interval(days => ${days}::int + 30) AND first_at < now() - interval '31 days') AS w30
          FROM firsts
      ) f`);
  return {
    cohort: Number(r?.cohort ?? 0),
    d1: Number(r?.d1 ?? 0),
    d7: Number(r?.d7 ?? 0),
    cohort30: Number(r?.cohort30 ?? 0),
    d30: Number(r?.d30 ?? 0),
  };
}

// ---------------------------------------------------------------------------------------------
// Số tiếp cận theo kỳ (báo cáo nhà tài trợ, docs/data-tracking-docs/du-lieu-va-bao-cao.md). Kỳ = ngày giờ VN,
// hai đầu đều tính. "Người học" = mã trình duyệt (không phải người thật, không gồm người đã tắt).
// ---------------------------------------------------------------------------------------------

/** [from, to] (ngày VN) thành điều kiện trên "sessionHour", vẫn dùng được index. */
function hourRange(from: string, to: string) {
  return Prisma.sql`"sessionHour" >= (${from}::date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')
    AND "sessionHour" < ((${to}::date + 1)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')`;
}

export type ReachSummary = {
  learners: number;
  returning: number;
  sessions: number;
  newBrowsers: number;
  cumulativeBrowsers: number;
  starts: number;
  completes: number;
  courseCompletes: number;
};

export async function reachSummary(from: string, to: string): Promise<ReachSummary> {
  const [[ev], [tl]] = await Promise.all([
    prisma.$queryRaw<{ learners: bigint; returning: bigint; sessions: bigint }[]>(Prisma.sql`
      WITH ev AS (
        SELECT "anonId", "sessionId", ("sessionHour" AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS d
          FROM "AnalyticsEvent"
         WHERE "anonId" IS NOT NULL AND ${hourRange(from, to)}
      ), per AS (
        SELECT "anonId", COUNT(DISTINCT d) AS days FROM ev GROUP BY 1
      )
      SELECT (SELECT COUNT(*) FROM per) AS learners,
             (SELECT COUNT(*) FROM per WHERE days >= 2) AS returning,
             (SELECT COUNT(DISTINCT "sessionId") FROM ev) AS sessions`),
    prisma.$queryRaw<{ nb: bigint | null; cum: bigint | null; st: bigint | null; co: bigint | null; cc: bigint | null }[]>(Prisma.sql`
      SELECT SUM("count") FILTER (WHERE "metric" = 'new_browser' AND "day" >= ${from}::date) AS nb,
             SUM("count") FILTER (WHERE "metric" = 'new_browser') AS cum,
             SUM("count") FILTER (WHERE "metric" = 'content_start' AND "day" >= ${from}::date) AS st,
             SUM("count") FILTER (WHERE "metric" = 'content_complete' AND "day" >= ${from}::date) AS co,
             SUM("count") FILTER (WHERE "metric" = 'course_complete' AND "day" >= ${from}::date) AS cc
        FROM "AnalyticsTally"
       WHERE "metric" IN ('new_browser', 'content_start', 'content_complete', 'course_complete')
         AND "day" <= ${to}::date`),
  ]);
  return {
    learners: Number(ev?.learners ?? 0),
    returning: Number(ev?.returning ?? 0),
    sessions: Number(ev?.sessions ?? 0),
    newBrowsers: Number(tl?.nb ?? 0),
    cumulativeBrowsers: Number(tl?.cum ?? 0),
    starts: Number(tl?.st ?? 0),
    completes: Number(tl?.co ?? 0),
    courseCompletes: Number(tl?.cc ?? 0),
  };
}

/** Ngày đầu tiên bộ đếm "trình duyệt mới" có số liệu (để ghi "tính từ …"). */
export async function newBrowserCountingSince(): Promise<string | null> {
  const [r] = await prisma.$queryRaw<{ d: Date | null }[]>(Prisma.sql`
    SELECT MIN("day") AS d FROM "AnalyticsTally" WHERE "metric" = 'new_browser'`);
  return r?.d ? r.d.toISOString().slice(0, 10) : null;
}

export type BreakdownRow = { key: string; learners: number };

/** Người học theo quốc gia hoặc loại thiết bị. */
export async function reachBreakdown(by: 'country' | 'device', from: string, to: string): Promise<BreakdownRow[]> {
  const col = by === 'country' ? Prisma.sql`"country"` : Prisma.sql`"device"`;
  const rows = await prisma.$queryRaw<{ key: string | null; learners: bigint }[]>(Prisma.sql`
    SELECT ${col} AS key, COUNT(DISTINCT "anonId") AS learners
      FROM "AnalyticsEvent"
     WHERE "anonId" IS NOT NULL AND ${hourRange(from, to)}
     GROUP BY 1 ORDER BY learners DESC`);
  return rows.map((r) => ({ key: r.key ?? '', learners: Number(r.learners) }));
}

export type CourseReachRow = {
  courseId: string;
  name: string;
  learners: number;
  starts: number;
  completes: number;
  courseCompletes: number;
};

/** Theo khoá: người học (mã đã mở ít nhất một bài), lượt bắt đầu/học xong bài, học xong cả khoá. */
export async function courseReach(from: string, to: string): Promise<CourseReachRow[]> {
  const rows = await prisma.$queryRaw<
    { courseId: string; name: string; learners: bigint; starts: bigint; completes: bigint; courses: bigint }[]
  >(Prisma.sql`
    WITH ppl AS (
      SELECT l."courseId" AS cid, COUNT(DISTINCT e."anonId") AS learners
        FROM "AnalyticsEvent" e JOIN "Lesson" l ON l."id" = e."contentId"
       WHERE e."name" = 'content_start' AND e."contentType" = 'lesson' AND e."anonId" IS NOT NULL
         AND ${hourRange(from, to)}
       GROUP BY 1
    ), tl AS (
      SELECT l."courseId" AS cid,
             SUM(t."count") FILTER (WHERE t."metric" = 'content_start') AS starts,
             SUM(t."count") FILTER (WHERE t."metric" = 'content_complete') AS completes
        FROM "AnalyticsTally" t JOIN "Lesson" l ON l."id" = t."targetId"
       WHERE t."metric" IN ('content_start', 'content_complete') AND t."key" = 'lesson'
         AND t."day" BETWEEN ${from}::date AND ${to}::date
       GROUP BY 1
    ), cc AS (
      SELECT t."targetId" AS cid, SUM(t."count") AS courses
        FROM "AnalyticsTally" t
       WHERE t."metric" = 'course_complete' AND t."day" BETWEEN ${from}::date AND ${to}::date
       GROUP BY 1
    )
    SELECT c."id" AS "courseId", c."name",
           COALESCE(ppl.learners, 0) AS learners, COALESCE(tl.starts, 0) AS starts,
           COALESCE(tl.completes, 0) AS completes, COALESCE(cc.courses, 0) AS courses
      FROM "Course" c
      LEFT JOIN ppl ON ppl.cid = c."id"
      LEFT JOIN tl ON tl.cid = c."id"
      LEFT JOIN cc ON cc.cid = c."id"
     WHERE ppl.cid IS NOT NULL OR tl.cid IS NOT NULL OR cc.cid IS NOT NULL
     ORDER BY learners DESC, starts DESC`);
  return rows.map((r) => ({
    courseId: r.courseId,
    name: r.name,
    learners: Number(r.learners),
    starts: Number(r.starts),
    completes: Number(r.completes),
    courseCompletes: Number(r.courses),
  }));
}
