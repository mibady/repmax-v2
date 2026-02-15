import { describe, it, expect, beforeEach } from 'vitest';
import {
  configureMockSupabase,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { coachDavis } from '../fixtures/users';

import { GET } from '@/app/api/coach/dashboard/route';

// ---------------------------------------------------------------------------
// Mock data — matches actual route queries
// ---------------------------------------------------------------------------
const mockProfile = {
  id: coachDavis.id,
  full_name: 'James Davis',
  avatar_url: null,
};

const mockCoach = {
  id: 'coach-db-001',
  school_name: 'Allen High School',
  division: 'FBS',
  conference: 'Big 12',
  title: 'Head Coach',
};

const mockShortlistData = [
  {
    id: 'sl-1',
    priority: 'high',
    notes: 'Top prospect',
    created_at: '2026-02-10T10:00:00Z',
    athlete: {
      id: 'ath-r1',
      primary_position: 'WR',
      class_year: 2026,
      gpa: 3.5,
      offers_count: 4,
      profile_id: 'p-r1',
      profile: { full_name: 'Andre Mitchell', avatar_url: null },
    },
  },
  {
    id: 'sl-2',
    priority: 'medium',
    notes: null,
    created_at: '2026-02-09T08:00:00Z',
    athlete: {
      id: 'ath-r2',
      primary_position: 'RB',
      class_year: 2026,
      gpa: 3.2,
      offers_count: 2,
      profile_id: 'p-r2',
      profile: { full_name: 'Devon Brooks', avatar_url: null },
    },
  },
];

const mockCommittedOffers = [
  { athlete_id: 'ath-r1' }, // Andre Mitchell is committed
];

const mockCoachTasks = [
  {
    id: 'task-1',
    title: 'Upload highlight reels',
    description: 'Senior highlight reels for recruiting',
    due_date: '2026-03-01',
    priority: 'high',
    status: 'pending',
    athlete_id: null,
    created_at: '2026-02-10T10:00:00Z',
  },
  {
    id: 'task-2',
    title: 'Confirm LSU visit',
    description: null,
    due_date: '2026-02-20',
    priority: 'medium',
    status: 'completed',
    athlete_id: null,
    created_at: '2026-02-08T10:00:00Z',
  },
];

const mockMessages = [
  {
    id: 'm-1',
    subject: 'Recruiting update',
    body: 'Great game last Friday',
    read: false,
    created_at: '2026-02-10T15:00:00Z',
    sender: { full_name: 'Andre Mitchell', avatar_url: null },
  },
];

// ===========================================================================
// GET /api/coach/dashboard
// ===========================================================================
describe('GET /api/coach/dashboard', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 404 when profile not found', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: null, error: null },
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Profile not found');
  });

  it('returns 404 when coach profile not found', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      coaches: { data: null, error: null },
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Coach profile not found');
  });

  it('returns 200 with empty state when coach has no data', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      coaches: { data: mockCoach, error: null },
      shortlists: { data: [], error: null },
      offers: { data: [], error: null },
      coach_tasks: { data: [], error: null },
      messages: { data: [], error: null, count: 0 },
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.roster).toEqual([]);
    expect(json.tasks).toEqual([]);
    expect(json.activity).toEqual([]);
    expect(json.metrics.totalAthletes).toBe(0);
    expect(json.metrics.activeAthletes).toBe(0);
    expect(json.metrics.committedAthletes).toBe(0);
    expect(json.metrics.pendingTasks).toBe(0);
    expect(json.metrics.totalOffers).toBe(0);
  });

  it('returns full dashboard payload on happy path', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      coaches: { data: mockCoach, error: null },
      shortlists: { data: mockShortlistData, error: null },
      offers: { data: mockCommittedOffers, error: null },
      coach_tasks: { data: mockCoachTasks, error: null },
      athletes: { data: [], error: null },
      messages: { data: mockMessages, error: null },
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveProperty('coach');
    expect(json).toHaveProperty('roster');
    expect(json).toHaveProperty('tasks');
    expect(json).toHaveProperty('activity');
    expect(json).toHaveProperty('metrics');
  });

  it('maps coach info correctly', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      coaches: { data: mockCoach, error: null },
      shortlists: { data: [], error: null },
      coach_tasks: { data: [], error: null },
      messages: { data: [], error: null, count: 0 },
    });

    const response = await GET();
    const json = await response.json();

    expect(json.coach.name).toBe('James Davis');
    expect(json.coach.school).toBe('Allen High School');
    expect(json.coach.division).toBe('FBS');
    expect(json.coach.conference).toBe('Big 12');
    expect(json.coach.title).toBe('Head Coach');
  });

  it('derives roster status from committed offers', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      coaches: { data: mockCoach, error: null },
      shortlists: { data: mockShortlistData, error: null },
      offers: { data: mockCommittedOffers, error: null },
      coach_tasks: { data: [], error: null },
      athletes: { data: [], error: null },
      messages: { data: [], error: null },
    });

    const response = await GET();
    const json = await response.json();

    // ath-r1 has a committed offer → "committed"
    const andre = json.roster.find((r: { name: string }) => r.name === 'Andre Mitchell');
    expect(andre.status).toBe('committed');

    // ath-r2 has no committed offer → "active"
    const devon = json.roster.find((r: { name: string }) => r.name === 'Devon Brooks');
    expect(devon.status).toBe('active');
  });

  it('returns tasks from coach_tasks table', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      coaches: { data: mockCoach, error: null },
      shortlists: { data: [], error: null },
      coach_tasks: { data: mockCoachTasks, error: null },
      messages: { data: [], error: null },
    });

    const response = await GET();
    const json = await response.json();

    expect(json.tasks).toHaveLength(2);
    expect(json.tasks[0].title).toBe('Upload highlight reels');
    expect(json.tasks[0].priority).toBe('high');
    expect(json.tasks[0].status).toBe('pending');
    expect(json.tasks[1].title).toBe('Confirm LSU visit');
    expect(json.tasks[1].status).toBe('completed');
  });

  it('calculates metrics correctly', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      coaches: { data: mockCoach, error: null },
      shortlists: { data: mockShortlistData, error: null },
      offers: { data: mockCommittedOffers, error: null },
      coach_tasks: { data: mockCoachTasks, error: null },
      athletes: { data: [], error: null },
      messages: { data: mockMessages, error: null },
    });

    const response = await GET();
    const json = await response.json();

    expect(json.metrics.totalAthletes).toBe(2);
    expect(json.metrics.committedAthletes).toBe(1); // ath-r1
    expect(json.metrics.activeAthletes).toBe(1); // ath-r2
    expect(json.metrics.pendingTasks).toBe(1); // task-1 is pending, task-2 is completed
    expect(json.metrics.totalOffers).toBe(6); // 4 + 2
  });
});
