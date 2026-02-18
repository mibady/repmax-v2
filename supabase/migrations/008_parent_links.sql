-- Migration 008: Parent-Athlete Links
-- Links parent profiles to athlete profiles for the parent dashboard

CREATE TABLE IF NOT EXISTS parent_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  athlete_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'parent',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_profile_id, athlete_profile_id)
);

-- RLS policies
ALTER TABLE parent_links ENABLE ROW LEVEL SECURITY;

-- Parents can read their own links
CREATE POLICY "parents_read_own_links" ON parent_links
  FOR SELECT USING (auth.uid()::text = parent_profile_id::text);

-- Parents can create links for themselves
CREATE POLICY "parents_create_own_links" ON parent_links
  FOR INSERT WITH CHECK (auth.uid()::text = parent_profile_id::text);

-- Service role bypasses RLS for seeding
