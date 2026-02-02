# Tapstead Platform - Team Briefing Document

## For Redesign & Streamlining Initiative

---

# EXECUTIVE SUMMARY

**Tapstead** is a home services marketplace connecting customers with vetted service providers. The platform handles instant booking for house cleaning and quote-based requests for 11 other service categories.

**Production URL:** tapstead.com
**AI Phone Line:** (360) 641-7386
**Tech Stack:** Next.js 15, TypeScript, Stripe, Clerk Auth, AI (OpenAI + Anthropic)

---

# PART 1: USER TYPES

## 1.1 Customers (Primary Users)

- Homeowners/renters needing home services
- Can book cleaning instantly or request quotes for other services
- Manage subscriptions, payments, and service history

## 1.2 Service Providers ("Pros")

- Verified contractors and cleaning professionals
- Apply through onboarding flow, pass background checks
- Receive bookings, manage schedule, get paid via Stripe Connect

## 1.3 Administrators

- Internal staff managing platform operations
- Review provider applications, monitor analytics, handle escalations

---

# PART 2: COMPLETE USER JOURNEYS

## 2.1 CUSTOMER JOURNEY: House Cleaning (Instant Booking)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CUSTOMER - CLEANING BOOKING FLOW                  │
└─────────────────────────────────────────────────────────────────────┘

DISCOVERY
    │
    ├─→ [Homepage] ─→ See value prop, services, testimonials
    │
    ├─→ [/services] ─→ Browse service categories
    │
    └─→ [/services/house-cleaning] ─→ Service details & pricing

BOOKING (60-second flow)
    │
    └─→ [/book-now]
         │
         ├─ Step 1: SELECT SERVICE
         │    • Choose tier: Small ($149) / Medium ($199) / Large ($299)
         │    • Choose frequency: One-time / Weekly / Bi-weekly / Monthly
         │    • Add-ons: Deep Clean (+$75), Move-in/out (+$99)
         │    • See real-time price calculation
         │
         ├─ Step 2: ENTER DETAILS
         │    • Service address
         │    • Preferred date & time
         │    • Special instructions
         │
         ├─ Step 3: ACCOUNT
         │    • Sign up or sign in (Clerk)
         │    • Phone number verification
         │
         ├─ Step 4: PAYMENT
         │    • Enter payment method (Stripe)
         │    • Review final price with any surcharges
         │    • Weekend (+10%) / Same-day (+15%)
         │
         └─ Step 5: CONFIRMATION
              • Booking confirmed instantly
              • Provider assigned automatically
              • Provider name, phone, photo shown
              • Confirmation email sent

POST-BOOKING
    │
    ├─→ [/dashboard/bookings] ─→ View booking status
    │
    ├─→ [/dashboard/bookings/[id]] ─→ Full booking details
    │    • Service type, date/time, address
    │    • Provider info (name, phone, email)
    │    • Payment summary
    │    • Actions: Reschedule, Contact Support
    │
    ├─→ [Service Completed] ─→ Leave review (1-5 stars + comment)
    │
    └─→ [/dashboard/subscription] ─→ Manage recurring bookings
         • Pause/Resume subscription
         • Change frequency
         • Cancel subscription
```

---

## 2.2 CUSTOMER JOURNEY: Quote-Based Services

```
┌─────────────────────────────────────────────────────────────────────┐
│               CUSTOMER - QUOTE REQUEST FLOW (Non-Cleaning)           │
└─────────────────────────────────────────────────────────────────────┘

DISCOVERY
    │
    └─→ [/services/[service-type]]
         • handyman, plumbing, electrical, painting
         • pressure-washing, gutter-services, junk-removal
         • welding, storm-damage-cleanup, fire-debris-removal
         • emergency-disaster-cleanup

QUOTE REQUEST
    │
    └─→ [Quote Form on service page]
         │
         ├─ Service type (pre-selected)
         ├─ Problem description
         ├─ Upload photos (optional)
         ├─ Service address
         ├─ Preferred contact method
         ├─ Urgency level
         │
         └─→ [Submit] ─→ "We'll call within 2 hours"

FOLLOW-UP
    │
    ├─→ Phone call from Tapstead team
    ├─→ Quote provided
    ├─→ If accepted → Booking created
    └─→ Track in dashboard
