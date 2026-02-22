# E2E Production Readiness Test Suite — RepMax v2

## Context

RepMax v2 has **63 pages**, **48 API routes**, and **6 user roles** (athlete, recruiter, coach, parent, club, admin). All dashboards are built and wired to real data. We need a comprehensive E2E test suite that clicks every button, tests every user journey, and verifies production readiness — running group-by-group in an E2B cloud sandbox so the system is not bogged down.

Infrastructure already exists:
- `~/.claude/scripts/grouped-journey-e2b.ts` — runs numbered journey groups sequentially in ONE E2B sandbox (build once, start server once, iterate groups)
- `~/.claude/scripts/journey-runner.ts` — Playwright-based executor with 26 actions
- `apps/web/__tests__/fixtures/users.ts` — 22 test users across all roles (password: TestPass123!)
- `test/seed/seed-loader.ts` — seeds demo data into Supabase

What's missing: The `journeys/` directory with numbered group JSON files. No E2E tests exist yet.

---

## Deliverables

Create `apps/web/journeys/` directory with **16 numbered group files** covering all 63 pages, ~124 journeys total.

---

## All 63 Pages (Source of Truth)

### Public (no auth) — 15 pages
| # | Route | Page File |
|---|-------|-----------|
| 1 | `/` | `app/page.tsx` |
| 2 | `/pricing` | `app/pricing/page.tsx` |
| 3 | `/login` | `app/(auth)/login/page.tsx` |
| 4 | `/signup` | `app/(auth)/signup/page.tsx` |
| 5 | `/auth/reset-password` | `app/auth/reset-password/page.tsx` |
| 6 | `/card/[id]` | `app/card/[id]/page.tsx` |
| 7 | `/athlete/[id]` | `app/athlete/[id]/page.tsx` |
| 8 | `/positions/[position]` | `app/positions/[position]/page.tsx` |
| 9 | `/programs/[id]` | `app/programs/[id]/page.tsx` |
| 10 | `/states/[state]` | `app/states/[state]/page.tsx` |
| 11 | `/zones/[zone]` | `app/zones/[zone]/page.tsx` |
| 12 | `/privacy` | `app/privacy/page.tsx` |
| 13 | `/terms` | `app/terms/page.tsx` |
| 14 | `/support` | `app/support/page.tsx` |
| 15 | `/not-found` | `app/not-found/page.tsx` |

### Onboarding (auth required) — 3 pages
| # | Route | Page File |
|---|-------|-----------|
| 16 | `/onboarding/role` | `app/onboarding/role/page.tsx` |
| 17 | `/onboarding/chat` | `app/onboarding/chat/page.tsx` |
| 18 | `/dashboard` | `app/(app)/dashboard/page.tsx` |

### Athlete Dashboard — 5 pages
| # | Route | Page File |
|---|-------|-----------|
| 19 | `/athlete` | `app/(dashboard)/athlete/page.tsx` |
| 20 | `/athlete/film` | `app/(dashboard)/athlete/film/page.tsx` |
| 21 | `/athlete/analytics` | `app/(dashboard)/athlete/analytics/page.tsx` |
| 22 | `/athlete/documents` | `app/(dashboard)/athlete/documents/page.tsx` |
| 23 | `/athlete/card/edit` | `app/(dashboard)/athlete/card/edit/page.tsx` |

### Recruiter Dashboard — 8 pages
| # | Route | Page File |
|---|-------|-----------|
| 24 | `/recruiter/pipeline` | `app/(dashboard)/recruiter/pipeline/page.tsx` |
| 25 | `/recruiter/compare` | `app/(dashboard)/recruiter/compare/page.tsx` |
| 26 | `/recruiter/territory` | `app/(dashboard)/recruiter/territory/page.tsx` |
| 27 | `/recruiter/visits` | `app/(dashboard)/recruiter/visits/page.tsx` |
| 28 | `/recruiter/communications` | `app/(dashboard)/recruiter/communications/page.tsx` |
| 29 | `/recruiter/reports` | `app/(dashboard)/recruiter/reports/page.tsx` |
| 30 | `/recruiter/film/[id]` | `app/(dashboard)/recruiter/film/[id]/page.tsx` |
| 31 | `/recruiter/prospects/[id]` | `app/(dashboard)/recruiter/prospects/[id]/page.tsx` |

