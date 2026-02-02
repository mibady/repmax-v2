# Product Requirement Prompt (PRP)

# Coaches Portal (RepMax Coach)

## 1. Project Overview

- **Name:** Coaches Portal / RepMax Coach
- **Description:** A LinkedIn-style professional platform for athletic coaches, enabling coaches to build rich professional profiles and discover job opportunities, while athletic directors and administrators can discover and hire qualified coaches across college (D1/D2/D3/JUCO/NAIA) and high school levels.
- **Pattern:** 05: Full Application — Production-grade SaaS platform with complete 3-layer architecture
- **Market Size:** $15.4B US sports coaching market; 175K+ high school coaches; 20K+ NCAA positions
- **Revenue Model:** Freemium SaaS with tiered subscriptions ($0-$199/yr coaches, $499-$5K/yr programs)

### MVP Scope (Confirmed)

- **Sport:** Football only (basketball and other sports in Phase 2+)
- **Target Market:** College football coaching positions (FBS, FCS, D2, D3, JUCO, NAIA) + High School
- **Core Features:** Coach profiles, job postings, search/filter, applications, messaging
- **Excluded from MVP:** Multi-sport support, mobile app, ATS integrations, advanced analytics

---

## 2. Goals & Success Metrics

### Primary Goals

1. Create the first unified college + high school coaching marketplace
2. Replace expensive search firms ($50K-$270K) with self-service discovery (<$5K/yr)
3. Enable data-driven hiring with rich, searchable coach profiles
4. Build network effects through two-sided marketplace dynamics

### Success Metrics (KPIs)

| Metric | Year 1 Target | Measurement |
|--------|---------------|-------------|
| Coach Profiles | 5,000+ | Registered coaches with completed profiles |
| Program Subscribers | 200+ | Paying institutional accounts |
| Successful Placements | 50+ | Coaches hired through platform |
| Premium Conversion | 10% | Free → Paid coach conversions |
| ARR | $1M+ | Annual Recurring Revenue |
| NPS | 50+ | Net Promoter Score |
| Search-to-Hire Time | <14 days | Average days from job post to hire |

### Secondary Goals

- Integrate with RepMax ecosystem for data synergy
- Build coach recruiting track record database
- Enable confidential job search for employed coaches
- Create coaching carousel content engine

---

## 3. User Personas

### Persona 1: Coach Chris (Assistant Coach)

- **Demographics:** 28-35 years old, D2/D3 football assistant coach
- **Goals:** Find head coaching opportunity, build professional brand, expand network
- **Pain Points:** No unified platform to showcase career, relies on informal networks
- **Behavior:** Active on social media, attends coaching clinics, builds relationships
- **Technical:** Mobile-first, moderate tech savvy

### Persona 2: Coach Dana (Head Coach)

- **Demographics:** 40-50 years old, FCS head coach seeking FBS opportunity
- **Goals:** Confidentially explore opportunities, showcase program achievements
- **Pain Points:** Can't publicly signal interest without risking current position
- **Behavior:** Discrete networking, uses agents/connections
- **Technical:** Desktop-primary, expects professional experience

### Persona 3: AD Alex (Athletic Director)

- **Demographics:** 45-55 years old, G5/FCS athletic director
- **Goals:** Find qualified candidates quickly, reduce search costs, make data-driven decisions
- **Pain Points:** Search firms expensive ($50K+), job boards yield unqualified applicants
- **Behavior:** Budget-conscious, values efficiency, needs to justify hires to stakeholders
- **Technical:** Desktop user, expects enterprise-grade tools

### Persona 4: Admin Amy (Assistant AD/Hiring Manager)

- **Demographics:** 30-40 years old, manages hiring logistics for AD
- **Goals:** Screen candidates efficiently, coordinate interviews, track applications
- **Pain Points:** Overwhelmed by volume (1000+ applicants), manual tracking
- **Behavior:** Detail-oriented, process-driven, uses ATS systems
- **Technical:** Power user, expects automation and integrations

---

## 4. User Stories

### Coach Stories

| ID | Story | Priority |
|----|-------|----------|
| C1 | As a coach, I want to create a rich professional profile so that programs can discover my qualifications | P0 |
| C2 | As a coach, I want to search and filter job openings so that I find relevant opportunities | P0 |
| C3 | As a coach, I want to apply to jobs with one click so that I can easily express interest | P0 |
| C4 | As a coach, I want to set "open to opportunities" confidentially so that my current employer doesn't know | P1 |
| C5 | As a coach, I want to receive job alerts matching my preferences so that I don't miss opportunities | P1 |
| C6 | As a coach, I want to track my application status so that I know where I stand | P1 |
| C7 | As a coach, I want to add video content to my profile so that I can showcase my coaching style | P2 |
| C8 | As a coach, I want to request and display recommendations so that I build credibility | P2 |

### Athletic Director Stories

| ID | Story | Priority |
|----|-------|----------|
| A1 | As an AD, I want to post job openings so that coaches can find and apply | P0 |
| A2 | As an AD, I want to search/filter coaches by position, experience, and region so that I find qualified candidates | P0 |
| A3 | As an AD, I want to view detailed coach profiles so that I can evaluate their qualifications | P0 |
| A4 | As an AD, I want to message coaches directly so that I can initiate conversations | P0 |
| A5 | As an AD, I want to save coaches to a shortlist so that I can compare candidates | P1 |
| A6 | As an AD, I want to track application status (reviewing, interviewing, offered) so that I manage the hiring pipeline | P1 |
| A7 | As an AD, I want to see coach analytics (career progression, recruiting success) so that I make data-driven decisions | P2 |
| A8 | As an AD, I want to export candidate data so that I can share with stakeholders | P2 |

### Platform Stories

| ID | Story | Priority |
|----|-------|----------|
| P1 | As a user, I want secure authentication so that my data is protected | P0 |
| P2 | As a user, I want real-time notifications so that I stay informed | P1 |
| P3 | As a user, I want mobile-responsive design so that I can use the platform anywhere | P1 |
| P4 | As an admin, I want subscription management so that users can upgrade/downgrade | P1 |

---

## 5. Functional Requirements

### F1: Authentication & Authorization

- [ ] Magic link authentication for coaches
- [ ] OAuth (Google, Apple) for institutional users
- [ ] Role-based access control (Coach, Admin, Super Admin)
- [ ] Email verification for new accounts
- [ ] Password reset flow
- [ ] Session management with refresh tokens

### F2: Coach Profile Management

- [ ] Multi-step profile creation wizard
- [ ] Profile sections: personal info, coaching history, education, certifications
- [ ] Playing background with achievements
- [ ] Recruiting region expertise (6 geographic zones)
- [ ] Coaching tier experience (7 tiers: HS → Professional)
- [ ] Position types (HC, OC, DC, Position Coach, GA, Analyst)
- [ ] Photo upload with crop/resize
- [ ] Video links (YouTube, Hudl, etc.)
- [ ] Social media integration
- [ ] Privacy controls (public, network only, confidential)
- [ ] Profile completion percentage indicator
- [ ] **Verified Coach Badge** - Visual indicator for verified coaches (see F10)
- [ ] **RepMax Recruiting Stats** - Display recruiting track record from RepMax integration

### F3: Job Posting System

