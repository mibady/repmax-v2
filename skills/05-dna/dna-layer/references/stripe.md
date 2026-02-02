# Stripe - Payment Processing & Billing

**Official Website:** https://stripe.com
**Documentation:** https://stripe.com/docs
**Pricing:** 2.9% + $0.30 per transaction

---

## Overview

Stripe is a complete payment platform that enables businesses to accept payments, manage subscriptions, send payouts, and handle financial operations. It provides powerful APIs, pre-built UI components, and comprehensive webhook system for building payment flows.

### Key Features

- ✅ Payment processing (cards, wallets, bank transfers)
- ✅ Subscription billing
- ✅ Checkout & payment links
- ✅ Customer portal
- ✅ Invoicing
- ✅ Fraud prevention
- ✅ Global payments (135+ currencies)
- ✅ Tax calculation
- ✅ Webhooks for events
- ✅ Financial reporting
- ✅ PCI compliance built-in
- ✅ Next.js optimized SDK

---

## Use Cases for AI Coder

1. **SaaS Subscriptions**
   - Recurring billing
   - Usage-based pricing
   - Trial periods
   - Plan upgrades/downgrades

2. **One-time Payments**
   - Product purchases
   - Credits/tokens
   - Add-ons
   - Services

3. **Marketplace**
   - Split payments
   - Platform fees
   - Seller payouts
   - Escrow

4. **AI Usage Billing**
   - Metered billing
   - Token consumption
   - API usage
   - Overage charges

---

## Quick Start

### 1. Installation

```bash
npm install stripe @stripe/stripe-js
# or
pnpm add stripe @stripe/stripe-js
```

### 2. Get API Keys

1. Sign up at https://stripe.com
2. Navigate to Developers > API Keys
3. Copy test keys for development
4. Add to `.env.local`:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Webhooks
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Initialize Stripe

```typescript
// lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});
```

```typescript
// lib/stripe-client.ts
import { loadStripe } from '@stripe/stripe-js';

export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
};
```

---

## Checkout Session

### Create Checkout Session

```typescript
// app/api/checkout/route.ts
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { priceId } = await request.json();

  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: undefined, // Will be filled by Stripe
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        userId,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
```

### Redirect to Checkout

```typescript
// components/subscribe-button.tsx
'use client';

import { useState } from 'react';
import { getStripe } from '@/lib/stripe-client';

export function SubscribeButton({ priceId }: { priceId: string }) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);

    try {
      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Subscribe error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleSubscribe} disabled={loading}>
      {loading ? 'Loading...' : 'Subscribe'}
    </button>
  );
}
```

---

## Subscriptions

### Create Subscription

```typescript
// app/api/create-subscription/route.ts
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // user already fetched above

  if (!userId || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { priceId } = await request.json();

  try {
    // Get or create Stripe customer
    let customerId = user.privateMetadata.stripeCustomerId as string;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.emailAddresses[0].emailAddress,
        metadata: { userId },
      });

      customerId = customer.id;

      // Save to Clerk
      await clerkClient.users.updateUser(userId, {
        privateMetadata: { stripeCustomerId: customerId },
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
```

### Cancel Subscription

```typescript
// app/api/cancel-subscription/route.ts
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { subscriptionId } = await request.json();

  try {
    // Cancel at period end
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Cancel error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
```

### Update Subscription

```typescript
// app/api/update-subscription/route.ts
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { subscriptionId, priceId } = await request.json();

  try {
    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Update subscription
    const updated = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: priceId,
        },
      ],
      proration_behavior: 'create_prorations', // Pro-rate the change
    });

    return NextResponse.json({ subscription: updated });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}
```

---

## Customer Portal

### Create Portal Session

```typescript
// app/api/customer-portal/route.ts
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // user already fetched above

  if (!userId || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const customerId = user.privateMetadata.stripeCustomerId as string;

  if (!customerId) {
    return NextResponse.json(
      { error: 'No Stripe customer found' },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
```

### Portal Button

```typescript
// components/manage-subscription-button.tsx
'use client';

import { useState } from 'react';

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  const handleManage = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/customer-portal', {
        method: 'POST',
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Portal error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleManage} disabled={loading}>
      {loading ? 'Loading...' : 'Manage Subscription'}
    </button>
  );
}
```

