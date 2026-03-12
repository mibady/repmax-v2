-- Migration 019: Player Card Data Expansion
-- Adds new athletic metrics, coach contact, text sections, and documents table

-- New columns on athletes table (all nullable)
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS ten_yard_split DECIMAL(4,2);
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS five_ten_five DECIMAL(4,2);
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS broad_jump_inches INTEGER;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS wingspan_inches INTEGER;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS bench_press_lbs INTEGER;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS squat_lbs INTEGER;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS weighted_gpa DECIMAL(4,2);
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS coach_notes TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS player_summary TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS coach_phone TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS coach_email TEXT;

-- Documents table for transcripts, recommendation letters, etc.
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('transcript', 'recommendation', 'other')),
  file_url TEXT NOT NULL,
  filename TEXT,
  verified BOOLEAN DEFAULT false,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Public can read documents (card page needs counts)
CREATE POLICY "documents_public_select" ON documents
  FOR SELECT USING (true);

-- Authenticated users can insert their own documents
CREATE POLICY "documents_insert_own" ON documents
  FOR INSERT WITH CHECK (
    athlete_id IN (
      SELECT a.id FROM athletes a
      JOIN profiles p ON a.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Authenticated users can delete their own documents
CREATE POLICY "documents_delete_own" ON documents
  FOR DELETE USING (
    athlete_id IN (
      SELECT a.id FROM athletes a
      JOIN profiles p ON a.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Index for fast lookups by athlete
CREATE INDEX IF NOT EXISTS idx_documents_athlete_id ON documents(athlete_id);
