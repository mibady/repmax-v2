-- Migration 041: Add schedule_published flag to tournaments
ALTER TABLE off_season_events ADD COLUMN IF NOT EXISTS schedule_published BOOLEAN DEFAULT false;
