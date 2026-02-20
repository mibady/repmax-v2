# RepMax — Complete Pricing & Stripe Product Catalog

Master reference for all product lines across 6 specs. Single source of truth for Stripe checkout builds.

---

## Product Lines Overview

| Spec | Who Pays | Model | Stripe Mode | Products |
|------|----------|-------|-------------|----------|
| A: Athlete | Athletes | Monthly + Annual sub | `subscription` | 3 tiers |
| B: Recruiter | Recruiters | Monthly + Annual sub | `subscription` | 4 tiers |
| C: Schools B2B | Schools/Teams/Coaches | Annual sub | `subscription` | 3 tiers |
| D: Tournament/Events | Club organizers + school participants | Per-event | `payment` | 3 organizer tiers + variable entry fees |
| E: Dashr Combines | Athletes/Parents | Per-event | `payment` | 5 products |
| F: Parent Portal | Parents | Free (bundled w/ athlete) | N/A | 0 products |

**Total Stripe products: 18 (+ variable tournament registration fees)**

---

## Spec A: Athlete Subscriptions

### Monthly Billing

| Product Name | Slug | Monthly | Features |
|---|---|---|---|
| Athlete Basic | `athlete-basic` | **$0** (no Stripe) | Basic profile, 2 highlight videos (embeds only), receive messages (no outbound), calendar |
| Athlete Premium | `athlete-premium` | **$14.99** | 5 direct video uploads + unlimited embeds, documents page, analytics (partial), 10 outbound messages/mo |
| Athlete Pro | `athlete-pro` | **$59.99** | Unlimited video uploads, full analytics, unlimited outbound messaging, priority profile placement |

### Annual Billing (2 months free = ~17% discount)

| Product Name | Slug | Annual | Monthly Equiv | Savings |
|---|---|---|---|---|
| Athlete Premium Annual | `athlete-premium-annual` | **$149.90/yr** | $12.49/mo | $30/yr |
| Athlete Pro Annual | `athlete-pro-annual` | **$599.90/yr** | $49.99/mo | $120/yr |

### Stripe Setup

| Env Var | Slug | Amount | Interval |
|---------|------|--------|----------|
| `STRIPE_ATHLETE_PREMIUM_PRICE_ID` | `athlete-premium` | $14.99 | month |
| `STRIPE_ATHLETE_PRO_PRICE_ID` | `athlete-pro` | $59.99 | month |
| `STRIPE_ATHLETE_PREMIUM_ANNUAL_PRICE_ID` | `athlete-premium-annual` | $149.90 | year |
| `STRIPE_ATHLETE_PRO_ANNUAL_PRICE_ID` | `athlete-pro-annual` | $599.90 | year |

**Stripe product metadata:** `{ target_role: "athlete", tier: "premium|pro" }`

---

## Spec B: Recruiter Subscriptions

### Monthly Billing

| Product Name | Slug | Monthly | Features |
|---|---|---|---|
| Recruiter Free | `recruiter-free` | **$0** (no Stripe) | Basic access, 10 searches/day, public profiles only |
| Recruiter Pro | `recruiter-pro` | **$99** | Full database, unlimited search, advanced metrics, CSV export, 50 messages/mo |
| Recruiter Team | `recruiter-team` | **$299** | + 5 seats, shared watchlists, collaboration, pipeline, unlimited messages, priority support |
| Recruiter AI Analytics | `recruiter-ai` | **$399** | + AI scouting reports, predictive analytics, custom reporting, API access, dedicated account manager |

### Annual Billing (2 months free = ~17% discount)

| Product Name | Slug | Annual | Monthly Equiv | Savings |
|---|---|---|---|---|
| Recruiter Pro Annual | `recruiter-pro-annual` | **$990/yr** | $82.50/mo | $198/yr |
| Recruiter Team Annual | `recruiter-team-annual` | **$2,990/yr** | $249.17/mo | $598/yr |
| Recruiter AI Annual | `recruiter-ai-annual` | **$3,990/yr** | $332.50/mo | $798/yr |

### Stripe Setup

| Env Var | Slug | Amount | Interval |
|---------|------|--------|----------|
| `STRIPE_RECRUITER_PRO_PRICE_ID` | `recruiter-pro` | $99 | month |
| `STRIPE_RECRUITER_TEAM_PRICE_ID` | `recruiter-team` | $299 | month |
| `STRIPE_RECRUITER_AI_PRICE_ID` | `recruiter-ai` | $399 | month |
| `STRIPE_RECRUITER_PRO_ANNUAL_PRICE_ID` | `recruiter-pro-annual` | $990 | year |
| `STRIPE_RECRUITER_TEAM_ANNUAL_PRICE_ID` | `recruiter-team-annual` | $2,990 | year |
| `STRIPE_RECRUITER_AI_ANNUAL_PRICE_ID` | `recruiter-ai-annual` | $3,990 | year |

