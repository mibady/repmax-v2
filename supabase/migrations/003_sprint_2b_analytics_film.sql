-- Sprint 2B: Analytics, Film Bookmarks, and Zone Activity
-- Generated from Stitch designs: 2026-02-01
-- New entities: profile_views, film_bookmarks, zone_activity, onboarding_progress

-- ============================================================
-- PROFILE VIEWS TABLE (Analytics Dashboard)
-- Tracks when recruiters/coaches view athlete profiles
-- ============================================================

CREATE TABLE IF NOT EXISTS profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  viewer_role TEXT,
  viewer_school TEXT,
  viewer_division TEXT,
  viewer_state TEXT,
  viewer_zone recruiting_zone,
  source TEXT CHECK (source IN ('search', 'shortlist', 'share_link', 'direct', 'zone_pulse', 'email')),
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for profile views (analytics queries)
CREATE INDEX IF NOT EXISTS idx_profile_views_athlete ON profile_views(athlete_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer ON profile_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_created ON profile_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_views_athlete_date ON profile_views(athlete_id, created_at);
CREATE INDEX IF NOT EXISTS idx_profile_views_zone ON profile_views(viewer_zone);

-- RLS for profile views
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Athletes can see views of their own profile
CREATE POLICY "Athletes can view own profile views"
  ON profile_views FOR SELECT
  USING (
    athlete_id IN (
      SELECT a.id FROM athletes a
      JOIN profiles p ON a.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Service role can insert views (from server-side tracking)
CREATE POLICY "Service can insert profile views"
  ON profile_views FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- FILM BOOKMARKS TABLE (Recruiter Film Player)
-- Allows recruiters to bookmark moments and add notes on highlights
-- ============================================================

CREATE TABLE IF NOT EXISTS film_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  highlight_id UUID NOT NULL REFERENCES highlights(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  timestamp_seconds INTEGER NOT NULL,
  label TEXT,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(highlight_id, coach_id, timestamp_seconds)
);

-- Indexes for film bookmarks
CREATE INDEX IF NOT EXISTS idx_film_bookmarks_highlight ON film_bookmarks(highlight_id);
CREATE INDEX IF NOT EXISTS idx_film_bookmarks_coach ON film_bookmarks(coach_id);

-- RLS for film bookmarks
ALTER TABLE film_bookmarks ENABLE ROW LEVEL SECURITY;

-- Coaches can manage their own bookmarks
CREATE POLICY "Coaches can manage own bookmarks"
  ON film_bookmarks FOR ALL
  USING (
    coach_id IN (
      SELECT c.id FROM coaches c
      JOIN profiles p ON c.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Athletes can see bookmarks on their highlights (without notes for privacy)
CREATE POLICY "Athletes can see bookmarks on own highlights"
  ON film_bookmarks FOR SELECT
  USING (
    highlight_id IN (
      SELECT h.id FROM highlights h
      JOIN athletes a ON h.athlete_id = a.id
      JOIN profiles p ON a.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- ============================================================
-- ZONE ACTIVITY TABLE (Zone Pulse & Intelligence)
-- Stores aggregated recruiting activity by zone
-- ============================================================

CREATE TABLE IF NOT EXISTS zone_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone recruiting_zone NOT NULL,
  date DATE NOT NULL,
  -- Activity metrics
  total_views INTEGER DEFAULT 0,
  unique_athletes_viewed INTEGER DEFAULT 0,
  unique_coaches_active INTEGER DEFAULT 0,
  new_offers INTEGER DEFAULT 0,
  new_commits INTEGER DEFAULT 0,
  -- Hot positions (array of position codes)
  hot_positions TEXT[],
  -- Top schools active in zone
  active_schools JSONB DEFAULT '[]'::jsonb,
  -- Trending metrics
  activity_level TEXT CHECK (activity_level IN ('low', 'moderate', 'high', 'very_high')) DEFAULT 'moderate',
  week_over_week_change DECIMAL(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(zone, date)
);

-- Indexes for zone activity
CREATE INDEX IF NOT EXISTS idx_zone_activity_zone ON zone_activity(zone);
CREATE INDEX IF NOT EXISTS idx_zone_activity_date ON zone_activity(date DESC);
CREATE INDEX IF NOT EXISTS idx_zone_activity_zone_date ON zone_activity(zone, date DESC);

-- RLS for zone activity (public read for all authenticated users)
ALTER TABLE zone_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Zone activity is viewable by authenticated users"
  ON zone_activity FOR SELECT
  USING (auth.role() = 'authenticated');

-- Service role can insert/update zone activity (from analytics jobs)
CREATE POLICY "Service can manage zone activity"
  ON zone_activity FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- ONBOARDING PROGRESS TABLE (AI Onboarding Chat)
-- Tracks user progress through the AI-guided onboarding flow
-- ============================================================

CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role user_role NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 1,
  completed_steps INTEGER[] DEFAULT '{}',
  -- Collected data from chat
  collected_data JSONB DEFAULT '{}',
  -- Status
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_interaction_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Chat history (for resuming)
  chat_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for onboarding progress
CREATE INDEX IF NOT EXISTS idx_onboarding_user ON onboarding_progress(user_id);

-- RLS for onboarding progress
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Users can manage their own onboarding progress
CREATE POLICY "Users can manage own onboarding"
  ON onboarding_progress FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- RECRUITING CALENDAR EVENTS TABLE (Calendar Widgets)
-- Stores recruiting calendar events and deadlines
-- ============================================================

CREATE TABLE IF NOT EXISTS recruiting_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('deadline', 'signing_period', 'visit', 'camp', 'showcase', 'evaluation', 'contact_period', 'dead_period')),
  start_date DATE NOT NULL,
  end_date DATE,
  -- Scope
  applies_to_divisions division[],
  applies_to_zones recruiting_zone[],
  applies_to_class_years INTEGER[],
  -- NCAA official event
  is_ncaa_official BOOLEAN DEFAULT false,
  ncaa_rule_reference TEXT,
  -- Visibility
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for recruiting events
CREATE INDEX IF NOT EXISTS idx_recruiting_events_start ON recruiting_events(start_date);
CREATE INDEX IF NOT EXISTS idx_recruiting_events_type ON recruiting_events(event_type);
-- Note: partial index with CURRENT_DATE not allowed (not immutable); use plain index
CREATE INDEX IF NOT EXISTS idx_recruiting_events_upcoming ON recruiting_events(start_date);

-- RLS for recruiting events
ALTER TABLE recruiting_events ENABLE ROW LEVEL SECURITY;

-- Public events are viewable by everyone
CREATE POLICY "Public events are viewable"
  ON recruiting_events FOR SELECT
  USING (is_public = true OR created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Users can create private events
CREATE POLICY "Users can create events"
  ON recruiting_events FOR INSERT
  WITH CHECK (
    created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Users can manage their own events
CREATE POLICY "Users can manage own events"
  ON recruiting_events FOR UPDATE
  USING (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own events"
  ON recruiting_events FOR DELETE
  USING (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ============================================================
-- CLASS RANKINGS TABLE (Class Rankings Widget)
-- Stores college recruiting class rankings
-- ============================================================

CREATE TABLE IF NOT EXISTS class_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT NOT NULL,
  division division NOT NULL,
  conference TEXT,
  class_year INTEGER NOT NULL,
  -- Rankings
  overall_rank INTEGER,
  conference_rank INTEGER,
  -- Class stats
  total_commits INTEGER DEFAULT 0,
  five_stars INTEGER DEFAULT 0,
  four_stars INTEGER DEFAULT 0,
  three_stars INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2),
  -- Score
  points DECIMAL(8,2),
  -- Metadata
  ranking_source TEXT DEFAULT 'repmax',
  as_of_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(school_name, class_year, ranking_source, as_of_date)
);

-- Indexes for class rankings
CREATE INDEX IF NOT EXISTS idx_class_rankings_year ON class_rankings(class_year);
CREATE INDEX IF NOT EXISTS idx_class_rankings_school ON class_rankings(school_name);
CREATE INDEX IF NOT EXISTS idx_class_rankings_division ON class_rankings(division);
CREATE INDEX IF NOT EXISTS idx_class_rankings_rank ON class_rankings(overall_rank) WHERE overall_rank IS NOT NULL;

-- RLS for class rankings (public read)
ALTER TABLE class_rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Class rankings are viewable by everyone"
  ON class_rankings FOR SELECT
  USING (true);

-- Only service role can modify rankings
CREATE POLICY "Service can manage rankings"
  ON class_rankings FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- UPDATE TRIGGERS
-- ============================================================

-- Apply update triggers to new tables
DROP TRIGGER IF EXISTS film_bookmarks_updated_at ON film_bookmarks;
CREATE TRIGGER film_bookmarks_updated_at
  BEFORE UPDATE ON film_bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS zone_activity_updated_at ON zone_activity;
CREATE TRIGGER zone_activity_updated_at
  BEFORE UPDATE ON zone_activity
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS onboarding_progress_updated_at ON onboarding_progress;
CREATE TRIGGER onboarding_progress_updated_at
  BEFORE UPDATE ON onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS recruiting_events_updated_at ON recruiting_events;
CREATE TRIGGER recruiting_events_updated_at
  BEFORE UPDATE ON recruiting_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS class_rankings_updated_at ON class_rankings;
CREATE TRIGGER class_rankings_updated_at
  BEFORE UPDATE ON class_rankings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- NOTIFICATION TRIGGER FOR PROFILE VIEWS
-- ============================================================

-- Function to create notification when profile is viewed by a coach
CREATE OR REPLACE FUNCTION notify_profile_view()
RETURNS TRIGGER AS $$
DECLARE
  athlete_profile_id UUID;
  viewer_info TEXT;
BEGIN
  -- Only notify for coach/recruiter views
  IF NEW.viewer_role NOT IN ('coach', 'recruiter') THEN
    RETURN NEW;
  END IF;

  -- Get athlete's profile_id
  SELECT profile_id INTO athlete_profile_id
  FROM athletes WHERE id = NEW.athlete_id;

  -- Build viewer info
  viewer_info := COALESCE(NEW.viewer_school, 'A recruiter');
  IF NEW.viewer_division IS NOT NULL THEN
    viewer_info := viewer_info || ' (' || NEW.viewer_division || ')';
  END IF;

  -- Create notification
  INSERT INTO notifications (user_id, type, title, description, metadata)
  VALUES (
    athlete_profile_id,
    'profile_view',
    viewer_info || ' viewed your profile',
    'Your profile was viewed from ' || COALESCE(NEW.viewer_state, 'an unknown location'),
    jsonb_build_object(
      'view_id', NEW.id,
      'viewer_id', NEW.viewer_id,
      'viewer_school', NEW.viewer_school,
      'viewer_division', NEW.viewer_division,
      'source', NEW.source
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for profile view notifications
DROP TRIGGER IF EXISTS on_profile_view ON profile_views;
CREATE TRIGGER on_profile_view
  AFTER INSERT ON profile_views
  FOR EACH ROW
  EXECUTE FUNCTION notify_profile_view();

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE profile_views IS 'Tracks when athletes profiles are viewed, for analytics dashboard';
COMMENT ON TABLE film_bookmarks IS 'Recruiter bookmarks and notes on athlete highlight videos';
COMMENT ON TABLE zone_activity IS 'Aggregated daily recruiting activity metrics by zone';
COMMENT ON TABLE onboarding_progress IS 'User progress through AI-guided onboarding chat flow';
COMMENT ON TABLE recruiting_events IS 'Recruiting calendar events, deadlines, and periods';
COMMENT ON TABLE class_rankings IS 'College recruiting class rankings by year and source';
