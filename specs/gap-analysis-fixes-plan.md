# gap-analysis-fixes Plan

## Objective
Remove all 68 prototype violations (mock data, missing auth, dead handlers, silent errors) to achieve zero-mock production readiness across API routes, components, hooks, and pages.

## Team Members
| Role | Agent | System Prompt | Responsibility |
|------|-------|---------------|----------------|
| Backend Builder | builder-api | .claude/agents/team/builder.md | Middleware, Supabase clients, API routes, server actions |
| Frontend Builder | builder-ui | .claude/agents/team/builder.md | Components, pages, hooks, loading/error boundaries |
| Validator | validator | .claude/agents/team/validator.md | Quality gates (tsc, lint, tests, build) |
| Auditor | auditor | .claude/agents/team/auditor.md | UI verification — zero dead handlers |

## Contract

### API Response Standards
```typescript
// All protected endpoints: 401 if no user, 403 if wrong role
// All list endpoints: return [] when no data (NEVER mock fallback)
// All endpoints: NEVER include is_mock flag in response
// All mutation endpoints: validate body with Zod before DB write
```

### Widget Prop Pattern
```typescript
// Every widget MUST accept data via props — no internal hardcoded arrays
// Parent pages fetch data (via hooks or server components) and pass down
// When data is unavailable, show empty state — not mock data
interface WidgetProps<T> {
  data: T[];        // Required — parent must provide
  isLoading?: boolean;
  error?: string | null;
}
```

### Error Handling Standard
```typescript
// Hooks: set error state on failure, never silently return false/[]
// Actions: throw or return { error: string } — never console.error + return []
// Catch blocks: always log the actual error, never empty catch
```

## File Ownership
| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| builder-api | `middleware.ts`, `lib/supabase/`, `app/api/**`, `lib/actions/**` | `components/`, `app/(dashboard)/**/page.tsx`, `lib/hooks/` |
| builder-ui | `components/**`, `app/(dashboard)/**/page.tsx`, `app/programs/`, `app/pricing/`, `app/alt/`, `lib/hooks/**` | `app/api/`, `lib/actions/`, `middleware.ts` |

## Tasks

### Task 1: Security hardening — auth + credentials
- **Owner:** builder-api
- **Input:** Gap analysis violations C-01, C-02, H-24, H-25, M-01–M-06, M-22–M-25
- **Output:** All protected routes enforce auth; all admin routes check role; no placeholder credentials
- **Dependencies:** none
- **Instructions:**
  1. `middleware.ts:69` — Replace `appRoutes` with: `["/dashboard", "/athlete", "/recruiter", "/coach", "/admin", "/parent", "/club", "/zone", "/messages", "/onboarding", "/settings", "/athletes", "/shortlist"]`
  2. `lib/supabase/server.ts` — Remove ALL placeholder fallbacks. Throw `new Error("Missing SUPABASE env vars")` if not set. Keep build-time guard: `if (process.env.NODE_ENV === 'production' && !url) throw ...`
  3. Add `getUser()` + 401 check to: `athletes/route.ts` GET, `athletes/[id]/route.ts` GET, all 5 `mcp/*/route.ts` files
  4. Add admin role check (query profiles, verify `role === 'admin'`, return 403) to: `admin/analytics/route.ts` (uncomment existing check), `admin/users/route.ts` GET+PATCH, `admin/moderation/route.ts` GET+POST
  5. Add Zod validation schemas to PATCH/PUT/POST bodies in: `athletes/[id]/route.ts` PATCH, `athlete/card/route.ts` PUT, `athlete/documents/route.ts` POST, `admin/users/route.ts` PATCH
  6. `webhooks/stripe/route.ts` — Add validation: `if (!process.env.STRIPE_WEBHOOK_SECRET) return NextResponse.json({error: "Config error"}, {status: 500})`

