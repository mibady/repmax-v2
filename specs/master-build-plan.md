# RepMax v2 — Master Build Plan

**Generated:** Feb 14, 2026
**Data Source:** 207 JotForm prospect profiles (203 imported, 4 excluded)
**Current State:** Build passes, 21 static pages, 12/39 API routes functional

---

## Phase 0: Data Import (Foundation — Do First)

**Why:** Nothing works without real prospect data. The recruiter pipeline, zone map, analytics, and rankings all need actual athletes in the DB.

### Step 1: Run Staging Import
```
-- In Supabase SQL Editor, run:
repmax_jotform_import.sql
```
This creates:
- `import_prospects_staging` table with all 203 cleaned records
- `import_teams` table with 16 schools (6 RepMax + 10 CA Recruits)
- 2 organizations (RepMax, CA Recruits/Frontier)

### Step 2: Verify Data
```sql
SELECT client, school_key, COUNT(*)
FROM import_prospects_staging
GROUP BY client, school_key
ORDER BY client, school_key;

SELECT email, COUNT(*)
FROM import_prospects_staging
WHERE email IS NOT NULL
GROUP BY email HAVING COUNT(*) > 1;

SELECT
  COUNT(*) FILTER (WHERE forty_yard IS NOT NULL) as has_40,
  COUNT(*) FILTER (WHERE gpa IS NOT NULL) as has_gpa,
  COUNT(*) FILTER (WHERE hudl_link IS NOT NULL) as has_hudl,
  COUNT(*) FILTER (WHERE headshot_url IS NOT NULL) as has_photo
FROM import_prospects_staging;
```

### Step 3: Migrate to Production Tables
```sql
SELECT * FROM process_import_staging();
```

### Step 4: Merge `import_teams` → `teams`
Requires a coach user for FK. Either:
- Create a system/admin coach account first, OR
- Modify teams table to make coach_id nullable for imported teams

### Data Summary
| Client | Schools | Prospects |
|--------|---------|-----------|
| RepMax | 6 | 179 |
| CA Recruits | 10 | 24 |
| **Total** | **16** | **203** |

**Estimated Complexity:** Quick Fix
**Blocks:** Everything in Phases 1-4

---

## Phase 1: Fix What's Broken (Quick Fix)

3 critical bugs blocking core functionality:

1. `api/coach/dashboard/route.ts` references non-existent tables (coach_roster, coach_tasks, athlete_profiles) — rewrite to use actual schema tables (teams, team_rosters, profiles + athlete join)
2. `api/athlete/dashboard/route.ts` queries `profile_views.viewed_at` but the column is `created_at`
3. `api/athlete/dashboard/route.ts` hardcodes `star_rating: 3` — pull from DB or compute from measurables

**Estimated Complexity:** Quick Fix
**Unblocks:** Coach dashboard, Athlete dashboard accuracy

---

## Phase 2: Recruiter API Sprint (Team Build)

Core MVP flow. Complex task → `/plan_team`.

### Routes to Implement
| Route | Priority | Notes |
|-------|----------|-------|
| `/api/recruiting/calendar` | P0 | Powers recruiter calendar view |
| `/api/recruiting/visits` | P0 | Track official/unofficial visits |
| `/api/recruiting/communications` | P0 | Log coach-prospect interactions |
| `/api/recruiting/events` | P1 | Camps, showcases, combines |
| `/api/upload` | P0 | Card editor image uploads (Supabase Storage) |
| `/api/recruiting/reports` | P1 | Exportable prospect reports |
| `/api/recruiting/zones` | P1 | Zone-filtered prospect queries |

### Frontend Wiring
| Component | What to Wire |
|-----------|-------------|
| Pipeline Kanban | DnD → PATCH `/api/shortlists` with new stage |
| Prospect Detail | Call/Email/DM → POST `/api/recruiting/communications` |
| Card Editor | Image upload → POST `/api/upload` → Supabase Storage |
| Zone Map | View toggles → actual filtered queries |

**Estimated Complexity:** Complex (team build)
**Unblocks:** Entire recruiter experience

---

## Phase 3: MCP Connector Routes (Medium)

Wire RepMax Intell MCP endpoints to internal API:

| Route | MCP Source | Purpose |
|-------|-----------|---------|
| `/api/mcp/zones/[zone]` | `get_zone` | Zone detail with prospect counts |
| `/api/mcp/prospects` | `get_prospects` | Filtered prospect search |
| `/api/mcp/programs` | `get_programs` | School program rankings |
| `/api/mcp/calendar` | `get_calendar_context` | Recruiting calendar/deadlines |

**Estimated Complexity:** Medium

---

## Phase 4: Testing Sprint

Current: 2/10. Target: 7/10.

### Test Matrix
| Area | Tests Needed |
|------|-------------|
| Auth | Login, signup, OAuth, password reset, middleware protection |
| Athletes API | CRUD, search, pagination, ownership verification |
| Shortlists API | CRUD, role enforcement, stage updates |
| Messages API | Inbox/sent, NCAA compliance trigger |
| Stripe Webhook | All 4 event types |
| Analytics | Profile views, geographic, trends |
| Recruiter APIs | All new Phase 2 routes |
| Upload | File upload, size limits, type validation |

**Estimated Complexity:** Medium (solo validator agent)

---

## Phase 5: Secondary Roles (Post-MVP)

| Role | Current State | Effort |
|------|--------------|--------|
| Coach | Page exists, backend broken (fixed in Phase 1) | Medium |
| Parent | Page exists, backend stubbed | Medium |
| Club | Page exists, backend stubbed | Medium |
| Admin | 4 stubbed routes | Medium-Complex |

---

## Phase 6: Polish & Launch Prep

- [ ] Rankings APIs (`/api/rankings/class`, `/api/rankings/program`)
- [ ] Notification settings API
- [ ] Onboarding flow backend
- [ ] Real zone activity data (replace mock fallback)
- [ ] Input validation (Zod schemas on all routes)
- [ ] Error monitoring (Sentry)
- [ ] Realtime subscriptions beyond messages

---

## Scorecard

| Category | Current | After Phase 2 | After Phase 4 |
|----------|---------|--------------|--------------|
| Auth & Security | 9/10 | 9/10 | 10/10 |
| Database Schema | 9/10 | 9/10 | 9/10 |
| Athlete Experience | 8/10 | 9/10 | 9/10 |
| Recruiter Experience | 6/10 | **9/10** | 9/10 |
| Payments | 8/10 | 8/10 | 8/10 |
| API Coverage | 4/10 | **8/10** | 8/10 |
| Testing | 2/10 | 2/10 | **7/10** |
| **Production Ready** | No | MVP | Yes |