### Coach Dashboard — 8 pages
| # | Route | Page File |
|---|-------|-----------|
| 32 | `/coach` | `app/(dashboard)/coach/page.tsx` |
| 33 | `/coach/roster` | `app/(dashboard)/coach/roster/page.tsx` |
| 34 | `/coach/roster/new` | `app/(dashboard)/coach/roster/new/page.tsx` |
| 35 | `/coach/roster/[id]` | `app/(dashboard)/coach/roster/[id]/page.tsx` |
| 36 | `/coach/roster/[id]/edit` | `app/(dashboard)/coach/roster/[id]/edit/page.tsx` |
| 37 | `/coach/tasks` | `app/(dashboard)/coach/tasks/page.tsx` |
| 38 | `/coach/recruiting` | `app/(dashboard)/coach/recruiting/page.tsx` |
| 39 | `/coach/schedule` | `app/(dashboard)/coach/schedule/page.tsx` |

### Parent Dashboard — 6 pages
| # | Route | Page File |
|---|-------|-----------|
| 40 | `/parent` | `app/(dashboard)/parent/page.tsx` |
| 41 | `/parent/profile` | `app/(dashboard)/parent/profile/page.tsx` |
| 42 | `/parent/schools` | `app/(dashboard)/parent/schools/page.tsx` |
| 43 | `/parent/calendar` | `app/(dashboard)/parent/calendar/page.tsx` |
| 44 | `/parent/activity` | `app/(dashboard)/parent/activity/page.tsx` |
| 45 | `/parent/resources` | `app/(dashboard)/parent/resources/page.tsx` |

### Club Dashboard — 8 pages
| # | Route | Page File |
|---|-------|-----------|
| 46 | `/club` | `app/(dashboard)/club/page.tsx` |
| 47 | `/club/events` | `app/(dashboard)/club/events/page.tsx` |
| 48 | `/club/events/new` | `app/(dashboard)/club/events/new/page.tsx` |
| 49 | `/club/verifications` | `app/(dashboard)/club/verifications/page.tsx` |
| 50 | `/club/athletes` | `app/(dashboard)/club/athletes/page.tsx` |
| 51 | `/club/payments` | `app/(dashboard)/club/payments/page.tsx` |
| 52 | `/club/scouts` | `app/(dashboard)/club/scouts/page.tsx` |
| 53 | `/club/analytics` | `app/(dashboard)/club/analytics/page.tsx` |

### Admin Dashboard — 4 pages
| # | Route | Page File |
|---|-------|-----------|
| 54 | `/admin` | `app/(dashboard)/admin/page.tsx` |
| 55 | `/admin/users` | `app/(dashboard)/admin/users/page.tsx` |
| 56 | `/admin/flags` | `app/(dashboard)/admin/flags/page.tsx` |
| 57 | `/admin/moderation` | `app/(dashboard)/admin/moderation/page.tsx` |

### Cross-Role (auth required) — 6 pages
| # | Route | Page File |
|---|-------|-----------|
| 58 | `/messages` | `app/(dashboard)/messages/page.tsx` |
| 59 | `/messages/[id]` | `app/(dashboard)/messages/[id]/page.tsx` |
| 60 | `/zone/map` | `app/(dashboard)/zone/map/page.tsx` |
| 61 | `/settings` | `app/(dashboard)/settings/page.tsx` |
| 62 | `/settings/notifications` | `app/(dashboard)/settings/notifications/page.tsx` |
| 63 | `/help` | `app/(dashboard)/help/page.tsx` |

---

## Journey Group Files

### 00-public.json — Landing, Auth & Static Pages (9 pages, no auth)

