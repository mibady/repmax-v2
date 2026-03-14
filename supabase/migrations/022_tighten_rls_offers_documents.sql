-- Migration 022: Tighten RLS on offers and documents tables
-- Previously both had USING (true) SELECT policies allowing anonymous reads.
-- Offers: restrict to authenticated users (coaches, recruiters, athletes all need access)
-- Documents: restrict to owning athlete only

-- ============================================================
-- OFFERS: Replace public SELECT with authenticated-only SELECT
-- ============================================================
DROP POLICY IF EXISTS "Offers are viewable by everyone" ON offers;

CREATE POLICY "Offers viewable by authenticated users" ON offers
  FOR SELECT TO authenticated
  USING (true);

-- ============================================================
-- DOCUMENTS: Replace public SELECT with owner-only SELECT
-- ============================================================
DROP POLICY IF EXISTS "documents_public_select" ON documents;

CREATE POLICY "documents_select_own" ON documents
  FOR SELECT USING (
    athlete_id IN (
      SELECT a.id FROM athletes a
      JOIN profiles p ON p.id = a.profile_id
      WHERE p.user_id = auth.uid()
    )
  );
