---
name: ralph-wiggum
description: AI loop automation for iterative development tasks. Use for test fixing, overnight builds, and phase automation.
---

# Ralph Wiggum - AI Loop Automation

Automate repetitive development through persistent iteration loops.

## When to Use

- Fixing multiple test failures iteratively
- Resolving lint/type errors across codebase
- Implementing features phase-by-phase overnight
- Any task with automatic verification (tests, linters, build)

**See Also:** For cloud sandbox execution, see `skills/07-tools/sandbox-runner/SKILL.md`.

## Installation

```bash
/plugin install ralph-loop@claude-plugins-official
```

## Core Command

```bash
/ralph-loop:ralph-loop "<prompt>" [options]
```

### Options

| Option                          | Purpose            | Example                                 |
| ------------------------------- | ------------------ | --------------------------------------- |
| `--max-iterations <n>`          | Safety limit       | `--max-iterations 30`                   |
| `--completion-promise "<text>"` | Completion trigger | `--completion-promise "ALL TESTS PASS"` |

### Additional Commands

- `/ralph-loop:cancel-ralph` — Stop active loop
- `/ralph-loop:help` — Show help

## Prompt Templates

### Test Fixer Loop

```
Run the test suite. If any tests fail:
1. Read the failing test file
2. Read the implementation file
3. Fix the issue
4. Run tests again

When all tests pass, output: ALL TESTS PASS
```

**Usage:**

```bash
/ralph-loop:ralph-loop "Run npm test. If tests fail, read the error, fix the code, run again. When all pass, say ALL TESTS PASS" --max-iterations 20 --completion-promise "ALL TESTS PASS"
```

### Lint/Type Error Resolver

```
Run the linter/type checker. If errors exist:
1. Read the error message
2. Go to the file and line
3. Fix the issue
4. Run linter again

When no errors remain, output: ZERO ERRORS
```

**Usage:**

```bash
/ralph-loop:ralph-loop "Run npm run lint. If errors, fix them one by one. When clean, say ZERO ERRORS" --max-iterations 50 --completion-promise "ZERO ERRORS"
```

### Build Error Fixer

```
Run the build. If it fails:
1. Read the build error
2. Identify the root cause
3. Fix the issue
4. Run build again

When build succeeds, output: BUILD SUCCESS
```

**Usage:**

```bash
/ralph-loop:ralph-loop "Run npm run build. Fix any errors. When successful, say BUILD SUCCESS" --max-iterations 15 --completion-promise "BUILD SUCCESS"
```

### CodeRabbit Review Fixer

```
Run CodeRabbit review on staged changes. If blockers found:
1. Read the blocker issue details
2. Go to the file and line mentioned
3. Fix the issue according to CodeRabbit's suggestion
4. Re-run the review

When 0 blockers remain, output: CODERABBIT PASSED
```

**Usage (staged changes):**

```bash
/ralph-loop:ralph-loop "Run coderabbit review --staged --plain.
If blockers or critical issues found:
1. Read the file mentioned
2. Fix the issue
3. Re-run review

When no blockers, say CODERABBIT PASSED" --max-iterations 15 --completion-promise "CODERABBIT PASSED"
```

**Usage (full branch review):**

```bash
/ralph-loop:ralph-loop "Run coderabbit review --base main --plain.
For each blocker:
1. Read the affected file
2. Apply the suggested fix
3. Re-run review

When no blockers remain, say CODERABBIT PASSED" --max-iterations 20 --completion-promise "CODERABBIT PASSED"
```

**Iteration Limits:**
| Scope | Recommended Max |
|-------|-----------------|
| Staged changes (few files) | 10-15 |
| Full branch review | 20-30 |
| Security-focused review | 15-20 |

### Phase Implementation Loop

```
You are implementing Phase {N}: {Phase Name}.

Pages to implement: {list}

For each page:
1. Generate Stitch prompt using design system
2. Create component file
3. Wire up data fetching
4. Run tests for this page

After all pages complete, output: PHASE {N} COMPLETE
```

**Usage:**

```bash
/ralph-loop:ralph-loop "Implement Phase 3: App Shell. Create sidebar, header, main layout. Test each. Say PHASE 3 COMPLETE when done" --max-iterations 25 --completion-promise "PHASE 3 COMPLETE"
```

### Milestone Commit Loop

