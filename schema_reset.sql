-- Step 1: Drop everything (run this first)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();
drop table if exists roommate_group_members cascade;
drop table if exists roommate_groups cascade;
drop table if exists roommate_profiles cascade;
drop table if exists reviews cascade;
drop table if exists messages cascade;
drop table if exists saved_listings cascade;
drop table if exists sublet_details cascade;
drop table if exists listings cascade;
drop table if exists profiles cascade;

-- Step 2: Recreate everything clean
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  name text not null default '',
  avatar text,
  bio text,
  grad_year int,
  student_id text,
  phone text,
  business_name text,
  license_number text,
  role text not null default 'STUDENT',
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table listings (
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

create table sublet_details (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade not null unique,
  original_lease_end date not null,
  move_out_date date not null,
  reason text,
  semester text
);

create table saved_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  listing_id uuid references listings(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique(user_id, listing_id)
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references auth.users(id) on delete cascade not null,
  receiver_id uuid references auth.users(id) on delete cascade not null,
  listing_id uuid references listings(id) on delete set null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete cascade not null,
  landlord_id uuid references auth.users(id) on delete cascade not null,
  listing_id uuid references listings(id) on delete set null,
  rating int not null check (rating >= 1 and rating <= 5),
  body text not null,
  created_at timestamptz not null default now()
);

create table roommate_profiles (
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

create table roommate_groups (
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

create table roommate_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references roommate_groups(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  unique(group_id, user_id)
);

-- Enable RLS
alter table profiles enable row level security;
alter table listings enable row level security;
alter table sublet_details enable row level security;
alter table saved_listings enable row level security;
alter table messages enable row level security;
alter table reviews enable row level security;
alter table roommate_profiles enable row level security;
alter table roommate_groups enable row level security;
alter table roommate_group_members enable row level security;

-- Profiles policies
create policy "Profiles viewable by everyone" on profiles for select using (true);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = user_id);

-- Listings policies
create policy "Listings viewable by everyone" on listings for select using (true);
create policy "Users can insert own listings" on listings for insert with check (auth.uid() = user_id);
create policy "Users can update own listings" on listings for update using (auth.uid() = user_id);
create policy "Users can delete own listings" on listings for delete using (auth.uid() = user_id);

-- Sublet details policies
create policy "Sublet details viewable by everyone" on sublet_details for select using (true);
create policy "Listing owners manage sublet details" on sublet_details for all using (
  auth.uid() = (select user_id from listings where id = listing_id)
);

-- Saved listings policies
create policy "Users view own saved" on saved_listings for select using (auth.uid() = user_id);
create policy "Users can save" on saved_listings for insert with check (auth.uid() = user_id);
create policy "Users can unsave" on saved_listings for delete using (auth.uid() = user_id);

-- Messages policies
create policy "Users view own messages" on messages for select using (
  auth.uid() = sender_id or auth.uid() = receiver_id
);
create policy "Users can send messages" on messages for insert with check (auth.uid() = sender_id);

-- Reviews policies
create policy "Reviews viewable by everyone" on reviews for select using (true);
create policy "Users can write reviews" on reviews for insert with check (auth.uid() = author_id);

-- Roommate policies
create policy "Roommate profiles viewable by everyone" on roommate_profiles for select using (true);
create policy "Users manage own roommate profile" on roommate_profiles for all using (auth.uid() = user_id);
create policy "Roommate groups viewable by everyone" on roommate_groups for select using (true);
create policy "Users can create groups" on roommate_groups for insert with check (auth.uid() = created_by);
create policy "Group creators can update" on roommate_groups for update using (auth.uid() = created_by);
create policy "Group members viewable by everyone" on roommate_group_members for select using (true);
create policy "Users can join groups" on roommate_group_members for insert with check (auth.uid() = user_id);

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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
