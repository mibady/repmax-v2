# TAPSTEAD

## Platform Redesign Brief

### Seattle's Premium House Cleaning Service

**January 2026 | Version 1.0**

---

# Executive Summary

This document outlines the strategic redesign of Tapstead from a multi-service home services marketplace to a focused, premium house cleaning platform serving the Seattle metropolitan area.

### The Pivot

**Before:** 12 services (cleaning, handyman, plumbing, electrical, painting, etc.) with two separate booking flows—instant booking for cleaning and quote requests for everything else.

**After:** One service. One flow. One obsession: delivering the best house cleaning experience in the Pacific Northwest.

### Why This Matters

- **Focus drives excellence.** Spreading across 12 services dilutes quality and brand perception.
- **Cleaning is the beachhead.** High frequency, predictable pricing, and subscription potential make it ideal for building customer lifetime value.
- **Simplified UX converts better.** Removing 11 service categories and the quote request system eliminates cognitive load and friction.
- **Operational efficiency.** One service type means streamlined provider onboarding, training, and quality control.

### Success Metrics

| Metric                  | Current     | Target (90 days)         |
| ----------------------- | ----------- | ------------------------ |
| Booking completion rate | ~35%        | 60%+                     |
| Time to book            | 3-5 minutes | Under 60 seconds         |
| Subscription conversion | TBD         | 40% of first-time buyers |

---

# Strategic Positioning

## Brand Identity: Cleaning-First

Tapstead becomes synonymous with premium house cleaning in Seattle—not a generalist marketplace, but the specialist you trust with your home.

### Positioning Statement

> _"For Seattle homeowners who value their time and their space, Tapstead delivers premium house cleaning with instant booking, transparent pricing, and vetted professionals—so you can come home to clean."_

### Competitive Differentiation

| Factor               | Tapstead    | Thumbtack/Handy | Local Cleaners |
| -------------------- | ----------- | --------------- | -------------- |
| Instant booking      | ✓ Yes       | Varies          | Phone/email    |
| Transparent pricing  | ✓ Upfront   | Quote-based     | Varies         |
| AI phone booking     | ✓ 24/7      | No              | No             |
| Subscription savings | ✓ Up to 33% | Limited         | Sometimes      |
| Seattle-focused      | ✓ Local     | National        | Local          |

### Target Customer Segments

1. **Busy Professionals** — Dual-income households in Bellevue, Capitol Hill, Queen Anne. Value time over money. Want reliability.

2. **Young Families** — Parents in Kirkland, Redmond, Issaquah. Need recurring service. Price-sensitive but willing to pay for quality.

3. **Aging-in-Place Seniors** — Homeowners 65+ who need help maintaining their homes. Trust and consistency matter most.

4. **Airbnb Hosts** — Property managers needing turnover cleaning. Speed and reliability are critical.

---

# Simplified Information Architecture

## Before vs. After: Site Structure

### Pages Being Removed

**Service Pages (Delete):**

- `/services/handyman`
- `/services/plumbing`
- `/services/electrical`
- `/services/painting`
- `/services/pressure-washing`
- `/services/gutter-services`
- `/services/junk-removal`
- `/services/welding`
- `/services/storm-damage-cleanup`
- `/services/fire-debris-removal`
- `/services/emergency-disaster-cleanup`

**Other Pages (Delete):**

- `/services` (directory page)
- `/emergency`
- Quote request flow
- ServiceSelector component
- QuoteRequestForm component
- services-dropdown component

### New Site Map

| Public Pages                     | Customer Portal            | Provider/Admin       |
| -------------------------------- | -------------------------- | -------------------- |
| `/` (homepage)                   | `/dashboard`               | `/provider`          |
| `/book` (booking flow)           | `/dashboard/bookings`      | `/provider/schedule` |
| `/pricing`                       | `/dashboard/bookings/[id]` | `/provider/earnings` |
| `/how-it-works`                  | `/dashboard/subscription`  | `/admin`             |
| `/about`                         | `/dashboard/payments`      | `/admin/bookings`    |
| `/contact`                       | `/dashboard/settings`      | `/admin/providers`   |
| `/support`                       |                            | `/admin/analytics`   |
| `/blog`                          |                            |                      |
| `/careers`                       |                            |                      |
| `/become-pro`                    |                            |                      |
| `/privacy`, `/terms`, `/cookies` |                            |                      |

---

# The 60-Second Booking Flow

The core user experience: from landing to confirmed booking in under one minute.

## Flow Overview

