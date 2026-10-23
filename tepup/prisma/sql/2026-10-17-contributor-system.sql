-- Contributor system (docs/proposal-contributor-edits-and-maintainers.md, PRs 1–10):
-- content history (ContentRevision + RevisionPatrol), course roles (CourseMember, CourseBlock,
-- ReviewerProfile), audit log, in-app notifications, discussions, "Gửi người duyệt"
-- (ReviewRequest*), lesson flags, licence/credit/tombstone columns on User, and the new
-- Contribution / Suggestion columns and ContributionType values.
--
-- Apply with psql as `postgres` (owner), staging first, then production. Idempotent.
-- The code depends on all of it: apply to both databases BEFORE merging to main.
-- Not `prisma db push`: see 2026-09-28-suggestions.sql for why.
--
-- Generated from `prisma migrate diff` (main 2934e74 → this branch), made idempotent by hand,
-- plus the backfills and permissions at the end.

begin;

-- Access levels renamed (2026-10-20): USER → LEARNER, CONTRIBUTOR → AUTHOR,
-- TRUSTED_CONTRIBUTOR → TRUSTED_AUTHOR. RENAME VALUE keeps every user's role (and the
-- column default) as is. Also renames course-role values on databases created from an
-- earlier draft of this file. Each rename runs only while the old value still exists.
do $$
declare r record;
begin
  for r in select * from (values
    ('UserRole', 'USER', 'LEARNER'),
    ('UserRole', 'CONTRIBUTOR', 'AUTHOR'),
    ('UserRole', 'TRUSTED_CONTRIBUTOR', 'TRUSTED_AUTHOR'),
    ('CourseRole', 'MAINTAINER', 'COURSE_LEAD'),
    ('RevisionSource', 'MAINTAINER', 'COURSE_LEAD')
  ) as v(typ, old, new) loop
    if exists (select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid
               where t.typname = r.typ and e.enumlabel = r.old) then
      execute format('alter type %I rename value %L to %L', r.typ, r.old, r.new);
    end if;
  end loop;
end $$;

do $$ begin
  CREATE TYPE "RevisionTarget" AS ENUM ('LESSON', 'CHAPTER', 'LIBRARY_ENTRY', 'COURSE_OUTLINE');
exception when duplicate_object then null; end $$;

do $$ begin
  CREATE TYPE "RevisionSource" AS ENUM ('BASELINE', 'ADMIN_PUBLISH', 'CONTRIBUTION', 'COURSE_LEAD', 'ROLLBACK', 'SCRIPT', 'DELETED');
exception when duplicate_object then null; end $$;

do $$ begin
  CREATE TYPE "CourseRole" AS ENUM ('COURSE_LEAD', 'TRUSTED_REVIEWER');
exception when duplicate_object then null; end $$;

do $$ begin
  CREATE TYPE "ReviewerDisclosure" AS ENUM ('NONE', 'ANONYMOUS', 'CREDENTIAL', 'FULL');
exception when duplicate_object then null; end $$;

do $$ begin
  CREATE TYPE "NotificationKind" AS ENUM ('CONTRIBUTION_DECIDED', 'CONTRIBUTION_SUBMITTED', 'REVIEW_REQUESTED', 'REVIEW_OPINION', 'COMMENT', 'ESCALATED', 'FLAG_CHANGED', 'COURSE_ROLE_GRANTED', 'COURSE_ORPHANED');
exception when duplicate_object then null; end $$;

do $$ begin
  CREATE TYPE "DiscussionTarget" AS ENUM ('LESSON', 'CHAPTER', 'LIBRARY_ENTRY', 'CONTRIBUTION', 'REVIEW_REQUEST');
exception when duplicate_object then null; end $$;

do $$ begin
  CREATE TYPE "ReviewRequestStatus" AS ENUM ('OPEN', 'CLOSED');
exception when duplicate_object then null; end $$;