- Pages: `/`, `/pricing`, `/login`, `/signup`, `/auth/reset-password`, `/privacy`, `/terms`, `/support`, `/not-found`
- Journeys (14):
  a. Landing page loads cleanly (assert_no_bad_text, assert_console_clean, screenshot)
  b. Landing CTA links exist (assert_visible a[href='/signup'], a[href='/login'])
  c. Pricing page loads with 5 category tabs (assert_text_present: Athletes, Recruiters, Schools, Events, Dashr)
  d. Pricing tab switching works (click Recruiters tab, assert_text_present: Free, Pro, Team, AI)
  e. Pricing Monthly/Annual toggle (click Annual, assert_text_present: /yr)
  f. Pricing FAQ accordion expands (click details summary, assert_visible details[open])
  g. Login page renders email + password + submit
  h. Login fails with wrong credentials (fill bad creds, assert stays on /login)
  i. Signup page renders without errors
  j. Reset password page loads (assert_no_bad_text, screenshot)
  k. Privacy policy page loads (assert_text_present: Privacy Policy)
  l. Terms of service page loads (assert_text_present: Terms)
  m. Support page loads (assert_text_present: support@repmax.io)
  n. 404 page loads without crash (assert_no_bad_text, screenshot)

### 01-public-directories.json — Public Profiles & Directories (6 pages, no auth)

- Pages: `/card/REP-JW-2026`, `/athlete/[id]`, `/positions/quarterback`, `/programs/[id]`, `/states/texas`, `/zones/southeast`
- Journeys (8):
  a. Public athlete card loads (navigate to /card/REP-JW-2026, assert_no_bad_text, screenshot)
  b. Public athlete card shows Jaylen data (assert_text_present: Jaylen Washington)
  c. Public athlete profile page loads (/athlete/[id], assert_no_bad_text)
  d. Position directory page loads (/positions/quarterback, assert_no_bad_text, screenshot)
  e. Program detail page loads (/programs/[id], assert_no_bad_text, screenshot)
  f. State directory page loads (/states/texas, assert_no_bad_text, screenshot)
  g. Zone directory page loads (/zones/southeast, assert_no_bad_text, screenshot)
  h. Auth guard: /athlete redirects to /login (no auth, navigate to /athlete, assert URL contains /login)

### 02-onboarding.json — Onboarding & Dashboard Redirect (3 pages, auth)

- Auth: jaylen.washington@test.repmax.io
- Pages: `/onboarding/role`, `/onboarding/chat`, `/dashboard`
- Journeys (5):
  a. Login + redirect to dashboard (login flow, assert URL contains /athlete or /dashboard)
  b. Dashboard general redirect page loads (/dashboard, assert_no_bad_text)
  c. Onboarding role selection page loads (/onboarding/role, assert_no_bad_text, screenshot)
  d. Onboarding chat page loads (/onboarding/chat, assert_no_bad_text, screenshot)
  e. Auth guard: /recruiter/pipeline redirects to /login for unauthenticated user

### 03-athlete-core.json — Athlete Dashboard (1 page, Jaylen 100% profile)

- Auth: jaylen.washington@test.repmax.io
- Pages: `/athlete`
- Journeys (7):
  a. Login flow (navigate /login, fill email + password, submit, wait)
  b. Dashboard data renders (assert_no_bad_text, assert_no_text: undefined, assert_no_text: NaN)
  c. Zone Pulse banner visible (assert_visible)
  d. Profile card edit link wired (assert_visible a[href*='card/edit'])
  e. Share button interactive (assert_visible, click, screenshot)
  f. Quick action links wired (assert_visible sidebar nav links)
  g. Calendar section no stuck loading (assert_no_stuck_loading, screenshot)

### 04-athlete-film.json — Athlete Film Room (1 page)

- Auth: jaylen.washington@test.repmax.io
- Pages: `/athlete/film`
- Journeys (5):
  a. Film page loads (navigate, assert_no_bad_text, screenshot)
  b. Upload button opens AddHighlightModal (click, assert_visible modal)
  c. Upload zone clickable (assert_visible dashed border div)
  d. No bad text (assert_no_text: undefined, NaN, [object Object])
  e. Video player controls visible (assert_visible video element)

