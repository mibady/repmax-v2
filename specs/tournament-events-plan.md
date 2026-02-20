# Spec D: Tournament/Events

Per-event pricing for club organizers + variable registration fees for school participants.

## Club Organizer Pricing (one-time per-event)

| Product Name | Slug | Price | Team Cap | Features |
|---|---|---|---|---|
| Basic Event | `event-basic` | **$99** | 16 teams | Registration, manual scheduling, basic bracket, payment collection |
| Standard Event | `event-standard` | **$249** | 32 teams | + Auto-bracket, field assignments, live scoring, standings |
| Premium Event | `event-premium` | **$499** | 64 teams | + Public discovery (SEO), game stats, notifications, athlete profile sync, Dashr integration |

## Stripe Setup (Organizer)

| Env Var | Slug | Amount | Mode |
|---------|------|--------|------|
| `STRIPE_EVENT_BASIC_PRICE_ID` | `event-basic` | $99 | `payment` (one-time) |
| `STRIPE_EVENT_STANDARD_PRICE_ID` | `event-standard` | $249 | `payment` (one-time) |
| `STRIPE_EVENT_PREMIUM_PRICE_ID` | `event-premium` | $499 | `payment` (one-time) |

**Stripe product metadata:** `{ type: "event_tier" }`

## School Registration Fees (variable per-tournament)

- Entry fee set by organizer (stored in `tournaments.entry_fee_cents`)
- Uses **Stripe Payment Intents** (dynamic amount), NOT Checkout Sessions with fixed prices
- No fixed Stripe Price object needed — amount varies per tournament

## Platform Fee: 5% (Ledger Model)

- Collect full registration amount from school
- Track 5% platform fee internally in `tournament_registrations.platform_fee_cents`
- Pay out organizer's share manually (or via Stripe Transfer later)
- Default rate stored on `tournaments.platform_fee_rate` (0.050), negotiable per organizer
- **No Stripe Connect required for MVP**

## Checkout Flow

### Organizer: One-Time Payment
```
Organizer selects event tier → createOneTimeCheckout('event-standard')
  → getPriceId('event-standard') → env var lookup
  → stripe.checkout.sessions.create({ mode: 'payment', ... })
  → Webhook: checkout.session.completed (mode=payment) → mark event as paid
```

### School: Variable Registration Payment
```
School registers for tournament → createRegistrationPayment(tournamentId, schoolId)
  → Read tournament.entry_fee_cents from DB
  → Calculate platform_fee_cents = Math.round(entry_fee_cents * platform_fee_rate)
  → stripe.paymentIntents.create({ amount: entry_fee_cents, metadata: {...} })
  → On success: update tournament_registrations.payment_status = 'paid'
```

## Feature Comparison

| Feature | Basic | Standard | Premium |
|---------|-------|----------|---------|
| Team cap | 16 | 32 | 64 |
| Registration | Yes | Yes | Yes |
| Payment collection | Yes | Yes | Yes |
| Manual scheduling | Yes | Yes | Yes |
| Basic bracket | Yes | Yes | Yes |
| Auto-bracket | No | Yes | Yes |
| Field assignments | No | Yes | Yes |
| Live scoring | No | Yes | Yes |
| Standings | No | Yes | Yes |
| Public discovery (SEO) | No | No | Yes |
| Game stats | No | No | Yes |
| Notifications | No | No | Yes |
| Athlete profile sync | No | No | Yes |
| Dashr integration | No | No | Yes |