**Migration note:** Old `STRIPE_PRO_PRICE_ID` ($9.99), `STRIPE_TEAM_PRICE_ID` ($29.99) archived. Existing subscribers need migration path.

---

## Spec C: Schools B2B Subscriptions

Annual billing only (B2B sales cycle).

| Product Name | Slug | Annual | Features |
|---|---|---|---|
| School Small | `school-small` | **$1,500/yr** | Browse tournaments, 5 registrations/yr, roster submit, schedule viewing, email notifications, Dashr at full price |
| School Medium | `school-medium` | **$2,500/yr** | + 15 registrations/yr, enter live scores, PDF downloads, current season archive, in-app notifications, Dashr 10% discount |
| School Large | `school-large` | **$3,500/yr** | + Unlimited registrations, tournament analytics, all-season archive, performance-to-profile sync, SMS notifications, Dashr 20% discount |

### Stripe Setup

| Env Var | Slug | Amount | Interval |
|---------|------|--------|----------|
| `STRIPE_SCHOOL_SMALL_PRICE_ID` | `school-small` | $1,500 | year |
| `STRIPE_SCHOOL_MEDIUM_PRICE_ID` | `school-medium` | $2,500 | year |
| `STRIPE_SCHOOL_LARGE_PRICE_ID` | `school-large` | $3,500 | year |
| `STRIPE_SMS_OVERAGE_PRICE_ID` | metered | $0.03/msg | usage-based |

### Dashr Discount Coupons

| Coupon | Discount | Applies To |
|--------|----------|-----------|
| `SCHOOL_MEDIUM_DASHR_10` | 10% off | School Medium tier |
| `SCHOOL_LARGE_DASHR_20` | 20% off | School Large tier |

---

## Spec D: Tournament/Events

### Club Organizer Pricing (one-time per-event)

| Product Name | Slug | Price | Team Cap | Features |
|---|---|---|---|---|
| Basic Event | `event-basic` | **$99** | 16 teams | Registration, manual scheduling, basic bracket, payment collection |
| Standard Event | `event-standard` | **$249** | 32 teams | + Auto-bracket, field assignments, live scoring, standings |
| Premium Event | `event-premium` | **$499** | 64 teams | + Public discovery (SEO), game stats, notifications, athlete profile sync, Dashr integration |

### School Registration Fees

- Entry fee set by organizer (stored in `tournaments.entry_fee_cents`)
- Uses **Stripe Payment Intents** (dynamic amount), NOT Checkout Sessions
- Platform Fee: 5% (`tournaments.platform_fee_rate` = 0.050)

### Stripe Setup

| Env Var | Slug | Amount | Mode |
|---------|------|--------|------|
| `STRIPE_EVENT_BASIC_PRICE_ID` | `event-basic` | $99 | `payment` |
| `STRIPE_EVENT_STANDARD_PRICE_ID` | `event-standard` | $249 | `payment` |
| `STRIPE_EVENT_PREMIUM_PRICE_ID` | `event-premium` | $499 | `payment` |

---

## Spec E: Dashr Combines & Training

| Product Name | Slug | Price | Category |
|---|---|---|---|
| Dashr Standard Combine | `dashr-standard` | **$149** | Combine |
| Dashr AI-Verified Combine | `dashr-ai` | **$199** | Combine |
| Dashr Combine Blueprint | `dashr-blueprint` | **$79.99** | Training |
| Dashr Position Clinic | `dashr-clinic` | **$99** | Training |
| Dashr Multi-Day Intensive | `dashr-intensive` | **$149/day** | Training |

### Stripe Setup

| Env Var | Slug | Amount | Mode | Notes |
|---------|------|--------|------|-------|
| `STRIPE_DASHR_STANDARD_PRICE_ID` | `dashr-standard` | $149 | `payment` | — |
| `STRIPE_DASHR_AI_PRICE_ID` | `dashr-ai` | $199 | `payment` | — |
| `STRIPE_DASHR_BLUEPRINT_PRICE_ID` | `dashr-blueprint` | $79.99 | `payment` | — |
| `STRIPE_DASHR_CLINIC_PRICE_ID` | `dashr-clinic` | $99 | `payment` | — |
| `STRIPE_DASHR_INTENSIVE_PRICE_ID` | `dashr-intensive` | $149 | `payment` | `quantity = N` (days) |

