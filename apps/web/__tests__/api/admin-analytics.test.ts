import { describe, it, expect, beforeEach } from 'vitest';
import {
  configureMockSupabase,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { adminUser } from '../fixtures/users';
import { GET } from '@/app/api/admin/analytics/route';

describe('API /api/admin/analytics', () => {
  beforeEach(() => {
    resetMocks();
  });

  // Shared mock setup for analytics — profiles data includes both role and
  // created_at so the route's roleData loop AND growthData loop both work.
  function setupAnalyticsMocks(overrides?: {
    profilesData?: unknown[];
    profilesCount?: number;
    athletesData?: unknown[];
    messagesCount?: number;
    viewsCount?: number;
  }) {
    const defaultProfiles = [
      { role: 'athlete', created_at: '2026-01-15T00:00:00Z' },
      { role: 'athlete', created_at: '2026-01-20T00:00:00Z' },
      { role: 'athlete', created_at: '2026-02-05T00:00:00Z' },
      { role: 'coach', created_at: '2026-02-10T00:00:00Z' },
      { role: 'recruiter', created_at: '2026-02-12T00:00:00Z' },
    ];

    const defaultAthletes = [
      {
        height_inches: 74,
        weight_lbs: 195,
        forty_yard_time: 4.55,
        gpa: 3.8,
        profile: { avatar_url: 'https://example.com/a.jpg', full_name: 'Full Profile' },
      },
      {
        height_inches: null,
        weight_lbs: null,
        forty_yard_time: null,
        gpa: null,
        profile: { avatar_url: null, full_name: 'Empty Profile' },
      },
    ];

    configureMockSupabase({
      profiles: {
        data: overrides?.profilesData ?? defaultProfiles,
        error: null,
        count: overrides?.profilesCount ?? (overrides?.profilesData?.length ?? defaultProfiles.length),
      },
      athletes: {
        data: overrides?.athletesData ?? defaultAthletes,
        error: null,
      },
      messages: {
        data: null,
        error: null,
        count: overrides?.messagesCount ?? 3,
      },
      profile_views: {
        data: null,
        error: null,
        count: overrides?.viewsCount ?? 10,
      },
    });
  }

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const res = await GET();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns analytics data with correct kpiData structure', async () => {
    mockAuthenticated(adminUser);
    setupAnalyticsMocks();

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.kpiData).toHaveLength(4);
    expect(body.kpiData[0].label).toBe('DAU');
    expect(body.kpiData[1].label).toBe('WAU');
    expect(body.kpiData[2].label).toBe('MAU');
    expect(body.kpiData[3].label).toBe('Daily Signups');

    // Each KPI has required fields
    for (const kpi of body.kpiData) {
      expect(kpi).toHaveProperty('id');
      expect(kpi).toHaveProperty('label');
      expect(kpi).toHaveProperty('value');
      expect(kpi).toHaveProperty('change');
      expect(kpi).toHaveProperty('isPositive');
      expect(typeof kpi.value).toBe('string');
      expect(typeof kpi.change).toBe('number');
    }
  });

  it('returns roleDistribution with 4 entries', async () => {
    mockAuthenticated(adminUser);
    setupAnalyticsMocks({
      profilesData: [
        { role: 'athlete', created_at: '2026-01-15T00:00:00Z' },
        { role: 'athlete', created_at: '2026-01-20T00:00:00Z' },
        { role: 'coach', created_at: '2026-02-01T00:00:00Z' },
        { role: 'recruiter', created_at: '2026-02-05T00:00:00Z' },
        { role: 'parent', created_at: '2026-02-10T00:00:00Z' },
      ],
      profilesCount: 5,
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.roleDistribution).toHaveLength(4);
    const roles = body.roleDistribution.map((r: { role: string }) => r.role);
    expect(roles).toEqual(['Athletes', 'Coaches', 'Recruiters', 'Others']);

    for (const entry of body.roleDistribution) {
      expect(entry).toHaveProperty('percentage');
      expect(entry).toHaveProperty('color');
      expect(typeof entry.percentage).toBe('number');
    }
  });

  it('returns profileCompleteness with 4 ranges', async () => {
    mockAuthenticated(adminUser);
    setupAnalyticsMocks({
      athletesData: [
        {
          height_inches: 74,
          weight_lbs: 195,
          forty_yard_time: 4.55,
          gpa: 3.8,
          profile: { avatar_url: 'https://example.com/a.jpg', full_name: 'Full' },
        },
        {
          height_inches: null,
          weight_lbs: null,
          forty_yard_time: null,
          gpa: null,
          profile: { avatar_url: null, full_name: 'Empty' },
        },
      ],
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.profileCompleteness).toHaveLength(4);
    const ranges = body.profileCompleteness.map((r: { range: string }) => r.range);
    expect(ranges).toEqual(['75% - 100%', '50% - 75%', '25% - 50%', '0% - 25%']);

    for (const entry of body.profileCompleteness) {
      expect(typeof entry.percentage).toBe('number');
    }
  });

  it('returns totalUsers matching configured count', async () => {
    mockAuthenticated(adminUser);
    setupAnalyticsMocks({ profilesCount: 42 });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.totalUsers).toBe(42);
  });

  it('returns monthlyGrowth data grouped by month', async () => {
    mockAuthenticated(adminUser);
    setupAnalyticsMocks();

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.monthlyGrowth).toBeDefined();
    expect(typeof body.monthlyGrowth).toBe('object');
  });
});