do $$ begin
  CREATE TYPE "ReviewVerdict" AS ENUM ('ENDORSED', 'CHANGES_SUGGESTED');
exception when duplicate_object then null; end $$;

do $$ begin
  CREATE TYPE "LessonFlagKind" AS ENUM ('NEEDS_SOURCES', 'UNDER_REVIEW', 'OUTDATED', 'NEEDS_ACCESSIBILITY');
exception when duplicate_object then null; end $$;

do $$ begin
  CREATE TYPE "CreditMode" AS ENUM ('NAME', 'PSEUDONYM');
exception when duplicate_object then null; end $$;

ALTER TYPE "ContributionType" ADD VALUE IF NOT EXISTS 'EDIT_CHAPTER_CONTENT';

ALTER TYPE "ContributionType" ADD VALUE IF NOT EXISTS 'EDIT_LIBRARY_ENTRY';

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "creditMode" "CreditMode" NOT NULL DEFAULT 'PSEUDONYM';

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "licenceAcceptedAt" TIMESTAMP(3);

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "licenceVersion" TEXT;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "publicHandle" TEXT;

ALTER TABLE "Contribution" ADD COLUMN IF NOT EXISTS "baseSnapshot" JSONB;

ALTER TABLE "Contribution" ADD COLUMN IF NOT EXISTS "baseUpdatedAt" TIMESTAMP(3);

ALTER TABLE "Contribution" ADD COLUMN IF NOT EXISTS "escalatedAt" TIMESTAMP(3);

ALTER TABLE "Contribution" ADD COLUMN IF NOT EXISTS "escalatedById" TEXT;

ALTER TABLE "Contribution" ADD COLUMN IF NOT EXISTS "escalationNote" TEXT;

ALTER TABLE "Contribution" ADD COLUMN IF NOT EXISTS "licenceVersion" TEXT;

ALTER TABLE "Contribution" ADD COLUMN IF NOT EXISTS "suggestionId" TEXT;

ALTER TABLE "Suggestion" ADD COLUMN IF NOT EXISTS "claimedAt" TIMESTAMP(3);

ALTER TABLE "Suggestion" ADD COLUMN IF NOT EXISTS "claimedById" TEXT;

CREATE TABLE IF NOT EXISTS "ContentRevision" (
    "id" TEXT NOT NULL,
    "targetType" "RevisionTarget" NOT NULL,
    "targetId" TEXT NOT NULL,
    "courseId" TEXT,
    "label" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "source" "RevisionSource" NOT NULL,
    "actorId" TEXT,
    "authorId" TEXT,
    "contributionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentRevision_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "RevisionPatrol" (
    "revisionId" TEXT NOT NULL,
    "patrolledById" TEXT,
    "patrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevisionPatrol_pkey" PRIMARY KEY ("revisionId")
);

CREATE TABLE IF NOT EXISTS "CourseMember" (
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CourseRole" NOT NULL,
    "disclosure" "ReviewerDisclosure",
    "addedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseMember_pkey" PRIMARY KEY ("courseId","userId")
);

CREATE TABLE IF NOT EXISTS "CourseBlock" (
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT,
    "blockedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseBlock_pkey" PRIMARY KEY ("courseId","userId")
);

