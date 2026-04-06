-- Migration 002: Conversations table, message conversation_id FK,
--   RLS policies, conversation metadata trigger, and supporting indexes.
-- Consolidates schema_conversations.sql + scripts/update_conversation_trigger.sql.
-- Safe to re-run (all statements use IF NOT EXISTS / OR REPLACE / DROP IF EXISTS).

-- ── Conversations table ──────────────────────────────────────────────────────
create table if not exists conversations (
  id               uuid primary key default gen_random_uuid(),
  listing_id       uuid references listings(id) on delete set null,
  participant_one  uuid references auth.users(id) on delete cascade not null,
  participant_two  uuid references auth.users(id) on delete cascade not null,
  last_message     text,
  last_message_at  timestamptz,
  created_at       timestamptz not null default now()
);

alter table conversations enable row level security;

drop policy if exists "Participants can view their conversations" on conversations;
create policy "Participants can view their conversations" on conversations
  for select using (auth.uid() = participant_one or auth.uid() = participant_two);

drop policy if exists "Authenticated users can create conversations" on conversations;
create policy "Authenticated users can create conversations" on conversations
  for insert with check (auth.uid() = participant_one);

drop policy if exists "Participants can delete their conversations" on conversations;
create policy "Participants can delete their conversations" on conversations
  for delete using (auth.uid() = participant_one or auth.uid() = participant_two);

-- ── messages.conversation_id ─────────────────────────────────────────────────
alter table messages add column if not exists conversation_id uuid references conversations(id) on delete cascade;

-- ── Messages RLS ─────────────────────────────────────────────────────────────
drop policy if exists "Users can view messages in their conversations" on messages;
create policy "Users can view messages in their conversations" on messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Users can send messages" on messages;
create policy "Users can send messages" on messages
  for insert with check (auth.uid() = sender_id);

drop policy if exists "Users can delete their messages" on messages;
create policy "Users can delete their messages" on messages
  for delete using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- ── Conversation metadata trigger ────────────────────────────────────────────
create or replace function update_conversation_metadata()
returns trigger language plpgsql as $$
begin
  update conversations
  set
    last_message    = new.body,
    last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists on_new_message on messages;
create trigger on_new_message
  after insert on messages
  for each row
  execute function update_conversation_metadata();

-- ── Performance indexes ──────────────────────────────────────────────────────
create index if not exists idx_messages_conversation_id on messages(conversation_id);
create index if not exists idx_conversations_participant_one on conversations(participant_one);
create index if not exists idx_conversations_participant_two on conversations(participant_two);
create index if not exists idx_conversations_last_message_at on conversations(last_message_at desc);

-- ── Roommate & Reviews RLS (from schema_conversations.sql) ───────────────────
drop policy if exists "Roommate profiles are viewable by everyone" on roommate_profiles;
create policy "Roommate profiles are viewable by everyone" on roommate_profiles for select using (true);

drop policy if exists "Users can manage own roommate profile" on roommate_profiles;
create policy "Users can manage own roommate profile" on roommate_profiles for all using (auth.uid() = user_id);

drop policy if exists "Roommate groups are viewable by everyone" on roommate_groups;
create policy "Roommate groups are viewable by everyone" on roommate_groups for select using (true);

drop policy if exists "Users can create roommate groups" on roommate_groups;
create policy "Users can create roommate groups" on roommate_groups for insert with check (auth.uid() = created_by);

drop policy if exists "Group members viewable by everyone" on roommate_group_members;
create policy "Group members viewable by everyone" on roommate_group_members for select using (true);

drop policy if exists "Users can join groups" on roommate_group_members;
create policy "Users can join groups" on roommate_group_members for insert with check (auth.uid() = user_id);

drop policy if exists "Reviews are viewable by everyone" on reviews;
create policy "Reviews are viewable by everyone" on reviews for select using (true);

drop policy if exists "Users can write reviews" on reviews;
create policy "Users can write reviews" on reviews for insert with check (auth.uid() = author_id);

-- ── Profile extra columns ────────────────────────────────────────────────────
alter table profiles add column if not exists verification_status text not null default 'unverified';
alter table profiles add column if not exists verification_type text;
