# RepMax v2 — UX Planning (Stage 2)

## Overview

User journey maps, state inventories, and friction audits for all 5 personas across 17 screens. This document must be complete BEFORE any visual design work in Stitch.

---

## Persona 1: ATHLETE (Marcus)

### Journey A: First-Time Profile Setup

**JTBD:** The athlete wants to create their recruiting profile so college coaches can discover and evaluate them.

#### Entry
- **Source:** Sign-up page (after selecting "Athlete" role)
- **Mental state:** Excited but cautious — wondering if this is worth the effort
- **Expectation:** Quick setup, not a 30-minute form
- **Pre-filled data:** Name, email from Clerk auth

#### Action
- **Primary action:** Complete enough profile to generate a Companion Card
- **Required decisions:** Position, grad year, school, basic metrics
- **Defaults we can set:** State (from location), zone (from state), grad year (from age estimate)
- **Feedback needed:** Progress bar (Step 1/4, 2/4...), field validation, "profile strength" indicator

#### Exit
- **Success indicator:** Companion Card preview appears with their data
- **Next step:** "Your card is live! Share it with coaches →" + copy link CTA
- **Undo option:** Edit any field anytime from dashboard
- **Persisted state:** Profile saved to Supabase, RepMax ID generated

#### Edge Cases
- [ ] Empty state: No metrics entered yet → show card with "Add your 40 time" placeholders
- [ ] Partial state: Some metrics missing → card shows available data, prompts for rest
- [ ] Error state: Supabase save fails → preserve form data, show retry
- [ ] Overload: Too many fields → use progressive disclosure (basic → advanced)

---

### Journey B: Editing Companion Card

**JTBD:** The athlete wants to update their stats and film so their card stays current for recruiters.

#### Entry
- **Source:** Athlete Dashboard → "Edit Card" button
- **Mental state:** Purposeful — they have new stats or film to add
- **Expectation:** See current card, make changes, save
- **Pre-filled data:** All existing profile data

#### Action
- **Primary action:** Update specific fields (new 40 time, new film link, GPA update)
- **Required decisions:** Which fields to update (none are forced)
- **Defaults we can set:** Keep all existing values
- **Feedback needed:** Inline save confirmation per section, "Last updated" timestamp

#### Exit
- **Success indicator:** Toast: "Card updated" + card refreshes with new data
- **Next step:** "Share your updated card →" or back to dashboard
- **Undo option:** Values are editable again immediately
- **Persisted state:** Profile row updated, `updated_at` refreshed

---

### Journey C: Viewing Zone Intelligence

**JTBD:** The athlete wants to discover which colleges and recruiters in their zone are looking for their position so they can target their outreach.

#### Entry
- **Source:** Athlete Dashboard → Zone Intelligence widget
- **Mental state:** Exploring — curious about opportunities
- **Expectation:** See relevant colleges and recruiters for their position + zone
- **Pre-filled data:** Athlete's position, state, zone (auto-detected)

#### Action
- **Primary action:** Browse colleges and recruiters, find matches
- **Required decisions:** None forced — pure discovery
- **Defaults we can set:** Filter by athlete's position and zone automatically
- **Feedback needed:** Loading skeletons for Sanity content, match indicators

#### Exit
- **Success indicator:** Found colleges/recruiters to research
- **Next step:** "View Full Profile →" on college cards, or back to dashboard
- **Undo option:** N/A (read-only)
- **Persisted state:** Profile view logged (for analytics)

---

## Persona 2: PARENT (Lisa)

### Journey D: Linking to Athlete via RepMax ID

**JTBD:** The parent wants to link to their child's profile so they can monitor recruiting activity without needing their child's login.

#### Entry
- **Source:** Parent Dashboard → "Link Athlete" section (prominent on first visit)
- **Mental state:** Slightly confused — "What's a RepMax ID?"
- **Expectation:** Simple code entry, instant connection
- **Pre-filled data:** None (parent enters the ID)

