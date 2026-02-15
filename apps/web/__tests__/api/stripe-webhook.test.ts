import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import { resetMocks, configureMockSupabase } from '../helpers/route-test-utils';

// ---------------------------------------------------------------------------
// Hoisted mocks — available at vi.mock factory evaluation time
// ---------------------------------------------------------------------------
const { mockConstructEvent, mockSubscriptionsRetrieve, mockHeadersData } = vi.hoisted(() => ({
  mockConstructEvent: vi.fn(),
  mockSubscriptionsRetrieve: vi.fn(),
  mockHeadersData: { signature: null as string | null },
}));

// Mock Stripe module
vi.mock('stripe', () => ({
  default: vi.fn(() => ({
    webhooks: { constructEvent: mockConstructEvent },
    subscriptions: { retrieve: mockSubscriptionsRetrieve },
  })),
}));

// Override next/headers for this test file (need configurable stripe-signature)
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn(),
    getAll: vi.fn(() => []),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
  }),
  headers: vi.fn(() => ({
    get: (name: string) => (name === 'stripe-signature' ? mockHeadersData.signature : null),
  })),
}));

import { POST } from '@/app/api/webhooks/stripe/route';

// ===========================================================================
// POST /api/webhooks/stripe
// ===========================================================================
describe('POST /api/webhooks/stripe', () => {
  beforeAll(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';
  });

  afterAll(() => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  beforeEach(() => {
    resetMocks();
    mockConstructEvent.mockReset();
    mockSubscriptionsRetrieve.mockReset();
    mockHeadersData.signature = null;
  });

  function createWebhookRequest(body = 'test_body') {
    return new Request('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      body,
    });
  }

  it('returns 400 when stripe-signature header is missing', async () => {
    const response = await POST(createWebhookRequest());
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('stripe-signature');
  });

  it('returns 400 when signature verification fails', async () => {
    mockHeadersData.signature = 'sig_invalid';
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Signature verification failed');
    });

    const response = await POST(createWebhookRequest());
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('verification failed');
  });

  it('handles checkout.session.completed event', async () => {
    mockHeadersData.signature = 'sig_valid';
    const now = Math.floor(Date.now() / 1000);

    mockConstructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          mode: 'subscription',
          subscription: 'sub_123',
          metadata: { profile_id: 'prof-1', plan_id: 'plan-1' },
        },
      },
    });
    mockSubscriptionsRetrieve.mockResolvedValue({
      id: 'sub_123',
      current_period_start: now,
      current_period_end: now + 30 * 86400,
    });
    configureMockSupabase({
      subscriptions: { data: [{ id: 'sub-db-1' }], error: null },
    });

    const response = await POST(createWebhookRequest());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.received).toBe(true);
    expect(mockSubscriptionsRetrieve).toHaveBeenCalledWith('sub_123');
  });

  it('handles customer.subscription.updated event', async () => {
    mockHeadersData.signature = 'sig_valid';
    const now = Math.floor(Date.now() / 1000);

    mockConstructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_123',
          status: 'active',
          current_period_start: now,
          current_period_end: now + 30 * 86400,
        },
      },
    });
    configureMockSupabase({
      subscriptions: { data: [], error: null },
    });

    const response = await POST(createWebhookRequest());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.received).toBe(true);
  });

  it('handles customer.subscription.deleted event', async () => {
    mockHeadersData.signature = 'sig_valid';

    mockConstructEvent.mockReturnValue({
      type: 'customer.subscription.deleted',
      data: {
        object: { id: 'sub_123' },
      },
    });
    configureMockSupabase({
      subscriptions: { data: [], error: null },
    });

    const response = await POST(createWebhookRequest());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.received).toBe(true);
  });

  it('handles invoice.payment_failed event', async () => {
    mockHeadersData.signature = 'sig_valid';

    mockConstructEvent.mockReturnValue({
      type: 'invoice.payment_failed',
      data: {
        object: { subscription: 'sub_123' },
      },
    });
    configureMockSupabase({
      subscriptions: { data: [], error: null },
    });

    const response = await POST(createWebhookRequest());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.received).toBe(true);
  });

  it('handles unknown event type gracefully', async () => {
    mockHeadersData.signature = 'sig_valid';

    mockConstructEvent.mockReturnValue({
      type: 'unknown.event.type',
      data: { object: {} },
    });

    const response = await POST(createWebhookRequest());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.received).toBe(true);
  });
});