- [ ] Job posting form with structured fields
- [ ] Position type, sport, coaching tier, location
- [ ] **Salary range (optional with "Salary Disclosed" badge)**
  - Salary fields are optional but encouraged
  - Jobs with salary ranges display prominent "Salary Disclosed" badge
  - Badge color: Success green (#10B981) to incentivize transparency
  - Filter option: "Show only jobs with salary disclosed"
- [ ] Requirements and qualifications
- [ ] Application deadline
- [ ] Job status management (open, reviewing, closed)
- [ ] Duplicate/template previous postings
- [ ] Multi-job posting for enterprise

### F4: Search & Discovery

- [ ] Full-text search for coaches and jobs
- [ ] Multi-filter coach search:
  - Position type (HC, OC, DC, etc.)
  - Coaching tier (D1 FBS, D2, D3, JUCO, HS, etc.)
  - Geographic region (6 zones)
  - Years of experience
  - Sport
  - Open to opportunities status
- [ ] Multi-filter job search:
  - Position type
  - Coaching tier/level
  - Location/region
  - Salary range
  - Posted date
- [ ] Saved searches with alerts
- [ ] Sort options (relevance, date, experience)

### F5: Application Management

- [ ] One-click job application for coaches
- [ ] Cover letter/message attachment
- [ ] Application status tracking (Applied, Reviewing, Interviewing, Offered, Hired, Rejected)
- [ ] Application history for coaches
- [ ] Applicant management dashboard for ADs
- [ ] Bulk status updates
- [ ] Application notes and ratings

### F6: Messaging System

- [ ] Direct messaging between coaches and ADs
- [ ] Conversation threads
- [ ] Read receipts
- [ ] Notification on new messages
- [ ] Attachment support (resume, documents)
- [ ] Message templates for ADs

### F7: Subscription & Billing

- [ ] Tiered subscription plans (Coach Free, Coach Premium, Program Basic, Program Pro, Enterprise)
- [ ] Stripe integration for payments
- [ ] Subscription management (upgrade, downgrade, cancel)
- [ ] Invoice history
- [ ] Usage tracking per tier

### F8: Notifications

- [ ] Email notifications (new jobs, applications, messages)
- [ ] In-app notification center
- [ ] Push notifications (mobile)
- [ ] Notification preferences management
- [ ] Digest emails (daily/weekly)

### F9: Analytics & Reporting

- [ ] Coach profile views analytics
- [ ] Job posting performance (views, applications)
- [ ] Search appearance metrics
- [ ] Hiring funnel analytics for ADs
- [ ] Platform-wide metrics for super admin

### F10: Coach Verification System (Confirmed)

Verified coach badges build trust and credibility on the platform.

**Verification Methods:**
- [ ] **Email Domain Verification** - Verify coach's .edu email matches claimed institution
- [ ] **LinkedIn Profile Link** - Cross-reference with LinkedIn profile
- [ ] **School Website Verification** - Manual check against official athletic staff pages
- [ ] **Credential Verification** - Verify certifications (AFCA, coaching licenses)
- [ ] **RepMax Data Match** - Auto-verify if coach appears in RepMax recruiting data

**Badge Types:**
| Badge | Criteria | Visual |
|-------|----------|--------|
| Verified Coach | Email + one other method | Blue checkmark |
| RepMax Verified | Confirmed in RepMax data | Gold badge with RepMax logo |
| Premium Verified | Full verification + premium subscription | Blue checkmark + star |

**Display Rules:**
- Badge appears next to coach name on profile cards and search results
- Verification status visible on public profiles
- ADs can filter search to "Verified coaches only"
- Non-verified coaches see prompt to complete verification

### F11: RepMax Integration (Confirmed)

Integration with RepMax recruiting platform for coach track record data.

**Data from RepMax:**

| Data Type | Description | Use Case |
|-----------|-------------|----------|
| **Recruiting Commits** | Number and star ratings of committed prospects | "Landed 15 commits (3 4-star, 8 3-star)" |
| **Regional Success** | Commits by geographic zone | "Strong in Southeast (12 commits)" |
| **Program Rankings** | Historical team recruiting rankings | Context for coach achievements |
| **Commit Timeline** | When commits occurred during tenure | Career progression visualization |
| **Position Breakdown** | Commits by position group | "Primarily recruited DBs and WRs" |

**Integration Architecture:**
```
RepMax API → Coaches Portal Backend → Coach Profile
     ↓
  Nightly sync job (QStash)
     ↓
  Store in recruiting_stats table
     ↓
  Display on coach profiles
```

**API Endpoints Needed from RepMax:**
```
GET /api/coaches/{coach_id}/commits      — All commits for a coach
GET /api/coaches/{coach_id}/stats        — Aggregated recruiting stats
GET /api/programs/{program_id}/staff     — Current coaching staff
GET /api/commits/by-region/{region}      — Commits in a geographic zone
```

**Open Questions for RepMax Team:**
1. Can commits be attributed to specific position coaches (not just programs)?
2. Is historical data available when coaches change programs?
3. What's the API rate limit and data refresh frequency?
4. Can we compute a "Recruiting Score" from the data?

---

## 6. Non-Functional Requirements

### Performance

| Metric | Target |
|--------|--------|
| Page Load Time | < 2s (P95) |
| Search Response | < 500ms |
| API Response | < 200ms (P95) |
| Uptime | 99.9% |
| Concurrent Users | 10,000+ |

### Security

- [ ] SOC 2 compliance path
- [ ] Data encryption at rest and in transit (TLS 1.3)
- [ ] GDPR/CCPA compliance for data privacy
- [ ] Row-level security (RLS) on all user data
- [ ] Rate limiting on API endpoints
- [ ] OWASP Top 10 protection
- [ ] Regular security audits

### Scalability

- [ ] Horizontal scaling via serverless architecture
- [ ] Database read replicas for search
- [ ] CDN for static assets
- [ ] Queue-based processing for async tasks
- [ ] Auto-scaling on Vercel/Supabase

### Accessibility

- [ ] WCAG 2.1 AA compliance
- [ ] Screen reader compatibility
- [ ] Keyboard navigation
- [ ] Color contrast ratios (4.5:1 minimum)
- [ ] Focus indicators

### Reliability

- [ ] Automated backups (daily)
- [ ] Disaster recovery plan
- [ ] Error monitoring and alerting (Sentry)
- [ ] Graceful degradation
- [ ] Circuit breakers for external services

---

## 7. Technical Architecture

### 3-Layer Mapping

```
FACE (Frontend)
├── Framework: Next.js 15+ (App Router)
├── UI: shadcn/ui + Radix primitives
├── State: Zustand (client) + React Query (server)
├── Styling: Tailwind CSS with custom design tokens
├── Forms: React Hook Form + Zod validation
└── Icons: Material Symbols Outlined

HEAD (AI/Search)
├── Vector DB: Upstash Vector (semantic coach search)
├── Text Search: Supabase Full-text search
├── Matching: Custom algorithm for job-coach matching
├── AI: Claude API for profile verification (future)
└── Analytics: Custom scoring algorithms

DNA (Backend)
├── Database: Supabase PostgreSQL
├── Auth: Supabase Auth (Magic Link + OAuth)
├── Storage: Supabase Storage (photos, documents)
├── Cache: Upstash Redis (sessions, rate limiting)
├── Queue: Upstash QStash (async jobs, notifications)
├── Payments: Stripe (subscriptions)
├── Email: Resend (transactional)
└── Monitoring: Sentry + Vercel Analytics
```

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FACE LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Next.js    │  │   shadcn/ui  │  │   Zustand    │          │
│  │  App Router  │  │    + Radix   │  │    Store     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         HEAD LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Upstash    │  │   Matching   │  │   Claude     │          │
│  │   Vector     │  │  Algorithm   │  │   (future)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DNA LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Supabase   │  │   Supabase   │  │   Stripe     │          │
│  │  PostgreSQL  │  │    Auth      │  │  Payments    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Upstash    │  │   Upstash    │  │   Resend     │          │
│  │    Redis     │  │   QStash     │  │   Email      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
coaches-portal/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (marketing)/          # Public pages (/, /pricing, /about)
│   │   ├── (auth)/               # Auth pages (/login, /signup)
│   │   ├── (dashboard)/          # Protected routes
│   │   │   ├── coach/            # Coach dashboard
│   │   │   │   ├── profile/
│   │   │   │   ├── jobs/
│   │   │   │   ├── applications/
│   │   │   │   └── settings/
│   │   │   └── admin/            # AD dashboard
│   │   │       ├── postings/
│   │   │       ├── candidates/
│   │   │       ├── applications/
│   │   │       └── settings/
│   │   ├── api/                  # API routes
│   │   │   ├── auth/
│   │   │   ├── coaches/
│   │   │   ├── jobs/
│   │   │   ├── applications/
│   │   │   ├── messages/
│   │   │   ├── search/
│   │   │   └── webhooks/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── coach/                # Coach-specific components
│   │   ├── admin/                # Admin-specific components
│   │   ├── common/               # Shared components
│   │   └── marketing/            # Marketing page components
│   ├── lib/
│   │   ├── supabase/             # DB client, queries
│   │   ├── auth/                 # Auth utilities
│   │   ├── upstash/              # Vector, Redis, QStash
│   │   ├── stripe/               # Payment utilities
│   │   ├── resend/               # Email utilities
│   │   ├── matching/             # Coach-job matching
│   │   ├── utils/                # General utilities
│   │   └── constants/            # Tiers, positions, zones
│   ├── hooks/                    # Custom React hooks
│   ├── store/                    # Zustand stores
│   ├── types/                    # TypeScript types
│   └── middleware.ts             # Auth middleware
├── public/                       # Static assets
├── supabase/
│   ├── migrations/               # SQL migrations
│   └── functions/                # Edge functions
├── docs/                         # Documentation
├── .env.local.example
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── CLAUDE.md                     # Project instructions
```

---

## 8. Data Model

### Entity Relationship Diagram

```
┌────────────────────┐       ┌────────────────────┐
│      profiles      │       │   admin_profiles   │
│────────────────────│       │────────────────────│
│ id (PK)            │       │ id (PK)            │
│ user_id (FK)       │       │ user_id (FK)       │
│ first_name         │       │ first_name         │
│ last_name          │       │ last_name          │
│ email              │       │ school_name        │
│ bio                │       │ conference         │
│ photo_url          │       │ subscription_tier  │
│ coaching_tiers[]   │       │ created_at         │
│ positions[]        │       └────────────────────┘
│ regions[]          │                │
│ years_experience   │                │
│ is_open            │                │
│ visibility_mode    │                ▼
│ created_at         │       ┌────────────────────┐
└────────────────────┘       │   job_postings     │
         │                   │────────────────────│
         │                   │ id (PK)            │
         │                   │ admin_id (FK)      │
         │                   │ title              │
         │                   │ position_type      │
         │                   │ coaching_tier      │
         │                   │ sport              │
         │                   │ region             │
         │                   │ salary_range       │
         │                   │ description        │
         │                   │ requirements       │
         │                   │ status             │
         │                   │ deadline           │
         │                   │ created_at         │
         │                   └────────────────────┘
         │                            │
         ▼                            ▼
┌────────────────────────────────────────────────┐
│                 applications                    │
│────────────────────────────────────────────────│
│ id (PK)                                        │
│ job_id (FK → job_postings)                     │
│ coach_id (FK → profiles)                       │
│ status (applied/reviewing/interviewing/...)    │
│ cover_message                                  │
│ admin_notes                                    │
│ rating                                         │
│ applied_at                                     │
│ updated_at                                     │
└────────────────────────────────────────────────┘

┌────────────────────┐       ┌────────────────────┐
│     messages       │       │    favorites       │
│────────────────────│       │────────────────────│
│ id (PK)            │       │ id (PK)            │
│ conversation_id    │       │ admin_id (FK)      │
│ sender_id (FK)     │       │ coach_id (FK)      │
│ recipient_id (FK)  │       │ created_at         │
│ content            │       └────────────────────┘
│ read_at            │
│ created_at         │       ┌────────────────────┐
└────────────────────┘       │  subscriptions     │
                             │────────────────────│
┌────────────────────┐       │ id (PK)            │
│  coach_vectors     │       │ user_id (FK)       │
│────────────────────│       │ stripe_customer_id │
│ id (PK)            │       │ stripe_sub_id      │
│ coach_id (FK)      │       │ tier               │
│ embedding          │       │ status             │
│ metadata           │       │ current_period_end │
└────────────────────┘       └────────────────────┘
```

### Database Schema (SQL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE coaching_tier AS ENUM (
  'high_school', 'juco', 'd3', 'd2', 'd1_fcs', 'd1_fbs', 'professional'
);

CREATE TYPE position_type AS ENUM (
  'head_coach', 'offensive_coordinator', 'defensive_coordinator',
  'position_coach', 'graduate_assistant', 'analyst', 'quality_control'
);

CREATE TYPE geographic_region AS ENUM (
  'northeast', 'southeast', 'midwest', 'southwest', 'west', 'mountain'
);

CREATE TYPE application_status AS ENUM (
  'applied', 'reviewing', 'interviewing', 'offered', 'hired', 'rejected', 'withdrawn'
);

CREATE TYPE job_status AS ENUM (
  'draft', 'open', 'reviewing', 'closed', 'filled'
);

CREATE TYPE subscription_tier AS ENUM (
  'coach_free', 'coach_premium', 'program_basic', 'program_pro', 'enterprise'
);

CREATE TYPE visibility_mode AS ENUM (
  'public', 'network_only', 'confidential'
);

-- Verification status enum
CREATE TYPE verification_status AS ENUM (
  'unverified', 'pending', 'verified', 'repmax_verified', 'premium_verified'
);

-- Coach profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  coaching_tiers coaching_tier[] DEFAULT '{}',
  positions position_type[] DEFAULT '{}',
  regions geographic_region[] DEFAULT '{}',
  years_experience INTEGER DEFAULT 0,
  education JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  playing_background JSONB DEFAULT '{}',
  recruiting_track_record JSONB DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  video_links TEXT[] DEFAULT '{}',
  is_open_to_opportunities BOOLEAN DEFAULT false,
  visibility_mode visibility_mode DEFAULT 'public',
  profile_completion INTEGER DEFAULT 0,
  -- Verification fields (F10)
  verification_status verification_status DEFAULT 'unverified',
  verified_at TIMESTAMPTZ,
  verification_methods JSONB DEFAULT '[]', -- Array of methods used
  linkedin_url TEXT,
  -- RepMax integration fields (F11)
  repmax_coach_id TEXT, -- Link to RepMax system
  repmax_last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin/AD profiles
CREATE TABLE admin_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  title TEXT,
  school_name TEXT NOT NULL,
  conference TEXT,
  division coaching_tier,
  photo_url TEXT,
  phone TEXT,
  subscription_tier subscription_tier DEFAULT 'program_basic',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job postings
CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admin_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  position_type position_type NOT NULL,
  coaching_tier coaching_tier NOT NULL,
  sport TEXT NOT NULL DEFAULT 'football',
  region geographic_region,
  salary_min INTEGER,
  salary_max INTEGER,
  -- Salary disclosure badge (F3) - computed from salary fields
  salary_disclosed BOOLEAN GENERATED ALWAYS AS (salary_min IS NOT NULL OR salary_max IS NOT NULL) STORED,
  description TEXT NOT NULL,
  requirements JSONB DEFAULT '[]',
  benefits JSONB DEFAULT '[]',
  status job_status DEFAULT 'draft',
  application_deadline DATE,
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES job_postings(id) ON DELETE CASCADE NOT NULL,
  coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status application_status DEFAULT 'applied',
  cover_message TEXT,
  resume_url TEXT,
  admin_notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, coach_id)
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites (saved coaches)
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admin_profiles(id) ON DELETE CASCADE NOT NULL,
  coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(admin_id, coach_id)
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  tier subscription_tier NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RepMax Recruiting Stats (F11)
-- Synced from RepMax API, stores coach recruiting track record
CREATE TABLE recruiting_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  repmax_coach_id TEXT NOT NULL, -- External ID from RepMax
  -- Aggregate stats
  total_commits INTEGER DEFAULT 0,
  five_star_commits INTEGER DEFAULT 0,
  four_star_commits INTEGER DEFAULT 0,
  three_star_commits INTEGER DEFAULT 0,
  unrated_commits INTEGER DEFAULT 0,
  -- Regional breakdown (JSONB for flexibility)
  commits_by_region JSONB DEFAULT '{}', -- {"southeast": 12, "midwest": 5, ...}
  commits_by_position JSONB DEFAULT '{}', -- {"WR": 8, "DB": 6, ...}
  commits_by_year JSONB DEFAULT '{}', -- {"2024": 5, "2023": 8, ...}
  -- Computed scores
  recruiting_score INTEGER, -- 0-100 composite score
  regional_strength geographic_region[], -- Top recruiting regions
  -- Sync metadata
  last_sync_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status TEXT DEFAULT 'pending', -- pending, synced, error
  raw_data JSONB, -- Full response from RepMax for debugging
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(coach_id)
);

-- Coach Verification Requests (F10)
CREATE TABLE verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  verification_type TEXT NOT NULL, -- 'email', 'linkedin', 'school', 'credential', 'repmax'
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  submitted_data JSONB DEFAULT '{}', -- Evidence submitted
  reviewer_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_coaching_tiers ON profiles USING GIN(coaching_tiers);
CREATE INDEX idx_profiles_positions ON profiles USING GIN(positions);
CREATE INDEX idx_profiles_regions ON profiles USING GIN(regions);
CREATE INDEX idx_profiles_open ON profiles(is_open_to_opportunities) WHERE is_open_to_opportunities = true;

CREATE INDEX idx_job_postings_admin_id ON job_postings(admin_id);
CREATE INDEX idx_job_postings_status ON job_postings(status);
CREATE INDEX idx_job_postings_tier ON job_postings(coaching_tier);
CREATE INDEX idx_job_postings_position ON job_postings(position_type);

CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_coach_id ON applications(coach_id);
CREATE INDEX idx_applications_status ON applications(status);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);

-- New indexes for F10 and F11
CREATE INDEX idx_profiles_verification ON profiles(verification_status);
CREATE INDEX idx_profiles_repmax_id ON profiles(repmax_coach_id) WHERE repmax_coach_id IS NOT NULL;
CREATE INDEX idx_job_postings_salary_disclosed ON job_postings(salary_disclosed) WHERE salary_disclosed = true;
CREATE INDEX idx_recruiting_stats_coach_id ON recruiting_stats(coach_id);
CREATE INDEX idx_recruiting_stats_score ON recruiting_stats(recruiting_score DESC NULLS LAST);
CREATE INDEX idx_verification_requests_coach_id ON verification_requests(coach_id);
CREATE INDEX idx_verification_requests_status ON verification_requests(status);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (visibility_mode = 'public');

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin profiles RLS
CREATE POLICY "Admin profiles viewable by all authenticated"
  ON admin_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update own profile"
  ON admin_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Job postings RLS
CREATE POLICY "Open jobs are viewable by everyone"
  ON job_postings FOR SELECT
  USING (status = 'open');

CREATE POLICY "Admins can manage own jobs"
  ON job_postings FOR ALL
  USING (admin_id IN (SELECT id FROM admin_profiles WHERE user_id = auth.uid()));

-- Applications RLS
CREATE POLICY "Coaches can view own applications"
  ON applications FOR SELECT
  USING (coach_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can create applications"
  ON applications FOR INSERT
  WITH CHECK (coach_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view job applications"
  ON applications FOR SELECT
  USING (job_id IN (SELECT id FROM job_postings WHERE admin_id IN
    (SELECT id FROM admin_profiles WHERE user_id = auth.uid())));

CREATE POLICY "Admins can update applications"
  ON applications FOR UPDATE
  USING (job_id IN (SELECT id FROM job_postings WHERE admin_id IN
    (SELECT id FROM admin_profiles WHERE user_id = auth.uid())));

-- Messages RLS
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (auth.uid()::text = sender_id::text OR auth.uid()::text = recipient_id::text);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid()::text = sender_id::text);

-- Favorites RLS
CREATE POLICY "Admins can manage own favorites"
  ON favorites FOR ALL
  USING (admin_id IN (SELECT id FROM admin_profiles WHERE user_id = auth.uid()));

-- Subscriptions RLS
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Notifications RLS
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER admin_profiles_updated_at
  BEFORE UPDATE ON admin_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER job_postings_updated_at
  BEFORE UPDATE ON job_postings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 9. API Design

### Authentication Routes

```
POST   /api/auth/signup              # Create account (magic link)
POST   /api/auth/login               # Sign in (magic link)
POST   /api/auth/logout              # Sign out
POST   /api/auth/refresh             # Refresh token
POST   /api/auth/forgot-password     # Request password reset
POST   /api/auth/reset-password      # Reset password
GET    /api/auth/callback            # OAuth callback
GET    /api/auth/me                  # Get current user
```

### Coach Profile Routes

```
GET    /api/coaches                  # List/search coaches (with filters)
GET    /api/coaches/:id              # Get coach profile
POST   /api/coaches                  # Create coach profile
PUT    /api/coaches/:id              # Update coach profile
DELETE /api/coaches/:id              # Delete coach profile
POST   /api/coaches/:id/photo        # Upload photo
GET    /api/coaches/:id/applications # Get coach's applications
GET    /api/coaches/:id/analytics    # Get profile analytics
```

### Admin Profile Routes

```
GET    /api/admins/:id               # Get admin profile
POST   /api/admins                   # Create admin profile
PUT    /api/admins/:id               # Update admin profile
```

### Job Posting Routes

```
GET    /api/jobs                     # List/search jobs (with filters)
GET    /api/jobs/:id                 # Get job details
POST   /api/jobs                     # Create job posting
PUT    /api/jobs/:id                 # Update job posting
DELETE /api/jobs/:id                 # Delete job posting
GET    /api/jobs/:id/applications    # Get job applications
POST   /api/jobs/:id/duplicate       # Duplicate job posting
```

### Application Routes

```
GET    /api/applications             # List applications (filtered by user role)
GET    /api/applications/:id         # Get application details
POST   /api/applications             # Create application (coach applies)
PUT    /api/applications/:id         # Update application status
DELETE /api/applications/:id         # Withdraw application
```

### Message Routes

```
GET    /api/messages                 # List conversations
GET    /api/messages/:conversationId # Get conversation messages
POST   /api/messages                 # Send message
PUT    /api/messages/:id/read        # Mark as read
```

### Search Routes

```
GET    /api/search/coaches           # Semantic search for coaches
GET    /api/search/jobs              # Search jobs
POST   /api/search/saved             # Save search
GET    /api/search/saved             # Get saved searches
DELETE /api/search/saved/:id         # Delete saved search
```

### Favorites Routes

```
GET    /api/favorites                # List saved coaches
POST   /api/favorites                # Save coach
DELETE /api/favorites/:coachId       # Remove saved coach
```

### Subscription Routes

```
GET    /api/subscriptions            # Get subscription status
POST   /api/subscriptions            # Create subscription
PUT    /api/subscriptions            # Update subscription
DELETE /api/subscriptions            # Cancel subscription
GET    /api/subscriptions/invoices   # Get invoice history
```

### Notification Routes

```
GET    /api/notifications            # List notifications
PUT    /api/notifications/:id/read   # Mark as read
PUT    /api/notifications/read-all   # Mark all as read
PUT    /api/notifications/preferences # Update preferences
```

### Webhook Routes

```
POST   /api/webhooks/stripe          # Stripe webhook
```

### API Response Format

```typescript
// Success response
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
    totalPages?: number;
  };
}

