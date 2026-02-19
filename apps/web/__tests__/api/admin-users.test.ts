import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  configureMockSupabase,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { adminUser } from '../fixtures/users';
import { GET, PATCH } from '@/app/api/admin/users/route';

describe('API /api/admin/users', () => {
  beforeEach(() => {
    resetMocks();
  });

  // Shared mock setup for user management.
  // The first element must have role: 'admin' so the .single() admin role
  // check passes. The remaining elements provide the user list data.
  function setupUsersMocks(overrides?: {
    profilesData?: unknown[];
    profilesCount?: number;
  }) {
    const defaultProfiles = [
      {
        id: 'admin-001',
        full_name: 'Admin User',
        email: 'admin@repmax.com',
        role: 'admin',
        avatar_url: null,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-02-15T00:00:00Z',
      },
      {
        id: 'u1',
        full_name: 'Test User',
        email: 'test@example.com',
        role: 'athlete',
        avatar_url: null,
        created_at: '2026-01-15T00:00:00Z',
        updated_at: '2026-02-15T00:00:00Z',
      },
      {
        id: 'u2',
        full_name: 'Coach Smith',
        email: 'coach@example.com',
        role: 'coach',
        avatar_url: 'https://example.com/avatar.jpg',
        created_at: '2026-02-01T00:00:00Z',
        updated_at: '2026-02-14T00:00:00Z',
      },
    ];

    configureMockSupabase({
      profiles: {
        data: overrides?.profilesData ?? defaultProfiles,
        error: null,
        count:
          overrides?.profilesCount ??
          (overrides?.profilesData?.length ?? defaultProfiles.length),
      },
    });
  }

  // ==========================================
  // GET Tests
  // ==========================================

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const request = new NextRequest(
      new URL('http://localhost/api/admin/users')
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
      new URL('http://localhost/api/admin/users')
    );
    const res = await GET(request);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Forbidden');
  });

  it('returns user list with correct structure', async () => {
    mockAuthenticated(adminUser);
    setupUsersMocks();

    const request = new NextRequest(
      new URL('http://localhost/api/admin/users')
    );
    const res = await GET(request);
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(Array.isArray(body.users)).toBe(true);
    expect(body.users.length).toBeGreaterThan(0);

    // Each user has required fields
    for (const user of body.users) {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('roles');
      expect(user).toHaveProperty('joinedDate');
      expect(user).toHaveProperty('lastActive');
      expect(user).toHaveProperty('status');
    }
  });

  it('returns stats with correct fields', async () => {
    mockAuthenticated(adminUser);
    setupUsersMocks();

    const request = new NextRequest(
      new URL('http://localhost/api/admin/users')
    );
    const res = await GET(request);
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.stats).toBeDefined();
    expect(body.stats).toHaveProperty('totalUsers');
    expect(body.stats).toHaveProperty('activeToday');
    expect(body.stats).toHaveProperty('newSignups');
    expect(typeof body.stats.totalUsers).toBe('number');
    expect(typeof body.stats.activeToday).toBe('number');
    expect(typeof body.stats.newSignups).toBe('number');
  });

  it('returns pagination info', async () => {
    mockAuthenticated(adminUser);
    setupUsersMocks();

    const request = new NextRequest(
      new URL('http://localhost/api/admin/users')
    );
    const res = await GET(request);
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.pagination).toBeDefined();
    expect(body.pagination).toHaveProperty('page');
    expect(body.pagination).toHaveProperty('limit');
    expect(body.pagination).toHaveProperty('total');
    expect(body.pagination).toHaveProperty('totalPages');
    expect(typeof body.pagination.page).toBe('number');
    expect(typeof body.pagination.limit).toBe('number');
    expect(typeof body.pagination.total).toBe('number');
    expect(typeof body.pagination.totalPages).toBe('number');
  });

  it('applies search filter via query params', async () => {
    mockAuthenticated(adminUser);
    setupUsersMocks();

    const request = new NextRequest(
      new URL('http://localhost/api/admin/users?search=test')
    );
    const res = await GET(request);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.users).toBeDefined();
  });

  it('applies role filter via query params', async () => {
    mockAuthenticated(adminUser);
    setupUsersMocks();

    const request = new NextRequest(
      new URL('http://localhost/api/admin/users?role=athlete')
    );
    const res = await GET(request);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.users).toBeDefined();
  });

  // ==========================================
  // PATCH Tests
  // ==========================================

  it('PATCH returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const request = new NextRequest(
      new URL('http://localhost/api/admin/users'),
      {
        method: 'PATCH',
        body: JSON.stringify({ userId: 'u1', role: 'coach' }),
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const res = await PATCH(request);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('PATCH returns 403 when not admin', async () => {
    mockAuthenticated(adminUser);
    configureMockSupabase({
      profiles: { data: [{ role: 'athlete' }], error: null },
    });

    const request = new NextRequest(
      new URL('http://localhost/api/admin/users'),
      {
        method: 'PATCH',
        body: JSON.stringify({ userId: '550e8400-e29b-41d4-a716-446655440000', role: 'coach' }),
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const res = await PATCH(request);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Forbidden');
  });

  it('PATCH returns 400 for invalid userId (not UUID)', async () => {
    mockAuthenticated(adminUser);
    setupUsersMocks();

    const request = new NextRequest(
      new URL('http://localhost/api/admin/users'),
      {
        method: 'PATCH',
        body: JSON.stringify({ userId: 'u1', role: 'coach' }),
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const res = await PATCH(request);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid request body');
    expect(body.details).toBeDefined();
  });

  it('PATCH updates user role with valid UUID', async () => {
    mockAuthenticated(adminUser);
    setupUsersMocks();

    const request = new NextRequest(
      new URL('http://localhost/api/admin/users'),
      {
        method: 'PATCH',
        body: JSON.stringify({ userId: '550e8400-e29b-41d4-a716-446655440000', role: 'coach' }),
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const res = await PATCH(request);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
