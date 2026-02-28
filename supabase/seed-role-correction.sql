-- ============================================
-- ROLE ARCHITECTURE CORRECTION SEED SCRIPT
-- ============================================
-- Prerequisites:
--   1. Migration 016_fix_coaches_table_role_separation.sql applied
--   2. Migration 017_crm_pipeline.sql applied
--   3. NGE-257 code changes deployed
-- ============================================

-- ============================================
-- 1. Fix dirty test accounts from organizer→admin bug
-- ============================================
-- Any test club accounts created before this sprint have role='admin'
-- instead of role='club'. Preserve known real admins.
UPDATE profiles
SET role = 'club'
WHERE role = 'admin'
  AND id NOT IN (
    -- Preserve real admin accounts — those with "admin" in their name
    SELECT id FROM profiles WHERE role = 'admin' AND full_name ILIKE '%admin%'
  );

-- ============================================
-- 2. Fix existing coach records in coaches table
-- ============================================
-- High school coaches: school_type='high_school', division=NULL
UPDATE coaches
SET school_type = 'high_school', division = NULL
WHERE profile_id IN (SELECT id FROM profiles WHERE role = 'coach');

-- College recruiters: school_type='college'
UPDATE coaches
SET school_type = 'college'
WHERE profile_id IN (SELECT id FROM profiles WHERE role = 'recruiter');

-- Club organizers: school_type='club'
UPDATE coaches
SET school_type = 'club'
WHERE profile_id IN (SELECT id FROM profiles WHERE role = 'club');

-- ============================================
-- 3. Seed crm_pipeline — College recruiter tracking data
-- ============================================
-- Distribute athletes across all 6 stages for demo data
INSERT INTO crm_pipeline (recruiter_id, athlete_id, stage, priority, notes, last_touch)
SELECT
  c.id as recruiter_id,
  a.id as athlete_id,
  stage_value::crm_stage,
  'high'::priority_level,
  'Demo pipeline entry',
  now() - (random() * interval '30 days')
FROM coaches c
JOIN profiles p ON p.id = c.profile_id AND p.role = 'recruiter'
CROSS JOIN (
  VALUES ('identified'), ('contacted'), ('evaluating'),
         ('visit_scheduled'), ('offered'), ('committed')
) AS stages(stage_value)
JOIN athletes a ON a.zone IS NOT NULL
WHERE NOT EXISTS (
  SELECT 1 FROM crm_pipeline cp WHERE cp.recruiter_id = c.id AND cp.athlete_id = a.id
)
LIMIT 40;

-- ============================================
-- 4. Seed feature_flags — Admin panel needs data
-- ============================================
INSERT INTO feature_flags (key, label, description, enabled) VALUES
  ('player_card_v2',       'Player Card v2',       'New card design with QR code',            false),
  ('zone_intel_ai',        'Zone Intel AI',        'AI-powered zone recruiting insights',     false),
  ('parent_notifications', 'Parent Notifications', 'Email alerts for parents on scout views', true),
  ('club_verification',    'Club Verification',    'Verified club badge program',             false),
  ('dashr_integration',    'Dashr Integration',    'Speed testing combine events',            true)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 5. Add a second team and roster
-- ============================================
INSERT INTO teams (name, school_name, city, state, zone, coach_profile_id)
SELECT
  'Allen Eagles Football',
  'Allen High School',
  'Allen', 'TX', 'Southwest',
  p.id
FROM profiles p
JOIN coaches c ON c.profile_id = p.id AND c.school_type = 'high_school'
WHERE p.role = 'coach'
  AND NOT EXISTS (
    SELECT 1 FROM teams t WHERE t.coach_profile_id = p.id AND t.name = 'Allen Eagles Football'
  )
ORDER BY p.created_at DESC
LIMIT 1;