---

## Webhooks

### Setup Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;

  if (!user) {
    console.error('No userId in session metadata');
    return;
  }

  // Update user subscription in database
  await db.user.update({
    where: { clerkId: userId },
    data: {
      stripeCustomerId: session.customer as string,
      subscriptionStatus: 'active',
    },
  });

  // Send confirmation email
  await resend.emails.send({
    from: 'billing@yourdomain.com',
    to: session.customer_email!,
    subject: 'Subscription Confirmed',
    react: SubscriptionConfirmationEmail(),
  });
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find user by Stripe customer ID
  const user = await db.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Update subscription in database
  await db.subscription.create({
    data: {
      userId: user.id,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      priceId: subscription.items.data[0].price.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await db.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status,
      priceId: subscription.items.data[0].price.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await db.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: 'canceled',
      canceledAt: new Date(),
    },
  });

  // Send cancellation email
  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;

  await resend.emails.send({
    from: 'billing@yourdomain.com',
    to: customer.email!,
    subject: 'Subscription Canceled',
    react: SubscriptionCanceledEmail(),
  });
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) return;

  await db.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      lastPaymentDate: new Date(),
      status: 'active',
    },
  });

  // Send invoice email
  await resend.emails.send({
    from: 'billing@yourdomain.com',
    to: invoice.customer_email!,
    subject: `Invoice Payment Successful - $${(invoice.amount_paid / 100).toFixed(2)}`,
    react: InvoiceEmail({ invoice }),
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) return;

  await db.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      status: 'past_due',
    },
  });

  // Send payment failed email
  await resend.emails.send({
    from: 'billing@yourdomain.com',
    to: invoice.customer_email!,
    subject: 'Payment Failed',
    react: PaymentFailedEmail({ invoice }),
  });
}
```

---

## Usage-Based Billing

### Report Usage

```typescript
// app/api/ai/chat/route.ts
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { message } = await request.json();

  // Process AI request
  const response = await processAIRequest(message);
  const tokensUsed = response.usage.total_tokens;

  // Report usage to Stripe
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { subscription: true },
  });

  if (user?.subscription?.stripeSubscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(
      user.subscription.stripeSubscriptionId
    );

    // Find metered item
    const meteredItem = subscription.items.data.find(
      (item) => item.price.recurring?.usage_type === 'metered'
    );

    if (meteredItem) {
      await stripe.subscriptionItems.createUsageRecord(meteredItem.id, {
        quantity: tokensUsed,
        timestamp: Math.floor(Date.now() / 1000),
        action: 'increment',
      });
    }
  }

  return NextResponse.json({ response });
}
```

### Create Metered Price

```typescript
// scripts/create-metered-price.ts
import { stripe } from '@/lib/stripe';

async function createMeteredPrice() {
  const product = await stripe.products.create({
    name: 'AI Tokens',
    description: 'Pay-as-you-go AI token usage',
  });

  const price = await stripe.prices.create({
    product: product.id,
    currency: 'usd',
    recurring: {
      interval: 'month',
      usage_type: 'metered',
    },
    billing_scheme: 'tiered',
    tiers_mode: 'graduated',
    tiers: [
      {
        up_to: 10000,
        unit_amount: 100, // $0.01 per token
      },
      {
        up_to: 50000,
        unit_amount: 80, // $0.008 per token
      },
      {
        up_to: 'inf',
        unit_amount: 60, // $0.006 per token
      },
    ],
  });

  console.log('Created metered price:', price.id);
}

createMeteredPrice();
```

---

## Integration with AI Coder Services

### With Clerk (Authentication)

```typescript
// Sync Stripe customer with Clerk user
import { createClient as createAdminClient } from '@supabase/supabase-js';

// When creating customer
const customer = await stripe.customers.create({
  email: user.emailAddresses[0].emailAddress,
  metadata: { clerkUserId: userId },
});

await clerkClient.users.updateUser(userId, {
  privateMetadata: {
    stripeCustomerId: customer.id,
  },
});
```

### With Supabase (Database)

```typescript
// Store subscription data in Supabase
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

