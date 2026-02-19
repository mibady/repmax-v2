import { describe, it, expect, beforeEach } from 'vitest';
import {
  configureMockSupabase,
  createMockRequest,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { mikeTorres } from '../fixtures/users';

import { POST } from '@/app/api/club/events/route';

const BASE = 'http://localhost:3000/api/club/events';

const validBody = {
  name: 'Winter Classic 2026',
  start_date: '2026-03-15',
  end_date: '2026-03-17',
  location: 'Austin, TX',
  capacity: 16,
};

const mockCreatedTournament = {
  id: 'tournament-new-1',
  name: 'Winter Classic 2026',
  start_date: '2026-03-15',
  end_date: '2026-03-17',
  location: 'Austin, TX',
  teams_capacity: 16,
  teams_registered: 0,
  total_collected: 0,
  status: 'upcoming',
  organizer_id: mikeTorres.id,
};

// ===========================================================================
// POST /api/club/events
// ===========================================================================
describe('POST /api/club/events', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const request = createMockRequest(BASE, {
      method: 'POST',
      body: validBody,
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 400 with missing required fields', async () => {
    mockAuthenticated(mikeTorres);
    const request = createMockRequest(BASE, {
      method: 'POST',
      body: { name: 'Winter Classic 2026' },
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid request body');
    expect(json.details).toBeDefined();
  });

  it('returns 400 with invalid capacity (negative number)', async () => {
    mockAuthenticated(mikeTorres);
    const request = createMockRequest(BASE, {
      method: 'POST',
      body: { ...validBody, capacity: -5 },
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid request body');
  });

  it('returns 400 with invalid capacity (non-integer)', async () => {
    mockAuthenticated(mikeTorres);
    const request = createMockRequest(BASE, {
      method: 'POST',
      body: { ...validBody, capacity: 16.5 },
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid request body');
  });

  it('returns 500 on database error', async () => {
    mockAuthenticated(mikeTorres);
    configureMockSupabase({
      tournaments: { data: null, error: { message: 'Database error', code: '23505' } },
    });

    const request = createMockRequest(BASE, {
      method: 'POST',
      body: validBody,
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Database error');
  });

  it('returns 201 with created tournament on success', async () => {
    mockAuthenticated(mikeTorres);
    configureMockSupabase({
      tournaments: { data: mockCreatedTournament, error: null },
    });

    const request = createMockRequest(BASE, {
      method: 'POST',
      body: validBody,
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.id).toBe('tournament-new-1');
    expect(json.name).toBe('Winter Classic 2026');
    expect(json.start_date).toBe('2026-03-15');
    expect(json.end_date).toBe('2026-03-17');
    expect(json.location).toBe('Austin, TX');
    expect(json.teams_capacity).toBe(16);
    expect(json.teams_registered).toBe(0);
    expect(json.total_collected).toBe(0);
    expect(json.status).toBe('upcoming');
    expect(json.organizer_id).toBe(mikeTorres.id);
  });
});