#### Action
- **Primary action:** Enter 7-character RepMax ID
- **Required decisions:** None beyond entering the code
- **Defaults we can set:** None
- **Feedback needed:** Real-time validation as they type (format check), preview of athlete name before confirming

#### Exit
- **Success indicator:** Athlete's name + photo appear: "You're now linked to Marcus Johnson ✓"
- **Next step:** "View Marcus's Companion Card →"
- **Undo option:** "Unlink" button in settings
- **Persisted state:** Parent-student link saved

#### Edge Cases
- [ ] Invalid ID → "We couldn't find that RepMax ID. Check with your athlete — it's on their dashboard."
- [ ] Already linked → "You're already linked to Marcus Johnson."
- [ ] Athlete doesn't exist → Same as invalid ID (don't leak existence info)
- [ ] Multiple children → Show list of linked athletes, "Link Another" button

---

### Journey E: Monitoring Recruiting Progress

**JTBD:** The parent wants to see their child's latest recruiting activity so they feel informed and can have helpful conversations.

#### Entry
- **Source:** Parent Dashboard (home screen after login)
- **Mental state:** Checking in — "anything new?"
- **Expectation:** Quick summary of recent activity
- **Pre-filled data:** Linked athlete(s) data

#### Action
- **Primary action:** Scan activity feed, view Companion Card
- **Required decisions:** None (read-only dashboard)
- **Defaults we can set:** Most recent activity first
- **Feedback needed:** "New since last visit" indicators, relative timestamps

#### Exit
- **Success indicator:** Informed about latest activity
- **Next step:** Share card with family/friends, or close app
- **Undo option:** N/A (read-only)
- **Persisted state:** "Last viewed" timestamp updated

---

## Persona 3: HS COACH (Coach Davis)

### Journey F: Daily Dashboard Review

**JTBD:** The coach wants to see today's tasks and recent recruiting activity so they can prioritize their day.

#### Entry
- **Source:** Direct login → Team Dashboard (default for 'team' role)
- **Mental state:** Busy — morning routine before practice
- **Expectation:** At-a-glance view of what needs attention today
- **Pre-filled data:** Team roster, tasks, recent activity

#### Action
- **Primary action:** Scan tasks (urgent first), check activity feed, note any new offers/commits
- **Required decisions:** Which tasks to tackle first, which activity to follow up on
- **Defaults we can set:** Sort tasks by due date (today first), activity by recency
- **Feedback needed:** Task count badge, urgent indicators (red ring), new activity markers

#### Exit
- **Success indicator:** Know what to focus on today
- **Next step:** Click a task to act on it, or click an athlete to view details
- **Undo option:** N/A (read-only scan)
- **Persisted state:** Nothing new persisted from scanning

---

### Journey G: Logging Recruiting Activity

**JTBD:** The coach wants to log an offer/visit/call for an athlete so the team's recruiting pipeline stays current.

#### Entry
- **Source:** Team Dashboard → Athlete Card → "Log Activity" button (or sidebar Activity Widget → "+")
- **Mental state:** Just got off a call or received news — wants to capture it quickly
- **Expectation:** Quick form, not a lengthy process
- **Pre-filled data:** Athlete name (if from their card), team ID, coach ID

#### Action
- **Primary action:** Select type (offer/visit/call/film/ranking/contact), enter college + description
- **Required decisions:** Activity type, college name, brief description
- **Defaults we can set:** Date (today), athlete (if opened from their card)
- **Feedback needed:** Type selector with clear icons, college autocomplete from Sanity data

#### Exit
- **Success indicator:** Toast: "Activity logged ✓" + activity appears in feed + athlete card updates
- **Next step:** Log another, or back to dashboard
- **Undo option:** Edit/delete from activity feed within 24 hours
- **Persisted state:** activity_log row created, athlete offers count incremented if type=offer

---

### Journey H: Managing Tasks

**JTBD:** The coach wants to track recruiting to-dos so nothing falls through the cracks during busy seasons.

