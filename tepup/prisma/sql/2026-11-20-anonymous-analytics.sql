-- Số liệu ẩn danh của người học (lib/analytics/, POST /api/events). See CLAUDE.md › Analytics.
--
-- AnalyticsEvent: one row per learner event. No IP, no user agent, no user id, no learner text.
--   `anonId` is a random id the browser rotates every 30 days; nothing links two ids.
--   `sessionHour` is rounded down to the hour on purpose. Rows older than 365 days are deleted
--   daily by /api/cron/analytics-cleanup.
-- AnalyticsTally: plain counters with no id at all (completions per day, quiz options with no day,
--   stored as 1970-01-01). Everyone adds to them, including learners who switched tracking off.
--
-- Apply with psql as `postgres` (owner), staging first, then production. Idempotent.
-- The code depends on it: apply to both databases BEFORE merging to main.
-- Not `prisma db push`: see 2026-09-28-suggestions.sql for why.

begin;

CREATE TABLE IF NOT EXISTS "AnalyticsEvent" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "anonId" UUID,
    "sessionId" UUID,
    "sessionHour" TIMESTAMPTZ(3) NOT NULL,
    "tOffsetS" INTEGER NOT NULL DEFAULT 0,
    "routeType" TEXT,
    "contentType" TEXT,
    "contentId" TEXT,
    "blockIndex" INTEGER,
    "blockType" TEXT,
    "props" JSONB,
    "country" CHAR(2),
    "device" TEXT,
    "browser" TEXT,
    "firstSeenBucket" TEXT,
    "lessonsDoneBucket" TEXT,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AnalyticsEvent_name_sessionHour_idx" ON "AnalyticsEvent"("name", "sessionHour");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_contentId_name_idx" ON "AnalyticsEvent"("contentId", "name");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_anonId_idx" ON "AnalyticsEvent"("anonId");

CREATE TABLE IF NOT EXISTS "AnalyticsTally" (
    "metric" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT '',
    "day" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AnalyticsTally_pkey" PRIMARY KEY ("metric","targetId","key","day")
);

alter table "AnalyticsEvent" enable row level security;
alter table "AnalyticsTally" enable row level security;
revoke all on "AnalyticsEvent", "AnalyticsTally" from anon, authenticated;
revoke all on sequence "AnalyticsEvent_id_seq" from anon, authenticated;
grant select, insert, update, delete on "AnalyticsEvent", "AnalyticsTally" to tepup_app;
grant usage, select on sequence "AnalyticsEvent_id_seq" to tepup_app;
grant select on "AnalyticsEvent", "AnalyticsTally" to tepup_backup;

commit;

-- Check: RLS on, no anon access, the app can write, the backup can read.
select relname, relrowsecurity as rls_on,
       has_table_privilege('anon', oid, 'SELECT') as anon_select,
       has_table_privilege('tepup_app', oid, 'INSERT') as app_insert,
       has_table_privilege('tepup_backup', oid, 'SELECT') as backup_select
  from pg_class
 where relname in ('AnalyticsEvent', 'AnalyticsTally');
