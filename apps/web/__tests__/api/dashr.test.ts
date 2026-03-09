import { describe, it, expect, beforeEach } from 'vitest';
import {
  configureMockSupabase,
  createMockRequest,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { jaylenWashington, coachWilliams } from '../fixtures/users';

import { GET as listEvents } from '@/app/api/dashr/route';
import { GET as getEventDetail } from '@/app/api/dashr/[id]/route';
import { GET as listBookings } from '@/app/api/dashr/bookings/route';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const mockDashrEvent = {
  id: 'event-001',
  title: 'Spring Speed Camp',
  event_type: 'camp',
  start_date: '2026-03-15',
  price_cents: 5000,
  capacity: 50,
  is_published: true,
  product_slug: 'dashr-standard',
  created_by: 'other-profile',
};

const mockBooking = {
  id: 'booking-001',
  event_id: 'event-001',
  profile_id: 'profile-1',
  quantity: 1,
  status: 'confirmed',
  amount_cents: 5000,
  stripe_session_id: 'cs_test_123',
  created_at: '2026-03-01T00:00:00Z',
  dashr_events: { title: 'Spring Speed Camp', start_date: '2026-03-15' },
};

const mockProfile = {
  id: 'profile-1',
};

const BASE = 'http://localhost:3000/api/dashr';

// ===========================================================================
// GET /api/dashr (list events)
// ===========================================================================
describe('GET /api/dashr', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const request = createMockRequest(BASE);
    const response = await listEvents(request as any);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('returns events list with booking counts', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      dashr_events: { data: [mockDashrEvent], error: null },
      dashr_bookings: {
        data: [{ event_id: 'event-001' }, { event_id: 'event-001' }],
        error: null,
      },
    });

    const request = createMockRequest(BASE);
    const response = await listEvents(request as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.events).toHaveLength(1);
    expect(json.events[0].title).toBe('Spring Speed Camp');
    expect(json.events[0].booking_count).toBe(2);
  });

  it('filters by type parameter', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      dashr_events: { data: [mockDashrEvent], error: null },
      dashr_bookings: { data: [], error: null },
    });

    const request = createMockRequest(`${BASE}?type=camp`);
    const response = await listEvents(request as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.events).toHaveLength(1);
  });

  it('returns 500 on database error', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      dashr_events: {
        data: null,
        error: { message: 'Database connection failed' },
      },
    });

    const request = createMockRequest(BASE);
    const response = await listEvents(request as any);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Database connection failed');
  });
});

// ===========================================================================
// GET /api/dashr/[id] (event detail)
// ===========================================================================
describe('GET /api/dashr/[id]', () => {
  beforeEach(() => {
    resetMocks();
  });

  const context = { params: Promise.resolve({ id: 'event-001' }) };

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const request = createMockRequest(`${BASE}/event-001`);
    const response = await getEventDetail(request as any, context as any);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('returns event detail with booking count and user booking', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      dashr_events: { data: [mockDashrEvent], error: null },
      profiles: { data: mockProfile, error: null },
      dashr_bookings: { data: null, error: null, count: 5 },
    });

    const request = createMockRequest(`${BASE}/event-001`);
    const response = await getEventDetail(request as any, context as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.event).toBeDefined();
    expect(json.event.title).toBe('Spring Speed Camp');
  });

  it('returns 404 when event not found', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      dashr_events: {
        data: null,
        error: { message: 'Not found', code: 'PGRST116' },
      },
    });

    const request = createMockRequest(`${BASE}/nonexistent`);
    const notFoundContext = {
      params: Promise.resolve({ id: 'nonexistent' }),
    };
    const response = await getEventDetail(
      request as any,
      notFoundContext as any
    );
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Event not found');
  });

  it('returns 404 when unpublished event accessed by non-creator', async () => {
    const unpublishedEvent = {
      ...mockDashrEvent,
      is_published: false,
      created_by: 'someone-else',
    };
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      dashr_events: { data: [unpublishedEvent], error: null },
      profiles: { data: { id: 'not-the-creator' }, error: null },
    });

    const request = createMockRequest(`${BASE}/event-001`);
    const response = await getEventDetail(request as any, context as any);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Event not found');
  });
});

// ===========================================================================
// GET /api/dashr/bookings (user's bookings)
// ===========================================================================
describe('GET /api/dashr/bookings', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const response = await listBookings();
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it("returns user's bookings with event data", async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      dashr_bookings: { data: [mockBooking], error: null },
    });

    const response = await listBookings();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.bookings).toHaveLength(1);
    expect(json.bookings[0].event_title).toBe('Spring Speed Camp');
    expect(json.bookings[0].event_date).toBe('2026-03-15');
    expect(json.bookings[0].status).toBe('confirmed');
  });

  it('returns 404 when profile not found', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: null, error: null },
    });

    const response = await listBookings();
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Profile not found');
  });
});
