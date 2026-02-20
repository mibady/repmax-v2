# NGE-56: Wire All "Coming Soon" Placeholders

## Objective
Replace all 27 disabled "coming soon" buttons with real functionality across 9 files. Material Symbols only — no Lucide additions.

## Team Members
| Role | Agent | Files |
|------|-------|-------|
| builder-film | Builder | recruiter/film/[id]/page.tsx (1 file, 11 elements) |
| builder-recruiter | Builder | reports, visits, territory, communications (4 files, 8 elements) |
| builder-misc | Builder | prospects/[id], zone/map, zones/[zone], positions/[position] (4 files, 8 elements) |
| validator | Validator | Quality gates |

## File Ownership
| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| builder-film | `(dashboard)/recruiter/film/[id]/page.tsx`, `lib/hooks/use-highlight-detail.ts` | Everything else |
| builder-recruiter | `(dashboard)/recruiter/reports/page.tsx`, `(dashboard)/recruiter/visits/page.tsx`, `(dashboard)/recruiter/territory/page.tsx`, `(dashboard)/recruiter/communications/page.tsx` | film, prospects, zone, public pages |
| builder-misc | `(dashboard)/recruiter/prospects/[id]/page.tsx`, `(dashboard)/zone/map/page.tsx`, `zones/[zone]/page.tsx`, `positions/[position]/page.tsx` | film, reports, visits, territory, comms |

## Tasks

### Task 1: Film Player — Real `<video>` + all controls (11 elements)

**File: `apps/web/app/(dashboard)/recruiter/film/[id]/page.tsx`**
**Also modify: `apps/web/lib/hooks/use-highlight-detail.ts`**

The page currently shows a decorative thumbnail-based player. Replace with real HTML5 video.

1. **Add `useRef` for video element.** Add state: `isPlaying`, `isMuted`, `volume`, `currentTime`, `duration`, `isFullscreen`.

2. **Replace the thumbnail/gradient div (lines 151-234) with a real player:**
   - Keep the outer container div with same classes
   - Add `<video ref={videoRef} src={highlight.video_url} poster={highlight.thumbnail_url || undefined} className="absolute inset-0 w-full h-full object-cover" onTimeUpdate={...} onLoadedMetadata={...} onPlay={...} onPause={...} />`
   - Keep the gradient overlay but make it `pointer-events-none`
   - Keep the bottom control bar structure

3. **Wire controls:**
   - **Play button (center, line 168):** Remove disabled. `onClick={() => { videoRef.current?.paused ? videoRef.current.play() : videoRef.current.pause() }}`. Toggle icon between `play_arrow` and `pause`.
   - **Pause button (bottom bar, line 208):** Same toggle — show `play_arrow` or `pause` based on `isPlaying` state.
   - **Replay/skip back (line 211):** `onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10 }}`
   - **Volume (line 215):** `onClick={() => { if (videoRef.current) { videoRef.current.muted = !videoRef.current.muted; setIsMuted(!isMuted) } }}`. Toggle icon between `volume_up` and `volume_off`.
   - **Settings (line 225):** Wire to toggle a small playback speed menu (0.5x, 1x, 1.5x, 2x). `videoRef.current.playbackRate = speed`.
   - **Fullscreen (line 228):** `onClick={() => videoRef.current?.requestFullscreen()}`
   - **more_vert (line 181):** Wire to toggle a dropdown with "Open in new tab" (`window.open(video_url)`) and "Copy URL" (`navigator.clipboard`).
   - **Seek bar (line 189):** Wire `onClick` on the timeline to seek: calculate click position, set `videoRef.current.currentTime`. Update progress bar width from `currentTime/duration`.
   - **currentTime display (line 220):** Already uses `formatTimestamp(currentTime)` — just update `currentTime` via video `timeupdate` event.

4. **Wire secondary actions:**
   - **Share (line 286):** Remove disabled. Wire to `navigator.share({ title: highlight.title, url: window.location.href })` with fallback to clipboard copy. Show feedback.
   - **Report (line 304):** Remove disabled. Wire to open a simple report modal (inline form with reason select + textarea + submit). For now, just log to console and show "Report submitted" toast.

5. **Wire bookmark actions — first add `deleteBookmark` to the hook:**
   In `lib/hooks/use-highlight-detail.ts`:
   - Add `deleteBookmark(bookmarkId: string)` function that calls `DELETE /api/highlights/bookmarks?id={bookmarkId}` (or direct Supabase delete). Remove from local `bookmarks` state on success.
   - Add `updateBookmark(bookmarkId: string, data: { notes?: string; label?: string })` function similarly.
   - Export both from the hook.

   Then in the page:
   - **Edit bookmark (line 353):** Remove disabled. `onClick` opens AddBookmarkModal pre-filled with bookmark data (pass `editData` prop). On submit, call `updateBookmark`.
   - **Delete bookmark (line 356):** Remove disabled. `onClick` with confirm dialog, then call `deleteBookmark(bookmark.id)`.

**Remove all `opacity-50 cursor-not-allowed disabled` from these 11 elements.**

### Task 2: Recruiter pages (8 elements across 4 files)

