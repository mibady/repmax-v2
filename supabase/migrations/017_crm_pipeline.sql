-- Migration: 017_crm_pipeline
-- Description: Create crm_pipeline table for college recruiter Kanban workflow

-- Create the crm_stage enum
DO $$ BEGIN
  CREATE TYPE crm_stage AS ENUM (
    'identified', 'contacted', 'evaluating',
    'visit_scheduled', 'offered', 'committed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create crm_pipeline table
CREATE TABLE IF NOT EXISTS crm_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  stage crm_stage NOT NULL DEFAULT 'identified',
  priority priority_level DEFAULT 'medium',
  assigned_to UUID REFERENCES profiles(id),
  tags TEXT[],
  notes TEXT,
  last_touch TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(recruiter_id, athlete_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_crm_pipeline_recruiter ON crm_pipeline(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_crm_pipeline_stage ON crm_pipeline(stage);
CREATE INDEX IF NOT EXISTS idx_crm_pipeline_athlete ON crm_pipeline(athlete_id);

-- Updated_at trigger
CREATE TRIGGER update_crm_pipeline_updated_at
  BEFORE UPDATE ON crm_pipeline
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE crm_pipeline ENABLE ROW LEVEL SECURITY;

-- Recruiters can read/write their own pipeline entries
CREATE POLICY "Recruiters can manage own pipeline" ON crm_pipeline
  FOR ALL USING (
    recruiter_id IN (
      SELECT c.id FROM coaches c
      JOIN profiles p ON p.id = c.profile_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Admins can read all pipeline entries
CREATE POLICY "Admins can read all pipeline" ON crm_pipeline
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
