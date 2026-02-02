# Supabase + Stripe Billing Integration

Complete Stripe integration for subscription billing with Supabase Auth.

## Setup

### Install Dependencies

```bash
npm install stripe
```

### Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
```

### Stripe Configuration

```typescript
// lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

export const STRIPE_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: {
      maxTeamMembers: 1,
      maxProjects: 3,
      maxApiCalls: 1000,
      support: 'community',
    },
  },
  pro: {
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: {
      maxTeamMembers: 10,
      maxProjects: 50,
      maxApiCalls: 100000,
      support: 'email',
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: {
      maxTeamMembers: 999,
      maxProjects: 999,
      maxApiCalls: 999999,
      support: 'priority',
    },
  },
} as const

export type PlanTier = keyof typeof STRIPE_PLANS
```

---

## Create Checkout Session

```typescript
// app/api/stripe/checkout/route.ts
import { createClient } from '@/lib/supabase/server'
import { stripe, STRIPE_PLANS } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { organizationId, planTier } = await req.json()

    // Verify permissions
    const { data: member } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()

    if (!member || !['owner', 'admin'].includes(member.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get organization
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()

    if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })

    const plan = STRIPE_PLANS[planTier as keyof typeof STRIPE_PLANS]
    if (!plan || !plan.priceId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Create or get Stripe customer
    let customerId = org.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: org.name,
        metadata: {
          supabase_user_id: user.id,
          organization_id: organizationId,
        },
      })

      customerId = customer.id

      await supabase
        .from('organizations')
        .update({ stripe_customer_id: customerId })
        .eq('id', organizationId)
    }

    // Handle existing subscription upgrade
    if (org.stripe_subscription_id) {
      const subscription = await stripe.subscriptions.retrieve(org.stripe_subscription_id)

      await stripe.subscriptions.update(org.stripe_subscription_id, {
        items: [{ id: subscription.items.data[0].id, price: plan.priceId }],
        proration_behavior: 'create_prorations',
      })

      return NextResponse.json({ message: 'Subscription updated', requiresCheckout: false })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?upgrade=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/billing?upgrade=canceled`,
      metadata: {
        organization_id: organizationId,
        plan_tier: planTier,
      },
      subscription_data: {
        metadata: { organization_id: organizationId },
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

---

## Webhook Handler

```typescript
// app/api/stripe/webhooks/route.ts
import { createClient } from '@supabase/supabase-js'
import { stripe, STRIPE_PLANS } from '@/lib/stripe'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Admin client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 })
  }

  console.log('Stripe event:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaid(invoice)
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice)
        break
      }
      default:
        console.log(`Unhandled event: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const organizationId = session.metadata?.organization_id
  if (!organizationId) return

  const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
  const priceId = subscription.items.data[0].price.id

  // Determine plan tier
  let planTier: string = 'pro'
  for (const [tier, plan] of Object.entries(STRIPE_PLANS)) {
    if (plan.priceId === priceId) {
      planTier = tier
      break
    }
  }

  const plan = STRIPE_PLANS[planTier as keyof typeof STRIPE_PLANS]

  await supabaseAdmin
    .from('organizations')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      plan_tier: planTier,
      max_team_members: plan.features.maxTeamMembers,
      max_projects: plan.features.maxProjects,
      trial_ends_at: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
    })
    .eq('id', organizationId)

  console.log(`Subscription created for org ${organizationId}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const organizationId = subscription.metadata.organization_id
  if (!organizationId) return

  const priceId = subscription.items.data[0].price.id

  let planTier: string = 'pro'
  for (const [tier, plan] of Object.entries(STRIPE_PLANS)) {
    if (plan.priceId === priceId) {
      planTier = tier
      break
    }
  }

  const plan = STRIPE_PLANS[planTier as keyof typeof STRIPE_PLANS]

  await supabaseAdmin
    .from('organizations')
    .update({
      subscription_status: subscription.status,
      plan_tier: planTier,
      stripe_price_id: priceId,
      max_team_members: plan.features.maxTeamMembers,
      max_projects: plan.features.maxProjects,
      subscription_ends_at: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
    })
    .eq('id', organizationId)

  console.log(`Subscription updated for org ${organizationId}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const organizationId = subscription.metadata.organization_id
  if (!organizationId) return

  const freePlan = STRIPE_PLANS.free

  await supabaseAdmin
    .from('organizations')
    .update({
      subscription_status: 'canceled',
      plan_tier: 'free',
      stripe_subscription_id: null,
      stripe_price_id: null,
      max_team_members: freePlan.features.maxTeamMembers,
      max_projects: freePlan.features.maxProjects,
    })
    .eq('id', organizationId)

  console.log(`Subscription canceled for org ${organizationId}`)
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!org) return

  await supabaseAdmin.from('payments').insert({
    organization_id: org.id,
    stripe_invoice_id: invoice.id,
    stripe_payment_intent_id: invoice.payment_intent as string,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: 'succeeded',
    description: invoice.lines.data[0]?.description || 'Subscription payment',
    receipt_url: invoice.hosted_invoice_url,
  })

  console.log(`Payment succeeded for org ${org.id}`)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!org) return

  await supabaseAdmin
    .from('organizations')
    .update({ subscription_status: 'past_due' })
    .eq('id', org.id)

  console.log(`Payment failed for org ${org.id}`)
}
```

---

## Customer Portal

```typescript
// app/api/stripe/portal/route.ts
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { organizationId } = await req.json()

    // Verify owner
    const { data: member } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()

    if (!member || member.role !== 'owner') {
      return NextResponse.json({ error: 'Only owners can manage billing' }, { status: 403 })
    }

    // Get organization
    const { data: org } = await supabase
      .from('organizations')
      .select('stripe_customer_id')
      .eq('id', organizationId)
      .single()

    if (!org?.stripe_customer_id) {
      return NextResponse.json({ error: 'No billing account' }, { status: 400 })
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

---

## Cancel Subscription

```typescript
// app/api/stripe/cancel/route.ts
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { organizationId, immediately } = await req.json()

    // Verify owner
    const { data: member } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()

    if (!member || member.role !== 'owner') {
      return NextResponse.json({ error: 'Only owners can cancel' }, { status: 403 })
    }

    // Get subscription
    const { data: org } = await supabase
      .from('organizations')
      .select('stripe_subscription_id')
      .eq('id', organizationId)
      .single()

    if (!org?.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
    }

    // Cancel
    if (immediately) {
      await stripe.subscriptions.cancel(org.stripe_subscription_id)
    } else {
      // Cancel at period end (keeps access until billing cycle ends)
      await stripe.subscriptions.update(org.stripe_subscription_id, {
        cancel_at_period_end: true,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

---

## Client-Side Usage

### Pricing Component

```typescript
// components/pricing.tsx
'use client'

import { useState } from 'react'
import { STRIPE_PLANS } from '@/lib/stripe'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function PricingCard({
  organizationId,
  currentPlan,
}: {
  organizationId: string
  currentPlan: string
}) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (planTier: string) => {
    setLoading(planTier)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId, planTier }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else if (data.requiresCheckout === false) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Upgrade error:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {Object.entries(STRIPE_PLANS).map(([tier, plan]) => (
        <div key={tier} className="border rounded-lg p-6">
          <h3 className="text-xl font-bold">{plan.name}</h3>
          <p className="text-3xl font-bold mt-2">
            ${plan.price}<span className="text-sm">/mo</span>
          </p>

          <ul className="mt-4 space-y-2">
            <li>{plan.features.maxTeamMembers} team members</li>
            <li>{plan.features.maxProjects} projects</li>
            <li>{plan.features.maxApiCalls.toLocaleString()} API calls</li>
            <li>{plan.features.support} support</li>
          </ul>

          <button
            onClick={() => handleUpgrade(tier)}
            disabled={currentPlan === tier || loading !== null}
            className="mt-4 w-full py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {loading === tier
              ? 'Loading...'
              : currentPlan === tier
              ? 'Current Plan'
              : 'Upgrade'}
          </button>
        </div>
      ))}
    </div>
  )
}
```

### Manage Billing Button

```typescript
// components/manage-billing.tsx
'use client'

import { useState } from 'react'

export function ManageBillingButton({ organizationId }: { organizationId: string }) {
  const [loading, setLoading] = useState(false)

  const handleManage = async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Portal error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleManage}
      disabled={loading}
      className="py-2 px-4 border rounded hover:bg-gray-50"
    >
      {loading ? 'Loading...' : 'Manage Billing'}
    </button>
  )
}
```

---

## Database Tables for Billing

```sql
-- Subscription events
create table public.subscription_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations not null,
  event_type text not null,
  from_plan text,
  to_plan text,
  stripe_event_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Payments
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations not null,
  stripe_payment_intent_id text unique,
  stripe_invoice_id text,
  amount int not null,
  currency text default 'usd',
  status text check (status in ('succeeded', 'pending', 'failed', 'refunded')),
  description text,
  receipt_url text,
  created_at timestamptz default now()
);

-- Indexes
create index idx_orgs_stripe_customer on organizations(stripe_customer_id);
create index idx_orgs_stripe_subscription on organizations(stripe_subscription_id);
```

---

## Stripe CLI for Local Testing

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/stripe/webhooks

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_failed
```
