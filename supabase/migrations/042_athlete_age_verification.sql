-- Migration 042: Age verification fields

-- Add date_of_birth to athletes table
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add date_of_birth to tournament_rosters for roster-level tracking
ALTER TABLE tournament_rosters ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add age restriction fields to tournaments
ALTER TABLE off_season_events ADD COLUMN IF NOT EXISTS age_cutoff_date DATE;
ALTER TABLE off_season_events ADD COLUMN IF NOT EXISTS max_age_years INT;