### Task 2: API mock data removal
- **Owner:** builder-api
- **Input:** Gap analysis violations C-03, C-04, C-05, H-01–H-07, H-06, H-07, M-13, M-14, M-24
- **Output:** Zero hardcoded data in any API route; all routes query DB or return empty arrays
- **Dependencies:** Task 1
- **Instructions:**
  1. `recruiting/zones/route.ts` — DELETE hardcoded zone array. Query `zone_activity` table + use `ZONE_METADATA` from `lib/data/zone-data.ts` for static fields. Add auth check.
  2. `recruiting/class-rankings/route.ts` — DELETE hardcoded rankings. Query `class_rankings` table (already seeded). Add auth check.
  3. `admin/feature-flags/route.ts` — Remove in-memory array. Return empty array with `// TODO: Create feature_flags table` comment. Add admin auth.
  4. `rankings/class/route.ts` and `rankings/program/route.ts` — DELETE mock fallback blocks. When no DB results, return `{ rankings: [], year, is_mock: false }`. Remove `is_mock` field entirely from all responses.
  5. `zone/activity/route.ts` — DELETE Math.random() fallback. Return `{ data: [], period_days }` when no rows.
  6. `recruiter/assignments/route.ts` — DELETE simulated POST. Return `{ error: "Zone assignments not yet implemented" }` with 501 status. DELETE fabricated GET assignments — return empty `assignments: {}`.
  7. `athlete/dashboard/route.ts` — DELETE hardcoded calendar events array. Return `calendarEvents: []` with `// TODO: Create events table`.
  8. `admin/analytics/route.ts` — Remove ALL Math.random() calls. Use real counts only (0 is valid). Remove hardcoded change percentages — set `change: 0` when no historical data.
  9. `admin/moderation/route.ts` — Remove `.limit(0)`. Query profiles normally. For POST: keep "remove" action (real), but return 501 for "approve"/"warn" with `// TODO: implement`.
  10. `recruiting/reports/route.ts` — Remove `calls: 0` placeholder. Omit field or return `null`.
  11. Remove `is_mock` field from ALL API responses project-wide (grep for `is_mock`).

### Task 3: Widget and component production fixes
- **Owner:** builder-ui
- **Input:** Gap analysis violations C-06–C-11, H-10–H-17, M-20–M-22, L-06
- **Output:** All widgets accept props; no internal hardcoded data arrays; dead handlers removed or wired
- **Dependencies:** none
- **Instructions:**
  1. **6 Critical widgets** — Convert each from zero-prop hardcoded to prop-driven. For each: add props interface, accept data array as required prop, remove internal `const mock*` / `const default*` arrays, show empty state when `data.length === 0`:
     - `NotificationCenter.tsx` — Accept `notifications` prop, remove `MOCK_NOTIFICATIONS`
     - `ComposeModal.tsx` — Accept `recipients` prop, remove `MOCK_RECIPIENTS`
     - `ComposeMessageModal.tsx` — Accept `recipients` prop, remove hardcoded `suggestedRecipients`
     - `TaskWidget.tsx` — Accept `tasks` prop, wire Add button onClick
     - `NotesWidget.tsx` — Accept `notes` prop, replace `href="#"` with real links or remove
     - `TrendingAthletesWidget.tsx` — Accept `athletes` prop, remove Google-hosted images (use `getPlaceholderImage`)
  2. **High-severity widgets** — Same pattern for: `ClassRankingsWidget`, `RecruitingCalendarWidget`, `ProspectTickerWidget`, `ProgramRankingsWidget`, `ParentCalendarWidget` (fix default year to `new Date().getFullYear()`), `ZonePulseBannerWest` (accept countdown as prop)
  3. **Dead handlers** — `MessageThread.tsx`: remove non-functional toolbar buttons (User, Search, MoreVertical, Plus, Smile) or wire them. `sidebar.tsx`: wire or remove "Add Athlete" button.
  4. **Topbar** — `topbar.tsx`: Wire notification bells to NotificationCenter or remove. Leave search inputs as visual placeholders with `disabled` attribute.
  5. **Dead href="#" links** — Replace with proper routes or remove across all widget files.

