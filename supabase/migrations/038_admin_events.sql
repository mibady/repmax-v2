-- Admin Events
CREATE TABLE admin_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('combine', 'deadline', 'signing', 'platform', 'admin_task')),
  linked_program TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admin_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage events" ON admin_events
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
