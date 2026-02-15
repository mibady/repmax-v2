import { describe, it, expect, beforeEach } from 'vitest';
import {
  configureMockSupabase,
  createMockRequest,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { jaylenWashington } from '../fixtures/users';

import { GET } from '@/app/api/analytics/geographic/route';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const mockProfile = { id: jaylenWashington.id };
const mockAthlete = { id: 'ath-001' };

const mockViews = [
  {
    viewer_state: 'TX',
    viewer_zone: 'SOUTHWEST',
    viewer_school: 'TCU',
    viewer_division: 'FBS',
    created_at: '2026-02-10T10:00:00Z',
  },
  {
    viewer_state: 'TX',
    viewer_zone: 'SOUTHWEST',
    viewer_school: 'Baylor',
    viewer_division: 'FBS',
    created_at: '2026-02-09T10:00:00Z',
  },
  {
    viewer_state: 'CA',
    viewer_zone: 'WEST',
    viewer_school: 'USC',
    viewer_division: 'FBS',
    created_at: '2026-02-08T10:00:00Z',
  },
];

// ===========================================================================
// GET /api/analytics/geographic
// ===========================================================================
describe('GET /api/analytics/geographic', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();

    const request = createMockRequest('http://localhost:3000/api/analytics/geographic');
    const response = await GET(request as any);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 404 when profile not found', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: null, error: null },
    });

    const request = createMockRequest('http://localhost:3000/api/analytics/geographic');
    const response = await GET(request as any);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Profile not found');
  });

  it('returns 404 when athlete not found', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      athletes: { data: null, error: null },
    });

    const request = createMockRequest('http://localhost:3000/api/analytics/geographic');
    const response = await GET(request as any);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Athlete profile not found');
  });

  it('returns geographic aggregation on success', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      athletes: { data: mockAthlete, error: null },
      profile_views: { data: mockViews, error: null },
    });

    const request = createMockRequest('http://localhost:3000/api/analytics/geographic');
    const response = await GET(request as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.total_views).toBe(3);
    expect(json.period_days).toBe(30);
    expect(json.by_zone).toBeInstanceOf(Array);
    expect(json.by_zone[0].zone).toBe('SOUTHWEST'); // highest count
    expect(json.by_zone[0].view_count).toBe(2);
    expect(json.by_state).toHaveProperty('TX');
    expect(json.by_state.TX).toBe(2);
    expect(json.by_division).toHaveProperty('FBS');
    expect(json.top_zone).toBe('SOUTHWEST');
  });

  it('returns empty results when no views exist', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      athletes: { data: mockAthlete, error: null },
      profile_views: { data: [], error: null },
    });

    const request = createMockRequest('http://localhost:3000/api/analytics/geographic?days=7');
    const response = await GET(request as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.total_views).toBe(0);
    expect(json.by_zone).toEqual([]);
    expect(json.top_zone).toBeNull();
  });
});
