import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  configureMockSupabase,
  createMockRequest,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { mockSupabaseClient } from '../setup';
import { coachWilliams, jaylenWashington } from '../fixtures/users';
import { GET, POST, PATCH } from '@/app/api/messages/route';

const BASE = 'http://localhost:3000';

describe('API /api/messages', () => {
  beforeEach(() => {
    resetMocks();
  });

  // ─── GET ────────────────────────────────────────────────

  describe('GET /api/messages', () => {
    it('returns 401 when unauthenticated', async () => {
      mockUnauthenticated();
      const req = createMockRequest(`${BASE}/api/messages`);
      const res = await GET(req);
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toBe('Unauthorized');
    });

    it('returns 404 when profile not found', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: [], error: null },
        messages: { data: [], error: null },
      });

      const req = createMockRequest(`${BASE}/api/messages`);
      const res = await GET(req);
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toContain('Profile');
    });

    it('returns inbox messages by default', async () => {
      mockAuthenticated(jaylenWashington);
      const mockMessages = [
        {
          id: 'msg-1',
          sender_id: 'profile-2',
          recipient_id: 'profile-1',
          subject: 'Recruiting Update',
          body: 'Interested in your film.',
          read: false,
          created_at: '2026-02-14T00:00:00Z',
          sender: { id: 'profile-2', full_name: 'Brian Williams', avatar_url: null },
          recipient: { id: 'profile-1', full_name: 'Jaylen Washington', avatar_url: null },
        },
      ];

      configureMockSupabase({
        profiles: { data: [{ id: 'profile-1' }], error: null },
        messages: { data: mockMessages, error: null, count: 1 },
      });

      const req = createMockRequest(`${BASE}/api/messages`);
      const res = await GET(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.messages).toHaveLength(1);
      expect(body.messages[0].subject).toBe('Recruiting Update');
      expect(body.unread_count).toBeDefined();
    });

    it('returns sent folder messages when folder=sent', async () => {
      mockAuthenticated(jaylenWashington);
      const sentMessages = [
        {
          id: 'msg-2',
          sender_id: 'profile-1',
          recipient_id: 'profile-2',
          subject: 'Thank you',
          body: 'Thanks for reaching out.',
          read: true,
          created_at: '2026-02-14T01:00:00Z',
          sender: { id: 'profile-1', full_name: 'Jaylen Washington', avatar_url: null },
          recipient: { id: 'profile-2', full_name: 'Brian Williams', avatar_url: null },
        },
      ];

      configureMockSupabase({
        profiles: { data: [{ id: 'profile-1' }], error: null },
        messages: { data: sentMessages, error: null, count: 0 },
      });

      const req = createMockRequest(`${BASE}/api/messages?folder=sent`);
      const res = await GET(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.messages).toHaveLength(1);
      expect(body.messages[0].sender_id).toBe('profile-1');
    });

    it('returns unread_count', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: [{ id: 'profile-1' }], error: null },
        messages: { data: [], error: null, count: 3 },
      });

      const req = createMockRequest(`${BASE}/api/messages`);
      const res = await GET(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(typeof body.unread_count).toBe('number');
    });

    it('returns 500 on database error', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: [{ id: 'profile-1' }], error: null },
        messages: { data: null, error: { message: 'DB error', code: 'PGRST000' } },
      });

      const req = createMockRequest(`${BASE}/api/messages`);
      const res = await GET(req);
      expect(res.status).toBe(500);
    });
  });

  // ─── POST ───────────────────────────────────────────────

  describe('POST /api/messages', () => {
    it('returns 401 when unauthenticated', async () => {
      mockUnauthenticated();
      const req = createMockRequest(`${BASE}/api/messages`, {
        method: 'POST',
        body: {
          recipient_id: '550e8400-e29b-41d4-a716-446655440000',
          body: 'Hello',
        },
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it('returns 404 when sender profile not found', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: [], error: null },
      });

      const req = createMockRequest(`${BASE}/api/messages`, {
        method: 'POST',
        body: {
          recipient_id: '550e8400-e29b-41d4-a716-446655440000',
          body: 'Hello',
        },
      });
      const res = await POST(req);
      expect(res.status).toBe(404);
    });

    it('returns 400 when body field is missing', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: [{ id: 'profile-1' }], error: null },
      });

      const req = createMockRequest(`${BASE}/api/messages`, {
        method: 'POST',
        body: { recipient_id: '550e8400-e29b-41d4-a716-446655440000' },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Invalid');
    });

    it('returns 400 when body is empty string', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: [{ id: 'profile-1' }], error: null },
      });

      const req = createMockRequest(`${BASE}/api/messages`, {
        method: 'POST',
        body: {
          recipient_id: '550e8400-e29b-41d4-a716-446655440000',
          body: '',
        },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('returns 400 when body exceeds 5000 characters', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: [{ id: 'profile-1' }], error: null },
      });

      const req = createMockRequest(`${BASE}/api/messages`, {
        method: 'POST',
        body: {
          recipient_id: '550e8400-e29b-41d4-a716-446655440000',
          body: 'x'.repeat(5001),
        },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('returns 400 when recipient_id is not a valid UUID', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: [{ id: 'profile-1' }], error: null },
      });

      const req = createMockRequest(`${BASE}/api/messages`, {
        method: 'POST',
        body: { recipient_id: 'not-a-uuid', body: 'Hello' },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('returns 404 when recipient not found', async () => {
      mockAuthenticated(jaylenWashington);

      // Need per-call differentiation: first profiles.single() returns sender,
      // second profiles.single() returns null (recipient not found).
      let profileSingleCalls = 0;
      (mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockImplementation(
        (table: string) => {
          const chain: Record<string, unknown> = {};
          const methods = [
            'select', 'insert', 'update', 'delete', 'upsert',
            'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
            'like', 'ilike', 'is', 'in', 'contains',
            'order', 'limit', 'range', 'not', 'filter',
            'match', 'textSearch', 'or', 'and',
          ];
          for (const m of methods) chain[m] = vi.fn(() => chain);

          if (table === 'profiles') {
            chain.single = vi.fn(() => {
              profileSingleCalls++;
              if (profileSingleCalls === 1) {
                return Promise.resolve({ data: { id: 'profile-1' }, error: null });
              }
              return Promise.resolve({ data: null, error: null });
            });
          } else {
            chain.single = vi.fn(() => Promise.resolve({ data: null, error: null }));
          }

          chain.maybeSingle = vi.fn(() => Promise.resolve({ data: null, error: null }));
          chain.then = vi.fn((resolve: (v: { data: unknown[]; error: null; count: number }) => void) =>
            resolve({ data: [], error: null, count: 0 })
          );

          return chain;
        }
      );

      const req = createMockRequest(`${BASE}/api/messages`, {
        method: 'POST',
        body: {
          recipient_id: '550e8400-e29b-41d4-a716-446655440000',
          body: 'Hello recruiter!',
        },
      });
      const res = await POST(req);
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toContain('Recipient');
    });

    it('returns 201 with created message on success', async () => {
      mockAuthenticated(jaylenWashington);
      const createdMsg = {
        id: 'msg-new',
        sender_id: 'profile-1',
        recipient_id: '550e8400-e29b-41d4-a716-446655440000',
        subject: 'Interest',
        body: 'Hello recruiter!',
        read: false,
        created_at: '2026-02-14T00:00:00Z',
      };

      // Both profiles.single() calls return data (sender + recipient exist)
      configureMockSupabase({
        profiles: { data: [{ id: 'profile-1' }], error: null },
        messages: { data: [createdMsg], error: null },
      });

      const req = createMockRequest(`${BASE}/api/messages`, {
        method: 'POST',
        body: {
          recipient_id: '550e8400-e29b-41d4-a716-446655440000',
          subject: 'Interest',
          body: 'Hello recruiter!',
        },
      });
      const res = await POST(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.id).toBe('msg-new');
      expect(json.body).toBe('Hello recruiter!');
    });
  });

  // ─── PATCH ──────────────────────────────────────────────

  describe('PATCH /api/messages', () => {
    it('returns 401 when unauthenticated', async () => {
      mockUnauthenticated();
      const req = createMockRequest(`${BASE}/api/messages?id=msg-1`, {
        method: 'PATCH',
      });
      const res = await PATCH(req);
      expect(res.status).toBe(401);
    });

    it('returns 400 when id query param is missing', async () => {
      mockAuthenticated(jaylenWashington);
      const req = createMockRequest(`${BASE}/api/messages`, {
        method: 'PATCH',
      });
      const res = await PATCH(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('id');
    });

    it('marks message as read and returns updated message', async () => {
      mockAuthenticated(jaylenWashington);
      const updatedMsg = {
        id: 'msg-1',
        sender_id: 'profile-2',
        recipient_id: 'profile-1',
        read: true,
        body: 'Hello',
        created_at: '2026-02-14T00:00:00Z',
      };

      configureMockSupabase({
        profiles: { data: [{ id: 'profile-1' }], error: null },
        messages: { data: [updatedMsg], error: null },
      });

      const req = createMockRequest(`${BASE}/api/messages?id=msg-1`, {
        method: 'PATCH',
      });
      const res = await PATCH(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.read).toBe(true);
      expect(body.id).toBe('msg-1');
    });

    it('returns 500 on database error', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: [{ id: 'profile-1' }], error: null },
        messages: { data: null, error: { message: 'Update failed', code: 'PGRST000' } },
      });

      const req = createMockRequest(`${BASE}/api/messages?id=msg-1`, {
        method: 'PATCH',
      });
      const res = await PATCH(req);
      expect(res.status).toBe(500);
    });
  });
});