// Error response
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

---

## 10. UI/UX Requirements

### Page Inventory

#### Marketing Pages (Public)
- `/` — Homepage with value proposition
- `/pricing` — Pricing tiers and comparison
- `/features` — Platform features
- `/about` — About RepMax Coach
- `/contact` — Contact form

#### Auth Pages
- `/login` — Login with magic link/OAuth
- `/signup` — Registration (coach vs admin selection)
- `/signup/coach` — Coach registration flow
- `/signup/admin` — Admin/AD registration flow
- `/verify` — Email verification
- `/forgot-password` — Password reset request
- `/reset-password` — Password reset form

#### Coach Dashboard
- `/coach` — Coach dashboard home
- `/coach/profile` — Profile management
- `/coach/profile/edit` — Edit profile wizard
- `/coach/jobs` — Browse job openings
- `/coach/jobs/:id` — Job details
- `/coach/applications` — My applications
- `/coach/messages` — Inbox
- `/coach/notifications` — Notifications
- `/coach/settings` — Account settings
- `/coach/billing` — Subscription management

#### Admin Dashboard
- `/admin` — Admin dashboard home
- `/admin/postings` — Manage job postings
- `/admin/postings/new` — Create job posting
- `/admin/postings/:id` — Edit job posting
- `/admin/postings/:id/applications` — View applicants
- `/admin/candidates` — Search/browse coaches
- `/admin/candidates/:id` — View coach profile
- `/admin/favorites` — Saved coaches
- `/admin/messages` — Inbox
- `/admin/notifications` — Notifications
- `/admin/settings` — Account settings
- `/admin/billing` — Subscription management
- `/admin/analytics` — Hiring analytics

