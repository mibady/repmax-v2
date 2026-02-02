# RepMax v2 — Master Stitch Workflow Plan

## Why This Plan Exists

This project has been built multiple times. Each iteration taught lessons about what breaks: premature code, unclear user flows, scope creep between dashboards, and backend assumptions that didn't match the UI. The Stitch Workflow exists to prevent all of that by enforcing a strict order: **plan → design → extract → build → wire**.

This document maps every piece of your existing v2 architecture docs (00-08) to the 13-stage Stitch Workflow, identifies what's done, what's missing, and what order to execute.

---

## Current State Assessment

| Existing Doc | Content | Stitch Stage Mapping | Completeness |
|---|---|---|---|
| 00-OVERVIEW | Executive summary, user types, file counts | Stage 1 (PRP) | 70% — missing JTBD, success metrics |
| 01-DATABASE-MIGRATIONS | 7 SQL migrations + extras | Stage 6-7 (premature) | 80% — `teams` table missing |
| 02-COMPANION-CARD | Component architecture, types, hooks | Stage 6-10 (premature) | 85% — needs UX states first |
| 03-TEAM-DASHBOARD | Layout, widgets, data flow | Stage 6-10 (premature) | 85% — needs UX states first |
| 04-ZONE-CONTENT-SANITY | CMS schemas, GROQ queries | Stage 6-7 | 75% — good content split |
| 05-IMPLEMENTATION-PHASES | 6-phase breakdown, ~13 days | Workflow structure | Needs remapping to 13 stages |
| 06-VERIFICATION-PLAN | Unit/integration/E2E tests | Stage 11-12 | 70% — good test specs |
| 07-UI-DESIGNS | ASCII wireframes | Stage 4-5 partial | 60% — needs Stitch prompts |
| 08-MISC-GAPS | Critical gap analysis | Cross-cutting | Critical — `teams` table, RLS gaps |

### The Core Problem with Previous Builds

Your existing docs jump straight to database schemas, component architectures, and TypeScript interfaces — **Stages 6-10 work**. The Stitch Workflow says you need to complete Stages 1-5 first:

```
WHAT YOU HAD:          WHAT YOU NEED:
                       
DB Schemas ←───────    Stage 1: Light PRP (business requirements)
Component Trees        Stage 2: UX Planning (user journeys, states)
TypeScript Types       Stage 3: Copywriting (every word in the app)
Hook Signatures        Stage 4: Stitch Prompts (design briefs with copy)
ASCII Wireframes       Stage 5: Stitch Design (visual sign-off)
                       Stage 6: Data Model Extraction ← THEN schemas
                       Stage 7: Backend Foundation ← THEN tables
                       Stage 8: Integration Scaffold ← THEN hooks
                       Stage 9: Stitch → Code ← THEN components
                       Stage 10: Wiring ← THEN connect
```

---

## Stage-by-Stage Execution Plan

### STAGE 1: Light PRP
**Status: 70% complete from existing docs. Needs formalization.**

The overview doc has the user types, dashboards, and file structure. What's missing:

#### 1.1 Project Overview (HAVE — needs refinement)
- Product: RepMax v2 Dashboard Architecture
- Platform: Next.js (App Router) + Supabase + Sanity CMS + Clerk + Stripe
- Scope: 5 dashboards, Companion Card, Zone Intelligence, Multi-role support

#### 1.2 Goals & Success Metrics (MISSING)

| Goal | Metric | Target |
|---|---|---|
| Athlete profile completion | % of athletes with complete Companion Cards | 60% within 30 days |
| Coach adoption | HS coaches actively using Team Dashboard | 50 teams in 90 days |
| Recruiter engagement | Profile views per recruiter per session | 15+ views |
| Parent linking | Parents linked via RepMax ID | 40% link rate |
| Card sharing | Companion Cards shared per week | 200+ shares |
| Zone content engagement | Zone Intelligence widget interactions | 3+ per session |

#### 1.3 User Personas (HAVE — needs JTBD framing)

