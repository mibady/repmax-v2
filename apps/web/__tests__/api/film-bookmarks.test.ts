import { describe, it, expect, beforeEach } from 'vitest';
import {
  configureMockSupabase,
  createMockRequest,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { coachWilliams, jaylenWashington } from '../fixtures/users';
import { GET, POST } from '@/app/api/film/bookmarks/route';

const BASE = 'http://localhost:3000';

describe('API /api/film/bookmarks', () => {
  beforeEach(() => {
    resetMocks();
  });

  // ─── GET ────────────────────────────────────────────────

  describe('GET /api/film/bookmarks', () => {
    it('returns 401 when unauthenticated', async () => {
      mockUnauthenticated();
      const req = createMockRequest(`${BASE}/api/film/bookmarks`);
      const res = await GET(req as any);
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toBe('Unauthorized');
    });

    it('returns 403 when user is not a coach or recruiter', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: [{ id: 'p-1', role: 'athlete' }], error: null },
      });

      const req = createMockRequest(`${BASE}/api/film/bookmarks`);
      const res = await GET(req as any);
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toContain('coach or recruiter');
    });

    it('returns 404 when coach profile not found', async () => {
      mockAuthenticated(coachWilliams);
      configureMockSupabase({
        profiles: { data: [{ id: 'p-1', role: 'coach' }], error: null },
        coaches: { data: [], error: null },
      });

      const req = createMockRequest(`${BASE}/api/film/bookmarks`);
      const res = await GET(req as any);
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toContain('Coach profile');
    });

    it('returns bookmarks with highlight data on success', async () => {
      mockAuthenticated(coachWilliams);
      const mockBookmarks = [
        {
          id: 'bm-1',
          highlight_id: 'hl-1',
          coach_id: 'c-1',
          timestamp_seconds: 42,
          label: 'Great throw',
          notes: 'Deep ball accuracy',
          rating: 5,
          tags: ['arm-strength'],
          created_at: '2026-02-14T00:00:00Z',
          highlights: {
            id: 'hl-1',
            title: 'Season Highlights',
            video_url: 'https://example.com/video.mp4',
            thumbnail_url: 'https://example.com/thumb.jpg',
            duration_seconds: 180,
            athletes: {
              id: 'athlete-001',
              primary_position: 'QB',
              profiles: { full_name: 'Jaylen Washington' },
            },
          },
        },
      ];

      configureMockSupabase({
        profiles: { data: [{ id: 'p-1', role: 'coach' }], error: null },
        coaches: { data: [{ id: 'c-1' }], error: null },
        film_bookmarks: { data: mockBookmarks, error: null },
      });

      const req = createMockRequest(`${BASE}/api/film/bookmarks`);
      const res = await GET(req as any);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.bookmarks).toHaveLength(1);
      expect(body.bookmarks[0].timestamp_seconds).toBe(42);
      expect(body.bookmarks[0].highlight).toBeDefined();
      expect(body.bookmarks[0].highlight.athlete.name).toBe('Jaylen Washington');
    });

    it('filters by highlight_id query param', async () => {
      mockAuthenticated(coachWilliams);
      configureMockSupabase({
        profiles: { data: [{ id: 'p-1', role: 'coach' }], error: null },
        coaches: { data: [{ id: 'c-1' }], error: null },
        film_bookmarks: { data: [], error: null },
      });

      const req = createMockRequest(
        `${BASE}/api/film/bookmarks?highlight_id=550e8400-e29b-41d4-a716-446655440000`
      );
      const res = await GET(req as any);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.bookmarks).toEqual([]);
    });
  });

  // ─── POST ───────────────────────────────────────────────

  describe('POST /api/film/bookmarks', () => {
    it('returns 401 when unauthenticated', async () => {
      mockUnauthenticated();
      const req = createMockRequest(`${BASE}/api/film/bookmarks`, {
        method: 'POST',
        body: {
          highlight_id: '550e8400-e29b-41d4-a716-446655440000',
          timestamp_seconds: 30,
        },
      });
      const res = await POST(req as any);
      expect(res.status).toBe(401);
    });

    it('returns 403 when user is not a coach or recruiter', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: [{ id: 'p-1', role: 'athlete' }], error: null },
      });

      const req = createMockRequest(`${BASE}/api/film/bookmarks`, {
        method: 'POST',
        body: {
          highlight_id: '550e8400-e29b-41d4-a716-446655440000',
          timestamp_seconds: 30,
        },
      });
      const res = await POST(req as any);
      expect(res.status).toBe(403);
    });

    it('returns 400 when highlight_id is missing', async () => {
      mockAuthenticated(coachWilliams);
      configureMockSupabase({
        profiles: { data: [{ id: 'p-1', role: 'coach' }], error: null },
        coaches: { data: [{ id: 'c-1' }], error: null },
      });

      const req = createMockRequest(`${BASE}/api/film/bookmarks`, {
        method: 'POST',
        body: { timestamp_seconds: 30 },
      });
      const res = await POST(req as any);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('Invalid');
    });

    it('returns 404 when highlight not found', async () => {
      mockAuthenticated(coachWilliams);
      configureMockSupabase({
        profiles: { data: [{ id: 'p-1', role: 'coach' }], error: null },
        coaches: { data: [{ id: 'c-1' }], error: null },
        highlights: { data: [], error: null },
      });

      const req = createMockRequest(`${BASE}/api/film/bookmarks`, {
        method: 'POST',
        body: {
          highlight_id: '550e8400-e29b-41d4-a716-446655440000',
          timestamp_seconds: 30,
        },
      });
      const res = await POST(req as any);
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toContain('Highlight');
    });

    it('returns 409 on duplicate bookmark', async () => {
      mockAuthenticated(coachWilliams);
      configureMockSupabase({
        profiles: { data: [{ id: 'p-1', role: 'coach' }], error: null },
        coaches: { data: [{ id: 'c-1' }], error: null },
        highlights: { data: [{ id: '550e8400-e29b-41d4-a716-446655440000' }], error: null },
        film_bookmarks: {
          data: null,
          error: { message: 'duplicate', code: '23505' },
        },
      });

      const req = createMockRequest(`${BASE}/api/film/bookmarks`, {
        method: 'POST',
        body: {
          highlight_id: '550e8400-e29b-41d4-a716-446655440000',
          timestamp_seconds: 30,
        },
      });
      const res = await POST(req as any);
      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.error).toContain('already exists');
    });

    it('returns 201 with created bookmark on success', async () => {
      mockAuthenticated(coachWilliams);
      const createdBookmark = {
        id: 'bm-new',
        highlight_id: '550e8400-e29b-41d4-a716-446655440000',
        coach_id: 'c-1',
        timestamp_seconds: 42,
        label: 'Key play',
        notes: null,
        rating: 4,
        tags: ['speed'],
        created_at: '2026-02-14T00:00:00Z',
      };

      configureMockSupabase({
        profiles: { data: [{ id: 'p-1', role: 'coach' }], error: null },
        coaches: { data: [{ id: 'c-1' }], error: null },
        highlights: { data: [{ id: '550e8400-e29b-41d4-a716-446655440000' }], error: null },
        film_bookmarks: { data: [createdBookmark], error: null },
      });

      const req = createMockRequest(`${BASE}/api/film/bookmarks`, {
        method: 'POST',
        body: {
          highlight_id: '550e8400-e29b-41d4-a716-446655440000',
          timestamp_seconds: 42,
          label: 'Key play',
          rating: 4,
          tags: ['speed'],
        },
      });
      const res = await POST(req as any);
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.bookmark.id).toBe('bm-new');
      expect(body.bookmark.timestamp_seconds).toBe(42);
    });
  });
});
