-- Migration 029: Populate all 19 HS coach accounts to Golden Record parity
-- Seeds tasks, college tracking, and structured notes for every HS coach
-- except the Golden Record coach (James Davis).

DO $$
DECLARE
  v_coach RECORD;
  v_athlete1_id UUID;
  v_athlete1_name TEXT;
  v_athlete2_id UUID;
  v_athlete2_name TEXT;
BEGIN
  FOR v_coach IN
    SELECT c.id AS coach_id, c.profile_id
    FROM coaches c
    JOIN profiles p ON c.profile_id = p.id
    WHERE c.school_type = 'high_school'
      AND p.role = 'coach'
      AND p.id != '10000000-0000-0000-0000-000000000008'
  LOOP
    -- Idempotency: skip if coach already has college tracking data
    IF EXISTS (SELECT 1 FROM coach_college_tracking WHERE coach_id = v_coach.coach_id) THEN
      CONTINUE;
    END IF;

    -- Resolve up to 2 random roster athletes for athlete-linked tasks/notes
    v_athlete1_id := NULL;
    v_athlete1_name := NULL;
    v_athlete2_id := NULL;
    v_athlete2_name := NULL;

    SELECT tr.athlete_id, p.full_name
    INTO v_athlete1_id, v_athlete1_name
    FROM team_rosters tr
    JOIN teams t ON tr.team_id = t.id
    JOIN athletes a ON tr.athlete_id = a.id
    JOIN profiles p ON a.profile_id = p.id
    WHERE t.coach_profile_id = v_coach.profile_id
    ORDER BY random()
    LIMIT 1;

    IF v_athlete1_id IS NOT NULL THEN
      SELECT tr.athlete_id, p.full_name
      INTO v_athlete2_id, v_athlete2_name
      FROM team_rosters tr
      JOIN teams t ON tr.team_id = t.id
      JOIN athletes a ON tr.athlete_id = a.id
      JOIN profiles p ON a.profile_id = p.id
      WHERE t.coach_profile_id = v_coach.profile_id
        AND tr.athlete_id != v_athlete1_id
      ORDER BY random()
      LIMIT 1;
    END IF;

    -- A. 6 Coach Tasks
    INSERT INTO coach_tasks (coach_id, title, description, due_date, priority, status, athlete_id)
    VALUES
      (v_coach.coach_id,
       'Review spring practice film',
       'Break down last week''s practice film and identify areas for improvement across all position groups.',
       '2026-03-18', 'high', 'pending', NULL),

      (v_coach.coach_id,
       CASE WHEN v_athlete1_name IS NOT NULL
         THEN 'Schedule campus visit for ' || v_athlete1_name
         ELSE 'Schedule campus visit for top prospect'
       END,
       'Coordinate with college recruiting office to arrange an unofficial campus visit.',
       '2026-03-20', 'high', 'in_progress', v_athlete1_id),

      (v_coach.coach_id,
       'Submit academic progress reports',
       'Collect and submit mid-semester academic progress reports for all student-athletes.',
       '2026-03-25', 'medium', 'pending', NULL),

      (v_coach.coach_id,
       CASE WHEN v_athlete2_name IS NOT NULL
         THEN 'Film breakdown: ' || v_athlete2_name || ' spring game'
         ELSE 'Film breakdown: spring game highlights'
       END,
       'Create highlight clips and performance analysis for spring game evaluation.',
       '2026-03-22', 'medium', 'in_progress', v_athlete2_id),

      (v_coach.coach_id,
       'Contact recruiting coordinator',
       'Follow up with college recruiting coordinators regarding prospect evaluations and upcoming visits.',
       '2026-03-19', 'high', 'pending', NULL),

      (v_coach.coach_id,
       'Update player card photos',
       'Schedule team photo session and update athlete profile photos on RepMax player cards.',
       '2026-04-01', 'low', 'pending', NULL);

    -- B. 8 College Tracking Entries (West Coast focused — all coaches are CA schools)
    INSERT INTO coach_college_tracking (coach_id, school_name, temperature, prospect_count, scheduled_visits, notes)
    VALUES
      (v_coach.coach_id, 'USC', 'hot', 3, 2,
       'Strong pipeline connection with defensive coordinator. Two athletes invited to junior day.'),
      (v_coach.coach_id, 'UCLA', 'warm', 2, 1,
       'Attended spring practice open house. Following up on two WR prospects.'),
      (v_coach.coach_id, 'Oregon', 'hot', 4, 2,
       'Head coach visited campus last month. Four athletes on their evaluation board.'),
      (v_coach.coach_id, 'Arizona State', 'warm', 2, 0,
       'Initial contact made via recruiting questionnaire. Waiting on spring eval dates.'),
      (v_coach.coach_id, 'Stanford', 'cold', 1, 0,
       'Academic requirements are high. One athlete meets both academic and athletic thresholds.'),
      (v_coach.coach_id, 'Cal Berkeley', 'warm', 2, 1,
       'Good relationship with position coaches. One unofficial visit scheduled for April.'),
      (v_coach.coach_id, 'Washington', 'warm', 3, 1,
       'Three athletes submitted recruiting questionnaires. One invited to summer camp.'),
      (v_coach.coach_id, 'Colorado', 'cold', 1, 0,
       'Exploratory contact only. Program rebuilding — monitoring coaching staff changes.');

    -- C. 5 Structured Notes
    INSERT INTO coach_structured_notes (coach_id, athlete_id, content, category, is_pinned)
    VALUES
      (v_coach.coach_id, v_athlete1_id,
       CASE WHEN v_athlete1_name IS NOT NULL
         THEN 'Spoke with ' || v_athlete1_name || '''s family about college interest. They are prioritizing programs with strong academic support and proximity to home. Follow up after spring game evaluations.'
         ELSE 'Spoke with top prospect''s family about college interest. They are prioritizing programs with strong academic support and proximity to home. Follow up after spring game evaluations.'
       END,
       'call_log', true),

      (v_coach.coach_id, v_athlete2_id,
       CASE WHEN v_athlete2_name IS NOT NULL
         THEN v_athlete2_name || ' has shown significant improvement in spring drills. Footwork and route-running are notably better. Need to get updated film to college coaches by end of March.'
         ELSE 'Key athlete has shown significant improvement in spring drills. Footwork and route-running are notably better. Need to get updated film to college coaches by end of March.'
       END,
       'general', false),

      (v_coach.coach_id, NULL,
       'NCAA dead period ends March 25. Ensure all recruiting communications are compliant. Review updated contact rules with staff before resuming outreach.',
       'urgent', true),

      (v_coach.coach_id, NULL,
       'Spring practice focus areas: 1) Install new RPO concepts 2) Evaluate incoming freshmen at skill positions 3) Identify 3-4 athletes ready for varsity promotion 4) Film all scrimmages for recruiting packages.',
       'strategy', false),

      (v_coach.coach_id, NULL,
       'Recruiting coordination plan: Target 8-10 college programs per athlete based on academic fit, athletic level, and geographic preference. Prioritize schools that have shown interest via RepMax analytics.',
       'strategy', true);

  END LOOP;

  RAISE NOTICE 'Coach dashboard data populated for all HS coaches (excluding Golden Record).';
END $$;
