import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { configureMockSupabase, createMockRequest, mockAuthenticated, mockUnauthenticated, resetMocks } from '../helpers/route-test-utils';
import { coachDavis } from '../fixtures/users';

// Mock cache module — always cache miss to test route logic directly
vi.mock('@/lib/utils/mcp-cache', () => ({
  getCached: vi.fn(() => null),
  setCache: vi.fn(),
}));

import { GET as getZones } from '@/app/api/mcp/zones/route';
import { GET as getZoneDetail } from '@/app/api/mcp/zones/[zone]/route';
import { GET as getProspects } from '@/app/api/mcp/prospects/route';
import { GET as getPrograms } from '@/app/api/mcp/programs/route';
import { GET as getCalendar } from '@/app/api/mcp/calendar/route';
import { getCached, setCache } from '@/lib/utils/mcp-cache';

/** Helper: create a request with nextUrl.searchParams (for routes that use NextRequest) */
function createNextRequest(url: string): any {
  const req = new Request(url);
  const parsedUrl = new URL(url);
  (req as any).nextUrl = parsedUrl;
  return req;
}

// ---------------------------------------------------------------------------
// GET /api/mcp/zones
// ---------------------------------------------------------------------------
describe('GET /api/mcp/zones', () => {
  beforeEach(() => {
    resetMocks();
    vi.mocked(getCached).mockReturnValue(null);
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const response = await getZones();
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns all 6 zones with correct structure', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      athletes: {
        data: [
          { zone: 'Southwest', star_rating: 5 },
          { zone: 'Southeast', star_rating: 4 },
        ],
        error: null,
      },
    });

    const response = await getZones();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.zones).toHaveLength(6);

    const zoneCodes = body.zones.map((z: any) => z.zone_code);
    expect(zoneCodes).toEqual(['MIDWEST', 'NORTHEAST', 'PLAINS', 'SOUTHEAST', 'SOUTHWEST', 'WEST']);

    // Verify zone shape
    for (const z of body.zones) {
      expect(z).toHaveProperty('zone_code');
      expect(z).toHaveProperty('zone_name');
      expect(z).toHaveProperty('states');
      expect(z).toHaveProperty('metro_areas');
      expect(z).toHaveProperty('total_recruits');
      expect(z).toHaveProperty('blue_chip_count');
    }
  });

  it('aggregates athlete counts by zone using DB_ZONE_TO_UI mapping', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      athletes: {
        data: [
          { zone: 'Southwest', star_rating: 5 },
          { zone: 'Southwest', star_rating: 3 },
          { zone: 'Southeast', star_rating: 4 },
          { zone: 'West', star_rating: 2 },
          { zone: 'Midwest', star_rating: 4 },
          { zone: 'Northeast', star_rating: 3 },
          { zone: 'Mid-Atlantic', star_rating: 5 }, // maps to NORTHEAST
        ],
        error: null,
      },
    });

    const response = await getZones();
    const body = await response.json();

    const zoneMap = Object.fromEntries(body.zones.map((z: any) => [z.zone_code, z]));

    expect(zoneMap.SOUTHWEST.total_recruits).toBe(2);
    expect(zoneMap.SOUTHWEST.blue_chip_count).toBe(1); // only star_rating >= 4

    expect(zoneMap.SOUTHEAST.total_recruits).toBe(1);
    expect(zoneMap.SOUTHEAST.blue_chip_count).toBe(1);

    expect(zoneMap.WEST.total_recruits).toBe(1);
    expect(zoneMap.WEST.blue_chip_count).toBe(0);

    expect(zoneMap.MIDWEST.total_recruits).toBe(1);
    expect(zoneMap.MIDWEST.blue_chip_count).toBe(1);

    // Mid-Atlantic merges into NORTHEAST
    expect(zoneMap.NORTHEAST.total_recruits).toBe(2);
    expect(zoneMap.NORTHEAST.blue_chip_count).toBe(1);

    // PLAINS has no DB equivalent
    expect(zoneMap.PLAINS.total_recruits).toBe(0);
    expect(zoneMap.PLAINS.blue_chip_count).toBe(0);

    // Total
    expect(body.total).toBe(7);
  });

  it('returns 500 on database error', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      athletes: {
        data: null,
        error: { message: 'connection refused', code: 'PGRST500' },
      },
    });

    const response = await getZones();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBeDefined();
  });

  it('returns all zones with 0 counts when athletes table is empty', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      athletes: { data: [], error: null },
    });

    const response = await getZones();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.zones).toHaveLength(6);
    for (const z of body.zones) {
      expect(z.total_recruits).toBe(0);
      expect(z.blue_chip_count).toBe(0);
    }
    expect(body.total).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// GET /api/mcp/zones/[zone]
