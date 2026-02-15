import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  configureMockSupabase,
  createMockRequest,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { lisaWashington, karenThompson } from '../fixtures/users';

import { GET } from '@/app/api/parent/dashboard/route';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const mockProfile = {
  id: lisaWashington.id,
};

const mockLinks = [{ athlete_profile_id: 'athlete-001' }];

const mockAthlete = {
  id: 'ath-001',
  primary_position: 'QB',
  class_year: 2026,
  gpa: 3.8,
  high_school: 'Riverside Poly HS',
  profile: { full_name: 'Jaylen Washington', avatar_url: null },
};

const mockShortlistData = [
  {
    id: 'sl-1',
    coach: { school_name: 'TCU' },
  },
  {
    id: 'sl-2',
    coach: { school_name: 'Alabama' },
  },
];

const mockRecentViews = [
  {
    id: 'pv-1',
    viewer_school: 'TCU',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    section_viewed: 'highlights',
  },
  {
    id: 'pv-2',
    viewer_school: 'Alabama',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    section_viewed: 'academics',
  },
];

// ===========================================================================
// GET /api/parent/dashboard
// ===========================================================================
describe('GET /api/parent/dashboard', () => {
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
    mockAuthenticated(lisaWashington);
    configureMockSupabase({
      profiles: { data: null, error: null },
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Profile not found');
  });

  it('returns full dashboard for linked parent', async () => {
    mockAuthenticated(lisaWashington);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      parent_links: { data: mockLinks, error: null },
      athletes: { data: mockAthlete, error: null },
      profile_views: { data: mockRecentViews, error: null, count: 15 },
      shortlists: { data: mockShortlistData, error: null, count: 2 },
      messages: { data: null, error: null, count: 3 },
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveProperty('childProfile');
    expect(json).toHaveProperty('metrics');
    expect(json).toHaveProperty('schools');
    expect(json).toHaveProperty('activity');
    expect(json).toHaveProperty('calendarEvents');

    // childProfile is populated
    expect(json.childProfile).not.toBeNull();
    expect(json.childProfile.id).toBe('ath-001');
    expect(json.childProfile.name).toBe('Jaylen'); // first name only
    expect(json.childProfile.position).toBe('QB');
    expect(json.childProfile.classYear).toBe(2026);
    expect(json.childProfile.gpa).toBe(3.8);
    expect(json.childProfile.school).toBe('Riverside Poly HS');
  });

  it('returns null childProfile and zeroed metrics for unlinked parent', async () => {
    mockAuthenticated(karenThompson);
    configureMockSupabase({
      profiles: { data: { id: karenThompson.id }, error: null },
      parent_links: { data: [], error: null },
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.childProfile).toBeNull();
    expect(json.metrics.profileViews).toBe(0);
    expect(json.metrics.coachMessages).toBe(0);
    expect(json.metrics.schoolsTracking).toBe(0);
    expect(json.schools).toEqual([]);
    expect(json.activity).toEqual([]);
  });

  it('metrics aggregate counts correctly', async () => {
    mockAuthenticated(lisaWashington);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      parent_links: { data: mockLinks, error: null },
      athletes: { data: mockAthlete, error: null },
      profile_views: { data: mockRecentViews, error: null, count: 15 },
      shortlists: { data: mockShortlistData, error: null, count: 2 },
      messages: { data: null, error: null, count: 3 },
    });

    const response = await GET();
    const json = await response.json();

    expect(json.metrics.profileViews).toBe(15);
    expect(json.metrics.coachMessages).toBe(3);
    expect(json.metrics.schoolsTracking).toBe(2);
  });

  it('activity items have time formatting', async () => {
    mockAuthenticated(lisaWashington);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      parent_links: { data: mockLinks, error: null },
      athletes: { data: mockAthlete, error: null },
      profile_views: { data: mockRecentViews, error: null, count: 2 },
      shortlists: { data: [], error: null, count: 0 },
      messages: { data: null, error: null, count: 0 },
    });

    const response = await GET();
    const json = await response.json();

    expect(json.activity).toHaveLength(2);
    // First activity: 2 hours ago
    expect(json.activity[0].time).toMatch(/\d+ hours ago/);
    expect(json.activity[0].message).toContain('TCU');
    expect(json.activity[0].message).toContain('highlights');
    // Second activity: 2 days ago
    expect(json.activity[1].time).toMatch(/\d+ days ago/);
    expect(json.activity[1].type).toBe('view');
  });
});
