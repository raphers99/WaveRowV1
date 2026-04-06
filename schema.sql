-- WaveRow — Run this in Supabase SQL Editor

-- Profiles (linked to auth.users)
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  name text not null,
  avatar text,
  bio text,
  grad_year int,
  student_id text,
  phone text,
  business_name text,
  license_number text,
  role text not null default 'STUDENT',
  verified boolean not null default false,
  preferences jsonb not null default '{}'::jsonb,
  verification_status text not null default 'unverified',
  verification_type text,
  created_at timestamptz not null default now()
);

-- Listings
create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text,
  type text not null default 'APARTMENT',
  address text not null,
  neighborhood text,
  lat float,
  lng float,
  rent int not null,
  deposit int,
  beds int not null default 1,
  baths float not null default 1,
  sqft int,
  furnished boolean not null default false,
  pets boolean not null default false,
  utilities boolean not null default false,
  photos text[] not null default '{}',
  amenities text[] not null default '{}',
  proximity_tags text[] not null default '{}',
  description text,
  status text not null default 'ACTIVE',
  is_sublease boolean not null default false,
  available_from date,
  available_to date,
  distance_to_campus text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Sublet details
create table if not exists sublet_details (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade not null unique,
  original_lease_end date not null,
  move_out_date date not null,
  reason text,
  semester text
);

-- Saved listings
create table if not exists saved_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  listing_id uuid references listings(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique(user_id, listing_id)
);

-- Messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references auth.users(id) on delete cascade not null,
  receiver_id uuid references auth.users(id) on delete cascade not null,
  listing_id uuid references listings(id) on delete set null,
  conversation_id uuid references conversations(id) on delete cascade,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

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

-- Reviews
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete cascade not null,
  landlord_id uuid references auth.users(id) on delete cascade not null,
  listing_id uuid references listings(id) on delete set null,
  rating int not null check (rating >= 1 and rating <= 5),
  body text not null,
  created_at timestamptz not null default now()
);

-- Roommate profiles
create table if not exists roommate_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  budget_min int not null,
  budget_max int not null,
  move_in_date date not null,
  lifestyle text[] not null default '{}',
  cleanliness int not null check (cleanliness >= 1 and cleanliness <= 5),
  bio text,
  neighborhood text,
  year text,
  major text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- Roommate groups
create table if not exists roommate_groups (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete cascade not null,
  total_size int not null,
  budget_min int not null,
  budget_max int not null,
  lifestyle text[] not null default '{}',
  description text,
  neighborhood text,
  move_in_date date not null,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- Roommate group members
create table if not exists roommate_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references roommate_groups(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  unique(group_id, user_id)
);

-- Swipe actions (Tinder-style discovery)
create table if not exists swipe_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  listing_id uuid references listings(id) on delete cascade not null,
  action text not null check (action in ('save', 'skip', 'super_save')),
  created_at timestamptz not null default now(),
  unique(user_id, listing_id)
);

-- AI roommate match cache (24hr TTL)
create table if not exists roommate_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  candidate_id uuid references auth.users(id) on delete cascade not null,
  score int not null,
  headline text not null,
  positives text[] not null default '{}',
  watchouts text[] not null default '{}',
  icebreaker text not null,
  created_at timestamptz not null default now(),
  unique(user_id, candidate_id)
);

-- Push notification tokens
create table if not exists push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  token text not null,
  platform text not null default 'ios',
  created_at timestamptz not null default now(),
  unique(user_id, token)
);

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table listings enable row level security;
alter table sublet_details enable row level security;
alter table saved_listings enable row level security;
alter table messages enable row level security;
alter table conversations enable row level security;
alter table reviews enable row level security;
alter table roommate_profiles enable row level security;
alter table roommate_groups enable row level security;
alter table roommate_group_members enable row level security;
alter table swipe_actions enable row level security;
alter table roommate_matches enable row level security;
alter table push_tokens enable row level security;

-- RLS policies: profiles
create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = user_id);

-- RLS policies: listings
create policy "Listings are viewable by everyone" on listings for select using (true);
create policy "Users can insert own listings" on listings for insert with check (auth.uid() = user_id);
create policy "Users can update own listings" on listings for update using (auth.uid() = user_id);
create policy "Users can delete own listings" on listings for delete using (auth.uid() = user_id);

-- RLS policies: sublet_details
create policy "Sublet details viewable by everyone" on sublet_details for select using (true);
create policy "Listing owners can manage sublet details" on sublet_details for all using (
  auth.uid() = (select user_id from listings where id = listing_id)
);

-- RLS policies: saved_listings
create policy "Users can view own saved listings" on saved_listings for select using (auth.uid() = user_id);
create policy "Users can save listings" on saved_listings for insert with check (auth.uid() = user_id);
create policy "Users can unsave listings" on saved_listings for delete using (auth.uid() = user_id);

-- RLS policies: conversations
create policy "Participants can view their conversations" on conversations for select using (auth.uid() = participant_one or auth.uid() = participant_two);
create policy "Authenticated users can create conversations" on conversations for insert with check (auth.uid() = participant_one);

-- RLS policies: messages
create policy "Users can view their messages" on messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users can send messages" on messages for insert with check (auth.uid() = sender_id);

-- RLS policies: reviews
create policy "Reviews are viewable by everyone" on reviews for select using (true);
create policy "Users can write reviews" on reviews for insert with check (auth.uid() = author_id);

-- RLS policies: roommate tables
create policy "Roommate profiles are viewable by everyone" on roommate_profiles for select using (true);
create policy "Users can manage own roommate profile" on roommate_profiles for all using (auth.uid() = user_id);
create policy "Roommate groups are viewable by everyone" on roommate_groups for select using (true);
create policy "Users can create groups" on roommate_groups for insert with check (auth.uid() = created_by);
create policy "Group creators can update" on roommate_groups for update using (auth.uid() = created_by);
create policy "Group members are viewable by everyone" on roommate_group_members for select using (true);
create policy "Users can join groups" on roommate_group_members for insert with check (auth.uid() = user_id);

-- RLS policies: swipe_actions
create policy "Users can view own swipe actions" on swipe_actions for select using (auth.uid() = user_id);
create policy "Users can insert own swipe actions" on swipe_actions for insert with check (auth.uid() = user_id);
create policy "Users can update own swipe actions" on swipe_actions for update using (auth.uid() = user_id);

-- RLS policies: roommate_matches
create policy "Users can view own matches" on roommate_matches for select using (auth.uid() = user_id);
create policy "Users can insert own matches" on roommate_matches for insert with check (auth.uid() = user_id);
create policy "Users can update own matches" on roommate_matches for update using (auth.uid() = user_id);

-- RLS policies: push_tokens
create policy "Users can manage own push tokens" on push_tokens for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (user_id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'STUDENT')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Auto-update conversation metadata on new message
create or replace function update_conversation_metadata()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update conversations
  set
    last_message = new.body,
    last_message_at = new.created_at
  where
    id = new.conversation_id;
  return new;
end;
$$;

create or replace trigger on_new_message
  after insert on messages
  for each row execute function update_conversation_metadata();