| Persona | Name | JTBD Statement |
|---|---|---|
| **Athlete** | Marcus (Junior QB, TX) | "I want to showcase my stats and film so college coaches can find and evaluate me." |
| **Parent** | Lisa (Marcus's mom) | "I want to monitor my son's recruiting progress so I can support his journey without being overbearing." |
| **HS Coach** | Coach Davis (Southlake Carroll) | "I want to manage my roster's recruiting pipeline so I can help every player get the best opportunity." |
| **Recruiter** | Coach Williams (TCU) | "I want to efficiently discover and evaluate prospects so I can fill my recruiting class with the right fits." |
| **Club Organizer** | Mike (7v7 TX Elite) | "I want to run tournaments and verify athlete identities so events run smoothly and safely." |

#### 1.4 User Stories (PARTIALLY HAVE — scattered across docs)

**To be consolidated and prioritized. See Stage 2 for full journey maps.**

#### 1.5 Functional Requirements (HAVE — in existing docs)
#### 1.6 Non-Functional Requirements (MISSING)

| Requirement | Target |
|---|---|
| Time to Interactive (Team Dashboard) | < 2s |
| Companion Card public route load | < 1.5s |
| Search results display | < 1s |
| Sanity content fetch | < 500ms |
| Mobile-first responsive | All dashboards |
| Offline graceful degradation | Cached content with stale indicators |

#### 1.7 Technical Architecture — Platform Choice (HAVE)
- Framework: Next.js 15 (App Router)
- Auth: Clerk
- Database: Supabase (transactional) + Sanity CMS (editorial)
- Payments: Stripe
- State: TanStack Query
- Styling: Tailwind CSS + shadcn/ui

#### 1.8-1.9 Data Model & API Design
**"TBD — Extracted from Stitch designs"** (per Stitch Workflow rules)

#### 1.16 Design System Foundation (HAVE — partial)

| Token | Value |
|---|---|
| **Zone Colors** | NE: #4A90D9, SE: #F5A623, MW: #7B68EE, SW: #E74C3C, W: #2ECC71, NAT: #95A5A6 |
| **Background** | Dark gradient (gray-900 → gray-800) |
| **Typography** | Inter (text), SF Mono (numbers/metrics) |
| **Card Style** | Dark theme, gradient overlays, subtle hover animations |
| **Aspect Ratios** | Companion Card: 9:16, Athlete Card: standard card |
| **Layout** | Team Dashboard: 280px sticky sidebar + fluid main |
| **Grid** | Athlete Grid: 4-column responsive |

**EXIT CRITERIA:**
- [ ] Sections 1-7 complete and formalized
- [ ] Sections 8-9 marked "TBD — from Stitch"
- [ ] Section 16 (Design System) complete
- [ ] Stitch project created on stitch.new
- [ ] `stitch_project_id` recorded

---

### STAGE 2: UX Planning
**Status: NOT STARTED. This is the biggest gap.**

This is where previous builds broke. You had wireframes and types but no documented user journeys, states, or friction analysis. Every screen needs all of these defined BEFORE any design work.

#### Screen Inventory (17 unique screens/views)

| # | Screen | User Type | Priority |
|---|---|---|---|
| 1 | Athlete Dashboard | Athlete | P0 |
| 2 | Companion Card (edit mode) | Athlete | P0 |
| 3 | Companion Card (view mode) | All viewers | P0 |
| 4 | Companion Card (public route) | Anonymous | P0 |
| 5 | Parent Dashboard | Parent | P1 |
| 6 | Parent — Link Athlete flow | Parent | P1 |
| 7 | Team Dashboard (main) | HS Coach | P0 |
| 8 | Team Dashboard — Sidebar widgets | HS Coach | P0 |
| 9 | Team Dashboard — Add Athlete modal | HS Coach | P1 |
| 10 | Team Dashboard — Log Activity modal | HS Coach | P1 |
| 11 | Recruiter Dashboard — Search | Recruiter | P0 |
| 12 | Recruiter Dashboard — Shortlist | Recruiter | P1 |
| 13 | Club Dashboard | Club Organizer | P2 (existing) |
| 14 | Zone Landing Page | All | P1 |
| 15 | Role Switcher | Multi-role users | P1 |
| 16 | Marketing — Student Athlete Page | Anonymous | P2 |
| 17 | Onboarding — Profile Setup | New users | P1 |

**Full user journey maps, state inventories, and friction audits for each screen are in the separate UX Planning document: `01-UX-JOURNEYS.md`**

**EXIT CRITERIA:**
- [ ] User journeys documented for all 5 personas
- [ ] All 17 screens have state inventories (empty/loading/ideal/error/overload)
- [ ] Friction audit completed for P0 screens
- [ ] Accessibility considerations documented
- [ ] Edge cases identified per screen

---

### STAGE 3: Copywriting
**Status: NOT STARTED.**

Every word that appears in the app — headlines, button labels, empty states, error messages, tooltips, toast notifications — needs to be written BEFORE design.

#### Copy Inventory by Screen

| Screen | Copy Needed |
|---|---|
| **Companion Card** | Section headers (METRICS, ACADEMICS, DOCUMENTS, HIGHLIGHTS, COACH'S NOTES, CONTACT COACH), empty state messages per section, verified badge text, share modal copy, 404 page copy |
| **Team Dashboard** | Welcome headline, stats labels (Roster, Verified, PWO, Committed), widget headers, empty state for each widget, filter labels, add athlete modal copy |
| **Sidebar Widgets** | Task priority labels, activity type descriptions (12 types), college heat labels (Hot/Warm/Cold), calendar event type labels, note category labels, quick action button labels |
| **Zone Intelligence** | Zone taglines (6), stats labels, "Your Top Match" section copy, CTA buttons, empty zone state |
| **Error States** | Network error, RLS permission denied, invalid RepMax ID, profile not found, upload failed, task save failed |
| **Success States** | Profile saved, athlete added to roster, task completed, activity logged, note pinned, card shared |
| **Onboarding** | Role selection copy, profile setup wizard steps, Companion Card explainer, first-time dashboard messages |

**Full copywriting document: `02-COPY-DECK.md`**

**EXIT CRITERIA:**
- [ ] Copy for all 17 screens
- [ ] Empty state messages (with CTAs) for every data-driven component
- [ ] Error messages (helpful, actionable)
- [ ] Success confirmations
- [ ] 3 headline variations for key marketing surfaces

---

### STAGE 4: Stitch Prompt Generation
**Status: NOT STARTED. Depends on Stages 2-3.**

#### Screens to Design in Stitch

Grouped by design phase to minimize context switching:

**Phase A: Core Cards (shared components used everywhere)**
1. Companion Card (9:16 mobile — the hero component)
2. Athlete Card (grid item)
3. College Card
4. Recruiter Card
5. Camp/Event Card

**Phase B: Team Dashboard**
6. Team Dashboard — full layout with sidebar
7. Stats Overview row
8. Zone Map widget
9. Tasks Widget
10. Activity Widget
11. Colleges Widget
12. Calendar Widget
13. Notes Widget
14. Quick Actions Widget
15. Athlete Filters bar
16. Add Athlete modal

**Phase C: Zone Content**
17. Zone Intelligence Card (dashboard widget)
18. Zone Landing Page (full page)
19. College Grid (filterable)
20. Recruiter Directory
21. Camp Calendar

**Phase D: Supporting Screens**
22. Role Switcher dropdown
23. Companion Card 404 page
24. Companion Card share modal
25. Parent — Link Athlete flow
26. Marketing — Student Athlete Page

**Each prompt must include:**
- Design system tokens (colors, typography, spacing)
- Actual copy from Stage 3 (no lorem ipsum)
- All states from Stage 2 (empty, loading, ideal, error)
- Responsive requirements
- Interaction descriptions

**Full Stitch prompts document: `03-STITCH-PROMPTS.md`**

**EXIT CRITERIA:**
- [ ] Color scheme and CSS variables section complete
- [ ] Global style instructions complete
- [ ] 26 screen prompts with embedded copy
- [ ] State requirements referenced per prompt
- [ ] Responsive notes per screen

---

### STAGE 5: Stitch Design Phase
**Status: BLOCKED by Stages 2-4.**

#### Workflow
1. Create Stitch project at stitch.new
2. Paste prompts from Stage 4 sequentially
3. Generate all 26 screens
4. Review each screen against copy deck and state inventory
5. Iterate until satisfied
6. **Sign-off checkpoint** — this is the "never rebuild" gate

#### Sign-off Checklist
- [ ] All 26 screens designed
- [ ] Copy matches Stage 3 exactly
- [ ] All states represented (empty, loading, ideal, error)
- [ ] Color system consistent across all screens
- [ ] Mobile responsive for Companion Card confirmed
- [ ] Sidebar/main layout for Team Dashboard confirmed
- [ ] Zone map interactions described
- [ ] Sign-off date recorded

---

### STAGE 6: Data Model Extraction
**Status: YOU HAVE MOST OF THIS — but it was done prematurely.**

Your existing migration docs (01-DATABASE-MIGRATIONS.md + 08-MISC-GAPS.md) contain solid schema work. After Stage 5, you'll validate that the designs match these schemas and adjust.

#### Known Schema Issues to Resolve

| Issue | Source | Resolution |
|---|---|---|
| `teams` table missing | 08-MISC-GAPS | Add Migration 0 before all others |
| `PLAINS` zone missing from Sanity schema | MCP data shows 6 zones including PLAINS | Add to zone schema options |
| `team_rosters` may not exist | 01-DATABASE | Conditional CREATE TABLE IF NOT EXISTS |
| `recruiter_shortlists` not in numbered migrations | 01-DATABASE | Add as Migration 8 |
| `profile_views` not in numbered migrations | 01-DATABASE | Add as Migration 9 |
| RLS policy gap: coaches can't view cross-team | 08-MISC-GAPS | Add assistant coach support later |

#### Corrected Migration Order

| Order | File | Creates |
|---|---|---|
| 0 | `create_teams.sql` | `teams` table (BLOCKING dependency) |
| 1 | `add_companion_card_fields.sql` | Profile extensions + multi-role |
| 2 | `create_team_rosters.sql` | `team_rosters` (if not exists) |
| 3 | `create_coach_tasks.sql` | `coach_tasks` |
| 4 | `create_activity_log.sql` | `activity_log` |
| 5 | `create_college_relationships.sql` | `college_relationships` |
| 6 | `create_coach_notes.sql` | `coach_notes` |
| 7 | `create_recruiting_events.sql` | `recruiting_events` |
| 8 | `add_document_categories.sql` | Document categorization |
| 9 | `create_recruiter_shortlists.sql` | `recruiter_shortlists` |
| 10 | `create_profile_views.sql` | `profile_views` analytics |

---

### STAGES 7-13: Post-Design Implementation

These stages only begin after Stage 5 sign-off. They map to your existing docs like this:

| Stitch Stage | Your Existing Doc | What Happens |
|---|---|---|
| 7: Backend Foundation | 01-DATABASE-MIGRATIONS, 04-ZONE-SANITY | Apply migrations, configure RLS, set up Sanity |
| 8: Integration Scaffold | 02 & 03 hook signatures | Generate typed hooks from Supabase schema |
| 9: Stitch → Code | 07-UI-DESIGNS (replaced by Stitch exports) | Convert Stitch HTML to React components |
| 10: Wiring | 02 & 03 integration points | Connect components to hooks |
| 11: Final Integration | 06-VERIFICATION-PLAN (integration tests) | Cross-dashboard flow testing |
| 12: Quality Gates | 06-VERIFICATION-PLAN (E2E tests) | Full test suite, performance benchmarks |
| 13: Agent Handoff | — | Generate CLAUDE.md for ongoing maintenance |

---

## Architecture Diagrams

### System Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            RepMax v2 Architecture                            │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FACE LAYER (Next.js 15 App Router)                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                        │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │ Athlete  │ │ Parent   │ │  Team    │ │Recruiter │ │  Club    │   │  │
│  │  │Dashboard │ │Dashboard │ │Dashboard │ │Dashboard │ │Dashboard │   │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │  │
│  │       │             │            │             │            │          │  │
│  │       └──────┬──────┘     ┌──────┘      ┌──────┘            │          │  │
│  │              │            │             │                   │          │  │
│  │  ┌───────────▼────────────▼─────────────▼───────────────────▼────────┐│  │
│  │  │              Shared Components                                    ││  │
│  │  │  CompanionCard · AthleteCard · ZoneMap · RoleSwitcher            ││  │
│  │  │  CollegeCard · RecruiterCard · CampCard · ZoneBadge             ││  │
│  │  └───────────────────────────────────────────────────────────────────┘│  │
│  │                                                                        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  DNA LAYER (Data & APIs)                                                     │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                        │  │
│  │  ┌─────────────────────────┐    ┌─────────────────────────────────┐   │  │
│  │  │   SUPABASE              │    │   SANITY CMS                    │   │  │
│  │  │   (Transactional)       │    │   (Editorial)                   │   │  │
│  │  │                         │    │                                 │   │  │
│  │  │  profiles               │    │  zones (marketing content)      │   │  │
│  │  │  teams + team_rosters   │    │  colleges (program profiles)    │   │  │
│  │  │  coach_tasks            │    │  recruiters (directory)         │   │  │
│  │  │  activity_log           │    │  camps (event listings)         │   │  │
│  │  │  college_relationships  │    │  success stories                │   │  │
│  │  │  coach_notes            │    │  block content (rich text)      │   │  │
│  │  │  recruiting_events      │    │                                 │   │  │
│  │  │  recruiter_shortlists   │    │  CDN-delivered                  │   │  │
│  │  │  profile_views          │    │  Real-time via Sanity Live      │   │  │
│  │  │  documents              │    │  No deployments to update       │   │  │
│  │  │                         │    │                                 │   │  │
│  │  │  RLS per user role      │    └─────────────────────────────────┘   │  │
│  │  │  Auth via Clerk         │                                          │  │
│  │  │  Payments via Stripe    │    ┌─────────────────────────────────┐   │  │
│  │  └─────────────────────────┘    │   RepMax MCP Server            │   │  │
│  │                                 │   (AI-powered recruiting data)  │   │  │
│  │                                 │   prospects · zones · rankings  │   │  │
│  │                                 │   portal · calendar · programs  │   │  │
│  │                                 └─────────────────────────────────┘   │  │
│  │                                                                        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  AUTH & IDENTITY                                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  Clerk (SSO, social login, org management)                             │  │
│  │  Stripe Identity (athlete verification → ✓ VERIFIED badge)            │  │
│  │  Multi-role: profiles.roles[] → role switcher → dashboard routing     │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Dashboard Interaction Map (Refined)

```
                    ┌───────────────────────────────────┐
                    │         ATHLETE (Marcus)           │
                    │                                   │
                    │  Creates profile + Companion Card  │
                    │  Gets RepMax ID (REP-ABC-123)      │
                    │  Uploads film, stats, docs          │
                    │  Views Zone Intelligence            │
                    └───────────┬───────────────────────┘
                                │
           ┌────────────────────┼────────────────────┐
           │                    │                    │
           ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  PARENT (Lisa)   │  │ HS COACH (Davis) │  │RECRUITER (Williams│
│                  │  │                  │  │                  │
│ Links via        │  │ Adds to roster   │  │ Searches database│
│ RepMax ID        │  │ Logs activity    │  │ Views cards      │
│ Views card       │  │ (offers, visits) │  │ Shortlists       │
│ Shares card      │  │ Manages tasks    │  │ Contacts coaches │
│ Monitors journey │  │ Tracks colleges  │  │ Evaluates talent │
│                  │  │ Writes notes     │  │                  │
│  READ-ONLY       │  │  FULL CRUD       │  │  READ + SHORTLIST│
└──────────────────┘  └────────┬─────────┘  └──────────────────┘
                               │
                    ┌──────────▼─────────┐
                    │  Can ALSO be...    │
                    │                    │
                    │  CLUB ORGANIZER    │
                    │  (same person,     │
                    │   different role)  │
                    │                    │
                    │  Runs 7v7 events   │
                    │  Verifies IDs      │
                    │  Manages brackets  │
                    │  Handles payments  │
                    │                    │
                    │  Role Switcher: 🔄 │
                    └────────────────────┘
```

### Data Flow: Companion Card

```
WRITE PATH (Athlete edits card):
┌──────────┐    ┌──────────────┐    ┌──────────────┐
│ Athlete  │───▶│ Edit Form    │───▶│ Supabase     │
│ Dashboard│    │ (Companion   │    │ profiles     │
│          │    │  Card edit)  │    │ table        │
└──────────┘    └──────────────┘    └──────┬───────┘
                                          │
                                          │ invalidate
                                          ▼
READ PATH (Everyone views card):        TanStack
┌──────────┐    ┌──────────────┐    Query Cache
│ Any      │───▶│useCompanionCard───▶  │
│ Viewer   │    │ hook         │    ┌──┴──────────┐
│          │    │              │    │ profiles     │
│ Parent   │    │ Joins:       │    │ activity_log │
│ Coach    │    │ - profile    │    │ documents    │
│ Recruiter│    │ - offers     │    └─────────────┘
│ Public   │    │ - documents  │
└──────────┘    └──────────────┘

SHARE PATH (Anyone shares):
┌──────────┐    ┌──────────────┐    ┌──────────────┐
│ Share    │───▶│ Generate URL │───▶│ /athletes/   │
│ Button   │    │ from         │    │ REP-ABC-123/ │
│          │    │ repmax_id    │    │ card         │
└──────────┘    └──────────────┘    │              │
                                    │ SSR render   │
                                    │ OG meta tags │
                                    │ for social   │
                                    └──────────────┘
```

### Content Architecture Split

```
┌───────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│                    WHO CONTROLS WHAT DATA                                 │
│                                                                           │
│   SUPABASE (User-Generated)          SANITY (Editorially-Curated)        │
│   ═══════════════════════            ═══════════════════════════          │
│                                                                           │
│   Created by USERS in-app:           Created by EDITORS in Sanity Studio:│
│                                                                           │
│   ✏️ Athlete profiles                📝 Zone descriptions & marketing     │
│   ✏️ Coach tasks & notes             📝 College program profiles          │
│   ✏️ Activity logs (offers, etc.)    📝 Recruiter directory entries       │
│   ✏️ College relationships           📝 Camp & showcase listings          │
│   ✏️ Recruiting events               📝 Success stories & testimonials   │
│   ✏️ Recruiter shortlists            📝 Position guides & resources      │
│   ✏️ Parent-student links            📝 Recruiting timeline content      │
│   ✏️ Tournament registrations        📝 Featured athletes (editorial)    │
│   ✏️ Match results & scores                                              │
│   ✏️ Identity verification status                                        │
│   ✏️ Payment history                                                     │
│   ✏️ Profile view analytics                                              │
│                                                                           │
│   REAL-TIME, TRANSACTIONAL           CACHED, CDN-DELIVERED               │
│   RLS-protected per user role        Public or auth-gated                │
│   Changes instantly                  Changes via editorial workflow      │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Revised Timeline (Stitch Workflow)

| Stage | Name | Days | Deliverable | Blocked By |
|---|---|---|---|---|
| 1 | Light PRP | 0.5 | `prps/repmax-v2.md` | Nothing |
| 2 | UX Planning | 1.5 | User journeys, states, friction audit | Stage 1 |
| 3 | Copywriting | 1 | Complete copy deck for all 17 screens | Stage 2 |
| 4 | Stitch Prompts | 1 | 26 design prompts with copy embedded | Stages 2+3 |
| 5 | Stitch Design | 1.5 | All screens designed, sign-off | Stage 4 |
| 6 | Data Model Extraction | 0.5 | Validated schema from designs | Stage 5 |
| 7 | Backend Foundation | 1.5 | Migrations applied, RLS, Sanity setup | Stage 6 |
| 8 | Integration Scaffold | 0.5 | Generated hooks, actions, types | Stage 7 |
| 9 | Stitch → Code | 2 | All screens converted to React components | Stages 5+8 |
| 10 | Wiring | 2 | Components connected to hooks | Stages 8+9 |
| 11 | Final Integration | 1 | Cross-dashboard flows verified | Stage 10 |
| 12 | Quality Gates | 1 | Tests passing, performance benchmarks met | Stage 11 |
| 13 | Agent Handoff | 0.5 | CLAUDE.md + commands generated | Stage 12 |
| | **TOTAL** | **~15 days** | | |

### Why This Is 2 Days Longer Than Your Original Estimate

Your original 13-day plan skipped Stages 1-5 entirely. This plan adds ~4 days of upfront planning but will save you the rebuild. The math:

```
Old approach: 13 days to build + X days to realize it's wrong + 13 days to rebuild = 26+ days
New approach: 15 days total, built once, correctly
```

---

## Critical Path

```
STAGE 1 (PRP)
    │
    ▼
STAGE 2 (UX Planning) ──────────────────────────────────────────┐
    │                                                            │
    ▼                                                            │
STAGE 3 (Copywriting)                                            │
    │                                                            │
    ▼                                                            │
STAGE 4 (Stitch Prompts)                                         │
    │                                                            │
    ▼                                                            │
STAGE 5 (Stitch Design) ◀──── SIGN-OFF GATE ────────────────────┘
    │                          (No code until this passes)
    ▼
STAGE 6 (Data Model) ←── Validate against existing migrations
    │
    ├──────────────────┐
    ▼                  ▼
STAGE 7 (Backend)   STAGE 8 (Integration Scaffold)
    │                  │
    └────────┬─────────┘
             ▼
STAGE 9 (Stitch → Code)
    │
    ▼
STAGE 10 (Wiring)
    │
    ▼
STAGE 11 (Final Integration)
    │
    ▼
STAGE 12 (Quality Gates)
    │
    ▼
STAGE 13 (Agent Handoff)
    │
    ▼
    🚀 SHIP
```

---

## Immediate Next Steps

**You are here: Ready to finalize Stage 1 and begin Stage 2.**

### Action Items (in order)

1. **Finalize the Light PRP** — I can generate the formal PRP document from your existing docs, adding the missing success metrics, JTBD statements, and non-functional requirements.

2. **Create the UX Planning document** — Full user journey maps for all 5 personas across all 17 screens, with state inventories and friction audits. This is the biggest gap and the most important deliverable before design.

3. **Write the Copy Deck** — Every word in the app, organized by screen, including all empty/error/success states.

4. **Generate Stitch Prompts** — 26 screen-level design prompts with the copy embedded and states referenced.

5. **Create Stitch project** — Paste prompts, generate designs, iterate, sign off.

Then and only then: build.

---

## Files in This Planning Package

| File | Purpose | Stage |
|---|---|---|
| `00-MASTER-STITCH-PLAN.md` | This document — master roadmap | All |
| `01-UX-JOURNEYS.md` | User journeys, states, friction audit | Stage 2 |
| `02-COPY-DECK.md` | All copy organized by screen | Stage 3 |
| `03-STITCH-PROMPTS.md` | Design prompts with copy embedded | Stage 4 |
| `04-DATA-MODEL-VALIDATION.md` | Schema validation against designs | Stage 6 |
| `05-ARCHITECTURE-DIAGRAMS.mermaid` | Visual architecture diagrams | Reference |
