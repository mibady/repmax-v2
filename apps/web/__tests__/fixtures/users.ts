/**
 * Test User Fixtures
 *
 * Based on USER_TESTING_GUIDE.md - 15 test users total:
 * - 5 Core Test Athletes (Jaylen 100%, Marcus 45%, DeShawn 85%, Sofia 75%, Tyler 5%)
 * - 10 Coach Davis's Roster Athletes
 * - 2 Parents (linked/unlinked)
 * - 1 Coach (Coach Davis with 12 athletes)
 * - 2 Recruiters (TCU and ASU)
 * - 1 Club Owner (Mike Torres with tournament)
 * - 1 Admin
 *
 * All passwords: TestPass123!
 */

export interface TestUser {
  id: string;
  repmaxId: string;
  email: string;
  password: string;
  fullName: string;
  roles: string[];
  activeRole: string;
  avatarUrl?: string;
  city?: string;
  state?: string;
  zone?: string;
  athleteProfile?: AthleteProfile;
  parentProfile?: ParentProfile;
  coachProfile?: CoachProfile;
  recruiterProfile?: RecruiterProfile;
  clubProfile?: ClubProfile;
}

export interface AthleteProfile {
  position: string;
  classYear: number;
  school: string;
  height?: string;
  weight?: number;
  fortyYard?: number;
  vertical?: number;
  bench?: number;
  squat?: number;
  gpa?: number;
  sat?: number;
  act?: number;
  bio?: string;
  profileCompleteness: number;
  verified: boolean;
}

export interface ParentProfile {
  relationship: string;
  linkedAthleteId?: string;
  linkStatus: 'pending' | 'active' | 'revoked' | 'none';
}

export interface CoachProfile {
  teamId: string;
  teamName: string;
  school: string;
  rosterCount: number;
  activitiesCount?: number;
  tasksCount?: number;
  notesCount?: number;
}

export interface RecruiterProfile {
  school: string;
  conference: string;
  title: string;
  territory: string[];
  pipelineCount?: number;
  scheduledVisits?: number;
}

export interface ClubProfile {
  organizationId: string;
  organizationName: string;
  activeTournaments: number;
  tournamentName?: string;
  tournamentDate?: string;
  teamsRegistered?: number;
  amountCollected?: number;
}

// Standard test password for all users
export const TEST_PASSWORD = 'TestPass123!';

// ============================================
// GROUP A: CORE TEST ATHLETES (5)
// ============================================

/**
 * Jaylen Washington - Golden Path Athlete
 * 100% profile completion, everything works perfectly
 * QB at Riverside Poly HS
 */
export const jaylenWashington: TestUser = {
  id: 'athlete-001',
  repmaxId: 'REP-JW-2026',
  email: 'jaylen.washington@test.repmax.com',
  password: TEST_PASSWORD,
  fullName: 'Jaylen Washington',
  roles: ['athlete'],
  activeRole: 'athlete',
  city: 'Riverside',
  state: 'CA',
  zone: 'WEST',
  athleteProfile: {
    position: 'QB',
    classYear: 2026,
    school: 'Riverside Poly HS',
    height: "6'2\"",
    weight: 195,
    fortyYard: 4.55,
    vertical: 34.5,
    bench: 265,
    squat: 405,
    gpa: 3.8,
    sat: 1280,
    bio: 'Elite dual-threat QB. State semifinalist 2025. Camp MVP at Elite 11 Regional. 3-year starter with 8,500+ career passing yards.',
    profileCompleteness: 100,
    verified: true,
  },
};

/**
 * Marcus Thompson - Incomplete Profile
 * 45% completion, tests upgrade prompts and incomplete states
 */
export const marcusThompson: TestUser = {
  id: 'athlete-002',
  repmaxId: 'REP-MT-2026',
  email: 'marcus.thompson@test.repmax.com',
  password: TEST_PASSWORD,
  fullName: 'Marcus Thompson',
  roles: ['athlete'],
  activeRole: 'athlete',
  city: 'Houston',
  state: 'TX',
  zone: 'SOUTHWEST',
  athleteProfile: {
    position: 'RB',
    classYear: 2026,
    school: 'Katy High School',
    height: "5'10\"",
    weight: 195,
    profileCompleteness: 45,
    verified: false,
  },
};

/**
 * DeShawn Harris - Newly Onboarded
 * 85% completion, just finished onboarding
 */