#### Entry
- **Source:** Team Dashboard sidebar → Tasks Widget
- **Mental state:** Task-oriented — checking off or adding items
- **Expectation:** Simple checklist with priority indicators
- **Pre-filled data:** Existing tasks sorted by due date

#### Action
- **Primary action:** Complete tasks (checkbox) or add new ones
- **Required decisions:** For new tasks: type, title, due date, priority, optional athlete tag
- **Defaults we can set:** Priority (normal), type (note), due date (today)
- **Feedback needed:** Completion animation (checkbox → strikethrough → fade out), "View All" for full list

#### Exit
- **Success indicator:** Task disappears from active list on completion
- **Next step:** Next task, or back to dashboard overview
- **Undo option:** "Undo" toast for 5 seconds after completing
- **Persisted state:** Task row updated (completed=true, completed_at=now)

---

### Journey I: Adding Athlete to Roster

**JTBD:** The coach wants to add a player to their digital roster so they can track their recruiting from the Team Dashboard.

#### Entry
- **Source:** Team Dashboard → Filter Bar → "+ Add Athlete" button
- **Mental state:** Onboarding a new player — may be adding the whole roster initially
- **Expectation:** Enter an identifier (RepMax ID or email), athlete appears in roster
- **Pre-filled data:** Team ID

#### Action
- **Primary action:** Enter athlete's RepMax ID or email
- **Required decisions:** Which identifier to use
- **Defaults we can set:** Position from athlete's profile, status (active)
- **Feedback needed:** Search-as-you-type preview, confirmation of correct athlete before adding

#### Exit
- **Success indicator:** Athlete card appears in grid with "Just Added" badge
- **Next step:** Add another, or view the athlete's card
- **Undo option:** Remove from roster (doesn't delete athlete's account)
- **Persisted state:** team_rosters row created

#### Edge Cases
- [ ] Athlete not found → "No athlete found. They may need to create a RepMax account first."
- [ ] Already on roster → "Marcus Johnson is already on your roster."
- [ ] Bulk add → "Import from CSV" option for initial roster setup
- [ ] Wrong athlete → Preview shows name + photo before confirming

---

### Journey J: Tracking College Relationships

**JTBD:** The coach wants to track which colleges are actively recruiting their players so they can nurture the hottest relationships.

#### Entry
- **Source:** Team Dashboard sidebar → Colleges Widget
- **Mental state:** Strategic — thinking about pipeline
- **Expectation:** See colleges grouped by engagement level
- **Pre-filled data:** Existing relationships from college_relationships table

#### Action
- **Primary action:** Review hot/warm/cold groupings, update heat levels as relationships develop
- **Required decisions:** Heat level changes (cold→warm, warm→hot)
- **Defaults we can set:** Heat based on activity frequency
- **Feedback needed:** Color-coded indicators, athlete count per college

#### Exit
- **Success indicator:** Clear picture of which relationships to prioritize
- **Next step:** Click college to see which athletes are involved
- **Undo option:** Heat level is editable anytime
- **Persisted state:** college_relationships row updated

---

## Persona 4: RECRUITER (Coach Williams)

### Journey K: Searching for Prospects

**JTBD:** The recruiter wants to find athletes matching their program's needs so they can build their recruiting class.

#### Entry
- **Source:** Recruiter Dashboard → Search tab
- **Mental state:** Hunting — looking for specific position/zone/metrics
- **Expectation:** Filterable database, quick card previews
- **Pre-filled data:** Recruiter's zone preferences, position needs from Sanity profile

#### Action
- **Primary action:** Set filters (position, zone, grad year, min GPA, min metrics), browse results
- **Required decisions:** Filter criteria
- **Defaults we can set:** Recruiter's zone, positions they recruit
- **Feedback needed:** Result count updates in real-time, loading skeletons while fetching

#### Exit
- **Success indicator:** Found promising prospects
- **Next step:** View Companion Card → Shortlist → Contact coach
- **Undo option:** Modify filters
- **Persisted state:** Search preferences cached (TanStack Query)

