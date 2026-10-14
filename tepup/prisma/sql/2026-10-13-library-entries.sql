-- Reference library: LibraryEntry, LibraryLink, LibraryUsage, two new SuggestionTarget
-- values and Suggestion."suggestedType" (docs/design-reference-library.md).
-- Apply with psql as `postgres`, staging first, then production. Idempotent.
-- Additive only: existing tables get one new nullable column, nothing else changes.

-- New enum values must be committed before they are used, so they sit outside the
-- transaction (ALTER TYPE ... ADD VALUE is allowed in a transaction on PG 12+, but
-- the value cannot be used in that same transaction; keeping it separate is simpler).
alter type "SuggestionTarget" add value if not exists 'LIBRARY_ENTRY';
alter type "SuggestionTarget" add value if not exists 'NEW_ENTRY';

begin;

do $$ begin
  create type "LibraryEntryType" as enum ('CONCEPT', 'SOURCE', 'ACRONYM', 'TOOL');
exception when duplicate_object then null; end $$;

do $$ begin
  create type "LibraryLinkKind" as enum ('RELATED', 'CITES', 'EXPANDS_TO', 'MENTIONS');
exception when duplicate_object then null; end $$;

do $$ begin
  create type "LibraryUsageTarget" as enum ('LESSON', 'CHAPTER');
exception when duplicate_object then null; end $$;

create table if not exists "LibraryEntry" (
  "id"        text not null,
  "slug"      text not null,
  "type"      "LibraryEntryType" not null,
  "title"     text not null,
  "summary"   text not null,
  "body"      jsonb,
  "meta"      jsonb not null default '{}',
  "isActive"  boolean not null default true,
  "createdAt" timestamp(3) not null default current_timestamp,
  "updatedAt" timestamp(3) not null,
  constraint "LibraryEntry_pkey" primary key ("id")
);
create unique index if not exists "LibraryEntry_slug_key" on "LibraryEntry"("slug");
-- Duplicate-source guard (lib/library/source-key.ts). Added after the first local run, hence "if not exists".
alter table "LibraryEntry" add column if not exists "sourceKey" text;
create unique index if not exists "LibraryEntry_sourceKey_key" on "LibraryEntry"("sourceKey");
create index if not exists "LibraryEntry_type_idx" on "LibraryEntry"("type");

create table if not exists "LibraryLink" (
  "fromId" text not null,
  "toId"   text not null,
  "kind"   "LibraryLinkKind" not null,
  "order"  integer not null default 0,
  constraint "LibraryLink_pkey" primary key ("fromId", "toId", "kind")
);
create index if not exists "LibraryLink_toId_kind_idx" on "LibraryLink"("toId", "kind");

do $$ begin
  alter table "LibraryLink" add constraint "LibraryLink_fromId_fkey"
    foreign key ("fromId") references "LibraryEntry"("id") on delete cascade on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "LibraryLink" add constraint "LibraryLink_toId_fkey"
    foreign key ("toId") references "LibraryEntry"("id") on delete cascade on update cascade;
exception when duplicate_object then null; end $$;

create table if not exists "LibraryUsage" (
  "entryId"    text not null,
  "targetType" "LibraryUsageTarget" not null,
  "targetId"   text not null,
  "count"      integer not null,
  constraint "LibraryUsage_pkey" primary key ("entryId", "targetType", "targetId")
);
create index if not exists "LibraryUsage_targetType_targetId_idx" on "LibraryUsage"("targetType", "targetId");

do $$ begin
  alter table "LibraryUsage" add constraint "LibraryUsage_entryId_fkey"
    foreign key ("entryId") references "LibraryEntry"("id") on delete cascade on update cascade;
exception when duplicate_object then null; end $$;

-- What kind of entry a learner proposes (NEW_ENTRY suggestions).
alter table "Suggestion" add column if not exists "suggestedType" "LibraryEntryType";

-- Same lockdown as every other table: RLS on, no policies, no API-role grants.
alter table "LibraryEntry" enable row level security;
alter table "LibraryLink"  enable row level security;
alter table "LibraryUsage" enable row level security;
revoke all on "LibraryEntry", "LibraryLink", "LibraryUsage" from anon, authenticated;

-- App and backup roles (default privileges cover this, but be explicit).
grant select, insert, update, delete on "LibraryEntry", "LibraryLink", "LibraryUsage" to tepup_app;
grant select on "LibraryEntry", "LibraryLink", "LibraryUsage" to tepup_backup;

commit;

select relname, relrowsecurity as rls_on,
       has_table_privilege('anon', oid, 'SELECT') as anon_select,
       has_table_privilege('tepup_app', oid, 'INSERT') as app_insert,
       has_table_privilege('tepup_backup', oid, 'SELECT') as backup_select
from pg_class where relname in ('LibraryEntry', 'LibraryLink', 'LibraryUsage');
