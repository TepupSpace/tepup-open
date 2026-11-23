import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

/**
 * Hành trình khoá → bài → block cho /admin/analytics/journey (chỉ admin).
 * Chỉ số tổng hợp theo mã trình duyệt (cố định từ 2026-11-22), không lộ mã nào ra ngoài.
 * Chỉ tính người đang bật số liệu (số đếm tổng nằm ở trang tổng quan).
 */

const since = (days: number) => Prisma.sql`"sessionHour" >= now() - make_interval(days => ${days}::int)`;

export type CourseOption = { id: string; name: string; isActive: boolean };

export async function courseOptions(): Promise<CourseOption[]> {
  return prisma.course.findMany({
    select: { id: true, name: true, isActive: true },
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
  });
}

export type CourseLessonRow = {
  lessonId: string;
  name: string;
  position: number;
  starters: number;
  completers: number;
  /** Trong số người học xong bài này, bao nhiêu người đã mở bài kế tiếp. */
  continued: number;
  /** Người mà bài xa nhất họ đã mở (trong khoá) là bài này. */
  furthestHere: number;
};

/** Các bài đang hiển thị của khoá, theo thứ tự cấp độ rồi bài. */
export async function courseJourney(courseId: string, days: number): Promise<CourseLessonRow[]> {
  const rows = await prisma.$queryRaw<
    { lessonId: string; name: string; pos: bigint; starters: bigint; completers: bigint; continued: bigint; furthest: bigint }[]
  >(Prisma.sql`
    WITH ls AS (
      SELECT l."id", l."name",
             ROW_NUMBER() OVER (ORDER BY lv."sortOrder", l."sortOrder", l."createdAt") AS pos
        FROM "Lesson" l JOIN "Level" lv ON lv."id" = l."levelId"
       WHERE l."courseId" = ${courseId} AND l."isActive" = true
    ), ev AS (
      SELECT DISTINCT e."contentId", e."anonId", e."name"
        FROM "AnalyticsEvent" e
       WHERE e."name" IN ('content_start', 'content_complete') AND e."contentType" = 'lesson'
         AND e."anonId" IS NOT NULL AND e."contentId" IN (SELECT "id" FROM ls) AND ${since(days)}
    ), st AS (
      SELECT "contentId", "anonId" FROM ev WHERE "name" = 'content_start'
    ), co AS (
      SELECT "contentId", "anonId" FROM ev WHERE "name" = 'content_complete'
    ), furthest AS (
      SELECT st."anonId", MAX(ls.pos) AS maxpos FROM st JOIN ls ON ls."id" = st."contentId" GROUP BY 1
    )
    SELECT ls."id" AS "lessonId", ls."name", ls.pos,
           (SELECT COUNT(*) FROM st WHERE st."contentId" = ls."id") AS starters,
           (SELECT COUNT(*) FROM co WHERE co."contentId" = ls."id") AS completers,
           (SELECT COUNT(*) FROM co
              JOIN ls nx ON nx.pos = ls.pos + 1
              JOIN st ON st."contentId" = nx."id" AND st."anonId" = co."anonId"
             WHERE co."contentId" = ls."id") AS continued,
           (SELECT COUNT(*) FROM furthest f WHERE f.maxpos = ls.pos) AS furthest
      FROM ls ORDER BY ls.pos`);
  return rows.map((r) => ({
    lessonId: r.lessonId,
    name: r.name,
    position: Number(r.pos),
    starters: Number(r.starters),
    completers: Number(r.completers),
    continued: Number(r.continued),
    furthestHere: Number(r.furthest),
  }));
}

export type ContentInfo = {
  id: string;
  kind: 'lesson' | 'chapter';
  name: string;
  /** Khoá của bài (null với chương truyện). */
  courseId: string | null;
  parentName: string;
  blocks: unknown[];
};

export async function contentInfo(contentId: string): Promise<ContentInfo | null> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: contentId },
    select: { id: true, name: true, courseId: true, course: { select: { name: true } }, content: { select: { blocks: true } } },
  });
  if (lesson) {
    return {
      id: lesson.id,
      kind: 'lesson',
      name: lesson.name,
      courseId: lesson.courseId,
      parentName: lesson.course.name,
      blocks: Array.isArray(lesson.content?.blocks) ? (lesson.content.blocks as unknown[]) : [],
    };
  }
  const chapter = await prisma.chapter.findUnique({
    where: { id: contentId },
    select: { id: true, title: true, story: { select: { title: true } }, content: { select: { blocks: true } } },
  });
  if (!chapter) return null;
  return {
    id: chapter.id,
    kind: 'chapter',
    name: chapter.title,
    courseId: null,
    parentName: chapter.story.title,
    blocks: Array.isArray(chapter.content?.blocks) ? (chapter.content.blocks as unknown[]) : [],
  };
}

const stripTags = (s: string) => s.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

/** Nhãn ngắn của một block (chữ thường, React tự escape), để biết block # là gì. */
export function blockLabel(block: unknown): string {
  if (!block || typeof block !== 'object') return '';
  const b = block as Record<string, unknown>;
  const pick = (v: unknown) => (typeof v === 'string' ? stripTags(v) : '');
  const text =
    pick(b.html) ||
    pick(b.title) ||
    pick(b.question) ||
    pick(b.caption) ||
    pick(b.alt) ||
    (Array.isArray(b.paragraphs) ? pick(b.paragraphs[0]) : '');
  return text.length > 70 ? `${text.slice(0, 69)}…` : text;
}

