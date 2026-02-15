-- Coach tasks table for task management in coach dashboard
CREATE TABLE coach_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES athletes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE coach_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage own tasks"
  ON coach_tasks FOR ALL
  USING (coach_id IN (
    SELECT c.id FROM coaches c
    JOIN profiles p ON p.id = c.profile_id
    WHERE p.user_id = auth.uid()
  ));

-- Index for coach lookups
CREATE INDEX idx_coach_tasks_coach_id ON coach_tasks(coach_id);
CREATE INDEX idx_coach_tasks_status ON coach_tasks(status);
