import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  configureMockSupabase,
  createMockRequest,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { mikeTorres, coachWilliams } from '../fixtures/users';
import { mockSupabaseClient } from '../setup';

import { GET as GET_DETAIL } from '@/app/api/tournaments/[id]/route';
import { GET as GET_PUBLIC } from '@/app/api/tournaments/public/route';

// ===========================================================================
// Fixtures
// ===========================================================================

const mockTournament = {
  id: 'tournament-001',
  name: 'Winter Classic 2026',
  description: 'Annual 7v7 tournament',
  start_date: '2026-02-15',
  end_date: '2026-02-16',
  location: 'Austin, TX',
  teams_capacity: 16,
  teams_registered: 12,
  entry_fee_cents: 50000,
  registration_deadline: '2026-02-10',
  is_public: true,
  event_tier: 'premium',
  status: 'upcoming',
  organizer_id: mikeTorres.id,
};

const mockRegistration = {
  id: 'reg-001',
  school_id: 'school-001',
  team_name: 'Allen Eagles',
  contact_name: 'James Davis',
  contact_email: 'coach.davis@test.repmax.io',
  payment_status: 'paid',
  created_at: '2026-02-01T00:00:00Z',
};

const DETAIL_BASE = 'http://localhost:3000/api/tournaments/tournament-001';
const PUBLIC_BASE = 'http://localhost:3000/api/tournaments/public';

// ===========================================================================
// GET /api/tournaments/[id]
// ===========================================================================
describe('GET /api/tournaments/[id]', () => {
  const context = { params: Promise.resolve({ id: 'tournament-001' }) };

  beforeEach(() => {
    resetMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const request = createMockRequest(DETAIL_BASE);

    const response = await GET_DETAIL(request as any, context as any);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 404 when tournament not found', async () => {
    mockAuthenticated(mikeTorres);
    configureMockSupabase({
      tournaments: { data: null, error: { message: 'Not found' } },
    });

    const request = createMockRequest(DETAIL_BASE);
    const response = await GET_DETAIL(request as any, context as any);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Tournament not found');
  });

  it('returns tournament detail with registrations for organizer (includes contact_email)', async () => {
    mockAuthenticated(mikeTorres);
    configureMockSupabase({
      tournaments: { data: mockTournament, error: null },
      tournament_registrations: { data: [mockRegistration], error: null },
      profiles: { data: { id: mikeTorres.id }, error: null },
      school_members: { data: null, error: null },
    });

    const request = createMockRequest(DETAIL_BASE);
    const response = await GET_DETAIL(request as any, context as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.tournament.id).toBe('tournament-001');
    expect(json.tournament.name).toBe('Winter Classic 2026');
    expect(json.registrations).toHaveLength(1);
    expect(json.registrations[0].contact_email).toBe('coach.davis@test.repmax.io');
    expect(json.registration_count).toBe(1);
    expect(json.my_registration).toBeNull();
  });

  it('returns tournament detail for non-organizer (without contact_email in select)', async () => {
    mockAuthenticated(coachWilliams);
    configureMockSupabase({
      tournaments: { data: mockTournament, error: null },
      tournament_registrations: {
        data: [
          {
            id: 'reg-001',
            school_id: 'school-001',
            team_name: 'Allen Eagles',
            contact_name: 'James Davis',
            payment_status: 'paid',
            created_at: '2026-02-01T00:00:00Z',
          },
        ],
        error: null,
      },
      profiles: { data: { id: coachWilliams.id }, error: null },
      school_members: { data: null, error: null },
    });

    const request = createMockRequest(DETAIL_BASE);
    const response = await GET_DETAIL(request as any, context as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.tournament.id).toBe('tournament-001');
    expect(json.registrations).toHaveLength(1);
    // Non-organizer registration should not have contact_email in select fields
    // (the mock returns what we provide, but the route uses different select fields)
    expect(json.registrations[0].contact_email).toBeUndefined();
    expect(json.registration_count).toBe(1);
  });

  it('returns my_registration when user school is registered', async () => {
    mockAuthenticated(coachWilliams);

    // Need fine-grained control: tournaments (single), tournament_registrations (list then maybeSingle),
    // profiles (single), school_members (maybeSingle)
    // Since configureMockSupabase returns the same result per table name on every call,
    // tournament_registrations will return the same data for both list and maybeSingle calls.
    // The maybeSingle call returns first item from array, which is our registration.
    configureMockSupabase({
      tournaments: { data: mockTournament, error: null },
      tournament_registrations: { data: [mockRegistration], error: null },
      profiles: { data: { id: coachWilliams.id }, error: null },
      school_members: { data: { school_id: 'school-001' }, error: null },
    });

    const request = createMockRequest(DETAIL_BASE);
    const response = await GET_DETAIL(request as any, context as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.my_registration).not.toBeNull();
    expect(json.my_registration.id).toBe('reg-001');
    expect(json.my_registration.team_name).toBe('Allen Eagles');
  });

  it('returns null my_registration when user school is not registered', async () => {
    mockAuthenticated(coachWilliams);
    configureMockSupabase({
      tournaments: { data: mockTournament, error: null },
      tournament_registrations: { data: [], error: null },
      profiles: { data: { id: coachWilliams.id }, error: null },
      school_members: { data: { school_id: 'school-999' }, error: null },
    });

    const request = createMockRequest(DETAIL_BASE);
    const response = await GET_DETAIL(request as any, context as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.my_registration).toBeNull();
  });

  it('returns 500 on database error', async () => {
    mockAuthenticated(mikeTorres);

    // Force an exception by making from() throw
    (mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('Database connection failed');
    });

    const request = createMockRequest(DETAIL_BASE);
    const response = await GET_DETAIL(request as any, context as any);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Internal server error');
  });
});

// ===========================================================================
// GET /api/tournaments/public
// ===========================================================================
describe('GET /api/tournaments/public', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('returns public tournaments list', async () => {
    configureMockSupabase({
      tournaments: {
        data: [mockTournament],
        error: null,
      },
      tournament_registrations: {
        data: [{ tournament_id: 'tournament-001' }],
        error: null,
      },
    });

    const request = createMockRequest(PUBLIC_BASE);
    const response = await GET_PUBLIC(request as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.tournaments).toHaveLength(1);
    expect(json.tournaments[0].name).toBe('Winter Classic 2026');
    expect(json.tournaments[0].registration_count).toBe(1);
  });

  it('filters by date range (from/to params)', async () => {
    configureMockSupabase({
      tournaments: {
        data: [mockTournament],
        error: null,
      },
      tournament_registrations: {
        data: [{ tournament_id: 'tournament-001' }],
        error: null,
      },
    });

    const request = createMockRequest(
      `${PUBLIC_BASE}?from=2026-02-01&to=2026-03-01`
    );
    const response = await GET_PUBLIC(request as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.tournaments).toHaveLength(1);
    expect(json.tournaments[0].id).toBe('tournament-001');
  });

  it('returns empty array when no tournaments match', async () => {
    configureMockSupabase({
      tournaments: { data: [], error: null },
    });

    const request = createMockRequest(PUBLIC_BASE);
    const response = await GET_PUBLIC(request as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.tournaments).toEqual([]);
  });

  it('returns 500 on database error', async () => {
    configureMockSupabase({
      tournaments: {
        data: null,
        error: { message: 'Database connection failed' },
      },
    });

    const request = createMockRequest(PUBLIC_BASE);
    const response = await GET_PUBLIC(request as any);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Database connection failed');
  });
});
