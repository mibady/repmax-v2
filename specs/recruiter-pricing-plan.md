# Spec B: Recruiter Subscriptions

4-tier recruiter subscription model replacing legacy Starter/Pro/Team/Scout pricing.

## Monthly Billing

| Product Name | Slug | Monthly | Features |
|---|---|---|---|
| Recruiter Free | `recruiter-free` | **$0** (no Stripe) | Basic access, 10 searches/day, public profiles only |
| Recruiter Pro | `recruiter-pro` | **$99** | Full player database, unlimited search, advanced metrics, export CSV, 50 messages/mo |
| Recruiter Team | `recruiter-team` | **$299** | Everything in Pro + 5 seats, shared watchlists, collaboration tools, pipeline management, unlimited messages, priority support |
| Recruiter AI Analytics | `recruiter-ai` | **$399** | Everything in Team + AI scouting reports, predictive analytics, custom reporting, API access, dedicated account manager |

## Annual Billing (2 months free = ~17% discount)

| Product Name | Slug | Annual | Monthly Equiv | Savings |
|---|---|---|---|---|
| Recruiter Pro Annual | `recruiter-pro-annual` | **$990/yr** | $82.50/mo | $198/yr |
| Recruiter Team Annual | `recruiter-team-annual` | **$2,990/yr** | $249.17/mo | $598/yr |
| Recruiter AI Annual | `recruiter-ai-annual` | **$3,990/yr** | $332.50/mo | $798/yr |

## Stripe Setup

| Env Var | Slug | Amount | Interval |
|---------|------|--------|----------|
| `STRIPE_RECRUITER_PRO_PRICE_ID` | `recruiter-pro` | $99 | month |
| `STRIPE_RECRUITER_TEAM_PRICE_ID` | `recruiter-team` | $299 | month |
| `STRIPE_RECRUITER_AI_PRICE_ID` | `recruiter-ai` | $399 | month |
| `STRIPE_RECRUITER_PRO_ANNUAL_PRICE_ID` | `recruiter-pro-annual` | $990 | year |
| `STRIPE_RECRUITER_TEAM_ANNUAL_PRICE_ID` | `recruiter-team-annual` | $2,990 | year |
| `STRIPE_RECRUITER_AI_ANNUAL_PRICE_ID` | `recruiter-ai-annual` | $3,990 | year |

**Stripe product metadata:** `{ target_role: "recruiter", tier: "pro|team|ai" }`

## Stripe Dashboard Organization

- Product: "RepMax Recruiter Pro" → Monthly ($99), Annual ($990)
- Product: "RepMax Recruiter Team" → Monthly ($299), Annual ($2,990)
- Product: "RepMax Recruiter AI Analytics" → Monthly ($399), Annual ($3,990)

## Migration Notes

- Old `STRIPE_PRO_PRICE_ID` ($9.99/mo) → **archive** in Stripe (not delete)
- Old `STRIPE_TEAM_PRICE_ID` ($29.99/mo) → **archive** in Stripe (not delete)
- Existing subscribers on old plans continue until migration
- New env vars above replace the legacy mappings for new sign-ups

## Feature Comparison

| Feature | Free | Pro | Team | AI |
|---------|------|-----|------|----|
| Search queries | 10/day | Unlimited | Unlimited | Unlimited |
| Player database | Public only | Full | Full | Full |
| Advanced metrics | No | Yes | Yes | Yes |
| CSV export | No | Yes | Yes | Yes |
| Messages | 0 | 50/mo | Unlimited | Unlimited |
| Team seats | 1 | 1 | 5 | 5 |
| Shared watchlists | No | No | Yes | Yes |
| Pipeline management | No | No | Yes | Yes |
| AI scouting reports | No | No | No | Yes |
| Predictive analytics | No | No | No | Yes |
| API access | No | No | No | Yes |
| Custom reporting | No | No | No | Yes |
| Account manager | No | No | Priority support | Dedicated |
