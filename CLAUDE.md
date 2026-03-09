# RepMax v2 - Project Guide

## Overview

RepMax is a data-driven recruiting intelligence platform connecting elite football talent with top-tier college programs. 6 user roles, 70 pages, 68 API routes, 44 database tables.

- **Domain:** repmax.io
- **Production:** https://repmax-v2.vercel.app
- **Linear:** 38/38 issues complete
- **Repo:** https://github.com/mibady/repmax-v2

## Quick Start

```bash
npm install          # Install dependencies
npm run dev          # Dev server (turbo)
npm run build        # Production build
npm run typecheck    # TypeScript check
npm run lint         # ESLint
npm run test         # Run tests
npm run seed         # Seed database (Golden Record)
npm run seed:reset   # Clean + reseed

# Quality pipeline (tsc -> lint -> test -> build)
npx tsx ~/.claude/scripts/quality-pipeline.ts --all
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15.3.6 (App Router, Server Components) |
| Language | TypeScript 5.7 |
| Monorepo | Turborepo |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (@supabase/ssr) |
| Payments | Stripe (22 prices, 5 product lines, webhook) |
| Styling | Tailwind CSS 3.4 |
| UI | shadcn/ui + Radix primitives |
| Validation | Zod |
| Testing | Vitest + Quality Pipeline |
| Icons | Material Symbols (Stitch pages), Lucide (scratch-built) |

## Project Structure

```
repmax-v2/
├── apps/
│   ├── web/                          # Next.js App Router (main app)
│   │   ├── app/
│   │   │   ├── (auth)/               # Auth routes (login, signup, callback)
│   │   │   ├── (app)/                # Protected app routes
│   │   │   │   ├── dashboard/        # Role-based redirect hub
│   │   │   │   └── tournaments/      # Public tournament pages
│   │   │   ├── (dashboard)/          # Role dashboards
│   │   │   │   ├── admin/            # Admin (analytics, users, flags, moderation)
│   │   │   │   ├── athlete/          # Athlete (profile, film, card, analytics, docs)
│   │   │   │   ├── coach/            # Coach (roster, tasks, setup)
│   │   │   │   ├── club/             # Club (events, athletes, scouts, analytics)
│   │   │   │   ├── parent/           # Parent (activity, calendar, schools, resources)
│   │   │   │   ├── recruiter/        # Recruiter (pipeline, prospects, film, reports)
│   │   │   │   ├── dashr/            # Dashr combines & training
│   │   │   │   ├── zone/             # Zone intelligence map
│   │   │   │   ├── messages/         # Messaging (all roles)
│   │   │   │   ├── settings/         # User settings + notifications
│   │   │   │   └── help/             # Help center
│   │   │   ├── api/                  # 68 API routes across 25 groups
│   │   │   ├── card/[id]/            # Public athlete card (QR, profile views)
│   │   │   ├── onboarding/           # Role selection + AI chat onboarding
│   │   │   ├── pricing/              # 4-category pricing (22 plans)
│   │   │   └── page.tsx              # Landing page
│   │   ├── components/               # 36 shared components
│   │   ├── lib/
│   │   │   ├── supabase/             # Supabase clients (server + browser)
│   │   │   ├── actions/              # Server actions (auth, etc.)
│   │   │   └── hooks/                # 44 React hooks
│   │   ├── types/                    # TypeScript types (database.ts)
│   │   └── middleware.ts             # Auth refresh, route protection, redirects
│   └── mobile/                       # Expo scaffold (no features yet)
├── supabase/
│   └── migrations/                   # 18 migrations, 44 tables
├── test/seed/                        # Golden Record seed system
├── stitch-exports/                   # Stitch design exports
├── specs/                            # Implementation specs
├── turbo.json                        # Turborepo config
└── .linear_project.json              # Linear tracking (38/38 done)
```

## Roles & Auth

6 roles stored in `profiles.role` (Supabase `user_role` enum):

| Role | DB Value | Dashboard | Description |
|------|----------|-----------|-------------|
| Student Athlete | `athlete` | `/athlete` | Profile, film, card, offers |
| Parent/Guardian | `parent` | `/parent` | Track child's recruiting journey |
| Head Coach (HS) | `coach` | `/coach` | Manage team roster and tasks |
| College Recruiter | `recruiter` | `/recruiter/pipeline` | CRM Kanban, prospect evaluation |
| Club Organizer | `club` | `/club` | 7v7 tournaments, events |
| Admin | `admin` | `/admin` | Users, flags, moderation, analytics |

- Canonical club role value is `"club"` everywhere (not "school" or "organizer")
- `coaches` table stores 3 role types via `school_type`: `'high_school'`, `'college'`, `'club'`
- `crm_pipeline` (recruiter CRM Kanban) is separate from `shortlists` (bookmarking)
- School role was removed in Session 18

## Database Schema

44 tables across 18 migrations with RLS policies:

**Core (Migration 001):**
`profiles`, `athletes`, `coaches`, `highlights`, `shortlists`, `messages`, `subscription_plans`, `subscriptions`, `offers`

**Messaging & Notifications (002-003):**
`notifications`, `notification_preferences`, `conversations`, `profile_views`, `film_bookmarks`, `zone_activity`, `onboarding_progress`, `recruiting_events`, `class_rankings`

**Coach & Tasks (005):**
`coach_tasks`

**Parent & Club (008-009):**
`parent_links`, `tournaments`, `athlete_verifications`, `tournament_payments`

**Production (010):**
`athlete_events`, `feature_flags`, `moderation_queue`, `zone_assignments`

**Mega Sprint (012):**
`one_time_purchases`, `schools`, `school_members`, `school_credits`, `dashr_events`, `dashr_bookings`, `tournament_registrations`, `tournament_rosters`, `tournament_brackets`, `tournament_venues`, `tournament_games`, `game_score_events`, `game_player_stats`, `tournament_standings`, `tournament_notifications`, `athlete_tournament_performance`

**Architecture Correction (016-018):**
`crm_pipeline`, plus `teams` and `team_rosters` extensions

## Key Features

### Player Card (`/card/[id]`)
- Public page, no auth required
- Supports UUID and `repmax_id` URL lookup
- QR code (repmax.io/card/{repmax_id}) in RepMax gold
- Fire-and-forget profile view tracking
- Share button (Web Share API on mobile, clipboard on desktop)

### Stripe Integration
- **Endpoint:** `/api/webhooks/stripe`
- **Events:** `checkout.session.completed`, `payment_intent.succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- **Products:** Athletes (3 tiers), Recruiters (5 tiers), Events (3 tiers), Dashr (5 products)
- `STRIPE_WEBHOOK_SECRET` set in both `.env.local` and Vercel env vars
- No Connect for MVP — platform fee tracked in ledger, manual payouts

