-- ============================================
-- Coach Athlete Invites
-- ============================================
-- Tracks athletes created/invited by coaches.
-- When a coach creates an athlete who hasn't signed up,
-- an invite record is created so we know to let them
-- claim the account later.

CREATE TABLE IF NOT EXISTS coach_athlete_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    athlete_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    athlete_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'claimed', 'expired')),
    claimed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(team_id, athlete_email)
);

CREATE INDEX idx_coach_invites_email ON coach_athlete_invites(athlete_email);

-- RLS: service-role-only (all operations go through API with service client)
ALTER TABLE coach_athlete_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access coach_athlete_invites"
    ON coach_athlete_invites FOR ALL
    USING (auth.role() = 'service_role');

-- Coaches can view invites for their teams
CREATE POLICY "Coaches can view own invites"
    ON coach_athlete_invites FOR SELECT
    USING (coach_profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

-- Add 'roster_add' to notifications type constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
    CHECK (type IN ('profile_view', 'shortlist', 'deadline', 'parent_link', 'summary', 'message', 'offer', 'roster_add'));
