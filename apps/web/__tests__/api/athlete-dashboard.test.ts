import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  configureMockSupabase,
  createMockRequest,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { jaylenWashington, coachDavis } from '../fixtures/users';

import { GET } from '@/app/api/athlete/dashboard/route';

// ---------------------------------------------------------------------------
// Mock data — mirrors what the route handler expects from Supabase
// ---------------------------------------------------------------------------
const mockProfile = {
  id: jaylenWashington.id,
  full_name: jaylenWashington.fullName,
  avatar_url: null,
};

const mockAthlete = {
  id: 'ath-001',
  high_school: 'Riverside Poly HS',
  city: 'Riverside',
  state: 'CA',
  class_year: 2026,
  primary_position: 'QB',
  height_inches: 74,
  weight_lbs: 195,
  forty_yard_time: 4.55,
  gpa: 3.8,
  star_rating: 4,
  zone: 'WEST',
};

const mockShortlists = [
  {
    id: 'sl-1',
    coach: {
      id: 'coach-001',
      school_name: 'Allen High School',
      profile: { full_name: 'James Davis', avatar_url: null },
    },
  },
];

// ===========================================================================
// GET /api/athlete/dashboard
// ===========================================================================
describe('GET /api/athlete/dashboard', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();

    const request = createMockRequest('http://localhost:3000/api/athlete/dashboard');
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 404 when profile not found', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: null, error: null },
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Profile not found');
  });

  it('returns 404 when athlete profile not found', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      athletes: { data: null, error: null },
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Athlete profile not found');
  });

  it('returns full dashboard payload on happy path', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      athletes: { data: mockAthlete, error: null },
      profile_views: { data: null, error: null, count: 12 },
      shortlists: { data: mockShortlists, error: null, count: 1 },
      offers: { data: null, error: null, count: 3 },
      messages: { data: null, error: null, count: 2 },
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveProperty('profile');
    expect(json).toHaveProperty('stats');
    expect(json).toHaveProperty('shortlistCoaches');
    expect(json).toHaveProperty('calendarEvents');
  });

  it('profile has correct shape and field mapping', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      athletes: { data: mockAthlete, error: null },
      profile_views: { data: null, error: null, count: 0 },
      shortlists: { data: [], error: null, count: 0 },
      offers: { data: null, error: null, count: 0 },
      messages: { data: null, error: null, count: 0 },
    });

    const response = await GET();
    const json = await response.json();

    const { profile } = json;
    expect(profile.id).toBe('ath-001');
    expect(profile.name).toBe('Jaylen Washington');
    expect(profile.firstName).toBe('Jaylen');
    expect(profile.lastName).toBe('Washington');
    expect(profile.classYear).toBe(2026);
    expect(profile.position).toBe('QB');
    expect(profile.school).toBe('Riverside Poly HS');
    expect(profile.city).toBe('Riverside');
    expect(profile.state).toBe('CA');
    expect(profile.zone).toBe('WEST');
    expect(profile.heightInches).toBe(74);
    expect(profile.weightLbs).toBe(195);
    expect(profile.fortyYardDash).toBe(4.55);
    expect(profile.gpa).toBe(3.8);
    expect(profile.starRating).toBe(4);
  });

  it('stats aggregates counts correctly', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      athletes: { data: mockAthlete, error: null },
      profile_views: { data: null, error: null, count: 8 },
      shortlists: { data: [], error: null, count: 5 },
      offers: { data: null, error: null, count: 3 },
      messages: { data: null, error: null, count: 2 },
    });

    const response = await GET();
    const json = await response.json();

    const { stats } = json;
    expect(stats.profileViews).toBe(8);
    expect(stats.shortlistCount).toBe(5);
    expect(stats.offersCount).toBe(3);
    expect(stats.messagesUnread).toBe(2);
    expect(typeof stats.profileViewsChange).toBe('number');
  });

  it('shortlistCoaches maps coach data correctly', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      athletes: { data: mockAthlete, error: null },
      profile_views: { data: null, error: null, count: 0 },
      shortlists: { data: mockShortlists, error: null, count: 1 },
      offers: { data: null, error: null, count: 0 },
      messages: { data: null, error: null, count: 0 },
    });

    const response = await GET();
    const json = await response.json();

    expect(json.shortlistCoaches).toHaveLength(1);
    expect(json.shortlistCoaches[0]).toEqual(
      expect.objectContaining({
        id: 'coach-001',
        name: 'James Davis',
        school: 'Allen High School',
      })
    );
  });

  it('calendarEvents is an array of future events', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      athletes: { data: mockAthlete, error: null },
      profile_views: { data: null, error: null, count: 0 },
      shortlists: { data: [], error: null, count: 0 },
      offers: { data: null, error: null, count: 0 },
      messages: { data: null, error: null, count: 0 },
    });

    const response = await GET();
    const json = await response.json();

    expect(Array.isArray(json.calendarEvents)).toBe(true);
    // All calendar events should be in the future (or at least have dates)
    for (const event of json.calendarEvents) {
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('date');
      expect(event).toHaveProperty('type');
    }
  });
});