```

---

## 2.3 CUSTOMER JOURNEY: AI Voice Booking

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CUSTOMER - PHONE BOOKING FLOW                     │
└─────────────────────────────────────────────────────────────────────┘

INITIATION
    │
    └─→ Call (360) 641-7386
         │
         └─→ [Retell AI Booking Agent]
              │
              ├─ Greets customer
              ├─ Asks: "What service do you need?"
              │
              ├─ [If Cleaning]
              │    ├─ Collects: home size, bedrooms, frequency
              │    ├─ Calculates price in real-time
              │    ├─ Checks provider availability (Cal.com)
              │    ├─ Collects: address, date/time, contact info
              │    ├─ Processes payment (if returning customer)
              │    └─ Confirms booking, sends SMS/email
              │
              └─ [If Other Service]
                   ├─ Collects problem details
                   ├─ Creates quote request
                   └─ Promises callback within 2 hours
```

---

## 2.4 CUSTOMER JOURNEY: Support & Issues

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CUSTOMER - SUPPORT FLOW                           │
└─────────────────────────────────────────────────────────────────────┘

ENTRY POINTS
    │
    ├─→ [/support] ─→ FAQ & help center
    │
    ├─→ [Dashboard] ─→ "Contact Support" on booking
    │
    ├─→ [Phone] ─→ AI Support Agent
    │
    └─→ [/contact] ─→ Contact form

ISSUE TYPES
    │
    ├─ RESCHEDULE
    │    └─→ Dashboard → Booking → Reschedule button
    │         • Select new date/time
    │         • Confirmation sent
    │
    ├─ CANCEL
    │    └─→ Dashboard → Booking → Cancel
    │         • Cancellation policy shown
    │         • Refund processed if eligible
    │
    ├─ COMPLAINT
    │    └─→ Support ticket created
    │         • Priority assigned
    │         • AI or human agent responds
    │         • Resolution tracked
    │
    └─ PAYMENT ISSUE
         └─→ Dashboard → Payments → Contact Support
              • Dispute handling via Stripe
```

---

## 2.5 PROVIDER JOURNEY: Onboarding

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PROVIDER - ONBOARDING FLOW                        │
└─────────────────────────────────────────────────────────────────────┘

DISCOVERY
    │
    └─→ [/become-pro]
         • Benefits overview
         • Earnings potential
         • Requirements listed

APPLICATION
    │
    └─→ [/become-pro/application]
         │
         ├─ Step 1: PERSONAL INFO
         │    • Name, email, phone
         │    • Address
         │
         ├─ Step 2: SERVICES
         │    • Select service types (multi-select)
         │    • Years of experience
         │    • Service area radius
         │
         ├─ Step 3: CREDENTIALS
         │    • Business license (upload)
         │    • Insurance certificate (upload)
         │    • Certifications (if applicable)
         │
         ├─ Step 4: BACKGROUND CHECK
         │    • Consent to Checkr screening
         │    • Identity verification
         │
         └─→ [Submit] ─→ [/become-pro/application/success]
              • "Application received"
              • "We'll review within 48 hours"

REVIEW (Admin Side)
    │
    └─→ [/admin/applications]
         • Admin reviews application
         • Verifies documents
         • Checks background report
         • Decision: Approve / Reject

APPROVAL
    │
    └─→ Email notification to provider
         │
         └─→ [/provider/stripe/...] ─→ Stripe Connect setup
              • Link bank account
              • Complete identity verification
              • Payout preferences
```

---

## 2.6 PROVIDER JOURNEY: Daily Operations

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PROVIDER - DAILY WORKFLOW                         │
└─────────────────────────────────────────────────────────────────────┘

LOGIN
    │
    └─→ [/provider] ─→ Provider Dashboard

DASHBOARD VIEW
    │
    ├─ TODAY'S SCHEDULE
    │    • Upcoming bookings
    │    • Customer details
    │    • Service addresses
    │    • Special instructions
    │
    ├─ EARNINGS
    │    • Today's earnings
    │    • This week/month
    │    • Pending payouts
    │
    └─ NOTIFICATIONS
         • New booking assigned
         • Schedule changes
         • Customer messages

BOOKING MANAGEMENT
    │
    ├─→ View assigned booking
    │    • Customer name, phone, address
    │    • Service type & details
    │    • Time slot
    │
    ├─→ Navigate to location (Google Maps link)
    │
    ├─→ Mark as "In Progress"
    │    • Updates tracking for customer
    │
    ├─→ Complete service
    │    • Mark as "Completed"
    │    • Payment processed automatically
    │
    └─→ Payout arrives (Stripe Connect schedule)

