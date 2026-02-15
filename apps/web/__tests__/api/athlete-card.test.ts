import { describe, it, expect, beforeEach } from 'vitest';
import {
  configureMockSupabase,
  createMockRequest,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { jaylenWashington } from '../fixtures/users';

import { GET, PUT } from '@/app/api/athlete/card/route';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const mockProfile = {
  id: jaylenWashington.id,
  full_name: 'Jaylen Washington',
  avatar_url: 'https://example.com/avatar.jpg',
};

const mockAthlete = {
  id: 'ath-001',
  school: 'Riverside Poly HS',
  city: 'Riverside',
  state: 'CA',
  class_year: 2026,
  position: 'QB',
  height_inches: 74,
  weight_lbs: 195,
  forty_yard_dash: 4.55,
  gpa: 3.8,
  sat_score: 1280,
  act_score: 28,
  zone: 'WEST',
  hudl_link: 'https://hudl.com/jaylen',
  youtube_link: 'https://youtube.com/jaylen',
  bio: 'Elite dual-threat QB',
  wingspan_inches: 76,
  bench_press_lbs: 265,
  squat_lbs: 405,
  vertical_inches: 34,
  secondary_position: 'ATH',
  desired_major: 'Business',
};

// ===========================================================================
// GET /api/athlete/card
// ===========================================================================
describe('GET /api/athlete/card', () => {
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

  it('returns full card data on success', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      athletes: { data: mockAthlete, error: null },
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.name).toBe('Jaylen Washington');
    expect(json.position).toBe('QB');
    expect(json.secondaryPosition).toBe('ATH');
    expect(json.classYear).toBe(2026);
    expect(json.highSchool).toBe('Riverside Poly HS');
    expect(json.city).toBe('Riverside');
    expect(json.state).toBe('CA');
    expect(json.zone).toBe('WEST');
    expect(json.height).toBe("6'2\"");
    expect(json.weight).toBe('195');
    expect(json.fortyYard).toBe('4.55');
    expect(json.gpa).toBe('3.80');
    expect(json.sat).toBe('1280');
    expect(json.act).toBe('28');
    expect(json.hudlLink).toBe('https://hudl.com/jaylen');
    expect(json.youtubeLink).toBe('https://youtube.com/jaylen');
    expect(json.bio).toBe('Elite dual-threat QB');
    expect(json.avatarUrl).toBe('https://example.com/avatar.jpg');
  });
});

// ===========================================================================
// PUT /api/athlete/card
// ===========================================================================
describe('PUT /api/athlete/card', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();

    const request = createMockRequest('http://localhost:3000/api/athlete/card', {
      method: 'PUT',
      body: { position: 'WR' },
    });
    const response = await PUT(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 404 when profile not found', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: null, error: null },
    });

    const request = createMockRequest('http://localhost:3000/api/athlete/card', {
      method: 'PUT',
      body: { position: 'WR' },
    });
    const response = await PUT(request);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Profile not found');
  });

  it('returns success on valid update', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: { id: jaylenWashington.id }, error: null },
      athletes: { data: { id: 'ath-001' }, error: null },
    });

    const request = createMockRequest('http://localhost:3000/api/athlete/card', {
      method: 'PUT',
      body: {
        position: 'WR',
        city: 'Los Angeles',
        gpa: 3.9,
        hudlLink: 'https://hudl.com/new',
      },
    });
    const response = await PUT(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
  });
});
