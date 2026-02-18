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

  // 1. Create auth user
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
    throw new Error(`Failed to create auth user ${userData.email}: ${authError.message}`);
  }

  const userId = authData.user.id;
  userIdMap.set(userData.email, userId);

  // 2. Create profile
  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    user_id: userId,
    role: userData.activeRole,
    full_name: userData.fullName,
  });

  if (profileError) {
    throw new Error(`Failed to create profile for ${userData.email}: ${profileError.message}`);
  }

  // 3. Create role-specific profiles
  if (userData.athleteProfile) {
    const { error } = await supabase.from('athletes').insert({
      profile_id: userId,
      primary_position: userData.athleteProfile.position,
      class_year: userData.athleteProfile.classYear,
      high_school: userData.athleteProfile.school,
      city: userData.city,
      state: userData.state,
      zone: userData.zone,
      height_inches: userData.athleteProfile.height,
      weight_lbs: userData.athleteProfile.weight,
      forty_yard_time: userData.athleteProfile.fortyYard,
      vertical_inches: userData.athleteProfile.vertical,
      gpa: userData.athleteProfile.gpa,
      sat_score: userData.athleteProfile.sat,
      act_score: userData.athleteProfile.act,
      verified: userData.athleteProfile.verified,
    });

    if (error) {
      console.warn(`  Warning: athletes insert failed: ${error.message}`);
    }
  }

  if (userData.recruiterProfile) {
    const { error } = await supabase.from('coaches').insert({
      profile_id: userId,
      school_name: userData.recruiterProfile.school,
      division: 'D1',
      conference: userData.recruiterProfile.conference,
      title: userData.recruiterProfile.title,
    });

    if (error) {
      console.warn(`  Warning: coaches insert failed: ${error.message}`);
    }
  }

  if (userData.coachProfile) {
    const { error } = await supabase.from('coaches').insert({
      profile_id: userId,
      school_name: userData.coachProfile.school,
      division: 'D1',
      title: 'Head Coach',
    });

    if (error) {
      console.warn(`  Warning: coaches insert failed: ${error.message}`);
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

  // Build athleteIdMap: email -> athletes.id
  for (const [email, userId] of userIdMap) {
    const { data: athlete } = await supabase
      .from('athletes')
      .select('id')
      .eq('profile_id', userId)
      .single();

    if (athlete) {
      athleteIdMap.set(email, athlete.id);
    }
  }

  // Build coachIdMap: email -> coaches.id
  for (const [email, userId] of userIdMap) {
    const { data: coach } = await supabase
      .from('coaches')
      .select('id')
      .eq('profile_id', userId)
      .single();

    if (coach) {
      coachIdMap.set(email, coach.id);
    }
  }

  // Build profileIdMap: email -> profiles.id (same as auth user id for our seed data)
  for (const [email, userId] of userIdMap) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (profile) {
      profileIdMap.set(email, profile.id);
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
        ai_analyzed: highlight.aiAnalyzed || false,
        ai_tags: highlight.aiTags || null,
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
        created_at: task.createdAt,
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
// TEST DATA (Shortlists + Profile Views)
// ============================================

export async function seedTestData(): Promise<void> {
  console.log('\nSeeding test data (shortlists + profile views)...\n');

  const supabase = getSupabaseClient();

  if (athleteIdMap.size === 0 || coachIdMap.size === 0 || profileIdMap.size === 0) {
    await buildEntityMaps(supabase);
  }

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
        viewer_zone: recruiter.zone || 'SOUTHWEST',
        viewer_school: recruiter.recruiterProfile?.school || null,
        viewer_division: 'D1',
        viewer_state: recruiter.state || null,
        source: sources[i % 3],
        duration_seconds: Math.floor(Math.random() * 120) + 10,
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

    const pipelineStatuses = ['identified', 'contacted', 'evaluating'] as const;
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
        pipeline_status: pipelineStatuses[i % 3],
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
  const tcuCoachId = coachIdMap.get('coach.williams@test.repmax.com');
  const asuCoachId = coachIdMap.get('coach.martinez@test.repmax.com');
  const tcuProfileId = profileIdMap.get('coach.williams@test.repmax.com');
  const asuProfileId = profileIdMap.get('coach.martinez@test.repmax.com');

  // 2. Create shortlists: TCU → 15 athletes, ASU → 10 athletes
  if (tcuCoachId) {
    const pipelineStatuses = ['identified', 'contacted', 'evaluating'] as const;
    for (let i = 0; i < Math.min(15, realAthletes.length); i++) {
      try {
        const { error } = await supabase.from('shortlists').insert({
          coach_id: tcuCoachId,
          athlete_id: realAthletes[i].id,
          notes: `TCU target - ${realAthletes[i].primary_position || 'ATH'} from ${realAthletes[i].high_school || 'Unknown HS'}`,
          priority: i < 5 ? 'high' : i < 10 ? 'medium' : 'low',
          pipeline_status: pipelineStatuses[i % 3],
        });
        if (!error) created.push(`Shortlist: TCU → ${realAthletes[i].id}`);
      } catch (e) {
        errors.push(`TCU shortlist ${i}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    console.log(`  ✓ TCU shortlists: ${Math.min(15, realAthletes.length)}`);
  }

  if (asuCoachId) {
    const pipelineStatuses = ['identified', 'contacted', 'evaluating'] as const;
    for (let i = 0; i < Math.min(10, realAthletes.length); i++) {
      try {
        const { error } = await supabase.from('shortlists').insert({
          coach_id: asuCoachId,
          athlete_id: realAthletes[i].id,
          notes: `ASU target - ${realAthletes[i].primary_position || 'ATH'}`,
          priority: i < 3 ? 'high' : 'medium',
          pipeline_status: pipelineStatuses[i % 3],
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
    viewerEntries.push({ email: 'coach.williams@test.repmax.com', profileId: tcuProfileId, school: 'TCU', zone: 'SOUTHWEST', state: 'TX' });
  }
  if (asuProfileId) {
    viewerEntries.push({ email: 'coach.martinez@test.repmax.com', profileId: asuProfileId, school: 'Arizona State', zone: 'SOUTHWEST', state: 'AZ' });
  }

  if (viewerEntries.length > 0) {
    const sources = ['search', 'shortlist', 'direct'] as const;
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
          viewer_division: 'D1',
          viewer_state: viewer.state,
          viewer_zone: viewer.zone,
          source: sources[Math.floor(Math.random() * sources.length)],
          duration_seconds: Math.floor(Math.random() * 180) + 10,
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
  const scholarshipTypes = ['full', 'partial', 'preferred_walk_on'] as const;

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
      zone: 'WEST',
      date: dateStr,
      total_views: baseViews,
      unique_athletes_viewed: Math.floor(baseViews * 0.6),
      unique_coaches_active: 5 + Math.floor(Math.random() * 10),
      new_offers: Math.floor(Math.random() * 5),
      new_commits: Math.floor(Math.random() * 2),
      hot_positions: ['QB', 'WR', 'DB'].slice(0, 1 + Math.floor(Math.random() * 3)),
      active_schools: ['USC', 'UCLA', 'Oregon', 'TCU', 'Arizona State'].slice(0, 2 + Math.floor(Math.random() * 4)),
      activity_level: baseViews > 75 ? 'high' : baseViews > 50 ? 'medium' : 'low',
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
      parentEmail: 'lisa.washington@test.repmax.com',
      athleteEmail: 'jaylen.washington@test.repmax.com',
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

  const mikeTorresUserId = userIdMap.get('mike.torres@test.repmax.com');

  if (!mikeTorresUserId) {
    console.log('  Mike Torres user not found. Skipping club seeding.');
    return { success: true, created, errors, duration: Date.now() - startTime };
  }

  // 1. Create tournaments
  const tournamentData = [
    {
      name: 'Winter Classic 2026',
      start_date: '2026-02-15T09:00:00Z',
      end_date: '2026-02-16T18:00:00Z',
      location: 'Austin, TX',
      teams_registered: 12,
      teams_capacity: 16,
      total_collected: 4500,
      status: 'upcoming',
    },
    {
      name: 'Spring Showcase 2026',
      start_date: '2026-04-10T09:00:00Z',
      end_date: '2026-04-12T18:00:00Z',
      location: 'San Antonio, TX',
      teams_registered: 8,
      teams_capacity: 32,
      total_collected: 2400,
      status: 'upcoming',
    },
    {
      name: 'Fall Championship 2025',
      start_date: '2025-11-01T09:00:00Z',
      end_date: '2025-11-02T18:00:00Z',
      location: 'Dallas, TX',
      teams_registered: 24,
      teams_capacity: 24,
      total_collected: 9600,
      status: 'completed',
    },
  ];

  const tournamentIds: string[] = [];

  for (const t of tournamentData) {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .insert({
          organizer_id: mikeTorresUserId,
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

  // 2. Create athlete verifications (pending, for 3 athletes)
  const verificationAthletes = [
    'jaylen.washington@test.repmax.com',
    'deshawn.harris@test.repmax.com',
    'sofia.rodriguez@test.repmax.com',
  ];
  const verificationTypes = ['identity', 'academic', 'athletic'] as const;

  for (let i = 0; i < verificationAthletes.length; i++) {
    const athleteProfileId = profileIdMap.get(verificationAthletes[i]);
    if (!athleteProfileId) continue;

    try {
      const { error } = await supabase.from('athlete_verifications').insert({
        athlete_id: athleteProfileId,
        club_id: mikeTorresUserId,
        type: verificationTypes[i],
        status: 'pending',
        created_at: new Date(Date.now() - (i + 1) * 12 * 60 * 60 * 1000).toISOString(),
      });

      if (error) throw new Error(error.message);

      created.push(`Verification: ${verificationAthletes[i]} (${verificationTypes[i]})`);
      console.log(`  ✓ Verification: ${verificationAthletes[i]} (${verificationTypes[i]})`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`Verification ${verificationAthletes[i]}: ${message}`);
      console.log(`  ✗ Verification ${verificationAthletes[i]}: ${message}`);
    }
  }

  // 3. Create tournament payments
  if (tournamentIds.length > 0) {
    const paymentData = [
      { description: 'Team registration — Riverside Elite', amount: 375, status: 'completed', daysAgo: 5 },
      { description: 'Team registration — Houston Select', amount: 375, status: 'completed', daysAgo: 3 },
      { description: 'Team registration — Dallas Thunder', amount: 375, status: 'pending', daysAgo: 1 },
      { description: 'Referee fee — Pool Play', amount: 800, status: 'completed', daysAgo: 7 },
      { description: 'Field rental deposit', amount: 1200, status: 'completed', daysAgo: 14 },
    ];

    for (const p of paymentData) {
      try {
        const { error } = await supabase.from('tournament_payments').insert({
          organizer_id: mikeTorresUserId,
          tournament_id: tournamentIds[0],
          description: p.description,
          amount: p.amount,
          status: p.status,
          created_at: new Date(Date.now() - p.daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        });

        if (error) throw new Error(error.message);

        created.push(`Payment: ${p.description}`);
        console.log(`  ✓ Payment: ${p.description}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`Payment ${p.description}: ${message}`);
        console.log(`  ✗ Payment ${p.description}: ${message}`);
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

  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.warn(`  Warning: Failed to list auth users: ${error.message}`);
    return;
  }

  const testEmails = new Set(testUserData.map((u) => u.email));

  for (const user of data.users) {
    if (user.email && testEmails.has(user.email)) {
      userIdMap.set(user.email, user.id);
    }
  }

  console.log(`  Found ${userIdMap.size} existing users\n`);
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
      console.log('  clean             - Remove all test users');
      console.log('  reset             - Clean and re-seed everything');
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