SCHEDULE MANAGEMENT
    │
    └─→ [Cal.com Integration]
         • Set availability windows
         • Block time off
         • Sync with personal calendar
```

---

## 2.7 ADMIN JOURNEY

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ADMIN - DAILY WORKFLOW                            │
└─────────────────────────────────────────────────────────────────────┘

LOGIN
    │
    └─→ [/admin] ─→ Admin Dashboard

PROVIDER APPLICATIONS
    │
    └─→ [/admin/applications]
         │
         ├─ View pending applications
         │    • Provider name, services, date applied
         │    • Status: Pending / Under Review / Approved / Rejected
         │
         ├─ Review application
         │    • Check documents
         │    • Verify background check (Checkr)
         │    • Read experience & credentials
         │
         └─ Take action
              • Approve → Provider activated
              • Reject → Rejection email sent

ANALYTICS
    │
    └─→ [/admin/analytics]
         • Booking volume (daily/weekly/monthly)
         • Revenue metrics
         • Customer acquisition
         • Provider performance
         • Service category breakdown

MARKETING
    │
    └─→ [/admin/marketing]
         • Campaign management
         • Promotions & discounts
         • Customer segments

SUPPORT ESCALATIONS
    │
    └─→ [Support Ticket Dashboard]
         • High-priority tickets
         • Unresolved complaints
         • Refund requests
```

---

# PART 3: COMPLETE FEATURE LIST BY AREA

## 3.1 PUBLIC WEBSITE

| Page               | URL                                    | Features                                                              |
| ------------------ | -------------------------------------- | --------------------------------------------------------------------- |
| Homepage           | `/`                                    | Hero, service grid, how-it-works, testimonials, pricing preview, CTAs |
| Services Directory | `/services`                            | All 12 service categories with icons/descriptions                     |
| House Cleaning     | `/services/house-cleaning`             | Pricing tiers, frequency options, booking CTA                         |
| Handyman           | `/services/handyman`                   | Service description, quote CTA                                        |
| Plumbing           | `/services/plumbing`                   | Service description, quote CTA                                        |
| Electrical         | `/services/electrical`                 | Service description, quote CTA                                        |
| Painting           | `/services/painting`                   | Service description, quote CTA                                        |
| Pressure Washing   | `/services/pressure-washing`           | Service description, quote CTA                                        |
| Gutter Services    | `/services/gutter-services`            | Service description, quote CTA                                        |
| Junk Removal       | `/services/junk-removal`               | Service description, quote CTA                                        |
| Welding            | `/services/welding`                    | Service description, quote CTA                                        |
| Storm Damage       | `/services/storm-damage-cleanup`       | Emergency service, quote CTA                                          |
| Fire Debris        | `/services/fire-debris-removal`        | Emergency service, quote CTA                                          |
| Emergency Disaster | `/services/emergency-disaster-cleanup` | 24/7 emergency, quote CTA                                             |
| Pricing            | `/pricing`                             | Full pricing breakdown, comparison table                              |
| How It Works       | `/how-it-works`                        | 3-step process explained                                              |
| About              | `/about`                               | Company story, mission, values                                        |
| Contact            | `/contact`                             | Contact form, phone, email, address                                   |
| Emergency          | `/emergency`                           | 24/7 availability, fast response                                      |
| Support/FAQ        | `/support`                             | Help articles, common questions                                       |
| Blog               | `/blog`                                | Tips, guides, content                                                 |
| Careers            | `/careers`                             | Job listings, culture                                                 |
| Become a Pro       | `/become-pro`                          | Provider recruitment landing                                          |
| Privacy Policy     | `/privacy`                             | Legal                                                                 |
| Terms of Service   | `/terms`                               | Legal                                                                 |
| Cookie Policy      | `/cookies`                             | Legal                                                                 |
| Press              | `/press`                               | Media kit                                                             |

---

## 3.2 BOOKING SYSTEM

### Instant Booking (House Cleaning)

| Feature                | Description                                  |
| ---------------------- | -------------------------------------------- |
| Tier Selection         | Small/Medium/Large with bedroom count        |
| Frequency Selection    | One-time, Weekly, Bi-weekly, Monthly         |
| Add-ons                | Deep Clean (+$75), Move-in/out (+$99)        |
| Real-time Pricing      | Price updates as options change              |
| Subscription Discounts | 33%/27%/20% for recurring                    |
| Weekend Surcharge      | +10% for Sat/Sun                             |
| Same-day Surcharge     | +15% for same-day booking                    |
| Address Input          | Service location with validation             |
| Date/Time Selection    | Calendar + time slots                        |
| Provider Matching      | Auto-assign based on availability & location |
| Instant Confirmation   | No waiting, immediate booking                |
| Provider Details       | Name, photo, phone shown on confirmation     |

