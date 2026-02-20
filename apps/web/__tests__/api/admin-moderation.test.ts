import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  configureMockSupabase,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { adminUser } from '../fixtures/users';
import { GET, POST } from '@/app/api/admin/moderation/route';

describe('API /api/admin/moderation', () => {
  beforeEach(() => {
    resetMocks();
  });

  // Shared mock setup for moderation — profiles must include admin role
  // so the .single() call in the admin role check passes.
  function setupModerationMocks() {
    configureMockSupabase({
      profiles: { data: [{ role: 'admin' }], error: null },
      highlights: { data: [], error: null },
    });
  }

  // ==========================================
  // GET Tests
  // ==========================================

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const request = new NextRequest(
      new URL('http://localhost/api/admin/moderation')
    );
    const res = await GET(request);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 403 when not admin', async () => {
    mockAuthenticated(adminUser);
    configureMockSupabase({
      profiles: { data: [{ role: 'athlete' }], error: null },
    });

    const request = new NextRequest(
      new URL('http://localhost/api/admin/moderation')
    );
    const res = await GET(request);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Forbidden');
  });

  it('returns empty moderation queue', async () => {
    mockAuthenticated(adminUser);
    setupModerationMocks();

    const request = new NextRequest(
      new URL('http://localhost/api/admin/moderation')
    );
    const res = await GET(request);
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.items).toBeDefined();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items).toHaveLength(0);
  });

  it('returns stats with correct structure', async () => {
    mockAuthenticated(adminUser);
    setupModerationMocks();

    const request = new NextRequest(
      new URL('http://localhost/api/admin/moderation')
    );
    const res = await GET(request);
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.stats).toBeDefined();
    expect(body.stats).toHaveProperty('totalFlagged');
    expect(body.stats).toHaveProperty('pendingReview');
    expect(body.stats).toHaveProperty('resolvedToday');
    expect(typeof body.stats.totalFlagged).toBe('number');
    expect(typeof body.stats.pendingReview).toBe('number');
    expect(typeof body.stats.resolvedToday).toBe('number');
  });

  // ==========================================
  // POST Tests
  // ==========================================

  it('POST returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const request = new NextRequest(
      new URL('http://localhost/api/admin/moderation'),
      {
        method: 'POST',
        body: JSON.stringify({ itemId: '1', action: 'approve' }),
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const res = await POST(request);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('POST returns 400 for missing required fields', async () => {
    mockAuthenticated(adminUser);
    setupModerationMocks();

    const request = new NextRequest(
      new URL('http://localhost/api/admin/moderation'),
      {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const res = await POST(request);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it('POST returns 200 for approve action', async () => {
    mockAuthenticated(adminUser);
    setupModerationMocks();

    const request = new NextRequest(
      new URL('http://localhost/api/admin/moderation'),
      {
        method: 'POST',
        body: JSON.stringify({ itemId: '00000000-0000-0000-0000-000000000001', action: 'approve' }),
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const res = await POST(request);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Content approved successfully');
  });

  it('POST accepts valid remove action', async () => {
    mockAuthenticated(adminUser);
    setupModerationMocks();

    const request = new NextRequest(
      new URL('http://localhost/api/admin/moderation'),
      {
        method: 'POST',
        body: JSON.stringify({ itemId: '00000000-0000-0000-0000-000000000001', action: 'remove' }),
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const res = await POST(request);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Content removed successfully');
  });
});
