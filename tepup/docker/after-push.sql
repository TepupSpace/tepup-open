-- Applied after `prisma db push` on the local Docker database (docker/entrypoint.mjs).
-- Same lockdown as production: RLS on every public table, no policies, no API-role
-- grants; the app and backup roles get explicit grants. Idempotent.
do $$
declare r record;
begin
  for r in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', r.tablename);
    execute format('revoke all on public.%I from anon, authenticated', r.tablename);
    execute format('grant select, insert, update, delete on public.%I to tepup_app', r.tablename);
    execute format('grant select on public.%I to tepup_backup', r.tablename);
  end loop;
end $$;

grant usage, select, update on all sequences in schema public to tepup_app;
