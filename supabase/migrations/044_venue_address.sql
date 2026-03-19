-- Migration 044: Venue address and map link fields

ALTER TABLE tournament_venues ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE tournament_venues ADD COLUMN IF NOT EXISTS maps_url TEXT;
