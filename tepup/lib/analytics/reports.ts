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
 * Retention theo mã ẩn danh: trong các mã xuất hiện lần đầu trong khoảng [days, 8] ngày trước,
 * bao nhiêu % quay lại sau ≥1 ngày và ≥7 ngày. Mã tự đổi sau 30 ngày nên không có D30.
 */
export async function retention(days: number) {
  const [r] = await prisma.$queryRaw<{ cohort: bigint; d1: bigint; d7: bigint }[]>(Prisma.sql`
    WITH firsts AS (
      SELECT "anonId", MIN("sessionHour") AS first_at, MAX("sessionHour") AS last_at
        FROM "AnalyticsEvent" WHERE "anonId" IS NOT NULL
       GROUP BY 1
    )
    SELECT COUNT(*) AS cohort,
           COUNT(*) FILTER (WHERE last_at >= first_at + interval '1 day') AS d1,
           COUNT(*) FILTER (WHERE last_at >= first_at + interval '7 days') AS d7
      FROM firsts
     WHERE first_at >= now() - make_interval(days => ${days}::int)
       AND first_at < now() - interval '8 days'`);
  return { cohort: Number(r?.cohort ?? 0), d1: Number(r?.d1 ?? 0), d7: Number(r?.d7 ?? 0) };
}
