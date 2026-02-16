import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import {
  configureMockSupabase,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { jaylenWashington } from '../fixtures/users';
import { redirect } from 'next/navigation';

// ---------------------------------------------------------------------------
// Hoisted mocks — Stripe SDK
// ---------------------------------------------------------------------------
const { mockCustomersCreate, mockCheckoutSessionsCreate, mockPortalSessionsCreate } = vi.hoisted(() => ({
  mockCustomersCreate: vi.fn(),
  mockCheckoutSessionsCreate: vi.fn(),
  mockPortalSessionsCreate: vi.fn(),
}));

vi.mock('stripe', () => ({
  default: vi.fn(() => ({
    customers: { create: mockCustomersCreate },
    checkout: { sessions: { create: mockCheckoutSessionsCreate } },
    billingPortal: { sessions: { create: mockPortalSessionsCreate } },
  })),
}));

import {
  getSubscriptionPlans,
  getCurrentSubscription,
  createCheckoutSession,
  createBillingPortalSession,
} from '@/lib/actions/subscription-actions';

// ===========================================================================
// subscription-actions tests
// ===========================================================================
describe('subscription-actions', () => {
  beforeAll(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
    process.env.STRIPE_PRO_PRICE_ID = 'price_pro_mock';
    process.env.STRIPE_TEAM_PRICE_ID = 'price_team_mock';
    process.env.NEXT_PUBLIC_URL = 'http://localhost:3000';
  });

  afterAll(() => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_PRO_PRICE_ID;
    delete process.env.STRIPE_TEAM_PRICE_ID;
    delete process.env.NEXT_PUBLIC_URL;
  });

  beforeEach(() => {
    resetMocks();
    vi.mocked(redirect).mockClear();
    mockCustomersCreate.mockReset();
    mockCheckoutSessionsCreate.mockReset();
    mockPortalSessionsCreate.mockReset();
  });

  // ─── getSubscriptionPlans ─────────────────────────────────
  describe('getSubscriptionPlans', () => {
    it('returns plans from database', async () => {
      const mockPlans = [
        { id: 'plan-1', name: 'Starter', price_cents: 0, active: true },
        { id: 'plan-2', name: 'Pro', price_cents: 999, active: true },
      ];
      configureMockSupabase({
        subscription_plans: { data: mockPlans, error: null },
      });

      const result = await getSubscriptionPlans();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Starter');
    });

    it('returns empty array when no plans exist', async () => {
      configureMockSupabase({
        subscription_plans: { data: [], error: null },
      });

      const result = await getSubscriptionPlans();
      expect(result).toEqual([]);
    });
  });

  // ─── getCurrentSubscription ───────────────────────────────
  describe('getCurrentSubscription', () => {
    it('returns null when unauthenticated', async () => {
      mockUnauthenticated();
      const result = await getCurrentSubscription();
      expect(result).toBeNull();
    });

    it('returns null when profile not found', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: null, error: null },
      });

      const result = await getCurrentSubscription();
      expect(result).toBeNull();
    });

    it('returns active subscription', async () => {
      mockAuthenticated(jaylenWashington);
      const mockSub = {
        id: 'sub-1',
        profile_id: 'prof-1',
        status: 'active',
        plan: { id: 'plan-2', name: 'Pro', price_cents: 999 },
      };
      configureMockSupabase({
        profiles: { data: { id: 'prof-1' }, error: null },
        subscriptions: { data: mockSub, error: null },
      });

      const result = await getCurrentSubscription();
      expect(result).toBeDefined();
      expect(result.id).toBe('sub-1');
    });
  });

  // ─── createCheckoutSession ────────────────────────────────
  describe('createCheckoutSession', () => {
    it('redirects when unauthenticated', async () => {
      mockUnauthenticated();

      try {
        await createCheckoutSession('pro');
      } catch {
        // Expected
      }

      expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('returns error when plan not found', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        subscription_plans: { data: null, error: null },
      });

      const result = await createCheckoutSession('nonexistent');
      expect(result).toEqual({ error: 'Plan not found' });
    });

    it('creates free subscription directly', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        subscription_plans: { data: { id: 'plan-1', name: 'Starter', slug: 'starter', price_cents: 0 }, error: null },
        profiles: { data: { id: 'prof-1', stripe_customer_id: null }, error: null },
        subscriptions: { data: [], error: null },
      });

      const result = await createCheckoutSession('starter');
      expect(result).toEqual({ success: true, redirectTo: '/dashboard' });
    });

    it('creates Stripe checkout session for paid plans', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        subscription_plans: { data: { id: 'plan-2', name: 'Pro', slug: 'pro', price_cents: 999 }, error: null },
        profiles: { data: { id: 'prof-1', stripe_customer_id: 'cus_existing123' }, error: null },
      });

      mockCheckoutSessionsCreate.mockResolvedValue({
        url: 'https://checkout.stripe.com/session_abc',
      });

      const result = await createCheckoutSession('pro');
      expect(result).toEqual({
        success: true,
        sessionUrl: 'https://checkout.stripe.com/session_abc',
      });

      // Verify Stripe was called with correct params
      expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_existing123',
          mode: 'subscription',
          line_items: [{ price: 'price_pro_mock', quantity: 1 }],
          metadata: { profile_id: 'prof-1', plan_id: 'plan-2' },
        })
      );
    });

    it('creates Stripe customer when none exists', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        subscription_plans: { data: { id: 'plan-2', name: 'Pro', slug: 'pro', price_cents: 999 }, error: null },
        profiles: { data: { id: 'prof-1', stripe_customer_id: null }, error: null },
      });

      mockCustomersCreate.mockResolvedValue({ id: 'cus_new456' });
      mockCheckoutSessionsCreate.mockResolvedValue({
        url: 'https://checkout.stripe.com/session_def',
      });

      const result = await createCheckoutSession('pro');
      expect(result).toEqual({
        success: true,
        sessionUrl: 'https://checkout.stripe.com/session_def',
      });

      // Verify customer was created
      expect(mockCustomersCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          email: jaylenWashington.email,
          metadata: { profile_id: 'prof-1' },
        })
      );

      // Verify checkout used new customer
      expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({ customer: 'cus_new456' })
      );
    });

    it('returns error when price ID not configured', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        subscription_plans: { data: { id: 'plan-x', name: 'Scout', slug: 'scout', price_cents: 5000 }, error: null },
        profiles: { data: { id: 'prof-1', stripe_customer_id: null }, error: null },
      });

      // STRIPE_SCOUT_PRICE_ID is not set in beforeAll
      const result = await createCheckoutSession('scout');
      expect(result.error).toContain('Price not configured');
    });
  });

  // ─── createBillingPortalSession ─────────────────────────────
  describe('createBillingPortalSession', () => {
    it('redirects when unauthenticated', async () => {
      mockUnauthenticated();

      try {
        await createBillingPortalSession();
      } catch {
        // Expected
      }

      expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('returns error when no stripe_customer_id', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: { id: 'prof-1', stripe_customer_id: null }, error: null },
      });

      const result = await createBillingPortalSession();
      expect(result.error).toContain('No billing account');
    });

    it('returns portal URL on success', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: { id: 'prof-1', stripe_customer_id: 'cus_existing123' }, error: null },
      });

      mockPortalSessionsCreate.mockResolvedValue({
        url: 'https://billing.stripe.com/portal_session_abc',
      });

      const result = await createBillingPortalSession();
      expect(result).toEqual({
        success: true,
        url: 'https://billing.stripe.com/portal_session_abc',
      });

      expect(mockPortalSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_existing123',
          return_url: 'http://localhost:3000/dashboard',
        })
      );
    });
  });
});
