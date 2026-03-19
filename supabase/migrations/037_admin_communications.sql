-- Admin Communications
CREATE TABLE admin_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT NOT NULL,
  channel TEXT DEFAULT 'in_app' CHECK (channel IN ('email', 'in_app', 'both')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'scheduled')),
  sent_by UUID REFERENCES profiles(id),
  sent_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  recipients_count INTEGER DEFAULT 0,
  open_rate DECIMAL,
  click_rate DECIMAL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE admin_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admin_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage communications" ON admin_communications
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage templates" ON admin_email_templates
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
