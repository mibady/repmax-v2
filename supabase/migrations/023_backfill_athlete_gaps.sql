-- Backfill athlete gaps: repmax_id, zone, and name corrections
-- This migration is idempotent — safe to run multiple times

-- 1. Backfill repmax_id for any athletes that still have NULL
-- Format: REP-{first_initial}{last_initial}-{class_year}
UPDATE athletes a
SET repmax_id = 'REP-' ||
  UPPER(LEFT(SPLIT_PART(p.full_name, ' ', 1), 1)) ||
  UPPER(LEFT(SPLIT_PART(p.full_name, ' ', 2), 1)) ||
  '-' || COALESCE(a.class_year, EXTRACT(YEAR FROM NOW())::int + 1)
FROM profiles p
WHERE a.profile_id = p.id
  AND a.repmax_id IS NULL
  AND p.full_name IS NOT NULL;

-- 2. Handle duplicate repmax_ids by appending row_number suffix
WITH dupes AS (
  SELECT id, repmax_id,
    ROW_NUMBER() OVER (PARTITION BY repmax_id ORDER BY created_at) AS rn
  FROM athletes
  WHERE repmax_id IS NOT NULL
)
UPDATE athletes a
SET repmax_id = d.repmax_id || d.rn
FROM dupes d
WHERE a.id = d.id AND d.rn > 1;

-- 3. Backfill zone from state for athletes with NULL zone but valid state
UPDATE athletes
SET zone = CASE state
  WHEN 'CA' THEN 'West' WHEN 'NV' THEN 'West' WHEN 'OR' THEN 'West'
  WHEN 'WA' THEN 'West' WHEN 'UT' THEN 'West' WHEN 'CO' THEN 'West'
  WHEN 'TX' THEN 'Southwest' WHEN 'OK' THEN 'Southwest' WHEN 'AZ' THEN 'Southwest'
  WHEN 'NM' THEN 'Southwest' WHEN 'LA' THEN 'Southwest'
  WHEN 'OH' THEN 'Midwest' WHEN 'MI' THEN 'Midwest' WHEN 'IL' THEN 'Midwest'
  WHEN 'IN' THEN 'Midwest' WHEN 'WI' THEN 'Midwest' WHEN 'MN' THEN 'Midwest'
  WHEN 'IA' THEN 'Midwest'
  WHEN 'FL' THEN 'Southeast' WHEN 'GA' THEN 'Southeast' WHEN 'AL' THEN 'Southeast'
  WHEN 'SC' THEN 'Southeast' WHEN 'NC' THEN 'Southeast' WHEN 'TN' THEN 'Southeast'
  WHEN 'MS' THEN 'Southeast'
  WHEN 'PA' THEN 'Northeast' WHEN 'MD' THEN 'Northeast' WHEN 'NJ' THEN 'Northeast'
  WHEN 'NY' THEN 'Northeast' WHEN 'VA' THEN 'Northeast' WHEN 'MA' THEN 'Northeast'
  WHEN 'CT' THEN 'Northeast' WHEN 'DE' THEN 'Northeast' WHEN 'DC' THEN 'Northeast'
  WHEN 'WV' THEN 'Northeast' WHEN 'ME' THEN 'Northeast' WHEN 'NH' THEN 'Northeast'
  WHEN 'VT' THEN 'Northeast' WHEN 'RI' THEN 'Northeast'
  WHEN 'NE' THEN 'Plains' WHEN 'KS' THEN 'Plains' WHEN 'MO' THEN 'Plains'
  WHEN 'AR' THEN 'Plains'
  ELSE zone
END
WHERE zone IS NULL
  AND state IS NOT NULL
  AND state != 'TBD';
