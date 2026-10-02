-- Server-side drafts for the admin lesson and chapter editors (model ContentDraft in
-- schema.prisma). "Lưu nháp"/autosave writes here; "Xuất bản" copies the draft into
-- LessonContent / ChapterContent and deletes the row. Learners never read this table.
-- Apply with psql as `postgres`, staging first, then production. Idempotent.
-- The code depends on this table: apply it to both databases BEFORE merging to main.
--
-- Not `prisma db push`: see 2026-09-28-suggestions.sql for why.

begin;

do $$ begin
  create type "ContentDraftTarget" as enum ('LESSON', 'CHAPTER');
exception when duplicate_object then null; end $$;

create table if not exists "ContentDraft" (
  "id"            text not null,
  "targetType"    "ContentDraftTarget" not null,
  "targetId"      text not null,
  "title"         text not null default '',
  "blocks"        jsonb not null,
  "meta"          jsonb,
  "baseUpdatedAt" timestamp(3),
  "updatedById"   text,
  "createdAt"     timestamp(3) not null default current_timestamp,
  "updatedAt"     timestamp(3) not null,
  constraint "ContentDraft_pkey" primary key ("id")
);

create unique index if not exists "ContentDraft_targetType_targetId_key" on "ContentDraft"("targetType", "targetId");

do $$ begin
  alter table "ContentDraft" add constraint "ContentDraft_updatedById_fkey"
    foreign key ("updatedById") references "User"("id") on delete set null on update cascade;
exception when duplicate_object then null; end $$;

-- Data API lockdown: RLS on, no policies, no API-role grants (same as every public table).
alter table "ContentDraft" enable row level security;
revoke all on "ContentDraft" from anon, authenticated;

-- App and backup roles (default privileges cover this, but be explicit).
grant select, insert, update, delete on "ContentDraft" to tepup_app;
grant select on "ContentDraft" to tepup_backup;

commit;

select relname, relrowsecurity as rls_on,
       has_table_privilege('anon', oid, 'SELECT') as anon_select,
       has_table_privilege('tepup_app', oid, 'INSERT') as app_insert,
       has_table_privilege('tepup_backup', oid, 'SELECT') as backup_select
from pg_class where relname = 'ContentDraft';