### 05-athlete-subpages.json — Analytics, Documents, Card Edit (3 pages)

- Auth: jaylen.washington@test.repmax.io
- Pages: `/athlete/analytics`, `/athlete/documents`, `/athlete/card/edit`
- Journeys (7):
  a. Analytics page loads (assert_no_bad_text, assert_no_stuck_loading, screenshot)
  b. Analytics KPI cards render (assert_visible stat cards)
  c. Analytics time range toggle (click toggle, screenshot)
  d. Documents page loads (assert_no_bad_text, assert_no_stuck_loading, screenshot)
  e. Documents upload button interactive (assert_visible upload button, click)
  f. Documents filter button opens panel (assert_visible filter button)
  g. Card edit page loads (assert_no_bad_text, screenshot)

### 06-athlete-empty.json — Empty States (Tyler Chen, 5% profile)

- Auth: tyler.chen@test.repmax.io
- Pages: `/athlete`, `/athlete/film`, `/athlete/analytics`, `/athlete/documents`
- Journeys (4):
  a. Dashboard with empty/minimal data (no undefined/NaN/[object Object])
  b. Film empty state message (assert_no_bad_text, screenshot)
  c. Analytics zeros not undefined (assert_no_text: undefined, assert_no_text: NaN)
  d. Documents empty state (assert_no_bad_text, screenshot)

### 07-recruiter-core.json — Recruiter Pipeline, Compare & Territory (4 pages)

- Auth: coach.williams@test.repmax.io
- Pages: `/recruiter/pipeline`, `/recruiter/compare`, `/recruiter/territory`, `/recruiter/prospects/[id]`
- Journeys (8):
  a. Login + redirect (navigate /login, fill recruiter creds, submit, wait)
  b. Pipeline Kanban columns visible (assert_no_bad_text, assert_no_stuck_loading, screenshot)
  c. Pipeline class year filter (assert_visible filter, click)
  d. Pipeline Add Prospect button wired (assert_visible, click)
  e. Compare page loads (navigate, assert_no_bad_text, screenshot)
  f. Territory page loads (navigate /recruiter/territory, assert_no_bad_text, screenshot)
  g. Prospect detail page loads (/recruiter/prospects/[id], assert_no_bad_text, screenshot)
  h. Export button interactive (assert_visible, click)

### 08-recruiter-tools.json — Recruiter Sub-Pages (4 pages)

- Auth: coach.williams@test.repmax.io
- Pages: `/recruiter/visits`, `/recruiter/communications`, `/recruiter/reports`, `/recruiter/film/[id]`
- Journeys (6):
  a. Visits page loads (assert_no_bad_text, assert_no_stuck_loading, screenshot)
  b. Schedule Visit button interactive on visits page (assert_visible, click)
  c. Communications page loads (assert_no_bad_text, assert_no_stuck_loading, screenshot)
  d. Reports page loads (assert_no_bad_text, assert_no_stuck_loading, screenshot)
  e. Film viewer page loads (/recruiter/film/[id], assert_no_bad_text, screenshot)
  f. Film player controls visible (assert_visible video element)

### 09-coach.json — Coach Dashboard & Roster (8 pages)

