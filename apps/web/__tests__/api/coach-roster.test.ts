import { describe, it, expect, beforeEach } from 'vitest';
import {
  configureMockSupabase,
  createMockRequest,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { coachDavis, jaylenWashington } from '../fixtures/users';

import { POST, DELETE, PATCH } from '@/app/api/coach/roster/route';

const BASE = 'http://localhost:3000/api/coach/roster';

const mockCoachProfile = { id: 'coach-001', role: 'coach' };
const mockNonCoachProfile = { id: 'athlete-001', role: 'athlete' };
const mockTeam = { id: 'team-001' };
const mockRosterEntry = {
  id: 'roster-entry-1',
  team_id: 'team-001',
  athlete_id: 'ath-001',
};

// ===========================================================================
// POST /api/coach/roster
// ===========================================================================
describe('POST /api/coach/roster', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const request = createMockRequest(BASE, {
      method: 'POST',
      body: { athlete_id: '550e8400-e29b-41d4-a716-446655440000' },
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 403 when non-coach role', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: mockNonCoachProfile, error: null },
    });

    const request = createMockRequest(BASE, {
      method: 'POST',
      body: { athlete_id: '550e8400-e29b-41d4-a716-446655440000' },
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toBe('Forbidden');
  });

  it('returns 400 when no team found', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockCoachProfile, error: null },
      teams: { data: null, error: null },
    });

    const request = createMockRequest(BASE, {
      method: 'POST',
      body: { athlete_id: '550e8400-e29b-41d4-a716-446655440000' },
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('No team found');
  });

  it('returns 201 with entry on successful add', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockCoachProfile, error: null },
      teams: { data: mockTeam, error: null },
      team_rosters: { data: mockRosterEntry, error: null },
    });

    const request = createMockRequest(BASE, {
      method: 'POST',
      body: { athlete_id: '550e8400-e29b-41d4-a716-446655440000' },
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.entry).toBeDefined();
    expect(json.entry.id).toBe('roster-entry-1');
    expect(json.entry.team_id).toBe('team-001');
  });

  it('returns 500 on insert error', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockCoachProfile, error: null },
      teams: { data: mockTeam, error: null },
      team_rosters: { data: null, error: { message: 'Duplicate entry' } },
    });

    const request = createMockRequest(BASE, {
      method: 'POST',
      body: { athlete_id: '550e8400-e29b-41d4-a716-446655440000' },
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBeDefined();
  });
});

// ===========================================================================
// DELETE /api/coach/roster
// ===========================================================================
describe('DELETE /api/coach/roster', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const request = createMockRequest(`${BASE}?athlete_id=ath-001`, {
      method: 'DELETE',
    });

    const response = await DELETE(request as any);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 400 when athlete_id query param missing', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockCoachProfile, error: null },
      teams: { data: mockTeam, error: null },
    });

    const request = createMockRequest(BASE, {
      method: 'DELETE',
    });

    const response = await DELETE(request as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('athlete_id');
  });

  it('returns 200 with success on delete', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockCoachProfile, error: null },
      teams: { data: mockTeam, error: null },
      team_rosters: { data: null, error: null },
    });

    const request = createMockRequest(`${BASE}?athlete_id=ath-001`, {
      method: 'DELETE',
    });

    const response = await DELETE(request as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
  });
});

// ===========================================================================
// PATCH /api/coach/roster
// ===========================================================================
describe('PATCH /api/coach/roster', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const request = createMockRequest(BASE, {
      method: 'PATCH',
      body: {
        athlete_id: '550e8400-e29b-41d4-a716-446655440000',
        priority: 'high',
      },
    });

    const response = await PATCH(request as any);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 400 when no fields to update', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockCoachProfile, error: null },
      teams: { data: mockTeam, error: null },
    });

    const request = createMockRequest(BASE, {
      method: 'PATCH',
      body: { athlete_id: '550e8400-e29b-41d4-a716-446655440000' },
    });

    const response = await PATCH(request as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('No fields to update');
  });

  it('returns 200 with updated entry on success', async () => {
    mockAuthenticated(coachDavis);
    const updatedEntry = { ...mockRosterEntry, priority: 'high', notes: 'Top prospect' };
    configureMockSupabase({
      profiles: { data: mockCoachProfile, error: null },
      teams: { data: mockTeam, error: null },
      team_rosters: { data: updatedEntry, error: null },
    });

    const request = createMockRequest(BASE, {
      method: 'PATCH',
      body: {
        athlete_id: '550e8400-e29b-41d4-a716-446655440000',
        priority: 'high',
        notes: 'Top prospect',
      },
    });

    const response = await PATCH(request as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.entry).toBeDefined();
    expect(json.entry.priority).toBe('high');
    expect(json.entry.notes).toBe('Top prospect');
  });
});
