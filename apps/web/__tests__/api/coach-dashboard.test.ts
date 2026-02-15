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
// Mock data — matches actual route queries (profiles, coaches, shortlists, messages)
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

  it('returns 200 with empty state when coach has no shortlists', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      coaches: { data: mockCoach, error: null },
      shortlists: { data: [], error: null },
      messages: { data: [], error: null, count: 0 },
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.roster).toEqual([]);
    expect(json.activity).toEqual([]);
    expect(json.metrics.totalAthletes).toBe(0);
    expect(json.metrics.highPriority).toBe(0);
    expect(json.metrics.totalOffers).toBe(0);
    expect(json.metrics.messagesUnread).toBe(0);
  });

  it('returns full dashboard payload on happy path', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      coaches: { data: mockCoach, error: null },
      shortlists: { data: mockShortlistData, error: null },
      messages: { data: mockMessages, error: null, count: 3 },
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveProperty('coach');
    expect(json).toHaveProperty('roster');
    expect(json).toHaveProperty('activity');
    expect(json).toHaveProperty('metrics');
  });

  it('maps coach info correctly', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      coaches: { data: mockCoach, error: null },
      shortlists: { data: [], error: null },
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

  it('calculates metrics from roster and messages', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      coaches: { data: mockCoach, error: null },
      shortlists: { data: mockShortlistData, error: null },
      messages: { data: mockMessages, error: null, count: 3 },
    });

    const response = await GET();
    const json = await response.json();

    expect(json.metrics.totalAthletes).toBe(2);
    expect(json.metrics.highPriority).toBe(1); // one "high" priority
    expect(json.metrics.totalOffers).toBe(6); // 4 + 2 offers_count
    expect(json.metrics.messagesUnread).toBe(3);
  });
});
