-- 028: Fix coach_tasks schema, create recruiting_events, seed coach dashboard data
-- Fixes column mismatches between DB schema and API expectations

-- ============================================================
-- 1. Fix coach_tasks schema (API expects title/description/status)
-- DB has: text, completed (boolean) — API expects: title, description, status (text)
-- ============================================================

ALTER TABLE coach_tasks RENAME COLUMN text TO title;
ALTER TABLE coach_tasks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE coach_tasks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'
  CHECK (status IN ('pending', 'in_progress', 'completed'));

-- Convert completed boolean to status text
UPDATE coach_tasks SET status = CASE WHEN completed = true THEN 'completed' ELSE 'pending' END
WHERE status IS NULL OR status = 'pending';

ALTER TABLE coach_tasks DROP COLUMN IF EXISTS completed;

-- ============================================================
-- 2. Create recruiting_events table (doesn't exist yet)
-- Dashboard API queries: id, title, event_date, event_type, location
-- ============================================================

CREATE TABLE IF NOT EXISTS recruiting_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  event_type TEXT NOT NULL,
  location TEXT,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  is_ncaa_official BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recruiting_events_event_date ON recruiting_events(event_date);

-- ============================================================
-- 3. Seed recruiting_events (12 events, Summer 2026)
-- ============================================================

INSERT INTO recruiting_events (title, event_date, end_date, event_type, location, description, is_public, is_ncaa_official)
VALUES
  ('Contact Period Opens', '2026-06-01', NULL, 'contact', NULL, 'NCAA Division I FBS contact period begins.', true, true),
  ('Elite 11 Regional - Dallas', '2026-06-07', '2026-06-08', 'camp', 'AT&T Stadium, Arlington, TX', 'Top QB prospects compete for Elite 11 Finals invite.', true, false),
  ('Nike Football The Opening', '2026-06-14', '2026-06-16', 'showcase', 'Nike HQ, Beaverton, OR', 'Invite-only showcase for top 150 prospects nationally.', true, false),
  ('Dead Period', '2026-06-25', '2026-06-29', 'dead', NULL, 'NCAA dead period. No in-person recruiting contact.', true, true),
  ('USC Summer Camp', '2026-07-01', '2026-07-02', 'camp', 'LA Coliseum, Los Angeles, CA', 'Open camp with USC coaching staff.', true, false),
  ('Evaluation Period Opens', '2026-07-07', '2026-07-31', 'evaluation', NULL, 'NCAA evaluation period begins.', true, true),
  ('Under Armour All-America Camp', '2026-07-12', '2026-07-13', 'camp', 'IMG Academy, Bradenton, FL', 'National camp for top prospects.', true, false),
  ('Oregon Official Visit Weekend', '2026-07-18', '2026-07-20', 'visit', 'Autzen Stadium, Eugene, OR', 'Official visit weekend for priority prospects.', true, false),
  ('Texas 7v7 State Championship', '2026-07-25', '2026-07-27', 'showcase', 'College Station, TX', 'State championship 7v7 with college scouts.', true, false),
  ('Quiet Period Begins', '2026-08-01', '2026-08-31', 'quiet', NULL, 'NCAA quiet period. On-campus visits only.', true, true),
  ('Washington Official Visit Weekend', '2026-08-08', '2026-08-10', 'visit', 'Husky Stadium, Seattle, WA', 'Class of 2027 priority visit weekend.', true, false),
  ('Fall Evaluation Period', '2026-09-01', '2026-11-28', 'evaluation', NULL, 'NCAA fall evaluation period begins.', true, true);

-- ============================================================
-- 4. Seed coach data (colleges, notes, tasks, profile views)
-- ============================================================

DO $$
DECLARE
  v_coach_id UUID;
  v_coach_profile_id UUID;
  v_jaylen UUID;
  v_andre UUID;
  v_devon UUID;
  v_ryan UUID;
  v_carlos UUID;
  v_rec1 UUID;
  v_rec2 UUID;
BEGIN
  -- Look up Coach Davis
  SELECT p.id INTO v_coach_profile_id
  FROM profiles p WHERE p.full_name LIKE '%James Davis%' AND p.role = 'coach' LIMIT 1;

  IF v_coach_profile_id IS NULL THEN
    -- Fallback to Golden Record ID
    v_coach_profile_id := '10000000-0000-0000-0000-000000000008';
  END IF;

  SELECT c.id INTO v_coach_id
  FROM coaches c WHERE c.profile_id = v_coach_profile_id LIMIT 1;

  IF v_coach_id IS NULL THEN
    RAISE NOTICE 'Coach not found, skipping seed';
    RETURN;
  END IF;

  -- Athlete IDs (hardcoded Golden Record IDs)
  v_jaylen := '20000000-0000-0000-0000-000000000001';
  v_andre  := '20000000-0000-0000-0000-000000000020';
  v_devon  := '20000000-0000-0000-0000-000000000021';
  v_ryan   := '20000000-0000-0000-0000-000000000022';
  v_carlos := '20000000-0000-0000-0000-000000000023';

  -- Recruiter profiles for viewer_profile_id
  SELECT p.id INTO v_rec1 FROM profiles p WHERE p.role = 'recruiter' LIMIT 1;
  SELECT p.id INTO v_rec2 FROM profiles p WHERE p.role = 'recruiter' AND p.id != v_rec1 LIMIT 1;

  -- ============================================================
  -- 4a. Coach College Tracking (8 schools)
  -- ============================================================
  INSERT INTO coach_college_tracking (coach_id, school_name, temperature, prospect_count, scheduled_visits, notes)
  VALUES
    (v_coach_id, 'USC', 'hot', 5, 2, 'Strong pipeline. OC interested in Jaylen and Andre. Campus visit scheduled July.'),
    (v_coach_id, 'UCLA', 'warm', 3, 1, 'DB coach reached out about Ryan Park. Good academic fit.'),
    (v_coach_id, 'Oregon', 'hot', 4, 3, 'Top target program. Official visit weekend July confirmed.'),
    (v_coach_id, 'Arizona State', 'warm', 2, 0, 'New staff building relationships. Attended spring game.'),
    (v_coach_id, 'Stanford', 'cold', 1, 0, 'Academic requirements high. Only Jaylen meets GPA threshold.'),
    (v_coach_id, 'Cal Berkeley', 'warm', 2, 1, 'Good relationship with DL coach. Devon on their radar.'),
    (v_coach_id, 'Washington', 'hot', 3, 2, 'Aggressive recruiter. Two official visits confirmed August.'),
    (v_coach_id, 'Colorado', 'warm', 1, 0, 'New coaching staff expressing interest. Early stages.');

  -- ============================================================
  -- 4b. Coach Structured Notes (5 notes)
  -- ============================================================
  INSERT INTO coach_structured_notes (coach_id, athlete_id, content, category, is_pinned)
  VALUES
    (v_coach_id, v_jaylen, 'USC OC called - very interested in Jaylen for early enrollment. Need to coordinate official visit before July dead period. Family is on board.', 'call_log', true),
    (v_coach_id, v_devon, 'Devon''s 40 time improved to 4.48 at spring testing. Weight room numbers up. Need to update player card and send new film to Oregon and Cal.', 'general', false),
    (v_coach_id, NULL, 'URGENT: NCAA compliance deadline March 25 for academic progress reports. Must submit for all juniors and seniors.', 'urgent', true),
    (v_coach_id, v_carlos, 'Carlos needs to get verified on RepMax before camp season. Film is strong but profile completeness is low. Schedule meeting with parents.', 'strategy', false),
    (v_coach_id, NULL, 'Spring game plan: run full scrimmage format with film crew. Invite regional scouts from USC, Oregon, Washington.', 'strategy', true);

  -- ============================================================
  -- 4c. Fresh Coach Tasks (6 tasks, March-April 2026)
  -- ============================================================
  INSERT INTO coach_tasks (coach_id, title, description, due_date, priority, status, athlete_id)
  VALUES
    (v_coach_id, 'Review spring practice film', 'Break down spring practice footage for offensive and defensive evaluation.', '2026-03-18', 'high', 'pending', NULL),
    (v_coach_id, 'Schedule USC campus visit for Jaylen', 'Coordinate with USC recruiting office. Arrange travel, confirm dates with family.', '2026-03-20', 'high', 'in_progress', v_jaylen),
    (v_coach_id, 'Submit academic progress reports', 'Compile NCAA-required reports for all juniors and seniors.', '2026-03-25', 'medium', 'pending', NULL),
    (v_coach_id, 'Film breakdown: Devon Brooks spring game', 'Create detailed film breakdown highlighting improved speed and route running.', '2026-03-22', 'medium', 'in_progress', v_devon),
    (v_coach_id, 'Contact Oregon recruiting coordinator', 'Follow up on interest in multiple roster athletes. Discuss July visit logistics.', '2026-03-19', 'high', 'pending', NULL),
    (v_coach_id, 'Update player card photos', 'Schedule team photo session for updated headshots and action shots.', '2026-04-01', 'low', 'pending', NULL);

  -- ============================================================
  -- 4d. Profile Views (32 views across 5 athletes)
  -- Columns: athlete_id, viewer_profile_id, viewer_role, viewer_school, viewer_zone, section_viewed, created_at
  -- ============================================================

  -- Jaylen Washington (10 views - star QB)
  INSERT INTO profile_views (athlete_id, viewer_profile_id, viewer_role, viewer_school, viewer_zone, section_viewed, created_at)
  VALUES
    (v_jaylen, v_rec1, 'recruiter', 'TCU', 'Southwest', 'overview', '2026-03-01T10:15:00Z'),
    (v_jaylen, v_rec2, 'recruiter', 'Arizona State', 'Southwest', 'film', '2026-03-02T14:30:00Z'),
    (v_jaylen, v_rec1, 'recruiter', 'TCU', 'Southwest', 'stats', '2026-03-05T09:00:00Z'),
    (v_jaylen, NULL, 'recruiter', 'USC', 'West', 'overview', '2026-03-06T11:20:00Z'),
    (v_jaylen, NULL, 'recruiter', 'Oregon', 'West', 'film', '2026-03-07T16:45:00Z'),
    (v_jaylen, NULL, 'recruiter', 'Washington', 'West', 'overview', '2026-03-08T08:30:00Z'),
    (v_jaylen, v_rec2, 'recruiter', 'Arizona State', 'Southwest', 'stats', '2026-03-10T13:00:00Z'),
    (v_jaylen, NULL, 'recruiter', 'UCLA', 'West', 'overview', '2026-03-11T10:00:00Z'),
    (v_jaylen, NULL, 'coach', 'Stanford', 'West', 'film', '2026-03-12T15:30:00Z'),
    (v_jaylen, NULL, 'recruiter', 'Colorado', 'West', 'overview', '2026-03-14T09:15:00Z');

  -- Andre Mitchell (5 views)
  INSERT INTO profile_views (athlete_id, viewer_profile_id, viewer_role, viewer_school, viewer_zone, section_viewed, created_at)
  VALUES
    (v_andre, v_rec1, 'recruiter', 'TCU', 'Southwest', 'overview', '2026-03-03T11:00:00Z'),
    (v_andre, NULL, 'recruiter', 'USC', 'West', 'film', '2026-03-05T14:00:00Z'),
    (v_andre, v_rec2, 'recruiter', 'Arizona State', 'Southwest', 'stats', '2026-03-08T10:30:00Z'),
    (v_andre, NULL, 'recruiter', 'Oregon', 'West', 'overview', '2026-03-10T16:00:00Z'),
    (v_andre, NULL, 'recruiter', 'Washington', 'West', 'film', '2026-03-13T09:45:00Z');

  -- Devon Brooks (6 views)
  INSERT INTO profile_views (athlete_id, viewer_profile_id, viewer_role, viewer_school, viewer_zone, section_viewed, created_at)
  VALUES
    (v_devon, v_rec1, 'recruiter', 'TCU', 'Southwest', 'overview', '2026-03-02T09:30:00Z'),
    (v_devon, NULL, 'recruiter', 'Cal Berkeley', 'West', 'film', '2026-03-04T13:15:00Z'),
    (v_devon, NULL, 'recruiter', 'Oregon', 'West', 'overview', '2026-03-07T11:00:00Z'),
    (v_devon, v_rec2, 'recruiter', 'Arizona State', 'Southwest', 'stats', '2026-03-09T15:20:00Z'),
    (v_devon, NULL, 'coach', 'UCLA', 'West', 'film', '2026-03-12T10:00:00Z'),
    (v_devon, NULL, 'recruiter', 'USC', 'West', 'overview', '2026-03-14T14:30:00Z');

  -- Ryan Park (5 views)
  INSERT INTO profile_views (athlete_id, viewer_profile_id, viewer_role, viewer_school, viewer_zone, section_viewed, created_at)
  VALUES
    (v_ryan, NULL, 'recruiter', 'UCLA', 'West', 'overview', '2026-03-03T14:00:00Z'),
    (v_ryan, v_rec1, 'recruiter', 'TCU', 'Southwest', 'film', '2026-03-06T10:45:00Z'),
    (v_ryan, NULL, 'recruiter', 'Oregon', 'West', 'overview', '2026-03-09T09:00:00Z'),
    (v_ryan, NULL, 'recruiter', 'Washington', 'West', 'stats', '2026-03-11T16:15:00Z'),
    (v_ryan, v_rec2, 'recruiter', 'Arizona State', 'Southwest', 'overview', '2026-03-13T11:30:00Z');

  -- Carlos Mendez (6 views)
  INSERT INTO profile_views (athlete_id, viewer_profile_id, viewer_role, viewer_school, viewer_zone, section_viewed, created_at)
  VALUES
    (v_carlos, v_rec1, 'recruiter', 'TCU', 'Southwest', 'overview', '2026-03-04T10:00:00Z'),
    (v_carlos, NULL, 'recruiter', 'Cal Berkeley', 'West', 'film', '2026-03-06T15:30:00Z'),
    (v_carlos, NULL, 'recruiter', 'USC', 'West', 'overview', '2026-03-08T12:00:00Z'),
    (v_carlos, NULL, 'recruiter', 'Oregon', 'West', 'stats', '2026-03-10T09:30:00Z'),
    (v_carlos, v_rec2, 'recruiter', 'Arizona State', 'Southwest', 'overview', '2026-03-12T14:00:00Z'),
    (v_carlos, NULL, 'recruiter', 'Washington', 'West', 'film', '2026-03-15T10:15:00Z');

  RAISE NOTICE 'Coach dashboard seed data inserted successfully';
END $$;