- Auth: coach.davis@test.repmax.io
- Pages: `/coach`, `/coach/roster`, `/coach/roster/new`, `/coach/roster/[id]`, `/coach/roster/[id]/edit`, `/coach/tasks`, `/coach/recruiting`, `/coach/schedule`
- Journeys (11):
  a. Login + dashboard load (navigate /login, fill creds, submit, wait, assert_no_bad_text)
  b. Dashboard metric cards (assert_text_present: Total Athletes, or similar stat labels)
  c. Dashboard Add Athlete link wired (assert_visible a[href*='roster'])
  d. Roster table loads with data (navigate /coach/roster, assert_no_bad_text, screenshot)
  e. Roster position filter (assert_visible filter, click)
  f. Roster select-all checkbox (assert_visible checkbox)
  g. Add athlete form page loads (/coach/roster/new, assert_no_bad_text, screenshot)
  h. Athlete detail page loads (/coach/roster/[id], assert_no_bad_text, screenshot)
  i. Athlete edit page loads (/coach/roster/[id]/edit, assert_no_bad_text, screenshot)
  j. Tasks page loads (/coach/tasks, assert_no_bad_text, assert_no_stuck_loading, screenshot)
  k. Recruiting + schedule pages load (assert_no_bad_text each, screenshot)

### 10-parent.json — Parent Dashboard (6 pages)

- Auth: lisa.washington@test.repmax.io
- Pages: `/parent`, `/parent/profile`, `/parent/schools`, `/parent/calendar`, `/parent/activity`, `/parent/resources`
- Journeys (8):
  a. Login + dashboard load (navigate /login, fill creds, submit, wait, assert_no_bad_text)
  b. Dashboard metric cards visible (assert_visible stat cards)
  c. Quick action links wired (assert_visible sidebar nav links)
  d. Profile page loads (/parent/profile, assert_no_bad_text, screenshot)
  e. Schools page loads (/parent/schools, assert_no_bad_text, screenshot)
  f. Calendar page loads (/parent/calendar, assert_no_bad_text, screenshot)
  g. Activity feed page loads (/parent/activity, assert_no_bad_text, screenshot)
  h. Resources page loads (/parent/resources, assert_no_bad_text, screenshot)

### 11-club.json — Club Dashboard (8 pages)

- Auth: mike.torres@test.repmax.io
- Pages: `/club`, `/club/events`, `/club/events/new`, `/club/verifications`, `/club/athletes`, `/club/payments`, `/club/scouts`, `/club/analytics`
- Journeys (10):
  a. Login + dashboard load (navigate /login, fill creds, submit, wait, assert_no_bad_text)
  b. Dashboard stat cards visible (assert_visible stat cards)
  c. Create Tournament CTA wired (assert_visible, click)
  d. Events list page loads (/club/events, assert_no_bad_text, screenshot)
  e. New event form page loads (/club/events/new, assert_no_bad_text, screenshot)
  f. Verifications queue page loads (/club/verifications, assert_no_bad_text, screenshot)
  g. Athletes page loads (/club/athletes, assert_no_bad_text, screenshot)
  h. Payments page loads (/club/payments, assert_no_bad_text, screenshot)
  i. Scouts page loads (/club/scouts, assert_no_bad_text, screenshot)
  j. Analytics page loads (/club/analytics, assert_no_bad_text, screenshot)

### 12-admin.json — Admin Dashboard (4 pages)

- Auth: admin@repmax.io
- Pages: `/admin`, `/admin/users`, `/admin/flags`, `/admin/moderation`
- Journeys (8):
  a. Login + dashboard load (navigate /login, fill creds, submit, wait, assert_no_bad_text)
  b. Dashboard KPI cards visible (assert_visible stat cards)
  c. Dashboard refresh button wired (assert_visible, click)
  d. Dashboard profile completeness bars or chart (assert_no_stuck_loading, screenshot)
  e. User management page loads (/admin/users, assert_no_bad_text, screenshot)
  f. User management table renders (assert_visible table or list)
  g. Feature flags page loads (/admin/flags, assert_no_bad_text, screenshot)
  h. Content moderation page loads (/admin/moderation, assert_no_bad_text, screenshot)

### 13-messages-zone.json — Messaging & Zone Intel (4 pages)

