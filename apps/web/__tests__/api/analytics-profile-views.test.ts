import { describe, it, expect, beforeEach } from 'vitest';
import {
  configureMockSupabase,
  createMockRequest,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { jaylenWashington } from '../fixtures/users';

import { GET } from '@/app/api/analytics/profile-views/route';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const mockProfile = { id: jaylenWashington.id };
const mockAthlete = { id: 'ath-001' };

const mockViews = [
  {
    id: 'pv-1',
    viewer_id: 'viewer-1',
    viewer_role: 'coach',
    viewer_zone: 'SOUTHWEST',
    viewer_school: 'TCU',
    created_at: '2026-02-10T10:00:00Z',
  },
  {
    id: 'pv-2',
    viewer_id: 'viewer-2',
    viewer_role: 'recruiter',
    viewer_zone: 'SOUTHWEST',
    viewer_school: 'Baylor',
    created_at: '2026-02-10T12:00:00Z',
  },
  {
    id: 'pv-3',
    viewer_id: 'viewer-1',
    viewer_role: 'coach',
    viewer_zone: 'WEST',
    viewer_school: 'USC',
    created_at: '2026-02-09T08:00:00Z',
  },
  {
    id: 'pv-4',
    viewer_id: 'viewer-3',
    viewer_role: 'parent',
    viewer_zone: null,
    viewer_school: null,
    created_at: '2026-02-08T15:00:00Z',
  },
];

// ===========================================================================
// GET /api/analytics/profile-views
// ===========================================================================
describe('GET /api/analytics/profile-views', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();

    const request = createMockRequest('http://localhost:3000/api/analytics/profile-views');
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

    const request = createMockRequest('http://localhost:3000/api/analytics/profile-views');
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

    const request = createMockRequest('http://localhost:3000/api/analytics/profile-views');
    const response = await GET(request as any);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Athlete profile not found');
  });

  it('returns summary, grouped, and recent views on success', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      athletes: { data: mockAthlete, error: null },
      profile_views: { data: mockViews, error: null },
    });

    const request = createMockRequest('http://localhost:3000/api/analytics/profile-views');
    const response = await GET(request as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    // Summary
    expect(json.summary.total_views).toBe(4);
    expect(json.summary.unique_viewers).toBe(3); // viewer-1, viewer-2, viewer-3
    expect(json.summary.coach_views).toBe(3); // 2 coach + 1 recruiter
    expect(json.summary.period_days).toBe(30);
    // Grouped (default: by day)
    expect(json.grouped).toHaveProperty('2026-02-10');
    // Recent (capped at 10)
    expect(json.recent).toBeInstanceOf(Array);
    expect(json.recent.length).toBeLessThanOrEqual(10);
  });

  it('groups by zone when requested', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      athletes: { data: mockAthlete, error: null },
      profile_views: { data: mockViews, error: null },
    });

    const request = createMockRequest(
      'http://localhost:3000/api/analytics/profile-views?group_by=zone'
    );
    const response = await GET(request as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.grouped).toHaveProperty('SOUTHWEST');
    expect(json.grouped.SOUTHWEST).toBe(2);
  });
});
