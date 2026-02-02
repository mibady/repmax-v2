# PRP Section 10: UI/UX Requirements Template

Copy this template into your PRP Section 10. Complete all subsections before implementation.

---

## 10.1 User Journeys (JTBD)

For each major feature, define the Job to Be Done:

| Feature     | JTBD Statement                                          |
| ----------- | ------------------------------------------------------- |
| [Feature 1] | The [user type] wants to [action] so they can [outcome] |
| [Feature 2] | The [user type] wants to [action] so they can [outcome] |
| [Feature 3] | The [user type] wants to [action] so they can [outcome] |

### Journey Maps

For each feature, map Entry → Action → Exit:

#### [Feature 1] Journey

**Entry:**

- Source: [Where they came from]
- Mental state: [Rushed/Exploring/Frustrated/Confident]
- Expectation: [What they think they'll see]
- Pre-filled data: [What we already know]

**Action:**

- Primary action: [The ONE thing]
- Required decisions: [List each choice point]
- Defaults we can set: [Smart defaults]
- Feedback needed: [Loading/progress/validation]

**Exit:**

- Success indicator: [How they know it worked]
- Next step: [Where we guide them]
- Undo option: [How to reverse]
- Persisted state: [What we save]

---

## 10.2 Visual System Decisions

### Color Tokens

| Token                  | Usage                  | Value       |
| ---------------------- | ---------------------- | ----------- |
| `--primary`            | Primary buttons, links | [hsl value] |
| `--primary-foreground` | Text on primary        | [hsl value] |
| `--secondary`          | Secondary elements     | [hsl value] |
| `--muted`              | Muted backgrounds      | [hsl value] |
| `--muted-foreground`   | Secondary text         | [hsl value] |
| `--destructive`        | Error, delete actions  | [hsl value] |
| `--border`             | All borders            | [hsl value] |
| `--ring`               | Focus rings            | [hsl value] |

### Spacing Scale

- Base unit: 4px
- Standard spacing: p-4 (16px), p-6 (24px), p-8 (32px)
- Gap scale: gap-2, gap-4, gap-6
- Section spacing: py-12, py-16, py-24

### Typography

- Font family: [Inter / Geist Sans / System]
- Headings: font-bold tracking-tight
- Body: font-normal leading-relaxed
- Code: font-mono

### Border Radius

- Small: rounded (4px)
- Default: rounded-lg (8px)
- Large: rounded-xl (12px)
- Full: rounded-full

---

## 10.3 Component Hierarchy

### Button Emphasis Levels

| Level       | Variant                 | Usage                   | Example          |
| ----------- | ----------------------- | ----------------------- | ---------------- |
| Primary     | `variant="default"`     | Main CTA, 1 per section | "Save Changes"   |
| Secondary   | `variant="secondary"`   | Alternative actions     | "Cancel"         |
| Ghost       | `variant="ghost"`       | Tertiary, navigation    | "Learn more"     |
| Destructive | `variant="destructive"` | Delete, dangerous       | "Delete Account" |
| Outline     | `variant="outline"`     | Low emphasis            | "Filter"         |

### Component Mapping

| UI Pattern  | shadcn/ui Component | Tailwind Alternative        |
| ----------- | ------------------- | --------------------------- |
| Modal       | Dialog              | -                           |
| Dropdown    | DropdownMenu        | -                           |
| Form inputs | Input + Label       | Direct Tailwind             |
| Cards       | Card                | `bg-card border rounded-xl` |
| Buttons     | Button              | Direct Tailwind             |
| Tables      | Table               | Direct Tailwind             |

---

## 10.4 Component States

For each interactive component, define all states:

### Buttons

| State    | Visual Change                        |
| -------- | ------------------------------------ |
| Default  | `bg-primary text-primary-foreground` |
| Hover    | `hover:bg-primary/90`                |
| Focus    | `focus:ring-2 focus:ring-ring`       |
| Active   | `active:scale-[0.98]`                |
| Disabled | `opacity-50 cursor-not-allowed`      |
| Loading  | Spinner icon, disabled               |

### Inputs

| State    | Visual Change                            |
| -------- | ---------------------------------------- |
| Default  | `border-input bg-background`             |
| Focus    | `border-primary ring-1 ring-ring`        |
| Error    | `border-destructive` + error message     |
| Disabled | `opacity-50 bg-muted cursor-not-allowed` |
| Filled   | Normal styling                           |

### Cards (Interactive)

| State    | Visual Change                             |
| -------- | ----------------------------------------- |
| Default  | `bg-card border-border`                   |
| Hover    | `hover:border-primary/50 hover:shadow-md` |
| Selected | `border-primary ring-1 ring-primary`      |

---

## 10.5 Screen States

For each screen, define all states:

### [Screen Name] States

| State   | Trigger               | User Sees                             | User Can Do       |
| ------- | --------------------- | ------------------------------------- | ----------------- |
| Empty   | No [items] exist      | Empty illustration, "Get started" CTA | Create first item |
| Loading | Initial load          | Skeleton of content                   | Wait              |
| Partial | Some data missing     | Content + inline prompts              | Complete profile  |
| Ideal   | All data loaded       | Primary UI                            | All actions       |
| Error   | API/validation failed | Error message + retry                 | Retry, go back    |
| Offline | No connection         | Cached data + banner                  | Retry when online |

### Required States Per Screen

| Screen     | Empty | Loading | Error | Ideal | Offline |
| ---------- | ----- | ------- | ----- | ----- | ------- |
| Dashboard  | ✓     | ✓       | ✓     | ✓     | -       |
| Settings   | -     | ✓       | ✓     | ✓     | -       |
| [Screen 3] | ✓     | ✓       | ✓     | ✓     | ✓       |

---

## 10.6 Form UX (if applicable)

### Validation Strategy

| Timing    | When               | Example             |
| --------- | ------------------ | ------------------- |
| On blur   | Field loses focus  | Email format check  |
| On submit | Form submitted     | All required fields |
| Real-time | Special cases only | Password strength   |

### Error Display

| Location             | Usage                            |
| -------------------- | -------------------------------- |
| Inline (below field) | Field-specific errors            |
| Toast                | Success confirmations            |
| Banner (top)         | Form-level errors                |
| Modal                | Critical errors requiring action |

### Form Patterns

- [ ] Multi-step forms use progress indicator
- [ ] Required fields marked with asterisk
- [ ] Placeholder text is NOT the label
- [ ] Submit button always visible (not behind scroll)
- [ ] Form preserves input on error

---

## 10.7 AI/Chat UX (if applicable)

### Streaming Response

| State             | Visual                           |
| ----------------- | -------------------------------- |
| User sent message | Message appears in chat          |
| AI thinking       | Typing indicator / "Thinking..." |
| AI streaming      | Text appears progressively       |
| AI complete       | Full response, actions enabled   |
| AI error          | Error message + retry button     |

### Tool Use Transparency

- [ ] Show when AI is using tools
- [ ] Indicate what tool is being called
- [ ] Show results of tool calls
- [ ] Allow cancellation of long operations

### Latency Handling

- [ ] Show typing indicator immediately (<100ms)
- [ ] Progressive reveal of streamed content
- [ ] Graceful timeout with retry option
- [ ] Don't lock input during response

---

## 10.8 Navigation & Wayfinding

### Primary Navigation

| Item      | Route        | Icon              | Badge     |
| --------- | ------------ | ----------------- | --------- |
| Dashboard | `/dashboard` | `LayoutDashboard` | -         |
| [Feature] | `/[feature]` | `[Icon]`          | `{count}` |
| Settings  | `/settings`  | `Settings`        | -         |

### Breadcrumbs

| Page           | Breadcrumb                     |
| -------------- | ------------------------------ |
| Dashboard      | Home                           |
| Feature Detail | Home > [Feature] > [Item Name] |
| Settings       | Home > Settings                |

### Mobile Navigation

- [ ] Bottom tab bar for primary nav
- [ ] Hamburger menu for secondary
- [ ] Swipe gestures documented
- [ ] Back button behavior defined

---

## 10.9 Error Handling & Recovery

### Error Message Template

```
[What went wrong] — human-readable, not technical
[Why it might have happened] — brief context
[What to do next] — clear action

Example:
"Couldn't save your changes"
"The server didn't respond in time."
[Retry] [Go back]
```

### Error Recovery Paths

| Error Type       | Recovery Options                    |
| ---------------- | ----------------------------------- |
| Network timeout  | Retry button, cached state          |
| Validation error | Inline correction, preserve input   |
| Auth expired     | Re-login modal, preserve navigation |
| Server error     | Retry, support contact              |
| Not found        | Back button, search suggestion      |

### Never Do

- [ ] Show raw error codes to users
- [ ] Lose user input on error
- [ ] Dead-end error states (no action possible)
- [ ] Silent failures

---

## 10.10 UX Decisions Checklist

Complete before implementation:

### Visual Design

- [ ] Colors defined and using tokens (not hardcoded hex)
- [ ] Spacing using Tailwind scale (p-4, gap-6)
- [ ] Typography hierarchy clear (h1 > h2 > body)
- [ ] Border radius consistent across components
- [ ] Shadows used sparingly and consistently

### Interaction Design

- [ ] Button hierarchy clear (1 primary CTA per section)
- [ ] All button states defined (hover, focus, active, disabled)
- [ ] Form validation timing decided
- [ ] Error messages have recovery paths
- [ ] Success states provide confirmation

### States

- [ ] All screen states designed (empty, loading, error, ideal)
- [ ] Loading uses skeletons, not spinners
- [ ] Empty states have clear CTA
- [ ] Error states have retry option

### Accessibility

- [ ] Focus indicators visible
- [ ] Color contrast WCAG AA
- [ ] Form labels (not just placeholders)
- [ ] Touch targets ≥44px (mobile)

### Responsive

- [ ] Mobile layout defined
- [ ] Tablet layout defined (if different)
- [ ] Breakpoints documented
- [ ] Touch vs mouse interactions

---

## Verification

This section is complete when:

- [ ] All 10 subsections filled
- [ ] No "TBD" or placeholder text
- [ ] All features have JTBD statements
- [ ] All screens have state definitions
- [ ] Ready for `face-layer` implementation
