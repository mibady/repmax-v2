# RepMax v2 — Development Team Handoff

> **Document Version:** 1.0 | **Date:** February 1, 2026
> **Project Owner:** Ian | **Status:** Design Complete → Ready for Development
> **Audience:** Local dev team (frontend + backend + mobile)

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [What's Been Done vs What You're Building](#2-whats-been-done)
3. [Architecture & Tech Stack](#3-architecture)
4. [Design System](#4-design-system)
5. [Project Structure](#5-project-structure)
6. [Environment Setup](#6-environment-setup)
7. [Database Schema](#7-database-schema)
8. [Authentication & Authorization](#8-authentication)
9. [API Endpoints](#9-api-endpoints)
10. [Stitch → Code Conversion Workflow](#10-stitch-conversion)
11. [Screen-by-Screen Build Specifications](#11-screen-specs)
12. [Form Specifications](#12-forms)
13. [UI State Types](#13-state-types)
14. [Real-Time Features](#14-realtime)
15. [Integrations](#15-integrations)
16. [Mobile (Expo)](#16-mobile)
17. [SEO & Performance](#17-seo)
18. [Testing & Seed Data](#18-testing)
19. [Deployment](#19-deployment)
20. [Build Order & Sprint Plan](#20-build-order)
21. [Acceptance Criteria](#21-acceptance-criteria)
22. [Deliverable Inventory](#22-deliverables)

---

## 1. EXECUTIVE SUMMARY

RepMax is a college football recruiting intelligence platform serving 5 user roles: Athletes, Parents, Coaches, Recruiters, and Club Organizers. The platform's core product is the "Companion Card" — a shareable digital recruiting profile — supported by zone-based recruiting intelligence, tournament management, and CRM tools.

**What's complete:** Full UX design (82 screens across MVP + Phase 2), Stitch prompts for every screen, seed data for all 11 test users, architecture decisions, and this handoff document.

**What you're building:** Production code from Stitch HTML exports. You will paste prompts into Google Stitch, export HTML, then convert to Next.js components.

**Timeline:**
- MVP (Batches 1-8): 8 weeks → 43 screens
- Phase 2A (Engagement): 4 weeks → 19 screens
- Phase 2B (Platform): 4 weeks → 18 screens
- PRP Cleanup: 1 week → 5 screens
- **Total: 17 weeks, 82 screens, 100% PRP coverage**

---

## 2. WHAT'S BEEN DONE VS WHAT YOU'RE BUILDING

### Already Complete (DO NOT rebuild)

| Deliverable | File | What It Contains |
|-------------|------|-----------------|
| Master Stitch Plan | `00-MASTER-STITCH-PLAN.md` | All 82 Stitch prompts organized by batch |
| UX Journeys | `01-UX-JOURNEYS.md` | User flows for all 5 roles |
| Architecture Diagrams | `02-ARCHITECTURE-DIAGRAMS.md` | System architecture, data flow |
| MVP Prompts Batch 1-3 | `repmax-batch-2-3-auth-athlete.md` | Auth, onboarding, athlete dashboard, Companion Card |
| MVP Prompts Batch 4-5 | `repmax-batch-4-5-parent-coach.md` | Parent dashboard, team dashboard |
| MVP Prompts Batch 6-7 | `repmax-batch-6-7-recruiter-club.md` | Recruiter dashboard, club/tournament |
| MVP Prompts Batch 8 | `repmax-batch-8-shared-components.md` | Shared widgets, zone pulse, calendar |
| Phase 2A Sprints 1-2 | `repmax-phase-2a-sprint-1-2-notifications-messaging.md` | Notifications, messaging |
| Phase 2A Sprints 3-4 | `repmax-phase-2a-sprint-3-4-analytics-zonemap.md` | Analytics, film, zone map |
| Phase 2B + Cleanup | `repmax-phase-2b-crm-seo-admin-cleanup.md` | CRM, SEO, admin, PRP cleanup |
| Phase 2 Roadmap | `repmax-phase-2-roadmap.md` | Feature scoring, sprint plan |
| PRP Audit | `repmax-prp-coverage-audit.md` | Coverage verification |
| Seed Data | `repmax-seed-data.md` | 11 test users with complete data |
| AI Onboarding Prototype | `repmax-ai-onboarding.jsx` | Working React prototype |
| System Map | `repmax-system-map.jsx` | Interactive architecture diagram |
| CMS Integration | `repmax-cms-integration.jsx` | Sanity CMS patterns |

### What You're Building

1. **Paste Stitch prompts** from the batch files into Google Stitch
2. **Export HTML** from each Stitch generation
3. **Convert HTML to Next.js** components (see Section 10)
4. **Wire up Supabase** backend (schema, RLS, Edge Functions)
5. **Connect integrations** (Stripe, RepMax MCP, Sanity, Mapbox)
6. **Build mobile** with Expo (shared components)
7. **Deploy** to Vercel
8. **Test** with seed data

---

## 3. ARCHITECTURE & TECH STACK

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────┐
│                  FACE LAYER                      │
│         (What users see and touch)               │
│                                                  │
│  Next.js 15 (App Router) + React 19             │
│  Tailwind CSS + shadcn/ui                        │
│  Framer Motion (animations)                      │
│  Zustand (state management)                      │
│  lucide-react (icons)                            │
│                                                  │
│  Expo (React Native) — mobile                    │
│  NativeWind (Tailwind for mobile)                │
├─────────────────────────────────────────────────┤
│                  HEAD LAYER                      │
│         (AI and intelligence)                    │
│                                                  │
│  Vercel AI SDK (onboarding chat)                 │
│  RepMax MCP Connector (zone intelligence)        │
│  OpenAI / Anthropic (AI scouting — Phase 2C)     │
├─────────────────────────────────────────────────┤
│                  DNA LAYER                       │
│         (Data, auth, storage, payments)          │
│                                                  │
│  Supabase (Postgres + Auth + Storage + Realtime) │
│  Supabase Edge Functions (Deno)                  │
│  Stripe (tournament payments)                    │
│  Sanity CMS (content — Phase 2B)                 │
│  Resend (transactional email — Phase 2A)         │
└─────────────────────────────────────────────────┘
```

### Tech Stack (Locked — Do Not Substitute)

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 15+ | App Router, SSR, ISR, API routes |
| UI | React | 19 | Components |
| Styling | Tailwind CSS | 4.0 | Utility-first CSS |
| Components | shadcn/ui | Latest | Pre-built accessible components |
| Icons | lucide-react | Latest | Tree-shakeable icons |
| State | Zustand | 5+ | Client state management |
| Animation | Framer Motion | 11+ | Page transitions, micro-interactions |
| Language | TypeScript | 5.x | Strict mode everywhere |
| Database | Supabase (Postgres) | Latest | Primary database + auth |
| Auth | Supabase Auth | Latest | Email/password + OAuth |
| Storage | Supabase Storage | Latest | Film uploads, documents, photos |
| Realtime | Supabase Realtime | Latest | Notifications, messaging, live scores |
| Edge | Supabase Edge Functions | Deno | Server logic, webhooks |
| Payments | Stripe Connect | Latest | Tournament payments |
| CMS | Sanity | v3 | Zone content, program spotlights |
| Email | Resend | Latest | Transactional email |
| Maps | Mapbox GL JS or D3.js | Latest | Zone map rendering |
| Mobile | Expo | SDK 51+ | iOS + Android |
| Mobile Style | NativeWind | 4+ | Tailwind for React Native |
| Deployment | Vercel | Latest | Hosting, CI/CD |
| MCP | RepMax MCP Connector | Custom | Zone intelligence data |

---

## 4. DESIGN SYSTEM

### Dark Mode Only

RepMax is a dark-mode-only application. Do not build light mode. Every component assumes dark backgrounds.

### Color Tokens

Copy these into `tailwind.config.ts`:

```typescript
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      colors: {
        // Core backgrounds
        background: {
          DEFAULT: '#050505',    // Page background
          elevated: '#1A1A1A',   // Sidebar, modals
          card: '#1F1F22',       // Cards, panels
          input: '#2A2A2E',      // Form inputs
        },

        // Primary gold
        gold: {
          DEFAULT: '#D4AF37',    // Primary actions, highlights
          hover: '#F3E5AB',      // Hover state
          active: '#B4941F',     // Active/pressed
          muted: '#D4AF3720',    // 12% opacity backgrounds
          glow: '#D4AF3740',     // Glow effect (25% opacity)
        },

        // Zone colors (NEVER change these — they map to recruiting zones)
        zone: {
          northeast: '#3B82F6',  // Blue
          southeast: '#EF4444',  // Red
          midwest: '#10B981',    // Green
          southwest: '#F97316',  // Orange
          west: '#8B5CF6',       // Purple
          plains: '#D4AF37',     // Gold
        },

        // Semantic
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',

        // Text
        text: {
          primary: '#FFFFFF',
          secondary: '#A0A0A0',
          muted: '#6B7280',
          disabled: '#4B5563',
        },

        // Borders
        border: {
          DEFAULT: '#2A2A2E',
          hover: '#3A3A3E',
          focus: '#D4AF37',
        },

        // Star ratings
        star: {
          filled: '#D4AF37',
          empty: '#4B5563',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      fontSize: {
        // Stat numbers use JetBrains Mono
        'stat-xl': ['2.5rem', { fontFamily: 'JetBrains Mono', fontWeight: '700' }],
        'stat-lg': ['1.5rem', { fontFamily: 'JetBrains Mono', fontWeight: '600' }],
        'stat-md': ['1.125rem', { fontFamily: 'JetBrains Mono', fontWeight: '600' }],
      },

      spacing: {
        // 8px base grid
        'grid-1': '8px',
        'grid-2': '16px',
        'grid-3': '24px',
        'grid-4': '32px',
        'grid-5': '40px',
        'grid-6': '48px',
      },

      borderRadius: {
        'card': '12px',
        'button': '8px',
        'input': '8px',
        'badge': '9999px',
      },

      boxShadow: {
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.25)',
        'gold-glow-lg': '0 0 40px rgba(212, 175, 55, 0.35)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'elevated': '0 8px 32px rgba(0, 0, 0, 0.6)',
      },

      backdropBlur: {
        'glass': '20px',
      },
    },
  },
};
```

### Typography Rules

| Element | Font | Weight | Size | Color |
|---------|------|--------|------|-------|
| Page title | Inter | 700 | 28px | #FFFFFF |
| Section header | Inter | 600 | 20px | #FFFFFF |
| Card title | Inter | 600 | 16px | #FFFFFF |
| Body text | Inter | 400 | 14px | #A0A0A0 |
| Small/label | Inter | 500 | 12px | #6B7280 |
| Stat numbers | JetBrains Mono | 700 | varies | #D4AF37 |
| Stat labels | Inter | 500 | 12px | #6B7280 |
| Button text | Inter | 600 | 14px | varies |
| Input text | Inter | 400 | 14px | #FFFFFF |
| Input placeholder | Inter | 400 | 14px | #6B7280 |

### Component Patterns

**Primary Button:**
```tsx
<button className="flex items-center gap-2 rounded-lg h-10 px-6 bg-gold hover:bg-gold-hover active:bg-gold-active text-background-DEFAULT font-semibold text-sm transition-all shadow-gold-glow hover:shadow-gold-glow-lg">
  Label
</button>
```

**Secondary Button:**
```tsx
<button className="flex items-center gap-2 rounded-lg h-10 px-6 bg-transparent border border-gold/30 text-gold hover:bg-gold/10 font-semibold text-sm transition-all">
  Label
</button>
```

**Card:**
```tsx
<div className="bg-background-card border border-border rounded-card p-6">
  {/* content */}
</div>
```

**Glass Panel (modals, overlays):**
```tsx
<div className="bg-background-elevated/80 backdrop-blur-glass border border-border rounded-card p-6">
  {/* content */}
</div>
```

**Stat Display:**
```tsx
<div className="text-center">
  <p className="font-mono text-stat-lg text-gold">47</p>
  <p className="text-xs text-text-muted mt-1">Profile Views</p>
</div>
```

**Badge:**
```tsx
<span className="px-2.5 py-1 text-xs font-bold rounded-badge bg-success/20 text-success">
  Verified
</span>
```

**Empty State:**
```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="bg-background-input p-4 rounded-full mb-4">
    <IconName className="h-12 w-12 text-text-muted" />
  </div>
  <h3 className="text-lg font-semibold text-text-primary mb-2">No items yet</h3>
  <p className="text-text-secondary mb-6 max-w-sm">Description text here.</p>
  <button className="...primary button...">CTA Label</button>
</div>
```

### Animation Standards

| Interaction | Duration | Easing | Library |
|-------------|----------|--------|---------|
| Page transition | 300ms | ease-out | Framer Motion |
| Card hover | 200ms | ease | CSS transition |
| Modal open | 250ms | spring | Framer Motion |
| Button press | 150ms | ease | CSS transition |
| Sidebar slide | 300ms | ease-out | Framer Motion |
| Gold glow pulse | 2000ms | ease-in-out | CSS keyframes |
| Skeleton shimmer | 1500ms | linear | CSS keyframes |
| Toast enter | 300ms | spring | Framer Motion |
| Toast exit | 200ms | ease-in | Framer Motion |

### Gold Glow Keyframe (add to globals.css)

```css
@keyframes gold-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.15); }
  50% { box-shadow: 0 0 30px rgba(212, 175, 55, 0.35); }
}

.animate-gold-pulse {
  animation: gold-pulse 2s ease-in-out infinite;
}
```

---

## 5. PROJECT STRUCTURE

```
repmax-v2/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (dark mode, fonts, providers)
│   ├── page.tsx                  # Marketing homepage
│   ├── globals.css               # Tailwind imports + custom CSS
│   │
│   ├── (marketing)/              # Public marketing pages
│   │   ├── pricing/page.tsx
│   │   ├── features/page.tsx
│   │   └── about/page.tsx
│   │
│   ├── (auth)/                   # Auth route group
│   │   ├── layout.tsx            # Auth layout (centered, no sidebar)
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   └── onboarding/page.tsx   # AI onboarding flow
│   │
│   ├── (dashboard)/              # Authenticated route group
│   │   ├── layout.tsx            # Dashboard layout (sidebar + topbar)
│   │   │
│   │   ├── athlete/              # Athlete role
│   │   │   ├── page.tsx          # Athlete dashboard
│   │   │   ├── card/
│   │   │   │   ├── page.tsx      # Edit Companion Card
│   │   │   │   └── [id]/page.tsx # Public card view
│   │   │   ├── analytics/page.tsx
│   │   │   ├── film/page.tsx
│   │   │   ├── documents/page.tsx
│   │   │   └── settings/page.tsx
│   │   │
│   │   ├── parent/               # Parent role
│   │   │   ├── page.tsx          # Parent dashboard
│   │   │   └── link/page.tsx     # Link athlete flow
│   │   │
│   │   ├── coach/                # Coach role
│   │   │   ├── page.tsx          # Team dashboard
│   │   │   ├── roster/page.tsx   # Athlete grid
│   │   │   ├── activity/page.tsx # Activity log
│   │   │   └── import/page.tsx   # CSV import
│   │   │
│   │   ├── recruiter/            # Recruiter role
│   │   │   ├── page.tsx          # Recruiter dashboard
│   │   │   ├── search/page.tsx   # Prospect search
│   │   │   ├── shortlists/page.tsx
│   │   │   ├── pipeline/page.tsx # CRM board (Phase 2B)
│   │   │   ├── visits/page.tsx   # Visit scheduler (Phase 2B)
│   │   │   ├── reports/page.tsx  # Reports (Phase 2B)
│   │   │   └── territory/page.tsx # Territory mgr (Phase 2B)
│   │   │
│   │   ├── club/                 # Club organizer role
│   │   │   ├── page.tsx          # Club dashboard
│   │   │   ├── tournament/
│   │   │   │   ├── create/page.tsx
│   │   │   │   ├── [id]/page.tsx      # Tournament hub (7 tabs)
│   │   │   │   └── [id]/score/page.tsx # Live scoring
│   │   │   ├── verification/page.tsx
│   │   │   └── payments/page.tsx
│   │   │
│   │   ├── messages/page.tsx     # Messaging (Phase 2A)
│   │   ├── notifications/page.tsx # Notification prefs (Phase 2A)
│   │   ├── zone-map/page.tsx     # Interactive zone map (Phase 2A)
│   │   └── compare/page.tsx      # Athlete comparison (Phase 2B)
│   │
│   ├── (admin)/                  # Admin route group (Phase 2B)
│   │   ├── layout.tsx
│   │   ├── users/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── moderation/page.tsx
│   │   └── flags/page.tsx
│   │
│   ├── (seo)/                    # Public SEO pages (Phase 2B)
│   │   ├── zone/[slug]/page.tsx
│   │   ├── position/[slug]/page.tsx
│   │   ├── state/[slug]/page.tsx
│   │   └── program/[slug]/page.tsx
│   │
│   ├── card/[id]/page.tsx        # Public Companion Card (no auth)
│   │
│   └── api/                      # API routes
│       ├── auth/callback/route.ts
│       ├── chat/route.ts         # AI onboarding
│       ├── webhooks/
│       │   ├── stripe/route.ts
│       │   └── supabase/route.ts
│       └── mcp/                  # RepMax MCP proxy
│           ├── zones/route.ts
│           ├── prospects/route.ts
│           └── programs/route.ts
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── layout/
│   │   ├── sidebar.tsx           # Role-aware sidebar
│   │   ├── topbar.tsx
│   │   ├── mobile-nav.tsx
│   │   └── role-switcher.tsx
│   ├── cards/
│   │   ├── companion-card.tsx    # The core product
│   │   ├── companion-card-edit.tsx
│   │   └── companion-card-public.tsx
│   ├── widgets/
│   │   ├── zone-pulse-banner.tsx
│   │   ├── calendar-widget.tsx
│   │   ├── prospect-ticker.tsx
│   │   ├── program-rankings.tsx
│   │   ├── notification-bell.tsx
│   │   └── message-badge.tsx
│   ├── tournament/
│   │   ├── bracket-builder.tsx
│   │   ├── live-scoring.tsx
│   │   ├── score-entry.tsx
│   │   └── verification-queue.tsx
│   ├── recruiter/
│   │   ├── search-filters.tsx
│   │   ├── shortlist-card.tsx
│   │   └── pipeline-board.tsx
│   ├── analytics/
│   │   ├── view-chart.tsx
│   │   ├── view-map.tsx
│   │   └── stat-card.tsx
│   └── shared/
│       ├── empty-state.tsx
│       ├── loading-skeleton.tsx
│       ├── star-rating.tsx
│       ├── zone-badge.tsx
│       └── share-sheet.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   ├── middleware.ts          # Auth middleware
│   │   └── types.ts              # Generated types
│   ├── stripe/
│   │   └── client.ts
│   ├── mcp/
│   │   └── repmax.ts             # MCP client
│   ├── sanity/
│   │   └── client.ts
│   ├── hooks/
│   │   ├── use-user.ts
│   │   ├── use-role.ts
│   │   ├── use-realtime.ts
│   │   └── use-debounce.ts
│   ├── stores/
│   │   ├── auth-store.ts
│   │   ├── notification-store.ts
│   │   └── message-store.ts
│   └── utils.ts                  # cn() helper, formatters
│
├── supabase/
│   ├── migrations/               # SQL migrations (see Section 7)
│   ├── seed/                     # Seed data scripts (see repmax-seed-data.md)
│   └── functions/                # Edge Functions
│       ├── send-notification/
│       ├── generate-thumbnail/
│       ├── stripe-webhook/
│       └── weekly-report/
│
├── public/
│   ├── fonts/
│   │   ├── Inter-*.woff2
│   │   └── JetBrainsMono-*.woff2
│   └── images/
│       ├── logo.svg
│       ├── logo-wordmark.svg
│       └── zone-map-base.svg
│
├── stitch-exports/               # Raw Stitch HTML (your working directory)
│   ├── batch-1/
│   ├── batch-2/
│   └── ...
│
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
└── .env.local
```

---

## 6. ENVIRONMENT SETUP

### .env.local

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI (for onboarding chat)
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-ant-...

# Sanity CMS (Phase 2B)
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=

# Mapbox (Phase 2A)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ...

# Resend (Phase 2A)
RESEND_API_KEY=re_...

# RepMax MCP
REPMAX_MCP_ENDPOINT=https://mcp.repmax.com
REPMAX_MCP_API_KEY=

# App URLs
NEXT_PUBLIC_APP_URL=https://app.repmax.com
NEXT_PUBLIC_CARD_URL=https://card.repmax.com
```

### First-Time Setup

```bash
# Clone and install
git clone [repo-url]
cd repmax-v2
npm install

# Install shadcn/ui components
npx shadcn@latest init
npx shadcn@latest add button card dialog input select textarea tabs toast dropdown-menu popover command avatar badge calendar checkbox label radio-group separator sheet skeleton slider switch table tooltip

# Setup Supabase locally
npx supabase init
npx supabase start
npx supabase db push  # Run migrations

# Generate types
npx supabase gen types typescript --local > lib/supabase/types.ts

# Run seed data
npx supabase db seed  # Runs supabase/seed/seed.sql

# Start dev server
npm run dev
```

---

## 7. DATABASE SCHEMA

### Core Tables

```sql
-- ============================================================
-- PROFILES (extends Supabase Auth)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  repmax_id TEXT UNIQUE NOT NULL,        -- REP-XX-XXXX format
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  roles TEXT[] NOT NULL DEFAULT '{}',     -- ['athlete'], ['parent','club'], etc.
  active_role TEXT,                       -- Current active role
  avatar_url TEXT,
  city TEXT,
  state TEXT,
  zone TEXT CHECK (zone IN ('WEST','SOUTHWEST','SOUTHEAST','MIDWEST','NORTHEAST','PLAINS')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ATHLETE PROFILES
-- ============================================================
CREATE TABLE athlete_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  position TEXT,
  class_year INT,
  school TEXT,
  height TEXT,
  weight INT,
  forty_yard DECIMAL(4,2),
  vertical DECIMAL(4,1),
  bench INT,
  squat INT,
  broad_jump TEXT,
  shuttle DECIMAL(4,2),
  three_cone DECIMAL(4,2),
  power_clean INT,
  gpa DECIMAL(3,1),
  sat INT,
  act INT,
  bio TEXT,
  hudl_link TEXT,
  coach_notes TEXT,
  intangibles TEXT,
  verified BOOLEAN DEFAULT FALSE,
  profile_completeness INT DEFAULT 0,     -- 0-100
  UNIQUE(profile_id)
);

-- ============================================================
-- PARENT PROFILES
-- ============================================================
CREATE TABLE parent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship TEXT,                      -- 'mother', 'father', 'guardian'
  UNIQUE(profile_id)
);

CREATE TABLE parent_athlete_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES profiles(id),
  athlete_id UUID NOT NULL REFERENCES profiles(id),
  status TEXT DEFAULT 'pending',          -- 'pending', 'active', 'revoked'
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, athlete_id)
);

-- ============================================================
-- COACH / TEAM
-- ============================================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  school TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zone TEXT,
  coach_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_rosters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES profiles(id),
  status TEXT DEFAULT 'active',           -- 'active', 'inactive', 'graduated'
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, athlete_id)
);

CREATE TABLE coach_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES profiles(id),
  athlete_id UUID REFERENCES profiles(id),
  activity_type TEXT NOT NULL,            -- 'college_visit', 'phone_call', 'offer', 'camp', 'film_update'
  school TEXT,
  notes TEXT,
  activity_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE coach_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES profiles(id),
  text TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',         -- 'high', 'medium', 'low'
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE coach_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES profiles(id),
  athlete_id UUID REFERENCES profiles(id),
  text TEXT NOT NULL,
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RECRUITER
-- ============================================================
CREATE TABLE recruiter_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  school TEXT NOT NULL,                   -- College name
  conference TEXT,
  title TEXT,
  territory TEXT[],                       -- ['WEST', 'SOUTHWEST']
  UNIQUE(profile_id)
);

CREATE TABLE shortlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shortlist_athletes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shortlist_id UUID NOT NULL REFERENCES shortlists(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES profiles(id),
  notes TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(shortlist_id, athlete_id)
);

-- ============================================================
-- CRM PIPELINE (Phase 2B)
-- ============================================================
CREATE TABLE pipeline_prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES profiles(id),
  athlete_id UUID NOT NULL REFERENCES profiles(id),
  stage TEXT NOT NULL DEFAULT 'identified',  -- 'identified', 'contacted', 'evaluating', 'visit_scheduled', 'offered', 'committed'
  priority TEXT DEFAULT 'medium',            -- 'high', 'medium', 'low'
  assigned_staff UUID REFERENCES profiles(id),
  tags TEXT[],
  notes TEXT,
  last_touch TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pipeline_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_prospect_id UUID REFERENCES pipeline_prospects(id),
  recruiter_id UUID NOT NULL REFERENCES profiles(id),
  athlete_id UUID NOT NULL REFERENCES profiles(id),
  comm_type TEXT NOT NULL,               -- 'message', 'email', 'call', 'visit'
  summary TEXT,
  staff_name TEXT,
  comm_date TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scheduled_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES profiles(id),
  athlete_id UUID NOT NULL REFERENCES profiles(id),
  visit_date DATE NOT NULL,
  visit_time TIME,
  visit_type TEXT NOT NULL,              -- 'official', 'unofficial', 'junior_day'
  status TEXT DEFAULT 'pending',         -- 'pending', 'confirmed', 'cancelled'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FILM & DOCUMENTS
-- ============================================================
CREATE TABLE films (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  url TEXT NOT NULL,                      -- Supabase Storage path
  thumbnail_url TEXT,
  duration INT,                          -- seconds
  views INT DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE film_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  film_id UUID NOT NULL REFERENCES films(id) ON DELETE CASCADE,
  recruiter_id UUID NOT NULL REFERENCES profiles(id),
  timestamp_sec INT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES profiles(id),
  doc_type TEXT NOT NULL,                -- 'transcript', 'recommendation', 'test_score'
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROFILE VIEWS & ANALYTICS
-- ============================================================
CREATE TABLE profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES profiles(id),
  viewer_id UUID REFERENCES profiles(id), -- NULL for anonymous
  viewer_role TEXT,
  viewer_zone TEXT,
  viewer_school TEXT,                     -- For recruiter views
  section_viewed TEXT[],                  -- ['stats', 'film', 'academics']
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  type TEXT NOT NULL,                     -- 'profile_view', 'shortlisted', 'message', 'deadline', 'parent_linked', 'zone_activity', 'roster_update', 'registration', 'payment', 'score', 'verification'
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,                            -- Flexible payload
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  event_type TEXT NOT NULL,
  push_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, event_type)
);

-- ============================================================
-- MESSAGING
-- ============================================================
CREATE TABLE message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_ids UUID[] NOT NULL,
  subject TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  body TEXT NOT NULL,
  read_by UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TOURNAMENTS
-- ============================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organizer_id UUID NOT NULL REFERENCES profiles(id),
  city TEXT,
  state TEXT,
  zone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  location TEXT,
  divisions TEXT[],                       -- ['16U', '18U']
  format TEXT,                           -- 'pool_elimination', 'bracket', 'round_robin'
  registration_fee INT,                  -- cents
  max_teams INT,
  status TEXT DEFAULT 'draft',           -- 'draft', 'registration_open', 'registration_closed', 'in_progress', 'completed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tournament_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id),
  team_name TEXT NOT NULL,
  coach_name TEXT,
  division TEXT,
  athlete_count INT DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',  -- 'pending', 'completed', 'refunded'
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tournament_athletes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_team_id UUID NOT NULL REFERENCES tournament_teams(id),
  athlete_id UUID REFERENCES profiles(id),
  athlete_name TEXT NOT NULL,
  verification_status TEXT DEFAULT 'unverified',  -- 'unverified', 'pending_review', 'verified', 'failed'
  verification_method TEXT,               -- 'qr_scan', 'manual', 'repmax_id'
  verified_at TIMESTAMPTZ
);

CREATE TABLE brackets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id),
  division TEXT NOT NULL,
  bracket_type TEXT NOT NULL,             -- 'pool', 'elimination'
  bracket_data JSONB NOT NULL,            -- Flexible bracket structure
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id),
  bracket_id UUID REFERENCES brackets(id),
  division TEXT NOT NULL,
  home_team_id UUID REFERENCES tournament_teams(id),
  away_team_id UUID REFERENCES tournament_teams(id),
  home_score INT,
  away_score INT,
  period TEXT,                           -- 'Q1', 'Q2', 'Q3', 'Q4', 'OT', 'FINAL'
  status TEXT DEFAULT 'upcoming',        -- 'upcoming', 'in_progress', 'completed'
  scheduled_time TIMESTAMPTZ,
  score_log JSONB,                       -- Array of scoring events
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id),
  tournament_team_id UUID NOT NULL REFERENCES tournament_teams(id),
  amount INT NOT NULL,                   -- cents
  platform_fee INT,                      -- cents
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  status TEXT DEFAULT 'pending',         -- 'pending', 'completed', 'refunded', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies

```sql
-- CRITICAL: Enable RLS on ALL tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_profiles ENABLE ROW LEVEL SECURITY;
-- ... (enable on every table)

-- Profiles: users can read all, update own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Athlete profiles: public read, owner write
CREATE POLICY "Athlete profiles are public" ON athlete_profiles FOR SELECT USING (true);
CREATE POLICY "Athletes update own profile" ON athlete_profiles FOR UPDATE
  USING (profile_id = auth.uid());

-- Profile views: athletes see their own views, viewers can insert
CREATE POLICY "Athletes see own views" ON profile_views FOR SELECT
  USING (athlete_id = auth.uid());
CREATE POLICY "Authenticated users can log views" ON profile_views FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Messages: participants only
CREATE POLICY "Thread participants read messages" ON messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM message_threads
    WHERE message_threads.id = messages.thread_id
    AND auth.uid() = ANY(message_threads.participant_ids)
  ));

-- Shortlists: recruiter owns their shortlists
CREATE POLICY "Recruiters manage own shortlists" ON shortlists
  FOR ALL USING (recruiter_id = auth.uid());

-- Pipeline: recruiter's department (same school)
CREATE POLICY "Recruiters see department pipeline" ON pipeline_prospects FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM recruiter_profiles
    WHERE recruiter_profiles.profile_id = auth.uid()
    AND recruiter_profiles.school = (
      SELECT school FROM recruiter_profiles WHERE profile_id = pipeline_prospects.recruiter_id
    )
  ));

-- Tournament data: org members + registered participants can read
CREATE POLICY "Tournament data is readable" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Org owners manage tournaments" ON tournaments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM organizations WHERE organizations.id = org_id AND organizations.organizer_id = auth.uid()
  ));

-- Match scores: org owners can update
CREATE POLICY "Org owners update scores" ON matches FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM tournaments
    JOIN organizations ON organizations.id = tournaments.org_id
    WHERE tournaments.id = matches.tournament_id
    AND organizations.organizer_id = auth.uid()
  ));
```

### Key Indexes

```sql
CREATE INDEX idx_profile_views_athlete ON profile_views(athlete_id, viewed_at DESC);
CREATE INDEX idx_profile_views_viewer ON profile_views(viewer_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);
CREATE INDEX idx_messages_thread ON messages(thread_id, created_at);
CREATE INDEX idx_athlete_profiles_position ON athlete_profiles(position);
CREATE INDEX idx_athlete_profiles_zone ON athlete_profiles(class_year);
CREATE INDEX idx_matches_tournament ON matches(tournament_id, status);
CREATE INDEX idx_pipeline_recruiter ON pipeline_prospects(recruiter_id, stage);
CREATE INDEX idx_team_rosters_team ON team_rosters(team_id);
CREATE INDEX idx_profiles_zone ON profiles(zone);
```

---

## 8. AUTHENTICATION & AUTHORIZATION

### Auth Flow

```
Sign Up → Email/Password (Supabase Auth)
       → Select Role(s)
       → AI Onboarding (collects profile data via chat)
       → Dashboard (role-specific)
```

### Role Enforcement

```typescript
// lib/hooks/use-role.ts
export function useRole() {
  const user = useUser();
  const activeRole = user?.user_metadata?.active_role;
  const roles = user?.user_metadata?.roles || [];

  return {
    activeRole,      // Current dashboard view
    roles,           // All user roles
    isAthlete: roles.includes('athlete'),
    isParent: roles.includes('parent'),
    isCoach: roles.includes('coach'),
    isRecruiter: roles.includes('recruiter'),
    isClub: roles.includes('club'),
    isAdmin: roles.includes('admin'),
    canSwitchRole: roles.length > 1,
  };
}
```

### Role → Route Mapping

| Role | Dashboard Route | Sidebar Items |
|------|----------------|---------------|
| athlete | `/athlete` | Dashboard, Card, Analytics, Film, Documents, Messages, Settings |
| parent | `/parent` | Dashboard, Calendar, Messages, Settings |
| coach | `/coach` | Dashboard, Roster, Activity Log, Messages, Settings |
| recruiter | `/recruiter` | Dashboard, Search, Shortlists, Pipeline, Visits, Reports, Messages |
| club | `/club` | Dashboard, Tournaments, Verification, Payments, Settings |
| admin | `/admin` | Users, Analytics, Moderation, Feature Flags |

### NCAA Compliance Rules (Enforce in Code)

| Action | Allowed | Blocked |
|--------|---------|---------|
| Recruiter → Coach message | ✅ | — |
| Coach → Recruiter message | ✅ | — |
| Parent → Coach message | ✅ | — |
| Athlete → Recruiter message | ❌ | Show compliance warning |
| Recruiter → Athlete message | ❌ | Show compliance warning |
| View any public card | ✅ | — |
| Athlete shares own card | ✅ | — |
| Parent shares linked card | ✅ | — |

---

## 9. API ENDPOINTS

### Supabase Direct (Client-Side)

Most data access goes through Supabase client directly with RLS. These are NOT API routes — they're client-side Supabase SDK calls.

```typescript
// Example: Fetch athlete dashboard data
const { data: profile } = await supabase
  .from('athlete_profiles')
  .select('*, profiles(*)')
  .eq('profile_id', userId)
  .single();

const { data: views } = await supabase
  .from('profile_views')
  .select('*')
  .eq('athlete_id', userId)
  .gte('viewed_at', thirtyDaysAgo)
  .order('viewed_at', { ascending: false });
```

### Next.js API Routes (Server-Side)

These exist for operations that need server secrets or complex logic:

```
POST   /api/auth/callback          # Supabase auth callback
POST   /api/chat                   # AI onboarding conversation
POST   /api/webhooks/stripe        # Stripe payment webhooks
POST   /api/webhooks/supabase      # Supabase database webhooks

GET    /api/mcp/zones              # Proxy to RepMax MCP → get_zones
GET    /api/mcp/zones/:zone        # Proxy → get_zone
GET    /api/mcp/prospects          # Proxy → get_prospects (with filters)
GET    /api/mcp/prospects/position/:pos  # Proxy → get_top_prospects_by_position
GET    /api/mcp/prospects/zone/:zone     # Proxy → get_top_prospects_by_zone
GET    /api/mcp/programs           # Proxy → get_programs
GET    /api/mcp/calendar           # Proxy → get_calendar_context
GET    /api/mcp/portal             # Proxy → get_portal_update
GET    /api/mcp/rankings           # Proxy → get_class_rankings
```

### RepMax MCP Endpoints (Available Data)

The RepMax MCP connector provides these read-only endpoints. **All zone intelligence, prospect data, and program data comes from MCP, not from your Supabase database.** Your database stores user profiles and platform data. MCP stores recruiting intelligence.

| MCP Method | Parameters | Returns |
|------------|-----------|---------|
| `get_zones` | — | All 6 zones with athlete counts, program counts, events |
| `get_zone` | zone: string | Single zone detail |
| `get_prospects` | position?, state?, zone?, minStars?, limit? | Filtered prospect list |
| `get_top_prospects_by_position` | position, limit? | Top prospects at position |
| `get_top_prospects_by_zone` | zone, limit? | Top prospects in zone |
| `get_programs` | state?, zone?, limit? | High school programs |
| `get_calendar_context` | — | Current recruiting period, deadlines |
| `get_portal_update` | — | Transfer portal status |
| `get_class_rankings` | limit? | Class rankings |

---

## 10. STITCH → CODE CONVERSION WORKFLOW

### Overview

```
Stitch Prompt (from batch files)
        ↓
  Paste into Google Stitch
        ↓
  Stitch generates HTML + CSS
        ↓
  Export/copy HTML
        ↓
  Save to stitch-exports/batch-N/screen-name.html
        ↓
  Convert to Next.js component
        ↓
  Wire up data (Supabase + MCP)
        ↓
  Test with seed data
        ↓
  Ship
```

### Conversion Rules

1. **Replace inline styles with Tailwind classes.** Stitch outputs inline CSS — convert every style to Tailwind utility classes.

2. **Replace static text with props/data.** Every hardcoded name, number, or label in Stitch output should become a prop or a data-fetched value.

3. **Split into components.** If Stitch gives you a full page, extract repeating elements (cards, rows, badges) into reusable components.

4. **Add interactivity.** Stitch gives you visual HTML. You add: `onClick` handlers, `onChange` for forms, `useState` for local state, Supabase queries for data.

5. **Implement all states.** Every screen has: loading (skeleton), empty (empty state component), error (error boundary), and loaded (the Stitch design). Stitch only gives you "loaded."

6. **Use shadcn/ui for complex interactions.** Dialog, DropdownMenu, Command (search), Sheet (mobile drawers), Toast — use shadcn/ui even though Stitch may render its own version.

7. **Preserve the design system exactly.** The gold (#D4AF37), the dark backgrounds, the Inter + JetBrains Mono fonts, the 8px grid — these are non-negotiable.

### Example Conversion

**Stitch HTML (fragment):**
```html
<div style="background: #1F1F22; border: 1px solid #2A2A2E; border-radius: 12px; padding: 24px;">
  <h3 style="color: #fff; font-size: 16px; font-weight: 600;">Jaylen Washington</h3>
  <p style="color: #D4AF37; font-family: 'JetBrains Mono'; font-size: 24px; font-weight: 700;">47</p>
  <p style="color: #6B7280; font-size: 12px;">Profile Views</p>
</div>
```

**Converted Next.js:**
```tsx
interface StatCardProps {
  name: string;
  value: number;
  label: string;
}

export function StatCard({ name, value, label }: StatCardProps) {
  return (
    <div className="bg-background-card border border-border rounded-card p-6">
      <h3 className="text-base font-semibold text-text-primary">{name}</h3>
      <p className="font-mono text-stat-lg text-gold">{value}</p>
      <p className="text-xs text-text-muted">{label}</p>
    </div>
  );
}
```

---

## 11. SCREEN-BY-SCREEN BUILD SPECIFICATIONS

### How to Read These Specs

Each screen lists:
- **Route:** Next.js App Router path
- **Data:** What to fetch and from where
- **Interactions:** Every clickable/interactive element
- **States:** All UI states to implement
- **Stitch Prompt Location:** Which batch file contains the prompt

---

### BATCH 1: Marketing + Public (3 screens)

#### 1.1 Marketing Homepage
- **Route:** `/` (app/page.tsx)
- **Data:** Static content + MCP `get_zones` for live zone stats
- **Interactions:** "Get Started" → `/sign-up`, "Sign In" → `/sign-in`, pricing toggle (monthly/annual), mobile hamburger menu
- **States:** loaded only (public page)
- **Prompt:** `repmax-stitch-batch-plan.md` → Batch 1, Screen 1.1

#### 1.2 Pricing Page
- **Route:** `/pricing`
- **Data:** Static pricing tiers
- **Tiers:** Free ($0), Pro ($9.99/mo), Team ($29.99/mo), Scout (Contact)
- **Interactions:** Toggle monthly/annual (20% discount), "Start Free" / "Upgrade" CTAs, FAQ accordion
- **States:** loaded only
- **Prompt:** Batch 1, Screen 1.2

#### 1.3 Public Companion Card
- **Route:** `/card/[id]`
- **Data:** Supabase `athlete_profiles` + `profiles` + `films` (public, no auth required)
- **Interactions:** Share button (native share API), QR code display, "Claim your card" CTA for non-users
- **States:** loading, loaded, not-found (404)
- **Prompt:** Batch 3, Screen 3.3

---

### BATCH 2: Auth + Onboarding (4 screens)

#### 2.1 Sign In
- **Route:** `/sign-in`
- **Data:** None (form submission → Supabase Auth)
- **Interactions:** Email/password form, "Forgot password" link, "Sign up" link, social auth buttons (Google, Apple)
- **States:** idle, submitting, error (invalid credentials), success (redirect to dashboard)
- **Prompt:** Batch 2, Screen 2.1

#### 2.2 Sign Up
- **Route:** `/sign-up`
- **Data:** None (form submission → Supabase Auth)
- **Interactions:** Email/password/confirm form, terms checkbox, "Sign in" link
- **States:** idle, submitting, validation-error, email-sent (check your inbox), success
- **Prompt:** Batch 2, Screen 2.2

#### 2.3 Role Selection
- **Route:** `/onboarding` (step 1)
- **Data:** Write to `profiles.roles`
- **Interactions:** 5 role cards (Athlete, Parent, Coach, Recruiter, Club), multi-select allowed, "Continue" button
- **States:** idle, selected (1+ roles highlighted), submitting
- **Prompt:** Batch 2, Screen 2.3

#### 2.4 AI Onboarding Chat
- **Route:** `/onboarding` (step 2)
- **Data:** AI chat via `/api/chat` → writes to `profiles` + role-specific table
- **Interactions:** Chat input, send button, AI responses with typing indicator, "Skip" link, progress indicator
- **States:** chatting, processing (AI thinking), complete (redirect to dashboard)
- **Prompt:** Batch 2, Screen 2.4 — Also see `repmax-ai-onboarding.jsx` for working prototype

---

### BATCH 3: Athlete Dashboard + Companion Card (5 screens)

#### 3.1 Athlete Dashboard
- **Route:** `/athlete`
- **Data:** `athlete_profiles`, `profile_views` (last 30d), `shortlist_athletes` (where athlete_id = me), `notifications` (latest 5), MCP `get_zone` for zone pulse
- **Interactions:** Edit card link, view analytics link, share card button, notification bell
- **States:** loading, loaded (ideal: Jaylen), loaded (partial: Marcus), loaded (empty: Tyler)
- **Prompt:** Batch 3, Screen 3.1

#### 3.2 Companion Card Edit
- **Route:** `/athlete/card`
- **Data:** Full `athlete_profiles` + `profiles` data
- **Interactions:** Inline editing for every field, photo upload (Supabase Storage), auto-save on blur, completeness progress bar, "Preview" toggle
- **States:** loading, editing, saving, saved (toast), validation-error
- **Prompt:** Batch 3, Screen 3.2

#### 3.3 Companion Card Public View
- **Route:** `/card/[id]` (same as 1.3 but detailed here)
- **Data:** Public athlete data + films
- **Interactions:** Share, QR code, "Contact Coach" (for recruiters only)
- **Prompt:** Batch 3, Screen 3.3

#### 3.4 Athlete Dashboard (Mobile)
- **Route:** Same as 3.1, responsive
- **Data:** Same as 3.1
- **Interactions:** Bottom tab navigation, pull-to-refresh, swipe between card/stats
- **Prompt:** Batch 3, Screen 3.4

#### 3.5 Share Card Sheet (Mobile)
- **Route:** Modal/sheet on mobile
- **Interactions:** Copy link, share to SMS, share to email, share to social, QR code tab
- **Prompt:** Batch 3, Screen 3.5

---

### BATCH 4: Parent Dashboard (4 screens)

#### 4.1 Parent Dashboard
- **Route:** `/parent`
- **Data:** `parent_athlete_links` → linked athlete's `athlete_profiles`, `profile_views`, `shortlist_athletes`, recruiting calendar from MCP `get_calendar_context`
- **Interactions:** View linked athlete's card, share card, calendar view, "Link Athlete" if unlinked
- **States:** loading, loaded-linked (Lisa), loaded-unlinked (Karen), empty
- **Prompt:** Batch 4, Screen 4.1

#### 4.2 Link Athlete Modal
- **Route:** Modal on parent dashboard
- **Data:** Search `profiles` by name, or look up by `repmax_id`
- **Interactions:** 3 methods: Search by name, enter RepMax ID, scan QR code. Send link request → athlete confirms.
- **States:** idle, searching, found, not-found, request-sent, linked
- **Prompt:** Batch 4, Screen 4.2

#### 4.3 Parent Calendar
- **Route:** Widget on parent dashboard
- **Data:** MCP `get_calendar_context`
- **Key feature:** Parent-friendly language (plain English explanations of recruiting periods)
- **Prompt:** Batch 4, Screen 4.3

#### 4.4 Parent Dashboard (Mobile)
- **Route:** Same as 4.1, responsive
- **Prompt:** Batch 4, Screen 4.4

---

### BATCH 5: Team Dashboard / Coach (5 screens)

#### 5.1 Team Dashboard
- **Route:** `/coach`
- **Data:** `teams` + `team_rosters` → athlete profiles, aggregated stats (total views, shortlists, offers, completeness avg), MCP zone data
- **Interactions:** View roster, add athlete, activity log, zone pulse widget
- **States:** loading, loaded (Coach Davis: 12 athletes), empty (no roster)
- **Prompt:** Batch 5, Screen 5.1

#### 5.2 Athlete Grid
- **Route:** `/coach/roster`
- **Data:** `team_rosters` joined with `athlete_profiles` and `profiles`
- **Interactions:** Filter by position/class/status, sort by name/position/completeness, click athlete → detail view, bulk actions
- **States:** loading, loaded, filtered-empty
- **Prompt:** Batch 5, Screen 5.2

#### 5.3 Add Athlete Modal
- **Route:** Modal on roster page
- **Interactions:** Search existing RepMax users, invite by email, create manually
- **States:** idle, searching, found, invited, added
- **Prompt:** Batch 5, Screen 5.3

#### 5.4 CSV Roster Import
- **Route:** `/coach/import`
- **Data:** Parse CSV → match against `profiles` by email or repmax_id
- **Interactions:** Drag-drop CSV, column mapping, review matches (matched/new/duplicate), confirm import
- **States:** upload, mapping, matching, review, importing, complete
- **Test file:** See seed data document for test CSV with expected match results
- **Prompt:** Batch 5, Screen 5.4

#### 5.5 Coach Dashboard (Mobile)
- **Route:** Same as 5.1, responsive
- **Prompt:** Batch 5, Screen 5.5

---

### BATCH 6: Recruiter Dashboard (5 screens)

#### 6.1 Recruiter Search
- **Route:** `/recruiter/search`
- **Data:** MCP `get_prospects` with filters, also search `athlete_profiles` in Supabase
- **Interactions:** Filters: position, zone, state, class year, min stars. Results as card grid. Click → view card. Checkbox → compare/add to shortlist.
- **States:** loading, loaded, no-results, filtered-empty
- **Prompt:** Batch 6, Screen 6.1

#### 6.2 Companion Card (Recruiter View)
- **Route:** Modal or `/card/[id]` with recruiter context
- **Data:** Full athlete profile + films + film bookmarks (recruiter's own)
- **Interactions:** Add to shortlist, add film bookmark (timestamp + note), contact coach, print/export
- **Additional:** Recruiter sees "Add to Pipeline" button (Phase 2B)
- **Prompt:** Batch 6, Screen 6.2

#### 6.3 Shortlists Manager
- **Route:** `/recruiter/shortlists`
- **Data:** `shortlists` + `shortlist_athletes` with joined athlete data
- **Interactions:** Create shortlist, rename, delete, remove athlete, notes per athlete, drag to reorder
- **States:** loading, loaded (Williams: 2 lists), empty
- **Prompt:** Batch 6, Screen 6.3

#### 6.4 Recruiter Dashboard
- **Route:** `/recruiter`
- **Data:** Aggregated shortlist stats, recent views, MCP zone data, pipeline summary (Phase 2B)
- **Interactions:** Quick search, recent activity, zone pulse, shortlist preview cards
- **Prompt:** Batch 6, Screen 6.4

#### 6.5 Recruiter Dashboard (Mobile)
- **Route:** Same as 6.4, responsive
- **Prompt:** Batch 6, Screen 6.5

---

### BATCH 7: Club + Tournament (9 screens)

#### 7.1 Club Dashboard
- **Route:** `/club`
- **Data:** `organizations`, `tournaments` (org's tournaments), payment summary
- **Prompt:** Batch 7, Screen 7.1

#### 7.2 Tournament Creation Wizard
- **Route:** `/club/tournament/create`
- **Data:** Write to `tournaments`
- **Steps:** Basic info → Divisions → Schedule → Registration → Payment → Review → Publish
- **Prompt:** Batch 7, Screen 7.2

#### 7.3 Tournament Hub (7-tab view)
- **Route:** `/club/tournament/[id]`
- **Tabs:** Overview, Teams, Brackets, Schedule, Scores, Verification, Payments
- **Data:** Full tournament data tree
- **Prompt:** Batch 7, Screen 7.3

#### 7.4 Bracket Builder
- **Route:** Tab within tournament hub
- **Interactions:** Visual bracket editor, drag teams into pools, auto-generate elimination bracket from pool results
- **Prompt:** Batch 7, Screen 7.4

#### 7.5 Live Scoring
- **Route:** `/club/tournament/[id]/score`
- **Data:** Supabase Realtime subscription on `matches` table
- **Interactions:** Score buttons (+6 TD, +3 FG, +2 safety, +1/+2 PAT), period advancement, undo last score
- **Real-time:** Changes broadcast to all connected clients immediately
- **Prompt:** Batch 7, Screen 7.5

#### 7.6 Score Entry (Mobile)
- **Route:** Same as 7.5, mobile-optimized
- **Interactions:** Large touch targets, swipe between games, haptic feedback on score entry
- **Prompt:** Batch 7, Screen 7.6

#### 7.7 Athlete Verification Queue
- **Route:** `/club/verification`
- **Data:** `tournament_athletes` with verification_status
- **Interactions:** Scan QR (RepMax ID), manual lookup, approve/reject, age check
- **Prompt:** Batch 7, Screen 7.7

#### 7.8 Payment Dashboard
- **Route:** `/club/payments`
- **Data:** `payments` + Stripe Connect account status
- **Interactions:** View transactions, send reminders to unpaid teams, view payout schedule
- **Prompt:** Batch 7, Screen 7.8

#### 7.9 Club Dashboard (Mobile)
- **Route:** Same as 7.1, responsive
- **Prompt:** Batch 7, Screen 7.9

---

### BATCH 8: Shared Components (7 components)

These are not standalone screens — they appear across multiple dashboards.

#### 8.1 Role Switcher
- **Location:** Sidebar header (for multi-role users like Sofia)
- **Data:** `profiles.roles`
- **Interactions:** Dropdown showing available roles, switching changes sidebar nav + dashboard route

#### 8.2 Zone Pulse Banner
- **Location:** Top of every dashboard
- **Data:** MCP `get_zone` for user's zone
- **Displays:** Zone name, color, athlete count, program count, trending indicator

#### 8.3 Calendar Widget
- **Location:** Dashboard sidebar or section
- **Data:** MCP `get_calendar_context`
- **Displays:** Current recruiting period, upcoming deadlines with countdown
- **Special:** Parent view uses plain-language descriptions

#### 8.4 Prospect Ticker
- **Location:** Dashboard widget
- **Data:** MCP `get_top_prospects_by_zone` for user's zone
- **Displays:** Scrolling horizontal list of top prospects with position, school, stars

#### 8.5 Program Rankings Widget
- **Location:** Dashboard sidebar
- **Data:** MCP `get_programs` for user's zone
- **Displays:** Top 10 programs by athlete count or ranking

#### 8.6 Class Rankings Widget
- **Location:** Dashboard sidebar
- **Data:** MCP `get_class_rankings`
- **Displays:** Top recruiting classes by school

#### 8.7 Loading Skeletons
- **Location:** Every screen's loading state
- **Pattern:** Match layout of loaded state with shimmer animations on #2A2A2E backgrounds

---

### PHASE 2A Screens (19 screens)

**Prompts in:** `repmax-phase-2a-sprint-1-2-notifications-messaging.md` and `repmax-phase-2a-sprint-3-4-analytics-zonemap.md`

| Screen | Route | Key Data Source | Key Interactions |
|--------|-------|----------------|-----------------|
| Notification Center | Dropdown from bell icon | `notifications` + Realtime | Mark read, filter by type, click to navigate |
| Notification Preferences | `/notifications` | `notification_preferences` | Toggle push/email per event type |
| Push Permission Prompt | Mobile modal | — | Accept/decline with value prop |
| Email Templates | Backend only (Resend) | — | 4 HTML templates |
| Message Inbox | `/messages` | `message_threads` + `messages` + Realtime | Two-panel (list + thread), search, filter |
| Compose Message | Modal | `profiles` search | Recipient autocomplete, NCAA compliance check |
| Message Thread | Right panel of inbox | `messages` + Realtime | Send reply, read receipts, typing indicator |
| Message Badge | Nav component | `messages` (unread count) | Real-time unread count |
| Inbox Mobile | `/messages` (mobile) | Same as inbox | Full-screen list, swipe actions |
| Profile Analytics | `/athlete/analytics` | `profile_views`, `shortlist_athletes` | Time range selector, charts (Recharts) |
| View Map | Within analytics | `profile_views` (geographic) | D3.js/Mapbox US map with heat dots |
| Film Manager | `/athlete/film` | `films` + Supabase Storage | Upload, set featured, delete, reorder |
| Film Player | Modal or inline | `films` + `film_bookmarks` | Play, bookmark (recruiter), share with timestamp |
| Film Upload Mobile | Bottom sheet | Supabase Storage | Record, camera roll, paste link, progress bar |
| Zone Map Full Page | `/zone-map` | MCP all zone endpoints | Interactive US map, click zone/state |
| Zone Detail Panel | Slide-out on map | MCP `get_zone` + `get_top_prospects_by_zone` | Stats, top prospects, programs, events |
| State Drill-Down | Within zone map | MCP `get_prospects(state)` + `get_programs(state)` | Programs table, athletes grid |
| Map Widget | Dashboard sidebar | MCP `get_zone` | Mini map, user's zone highlighted |

---

### PHASE 2B Screens (15 screens)

**Prompts in:** `repmax-phase-2b-crm-seo-admin-cleanup.md`

| Screen | Route | Key Data Source | Key Interactions |
|--------|-------|----------------|-----------------|
| Pipeline Board | `/recruiter/pipeline` | `pipeline_prospects` | Kanban drag-and-drop, 6 stages, filter |
| Prospect Detail CRM | Modal from pipeline | `pipeline_prospects` + `pipeline_communications` | Stage change, priority, timeline, notes |
| Visit Scheduler | `/recruiter/visits` | `scheduled_visits` | Calendar view, create/confirm visits |
| Communication Log | `/recruiter/communications` | `pipeline_communications` | Table view, manual log entry |
| Recruiter Reports | `/recruiter/reports` | Aggregated pipeline data | Funnel visualization, conversion rates |
| Territory Manager | `/recruiter/territory` | `recruiter_profiles.territory` | Drag zone assignments between staff |
| Athlete Comparison | `/compare` | `athlete_profiles` (2-4 athletes) | Side-by-side table, best-in-row highlight |
| Zone Content Page | `/zone/[slug]` | Sanity CMS + MCP | Public CMS page with live data |
| Program Spotlight | `/program/[slug]` | Sanity CMS + Supabase | Public school profile |
| SEO Position Page | `/position/[slug]` | MCP `get_top_prospects_by_position` | Auto-generated, ISR |
| SEO State Page | `/state/[slug]` | MCP `get_prospects(state)` + `get_programs(state)` | Auto-generated, ISR |
| Admin Users | `/admin/users` | `profiles` (admin only) | Search, suspend, role change |
| Admin Analytics | `/admin/analytics` | Aggregated platform data | DAU/WAU/MAU charts, signup trends |
| Content Moderation | `/admin/moderation` | Flagged content queue | Approve/remove/warn |
| Feature Flags | `/admin/flags` | Feature flags table | Toggle on/off, scope selection |

---

### PRP CLEANUP Screens (5 screens)

| Screen | Location | Data Source |
|--------|----------|-------------|
| Coach Tasks Widget | Coach dashboard sidebar | `coach_tasks` |
| Coach Notes Widget | Coach dashboard sidebar | `coach_notes` |
| Documents Page | `/athlete/documents` | `documents` + Supabase Storage |
| Success Stories | Marketing homepage section | Sanity CMS |
| Featured Athletes | Dashboard widget | `profile_views` (algorithmic) |

---

## 12. FORM SPECIFICATIONS

### Sign Up Form

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | email | Yes | Valid email format |
| password | password | Yes | Min 8 chars, 1 uppercase, 1 number |
| confirm_password | password | Yes | Must match password |
| terms | checkbox | Yes | Must be checked |

**Submit:** `supabase.auth.signUp({ email, password })`
**Success:** Redirect to `/onboarding`
**Error:** Display inline field errors

### Companion Card Edit Form

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| position | select | Yes | From position list |
| class_year | select | Yes | 2025-2030 |
| school | text | Yes | 2-100 chars |
| height | text | No | Format: 5'10" or 6'1" |
| weight | number | No | 100-400 |
| forty_yard | number | No | 3.00-6.00 |
| vertical | number | No | 15.0-50.0 |
| bench | number | No | 50-500 |
| squat | number | No | 100-700 |
| broad_jump | text | No | Format: 9'6" |
| shuttle | number | No | 3.50-6.00 |
| three_cone | number | No | 5.50-9.00 |
| power_clean | number | No | 50-500 |
| gpa | number | No | 0.0-4.0 |
| sat | number | No | 400-1600 |
| act | number | No | 1-36 |
| bio | textarea | No | Max 500 chars |
| coach_notes | textarea | No | Max 1000 chars (coach fills) |
| intangibles | textarea | No | Max 300 chars |

**Submit:** Auto-save on blur via `supabase.from('athlete_profiles').update()`
**Validation:** Real-time inline
**Completeness:** Recalculate after every save, update `profile_completeness`

### Tournament Creation Wizard

**Step 1 — Basic Info:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | text | Yes | 3-100 chars |
| start_date | date | Yes | Must be future |
| end_date | date | Yes | >= start_date |
| location | text | Yes | 3-200 chars |

**Step 2 — Divisions:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| divisions | multi-select | Yes | At least 1: 14U, 16U, 18U |
| format | select | Yes | pool_elimination, bracket, round_robin |
| max_teams | number | Yes | Per division, 4-32 |

**Step 3 — Registration:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| registration_fee | number | Yes | 0-10000 (in dollars) |
| registration_deadline | date | No | Before start_date |

**Submit:** `supabase.from('tournaments').insert()`
**Success:** Redirect to tournament hub

---

## 13. UI STATE TYPES

Every screen must implement all applicable states. Copy-paste these TypeScript types:

```typescript
// Base state pattern used across all screens
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: string; retry?: () => void }
  | { status: 'empty'; message: string; action?: { label: string; onClick: () => void } }
  | { status: 'loaded'; data: T };

// Specific screen states
type AthleteProfileState = AsyncState<{
  profile: AthleteProfile;
  views: ProfileView[];
  shortlists: ShortlistEntry[];
  films: Film[];
}>;

type ParentDashboardState =
  | { status: 'loading' }
  | { status: 'unlinked' }           // No athlete linked yet
  | { status: 'pending' }            // Link request sent, awaiting confirmation
  | { status: 'linked'; athlete: AthleteProfile; views: ProfileView[] };

type TeamDashboardState = AsyncState<{
  team: Team;
  roster: RosterAthlete[];
  stats: TeamStats;
}>;

type SearchState =
  | { status: 'idle' }               // Fresh search page
  | { status: 'searching' }          // Loading results
  | { status: 'results'; data: Prospect[]; total: number }
  | { status: 'no-results'; query: string }
  | { status: 'error'; error: string };

type TournamentState =
  | { status: 'loading' }
  | { status: 'draft' }              // Not yet published
  | { status: 'registration_open' }  // Accepting teams
  | { status: 'in_progress' }        // Games happening
  | { status: 'completed' };         // Tournament finished

type LiveScoreState =
  | { status: 'loading' }
  | { status: 'upcoming'; scheduledTime: string }
  | { status: 'live'; match: Match }   // Real-time updates
  | { status: 'final'; match: Match };

type FormState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; message?: string }
  | { status: 'error'; errors: Record<string, string> };
```

---

## 14. REAL-TIME FEATURES

### Supabase Realtime Subscriptions

```typescript
// Notification listener (runs in layout)
useEffect(() => {
  const channel = supabase
    .channel('notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
    }, (payload) => {
      addNotification(payload.new);
      // Show toast
      // Update badge count
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [userId]);

// Live scoring listener
useEffect(() => {
  const channel = supabase
    .channel(`match-${matchId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'matches',
      filter: `id=eq.${matchId}`,
    }, (payload) => {
      setMatch(payload.new);
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [matchId]);

// Messaging listener
useEffect(() => {
  const channel = supabase
    .channel(`thread-${threadId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `thread_id=eq.${threadId}`,
    }, (payload) => {
      addMessage(payload.new);
      markAsRead(payload.new.id);
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [threadId]);
```

### Real-Time Feature Matrix

| Feature | Table | Event | Subscribers |
|---------|-------|-------|-------------|
| Notifications | `notifications` | INSERT | The target user (via `user_id` filter) |
| Messages | `messages` | INSERT | Thread participants (via `thread_id` filter) |
| Live scoring | `matches` | UPDATE | Anyone viewing the match (via `id` filter) |
| Profile view tracking | `profile_views` | INSERT | The athlete (via `athlete_id` filter) |
| Tournament registration | `tournament_teams` | INSERT | The tournament org owner |
| Payment received | `payments` | UPDATE | The tournament org owner |

---

## 15. INTEGRATIONS

### Stripe Connect (Tournament Payments)

**Setup:** Org owners connect their Stripe account via Stripe Connect Express flow.

**Payment flow:**
1. Team clicks "Register" on tournament
2. Client creates Checkout Session via API route
3. Stripe redirects to payment page
4. On success: webhook updates `payments.status = 'completed'` and `tournament_teams.payment_status = 'completed'`
5. Platform takes 15% fee
6. Remainder transfers to org owner's connected account

**Webhook endpoint:** `POST /api/webhooks/stripe`
**Events to handle:** `checkout.session.completed`, `payment_intent.succeeded`, `transfer.created`

### Sanity CMS (Phase 2B)

**Content types:**
- Zone Landing Page: title, description (rich text), featured image, zone reference
- Program Spotlight: name, logo, location, description, coaching staff, stats
- Success Story: athlete name, quote, photo, commitment school, star rating

**Query pattern:**
```typescript
// lib/sanity/client.ts
import { createClient } from 'next-sanity';

export const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

// Fetch zone content
const zone = await sanity.fetch(`*[_type == "zoneLanding" && slug.current == $slug][0]`, { slug });
```

### Resend (Transactional Email — Phase 2A)

**Templates needed:**
1. Profile viewed by recruiter
2. Added to shortlist
3. Weekly digest (stats card)
4. Deadline reminder

**Trigger:** Supabase Edge Function on database trigger or cron

### Mapbox GL JS (Zone Map — Phase 2A)

**Map requirements:**
- US map with 6 color-coded zone polygons at 15% opacity
- Heat dots at metro areas (sized by athlete count)
- Click zone → slide-in detail panel
- Click state → drill-down view
- Toggle layers: Prospects, Programs, Events, Recruiters

---

## 16. MOBILE (EXPO)

### Expo Project Structure

```
repmax-mobile/
├── app/                    # Expo Router (file-based)
│   ├── (tabs)/
│   │   ├── _layout.tsx     # Tab navigator
│   │   ├── index.tsx       # Dashboard
│   │   ├── card.tsx        # Companion Card
│   │   ├── messages.tsx    # Inbox
│   │   └── settings.tsx    # Settings
│   ├── (auth)/
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   └── tournament/
│       └── score.tsx       # Live scoring
├── components/             # Shared components
├── lib/                    # Supabase client, hooks
└── tailwind.config.ts      # NativeWind config (same tokens)
```

### Mobile-Specific Patterns

- **Bottom tab navigation** for primary navigation
- **Stack navigation** for drill-down flows
- **Bottom sheets** for actions (share, upload, filters)
- **Pull-to-refresh** on all list views
- **Haptic feedback** on score entry
- **Offline mode** for tournament scoring (queue changes, sync when online)
- **Push notifications** via Expo Notifications
- **Camera access** for QR scanning (athlete verification)
- **Biometric auth** (Face ID / fingerprint) for returning users

### App Store Builds (Phase 2B)

```bash
# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## 17. SEO & PERFORMANCE

### SEO Pages (Phase 2B)

All SEO pages use ISR (Incremental Static Regeneration):

```typescript
// app/(seo)/zone/[slug]/page.tsx
export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  return [
    { slug: 'northeast' },
    { slug: 'southeast' },
    { slug: 'midwest' },
    { slug: 'southwest' },
    { slug: 'west' },
    { slug: 'plains' },
  ];
}

export async function generateMetadata({ params }) {
  return {
    title: `${params.slug} Zone Recruiting | RepMax`,
    description: `College football recruiting intelligence for the ${params.slug} zone...`,
    openGraph: { ... },
  };
}
```

### Structured Data

Every public page includes JSON-LD:

```typescript
// Companion Card page
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: athlete.full_name,
  description: athlete.bio,
  memberOf: { '@type': 'SportsTeam', name: athlete.school },
};
```

### Performance Targets

| Metric | Target | How |
|--------|--------|-----|
| LCP | < 2.5s | Server components, image optimization |
| FID | < 100ms | Client component code splitting |
| CLS | < 0.1 | Skeleton layouts matching content |
| TTI | < 3.5s | Lazy load below-fold content |
| Bundle size | < 200KB first load | Tree shaking, dynamic imports |

---

## 18. TESTING & SEED DATA

### Seed Data Users

See `repmax-seed-data.md` for complete data. Summary of 11 test users:

| User | Role | Tests |
|------|------|-------|
| Jaylen Washington | Athlete (100%) | Golden path — all features work |
| Marcus Thompson | Athlete (45%) | Incomplete profile, empty states, upgrade prompts |
| DeShawn Harris | Athlete (new) | Just onboarded, near-empty everything |
| Sofia Rodriguez | Athlete + Club | Multi-role switching |
| Tyler Chen | Athlete (abandoned) | Every single empty state |
| Lisa Washington | Parent (linked) | Full parent experience |
| Karen Thompson | Parent (unlinked) | Link athlete flow testing |
| Coach Davis | Coach | Full roster (12 athletes), tasks, notes |
| Coach Williams | Recruiter (TCU) | Full CRM pipeline, shortlists, visits |
| Coach Martinez | Recruiter (ASU) | Second recruiter, territory testing |
| Mike Torres | Club Organizer | Active tournament, live game, payments |

### Testing Checklist Per Screen

For every screen you build, verify:

- [ ] **Loading state** — Shows skeleton while data loads
- [ ] **Empty state** — Shows empty state component when no data
- [ ] **Error state** — Shows error message with retry option
- [ ] **Loaded state** — Shows correct data from seed users
- [ ] **Mobile responsive** — Works at 375px, 428px, 768px, 1024px, 1440px
- [ ] **Keyboard navigation** — Tab order, Enter to submit
- [ ] **Role enforcement** — Unauthorized roles can't access
- [ ] **RLS enforcement** — Users only see their own data

---

## 19. DEPLOYMENT

### Vercel Setup

```bash
# Link to Vercel
vercel link

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... (all env vars from Section 6)

# Deploy
vercel deploy --prod
```

### CI/CD Pipeline

```
Push to main → Vercel builds → Preview deployment
                              → Run tests
                              → If tests pass → Production deployment
```

### Domain Setup

- `repmax.com` — Marketing site
- `app.repmax.com` — Web application
- `card.repmax.com` — Public Companion Cards (or `repmax.com/card/[id]`)

---

## 20. BUILD ORDER & SPRINT PLAN

### Recommended Dev Sequence

**Do NOT build everything in parallel.** Follow this order — each batch builds on the previous.

```
WEEK 1-2:  Batch 1 (Marketing) + Batch 2 (Auth + Onboarding)
           → Foundation: auth works, users can sign up and onboard
           → Supabase project setup, RLS policies, migrations

WEEK 3-4:  Batch 3 (Athlete + Companion Card)
           → Core product: athletes have profiles and cards
           → Companion Card is the single most important component

WEEK 4-5:  Batch 4 (Parent) + Batch 5 (Coach)
           → Two more roles functional
           → Parent-athlete linking, roster management

WEEK 5-6:  Batch 6 (Recruiter)
           → Search + shortlists functional
           → RepMax MCP integration must be working

WEEK 6-8:  Batch 7 (Club + Tournament)
           → Most complex batch — tournament system
           → Stripe Connect integration
           → Live scoring with Realtime

WEEK 8:    Batch 8 (Shared Components) + Polish
           → Zone pulse banners, calendar widgets
           → Cross-dashboard consistency pass
           → Bug fixes, responsive polish

--- MVP COMPLETE ---

WEEK 9-10:  Phase 2A Sprint 1-2 (Notifications + Messaging)
WEEK 10-11: Phase 2A Sprint 3-4 (Analytics + Film + Zone Map)
WEEK 12-13: Phase 2B Sprint 1-2 (App Store + CRM)
WEEK 14-15: Phase 2B Sprint 3-4 (Comparison + CMS + SEO + Admin)
WEEK 16:    PRP Cleanup Sprint
```

### Parallel Work Streams

If you have multiple developers:

| Dev | Week 1-2 | Week 3-4 | Week 5-6 | Week 7-8 |
|-----|----------|----------|----------|----------|
| **Frontend Lead** | Auth UI + Onboarding | Companion Card | Recruiter Search | Tournament UI |
| **Backend Lead** | Supabase setup + Schema + RLS | Profile APIs | MCP proxy + Shortlists | Stripe + Realtime |
| **Mobile Dev** | Expo scaffold + Auth | Mobile card | Mobile dashboard | Live scoring mobile |
| **Full-Stack** | Marketing pages | Parent + Coach dashboards | Coach roster + CSV import | Bracket builder + Verification |

---

## 21. ACCEPTANCE CRITERIA

### MVP Launch Criteria (All must pass)

- [ ] All 5 roles can sign up, onboard, and access their dashboard
- [ ] Companion Card can be created, edited, previewed, and shared via link/QR
- [ ] Parents can link to athletes and see their data
- [ ] Coaches can manage a roster of 12+ athletes
- [ ] CSV roster import works with match/new/duplicate detection
- [ ] Recruiters can search prospects by position, zone, state, class, stars
- [ ] Recruiters can create shortlists and add/remove athletes
- [ ] Club organizers can create tournaments with registration
- [ ] Bracket builder generates valid pool play + elimination brackets
- [ ] Live scoring updates in real-time for all connected clients
- [ ] Athlete verification via QR and manual methods works
- [ ] Stripe Connect payments process successfully (test mode)
- [ ] RepMax MCP data appears in zone pulse banners and search results
- [ ] Every screen has loading, empty, and error states implemented
- [ ] Responsive at 375px, 768px, 1024px, 1440px
- [ ] Page load under 3 seconds on 4G connection
- [ ] All RLS policies prevent unauthorized data access
- [ ] NCAA compliance: athletes cannot message recruiters directly

### Per-Screen Signoff

Each screen requires signoff from Ian before moving to next batch. Signoff criteria:
1. Visual match to Stitch design (within 95% fidelity)
2. All interactions functional
3. All states implemented
4. Data flows correctly from Supabase/MCP
5. Mobile responsive
6. No console errors

---

## 22. DELIVERABLE INVENTORY

### Files You Have

| File | Size | Purpose | When to Use |
|------|------|---------|-------------|
| `00-MASTER-STITCH-PLAN.md` | 34K | All prompts organized by batch | Paste prompts into Stitch |
| `01-UX-JOURNEYS.md` | 21K | User flows for all roles | Understand navigation + flow |
| `02-ARCHITECTURE-DIAGRAMS.md` | 12K | System architecture | Backend planning |
| `repmax-batch-2-3-auth-athlete.md` | 34K | Stitch prompts: auth + athlete | Batch 2-3 development |
| `repmax-batch-4-5-parent-coach.md` | 27K | Stitch prompts: parent + coach | Batch 4-5 development |
| `repmax-batch-6-7-recruiter-club.md` | 34K | Stitch prompts: recruiter + club | Batch 6-7 development |
| `repmax-batch-8-shared-components.md` | 21K | Stitch prompts: shared widgets | Batch 8 development |
| `repmax-phase-2a-sprint-1-2-notifications-messaging.md` | 28K | Phase 2A prompts | Phase 2A development |
| `repmax-phase-2a-sprint-3-4-analytics-zonemap.md` | 24K | Phase 2A prompts | Phase 2A development |
| `repmax-phase-2b-crm-seo-admin-cleanup.md` | 31K | Phase 2B + cleanup prompts | Phase 2B development |
| `repmax-phase-2-roadmap.md` | 19K | Feature scoring + timeline | Sprint planning |
| `repmax-prp-coverage-audit.md` | 14K | Coverage verification | Completeness check |
| `repmax-seed-data.md` | 54K | 11 test users with full data | Testing + QA |
| `repmax-ai-onboarding.jsx` | 41K | Working onboarding prototype | Reference implementation |
| `repmax-system-map.jsx` | 33K | Architecture diagram | Architecture reference |
| `repmax-cms-integration.jsx` | 39K | CMS patterns | Sanity integration |
| `repmax-v2-full-plan.jsx` | 37K | Full planning visualization | Project overview |
| `repmax-stitch-batch-plan.md` | 31K | Original batch plan | Historical reference |
| **THIS DOCUMENT** | — | Complete dev handoff | Your primary reference |

### Files You Create

| File | When | Purpose |
|------|------|---------|
| `stitch-exports/batch-N/*.html` | During Stitch phase | Raw HTML from Google Stitch |
| `supabase/migrations/*.sql` | Week 1 | Database schema (from Section 7) |
| `supabase/seed/seed.sql` | Week 1 | Seed data (from `repmax-seed-data.md`) |
| `app/**/*.tsx` | Ongoing | Next.js pages and components |
| `components/**/*.tsx` | Ongoing | Reusable components |
| `lib/**/*.ts` | Ongoing | Utilities, hooks, clients |
| `.env.local` | Day 1 | Environment variables |

---

## QUICK REFERENCE CARD

```
GOLD:     #D4AF37      BG-PAGE:  #050505      FONT-BODY: Inter
GOLD-H:   #F3E5AB      BG-ELEV:  #1A1A1A      FONT-STAT: JetBrains Mono
GOLD-A:   #B4941F      BG-CARD:  #1F1F22      GRID:      8px
                        BG-INPUT: #2A2A2E      RADIUS:    12px (card), 8px (button)

ZONES:    NE #3B82F6  |  SE #EF4444  |  MW #10B981
          SW #F97316  |  W  #8B5CF6  |  PL #D4AF37

STACK:    Next.js 15 + React 19 + Tailwind 4 + shadcn/ui
          Supabase (Postgres/Auth/Storage/Realtime/Edge)
          Stripe Connect + Sanity CMS + Mapbox + Resend
          Expo (mobile) + TypeScript (everything)

DEPLOY:   Vercel (web) + Expo EAS (mobile)
```

---

**END OF HANDOFF DOCUMENT**

Questions? Reach out to Ian. This document plus the deliverable files above contain everything needed to build RepMax v2 from design to production.