export const deshawnHarris: TestUser = {
  id: 'athlete-003',
  repmaxId: 'REP-DH-2026',
  email: 'deshawn.harris@test.repmax.com',
  password: TEST_PASSWORD,
  fullName: 'DeShawn Harris',
  roles: ['athlete'],
  activeRole: 'athlete',
  city: 'Atlanta',
  state: 'GA',
  zone: 'SOUTHEAST',
  athleteProfile: {
    position: 'WR',
    classYear: 2026,
    school: 'North Gwinnett HS',
    height: "6'1\"",
    weight: 180,
    fortyYard: 4.45,
    vertical: 38.0,
    gpa: 3.5,
    bio: 'Speed receiver with excellent route running. 1,200 yards receiving junior year.',
    profileCompleteness: 85,
    verified: true,
  },
};

/**
 * Sofia Rodriguez - Multi-Role User
 * 75% completion, has both athlete and club roles
 */
export const sofiaRodriguez: TestUser = {
  id: 'athlete-004',
  repmaxId: 'REP-SR-2026',
  email: 'sofia.rodriguez@test.repmax.com',
  password: TEST_PASSWORD,
  fullName: 'Sofia Rodriguez',
  roles: ['athlete', 'club'],
  activeRole: 'athlete',
  city: 'Miami',
  state: 'FL',
  zone: 'SOUTHEAST',
  athleteProfile: {
    position: 'DB',
    classYear: 2026,
    school: 'Miami Central',
    height: "5'8\"",
    weight: 160,
    fortyYard: 4.55,
    profileCompleteness: 75,
    verified: true,
  },
  clubProfile: {
    organizationId: 'org-003',
    organizationName: 'Southeast Elite 7v7',
    activeTournaments: 1,
  },
};

/**
 * Tyler Chen - Empty State Tester
 * 5% completion (just created account), tests all empty states
 */
export const tylerChen: TestUser = {
  id: 'athlete-005',
  repmaxId: 'REP-TC-2027',
  email: 'tyler.chen@test.repmax.com',
  password: TEST_PASSWORD,
  fullName: 'Tyler Chen',
  roles: ['athlete'],
  activeRole: 'athlete',
  city: 'San Jose',
  state: 'CA',
  zone: 'WEST',
  athleteProfile: {
    position: 'QB',
    classYear: 2027,
    school: 'Bellarmine Prep',
    profileCompleteness: 5,
    verified: false,
  },
};

// ============================================
// GROUP B: COACH DAVIS'S ROSTER (10 Athletes)
// ============================================

export const andreMitchell: TestUser = {
  id: 'roster-001',
  repmaxId: 'REP-AM-2026',
  email: 'andre.mitchell@test.repmax.com',
  password: TEST_PASSWORD,
  fullName: 'Andre Mitchell',
  roles: ['athlete'],
  activeRole: 'athlete',
  city: 'Dallas',
  state: 'TX',
  zone: 'SOUTHWEST',
  athleteProfile: {
    position: 'WR',
    classYear: 2026,
    school: 'Allen High School',
    height: "6'0\"",
    weight: 175,
    fortyYard: 4.48,
    profileCompleteness: 70,
    verified: true,
  },
};

export const devonBrooks: TestUser = {
  id: 'roster-002',
  repmaxId: 'REP-DB-2026',
  email: 'devon.brooks@test.repmax.com',
  password: TEST_PASSWORD,
  fullName: 'Devon Brooks',
  roles: ['athlete'],
  activeRole: 'athlete',
  city: 'Dallas',
  state: 'TX',
  zone: 'SOUTHWEST',
  athleteProfile: {
    position: 'RB',
    classYear: 2026,
    school: 'Allen High School',
    height: "5'9\"",
    weight: 185,
    fortyYard: 4.52,
    profileCompleteness: 65,
    verified: true,
  },
};

export const ryanPark: TestUser = {
  id: 'roster-003',
  repmaxId: 'REP-RP-2026',
  email: 'ryan.park@test.repmax.com',
  password: TEST_PASSWORD,
  fullName: 'Ryan Park',
  roles: ['athlete'],
  activeRole: 'athlete',
  city: 'Dallas',
  state: 'TX',
  zone: 'SOUTHWEST',
  athleteProfile: {
    position: 'OL',
    classYear: 2026,
    school: 'Allen High School',
    height: "6'4\"",
    weight: 285,
    profileCompleteness: 60,
    verified: true,
  },
};

export const carlosMendez: TestUser = {
  id: 'roster-004',
  repmaxId: 'REP-CM-2026',
  email: 'carlos.mendez@test.repmax.com',
  password: TEST_PASSWORD,
  fullName: 'Carlos Mendez',
  roles: ['athlete'],
  activeRole: 'athlete',
  city: 'Dallas',
  state: 'TX',
  zone: 'SOUTHWEST',
  athleteProfile: {
    position: 'LB',
    classYear: 2026,
    school: 'Allen High School',
    height: "6'1\"",
    weight: 215,
    fortyYard: 4.62,
    profileCompleteness: 55,
    verified: false,
  },
};

