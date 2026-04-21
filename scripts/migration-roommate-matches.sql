-- WaveRow: roommate_matches table
-- Run in Supabase SQL editor: https://supabase.com/dashboard/project/jwndsqttukfrivbgbvsa/sql/new

CREATE TABLE IF NOT EXISTS roommate_matches (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_id  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score         INTEGER     NOT NULL CHECK (score >= 0 AND score <= 100),
  summary       TEXT        NOT NULL,
  dealbreakers  TEXT[]      NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, candidate_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS roommate_matches_user_id_idx ON roommate_matches (user_id);

-- RLS
ALTER TABLE roommate_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own matches"
  ON roommate_matches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own matches"
  ON roommate_matches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own matches"
  ON roommate_matches FOR UPDATE
  USING (auth.uid() = user_id);