### Quote Requests (Other Services)

| Feature             | Description                   |
| ------------------- | ----------------------------- |
| Service Selection   | 11 non-cleaning categories    |
| Problem Description | Free text field               |
| Photo Upload        | Optional images of issue      |
| Urgency Level       | Standard / Urgent / Emergency |
| Contact Preferences | Phone / Email / Text          |
| 2-Hour Response     | Promised callback window      |

---

## 3.3 CUSTOMER DASHBOARD

| Section         | Features                                                |
| --------------- | ------------------------------------------------------- |
| Overview        | Upcoming bookings, recent activity, quick actions       |
| Bookings List   | All bookings with status filters, search, pagination    |
| Booking Details | Full info, provider contact, reschedule, cancel, review |
| Payments        | Saved payment methods, billing history, update card     |
| Subscriptions   | Active plans, pause/resume, change frequency, cancel    |
| Settings        | Profile info, addresses, notification preferences       |

---

## 3.4 PROVIDER DASHBOARD

| Section        | Features                                           |
| -------------- | -------------------------------------------------- |
| Overview       | Today's bookings, earnings snapshot, notifications |
| Schedule       | Calendar view, assigned bookings, availability     |
| Earnings       | Daily/weekly/monthly totals, payout history        |
| Bookings       | List of assigned jobs with customer details        |
| Profile        | Service areas, services offered, credentials       |
| Stripe Connect | Bank account, payout settings, earnings            |

---

## 3.5 ADMIN PANEL

| Section      | Features                                           |
| ------------ | -------------------------------------------------- |
| Dashboard    | Platform stats, system health, alerts              |
| Applications | Provider application queue, review, approve/reject |
| Analytics    | Booking trends, revenue, customer metrics          |
| Marketing    | Campaign management, promotions                    |

---

## 3.6 AI CAPABILITIES

| Agent            | Trigger          | Capabilities                                                               |
| ---------------- | ---------------- | -------------------------------------------------------------------------- |
| Booking Agent    | Phone call, chat | Collect preferences, calculate pricing, check availability, create booking |
| Support Agent    | Phone call, chat | Handle modifications, cancellations, complaints, refunds                   |
| Recruiting Agent | Phone screening  | Interview providers, collect info, assess fit                              |
| Analytics Agent  | Admin queries    | Generate reports, answer business questions                                |

---

## 3.7 COMMUNICATION SYSTEM

| Channel        | Use Cases                                             |
| -------------- | ----------------------------------------------------- |
| Email (Resend) | Booking confirmations, receipts, reminders, marketing |
| Voice (Retell) | AI booking, support calls, provider screening         |
| SMS            | Appointment reminders, provider ETA                   |
| In-app         | Dashboard notifications                               |

---

## 3.8 PAYMENT SYSTEM (Stripe)

| Feature           | Description                     |
| ----------------- | ------------------------------- |
| One-time Payments | Single booking checkout         |
| Subscriptions     | Recurring cleaning plans        |
| Payment Methods   | Credit/debit cards, saved cards |
| Stripe Connect    | Provider payouts to bank        |
| Refunds           | Automated for cancellations     |
| Invoices          | PDF generation                  |

---

# PART 4: PRICING STRUCTURE

## House Cleaning

| Tier   | Bedrooms | Base Price |
| ------ | -------- | ---------- |
| Small  | 1-2      | $149       |
| Medium | 3-4      | $199       |
| Large  | 5+       | $299       |

## Subscription Discounts

| Frequency | Discount | Small | Medium | Large |
| --------- | -------- | ----- | ------ | ----- |
| One-time  | 0%       | $149  | $199   | $299  |
| Monthly   | 20%      | $119  | $159   | $239  |
| Bi-weekly | 27%      | $109  | $145   | $218  |
| Weekly    | 33%      | $100  | $133   | $200  |

## Add-ons

| Add-on      | Price |
| ----------- | ----- |
| Deep Clean  | +$75  |
| Move-in/out | +$99  |

## Surcharges

| Condition         | Surcharge |
| ----------------- | --------- |
| Weekend (Sat/Sun) | +10%      |
| Same-day booking  | +15%      |