export const jamalCarter: TestUser = {
  id: 'roster-005',
  repmaxId: 'REP-JC-2026',
  email: 'jamal.carter@test.repmax.com',
  password: TEST_PASSWORD,
  fullName: 'Jamal Carter',
  roles: ['athlete'],
  activeRole: 'athlete',
  city: 'Dallas',
  state: 'TX',
  zone: 'SOUTHWEST',
  athleteProfile: {
    position: 'DB',
    classYear: 2026,
    school: 'Allen High School',
    height: "5'11\"",
    weight: 175,
    fortyYard: 4.45,
    profileCompleteness: 80,
    verified: true,
  },
};

export const tylerGreen: TestUser = {
  id: 'roster-006',
  repmaxId: 'REP-TG-2026',
  email: 'tyler.green@test.repmax.com',
  password: TEST_PASSWORD,
  fullName: 'Tyler Green',
  roles: ['athlete'],
  activeRole: 'athlete',
  city: 'Dallas',
  state: 'TX',
  zone: 'SOUTHWEST',
  athleteProfile: {
    position: 'TE',
    classYear: 2026,
    school: 'Allen High School',
    height: "6'3\"",
    weight: 235,
    profileCompleteness: 50,
    verified: false,
  },
};

export const noahWilliams: TestUser = {
  id: 'roster-007',
  repmaxId: 'REP-NW-2027',
  email: 'noah.williams@test.repmax.com',
  password: TEST_PASSWORD,
  fullName: 'Noah Williams',
  roles: ['athlete'],
  activeRole: 'athlete',
  city: 'Dallas',
  state: 'TX',
  zone: 'SOUTHWEST',
  athleteProfile: {
    position: 'QB',
    classYear: 2027,
    school: 'Allen High School',
    height: "6'1\"",
    weight: 185,
    fortyYard: 4.65,
    profileCompleteness: 45,
    verified: false,
  },
};

export const isaiahBrown: TestUser = {
  id: 'roster-008',
  repmaxId: 'REP-IB-2027',
  email: 'isaiah.brown@test.repmax.com',
  password: TEST_PASSWORD,
  fullName: 'Isaiah Brown',
  roles: ['athlete'],
  activeRole: 'athlete',
  city: 'Dallas',
  state: 'TX',
  zone: 'SOUTHWEST',
  athleteProfile: {
    position: 'DL',
    classYear: 2027,
    school: 'Allen High School',
    height: "6'2\"",
    weight: 255,
    profileCompleteness: 40,
    verified: false,
  },
};

export const michaelLee: TestUser = {
  id: 'roster-009',
  repmaxId: 'REP-ML-2026',
  email: 'michael.lee@test.repmax.com',
  password: TEST_PASSWORD,
  fullName: 'Michael Lee',
  roles: ['athlete'],
  activeRole: 'athlete',
  city: 'Dallas',
  state: 'TX',
  zone: 'SOUTHWEST',
  athleteProfile: {
    position: 'K',
    classYear: 2026,
    school: 'Allen High School',
    height: "5'10\"",
    weight: 165,
    profileCompleteness: 35,
    verified: false,
  },
};

export const diegoSantos: TestUser = {
  id: 'roster-010',
  repmaxId: 'REP-DS-2027',
  email: 'diego.santos@test.repmax.com',
  password: TEST_PASSWORD,
  fullName: 'Diego Santos',
  roles: ['athlete'],
  activeRole: 'athlete',
  city: 'Dallas',
  state: 'TX',
  zone: 'SOUTHWEST',
  athleteProfile: {
    position: 'WR',
    classYear: 2027,
    school: 'Allen High School',
    height: "5'9\"",
    weight: 160,
    fortyYard: 4.42,
    profileCompleteness: 30,
    verified: false,
  },
};

// ============================================
// PARENT TEST USERS (2)
// ============================================

/**
 * Lisa Washington - Linked Parent
 * Active link to Jaylen Washington
 */
export const lisaWashington: TestUser = {
  id: 'parent-001',
  repmaxId: 'REP-LW-0001',
  email: 'lisa.washington@test.repmax.com',
  password: TEST_PASSWORD,
  fullName: 'Lisa Washington',
  roles: ['parent'],
  activeRole: 'parent',
  city: 'Riverside',
  state: 'CA',
  zone: 'WEST',
  parentProfile: {
    relationship: 'mother',
    linkedAthleteId: 'athlete-001', // Linked to Jaylen
    linkStatus: 'active',
  },
};

