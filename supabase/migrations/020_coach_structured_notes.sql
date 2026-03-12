-- Coach Structured Notes
CREATE TABLE coach_structured_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES athletes(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general'
    CHECK (category IN ('general', 'urgent', 'call_log', 'strategy')),
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_coach_structured_notes_coach ON coach_structured_notes(coach_id);
CREATE INDEX idx_coach_structured_notes_athlete ON coach_structured_notes(athlete_id);

-- RLS
ALTER TABLE coach_structured_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches manage own notes"
  ON coach_structured_notes
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
