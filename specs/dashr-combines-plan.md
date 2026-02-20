# Spec E: Dashr Combines & Training

One-time per-event payments for combine assessments and training clinics.

## Products

| Product Name | Slug | Price | Category | Description |
|---|---|---|---|---|
| Dashr Standard Combine | `dashr-standard` | **$149** | Combine | 3-hr assessment: Dashr laser timing, 40yd w/ splits, pro agility, 3-cone, vert, broad jump, results to profile, certificate |
| Dashr AI-Verified Combine | `dashr-ai` | **$199** | Combine | Everything in Standard + AI skeletal tracking, force-velocity profiling, biomechanical analysis, slow-mo video, elite comparison, PDF report, 30-day training plan, leaderboard |
| Dashr Combine Blueprint | `dashr-blueprint` | **$79.99** | Training | 3-hr technique training, Dashr timing baseline + final, position drills, individual coaching, before/after comparison |
| Dashr Position Clinic | `dashr-clinic` | **$99** | Training | Sport-specific: DB reactive agility, RB acceleration, OL/DL power start, basketball RAT, track flying sprint, baseball base stealing |
| Dashr Multi-Day Intensive | `dashr-intensive` | **$149/day** | Training | Daily Dashr tracking, progressive monitoring, personalized adjustments, force-velocity development. **Quantity = days** |

## Stripe Setup

| Env Var | Slug | Amount | Mode | Notes |
|---------|------|--------|------|-------|
| `STRIPE_DASHR_STANDARD_PRICE_ID` | `dashr-standard` | $149 | `payment` | — |
| `STRIPE_DASHR_AI_PRICE_ID` | `dashr-ai` | $199 | `payment` | — |
| `STRIPE_DASHR_BLUEPRINT_PRICE_ID` | `dashr-blueprint` | $79.99 | `payment` | — |
| `STRIPE_DASHR_CLINIC_PRICE_ID` | `dashr-clinic` | $99 | `payment` | — |
| `STRIPE_DASHR_INTENSIVE_PRICE_ID` | `dashr-intensive` | $149 | `payment` | `quantity = N` (days) |

**Stripe product metadata:** `{ type: "dashr", category: "combine|training" }`

## Stripe Dashboard Organization

- Product: "Dashr Standard Combine" → $149
- Product: "Dashr AI-Verified Combine" → $199
- Product: "Dashr Combine Blueprint" → $79.99
- Product: "Dashr Position Clinic" → $99
- Product: "Dashr Multi-Day Intensive" → $149 (per unit/day)

## Checkout Flow

```
User selects Dashr product → createOneTimeCheckout('dashr-ai')
  → getPriceId('dashr-ai') → env var lookup
  → stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { profile_id, product_type: 'dashr', reference_id }
    })
  → Webhook: checkout.session.completed (mode=payment)
    → Insert into dashr_registrations table
```

For Multi-Day Intensive, `quantity` = number of days selected by user.

## School Discount Integration

Schools on Medium or Large B2B plans get Dashr discounts applied at checkout:

| School Tier | Coupon Code | Discount |
|-------------|-------------|----------|
| Medium | `SCHOOL_MEDIUM_DASHR_10` | 10% off |
| Large | `SCHOOL_LARGE_DASHR_20` | 20% off |

Applied via `stripe.checkout.sessions.create({ discounts: [{ coupon: couponId }] })`.
