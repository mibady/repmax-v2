-- Migration 009: Club Dashboard Tables
-- Three tables for tournaments, athlete verifications, and tournament payments

-- ============================================
-- TOURNAMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  location TEXT,
  teams_registered INT DEFAULT 0,
  teams_capacity INT DEFAULT 32,
  total_collected NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organizers_read_own_tournaments" ON tournaments
  FOR SELECT USING (auth.uid() = organizer_id);

CREATE POLICY "organizers_manage_own_tournaments" ON tournaments
  FOR ALL USING (auth.uid() = organizer_id);

-- ============================================
-- ATHLETE VERIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS athlete_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  club_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('identity', 'academic', 'athletic')),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE athlete_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clubs_read_own_verifications" ON athlete_verifications
  FOR SELECT USING (auth.uid() = club_id);

CREATE POLICY "clubs_manage_own_verifications" ON athlete_verifications
  FOR ALL USING (auth.uid() = club_id);

-- ============================================
-- TOURNAMENT PAYMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS tournament_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  description TEXT,
  amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tournament_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organizers_read_own_payments" ON tournament_payments
  FOR SELECT USING (auth.uid() = organizer_id);

CREATE POLICY "organizers_manage_own_payments" ON tournament_payments
  FOR ALL USING (auth.uid() = organizer_id);
