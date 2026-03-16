-- Migration 027: Off-Season Events Enhancement
-- Adds event_type and zone columns to tournaments table + seeds 15 events

-- Add new columns
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS event_type TEXT CHECK (event_type IN ('tournament', 'showcase', 'camp', 'combine'));
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS zone TEXT;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_tournaments_event_type ON tournaments (event_type);
CREATE INDEX IF NOT EXISTS idx_tournaments_zone ON tournaments (zone);
CREATE INDEX IF NOT EXISTS idx_tournaments_is_public_start ON tournaments (is_public, start_date);

-- Backfill existing rows
UPDATE tournaments SET event_type = 'tournament' WHERE event_type IS NULL;

-- Seed 15 off-season events
DO $$
DECLARE
  v_organizer_id UUID;
  v_club_id UUID;
BEGIN
  -- Find a club organizer profile, or fall back to any profile
  SELECT id INTO v_organizer_id
  FROM profiles
  WHERE role = 'club'
  LIMIT 1;

  IF v_organizer_id IS NULL THEN
    SELECT id INTO v_organizer_id FROM profiles LIMIT 1;
  END IF;

  IF v_organizer_id IS NULL THEN
    RAISE NOTICE 'No profiles found — skipping event seed';
    RETURN;
  END IF;

  -- Use existing club_id from tournaments, or use the organizer profile id
  SELECT club_id INTO v_club_id FROM tournaments LIMIT 1;
  IF v_club_id IS NULL THEN
    v_club_id := v_organizer_id;
  END IF;

  -- 4 Tournaments, 4 Showcases, 3 Camps, 4 Combines
  INSERT INTO tournaments (name, description, start_date, end_date, location, teams_capacity, teams_registered, entry_fee_cents, registration_deadline, is_public, event_tier, status, organizer_id, event_type, zone, club_id, division, format, registration_fee_cents)
  VALUES
    ('Texas 7v7 Championship', 'Elite 7-on-7 tournament featuring top Texas talent. 32-team bracket with live streaming.', '2026-06-14', '2026-06-15', 'AT&T Stadium, Arlington, TX', 32, 18, 50000, '2026-06-07', true, 'elite', 'registration_open', v_organizer_id, 'tournament', 'south', v_club_id, '7v7', 'bracket', 50000),
    ('Peach State Classic', 'Georgia''s premier off-season football tournament. College scouts in attendance.', '2026-06-21', '2026-06-22', 'Mercedes-Benz Stadium, Atlanta, GA', 24, 12, 40000, '2026-06-14', true, 'elite', 'registration_open', v_organizer_id, 'tournament', 'southeast', v_club_id, '7v7', 'bracket', 40000),
    ('Midwest Gridiron Invitational', 'Top Midwest programs compete for regional bragging rights.', '2026-07-05', '2026-07-06', 'Lucas Oil Stadium, Indianapolis, IN', 16, 8, 35000, '2026-06-28', true, 'premier', 'registration_open', v_organizer_id, 'tournament', 'midwest', v_club_id, '7v7', 'pool_play', 35000),
    ('Pacific Coast Showdown', 'West Coast elite 7v7 action under the California sun.', '2026-07-12', '2026-07-13', 'SoFi Stadium, Inglewood, CA', 24, 20, 45000, '2026-07-05', true, 'elite', 'registration_open', v_organizer_id, 'tournament', 'west', v_club_id, '7v7', 'bracket', 45000),
    ('Garden State Showcase', 'Individual prospect showcase with position-specific drills and 1-on-1s.', '2026-06-07', '2026-06-07', 'MetLife Stadium, East Rutherford, NJ', 200, 85, 15000, '2026-05-31', true, 'premier', 'registration_open', v_organizer_id, 'showcase', 'northeast', v_club_id, '7v7', 'pool_play', 15000),
    ('Heartland Prospect Showcase', 'Central region showcase with 40+ college coaches evaluating.', '2026-06-28', '2026-06-28', 'Arrowhead Stadium, Kansas City, KS', 150, 60, 12500, '2026-06-21', true, 'premier', 'registration_open', v_organizer_id, 'showcase', 'midwest', v_club_id, '7v7', 'pool_play', 12500),
    ('Sunshine State Stars', 'Florida''s top uncommitted prospects showcase their skills.', '2026-07-19', '2026-07-19', 'Hard Rock Stadium, Miami Gardens, FL', 180, 110, 17500, '2026-07-12', true, 'elite', 'registration_open', v_organizer_id, 'showcase', 'southeast', v_club_id, '7v7', 'pool_play', 17500),
    ('Golden State Prospect Showcase', 'West Coast talent on display for Pac-12 and Mountain West scouts.', '2026-08-02', '2026-08-02', 'Levi''s Stadium, Santa Clara, CA', 160, 45, 15000, '2026-07-26', true, 'premier', 'registration_open', v_organizer_id, 'showcase', 'west', v_club_id, '7v7', 'pool_play', 15000),
    ('Lone Star QB & WR Camp', 'Intensive quarterback and wide receiver skills camp with NFL coaches.', '2026-06-10', '2026-06-12', 'The Star, Frisco, TX', 100, 55, 25000, '2026-06-03', true, 'elite', 'registration_open', v_organizer_id, 'camp', 'south', v_club_id, '7v7', 'pool_play', 25000),
    ('Great Lakes Big Man Camp', 'OL/DL focused camp with technique drills and college evaluations.', '2026-07-08', '2026-07-10', 'Ford Field, Detroit, MI', 80, 30, 20000, '2026-07-01', true, 'standard', 'registration_open', v_organizer_id, 'camp', 'midwest', v_club_id, '7v7', 'pool_play', 20000),
    ('Northeast Speed & Agility Camp', 'Speed development camp with Dashr-timed testing and film review.', '2026-07-22', '2026-07-24', 'Gillette Stadium, Foxborough, MA', 120, 70, 22500, '2026-07-15', true, 'premier', 'registration_open', v_organizer_id, 'camp', 'northeast', v_club_id, '7v7', 'pool_play', 22500),
    ('Motor City Combine', 'Full athletic testing combine with verified Dashr times and measurements.', '2026-06-05', '2026-06-05', 'Ford Field, Detroit, MI', 250, 140, 7500, '2026-05-29', true, 'standard', 'registration_open', v_organizer_id, 'combine', 'midwest', v_club_id, '7v7', 'pool_play', 7500),
    ('Texas Mega Combine', 'The largest combine in the South — 300+ athletes, full testing battery.', '2026-06-19', '2026-06-19', 'NRG Stadium, Houston, TX', 300, 200, 10000, '2026-06-12', true, 'elite', 'registration_open', v_organizer_id, 'combine', 'south', v_club_id, '7v7', 'pool_play', 10000),
    ('Music City Combine', 'Nashville combine with college coaches from SEC and ACC programs.', '2026-07-17', '2026-07-17', 'Nissan Stadium, Nashville, TN', 200, 90, 8500, '2026-07-10', true, 'premier', 'registration_open', v_organizer_id, 'combine', 'southeast', v_club_id, '7v7', 'pool_play', 8500),
    ('Rocky Mountain Combine', 'High-altitude testing for Mountain West and Big 12 prospects.', '2026-08-09', '2026-08-09', 'Empower Field, Denver, CO', 180, 55, 7500, '2026-08-02', true, 'standard', 'registration_open', v_organizer_id, 'combine', 'west', v_club_id, '7v7', 'pool_play', 7500);
END $$;
