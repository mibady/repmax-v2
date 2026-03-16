/**
 * Seed Data Loader
 *
 * TypeScript utility to load/clean test users and related data for RepMax v2.
 * Based on USER_TESTING_GUIDE.md - 22 test users with comprehensive seed data.
 *
 * Usage:
 *   npx tsx test/seed/seed-loader.ts seed              # Create all test data
 *   npx tsx test/seed/seed-loader.ts clean             # Remove all test data
 *   npx tsx test/seed/seed-loader.ts reset             # Clean and re-seed
 *   npx tsx test/seed/seed-loader.ts seed:users        # Users only
 *   npx tsx test/seed/seed-loader.ts seed:highlights   # Highlights only
 *   npx tsx test/seed/seed-loader.ts seed:coach        # Coach tasks only
 *   npx tsx test/seed/seed-loader.ts seed:relationships# Link recruiters to real athletes
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  testUserData,
  TestUserData,
  highlightData,
  coachTasks,
} from './data/users';

// ============================================
// TYPES
// ============================================

interface SeedResult {
  success: boolean;
  created: string[];
  errors: string[];
  duration: number;
}

interface CleanResult {
  success: boolean;
  deleted: string[];
  errors: string[];
  duration: number;
}

// Zone mapping: UI codes (UPPERCASE) → DB enum values (Title Case)
function toDbZone(uiZone: string | undefined): string | null {
  if (!uiZone) return null;
  const map: Record<string, string> = {
    'WEST': 'West',
    'SOUTHWEST': 'Southwest',
    'MIDWEST': 'Midwest',
    'SOUTHEAST': 'Southeast',
    'NORTHEAST': 'Northeast',
    'MID-ATLANTIC': 'Mid-Atlantic',
  };
  return map[uiZone.toUpperCase()] || null;
}

/** Parse height string like "6'2\"" to total inches (74) */
function parseHeightToInches(height: string | number | undefined): number | null {
  if (height === undefined || height === null) return null;
  if (typeof height === 'number') return height;
  const match = height.match(/(\d+)'(\d+)/);
  if (!match) return null;
  return parseInt(match[1]) * 12 + parseInt(match[2]);
}

// User ID mapping (email -> auth user UUID)
const userIdMap: Map<string, string> = new Map();

// Entity ID maps (email -> table-specific UUID)
const athleteIdMap: Map<string, string> = new Map();
const coachIdMap: Map<string, string> = new Map();
const profileIdMap: Map<string, string> = new Map();

// ============================================
// SUPABASE CLIENT
// ============================================

function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ============================================
// USER SEEDING
// ============================================

async function seedUser(supabase: SupabaseClient, userData: TestUserData): Promise<string> {
  console.log(`  Creating user: ${userData.email}`);

  // 1. Create auth user (or find existing)
  let userId: string;

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    email_confirm: true,
    user_metadata: {
      full_name: userData.fullName,
      roles: userData.roles,
      active_role: userData.activeRole,
    },
  });

  if (authError) {
    // If user already exists, look up their ID and continue to ensure profile/role records exist
    if (authError.message.includes('already been registered')) {
      const existingId = userIdMap.get(userData.email);
      if (existingId) {
        userId = existingId;
        console.log(`  ↻ Auth exists, ensuring profile/role records for ${userData.email}`);
      } else {
        throw new Error(`Auth user exists but not found in userIdMap: ${userData.email}`);
      }
    } else {
      throw new Error(`Failed to create auth user ${userData.email}: ${authError.message}`);
    }
  } else {
    userId = authData.user.id;
  }

  userIdMap.set(userData.email, userId);

  // 2. Create profile (skip if already exists) — capture real profile ID
  let profileId: string;

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existingProfile) {
    profileId = existingProfile.id;
  } else {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      user_id: userId,
      role: userData.activeRole,
      full_name: userData.fullName,
    });

    if (profileError) {
      throw new Error(`Failed to create profile for ${userData.email}: ${profileError.message}`);
    }
    profileId = userId;
  }

  // Store real profile ID for entity map lookups
  profileIdMap.set(userData.email, profileId);

  // 3. Create role-specific profiles (skip if already exists)
  if (userData.athleteProfile) {
    const { data: existingAthlete } = await supabase
      .from('athletes').select('id').eq('profile_id', profileId).single();

    if (!existingAthlete) {
      const { error } = await supabase.from('athletes').insert({
        profile_id: profileId,
        repmax_id: userData.repmaxId || null,
        primary_position: userData.athleteProfile.position,
        class_year: userData.athleteProfile.classYear,
        high_school: userData.athleteProfile.school,
        city: userData.city,
        state: userData.state,
        zone: toDbZone(userData.zone) as any,
        height_inches: parseHeightToInches(userData.athleteProfile.height),
        weight_lbs: userData.athleteProfile.weight,
        forty_yard_time: userData.athleteProfile.fortyYard,
        vertical_inches: userData.athleteProfile.vertical,
        gpa: userData.athleteProfile.gpa,
        sat_score: userData.athleteProfile.sat,
        act_score: userData.athleteProfile.act,
        bench_press_lbs: userData.athleteProfile.bench,
        squat_lbs: userData.athleteProfile.squat,
        wingspan_inches: userData.athleteProfile.wingspan,
        ten_yard_split: userData.athleteProfile.tenYardSplit,
        five_ten_five: userData.athleteProfile.fiveTenFive,
        broad_jump_inches: userData.athleteProfile.broadJump,
        weighted_gpa: userData.athleteProfile.weightedGpa,
        bio: userData.athleteProfile.bio,
        coach_notes: userData.athleteProfile.coachNotes,
        player_summary: userData.athleteProfile.playerSummary,
        coach_phone: userData.athleteProfile.coachPhone,
        coach_email: userData.athleteProfile.coachEmail,
        verified: userData.athleteProfile.verified,
      });

      if (error) {
        console.warn(`  Warning: athletes insert failed: ${error.message}`);
      }
    }
  }

  if (userData.recruiterProfile) {
    const { data: existingCoach } = await supabase
      .from('coaches').select('id').eq('profile_id', profileId).single();

    if (!existingCoach) {
      const { error } = await supabase.from('coaches').insert({
        profile_id: profileId,
        school_name: userData.recruiterProfile.school,
        division: 'D1',
        conference: userData.recruiterProfile.conference,
        title: userData.recruiterProfile.title,
      });

      if (error) {
        console.warn(`  Warning: coaches insert failed: ${error.message}`);
      }
    }
  }

  if (userData.coachProfile) {
    const { data: existingCoach } = await supabase
      .from('coaches').select('id').eq('profile_id', profileId).single();

    if (!existingCoach) {
      const { error } = await supabase.from('coaches').insert({
        profile_id: profileId,
        school_name: userData.coachProfile.school,
        division: 'D1',
        title: 'Head Coach',
      });

      if (error) {
        console.warn(`  Warning: coaches insert failed: ${error.message}`);
      }
    }
  }

  return userId;
}