CREATE TABLE IF NOT EXISTS "ReviewerProfile" (
    "userId" TEXT NOT NULL,
    "publicName" TEXT,
    "credential" TEXT,
    "affiliation" TEXT,
    "disclosure" "ReviewerDisclosure" NOT NULL DEFAULT 'NONE',
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "verificationNote" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewerProfile_pkey" PRIMARY KEY ("userId")
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "NotificationKind" NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "DiscussionThread" (
    "id" TEXT NOT NULL,
    "targetType" "DiscussionTarget" NOT NULL,
    "targetId" TEXT NOT NULL,
    "courseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscussionThread_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "DiscussionComment" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(3),
    "hiddenAt" TIMESTAMP(3),
    "hiddenById" TEXT,

    CONSTRAINT "DiscussionComment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ReviewRequest" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "requestedById" TEXT,
    "title" TEXT NOT NULL,
    "blocks" JSONB NOT NULL,
    "baseSnapshot" JSONB,
    "baseUpdatedAt" TIMESTAMP(3),
    "message" TEXT,
    "status" "ReviewRequestStatus" NOT NULL DEFAULT 'OPEN',
    "closedAt" TIMESTAMP(3),
    "publishedRevisionId" TEXT,
    "escalatedAt" TIMESTAMP(3),
    "escalatedById" TEXT,
    "escalationNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ReviewRequestReviewer" (
    "requestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ReviewRequestReviewer_pkey" PRIMARY KEY ("requestId","userId")
);

CREATE TABLE IF NOT EXISTS "ReviewOpinion" (
    "requestId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "verdict" "ReviewVerdict" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewOpinion_pkey" PRIMARY KEY ("requestId","reviewerId")
);

CREATE TABLE IF NOT EXISTS "LessonFlag" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "kind" "LessonFlagKind" NOT NULL,
    "note" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,

    CONSTRAINT "LessonFlag_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ContentRevision_targetType_targetId_createdAt_idx" ON "ContentRevision"("targetType", "targetId", "createdAt");

CREATE INDEX IF NOT EXISTS "ContentRevision_courseId_createdAt_idx" ON "ContentRevision"("courseId", "createdAt");

CREATE INDEX IF NOT EXISTS "ContentRevision_createdAt_idx" ON "ContentRevision"("createdAt");

CREATE INDEX IF NOT EXISTS "ContentRevision_authorId_idx" ON "ContentRevision"("authorId");

CREATE INDEX IF NOT EXISTS "CourseMember_userId_idx" ON "CourseMember"("userId");

CREATE INDEX IF NOT EXISTS "CourseBlock_userId_idx" ON "CourseBlock"("userId");

CREATE INDEX IF NOT EXISTS "AuditLog_targetType_targetId_createdAt_idx" ON "AuditLog"("targetType", "targetId", "createdAt");

CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

CREATE INDEX IF NOT EXISTS "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");

CREATE INDEX IF NOT EXISTS "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "DiscussionThread_targetType_targetId_key" ON "DiscussionThread"("targetType", "targetId");

CREATE INDEX IF NOT EXISTS "DiscussionComment_threadId_createdAt_idx" ON "DiscussionComment"("threadId", "createdAt");

CREATE INDEX IF NOT EXISTS "ReviewRequest_courseId_status_idx" ON "ReviewRequest"("courseId", "status");

CREATE INDEX IF NOT EXISTS "ReviewRequest_lessonId_status_idx" ON "ReviewRequest"("lessonId", "status");

CREATE INDEX IF NOT EXISTS "ReviewRequestReviewer_userId_idx" ON "ReviewRequestReviewer"("userId");

CREATE INDEX IF NOT EXISTS "LessonFlag_lessonId_resolvedAt_idx" ON "LessonFlag"("lessonId", "resolvedAt");

CREATE INDEX IF NOT EXISTS "LessonFlag_courseId_resolvedAt_idx" ON "LessonFlag"("courseId", "resolvedAt");

CREATE UNIQUE INDEX IF NOT EXISTS "User_publicHandle_key" ON "User"("publicHandle");

CREATE INDEX IF NOT EXISTS "Contribution_targetId_idx" ON "Contribution"("targetId");

do $$ begin
  ALTER TABLE "ContentRevision" ADD CONSTRAINT "ContentRevision_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
exception when duplicate_object then null; end $$;

do $$ begin
  ALTER TABLE "ContentRevision" ADD CONSTRAINT "ContentRevision_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
exception when duplicate_object then null; end $$;

do $$ begin
  ALTER TABLE "RevisionPatrol" ADD CONSTRAINT "RevisionPatrol_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "ContentRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
exception when duplicate_object then null; end $$;

do $$ begin
  ALTER TABLE "CourseMember" ADD CONSTRAINT "CourseMember_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
exception when duplicate_object then null; end $$;

do $$ begin
  ALTER TABLE "CourseMember" ADD CONSTRAINT "CourseMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
exception when duplicate_object then null; end $$;

do $$ begin
  ALTER TABLE "ReviewerProfile" ADD CONSTRAINT "ReviewerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
exception when duplicate_object then null; end $$;

do $$ begin
  ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
exception when duplicate_object then null; end $$;

do $$ begin
  ALTER TABLE "DiscussionComment" ADD CONSTRAINT "DiscussionComment_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "DiscussionThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
exception when duplicate_object then null; end $$;

do $$ begin
  ALTER TABLE "DiscussionComment" ADD CONSTRAINT "DiscussionComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
exception when duplicate_object then null; end $$;

do $$ begin
  ALTER TABLE "ReviewRequest" ADD CONSTRAINT "ReviewRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
exception when duplicate_object then null; end $$;

do $$ begin
  ALTER TABLE "ReviewRequestReviewer" ADD CONSTRAINT "ReviewRequestReviewer_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ReviewRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
exception when duplicate_object then null; end $$;

do $$ begin
  ALTER TABLE "ReviewRequestReviewer" ADD CONSTRAINT "ReviewRequestReviewer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
exception when duplicate_object then null; end $$;

do $$ begin
  ALTER TABLE "ReviewOpinion" ADD CONSTRAINT "ReviewOpinion_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ReviewRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
exception when duplicate_object then null; end $$;

do $$ begin
  ALTER TABLE "ReviewOpinion" ADD CONSTRAINT "ReviewOpinion_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Backfills
-- ---------------------------------------------------------------------------

-- Licence consent given before the feature existed (confirmed by the organisation on
-- 2026-10-13: every existing author has consented outside the system). Recorded for every
-- existing staff account, and for contributions already submitted or decided.
update "User"
   set "licenceVersion" = 'CC-BY-SA-4.0/2026-10', "licenceAcceptedAt" = now()
 where "licenceVersion" is null and "role" <> 'LEARNER' and "deletedAt" is null;
update "Contribution" c
   set "licenceVersion" = 'CC-BY-SA-4.0/2026-10'
 where c."licenceVersion" is null and c."status" <> 'DRAFT';

-- A random public handle for every existing account (5 chars, no 0/o/1/l/i; never derived
-- from the username or id). Retries on the rare clash.
do $$
declare r record; h text; alphabet text := 'abcdefghjkmnpqrstuvwxyz23456789'; i int;
begin
  for r in select id from "User" where "publicHandle" is null loop
    loop
      h := '';
      for i in 1..5 loop
        h := h || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
      end loop;
      begin
        update "User" set "publicHandle" = h where id = r.id;
        exit;
      exception when unique_violation then
        -- try another handle
      end;
    end loop;
  end loop;
end $$;

-- The author of each course maintains it (proposal §6.8); addedById null = automatic.
insert into "CourseMember" ("courseId", "userId", "role", "createdAt")
select c.id, c."createdById", 'COURSE_LEAD', now()
  from "Course" c join "User" u on u.id = c."createdById"
 where c."createdById" is not null and u."deletedAt" is null
on conflict do nothing;

-- No history backfill: the first recorded change of a target stores its live version as
-- BASELINE (lib/services/revision-service.ts).

-- ---------------------------------------------------------------------------
-- Permissions: RLS on, no policies, no API-role grants (same as every public table).
-- Append-only tables: the app role may insert and read, never update or delete.
-- ---------------------------------------------------------------------------
alter table "ContentRevision" enable row level security;
revoke all on "ContentRevision" from anon, authenticated;
grant select, insert on "ContentRevision" to tepup_app;
revoke update, delete, truncate on "ContentRevision" from tepup_app;
grant select on "ContentRevision" to tepup_backup;
alter table "RevisionPatrol" enable row level security;
revoke all on "RevisionPatrol" from anon, authenticated;
grant select, insert on "RevisionPatrol" to tepup_app;
revoke update, delete, truncate on "RevisionPatrol" from tepup_app;
grant select on "RevisionPatrol" to tepup_backup;
alter table "CourseMember" enable row level security;
revoke all on "CourseMember" from anon, authenticated;
grant select, insert, update, delete on "CourseMember" to tepup_app;
grant select on "CourseMember" to tepup_backup;
alter table "CourseBlock" enable row level security;
revoke all on "CourseBlock" from anon, authenticated;
grant select, insert, update, delete on "CourseBlock" to tepup_app;
grant select on "CourseBlock" to tepup_backup;
alter table "ReviewerProfile" enable row level security;
revoke all on "ReviewerProfile" from anon, authenticated;
grant select, insert, update, delete on "ReviewerProfile" to tepup_app;
grant select on "ReviewerProfile" to tepup_backup;
alter table "AuditLog" enable row level security;
revoke all on "AuditLog" from anon, authenticated;
grant select, insert on "AuditLog" to tepup_app;
revoke update, delete, truncate on "AuditLog" from tepup_app;
grant select on "AuditLog" to tepup_backup;
alter table "Notification" enable row level security;
revoke all on "Notification" from anon, authenticated;
grant select, insert, update, delete on "Notification" to tepup_app;
grant select on "Notification" to tepup_backup;
alter table "DiscussionThread" enable row level security;
revoke all on "DiscussionThread" from anon, authenticated;
grant select, insert, update, delete on "DiscussionThread" to tepup_app;
grant select on "DiscussionThread" to tepup_backup;
alter table "DiscussionComment" enable row level security;
revoke all on "DiscussionComment" from anon, authenticated;
grant select, insert, update, delete on "DiscussionComment" to tepup_app;
grant select on "DiscussionComment" to tepup_backup;
alter table "ReviewRequest" enable row level security;
revoke all on "ReviewRequest" from anon, authenticated;
grant select, insert, update, delete on "ReviewRequest" to tepup_app;
grant select on "ReviewRequest" to tepup_backup;
alter table "ReviewRequestReviewer" enable row level security;
revoke all on "ReviewRequestReviewer" from anon, authenticated;
grant select, insert, update, delete on "ReviewRequestReviewer" to tepup_app;
grant select on "ReviewRequestReviewer" to tepup_backup;
alter table "ReviewOpinion" enable row level security;
revoke all on "ReviewOpinion" from anon, authenticated;
grant select, insert, update, delete on "ReviewOpinion" to tepup_app;
grant select on "ReviewOpinion" to tepup_backup;
alter table "LessonFlag" enable row level security;
revoke all on "LessonFlag" from anon, authenticated;
grant select, insert, update, delete on "LessonFlag" to tepup_app;
grant select on "LessonFlag" to tepup_backup;

commit;

-- Check: every new table has RLS on, no anon access, the app can insert, and the
-- append-only tables refuse deletes.
select relname, relrowsecurity as rls_on,
       has_table_privilege('anon', oid, 'SELECT') as anon_select,
       has_table_privilege('tepup_app', oid, 'INSERT') as app_insert,
       has_table_privilege('tepup_app', oid, 'DELETE') as app_delete,
       has_table_privilege('tepup_backup', oid, 'SELECT') as backup_select
  from pg_class
 where relname in ('ContentRevision', 'RevisionPatrol', 'CourseMember', 'CourseBlock', 'ReviewerProfile', 'AuditLog', 'Notification', 'DiscussionThread', 'DiscussionComment', 'ReviewRequest', 'ReviewRequestReviewer', 'ReviewOpinion', 'LessonFlag')
 order by relname;