### Task 4: Page and hook production fixes
- **Owner:** builder-ui
- **Input:** Gap analysis violations C-12, H-08, H-09, H-18–H-23, M-07–M-19, M-24, L-01–L-07
- **Output:** No mock data in pages; all hooks surface errors; loading/error boundaries exist
- **Dependencies:** Task 3 (widgets must accept props before pages can pass them)
- **Instructions:**
  1. **programs/[id]/page.tsx** — DELETE entire mock data block. Fetch program from `mcp/programs` route using the `[id]` param. If not found, show 404. Replace Google images with `getPlaceholderImage()`.
  2. **recruiter/prospects/[id]/page.tsx** — DELETE `getTimelineData` mock function. Render "No activity yet" empty state or query `profile_views` for real timeline.
  3. **zone/map/page.tsx:68** — Remove `Math.random()`. Use real timestamp from data or `"just now"` default.
  4. **recruiter/visits/page.tsx:49-52** — Remove hardcoded trend strings (`'+12%'` etc). Set `trend: null` or calculate from real data.
  5. **pricing/page.tsx:274** — Fix `required={true}` text leak. Fix broken `<style jsx>` block (delete malformed CSS). Update copyright to 2026.
  6. **Copyright years** — Update to 2026 in: `states/[state]`, `zones/[zone]`, `alt/page.tsx`.
  7. **alt/page.tsx** — DELETE this file entirely. It's an unwired Stitch export with no inbound links.
  8. **loading.tsx boundaries** — Create `app/loading.tsx` and `app/(dashboard)/loading.tsx` with simple skeleton UI.
  9. **error.tsx boundaries** — Create `app/error.tsx` and `app/(dashboard)/error.tsx` with "Something went wrong" + retry button.
  10. **Hook fixes (lib/hooks/):**
      - `use-class-rankings.ts` + `use-recruiting-events.ts` — Remove `isMock` state entirely. Remove `setIsMock` calls. Remove `isMock` from return object.
      - `use-athlete-documents.ts` — Replace mock implementation with real API calls to `/api/athlete/documents`.
      - `use-campus-visits.ts`, `use-communication-logs.ts` — Replace empty catch blocks with `console.error(err)` + return `{ error: err.message || "Operation failed" }`.
      - `use-admin-users.ts`, `use-admin-moderation.ts` — In catch blocks, set hook `error` state instead of just returning false.
      - `use-athlete-card-editor.ts` — On fetch error, do NOT set default data. Leave data as null, let UI show error state.
      - `use-notification-preferences.ts` — On fetch error, do NOT set defaults. Leave preferences null.
  11. **Action fixes (builder-api handles these, listed here for awareness):**
      - `highlight-actions.ts` — Return `{ data: [], error: "message" }` instead of empty arrays on error.
      - `shortlist-actions.ts` — Add null check for profile before coach lookup.
      - `message-actions.ts`, `visit-actions.ts`, `communication-actions.ts` — Add Zod input validation.
  12. **positions/[position]/page.tsx** — Wire Class/Status dropdowns with `onChange` + state, or add `disabled` attribute.
  13. **Missing page links** — For `/privacy`, `/terms`, `/support`: create minimal stub pages with "Coming soon" content. For dead links to `/calendar`, `/rankings`, `/athletes` (index), `/programs` (index), `/zones` (index): update hrefs to closest working routes or remove.

### Task 5: Validate
- **Owner:** validator
- **Input:** All builder outputs
- **Output:** Quality gate results (tsc, lint, test, build)
- **Dependencies:** Task 1, Task 2, Task 3, Task 4
- **Instructions:**
  Run the full quality pipeline: `npx tsx ~/.claude/scripts/quality-pipeline.ts --all`. All 4 gates must pass. Report exact errors for Fixer if any gate fails. Existing 343+ tests must still pass. Coverage must stay ≥70%.

### Task 6: Audit
- **Owner:** auditor
- **Input:** Validated codebase
- **Output:** Functional rate report — target 0 Critical violations remaining
- **Dependencies:** Task 5
- **Instructions:**
  Re-run the gap analysis grep patterns against the codebase. Verify:
  1. `grep -r "is_mock" app/api/` returns 0 results
  2. `grep -r "Math.random" app/api/ app/(dashboard)/` returns 0 results
  3. `grep -r "MOCK_" components/` returns 0 results
  4. `grep -r "mockSchools\|mockAthletes\|mockCoaches\|mockNotes\|mockTasks" --include="*.ts" --include="*.tsx"` returns 0 results
  5. `grep -r "placeholder.supabase.co" lib/` returns 0 results
  6. All dashboard routes return 401/redirect when accessed without auth cookie
  7. All admin routes return 403 when accessed with non-admin user

## Execution Order
1. Task 1 + Task 3 (parallel — different file owners)
2. Task 2 (depends on Task 1, same builder)
3. Task 4 (depends on Task 3, same builder; also reads API changes from Task 2)
4. Task 5: Validate (depends on Tasks 2, 4)
5. Task 6: Audit (depends on Task 5)

## Commit Strategy
Pre-commit hook blocks >15 files. Split into 3 commits:
1. `fix(security): harden auth middleware + remove placeholder credentials` (~8 files)
2. `fix(api): remove all mock data from API routes + add Zod validation` (~15 files)
3. `fix(ui): convert widgets to prop-driven + add error boundaries` (~15 files)

## References Consulted
- Gap Analysis Report (68 violations across 4 layers)
- `supabase/migrations/001_initial_schema.sql` (recruiting_zone enum, table definitions)
- `apps/web/middleware.ts` (current auth setup)
- `.claude/agents/team/builder.md`, `validator.md`, `auditor.md`

## Validation Criteria
- [ ] 0 Critical violations remaining (was 12)
- [ ] 0 High violations remaining (was 25)
- [ ] All `appRoutes` in middleware cover every dashboard prefix
- [ ] No placeholder Supabase URLs in production code
- [ ] No `is_mock`, `MOCK_*`, `Math.random()` in API routes or components
- [ ] All admin routes enforce admin role check
- [ ] All mutation endpoints validate with Zod
- [ ] `loading.tsx` and `error.tsx` exist in `(dashboard)/` and root `app/`
- [ ] TypeScript compiles with 0 errors
- [ ] All 343+ existing tests pass
- [ ] Build succeeds
- [ ] Coverage ≥70%
