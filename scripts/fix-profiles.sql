-- Run this in the Supabase SQL editor (Dashboard → SQL Editor).
--
-- 1. Re-creates the auth trigger that auto-inserts a profiles row whenever a
--    new user signs up via Supabase Auth.
-- 2. Backfills a profiles row for any existing auth.users who never got one.

-- ── Trigger function ─────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, name, role, verified, verification_status, verification_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    false,
    'unverified',
    coalesce(new.raw_user_meta_data->>'role', 'student')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- ── Trigger ──────────────────────────────────────────────────────────────────

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Backfill existing users ───────────────────────────────────────────────────
-- Inserts a default profile for every auth user that has no profiles row yet.

insert into public.profiles (user_id, name, role, verified, verification_status, verification_type)
select
  u.id                                                          as user_id,
  coalesce(u.raw_user_meta_data->>'name',
           split_part(u.email, '@', 1))                        as name,
  coalesce(u.raw_user_meta_data->>'role', 'student')           as role,
  false                                                         as verified,
  'unverified'                                                  as verification_status,
  coalesce(u.raw_user_meta_data->>'role', 'student')           as verification_type
from auth.users u
where not exists (
  select 1 from public.profiles p where p.user_id = u.id
);