```
Implement the current milestone tasks:
1. Read the milestone requirements
2. Implement each task
3. Run quality gates (tests, lint, build)
4. If gates fail, fix issues
5. When all gates pass, create commit

Output: M{N} COMMITTED when complete
```

### Stitch Integration Loop (Enhanced)

Automate converting Google Stitch HTML exports to React components **with verified backend wiring**.

**Prerequisites:**

- Stitch exports saved to `stitch-exports/[phase]/[page-name]/code.html`
- Integration-ready scaffold complete (Stage 3)
- HANDOFF-CHECKLIST.md with Integration Verification Matrix

**Full Project Integration (with verification):**

```bash
/ralph-loop:ralph-loop "Integrate all Stitch exports with backend verification.

For each HTML file in stitch-exports/:

PHASE 1: Convert HTML to React
1. Read the Stitch HTML
2. Convert: class→className, img→Image, a→Link
3. Add 'use client' for interactive components
4. SVG attributes to camelCase

PHASE 2: Verify Integration (CRITICAL)
5. Read HANDOFF-CHECKLIST.md Integration Verification Matrix
6. Find this page's expected hooks and actions
7. Verify component imports those hooks
8. If using hardcoded data (SAMPLE_*, mock*), replace with hook calls
9. If buttons have no handlers, wire to actions
10. Check forms use server actions

PHASE 3: Validate
11. Run: npx tsc --noEmit
12. Fix type errors before next file

Say STITCH INTEGRATION COMPLETE when all pages pass TypeScript AND verification" --max-iterations 75 --completion-promise "STITCH INTEGRATION COMPLETE"
```

**Single Page Integration:**

```bash
/ralph-loop:ralph-loop "Integrate stitch-exports/phase-1/landing/code.html

1. Read the HTML file
2. Read placeholder: app/(marketing)/page.tsx
3. Convert: class→className, img→Image, a→Link
4. Add 'use client' if interactive
5. Wire up from INTEGRATION POINTS comments
6. Replace placeholder
7. Run: npx tsc --noEmit and fix errors

Say PAGE INTEGRATED when TypeScript passes" --max-iterations 15 --completion-promise "PAGE INTEGRATED"
```

**Iteration Limits:**
| Scope | Recommended Max |
|-------|-----------------|
| Single page conversion | 15 |
| Single page audit | 10 |
| Full project conversion | 50-75 |
| Full project audit | 30 |

### Integration Audit Loop

**Purpose:** Verify all converted pages properly connect to backend (Stage 7.5).

> Use after Stitch conversion to catch disconnected UI before quality gates.

**Full Project Audit:**

```bash
/ralph-loop:ralph-loop "Audit all pages for backend integration gaps.

For each page in src/app/(app)/ and src/app/(auth)/:
1. Read the component
2. List all data displayed → must come from hook, not const
3. List all buttons → must have onClick with action
4. List all forms → must use server action
5. If gap found: fix it
6. Run: npx tsc --noEmit
7. Continue to next page

Common fixes:
- SAMPLE_ALERTS → useAlerts()
- Hardcoded bets → useBets()
- No save handler → create usePreferences mutation
- OAuth button no-op → signInWithGoogle()

Say INTEGRATION AUDIT COMPLETE when all pages verified" --max-iterations 30 --completion-promise "INTEGRATION AUDIT COMPLETE"
```

**Single Page Audit:**

```bash
/ralph-loop:ralph-loop "Audit settings page for backend integration.

1. Read src/app/(app)/settings/page.tsx
2. List all data displayed on page
3. For each data item: verify it comes from a hook (not const)
4. List all buttons (Save, Cancel, etc.)
5. For each button: verify onClick calls action/mutation
6. If using hardcoded data, replace with hook
7. If button has no handler, wire to action
8. Run: npx tsc --noEmit

Say SETTINGS VERIFIED when complete" --max-iterations 10 --completion-promise "SETTINGS VERIFIED"
```

**Common Fixes Reference:**

| Symptom                              | Fix                                                          |
| ------------------------------------ | ------------------------------------------------------------ |
| `const SAMPLE_ALERTS = [...]`        | `const { data: alerts } = useAlerts()`                       |
| `<button>Save</button>` (no handler) | `<button onClick={() => savePreferences(...)}>Save</button>` |
| `signInWithGoogle` not called        | `<button onClick={() => signInWithGoogle()}>`                |
| Settings don't persist               | Create `usePreferences()` hook with mutation                 |

### Stitch Reconciliation Loop (Stage 6.5)

