-- Migration 027: Off-Season Events
-- Adds event_type and zone columns to tournaments table
-- Seeds 15 realistic off-season events across zones and event types

-- ============================================
-- ADD COLUMNS
-- ============================================

ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS event_type TEXT CHECK (event_type IN ('tournament', 'showcase', 'camp', 'combine'));
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS zone TEXT;

-- Index for filtering
CREATE INDEX IF NOT EXISTS idx_tournaments_event_type ON tournaments(event_type);
CREATE INDEX IF NOT EXISTS idx_tournaments_zone ON tournaments(zone);
CREATE INDEX IF NOT EXISTS idx_tournaments_is_public_start ON tournaments(is_public, start_date) WHERE is_public = true;

-- ============================================
-- SEED OFF-SEASON EVENTS
-- ============================================
-- Uses a known organizer_id from the seed data (Mike Torres / club organizer)
-- These are inserted as public events across all 6 zones and 4 event types

DO $$
DECLARE
  v_organizer_id UUID;
BEGIN
  -- Find any club organizer to own these events
  SELECT p.user_id INTO v_organizer_id
  FROM profiles p
  JOIN coaches c ON c.profile_id = p.id
  WHERE c.school_type = 'club'
  LIMIT 1;

  -- If no club organizer exists, use any profile
  IF v_organizer_id IS NULL THEN
    SELECT user_id INTO v_organizer_id FROM profiles LIMIT 1;
  END IF;

  -- Skip seeding if no users exist
  IF v_organizer_id IS NULL THEN
    RAISE NOTICE 'No users found, skipping off-season event seeding';
    RETURN;
  END IF;

  -- TOURNAMENTS (7v7)
  INSERT INTO tournaments (organizer_id, name, description, start_date, end_date, location, teams_capacity, entry_fee_cents, registration_deadline, is_public, event_tier, event_type, zone, status)
  VALUES
    (v_organizer_id, 'Texas 7v7 State Championship', 'The premier 7v7 tournament in Texas featuring the top 32 teams from across the state. College scouts from every Power 5 program in attendance.', '2026-06-20', '2026-06-22', 'AT&T Stadium, Arlington, TX', 32, 50000, '2026-06-10', true, 'elite', 'tournament', 'SOUTHWEST', 'upcoming'),
    (v_organizer_id, 'Southeast Showdown', 'Top 7v7 teams from across the Southeast compete for regional supremacy. Three days of elite competition with full film coverage.', '2026-05-15', '2026-05-17', 'Mercedes-Benz Stadium, Atlanta, GA', 24, 40000, '2026-05-05', true, 'elite', 'tournament', 'SOUTHEAST', 'upcoming'),
    (v_organizer_id, 'Midwest Gridiron Classic', 'Annual 7v7 tournament featuring the best talent from Ohio, Michigan, Illinois, and Indiana. Pool play into single elimination bracket.', '2026-07-10', '2026-07-12', 'Grand Park Sports Campus, Westfield, IN', 16, 35000, '2026-06-30', true, 'premier', 'tournament', 'MIDWEST', 'upcoming'),
    (v_organizer_id, 'West Coast 7v7 Invitational', 'California''s top 7v7 teams battle it out in this invite-only tournament. Full media coverage and live streaming.', '2026-06-05', '2026-06-07', 'StubHub Center, Carson, CA', 16, 45000, '2026-05-25', true, 'elite', 'tournament', 'WEST', 'upcoming');

  -- SHOWCASES
  INSERT INTO tournaments (organizer_id, name, description, start_date, end_date, location, teams_capacity, entry_fee_cents, registration_deadline, is_public, event_tier, event_type, zone, status)
  VALUES
    (v_organizer_id, 'Northeast College Showcase', 'Individual prospect showcase with position-specific drills, 1-on-1s, and full combine testing. Over 50 college coaches confirmed to attend.', '2026-05-30', '2026-05-31', 'MetLife Stadium Complex, East Rutherford, NJ', 200, 15000, '2026-05-20', true, 'elite', 'showcase', 'NORTHEAST', 'upcoming'),
    (v_organizer_id, 'Plains Prospect Showcase', 'Two-day showcase event with morning combine testing and afternoon position work. Film sent to 200+ college programs.', '2026-06-13', '2026-06-14', 'Children''s Mercy Park, Kansas City, KS', 150, 12500, '2026-06-03', true, 'premier', 'showcase', 'PLAINS', 'upcoming'),
    (v_organizer_id, 'Florida Prospect Showcase', 'Elite individual showcase with one-on-ones, position drills, and pro-style combine testing. SEC and ACC coaches on-site.', '2026-04-25', '2026-04-26', 'IMG Academy, Bradenton, FL', 175, 17500, '2026-04-15', true, 'elite', 'showcase', 'SOUTHEAST', 'upcoming'),
    (v_organizer_id, 'SoCal Rising Stars Showcase', 'West coast''s top underclassmen showcase. Class of 2028 and 2029 prospects compete in front of Pac-12 and Big 12 evaluators.', '2026-05-09', '2026-05-10', 'Rose Bowl Stadium, Pasadena, CA', 180, 15000, '2026-04-29', true, 'premier', 'showcase', 'WEST', 'upcoming');

  -- CAMPS
  INSERT INTO tournaments (organizer_id, name, description, start_date, end_date, location, teams_capacity, entry_fee_cents, registration_deadline, is_public, event_tier, event_type, zone, status)
  VALUES
    (v_organizer_id, 'Big 12 Quarterback Academy', 'Three-day intensive QB camp with coaching from current Big 12 QB coaches. Film review, footwork labs, and live 7v7 sessions.', '2026-06-25', '2026-06-27', 'McLane Stadium, Waco, TX', 60, 25000, '2026-06-15', true, 'premier', 'camp', 'SOUTHWEST', 'upcoming'),
    (v_organizer_id, 'Great Lakes Skills Camp', 'Multi-position skills camp covering WR, DB, RB, and LB fundamentals. College coaches lead position groups and evaluate talent.', '2026-07-05', '2026-07-06', 'Spartan Stadium, East Lansing, MI', 120, 10000, '2026-06-25', true, 'standard', 'camp', 'MIDWEST', 'upcoming'),
    (v_organizer_id, 'Northeast Lineman Camp', 'Offensive and defensive line intensive camp. Hand technique, pass rush moves, and blocking schemes taught by former NFL linemen.', '2026-06-08', '2026-06-09', 'Gillette Stadium, Foxborough, MA', 80, 12500, '2026-05-28', true, 'premier', 'camp', 'NORTHEAST', 'upcoming');

  -- COMBINES
  INSERT INTO tournaments (organizer_id, name, description, start_date, end_date, location, teams_capacity, entry_fee_cents, registration_deadline, is_public, event_tier, event_type, zone, status)
  VALUES
    (v_organizer_id, 'National Underclassmen Combine', 'Full pro-style combine with verified laser times, position testing, and film. Results shared with 300+ college programs nationwide.', '2026-05-02', '2026-05-03', 'Ford Field, Detroit, MI', 250, 8500, '2026-04-22', true, 'elite', 'combine', 'MIDWEST', 'upcoming'),
    (v_organizer_id, 'Southwest Speed & Agility Combine', 'Dashr-timed 40-yard dash, shuttle, 3-cone, and vertical jump. All results digitally verified and uploaded to prospect profiles.', '2026-04-18', '2026-04-19', 'Globe Life Field, Arlington, TX', 200, 7500, '2026-04-08', true, 'premier', 'combine', 'SOUTHWEST', 'upcoming'),
    (v_organizer_id, 'Southeast Testing Combine', 'Combine testing with Dashr laser timing across all measurables. Position-specific agility drills and film evaluation stations.', '2026-06-01', '2026-06-01', 'Nissan Stadium, Nashville, TN', 175, 7500, '2026-05-22', true, 'standard', 'combine', 'SOUTHEAST', 'upcoming'),
    (v_organizer_id, 'Rocky Mountain Combine', 'High altitude combine testing for prospects across the Plains and Mountain West region. Full combine battery plus position drills.', '2026-07-18', '2026-07-19', 'Empower Field, Denver, CO', 150, 8000, '2026-07-08', true, 'standard', 'combine', 'PLAINS', 'upcoming');

  -- Backfill event_type on existing seed tournaments
  UPDATE tournaments SET event_type = 'tournament' WHERE event_type IS NULL;

END $$;