---

### Journey L: Shortlisting an Athlete

**JTBD:** The recruiter wants to save promising athletes so they can review them later and track their pipeline.

#### Entry
- **Source:** Search results → Athlete Card → "⭐ Shortlist" button, OR Companion Card → Footer → "Shortlist"
- **Mental state:** Decisive — they've seen enough to want to track this athlete
- **Expectation:** One click to save, ability to add notes later
- **Pre-filled data:** Athlete ID, recruiter ID

#### Action
- **Primary action:** Click shortlist button
- **Required decisions:** None (can add notes later)
- **Defaults we can set:** Status (watching), timestamp (now)
- **Feedback needed:** Star fills in / button state changes, toast: "Added to shortlist"

#### Exit
- **Success indicator:** Star is filled, athlete appears in Saved tab
- **Next step:** Continue browsing, or view shortlist
- **Undo option:** Click star again to remove
- **Persisted state:** recruiter_shortlists row created

---

## Persona 5: CLUB ORGANIZER (Mike)

**Note:** Club Dashboard is EXISTING and unchanged. Multi-role support is the only new UX concern.

### Journey M: Switching Between Roles

**JTBD:** The user with multiple roles wants to switch between their HS Coach and Club Organizer dashboards without logging out.

#### Entry
- **Source:** Any dashboard → Role Switcher dropdown (in header nav)
- **Mental state:** Context-switching — "I need to check on the tournament now"
- **Expectation:** Instant switch, like switching browser tabs
- **Pre-filled data:** User's roles[] array from profiles table

#### Action
- **Primary action:** Click role switcher → select different role
- **Required decisions:** Which role to switch to
- **Defaults we can set:** Last active role on login
- **Feedback needed:** Current role clearly indicated, other roles available in dropdown

#### Exit
- **Success indicator:** Dashboard changes to selected role's view
- **Next step:** Work in new dashboard
- **Undo option:** Switch back anytime
- **Persisted state:** Active role stored in localStorage (or Clerk metadata)

#### Edge Cases
- [ ] Single role user → Role switcher hidden
- [ ] First login with multiple roles → Show role selection screen
- [ ] Role added later (e.g., coach becomes club organizer) → Switcher appears automatically

---

## State Inventories

### Companion Card States

| State | Trigger | User Sees | User Can Do |
|---|---|---|---|
| **Empty** | New athlete, no data | Card skeleton with "Complete your profile to unlock your Companion Card" | Click to start profile wizard |
| **Partial** | Some fields filled | Card with filled sections, dimmed empty sections with "Add your [field]" prompts | Click any section to edit |
| **Loading** | Fetching profile data | Skeleton shimmer on all sections | Wait (< 1.5s target) |
| **Ideal** | All key fields populated | Full card with photo, metrics, academics, docs, highlights | Share, edit (if owner), shortlist (if recruiter) |
| **Error** | API fetch fails | "Couldn't load this profile. Tap to retry." with retry button | Retry, go back |
| **Not Found** | Invalid RepMax ID on public route | Custom 404: "This athlete hasn't created their profile yet. Are you an athlete? Get started →" | Navigate to sign-up |

### Team Dashboard States

| State | Trigger | User Sees | User Can Do |
|---|---|---|---|
| **Empty** | New coach, no roster | Welcome message: "Start building your roster" + prominent Add Athlete button, sample data preview | Add first athlete |
| **Loading** | Dashboard initializing | Skeleton for stats row, sidebar widgets, empty grid | Wait (< 2s target) |
| **Ideal** | Roster populated, activity flowing | Full dashboard with stats, grid, active sidebar | All CRUD operations |
| **Error** | Supabase connection fails | Banner: "Having trouble loading your dashboard. We're working on it." with retry | Retry, report issue |
| **Overload** | 50+ athletes on roster | Pagination activates, filters become essential | Filter, paginate, search |

### Sidebar Widget States (applies to all 6 widgets)

