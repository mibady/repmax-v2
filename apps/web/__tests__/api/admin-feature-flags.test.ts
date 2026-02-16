import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Feature flags route uses in-memory storage, so we need to reset module state
// between tests to avoid cross-test contamination.
// We use vi.resetModules() + dynamic import to get a fresh module for each test.

describe('API /api/admin/feature-flags', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  async function importRoute() {
    return await import('@/app/api/admin/feature-flags/route');
  }

  // ==========================================
  // GET Tests
  // ==========================================

  it('GET returns flags with correct structure', async () => {
    const { GET } = await importRoute();

    const request = new NextRequest(
      new URL('http://localhost/api/admin/feature-flags')
    );
    const res = await GET(request);
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.flags).toBeDefined();
    expect(Array.isArray(body.flags)).toBe(true);
    expect(body.flags.length).toBeGreaterThanOrEqual(4);

    // Each flag has required fields
    for (const flag of body.flags) {
      expect(flag).toHaveProperty('id');
      expect(flag).toHaveProperty('name');
      expect(flag).toHaveProperty('key');
      expect(flag).toHaveProperty('status');
      expect(flag).toHaveProperty('scope');
    }
  });

  it('GET returns total and filtered counts', async () => {
    const { GET } = await importRoute();

    const request = new NextRequest(
      new URL('http://localhost/api/admin/feature-flags')
    );
    const res = await GET(request);
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(typeof body.total).toBe('number');
    expect(typeof body.filtered).toBe('number');
    expect(body.total).toBeGreaterThanOrEqual(4);
    expect(body.filtered).toBe(body.total);
  });

  it('GET applies search filter', async () => {
    const { GET } = await importRoute();

    const request = new NextRequest(
      new URL('http://localhost/api/admin/feature-flags?search=messaging')
    );
    const res = await GET(request);
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.filtered).toBeGreaterThanOrEqual(1);
    // Every returned flag should match the search term
    for (const flag of body.flags) {
      const matchesName = flag.name.toLowerCase().includes('messaging');
      const matchesKey = flag.key.toLowerCase().includes('messaging');
      const matchesDesc = flag.description?.toLowerCase().includes('messaging');
      expect(matchesName || matchesKey || matchesDesc).toBe(true);
    }
  });

  it('GET applies status filter', async () => {
    const { GET } = await importRoute();

    const request = new NextRequest(
      new URL('http://localhost/api/admin/feature-flags?status=active')
    );
    const res = await GET(request);
    expect(res.status).toBe(200);
    const body = await res.json();

    // "active" filter means enabled, beta, or canary
    for (const flag of body.flags) {
      expect(['enabled', 'beta', 'canary']).toContain(flag.status);
    }
    // Default flags have 3 active: enabled, beta, canary
    expect(body.filtered).toBeGreaterThanOrEqual(3);
  });

  // ==========================================
  // PUT Tests
  // ==========================================

  it('PUT updates flag status', async () => {
    const { PUT } = await importRoute();

    const request = new NextRequest(
      new URL('http://localhost/api/admin/feature-flags'),
      {
        method: 'PUT',
        body: JSON.stringify({ id: '1', status: 'disabled' }),
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const res = await PUT(request);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.flag).toBeDefined();
    expect(body.flag.status).toBe('disabled');
  });

  it('PUT returns 404 for nonexistent flag', async () => {
    const { PUT } = await importRoute();

    const request = new NextRequest(
      new URL('http://localhost/api/admin/feature-flags'),
      {
        method: 'PUT',
        body: JSON.stringify({ id: 'nonexistent', status: 'enabled' }),
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const res = await PUT(request);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Feature flag not found');
  });

  // ==========================================
  // POST Tests
  // ==========================================

  it('POST creates new flag', async () => {
    const { POST } = await importRoute();

    const request = new NextRequest(
      new URL('http://localhost/api/admin/feature-flags'),
      {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Flag', key: 'test_flag_new' }),
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const res = await POST(request);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.flag).toBeDefined();
    expect(body.flag.name).toBe('Test Flag');
    expect(body.flag.key).toBe('test_flag_new');
    expect(body.flag.id).toBeDefined();
  });

  it('POST returns 409 for duplicate key', async () => {
    const { POST } = await importRoute();

    // Use a key from the default flags (e.g., "feat_messaging_v1")
    const request = new NextRequest(
      new URL('http://localhost/api/admin/feature-flags'),
      {
        method: 'POST',
        body: JSON.stringify({
          name: 'Duplicate Flag',
          key: 'feat_messaging_v1',
        }),
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const res = await POST(request);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toBe('Feature flag with this key already exists');
  });
});
