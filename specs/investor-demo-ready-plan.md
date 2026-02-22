# investor-demo-ready Plan

## Objective
Fix the seed loader to match the actual database schema, add missing demo seed data (offers, messages, highlights), and fix landing page UI issues so RepMax v2 can be demoed to investors with populated dashboards and no visible broken elements.

## Team Members
| Role | Agent | System Prompt | Responsibility |
|------|-------|---------------|----------------|
| Seed Builder | builder-seed | .claude/agents/subagents/builder.md | Fix seed loader + data to match real schema |
| UI Builder | builder-ui | .claude/agents/subagents/builder.md | Landing page fixes + wire dashboard buttons |
| Validator | validator | .claude/agents/subagents/validator.md | Quality gates (tsc, lint, tests, build) |

## Contract

### Seed Loader Schema Fixes (builder-seed owns)

The seed loader (`test/seed/seed-loader.ts`) has 5 critical bugs:

**Bug 1: `buildUserIdMap` queries `profiles.email` — column doesn't exist.**
Fix: Use `supabase.auth.admin.listUsers()` to get email→userId mapping, then cross-reference with profiles table.

**Bug 2: FK mismatch — secondary tables need `athletes.id` / `coaches.id`, not `profiles.id`.**
After creating all users+profiles+athletes+coaches, build lookup maps:
```typescript
// athleteIdMap: email → athletes.id (NOT profiles.id)
const { data } = await supabase.from('athletes').select('id, profile_id');
// coachIdMap: email → coaches.id (NOT profiles.id)
const { data } = await supabase.from('coaches').select('id, profile_id');
```
Then use these for highlights.athlete_id, shortlists.coach_id, shortlists.athlete_id, coach_tasks.coach_id, offers.athlete_id, etc.

**Bug 3: `seedFilms()` inserts into `films` table — doesn't exist. Real table is `highlights`.**
Column mapping:
- `films.duration` → `highlights.duration_seconds`
- `films.views` → `highlights.view_count`
- `films.type` → `highlights.description` (or omit)
- `films.featured` → omit (no column)

**Bug 4: `seedTestData()` shortlists use wrong schema.**
Actual schema: `shortlists(coach_id, athlete_id, notes, priority, pipeline_status)` — direct join, no named lists.
Fix: Create one shortlist entry per athlete, using coachIdMap and athleteIdMap.

**Bug 5: `seedTestData()` profile_views use wrong column names.**
- `section_viewed` → `source` (values: 'search', 'shortlist', 'direct')
- `viewed_at` → `created_at`

### New Seed Data (builder-seed owns)

Add to `test/seed/data/users.ts`:

**Offers** (so coach dashboard shows "athletes with offers"):
```typescript
export const offerData: OfferData[] = [
  { athleteEmail: 'jaylen.washington@test.repmax.io', schoolName: 'Alabama', division: 'D1', scholarshipType: 'full', committed: false },
  { athleteEmail: 'jaylen.washington@test.repmax.io', schoolName: 'Georgia', division: 'D1', scholarshipType: 'partial', committed: false },
  { athleteEmail: 'marcus.thompson@test.repmax.io', schoolName: 'TCU', division: 'D1', scholarshipType: 'preferred-walk-on', committed: false },
  { athleteEmail: 'deshawn.jackson@test.repmax.io', schoolName: 'Ohio State', division: 'D1', scholarshipType: 'full', committed: true },
  { athleteEmail: 'deshawn.jackson@test.repmax.io', schoolName: 'Michigan', division: 'D1', scholarshipType: 'full', committed: false },
  { athleteEmail: 'sofia.rodriguez@test.repmax.io', schoolName: 'USC', division: 'D1', scholarshipType: 'partial', committed: false },
];
```

