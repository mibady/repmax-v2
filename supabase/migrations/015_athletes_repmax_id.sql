-- Add repmax_id column to athletes table for human-readable public card URLs
-- Format: REP-XX-YYYY (e.g. REP-JW-2026)

ALTER TABLE athletes
  ADD COLUMN IF NOT EXISTS repmax_id TEXT UNIQUE;

-- Index for fast card page lookups by repmax_id
CREATE INDEX IF NOT EXISTS idx_athletes_repmax_id ON athletes(repmax_id) WHERE repmax_id IS NOT NULL;