| Widget | Empty State | Ideal State |
|---|---|---|
| **Tasks** | "No tasks yet. Add your first to-do to stay organized." + Add Task CTA | Prioritized task list with urgent/normal indicators |
| **Activity** | "No activity recorded yet. It'll show up here when you log offers, visits, and calls." | Chronological feed with emoji icons |
| **Colleges** | "Start tracking college relationships by logging activity with schools." | Hot/Warm/Cold groupings with counts |
| **Calendar** | "No upcoming events. Add a camp, visit, or signing day." + Add Event CTA | Mini calendar with highlighted dates |
| **Notes** | "Jot down recruiting notes, strategy ideas, or call summaries." + Quick add form visible | Pinned notes on top, recent below |
| **Quick Actions** | Always visible — buttons are the empty state | Same as default |

### Zone Intelligence States

| State | Trigger | User Sees | User Can Do |
|---|---|---|---|
| **Empty** | Athlete hasn't set position/state | "Complete your profile to see zone intelligence for your area." | Go to profile setup |
| **Loading** | Sanity content fetching | Skeleton with zone color accent | Wait (< 500ms target) |
| **Ideal** | Position + zone known | Zone stats, top match, recruiter list, upcoming camps | Browse, click through |
| **Error** | Sanity API fails | "Zone data temporarily unavailable" with cached fallback if available | Retry, or browse manually |

---

## Friction Audit (P0 Screens)

### Team Dashboard — Friction Score: MEDIUM

| Friction Type | Issue | Solution |
|---|---|---|
| **Cognitive** | 6 sidebar widgets + main grid = information overload on first visit | Progressive disclosure: collapse widgets by default on first visit, expand as data accumulates |
| **Cognitive** | Zone map requires understanding of recruiting zones | Tooltip on hover with zone name + state list, highlighted zone for coach's school |
| **Clicks** | Logging activity: Dashboard → Card → Log Activity → Form → Save = 4 clicks | Add "Quick Log" to sidebar Quick Actions (2 clicks) |
| **Clicks** | Viewing Companion Card from grid: Card → View Profile → Scroll = 3 steps | Hover state shows "View Card" button, opens inline or modal |
| **Memory** | Remembering college relationship status | Auto-suggest heat level based on activity frequency |
| **Error** | Accidentally completing a task | 5-second undo toast |

### Companion Card — Friction Score: LOW

| Friction Type | Issue | Solution |
|---|---|---|
| **Cognitive** | 8 metrics can overwhelm if all empty | Only show metrics that have values, "Add more" at bottom |
| **Trust** | "Who can see this card?" concern | Clear privacy indicator: "Your card is visible to coaches and recruiters" |
| **Clicks** | Sharing: 1 click (copy link) — acceptable | Already optimized |

### Recruiter Search — Friction Score: LOW-MEDIUM

| Friction Type | Issue | Solution |
|---|---|---|
| **Cognitive** | Too many filter options at once | Progressive: show Position + Zone first, "More Filters" expandable |
| **Time** | Loading large result sets | Infinite scroll with skeleton placeholders, not pagination |
| **Memory** | Forgetting which athletes were already reviewed | "Previously Viewed" indicator on cards |

---

## Accessibility Notes

| Area | Requirement |
|---|---|
| **Focus Management** | Tab order through sidebar widgets → main grid. Modal traps focus. |
| **ARIA Labels** | Zone map regions labeled. Star ratings announced. Verified badge announced. |
| **Color Contrast** | Zone colors on dark backgrounds must meet WCAG AA (4.5:1 minimum) |
| **Keyboard Navigation** | All widgets operable via keyboard. Grid cards navigable with arrow keys. |
| **Screen Reader** | Companion Card sections announced as landmarks. Metrics read as "40-yard dash: 4.58 seconds" |
| **Reduced Motion** | Hover animations respect `prefers-reduced-motion` |
| **Touch Targets** | Sidebar widget buttons minimum 44x44px for mobile |
