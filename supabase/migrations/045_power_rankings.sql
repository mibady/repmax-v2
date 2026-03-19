-- Migration 045: Power rankings (ELO system)

CREATE TABLE IF NOT EXISTS team_power_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES tournament_registrations(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  elo_rating NUMERIC(8,2) NOT NULL DEFAULT 1500.00,
  zone TEXT,
  total_games INT NOT NULL DEFAULT 0,
  wins INT NOT NULL DEFAULT 0,
  losses INT NOT NULL DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(registration_id)
);

CREATE TABLE IF NOT EXISTS elo_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES tournament_registrations(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES tournament_games(id) ON DELETE CASCADE,
  elo_before NUMERIC(8,2) NOT NULL,
  elo_after NUMERIC(8,2) NOT NULL,
  opponent_elo NUMERIC(8,2) NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('win', 'loss', 'tie')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS policies
ALTER TABLE team_power_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE elo_history ENABLE ROW LEVEL SECURITY;

-- Public read for rankings
CREATE POLICY "Anyone can view power rankings"
  ON team_power_rankings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view elo history"
  ON elo_history FOR SELECT
  USING (true);

-- Service role can insert/update
CREATE POLICY "Service role manages power rankings"
  ON team_power_rankings FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role manages elo history"
  ON elo_history FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_power_rankings_elo ON team_power_rankings(elo_rating DESC);
CREATE INDEX IF NOT EXISTS idx_power_rankings_zone ON team_power_rankings(zone);
CREATE INDEX IF NOT EXISTS idx_elo_history_registration ON elo_history(registration_id);
