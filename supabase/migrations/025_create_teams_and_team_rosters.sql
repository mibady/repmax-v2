-- ============================================
-- Create teams and team_rosters tables
-- ============================================
-- These tables link coaches to their athletes via a team structure.
-- The coach dashboard API already queries these tables but they were
-- never created in any prior migration.

-- ============================================
-- teams
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    school_name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zone TEXT NOT NULL,
    coach_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- team_rosters
-- ============================================
CREATE TABLE IF NOT EXISTS team_rosters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    priority TEXT NOT NULL DEFAULT 'medium',
    notes TEXT,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(team_id, athlete_id)
);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_rosters ENABLE ROW LEVEL SECURITY;

-- Coaches can view their own team
CREATE POLICY "Coaches can view own team"
    ON teams FOR SELECT
    USING (coach_profile_id = auth.uid());

-- Coaches can create their own team
CREATE POLICY "Coaches can create own team"
    ON teams FOR INSERT
    WITH CHECK (coach_profile_id = auth.uid());

-- Coaches can update their own team
CREATE POLICY "Coaches can update own team"
    ON teams FOR UPDATE
    USING (coach_profile_id = auth.uid());

-- Coaches can delete their own team
CREATE POLICY "Coaches can delete own team"
    ON teams FOR DELETE
    USING (coach_profile_id = auth.uid());

-- Coaches can view their team's roster
CREATE POLICY "Coaches can view own roster"
    ON team_rosters FOR SELECT
    USING (
        team_id IN (
            SELECT id FROM teams WHERE coach_profile_id = auth.uid()
        )
    );

-- Coaches can add to their team's roster
CREATE POLICY "Coaches can add to own roster"
    ON team_rosters FOR INSERT
    WITH CHECK (
        team_id IN (
            SELECT id FROM teams WHERE coach_profile_id = auth.uid()
        )
    );

-- Coaches can update their team's roster
CREATE POLICY "Coaches can update own roster"
    ON team_rosters FOR UPDATE
    USING (
        team_id IN (
            SELECT id FROM teams WHERE coach_profile_id = auth.uid()
        )
    );

-- Coaches can remove from their team's roster
CREATE POLICY "Coaches can delete from own roster"
    ON team_rosters FOR DELETE
    USING (
        team_id IN (
            SELECT id FROM teams WHERE coach_profile_id = auth.uid()
        )
    );

-- Service role bypass for seeding
CREATE POLICY "Service role full access teams"
    ON teams FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access team_rosters"
    ON team_rosters FOR ALL
    USING (auth.role() = 'service_role');