**File 1: `apps/web/app/(dashboard)/recruiter/reports/page.tsx`**
- **View Detail (line 61):** Remove disabled. Wire `onClick` to toggle an expanded detail section below the funnel that shows per-stage breakdown (use funnel data already available). Add `showFunnelDetail` state.
- **more_horiz staff (line 174):** Convert span to button. Wire `onClick` to toggle a dropdown with "Export CSV" (generate CSV from staffActivity data + download) and "Print" (`window.print()`).
- **View All Staff (line 233):** Remove disabled. Wire to scroll up to the staff leaderboard section or expand to show all staff (remove any `.slice()` limit).

**File 2: `apps/web/app/(dashboard)/recruiter/visits/page.tsx`**
- **Week toggle (line 146):** Already has onClick that toggles state. Remove `title="Coming soon"`. Add a basic week view: show only the current week's days (7 columns) with larger cells. Use `viewMode` state to conditionally render month vs week layout.
- **Day toggle (line 147):** Same — remove `title="Coming soon"`. Add a day view: show only today's events in a timeline format (hourly slots from 8am-8pm).
- **View All upcoming (line 255):** Remove disabled. Wire `onClick` to toggle `showAllVisits` state. When true, remove the `.slice(0, 5)` limit on line 267 to show all visits.

**File 3: `apps/web/app/(dashboard)/recruiter/territory/page.tsx`**
- **View All (line 366):** Remove disabled. Wire `onClick` to set `showAllAssignments` state. When true, remove any limit on displayed assignments. If already showing all, change text to "Show Less" and re-add limit.

**File 4: `apps/web/app/(dashboard)/recruiter/communications/page.tsx`**
- **Per-row three-dots (line 280):** Convert from span to button. Wire `onClick` to toggle a dropdown menu anchored to the row. Menu items: "View Details" (navigate to `/recruiter/prospects/${log.athleteId}` if available), "Log Follow-up" (navigate to messages). Use `openMenuId` state to track which row's menu is open. Click outside closes.

### Task 3: Prospects + Public pages (8 elements across 4 files)

**File 1: `apps/web/app/(dashboard)/recruiter/prospects/[id]/page.tsx`**
- **Edit tags (line 425):** Remove disabled. Wire to toggle `isEditingTags` state. When editing, show each existing tag with an "x" remove button, and the "Add" button becomes a text input. Tags stored in `customTags` useState array (client-side only — no API).
- **+ Add tag (line 441):** Remove disabled. When `isEditingTags` is true, show a text input + enter to add. `onSubmit` appends to `customTags` array. Show tag with same pill styling.
- **Filter timeline (line 473):** Remove disabled. Wire to toggle a filter dropdown with type checkboxes (call, email, visit, note). Since timeline is currently empty (returns []), show the filter UI but it won't affect displayed data. Store filter state for when timeline data is added.

**File 2: `apps/web/app/(dashboard)/zone/map/page.tsx`**
- **Export (line 114):** Remove disabled. Wire `onClick` to generate CSV from `zones` data (zone_code, total_recruits, blue_chip_count, upcoming_events_30d) and trigger download via Blob/URL.createObjectURL pattern.
- **Filters icon (line 234):** Convert to button. Wire `onClick` to toggle a filter panel below the "Zone Activity" header. Filter panel has checkboxes for trending item types (spike, activity, event, offer, report). Filter `displayTrendingItems` based on selected types.

**File 3: `apps/web/app/zones/[zone]/page.tsx`**
- **Mobile hamburger (line 165):** Remove disabled. Wire to toggle `isMobileMenuOpen` state. When open, show a dropdown menu below the header with nav links: Home `/`, Positions `/positions`, Zones `/zones`, Login `/login`, Sign Up `/signup`. Dark theme matching page (`bg-[#111]`). Close on click outside or on link click.

**File 4: `apps/web/app/positions/[position]/page.tsx`**
- **Sort dropdown (line 256):** Remove disabled. Wire `onChange` to `setSortBy` state. Sort `filteredProspects` array before rendering: "Rating" (default, by star_rating desc), "Name" (alphabetical), "Class Year" (by class_year). The page already has `filteredProspects` — apply sort before mapping.

## Conventions
- Material Symbols ONLY — `<span className="material-symbols-outlined">icon_name</span>`
- NO new Lucide imports. Existing Lucide in files is OK to leave.
- Dark theme colors: `bg-[#1F1F22]`, `bg-[#1a1a1a]`, `border-white/10`, `text-white`, `text-slate-400`
- Film page colors: `bg-[#0f0f0f]`, `bg-primary`, `text-[#0f0f0f]`
- Prospect page colors: `bg-[#2a271d]`, `border-[#433d28]`, `text-[#c3b998]`
- Dropdown pattern: absolute positioned div with `z-50`, dark bg, border, rounded-lg, shadow-xl
- Use `useRef` for video element, `useState` for UI toggles
- Toast/feedback: inline state message, auto-clear after 2-3 seconds

## Execution Order
1. Task 1 + Task 2 + Task 3 (parallel — no file overlap)
2. Task 4: Validate (depends on all builders)

## Validation Criteria
- [ ] 0 "coming soon" tooltips remaining
- [ ] Film player plays/pauses/seeks/adjusts volume/goes fullscreen
- [ ] Report filter pills filter data
- [ ] Visit week/day views render
- [ ] Tags can be added/removed on prospect detail
- [ ] Zone map export generates CSV
- [ ] Sort dropdown sorts prospects
- [ ] Mobile hamburger opens menu
- [ ] tsc passes, lint passes, tests pass, build passes