await supabase.from('subscriptions').insert({
  user_id: userId,
  stripe_subscription_id: subscription.id,
  status: subscription.status,
  price_id: subscription.items.data[0].price.id,
  current_period_end: new Date(subscription.current_period_end * 1000),
});
```

### With Inngest (Background Jobs)

```typescript
// inngest/functions/process-subscription.ts
import { inngest } from '@/lib/inngest';
import { stripe } from '@/lib/stripe';

export const processSubscriptionPayment = inngest.createFunction(
  { id: 'process-subscription-payment' },
  { event: 'stripe/invoice.payment_succeeded' },
  async ({ event, step }) => {
    // Update database
    await step.run('update-subscription', async () => {
      return await db.subscription.update({
        where: { stripeSubscriptionId: event.data.subscription },
        data: { status: 'active', lastPaymentDate: new Date() },
      });
    });

    // Send invoice email
    await step.run('send-invoice', async () => {
      return await resend.emails.send({
        from: 'billing@yourdomain.com',
        to: event.data.customer_email,
        subject: 'Invoice Payment Successful',
        react: InvoiceEmail({ invoice: event.data }),
      });
    });

    // Grant access
    await step.run('grant-access', async () => {
      return await grantPremiumAccess(event.data.userId);
    });
  }
);
```

### With Resend (Email)

```typescript
// Send payment-related emails
import { resend } from '@/lib/resend';

// Subscription confirmation
await resend.emails.send({
  from: 'billing@yourdomain.com',
  to: customer.email,
  subject: 'Subscription Confirmed',
  react: SubscriptionEmail({
    planName: 'Pro',
    amount: 29.99,
    billingDate: new Date(),
  }),
});
```

---

## Best Practices

### 1. Environment Variables

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Webhooks
STRIPE_WEBHOOK_SECRET=whsec_xxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Use Idempotency Keys

```typescript
const payment = await stripe.paymentIntents.create(
  {
    amount: 2000,
    currency: 'usd',
  },
  {
    idempotencyKey: `payment_${userId}_${Date.now()}`,
  }
);
```

### 3. Handle Errors Gracefully

```typescript
try {
  const session = await stripe.checkout.sessions.create({
    // ... config
  });
} catch (error) {
  if (error instanceof Stripe.errors.StripeCardError) {
    // Card was declined
    return NextResponse.json(
      { error: 'Card declined' },
      { status: 402 }
    );
  }

  if (error instanceof Stripe.errors.StripeInvalidRequestError) {
    // Invalid parameters
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }

  // Other errors
  console.error('Stripe error:', error);
  return NextResponse.json(
    { error: 'Payment failed' },
    { status: 500 }
  );
}
```

### 4. Test Webhooks Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 5. Use Metadata

```typescript
// Store custom data in Stripe
const customer = await stripe.customers.create({
  email: user.email,
  metadata: {
    userId: user.id,
    source: 'web',
    plan: 'pro',
  },
});
```

---

## Testing

### Test Cards

```
# Successful payment
4242 4242 4242 4242

# Requires authentication
4000 0025 0000 3155

# Declined
4000 0000 0000 9995

# Insufficient funds
4000 0000 0000 9995
```

### Test Webhook Locally

```bash
# Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
```

---

## Pricing

**Transaction Fees:**
- 2.9% + $0.30 per successful card charge
- 0.8% per transaction for ACH Direct Debit
- 3.9% + $0.30 for international cards

**Billing:**
- $0.50 per invoice issued
- Free for Checkout

**Additional Features:**
- Radar (fraud prevention): 0.05¢ per transaction
- Billing: Included
- Connect: Additional platform fees apply

---

## Resources

- **Documentation:** https://stripe.com/docs
- **Dashboard:** https://dashboard.stripe.com
- **API Reference:** https://stripe.com/docs/api
- **Status:** https://status.stripe.com
- **Testing:** https://stripe.com/docs/testing

---

## Next Steps

1. Sign up for Stripe account
2. Get API keys
3. Install Stripe SDK
4. Create products and prices
5. Implement checkout flow
6. Set up webhooks
7. Test with test cards
8. Configure customer portal
9. Deploy to production

For more examples, see the template repositories in `/home/mibady/ai-coder-workspace/templates/`.
