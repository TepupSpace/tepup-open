-- Anonymous suggestions (model Suggestion in schema.prisma).
-- Apply with psql as `postgres`, staging first, then production. Idempotent.
--
-- Why not `prisma db push`: the live databases still have Character.avatarUrl,
-- Character.imageUrl and Course.imageUrl, which schema.prisma no longer declares, so
-- `db push` would try to DROP them (they hold image URLs). Apply schema changes with
-- reviewed SQL like this until that drift is resolved deliberately.

begin;

do $$ begin
  create type "SuggestionTarget" as enum ('LESSON', 'CHAPTER');
exception when duplicate_object then null; end $$;

do $$ begin
  create type "SuggestionStatus" as enum ('PENDING', 'ACCEPTED', 'APPLIED', 'REJECTED');
exception when duplicate_object then null; end $$;

create table if not exists "Suggestion" (
  "id"         text not null,
  "targetType" "SuggestionTarget" not null,
  "targetId"   text not null,
  "quote"      text,
  "proposal"   text not null,
  "reason"     text,
  "status"     "SuggestionStatus" not null default 'PENDING',
  "reviewerId" text,
  "reviewNote" text,
  "createdAt"  timestamp(3) not null default current_timestamp,
  "resolvedAt" timestamp(3),
  constraint "Suggestion_pkey" primary key ("id")
);

create index if not exists "Suggestion_status_createdAt_idx" on "Suggestion"("status", "createdAt");
create index if not exists "Suggestion_targetType_targetId_idx" on "Suggestion"("targetType", "targetId");

do $$ begin
  alter table "Suggestion" add constraint "Suggestion_reviewerId_fkey"
    foreign key ("reviewerId") references "User"("id") on delete set null on update cascade;
exception when duplicate_object then null; end $$;

-- Data API lockdown: RLS on, no policies, no API-role grants (same as every public table).
alter table "Suggestion" enable row level security;
revoke all on "Suggestion" from anon, authenticated;

-- App and backup roles (default privileges cover this, but be explicit).
grant select, insert, update, delete on "Suggestion" to tepup_app;
grant select on "Suggestion" to tepup_backup;

commit;

select relname, relrowsecurity as rls_on,
       has_table_privilege('anon', oid, 'SELECT') as anon_select,
       has_table_privilege('tepup_app', oid, 'INSERT') as app_insert,
       has_table_privilege('tepup_backup', oid, 'SELECT') as backup_select
from pg_class where relname = 'Suggestion';
