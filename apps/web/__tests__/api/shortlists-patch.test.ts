import { describe, it, expect, beforeEach } from 'vitest';
import {
  configureMockSupabase,
  createMockRequest,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { coachDavis } from '../fixtures/users';

import { PATCH } from '@/app/api/shortlists/[id]/route';

const BASE = 'http://localhost:3000/api/shortlists';

// Helper to create the params object for Next.js 15 route handlers
function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

const mockProfile = {
  id: coachDavis.id,
  full_name: 'James Davis',
  avatar_url: null,
};

const mockCoach = {
  id: 'coach-db-001',
  school_name: 'Allen High School',
};

const mockUpdatedShortlist = {
  id: 'shortlist-1',
  coach_id: 'coach-db-001',
  athlete_id: 'athlete-001',
  priority: 'high',
  notes: 'Great prospect',
  updated_at: '2026-02-18T12:00:00Z',
};

// ===========================================================================
// PATCH /api/shortlists/[id]
// ===========================================================================
describe('PATCH /api/shortlists/[id]', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const request = createMockRequest(`${BASE}/shortlist-1`, {
      method: 'PATCH',
      body: { priority: 'high' },
    });

    const response = await PATCH(request as any, makeParams('shortlist-1'));
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 400 with invalid priority value', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      coaches: { data: mockCoach, error: null },
    });

    const request = createMockRequest(`${BASE}/shortlist-1`, {
      method: 'PATCH',
      body: { priority: 'super_high' },
    });

    const response = await PATCH(request as any, makeParams('shortlist-1'));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid request body');
  });

  it('returns 404 when profile not found', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: null, error: null },
    });

    const request = createMockRequest(`${BASE}/shortlist-1`, {
      method: 'PATCH',
      body: { priority: 'high' },
    });

    const response = await PATCH(request as any, makeParams('shortlist-1'));
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

    const request = createMockRequest(`${BASE}/shortlist-1`, {
      method: 'PATCH',
      body: { priority: 'high' },
    });

    const response = await PATCH(request as any, makeParams('shortlist-1'));
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Coach profile not found');
  });

  it('returns 404 when shortlist entry not found', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      coaches: { data: mockCoach, error: null },
      shortlists: { data: null, error: { message: 'No rows returned', code: 'PGRST116' } },
    });

    const request = createMockRequest(`${BASE}/shortlist-nonexistent`, {
      method: 'PATCH',
      body: { priority: 'high' },
    });

    const response = await PATCH(request as any, makeParams('shortlist-nonexistent'));
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Shortlist entry not found');
  });

  it('returns 200 with updated shortlist on success (priority only)', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      coaches: { data: mockCoach, error: null },
      shortlists: { data: mockUpdatedShortlist, error: null },
    });

    const request = createMockRequest(`${BASE}/shortlist-1`, {
      method: 'PATCH',
      body: { priority: 'high' },
    });

    const response = await PATCH(request as any, makeParams('shortlist-1'));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.shortlist).toBeDefined();
    expect(json.shortlist.id).toBe('shortlist-1');
    expect(json.shortlist.priority).toBe('high');
    expect(json.shortlist.coach_id).toBe('coach-db-001');
  });

  it('returns 200 with updated shortlist on success (notes only)', async () => {
    mockAuthenticated(coachDavis);
    const shortlistWithNotes = {
      ...mockUpdatedShortlist,
      priority: 'medium',
      notes: 'Updated notes about this prospect',
    };
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      coaches: { data: mockCoach, error: null },
      shortlists: { data: shortlistWithNotes, error: null },
    });

    const request = createMockRequest(`${BASE}/shortlist-1`, {
      method: 'PATCH',
      body: { notes: 'Updated notes about this prospect' },
    });

    const response = await PATCH(request as any, makeParams('shortlist-1'));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.shortlist.notes).toBe('Updated notes about this prospect');
  });

  it('returns 200 with updated shortlist on success (both priority + notes)', async () => {
    mockAuthenticated(coachDavis);
    const shortlistBoth = {
      ...mockUpdatedShortlist,
      priority: 'top',
      notes: 'Must recruit immediately',
    };
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      coaches: { data: mockCoach, error: null },
      shortlists: { data: shortlistBoth, error: null },
    });

    const request = createMockRequest(`${BASE}/shortlist-1`, {
      method: 'PATCH',
      body: { priority: 'top', notes: 'Must recruit immediately' },
    });

    const response = await PATCH(request as any, makeParams('shortlist-1'));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.shortlist.priority).toBe('top');
    expect(json.shortlist.notes).toBe('Must recruit immediately');
  });

  it('accepts all valid priority values', async () => {
    mockAuthenticated(coachDavis);

    for (const priority of ['low', 'medium', 'high', 'top']) {
      configureMockSupabase({
        profiles: { data: mockProfile, error: null },
        coaches: { data: mockCoach, error: null },
        shortlists: { data: { ...mockUpdatedShortlist, priority }, error: null },
      });

      const request = createMockRequest(`${BASE}/shortlist-1`, {
        method: 'PATCH',
        body: { priority },
      });

      const response = await PATCH(request as any, makeParams('shortlist-1'));
      expect(response.status).toBe(200);
    }
  });
});
