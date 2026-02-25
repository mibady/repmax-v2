-- ---------------------------------------------------------------------------
-- RepMax Staging Masking Script
-- ---------------------------------------------------------------------------
-- Run immediately after restoring production data into staging.
-- Scrubs personally identifiable information while preserving relational
-- integrity for UX testing.
-- ---------------------------------------------------------------------------

-- 1. Obfuscate profile emails (except internal staff/admin accounts).
UPDATE profiles
SET email = CONCAT('staging+', encode(digest(id::text, 'sha256'), 'hex') , '@repmax.io')
WHERE role NOT IN ('admin');

-- 2. Clear phone numbers / addresses from onboarding profiles.
UPDATE onboarding_profiles
SET phone = NULL,
    address_line1 = NULL,
    address_line2 = NULL,
    guardian_name = NULL,
    guardian_phone = NULL;

-- 3. Remove message bodies for parent/athlete chat (keep metadata for counts).
UPDATE messages
SET body = '[redacted for staging]'
WHERE sender_id IN (SELECT id FROM profiles WHERE role IN ('athlete', 'parent'))
   OR recipient_id IN (SELECT id FROM profiles WHERE role IN ('athlete', 'parent'));

-- 4. Blank sensitive text fields on athletes while leaving measurable data.
UPDATE athletes
SET email = NULL,
    phone = NULL,
    address = NULL;

-- 5. Ensure parent_links exist but without real emails (handled via profiles table).
-- (No-op; profiles table masking already covers this.)

-- 6. Audit trail entry.
INSERT INTO audit_logs (event, metadata, created_at)
VALUES (
  'staging_masking',
  jsonb_build_object('source', 'scripts/sync-staging-from-prod.sh'),
  now()
)
ON CONFLICT DO NOTHING;
