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

  it('GET returns 403 when unauthenticated', async () => {
    mockUnauthenticated();
    const res = await GET();
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Forbidden');
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

  it('PUT returns 403 when unauthenticated', async () => {
    mockUnauthenticated();
    const request = new NextRequest(
      new URL('http://localhost/api/admin/feature-flags'),
      {
        method: 'PUT',
        body: JSON.stringify({ id: '00000000-0000-0000-0000-000000000001', enabled: true }),
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const res = await PUT(request);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Forbidden');
  });

  // ==========================================
  // POST Tests
  // ==========================================

  it('POST returns 403 when unauthenticated', async () => {
    mockUnauthenticated();
    const request = new NextRequest(
      new URL('http://localhost/api/admin/feature-flags'),
      {
        method: 'POST',
        body: JSON.stringify({ key: 'test', label: 'Test Flag', enabled: false }),
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const res = await POST(request);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Forbidden');
  });
});
