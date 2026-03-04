import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  configureMockSupabase,
  createMockRequest,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { jaylenWashington, coachDavis } from '../fixtures/users';

import { GET } from '@/app/api/athletes/route';
import { GET as getAthleteById } from '@/app/api/athletes/[id]/route';

// Helper for auth in athletes tests — any authenticated user works
const authUser = coachDavis;

// ---------------------------------------------------------------------------
// Mock athlete data
// ---------------------------------------------------------------------------
const mockAthleteRow = {
  id: 'ath-001',
  profile_id: jaylenWashington.id,
  primary_position: 'QB',
  secondary_position: 'ATH',
  class_year: 2026,
  high_school: 'Riverside Poly HS',
  city: 'Riverside',
  state: 'CA',
  zone: 'WEST',
  height_inches: 74,
  weight_lbs: 195,
  forty_yard_time: 4.55,
  gpa: 3.8,
  star_rating: 4,
  verified: true,
  repmax_score: 92,
  profile: {
    id: jaylenWashington.id,
    full_name: jaylenWashington.fullName,
    avatar_url: null,
  },
};

const mockAthleteDetail = {
  ...mockAthleteRow,
  profile: {
    id: jaylenWashington.id,
    full_name: jaylenWashington.fullName,
    avatar_url: null,
    role: 'athlete',
  },
  highlights: [
    { id: 'hl-1', title: 'Junior Season Highlights', url: 'https://example.com/hl1' },
  ],
  offers: [
    { id: 'offer-1', school_name: 'TCU', status: 'pending' },
  ],
};

// ===========================================================================
// GET /api/athletes
// ===========================================================================
describe('GET /api/athletes', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const request = createMockRequest('http://localhost:3000/api/athletes');
    const response = await GET(request);
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('returns athletes with pagination metadata', async () => {
    mockAuthenticated(authUser);
    configureMockSupabase({
      athletes: { data: [mockAthleteRow], error: null, count: 1 },
    });

    const request = createMockRequest('http://localhost:3000/api/athletes');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.athletes).toHaveLength(1);
    expect(json.total).toBe(1);
    expect(json.limit).toBe(20);
    expect(json.offset).toBe(0);
  });

  it('applies position filter', async () => {
    mockAuthenticated(authUser);
    configureMockSupabase({
      athletes: { data: [mockAthleteRow], error: null, count: 1 },
    });

    const request = createMockRequest(
      'http://localhost:3000/api/athletes?position=QB'
    );
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.athletes).toHaveLength(1);
  });

  it('applies zone filter', async () => {
    mockAuthenticated(authUser);
    configureMockSupabase({
      athletes: { data: [mockAthleteRow], error: null, count: 1 },
    });

    const request = createMockRequest(
      'http://localhost:3000/api/athletes?zone=WEST'
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it('applies class_year filter', async () => {
    mockAuthenticated(authUser);
    configureMockSupabase({
      athletes: { data: [mockAthleteRow], error: null, count: 1 },
    });

    const request = createMockRequest(
      'http://localhost:3000/api/athletes?class_year=2026'
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it('applies min_stars filter via gte', async () => {
    mockAuthenticated(authUser);
    configureMockSupabase({
      athletes: { data: [mockAthleteRow], error: null, count: 1 },
    });

    const request = createMockRequest(
      'http://localhost:3000/api/athletes?min_stars=4'
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it('applies verified filter', async () => {
    mockAuthenticated(authUser);
    configureMockSupabase({
      athletes: { data: [mockAthleteRow], error: null, count: 1 },
    });

    const request = createMockRequest(
      'http://localhost:3000/api/athletes?verified=true'
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it('returns 400 on invalid Zod params (min_stars out of range)', async () => {
    mockAuthenticated(authUser);
    const request = createMockRequest(
      'http://localhost:3000/api/athletes?min_stars=10'
    );
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid query parameters');
    expect(json.details).toBeDefined();
  });

  it('returns 500 on database error', async () => {
    mockAuthenticated(authUser);
    configureMockSupabase({
      athletes: {
        data: null,
        error: { message: 'Database connection failed' },
        count: null,
      },
    });

    const request = createMockRequest('http://localhost:3000/api/athletes');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Failed to fetch athletes');
  });

  it('returns empty array with count 0 when no athletes match', async () => {
    mockAuthenticated(authUser);
    configureMockSupabase({
      athletes: { data: [], error: null, count: 0 },
    });

    const request = createMockRequest(
      'http://localhost:3000/api/athletes?position=P'
    );
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.athletes).toEqual([]);
    expect(json.total).toBe(0);
  });
});

// ===========================================================================
// GET /api/athletes/[id]
// ===========================================================================
describe('GET /api/athletes/[id]', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('returns athlete with profile, highlights, and offers', async () => {
    mockAuthenticated(authUser);
    configureMockSupabase({
      athletes: { data: mockAthleteDetail, error: null },
    });

    const request = createMockRequest(
      'http://localhost:3000/api/athletes/ath-001'
    );
    const context = { params: Promise.resolve({ id: 'ath-001' }) };
    const response = await getAthleteById(request, context);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.id).toBe('ath-001');
    expect(json.profile).toBeDefined();
    expect(json.profile.full_name).toBe('Jaylen Washington');
    expect(json.highlights).toHaveLength(1);
    expect(json.offers).toHaveLength(1);
  });

  it('returns 404 when athlete not found (PGRST116)', async () => {
    mockAuthenticated(authUser);
    configureMockSupabase({
      athletes: {
        data: null,
        error: { message: 'Row not found', code: 'PGRST116' },
      },
    });

    const request = createMockRequest(
      'http://localhost:3000/api/athletes/nonexistent'
    );
    const context = { params: Promise.resolve({ id: 'nonexistent' }) };
    const response = await getAthleteById(request, context);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Athlete not found');
  });

  it('returns 500 on other database errors', async () => {
    mockAuthenticated(authUser);
    configureMockSupabase({
      athletes: {
        data: null,
        error: { message: 'Connection timeout', code: 'TIMEOUT' },
      },
    });

    const request = createMockRequest(
      'http://localhost:3000/api/athletes/ath-001'
    );
    const context = { params: Promise.resolve({ id: 'ath-001' }) };
    const response = await getAthleteById(request, context);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Connection timeout');
  });
});
