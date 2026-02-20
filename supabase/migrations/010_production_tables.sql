-- Migration: 010_production_tables
-- Description: Add athlete_events, feature_flags, moderation_queue, zone_assignments

-- ============================================
-- ATHLETE EVENTS
-- ============================================
CREATE TABLE IF NOT EXISTS athlete_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('visit', 'camp', 'combine', 'game', 'deadline', 'signing', 'other')),
  event_date DATE NOT NULL,
  event_time TIME,
  location TEXT,
  priority TEXT CHECK (priority IN ('high', 'normal')) DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- FEATURE FLAGS
-- ============================================
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- MODERATION QUEUE
-- ============================================
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  content_type TEXT NOT NULL CHECK (content_type IN ('photo', 'bio', 'film')),
  content_id TEXT,
  flag_reason TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'warned', 'removed')) DEFAULT 'pending',
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ZONE ASSIGNMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS zone_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone TEXT NOT NULL,
  recruiter_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(zone, recruiter_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_athlete_events_athlete_date ON athlete_events(athlete_id, event_date);
CREATE INDEX idx_feature_flags_key ON feature_flags(key);
CREATE INDEX idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX idx_zone_assignments_zone ON zone_assignments(zone);

-- ============================================
-- TRIGGERS (reuse existing update_updated_at function)
-- ============================================
CREATE TRIGGER update_athlete_events_updated_at
  BEFORE UPDATE ON athlete_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE athlete_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE zone_assignments ENABLE ROW LEVEL SECURITY;

-- athlete_events policies
CREATE POLICY "Athletes can manage own events" ON athlete_events
  FOR ALL USING (athlete_id IN (
    SELECT a.id FROM athletes a
    JOIN profiles p ON a.profile_id = p.id
    WHERE p.user_id = auth.uid()
  ));

CREATE POLICY "Coaches can view shortlisted athlete events" ON athlete_events
  FOR SELECT USING (athlete_id IN (
    SELECT sl.athlete_id FROM shortlists sl
    JOIN coaches c ON c.id = sl.coach_id
    JOIN profiles p ON c.profile_id = p.id
    WHERE p.user_id = auth.uid()
  ));

-- feature_flags policies
CREATE POLICY "Authenticated users can read flags" ON feature_flags
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage flags" ON feature_flags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- moderation_queue policies
CREATE POLICY "Admins can manage moderation" ON moderation_queue
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- zone_assignments policies
CREATE POLICY "Authenticated users can read assignments" ON zone_assignments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage assignments" ON zone_assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
