-- Migration: fix_coaches_table_role_separation
-- Purpose: Separate high school coaches from college recruiters in the coaches table
-- Dependency: None (operates on existing coaches table)

-- Make division nullable (it's a college classification, meaningless for high school coaches)
ALTER TABLE coaches ALTER COLUMN division DROP NOT NULL;

-- Add school_type to classify which kind of user this coaches record belongs to
ALTER TABLE coaches
ADD COLUMN IF NOT EXISTS school_type TEXT
CHECK (school_type IN ('high_school', 'college', 'club'))
DEFAULT 'college';

-- Reclassify existing rows based on the role of the linked profile
UPDATE coaches SET school_type = 'high_school'
WHERE profile_id IN (SELECT id FROM profiles WHERE role = 'coach');

UPDATE coaches SET school_type = 'college'
WHERE profile_id IN (SELECT id FROM profiles WHERE role = 'recruiter');

UPDATE coaches SET school_type = 'club'
WHERE profile_id IN (SELECT id FROM profiles WHERE role = 'club');

-- Null out the fake D1 values on high school coaches
UPDATE coaches SET division = NULL
WHERE school_type = 'high_school';