/**
 * Karen Thompson - Unlinked Parent
 * Tests the linking flow
 */
export const karenThompson: TestUser = {
  id: 'parent-002',
  repmaxId: 'REP-KT-0001',
  email: 'karen.thompson@test.repmax.com',
  password: TEST_PASSWORD,
  fullName: 'Karen Thompson',
  roles: ['parent'],
  activeRole: 'parent',
  city: 'Houston',
  state: 'TX',
  zone: 'SOUTHWEST',
  parentProfile: {
    relationship: 'mother',
    linkStatus: 'none', // Not linked yet
  },
};

// ============================================
// COACH TEST USER (1)
// ============================================

/**
 * Coach James Davis - Primary Coach
 * 12 athletes on roster, 9 activities, 6 tasks, 5 notes
 */
export const coachDavis: TestUser = {
  id: 'coach-001',
  repmaxId: 'REP-CD-0001',
  email: 'coach.davis@test.repmax.com',
  password: TEST_PASSWORD,
  fullName: 'James Davis',
  roles: ['coach'],
  activeRole: 'coach',
  city: 'Dallas',
  state: 'TX',
  zone: 'SOUTHWEST',
  coachProfile: {
    teamId: 'team-001',
    teamName: 'Allen Eagles',
    school: 'Allen High School',
    rosterCount: 12,
    activitiesCount: 9,
    tasksCount: 6,
    notesCount: 5,
  },
};

// ============================================
// RECRUITER TEST USERS (2)
// ============================================

/**
 * Coach Brian Williams - TCU Recruiter
 * 31 pipeline prospects, 3 scheduled visits
 */
export const coachWilliams: TestUser = {
  id: 'recruiter-001',
  repmaxId: 'REP-BW-0001',
  email: 'coach.williams@test.repmax.com',
  password: TEST_PASSWORD,
  fullName: 'Brian Williams',
  roles: ['recruiter'],
  activeRole: 'recruiter',
  city: 'Fort Worth',
  state: 'TX',
  zone: 'SOUTHWEST',
  recruiterProfile: {
    school: 'TCU',
    conference: 'Big 12',
    title: 'Wide Receivers Coach / Recruiting Coordinator',
    territory: ['SOUTHWEST', 'SOUTHEAST'],
    pipelineCount: 31,
    scheduledVisits: 3,
  },
};

/**
 * Coach Alex Martinez - ASU Recruiter
 * Southwest territory specialist
 */
export const coachMartinez: TestUser = {
  id: 'recruiter-002',
  repmaxId: 'REP-AM-0001',
  email: 'coach.martinez@test.repmax.com',
  password: TEST_PASSWORD,
  fullName: 'Alex Martinez',
  roles: ['recruiter'],
  activeRole: 'recruiter',
  city: 'Tempe',
  state: 'AZ',
  zone: 'SOUTHWEST',
  recruiterProfile: {
    school: 'Arizona State',
    conference: 'Big 12',
    title: 'Director of Player Personnel',
    territory: ['WEST', 'SOUTHWEST'],
    pipelineCount: 24,
    scheduledVisits: 2,
  },
};

// ============================================
// CLUB ORGANIZER TEST USER (1)
// ============================================

/**
 * Mike Torres - Club Owner
 * Runs Texas Elite 7v7, Winter Classic 2026 tournament
 * 12 teams, $4,500 collected, live game in progress
 */
export const mikeTorres: TestUser = {
  id: 'club-001',
  repmaxId: 'REP-MT-0001',
  email: 'mike.torres@test.repmax.com',
  password: TEST_PASSWORD,
  fullName: 'Mike Torres',
  roles: ['club'],
  activeRole: 'club',
  city: 'Austin',
  state: 'TX',
  zone: 'SOUTHWEST',
  clubProfile: {
    organizationId: 'org-001',
    organizationName: 'Texas Elite 7v7',
    activeTournaments: 2,
    tournamentName: 'Winter Classic 2026',
    tournamentDate: '2026-02-15',
    teamsRegistered: 12,
    amountCollected: 4500,
  },
};

// ============================================
// ADMIN TEST USER (1)
// ============================================

export const adminUser: TestUser = {
  id: 'admin-001',
  repmaxId: 'REP-ADMIN-0001',
  email: 'admin@repmax.com',
  password: TEST_PASSWORD,
  fullName: 'Admin User',
  roles: ['admin'],
  activeRole: 'admin',
};

