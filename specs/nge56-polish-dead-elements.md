# NGE-56 Polish: Remaining Dead Elements

## Objective
Fix all 18 remaining dead UI elements (Medium + Low priority) across 9 files. Pure frontend wiring — no new API routes or DB changes.

## Team Members
| Role | Agent | Responsibility |
|------|-------|----------------|
| builder-public | Builder | Public pages: athlete/[id], card/[id], zones/[zone], states/[state], programs/[id] (5 files) |
| builder-recruiter | Builder | Recruiter/dashboard pages: film/[id], reports, visits, zone/map (4 files) |
| validator | Validator | Quality gates (tsc, lint, tests, build) |

## Contract

**Patterns to apply:**

Wire pattern (add navigation):
```typescript
<Link href="/target">...</Link>
// or
<button onClick={() => router.push('/target')}>...</button>
```

Disable pattern (non-functional):
```typescript
<button disabled title="Coming soon" className="opacity-50 cursor-not-allowed">...</button>
```

Search filter pattern (wire to state):
```typescript
const [search, setSearch] = useState('');
<input value={search} onChange={(e) => setSearch(e.target.value)} />
// Then filter displayed items: items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
```

## File Ownership
| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| builder-public | `app/athlete/[id]/page.tsx`, `app/card/[id]/page.tsx`, `app/zones/[zone]/page.tsx`, `app/states/[state]/page.tsx`, `app/programs/[id]/page.tsx` | recruiter/*, zone/map/* |
| builder-recruiter | `app/(dashboard)/recruiter/film/[id]/page.tsx`, `app/(dashboard)/recruiter/reports/page.tsx`, `app/(dashboard)/recruiter/visits/page.tsx`, `app/(dashboard)/zone/map/page.tsx` | athlete/*, card/*, zones/*, states/*, programs/* |

## Tasks

### Task 1: Wire public page dead elements (5 files)
- **Owner:** builder-public
- **Dependencies:** none

**File 1: `apps/web/app/athlete/[id]/page.tsx`**
- Highlight play button (~line 257-259): The div has `cursor-pointer` but no onClick. Add `onClick={() => window.open(highlight.video_url, '_blank')}` to open the video URL.

**File 2: `apps/web/app/card/[id]/page.tsx`**
- "View All" highlights text (~line 313-314): Convert the `<span>` to `<Link href={`/athlete/${athlete.id}#highlights`}>`. Remove opacity-50.
- Video thumbnail/play button (~line 317-337): The container div has `cursor-pointer` but no onClick. Add `onClick={() => window.open(highlight.video_url, '_blank')}` to open the video URL.

**File 3: `apps/web/app/zones/[zone]/page.tsx`**
- AthleteCard components (~line 9-53 usage): Wrap each `<AthleteCard>` usage in `<Link href={`/athlete/${athlete.id}`}>`. Add `className="block"` to Link.
- ProgramCard components (~line 56-73 usage): Wrap each `<ProgramCard>` usage in `<Link href={`/programs/${program.id}`}>`. Add `className="block"` to Link.
- Header search input (~line 141-144): Wire to `useState` filter. Add `onChange={(e) => setSearch(e.target.value)}` and filter displayed athletes/programs by name.

**File 4: `apps/web/app/states/[state]/page.tsx`**
- Search input (~line 116-121): Wire to `useState` filter. Filter programs by name on input change.

**File 5: `apps/web/app/programs/[id]/page.tsx`**
- Search input (~line 62-67): Wire to `useState` filter. Filter displayed data by search term.

### Task 2: Wire recruiter/dashboard dead elements (4 files)
- **Owner:** builder-recruiter
- **Dependencies:** none

**File 1: `apps/web/app/(dashboard)/recruiter/film/[id]/page.tsx`**
- Download button (~line 265-268): Add `onClick={() => window.open(highlight.video_url, '_blank')}` and `title="Download video"`.
- Share button (~line 285-293): Disable with `disabled title="Share coming soon"` + `className="opacity-50 cursor-not-allowed"`.
- Copy Link button (~line 294-302): Wire `onClick={() => { navigator.clipboard.writeText(window.location.href); }}` with brief "Copied!" feedback state.
- Report button (~line 303-311): Disable with `disabled title="Report coming soon"`.
- Edit bookmark button (~line 352-353): Disable with `disabled title="Edit coming soon"`.
- Delete bookmark button (~line 355-356): Wire `onClick` to call `deleteBookmark(bookmark.id)` from the existing hook if available, otherwise disable.
- Video player controls (play/pause/replay/volume/settings/fullscreen, ~lines 167-229): Disable all with `disabled title="Video controls coming soon"` + opacity-50 styling.
- more_vert button (~line 180-182): Disable with `disabled title="Options coming soon"`.

**File 2: `apps/web/app/(dashboard)/recruiter/reports/page.tsx`**
- 3 filter pills (Class of 2025, Varsity Program, This Quarter, ~lines 25-37): Wire each to a `useState` variable. Add `onClick` to toggle active state. Show active pill with `bg-white/10` styling. (Data filtering is cosmetic — just track the selected state visually.)

**File 3: `apps/web/app/(dashboard)/recruiter/visits/page.tsx`**
- Month/Week/Day toggles (~lines 143-151): Wire to `useState('month')`. Add `onClick={() => setViewMode('month'|'week'|'day')}`. Show active toggle with distinct styling. Disable Week/Day with `title="Coming soon"` since only month view is implemented.
- Calendar event chips (~lines 207-219): Wrap in clickable div with `onClick` that scrolls to or highlights the visit in the upcoming list, or shows a tooltip with visit details.

**File 4: `apps/web/app/(dashboard)/zone/map/page.tsx`**
- View toggle radios (Prospects/Programs/Events/Recruiters, ~lines 83-98): Wire `onChange` to a `useState` variable tracking selected view. Even though content doesn't change based on selection, track the state so the radio buttons visually toggle correctly.

### Task 3: Validate
- **Owner:** validator
- **Dependencies:** Task 1, Task 2
- **Instructions:** Run full quality pipeline: `npx tsx ~/.claude/scripts/quality-pipeline.ts --all`

## Execution Order
1. Task 1 + Task 2 (parallel)
2. Task 3: Validate

## Conventions
- Material Symbols for icons on Stitch-converted pages
- `'use client'` directive required if adding useState/useRouter to server component
- DO NOT restructure existing JSX — only add handlers/wrappers/state
- Keep changes minimal — wire or disable, nothing more

## Validation Criteria
- [ ] 0 dead `cursor-pointer` elements without onClick/href
- [ ] 0 buttons without onClick or `disabled`
- [ ] All disabled buttons have `title` tooltip
- [ ] tsc passes, lint passes, tests pass, build passes
- [ ] 18/18 dead elements fixed
