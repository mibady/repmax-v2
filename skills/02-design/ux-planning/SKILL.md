---
name: ux-planning
description: User journey and UX planning for feature development. Use before any FACE layer work to define user flows, friction points, and success states. Bridges gap between "what does it do" and "how does it feel."
---

# UX Planning

Pre-code planning layer that sits between PRPs and implementation. Ensures every feature is designed around user outcomes, not just technical requirements.

## When to Use

- Before starting any new feature or screen
- When a feature "works" but feels clunky
- Adding to PRP Section 10 (UI/UX Requirements)
- Reviewing existing flows for improvement
- Onboarding new team members to a feature

## Core Principle

**One sentence before any feature:**

> "The user wants to **\_** so they can **\_**."

This is the "Job to Be Done" (JTBD). If you can't fill this in clearly, you don't understand the feature yet.

---

## User Journey Map (3-Part Structure)

Every user flow has three phases. Map these before writing code:

### 1. ENTRY — How do they get here?

| Question                      | Why It Matters                 |
| ----------------------------- | ------------------------------ |
| Where did they come from?     | Sets expectations              |
| What's their mental state?    | Rushed? Exploring? Frustrated? |
| What do they expect to see?   | Avoid surprise/confusion       |
| What data do we already have? | Pre-fill, personalize          |

### 2. ACTION — What's the minimum path to success?

| Question                              | Why It Matters                |
| ------------------------------------- | ----------------------------- |
| What's the ONE thing they need to do? | Focus the UI                  |
| What decisions are we forcing?        | Each decision = friction      |
| What can we automate or default?      | Reduce cognitive load         |
| What feedback do they need during?    | Loading, progress, validation |

### 3. EXIT — Where do they go next?

| Question                        | Why It Matters          |
| ------------------------------- | ----------------------- |
| What confirms success?          | User needs closure      |
| What's the natural next action? | Guide, don't strand     |
| What if they want to undo?      | Safety net builds trust |
| What do we persist?             | Don't lose their work   |

---

## Journey Template

```markdown
## Feature: [Name]

### JTBD

The [user type] wants to [action] so they can [outcome].

### Entry

- **Source:** [Where they came from]
- **Mental state:** [Rushed/Exploring/Frustrated/Confident]
- **Expectation:** [What they think they'll see]
- **Pre-filled data:** [What we already know]

### Action

- **Primary action:** [The ONE thing]
- **Required decisions:** [List each choice point]
- **Defaults we can set:** [Smart defaults]
- **Feedback needed:** [Loading/progress/validation]

### Exit

- **Success indicator:** [How they know it worked]
- **Next step:** [Where we guide them]
- **Undo option:** [How to reverse]
- **Persisted state:** [What we save]

### Edge Cases

- [ ] Empty state (first use)
- [ ] Error state (what went wrong)
- [ ] Partial state (incomplete data)
- [ ] Overload state (too much data)
```

---

## Friction Audit

Run this checklist on any flow BEFORE implementation:

### Quantitative Friction

- [ ] **Clicks to complete:** Target < 3 for common actions
- [ ] **Form fields:** Can any be removed or auto-filled?
- [ ] **Page loads:** Can we avoid full reloads?
- [ ] **Time to complete:** Estimate realistic duration

### Cognitive Friction

- [ ] **Decisions forced:** Each decision = drop-off risk
- [ ] **Jargon used:** Would a new user understand?
- [ ] **Information density:** Can they scan it in 3 seconds?
- [ ] **Memory required:** Do they need to remember previous steps?

### Error Friction

- [ ] **What can go wrong?** List every failure mode
- [ ] **How do we communicate it?** Inline vs toast vs modal
- [ ] **Can they recover?** Path back to success
- [ ] **Do we lose their data?** Never lose user input

### Trust Friction

- [ ] **Is this reversible?** Clearly communicate
- [ ] **What are we asking for?** Justify sensitive data
- [ ] **What happens next?** No surprises
- [ ] **Who can see this?** Privacy clarity

---

## State Inventory

Every screen has multiple states. Design ALL of them:

| State        | Description       | Design Needed       |
| ------------ | ----------------- | ------------------- |
| **Empty**    | No data yet       | Onboarding, CTA     |
| **Loading**  | Fetching data     | Skeleton, spinner   |
| **Partial**  | Some data missing | Inline prompts      |
| **Ideal**    | Happy path        | Primary design      |
| **Overload** | Too much data     | Pagination, filters |
| **Error**    | Something failed  | Recovery path       |
| **Success**  | Action completed  | Confirmation        |
| **Offline**  | No connection     | Cached state, retry |

### State Template

```markdown
## Screen: [Name]

| State   | Trigger                 | User Sees          | User Can Do  |
| ------- | ----------------------- | ------------------ | ------------ |
| Empty   | No [items] exist        | [Description]      | [CTA]        |
| Loading | Fetching [items]        | [Skeleton/spinner] | Wait         |
| Ideal   | [Items] loaded          | [Primary UI]       | [Actions]    |
| Error   | [API/validation] failed | [Message]          | [Retry/edit] |
```

---

## Integration with 3-Layer Architecture

### Where UX Lives in Your Stack

