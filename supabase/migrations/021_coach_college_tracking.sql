-- Coach College Tracking
CREATE TABLE coach_college_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL,
  temperature TEXT NOT NULL DEFAULT 'warm'
    CHECK (temperature IN ('hot', 'warm', 'cold')),
  prospect_count INTEGER DEFAULT 0,
  scheduled_visits INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_coach_college_tracking_coach ON coach_college_tracking(coach_id);

-- RLS
ALTER TABLE coach_college_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches manage own college tracking"
  ON coach_college_tracking
  FOR ALL
  USING (
    coach_id IN (
      SELECT c.id FROM coaches c
      JOIN profiles p ON c.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    coach_id IN (
      SELECT c.id FROM coaches c
      JOIN profiles p ON c.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );
