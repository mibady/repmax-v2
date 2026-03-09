import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import {
  configureMockSupabase,
  createMockRequest,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { mockSupabaseClient } from '../setup';
import { jaylenWashington, coachWilliams } from '../fixtures/users';

// ---------------------------------------------------------------------------
// Stripe hoisted mocks
// ---------------------------------------------------------------------------
const { mockCheckoutSessionsCreate, mockCustomersCreate } = vi.hoisted(() => ({
  mockCheckoutSessionsCreate: vi.fn(),
  mockCustomersCreate: vi.fn(),
}));

vi.mock('stripe', () => ({
  default: vi.fn(() => ({
    checkout: { sessions: { create: mockCheckoutSessionsCreate } },
    customers: { create: mockCustomersCreate },
  })),
}));

vi.mock('@/lib/stripe', () => ({
  getStripe: vi.fn(() => ({
    checkout: { sessions: { create: mockCheckoutSessionsCreate } },
    customers: { create: mockCustomersCreate },
  })),
}));

import { POST } from '@/app/api/dashr/[id]/book/route';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const mockProfile = {
  id: 'profile-1',
  stripe_customer_id: 'cus_123',
};

const mockProfileNoStripe = {
  id: 'profile-1',
  stripe_customer_id: null,
};

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

const mockCreatedBooking = {
  id: 'booking-new-001',
  event_id: 'event-001',
  profile_id: 'profile-1',
  quantity: 1,
  status: 'pending',
  amount_cents: 5000,
};

const BASE = 'http://localhost:3000/api/dashr/event-001/book';

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
beforeAll(() => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
  process.env.STRIPE_DASHR_STANDARD_PRICE_ID = 'price_test_dashr';
});

