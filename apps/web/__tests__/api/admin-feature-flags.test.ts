import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  configureMockSupabase,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { adminUser } from '../fixtures/users';
import { GET, PUT, POST } from '@/app/api/admin/feature-flags/route';

describe('API /api/admin/feature-flags', () => {
  beforeEach(() => {
    resetMocks();
  });

  // Helper: mock profiles table so .single() returns admin role
  function setupAdminMock() {
    configureMockSupabase({
      profiles: { data: [{ role: 'admin' }], error: null },
    });
  }

  // ==========================================
  // GET Tests
  // ==========================================

  it('GET returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const res = await GET();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('GET returns 403 when not admin', async () => {
    mockAuthenticated(adminUser);
    configureMockSupabase({
      profiles: { data: [{ role: 'athlete' }], error: null },
    });
    const res = await GET();
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Forbidden');
  });

  it('GET returns empty flags array with total and filtered counts', async () => {
    mockAuthenticated(adminUser);
    setupAdminMock();

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.flags).toBeDefined();
    expect(Array.isArray(body.flags)).toBe(true);
    expect(body.flags).toHaveLength(0);
    expect(body.total).toBe(0);
    expect(body.filtered).toBe(0);
  });

  // ==========================================
  // PUT Tests
  // ==========================================

  it('PUT returns 501 not implemented', async () => {
    const res = await PUT();
    expect(res.status).toBe(501);
    const body = await res.json();
    expect(body.error).toBe('Feature flags not yet implemented');
  });

  // ==========================================
  // POST Tests
  // ==========================================

  it('POST returns 501 not implemented', async () => {
    const res = await POST();
    expect(res.status).toBe(501);
    const body = await res.json();
    expect(body.error).toBe('Feature flags not yet implemented');
  });
});
