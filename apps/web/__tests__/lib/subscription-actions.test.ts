import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  configureMockSupabase,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { jaylenWashington } from '../fixtures/users';
import { redirect } from 'next/navigation';

import {
  getSubscriptionPlans,
  getCurrentSubscription,
  createCheckoutSession,
} from '@/lib/actions/subscription-actions';

// ===========================================================================
// subscription-actions tests
// ===========================================================================
describe('subscription-actions', () => {
  beforeEach(() => {
    resetMocks();
    vi.mocked(redirect).mockClear();
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
        subscription_plans: { data: { id: 'plan-1', name: 'Starter', price_cents: 0 }, error: null },
        profiles: { data: { id: 'prof-1' }, error: null },
        subscriptions: { data: [], error: null },
      });

      const result = await createCheckoutSession('starter');
      expect(result).toEqual({ success: true, redirectTo: '/dashboard' });
    });

    it('returns error for paid plans (Stripe not configured)', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        subscription_plans: { data: { id: 'plan-2', name: 'Pro', price_cents: 999 }, error: null },
      });

      const result = await createCheckoutSession('pro');
      expect(result.error).toContain('Stripe');
    });
  });
});
