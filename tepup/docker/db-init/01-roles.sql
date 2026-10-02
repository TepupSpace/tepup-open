-- Runs once, when the local Docker database is first created (compose.yaml).
-- Mirrors the production roles: the website connects as tepup_app (read/write rows,
-- bypasses RLS, no DDL); tepup_backup is read-only; anon/authenticated exist so the
-- prisma/sql/*.sql files (which revoke from them, as on Supabase) apply unchanged.

create role tepup_app login bypassrls nocreatedb nocreaterole password 'tepup_app_local';
alter role tepup_app set statement_timeout = '30s';
create role tepup_backup login bypassrls password 'tepup_backup_local';
create role anon nologin;
create role authenticated nologin;

grant usage on schema public to tepup_app, tepup_backup;
alter default privileges for role postgres in schema public
  grant select, insert, update, delete on tables to tepup_app;
alter default privileges for role postgres in schema public
  grant usage, select, update on sequences to tepup_app;
alter default privileges for role postgres in schema public
  grant select on tables to tepup_backup;
