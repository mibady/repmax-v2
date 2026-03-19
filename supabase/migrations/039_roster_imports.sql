-- Roster Import Tracking
CREATE TABLE roster_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  file_name TEXT,
  total_rows INTEGER,
  imported INTEGER DEFAULT 0,
  warnings INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'mapping', 'reviewing', 'importing', 'completed', 'failed')),
  column_mapping JSONB,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE roster_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage roster imports" ON roster_imports
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
