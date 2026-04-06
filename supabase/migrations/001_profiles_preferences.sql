-- Migration 001: Add preferences column to profiles
-- Backfills existing rows with an empty JSON object.

alter table profiles
  add column if not exists preferences jsonb not null default '{}'::jsonb;

-- Backfill any existing rows that may have a NULL if the default did not apply
update profiles set preferences = '{}'::jsonb where preferences is null;
