# User Journeys & UX Functionality Plan

## Objective
Map every user journey end-to-end across all 6 roles, inventory all interactive elements (functional vs dead), and provide a phased execution plan to achieve 95%+ UX functionality.

---

## Journey Map

### J1: Visitor → Signup → Onboarding → Dashboard
```
Landing (/) → /signup → /onboarding/role → /onboarding/chat → /dashboard (redirect) → /{role}
         ↘ /login → /dashboard (redirect) → /{role}
         ↘ /pricing → Stripe checkout → /dashboard
```
**Status:** Fully functional. Auth, role selection, 5-step chat onboarding, role-based redirect all wired.
**Gaps:**
- Landing footer: 7 company/legal links are `<span>` not `<a>` (About, Careers, Blog, Contact, Privacy, Terms, Security)
- Landing footer: 3 social icons have `cursor-pointer` but no onClick
- Pricing navbar: "Get Started" button has no handler; 4 nav links all point to `/`
- Dashboard fallback: Logout posts to `/auth/logout` (route doesn't exist); `/profile/setup` link broken

### J2: Athlete Daily Use
```
/athlete (dashboard) → /athlete/card/edit (profile editor)
                     → /athlete/film (highlight reel)
                     → /athlete/documents (transcript, test scores)
                     → /athlete/analytics (profile views)
                     → /zone/map (recruiting intel)
                     → /messages (NCAA-compliant messaging)
                     → /settings/notifications (preferences)
```
**Status:** Core loop works. Dashboard loads real data, card editor saves to DB, documents upload/delete.
**Gaps (19 dead handlers):**
| Page | Element | Priority | Action |
|------|---------|----------|--------|
| Dashboard | Shortlist arrow_forward icon | Medium | Wire as Link to `/athlete/offers` |
| Analytics | "Full Report" button | Low | Disable — no report export backend |
| Analytics | Per-viewer "Message" button | Medium | Wire to `/messages?to={viewerId}` |
| Card Edit | "Take Photo" button | Low | Disable — camera API not implemented |
| Documents | "Filter" button | Medium | Wire to toggle filter panel (client-side) |
| Documents | "View" per-doc button | High | Wire to open doc URL in new tab |
| Documents | "Download" per-doc button | High | Wire to trigger download via doc URL |
| Documents | "Share" per-doc button | Low | Disable — share API not implemented |
| Film | "Upload Film" header button | Critical | Wire to file input (like documents) |
| Film | Upload zone div | Critical | Wire to file input |
| Film | "Upload Your First Highlight" | Critical | Wire to file input |
| Film | Per-card "more_vert" icon | Low | Disable — context menu not built |
| Film | Per-card "Edit" button | Medium | Wire to edit modal or inline edit |
| Athlete [id] | "Add to Shortlist" button | High | Wire to shortlist action (auth-gated) |
| Athlete [id] | "Contact Coach" button | High | Wire to messaging (auth-gated) |
| Athlete [id] | "View All" highlights | Medium | Wire as Link to `/athlete/{id}#highlights` |
| Athlete [id] | Play button on highlights | Medium | Wire to video URL or film player |
| Card [id] | "View All" highlights | Medium | Wire as Link |
| Card [id] | Highlight video thumbnail | Medium | Wire to video URL |

### J3: Recruiter Daily Use
```
/recruiter/pipeline (kanban board — default landing)
  → /athlete/{id} (public profile from card click)
  → /recruiter/prospects/{id} (detailed prospect view)
  → /recruiter/compare (side-by-side comparison)
  → /recruiter/film/{id} (video review)
  → /recruiter/visits (campus visit calendar)
  → /recruiter/communications (contact log)
  → /recruiter/territory (zone assignments)
  → /recruiter/reports (analytics)
  → /messages (messaging)
  → /zone/map (zone intelligence)
```
**Status:** Pipeline (kanban + drag-and-drop), prospect detail (call/email/DM/shortlist), territory assignments, and communications log all functional. Film player is fully decorative.
**Gaps (31 dead handlers + 3 missing pages):**
| Page | Element | Priority | Action |
|------|---------|----------|--------|
| Pipeline | Links to `/recruiter/prospects` | High | Create prospects list page |
| Compare | "Export Data" button | Medium | Wire CSV export (client-side) |
| Compare | Links to `/recruiter/board` (3x) | High | Redirect to `/recruiter/pipeline` |
| Film [id] | ALL video controls (play/pause/seek/volume/fullscreen) | Critical | Add real `<video>` element + controls |
| Film [id] | Download button | Medium | Wire to highlight video URL download |
| Film [id] | Share / Copy Link / Report | Low | Disable — not implemented |
| Film [id] | Edit/Delete bookmark buttons | Medium | Wire to bookmark API |
| Prospects [id] | "Edit tags" button | Low | Disable — tag system not built |
| Prospects [id] | "+ Add" tag button | Low | Disable — tag system not built |
| Prospects [id] | "Filter" timeline button | Low | Disable — activity timeline empty |
| Reports | 3 filter pills (class/program/quarter) | Medium | Wire to filter state |
| Reports | "View Detail" button | Low | Disable — no detail view |
| Reports | "more_horiz" staff header | Low | Disable |
| Reports | "View All Staff" footer | Low | Disable |
| Visits | "Schedule Visit" button | High | Wire to visit creation modal |
| Visits | Month/Week/Day view toggles | Medium | Wire to calendar view state |
| Visits | "View All" upcoming | Low | Disable |
| Visits | Calendar event chips | Medium | Wire onClick to visit detail |
| Communications | Per-row three-dots menu | Low | Disable |
| Territory | "View All" assignments | Low | Disable |
| Zone Map | "Export" button | Low | Disable |
| Zone Map | View toggle radios (4x) | Medium | Wire to data filter state |
| Sidebar | `/recruiter/campaigns` link | High | Create stub page or redirect |
| Sidebar | `/recruiter/analytics` link | High | Create stub page or redirect to reports |

### J4: Coach Daily Use
```
/coach (dashboard with roster + tasks)
  → /dashboard/coach/roster (full roster — MISSING)
  → /dashboard/coach/roster/new (add athlete — MISSING)
  → /dashboard/coach/roster/{id} (athlete detail — MISSING)
  → /dashboard/coach/roster/{id}/edit (edit — MISSING)
  → /dashboard/coach/tasks (task management — MISSING)
  → /messages (messaging)
```
**Status:** Dashboard works — roster table, task toggles, export CSV, compose modal all functional. But ALL sub-page links are broken (5 missing pages).
**Gaps:**
| Element | Priority | Action |
|---------|----------|--------|
| 5 missing coach sub-pages | High | Create stub pages at minimum |
| Edit athlete uses `window.location.href` | Low | Refactor to `router.push` |

### J5: Parent Daily Use
```
/parent (dashboard)
  → /dashboard/parent/profile (child's profile — MISSING)
  → /dashboard/parent/schools (college interest — MISSING)
  → /dashboard/parent/calendar (schedule — MISSING)
  → /dashboard/parent/activity (recent activity — MISSING)
  → /dashboard/parent/resources (NCAA resources — MISSING)
  → /messages (messaging)
```
**Status:** Dashboard loads real data via `useParentDashboard()`. ALL 5 sub-page links are broken.
**Gaps:**
| Element | Priority | Action |
|---------|----------|--------|
| 5 missing parent sub-pages | High | Create stub pages |
| "Academic Requirements" and "Compliance Info" share same href | Low | Differentiate or keep shared |

### J6: Club Daily Use
```
/club (dashboard)
  → /dashboard/club/events (tournament list — MISSING)
  → /dashboard/club/events/new (create tournament — MISSING)
  → /dashboard/club/verifications (athlete verification — MISSING)
  → /dashboard/club/athletes (managed athletes — MISSING)
  → /dashboard/club/payments (payment history — MISSING)
```
**Status:** Dashboard loads real data via `useClubDashboard()`. ALL 5 sub-page links are broken.
**Gaps:**
| Element | Priority | Action |
|---------|----------|--------|
| 5 missing club sub-pages | High | Create stub pages |

### J7: Admin Daily Use
```
/admin (analytics dashboard)
  → /admin/users (user management)
  → /admin/moderation (content moderation)
  → /admin/flags (feature flags)
```
**Status:** Fully functional. Analytics refresh, user role changes, moderation approve/warn/remove, flag toggles all wired. Feature flags returns empty (no DB table).
**Gaps:** None critical.

### J8: Public Browse
```
/positions/{position} → /athlete/{id}
/zones/{zone} → /states/{state} → /programs/{id}
/card/{id} (shareable athlete card)
```
**Status:** Browse pages render real data. Prospect cards link to athlete profiles.
**Gaps:**
| Page | Element | Priority | Action |
|------|---------|----------|--------|
| Positions | "Load More Prospects" button | Medium | Wire pagination or infinite scroll |
| Positions | Mobile hamburger menu | Medium | Wire to mobile nav state |
| Positions | Sort dropdown | Medium | Wire to sort state |
| Zones | Mobile hamburger menu | Medium | Wire to mobile nav state |
| Zones | AthleteCard / ProgramCard divs | Medium | Wrap in Links |
| States | Search input | Low | Wire or remove |
| Programs | Search input | Low | Wire or remove |
| Programs | "Follow" button | Low | Already disabled with tooltip |

### J9: Billing
```
/pricing → Stripe checkout → success redirect → /dashboard
/api/billing/portal → Stripe customer portal (subscription management)
```
**Status:** Fully functional. Starter/Pro/Team checkout, webhook processing, portal access all wired. Scout plan uses mailto.
**Gaps:** None.

### J10: Cross-Cutting (all roles)
| Feature | Status | Gap |
|---------|--------|-----|
| Sidebar navigation | Functional per role | Coach "Add Athlete" disabled |
| Topbar search | Disabled all roles | No search backend |
| Topbar notifications | Disabled all roles | No notification system |
| Messages | Functional | ComposeModal works, thread view works |
| Settings/Notifications | Functional | 11 toggles + save all wired |
| Role switching | Functional | RoleSwitcher dropdown works |
| Sign out | Functional | Each sidebar has `onSignOut` |

---

## Gap Summary

| Category | Count | Critical | High | Medium | Low |
|----------|-------|----------|------|--------|-----|
| Dead handlers (existing pages) | 52 | 4 | 8 | 20 | 20 |
| Missing pages | 18 | 0 | 15 | 3 | 0 |
| Broken links | 8 | 0 | 5 | 3 | 0 |
| **Total** | **78** | **4** | **28** | **26** | **20** |

---

## Execution Plan — 3 Phases

### Phase A: UX Hardening (Wire/Disable Dead Handlers)
**Scope:** Edit ~20 existing files. No new pages.
**Strategy:** Wire handlers where backend exists. Disable with tooltip where it doesn't.
**Team:** 2 builders (athlete+public, recruiter+shared) + validator + auditor
**Files:** ~20 modified
**Priority:** Critical + High handlers

### Phase B: Missing Pages (Create Stub Sub-Pages)
**Scope:** Create ~18 new page files for coach, parent, club, and recruiter sub-pages.
**Strategy:** Create functional stubs with real data hooks where API exists, "Coming soon" where not.
**Team:** 3 builders (coach, parent, club+recruiter) + validator + auditor
**Files:** ~18 new + ~3 modified (sidebar link fixes)

### Phase C: Major Features (Film Player, Notifications, Search)
**Scope:** Build real video player, notification system, global search.
**Strategy:** Deferred — requires significant new infrastructure.
**Estimate:** 3 separate team builds

---

## Phase A Team Plan (Immediate)

### Team Members
| Role | Agent | Responsibility |
|------|-------|----------------|
| builder-athlete | Builder Subagent | Athlete pages + public pages + landing |
| builder-recruiter | Builder Subagent | Recruiter pages + zone map + shared components |
| validator | Validator Subagent | Quality gates (tsc, lint, test, build) |
| auditor | Auditor Subagent | Verify all handlers are wired or properly disabled |

### Contract

**"Wire" pattern** — add onClick that calls existing API or navigates:
```typescript
// Button that navigates
<button onClick={() => router.push('/target')}>Label</button>

// Button that triggers action
<button onClick={async () => { await apiCall(); toast('Done'); }}>Label</button>
```

**"Disable" pattern** — mark non-functional with clear UX:
```typescript
<button disabled title="Coming soon" className="opacity-50 cursor-not-allowed">Label</button>
```

**"Link" pattern** — wrap dead element in Next.js Link:
```typescript
<Link href="/target"><span>Previously dead element</span></Link>
```

### File Ownership
| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| builder-athlete | athlete/*, card/[id]/*, athlete/[id]/*, page.tsx (landing), pricing/*, positions/*, zones/[zone]/*, states/* | recruiter/*, zone/map/*, components/layout/* |
| builder-recruiter | recruiter/*, zone/map/*, components/layout/sidebar.tsx, components/layout/topbar.tsx | athlete/*, public pages |

### Tasks

#### Task 1: Wire Athlete Page Dead Handlers
- **Owner:** builder-athlete
- **Dependencies:** none
- **Instructions:**
  1. `athlete/page.tsx` — Wrap shortlist arrow_forward in `<Link href="/athlete/offers">`
  2. `athlete/analytics/page.tsx` — Disable "Full Report" button. Wire "Message" to `router.push('/messages?to=' + viewerId)` (only for first 2 viewers that show the button)
  3. `athlete/card/edit/page.tsx` — Disable "Take Photo" with title="Camera not yet supported"
  4. `athlete/documents/page.tsx` — Wire "View" to `window.open(doc.url, '_blank')`. Wire "Download" to create download link `<a download>`. Disable "Filter" + "Share" with tooltip.
  5. `athlete/film/page.tsx` — Wire "Upload Film" header button + "Upload Your First Highlight" + upload zone div to a hidden `<input type="file">` (same pattern as documents page). Wire `onChange` to call highlight upload action. Disable "more_vert" and "Edit" per-card.

#### Task 2: Wire Public Athlete Profile + Card
- **Owner:** builder-athlete
- **Dependencies:** none (parallel with Task 1)
- **Instructions:**
  1. `athlete/[id]/page.tsx` — Wire "Add to Shortlist" to redirect `/login?returnTo=/athlete/${id}` (same as card/[id] pattern). Wire "Contact Coach" same way. Wrap "View All" highlights in anchor. Wire play buttons to `window.open(highlight.video_url, '_blank')`.
  2. `card/[id]/page.tsx` — In CardActions or page: wrap "View All" highlights in Link. Wire video thumbnails to `window.open(highlight.video_url, '_blank')`. Remove cursor-pointer from avatar (it's not actionable).

#### Task 3: Wire Public Page Gaps
- **Owner:** builder-athlete
- **Dependencies:** none (parallel with Tasks 1-2)
- **Instructions:**
  1. `page.tsx` (landing) — Convert 7 footer company/legal spans to `<Link>` elements: Privacy→`/privacy`, Terms→`/terms`, Contact→`/support`. For About, Careers, Blog, Security: change to `<span className="cursor-default">` (remove false affordance) OR link to `#`.  Remove `cursor-pointer` from 3 social icon spans.
  2. `pricing/page.tsx` — Fix navbar: Features→`/#features`, About→`/`, Pricing→`/pricing`, Login→`/login`. Wire "Get Started" to `router.push('/signup')`.
  3. `positions/[position]/page.tsx` — Disable "Load More" with title="All prospects shown". Wire mobile hamburger to mobile nav state (`useState` + menu overlay). Wire Sort dropdown `onChange` to sort state.
  4. `zones/[zone]/page.tsx` — Wire mobile hamburger. Wrap AthleteCard in `<Link href="/athlete/${athlete.id}">`. Wrap ProgramCard in `<Link href="/programs/${program.id}">`.

#### Task 4: Wire Recruiter Page Dead Handlers
- **Owner:** builder-recruiter
- **Dependencies:** none
- **Instructions:**
  1. `recruiter/compare/page.tsx` — Wire "Export Data" to generate CSV blob + download (same pattern as coach CSV export). Fix all 3 `/recruiter/board` links to `/recruiter/pipeline`.
  2. `recruiter/prospects/[id]/page.tsx` — Disable "Edit tags", "+ Add" tag, "Filter" timeline with tooltips.
  3. `recruiter/reports/page.tsx` — Wire 3 filter pills to client-side filter state (class year select, program type select, time range select). Disable "View Detail", "more_horiz", "View All Staff".
  4. `recruiter/visits/page.tsx` — Wire Month/Week/Day toggles to view state (even if only month is implemented, show selected state). Wire calendar event chip clicks to expand visit detail or navigate to `/recruiter/visits#visit-${id}`. Disable "Schedule Visit" + "View All" with tooltips.
  5. `recruiter/communications/page.tsx` — Disable per-row three-dots with title="Actions coming soon".
  6. `recruiter/territory/page.tsx` — Disable "View All" with tooltip.

#### Task 5: Wire Film Player Basics
- **Owner:** builder-recruiter
- **Dependencies:** none (parallel with Task 4)
- **Instructions:**
  1. `recruiter/film/[id]/page.tsx` — Replace the CSS background-image thumbnail with a real `<video>` element using `highlight.video_url` as `src`. Wire Play/Pause to `videoRef.current.play()/pause()`. Wire Fullscreen to `videoRef.current.requestFullscreen()`. Wire volume toggle. Connect `currentTime` to video's `timeupdate` event. Wire seek bar. Disable Download, Share, Copy Link, Report with tooltips. Wire Edit/Delete bookmark buttons to their respective API actions from the hook.

#### Task 6: Wire Shared Component Gaps
- **Owner:** builder-recruiter
- **Dependencies:** none (parallel with Tasks 4-5)
- **Instructions:**
  1. `components/layout/sidebar.tsx` — Change recruiter `/recruiter/campaigns` to `/recruiter/communications`. Change `/recruiter/analytics` to `/recruiter/reports`.
  2. `zone/map/page.tsx` — Wire 4 view toggle radios to state (even if data doesn't change yet, track selected view). Disable "Export" and sidebar tune/filter with tooltips.

#### Task 7: Validate
- **Owner:** validator
- **Dependencies:** Tasks 1-6
- **Instructions:**
  Run full quality pipeline: `npx tsx ~/.claude/scripts/quality-pipeline.ts --all`. Must pass tsc, lint (0 errors), tests (353+ pass), and build. Report any failures for Fixer.

#### Task 8: Audit
- **Owner:** auditor
- **Dependencies:** Task 7
- **Instructions:**
  Verify all 52 dead handlers from the gap inventory are now either:
  (a) Wired to a real action/navigation, OR
  (b) Properly disabled with `disabled` attribute + `title` tooltip + `opacity-50 cursor-not-allowed` styling.
  Target: >= 95% of handlers resolved. Report any remaining gaps.

### Execution Order
1. Tasks 1 + 2 + 3 (builder-athlete, parallel)
2. Tasks 4 + 5 + 6 (builder-recruiter, parallel)
3. Task 7: Validate (after all builders)
4. Task 8: Audit (after validation)

### Validation Criteria
- [ ] 0 dead `cursor-pointer` elements without onClick or href
- [ ] 0 buttons without either onClick handler or `disabled` attribute
- [ ] All disabled buttons have `title` tooltip explaining why
- [ ] Film player has real `<video>` element with working play/pause/seek
- [ ] Sidebar links point to existing pages (no 404s)
- [ ] All quality gates pass (tsc, lint, test, build)
- [ ] Auditor reports >= 95% functional rate

### Commit Strategy (3 commits, <=15 files each)
1. `fix(athlete): wire dead handlers on athlete + public pages` (Tasks 1-3)
2. `fix(recruiter): wire dead handlers on recruiter + shared pages` (Tasks 4-6)
3. `test: update tests for wired handlers` (if test changes needed)

---

## Phase B: Missing Pages (Follow-up Plan)

### Coach Sub-Pages (5 new files)
| Path | Type | Data Source |
|------|------|-------------|
| `/coach/roster/page.tsx` | List view | `useCoachDashboard()` roster |
| `/coach/roster/new/page.tsx` | Create form | Server action |
| `/coach/roster/[id]/page.tsx` | Detail view | `useAthlete(id)` |
| `/coach/roster/[id]/edit/page.tsx` | Edit form | Server action |
| `/coach/tasks/page.tsx` | Task list | `useCoachDashboard()` tasks |

### Parent Sub-Pages (5 new files)
| Path | Type | Data Source |
|------|------|-------------|
| `/parent/profile/page.tsx` | Child overview | `useParentDashboard()` childProfile |
| `/parent/schools/page.tsx` | College list | `useParentDashboard()` schools |
| `/parent/calendar/page.tsx` | Schedule | Calendar events from API |
| `/parent/activity/page.tsx` | Activity feed | `useParentDashboard()` activity |
| `/parent/resources/page.tsx` | NCAA resources | Static content |

### Club Sub-Pages (5 new files)
| Path | Type | Data Source |
|------|------|-------------|
| `/club/events/page.tsx` | Tournament list | `useClubDashboard()` tournaments |
| `/club/events/new/page.tsx` | Create form | Server action |
| `/club/verifications/page.tsx` | Queue | `useClubDashboard()` verifications |
| `/club/athletes/page.tsx` | Athlete list | Club athletes API |
| `/club/payments/page.tsx` | Payment history | `useClubDashboard()` payments |

### Recruiter Missing Pages (3 new files)
| Path | Type | Data Source |
|------|------|-------------|
| `/recruiter/prospects/page.tsx` | Prospect list | Athletes API with filters |
| `/settings/page.tsx` | Account settings | Profile API |
| `/athlete/offers/page.tsx` | Offers received | Offers API |

---

## Phase C: Major Features (Future)

### C1: Real Film Player
- Full `<video>` implementation with HLS support
- Timeline markers synced to bookmarks
- Playback speed control
- Frame-by-frame navigation

### C2: Notification System
- DB table: `notifications` (user_id, type, payload, read_at, created_at)
- API: GET/PATCH `/api/notifications`
- Hook: `useNotifications()` with real-time polling or Supabase realtime
- UI: NotificationCenter dropdown (already exists, needs real data)
- Push: Web Push API integration

### C3: Global Search
- API: GET `/api/search?q=` (searches athletes, coaches, programs)
- UI: Wire topbar search inputs across all roles
- Consider: Supabase full-text search or client-side filtering

### C4: File Viewer/Preview
- Document viewer modal (PDF preview, image lightbox)
- Download with proper Content-Disposition headers

---

## References Consulted
- 4 parallel exploration agents audited all 42 pages
- apps/web/components/layout/sidebar.tsx (navigation structure)
- apps/web/components/layout/topbar.tsx (search + notifications)
- apps/web/middleware.ts (route protection)
- All 35 hooks in apps/web/lib/hooks/