**Messages** (so messages page isn't empty):
```typescript
export const messageData: MessageData[] = [
  { senderEmail: 'brian.williams@test.repmax.io', recipientEmail: 'jaylen.washington@test.repmax.io', subject: 'TCU Football Interest', body: 'Hi Jaylen, I reviewed your film and would love to discuss our program...', read: true },
  { senderEmail: 'jaylen.washington@test.repmax.io', recipientEmail: 'brian.williams@test.repmax.io', subject: 'Re: TCU Football Interest', body: 'Thank you Coach Williams! I would love to learn more about TCU...', read: false },
  { senderEmail: 'alex.martinez@test.repmax.io', recipientEmail: 'deshawn.jackson@test.repmax.io', subject: 'ASU Recruiting', body: 'DeShawn, your measurables are exactly what we look for...', read: false },
  { senderEmail: 'brian.williams@test.repmax.io', recipientEmail: 'sofia.rodriguez@test.repmax.io', subject: 'Combine Invite', body: 'Sofia, we would like to invite you to our spring combine...', read: false },
];
```

Add `seedOffers()` and `seedMessages()` functions to seed-loader.ts, called from `seedAll()`.

### Landing Page Fixes (builder-ui owns)

All in `apps/web/app/page.tsx`:

1. **Hero image URL (line 78):** Replace truncated `url('https` with a CSS gradient placeholder:
   `background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`

2. **"View Demo" button (line 62):** Add Link to `/signup` or `onClick={() => router.push('/login')}`. Since page is `'use client'`, can use router.

3. **Mobile menu (line 26-28):** Add `useState` for menu open/close + render mobile nav overlay.

4. **Accordion (lines 293-316):** Add `useState` for active accordion index + toggle onClick on each button.

5. **Footer year (line 377):** Change `© 2024` → `© 2026`

6. **Dashboard showcase image (line 285):** Same truncated URL fix — use gradient placeholder.

### Button Wiring (builder-ui owns)

**Public athlete card** (`apps/web/app/card/[id]/page.tsx`):
- "Add to Shortlist" → Link to `/login?redirect=/card/{id}` (unauthenticated users)
- "Contact Coach" → Link to `/login?redirect=/card/{id}`

**Coach dashboard** (`apps/web/app/(dashboard)/coach/page.tsx`):
- "Send to Recruiter" → Replace `alert()` with router.push to messages compose with pre-filled athlete context

## File Ownership
| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| builder-seed | `test/seed/seed-loader.ts`, `test/seed/data/users.ts` | `apps/web/` |
| builder-ui | `apps/web/app/page.tsx`, `apps/web/app/card/[id]/page.tsx`, `apps/web/app/(dashboard)/coach/page.tsx` | `test/`, `supabase/` |

## Tasks

### Task 1: Fix seed loader schema mismatches
- **Owner:** builder-seed
- **Input:** Contract bugs 1-5 above, migration schemas (001, 003, 004, 005)
- **Output:** Working seed-loader.ts that targets actual DB tables/columns
- **Dependencies:** none
- **Instructions:**
  Fix `buildUserIdMap` to use auth.admin.listUsers(). Add `athleteIdMap` and `coachIdMap` lookups after user creation (query athletes/coaches tables by profile_id). Rename `seedFilms` → insert into `highlights` with correct column mapping. Fix `seedTestData` shortlists to use direct coach_id+athlete_id schema. Fix profile_views column names (source, created_at).

### Task 2: Add demo seed data (offers, messages)
- **Owner:** builder-seed
- **Input:** Contract "New Seed Data" section, output of Task 1
- **Output:** New exports in users.ts + new seedOffers/seedMessages functions in seed-loader.ts
- **Dependencies:** Task 1
- **Instructions:**
  Add `OfferData` interface + `offerData` array + `MessageData` interface + `messageData` array to `test/seed/data/users.ts`. Add `seedOffers()` and `seedMessages()` to seed-loader.ts using the athleteIdMap for FK references. Wire both into `seedAll()`. Add CLI commands `seed:offers` and `seed:messages`.

### Task 3: Fix landing page UI
- **Owner:** builder-ui
- **Input:** Contract "Landing Page Fixes" section
- **Output:** Fully interactive landing page with working hero, menu, accordion, correct footer
- **Dependencies:** none
- **Instructions:**
  Fix truncated image URLs (lines 78, 285) with gradient placeholders. Add useState for mobile menu toggle and accordion active index. Make "View Demo" button link to /login. Update footer year to 2026. Keep all Stitch markup intact — only ADD interactivity, do not restructure.

### Task 4: Wire non-functional buttons
- **Owner:** builder-ui
- **Input:** Contract "Button Wiring" section
- **Output:** Clickable shortlist/contact/send buttons with real navigation
- **Dependencies:** none
- **Instructions:**
  In athlete card page, wrap footer buttons with Link components pointing to /login. In coach dashboard, replace `alert()` calls in "Send to Recruiter" with router.push to messages page with pre-filled context. Minimal changes — just wire the handlers.

### Task 5: Validate
- **Owner:** validator
- **Input:** All builder outputs
- **Output:** Quality gate results (tsc, lint, tests, build)
- **Dependencies:** Task 1, Task 2, Task 3, Task 4
- **Instructions:**
  Run quality pipeline: `npx tsx ~/.claude/scripts/quality-pipeline.ts --all`. All 337+ tests must pass, build must succeed, no new lint errors. Report any failures for fixing.

## Execution Order
1. Task 1: Fix seed loader (builder-seed, sequential — must complete first)
2. Task 3 + Task 4 (builder-ui, parallel — no dependency on seed work)
3. Task 2: Add seed data (builder-seed, depends on Task 1)
4. Task 5: Validate (depends on all builders completing)

## References Consulted
- `supabase/migrations/001_initial_schema.sql` — profiles, athletes, coaches, highlights, shortlists, messages, offers schemas
- `supabase/migrations/003_sprint_2b_analytics_film.sql` — profile_views schema
- `supabase/migrations/004_pipeline_status.sql` — pipeline_status enum on shortlists
- `supabase/migrations/005_coach_tasks.sql` — coach_tasks schema
- `test/seed/seed-loader.ts` — existing seed functions and their bugs
- `test/seed/data/users.ts` — existing fixture data
- `apps/web/app/page.tsx` — landing page with UI issues
- `apps/web/app/card/[id]/page.tsx` — public athlete card
- Prior audit agent results identifying all broken UI elements

## Validation Criteria
- [ ] `npm run seed` completes without errors against real Supabase (users, profiles, athletes, coaches, highlights, coach_tasks, shortlists, profile_views, offers, messages all populated)
- [ ] Landing page hero renders with visible background (not blank)
- [ ] "View Demo" button navigates to /login
- [ ] Mobile menu toggles open/close
- [ ] Accordion items expand/collapse
- [ ] Footer shows "2026"
- [ ] Public athlete card buttons navigate to /login
- [ ] Coach "Send to Recruiter" navigates to messages (not alert)
- [ ] `tsc` passes with no new errors
- [ ] `npm run build` succeeds
- [ ] All 337+ existing tests pass
