import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  configureMockSupabase,
  createMockRequest,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { coachDavis } from '../fixtures/users';

import { GET } from '@/app/api/coach/dashboard/route';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const mockProfile = {
  id: coachDavis.id,
};

const mockTeams = [{ id: 'team-001' }];

const mockRosterLinks = [
  { athlete_id: 'ath-r1' },
  { athlete_id: 'ath-r2' },
];

const mockRosterAthletes = [
  {
    id: 'ath-r1',
    primary_position: 'WR',
    class_year: 2026,
    gpa: 3.5,
    offers_count: 4,
    profile: { full_name: 'Andre Mitchell', avatar_url: null },
  },
  {
    id: 'ath-r2',
    primary_position: 'RB',
    class_year: 2026,
    gpa: 3.2,
    offers_count: 2,
    profile: { full_name: 'Devon Brooks', avatar_url: null },
  },
];

const mockTasks = [
  {
    id: 'task-1',
    text: 'Review film for Andre',
    due_date: '2026-03-01',
    priority: 'high',
    completed: false,
    athlete_id: 'ath-r1',
    created_at: '2026-02-10T10:00:00Z',
  },
  {
    id: 'task-2',
    text: 'Send offer letter',
    due_date: '2026-02-28',
    priority: 'medium',
    completed: true,
    athlete_id: 'ath-r2',
    created_at: '2026-02-09T09:00:00Z',
  },
];

const mockNotes = [
  {
    id: 'note-1',
    athlete_id: 'ath-r1',
    text: 'Strong route runner, good hands',
    pinned: true,
    created_at: '2026-02-10T12:00:00Z',
  },
];

const mockActivities = [
  {
    id: 'act-1',
    activity_type: 'evaluation',
    notes: 'Watched game film',
    athlete_id: 'ath-r1',
    school_name: 'Allen High School',
    activity_date: '2026-02-10',
    created_at: '2026-02-10T14:00:00Z',
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

  it('returns full dashboard payload on happy path', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      teams: { data: mockTeams, error: null },
      team_rosters: { data: mockRosterLinks, error: null },
      athletes: { data: mockRosterAthletes, error: null },
      coach_tasks: { data: mockTasks, error: null },
      coach_notes: { data: mockNotes, error: null },
      activity_log: { data: mockActivities, error: null },
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveProperty('roster');
    expect(json).toHaveProperty('tasks');
    expect(json).toHaveProperty('notes');
    expect(json).toHaveProperty('activity');
    expect(json).toHaveProperty('metrics');
  });

  it('returns empty state when coach has no teams', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      teams: { data: [], error: null },
      team_rosters: { data: [], error: null },
      athletes: { data: [], error: null },
      coach_tasks: { data: [], error: null },
      coach_notes: { data: [], error: null },
      activity_log: { data: [], error: null },
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.roster).toEqual([]);
    expect(json.metrics.totalAthletes).toBe(0);
    expect(json.metrics.activeAthletes).toBe(0);
    expect(json.metrics.committedAthletes).toBe(0);
    expect(json.metrics.pendingTasks).toBe(0);
    expect(json.metrics.totalOffers).toBe(0);
  });

  it('calculates metrics from roster and tasks', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      teams: { data: mockTeams, error: null },
      team_rosters: { data: mockRosterLinks, error: null },
      athletes: { data: mockRosterAthletes, error: null },
      coach_tasks: { data: mockTasks, error: null },
      coach_notes: { data: mockNotes, error: null },
      activity_log: { data: mockActivities, error: null },
    });

    const response = await GET();
    const json = await response.json();

    expect(json.metrics.totalAthletes).toBe(2);
    expect(json.metrics.activeAthletes).toBe(2); // all roster athletes have status "active"
    expect(json.metrics.committedAthletes).toBe(0); // none have status "committed"
    expect(json.metrics.pendingTasks).toBe(1); // one task not completed
    expect(json.metrics.totalOffers).toBe(6); // 4 + 2 offers_count
  });

  it('formats tasks correctly (text→title, completed→status)', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      teams: { data: mockTeams, error: null },
      team_rosters: { data: mockRosterLinks, error: null },
      athletes: { data: mockRosterAthletes, error: null },
      coach_tasks: { data: mockTasks, error: null },
      coach_notes: { data: [], error: null },
      activity_log: { data: [], error: null },
    });

    const response = await GET();
    const json = await response.json();

    expect(json.tasks).toHaveLength(2);
    // First task: not completed → status "pending"
    expect(json.tasks[0].title).toBe('Review film for Andre');
    expect(json.tasks[0].status).toBe('pending');
    expect(json.tasks[0].priority).toBe('high');
    // Second task: completed → status "completed"
    expect(json.tasks[1].title).toBe('Send offer letter');
    expect(json.tasks[1].status).toBe('completed');
  });
});
