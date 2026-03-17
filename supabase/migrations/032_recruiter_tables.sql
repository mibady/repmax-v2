-- Campus visits table (needed by /recruiter/visits)
CREATE TABLE IF NOT EXISTS campus_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  visit_time TIME,
  visit_type TEXT CHECK (visit_type IN ('official', 'unofficial')) DEFAULT 'unofficial',
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campus_visits_recruiter ON campus_visits(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_campus_visits_date ON campus_visits(visit_date);

ALTER TABLE campus_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recruiters can manage own visits" ON campus_visits
  FOR ALL USING (
    recruiter_id IN (
      SELECT c.id FROM coaches c
      JOIN profiles p ON p.id = c.profile_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Communication log table (needed by /recruiter/communications)
CREATE TABLE IF NOT EXISTS communication_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  comm_type TEXT CHECK (comm_type IN ('call', 'email', 'visit', 'message')) NOT NULL,
  summary TEXT NOT NULL,
  staff_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_communication_log_recruiter ON communication_log(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_communication_log_athlete ON communication_log(athlete_id);

ALTER TABLE communication_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recruiters can manage own comms" ON communication_log
  FOR ALL USING (
    recruiter_id IN (
      SELECT c.id FROM coaches c
      JOIN profiles p ON p.id = c.profile_id
      WHERE p.user_id = auth.uid()
    )
  );