### Key User Flows

#### Coach Registration Flow
```
Landing → Signup → Select "Coach" →
Email Verification → Profile Wizard (5 steps) →
Dashboard
```

#### Coach Job Search Flow
```
Dashboard → Jobs → Filter/Search →
View Job Details → Apply →
Track in Applications
```

#### AD Candidate Search Flow
```
Dashboard → Candidates → Apply Filters →
View Coach Profiles → Save to Favorites →
Contact → Track in Pipeline
```

#### AD Job Posting Flow
```
Dashboard → New Posting → Fill Form →
Preview → Publish → View Applicants →
Update Status → Hire
```

### Component Requirements

#### Coach Profile Card
- Photo, name, current position
- Coaching tier badges (color-coded)
- Position types
- Years of experience
- Geographic regions
- "Open to opportunities" indicator
- Action buttons (View, Contact, Save)

#### Job Posting Card
- Title, school, location
- Position type, coaching tier
- Salary range (if provided)
- Posted date, deadline
- Application count
- Action buttons (View, Apply)

#### Application Status Badge
- Color-coded by status
- Status: Applied (blue), Reviewing (amber), Interviewing (purple), Offered (cyan), Hired (green), Rejected (gray)

#### Filter Panel
- Collapsible sidebar on desktop
- Bottom sheet on mobile
- Multi-select for arrays (tiers, positions, regions)
- Range slider for experience
- Clear all / Apply buttons

---

## 11. Integration Points

### Supabase (Database & Auth)

| Service | Purpose |
|---------|---------|
| PostgreSQL | Primary database with RLS |
| Auth | Magic link + OAuth providers |
| Storage | Profile photos, resumes, documents |
| Realtime | Message notifications (future) |
| Edge Functions | Server-side logic |

