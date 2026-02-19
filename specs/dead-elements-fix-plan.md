# dead-elements-fix Plan

## Objective
Fix all 14 Critical + High dead UI elements across 9 files — all backends already exist, this is pure frontend wiring.

## Team Members
| Role | Agent | System Prompt | Responsibility |
|------|-------|---------------|----------------|
| Film Builder | builder-film | .claude/agents/team/builder.md | Film page: upload modal, edit, options menu (5 fixes) |
| Wiring Builder | builder-wiring | .claude/agents/team/builder.md | All other dead elements (9 fixes across 7 files) |
| Validator | validator | .claude/agents/team/validator.md | Quality gates (tsc, lint, tests, build) |

## Contract

**Existing APIs (DO NOT CREATE — already exist):**

```typescript
// useHighlights hook — apps/web/lib/hooks/use-highlights.ts
add(data: { title: string; description?: string; video_url: string; thumbnail_url?: string; duration_seconds?: number }) => Promise<{ error?: string; data?: Highlight }>
update(highlightId: string, data: { title?: string; description?: string; thumbnail_url?: string }) => Promise<{ error?: string; success?: boolean }>
remove(highlightId: string) => Promise<{ error?: string; success?: boolean }>

// DELETE /api/shortlists?athlete_id={id} — existing route
// useCampusVisits hook — apps/web/lib/hooks/use-campus-visits.ts
createVisit(data: { athlete_id: string; visit_date: string; visit_type: 'official' | 'unofficial'; visit_time?: string; notes?: string }) => Promise<{ success?: boolean; error?: string }>
```

**New component interface:**
```typescript
// AddHighlightModal
interface AddHighlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string; video_url: string }) => Promise<void>;
  editData?: { id: string; title: string; description?: string; video_url: string } | null;
  isSubmitting?: boolean;
}
```

## File Ownership
| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| builder-film | `(dashboard)/athlete/film/page.tsx`, `components/ui/add-highlight-modal.tsx` | Everything else |
| builder-wiring | `coach/roster/[id]/page.tsx`, `messages/MessageThread.tsx`, `athlete/documents/page.tsx`, `athlete/analytics/page.tsx`, `recruiter/visits/page.tsx`, `recruiter/compare/page.tsx`, `components/layout/sidebar.tsx` | film page, highlight modal |

## Tasks

### Task 1: Film page — Add/Edit highlight modal + wire all buttons
- **Owner:** builder-film
- **Input:** Contract above, existing `useHighlights` hook with `add`/`update`/`remove`
- **Output:** `components/ui/add-highlight-modal.tsx` (new), `athlete/film/page.tsx` (modified)
- **Dependencies:** none
- **Instructions:**
  1. Create `apps/web/components/ui/add-highlight-modal.tsx` — modal form with title, video_url (required), description (optional) fields. Reused for both add and edit (pass `editData` prop to pre-fill). Dark theme matching existing modals (`bg-[#1F1F22]`, `border-white/10`). Material Symbols icons only.
  2. Modify `apps/web/app/(dashboard)/athlete/film/page.tsx`:
     - Wire "Upload Film" header button (line ~176) → open AddHighlightModal
     - Wire upload drop zone (line ~184) → open AddHighlightModal on click
     - Wire "Upload Your First Highlight" empty state button (line ~151) → open AddHighlightModal
     - Wire "Edit" per-card button (line ~110) → open AddHighlightModal with `editData` pre-filled from highlight
     - Wire "more_vert" options icon (line ~95) → small dropdown menu with "Delete" option calling `remove(highlight.id)`
     - Use `useHighlights().add()` for create, `.update()` for edit, `.remove()` for delete
     - Add success/error toast-style feedback (simple inline state message)
  3. Read existing `useHighlights` hook first — it already exports `add`, `update`, `remove`, `isPending`