// ============================================
// AGGREGATED TEST USERS
// ============================================

// Core test athletes (5)
export const coreAthletes: TestUser[] = [
  jaylenWashington,
  marcusThompson,
  deshawnHarris,
  sofiaRodriguez,
  tylerChen,
];

// Coach Davis's roster athletes (10)
export const rosterAthletes: TestUser[] = [
  andreMitchell,
  devonBrooks,
  ryanPark,
  carlosMendez,
  jamalCarter,
  tylerGreen,
  noahWilliams,
  isaiahBrown,
  michaelLee,
  diegoSantos,
];

// All athletes (15)
export const allAthletes: TestUser[] = [...coreAthletes, ...rosterAthletes];

// All test users (complete set)
export const testUsers: Record<string, TestUser> = {
  // Core athletes
  jaylenWashington,
  marcusThompson,
  deshawnHarris,
  sofiaRodriguez,
  tylerChen,
  // Roster athletes
  andreMitchell,
  devonBrooks,
  ryanPark,
  carlosMendez,
  jamalCarter,
  tylerGreen,
  noahWilliams,
  isaiahBrown,
  michaelLee,
  diegoSantos,
  // Parents
  lisaWashington,
  karenThompson,
  // Coach
  coachDavis,
  // Recruiters
  coachWilliams,
  coachMartinez,
  // Club
  mikeTorres,
  // Admin
  adminUser,
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function getAthleteUsers(): TestUser[] {
  return Object.values(testUsers).filter((u) => u.roles.includes('athlete'));
}

export function getCoreAthletes(): TestUser[] {
  return coreAthletes;
}

export function getRosterAthletes(): TestUser[] {
  return rosterAthletes;
}

export function getParentUsers(): TestUser[] {
  return Object.values(testUsers).filter((u) => u.roles.includes('parent'));
}

export function getCoachUsers(): TestUser[] {
  return Object.values(testUsers).filter((u) => u.roles.includes('coach'));
}

export function getRecruiterUsers(): TestUser[] {
  return Object.values(testUsers).filter((u) => u.roles.includes('recruiter'));
}

export function getClubUsers(): TestUser[] {
  return Object.values(testUsers).filter((u) => u.roles.includes('club'));
}

export function getUserById(id: string): TestUser | undefined {
  return Object.values(testUsers).find((u) => u.id === id);
}

export function getUserByEmail(email: string): TestUser | undefined {
  return Object.values(testUsers).find((u) => u.email === email);
}

export function getUsersByCompleteness(min: number, max: number): TestUser[] {
  return getAthleteUsers().filter((u) => {
    const completeness = u.athleteProfile?.profileCompleteness ?? 0;
    return completeness >= min && completeness <= max;
  });
}

export function getVerifiedAthletes(): TestUser[] {
  return getAthleteUsers().filter((u) => u.athleteProfile?.verified === true);
}

export function getUnverifiedAthletes(): TestUser[] {
  return getAthleteUsers().filter((u) => u.athleteProfile?.verified === false);
}

// Create mock Supabase auth response
export function createMockAuthUser(user: TestUser) {
  return {
    id: user.id,
    email: user.email,
    user_metadata: {
      full_name: user.fullName,
      roles: user.roles,
      active_role: user.activeRole,
      repmax_id: user.repmaxId,
    },
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  };
}

// Create mock profile row
export function createMockProfile(user: TestUser) {
  return {
    id: user.id,
    repmax_id: user.repmaxId,
    email: user.email,
    full_name: user.fullName,
    roles: user.roles,
    active_role: user.activeRole,
    avatar_url: user.avatarUrl,
    city: user.city,
    state: user.state,
    zone: user.zone,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// Create mock athlete profile row
export function createMockAthleteProfile(user: TestUser) {
  if (!user.athleteProfile) return null;

  return {
    profile_id: user.id,
    position: user.athleteProfile.position,
    class_year: user.athleteProfile.classYear,
    school: user.athleteProfile.school,
    height: user.athleteProfile.height,
    weight: user.athleteProfile.weight,
    forty_yard: user.athleteProfile.fortyYard,
    vertical: user.athleteProfile.vertical,
    bench: user.athleteProfile.bench,
    squat: user.athleteProfile.squat,
    gpa: user.athleteProfile.gpa,
    sat: user.athleteProfile.sat,
    act: user.athleteProfile.act,
    bio: user.athleteProfile.bio,
    verified: user.athleteProfile.verified,
    profile_completeness: user.athleteProfile.profileCompleteness,
  };
}
