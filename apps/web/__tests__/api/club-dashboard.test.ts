import { describe, it, expect, beforeEach } from 'vitest';
import {
  configureMockSupabase,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { mikeTorres } from '../fixtures/users';

import { GET } from '@/app/api/club/dashboard/route';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const mockTournaments = [
  {
    id: 't-1',
    name: 'Winter Classic 2026',
    start_date: '2026-02-15T09:00:00Z',
    end_date: '2026-02-16T18:00:00Z',
    location: 'Austin, TX',
    teams_registered: 12,
    teams_capacity: 16,
    total_collected: 4500,
    status: 'upcoming',
  },
  {
    id: 't-2',
    name: 'Fall Championship 2025',
    start_date: '2025-11-01T09:00:00Z',
    end_date: '2025-11-02T18:00:00Z',
    location: 'Dallas, TX',
    teams_registered: 24,
    teams_capacity: 24,
    total_collected: 9600,
    status: 'completed',
  },
];

const mockVerifications = [
  {
    id: 'v-1',
    athlete_id: 'athlete-001',
    type: 'identity',
    status: 'pending',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    profiles: { full_name: 'Jaylen Washington' },
  },
  {
    id: 'v-2',
    athlete_id: 'athlete-003',
    type: 'academic',
    status: 'pending',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    profiles: { full_name: 'DeShawn Harris' },
  },
];

const mockPayments = [
  {
    id: 'p-1',
    description: 'Team registration — Riverside Elite',
    amount: 375,
    status: 'completed',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    tournament_id: 't-1',
  },
  {
    id: 'p-2',
    description: 'Field rental deposit',
    amount: 1200,
    status: 'completed',
    created_at: new Date().toISOString(),
    tournament_id: 't-1',
  },
];

// ===========================================================================
// GET /api/club/dashboard
// ===========================================================================
describe('GET /api/club/dashboard', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('returns tournaments for club organizer', async () => {
    mockAuthenticated(mikeTorres);
    configureMockSupabase({
      tournaments: { data: mockTournaments, error: null },
      athlete_verifications: { data: mockVerifications, error: null },
      tournament_payments: { data: mockPayments, error: null },
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveProperty('tournaments');
    expect(json).toHaveProperty('verifications');
    expect(json).toHaveProperty('payments');
    expect(json).toHaveProperty('metrics');

    expect(json.tournaments).toHaveLength(2);
    expect(json.tournaments[0].name).toBe('Winter Classic 2026');
  });

  it('returns empty arrays when no data exists', async () => {
    mockAuthenticated(mikeTorres);
    configureMockSupabase({
      tournaments: { data: [], error: null },
      athlete_verifications: { data: [], error: null },
      tournament_payments: { data: [], error: null },
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.tournaments).toEqual([]);
    expect(json.verifications).toEqual([]);
    expect(json.payments).toEqual([]);
    expect(json.metrics.activeEvents).toBe(0);
    expect(json.metrics.totalRegistrations).toBe(0);
    expect(json.metrics.totalRevenue).toBe(0);
    expect(json.metrics.pendingVerifications).toBe(0);
  });

  it('metrics aggregate correctly from tournaments', async () => {
    mockAuthenticated(mikeTorres);
    configureMockSupabase({
      tournaments: { data: mockTournaments, error: null },
      athlete_verifications: { data: mockVerifications, error: null },
      tournament_payments: { data: mockPayments, error: null },
    });

    const response = await GET();
    const json = await response.json();

    // 1 upcoming + 1 completed → 1 active event
    expect(json.metrics.activeEvents).toBe(1);
    // 12 + 24 = 36
    expect(json.metrics.totalRegistrations).toBe(36);
    // 4500 + 9600 = 14100
    expect(json.metrics.totalRevenue).toBe(14100);
    // 2 pending verifications
    expect(json.metrics.pendingVerifications).toBe(2);
  });

  it('verifications include athlete names and relative time', async () => {
    mockAuthenticated(mikeTorres);
    configureMockSupabase({
      tournaments: { data: [], error: null },
      athlete_verifications: { data: mockVerifications, error: null },
      tournament_payments: { data: [], error: null },
    });

    const response = await GET();
    const json = await response.json();

    expect(json.verifications).toHaveLength(2);
    expect(json.verifications[0].athleteName).toBe('Jaylen Washington');
    expect(json.verifications[0].type).toBe('identity');
    expect(json.verifications[0].submittedAt).toMatch(/\d+ hours ago/);
    expect(json.verifications[1].athleteName).toBe('DeShawn Harris');
    expect(json.verifications[1].submittedAt).toMatch(/\d+ days ago/);
  });

  it('payments include formatted relative dates', async () => {
    mockAuthenticated(mikeTorres);
    configureMockSupabase({
      tournaments: { data: [], error: null },
      athlete_verifications: { data: [], error: null },
      tournament_payments: { data: mockPayments, error: null },
    });

    const response = await GET();
    const json = await response.json();

    expect(json.payments).toHaveLength(2);
    expect(json.payments[0].description).toBe('Team registration — Riverside Elite');
    expect(json.payments[0].amount).toBe(375);
    expect(json.payments[0].date).toMatch(/\d+ days ago/);
    expect(json.payments[1].date).toBe('Today');
  });
});
