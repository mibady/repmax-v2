import { describe, it, expect, beforeEach } from 'vitest';
import {
  configureMockSupabase,
  createMockRequest,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { mikeTorres } from '../fixtures/users';

import { PATCH } from '@/app/api/club/verifications/route';

const BASE = 'http://localhost:3000/api/club/verifications';

const mockVerification = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  club_id: mikeTorres.id,
  athlete_id: 'athlete-001',
  type: 'gpa',
  status: 'approved',
};

const validBody = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  status: 'approved',
};

// ===========================================================================
// PATCH /api/club/verifications
// ===========================================================================
describe('PATCH /api/club/verifications', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const request = createMockRequest(BASE, {
      method: 'PATCH',
      body: validBody,
    });

    const response = await PATCH(request as any);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 400 with missing required fields (id, status)', async () => {
    mockAuthenticated(mikeTorres);
    const request = createMockRequest(BASE, {
      method: 'PATCH',
      body: {},
    });

    const response = await PATCH(request as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid request body');
    expect(json.details).toBeDefined();
  });

  it('returns 400 with invalid status value', async () => {
    mockAuthenticated(mikeTorres);
    const request = createMockRequest(BASE, {
      method: 'PATCH',
      body: { id: '550e8400-e29b-41d4-a716-446655440000', status: 'pending' },
    });

    const response = await PATCH(request as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid request body');
  });

  it('returns 400 with invalid id format (not UUID)', async () => {
    mockAuthenticated(mikeTorres);
    const request = createMockRequest(BASE, {
      method: 'PATCH',
      body: { id: 'not-a-uuid', status: 'approved' },
    });

    const response = await PATCH(request as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid request body');
  });

  it('returns 500 on database error', async () => {
    mockAuthenticated(mikeTorres);
    configureMockSupabase({
      athlete_verifications: { data: null, error: { message: 'Database error', code: '23505' } },
    });

    const request = createMockRequest(BASE, {
      method: 'PATCH',
      body: validBody,
    });

    const response = await PATCH(request as any);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Database error');
  });

  it('returns 404 when verification not found (null data after update)', async () => {
    mockAuthenticated(mikeTorres);
    configureMockSupabase({
      athlete_verifications: { data: null, error: null },
    });

    const request = createMockRequest(BASE, {
      method: 'PATCH',
      body: validBody,
    });

    const response = await PATCH(request as any);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Verification not found');
  });

  it('returns 200 with updated verification on success (approved)', async () => {
    mockAuthenticated(mikeTorres);
    configureMockSupabase({
      athlete_verifications: { data: { ...mockVerification, status: 'approved' }, error: null },
    });

    const request = createMockRequest(BASE, {
      method: 'PATCH',
      body: { id: '550e8400-e29b-41d4-a716-446655440000', status: 'approved' },
    });

    const response = await PATCH(request as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(json.status).toBe('approved');
    expect(json.club_id).toBe(mikeTorres.id);
    expect(json.athlete_id).toBe('athlete-001');
    expect(json.type).toBe('gpa');
  });

  it('returns 200 with updated verification on success (rejected)', async () => {
    mockAuthenticated(mikeTorres);
    configureMockSupabase({
      athlete_verifications: { data: { ...mockVerification, status: 'rejected' }, error: null },
    });

    const request = createMockRequest(BASE, {
      method: 'PATCH',
      body: { id: '550e8400-e29b-41d4-a716-446655440000', status: 'rejected' },
    });

    const response = await PATCH(request as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(json.status).toBe('rejected');
  });
});
