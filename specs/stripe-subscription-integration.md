# Stripe Subscription Integration — Implementation Spec

## Overview

Wire the complete Stripe checkout flow: pricing page buttons → checkout session → Stripe hosted checkout → webhook → DB subscription record. Also add billing portal for managing subscriptions.

## What Already Exists (Working)

| Component | Status | Notes |
|-----------|--------|-------|
| Webhook handler | Done | All 4 events handled, tested |
| DB schema | Done | `subscription_plans`, `subscriptions` tables with RLS |
| Server actions | Partial | Free plan works, paid plans return stub error |
| Client hooks | Done | `useSubscription()`, `useSubscriptionPlans()` |
| Types | Done | Full TypeScript types |
| Pricing page UI | Done | Beautiful Stitch conversion, buttons not wired |
| Tests | Done | Webhook + action tests passing |
| Env vars | Done | Keys configured, price IDs in `.env.example` |

## What Needs to Be Built

1. **Implement paid checkout** in `subscription-actions.ts` — create Stripe checkout session
2. **Wire pricing page buttons** — call checkout action, redirect to Stripe
3. **Billing portal API** — create portal session for managing subscriptions
4. **DB migration** — add `stripe_customer_id` to profiles table
5. **Update tests** for new checkout logic + portal endpoint

## Layers

- [x] Database: Yes — add `stripe_customer_id` column to profiles
- [x] Backend: Yes — implement checkout session creation + portal route
- [x] Frontend: Yes — wire pricing page buttons (minimal, page already exists)
- [ ] AI: No

## Contract

### Checkout Flow (Server Action)

```typescript
// createCheckoutSession(planSlug: string)
// Free plan: creates subscription directly → returns { success: true, redirectTo: '/dashboard' }
// Paid plan: creates Stripe checkout session → returns { success: true, sessionUrl: string }
// Error: returns { error: string }
```

### Billing Portal (API Route)

```typescript
// POST /api/billing/portal
// Auth: required
// Returns: { url: string } (Stripe portal URL)
// Errors: 401 (unauth), 404 (no profile/subscription), 500
```

### Price ID Mapping

```typescript
// Map plan slugs to Stripe price IDs from env vars:
// 'pro'   → STRIPE_PRO_PRICE_ID
// 'team'  → STRIPE_TEAM_PRICE_ID
// 'scout' → STRIPE_SCOUT_PRICE_ID
```

### Webhook Metadata Contract (already implemented)

```typescript
// checkout session metadata must include:
// { profile_id: string, plan_id: string }
// Webhook reads these to create the subscription record
```

## Files to Create/Modify

| # | File | Action | Layer |
|---|------|--------|-------|
| 1 | `supabase/migrations/006_stripe_customer_id.sql` | **Create** | DB |
| 2 | `apps/web/lib/actions/subscription-actions.ts` | **Modify** | Backend |
| 3 | `apps/web/app/api/billing/portal/route.ts` | **Create** | Backend |
| 4 | `apps/web/app/pricing/page.tsx` | **Modify** | Frontend |
| 5 | `apps/web/__tests__/lib/subscription-actions.test.ts` | **Modify** | Tests |
| 6 | `apps/web/__tests__/api/billing-portal.test.ts` | **Create** | Tests |

## Implementation Order

### Step 1: DB Migration — `stripe_customer_id`

Add `stripe_customer_id TEXT` to `profiles` table. This avoids creating duplicate Stripe customers across multiple checkout sessions.

```sql
ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT;
CREATE UNIQUE INDEX idx_profiles_stripe_customer_id ON profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
```

### Step 2: Implement Paid Checkout — `subscription-actions.ts`

Replace the stub in `createCheckoutSession()` (lines 100-104) with actual Stripe logic:

1. Get user profile (already have user from auth check above)
2. Map `planSlug` → Stripe price ID via env vars
3. Get or create Stripe customer:
   - Check `profiles.stripe_customer_id`
   - If null: call `stripe.customers.create({ email, metadata: { profile_id } })`
   - Store `stripe_customer_id` on profiles table
4. Create checkout session:
   ```typescript
   stripe.checkout.sessions.create({
     customer: stripeCustomerId,
     mode: 'subscription',
     line_items: [{ price: priceId, quantity: 1 }],
     metadata: { profile_id: profile.id, plan_id: plan.id },
     success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?checkout=success`,
     cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?checkout=canceled`,
   })
   ```
5. Return `{ success: true, sessionUrl: session.url }`

Key: Use `createServiceClient()` to write `stripe_customer_id` (user's auth client may not have permission).

### Step 3: Create Billing Portal Route

Create `apps/web/app/api/billing/portal/route.ts`:

1. Auth check (get user)
2. Get profile with `stripe_customer_id`
3. If no `stripe_customer_id`: return 404 with "No billing account"
4. Create portal session:
   ```typescript
   stripe.billingPortal.sessions.create({
     customer: stripeCustomerId,
     return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
   })
   ```
5. Return `{ url: session.url }`

### Step 4: Wire Pricing Page Buttons

Modify `apps/web/app/pricing/page.tsx`:

- Page is already `'use client'`
- Add state for loading (`isLoading`, `loadingPlan`)
- Add `handleCheckout(planSlug)` function:
  1. Call `createCheckoutSession(planSlug)` server action
  2. If result has `sessionUrl` → `window.location.href = sessionUrl`
  3. If result has `redirectTo` → `router.push(redirectTo)` (free plan)
  4. If result has `error` → show error toast/alert
- Wire each button's `onClick`:
  - "Start Free" → `handleCheckout('starter')`
  - "Go Pro" → `handleCheckout('pro')`
  - "Get Team" → `handleCheckout('team')`
  - "Contact Sales" → `window.location.href = 'mailto:sales@repmax.io'`
- Add loading spinner state per button

### Step 5: Update Subscription Action Tests

Modify `apps/web/__tests__/lib/subscription-actions.test.ts`:

- Mock Stripe SDK (`stripe.customers.create`, `stripe.checkout.sessions.create`)
- Test paid plan checkout:
  - Returns session URL for pro plan
  - Creates Stripe customer if none exists
  - Reuses existing Stripe customer if `stripe_customer_id` set
  - Returns error if price ID env var missing

### Step 6: Create Billing Portal Tests

Create `apps/web/__tests__/api/billing-portal.test.ts`:

- 401 when unauthenticated
- 404 when no profile found
- 404 when no `stripe_customer_id`
- 200 with portal URL on success

## Acceptance Criteria

- [ ] Clicking "Go Pro" on pricing page redirects to Stripe Checkout
- [ ] Clicking "Get Team" on pricing page redirects to Stripe Checkout
- [ ] Clicking "Start Free" creates subscription directly and redirects to dashboard
- [ ] Clicking "Contact Sales" opens email
- [ ] After successful Stripe checkout, webhook creates subscription in DB
- [ ] `POST /api/billing/portal` returns portal URL for managing subscriptions
- [ ] Stripe customer ID stored on profiles for reuse
- [ ] Loading states shown during checkout redirect
- [ ] All existing tests still pass
- [ ] New tests cover checkout + portal
- [ ] Quality gates pass: tsc, lint, vitest, build
