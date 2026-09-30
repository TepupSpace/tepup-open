-- Course.createdById (schema.prisma): who created a course. A contributor may view
-- hidden lessons only in courses they created; reviewers and admins see all of them.
-- Apply with psql as `postgres`, staging first, then production. Idempotent.
-- Then backfill contributor-created courses: scripts/backfill-course-created-by.ts.
--
-- Not `prisma db push`: see 2026-09-28-suggestions.sql for why.

begin;

alter table "Course" add column if not exists "createdById" text;

create index if not exists "Course_createdById_idx" on "Course"("createdById");

do $$ begin
  alter table "Course" add constraint "Course_createdById_fkey"
    foreign key ("createdById") references "User"("id") on delete set null on update cascade;
exception when duplicate_object then null; end $$;

commit;

select column_name, data_type, is_nullable
from information_schema.columns
where table_name = 'Course' and column_name = 'createdById';