- Auth: jaylen.washington@test.repmax.io + cross-role test with recruiter
- Pages: `/messages`, `/messages/[id]`, `/zone/map`
- Journeys (8):
  a. Messages page loads (navigate, assert_no_bad_text, screenshot)
  b. New Message button opens compose modal (assert_visible, click)
  c. Search filter works (assert_visible search input)
  d. Tab switching (All/Unread/Archived) (assert_visible tabs)
  e. Message detail page loads (/messages/[id], assert_no_bad_text, screenshot)
  f. Zone map loads (/zone/map, assert_no_bad_text, screenshot)
  g. Zone map totals stats bar visible (assert_visible)
  h. Zone map refresh button or activity feed (assert_no_stuck_loading)

### 14-settings-help-checkout.json — Settings, Help & Checkout (4 pages)

- Auth: jaylen.washington@test.repmax.io (and anon for checkout)
- Pages: `/settings`, `/settings/notifications`, `/help`, `/pricing`
- Journeys (10):
  a. Settings page loads (/settings, assert_no_bad_text, screenshot)
  b. Settings form fields visible (assert_visible form inputs)
  c. Notification settings page loads (/settings/notifications, assert_no_bad_text, screenshot)
  d. Help center page loads (/help, assert_no_bad_text, screenshot)
  e. Help center FAQ or search visible (assert_visible)
  f. Pricing — Athletes tab default for athlete user (assert_text_present: Basic, Premium, Pro)
  g. Pricing — Pro plan checkout button interactive (assert_visible, click)
  h. Pricing — Start Free button wired (assert_visible)
  i. Pricing — Recruiters Enterprise card shows mailto (assert_visible, assert_text_present: Enterprise)
  j. Pricing — Dashr tab one-time prices visible (click Dashr tab, assert_text_present: Standard Combine)

### 15-responsive.json — Mobile Viewport (390x844)

- Auth: jaylen.washington@test.repmax.io
- Pages: `/`, `/pricing`, `/athlete`, `/athlete/film`, `/messages`
- Journeys (6):
  a. Set 390x844 viewport, landing loads responsively (screenshot)
  b. Pricing page responsive — tabs scroll horizontally or stack (screenshot)
  c. Mobile login + athlete dashboard (login flow, assert_no_bad_text, screenshot)
  d. Film page mobile (assert_no_stuck_loading, screenshot)
  e. Messages page mobile (assert_no_bad_text, screenshot)
  f. Mobile navigation/sidebar accessible (assert_visible hamburger or nav toggle)

---

## Page Coverage Summary

| Group | Pages Covered | New Unique | Running Total |
|-------|---------------|------------|---------------|
| 00-public | 9 | 9 | 9 |
| 01-public-directories | 6 | 6 | 15 |
| 02-onboarding | 3 | 3 | 18 |
| 03-athlete-core | 1 | 1 | 19 |
| 04-athlete-film | 1 | 1 | 20 |
| 05-athlete-subpages | 3 | 3 | 23 |
| 06-athlete-empty | 4 | 0 (overlap) | 23 |
| 07-recruiter-core | 4 | 4 | 27 |
| 08-recruiter-tools | 4 | 4 | 31 |
| 09-coach | 8 | 8 | 39 |
| 10-parent | 6 | 6 | 45 |
| 11-club | 8 | 8 | 53 |
| 12-admin | 4 | 4 | 57 |
| 13-messages-zone | 3 | 3 | 60 (+map) |
| 14-settings-help-checkout | 4 | 3 | 63 |
| 15-responsive | 5 | 0 (overlap) | **63** |

**Total: 63 unique pages covered across 16 groups, ~124 journeys**

---

## Group JSON Schema

Every file follows this exact structure:
```json
{
  "project": "repmax-v2",
  "group": "00-public",
  "name": "Landing, Auth & Static Pages",
  "requiresAuth": false,
  "role": "none",
  "baseUrl": "http://localhost:3000",
  "env": {
    "TEST_EMAIL": "",
    "TEST_PASSWORD": ""
  },
  "pages": ["/", "/pricing", "/login"],
  "journeys": [
    {
      "name": "Landing page loads",
      "priority": "critical",
      "description": "Verify landing renders with no bad text",
      "steps": [
        { "action": "navigate", "url": "/", "expect": { "no_crash": true, "not_empty": true } },
        { "action": "assert_no_bad_text" },
        { "action": "screenshot" }
      ]
    }
  ]
}
```