---

## Spec F: Parent Portal

**Pricing: FREE** (bundled with athlete subscription). No Stripe products needed. Parent accesses dashboard via `parent_links` table.

---

## Complete Env Var Reference

```bash
# ── Existing (keep for legacy subscribers) ──
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRO_PRICE_ID=price_xxx          # LEGACY $9.99/mo
STRIPE_TEAM_PRICE_ID=price_xxx         # LEGACY $29.99/mo
STRIPE_SCOUT_PRICE_ID=price_xxx        # Scout — mailto flow

# ── Spec A: Athlete Subscriptions (4 prices) ──
STRIPE_ATHLETE_PREMIUM_PRICE_ID=price_xxx           # $14.99/mo
STRIPE_ATHLETE_PRO_PRICE_ID=price_xxx               # $59.99/mo
STRIPE_ATHLETE_PREMIUM_ANNUAL_PRICE_ID=price_xxx    # $149.90/yr
STRIPE_ATHLETE_PRO_ANNUAL_PRICE_ID=price_xxx        # $599.90/yr

# ── Spec B: Recruiter Subscriptions (6 prices) ──
STRIPE_RECRUITER_PRO_PRICE_ID=price_xxx             # $99/mo
STRIPE_RECRUITER_TEAM_PRICE_ID=price_xxx            # $299/mo
STRIPE_RECRUITER_AI_PRICE_ID=price_xxx              # $399/mo
STRIPE_RECRUITER_PRO_ANNUAL_PRICE_ID=price_xxx      # $990/yr
STRIPE_RECRUITER_TEAM_ANNUAL_PRICE_ID=price_xxx     # $2,990/yr
STRIPE_RECRUITER_AI_ANNUAL_PRICE_ID=price_xxx       # $3,990/yr

# ── Spec C: Schools B2B (3 prices + 1 metered) ──
STRIPE_SCHOOL_SMALL_PRICE_ID=price_xxx              # $1,500/yr
STRIPE_SCHOOL_MEDIUM_PRICE_ID=price_xxx             # $2,500/yr
STRIPE_SCHOOL_LARGE_PRICE_ID=price_xxx              # $3,500/yr
STRIPE_SMS_OVERAGE_PRICE_ID=price_xxx               # $0.03/msg metered

# ── Spec D: Tournament Events (3 prices) ──
STRIPE_EVENT_BASIC_PRICE_ID=price_xxx               # $99 one-time
STRIPE_EVENT_STANDARD_PRICE_ID=price_xxx            # $249 one-time
STRIPE_EVENT_PREMIUM_PRICE_ID=price_xxx             # $499 one-time

# ── Spec E: Dashr Combines (5 prices) ──
STRIPE_DASHR_STANDARD_PRICE_ID=price_xxx            # $149 one-time
STRIPE_DASHR_AI_PRICE_ID=price_xxx                  # $199 one-time
STRIPE_DASHR_BLUEPRINT_PRICE_ID=price_xxx           # $79.99 one-time
STRIPE_DASHR_CLINIC_PRICE_ID=price_xxx              # $99 one-time
STRIPE_DASHR_INTENSIVE_PRICE_ID=price_xxx           # $149/day one-time
```

---

## Checkout Flow Patterns

### Pattern 1: Subscriptions (Specs A, B, C)
`createCheckoutSession(planSlug)` → `mode: 'subscription'`

### Pattern 2: One-Time Payments (Specs D organizer, E)
`createOneTimeCheckout(productSlug, quantity?)` → `mode: 'payment'`

### Pattern 3: Variable Amount (Tournament Registration Fees)
`createRegistrationPayment(tournamentId, schoolId)` → `stripe.paymentIntents.create()`

### Pattern 4: Metered SMS (School Large only)
`stripe.subscriptionItems.createUsageRecord()` → billed at $0.03/msg

---

## Revenue Model Summary

| Revenue Stream | Type | Expected Range |
|---|---|---|
| Athlete subs | Recurring monthly/annual | $14.99–$59.99/mo per athlete |
| Recruiter subs | Recurring monthly/annual | $99–$399/mo per recruiter |
| School subs | Recurring annual | $1,500–$3,500/yr per school |
| Event tier fees | One-time per event | $99–$499 per tournament |
| Registration platform fees | 5% of entry fees | Variable |
| Dashr combines | One-time per event | $79.99–$199 per athlete |
| SMS overage | Metered usage | $0.03/msg |