---

# PART 5: TECHNICAL INTEGRATIONS

| Service         | Purpose    | Key Features                                       |
| --------------- | ---------- | -------------------------------------------------- |
| **Stripe**      | Payments   | Checkout, subscriptions, Connect payouts, webhooks |
| **Clerk**       | Auth       | Sign up, sign in, sessions, user management        |
| **Retell AI**   | Voice      | AI phone agents, call handling                     |
| **Cal.com**     | Scheduling | Provider availability, booking sync                |
| **Resend**      | Email      | Transactional emails, templates                    |
| **Checkr**      | Background | Provider verification                              |
| **PostHog**     | Analytics  | User tracking, funnels                             |
| **Sentry**      | Monitoring | Error tracking                                     |
| **Google Maps** | Location   | Address validation, routing                        |
| **Redis**       | Caching    | Performance, rate limiting                         |
| **OpenAI**      | AI         | GPT-4o for booking/recruiting agents               |
| **Anthropic**   | AI         | Claude for support/analytics agents                |

---

# PART 6: PAGES & ROUTES INVENTORY

## Public Routes (No Auth)

```
/                              Homepage
/services                      Services directory
/services/house-cleaning       Service page
/services/handyman            Service page
/services/plumbing            Service page
/services/electrical          Service page
/services/painting            Service page
/services/pressure-washing    Service page
/services/gutter-services     Service page
/services/junk-removal        Service page
/services/welding             Service page
/services/storm-damage-cleanup Service page
/services/fire-debris-removal Service page
/services/emergency-disaster-cleanup Service page
/pricing                      Pricing page
/how-it-works                 Process explanation
/about                        About us
/contact                      Contact form
/emergency                    Emergency services
/support                      FAQ/Help
/blog                         Blog
/careers                      Jobs
/become-pro                   Provider recruitment
/become-pro/application       Provider application
/become-pro/application/success Application confirmation
/privacy                      Privacy policy
/terms                        Terms of service
/cookies                      Cookie policy
/press                        Press kit
```

## Auth Routes

```
/sign-in                      Login
/sign-up                      Register
/forgot-password              Password reset request
/reset-password               Password reset
```

## Customer Routes (Auth Required)

```
/book-now                     Booking flow
/dashboard                    Dashboard home
/dashboard/bookings           Bookings list
/dashboard/bookings/[id]      Booking details
/dashboard/payments           Payment settings
/dashboard/subscription       Subscription management
/dashboard/settings           Account settings
```

## Provider Routes (Provider Auth)

```
/provider                     Provider dashboard
/provider/stripe/success      Stripe Connect success
/provider/stripe/refresh      Stripe Connect refresh
```

## Admin Routes (Admin Auth)

```
/admin                        Admin dashboard
/admin/applications           Provider applications
/admin/analytics              Platform analytics
/admin/marketing              Marketing dashboard
```

## API Routes

```
/api/bookings                 Booking CRUD
/api/bookings/locations       Service locations
/api/stripe/create-payment-intent
/api/stripe/create-subscription
/api/stripe/webhooks
/api/stripe/connect/*
/api/stripe/payment-methods
/api/stripe/prices
/api/stripe/products
/api/providers/match
/api/providers/register
/api/providers/schedule
/api/providers/bookings
/api/providers/background-check/webhook
/api/ai/booking
/api/ai/chat
/api/ai/voice
/api/cal-com/availability
/api/cal-com/bookings
/api/cal-com/webhook
/api/communications/send
/api/communications/preferences
/api/communications/webhooks/*
/api/support/tickets
/api/admin/metrics/*
/api/monitoring/*
/api/health
/api/status
```

---

# PART 7: REDESIGN CONSIDERATIONS

## Current Pain Points to Investigate

1. Is the 60-second booking flow actually achievable?
2. How many steps before a customer sees pricing?
3. Is the quote request flow too disconnected from instant booking?
4. Provider dashboard mobile experience?
5. Admin workflow efficiency?

## Potential Streamlining Areas

1. **Unified booking flow** - One flow that branches (instant vs. quote)
2. **Progressive disclosure** - Show pricing earlier
3. **Mobile-first provider app** - Dedicated provider experience
4. **Self-service admin** - Reduce manual application review
5. **AI-first support** - Reduce ticket volume

---

_Document prepared for Tapstead redesign initiative_
_Last updated: January 2026_