Login pattern (first journey in every auth group):
```json
{ "action": "navigate", "url": "/login" },
{ "action": "fill", "selector": "input[type='email']", "value": "{{TEST_EMAIL}}" },
{ "action": "fill", "selector": "input[type='password']", "value": "{{TEST_PASSWORD}}" },
{ "action": "click", "selector": "button[type='submit']" },
{ "action": "wait", "value": "4000" }
```

Standard page check (every page visit):
```json
{ "action": "navigate", "url": "/athlete" },
{ "action": "wait", "value": "3000" },
{ "action": "assert_no_bad_text" },
{ "action": "assert_no_stuck_loading" },
{ "action": "assert_no_text", "value": "undefined" },
{ "action": "assert_no_text", "value": "NaN" },
{ "action": "screenshot" }
```

---

## Team Structure

Team Gate: 16 new files — exceeds 6-file gate. Spawn team.

| Agent | Role | Files Owned | Est. Journeys |
|-------|------|-------------|---------------|
| builder-public | Builder | 00-public, 01-public-directories, 02-onboarding, 15-responsive | ~33 |
| builder-athlete | Builder | 03-athlete-core, 04-athlete-film, 05-athlete-subpages, 06-athlete-empty | ~23 |
| builder-roles | Builder | 07-recruiter-core, 08-recruiter-tools, 09-coach, 10-parent | ~33 |
| builder-ops | Builder | 11-club, 12-admin, 13-messages-zone, 14-settings-help-checkout | ~36 |
| validator | Validator | JSON validation, tsc check, E2B status | — |

## Execution Order

**Phase 1 (parallel — all 4 builders):**
- builder-public → 00-public.json, 01-public-directories.json
- builder-athlete → 03-athlete-core.json, 04-athlete-film.json
- builder-roles → 07-recruiter-core.json, 08-recruiter-tools.json
- builder-ops → 11-club.json, 12-admin.json

**Phase 2 (parallel — each builder continues):**
- builder-public → 02-onboarding.json, 15-responsive.json
- builder-athlete → 05-athlete-subpages.json, 06-athlete-empty.json
- builder-roles → 09-coach.json, 10-parent.json
- builder-ops → 13-messages-zone.json, 14-settings-help-checkout.json

**Phase 3 (sequential — after ALL builders complete):**
- validator → Parse all 16 JSON files for schema validity
           → tsc --noEmit (check no broken imports)
           → npx tsx grouped-journey-e2b.ts status
           → Optional: --group 00-public smoke test

---

## Key Selectors (Source of Truth)

| Element | Selector | Source |
|---------|----------|--------|
| Login email | `input[type='email']` | `(auth)/login/page.tsx` |
| Login password | `input[type='password']` | `(auth)/login/page.tsx` |
| Login submit | `button[type='submit']` | `(auth)/login/page.tsx` |
| Dashboard sidebar links | `a[href='/athlete']`, etc. | `components/layout/sidebar.tsx` |
| Primary CTA buttons | `button` with `bg-primary` or `bg-[#D4AF37]` | All dashboards |
| Upload zone (film) | Clickable div with dashed border | `athlete/film/page.tsx` |
| Filter buttons | `button` near filter icon | Various pages |
| Pricing tabs | `button` with tab text (Athletes, Recruiters, Schools, Events, Dashr) | `pricing/_components/PricingTabs.tsx` |
| Billing toggle | Monthly/Annual pill buttons | `pricing/_components/BillingToggle.tsx` |
| Pricing cards | Cards in `grid` container | `pricing/_components/PricingCard.tsx` |

---

## Test User Credentials