// ===========================================================================
// POST /api/dashr/[id]/book
// ===========================================================================
describe('POST /api/dashr/[id]/book', () => {
  beforeEach(() => {
    resetMocks();
    mockCheckoutSessionsCreate.mockReset();
    mockCustomersCreate.mockReset();
  });

  const context = { params: Promise.resolve({ id: 'event-001' }) };

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const request = createMockRequest(BASE, {
      method: 'POST',
      body: { quantity: 1 },
    });
    const response = await POST(request as any, context as any);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 404 when profile not found', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: null, error: null },
    });

    const request = createMockRequest(BASE, {
      method: 'POST',
      body: { quantity: 1 },
    });
    const response = await POST(request as any, context as any);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Profile not found');
  });

  it('returns 400 on invalid body (quantity > 10)', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
    });

    const request = createMockRequest(BASE, {
      method: 'POST',
      body: { quantity: 15 },
    });
    const response = await POST(request as any, context as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid request body');
    expect(json.details).toBeDefined();
  });

  it('returns 404 when event not found', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      dashr_events: {
        data: null,
        error: { message: 'Not found', code: 'PGRST116' },
      },
    });

    const request = createMockRequest(BASE, {
      method: 'POST',
      body: { quantity: 1 },
    });
    const response = await POST(request as any, context as any);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Event not found');
  });

  it('returns 400 when capacity exceeded', async () => {
    mockAuthenticated(jaylenWashington);
    const fullEvent = { ...mockDashrEvent, capacity: 2 };
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      dashr_events: { data: [fullEvent], error: null },
      dashr_bookings: { data: null, error: null, count: 2 },
    });

    const request = createMockRequest(BASE, {
      method: 'POST',
      body: { quantity: 1 },
    });
    const response = await POST(request as any, context as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('spots remaining');
  });

  it('returns 409 when already booked', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      dashr_events: { data: [mockDashrEvent], error: null },
      dashr_bookings: {
        data: [{ id: 'existing-booking' }],
        error: null,
        count: 5,
      },
    });

    const request = createMockRequest(BASE, {
      method: 'POST',
      body: { quantity: 1 },
    });
    const response = await POST(request as any, context as any);
    const json = await response.json();

    expect(response.status).toBe(409);
    expect(json.error).toContain('already have a confirmed booking');
  });

  it('creates booking and returns checkout URL on success', async () => {
    mockAuthenticated(jaylenWashington);
    mockCheckoutSessionsCreate.mockResolvedValue({
      url: 'https://checkout.stripe.com/dashr_session',
      id: 'cs_test_dashr_001',
    });

    // Manual mock: dashr_bookings is called multiple times with different needs:
    //   1. capacity check (select count) -> count: 5
    //   2. confirmed booking check (maybeSingle) -> null (no existing)
    //   3. delete pending -> void
    //   4. insert new booking (single) -> mockCreatedBooking
    //   5. update stripe_session_id -> void
    let bookingsCallCount = 0;
    (mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockImplementation(
      (table: string) => {
        const chainMethods = [
          'select', 'insert', 'update', 'delete', 'upsert',
          'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike',
          'is', 'in', 'contains', 'order', 'limit', 'range',
          'not', 'filter', 'match', 'textSearch', 'or', 'and',
        ];
        const chain: Record<string, unknown> = {};
        for (const method of chainMethods) {
          chain[method] = vi.fn(() => chain);
        }

        if (table === 'profiles') {
          chain.single = vi.fn(() => Promise.resolve({ data: mockProfile, error: null }));
          chain.maybeSingle = vi.fn(() => Promise.resolve({ data: mockProfile, error: null }));
          chain.then = vi.fn((resolve: (v: unknown) => void) =>
            resolve({ data: mockProfile, error: null, count: 0 })
          );
          return chain;
        }

        if (table === 'dashr_events') {
          chain.single = vi.fn(() => Promise.resolve({ data: mockDashrEvent, error: null }));
          chain.maybeSingle = vi.fn(() => Promise.resolve({ data: mockDashrEvent, error: null }));
          chain.then = vi.fn((resolve: (v: unknown) => void) =>
            resolve({ data: [mockDashrEvent], error: null, count: 1 })
          );
          return chain;
        }

        if (table === 'dashr_bookings') {
          bookingsCallCount++;
          const callNum = bookingsCallCount;

          if (callNum === 1) {
            // Capacity check: select with count
            chain.single = vi.fn(() => Promise.resolve({ data: null, error: null }));
            chain.maybeSingle = vi.fn(() => Promise.resolve({ data: null, error: null }));
            chain.then = vi.fn((resolve: (v: unknown) => void) =>
              resolve({ data: null, error: null, count: 5 })
            );
          } else if (callNum === 2) {
            // Confirmed booking check: maybeSingle -> null (no existing)
            chain.single = vi.fn(() => Promise.resolve({ data: null, error: null }));
            chain.maybeSingle = vi.fn(() => Promise.resolve({ data: null, error: null }));
            chain.then = vi.fn((resolve: (v: unknown) => void) =>
              resolve({ data: null, error: null, count: 0 })
            );
          } else if (callNum === 3) {
            // Delete pending bookings
            chain.single = vi.fn(() => Promise.resolve({ data: null, error: null }));
            chain.maybeSingle = vi.fn(() => Promise.resolve({ data: null, error: null }));
            chain.then = vi.fn((resolve: (v: unknown) => void) =>
              resolve({ data: null, error: null, count: 0 })
            );
          } else if (callNum === 4) {
            // Insert new booking
            chain.single = vi.fn(() => Promise.resolve({ data: mockCreatedBooking, error: null }));
            chain.maybeSingle = vi.fn(() => Promise.resolve({ data: mockCreatedBooking, error: null }));
            chain.then = vi.fn((resolve: (v: unknown) => void) =>
              resolve({ data: [mockCreatedBooking], error: null, count: 1 })
            );
          } else {
            // Update stripe_session_id
            chain.single = vi.fn(() => Promise.resolve({ data: null, error: null }));
            chain.maybeSingle = vi.fn(() => Promise.resolve({ data: null, error: null }));
            chain.then = vi.fn((resolve: (v: unknown) => void) =>
              resolve({ data: null, error: null, count: 0 })
            );
          }
          return chain;
        }

        // Default: empty
        chain.single = vi.fn(() => Promise.resolve({ data: null, error: null }));
        chain.maybeSingle = vi.fn(() => Promise.resolve({ data: null, error: null }));
        chain.then = vi.fn((resolve: (v: unknown) => void) =>
          resolve({ data: [], error: null, count: 0 })
        );
        return chain;
      }
    );

    const request = createMockRequest(BASE, {
      method: 'POST',
      body: { quantity: 1 },
    });
    const response = await POST(request as any, context as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.sessionUrl).toBe('https://checkout.stripe.com/dashr_session');
    expect(json.bookingId).toBe('booking-new-001');
    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: 'cus_123',
        mode: 'payment',
        line_items: [{ price: 'price_test_dashr', quantity: 1 }],
        metadata: expect.objectContaining({
          profile_id: 'profile-1',
          event_id: 'event-001',
          product_type: 'dashr',
        }),
      })
    );
  });

  it('returns 500 on Stripe error', async () => {
    mockAuthenticated(jaylenWashington);
    mockCheckoutSessionsCreate.mockRejectedValue(
      new Error('Stripe API error')
    );

    // Same sequential mock as the success test, but Stripe will reject
    let bookingsCallCount = 0;
    (mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockImplementation(
      (table: string) => {
        const chainMethods = [
          'select', 'insert', 'update', 'delete', 'upsert',
          'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike',
          'is', 'in', 'contains', 'order', 'limit', 'range',
          'not', 'filter', 'match', 'textSearch', 'or', 'and',
        ];
        const chain: Record<string, unknown> = {};
        for (const method of chainMethods) {
          chain[method] = vi.fn(() => chain);
        }

        if (table === 'profiles') {
          chain.single = vi.fn(() => Promise.resolve({ data: mockProfile, error: null }));
          chain.maybeSingle = vi.fn(() => Promise.resolve({ data: mockProfile, error: null }));
          chain.then = vi.fn((resolve: (v: unknown) => void) =>
            resolve({ data: mockProfile, error: null, count: 0 })
          );
          return chain;
        }

        if (table === 'dashr_events') {
          chain.single = vi.fn(() => Promise.resolve({ data: mockDashrEvent, error: null }));
          chain.maybeSingle = vi.fn(() => Promise.resolve({ data: mockDashrEvent, error: null }));
          chain.then = vi.fn((resolve: (v: unknown) => void) =>
            resolve({ data: [mockDashrEvent], error: null, count: 1 })
          );
          return chain;
        }

        if (table === 'dashr_bookings') {
          bookingsCallCount++;
          const callNum = bookingsCallCount;

          if (callNum === 1) {
            chain.then = vi.fn((resolve: (v: unknown) => void) =>
              resolve({ data: null, error: null, count: 5 })
            );
          } else if (callNum === 2) {
            chain.maybeSingle = vi.fn(() => Promise.resolve({ data: null, error: null }));
          } else if (callNum === 4) {
            chain.single = vi.fn(() => Promise.resolve({ data: mockCreatedBooking, error: null }));
          }

          chain.single = chain.single ?? vi.fn(() => Promise.resolve({ data: null, error: null }));
          chain.maybeSingle = chain.maybeSingle ?? vi.fn(() => Promise.resolve({ data: null, error: null }));
          chain.then = chain.then ?? vi.fn((resolve: (v: unknown) => void) =>
            resolve({ data: null, error: null, count: 0 })
          );
          return chain;
        }

        chain.single = vi.fn(() => Promise.resolve({ data: null, error: null }));
        chain.maybeSingle = vi.fn(() => Promise.resolve({ data: null, error: null }));
        chain.then = vi.fn((resolve: (v: unknown) => void) =>
          resolve({ data: [], error: null, count: 0 })
        );
        return chain;
      }
    );

    const request = createMockRequest(BASE, {
      method: 'POST',
      body: { quantity: 1 },
    });
    const response = await POST(request as any, context as any);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Internal server error');
  });
});
