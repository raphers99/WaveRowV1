-- Run this in Supabase SQL Editor to add conversations table

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete set null,
  participant_one uuid references auth.users(id) on delete cascade not null,
  participant_two uuid references auth.users(id) on delete cascade not null,
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz not null default now()
);

alter table conversations enable row level security;

create policy "Participants can view their conversations" on conversations
  for select using (auth.uid() = participant_one or auth.uid() = participant_two);

create policy "Authenticated users can create conversations" on conversations
  for insert with check (auth.uid() = participant_one);

-- Update messages table to add conversation_id (if not already present)
alter table messages add column if not exists conversation_id uuid references conversations(id) on delete cascade;

-- RLS for messages: allow participants
drop policy if exists "Users can view messages in their conversations" on messages;
create policy "Users can view messages in their conversations" on messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Users can send messages" on messages;
create policy "Users can send messages" on messages
  for insert with check (auth.uid() = sender_id);

-- Roommate profiles RLS
create policy if not exists "Roommate profiles are viewable by everyone" on roommate_profiles for select using (true);
create policy if not exists "Users can manage own roommate profile" on roommate_profiles for all using (auth.uid() = user_id);

-- Roommate groups RLS
create policy if not exists "Roommate groups are viewable by everyone" on roommate_groups for select using (true);
create policy if not exists "Users can create roommate groups" on roommate_groups for insert with check (auth.uid() = created_by);

-- Roommate group members RLS
create policy if not exists "Group members viewable by everyone" on roommate_group_members for select using (true);
create policy if not exists "Users can join groups" on roommate_group_members for insert with check (auth.uid() = user_id);

-- Reviews RLS
create policy if not exists "Reviews are viewable by everyone" on reviews for select using (true);
create policy if not exists "Users can write reviews" on reviews for insert with check (auth.uid() = author_id);

-- Add verification_status and verification_type columns to profiles if missing
alter table profiles add column if not exists verification_status text not null default 'unverified';
alter table profiles add column if not exists verification_type text;