### Stripe (Payments)

| Integration | Purpose |
|-------------|---------|
| Checkout | Subscription creation |
| Customer Portal | Manage subscriptions |
| Webhooks | Payment events |
| Products/Prices | Tier management |

### Upstash (Cache & Search)

| Service | Purpose |
|---------|---------|
| Redis | Session cache, rate limiting |
| Vector | Semantic coach search |
| QStash | Async job processing, email queues |

### Resend (Email)

| Email Type | Purpose |
|------------|---------|
| Magic Link | Authentication |
| Job Alerts | New matching jobs |
| Application Updates | Status changes |
| Welcome Series | Onboarding |
| Digests | Weekly summaries |

### RepMax API (Confirmed - F11)

| Integration | Purpose | Priority |
|-------------|---------|----------|
| Coach Commits API | Fetch recruiting commit data by coach | P0 |
| Coach Stats API | Aggregated recruiting statistics | P0 |
| Program Staff API | Current coaching staff lookups | P1 |
| Region Commits API | Commits by geographic zone | P1 |

**Sync Strategy:**
- Nightly batch sync via QStash scheduled jobs
- On-demand sync when coach links RepMax account
- 24-hour cache on API responses
- Store raw data for debugging, compute aggregates for display

**Environment Variables:**
```bash
REPMAX_API_URL=
REPMAX_API_KEY=
REPMAX_WEBHOOK_SECRET=
```

### External (Future)

| Integration | Purpose |
|-------------|---------|
| LinkedIn | Profile import |
| Hudl | Video integration |
| Calendar | Interview scheduling |

---

## 12. Testing Strategy

### Unit Testing (Vitest)

```typescript
// Coverage targets
- Utilities: 90%+
- Hooks: 80%+
- Components: 70%+
- API routes: 80%+
```

**Test Areas:**
- Data transformation utilities
- Validation schemas (Zod)
- Custom hooks
- Component logic
- API route handlers

### Integration Testing (Playwright)

**Critical Flows:**
- [ ] Coach registration and profile creation
- [ ] Coach job search and application
- [ ] Admin registration
- [ ] Admin job posting CRUD
- [ ] Admin candidate search
- [ ] Messaging between coach and admin
- [ ] Subscription upgrade flow
- [ ] Password reset flow

### E2E Testing (Playwright)

**Happy Path Scenarios:**
1. Coach signs up, creates profile, applies to job
2. Admin signs up, posts job, reviews applications, hires coach
3. Admin searches coaches, saves favorites, contacts coach
4. User upgrades subscription

### Load Testing

- Target: 1000 concurrent users
- Search response: <500ms under load
- API response: <200ms P95

### Security Testing

- [ ] Authentication bypass attempts
- [ ] Authorization boundary testing
- [ ] SQL injection testing
- [ ] XSS vulnerability scanning
- [ ] CSRF protection verification
- [ ] Rate limiting verification

---

## 13. Deployment Plan

### Environments

| Environment | Purpose | URL |
|-------------|---------|-----|
| Development | Local development | localhost:3000 |
| Preview | PR previews | pr-{n}.coaches-portal.vercel.app |
| Staging | Pre-production testing | staging.coachesportal.com |
| Production | Live application | coachesportal.com |

### Infrastructure

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Next.js Application (Edge + Node.js functions)     │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       ▼                      ▼                      ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Supabase   │      │   Upstash   │      │   Stripe    │
│  (Database) │      │ (Cache/Vec) │      │ (Payments)  │
└─────────────┘      └─────────────┘      └─────────────┘
```

### CI/CD Pipeline (GitHub Actions)

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    - ESLint
    - Prettier check
    - TypeScript check

  test:
    - Unit tests (Vitest)
    - Integration tests

  build:
    - Next.js build
    - Bundle analysis

  deploy:
    - Preview (PR) → Vercel Preview
    - Develop → Staging
    - Main → Production
```

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Upstash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
UPSTASH_VECTOR_REST_URL=
UPSTASH_VECTOR_REST_TOKEN=
QSTASH_URL=
QSTASH_TOKEN=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

### Monitoring

- **Error Tracking:** Sentry
- **Performance:** Vercel Analytics + Speed Insights
- **Uptime:** Vercel/Supabase built-in
- **Logs:** Vercel Logs + Supabase Logs

---

## 14. Implementation Roadmap

### Backend Integration Matrix

