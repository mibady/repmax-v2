/**
 * Test User Data for Seeding
 *
 * Based on USER_TESTING_GUIDE.md - 22 test users total:
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

// Standard test password
export const TEST_PASSWORD = 'TestPass123!';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface AthleteProfileData {
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
  tenYardSplit?: number;
  fiveTenFive?: number;
  broadJump?: number;
  wingspan?: number;
  weightedGpa?: number;
  coachNotes?: string;
  playerSummary?: string;
  coachPhone?: string;
  coachEmail?: string;
  verified: boolean;
  profileCompleteness: number;
}

export interface ParentProfileData {
  relationship: string;
  linkedAthleteEmail?: string;
}

export interface RecruiterProfileData {
  school: string;
  conference: string;
  title: string;
  territory: string[];
  pipelineCount?: number;
  scheduledVisits?: number;
}

export interface CoachProfileData {
  teamName: string;
  school: string;
  rosterCount?: number;
}

export interface ClubProfileData {
  organizationName: string;
  activeTournaments?: number;
}

export interface SchoolProfileData {
  schoolName: string;
  isVerified?: boolean;
}

export interface TestUserData {
  email: string;
  password: string;
  fullName: string;
  repmaxId: string;
  roles: string[];
  activeRole: string;
  city?: string;
  state?: string;
  zone?: string;
  athleteProfile?: AthleteProfileData;
  parentProfile?: ParentProfileData;
  recruiterProfile?: RecruiterProfileData;
  coachProfile?: CoachProfileData;
  clubProfile?: ClubProfileData;
  schoolProfile?: SchoolProfileData;
}

// ============================================
// HIGHLIGHT DATA (maps to highlights table)
// ============================================

export interface HighlightData {
  athleteEmail: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  viewCount?: number;
  createdAt?: string;
}

export const highlightData: HighlightData[] = [
  {
    athleteEmail: 'jaylen.washington@test.repmax.io',
    title: 'Junior Season Highlights 2025',
    description: 'Full junior year highlight reel - passing, rushing, and leadership moments.',
    videoUrl: 'https://storage.repmax.io/films/jaylen-junior-highlights.mp4',
    thumbnailUrl: 'https://storage.repmax.io/thumbnails/jaylen-junior-thumb.jpg',
    durationSeconds: 245,
    viewCount: 1847,
    createdAt: '2025-11-15T10:00:00Z',
  },
  {
    athleteEmail: 'jaylen.washington@test.repmax.io',
    title: 'Nike Elite 11 Regional - Camp Footage',
    description: 'Elite 11 regional camp performance footage.',
    videoUrl: 'https://storage.repmax.io/films/jaylen-elite11-camp.mp4',
    thumbnailUrl: 'https://storage.repmax.io/thumbnails/jaylen-elite11-thumb.jpg',
    durationSeconds: 180,
    viewCount: 523,
    createdAt: '2025-06-22T14:30:00Z',
  },
  {
    athleteEmail: 'jaylen.washington@test.repmax.io',
    title: 'Week 8 vs. Corona Centennial - Full Game',
    description: 'Full game film from rivalry matchup.',
    videoUrl: 'https://storage.repmax.io/films/jaylen-week8-game.mp4',
    thumbnailUrl: 'https://storage.repmax.io/thumbnails/jaylen-week8-thumb.jpg',
    durationSeconds: 7200,
    viewCount: 312,
    createdAt: '2025-10-20T08:00:00Z',
  },
  {
    athleteEmail: 'deshawn.harris@test.repmax.io',
    title: 'Route Running Drills',
    description: 'Practice drill footage showing route tree mastery.',
    videoUrl: 'https://storage.repmax.io/films/deshawn-routes.mp4',
    durationSeconds: 120,
    viewCount: 89,
    createdAt: '2025-12-01T16:00:00Z',
  },
];

// ============================================
// COACH TASKS DATA
// ============================================

export interface TaskData {
  coachEmail: string;
  title: string;
  description: string;
  athleteEmail?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

export const coachTasks: TaskData[] = [
  {
    coachEmail: 'coach.davis@test.repmax.io',
    title: 'Review film submissions',
    description: 'Review new film uploads from team members',
    dueDate: '2026-02-05T17:00:00Z',
    priority: 'high',
    status: 'pending',
    createdAt: '2026-01-28T08:00:00Z',
  },
  {
    coachEmail: 'coach.davis@test.repmax.io',
    title: 'Call with Andre Mitchell family',
    description: 'Discuss recruiting process and upcoming visits',
    athleteEmail: 'andre.mitchell@test.repmax.io',
    dueDate: '2026-02-03T15:00:00Z',
    priority: 'high',
    status: 'pending',
    createdAt: '2026-01-27T10:00:00Z',
  },
  {
    coachEmail: 'coach.davis@test.repmax.io',
    title: 'Update evaluation report',
    description: 'Complete mid-season evaluation for Devon Brooks',
    athleteEmail: 'devon.brooks@test.repmax.io',
    dueDate: '2026-02-07T12:00:00Z',
    priority: 'medium',
    status: 'in_progress',
    createdAt: '2026-01-25T14:00:00Z',
  },
  {
    coachEmail: 'coach.davis@test.repmax.io',
    title: 'Coordinate camp visit',
    description: 'Arrange transportation for summer camp',
    dueDate: '2026-02-10T09:00:00Z',
    priority: 'medium',
    status: 'pending',
    createdAt: '2026-01-24T11:00:00Z',
  },
  {
    coachEmail: 'coach.davis@test.repmax.io',
    title: 'Send highlight reels to colleges',
    description: 'Distribute updated highlights to target schools',
    dueDate: '2026-02-01T17:00:00Z',
    priority: 'high',
    status: 'completed',
    createdAt: '2026-01-20T09:00:00Z',
  },
  {
    coachEmail: 'coach.davis@test.repmax.io',
    title: 'Schedule team meeting',
    description: 'Plan weekly recruiting update meeting',
    dueDate: '2026-02-02T16:00:00Z',
    priority: 'low',
    status: 'completed',
    createdAt: '2026-01-22T08:00:00Z',
  },
];

// ============================================
// TEST USER DATA
// ============================================

export const testUserData: TestUserData[] = [
  // ============================================
  // GROUP A: CORE TEST ATHLETES (5)
  // ============================================
  {
    email: 'jaylen.washington@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Jaylen Washington',
    repmaxId: 'REP-JW-2026',
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
      vertical: 35,
      bench: 265,
      squat: 405,
      gpa: 3.8,
      sat: 1280,
      bio: 'Elite dual-threat QB. State semifinalist 2025. Camp MVP at Elite 11 Regional. 3-year starter with 8,500+ career passing yards.',
      tenYardSplit: 1.52,
      fiveTenFive: 4.28,
      broadJump: 118,
      wingspan: 76,
      weightedGpa: 4.2,
      coachNotes: 'Natural leader on and off the field. First one in, last one out. Film room junkie — studies opponents like a college-level QB. Vocal in the huddle, calms the team in pressure moments.',
      playerSummary: 'Pro-style dual-threat QB with elite arm talent and above-average mobility. Best fit for spread or RPO-heavy offenses at Power 5 programs. Projects as a multi-year starter at the next level.',
      coachPhone: '(951) 555-0147',
      coachEmail: 'coach.reynolds@riversidepoly.edu',
      verified: true,
      profileCompleteness: 100,
    },
  },
  {
    email: 'marcus.thompson@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Marcus Thompson',
    repmaxId: 'REP-MT-2026',
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
      verified: false,
      profileCompleteness: 45,
    },
  },
  {
    email: 'deshawn.harris@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'DeShawn Harris',
    repmaxId: 'REP-DH-2026',
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
      tenYardSplit: 1.48,
      fiveTenFive: 4.15,
      broadJump: 124,
      wingspan: 74,
      weightedGpa: 3.9,
      coachNotes: 'Explosive off the line. Tracks the deep ball as well as any receiver in the state. Competitive in blocking — not just a route runner.',
      playerSummary: 'Elite speed receiver with deep ball tracking ability. Ideal fit for vertical passing offenses. Projects as an early contributor at the college level.',
      coachPhone: '(770) 555-0293',
      coachEmail: 'coach.johnson@northgwinnett.edu',
      verified: true,
      profileCompleteness: 85,
    },
  },
  {
    email: 'sofia.rodriguez@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Sofia Rodriguez',
    repmaxId: 'REP-SR-2026',
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
      verified: true,
      profileCompleteness: 75,
    },
    clubProfile: {
      organizationName: 'Southeast Elite 7v7',
      activeTournaments: 1,
    },
  },
  {
    email: 'tyler.chen@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Tyler Chen',
    repmaxId: 'REP-TC-2027',
    roles: ['athlete'],
    activeRole: 'athlete',
    city: 'San Jose',
    state: 'CA',
    zone: 'WEST',
    athleteProfile: {
      position: 'QB',
      classYear: 2027,
      school: 'Bellarmine Prep',
      verified: false,
      profileCompleteness: 5,
    },
  },

  // ============================================
  // GROUP B: COACH DAVIS'S ROSTER (10)
  // ============================================
  {
    email: 'andre.mitchell@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Andre Mitchell',
    repmaxId: 'REP-AM-2026',
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
      verified: true,
      profileCompleteness: 70,
    },
  },
  {
    email: 'devon.brooks@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Devon Brooks',
    repmaxId: 'REP-DB-2026',
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
      verified: true,
      profileCompleteness: 65,
    },
  },
  {
    email: 'ryan.park@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Ryan Park',
    repmaxId: 'REP-RP-2026',
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
      verified: true,
      profileCompleteness: 60,
    },
  },
  {
    email: 'carlos.mendez@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Carlos Mendez',
    repmaxId: 'REP-CM-2026',
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
      verified: false,
      profileCompleteness: 55,
    },
  },
  {
    email: 'jamal.carter@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Jamal Carter',
    repmaxId: 'REP-JC-2026',
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
      verified: true,
      profileCompleteness: 80,
    },
  },
  {
    email: 'tyler.green@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Tyler Green',
    repmaxId: 'REP-TG-2026',
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
      verified: false,
      profileCompleteness: 50,
    },
  },
  {
    email: 'noah.williams@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Noah Williams',
    repmaxId: 'REP-NW-2027',
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
      verified: false,
      profileCompleteness: 45,
    },
  },
  {
    email: 'isaiah.brown@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Isaiah Brown',
    repmaxId: 'REP-IB-2027',
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
      verified: false,
      profileCompleteness: 40,
    },
  },
  {
    email: 'michael.lee@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Michael Lee',
    repmaxId: 'REP-ML-2026',
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
      verified: false,
      profileCompleteness: 35,
    },
  },
  {
    email: 'diego.santos@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Diego Santos',
    repmaxId: 'REP-DS-2027',
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
      verified: false,
      profileCompleteness: 30,
    },
  },

  // ============================================
  // GROUP C: ZONE COVERAGE ATHLETES (6)
  // ============================================

  // --- MIDWEST (2) ---
  {
    email: 'malik.johnson@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Malik Johnson',
    repmaxId: 'REP-MJ-2026',
    roles: ['athlete'],
    activeRole: 'athlete',
    city: 'Columbus',
    state: 'OH',
    zone: 'MIDWEST',
    athleteProfile: {
      position: 'LB',
      classYear: 2026,
      school: 'Gahanna Lincoln HS',
      height: "6'2\"",
      weight: 225,
      fortyYard: 4.58,
      vertical: 34,
      bench: 285,
      squat: 425,
      gpa: 3.6,
      sat: 1200,
      bio: 'Physical downhill linebacker with sideline-to-sideline range. Led the Lions with 142 tackles junior year. Two-time All-Ohio selection.',
      tenYardSplit: 1.55,
      fiveTenFive: 4.32,
      broadJump: 116,
      wingspan: 78,
      weightedGpa: 4.0,
      coachNotes: 'Film junkie — watches more tape than any kid on the team. Calls the defense like a coach on the field. Physical in the run game, improving in coverage.',
      playerSummary: 'Thumper LB with instincts and motor. Ideal fit for Big Ten-style defenses. Projects as an immediate special teams contributor with starter upside by year two.',
      coachPhone: '(614) 555-0188',
      coachEmail: 'coach.hill@gahannalincoln.edu',
      verified: true,
      profileCompleteness: 90,
    },
  },
  {
    email: 'ethan.mueller@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Ethan Mueller',
    repmaxId: 'REP-ETM-2026',
    roles: ['athlete'],
    activeRole: 'athlete',
    city: 'Chicago',
    state: 'IL',
    zone: 'MIDWEST',
    athleteProfile: {
      position: 'OL',
      classYear: 2026,
      school: 'Mount Carmel HS',
      height: "6'5\"",
      weight: 295,
      bench: 315,
      squat: 475,
      gpa: 3.3,
      bio: 'Mauling offensive tackle with elite feet. Three-year starter on a perennial state contender. Chicago Catholic League lineman of the year.',
      broadJump: 98,
      wingspan: 82,
      weightedGpa: 3.7,
      coachNotes: 'Nastiest kid on the line. Finishes blocks through the whistle every play. Smart — picks up blitzes and stunts pre-snap.',
      playerSummary: 'Road-grader OT with college-ready size and technique. Best fit for pro-style or power-run schemes. Could start as a redshirt freshman at the right program.',
      coachPhone: '(312) 555-0244',
      coachEmail: 'coach.brown@mountcarmel.edu',
      verified: true,
      profileCompleteness: 75,
    },
  },

  // --- NORTHEAST (2) ---
  {
    email: 'aiden.oconnor@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Aiden O\'Connor',
    repmaxId: 'REP-AO-2026',
    roles: ['athlete'],
    activeRole: 'athlete',
    city: 'Philadelphia',
    state: 'PA',
    zone: 'NORTHEAST',
    athleteProfile: {
      position: 'TE',
      classYear: 2026,
      school: 'La Salle College HS',
      height: "6'4\"",
      weight: 230,
      fortyYard: 4.68,
      vertical: 32,
      bench: 245,
      squat: 385,
      gpa: 3.9,
      sat: 1340,
      act: 30,
      bio: 'Two-sport athlete (football/basketball) with rare combination of size, hands, and route-running ability. 14 TDs receiving and 2 rushing as a junior.',
      tenYardSplit: 1.58,
      fiveTenFive: 4.38,
      broadJump: 108,
      wingspan: 80,
      weightedGpa: 4.3,
      coachNotes: 'Basketball background shows in his contested catch ability and body control. Red zone weapon — give him a 50/50 ball and he wins it 80% of the time.',
      playerSummary: 'Matchup nightmare at TE with basketball athleticism. Projects as an H-back or move TE in spread offenses. Academic profile opens doors at Ivy and Patriot League schools.',
      coachPhone: '(215) 555-0177',
      coachEmail: 'coach.kelly@lasallechs.edu',
      verified: true,
      profileCompleteness: 95,
    },
  },
  {
    email: 'jordan.banks@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Jordan Banks',
    repmaxId: 'REP-JB-2026',
    roles: ['athlete'],
    activeRole: 'athlete',
    city: 'Newark',
    state: 'NJ',
    zone: 'NORTHEAST',
    athleteProfile: {
      position: 'DB',
      classYear: 2026,
      school: 'Don Bosco Prep',
      height: "5'11\"",
      weight: 180,
      fortyYard: 4.42,
      vertical: 39,
      gpa: 3.4,
      bio: 'Lockdown corner with 12 career interceptions. Shutdown defender in New Jersey\'s toughest conference. Track sprinter (10.8 100m).',
      tenYardSplit: 1.45,
      fiveTenFive: 4.10,
      broadJump: 126,
      wingspan: 74,
      weightedGpa: 3.8,
      coachNotes: 'Best ball skills I\'ve coached in 20 years. Turns and plays the ball like a receiver. Physical at the line — press technique is college-ready right now.',
      playerSummary: 'Elite cover corner with ball-hawk instincts and track speed. Fits any scheme — man or zone. Power 5 caliber talent with the speed to play from day one.',
      coachPhone: '(973) 555-0321',
      coachEmail: 'coach.smith@donboscoprep.edu',
      verified: true,
      profileCompleteness: 80,
    },
  },

  // --- PLAINS (2) ---
  {
    email: 'cody.hargrove@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Cody Hargrove',
    repmaxId: 'REP-CH-2026',
    roles: ['athlete'],
    activeRole: 'athlete',
    city: 'Omaha',
    state: 'NE',
    zone: 'PLAINS',
    athleteProfile: {
      position: 'QB',
      classYear: 2026,
      school: 'Omaha Westside HS',
      height: "6'3\"",
      weight: 205,
      fortyYard: 4.60,
      vertical: 33,
      bench: 245,
      squat: 385,
      gpa: 3.7,
      sat: 1260,
      bio: 'Pocket passer with a cannon arm and NFL-caliber anticipation throws. 3,800 yards and 38 TDs junior season. State finalist.',
      tenYardSplit: 1.56,
      fiveTenFive: 4.35,
      broadJump: 110,
      wingspan: 78,
      weightedGpa: 4.1,
      coachNotes: 'Best arm talent in Nebraska. Makes every throw on the route tree. Poised in the pocket — steps up into pressure and delivers strikes.',
      playerSummary: 'Pro-style pocket QB with elite arm strength and processing speed. Best fit for West Coast or Air Raid systems. Could compete for a starting job early at a Group of 5 or mid-tier Power 5.',
      coachPhone: '(402) 555-0199',
      coachEmail: 'coach.anderson@omahawestside.edu',
      verified: true,
      profileCompleteness: 85,
    },
  },
  {
    email: 'tre.washington@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Tre Washington',
    repmaxId: 'REP-TW-2026',
    roles: ['athlete'],
    activeRole: 'athlete',
    city: 'Kansas City',
    state: 'MO',
    zone: 'PLAINS',
    athleteProfile: {
      position: 'WR',
      classYear: 2026,
      school: 'Blue Springs HS',
      height: "6'0\"",
      weight: 185,
      fortyYard: 4.40,
      vertical: 40,
      gpa: 3.2,
      bio: 'Explosive playmaker with elite after-the-catch ability. 1,400 all-purpose yards and 15 TDs as a junior. Track state qualifier in 200m.',
      tenYardSplit: 1.44,
      fiveTenFive: 4.12,
      broadJump: 128,
      wingspan: 73,
      weightedGpa: 3.5,
      coachNotes: 'Most dynamic player with the ball in his hands that I\'ve seen come through this program. Can line up outside, in the slot, or in the backfield.',
      playerSummary: 'Dynamic weapon with game-breaking speed and versatility. Projects as a slot receiver or return specialist at the next level. Instant-impact player.',
      coachPhone: '(816) 555-0276',
      coachEmail: 'coach.davis@bluesprings.edu',
      verified: true,
      profileCompleteness: 70,
    },
  },

  // ============================================
  // PARENTS (2)
  // ============================================
  {
    email: 'lisa.washington@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Lisa Washington',
    repmaxId: 'REP-LW-0001',
    roles: ['parent'],
    activeRole: 'parent',
    city: 'Riverside',
    state: 'CA',
    zone: 'WEST',
    parentProfile: {
      relationship: 'mother',
      linkedAthleteEmail: 'jaylen.washington@test.repmax.io',
    },
  },
  {
    email: 'karen.thompson@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Karen Thompson',
    repmaxId: 'REP-KT-0001',
    roles: ['parent'],
    activeRole: 'parent',
    city: 'Houston',
    state: 'TX',
    zone: 'SOUTHWEST',
    parentProfile: {
      relationship: 'mother',
    },
  },

  // ============================================
  // COACH (1)
  // ============================================
  {
    email: 'coach.davis@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'James Davis',
    repmaxId: 'REP-CD-0001',
    roles: ['coach'],
    activeRole: 'coach',
    city: 'Dallas',
    state: 'TX',
    zone: 'SOUTHWEST',
    coachProfile: {
      teamName: 'Allen Eagles',
      school: 'Allen High School',
      rosterCount: 12,
    },
  },

  // ============================================
  // RECRUITERS (2)
  // ============================================
  {
    email: 'coach.williams@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Brian Williams',
    repmaxId: 'REP-BW-0001',
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
  },
  {
    email: 'coach.martinez@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Alex Martinez',
    repmaxId: 'REP-AM-0001',
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
  },

  // ============================================
  // CLUB ORGANIZER (1)
  // ============================================
  {
    email: 'mike.torres@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Mike Torres',
    repmaxId: 'REP-MT-0001',
    roles: ['club'],
    activeRole: 'club',
    city: 'Austin',
    state: 'TX',
    zone: 'SOUTHWEST',
    clubProfile: {
      organizationName: 'Texas Elite 7v7',
      activeTournaments: 2,
    },
  },

  // ============================================
  // SCHOOL ADMIN (1)
  // ============================================
  {
    email: 'school.admin@test.repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Sarah Jenkins',
    repmaxId: 'REP-SA-0001',
    roles: ['school'],
    activeRole: 'school',
    city: 'Los Angeles',
    state: 'CA',
    zone: 'WEST',
    schoolProfile: {
      schoolName: 'Westside High School',
      isVerified: true,
    },
  },

  // ============================================
  // ADMIN (1)
  // ============================================
  {
    email: 'admin@repmax.io',
    password: TEST_PASSWORD,
    fullName: 'Admin User',
    repmaxId: 'REP-ADMIN-0001',
    roles: ['admin'],
    activeRole: 'admin',
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getUserByEmail(email: string): TestUserData | undefined {
  return testUserData.find((u) => u.email === email);
}

export function getUsersByRole(role: string): TestUserData[] {
  return testUserData.filter((u) => u.roles.includes(role));
}

export function getAthletes(): TestUserData[] {
  return getUsersByRole('athlete');
}

export function getCoreAthletes(): TestUserData[] {
  const coreEmails = [
    'jaylen.washington@test.repmax.io',
    'marcus.thompson@test.repmax.io',
    'deshawn.harris@test.repmax.io',
    'sofia.rodriguez@test.repmax.io',
    'tyler.chen@test.repmax.io',
  ];
  return testUserData.filter((u) => coreEmails.includes(u.email));
}

export function getRosterAthletes(): TestUserData[] {
  const rosterEmails = [
    'andre.mitchell@test.repmax.io',
    'devon.brooks@test.repmax.io',
    'ryan.park@test.repmax.io',
    'carlos.mendez@test.repmax.io',
    'jamal.carter@test.repmax.io',
    'tyler.green@test.repmax.io',
    'noah.williams@test.repmax.io',
    'isaiah.brown@test.repmax.io',
    'michael.lee@test.repmax.io',
    'diego.santos@test.repmax.io',
  ];
  return testUserData.filter((u) => rosterEmails.includes(u.email));
}

export function getHighlightsForAthlete(email: string): HighlightData[] {
  return highlightData.filter((h) => h.athleteEmail === email);
}

export function getTasksForCoach(email: string): TaskData[] {
  return coachTasks.filter((t) => t.coachEmail === email);
}
