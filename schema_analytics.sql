-- Run this in Supabase SQL editor

create table if not exists analytics_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  event_name  text not null,
  metadata    jsonb default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- Index for querying by user or event type
create index if not exists analytics_events_user_id_idx   on analytics_events(user_id);
create index if not exists analytics_events_event_name_idx on analytics_events(event_name);
create index if not exists analytics_events_created_at_idx on analytics_events(created_at desc);

-- Allow authenticated users to insert their own events only
alter table analytics_events enable row level security;

create policy "users insert own events"
  on analytics_events for insert
  to authenticated
  with check (user_id = auth.uid() or user_id is null);

-- Allow service role full access (for server-side queries / dashboards)
create policy "service role full access"
  on analytics_events for all
  to service_role
  using (true);