| Phase | Tables | API Routes | Services |
|-------|--------|------------|----------|
| 1 | — | — | — |
| 2 | profiles, admin_profiles | /api/auth/* | Supabase Auth |
| 3 | — | /api/settings | Supabase |
| 4 | job_postings, applications | /api/jobs/*, /api/applications/* | Supabase |
| 5 | messages, favorites | /api/messages/*, /api/favorites/* | Supabase, Upstash |
| 6 | subscriptions, notifications | /api/subscriptions/*, /api/notifications/* | Stripe, Resend |
| 7 | — | /api/public/* | Supabase |

---

### Phase 1: Marketing Site (Public)

**Skills Used:** face-layer (Next.js SSR for SEO)

**Pages:**
- Homepage (`/`)
- Pricing (`/pricing`)
- Features (`/features`)
- About (`/about`)
- Contact (`/contact`)

**Stitch Prompts:**

#### Homepage
```
Create a professional sports coaching marketplace homepage with:
- Hero section with headline "Where Coaching Careers Take Shape",
  subheadline about connecting coaches with opportunities,
  two CTA buttons: "Find Coaching Jobs" onClick={handleFindJobs} and
  "Hire Coaches" onClick={handleHireCoaches}
- Stats section with counters: {stats.map((s) => <StatCard key={s.id} {...s} />)}
- Feature grid using {features.map((f) => <FeatureCard key={f.id} {...f} />)}
- How it works section with 3 steps for coaches and ADs
- Testimonials using {testimonials.map((t) => <TestimonialCard key={t.id} {...t} />)}
- CTA banner with "Start Free" button onClick={handleSignup}
- Footer with links

Design System:
- Font: Inter
- Primary: #3B82F6 (Professional Blue)
- Background: #050505 (Deep Dark)
- Card: #1F1F22
- Text: #FFFFFF primary, #A1A1AA secondary
- Border radius: rounded-lg
- Mobile-first responsive design with Tailwind CSS

**Integration Constraints:**
- DATA: Stats, features, testimonials use {items.map(...)} pattern
- HANDLERS: CTA buttons have onClick={handleAction}
- DYNAMIC: Headline shows {headline}, not hardcoded text
- STATES: Include loading skeleton for dynamic sections
```

#### Pricing
```
Create a pricing page for coaching platform with:
- Page header "Simple, Transparent Pricing"
- Toggle for "Coaches" vs "Programs" pricing onClick={handleToggle}
- Coach pricing cards (Free, Premium $149/yr) using {coachPlans.map(...)}
- Program pricing cards (Basic $499/yr, Pro $1,999/yr, Enterprise) using {programPlans.map(...)}
- Feature comparison table with {features.map(...)}
- FAQ accordion using {faqs.map((faq) => <AccordionItem key={faq.id} {...faq} />)}
- CTA section "Ready to transform your hiring?"

Design System:
[Same as Homepage]

**Integration Constraints:**
- DATA: Plans, features, FAQs use {items.map(...)} pattern
- HANDLERS: Plan selection buttons have onClick={handleSelectPlan}
- TOGGLE: Uses {activeTab} state for coach/program toggle
- DYNAMIC: Prices show {plan.price}, features show {plan.features}
```

**Backend Integration:** None (static pages, SSR for SEO)

**Post-Export Checklist:**
- [ ] Convert `<img>` to `<Image>` from next/image
- [ ] Convert `<a>` to `<Link>` from next/link
- [ ] Add metadata export for SEO
- [ ] Verify responsive design
- [ ] Add analytics tracking

---

### Phase 2: Authentication

**Skills Used:** supabase-auth, face-layer

**Pages:**
- Login (`/login`)
- Signup (`/signup`)
- Signup Coach (`/signup/coach`)
- Signup Admin (`/signup/admin`)
- Verify Email (`/verify`)
- Forgot Password (`/forgot-password`)
- Reset Password (`/reset-password`)

**Stitch Prompts:**

#### Login
```
Create a login page with:
- Centered card on dark background
- Logo and "Welcome back" heading
- Email input for magic link
- "Send Magic Link" primary button onClick={handleMagicLink}
- Divider "or continue with"
- OAuth buttons (Google, Apple) onClick={handleOAuth}
- "Don't have an account? Sign up" link
- Footer with terms links

Design System:
- Font: Inter
- Primary: #3B82F6
- Card: #1F1F22 with subtle border
- Input: bg-[#1A1A1A] with focus ring
- Error state: #EF4444

**Integration Constraints:**
- FORM: Uses {email} state, {isLoading} for button
- HANDLERS: handleMagicLink, handleOAuth(provider)
- ERRORS: Shows {error} message when present
```

#### Signup Selection
```
Create a signup role selection page with:
- "Join Coaches Portal" heading
- Two large cards side by side:
  - Coach card: icon, title "I'm a Coach", description, onClick={handleSelectCoach}
  - Admin card: icon, title "I'm Hiring", description, onClick={handleSelectAdmin}
- "Already have an account? Log in" link

Design System: [Same as Login]

**Integration Constraints:**
- HANDLERS: handleSelectCoach → /signup/coach, handleSelectAdmin → /signup/admin
```

**Backend Integration:**

TypeScript Interfaces:
```typescript
interface Profile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  coaching_tiers: CoachingTier[];
  positions: PositionType[];
  regions: GeographicRegion[];
  years_experience: number;
  is_open_to_opportunities: boolean;
  visibility_mode: VisibilityMode;
  created_at: string;
  updated_at: string;
}

interface AdminProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  school_name: string;
  conference: string | null;
  division: CoachingTier | null;
  subscription_tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
}
```

API Routes:
```
POST /api/auth/magic-link     — Send magic link
POST /api/auth/verify         — Verify magic link token
POST /api/auth/oauth          — OAuth sign in
POST /api/auth/logout         — Sign out
GET  /api/auth/me             — Get current user
```

**Post-Export Checklist:**
- [ ] Add 'use client' to form components
- [ ] Wire up Supabase Auth
- [ ] Implement OAuth providers
- [ ] Add RLS policies
- [ ] Test auth flow end-to-end
- [ ] Add email templates in Supabase

---

### Phase 3: App Shell & Dashboard

**Skills Used:** face-layer, dna-layer

**Pages:**
- Coach Dashboard (`/coach`)
- Admin Dashboard (`/admin`)
- Shared Layout with sidebar

**Stitch Prompts:**

#### Coach Dashboard Shell
```
Create a coach dashboard layout with:
- Collapsible sidebar:
  - Logo at top
  - Navigation: Dashboard, Browse Jobs, My Applications, Messages, Settings
  - User avatar and name at bottom with dropdown
- Header:
  - Page title {pageTitle}
  - Notification bell with count badge onClick={handleNotifications}
  - Profile dropdown onClick={handleProfileMenu}
- Main content area with {children}
- Mobile: hamburger menu, bottom navigation

Design System:
- Sidebar: bg-[#0A0A0A] with #1F1F22 hover
- Active nav item: bg-primary/20 text-primary
- Icons: Material Symbols Outlined

**Integration Constraints:**
- NAVIGATION: Uses {currentPath} for active state
- USER: Shows {user.name}, {user.avatar}
- HANDLERS: handleNavigation, handleNotifications, handleLogout
```

#### Coach Dashboard Home
```
Create a coach dashboard home page with:
- Welcome section "Welcome back, {firstName}"
- Profile completion card with progress bar {completionPercent}%
- Stats row: {stats.map((s) => <StatCard key={s.id} value={s.value} label={s.label} />)}
  - Profile views, Applications sent, Messages
- Recent job alerts section with {jobAlerts.map(...)}
- Application status summary with {applicationStats}
- Quick actions: "Complete Profile", "Browse Jobs"

Design System: [Standard]

**Integration Constraints:**
- DATA: Uses hooks useProfile(), useApplications(), useJobAlerts()
- DYNAMIC: All stats from hooks, not hardcoded
- EMPTY: Empty states when no data
```

**Backend Integration:**

API Routes:
```
GET  /api/coaches/me/stats         — Dashboard stats
GET  /api/coaches/me/alerts        — Job alerts
GET  /api/settings                 — User settings
PUT  /api/settings                 — Update settings
```

**Post-Export Checklist:**
- [ ] Add 'use client' to interactive components
- [ ] Implement theme switching (dark mode default)
- [ ] Wire up navigation state
- [ ] Add notification polling/realtime
- [ ] Test responsive sidebar

---

### Phase 4: Primary Features (Jobs & Applications)

**Skills Used:** face-layer, dna-layer

**Pages:**
- Browse Jobs (`/coach/jobs`)
- Job Details (`/coach/jobs/:id`)
- My Applications (`/coach/applications`)
- Create Job Posting (`/admin/postings/new`)
- Manage Postings (`/admin/postings`)
- View Applicants (`/admin/postings/:id/applications`)
- Search Candidates (`/admin/candidates`)
- Coach Profile View (`/admin/candidates/:id`)

**Stitch Prompts:**

#### Browse Jobs (Coach)
```
Create a job search page with:
- Search bar with placeholder "Search positions, schools..."
- Filter sidebar (collapsible on mobile):
  - Position Type: {positionTypes.map(...)} checkboxes
  - Coaching Level: {coachingTiers.map(...)} checkboxes with tier colors
  - Region: {regions.map(...)} checkboxes
  - Salary Range: slider
  - Posted Within: dropdown (24h, 7d, 30d, All)
- Results count "{totalJobs} positions found"
- Sort dropdown: Relevance, Newest, Salary
- Job cards grid using {jobs.map((job) => <JobCard key={job.id} {...job} onApply={handleApply} />)}
- Pagination

Design System:
- Tier badges use tier colors (HS: #9CA3AF, D1 FBS: #3B82F6, etc.)
- Filter chips for active filters

**Integration Constraints:**
- DATA: Uses useJobs(filters) hook
- FILTERS: {filters} state object, handleFilterChange
- PAGINATION: Uses {page}, {totalPages}, handlePageChange
- EMPTY: Empty state when no results
```

#### Job Details
```
Create a job details page with:
- Back button to job list
- Header: School logo, job title, school name, location
- Tags: Position type badge, Tier badge (colored), Posted date
- Salary range if available
- Apply button (primary) onClick={handleApply} or "Applied" badge if already applied
- Save button (secondary) onClick={handleSave}
- Tabs: Description, Requirements, Benefits, About School
- Similar jobs section using {similarJobs.map(...)}

**Integration Constraints:**
- DATA: Uses useJob(id), useApplicationStatus(id)
- HANDLERS: handleApply opens modal, handleSave toggles
- CONDITIONAL: Show "Applied" if application exists
```

#### Search Candidates (Admin)
```
Create a candidate search page with:
- Search bar with semantic search placeholder
- Filter sidebar:
  - Position Type: {positionTypes.map(...)}
  - Coaching Experience: {coachingTiers.map(...)} with tier colors
  - Recruiting Regions: {regions.map(...)} with region colors
  - Years of Experience: range slider
  - Open to Opportunities: toggle
- Results: "{totalCoaches} coaches found"
- Coach profile cards using {coaches.map((c) => <CoachCard key={c.id} {...c} onSave={handleSave} onContact={handleContact} />)}
- Pagination

**Integration Constraints:**
- DATA: Uses useCoachSearch(filters) hook
- SEARCH: Semantic search via Upstash Vector
- HANDLERS: handleSave (favorite), handleContact (message)
```

**Backend Integration:**

TypeScript Interfaces:
```typescript
interface JobPosting {
  id: string;
  admin_id: string;
  title: string;
  position_type: PositionType;
  coaching_tier: CoachingTier;
  sport: string;
  region: GeographicRegion | null;
  salary_min: number | null;
  salary_max: number | null;
  description: string;
  requirements: string[];
  benefits: string[];
  status: JobStatus;
  application_deadline: string | null;
  views_count: number;
  applications_count: number;
  created_at: string;
  // Joined data
  school?: {
    name: string;
    conference: string;
    logo_url: string;
  };
}

interface Application {
  id: string;
  job_id: string;
  coach_id: string;
  status: ApplicationStatus;
  cover_message: string | null;
  admin_notes: string | null;
  rating: number | null;
  applied_at: string;
  updated_at: string;
  // Joined data
  job?: JobPosting;
  coach?: Profile;
}
```

API Routes:
```
# Jobs
GET    /api/jobs                     — List jobs with filters
GET    /api/jobs/:id                 — Get job details
POST   /api/jobs                     — Create job (admin)
PUT    /api/jobs/:id                 — Update job (admin)
DELETE /api/jobs/:id                 — Delete job (admin)

# Applications
GET    /api/applications             — List applications
POST   /api/applications             — Apply to job (coach)
PUT    /api/applications/:id         — Update status (admin)
DELETE /api/applications/:id         — Withdraw (coach)

# Search
GET    /api/search/coaches           — Semantic coach search
```

**Post-Export Checklist:**
- [ ] Add 'use client' where needed
- [ ] Wire up React Query for data fetching
- [ ] Implement optimistic updates for apply/save
- [ ] Add loading skeletons
- [ ] Add error handling with retry
- [ ] Test filter combinations
- [ ] Test pagination

---

### Phase 5: Secondary Features (Messaging & Favorites)

**Skills Used:** face-layer, dna-layer

**Pages:**
- Messages Inbox (`/coach/messages`, `/admin/messages`)
- Conversation View (`/*/messages/:conversationId`)
- Saved Coaches (`/admin/favorites`)

**Stitch Prompts:**

#### Messages Inbox
```
Create a messaging inbox with:
- Two-column layout (conversation list | active conversation)
- Conversation list:
  - Search conversations
  - Conversation items with avatar, name, preview, time, unread badge
  - Active conversation highlighted