```
PRP (defines WHAT)
    ↓
UX Planning (defines HOW IT FEELS) ← This skill
    ↓
┌─────────────────────────────────────┐
│ FACE Layer                          │
│ - Implements journeys as components │
│ - Handles all states                │
│ - Manages feedback/loading          │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ HEAD Layer                          │
│ - AI responses need UX too          │
│ - Streaming feedback                │
│ - Error recovery                    │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ DNA Layer                           │
│ - API error messages (user-facing)  │
│ - Validation (helpful, not hostile) │
│ - Optimistic updates support        │
└─────────────────────────────────────┘
```

### UX Considerations by Layer

**FACE:**

- Component loading states
- Form validation (inline, immediate)
- Optimistic UI updates
- Animation/transitions
- Responsive behavior

**HEAD (AI Features):**

- Streaming response indicators
- Confidence/uncertainty communication
- Graceful degradation
- Response latency handling
- Tool use transparency

**DNA:**

- Error messages (human-readable)
- Validation feedback (helpful specifics)
- Rate limit messaging
- Partial success handling

---

## Quick UX Patterns

### Forms

```
DO:
- Inline validation (on blur, not keystroke)
- Smart defaults
- Clear labels (not placeholders as labels)
- Visible submit button
- Progress for multi-step

DON'T:
- Validate on every keystroke
- Reset form on error
- Hide submit behind scroll
- Use unclear error messages
```

### Lists & Tables

```
DO:
- Empty state with CTA
- Loading skeletons (not spinners)
- Inline actions (not menus for common tasks)
- Bulk actions for power users
- Search/filter for > 10 items

DON'T:
- Show raw IDs
- Paginate at < 20 items
- Hide important columns
- Force scroll for primary actions
```

### Modals & Dialogs

```
DO:
- Use for confirmations
- Use for focused tasks
- Clear escape path
- Preserve underlying context

DON'T:
- Modal within modal
- Critical workflows in modals
- Force modal for simple actions
- Block entire app for non-critical
```

### AI/Chat Interfaces

```
DO:
- Show typing/thinking indicator
- Stream responses when possible
- Provide suggested prompts
- Make copy/share easy
- Show confidence when relevant

DON'T:
- Silent loading (looks broken)
- Dump wall of text at once
- Hide response latency
- Lock input during response
```

---

## Workflow: Adding UX to Your Process

### 1. During PRP Creation (5 min)

Add to Section 10:

- JTBD statement for each major feature
- Primary user journey (Entry → Action → Exit)
- Known edge cases

### 2. Before Implementation (10 min)

For each feature:

- Fill out Journey Template
- Run Friction Audit checklist
- List all states needed

### 3. During Review (5 min)

Ask:

- Does empty state guide users?
- Are errors recoverable?
- Is success clear?
- Would I use this?

---

## Common UX Debt Patterns

Watch for these in existing code:

| Symptom                      | Root Cause               | Fix                    |
| ---------------------------- | ------------------------ | ---------------------- |
| Users confused on first use  | Missing empty state      | Add onboarding         |
| Support tickets about errors | Unclear error messages   | Humanize copy          |
| Users abandoning forms       | Too many required fields | Reduce/default         |
| Users not finding features   | Hidden in menus          | Surface common actions |
| Users asking "did it work?"  | No success feedback      | Add confirmation       |
| Users lose data on error     | Form resets              | Preserve input         |

---

## Integration with AI Coder Framework

### Upstream (feeds into ux-planning)

| Skill        | Integration Point                                  |
| ------------ | -------------------------------------------------- |
| `meta-tools` | PRP defines features; ux-planning fills Section 10 |

### Downstream (ux-planning feeds into)

| Skill                     | Integration Point                                         |
| ------------------------- | --------------------------------------------------------- |
| `face-layer`              | Next.js implementation — reads Section 10 before building |
| `vite-frontend`           | Vite SPA implementation — same pre-flight check           |
| `expo-supabase`           | Mobile implementation — plus platform-specific states     |
| `telegram-ui`             | Telegram Mini App — HapticFeedback, MainButton states     |
| `discord-ui`              | Discord Activity — participant, voice channel states      |
| `chatgpt-ui`              | ChatGPT Canvas — artifact, tool execution states          |
| `google-stitch-prompts-*` | Design-to-code needs state requirements from ux-planning  |

### Verification

| Skill           | What It Validates                                   |
| --------------- | --------------------------------------------------- |
| `feature-audit` | Verifies Section 10.5 screen states are implemented |
| `quality-gates` | Includes UX checklist (Section 10.10) before merge  |

### Workflow Position

```
meta-tools (PRP) → ux-planning (Section 10) → face-layer/vite/expo → feature-audit → quality-gates
```

### Reference Files

| File                            | Purpose                                                            |
| ------------------------------- | ------------------------------------------------------------------ |
| `references/PRP-UX-SECTION.md`  | Full Section 10 template for PRPs                                  |
| `references/PLATFORM-STATES.md` | Platform-specific states (web, mobile, Telegram, Discord, ChatGPT) |
| `references/WORKED-EXAMPLE.md`  | Complete worked example                                            |
| `references/QUICK-REF.md`       | One-page quick reference                                           |

---

## Checklist: Feature UX Ready

Before marking any feature complete:

- [ ] JTBD is clear and documented
- [ ] Journey mapped (Entry → Action → Exit)
- [ ] All states designed (empty, loading, error, success)
- [ ] Friction audit passed
- [ ] Error messages are helpful
- [ ] Success state confirms completion
- [ ] Mobile/responsive considered
- [ ] Accessibility basics (focus, labels, contrast)
