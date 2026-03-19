-- Migration 043: Digital waiver support

-- Waiver text on tournaments
ALTER TABLE off_season_events ADD COLUMN IF NOT EXISTS waiver_text TEXT;

-- Waiver acceptance tracking on registrations
ALTER TABLE tournament_registrations ADD COLUMN IF NOT EXISTS waiver_accepted BOOLEAN DEFAULT false;
ALTER TABLE tournament_registrations ADD COLUMN IF NOT EXISTS waiver_accepted_at TIMESTAMPTZ;
ALTER TABLE tournament_registrations ADD COLUMN IF NOT EXISTS waiver_accepted_by TEXT;