- Conversation view:
  - Header with recipient name, job context if applicable
  - Message bubbles: sent (right, primary), received (left, card)
  - Timestamp grouping
  - Message input with send button
- Mobile: single column, back navigation

Design System:
- Sent messages: bg-primary text-white
- Received: bg-card
- Unread badge: bg-primary

**Integration Constraints:**
- DATA: useConversations(), useMessages(conversationId)
- HANDLERS: handleSendMessage, handleSelectConversation
- REALTIME: Subscribe to new messages (future)
```

**Backend Integration:**

API Routes:
```
GET    /api/messages                 — List conversations
GET    /api/messages/:id             — Get messages in conversation
POST   /api/messages                 — Send message
PUT    /api/messages/:id/read        — Mark as read
```

**Post-Export Checklist:**
- [ ] Add 'use client' for message input
- [ ] Wire up message sending
- [ ] Implement optimistic updates
- [ ] Add typing indicators (future)
- [ ] Test mobile layout

---

### Phase 6: User Account & Billing

**Skills Used:** face-layer, dna-layer, supabase-auth

**Pages:**
- Profile Edit (`/coach/profile/edit`)
- Settings (`/*/settings`)
- Billing (`/*/billing`)
- Notifications (`/*/notifications`)

**Stitch Prompts:**

#### Coach Profile Edit (Multi-step Wizard)
```
Create a multi-step profile editor with:
- Progress indicator showing 5 steps
- Step 1: Basic Info - photo upload, name, email, bio
- Step 2: Experience - coaching history timeline with add/edit/delete
- Step 3: Qualifications - education, certifications, playing background
- Step 4: Expertise - coaching tiers, positions, recruiting regions (multi-select)
- Step 5: Preferences - open to opportunities toggle, visibility settings
- Navigation: Back, Next/Save buttons
- Auto-save indicator

Design System:
- Multi-select chips for tiers/positions/regions
- Tier colors on selection chips

**Integration Constraints:**
- DATA: useProfile(), useUpdateProfile()
- FORM: React Hook Form with Zod validation
- HANDLERS: handleNext, handleBack, handleSave
- UPLOAD: Photo upload to Supabase Storage
```

#### Billing Page
```
Create a billing page with:
- Current plan card with tier name, price, renewal date
- Usage metrics (profile views, applications, etc.)
- Upgrade/downgrade buttons onClick={handleChangePlan}
- Payment method card with last 4 digits
- "Manage Payment" button → Stripe portal
- Invoice history table with {invoices.map(...)}

**Integration Constraints:**
- DATA: useSubscription(), useInvoices()
- HANDLERS: handleChangePlan → Stripe Checkout, handleManagePayment → Stripe Portal
```

**Backend Integration:**

API Routes:
```
# Profile
PUT    /api/coaches/:id              — Update profile
POST   /api/coaches/:id/photo        — Upload photo

# Subscription
GET    /api/subscriptions            — Get current subscription
POST   /api/subscriptions/checkout   — Create Stripe checkout
POST   /api/subscriptions/portal     — Create Stripe portal session
DELETE /api/subscriptions            — Cancel subscription

# Notifications
GET    /api/notifications            — List notifications
PUT    /api/notifications/preferences — Update preferences
```

**Post-Export Checklist:**
- [ ] Add 'use client' to forms
- [ ] Wire up Stripe for billing
- [ ] Implement photo upload with preview
- [ ] Add form validation feedback
- [ ] Test subscription flows

---

### Phase 7: Public Profiles & Sharing

**Skills Used:** face-layer, dna-layer

**Pages:**
- Public Coach Profile (`/c/:username`)
- Public Job Posting (`/j/:id`)
- Embed Profile (future)

**Stitch Prompts:**

#### Public Coach Profile
```
Create a public coach profile page with:
- Hero section: large photo, name, current position, school
- Tier badges showing experience levels
- Stats: years experience, positions held
- About section with bio
- Coaching timeline visualization
- Recruiting regions map or list
- Contact button (if logged in as admin) onClick={handleContact}
- Share button onClick={handleShare}
- SEO optimized with metadata

Design System:
- Tier badges with colors
- Clean, professional layout
- No sensitive data shown

**Integration Constraints:**
- DATA: usePublicProfile(username)
- HANDLERS: handleContact, handleShare
- SEO: generateMetadata for social sharing
```

**Backend Integration:**

API Routes:
```
GET /api/public/coaches/:username    — Get public profile
GET /api/public/jobs/:id             — Get public job
```

Database Additions:
```sql
-- Add username to profiles
ALTER TABLE profiles ADD COLUMN username TEXT UNIQUE;

-- Public read policy for profiles with username
CREATE POLICY "Public profiles by username"
  ON profiles FOR SELECT
  USING (username IS NOT NULL AND visibility_mode = 'public');
```

**Post-Export Checklist:**
- [ ] Convert to `<Image>` and `<Link>`
- [ ] Add generateMetadata for SEO
- [ ] Implement OG image generation
- [ ] Test public access (no auth required)
- [ ] Verify RLS allows public read
- [ ] Add social sharing buttons

---

## 15. Skills Assessment

### Project Type

- [x] SaaS Web App

### Pattern Classification

- [x] Pattern 05: Full Application — Production-grade SaaS platform

**Justification:** Coaches Portal is a complete two-sided marketplace requiring:
- Full 3-layer architecture (Face/Head/DNA)
- User authentication with multiple roles
- Complex data models with relationships
- Subscription billing
- Search/matching algorithms
- Real-time features (messaging)

### Skills Map

| Layer | Skill | Justification |
|-------|-------|---------------|
| FACE | face-layer | Next.js 15 for SSR/SEO on marketing and public pages |
| FACE | google-stitch-prompts-nextjs | Stitch integration for rapid UI development |
| HEAD | head-layer | Vector search for semantic coach matching |
| DNA | dna-layer | Supabase + Stripe + Upstash integration |
| DNA | supabase-auth | Magic link + OAuth authentication |
| QUALITY | quality-gates | Testing, linting, build verification |

### Skills NOT Used

| Skill | Reason for Exclusion |
|-------|----------------------|
| vite-frontend | Next.js provides better SSR/SEO for this marketplace |
| expo-supabase | Web-first platform, mobile app is future phase |
| telegram-* | Not a Telegram Mini App |
| discord-* | Not a Discord Activity |
| chatgpt-* | Not a ChatGPT application |
| agentic-prompts | No complex AI agent workflows needed initially |

### Skill Chaining Order

```
dna-layer → supabase-auth → head-layer → face-layer → google-stitch-prompts-nextjs → quality-gates
```

---

## 16. Design System Foundation

### Color Palette

```css
:root {
  /* Primary - Professional Blue */
  --primary: #3B82F6;
  --primary-light: #93C5FD;
  --primary-dark: #1D4ED8;
  --primary-hover: #2563EB;
  --primary-foreground: #FFFFFF;

  /* Backgrounds - Dark Mode */
  --background: #050505;
  --background-off: #1A1A1A;
  --card: #1F1F22;
  --surface-dark: #121212;
  --surface-highlight: #1E1E1E;

  /* Text */
  --foreground: #FFFFFF;
  --foreground-secondary: #A1A1AA;
  --foreground-tertiary: #71717A;
  --muted-foreground: #52525B;

  /* Semantic */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;

  /* Border */
  --border: #27272A;
  --ring: #3B82F6;
  --radius: 0.5rem;

  /* Coaching Tiers */
  --tier-hs: #9CA3AF;
  --tier-juco: #CD7F32;
  --tier-d3: #22C55E;
  --tier-d2: #14B8A6;
  --tier-d1-fcs: #A855F7;
  --tier-d1-fbs: #3B82F6;
  --tier-pro: #F59E0B;

  /* Application Status */
  --status-applied: #3B82F6;
  --status-reviewing: #F59E0B;
  --status-interviewing: #8B5CF6;
  --status-offered: #06B6D4;
  --status-hired: #10B981;
  --status-rejected: #6B7280;

  /* Position Types */
  --position-hc: #F59E0B;
  --position-oc: #F97316;
  --position-dc: #EF4444;
  --position-coach: #3B82F6;
  --position-ga: #14B8A6;
  --position-analyst: #8B5CF6;

  /* Geographic Regions */
  --region-northeast: #3B82F6;
  --region-southeast: #F97316;
  --region-midwest: #EF4444;
  --region-southwest: #EAB308;
  --region-west: #22C55E;
  --region-mountain: #A855F7;
}
```

### Typography

- **Font Family:** Inter (all text)
- **Mono Font:** JetBrains Mono (code/data)
- **Headings:** font-bold tracking-tight
- **Body:** font-normal leading-relaxed
- **Font Sizes:** text-xs (12px) → text-6xl (60px)

### Spacing

- Base unit: 4px
- Standard scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64

### Border Radius

- sm: 4px
- DEFAULT: 6px
- md: 8px
- lg: 12px
- xl: 16px
- full: 9999px

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
```

