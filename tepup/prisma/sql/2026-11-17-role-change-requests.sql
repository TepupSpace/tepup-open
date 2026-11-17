-- Role-change requests ("Yêu cầu thay đổi quyền"): a contributor asks the admins for another
-- access level from their settings page; admins decide on Quản trị › Người dùng. Approving
-- applies the role change. One PENDING request per user (partial unique index). Rows are
-- kept as history. Plus two NotificationKind values for the in-app inbox.
--
-- Apply with psql as `postgres` (owner), staging first, then production. Idempotent.
-- The code depends on all of it: apply to both databases BEFORE merging to main.
-- Not `prisma db push`: see 2026-09-28-suggestions.sql for why.

-- Enum additions sit outside the transaction: ALTER TYPE ... ADD VALUE is allowed inside one
-- on PG 12+, but the new value could not be used in the same transaction, and `do $$` blocks
-- that CREATE TYPE must not wrap ADD VALUE anyway. Each statement is idempotent on its own.
alter type "NotificationKind" add value if not exists 'ROLE_REQUEST_SUBMITTED';
alter type "NotificationKind" add value if not exists 'ROLE_REQUEST_DECIDED';
-- Also in this release: tell a course's creator when an admin activates their course.
alter type "NotificationKind" add value if not exists 'COURSE_ACTIVATED';

do $$ begin
  CREATE TYPE "RoleRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED', 'CANCELLED');
exception when duplicate_object then null; end $$;

begin;

CREATE TABLE IF NOT EXISTS "RoleChangeRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleAtRequest" "UserRole" NOT NULL,
    "requestedRole" "UserRole" NOT NULL,
    "message" TEXT NOT NULL,
    "status" "RoleRequestStatus" NOT NULL DEFAULT 'PENDING',
    "decidedById" TEXT,
    "decisionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "RoleChangeRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "RoleChangeRequest_status_createdAt_idx"
    ON "RoleChangeRequest"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "RoleChangeRequest_userId_createdAt_idx"
    ON "RoleChangeRequest"("userId", "createdAt");

-- One open request per user, race-proof (the API checks first, this enforces it).
-- Not in schema.prisma: Prisma cannot express partial unique indexes.
CREATE UNIQUE INDEX IF NOT EXISTS "RoleChangeRequest_one_pending_per_user"
    ON "RoleChangeRequest"("userId") WHERE "status" = 'PENDING';

do $$ begin
  ALTER TABLE "RoleChangeRequest"
    ADD CONSTRAINT "RoleChangeRequest_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
exception when duplicate_object then null; end $$;

do $$ begin
  ALTER TABLE "RoleChangeRequest"
    ADD CONSTRAINT "RoleChangeRequest_decidedById_fkey"
    FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
exception when duplicate_object then null; end $$;

alter table "RoleChangeRequest" enable row level security;
revoke all on "RoleChangeRequest" from anon, authenticated;
grant select, insert, update, delete on "RoleChangeRequest" to tepup_app;
grant select on "RoleChangeRequest" to tepup_backup;

commit;

-- Check: RLS on, no anon access, the app can write, the backup can read.
select relname, relrowsecurity as rls_on,
       has_table_privilege('anon', oid, 'SELECT') as anon_select,
       has_table_privilege('tepup_app', oid, 'INSERT') as app_insert,
       has_table_privilege('tepup_backup', oid, 'SELECT') as backup_select
  from pg_class
 where relname = 'RoleChangeRequest';
