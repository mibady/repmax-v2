import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import {
  configureMockSupabase,
  createMockRequest,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
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

import { POST } from '@/app/api/checkout/route';

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

const mockActiveSub = {
  id: 'sub-1',
};

const mockSchoolMembership = {
  school_id: 'school-1',
  schools: { name: 'TCU', stripe_customer_id: 'cus_school_1' },
};

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
beforeAll(() => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
  process.env.STRIPE_ATHLETE_PREMIUM_MONTHLY_PRICE_ID = 'price_test_premium';
  process.env.STRIPE_ATHLETE_PRO_MONTHLY_PRICE_ID = 'price_test_pro';
  process.env.STRIPE_SCHOOL_SMALL_ANNUAL_PRICE_ID = 'price_test_school_small';
});

// ===========================================================================
// POST /api/checkout
// ===========================================================================
describe('POST /api/checkout', () => {
  beforeEach(() => {
    resetMocks();
    mockCheckoutSessionsCreate.mockReset();
    mockCustomersCreate.mockReset();
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const request = createMockRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: { planSlug: 'athlete-premium' },
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 500 when planSlug is missing (Zod parse error)', async () => {
    mockAuthenticated(jaylenWashington);
    const request = createMockRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: {},
    });
    const response = await POST(request);
    expect(response.status).toBe(500);
  });

  it('returns 400 for invalid/unknown plan slug', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
    });
    const request = createMockRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: { planSlug: 'nonexistent-plan' },
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Invalid plan');
  });

  it('returns 404 when profile not found', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: null, error: null },
    });
    const request = createMockRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: { planSlug: 'athlete-premium' },
    });
    const response = await POST(request);
    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toBe('Profile not found');
  });

  it('returns 400 when user already has active subscription', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      subscriptions: { data: mockActiveSub, error: null },
    });
    const request = createMockRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: { planSlug: 'athlete-premium' },
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain('already have an active subscription');
  });

  it('returns 403 when non-admin tries school plan', async () => {
    mockAuthenticated(coachWilliams);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      subscriptions: { data: null, error: null },
      school_members: { data: null, error: null },
    });
    const request = createMockRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: { planSlug: 'school-small' },
    });
    const response = await POST(request);
    expect(response.status).toBe(403);
    const json = await response.json();
    expect(json.error).toContain('school admin');
  });

  it('creates checkout session for athlete plan successfully', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      subscriptions: { data: null, error: null },
    });
    mockCheckoutSessionsCreate.mockResolvedValue({
      url: 'https://checkout.stripe.com/session123',
      id: 'cs_test_123',
    });

    const request = createMockRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: { planSlug: 'athlete-premium' },
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.url).toBe('https://checkout.stripe.com/session123');
    expect(json.sessionUrl).toBe('https://checkout.stripe.com/session123');
    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: 'cus_123',
        mode: 'subscription',
        line_items: [{ price: 'price_test_premium', quantity: 1 }],
      })
    );
  });

  it('creates Stripe customer when profile has no stripe_customer_id', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: mockProfileNoStripe, error: null },
      subscriptions: { data: null, error: null },
    });
    mockCustomersCreate.mockResolvedValue({ id: 'cus_new_123' });
    mockCheckoutSessionsCreate.mockResolvedValue({
      url: 'https://checkout.stripe.com/session456',
      id: 'cs_test_456',
    });

    const request = createMockRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: { planSlug: 'athlete-pro' },
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockCustomersCreate).toHaveBeenCalled();
    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: 'cus_new_123',
      })
    );
  });

  it('creates checkout session for school plan when user is admin', async () => {
    mockAuthenticated(coachWilliams);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      subscriptions: { data: null, error: null },
      school_members: { data: mockSchoolMembership, error: null },
    });
    mockCheckoutSessionsCreate.mockResolvedValue({
      url: 'https://checkout.stripe.com/school_session',
      id: 'cs_test_school',
    });

    const request = createMockRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: { planSlug: 'school-small' },
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.url).toBe('https://checkout.stripe.com/school_session');
    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: 'cus_school_1',
        metadata: expect.objectContaining({ school_id: 'school-1' }),
      })
    );
  });

  it('allows school plan even with existing active subscription', async () => {
    mockAuthenticated(coachWilliams);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      subscriptions: { data: mockActiveSub, error: null },
      school_members: { data: mockSchoolMembership, error: null },
    });
    mockCheckoutSessionsCreate.mockResolvedValue({
      url: 'https://checkout.stripe.com/school_session2',
      id: 'cs_test_school2',
    });

    const request = createMockRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: { planSlug: 'school-small' },
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('returns 500 on Stripe error', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      subscriptions: { data: null, error: null },
    });
    mockCheckoutSessionsCreate.mockRejectedValue(new Error('Stripe API error'));

    const request = createMockRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: { planSlug: 'athlete-premium' },
    });
    const response = await POST(request);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe('Failed to create checkout session');
  });
});
