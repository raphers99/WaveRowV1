-- Add match_score and ai_summary to roommate_profiles
ALTER TABLE roommate_profiles
ADD COLUMN IF NOT EXISTS match_score int,
ADD COLUMN IF NOT EXISTS ai_summary text;

-- Drop and recreate roommate_matches with the new schema structure
DROP TABLE IF EXISTS roommate_matches;

CREATE TABLE roommate_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  candidate_id uuid references auth.users(id) on delete cascade not null,
  score int not null,
  summary text not null,
  dealbreakers text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique(user_id, candidate_id)
);

ALTER TABLE roommate_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own matches" ON roommate_matches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own matches" ON roommate_matches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own matches" ON roommate_matches FOR UPDATE USING (auth.uid() = user_id);