### Global Stitch Instructions

Add to EVERY Stitch prompt:

```
Use Inter font family. Dark mode design with:
- Background: #050505 (deep dark)
- Cards: #1F1F22 with subtle border
- Primary accent: #3B82F6 (Professional Blue)
- Text: #FFFFFF primary, #A1A1AA secondary
- All buttons and cards use rounded-lg borders
- Subtle shadows (shadow-sm) on cards
- Consistent 16px/24px spacing
- Mobile-first responsive design with Tailwind CSS
- Icons: Material Symbols Outlined
```

### Component Library by Phase

| Phase | shadcn/ui Components | Custom Components |
|-------|----------------------|-------------------|
| 1 | Button, Card | Hero, FeatureGrid, PricingCard |
| 2 | Form, Input, Label | AuthForm, MagicLinkInput |
| 3 | Sidebar, Sheet, Avatar, DropdownMenu | AppShell, Navigation |
| 4 | Table, Dialog, Badge, Checkbox | JobCard, CoachCard, FilterPanel |
| 5 | Tabs, ScrollArea | MessageThread, ConversationList |
| 6 | Progress, Slider, Switch | ProfileWizard, BillingCard |
| 7 | — | PublicProfile, ShareButton |

---

## 17. Open Questions

### Resolved Questions ✅

| Question | Decision | Section |
|----------|----------|---------|
| MVP Scope | Football only (basketball in Phase 2+) | Section 1 |
| RepMax Integration | Yes - detailed in F11 | Section 5, 11 |
| Profile Verification | Yes - implemented verification badge system | Section 5 (F10) |
| Salary Transparency | Optional with "Salary Disclosed" badge | Section 5 (F3) |

### Business Questions (Remaining)

1. **Pricing Validation:** Have the proposed price points been validated with target users?
2. **Search Firm Partnership:** Should we offer an affiliate/referral program for search firms?
3. **Data Seeding:** What's the strategy for seeding initial coach profiles from public data?

### Technical Questions (Remaining)

1. **RepMax API Details:** Need to confirm with RepMax team:
   - Can commits be attributed to specific position coaches (not just programs)?
   - Is historical data available when coaches change programs?
   - What's the API rate limit and data refresh frequency?
   - Can we compute a "Recruiting Score" from the data?
2. **Vector Search:** Should semantic search use coach bios, or structured fields, or both?
3. **Real-time Messaging:** Is Supabase Realtime sufficient, or should we use a dedicated service?
4. **Mobile App:** Timeline for React Native/Expo mobile app development?

### Design Questions (Remaining)

1. **Confidential Mode:** How do we balance confidential job search with discoverability?
2. **Verification Badge Placement:** Where should badges appear (card only, profile header, search results)?

### Legal/Compliance Questions

1. **Data Privacy:** What GDPR/CCPA requirements apply to coach profile data?
2. **Employment Law:** Any restrictions on how hiring decisions can be facilitated?
3. **Terms of Service:** What liability limitations are needed for the marketplace model?

---

## Appendix: Constants

### Coaching Tiers

```typescript
export const COACHING_TIERS = [
  { value: 'high_school', label: 'High School', color: '#9CA3AF' },
  { value: 'juco', label: 'JUCO/CC', color: '#CD7F32' },
  { value: 'd3', label: 'NCAA D3', color: '#22C55E' },
  { value: 'd2', label: 'NCAA D2', color: '#14B8A6' },
  { value: 'd1_fcs', label: 'NCAA D1 FCS', color: '#A855F7' },
  { value: 'd1_fbs', label: 'NCAA D1 FBS', color: '#3B82F6' },
  { value: 'professional', label: 'Professional', color: '#F59E0B' },
] as const;
```

### Position Types

```typescript
export const POSITION_TYPES = [
  { value: 'head_coach', label: 'Head Coach', abbr: 'HC', color: '#F59E0B' },
  { value: 'offensive_coordinator', label: 'Offensive Coordinator', abbr: 'OC', color: '#F97316' },
  { value: 'defensive_coordinator', label: 'Defensive Coordinator', abbr: 'DC', color: '#EF4444' },
  { value: 'position_coach', label: 'Position Coach', abbr: 'PC', color: '#3B82F6' },
  { value: 'graduate_assistant', label: 'Graduate Assistant', abbr: 'GA', color: '#14B8A6' },
  { value: 'analyst', label: 'Analyst/QC', abbr: 'AN', color: '#8B5CF6' },
  { value: 'quality_control', label: 'Quality Control', abbr: 'QC', color: '#8B5CF6' },
] as const;
```

### Geographic Regions

```typescript
export const GEOGRAPHIC_REGIONS = [
  { value: 'northeast', label: 'Northeast', color: '#3B82F6' },
  { value: 'southeast', label: 'Southeast', color: '#F97316' },
  { value: 'midwest', label: 'Midwest', color: '#EF4444' },
  { value: 'southwest', label: 'Southwest', color: '#EAB308' },
  { value: 'west', label: 'West', color: '#22C55E' },
  { value: 'mountain', label: 'Mountain', color: '#A855F7' },
] as const;
```

### Application Statuses

```typescript
export const APPLICATION_STATUSES = [
  { value: 'applied', label: 'Applied', color: '#3B82F6' },
  { value: 'reviewing', label: 'Reviewing', color: '#F59E0B' },
  { value: 'interviewing', label: 'Interviewing', color: '#8B5CF6' },
  { value: 'offered', label: 'Offered', color: '#06B6D4' },
  { value: 'hired', label: 'Hired', color: '#10B981' },
  { value: 'rejected', label: 'Rejected', color: '#6B7280' },
  { value: 'withdrawn', label: 'Withdrawn', color: '#6B7280' },
] as const;
```

### Verification Statuses (F10)

```typescript
export const VERIFICATION_STATUSES = [
  { value: 'unverified', label: 'Not Verified', badge: null },
  { value: 'pending', label: 'Verification Pending', badge: null },
  { value: 'verified', label: 'Verified Coach', badge: { icon: 'check', color: '#3B82F6' } },
  { value: 'repmax_verified', label: 'RepMax Verified', badge: { icon: 'verified', color: '#F59E0B' } },
  { value: 'premium_verified', label: 'Premium Verified', badge: { icon: 'star', color: '#3B82F6' } },
] as const;

export const VERIFICATION_METHODS = [
  { value: 'email', label: 'Email Domain', description: 'Verified .edu email matches institution' },
  { value: 'linkedin', label: 'LinkedIn', description: 'Cross-referenced with LinkedIn profile' },
  { value: 'school', label: 'School Website', description: 'Confirmed on official athletic staff page' },
  { value: 'credential', label: 'Credentials', description: 'Verified certifications (AFCA, etc.)' },
  { value: 'repmax', label: 'RepMax Data', description: 'Found in RepMax recruiting database' },
] as const;
```

### Salary Disclosure Badge (F3)

```typescript
export const SALARY_BADGE = {
  label: 'Salary Disclosed',
  color: '#10B981', // Success green
  icon: 'payments',
  tooltip: 'This employer has disclosed the salary range for this position',
} as const;
```

---

*Generated by AI Coder Framework - Pattern 05: Full Application*
*Last Updated: January 2026 - Added MVP scope, verification badges, salary disclosure, RepMax integration*