export type BlockJourneyRow = {
  blockIndex: number;
  blockType: string;
  reached: number;
  stoppedHere: number;
  /** Người đã làm xong block (block tương tác hoặc câu hỏi). null: block không có thao tác. */
  done: number | null;
  medianSeconds: number | null;
  timeSamples: number;
  /** Khoảng > 30 phút (bỏ khỏi trung vị: người học có lẽ đã rời máy). */
  idle: number;
};

export type LessonJourney = { starters: number; completers: number; blocks: BlockJourneyRow[] };

/**
 * Theo từng block của một bài/chương:
 * - reached: số người (mã) đã thấy block; stoppedHere: người chưa học xong bài mà block xa nhất
 *   họ thấy là block này.
 * - thời gian: từ lúc block hiện ra đến lúc nhóm block kế tiếp hiện ra (cùng phiên), hoặc đến lúc
 *   thoát/học xong bài với block cuối. Block hiện ra cùng lúc dùng chung một khoảng.
 */
export async function lessonJourney(contentId: string, days: number): Promise<LessonJourney> {
  const [[totals], counts, times] = await Promise.all([
    prisma.$queryRaw<{ starters: bigint; completers: bigint }[]>(Prisma.sql`
      SELECT COUNT(DISTINCT "anonId") FILTER (WHERE "name" = 'content_start') AS starters,
             COUNT(DISTINCT "anonId") FILTER (WHERE "name" = 'content_complete') AS completers
        FROM "AnalyticsEvent"
       WHERE "contentId" = ${contentId} AND "anonId" IS NOT NULL
         AND "name" IN ('content_start', 'content_complete') AND ${since(days)}`),
    prisma.$queryRaw<{ blockIndex: number; blockType: string | null; reached: bigint; stopped: bigint; done: bigint }[]>(Prisma.sql`
      WITH v AS (
        SELECT "anonId", "blockIndex", MIN("blockType") AS "blockType"
          FROM "AnalyticsEvent"
         WHERE "name" = 'block_view' AND "contentId" = ${contentId} AND "anonId" IS NOT NULL AND ${since(days)}
         GROUP BY 1, 2
      ), completed AS (
        SELECT DISTINCT "anonId" FROM "AnalyticsEvent"
         WHERE "name" = 'content_complete' AND "contentId" = ${contentId} AND "anonId" IS NOT NULL AND ${since(days)}
      ), far AS (
        SELECT v."anonId", MAX(v."blockIndex") AS maxi FROM v
         WHERE v."anonId" NOT IN (SELECT "anonId" FROM completed)
         GROUP BY 1
      ), dn AS (
        SELECT "blockIndex", COUNT(DISTINCT "anonId") AS done FROM "AnalyticsEvent"
         WHERE "name" IN ('block_complete', 'question_answer') AND "contentId" = ${contentId}
           AND "anonId" IS NOT NULL AND ${since(days)}
         GROUP BY 1
      )
      SELECT v."blockIndex", MIN(v."blockType") AS "blockType", COUNT(*) AS reached,
             (SELECT COUNT(*) FROM far WHERE far.maxi = v."blockIndex") AS stopped,
             COALESCE((SELECT dn.done FROM dn WHERE dn."blockIndex" = v."blockIndex"), -1) AS done
        FROM v GROUP BY v."blockIndex" ORDER BY v."blockIndex"`),
    prisma.$queryRaw<{ blockIndex: number; median: number | null; samples: bigint; idle: bigint }[]>(Prisma.sql`
      WITH v AS (
        SELECT "sessionId", "blockIndex", MIN("tOffsetS") AS t
          FROM "AnalyticsEvent"
         WHERE "name" = 'block_view' AND "contentId" = ${contentId} AND "sessionId" IS NOT NULL AND ${since(days)}
         GROUP BY 1, 2
      ), ends AS (
        SELECT "sessionId", "tOffsetS" AS t FROM "AnalyticsEvent"
         WHERE "name" IN ('content_exit', 'content_complete') AND "contentId" = ${contentId}
           AND "sessionId" IS NOT NULL AND ${since(days)}
      ), nx AS (
        SELECT v."blockIndex", v.t,
               COALESCE(
                 (SELECT MIN(v2.t) FROM v v2 WHERE v2."sessionId" = v."sessionId" AND v2.t > v.t),
                 (SELECT MIN(e.t) FROM ends e WHERE e."sessionId" = v."sessionId" AND e.t >= v.t)
               ) AS next_t
          FROM v
      )
      SELECT "blockIndex",
             percentile_cont(0.5) WITHIN GROUP (ORDER BY next_t - t) FILTER (WHERE next_t - t <= 1800) AS median,
             COUNT(*) FILTER (WHERE next_t - t <= 1800) AS samples,
             COUNT(*) FILTER (WHERE next_t - t > 1800) AS idle
        FROM nx GROUP BY 1`),
  ]);
  const timeBy = new Map(times.map((t) => [t.blockIndex, t]));
  return {
    starters: Number(totals?.starters ?? 0),
    completers: Number(totals?.completers ?? 0),
    blocks: counts.map((c) => {
      const t = timeBy.get(c.blockIndex);
      const done = Number(c.done);
      return {
        blockIndex: c.blockIndex,
        blockType: c.blockType ?? '',
        reached: Number(c.reached),
        stoppedHere: Number(c.stopped),
        done: done < 0 ? null : done,
        medianSeconds: t?.median === null || t?.median === undefined ? null : Number(t.median),
        timeSamples: Number(t?.samples ?? 0),
        idle: Number(t?.idle ?? 0),
      };
    }),
  };
}
