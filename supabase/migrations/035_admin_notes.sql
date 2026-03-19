-- Admin Notes & Logs
CREATE TABLE admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('athlete', 'program', 'coach', 'general')),
  target_id UUID,
  target_name TEXT,
  note_type TEXT NOT NULL CHECK (note_type IN ('internal', 'flag', 'update', 'task')),
  content TEXT NOT NULL,
  visibility TEXT DEFAULT 'admin_only' CHECK (visibility IN ('admin_only', 'admin_coach', 'admin_coach_parent')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage notes" ON admin_notes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