| Step  | Action             | Details                                                                                                    |
| ----- | ------------------ | ---------------------------------------------------------------------------------------------------------- |
| **1** | **Choose size**    | 3 cards: Small (1-2 BR), Medium (3-4 BR), Large (5+ BR). Price shown on each card.                         |
| **2** | **Pick frequency** | Toggle: One-time / Weekly (33% off) / Bi-weekly (27% off) / Monthly (20% off). Price updates in real-time. |
| **3** | **Add extras**     | Optional add-ons: Deep Clean (+$75), Move-in/out (+$99). Checkboxes with instant price update.             |
| **4** | **Schedule**       | Calendar picker + time slots. Weekend (+10%) and same-day (+15%) surcharges auto-applied.                  |
| **5** | **Address + Pay**  | Service address, account creation (or login), Stripe checkout. Single page, no context-switching.          |
| **✓** | **Confirmed!**     | Provider assigned instantly. Name, photo, phone shown. Confirmation email + SMS sent.                      |

## Pricing Structure

| Home Size           | One-time | Monthly (20% off) | Bi-weekly (27% off) | Weekly (33% off) |
| ------------------- | -------- | ----------------- | ------------------- | ---------------- |
| **Small** (1-2 BR)  | $149     | $119              | $109                | $100             |
| **Medium** (3-4 BR) | $199     | $159              | $145                | $133             |
| **Large** (5+ BR)   | $299     | $239              | $218                | $200             |

### Surcharges

- **Weekend service:** +10% (Saturday/Sunday bookings)
- **Same-day booking:** +15% (booked for today)
- **Add-ons:** Deep Clean (+$75), Move-in/out (+$99)

---

# Homepage Redesign

The homepage becomes a single-purpose conversion machine: get visitors to `/book` as fast as possible.

## Above the Fold

### Hero Section

- **Headline:** "Seattle's Premium House Cleaning"
- **Subhead:** "Book in 60 seconds. Come home to clean."
- **Primary CTA:** "Book Now" button (large, Trust Blue)
- **Secondary CTA:** "See Pricing" link
- **Trust signals:** "500+ 5-star reviews" | "Background-checked pros" | "Satisfaction guaranteed"
- **Image:** Bright, welcoming photo of clean Seattle home interior

### Instant Price Preview

Right on the homepage, show a simplified version of the booking selector:

- Three clickable cards: Small / Medium / Large with prices
- Clicking any card navigates to `/book` with that size pre-selected
- "Prices start at $100/clean with a subscription" messaging

## Below the Fold

### How It Works (3 steps)

1. **Book Online** — Pick your home size, choose a date, done in 60 seconds
2. **We Clean** — A vetted, background-checked professional arrives on time
3. **Relax** — Come home to a sparkling clean space

### Social Proof

- 3-4 customer testimonials with photos and star ratings
- Google/Yelp aggregate rating badge
- "Trusted by 2,500+ Seattle homes" counter

### Final CTA

Sticky bottom bar on mobile: "Book Your First Clean" button always visible while scrolling.

---

# Technical Implementation Plan

## Phase 1: Cleanup (Days 1-2)

### File Deletions

Remove all non-cleaning service pages, components, and API routes. Set up redirects from old URLs to homepage.

- Delete `/app/services/*` except house-cleaning
- Delete `/components/booking/QuoteRequestForm.tsx` and related
- Delete `/components/booking/ServiceSelector.tsx`
- Delete `/components/layout/services-dropdown.tsx`
- Delete `/api/quote-request`
- Update database: remove service_type columns referencing other services

### Navigation Update

- Header: `Logo | How It Works | Pricing | Support | [Book Now button]`
- Remove services dropdown entirely

## Phase 2: Booking Flow Rebuild (Days 3-5)

- Single-page booking at `/book`
- Real-time price calculator as user selects options
- Integrated Stripe checkout (no redirect)
- Clerk auth embedded in flow (sign up during checkout)
- Cal.com integration for real-time availability

## Phase 3: Homepage & Marketing Pages (Days 6-7)

- New homepage with instant price preview
- Simplified `/pricing` page (cleaning only)
- Updated `/how-it-works` for cleaning focus
- Provider recruitment page updated for cleaning-only

## Phase 4: AI & Communications (Day 8)

- Update Retell AI booking agent for cleaning-only flow
- Simplify support agent (no quote handling)
- Update email templates

---

# New Components to Build

## Booking Flow Components

| Component               | Purpose                                                    |
| ----------------------- | ---------------------------------------------------------- |
| **HomeSizeSelector**    | 3-card selection for Small/Medium/Large with prices        |
| **FrequencyToggle**     | Segmented control: One-time / Weekly / Bi-weekly / Monthly |
| **AddOnPicker**         | Checkboxes for Deep Clean and Move-in/out                  |
| **PriceSummary**        | Real-time price display with breakdown and savings badge   |
| **DateTimePicker**      | Calendar + time slot selector with surcharge indicators    |
| **CheckoutForm**        | Address input + Stripe Elements + auth (combined)          |
| **BookingConfirmation** | Success screen with provider info and next steps           |

