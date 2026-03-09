import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import {
  configureMockSupabase,
  createMockRequest,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { coachWilliams, jaylenWashington } from '../fixtures/users';

// ---------------------------------------------------------------------------
// Stripe hoisted mocks
// ---------------------------------------------------------------------------
const { mockBillingPortalSessionsCreate } = vi.hoisted(() => ({
  mockBillingPortalSessionsCreate: vi.fn(),
}));

vi.mock('stripe', () => ({
  default: vi.fn(() => ({
    billingPortal: { sessions: { create: mockBillingPortalSessionsCreate } },
  })),
}));

vi.mock('@/lib/stripe', () => ({
  getStripe: vi.fn(() => ({
    billingPortal: { sessions: { create: mockBillingPortalSessionsCreate } },
  })),
}));

import { POST } from '@/app/api/billing/portal/route';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const mockProfileWithStripe = {
  id: 'profile-1',
  stripe_customer_id: 'cus_123',
};

const mockProfileNoStripe = {
  id: 'profile-1',
  stripe_customer_id: null,
};

const mockSchoolAdminMembership = {
  school_id: 'school-1',
  schools: { stripe_customer_id: 'cus_school_1' },
};

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
beforeAll(() => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
});

// ===========================================================================
// POST /api/billing/portal
// ===========================================================================
describe('POST /api/billing/portal', () => {
  beforeEach(() => {
    resetMocks();
    mockBillingPortalSessionsCreate.mockReset();
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const request = createMockRequest('http://localhost:3000/api/billing/portal', {
      method: 'POST',
    });
    const response = await POST();
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 404 when profile not found', async () => {
    mockAuthenticated(coachWilliams);
    configureMockSupabase({
      profiles: { data: null, error: null },
    });
    const response = await POST();
    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toBe('Profile not found');
  });

  it('returns 404 when no billing account (no stripe_customer_id)', async () => {
    mockAuthenticated(jaylenWashington);
    configureMockSupabase({
      profiles: { data: mockProfileNoStripe, error: null },
      school_members: { data: null, error: null },
    });
    const response = await POST();
    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toContain('No billing account found');
  });

  it('creates portal session using profile stripe_customer_id', async () => {
    mockAuthenticated(coachWilliams);
    configureMockSupabase({
      profiles: { data: mockProfileWithStripe, error: null },
      school_members: { data: null, error: null },
    });
    mockBillingPortalSessionsCreate.mockResolvedValue({
      url: 'https://billing.stripe.com/portal_session123',
    });

    const response = await POST();
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.url).toBe('https://billing.stripe.com/portal_session123');
    expect(mockBillingPortalSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: 'cus_123',
        return_url: expect.stringContaining('/dashboard'),
      })
    );
  });

  it('uses school stripe_customer_id for school admin', async () => {
    mockAuthenticated(coachWilliams);
    configureMockSupabase({
      profiles: { data: mockProfileNoStripe, error: null },
      school_members: { data: mockSchoolAdminMembership, error: null },
    });
    mockBillingPortalSessionsCreate.mockResolvedValue({
      url: 'https://billing.stripe.com/school_portal',
    });

    const response = await POST();
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.url).toBe('https://billing.stripe.com/school_portal');
    expect(mockBillingPortalSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: 'cus_school_1',
      })
    );
  });

  it('returns 500 on Stripe error', async () => {
    mockAuthenticated(coachWilliams);
    configureMockSupabase({
      profiles: { data: mockProfileWithStripe, error: null },
      school_members: { data: null, error: null },
    });
    mockBillingPortalSessionsCreate.mockRejectedValue(
      new Error('Stripe API error')
    );

    const response = await POST();
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe('Failed to create billing portal session');
  });
});