| Role | Email | Pages Tested |
|------|-------|--------------|
| Athlete (full) | jaylen.washington@test.repmax.io | athlete/*, messages, zone, settings, help |
| Athlete (empty) | tyler.chen@test.repmax.io | athlete/* (empty states) |
| Recruiter | coach.williams@test.repmax.io | recruiter/* |
| Coach | coach.davis@test.repmax.io | coach/* |
| Parent | lisa.washington@test.repmax.io | parent/* |
| Club | mike.torres@test.repmax.io | club/* |
| Admin | admin@repmax.io | admin/* |

All passwords: `TestPass123!`

---

## Running the Suite

```bash
# Full run (group by group, slow, thorough)
cd apps/web
npx tsx ~/.claude/scripts/grouped-journey-e2b.ts --dir journeys/

# Single group (for debugging)
npx tsx ~/.claude/scripts/grouped-journey-e2b.ts --dir journeys/ --group 00-public

# Range of groups
npx tsx ~/.claude/scripts/grouped-journey-e2b.ts --dir journeys/ --from 05 --to 09

# JSON output
npx tsx ~/.claude/scripts/grouped-journey-e2b.ts --dir journeys/ --json
```

Estimated E2B run time: ~25-30 minutes total (8-12 min setup + 15-20 min journeys)
Estimated cost: ~$0.08-0.10 per full run

---

## Verification

1. All 16 JSON files parse without errors
2. Every file has `group`, `name`, `requiresAuth`, `pages`, `journeys` keys
3. Every journey has `name`, `priority`, `steps`
4. `npx tsx grouped-journey-e2b.ts status` shows all 16 groups discovered
5. `npx tsx grouped-journey-e2b.ts --dir journeys/ --group 00-public` passes (smoke test)
6. Full run: target >= 90% journey pass rate (production readiness baseline)

---

## Files Inventory

| Category | New Files | Modified Files |
|----------|-----------|----------------|
| Journey groups | 16 | 0 |
| **Total** | **16 new** | **0 modified** |

All files go in `apps/web/journeys/`. No source code modifications needed.

---

## Changes from Previous Spec

| What Changed | Old | New |
|-------------|-----|-----|
| Email domain | `@test.repmax.com` | `@test.repmax.io` |
| Admin email | `admin@repmax.com` | `admin@repmax.io` |
| Pricing page | 4 cards (STARTER, PRO, TEAM, SCOUT) | 5 tabs (Athletes, Recruiters, Schools, Events, Dashr) with Monthly/Annual toggle |
| Removed pages | `/recruiter`, `/recruiter/events`, `/recruiter/assignments`, `/admin/programs`, `/admin/analytics`, `/admin/content`, `/admin/settings` | — |
| Added pages | — | `/privacy`, `/terms`, `/support`, `/not-found`, `/auth/reset-password`, `/athlete/[id]`, `/positions/[position]`, `/programs/[id]`, `/states/[state]`, `/zones/[zone]`, `/onboarding/role`, `/onboarding/chat`, `/dashboard`, `/recruiter/territory`, `/recruiter/film/[id]`, `/recruiter/prospects/[id]`, `/coach/roster/[id]`, `/coach/roster/[id]/edit`, `/messages/[id]`, `/settings/notifications`, `/admin/flags`, `/admin/moderation` |
| Admin pages | `/admin`, `/admin/users`, `/admin/programs`, `/admin/analytics`, `/admin/content`, `/admin/settings` | `/admin`, `/admin/users`, `/admin/flags`, `/admin/moderation` |
| Recruiter pages | `/recruiter`, `/recruiter/pipeline`, `/recruiter/compare`, `/recruiter/visits`, `/recruiter/communications`, `/recruiter/events`, `/recruiter/reports`, `/recruiter/assignments` | `/recruiter/pipeline`, `/recruiter/compare`, `/recruiter/territory`, `/recruiter/visits`, `/recruiter/communications`, `/recruiter/reports`, `/recruiter/film/[id]`, `/recruiter/prospects/[id]` |
| Group names | `13-settings-help`, `14-checkout` | `13-messages-zone`, `14-settings-help-checkout` |
| Journey count | ~104 | ~124 |
| Groups | 16 | 16 |