### MCP Connectors (`/api/mcp/`)
- `zones`, `zones/[zone]`, `prospects`, `programs`, `calendar`
- Powers the custom RepMax MCP server for AI-assisted recruiting

## Environment Variables

Required in `.env.local` and Vercel:
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
STRIPE_TEAM_PRICE_ID=
E2B_API_KEY=
```

## API Routes (25 groups, 68 routes)

| Group | Routes | Purpose |
|-------|--------|---------|
| `admin/` | analytics, users, feature-flags, moderation | Admin panel |
| `athlete/` | dashboard, card, documents | Athlete features |
| `athletes/` | CRUD, `[id]` | Athlete data |
| `coach/` | dashboard, team, roster, tasks | Coach features |
| `club/` | dashboard, events, verifications | Club features |
| `recruiter/` | pipeline, assignments | Recruiter CRM |
| `recruiting/` | visits, events, calendar, zones, class-rankings, communications, reports | Recruiting intelligence |
| `tournaments/` | CRUD, registrations, brackets, venues, games, scoring, notifications, roster | Tournament system |
| `dashr/` | events, bookings, `[id]/book` | Dashr combines |
| `messages/` | threads, `[contactId]` | NCAA-compliant messaging |
| `mcp/` | zones, prospects, programs, calendar | MCP connectors |
| `webhooks/` | stripe | Payment webhooks |
| `billing/` | portal | Stripe customer portal |
| `checkout/` | session | Stripe checkout |
| `search/` | global | Global search with subscription tier limits |

## Code Patterns

### Server Actions
```typescript
'use server';
import { createClient } from '@/lib/supabase/server';

export async function myAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // ... implementation
}
```

### Data Fetching Hooks
```typescript
import {
  useAthletes, useShortlist, useMessages,
  useCoachDashboard, useRecruiterPipeline,
  useParentDashboard, useClubDashboard,
  useAdminAnalytics, useFeatureFlags,
} from '@/lib/hooks';
```

### Protected Routes
Middleware at `apps/web/middleware.ts` handles auth refresh, route protection, and role-based redirects.

## Testing

```bash
npm run test                # Run all tests
npm run test:coverage       # With coverage report

# Quality pipeline (stops on first failure)
npx tsx ~/.claude/scripts/quality-pipeline.ts --all        # Full pipeline
npx tsx ~/.claude/scripts/quality-pipeline.ts --gate tsc   # TypeScript only
npx tsx ~/.claude/scripts/quality-pipeline.ts --gate lint  # Lint only
npx tsx ~/.claude/scripts/quality-pipeline.ts --gate build # Build only
```

- 42 test files, coverage scoped to backend only
- Branches threshold 65%, all others 70%

## Deployment

Deployed on Vercel. Push to `main` triggers automatic deployment.

- **URL:** https://repmax-v2.vercel.app
- **Domain:** repmax.io
- **Stripe webhook:** Live (5 events)

## Decisions Log

- `getPriceId()` function (not module constant) for env vars — serverless cold start safety
- Feature flags route returns empty array when no DB table rows exist
- Film upload is URL-based (YouTube/Hudl links), not file upload
- `profile_views` uses fire-and-forget insert pattern (no await)
- QR code on player card uses `repmax.io/card/{repmax_id}` canonical URL
- 207 real athlete prospects imported from JotForm

## Pending Work

- Send test webhook from Stripe Dashboard to verify 200 response
- `one_time_purchases` and `tournament_registrations` DB tables (referenced in webhook but empty)
- Mobile app (Expo) — scaffold exists at `apps/mobile/`, no features built
- Fix turbo test runner CLI flag issue (`--run` not recognized)
- Add env vars to `turbo.json` to silence build warnings

## Known Issues

1. Font-display warning in layout.tsx (cosmetic, non-blocking)
2. Next.js 15.3.6 has a known security issue — consider upgrading

---

Generated by Claude Code | Last updated: 2026-03-09
