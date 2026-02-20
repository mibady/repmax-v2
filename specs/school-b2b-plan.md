# Spec C: Schools B2B Subscriptions

Annual subscriptions for schools, teams, and coaches. B2B sales cycle — annual billing only.

## Pricing Tiers

| Product Name | Slug | Annual | Features |
|---|---|---|---|
| School Small | `school-small` | **$1,500/yr** | Browse tournaments, 5 registrations/yr, roster submit, schedule/bracket/live score viewing, email notifications, Dashr at tournaments (full price) |
| School Medium | `school-medium` | **$2,500/yr** | Everything in Small + 15 registrations/yr, enter live scores, download schedule PDF, current season archive, email + in-app notifications, Dashr 10% discount |
| School Large | `school-large` | **$3,500/yr** | Everything in Medium + unlimited registrations, tournament performance analytics, all-season archive, performance-to-profile sync, email + in-app + SMS notifications, Dashr 20% discount |

## Stripe Setup

| Env Var | Slug | Amount | Interval |
|---------|------|--------|----------|
| `STRIPE_SCHOOL_SMALL_PRICE_ID` | `school-small` | $1,500 | year |
| `STRIPE_SCHOOL_MEDIUM_PRICE_ID` | `school-medium` | $2,500 | year |
| `STRIPE_SCHOOL_LARGE_PRICE_ID` | `school-large` | $3,500 | year |

**Stripe product metadata:** `{ target_role: "school", tier: "small|medium|large" }`

## SMS Credits (School Large only)

- **Provider cost:** ~$0.008/msg (Twilio US)
- **End-user charge:** **$0.03/msg** (3.75x markup)
- **Implementation:** Metered billing via Stripe
- **Env var:** `STRIPE_SMS_OVERAGE_PRICE_ID` (metered, usage-based)
- Alternative: Bundle 500 SMS/yr into $3,500 price, charge $0.03/msg overage

## Dashr Discount Coupons

Create Stripe coupons (percentage off) applied at checkout when a school books Dashr services:

| Coupon | Discount | Applies To |
|--------|----------|-----------|
| `SCHOOL_MEDIUM_DASHR_10` | 10% off | School Medium tier |
| `SCHOOL_LARGE_DASHR_20` | 20% off | School Large tier |

## Feature Comparison

| Feature | Small | Medium | Large |
|---------|-------|--------|-------|
| Browse tournaments | Yes | Yes | Yes |
| Registrations/yr | 5 | 15 | Unlimited |
| Roster submit | Yes | Yes | Yes |
| Schedule/bracket viewing | Yes | Yes | Yes |
| Enter live scores | No | Yes | Yes |
| Download PDF | No | Yes | Yes |
| Season archive | No | Current | All seasons |
| Performance analytics | No | No | Yes |
| Profile sync | No | No | Yes |
| Email notifications | Yes | Yes | Yes |
| In-app notifications | No | Yes | Yes |
| SMS notifications | No | No | Yes |
| Dashr discount | 0% | 10% | 20% |
