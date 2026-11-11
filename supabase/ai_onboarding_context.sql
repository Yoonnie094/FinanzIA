-- Applied to the FinanzIA Supabase project as add_ai_onboarding_context.
-- Keep the hosted schema and this source SQL aligned.

alter table public.businesses
  add column if not exists ai_context jsonb not null default '{}'::jsonb;

revoke all on table public.profiles from anon;
grant select, insert, update on table public.profiles to authenticated;

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);
