import { describe, it, expect, beforeEach } from 'vitest';
import {
  configureMockSupabase,
  createMockRequest,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { jaylenWashington, coachDavis } from '../fixtures/users';

import { GET, POST } from '@/app/api/messages/[contactId]/route';

const BASE = 'http://localhost:3000/api/messages';
const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

// Helper to create the params object for Next.js 15 route handlers
function makeParams(contactId: string) {
  return { params: Promise.resolve({ contactId }) };
}

// Mock profile used for both user and contact (mock returns same for all profiles queries)
const mockProfile = {
  id: jaylenWashington.id,
  full_name: 'Jaylen Washington',
  avatar_url: null,
  role: 'athlete',
};

// ===========================================================================
// GET /api/messages/[contactId]
// ===========================================================================
describe('GET /api/messages/[contactId]', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('returns 400 for invalid contactId UUID', async () => {
    const request = createMockRequest(`${BASE}/not-a-uuid`);
    const response = await GET(request, makeParams('not-a-uuid'));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('Invalid');
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();

    const request = createMockRequest(`${BASE}/${VALID_UUID}`);
    const response = await GET(request, makeParams(VALID_UUID));
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 404 when profile not found', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: null, error: null },
    });

    const request = createMockRequest(`${BASE}/${VALID_UUID}`);
    const response = await GET(request, makeParams(VALID_UUID));
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Profile not found');
  });

  it('returns conversation data on success', async () => {
    mockAuthenticated(jaylenWashington);
    const mockMessages = [
      {
        id: 'm-1',
        sender_id: jaylenWashington.id,
        recipient_id: VALID_UUID,
        subject: 'Hi',
        body: 'Hello there',
        read: true,
        created_at: '2026-02-10T10:00:00Z',
      },
    ];

    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      messages: { data: mockMessages, error: null },
    });

    const request = createMockRequest(`${BASE}/${VALID_UUID}`);
    const response = await GET(request, makeParams(VALID_UUID));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveProperty('messages');
    expect(json).toHaveProperty('contact');
    expect(json).toHaveProperty('currentUser');
    expect(json.messages).toBeInstanceOf(Array);
  });
});

// ===========================================================================
// POST /api/messages/[contactId]
// ===========================================================================
describe('POST /api/messages/[contactId]', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('returns 400 for invalid contactId UUID', async () => {
    const request = createMockRequest(`${BASE}/not-a-uuid`, {
      method: 'POST',
      body: { body: 'Hello' },
    });
    const response = await POST(request, makeParams('not-a-uuid'));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('Invalid');
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();

    const request = createMockRequest(`${BASE}/${VALID_UUID}`, {
      method: 'POST',
      body: { body: 'Hello' },
    });
    const response = await POST(request, makeParams(VALID_UUID));
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 400 for invalid message body', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: { id: 'prof-1' }, error: null },
    });

    const request = createMockRequest(`${BASE}/${VALID_UUID}`, {
      method: 'POST',
      body: { body: '' }, // empty body not allowed (min 1)
    });
    const response = await POST(request, makeParams(VALID_UUID));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('Invalid');
  });

  it('returns created message on success', async () => {
    mockAuthenticated(jaylenWashington);
    const mockCreated = {
      id: 'm-new',
      sender_id: 'prof-1',
      recipient_id: VALID_UUID,
      body: 'Hello there',
      subject: null,
      read: false,
      created_at: '2026-02-15T10:00:00Z',
    };

    configureMockSupabase({
      profiles: { data: { id: 'prof-1' }, error: null },
      messages: { data: [mockCreated], error: null },
    });

    const request = createMockRequest(`${BASE}/${VALID_UUID}`, {
      method: 'POST',
      body: { body: 'Hello there' },
    });
    const response = await POST(request, makeParams(VALID_UUID));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.id).toBe('m-new');
    expect(json.senderId).toBe('me');
    expect(json.content).toBe('Hello there');
  });
});
