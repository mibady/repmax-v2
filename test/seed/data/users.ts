/**
 * Test User Data for Seeding
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
}

// ============================================
// FILM DATA (for Jaylen Washington)
// ============================================

export interface FilmData {
  athleteEmail: string;
  title: string;
  type: 'game' | 'highlight' | 'practice' | 'camp';
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  views?: number;
  featured?: boolean;
  uploadedAt?: string;
}

export const filmData: FilmData[] = [
  {
    athleteEmail: 'jaylen.washington@test.repmax.com',
    title: 'Junior Season Highlights 2025',
    type: 'highlight',
    videoUrl: 'https://storage.repmax.com/films/jaylen-junior-highlights.mp4',
    thumbnailUrl: 'https://storage.repmax.com/thumbnails/jaylen-junior-thumb.jpg',
    duration: 245,
    views: 1847,
    featured: true,
    uploadedAt: '2025-11-15T10:00:00Z',
  },
  {
    athleteEmail: 'jaylen.washington@test.repmax.com',
    title: 'Nike Elite 11 Regional - Camp Footage',
    type: 'camp',
    videoUrl: 'https://storage.repmax.com/films/jaylen-elite11-camp.mp4',
    thumbnailUrl: 'https://storage.repmax.com/thumbnails/jaylen-elite11-thumb.jpg',
    duration: 180,
    views: 523,
    featured: true,
    uploadedAt: '2025-06-22T14:30:00Z',
  },
  {
    athleteEmail: 'jaylen.washington@test.repmax.com',
    title: 'Week 8 vs. Corona Centennial - Full Game',
    type: 'game',
    videoUrl: 'https://storage.repmax.com/films/jaylen-week8-game.mp4',
    thumbnailUrl: 'https://storage.repmax.com/thumbnails/jaylen-week8-thumb.jpg',
    duration: 7200,
    views: 312,
    featured: false,
    uploadedAt: '2025-10-20T08:00:00Z',
  },
  {
    athleteEmail: 'deshawn.harris@test.repmax.com',
    title: 'Route Running Drills',
    type: 'practice',
    videoUrl: 'https://storage.repmax.com/films/deshawn-routes.mp4',
    duration: 120,
    views: 89,
    featured: false,
    uploadedAt: '2025-12-01T16:00:00Z',
  },
];

// ============================================
// DOCUMENT DATA (for Jaylen Washington)
// ============================================

export interface DocumentData {
  athleteEmail: string;
  title: string;
  type: 'transcript' | 'recommendation' | 'test_score' | 'medical' | 'other';
  fileUrl: string;
  verified: boolean;
  verifiedAt?: string;
  uploadedAt?: string;
}

export const documentData: DocumentData[] = [
  {
    athleteEmail: 'jaylen.washington@test.repmax.com',
    title: 'Official Transcript - Fall 2025',
    type: 'transcript',
    fileUrl: 'https://storage.repmax.com/docs/jaylen-transcript-2025.pdf',
    verified: true,
    verifiedAt: '2025-12-01T12:00:00Z',
    uploadedAt: '2025-11-28T09:00:00Z',
  },
  {
    athleteEmail: 'jaylen.washington@test.repmax.com',
    title: 'Coach Recommendation Letter',
    type: 'recommendation',
    fileUrl: 'https://storage.repmax.com/docs/jaylen-rec-letter.pdf',
    verified: true,
    verifiedAt: '2025-10-15T14:00:00Z',
    uploadedAt: '2025-10-10T11:00:00Z',
  },
  {
    athleteEmail: 'jaylen.washington@test.repmax.com',
    title: 'SAT Score Report',
    type: 'test_score',
    fileUrl: 'https://storage.repmax.com/docs/jaylen-sat-scores.pdf',
    verified: true,
    verifiedAt: '2025-09-20T10:00:00Z',
    uploadedAt: '2025-09-18T08:00:00Z',
  },
  {
    athleteEmail: 'marcus.thompson@test.repmax.com',
    title: 'Unofficial Transcript',
    type: 'transcript',
    fileUrl: 'https://storage.repmax.com/docs/marcus-transcript.pdf',
    verified: false,
    uploadedAt: '2025-12-10T14:00:00Z',
  },
];

// ============================================
// COACH ACTIVITIES DATA
// ============================================

export interface ActivityData {
  coachEmail: string;
  type: 'profile_view' | 'film_view' | 'note_added' | 'message_sent' | 'shortlist_add';
  athleteEmail: string;
  description: string;
  timestamp: string;
}

export const coachActivities: ActivityData[] = [
  {
    coachEmail: 'coach.davis@test.repmax.com',
    type: 'profile_view',
    athleteEmail: 'andre.mitchell@test.repmax.com',
    description: 'Viewed profile',
    timestamp: '2026-01-30T14:00:00Z',
  },
  {
    coachEmail: 'coach.davis@test.repmax.com',
    type: 'film_view',
    athleteEmail: 'jamal.carter@test.repmax.com',
    description: 'Watched film: Fall highlights',
    timestamp: '2026-01-29T16:30:00Z',
  },
  {
    coachEmail: 'coach.davis@test.repmax.com',
    type: 'note_added',
    athleteEmail: 'devon.brooks@test.repmax.com',
    description: 'Added recruiting note',
    timestamp: '2026-01-29T10:00:00Z',
  },
  {
    coachEmail: 'coach.davis@test.repmax.com',
    type: 'message_sent',
    athleteEmail: 'ryan.park@test.repmax.com',
    description: 'Sent camp invite message',
    timestamp: '2026-01-28T09:15:00Z',
  },
  {
    coachEmail: 'coach.davis@test.repmax.com',
    type: 'profile_view',
    athleteEmail: 'carlos.mendez@test.repmax.com',
    description: 'Viewed profile',
    timestamp: '2026-01-27T11:30:00Z',
  },
  {
    coachEmail: 'coach.davis@test.repmax.com',
    type: 'film_view',
    athleteEmail: 'tyler.green@test.repmax.com',
    description: 'Watched film: Spring practice',
    timestamp: '2026-01-26T15:00:00Z',
  },
  {
    coachEmail: 'coach.davis@test.repmax.com',
    type: 'shortlist_add',
    athleteEmail: 'noah.williams@test.repmax.com',
    description: 'Added to recruiting board',
    timestamp: '2026-01-25T13:45:00Z',
  },
  {
    coachEmail: 'coach.davis@test.repmax.com',
    type: 'note_added',
    athleteEmail: 'isaiah.brown@test.repmax.com',
    description: 'Updated evaluation notes',
    timestamp: '2026-01-24T10:30:00Z',
  },
  {
    coachEmail: 'coach.davis@test.repmax.com',
    type: 'profile_view',
    athleteEmail: 'michael.lee@test.repmax.com',
    description: 'Viewed profile',
    timestamp: '2026-01-23T14:20:00Z',
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
    coachEmail: 'coach.davis@test.repmax.com',
    title: 'Review film submissions',
    description: 'Review new film uploads from team members',
    dueDate: '2026-02-05T17:00:00Z',
    priority: 'high',
    status: 'pending',
    createdAt: '2026-01-28T08:00:00Z',
  },
  {
    coachEmail: 'coach.davis@test.repmax.com',
    title: 'Call with Andre Mitchell family',
    description: 'Discuss recruiting process and upcoming visits',
    athleteEmail: 'andre.mitchell@test.repmax.com',
    dueDate: '2026-02-03T15:00:00Z',
    priority: 'high',
    status: 'pending',
    createdAt: '2026-01-27T10:00:00Z',
  },
  {
    coachEmail: 'coach.davis@test.repmax.com',
    title: 'Update evaluation report',
    description: 'Complete mid-season evaluation for Devon Brooks',
    athleteEmail: 'devon.brooks@test.repmax.com',
    dueDate: '2026-02-07T12:00:00Z',
    priority: 'medium',
    status: 'in_progress',
    createdAt: '2026-01-25T14:00:00Z',
  },
  {
    coachEmail: 'coach.davis@test.repmax.com',
    title: 'Coordinate camp visit',
    description: 'Arrange transportation for summer camp',
    dueDate: '2026-02-10T09:00:00Z',
    priority: 'medium',
    status: 'pending',
    createdAt: '2026-01-24T11:00:00Z',
  },
  {
    coachEmail: 'coach.davis@test.repmax.com',
    title: 'Send highlight reels to colleges',
    description: 'Distribute updated highlights to target schools',
    dueDate: '2026-02-01T17:00:00Z',
    priority: 'high',
    status: 'completed',
    createdAt: '2026-01-20T09:00:00Z',
  },
  {
    coachEmail: 'coach.davis@test.repmax.com',
    title: 'Schedule team meeting',
    description: 'Plan weekly recruiting update meeting',
    dueDate: '2026-02-02T16:00:00Z',
    priority: 'low',
    status: 'completed',
    createdAt: '2026-01-22T08:00:00Z',
  },
];

// ============================================
// COACH NOTES DATA
// ============================================

export interface NoteData {
  coachEmail: string;
  athleteEmail: string;
  content: string;
  category: 'recruiting' | 'performance' | 'academic' | 'character' | 'general';
  createdAt: string;
}

export const coachNotes: NoteData[] = [
  {
    coachEmail: 'coach.davis@test.repmax.com',
    athleteEmail: 'andre.mitchell@test.repmax.com',
    content:
      'Excellent route runner with quick feet off the line. Shows great hands in traffic. TCU and Baylor both showing strong interest.',
    category: 'recruiting',
    createdAt: '2026-01-28T14:30:00Z',
  },
  {
    coachEmail: 'coach.davis@test.repmax.com',
    athleteEmail: 'jamal.carter@test.repmax.com',
    content:
      'Physical corner with good ball skills. Needs to work on hip flip in man coverage. Could be a steal for mid-major programs.',
    category: 'performance',
    createdAt: '2026-01-27T11:00:00Z',
  },
  {
    coachEmail: 'coach.davis@test.repmax.com',
    athleteEmail: 'devon.brooks@test.repmax.com',
    content:
      'GPA improved to 3.2 this semester. Counselor confirmed on track for NCAA eligibility. Keep pushing academic focus.',
    category: 'academic',
    createdAt: '2026-01-26T09:00:00Z',
  },
  {
    coachEmail: 'coach.davis@test.repmax.com',
    athleteEmail: 'ryan.park@test.repmax.com',
    content:
      'Team captain material. Players gravitate to him in the weight room. Coaches speak highly of his work ethic.',
    category: 'character',
    createdAt: '2026-01-25T15:00:00Z',
  },
  {
    coachEmail: 'coach.davis@test.repmax.com',
    athleteEmail: 'carlos.mendez@test.repmax.com',
    content:
      'Visited campus last weekend. Family seems very interested. Follow up with admissions about scholarship timeline.',
    category: 'recruiting',
    createdAt: '2026-01-24T10:00:00Z',
  },
];

// ============================================
// TOURNAMENT DATA (for Mike Torres)
// ============================================

export interface TournamentData {
  clubEmail: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  teamsRegistered: number;
  teamsCapacity: number;
  entryFee: number;
  totalCollected: number;
  status: 'registration' | 'in_progress' | 'completed';
}

export const tournamentData: TournamentData[] = [
  {
    clubEmail: 'mike.torres@test.repmax.com',
    name: 'Winter Classic 2026',
    startDate: '2026-02-15T08:00:00Z',
    endDate: '2026-02-16T18:00:00Z',
    location: 'Round Rock Multipurpose Complex',
    teamsRegistered: 12,
    teamsCapacity: 16,
    entryFee: 375,
    totalCollected: 3750,
    status: 'in_progress',
  },
  {
    clubEmail: 'mike.torres@test.repmax.com',
    name: 'Spring Showcase 2026',
    startDate: '2026-04-05T08:00:00Z',
    endDate: '2026-04-06T18:00:00Z',
    location: 'Austin Sports Complex',
    teamsRegistered: 6,
    teamsCapacity: 24,
    entryFee: 425,
    totalCollected: 2550,
    status: 'registration',
  },
];

// ============================================
// TOURNAMENT TEAMS DATA (for Winter Classic)
// ============================================

export interface TournamentTeamData {
  tournamentName: string;
  name: string;
  coachName: string;
  contactEmail: string;
  division: '18U' | '16U';
  pool: 'A' | 'B' | 'C' | 'D';
  paymentStatus: 'paid' | 'pending';
  paymentAmount: number;
  paymentDate: string | null;
  athletesCount: number;
  athletesVerified: number;
  roster: TournamentAthleteData[];
}

export interface TournamentAthleteData {
  name: string;
  position: string;
  jerseyNumber: number;
  verified: boolean;
}

export const tournamentTeamsData: TournamentTeamData[] = [
  // 18U Division - Pool A
  {
    tournamentName: 'Winter Classic 2026',
    name: 'Austin Aces',
    coachName: 'Marcus Rodriguez',
    contactEmail: 'coach.rodriguez@austinaces.com',
    division: '18U',
    pool: 'A',
    paymentStatus: 'paid',
    paymentAmount: 375,
    paymentDate: '2026-01-20T10:00:00Z',
    athletesCount: 12,
    athletesVerified: 12,
    roster: [
      { name: 'Jordan Williams', position: 'QB', jerseyNumber: 7, verified: true },
      { name: 'Chris Martinez', position: 'WR', jerseyNumber: 11, verified: true },
      { name: 'DeMarcus Johnson', position: 'RB', jerseyNumber: 22, verified: true },
      { name: 'Tyler Anderson', position: 'WR', jerseyNumber: 3, verified: true },
      { name: 'Marcus Lee', position: 'DB', jerseyNumber: 24, verified: true },
      { name: 'Devon Thomas', position: 'LB', jerseyNumber: 54, verified: true },
      { name: 'Jaylen Moore', position: 'OL', jerseyNumber: 72, verified: true },
      { name: 'Antonio Garcia', position: 'DL', jerseyNumber: 90, verified: true },
      { name: 'Brandon Smith', position: 'TE', jerseyNumber: 88, verified: true },
      { name: 'Isaiah Brown', position: 'K', jerseyNumber: 1, verified: true },
      { name: 'Michael Davis', position: 'S', jerseyNumber: 21, verified: true },
      { name: 'Nathan Clark', position: 'CB', jerseyNumber: 5, verified: true },
    ],
  },
  {
    tournamentName: 'Winter Classic 2026',
    name: 'Houston Heat',
    coachName: 'James Patterson',
    contactEmail: 'jpatterson@houstonheat.net',
    division: '18U',
    pool: 'A',
    paymentStatus: 'paid',
    paymentAmount: 375,
    paymentDate: '2026-01-22T14:30:00Z',
    athletesCount: 14,
    athletesVerified: 14,
    roster: [
      { name: 'Darius Jackson', position: 'QB', jerseyNumber: 12, verified: true },
      { name: 'Kevin Moore', position: 'WR', jerseyNumber: 8, verified: true },
      { name: 'Andre Williams', position: 'RB', jerseyNumber: 25, verified: true },
      { name: 'Marcus Brown', position: 'WR', jerseyNumber: 15, verified: true },
      { name: 'Tyler Jones', position: 'DB', jerseyNumber: 2, verified: true },
      { name: 'Chris Thompson', position: 'LB', jerseyNumber: 55, verified: true },
      { name: 'Jordan Lee', position: 'OL', jerseyNumber: 74, verified: true },
      { name: 'Devon Martin', position: 'DL', jerseyNumber: 95, verified: true },
      { name: 'Isaiah Rodriguez', position: 'TE', jerseyNumber: 86, verified: true },
      { name: 'Nathan Garcia', position: 'K', jerseyNumber: 4, verified: true },
      { name: 'Brandon White', position: 'S', jerseyNumber: 27, verified: true },
      { name: 'Michael Clark', position: 'CB', jerseyNumber: 9, verified: true },
      { name: 'Antonio Davis', position: 'WR', jerseyNumber: 19, verified: true },
      { name: 'Jaylen Thomas', position: 'LB', jerseyNumber: 52, verified: true },
    ],
  },
  {
    tournamentName: 'Winter Classic 2026',
    name: 'Dallas Dragons',
    coachName: 'Robert Chen',
    contactEmail: 'chen@dallasdragons.org',
    division: '18U',
    pool: 'A',
    paymentStatus: 'paid',
    paymentAmount: 375,
    paymentDate: '2026-01-25T09:15:00Z',
    athletesCount: 13,
    athletesVerified: 11,
    roster: [
      { name: 'Marcus Harris', position: 'QB', jerseyNumber: 10, verified: true },
      { name: 'Tyler Evans', position: 'WR', jerseyNumber: 13, verified: false },
      { name: 'Chris Park', position: 'RB', jerseyNumber: 28, verified: false },
      { name: 'Jordan Wilson', position: 'WR', jerseyNumber: 6, verified: true },
      { name: 'Devon Carter', position: 'DB', jerseyNumber: 23, verified: true },
      { name: 'Isaiah Thompson', position: 'LB', jerseyNumber: 56, verified: true },
      { name: 'Nathan Rodriguez', position: 'OL', jerseyNumber: 75, verified: true },
      { name: 'Brandon Garcia', position: 'DL', jerseyNumber: 92, verified: true },
      { name: 'Michael Lee', position: 'TE', jerseyNumber: 87, verified: true },
      { name: 'Antonio Martinez', position: 'K', jerseyNumber: 3, verified: true },
      { name: 'Jaylen Davis', position: 'S', jerseyNumber: 26, verified: true },
      { name: 'Darius Brown', position: 'CB', jerseyNumber: 14, verified: true },
      { name: 'Kevin White', position: 'WR', jerseyNumber: 17, verified: true },
    ],
  },
  // 18U Division - Pool B
  {
    tournamentName: 'Winter Classic 2026',
    name: 'San Antonio Storm',
    coachName: 'Luis Hernandez',
    contactEmail: 'hernandez@sastorm.com',
    division: '18U',
    pool: 'B',
    paymentStatus: 'pending',
    paymentAmount: 375,
    paymentDate: null,
    athletesCount: 12,
    athletesVerified: 0,
    roster: [
      { name: 'Marcus Johnson', position: 'QB', jerseyNumber: 7, verified: false },
      { name: 'Tyler Williams', position: 'WR', jerseyNumber: 11, verified: false },
      { name: 'Chris Davis', position: 'RB', jerseyNumber: 22, verified: false },
      { name: 'Jordan Martinez', position: 'WR', jerseyNumber: 3, verified: false },
      { name: 'Devon Lee', position: 'DB', jerseyNumber: 24, verified: false },
      { name: 'Isaiah Thomas', position: 'LB', jerseyNumber: 54, verified: false },
      { name: 'Nathan Moore', position: 'OL', jerseyNumber: 72, verified: false },
      { name: 'Brandon Garcia', position: 'DL', jerseyNumber: 90, verified: false },
      { name: 'Michael Smith', position: 'TE', jerseyNumber: 88, verified: false },
      { name: 'Antonio Brown', position: 'K', jerseyNumber: 1, verified: false },
      { name: 'Jaylen Davis', position: 'S', jerseyNumber: 21, verified: false },
      { name: 'Darius Clark', position: 'CB', jerseyNumber: 5, verified: false },
    ],
  },
  {
    tournamentName: 'Winter Classic 2026',
    name: 'Fort Worth Flames',
    coachName: 'Derek Washington',
    contactEmail: 'dwash@fwflames.net',
    division: '18U',
    pool: 'B',
    paymentStatus: 'paid',
    paymentAmount: 375,
    paymentDate: '2026-01-28T11:00:00Z',
    athletesCount: 11,
    athletesVerified: 11,
    roster: [
      { name: 'Chris Davis', position: 'QB', jerseyNumber: 9, verified: true },
      { name: 'Marcus Thompson', position: 'WR', jerseyNumber: 16, verified: true },
      { name: 'Tyler Johnson', position: 'RB', jerseyNumber: 30, verified: true },
      { name: 'Jordan Brown', position: 'WR', jerseyNumber: 4, verified: true },
      { name: 'Devon Wilson', position: 'DB', jerseyNumber: 25, verified: true },
      { name: 'Isaiah Carter', position: 'LB', jerseyNumber: 50, verified: true },
      { name: 'Nathan Thomas', position: 'OL', jerseyNumber: 70, verified: true },
      { name: 'Brandon Lee', position: 'DL', jerseyNumber: 93, verified: true },
      { name: 'Michael Rodriguez', position: 'TE', jerseyNumber: 85, verified: true },
      { name: 'Antonio White', position: 'S', jerseyNumber: 20, verified: true },
      { name: 'Jaylen Garcia', position: 'CB', jerseyNumber: 8, verified: true },
    ],
  },
  {
    tournamentName: 'Winter Classic 2026',
    name: 'El Paso Eagles',
    coachName: 'Carlos Moreno',
    contactEmail: 'moreno@epeagles.org',
    division: '18U',
    pool: 'B',
    paymentStatus: 'paid',
    paymentAmount: 375,
    paymentDate: '2026-01-30T08:45:00Z',
    athletesCount: 12,
    athletesVerified: 10,
    roster: [
      { name: 'Tyler Martinez', position: 'QB', jerseyNumber: 14, verified: true },
      { name: 'Chris Rodriguez', position: 'WR', jerseyNumber: 18, verified: true },
      { name: 'Marcus Garcia', position: 'RB', jerseyNumber: 32, verified: true },
      { name: 'Jordan Davis', position: 'WR', jerseyNumber: 2, verified: true },
      { name: 'Devon Johnson', position: 'DB', jerseyNumber: 29, verified: true },
      { name: 'Isaiah Williams', position: 'LB', jerseyNumber: 58, verified: true },
      { name: 'Nathan Brown', position: 'OL', jerseyNumber: 76, verified: true },
      { name: 'Brandon Thompson', position: 'DL', jerseyNumber: 94, verified: true },
      { name: 'Kevin Martinez', position: 'TE', jerseyNumber: 84, verified: false },
      { name: 'Antonio Lee', position: 'K', jerseyNumber: 6, verified: false },
      { name: 'Jaylen Wilson', position: 'S', jerseyNumber: 31, verified: true },
      { name: 'Darius Moore', position: 'CB', jerseyNumber: 10, verified: true },
    ],
  },
  // 16U Division - Pool C
  {
    tournamentName: 'Winter Classic 2026',
    name: 'Austin Jr Aces',
    coachName: 'Kevin Miller',
    contactEmail: 'kmiller@austinjraces.com',
    division: '16U',
    pool: 'C',
    paymentStatus: 'paid',
    paymentAmount: 375,
    paymentDate: '2026-01-21T16:00:00Z',
    athletesCount: 11,
    athletesVerified: 11,
    roster: [
      { name: 'Jake Williams', position: 'QB', jerseyNumber: 7, verified: true },
      { name: 'Ryan Martinez', position: 'WR', jerseyNumber: 11, verified: true },
      { name: 'Ethan Johnson', position: 'RB', jerseyNumber: 22, verified: true },
      { name: 'Noah Anderson', position: 'WR', jerseyNumber: 3, verified: true },
      { name: 'Luke Lee', position: 'DB', jerseyNumber: 24, verified: true },
      { name: 'Mason Thomas', position: 'LB', jerseyNumber: 54, verified: true },
      { name: 'Logan Moore', position: 'OL', jerseyNumber: 72, verified: true },
      { name: 'Caleb Garcia', position: 'DL', jerseyNumber: 90, verified: true },
      { name: 'Dylan Smith', position: 'TE', jerseyNumber: 88, verified: true },
      { name: 'Hunter Brown', position: 'K', jerseyNumber: 1, verified: true },
      { name: 'Connor Davis', position: 'S', jerseyNumber: 21, verified: true },
    ],
  },
  {
    tournamentName: 'Winter Classic 2026',
    name: 'Houston Jr Heat',
    coachName: 'Tony Nguyen',
    contactEmail: 'tnguyen@houstonjrheat.com',
    division: '16U',
    pool: 'C',
    paymentStatus: 'paid',
    paymentAmount: 375,
    paymentDate: '2026-01-23T10:00:00Z',
    athletesCount: 12,
    athletesVerified: 9,
    roster: [
      { name: 'Jake Jackson', position: 'QB', jerseyNumber: 12, verified: true },
      { name: 'Ryan Moore', position: 'WR', jerseyNumber: 8, verified: true },
      { name: 'Ethan Williams', position: 'RB', jerseyNumber: 25, verified: true },
      { name: 'Noah Brown', position: 'WR', jerseyNumber: 15, verified: true },
      { name: 'Luke Jones', position: 'DB', jerseyNumber: 2, verified: true },
      { name: 'Mason Thompson', position: 'LB', jerseyNumber: 55, verified: true },
      { name: 'Brandon Cole', position: 'OL', jerseyNumber: 74, verified: false },
      { name: 'James Miller', position: 'DL', jerseyNumber: 95, verified: false },
      { name: 'David Wilson', position: 'TE', jerseyNumber: 86, verified: false },
      { name: 'Hunter Garcia', position: 'K', jerseyNumber: 4, verified: true },
      { name: 'Connor White', position: 'S', jerseyNumber: 27, verified: true },
      { name: 'Dylan Clark', position: 'CB', jerseyNumber: 9, verified: true },
    ],
  },
  {
    tournamentName: 'Winter Classic 2026',
    name: 'Dallas Jr Dragons',
    coachName: 'Mike Thompson',
    contactEmail: 'mthompson@dallasjrdragons.org',
    division: '16U',
    pool: 'C',
    paymentStatus: 'paid',
    paymentAmount: 375,
    paymentDate: '2026-01-26T14:00:00Z',
    athletesCount: 10,
    athletesVerified: 10,
    roster: [
      { name: 'Jake Harris', position: 'QB', jerseyNumber: 10, verified: true },
      { name: 'Ryan Evans', position: 'WR', jerseyNumber: 13, verified: true },
      { name: 'Ethan Park', position: 'RB', jerseyNumber: 28, verified: true },
      { name: 'Noah Wilson', position: 'WR', jerseyNumber: 6, verified: true },
      { name: 'Luke Carter', position: 'DB', jerseyNumber: 23, verified: true },
      { name: 'Mason Thompson', position: 'LB', jerseyNumber: 56, verified: true },
      { name: 'Logan Rodriguez', position: 'OL', jerseyNumber: 75, verified: true },
      { name: 'Caleb Garcia', position: 'DL', jerseyNumber: 92, verified: true },
      { name: 'Dylan Lee', position: 'TE', jerseyNumber: 87, verified: true },
      { name: 'Hunter Martinez', position: 'K', jerseyNumber: 3, verified: true },
    ],
  },
  // 16U Division - Pool D
  {
    tournamentName: 'Winter Classic 2026',
    name: 'San Antonio Jr Storm',
    coachName: 'Ray Garcia',
    contactEmail: 'rgarcia@sajrstorm.com',
    division: '16U',
    pool: 'D',
    paymentStatus: 'paid',
    paymentAmount: 375,
    paymentDate: '2026-01-27T09:00:00Z',
    athletesCount: 13,
    athletesVerified: 13,
    roster: [
      { name: 'Jake Johnson', position: 'QB', jerseyNumber: 7, verified: true },
      { name: 'Ryan Williams', position: 'WR', jerseyNumber: 11, verified: true },
      { name: 'Ethan Davis', position: 'RB', jerseyNumber: 22, verified: true },
      { name: 'Noah Martinez', position: 'WR', jerseyNumber: 3, verified: true },
      { name: 'Luke Lee', position: 'DB', jerseyNumber: 24, verified: true },
      { name: 'Mason Thomas', position: 'LB', jerseyNumber: 54, verified: true },
      { name: 'Logan Moore', position: 'OL', jerseyNumber: 72, verified: true },
      { name: 'Caleb Garcia', position: 'DL', jerseyNumber: 90, verified: true },
      { name: 'Dylan Smith', position: 'TE', jerseyNumber: 88, verified: true },
      { name: 'Hunter Brown', position: 'K', jerseyNumber: 1, verified: true },
      { name: 'Connor Davis', position: 'S', jerseyNumber: 21, verified: true },
      { name: 'Jake Clark', position: 'CB', jerseyNumber: 5, verified: true },
      { name: 'Ryan White', position: 'WR', jerseyNumber: 17, verified: true },
    ],
  },
  {
    tournamentName: 'Winter Classic 2026',
    name: 'Fort Worth Jr Flames',
    coachName: 'Steve Adams',
    contactEmail: 'sadams@fwjrflames.net',
    division: '16U',
    pool: 'D',
    paymentStatus: 'pending',
    paymentAmount: 375,
    paymentDate: null,
    athletesCount: 11,
    athletesVerified: 0,
    roster: [
      { name: 'Jake Davis', position: 'QB', jerseyNumber: 9, verified: false },
      { name: 'Ryan Thompson', position: 'WR', jerseyNumber: 16, verified: false },
      { name: 'Ethan Johnson', position: 'RB', jerseyNumber: 30, verified: false },
      { name: 'Noah Brown', position: 'WR', jerseyNumber: 4, verified: false },
      { name: 'Luke Wilson', position: 'DB', jerseyNumber: 25, verified: false },
      { name: 'Mason Carter', position: 'LB', jerseyNumber: 50, verified: false },
      { name: 'Logan Thomas', position: 'OL', jerseyNumber: 70, verified: false },
      { name: 'Caleb Lee', position: 'DL', jerseyNumber: 93, verified: false },
      { name: 'Dylan Rodriguez', position: 'TE', jerseyNumber: 85, verified: false },
      { name: 'Hunter White', position: 'S', jerseyNumber: 20, verified: false },
      { name: 'Connor Garcia', position: 'CB', jerseyNumber: 8, verified: false },
    ],
  },
  {
    tournamentName: 'Winter Classic 2026',
    name: 'El Paso Jr Eagles',
    coachName: 'Juan Lopez',
    contactEmail: 'jlopez@epjreagles.org',
    division: '16U',
    pool: 'D',
    paymentStatus: 'paid',
    paymentAmount: 375,
    paymentDate: '2026-01-31T12:00:00Z',
    athletesCount: 12,
    athletesVerified: 12,
    roster: [
      { name: 'Jake Martinez', position: 'QB', jerseyNumber: 14, verified: true },
      { name: 'Ryan Rodriguez', position: 'WR', jerseyNumber: 18, verified: true },
      { name: 'Ethan Garcia', position: 'RB', jerseyNumber: 32, verified: true },
      { name: 'Noah Davis', position: 'WR', jerseyNumber: 2, verified: true },
      { name: 'Luke Johnson', position: 'DB', jerseyNumber: 29, verified: true },
      { name: 'Mason Williams', position: 'LB', jerseyNumber: 58, verified: true },
      { name: 'Logan Brown', position: 'OL', jerseyNumber: 76, verified: true },
      { name: 'Caleb Thompson', position: 'DL', jerseyNumber: 94, verified: true },
      { name: 'Dylan Martinez', position: 'TE', jerseyNumber: 84, verified: true },
      { name: 'Hunter Lee', position: 'K', jerseyNumber: 6, verified: true },
      { name: 'Connor Wilson', position: 'S', jerseyNumber: 31, verified: true },
      { name: 'Jake Moore', position: 'CB', jerseyNumber: 10, verified: true },
    ],
  },
];

// ============================================
// VERIFICATION QUEUE DATA (for Club Dashboard)
// ============================================

export interface VerificationQueueData {
  clubEmail: string;
  athleteName: string;
  teamName: string;
  division: '18U' | '16U';
  type: 'identity' | 'academic' | 'athletic';
  method: 'photo_upload' | 'qr_scan' | 'transcript_upload' | 'birth_certificate';
  status: 'pending_review' | 'age_check_needed' | 'approved' | 'rejected';
  notes?: string;
  submittedAt: string;
}

export const verificationQueueData: VerificationQueueData[] = [
  {
    clubEmail: 'mike.torres@test.repmax.com',
    athleteName: 'Tyler Evans',
    teamName: 'Dallas Dragons',
    division: '18U',
    type: 'identity',
    method: 'photo_upload',
    status: 'pending_review',
    submittedAt: '2026-02-14T16:30:00Z',
  },
  {
    clubEmail: 'mike.torres@test.repmax.com',
    athleteName: 'Chris Park',
    teamName: 'Dallas Dragons',
    division: '18U',
    type: 'academic',
    method: 'transcript_upload',
    status: 'pending_review',
    notes: 'GPA verification needed',
    submittedAt: '2026-02-14T15:00:00Z',
  },
  {
    clubEmail: 'mike.torres@test.repmax.com',
    athleteName: 'Brandon Cole',
    teamName: 'Houston Jr Heat',
    division: '16U',
    type: 'athletic',
    method: 'birth_certificate',
    status: 'age_check_needed',
    notes: 'Verify age for 16U eligibility',
    submittedAt: '2026-02-14T14:00:00Z',
  },
  {
    clubEmail: 'mike.torres@test.repmax.com',
    athleteName: 'James Miller',
    teamName: 'Houston Jr Heat',
    division: '16U',
    type: 'identity',
    method: 'qr_scan',
    status: 'pending_review',
    submittedAt: '2026-02-14T12:00:00Z',
  },
  {
    clubEmail: 'mike.torres@test.repmax.com',
    athleteName: 'David Wilson',
    teamName: 'Houston Jr Heat',
    division: '16U',
    type: 'identity',
    method: 'photo_upload',
    status: 'pending_review',
    submittedAt: '2026-02-14T11:30:00Z',
  },
  {
    clubEmail: 'mike.torres@test.repmax.com',
    athleteName: 'Kevin Martinez',
    teamName: 'El Paso Eagles',
    division: '18U',
    type: 'academic',
    method: 'transcript_upload',
    status: 'pending_review',
    submittedAt: '2026-02-13T10:00:00Z',
  },
  {
    clubEmail: 'mike.torres@test.repmax.com',
    athleteName: 'Antonio Lee',
    teamName: 'El Paso Eagles',
    division: '18U',
    type: 'identity',
    method: 'photo_upload',
    status: 'pending_review',
    submittedAt: '2026-02-12T09:00:00Z',
  },
];

// ============================================
// TOURNAMENT PAYMENT DATA (for Club Dashboard)
// ============================================

export interface TournamentPaymentData {
  tournamentName: string;
  teamName: string;
  division: '18U' | '16U';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string | null;
  paidAt: string | null;
  description: string;
}

export const tournamentPaymentData: TournamentPaymentData[] = [
  { tournamentName: 'Winter Classic 2026', teamName: 'Austin Aces', division: '18U', amount: 375, status: 'completed', paymentMethod: 'stripe', paidAt: '2026-01-20T10:00:00Z', description: 'Austin Aces - 18U Registration' },
  { tournamentName: 'Winter Classic 2026', teamName: 'Houston Heat', division: '18U', amount: 375, status: 'completed', paymentMethod: 'stripe', paidAt: '2026-01-22T14:30:00Z', description: 'Houston Heat - 18U Registration' },
  { tournamentName: 'Winter Classic 2026', teamName: 'Dallas Dragons', division: '18U', amount: 375, status: 'completed', paymentMethod: 'stripe', paidAt: '2026-01-25T09:15:00Z', description: 'Dallas Dragons - 18U Registration' },
  { tournamentName: 'Winter Classic 2026', teamName: 'San Antonio Storm', division: '18U', amount: 375, status: 'pending', paymentMethod: null, paidAt: null, description: 'San Antonio Storm - 18U Registration (UNPAID)' },
  { tournamentName: 'Winter Classic 2026', teamName: 'Fort Worth Flames', division: '18U', amount: 375, status: 'completed', paymentMethod: 'stripe', paidAt: '2026-01-28T11:00:00Z', description: 'Fort Worth Flames - 18U Registration' },
  { tournamentName: 'Winter Classic 2026', teamName: 'El Paso Eagles', division: '18U', amount: 375, status: 'completed', paymentMethod: 'stripe', paidAt: '2026-01-30T08:45:00Z', description: 'El Paso Eagles - 18U Registration' },
  { tournamentName: 'Winter Classic 2026', teamName: 'Austin Jr Aces', division: '16U', amount: 375, status: 'completed', paymentMethod: 'stripe', paidAt: '2026-01-21T16:00:00Z', description: 'Austin Jr Aces - 16U Registration' },
  { tournamentName: 'Winter Classic 2026', teamName: 'Houston Jr Heat', division: '16U', amount: 375, status: 'completed', paymentMethod: 'stripe', paidAt: '2026-01-23T10:00:00Z', description: 'Houston Jr Heat - 16U Registration' },
  { tournamentName: 'Winter Classic 2026', teamName: 'Dallas Jr Dragons', division: '16U', amount: 375, status: 'completed', paymentMethod: 'stripe', paidAt: '2026-01-26T14:00:00Z', description: 'Dallas Jr Dragons - 16U Registration' },
  { tournamentName: 'Winter Classic 2026', teamName: 'San Antonio Jr Storm', division: '16U', amount: 375, status: 'completed', paymentMethod: 'stripe', paidAt: '2026-01-27T09:00:00Z', description: 'San Antonio Jr Storm - 16U Registration' },
  { tournamentName: 'Winter Classic 2026', teamName: 'Fort Worth Jr Flames', division: '16U', amount: 375, status: 'pending', paymentMethod: null, paidAt: null, description: 'Fort Worth Jr Flames - 16U Registration (UNPAID)' },
  { tournamentName: 'Winter Classic 2026', teamName: 'El Paso Jr Eagles', division: '16U', amount: 375, status: 'completed', paymentMethod: 'stripe', paidAt: '2026-01-31T12:00:00Z', description: 'El Paso Jr Eagles - 16U Registration' },
];

// ============================================
// RECRUITER PIPELINE DATA
// ============================================

export interface PipelineProspect {
  recruiterEmail: string;
  athleteEmail?: string;
  prospectName: string;
  position: string;
  school: string;
  classYear: number;
  status: 'watching' | 'evaluating' | 'priority' | 'offer_extended' | 'committed';
  notes?: string;
  addedAt: string;
}

export const recruiterPipelines: PipelineProspect[] = [
  // Coach Williams (TCU) - 5 sample prospects
  {
    recruiterEmail: 'coach.williams@test.repmax.com',
    athleteEmail: 'jaylen.washington@test.repmax.com',
    prospectName: 'Jaylen Washington',
    position: 'QB',
    school: 'Riverside Poly HS',
    classYear: 2026,
    status: 'priority',
    notes: 'Elite arm talent, dual threat. Campus visit scheduled Feb 20.',
    addedAt: '2025-09-15T10:00:00Z',
  },
  {
    recruiterEmail: 'coach.williams@test.repmax.com',
    athleteEmail: 'deshawn.harris@test.repmax.com',
    prospectName: 'DeShawn Harris',
    position: 'WR',
    school: 'North Gwinnett HS',
    classYear: 2026,
    status: 'evaluating',
    notes: 'Speed receiver, good hands. Needs more film.',
    addedAt: '2025-11-01T14:00:00Z',
  },
  {
    recruiterEmail: 'coach.williams@test.repmax.com',
    athleteEmail: 'andre.mitchell@test.repmax.com',
    prospectName: 'Andre Mitchell',
    position: 'WR',
    school: 'Allen High School',
    classYear: 2026,
    status: 'watching',
    addedAt: '2025-12-10T09:00:00Z',
  },
  // Coach Martinez (ASU) - 3 sample prospects
  {
    recruiterEmail: 'coach.martinez@test.repmax.com',
    athleteEmail: 'jaylen.washington@test.repmax.com',
    prospectName: 'Jaylen Washington',
    position: 'QB',
    school: 'Riverside Poly HS',
    classYear: 2026,
    status: 'evaluating',
    notes: 'Competing with TCU, USC. Need to move fast.',
    addedAt: '2025-10-01T11:00:00Z',
  },
  {
    recruiterEmail: 'coach.martinez@test.repmax.com',
    athleteEmail: 'sofiaRodriguez',
    prospectName: 'Sofia Rodriguez',
    position: 'DB',
    school: 'Miami Central',
    classYear: 2026,
    status: 'watching',
    addedAt: '2025-11-20T16:00:00Z',
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
    email: 'jaylen.washington@test.repmax.com',
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
      vertical: 34.5,
      bench: 265,
      squat: 405,
      gpa: 3.8,
      sat: 1280,
      bio: 'Elite dual-threat QB. State semifinalist 2025. Camp MVP at Elite 11 Regional. 3-year starter with 8,500+ career passing yards.',
      verified: true,
      profileCompleteness: 100,
    },
  },
  {
    email: 'marcus.thompson@test.repmax.com',
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
    email: 'deshawn.harris@test.repmax.com',
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
      verified: true,
      profileCompleteness: 85,
    },
  },
  {
    email: 'sofia.rodriguez@test.repmax.com',
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
    email: 'tyler.chen@test.repmax.com',
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
    email: 'andre.mitchell@test.repmax.com',
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
    email: 'devon.brooks@test.repmax.com',
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
    email: 'ryan.park@test.repmax.com',
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
    email: 'carlos.mendez@test.repmax.com',
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
    email: 'jamal.carter@test.repmax.com',
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
    email: 'tyler.green@test.repmax.com',
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
    email: 'noah.williams@test.repmax.com',
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
    email: 'isaiah.brown@test.repmax.com',
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
    email: 'michael.lee@test.repmax.com',
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
    email: 'diego.santos@test.repmax.com',
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
  // PARENTS (2)
  // ============================================
  {
    email: 'lisa.washington@test.repmax.com',
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
      linkedAthleteEmail: 'jaylen.washington@test.repmax.com',
    },
  },
  {
    email: 'karen.thompson@test.repmax.com',
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
    email: 'coach.davis@test.repmax.com',
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
    email: 'coach.williams@test.repmax.com',
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
    email: 'coach.martinez@test.repmax.com',
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
    email: 'mike.torres@test.repmax.com',
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
  // ADMIN (1)
  // ============================================
  {
    email: 'admin@repmax.com',
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
    'jaylen.washington@test.repmax.com',
    'marcus.thompson@test.repmax.com',
    'deshawn.harris@test.repmax.com',
    'sofia.rodriguez@test.repmax.com',
    'tyler.chen@test.repmax.com',
  ];
  return testUserData.filter((u) => coreEmails.includes(u.email));
}

export function getRosterAthletes(): TestUserData[] {
  const rosterEmails = [
    'andre.mitchell@test.repmax.com',
    'devon.brooks@test.repmax.com',
    'ryan.park@test.repmax.com',
    'carlos.mendez@test.repmax.com',
    'jamal.carter@test.repmax.com',
    'tyler.green@test.repmax.com',
    'noah.williams@test.repmax.com',
    'isaiah.brown@test.repmax.com',
    'michael.lee@test.repmax.com',
    'diego.santos@test.repmax.com',
  ];
  return testUserData.filter((u) => rosterEmails.includes(u.email));
}

export function getFilmsForAthlete(email: string): FilmData[] {
  return filmData.filter((f) => f.athleteEmail === email);
}

export function getDocumentsForAthlete(email: string): DocumentData[] {
  return documentData.filter((d) => d.athleteEmail === email);
}

export function getActivitiesForCoach(email: string): ActivityData[] {
  return coachActivities.filter((a) => a.coachEmail === email);
}

export function getTasksForCoach(email: string): TaskData[] {
  return coachTasks.filter((t) => t.coachEmail === email);
}

export function getNotesForCoach(email: string): NoteData[] {
  return coachNotes.filter((n) => n.coachEmail === email);
}

export function getTournamentsForClub(email: string): TournamentData[] {
  return tournamentData.filter((t) => t.clubEmail === email);
}

export function getPipelineForRecruiter(email: string): PipelineProspect[] {
  return recruiterPipelines.filter((p) => p.recruiterEmail === email);
}

export function getTournamentTeams(tournamentName?: string): TournamentTeamData[] {
  if (tournamentName) {
    return tournamentTeamsData.filter((t) => t.tournamentName === tournamentName);
  }
  return tournamentTeamsData;
}

export function getVerificationQueue(clubEmail?: string): VerificationQueueData[] {
  if (clubEmail) {
    return verificationQueueData.filter((v) => v.clubEmail === clubEmail);
  }
  return verificationQueueData;
}

export function getTournamentPayments(tournamentName?: string): TournamentPaymentData[] {
  if (tournamentName) {
    return tournamentPaymentData.filter((p) => p.tournamentName === tournamentName);
  }
  return tournamentPaymentData;
}
