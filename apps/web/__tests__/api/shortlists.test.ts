import { describe, it, expect, beforeEach } from 'vitest';
import {
  configureMockSupabase,
  createMockRequest,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { coachWilliams, jaylenWashington } from '../fixtures/users';
import { GET, POST, DELETE } from '@/app/api/shortlists/route';

const BASE = 'http://localhost:3000';

describe('API /api/shortlists', () => {
  beforeEach(() => {
    resetMocks();
  });

  // ─── GET ────────────────────────────────────────────────

  describe('GET /api/shortlists', () => {
    it('returns 401 when unauthenticated', async () => {
      mockUnauthenticated();
      const res = await GET();
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toBe('Unauthorized');
    });

    it('returns 403 when user has no coach record', async () => {
      mockAuthenticated(coachWilliams);
      configureMockSupabase({
        profiles: { data: [{ id: 'profile-1' }], error: null },
        coaches: { data: [], error: null },
      });

      const res = await GET();
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toContain('coaches');
    });

    it('returns shortlists with athlete data on success', async () => {
      mockAuthenticated(coachWilliams);
      const mockShortlists = [
        {
          id: 'sl-1',
          coach_id: 'coach-1',
          athlete_id: 'athlete-001',
          priority: 'high',
          notes: 'Top target',
          created_at: '2026-01-15T00:00:00Z',
          athlete: {
            id: 'athlete-001',
            primary_position: 'QB',
            profile: { full_name: 'Jaylen Washington', avatar_url: null },
          },
        },
      ];

      configureMockSupabase({
        profiles: { data: [{ id: 'profile-1' }], error: null },
        coaches: { data: [{ id: 'coach-1' }], error: null },
        shortlists: { data: mockShortlists, error: null },
      });

      const res = await GET();
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.shortlists).toHaveLength(1);
      expect(body.shortlists[0].id).toBe('sl-1');
      expect(body.shortlists[0].athlete).toBeDefined();
    });

    it('returns 500 on database error', async () => {
      mockAuthenticated(coachWilliams);
      configureMockSupabase({
        profiles: { data: [{ id: 'profile-1' }], error: null },
        coaches: { data: [{ id: 'coach-1' }], error: null },
        shortlists: { data: null, error: { message: 'DB connection failed', code: 'PGRST000' } },
      });

      const res = await GET();
      expect(res.status).toBe(500);
    });
  });

  // ─── POST ───────────────────────────────────────────────

  describe('POST /api/shortlists', () => {
    it('returns 401 when unauthenticated', async () => {
      mockUnauthenticated();
      const req = createMockRequest(`${BASE}/api/shortlists`, {
        method: 'POST',
        body: { athlete_id: jaylenWashington.id },
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it('returns 403 when user is not a coach', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: [{ id: 'profile-1' }], error: null },
        coaches: { data: [], error: null },
      });

      const req = createMockRequest(`${BASE}/api/shortlists`, {
        method: 'POST',
        body: { athlete_id: jaylenWashington.id },
      });
      const res = await POST(req);
      expect(res.status).toBe(403);
    });

    it('returns 400 when athlete_id is missing', async () => {
      mockAuthenticated(coachWilliams);
      configureMockSupabase({
        profiles: { data: [{ id: 'profile-1' }], error: null },
        coaches: { data: [{ id: 'coach-1' }], error: null },
      });

      const req = createMockRequest(`${BASE}/api/shortlists`, {
        method: 'POST',
        body: {},
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('Invalid');
    });

    it('returns 400 when athlete_id is not a valid UUID', async () => {
      mockAuthenticated(coachWilliams);
      configureMockSupabase({
        profiles: { data: [{ id: 'profile-1' }], error: null },
        coaches: { data: [{ id: 'coach-1' }], error: null },
      });

      const req = createMockRequest(`${BASE}/api/shortlists`, {
        method: 'POST',
        body: { athlete_id: 'not-a-uuid' },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('returns 409 on duplicate shortlist entry', async () => {
      mockAuthenticated(coachWilliams);
      configureMockSupabase({
        profiles: { data: [{ id: 'profile-1' }], error: null },
        coaches: { data: [{ id: 'coach-1' }], error: null },
        shortlists: {
          data: null,
          error: { message: 'duplicate key', code: '23505' },
        },
      });

      const req = createMockRequest(`${BASE}/api/shortlists`, {
        method: 'POST',
        body: { athlete_id: '550e8400-e29b-41d4-a716-446655440000' },
      });
      const res = await POST(req);
      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.error).toContain('already');
    });

    it('returns 201 with created shortlist on success', async () => {
      mockAuthenticated(coachWilliams);
      const createdEntry = {
        id: 'sl-new',
        coach_id: 'coach-1',
        athlete_id: '550e8400-e29b-41d4-a716-446655440000',
        priority: 'high',
        notes: 'Great prospect',
        created_at: '2026-02-14T00:00:00Z',
      };

      configureMockSupabase({
        profiles: { data: [{ id: 'profile-1' }], error: null },
        coaches: { data: [{ id: 'coach-1' }], error: null },
        shortlists: { data: [createdEntry], error: null },
      });

      const req = createMockRequest(`${BASE}/api/shortlists`, {
        method: 'POST',
        body: {
          athlete_id: '550e8400-e29b-41d4-a716-446655440000',
          priority: 'high',
          notes: 'Great prospect',
        },
      });
      const res = await POST(req);
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.id).toBe('sl-new');
      expect(body.priority).toBe('high');
    });
  });

  // ─── DELETE ─────────────────────────────────────────────

  describe('DELETE /api/shortlists', () => {
    it('returns 401 when unauthenticated', async () => {
      mockUnauthenticated();
      const req = createMockRequest(
        `${BASE}/api/shortlists?athlete_id=550e8400-e29b-41d4-a716-446655440000`,
        { method: 'DELETE' }
      );
      const res = await DELETE(req);
      expect(res.status).toBe(401);
    });

    it('returns 400 when athlete_id query param is missing', async () => {
      const req = createMockRequest(`${BASE}/api/shortlists`, {
        method: 'DELETE',
      });
      const res = await DELETE(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('athlete_id');
    });

    it('returns 403 when user is not a coach', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: [{ id: 'profile-1' }], error: null },
        coaches: { data: [], error: null },
      });

      const req = createMockRequest(
        `${BASE}/api/shortlists?athlete_id=550e8400-e29b-41d4-a716-446655440000`,
        { method: 'DELETE' }
      );
      const res = await DELETE(req);
      expect(res.status).toBe(403);
    });

    it('returns 204 on successful deletion', async () => {
      mockAuthenticated(coachWilliams);
      configureMockSupabase({
        profiles: { data: [{ id: 'profile-1' }], error: null },
        coaches: { data: [{ id: 'coach-1' }], error: null },
        shortlists: { data: [], error: null },
      });

      const req = createMockRequest(
        `${BASE}/api/shortlists?athlete_id=550e8400-e29b-41d4-a716-446655440000`,
        { method: 'DELETE' }
      );
      const res = await DELETE(req);
      expect(res.status).toBe(204);
    });
  });
});
