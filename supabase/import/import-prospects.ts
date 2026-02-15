/**
 * RepMax JotForm Prospect Import Script
 *
 * Reads from import_prospects_staging table and migrates to production tables:
 *   auth.users → profiles → athletes
 *
 * Prerequisites:
 *   1. Run repmax_jotform_import.sql in Supabase SQL Editor first
 *      (creates staging table + inserts 203 prospect records)
 *   2. Set env vars: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) + SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   npx tsx supabase/import/import-prospects.ts              # Process all
 *   npx tsx supabase/import/import-prospects.ts --verify      # Verify only (no migration)
 *   npx tsx supabase/import/import-prospects.ts --dry-run     # Show what would happen
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================
// CONFIG
// ============================================================

const DEFAULT_PASSWORD = 'RepMax2026!Import';
const BATCH_SIZE = 20; // Process in batches to avoid rate limits

// ============================================================
// SUPABASE CLIENT
// ============================================================

function getSupabaseClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing env vars. Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ============================================================
// HEIGHT PARSER: "5'10" → 70 inches
// ============================================================

function parseHeight(raw: string | null): number | null {
  if (!raw) return null;

  // Remove extra whitespace
  const h = raw.trim();

  // Pattern: 6'2, 5'10, 6'1 3/4, 6''2, 5''11
  const ftInMatch = h.match(/(\d+)[''′`]+\s*(\d+)?/);
  if (ftInMatch) {
    const feet = parseInt(ftInMatch[1]);
    const inches = ftInMatch[2] ? parseInt(ftInMatch[2]) : 0;
    const total = feet * 12 + inches;
    if (total >= 48 && total <= 96) return total;
    return null;
  }

  // Pattern: 6ft 2in, 6ft2, 6ft
  const ftInWordMatch = h.match(/(\d+)\s*ft\s*(\d+)?/i);
  if (ftInWordMatch) {
    const feet = parseInt(ftInWordMatch[1]);
    const inches = ftInWordMatch[2] ? parseInt(ftInWordMatch[2]) : 0;
    const total = feet * 12 + inches;
    if (total >= 48 && total <= 96) return total;
    return null;
  }

  // Pattern: 5,10 or 5,8 (comma separator)
  const commaMatch = h.match(/^(\d+)[,.](\d{1,2})$/);
  if (commaMatch) {
    const feet = parseInt(commaMatch[1]);
    const inches = parseInt(commaMatch[2]);
    if (feet >= 4 && feet <= 7 && inches <= 11) {
      return feet * 12 + inches;
    }
  }

  // Pattern: 6"3 (double quote for feet)
  const dblQuoteMatch = h.match(/(\d+)"(\d+)/);
  if (dblQuoteMatch) {
    const feet = parseInt(dblQuoteMatch[1]);
    const inches = parseInt(dblQuoteMatch[2]);
    const total = feet * 12 + inches;
    if (total >= 48 && total <= 96) return total;
  }

  // Pattern: "58" or "511" (bare digits like 5-8 or 5-11)
  if (/^\d{2,3}$/.test(h)) {
    const num = parseInt(h);
    // If it's already in inches range (like 58, 70, etc.)
    if (num >= 48 && num <= 96) return num;
    // Could be feet+inches concatenated (e.g. "58" = 5'8" = 68)
    if (num >= 48 && num <= 76) {
      const feet = Math.floor(num / 10);
      const inches = num % 10;
      if (feet >= 4 && feet <= 7) return feet * 12 + inches;
    }
  }

  // Pattern: 5-8, 6-2 (dash separator)
  const dashMatch = h.match(/^(\d+)-(\d{1,2})$/);
  if (dashMatch) {
    const feet = parseInt(dashMatch[1]);
    const inches = parseInt(dashMatch[2]);
    if (feet >= 4 && feet <= 7 && inches <= 11) {
      return feet * 12 + inches;
    }
  }

  // Pattern: "5 8", "6 0" (space separator)
  const spaceMatch = h.match(/^(\d+)\s+(\d{1,2})$/);
  if (spaceMatch) {
    const feet = parseInt(spaceMatch[1]);
    const inches = parseInt(spaceMatch[2]);
    if (feet >= 4 && feet <= 7 && inches <= 11) {
      return feet * 12 + inches;
    }
  }

  return null;
}

// ============================================================
// POSITION PARSER: "Rb, Cb, Slot Wr" → primary + secondary
// ============================================================

function parsePositions(raw: string | null): { primary: string; secondary: string | null } {
  if (!raw) return { primary: 'ATH', secondary: null };

  // Split on common separators: comma, slash, space
  const parts = raw
    .split(/[,\/]+/)
    .map((p) => p.trim().toUpperCase())
    .filter((p) => p.length > 0 && p.length <= 20);

  if (parts.length === 0) return { primary: 'ATH', secondary: null };

  return {
    primary: parts[0],
    secondary: parts.length > 1 ? parts[1] : null,
  };
}

// ============================================================
// DATA CLEANERS
// ============================================================

function cleanGpa(raw: number | null): number | null {
  if (raw === null || raw === undefined) return null;
  // GPA check range: 0.0 to 4.0 (schema constraint)
  if (raw >= 0.0 && raw <= 4.5) return Math.min(raw, 4.0);
  // Some entries have 17.0, 38.0, 67.0 - clearly not GPA
  return null;
}

function cleanFortyYard(raw: number | null): number | null {
  if (raw === null || raw === undefined) return null;
  // Valid 40 range: 4.0 to 7.0
  if (raw >= 4.0 && raw <= 7.0) return raw;
  return null;
}

function cleanVertical(raw: number | null): number | null {
  if (raw === null || raw === undefined) return null;
  // Valid vertical range: 12 to 50 inches
  const v = Math.round(raw);
  if (v >= 12 && v <= 50) return v;
  return null;
}

function cleanWeight(raw: number | null): number | null {
  if (raw === null || raw === undefined) return null;
  // Valid weight range: 100 to 400 lbs (schema constraint)
  if (raw >= 100 && raw <= 400) return raw;
  return null;
}

function mapZone(_state: string | null): string {
  // All prospects are from CA → West zone
  return 'West';
}

// ============================================================
// VERIFY STAGING DATA
// ============================================================

async function verifyStaging(supabase: SupabaseClient): Promise<void> {
  console.log('\n=== STAGING DATA VERIFICATION ===\n');

  // Total count
  const { count: total } = await supabase
    .from('import_prospects_staging')
    .select('*', { count: 'exact', head: true });
  console.log(`Total records: ${total}`);

  // By client
  const { data: clients } = await supabase.rpc('exec_sql', {
    sql: `SELECT client, COUNT(*) as cnt FROM import_prospects_staging GROUP BY client ORDER BY client`,
  });
  // Fallback: just query and count in JS
  const { data: allRecords } = await supabase
    .from('import_prospects_staging')
    .select('client, school_key, class_year, email, forty_yard, gpa, hudl_link, headshot_url, phone');

  if (allRecords) {
    // By client
    const clientCounts = new Map<string, number>();
    const schoolCounts = new Map<string, number>();
    const classCounts = new Map<number, number>();
    let hasEmail = 0,
      hasPhone = 0,
      hasGpa = 0,
      hasForty = 0,
      hasHudl = 0,
      hasPhoto = 0;

    for (const r of allRecords) {
      clientCounts.set(r.client, (clientCounts.get(r.client) || 0) + 1);
      schoolCounts.set(r.school_key, (schoolCounts.get(r.school_key) || 0) + 1);
      if (r.class_year) classCounts.set(r.class_year, (classCounts.get(r.class_year) || 0) + 1);
      if (r.email) hasEmail++;
      if (r.phone) hasPhone++;
      if (r.gpa) hasGpa++;
      if (r.forty_yard) hasForty++;
      if (r.hudl_link) hasHudl++;
      if (r.headshot_url) hasPhoto++;
    }

    console.log('\nBy Client:');
    for (const [client, count] of clientCounts) {
      console.log(`  ${client}: ${count}`);
    }

    console.log('\nBy School:');
    for (const [school, count] of [...schoolCounts.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${school}: ${count}`);
    }

    console.log('\nBy Class Year:');
    for (const [year, count] of [...classCounts.entries()].sort()) {
      console.log(`  ${year}: ${count}`);
    }

    console.log('\nData Coverage:');
    console.log(`  Email:    ${hasEmail}/${allRecords.length} (${((hasEmail / allRecords.length) * 100).toFixed(0)}%)`);
    console.log(`  Phone:    ${hasPhone}/${allRecords.length} (${((hasPhone / allRecords.length) * 100).toFixed(0)}%)`);
    console.log(`  GPA:      ${hasGpa}/${allRecords.length} (${((hasGpa / allRecords.length) * 100).toFixed(0)}%)`);
    console.log(`  40-yard:  ${hasForty}/${allRecords.length} (${((hasForty / allRecords.length) * 100).toFixed(0)}%)`);
    console.log(`  Hudl:     ${hasHudl}/${allRecords.length} (${((hasHudl / allRecords.length) * 100).toFixed(0)}%)`);
    console.log(`  Photo:    ${hasPhoto}/${allRecords.length} (${((hasPhoto / allRecords.length) * 100).toFixed(0)}%)`);
  }

  // Duplicate emails
  const { data: dupes } = await supabase
    .from('import_prospects_staging')
    .select('email');

  if (dupes) {
    const emailCounts = new Map<string, number>();
    for (const d of dupes) {
      if (d.email) emailCounts.set(d.email, (emailCounts.get(d.email) || 0) + 1);
    }
    const duplicates = [...emailCounts.entries()].filter(([, c]) => c > 1);
    if (duplicates.length > 0) {
      console.log(`\nDuplicate emails (${duplicates.length}):`);
      for (const [email, count] of duplicates) {
        console.log(`  ${email}: ${count} entries`);
      }
    } else {
      console.log('\nNo duplicate emails found');
    }
  }

  // Processed status
  const { count: processed } = await supabase
    .from('import_prospects_staging')
    .select('*', { count: 'exact', head: true })
    .eq('processed', true);
  console.log(`\nAlready processed: ${processed || 0} / ${total}`);
}

// ============================================================
// PROCESS IMPORT: staging → auth.users → profiles → athletes
// ============================================================

interface ImportResult {
  total: number;
  created: number;
  skipped: number;
  errors: string[];
  duration: number;
}

async function processImport(supabase: SupabaseClient, dryRun: boolean): Promise<ImportResult> {
  const startTime = Date.now();
  const result: ImportResult = { total: 0, created: 0, skipped: 0, errors: [], duration: 0 };

  console.log(`\n=== ${dryRun ? 'DRY RUN' : 'PROCESSING'} IMPORT ===\n`);

  // Fetch unprocessed records
  const { data: prospects, error: fetchError } = await supabase
    .from('import_prospects_staging')
    .select('*')
    .eq('processed', false)
    .order('school_key')
    .order('class_year');

  if (fetchError) {
    throw new Error(`Failed to fetch staging data: ${fetchError.message}`);
  }

  if (!prospects || prospects.length === 0) {
    console.log('No unprocessed records found.');
    return result;
  }

  result.total = prospects.length;
  console.log(`Found ${prospects.length} unprocessed prospects\n`);

  // Deduplicate by email (keep first occurrence)
  const seenEmails = new Set<string>();
  const uniqueProspects = [];

  for (const p of prospects) {
    const email = p.email?.toLowerCase().trim();
    if (email && seenEmails.has(email)) {
      result.skipped++;
      if (!dryRun) {
        // Mark duplicate as processed
        await supabase
          .from('import_prospects_staging')
          .update({ processed: true })
          .eq('id', p.id);
      }
      console.log(`  SKIP (duplicate): ${p.full_name} <${p.email}>`);
      continue;
    }
    if (email) seenEmails.add(email);
    uniqueProspects.push(p);
  }

  console.log(`\nUnique prospects to process: ${uniqueProspects.length}\n`);

  // Process in batches
  for (let i = 0; i < uniqueProspects.length; i += BATCH_SIZE) {
    const batch = uniqueProspects.slice(i, i + BATCH_SIZE);
    console.log(`--- Batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} records) ---`);

    for (const prospect of batch) {
      try {
        // Generate a clean email for auth (some have typos like .con, .clm)
        const authEmail =
          prospect.email && prospect.email.includes('@')
            ? prospect.email.trim()
            : `${prospect.repmax_id.toLowerCase()}@import.repmax.io`;

        const heightInches = parseHeight(prospect.height);
        const weight = cleanWeight(prospect.weight);
        const positions = parsePositions(prospect.positions);
        const gpa = cleanGpa(prospect.gpa);
        const fortyYard = cleanFortyYard(prospect.forty_yard);
        const vertical = cleanVertical(prospect.vertical);
        const zone = mapZone(prospect.school_state);

        if (dryRun) {
          console.log(
            `  [DRY] ${prospect.full_name} | ${positions.primary} | Class ${prospect.class_year || '?'} | ${prospect.school_official_name} | ${heightInches || '?'}" | ${weight || '?'}lbs | GPA ${gpa || '?'}`
          );
          result.created++;
          continue;
        }

        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: authEmail,
          password: DEFAULT_PASSWORD,
          email_confirm: true,
          user_metadata: {
            full_name: prospect.full_name,
            import_source: 'jotform',
            repmax_id: prospect.repmax_id,
          },
        });

        if (authError) {
          // If user exists, try to find them
          if (authError.message.includes('already been registered')) {
            console.log(`  SKIP (exists): ${prospect.full_name} <${authEmail}>`);
            await supabase
              .from('import_prospects_staging')
              .update({ processed: true })
              .eq('id', prospect.id);
            result.skipped++;
            continue;
          }
          throw new Error(`Auth: ${authError.message}`);
        }

        const userId = authData.user.id;

        // 2. Create profile
        const { error: profileError } = await supabase.from('profiles').insert({
          user_id: userId,
          role: 'athlete',
          full_name: prospect.full_name,
          avatar_url: prospect.headshot_url,
        });

        if (profileError) {
          throw new Error(`Profile: ${profileError.message}`);
        }

        // Get the profile ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (!profile) throw new Error('Profile not found after insert');

        // 3. Create athlete record
        const { error: athleteError } = await supabase.from('athletes').insert({
          profile_id: profile.id,
          high_school: prospect.school_official_name || 'Unknown',
          city: prospect.school_city || 'Unknown',
          state: prospect.school_state || 'CA',
          zone: zone as any,
          class_year: prospect.class_year || 2027, // Default if missing
          primary_position: positions.primary,
          secondary_position: positions.secondary,
          height_inches: heightInches,
          weight_lbs: weight,
          forty_yard_time: fortyYard,
          vertical_inches: vertical,
          gpa: gpa,
          ncaa_id: prospect.ncaa_id && prospect.ncaa_id.length < 20 ? prospect.ncaa_id : null,
          verified: false,
        });

        if (athleteError) {
          throw new Error(`Athlete: ${athleteError.message}`);
        }

        // 4. Create highlight if Hudl link exists
        if (prospect.hudl_link && prospect.hudl_link.startsWith('http')) {
          const { data: athlete } = await supabase
            .from('athletes')
            .select('id')
            .eq('profile_id', profile.id)
            .single();

          if (athlete) {
            await supabase.from('highlights').insert({
              athlete_id: athlete.id,
              title: 'Hudl Highlights',
              video_url: prospect.hudl_link,
            });
          }
        }

        // 5. Mark as processed
        await supabase
          .from('import_prospects_staging')
          .update({ processed: true })
          .eq('id', prospect.id);

        result.created++;
        console.log(`  OK: ${prospect.full_name} (${positions.primary}, Class ${prospect.class_year || '?'})`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        result.errors.push(`${prospect.full_name}: ${msg}`);
        console.log(`  ERR: ${prospect.full_name}: ${msg}`);
      }
    }

    // Brief pause between batches to avoid rate limits
    if (i + BATCH_SIZE < uniqueProspects.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  result.duration = Date.now() - startTime;
  return result;
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  const args = process.argv.slice(2);
  const verifyOnly = args.includes('--verify');
  const dryRun = args.includes('--dry-run');

  console.log('='.repeat(60));
  console.log('REPMAX v2 — JOTFORM PROSPECT IMPORT');
  console.log('='.repeat(60));

  const supabase = getSupabaseClient();

  // Always verify first
  await verifyStaging(supabase);

  if (verifyOnly) {
    console.log('\n--verify flag set. Stopping after verification.');
    return;
  }

  // Process import
  const result = await processImport(supabase, dryRun);

  console.log('\n' + '='.repeat(60));
  console.log('IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total staging records: ${result.total}`);
  console.log(`Created:               ${result.created}`);
  console.log(`Skipped (duplicates):  ${result.skipped}`);
  console.log(`Errors:                ${result.errors.length}`);
  console.log(`Duration:              ${(result.duration / 1000).toFixed(1)}s`);

  if (result.errors.length > 0) {
    console.log('\nErrors:');
    for (const err of result.errors) {
      console.log(`  - ${err}`);
    }
  }

  // Post-import verification
  if (!dryRun && result.created > 0) {
    console.log('\n--- Post-Import Counts ---');
    const { count: profileCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'athlete');
    const { count: athleteCount } = await supabase
      .from('athletes')
      .select('*', { count: 'exact', head: true });
    console.log(`Athlete profiles: ${profileCount}`);
    console.log(`Athlete records:  ${athleteCount}`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
