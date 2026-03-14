-- Migration 024: Add athlete intake fields
-- Adds contact info, family details, athletic profile, sizing, and academic fields
-- to support the full athlete intake/onboarding form.

ALTER TABLE athletes ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS twitter TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS parent1_name TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS parent1_phone TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS parent1_email TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS parent2_name TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS parent2_phone TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS parent2_email TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS siblings_info TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS jersey_number TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS organization_name TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS core_gpa NUMERIC(4,2);
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS college_priority TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS awards TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS other_sports TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS camps_attended TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS dream_schools TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS cleat_size TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS shirt_size TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS pants_size TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS helmet_size TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS glove_size TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS academic_interest TEXT;