## Homepage Components

| Component               | Purpose                                    |
| ----------------------- | ------------------------------------------ |
| **HeroSection**         | Headline, CTAs, trust signals, hero image  |
| **PricePreview**        | 3 clickable price cards linking to /book   |
| **HowItWorks**          | 3-step process with icons and descriptions |
| **TestimonialCarousel** | Customer reviews with photos and ratings   |
| **StickyBookCTA**       | Mobile sticky footer with Book Now button  |

---

# URL Redirect Strategy

To preserve SEO and handle existing traffic, implement 301 redirects:

| Old URL                         | Redirect To    |
| ------------------------------- | -------------- |
| `/services`                     | `/book`        |
| `/services/house-cleaning`      | `/book`        |
| `/services/[any-other-service]` | `/` (homepage) |
| `/emergency`                    | `/` (homepage) |
| `/book-now`                     | `/book`        |

## next.config.js Implementation

```javascript
async redirects() {
  return [
    {
      source: '/services/:path*',
      destination: '/',
      permanent: true,
    },
    {
      source: '/services',
      destination: '/book',
      permanent: true,
    },
    {
      source: '/emergency',
      destination: '/',
      permanent: true,
    },
    {
      source: '/book-now',
      destination: '/book',
      permanent: true,
    },
  ];
}
```

---

# Brand Messaging Updates

## Tagline Options

1. "Seattle's Premium House Cleaning" _(recommended)_
2. "Come Home to Clean"
3. "Book. Relax. We Handle the Rest."
4. "Your Weekend, Reclaimed."

## Value Propositions (For Marketing)

- **Speed:** "Book in 60 seconds, not 60 minutes"
- **Trust:** "Every cleaner is background-checked and vetted"
- **Transparency:** "See your price upfront—no surprises"
- **Savings:** "Save up to 33% with a subscription"
- **Local:** "Built for Seattle, by Seattle"

## Copy to Update

- Homepage hero and all CTAs
- Meta descriptions and page titles
- Email templates (confirmation, reminders, marketing)
- AI agent scripts (Retell booking and support)
- Provider recruitment landing page
- Footer and navigation

---

# Next Steps

## Immediate Actions

1. **Review and approve this brief**
2. **Create feature branch** for the pivot (`git checkout -b feature/cleaning-only`)
3. **Run cleanup script** to remove unused service pages and components
4. **Begin booking flow rebuild** following the component specifications above

## Design Deliverables Needed

- Updated Figma mockups for new booking flow
- Homepage redesign with price preview cards
- Mobile-first booking experience
- Updated icon set (cleaning-focused)

## Timeline

| Phase           | Duration            |
| --------------- | ------------------- |
| Cleanup         | Days 1-2            |
| Booking Flow    | Days 3-5            |
| Marketing Pages | Days 6-7            |
| AI & Comms      | Day 8               |
| **Total**       | **~8 working days** |

---

# Appendix: Files to Delete

## Service Pages

```
/app/services/electrical/page.tsx
/app/services/emergency-disaster-cleanup/page.tsx
/app/services/fire-debris-removal/page.tsx
/app/services/gutter-services/page.tsx
/app/services/handyman/page.tsx
/app/services/junk-removal/page.tsx
/app/services/painting/page.tsx
/app/services/plumbing/page.tsx
/app/services/pressure-washing/page.tsx
/app/services/storm-damage-cleanup/page.tsx
/app/services/welding/page.tsx
/app/services/[slug]/page.tsx
/app/services/page.tsx
/app/emergency/page.tsx
```

## Components

```
/components/booking/QuoteRequestForm.tsx
/components/booking/quote-request-confirmation.tsx
/components/booking/quote-request-confirmation-new.tsx
/components/booking/ServiceSelector.tsx
/components/booking/service-selection.tsx
/components/booking/service-selection-client.tsx
/components/layout/services-dropdown.tsx
/components/pages/services/electrical-service.tsx
/components/pages/services/emergency-disaster-cleanup-service.tsx
/components/pages/services/fire-debris-removal-service.tsx
/components/pages/services/gutter-service.tsx
/components/pages/services/handyman-service.tsx
/components/pages/services/junk-removal-service.tsx
/components/pages/services/painting-service.tsx
/components/pages/services/plumbing-service.tsx
/components/pages/services/pressure-washing-service.tsx
/components/pages/services/storm-damage-cleanup-service.tsx
/components/pages/services/welding-service.tsx
/components/pages/services-overview.tsx
/components/pages/emergency-services.tsx
```

## API Routes

```
/pages/api/quote-request.ts
```

---

_— End of Brief —_