// ---------------------------------------------------------------------------
describe('GET /api/mcp/zones/[zone]', () => {
  beforeEach(() => {
    resetMocks();
    vi.mocked(getCached).mockReturnValue(null);
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const request = createMockRequest('http://localhost:3000/api/mcp/zones/SOUTHWEST');
    const response = await getZoneDetail(request, {
      params: Promise.resolve({ zone: 'SOUTHWEST' }),
    });
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns zone info, programs, and prospects for a valid zone', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      athletes: {
        data: [
          {
            id: 'a1',
            primary_position: 'QB',
            high_school: 'North Shore HS',
            class_year: 2026,
            star_rating: 5,
            zone: 'Southwest',
            state: 'TX',
            city: 'Houston',
            profile_id: 'p1',
            profiles: [{ full_name: 'Marcus Johnson', avatar_url: null }],
          },
          {
            id: 'a2',
            primary_position: 'WR',
            high_school: 'DeSoto HS',
            class_year: 2027,
            star_rating: 3,
            zone: 'Southwest',
            state: 'TX',
            city: 'DeSoto',
            profile_id: 'p2',
            profiles: [{ full_name: 'DeAndre Williams', avatar_url: 'https://example.com/pic.jpg' }],
          },
        ],
        error: null,
      },
    });

    const request = createMockRequest('http://localhost:3000/api/mcp/zones/SOUTHWEST');
    const response = await getZoneDetail(request, {
      params: Promise.resolve({ zone: 'SOUTHWEST' }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);

    // Zone info
    expect(body.zone.zone_code).toBe('SOUTHWEST');
    expect(body.zone.zone_name).toBe('Southwest');
    expect(body.zone.total_recruits).toBe(2);
    expect(body.zone.blue_chip_count).toBe(1); // only a1 with star_rating 5

    // Programs (static data)
    expect(body.programs.length).toBeGreaterThan(0);
    expect(body.programs[0].zone_code).toBe('SOUTHWEST');

    // Prospects
    expect(body.prospects).toHaveLength(2);
    expect(body.prospects[0].full_name).toBe('Marcus Johnson');
    expect(body.prospects[1].full_name).toBe('DeAndre Williams');
  });

  it('returns 400 for an invalid zone', async () => {
    mockAuthenticated(coachDavis);
    const request = createMockRequest('http://localhost:3000/api/mcp/zones/INVALID');
    const response = await getZoneDetail(request, {
      params: Promise.resolve({ zone: 'INVALID' }),
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Invalid zone');
  });

  it('returns empty prospects for PLAINS zone (no DB equivalent)', async () => {
    mockAuthenticated(coachDavis);
    // PLAINS has no DB zones mapped, so route returns static metadata only
    const request = createMockRequest('http://localhost:3000/api/mcp/zones/PLAINS');
    const response = await getZoneDetail(request, {
      params: Promise.resolve({ zone: 'PLAINS' }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.zone.zone_code).toBe('PLAINS');
    expect(body.zone.total_recruits).toBe(0);
    expect(body.zone.blue_chip_count).toBe(0);
    expect(body.prospects).toEqual([]);
    expect(body.programs.length).toBeGreaterThanOrEqual(0);
  });

  it('returns 500 on database error', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      athletes: {
        data: null,
        error: { message: 'relation does not exist', code: '42P01' },
      },
    });

    const request = createMockRequest('http://localhost:3000/api/mcp/zones/SOUTHWEST');
    const response = await getZoneDetail(request, {
      params: Promise.resolve({ zone: 'SOUTHWEST' }),
    });
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// GET /api/mcp/prospects
// ---------------------------------------------------------------------------
describe('GET /api/mcp/prospects', () => {
  const mockAthletes = [
    {
      id: 'a1',
      primary_position: 'QB',
      high_school: 'North Shore HS',
      class_year: 2026,
      star_rating: 5,
      zone: 'Southwest',
      state: 'TX',
      city: 'Houston',
      profile_id: 'p1',
      profiles: [{ full_name: 'Marcus Johnson', avatar_url: null }],
    },
    {
      id: 'a2',
      primary_position: 'WR',
      high_school: 'Mater Dei HS',
      class_year: 2027,
      star_rating: 4,
      zone: 'West',
      state: 'CA',
      city: 'Santa Ana',
      profile_id: 'p2',
      profiles: [{ full_name: 'Jaylen Carter', avatar_url: null }],
    },
    {
      id: 'a3',
      primary_position: 'RB',
      high_school: 'IMG Academy',
      class_year: 2026,
      star_rating: 3,
      zone: 'Southeast',
      state: 'FL',
      city: 'Bradenton',
      profile_id: 'p3',
      profiles: [{ full_name: 'Devon Smith', avatar_url: null }],
    },
  ];

  beforeEach(() => {
    resetMocks();
    vi.mocked(getCached).mockReturnValue(null);
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const request = createNextRequest('http://localhost:3000/api/mcp/prospects');
    const response = await getProspects(request);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns all prospects when no filters applied', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      athletes: { data: mockAthletes, count: 3, error: null },
    });

    const request = createNextRequest('http://localhost:3000/api/mcp/prospects');
    const response = await getProspects(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.prospects).toHaveLength(3);
    expect(body.total).toBe(3);
    // Each prospect has required fields
    for (const p of body.prospects) {
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('full_name');
      expect(p).toHaveProperty('position');
      expect(p).toHaveProperty('star_rating');
      expect(p).toHaveProperty('zone_code');
    }
  });

  it('filters prospects by position (ilike)', async () => {
    mockAuthenticated(coachDavis);
    const qbs = mockAthletes.filter((a) => a.primary_position === 'QB');
    configureMockSupabase({
      athletes: { data: qbs, count: 1, error: null },
    });

    const request = createNextRequest('http://localhost:3000/api/mcp/prospects?position=QB');
    const response = await getProspects(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.prospects).toHaveLength(1);
    expect(body.prospects[0].position).toBe('QB');
  });

  it('filters prospects by minStars', async () => {
    mockAuthenticated(coachDavis);
    const stars4plus = mockAthletes.filter((a) => a.star_rating >= 4);
    configureMockSupabase({
      athletes: { data: stars4plus, count: 2, error: null },
    });

    const request = createNextRequest('http://localhost:3000/api/mcp/prospects?minStars=4');
    const response = await getProspects(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.prospects.length).toBe(2);
    for (const p of body.prospects) {
      expect(p.star_rating).toBeGreaterThanOrEqual(4);
    }
  });

  it('filters prospects by zone', async () => {
    mockAuthenticated(coachDavis);
    const southwest = mockAthletes.filter((a) => a.zone === 'Southwest');
    configureMockSupabase({
      athletes: { data: southwest, count: 1, error: null },
    });

    const request = createNextRequest('http://localhost:3000/api/mcp/prospects?zone=SOUTHWEST');
    const response = await getProspects(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.prospects).toHaveLength(1);
    expect(body.prospects[0].zone_code).toBe('SOUTHWEST');
  });

  it('returns 500 on database error', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      athletes: { data: null, error: { message: 'timeout', code: 'PGRST500' } },
    });

    const request = createNextRequest('http://localhost:3000/api/mcp/prospects');
    const response = await getProspects(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// GET /api/mcp/programs (static data, no DB)
// ---------------------------------------------------------------------------
describe('GET /api/mcp/programs', () => {
  beforeEach(() => {
    resetMocks();
    vi.mocked(getCached).mockReturnValue(null);
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const request = createNextRequest('http://localhost:3000/api/mcp/programs');
    const response = await getPrograms(request);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns all programs sorted by rating descending', async () => {
    mockAuthenticated(coachDavis);
    const request = createNextRequest('http://localhost:3000/api/mcp/programs');
    const response = await getPrograms(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.programs.length).toBeGreaterThan(0);
    expect(body.total).toBeGreaterThan(0);

    // Verify descending rating order
    for (let i = 1; i < body.programs.length; i++) {
      expect(body.programs[i - 1].current_rating).toBeGreaterThanOrEqual(
        body.programs[i].current_rating,
      );
    }
  });

  it('filters programs by state (case insensitive)', async () => {
    mockAuthenticated(coachDavis);
    const request = createNextRequest('http://localhost:3000/api/mcp/programs?state=tx');
    const response = await getPrograms(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.programs.length).toBeGreaterThan(0);
    for (const p of body.programs) {
      expect(p.state.toUpperCase()).toBe('TX');
    }

    // Check that North Shore is in the TX results
    const northShore = body.programs.find((p: any) => p.team_name === 'North Shore');
    expect(northShore).toBeDefined();
  });

  it('filters programs by zone', async () => {
    mockAuthenticated(coachDavis);
    const request = createNextRequest('http://localhost:3000/api/mcp/programs?zone=WEST');
    const response = await getPrograms(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.programs.length).toBeGreaterThan(0);
    for (const p of body.programs) {
      expect(p.zone_code).toBe('WEST');
    }
  });
});

// ---------------------------------------------------------------------------
// GET /api/mcp/calendar (no DB, date-computed)
// ---------------------------------------------------------------------------
describe('GET /api/mcp/calendar', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    resetMocks();
    vi.mocked(getCached).mockReturnValue(null);
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const response = await getCalendar();
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns calendar context with valid structure and non-negative daysUntilSigning', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-01T12:00:00Z'));
    mockAuthenticated(coachDavis);

    const response = await getCalendar();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.calendar).toBeDefined();
    expect(body.calendar.currentPeriod).toBeDefined();
    expect(typeof body.calendar.portalWindowOpen).toBe('boolean');
    expect(body.calendar.nextSigningDate).toBeDefined();
    expect(body.calendar.daysUntilSigning).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(body.calendar.keyDates)).toBe(true);

    // keyDates should only contain future dates
    for (const kd of body.calendar.keyDates) {
      expect(kd.date >= '2026-10-01').toBe(true);
    }
  });

  it('returns "Early Signing Period" for Dec 19', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-12-19T12:00:00Z'));
    mockAuthenticated(coachDavis);

    const response = await getCalendar();
    const body = await response.json();

    expect(body.calendar.currentPeriod).toBe('Early Signing Period');
  });

  it('returns "Fall Contact Period" for Oct 1', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-01T12:00:00Z'));
    mockAuthenticated(coachDavis);

    const response = await getCalendar();
    const body = await response.json();

    expect(body.calendar.currentPeriod).toBe('Fall Contact Period');
  });
});