### Task 2: Wire all other dead elements
- **Owner:** builder-wiring
- **Input:** Contract above, existing hooks and API routes
- **Output:** 7 modified files
- **Dependencies:** none
- **Instructions:**
  1. `apps/web/app/(dashboard)/coach/roster/[id]/page.tsx`:
     - "Message Athlete" button (line ~127) → `router.push('/messages')` (remove disabled, add onClick + useRouter)
     - "Remove from Roster" button (line ~134) → confirm dialog, then `fetch('/api/shortlists?athlete_id=${id}', { method: 'DELETE' })`, redirect to `/coach/roster` on success
  2. `apps/web/components/messages/MessageThread.tsx`:
     - "Add attachment" button (line ~249) → wire to hidden `<input type="file">` that opens file picker. On select, show filename in a chip below the textarea. Store the File object in state. (Actual upload to storage is deferred — just show the file name for now, clear on send.)
  3. `apps/web/app/(dashboard)/athlete/documents/page.tsx`:
     - "Filter" button (line ~122) → toggle a filter panel with document type checkboxes (transcript, test_scores, medical, other). Filter the displayed documents client-side using existing data.
  4. `apps/web/app/(dashboard)/athlete/documents/page.tsx`:
     - "Share" per-doc button (line ~206) → `navigator.clipboard.writeText(doc.file_url)` + brief "Copied!" feedback
  5. `apps/web/app/(dashboard)/athlete/analytics/page.tsx`:
     - "Full Report" button (line ~217) → generate CSV from the analytics data already loaded on the page. Use `URL.createObjectURL(new Blob([csvString]))` + click an `<a download>`.
  6. `apps/web/app/(dashboard)/recruiter/visits/page.tsx`:
     - "Schedule Visit" button (line ~65) → open a modal form with athlete_id, visit_date, visit_type, visit_time, notes fields. On submit, call `createVisit()` from `useCampusVisits` hook. Page already has the hook imported.
  7. `apps/web/app/(dashboard)/recruiter/compare/page.tsx`:
     - "Export Data" button (line ~278) → generate CSV from the comparison data on the page. Same Blob/download pattern as analytics.
  8. `apps/web/components/layout/sidebar.tsx`:
     - "Add Athlete" button (line ~423) → this is in the RecruiterSidebar. Wire to `router.push('/recruiter/pipeline')` (the pipeline page where recruiters add athletes). Remove disabled, add onClick + useRouter.

### Task 3: Validate
- **Owner:** validator
- **Input:** All builder outputs
- **Output:** Quality gate results (tsc, lint, tests, build)
- **Dependencies:** Task 1, Task 2
- **Instructions:**
  Run full quality pipeline: `npx tsc --noEmit`, `npx next lint`, `npx vitest run`, `npx next build`. Report any failures.

## Execution Order
1. Task 1 + Task 2 (parallel — no file overlap)
2. Task 3: Validate (depends on both builders)

## Conventions
- Material Symbols ONLY — `<span className="material-symbols-outlined">icon_name</span>`
- NO Lucide imports in new files (existing Lucide in modified files is OK to leave)
- Color tokens: `bg-[#1F1F22]`, `bg-[#141414]`, `border-white/10`, `text-white`, `text-slate-400`, `text-primary`
- CSS-only spinner: `<div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />`

## Validation Criteria
- [ ] All 5 film page buttons functional (upload, upload zone, empty state, edit, options/delete)
- [ ] Coach "Message Athlete" navigates to /messages
- [ ] Coach "Remove from Roster" deletes shortlist entry
- [ ] Message attachment opens file picker
- [ ] Document filter toggles category filter
- [ ] Document share copies URL to clipboard
- [ ] Analytics export downloads CSV
- [ ] Visit scheduling opens modal and creates visit
- [ ] Compare export downloads CSV
- [ ] Sidebar "Add Athlete" navigates to pipeline
- [ ] tsc passes, lint passes, tests pass, build passes
- [ ] 14/14 dead elements fixed (0 Critical, 0 High remaining)
