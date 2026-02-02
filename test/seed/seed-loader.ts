/**
 * Seed Data Loader
 *
 * TypeScript utility to load/clean test users and related data for RepMax v2.
 * Based on USER_TESTING_GUIDE.md - 15 test users with comprehensive seed data.
 *
 * Usage:
 *   npx tsx test/seed/seed-loader.ts seed              # Create all test data
 *   npx tsx test/seed/seed-loader.ts clean             # Remove all test data
 *   npx tsx test/seed/seed-loader.ts reset             # Clean and re-seed
 *   npx tsx test/seed/seed-loader.ts seed:users        # Users only
 *   npx tsx test/seed/seed-loader.ts seed:films        # Films only
 *   npx tsx test/seed/seed-loader.ts seed:docs         # Documents only
 *   npx tsx test/seed/seed-loader.ts seed:coach        # Coach data (tasks, notes, activities)
 *   npx tsx test/seed/seed-loader.ts seed:club         # Tournament data
 *   npx tsx test/seed/seed-loader.ts seed:teams        # Tournament teams with rosters
 *   npx tsx test/seed/seed-loader.ts seed:verifications# Verification queue data
 *   npx tsx test/seed/seed-loader.ts seed:payments     # Tournament payment data
 *   npx tsx test/seed/seed-loader.ts seed:pipeline     # Recruiter pipeline data
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  testUserData,
  TestUserData,
  filmData,
  FilmData,
  documentData,
  DocumentData,
  coachActivities,
  ActivityData,
  coachTasks,
  TaskData,
  coachNotes,
  NoteData,
  tournamentData,
  TournamentData,
  tournamentTeamsData,
  TournamentTeamData,
  verificationQueueData,
  VerificationQueueData,
  tournamentPaymentData,
  TournamentPaymentData,
  recruiterPipelines,
  PipelineProspect,
  getRosterAthletes,
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

// User ID mapping (email -> UUID)
const userIdMap: Map<string, string> = new Map();

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
    repmax_id: userData.repmaxId,
    email: userData.email,
    full_name: userData.fullName,
    roles: userData.roles,
    active_role: userData.activeRole,
    city: userData.city,
    state: userData.state,
    zone: userData.zone,
  });

  if (profileError) {
    throw new Error(`Failed to create profile for ${userData.email}: ${profileError.message}`);
  }

  // 3. Create role-specific profiles
  if (userData.athleteProfile) {
    const { error } = await supabase.from('athlete_profiles').insert({
      profile_id: userId,
      position: userData.athleteProfile.position,
      class_year: userData.athleteProfile.classYear,
      school: userData.athleteProfile.school,
      height: userData.athleteProfile.height,
      weight: userData.athleteProfile.weight,
      forty_yard: userData.athleteProfile.fortyYard,
      vertical: userData.athleteProfile.vertical,
      bench: userData.athleteProfile.bench,
      squat: userData.athleteProfile.squat,
      gpa: userData.athleteProfile.gpa,
      sat: userData.athleteProfile.sat,
      act: userData.athleteProfile.act,
      bio: userData.athleteProfile.bio,
      verified: userData.athleteProfile.verified,
      profile_completeness: userData.athleteProfile.profileCompleteness,
    });

    if (error) {
      console.warn(`  Warning: athlete_profiles insert failed: ${error.message}`);
    }
  }

  if (userData.parentProfile) {
    const { error } = await supabase.from('parent_profiles').insert({
      profile_id: userId,
      relationship: userData.parentProfile.relationship,
    });

    if (error) {
      console.warn(`  Warning: parent_profiles insert failed: ${error.message}`);
    }
  }

  if (userData.coachProfile) {
    const { error } = await supabase.from('coach_profiles').insert({
      profile_id: userId,
      team_name: userData.coachProfile.teamName,
      school: userData.coachProfile.school,
    });

    if (error) {
      console.warn(`  Warning: coach_profiles insert failed: ${error.message}`);
    }
  }

  if (userData.recruiterProfile) {
    const { error } = await supabase.from('recruiter_profiles').insert({
      profile_id: userId,
      school: userData.recruiterProfile.school,
      conference: userData.recruiterProfile.conference,
      title: userData.recruiterProfile.title,
      territory: userData.recruiterProfile.territory,
    });

    if (error) {
      console.warn(`  Warning: recruiter_profiles insert failed: ${error.message}`);
    }
  }

  if (userData.clubProfile) {
    const { error } = await supabase.from('club_profiles').insert({
      profile_id: userId,
      organization_name: userData.clubProfile.organizationName,
    });

    if (error) {
      console.warn(`  Warning: club_profiles insert failed: ${error.message}`);
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
// FILM SEEDING
// ============================================

export async function seedFilms(): Promise<SeedResult> {
  const startTime = Date.now();
  const created: string[] = [];
  const errors: string[] = [];

  console.log('\nSeeding films...\n');

  const supabase = getSupabaseClient();

  // Build user ID map if not populated
  if (userIdMap.size === 0) {
    await buildUserIdMap(supabase);
  }

  for (const film of filmData) {
    try {
      const athleteId = userIdMap.get(film.athleteEmail);
      if (!athleteId) {
        throw new Error(`Athlete not found: ${film.athleteEmail}`);
      }

      const { error } = await supabase.from('films').insert({
        athlete_id: athleteId,
        title: film.title,
        type: film.type,
        video_url: film.videoUrl,
        thumbnail_url: film.thumbnailUrl,
        duration: film.duration,
        views: film.views || 0,
        featured: film.featured || false,
        created_at: film.uploadedAt || new Date().toISOString(),
      });

      if (error) {
        throw new Error(error.message);
      }

      created.push(`${film.title} (${film.athleteEmail})`);
      console.log(`  ✓ Created film: ${film.title}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${film.title}: ${message}`);
      console.log(`  ✗ Failed film ${film.title}: ${message}`);
    }
  }

  const duration = Date.now() - startTime;

  console.log('\n--- Film Seed Summary ---');
  console.log(`Created: ${created.length} films`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Duration: ${duration}ms`);

  return { success: errors.length === 0, created, errors, duration };
}

// ============================================
// DOCUMENT SEEDING
// ============================================

export async function seedDocuments(): Promise<SeedResult> {
  const startTime = Date.now();
  const created: string[] = [];
  const errors: string[] = [];

  console.log('\nSeeding documents...\n');

  const supabase = getSupabaseClient();

  if (userIdMap.size === 0) {
    await buildUserIdMap(supabase);
  }

  for (const doc of documentData) {
    try {
      const athleteId = userIdMap.get(doc.athleteEmail);
      if (!athleteId) {
        throw new Error(`Athlete not found: ${doc.athleteEmail}`);
      }

      const { error } = await supabase.from('documents').insert({
        athlete_id: athleteId,
        title: doc.title,
        type: doc.type,
        file_url: doc.fileUrl,
        verified: doc.verified,
        verified_at: doc.verifiedAt,
        created_at: doc.uploadedAt || new Date().toISOString(),
      });

      if (error) {
        throw new Error(error.message);
      }

      created.push(`${doc.title} (${doc.athleteEmail})`);
      console.log(`  ✓ Created document: ${doc.title}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${doc.title}: ${message}`);
      console.log(`  ✗ Failed document ${doc.title}: ${message}`);
    }
  }

  const duration = Date.now() - startTime;

  console.log('\n--- Document Seed Summary ---');
  console.log(`Created: ${created.length} documents`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Duration: ${duration}ms`);

  return { success: errors.length === 0, created, errors, duration };
}

// ============================================
// COACH DATA SEEDING (Tasks, Notes, Activities)
// ============================================

export async function seedCoachData(): Promise<SeedResult> {
  const startTime = Date.now();
  const created: string[] = [];
  const errors: string[] = [];

  console.log('\nSeeding coach data (tasks, notes, activities)...\n');

  const supabase = getSupabaseClient();

  if (userIdMap.size === 0) {
    await buildUserIdMap(supabase);
  }

  // Seed Tasks
  console.log('  Seeding tasks...');
  for (const task of coachTasks) {
    try {
      const coachId = userIdMap.get(task.coachEmail);
      if (!coachId) {
        throw new Error(`Coach not found: ${task.coachEmail}`);
      }

      const athleteId = task.athleteEmail ? userIdMap.get(task.athleteEmail) : null;

      const { error } = await supabase.from('coach_tasks').insert({
        coach_id: coachId,
        athlete_id: athleteId,
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
      console.log(`    ✓ ${task.title}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`Task ${task.title}: ${message}`);
      console.log(`    ✗ ${task.title}: ${message}`);
    }
  }

  // Seed Notes
  console.log('  Seeding notes...');
  for (const note of coachNotes) {
    try {
      const coachId = userIdMap.get(note.coachEmail);
      const athleteId = userIdMap.get(note.athleteEmail);
      if (!coachId || !athleteId) {
        throw new Error(`Coach or athlete not found`);
      }

      const { error } = await supabase.from('coach_notes').insert({
        coach_id: coachId,
        athlete_id: athleteId,
        content: note.content,
        category: note.category,
        created_at: note.createdAt,
      });

      if (error) {
        throw new Error(error.message);
      }

      created.push(`Note: ${note.athleteEmail}`);
      console.log(`    ✓ Note for ${note.athleteEmail}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`Note for ${note.athleteEmail}: ${message}`);
      console.log(`    ✗ Note for ${note.athleteEmail}: ${message}`);
    }
  }

  // Seed Activities
  console.log('  Seeding activities...');
  for (const activity of coachActivities) {
    try {
      const coachId = userIdMap.get(activity.coachEmail);
      const athleteId = userIdMap.get(activity.athleteEmail);
      if (!coachId || !athleteId) {
        throw new Error(`Coach or athlete not found`);
      }

      const { error } = await supabase.from('coach_activities').insert({
        coach_id: coachId,
        athlete_id: athleteId,
        type: activity.type,
        description: activity.description,
        created_at: activity.timestamp,
      });

      if (error) {
        throw new Error(error.message);
      }

      created.push(`Activity: ${activity.type}`);
      console.log(`    ✓ ${activity.type} - ${activity.athleteEmail}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`Activity ${activity.type}: ${message}`);
      console.log(`    ✗ ${activity.type}: ${message}`);
    }
  }

  // Link roster athletes to coach
  console.log('  Linking roster athletes to coach...');
  const coachDavisId = userIdMap.get('coach.davis@test.repmax.com');
  if (coachDavisId) {
    const rosterAthletes = getRosterAthletes();
    for (const athlete of rosterAthletes) {
      try {
        const athleteId = userIdMap.get(athlete.email);
        if (!athleteId) continue;

        const { error } = await supabase.from('coach_roster').insert({
          coach_id: coachDavisId,
          athlete_id: athleteId,
          added_at: new Date().toISOString(),
        });

        if (error && !error.message.includes('duplicate')) {
          throw new Error(error.message);
        }

        created.push(`Roster: ${athlete.email}`);
        console.log(`    ✓ Linked ${athlete.fullName}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`Roster ${athlete.email}: ${message}`);
      }
    }
  }

  const duration = Date.now() - startTime;

  console.log('\n--- Coach Data Seed Summary ---');
  console.log(`Created: ${created.length} items`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Duration: ${duration}ms`);

  return { success: errors.length === 0, created, errors, duration };
}

// ============================================
// CLUB/TOURNAMENT SEEDING
// ============================================

export async function seedTournaments(): Promise<SeedResult> {
  const startTime = Date.now();
  const created: string[] = [];
  const errors: string[] = [];

  console.log('\nSeeding tournaments...\n');

  const supabase = getSupabaseClient();

  if (userIdMap.size === 0) {
    await buildUserIdMap(supabase);
  }

  for (const tournament of tournamentData) {
    try {
      const clubId = userIdMap.get(tournament.clubEmail);
      if (!clubId) {
        throw new Error(`Club owner not found: ${tournament.clubEmail}`);
      }

      const { error } = await supabase.from('tournaments').insert({
        organizer_id: clubId,
        name: tournament.name,
        start_date: tournament.startDate,
        end_date: tournament.endDate,
        location: tournament.location,
        teams_registered: tournament.teamsRegistered,
        teams_capacity: tournament.teamsCapacity,
        entry_fee: tournament.entryFee,
        total_collected: tournament.totalCollected,
        status: tournament.status,
      });

      if (error) {
        throw new Error(error.message);
      }

      created.push(tournament.name);
      console.log(`  ✓ Created tournament: ${tournament.name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${tournament.name}: ${message}`);
      console.log(`  ✗ Failed tournament ${tournament.name}: ${message}`);
    }
  }

  const duration = Date.now() - startTime;

  console.log('\n--- Tournament Seed Summary ---');
  console.log(`Created: ${created.length} tournaments`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Duration: ${duration}ms`);

  return { success: errors.length === 0, created, errors, duration };
}

// ============================================
// TOURNAMENT TEAMS SEEDING
// ============================================

// Map to store tournament IDs by name
const tournamentIdMap: Map<string, string> = new Map();

export async function seedTournamentTeams(): Promise<SeedResult> {
  const startTime = Date.now();
  const created: string[] = [];
  const errors: string[] = [];

  console.log('\nSeeding tournament teams...\n');

  const supabase = getSupabaseClient();

  if (userIdMap.size === 0) {
    await buildUserIdMap(supabase);
  }

  // Build tournament ID map
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('id, name');

  if (tournaments) {
    for (const t of tournaments) {
      tournamentIdMap.set(t.name, t.id);
    }
  }

  for (const team of tournamentTeamsData) {
    try {
      const tournamentId = tournamentIdMap.get(team.tournamentName);
      if (!tournamentId) {
        throw new Error(`Tournament not found: ${team.tournamentName}`);
      }

      // Insert team
      const { data: insertedTeam, error: teamError } = await supabase
        .from('tournament_teams')
        .insert({
          tournament_id: tournamentId,
          name: team.name,
          coach_name: team.coachName,
          contact_email: team.contactEmail,
          division: team.division,
          pool: team.pool,
          payment_status: team.paymentStatus,
          payment_amount: team.paymentAmount,
          payment_date: team.paymentDate,
          athletes_count: team.athletesCount,
          athletes_verified: team.athletesVerified,
        })
        .select()
        .single();

      if (teamError) {
        throw new Error(teamError.message);
      }

      // Insert team athletes/roster
      if (insertedTeam && team.roster.length > 0) {
        const rosterEntries = team.roster.map((athlete) => ({
          team_id: insertedTeam.id,
          name: athlete.name,
          position: athlete.position,
          jersey_number: athlete.jerseyNumber,
          verified: athlete.verified,
        }));

        const { error: rosterError } = await supabase
          .from('tournament_team_athletes')
          .insert(rosterEntries);

        if (rosterError) {
          console.warn(`  Warning: Failed to insert roster for ${team.name}: ${rosterError.message}`);
        }
      }

      created.push(`${team.name} (${team.division})`);
      console.log(`  ✓ Created team: ${team.name} with ${team.roster.length} athletes`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${team.name}: ${message}`);
      console.log(`  ✗ Failed team ${team.name}: ${message}`);
    }
  }

  const duration = Date.now() - startTime;

  console.log('\n--- Tournament Teams Seed Summary ---');
  console.log(`Created: ${created.length} teams`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Duration: ${duration}ms`);

  return { success: errors.length === 0, created, errors, duration };
}

// ============================================
// VERIFICATION QUEUE SEEDING
// ============================================

export async function seedVerificationQueue(): Promise<SeedResult> {
  const startTime = Date.now();
  const created: string[] = [];
  const errors: string[] = [];

  console.log('\nSeeding verification queue...\n');

  const supabase = getSupabaseClient();

  if (userIdMap.size === 0) {
    await buildUserIdMap(supabase);
  }

  for (const verification of verificationQueueData) {
    try {
      const clubId = userIdMap.get(verification.clubEmail);
      if (!clubId) {
        throw new Error(`Club owner not found: ${verification.clubEmail}`);
      }

      const { error } = await supabase.from('athlete_verifications').insert({
        club_id: clubId,
        athlete_name: verification.athleteName,
        team_name: verification.teamName,
        division: verification.division,
        type: verification.type,
        method: verification.method,
        status: verification.status,
        notes: verification.notes,
        submitted_at: verification.submittedAt,
      });

      if (error) {
        throw new Error(error.message);
      }

      created.push(`${verification.athleteName} (${verification.type})`);
      console.log(`  ✓ Created verification: ${verification.athleteName} - ${verification.type}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${verification.athleteName}: ${message}`);
      console.log(`  ✗ Failed verification ${verification.athleteName}: ${message}`);
    }
  }

  const duration = Date.now() - startTime;

  console.log('\n--- Verification Queue Seed Summary ---');
  console.log(`Created: ${created.length} verifications`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Duration: ${duration}ms`);

  return { success: errors.length === 0, created, errors, duration };
}

// ============================================
// TOURNAMENT PAYMENTS SEEDING
// ============================================

export async function seedTournamentPayments(): Promise<SeedResult> {
  const startTime = Date.now();
  const created: string[] = [];
  const errors: string[] = [];

  console.log('\nSeeding tournament payments...\n');

  const supabase = getSupabaseClient();

  // Build tournament ID map if not populated
  if (tournamentIdMap.size === 0) {
    const { data: tournaments } = await supabase
      .from('tournaments')
      .select('id, name');

    if (tournaments) {
      for (const t of tournaments) {
        tournamentIdMap.set(t.name, t.id);
      }
    }
  }

  // Get team IDs map
  const teamIdMap: Map<string, string> = new Map();
  const { data: teams } = await supabase
    .from('tournament_teams')
    .select('id, name');

  if (teams) {
    for (const t of teams) {
      teamIdMap.set(t.name, t.id);
    }
  }

  for (const payment of tournamentPaymentData) {
    try {
      const tournamentId = tournamentIdMap.get(payment.tournamentName);
      const teamId = teamIdMap.get(payment.teamName);

      if (!tournamentId) {
        throw new Error(`Tournament not found: ${payment.tournamentName}`);
      }

      const { error } = await supabase.from('tournament_payments').insert({
        tournament_id: tournamentId,
        team_id: teamId,
        team_name: payment.teamName,
        division: payment.division,
        amount: payment.amount,
        status: payment.status,
        payment_method: payment.paymentMethod,
        paid_at: payment.paidAt,
        description: payment.description,
      });

      if (error) {
        throw new Error(error.message);
      }

      created.push(`${payment.teamName} - $${payment.amount}`);
      console.log(`  ✓ Created payment: ${payment.teamName} - $${payment.amount} (${payment.status})`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${payment.teamName}: ${message}`);
      console.log(`  ✗ Failed payment ${payment.teamName}: ${message}`);
    }
  }

  const duration = Date.now() - startTime;

  console.log('\n--- Tournament Payments Seed Summary ---');
  console.log(`Created: ${created.length} payments`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Duration: ${duration}ms`);

  return { success: errors.length === 0, created, errors, duration };
}

// ============================================
// RECRUITER PIPELINE SEEDING
// ============================================

export async function seedRecruiterPipelines(): Promise<SeedResult> {
  const startTime = Date.now();
  const created: string[] = [];
  const errors: string[] = [];

  console.log('\nSeeding recruiter pipelines...\n');

  const supabase = getSupabaseClient();

  if (userIdMap.size === 0) {
    await buildUserIdMap(supabase);
  }

  for (const prospect of recruiterPipelines) {
    try {
      const recruiterId = userIdMap.get(prospect.recruiterEmail);
      if (!recruiterId) {
        throw new Error(`Recruiter not found: ${prospect.recruiterEmail}`);
      }

      const athleteId = prospect.athleteEmail ? userIdMap.get(prospect.athleteEmail) : null;

      const { error } = await supabase.from('recruiter_pipeline').insert({
        recruiter_id: recruiterId,
        athlete_id: athleteId,
        prospect_name: prospect.prospectName,
        position: prospect.position,
        school: prospect.school,
        class_year: prospect.classYear,
        status: prospect.status,
        notes: prospect.notes,
        added_at: prospect.addedAt,
      });

      if (error) {
        throw new Error(error.message);
      }

      created.push(`${prospect.prospectName} (${prospect.recruiterEmail})`);
      console.log(`  ✓ Added ${prospect.prospectName} to pipeline`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${prospect.prospectName}: ${message}`);
      console.log(`  ✗ Failed ${prospect.prospectName}: ${message}`);
    }
  }

  const duration = Date.now() - startTime;

  console.log('\n--- Pipeline Seed Summary ---');
  console.log(`Created: ${created.length} prospects`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Duration: ${duration}ms`);

  return { success: errors.length === 0, created, errors, duration };
}

// ============================================
// ADDITIONAL TEST DATA (Profile Views, Shortlists)
// ============================================

export async function seedTestData(): Promise<void> {
  console.log('\nSeeding additional test data...\n');

  const supabase = getSupabaseClient();

  if (userIdMap.size === 0) {
    await buildUserIdMap(supabase);
  }

  const athletes = testUserData.filter((u) => u.roles.includes('athlete'));
  const recruiters = testUserData.filter((u) => u.roles.includes('recruiter'));

  // Seed profile views for athletes
  for (const athlete of athletes.slice(0, 5)) {
    // Just core athletes
    const athleteId = userIdMap.get(athlete.email);
    if (!athleteId) continue;

    const views = [];
    for (let i = 0; i < 10; i++) {
      const recruiter = recruiters[i % recruiters.length];
      const recruiterId = userIdMap.get(recruiter.email);
      if (!recruiterId) continue;

      views.push({
        athlete_id: athleteId,
        viewer_id: recruiterId,
        viewer_role: 'recruiter',
        viewer_zone: recruiter.zone || 'SOUTHWEST',
        viewer_school: recruiter.recruiterProfile?.school,
        section_viewed: ['stats', 'film', 'academics'][i % 3],
        viewed_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    const { error } = await supabase.from('profile_views').insert(views);
    if (!error) {
      console.log(`  ✓ Created ${views.length} profile views for ${athlete.email}`);
    }
  }

  // Seed shortlists for recruiters
  for (const recruiter of recruiters) {
    const recruiterId = userIdMap.get(recruiter.email);
    if (!recruiterId) continue;

    const { data: shortlist, error: shortlistError } = await supabase
      .from('shortlists')
      .insert({
        recruiter_id: recruiterId,
        name: 'Top Targets 2026',
      })
      .select()
      .single();

    if (shortlistError || !shortlist) continue;

    const athleteEntries = athletes.slice(0, 5).map((a) => ({
      shortlist_id: shortlist.id,
      athlete_id: userIdMap.get(a.email),
      notes: 'Priority prospect',
    }));

    const { error } = await supabase.from('shortlist_athletes').insert(athleteEntries);
    if (!error) {
      console.log(`  ✓ Created shortlist with ${athleteEntries.length} athletes for ${recruiter.email}`);
    }
  }

  // Link parent to athlete
  const lisaId = userIdMap.get('lisa.washington@test.repmax.com');
  const jaylenId = userIdMap.get('jaylen.washington@test.repmax.com');
  if (lisaId && jaylenId) {
    const { error } = await supabase.from('parent_athlete_links').insert({
      parent_id: lisaId,
      athlete_id: jaylenId,
      relationship: 'mother',
      status: 'active',
      verified_at: new Date().toISOString(),
    });

    if (!error) {
      console.log('  ✓ Linked Lisa Washington to Jaylen Washington');
    }
  }

  console.log('\n✓ Additional test data seeded');
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

async function buildUserIdMap(supabase: SupabaseClient): Promise<void> {
  console.log('Building user ID map...');

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email')
    .in(
      'email',
      testUserData.map((u) => u.email)
    );

  if (profiles) {
    for (const profile of profiles) {
      userIdMap.set(profile.email, profile.id);
    }
    console.log(`  Found ${profiles.length} existing users\n`);
  }
}

// ============================================
// FULL SEED
// ============================================

async function seedAll(): Promise<void> {
  console.log('='.repeat(60));
  console.log('REPMAX v2 - FULL SEED');
  console.log('='.repeat(60));

  // Seed users first
  await seedTestUsers();

  // Seed related data (these may fail gracefully if tables don't exist)
  try {
    await seedFilms();
  } catch (e) {
    console.log('  Skipped films (table may not exist)');
  }

  try {
    await seedDocuments();
  } catch (e) {
    console.log('  Skipped documents (table may not exist)');
  }

  try {
    await seedCoachData();
  } catch (e) {
    console.log('  Skipped coach data (tables may not exist)');
  }

  try {
    await seedTournaments();
  } catch (e) {
    console.log('  Skipped tournaments (table may not exist)');
  }

  try {
    await seedTournamentTeams();
  } catch (e) {
    console.log('  Skipped tournament teams (table may not exist)');
  }

  try {
    await seedVerificationQueue();
  } catch (e) {
    console.log('  Skipped verification queue (table may not exist)');
  }

  try {
    await seedTournamentPayments();
  } catch (e) {
    console.log('  Skipped tournament payments (table may not exist)');
  }

  try {
    await seedRecruiterPipelines();
  } catch (e) {
    console.log('  Skipped pipelines (table may not exist)');
  }

  try {
    await seedTestData();
  } catch (e) {
    console.log('  Skipped test data (tables may not exist)');
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
    case 'seed:films':
      await seedFilms();
      break;
    case 'seed:docs':
      await seedDocuments();
      break;
    case 'seed:coach':
      await seedCoachData();
      break;
    case 'seed:club':
      await seedTournaments();
      break;
    case 'seed:teams':
      await seedTournamentTeams();
      break;
    case 'seed:verifications':
      await seedVerificationQueue();
      break;
    case 'seed:payments':
      await seedTournamentPayments();
      break;
    case 'seed:pipeline':
      await seedRecruiterPipelines();
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
      console.log('  seed:films        - Create film data only');
      console.log('  seed:docs         - Create document data only');
      console.log('  seed:coach        - Create coach data (tasks, notes, activities)');
      console.log('  seed:club         - Create tournament data');
      console.log('  seed:teams        - Create tournament teams with rosters');
      console.log('  seed:verifications- Create verification queue data');
      console.log('  seed:payments     - Create tournament payment data');
      console.log('  seed:pipeline     - Create recruiter pipeline data');
      console.log('  clean             - Remove all test users');
      console.log('  reset             - Clean and re-seed everything');
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