**Purpose:** Verify Stitch HTML output can integrate with scaffold before conversion.

> Use after Stage 6 (Stitch UI Build) to identify gaps between Stitch output and scaffold expectations.

**Full Project Reconciliation:**

```bash
/ralph-loop:ralph-loop "Reconcile Stitch output with scaffold.

For each HTML file in stitch-exports/:
1. Parse HTML for data displays (stats, numbers, lists)
2. Parse HTML for forms (input fields, submit buttons)
3. Parse HTML for buttons (CTAs, action buttons)
4. Read docs/HANDOFF-CHECKLIST.md Integration Matrix
5. For each data display:
   - Find matching hook in scaffold (hooks/)
   - If missing, add to 'Missing Hooks' list
6. For each form:
   - Find matching server action (lib/actions/)
   - If missing, add to 'Missing Actions' list
7. For each button:
   - Determine expected handler
   - If navigation, note route
   - If action, note handler name
8. Generate reconciliation report section for this page

After all pages analyzed:
- Output full reconciliation report
- List all missing hooks to create
- List all missing actions to create
- List hardcoded data needing decisions

Say RECONCILIATION COMPLETE when all pages analyzed" --max-iterations 25 --completion-promise "RECONCILIATION COMPLETE"
```

**Single Page Reconciliation:**

```bash
/ralph-loop:ralph-loop "Reconcile stitch-exports/landing/code.html with scaffold.

1. Read the HTML file
2. Read docs/HANDOFF-CHECKLIST.md
3. Parse HTML for:
   - Data displays (stats, lists, tables)
   - Forms (fields, submit buttons)
   - Buttons (CTAs, action triggers)
   - Navigation links
4. For each element found:
   - Match to expected hook/action from HANDOFF
   - Determine status (exists, missing, hardcoded)
5. Generate reconciliation report with:
   - Data Display mappings
   - Form mappings
   - Button mappings
   - Conversion checklist
6. Save to docs/STITCH-RECONCILIATION-REPORT.md

Say PAGE RECONCILED when complete" --max-iterations 10 --completion-promise "PAGE RECONCILED"
```

**Reconciliation Report Structure:**

```markdown
# Stitch Reconciliation Report

## Page: [Name] ([path])

### Data Displays

| Element | Value | Hook Needed | Status |
| ------- | ----- | ----------- | ------ |

### Forms

| Form | Fields | Action Needed | Status |
| ---- | ------ | ------------- | ------ |

### Buttons

| Button | Text | Handler Needed | Status |
| ------ | ---- | -------------- | ------ |

### Conversion Checklist

- [ ] Create missing hooks
- [ ] Create missing actions
- [ ] Wire buttons to handlers
- [ ] Convert CDN Tailwind
```

**Iteration Limits:**
| Scope | Recommended Max |
|-------|-----------------|
| Single page reconciliation | 10 |
| Full project reconciliation | 20-25 |
| Reconciliation + creation | 40 |

## Safety Guidelines

### Iteration Limits

| Task Type            | Recommended Max |
| -------------------- | --------------- |
| Test fixing          | 20-30           |
| Lint errors          | 50-100          |
| Build errors         | 10-15           |
| Phase implementation | 25-40           |
| Full milestone       | 50-75           |

### When NOT to Use

- Tasks requiring human judgment or approval
- Ambiguous requirements
- Security-sensitive changes
- Production deployments
- Tasks without automatic verification

### Emergency Stop

If a loop goes wrong:

```bash
/ralph-loop:cancel-ralph
```

## Best Practices

### 1. Clear Completion Criteria

Bad: "Fix the bugs"
Good: "When all tests pass, output: ALL TESTS PASS"

### 2. Incremental Goals

Bad: "Implement the entire feature"
Good: "Implement one component at a time, test each"

### 3. Self-Correction Patterns

Include in prompts:

- "If X fails, do Y"
- "Read the error before fixing"
- "Verify before moving on"

### 4. Logging and Observability

- Run in terminal you can monitor
- Check progress periodically
- Review changes before committing

## Integration with Quality Gates

Ralph loops work best with quality gates:

```
1. Implement code
2. Run quality gates
3. If fail → fix with Ralph loop
4. If pass → commit
```

## Checklist

- [ ] Plugin installed
- [ ] Completion promise defined
- [ ] Max iterations set appropriately
- [ ] Verification method exists (tests/lint/build)
- [ ] Emergency stop ready
- [ ] Monitoring terminal visible
