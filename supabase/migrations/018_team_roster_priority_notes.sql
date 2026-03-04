-- ============================================
-- Add priority and notes to team_rosters
-- ============================================
-- Enables coaches to track athlete priority level and notes
-- on their roster, replacing the old shortlists-based workflow.

ALTER TABLE team_rosters
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS notes TEXT;
