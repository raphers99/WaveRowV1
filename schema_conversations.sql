-- Run this in Supabase SQL Editor

-- Conversations table
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

drop policy if exists "Participants can view their conversations" on conversations;
create policy "Participants can view their conversations" on conversations
  for select using (auth.uid() = participant_one or auth.uid() = participant_two);

drop policy if exists "Authenticated users can create conversations" on conversations;
create policy "Authenticated users can create conversations" on conversations
  for insert with check (auth.uid() = participant_one);

-- Add conversation_id to messages
alter table messages add column if not exists conversation_id uuid references conversations(id) on delete cascade;

-- Messages RLS
drop policy if exists "Users can view messages in their conversations" on messages;
create policy "Users can view messages in their conversations" on messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Users can send messages" on messages;
create policy "Users can send messages" on messages
  for insert with check (auth.uid() = sender_id);

-- Roommate profiles RLS
drop policy if exists "Roommate profiles are viewable by everyone" on roommate_profiles;
create policy "Roommate profiles are viewable by everyone" on roommate_profiles for select using (true);

drop policy if exists "Users can manage own roommate profile" on roommate_profiles;
create policy "Users can manage own roommate profile" on roommate_profiles for all using (auth.uid() = user_id);

-- Roommate groups RLS
drop policy if exists "Roommate groups are viewable by everyone" on roommate_groups;
create policy "Roommate groups are viewable by everyone" on roommate_groups for select using (true);

drop policy if exists "Users can create roommate groups" on roommate_groups;
create policy "Users can create roommate groups" on roommate_groups for insert with check (auth.uid() = created_by);

-- Roommate group members RLS
drop policy if exists "Group members viewable by everyone" on roommate_group_members;
create policy "Group members viewable by everyone" on roommate_group_members for select using (true);

drop policy if exists "Users can join groups" on roommate_group_members;
create policy "Users can join groups" on roommate_group_members for insert with check (auth.uid() = user_id);

-- Reviews RLS
drop policy if exists "Reviews are viewable by everyone" on reviews;
create policy "Reviews are viewable by everyone" on reviews for select using (true);

drop policy if exists "Users can write reviews" on reviews;
create policy "Users can write reviews" on reviews for insert with check (auth.uid() = author_id);

-- Add columns to profiles if missing
alter table profiles add column if not exists verification_status text not null default 'unverified';
alter table profiles add column if not exists verification_type text;