export async function seedTestUsers(): Promise<SeedResult> {
  const startTime = Date.now();
  const created: string[] = [];
  const errors: string[] = [];

  console.log('Starting user seed process...\n');

  const supabase = getSupabaseClient();

  // Pre-populate userIdMap so existing users can be found during upsert
  await buildUserIdMap(supabase);

  for (const userData of testUserData) {
    try {
      await seedUser(supabase, userData);
      created.push(userData.email);
      console.log(`  ✓ Created ${userData.email}\n`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${userData.email}: ${message}`);
      console.log(`  ✗ Failed ${userData.email}: ${message}\n`);
    }
  }

  const duration = Date.now() - startTime;

  console.log('\n--- User Seed Summary ---');
  console.log(`Created: ${created.length} users`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Duration: ${duration}ms`);

  return { success: errors.length === 0, created, errors, duration };
}

// ============================================
// ENTITY MAP BUILDER
// ============================================

async function buildEntityMaps(supabase: SupabaseClient): Promise<void> {
  console.log('Building entity ID maps...');

  // Build userIdMap from auth if not already populated
  if (userIdMap.size === 0) {
    await buildUserIdMap(supabase);
  }

  // Resolve real profile IDs (profiles.id may differ from auth user_id)
  for (const [email, userId] of userIdMap) {
    if (!profileIdMap.has(email)) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (profile) {
        profileIdMap.set(email, profile.id);
      }
    }
  }

  // Build athleteIdMap: email -> athletes.id (using real profile_id)
  for (const [email, profId] of profileIdMap) {
    if (athleteIdMap.has(email)) continue;
    const { data: athlete } = await supabase
      .from('athletes')
      .select('id')
      .eq('profile_id', profId)
      .single();

    if (athlete) {
      athleteIdMap.set(email, athlete.id);
    }
  }

  // Build coachIdMap: email -> coaches.id (using real profile_id)
  for (const [email, profId] of profileIdMap) {
    if (coachIdMap.has(email)) continue;
    const { data: coach } = await supabase
      .from('coaches')
      .select('id')
      .eq('profile_id', profId)
      .single();

    if (coach) {
      coachIdMap.set(email, coach.id);
    }
  }

  console.log(`  Athletes: ${athleteIdMap.size}, Coaches: ${coachIdMap.size}, Profiles: ${profileIdMap.size}\n`);
}

// ============================================
// HIGHLIGHT SEEDING
// ============================================

export async function seedHighlights(): Promise<SeedResult> {
  const startTime = Date.now();
  const created: string[] = [];
  const errors: string[] = [];

  console.log('\nSeeding highlights...\n');

  const supabase = getSupabaseClient();

  // Build entity maps if not populated
  if (athleteIdMap.size === 0) {
    await buildEntityMaps(supabase);
  }

  for (const highlight of highlightData) {
    try {
      const athleteId = athleteIdMap.get(highlight.athleteEmail);
      if (!athleteId) {
        throw new Error(`Athlete not found: ${highlight.athleteEmail}`);
      }

      const { error } = await supabase.from('highlights').insert({
        athlete_id: athleteId,
        title: highlight.title,
        description: highlight.description || null,
        video_url: highlight.videoUrl,
        thumbnail_url: highlight.thumbnailUrl || null,
        duration_seconds: highlight.durationSeconds || null,
        view_count: highlight.viewCount || 0,
        created_at: highlight.createdAt || new Date().toISOString(),
      });

      if (error) {
        throw new Error(error.message);
      }

      created.push(`${highlight.title} (${highlight.athleteEmail})`);
      console.log(`  ✓ Created highlight: ${highlight.title}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${highlight.title}: ${message}`);
      console.log(`  ✗ Failed highlight ${highlight.title}: ${message}`);
    }
  }

  const duration = Date.now() - startTime;

  console.log('\n--- Highlight Seed Summary ---');
  console.log(`Created: ${created.length} highlights`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Duration: ${duration}ms`);

  return { success: errors.length === 0, created, errors, duration };
}

// ============================================
// COACH TASKS SEEDING
// ============================================

export async function seedCoachTasks(): Promise<SeedResult> {
  const startTime = Date.now();
  const created: string[] = [];
  const errors: string[] = [];

  console.log('\nSeeding coach tasks...\n');

  const supabase = getSupabaseClient();

  if (coachIdMap.size === 0 || athleteIdMap.size === 0) {
    await buildEntityMaps(supabase);
  }

  for (const task of coachTasks) {
    try {
      const coachId = coachIdMap.get(task.coachEmail);
      if (!coachId) {
        throw new Error(`Coach not found: ${task.coachEmail}`);
      }

      const athleteId = task.athleteEmail ? athleteIdMap.get(task.athleteEmail) : null;

      const { error } = await supabase.from('coach_tasks').insert({
        coach_id: coachId,
        athlete_id: athleteId || null,
        title: task.title,
        description: task.description,
        due_date: task.dueDate,
        priority: task.priority,
        status: task.status,
      });

      if (error) {
        throw new Error(error.message);
      }

      created.push(`Task: ${task.title}`);
      console.log(`  ✓ ${task.title}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`Task ${task.title}: ${message}`);
      console.log(`  ✗ ${task.title}: ${message}`);
    }
  }

  const duration = Date.now() - startTime;

  console.log('\n--- Coach Tasks Seed Summary ---');
  console.log(`Created: ${created.length} tasks`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Duration: ${duration}ms`);

  return { success: errors.length === 0, created, errors, duration };
}

// ============================================
// FIX SHORTLIST TRIGGER (c.organization → c.school_name)
// Migration 002 references c.organization which doesn't exist on coaches table.
// Patch the trigger function at runtime using service role before inserting shortlists.
// ============================================

async function fixShortlistTrigger(supabase: SupabaseClient): Promise<void> {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE OR REPLACE FUNCTION notify_shortlist_add()
      RETURNS TRIGGER AS $$
      DECLARE
        coach_name TEXT;
        coach_org TEXT;
        athlete_profile_id UUID;
      BEGIN
        -- Get coach info (fixed: use school_name instead of organization)
        SELECT p.full_name, c.school_name INTO coach_name, coach_org
        FROM coaches c
        JOIN profiles p ON c.profile_id = p.id
        WHERE c.id = NEW.coach_id;

        -- Get athlete's profile_id
        SELECT a.profile_id INTO athlete_profile_id
        FROM athletes a
        WHERE a.id = NEW.athlete_id;

        -- Create notification for the athlete
        IF athlete_profile_id IS NOT NULL THEN
          INSERT INTO notifications (user_id, type, title, description, metadata)
          VALUES (
            athlete_profile_id,
            'shortlist',
            'Added to shortlist by ' || COALESCE(coach_org, coach_name),
            COALESCE(coach_name, 'A recruiter') || ' has added you to their prospect list',
            jsonb_build_object(
              'shortlist_id', NEW.id,
              'coach_id', NEW.coach_id,
              'priority', NEW.priority
            )
          );
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  });

  if (error) {
    // If exec_sql RPC doesn't exist, try raw SQL via postgrest
    console.log('  ⚠ Could not patch shortlist trigger via RPC (non-fatal):', error.message);
    console.log('  ⚠ Shortlist inserts may fail if notify_shortlist_add trigger references c.organization');
  } else {
    console.log('  ✓ Patched notify_shortlist_add trigger (c.organization → c.school_name)');
  }
}

// ============================================
// TEST DATA (Shortlists + Profile Views)
// ============================================

export async function seedTestData(): Promise<void> {
  console.log('\nSeeding test data (shortlists + profile views)...\n');

  const supabase = getSupabaseClient();

  if (athleteIdMap.size === 0 || coachIdMap.size === 0 || profileIdMap.size === 0) {
    await buildEntityMaps(supabase);
  }

  // Fix the shortlist trigger before inserting (migration 002 has c.organization bug)
  await fixShortlistTrigger(supabase);

  const athletes = testUserData.filter((u) => u.roles.includes('athlete'));
  const recruiters = testUserData.filter((u) => u.roles.includes('recruiter'));

  // Seed profile views for athletes (correct schema)
  for (const athlete of athletes.slice(0, 5)) {
    const athleteId = athleteIdMap.get(athlete.email);
    if (!athleteId) continue;

    const views = [];
    const sources = ['search', 'shortlist', 'direct'] as const;

    for (let i = 0; i < 10; i++) {
      const recruiter = recruiters[i % recruiters.length];
      const viewerId = profileIdMap.get(recruiter.email);
      if (!viewerId) continue;

      views.push({
        athlete_id: athleteId,
        viewer_id: viewerId,
        viewer_role: 'recruiter',
        viewer_zone: toDbZone(recruiter.zone) || 'Southwest',
        viewer_school: recruiter.recruiterProfile?.school || null,
        source: (['search', 'shortlist', 'direct', 'search'] as const)[i % 4],
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    const { error } = await supabase.from('profile_views').insert(views);
    if (!error) {
      console.log(`  ✓ Created ${views.length} profile views for ${athlete.email}`);
    } else {
      console.log(`  ✗ profile_views for ${athlete.email}: ${error.message}`);
    }
  }

  // Seed shortlists for recruiters (flat table: one row per coach-athlete pair)
  for (const recruiter of recruiters) {
    const coachId = coachIdMap.get(recruiter.email);
    if (!coachId) continue;

    const priorities = ['high', 'medium', 'low'] as const;

    for (let i = 0; i < Math.min(5, athletes.length); i++) {
      const athlete = athletes[i];
      const athleteId = athleteIdMap.get(athlete.email);
      if (!athleteId) continue;

      const { error } = await supabase.from('shortlists').insert({
        coach_id: coachId,
        athlete_id: athleteId,
        notes: `Priority prospect - ${athlete.athleteProfile?.position || 'ATH'}`,
        priority: priorities[i % 3],
      });

      if (error && !error.message.includes('duplicate')) {
        console.log(`  ✗ shortlist ${recruiter.email}→${athlete.email}: ${error.message}`);
      }
    }
    console.log(`  ✓ Created shortlist entries for ${recruiter.email}`);
  }

  console.log('\n✓ Test data seeded');
}

// ============================================
// SEED RELATIONSHIPS (link to REAL imported athletes)
// ============================================

export async function seedRelationships(): Promise<SeedResult> {
  const startTime = Date.now();
  const created: string[] = [];
  const errors: string[] = [];

  console.log('\nSeeding relationships with real imported athletes...\n');

  const supabase = getSupabaseClient();

  if (coachIdMap.size === 0 || profileIdMap.size === 0) {
    await buildEntityMaps(supabase);
  }

  // Fix the shortlist trigger before inserting (migration 002 has c.organization bug)
  await fixShortlistTrigger(supabase);

  // 1. Query real athletes (from JotForm import, typically CA-based)
  const { data: realAthletes, error: queryError } = await supabase
    .from('athletes')
    .select('id, profile_id, primary_position, state, high_school, class_year, profiles(full_name)')
    .eq('state', 'CA')
    .limit(50);

  if (queryError || !realAthletes || realAthletes.length === 0) {
    console.log('  No real imported athletes found. Skipping relationship seeding.');
    return { success: true, created, errors, duration: Date.now() - startTime };
  }

  console.log(`  Found ${realAthletes.length} real CA athletes\n`);

  // TCU and ASU recruiter IDs
  const tcuCoachId = coachIdMap.get('coach.williams@test.repmax.io');
  const asuCoachId = coachIdMap.get('coach.martinez@test.repmax.io');
  const tcuProfileId = profileIdMap.get('coach.williams@test.repmax.io');
  const asuProfileId = profileIdMap.get('coach.martinez@test.repmax.io');

  // 2. Create shortlists: TCU → 15 athletes, ASU → 10 athletes
  if (tcuCoachId) {
    for (let i = 0; i < Math.min(15, realAthletes.length); i++) {
      try {
        const { error } = await supabase.from('shortlists').insert({
          coach_id: tcuCoachId,
          athlete_id: realAthletes[i].id,
          notes: `TCU target - ${realAthletes[i].primary_position || 'ATH'} from ${realAthletes[i].high_school || 'Unknown HS'}`,
          priority: i < 5 ? 'high' : i < 10 ? 'medium' : 'low',
        });
        if (!error) created.push(`Shortlist: TCU → ${realAthletes[i].id}`);
      } catch (e) {
        errors.push(`TCU shortlist ${i}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    console.log(`  ✓ TCU shortlists: ${Math.min(15, realAthletes.length)}`);
  }

  if (asuCoachId) {
    for (let i = 0; i < Math.min(10, realAthletes.length); i++) {
      try {
        const { error } = await supabase.from('shortlists').insert({
          coach_id: asuCoachId,
          athlete_id: realAthletes[i].id,
          notes: `ASU target - ${realAthletes[i].primary_position || 'ATH'}`,
          priority: i < 3 ? 'high' : 'medium',
        });
        if (!error) created.push(`Shortlist: ASU → ${realAthletes[i].id}`);
      } catch (e) {
        errors.push(`ASU shortlist ${i}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    console.log(`  ✓ ASU shortlists: ${Math.min(10, realAthletes.length)}`);
  }

  // 3. Create profile_views: 200+ views over 30 days
  const viewerEntries: Array<{
    email: string;
    profileId: string;
    school: string;
    zone: string;
    state: string;
  }> = [];

  if (tcuProfileId) {
    viewerEntries.push({ email: 'coach.williams@test.repmax.io', profileId: tcuProfileId, school: 'TCU', zone: 'Southwest', state: 'TX' });
  }
  if (asuProfileId) {
    viewerEntries.push({ email: 'coach.martinez@test.repmax.io', profileId: asuProfileId, school: 'Arizona State', zone: 'Southwest', state: 'AZ' });
  }

  if (viewerEntries.length > 0) {
    const viewRows = [];

    for (let day = 0; day < 30; day++) {
      const viewsPerDay = 5 + Math.floor(Math.random() * 5); // 5-9 views per day
      for (let v = 0; v < viewsPerDay; v++) {
        const athlete = realAthletes[Math.floor(Math.random() * realAthletes.length)];
        const viewer = viewerEntries[Math.floor(Math.random() * viewerEntries.length)];
        viewRows.push({
          athlete_id: athlete.id,
          viewer_id: viewer.profileId,
          viewer_role: 'recruiter',
          viewer_school: viewer.school,
          viewer_zone: viewer.zone,
          source: (['search', 'shortlist', 'direct', 'zone_pulse'] as const)[Math.floor(Math.random() * 4)],
          created_at: new Date(Date.now() - day * 24 * 60 * 60 * 1000 - Math.random() * 86400000).toISOString(),
        });
      }
    }

    // Insert in batches of 50
    for (let i = 0; i < viewRows.length; i += 50) {
      const batch = viewRows.slice(i, i + 50);
      const { error } = await supabase.from('profile_views').insert(batch);
      if (error) {
        errors.push(`profile_views batch ${i}: ${error.message}`);
      }
    }
    created.push(`Profile views: ${viewRows.length}`);
    console.log(`  ✓ Profile views: ${viewRows.length}`);
  }

  // 4. Create offers for top 20 real athletes
  const offerSchools = [
    { name: 'USC', division: 'D1' },
    { name: 'UCLA', division: 'D1' },
    { name: 'Oregon', division: 'D1' },
    { name: 'Arizona State', division: 'D1' },
    { name: 'TCU', division: 'D1' },
    { name: 'San Diego State', division: 'D1' },
    { name: 'Cal', division: 'D1' },
    { name: 'Stanford', division: 'D1' },
    { name: 'Washington', division: 'D1' },
    { name: 'Colorado', division: 'D1' },
  ];
  const scholarshipTypes = ['full', 'partial', 'preferred-walk-on'] as const;

  const topAthletes = realAthletes.slice(0, Math.min(20, realAthletes.length));
  let offerCount = 0;

  for (let i = 0; i < topAthletes.length; i++) {
    const offersPerAthlete = i < 5 ? 3 : i < 10 ? 2 : 1;

    for (let j = 0; j < offersPerAthlete; j++) {
      const school = offerSchools[(i + j) % offerSchools.length];
      try {
        const { error } = await supabase.from('offers').insert({
          athlete_id: topAthletes[i].id,
          school_name: school.name,
          division: school.division,
          scholarship_type: scholarshipTypes[j % 3],
          offer_date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString(),
          committed: i < 3 && j === 0, // First 3 athletes committed to first offer
        });
        if (!error) {
          offerCount++;
          created.push(`Offer: ${school.name} → athlete ${topAthletes[i].id}`);
        }
      } catch (e) {
        errors.push(`Offer ${school.name}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }
  console.log(`  ✓ Offers: ${offerCount}`);

  // 4b. Create offers for test athletes (Jaylen, DeShawn, Marcus)
  const testAthleteOffers: { email: string; offers: { school_name: string; division: string; scholarship_type: string; daysAgo: number; committed: boolean }[] }[] = [
    {
      email: 'jaylen.washington@test.repmax.io',
      offers: [
        { school_name: 'TCU', division: 'D1', scholarship_type: 'full', daysAgo: 45, committed: false },
        { school_name: 'Oregon', division: 'D1', scholarship_type: 'full', daysAgo: 30, committed: false },
        { school_name: 'USC', division: 'D1', scholarship_type: 'full', daysAgo: 20, committed: false },
        { school_name: 'Texas A&M', division: 'D1', scholarship_type: 'full', daysAgo: 12, committed: false },
        { school_name: 'Ohio State', division: 'D1', scholarship_type: 'full', daysAgo: 5, committed: false },
      ],
    },
    {
      email: 'deshawn.harris@test.repmax.io',
      offers: [
        { school_name: 'UCLA', division: 'D1', scholarship_type: 'partial', daysAgo: 40, committed: false },
        { school_name: 'Arizona State', division: 'D1', scholarship_type: 'full', daysAgo: 18, committed: false },
      ],
    },
    {
      email: 'marcus.thompson@test.repmax.io',
      offers: [
        { school_name: 'San Diego State', division: 'D1', scholarship_type: 'preferred-walk-on', daysAgo: 25, committed: false },
      ],
    },
  ];

  let testOfferCount = 0;
  for (const entry of testAthleteOffers) {
    const athleteId = athleteIdMap.get(entry.email);
    if (!athleteId) continue;

    for (const o of entry.offers) {
      try {
        const { error } = await supabase.from('offers').insert({
          athlete_id: athleteId,
          school_name: o.school_name,
          division: o.division,
          scholarship_type: o.scholarship_type,
          offer_date: new Date(Date.now() - o.daysAgo * 24 * 60 * 60 * 1000).toISOString(),
          committed: o.committed,
        });
        if (!error) testOfferCount++;
      } catch (e) {
        errors.push(`Test offer: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }
  console.log(`  ✓ Test athlete offers: ${testOfferCount}`);

  // 4c. Create athlete_events for test athletes
  const today = new Date();
  const testAthleteEvents: { email: string; events: { title: string; event_type: string; daysFromNow: number; location: string; priority: string; description?: string; time?: string }[] }[] = [
    {
      email: 'jaylen.washington@test.repmax.io',
      events: [
        { title: 'TCU Official Visit', event_type: 'visit', daysFromNow: 7, location: 'Fort Worth, TX', priority: 'high', description: 'Official campus visit with coaching staff meeting and facility tour.', time: '09:00' },
        { title: 'Elite 11 Regional', event_type: 'camp', daysFromNow: 14, location: 'Los Angeles, CA', priority: 'high', description: 'Top QB showcase event. Film and live evaluation.', time: '08:00' },
        { title: 'Oregon Virtual Meeting', event_type: 'visit', daysFromNow: 3, location: 'Virtual', priority: 'normal', description: 'Zoom with offensive coordinator.', time: '16:00' },
        { title: 'USC Junior Day', event_type: 'visit', daysFromNow: 21, location: 'Los Angeles, CA', priority: 'normal', time: '10:00' },
        { title: 'Allen vs Plano - District Game', event_type: 'game', daysFromNow: 10, location: 'Eagle Stadium, Allen TX', priority: 'high', time: '19:00' },
        { title: 'Dashr Pro Combine', event_type: 'combine', daysFromNow: 28, location: 'Frisco, TX', priority: 'normal', description: 'NFL-grade Dashr timing. 40yd, pro agility, 3-cone, vertical.', time: '07:30' },
        { title: 'NCAA Early Signing Period', event_type: 'deadline', daysFromNow: 60, location: '', priority: 'high', description: 'First day to sign NLI for early signing period.' },
        { title: 'Ohio State Game Day Visit', event_type: 'visit', daysFromNow: 35, location: 'Columbus, OH', priority: 'normal', description: 'Gameday experience with recruiting staff.' },
        // Past events
        { title: 'The Opening Regional', event_type: 'camp', daysFromNow: -14, location: 'Dallas, TX', priority: 'high', time: '08:00' },
        { title: 'Allen vs Southlake Carroll', event_type: 'game', daysFromNow: -7, location: 'Eagle Stadium, Allen TX', priority: 'normal', time: '19:30' },
      ],
    },
    {
      email: 'deshawn.harris@test.repmax.io',
      events: [
        { title: 'UCLA Camp Invite', event_type: 'camp', daysFromNow: 12, location: 'Westwood, CA', priority: 'normal', time: '09:00' },
        { title: 'Arizona State Visit', event_type: 'visit', daysFromNow: 20, location: 'Tempe, AZ', priority: 'high' },
      ],
    },
  ];

  let eventCount = 0;
  for (const entry of testAthleteEvents) {
    const athleteId = athleteIdMap.get(entry.email);
    if (!athleteId) continue;

    for (const evt of entry.events) {
      const eventDate = new Date(today);
      eventDate.setDate(eventDate.getDate() + evt.daysFromNow);
      try {
        const { error } = await supabase.from('athlete_events').insert({
          athlete_id: athleteId,
          title: evt.title,
          event_type: evt.event_type,
          event_date: eventDate.toISOString().split('T')[0],
          event_time: evt.time || null,
          location: evt.location || null,
          priority: evt.priority,
          description: evt.description || null,
        });
        if (!error) eventCount++;
      } catch (e) {
        errors.push(`Test event: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }
  console.log(`  ✓ Test athlete events: ${eventCount}`);

  // 5. Create messages between TCU recruiter and real athletes
  if (tcuProfileId) {
    let msgCount = 0;
    for (let i = 0; i < Math.min(10, realAthletes.length); i++) {
      const athleteProfileId = realAthletes[i].profile_id;
      if (!athleteProfileId) continue;

      // Recruiter sends message
      const { error: err1 } = await supabase.from('messages').insert({
        sender_id: tcuProfileId,
        recipient_id: athleteProfileId,
        subject: `TCU Football - Interest in ${getProfileName(realAthletes[i]) || 'you'}`,
        body: `We have been following your progress and would love to discuss TCU football opportunities with you.`,
        read: i < 5, // First 5 are read
      });

      if (!err1) msgCount++;

      // Athlete replies (for first 5)
      if (i < 5) {
        const { error: err2 } = await supabase.from('messages').insert({
          sender_id: athleteProfileId,
          recipient_id: tcuProfileId,
          subject: `Re: TCU Football`,
          body: `Thank you for reaching out! I am very interested in learning more about TCU.`,
          read: true,
        });
        if (!err2) msgCount++;
      }
    }
    created.push(`Messages: ${msgCount}`);
    console.log(`  ✓ Messages: ${msgCount}`);
  }

  // 6. Create zone_activity for West zone (30 days)
  const zoneRows = [];
  for (let day = 0; day < 30; day++) {
    const date = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const baseViews = 50 + Math.floor(Math.random() * 50);

    zoneRows.push({
      zone: 'West',
      date: dateStr,
      total_views: baseViews,
      unique_athletes_viewed: Math.floor(baseViews * 0.6),
      unique_coaches_active: 5 + Math.floor(Math.random() * 10),
      new_offers: Math.floor(Math.random() * 5),
      new_commits: Math.floor(Math.random() * 2),
      hot_positions: ['QB', 'WR', 'DB'].slice(0, 1 + Math.floor(Math.random() * 3)),
      active_schools: ['USC', 'UCLA', 'Oregon', 'TCU', 'Arizona State'].slice(0, 2 + Math.floor(Math.random() * 4)),
      activity_level: baseViews > 75 ? 'high' : baseViews > 50 ? 'moderate' : 'low',
      week_over_week_change: parseFloat((Math.random() * 20 - 10).toFixed(1)),
    });
  }

  // Insert zone_activity in batches
  for (let i = 0; i < zoneRows.length; i += 15) {
    const batch = zoneRows.slice(i, i + 15);
    const { error } = await supabase.from('zone_activity').insert(batch);
    if (error) {
      errors.push(`zone_activity batch: ${error.message}`);
    }
  }
  created.push(`Zone activity: ${zoneRows.length} days`);
  console.log(`  ✓ Zone activity: ${zoneRows.length} days`);

  // 7. Create class_rankings for 10 D1 schools
  const rankingSchools = [
    { name: 'USC', conference: 'Big Ten' },
    { name: 'UCLA', conference: 'Big Ten' },
    { name: 'Oregon', conference: 'Big Ten' },
    { name: 'TCU', conference: 'Big 12' },
    { name: 'Arizona State', conference: 'Big 12' },
    { name: 'San Diego State', conference: 'Mountain West' },
    { name: 'Cal', conference: 'ACC' },
    { name: 'Stanford', conference: 'ACC' },
    { name: 'Washington', conference: 'Big Ten' },
    { name: 'Colorado', conference: 'Big 12' },
  ];

  const rankingRows = rankingSchools.map((school, idx) => ({
    school_name: school.name,
    division: 'D1',
    conference: school.conference,
    class_year: 2026,
    overall_rank: idx + 1,
    conference_rank: (idx % 5) + 1,
    total_commits: 15 + Math.floor(Math.random() * 15),
    five_stars: idx < 3 ? 2 + Math.floor(Math.random() * 3) : Math.floor(Math.random() * 2),
    four_stars: 3 + Math.floor(Math.random() * 5),
    three_stars: 5 + Math.floor(Math.random() * 8),
    avg_rating: parseFloat((4.5 - idx * 0.1 + Math.random() * 0.2).toFixed(2)),
    points: parseFloat((300 - idx * 20 + Math.random() * 10).toFixed(1)),
    ranking_source: '247Sports',
    as_of_date: new Date().toISOString().split('T')[0],
  }));

  const { error: rankError } = await supabase.from('class_rankings').insert(rankingRows);
  if (rankError) {
    errors.push(`class_rankings: ${rankError.message}`);
    console.log(`  ✗ class_rankings: ${rankError.message}`);
  } else {
    created.push(`Class rankings: ${rankingRows.length}`);
    console.log(`  ✓ Class rankings: ${rankingRows.length}`);
  }

  const duration = Date.now() - startTime;

  console.log('\n--- Relationships Seed Summary ---');
  console.log(`Created: ${created.length} items`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Duration: ${duration}ms`);

  return { success: errors.length === 0, created, errors, duration };
}

// ============================================
// PARENT LINKS SEEDING
// ============================================

export async function seedParentLinks(): Promise<SeedResult> {
  const startTime = Date.now();
  const created: string[] = [];
  const errors: string[] = [];

  console.log('\nSeeding parent links...\n');

  const supabase = getSupabaseClient();

  if (profileIdMap.size === 0) {
    await buildEntityMaps(supabase);
  }

  // Link Lisa Washington → Jaylen Washington
  const parentLinks = [
    {
      parentEmail: 'lisa.washington@test.repmax.io',
      athleteEmail: 'jaylen.washington@test.repmax.io',
      relationship: 'mother',
    },
  ];

  for (const link of parentLinks) {
    try {
      const parentProfileId = profileIdMap.get(link.parentEmail);
      const athleteProfileId = profileIdMap.get(link.athleteEmail);

      if (!parentProfileId) {
        throw new Error(`Parent profile not found: ${link.parentEmail}`);
      }
      if (!athleteProfileId) {
        throw new Error(`Athlete profile not found: ${link.athleteEmail}`);
      }

      const { error } = await supabase.from('parent_links').insert({
        parent_profile_id: parentProfileId,
        athlete_profile_id: athleteProfileId,
        relationship: link.relationship,
      });

      if (error) {
        throw new Error(error.message);
      }

      created.push(`${link.parentEmail} → ${link.athleteEmail}`);
      console.log(`  ✓ Linked ${link.parentEmail} → ${link.athleteEmail}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${link.parentEmail}: ${message}`);
      console.log(`  ✗ ${link.parentEmail}: ${message}`);
    }
  }

  const duration = Date.now() - startTime;

  console.log('\n--- Parent Links Seed Summary ---');
  console.log(`Created: ${created.length} links`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Duration: ${duration}ms`);

  return { success: errors.length === 0, created, errors, duration };
}

// ============================================
// CLUB DATA SEEDING
// ============================================

export async function seedClubData(): Promise<SeedResult> {
  const startTime = Date.now();
  const created: string[] = [];
  const errors: string[] = [];

  console.log('\nSeeding club data (tournaments, verifications, payments)...\n');

  const supabase = getSupabaseClient();

  if (userIdMap.size === 0 || profileIdMap.size === 0) {
    await buildEntityMaps(supabase);
  }

  const mikeTorresCoachId = coachIdMap.get('mike.torres@test.repmax.io');

  if (!mikeTorresCoachId) {
    console.log('  Mike Torres coach record not found. Skipping club seeding.');
    return { success: true, created, errors, duration: Date.now() - startTime };
  }

  // 1. Create tournaments (club_id = Mike Torres' coaches.id)
  const tournamentData = [
    {
      name: 'Winter Classic 2026',
      start_date: '2026-02-15',
      end_date: '2026-02-16',
      location: 'Austin, TX',
      division: '7v7',
      format: 'pool_play',
      registration_fee_cents: 37500,
      max_teams: 16,
      status: 'registration_open' as const,
    },
    {
      name: 'Spring Showcase 2026',
      start_date: '2026-04-10',
      end_date: '2026-04-12',
      location: 'San Antonio, TX',
      division: '7v7',
      format: 'bracket',
      registration_fee_cents: 37500,
      max_teams: 32,
      status: 'registration_open' as const,
    },
    {
      name: 'Fall Championship 2025',
      start_date: '2025-11-01',
      end_date: '2025-11-02',
      location: 'Dallas, TX',
      division: '7v7',
      format: 'pool_play',
      registration_fee_cents: 40000,
      max_teams: 24,
      status: 'completed' as const,
    },
  ];

  const tournamentIds: string[] = [];

  for (const t of tournamentData) {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .insert({
          club_id: mikeTorresCoachId,
          ...t,
        })
        .select('id')
        .single();

      if (error) throw new Error(error.message);
      if (data) tournamentIds.push(data.id);

      created.push(`Tournament: ${t.name}`);
      console.log(`  ✓ Tournament: ${t.name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`Tournament ${t.name}: ${message}`);
      console.log(`  ✗ Tournament ${t.name}: ${message}`);
    }
  }

  // 2. Create tournament teams (for the Fall Championship — completed tournament)
  const teamData = [
    { team_name: 'Riverside Elite', coach_name: 'Marcus Johnson', division: '7v7', athlete_count: 12, verified_count: 12, payment_status: 'completed' as const, pool: 'A', seed: 1 },
    { team_name: 'Houston Select', coach_name: 'David Park', division: '7v7', athlete_count: 11, verified_count: 10, payment_status: 'completed' as const, pool: 'A', seed: 2 },
    { team_name: 'Dallas Thunder', coach_name: 'Chris Williams', division: '7v7', athlete_count: 13, verified_count: 13, payment_status: 'completed' as const, pool: 'B', seed: 1 },
    { team_name: 'SA Wildcats', coach_name: 'Roberto Garza', division: '7v7', athlete_count: 10, verified_count: 8, payment_status: 'pending' as const, pool: 'B', seed: 2 },
    { team_name: 'Austin Grizzlies', coach_name: 'Tom Baker', division: '7v7', athlete_count: 12, verified_count: 12, payment_status: 'completed' as const, pool: 'C', seed: 1 },
  ];

  const teamIds: string[] = [];
  const fallTournamentId = tournamentIds[2]; // Fall Championship

  if (fallTournamentId) {
    for (const team of teamData) {
      try {
        const { data, error } = await supabase
          .from('tournament_teams')
          .insert({ tournament_id: fallTournamentId, ...team })
          .select('id')
          .single();

        if (error) throw new Error(error.message);
        if (data) teamIds.push(data.id);

        created.push(`Team: ${team.team_name}`);
        console.log(`  ✓ Team: ${team.team_name}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`Team ${team.team_name}: ${message}`);
        console.log(`  ✗ Team ${team.team_name}: ${message}`);
      }
    }
  }

  // 3. Create athlete verifications (tied to tournament teams)
  if (teamIds.length >= 2) {
    const verifications = [
      { tournament_team_id: teamIds[0], athlete_name: 'Jaylen Washington', verification_method: 'document_upload', status: 'verified' as const, identity_check: true, age_check: true, eligibility_check: true },
      { tournament_team_id: teamIds[0], athlete_name: 'DeShawn Harris', verification_method: 'document_upload', status: 'pending_review' as const, identity_check: true, age_check: null, eligibility_check: null },
      { tournament_team_id: teamIds[1], athlete_name: 'Sofia Rodriguez', verification_method: 'in_person', status: 'age_check_needed' as const, identity_check: true, age_check: false, eligibility_check: true },
    ];

    for (const v of verifications) {
      try {
        const { error } = await supabase.from('athlete_verifications').insert(v);
        if (error) throw new Error(error.message);

        created.push(`Verification: ${v.athlete_name} (${v.status})`);
        console.log(`  ✓ Verification: ${v.athlete_name} (${v.status})`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`Verification ${v.athlete_name}: ${message}`);
        console.log(`  ✗ Verification ${v.athlete_name}: ${message}`);
      }
    }
  }

  // 4. Create tournament payments (tied to tournament teams)
  if (teamIds.length >= 3) {
    const payments = [
      { tournament_team_id: teamIds[0], amount_cents: 37500, status: 'completed' as const, paid_at: new Date(Date.now() - 5 * 86400000).toISOString() },
      { tournament_team_id: teamIds[1], amount_cents: 37500, status: 'completed' as const, paid_at: new Date(Date.now() - 3 * 86400000).toISOString() },
      { tournament_team_id: teamIds[2], amount_cents: 37500, status: 'completed' as const, paid_at: new Date(Date.now() - 7 * 86400000).toISOString() },
      { tournament_team_id: teamIds[3], amount_cents: 37500, status: 'pending' as const, paid_at: null },
      { tournament_team_id: teamIds[4], amount_cents: 40000, status: 'completed' as const, paid_at: new Date(Date.now() - 14 * 86400000).toISOString() },
    ];

    for (const p of payments) {
      try {
        const { error } = await supabase.from('tournament_payments').insert(p);
        if (error) throw new Error(error.message);

        created.push(`Payment: team ${p.tournament_team_id.slice(0, 8)}... $${p.amount_cents / 100}`);
        console.log(`  ✓ Payment: $${p.amount_cents / 100} (${p.status})`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`Payment: ${message}`);
        console.log(`  ✗ Payment: ${message}`);
      }
    }
  }

  const duration = Date.now() - startTime;

  console.log('\n--- Club Data Seed Summary ---');
  console.log(`Created: ${created.length} items`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Duration: ${duration}ms`);

  return { success: errors.length === 0, created, errors, duration };
}

// ============================================
// CLEANUP
// ============================================

export async function cleanTestUsers(): Promise<CleanResult> {
  const startTime = Date.now();
  const deleted: string[] = [];
  const errors: string[] = [];

  console.log('Starting cleanup process...\n');

  const supabase = getSupabaseClient();

  // Get all test user emails
  const testEmails = testUserData.map((u) => u.email);

  for (const email of testEmails) {
    try {
      // Find user by email
      const { data: users, error: fetchError } = await supabase.auth.admin.listUsers();

      if (fetchError) {
        throw new Error(`Failed to list users: ${fetchError.message}`);
      }

      const user = users.users.find((u) => u.email === email);

      if (user) {
        // Delete auth user (cascades to profiles via RLS)
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

        if (deleteError) {
          throw new Error(`Failed to delete ${email}: ${deleteError.message}`);
        }

        deleted.push(email);
        console.log(`  ✓ Deleted ${email}`);
      } else {
        console.log(`  - Skipped ${email} (not found)`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${email}: ${message}`);
      console.log(`  ✗ Failed ${email}: ${message}`);
    }
  }

  const duration = Date.now() - startTime;

  console.log('\n--- Cleanup Summary ---');
  console.log(`Deleted: ${deleted.length} users`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Duration: ${duration}ms`);

  return { success: errors.length === 0, deleted, errors, duration };
}

// ============================================
// HELPERS
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getProfileName(athlete: any): string | undefined {
  const profiles = athlete?.profiles;
  if (Array.isArray(profiles) && profiles.length > 0) {
    return profiles[0].full_name;
  }
  if (profiles && typeof profiles === 'object' && !Array.isArray(profiles)) {
    return profiles.full_name;
  }
  return undefined;
}

async function buildUserIdMap(supabase: SupabaseClient): Promise<void> {
  console.log('Building user ID map from auth...');

  const testEmails = new Set(testUserData.map((u) => u.email));
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      console.warn(`  Warning: Failed to list auth users (page ${page}): ${error.message}`);
      return;
    }

    for (const user of data.users) {
      if (user.email && testEmails.has(user.email)) {
        userIdMap.set(user.email, user.id);
      }
    }

    // Stop when we've found all test emails or exhausted pages
    if (userIdMap.size >= testEmails.size || data.users.length < perPage) {
      break;
    }
    page++;
  }

  console.log(`  Found ${userIdMap.size} existing users\n`);
}

// ============================================
// SCHOOL COACH ACCOUNTS
// ============================================

interface SchoolConfig {
  key: string;
  email: string;
  displayName: string;
  highSchool: string; // must match athletes.high_school exactly
  client: 'repmax' | 'ca_recruits';
  city: string;
  state: string;
  zone: string;
}

const SCHOOL_PASSWORD = 'RepMax2026!School';

const schoolConfigs: SchoolConfig[] = [
  // RepMax schools (6 core)
  { key: 'wilson', email: 'wilson@repmax.io', displayName: 'Wilson HS Coach', highSchool: 'Woodrow Wilson High School', client: 'repmax', city: 'Long Beach', state: 'CA', zone: 'West' },
  { key: 'western', email: 'western@repmax.io', displayName: 'Western HS Coach', highSchool: 'Western High School', client: 'repmax', city: 'Anaheim', state: 'CA', zone: 'West' },
  { key: 'sierracanyon', email: 'sierracanyon@repmax.io', displayName: 'Sierra Canyon Coach', highSchool: 'Sierra Canyon School', client: 'repmax', city: 'Chatsworth', state: 'CA', zone: 'West' },
  { key: 'stpius', email: 'stpius@repmax.io', displayName: 'St. Pius Coach', highSchool: 'St. Pius X - St. Matthias Academy', client: 'repmax', city: 'Downey', state: 'CA', zone: 'West' },
  { key: 'newburypark', email: 'newburypark@repmax.io', displayName: 'Newbury Park Coach', highSchool: 'Newbury Park High School', client: 'repmax', city: 'Newbury Park', state: 'CA', zone: 'West' },
  { key: 'mayfair', email: 'mayfair@repmax.io', displayName: 'Mayfair HS Coach', highSchool: 'Mayfair High School', client: 'repmax', city: 'Lakewood', state: 'CA', zone: 'West' },
  // RepMax additional (batch5)
  { key: 'riversidepoly', email: 'riversidepoly@repmax.io', displayName: 'Riverside Poly Coach', highSchool: 'Riverside Poly High School', client: 'repmax', city: 'Riverside', state: 'CA', zone: 'West' },
  // CA Recruits schools (10)
  { key: 'frontier', email: 'frontier@repmax.io', displayName: 'Frontier HS Coach', highSchool: 'Frontier High School', client: 'ca_recruits', city: 'Bakersfield', state: 'CA', zone: 'West' },
  { key: 'bakersfield', email: 'bakersfield@repmax.io', displayName: 'Bakersfield Christian Coach', highSchool: 'Bakersfield Christian High School', client: 'ca_recruits', city: 'Bakersfield', state: 'CA', zone: 'West' },
  { key: 'garces', email: 'garces@repmax.io', displayName: 'Garces Memorial Coach', highSchool: 'Garces Memorial High School', client: 'ca_recruits', city: 'Bakersfield', state: 'CA', zone: 'West' },
  { key: 'heritage', email: 'heritage@repmax.io', displayName: 'Heritage Christian Coach', highSchool: 'Heritage Christian School', client: 'ca_recruits', city: 'Northridge', state: 'CA', zone: 'West' },
  { key: 'independence', email: 'independence@repmax.io', displayName: 'Independence HS Coach', highSchool: 'Independence High School', client: 'ca_recruits', city: 'Bakersfield', state: 'CA', zone: 'West' },
  { key: 'knight', email: 'knight@repmax.io', displayName: 'Knight HS Coach', highSchool: 'Knight High School', client: 'ca_recruits', city: 'Palmdale', state: 'CA', zone: 'West' },
  { key: 'ontario', email: 'ontario@repmax.io', displayName: 'Ontario Christian Coach', highSchool: 'Ontario Christian High School', client: 'ca_recruits', city: 'Ontario', state: 'CA', zone: 'West' },
  { key: 'paraclete', email: 'paraclete@repmax.io', displayName: 'Paraclete HS Coach', highSchool: 'Paraclete High School', client: 'ca_recruits', city: 'Lancaster', state: 'CA', zone: 'West' },
  { key: 'redwood', email: 'redwood@repmax.io', displayName: 'Redwood HS Coach', highSchool: 'Redwood High School', client: 'ca_recruits', city: 'Visalia', state: 'CA', zone: 'West' },
  { key: 'southeast', email: 'southeast@repmax.io', displayName: 'South East HS Coach', highSchool: 'South East High School', client: 'ca_recruits', city: 'South Gate', state: 'CA', zone: 'West' },
  // CA Recruits aggregate — sees ALL CA Recruits athletes
  { key: 'carecruits', email: 'carecruits@repmax.io', displayName: 'CA Recruits', highSchool: '__CA_RECRUITS_ALL__', client: 'ca_recruits', city: 'Los Angeles', state: 'CA', zone: 'West' },
];

export async function seedSchoolCoaches(): Promise<SeedResult> {
  const startTime = Date.now();
  const created: string[] = [];
  const errors: string[] = [];

  console.log('\nSeeding school coach accounts...\n');

  const supabase = getSupabaseClient();

  // Fix the shortlist trigger before inserting (migration 002 has c.organization bug)
  await fixShortlistTrigger(supabase);

  // CA Recruits school names for the aggregate account
  const caRecruitsSchools = schoolConfigs
    .filter(s => s.client === 'ca_recruits' && s.highSchool !== '__CA_RECRUITS_ALL__')
    .map(s => s.highSchool);

  for (const school of schoolConfigs) {
    try {
      // 1. Create or find auth user
      let userId: string;
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: school.email,
        password: SCHOOL_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: school.displayName,
          roles: ['coach'],
          active_role: 'coach',
        },
      });

      if (authError) {
        if (authError.message.includes('already been registered')) {
          // Look up existing user
          const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
          const existing = listData?.users.find(u => u.email === school.email);
          if (!existing) throw new Error(`Auth exists but not found: ${school.email}`);
          userId = existing.id;
          console.log(`  ↻ ${school.key}: auth exists`);
        } else {
          throw new Error(authError.message);
        }
      } else {
        userId = authData.user.id;
      }

      // 2. Create or find profile
      let profileId: string;
      const { data: existingProfile } = await supabase
        .from('profiles').select('id').eq('user_id', userId).single();

      if (existingProfile) {
        profileId = existingProfile.id;
      } else {
        const { error: profErr } = await supabase.from('profiles').insert({
          id: userId,
          user_id: userId,
          role: 'coach',
          full_name: school.displayName,
        });
        if (profErr) throw new Error(`Profile: ${profErr.message}`);
        profileId = userId;
      }

      // 3. Create or find coach record
      let coachId: string;
      const { data: existingCoach } = await supabase
        .from('coaches').select('id').eq('profile_id', profileId).single();

      if (existingCoach) {
        coachId = existingCoach.id;
      } else {
        const { data: newCoach, error: coachErr } = await supabase
          .from('coaches')
          .insert({
            profile_id: profileId,
            school_name: school.highSchool === '__CA_RECRUITS_ALL__' ? 'CA Recruits' : school.highSchool,
            division: 'D1',
            title: 'Head Coach',
          })
          .select('id')
          .single();
        if (coachErr) throw new Error(`Coach: ${coachErr.message}`);
        coachId = newCoach!.id;
      }

      // 3.5. Create or find team
      let teamId: string;
      const teamName = school.highSchool === '__CA_RECRUITS_ALL__'
        ? 'CA Recruits Football'
        : `${school.highSchool} Football`;
      const teamSchoolName = school.highSchool === '__CA_RECRUITS_ALL__'
        ? 'CA Recruits'
        : school.highSchool;

      const { data: existingTeam } = await supabase
        .from('teams').select('id').eq('coach_profile_id', profileId).single();

      if (existingTeam) {
        teamId = existingTeam.id;
      } else {
        const { data: newTeam, error: teamErr } = await supabase
          .from('teams')
          .insert({
            name: teamName,
            school_name: teamSchoolName,
            city: school.city,
            state: school.state,
            zone: school.zone,
            coach_profile_id: profileId,
          })
          .select('id')
          .single();
        if (teamErr) throw new Error(`Team: ${teamErr.message}`);
        teamId = newTeam!.id;
      }

      // 4. Query school's athletes
      let athleteQuery;
      if (school.highSchool === '__CA_RECRUITS_ALL__') {
        // Aggregate: all CA Recruits schools
        athleteQuery = supabase
          .from('athletes')
          .select('id')
          .in('high_school', caRecruitsSchools);
      } else {
        athleteQuery = supabase
          .from('athletes')
          .select('id')
          .eq('high_school', school.highSchool);
      }

      const { data: athletes, error: athErr } = await athleteQuery;
      if (athErr) throw new Error(`Athletes query: ${athErr.message}`);
      if (!athletes || athletes.length === 0) {
        console.log(`  ⚠ ${school.key}: 0 athletes found for "${school.highSchool}"`);
        created.push(`${school.key} (0 athletes)`);
        continue;
      }

      // 5. Create shortlist entries (skip existing)
      let shortlisted = 0;
      let rostered = 0;
      for (const athlete of athletes) {
        const { error: slErr } = await supabase.from('shortlists').insert({
          coach_id: coachId,
          athlete_id: athlete.id,
          notes: `${school.highSchool === '__CA_RECRUITS_ALL__' ? 'CA Recruits' : school.highSchool} roster`,
          priority: 'high',
        });

        if (slErr) {
          if (!slErr.message.includes('duplicate')) {
            console.log(`    ✗ shortlist: ${slErr.message}`);
          }
        } else {
          shortlisted++;
        }

        // 5.5. Create team_roster entry
        const { error: trErr } = await supabase.from('team_rosters').insert({
          team_id: teamId,
          athlete_id: athlete.id,
          priority: 'high',
          notes: `${teamSchoolName} roster`,
        });

        if (trErr) {
          if (!trErr.message.includes('duplicate')) {
            console.log(`    ✗ team_roster: ${trErr.message}`);
          }
        } else {
          rostered++;
        }
      }

      created.push(`${school.key}: ${shortlisted}/${athletes.length} shortlisted, ${rostered} rostered`);
      console.log(`  ✓ ${school.key} (${school.email}): ${shortlisted} shortlisted, ${rostered} rostered`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${school.key}: ${message}`);
      console.log(`  ✗ ${school.key}: ${message}`);
    }
  }

  const duration = Date.now() - startTime;

  console.log('\n--- School Coach Seed Summary ---');
  console.log(`Created: ${created.length} school accounts`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Duration: ${duration}ms`);

  return { success: errors.length === 0, created, errors, duration };
}

// ============================================
// FULL SEED
// ============================================

async function seedAll(): Promise<void> {
  console.log('='.repeat(60));
  console.log('REPMAX v2 - FULL SEED');
  console.log('='.repeat(60));

  // 1. Seed users
  await seedTestUsers();

  // 2. Build entity maps
  const supabase = getSupabaseClient();
  await buildEntityMaps(supabase);

  // 3. Seed highlights
  try {
    await seedHighlights();
  } catch (e) {
    console.log('  Skipped highlights (error)');
  }

  // 4. Seed coach tasks
  try {
    await seedCoachTasks();
  } catch (e) {
    console.log('  Skipped coach tasks (error)');
  }

  // 5. Seed test data (shortlists + profile views for test users)
  try {
    await seedTestData();
  } catch (e) {
    console.log('  Skipped test data (error)');
  }

  // 6. Seed relationships (links to real imported athletes)
  try {
    await seedRelationships();
  } catch (e) {
    console.log('  Skipped relationships (no real athletes imported yet)');
  }

  // 7. Seed parent links
  try {
    await seedParentLinks();
  } catch (e) {
    console.log('  Skipped parent links (error)');
  }

  // 8. Seed club data (tournaments, verifications, payments)
  try {
    await seedClubData();
  } catch (e) {
    console.log('  Skipped club data (error)');
  }

  // 9. Seed school coach accounts (one per onboarded school)
  try {
    await seedSchoolCoaches();
  } catch (e) {
    console.log('  Skipped school coaches (error)');
  }

  console.log('\n' + '='.repeat(60));
  console.log('SEED COMPLETE');
  console.log('='.repeat(60));
}

// ============================================
// CLI ENTRY POINT
// ============================================

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'seed':
      await seedAll();
      break;
    case 'seed:users':
      await seedTestUsers();
      break;
    case 'seed:highlights':
      await seedHighlights();
      break;
    case 'seed:coach':
      await seedCoachTasks();
      break;
    case 'seed:relationships':
      await seedRelationships();
      break;
    case 'seed:parents':
      await seedParentLinks();
      break;
    case 'seed:club':
      await seedClubData();
      break;
    case 'seed:schools':
      await seedSchoolCoaches();
      break;
    case 'clean':
      await cleanTestUsers();
      break;
    case 'reset':
      await cleanTestUsers();
      await seedAll();
      break;
    default:
      console.log('Usage: npx tsx test/seed/seed-loader.ts <command>');
      console.log('');
      console.log('Commands:');
      console.log('  seed              - Create all test users and data');
      console.log('  seed:users        - Create test users only');
      console.log('  seed:highlights   - Create highlight data only');
      console.log('  seed:coach        - Create coach tasks only');
      console.log('  seed:relationships- Link recruiters to real imported athletes');
      console.log('  seed:parents      - Create parent-athlete links');
      console.log('  seed:club         - Create club data (tournaments, verifications, payments)');
      console.log('  seed:schools      - Create school coach accounts with athlete rosters');
      console.log('  clean             - Remove all test users');
      console.log('  reset             - Clean and re-seed everything');
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
