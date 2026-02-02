---
name: quality-gates
description: Testing, code review, debugging, and git workflows with mandatory checkpoints.
---

# Quality Gates

Mandatory checkpoints between development phases.

## When to Use

- After completing a development phase
- Before merging pull requests
- Before production deployment
- When debugging issues
- Before pattern evolution (03→04→05)

## Reference Docs

| Topic               | File                                | Use When                                 |
| ------------------- | ----------------------------------- | ---------------------------------------- |
| Agent Browser Setup | `references/agent-browser-setup.md` | Setting up E2E testing from scratch      |
| E2E Auth Setup      | `references/e2e-auth-setup.md`      | Setting up authenticated E2E tests       |
| Test Patterns       | `references/test-patterns.md`       | Writing auth, CRUD, form, modal tests    |
| CI/CD Gates         | `references/ci-cd-gates.md`         | Configuring GitHub Actions, Vercel gates |

## Stack

| Component    | Technology                 |
| ------------ | -------------------------- |
| Unit Testing | Vitest + Testing Library   |
| E2E Testing  | Playwright / Agent Browser |
| Code Review  | CodeRabbit                 |
| Linting      | ESLint + Prettier          |
| Git Hooks    | Husky + lint-staged        |
| Sandbox Exec | E2B (sandbox-runner)       |

## Rules

| Rule                | Threshold                   | Enforcement       |
| ------------------- | --------------------------- | ----------------- |
| Feature audit       | 0 critical, ≥95% functional | Blocks production |
| Test coverage       | 70% minimum                 | CI blocks merge   |
| Files per commit    | 15 max                      | Pre-commit hook   |
| CodeRabbit blockers | 0                           | PR blocks merge   |
| Build               | Must pass                   | CI blocks merge   |
| Lint                | Must pass                   | Pre-commit hook   |

---

## When to Run Gates

### After Every Phase

```
Phase 1 → [GATE] → Commit
Phase 2 → [GATE] → Commit
Phase 3 → [GATE] → Commit
...
```

### Before Pattern Evolution

```
Pattern 03 → [GATE] → Pattern 04
Pattern 04 → [GATE] → Pattern 05
```

### At File Thresholds

| Files Changed | Action               |
| ------------- | -------------------- |
| 10            | Consider review soon |
| 15            | MANDATORY review     |
| 20+           | STOP - split changes |

---

## Testing

### Setup (Vitest + Testing Library)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "*.config.*"],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
  },
});

// vitest.setup.ts
import "@testing-library/jest-dom/vitest";
```

### Unit Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('submits with valid data', async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('shows validation errors', async () => {
    render(<LoginForm onSubmit={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)

```bash
npm install -D @playwright/test
npx playwright install
```

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});

// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test("login flow", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[type="email"]', "user@example.com");
  await page.fill('input[type="password"]', "password123");
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL("/dashboard");
  await expect(page.locator("text=Welcome")).toBeVisible();
});
```

### Run Tests

```bash
npm test                    # Unit tests
npm run test:coverage       # With coverage
npm run test:e2e            # E2E tests
```

---

## Code Review (CodeRabbit)

### Configuration

```yaml
# .coderabbit.yaml
language: "en-US"
tone_instructions: "Be constructive and helpful"
reviews:
  request_changes_workflow: true
  high_level_summary: true
  poem: false
  review_status: true
  auto_review:
    enabled: true
    drafts: false
chat:
  auto_reply: true
```

### Severity Levels

| Level      | Action     | Example                |
| ---------- | ---------- | ---------------------- |
| Blocker    | Must fix   | Security vulnerability |
| Critical   | Should fix | Memory leak            |
| Major      | Likely fix | Missing error handling |
| Minor      | Consider   | Code style             |
| Suggestion | Optional   | Performance hint       |

### Review Focus Areas

- Security vulnerabilities
- TypeScript type safety (no `any`)
- Error handling
- Async/await patterns
- Memory management
- API input validation

---

## CodeRabbit CLI Integration

The "Better Together" workflow: Claude writes code, runs CodeRabbit CLI to review its own work, and automatically fixes issues before commits.

### Installation

```bash
curl -fsSL https://cli.coderabbit.ai/install.sh | sh
```

Verify installation:

```bash
coderabbit --version
```

### npm Scripts

```bash
npm run review           # Review uncommitted changes
npm run review:staged    # Review staged changes (pre-commit)
npm run review:branch    # Review branch against main
```

### Workflow Integration

1. **Pre-commit Hook** - Automatically reviews staged changes, blocks on blockers
2. **Checkpoint Hook** - Reviews after 5+ files modified (Claude Code hook)
3. **Ralph Loop** - Auto-fix loop for resolving review issues

### Pre-commit Behavior

| Issue Severity | Action                           |
| -------------- | -------------------------------- |
| Blocker        | ❌ Commit blocked                |
| Major          | ⚠️ Warning shown, commit allowed |
| Minor          | Commit allowed silently          |

### Self-Review Loop (Ralph Wiggum)

Fix all CodeRabbit issues automatically:

```bash
/ralph-loop:ralph-loop "Run coderabbit review --staged --plain.
If blockers found:
1. Read the file mentioned
2. Fix the issue
3. Re-run review

When no blockers, say CODERABBIT PASSED" --max-iterations 15 --completion-promise "CODERABBIT PASSED"
```

### Graceful Fallback

If CodeRabbit CLI is not installed:

- Pre-commit hook shows warning but continues
- Checkpoint hook is silently skipped
- Workflow logs skip message with install instructions

---

## Debugging

### Systematic Approach

```
1. REPRODUCE → Create minimal repro case
2. ISOLATE → Binary search to narrow scope
3. HYPOTHESIZE → Form specific theory
4. TEST → Verify hypothesis with logs/breakpoints
5. FIX → Implement and verify fix
6. PREVENT → Add test to prevent regression
```

### Console Debugging

```typescript
// Structured logging
console.log("[Component] State:", { count, isLoading });
console.group("API Call");
console.log("Request:", payload);
console.log("Response:", data);
console.groupEnd();

// Performance
console.time("expensive-operation");
await expensiveOperation();
console.timeEnd("expensive-operation");

// Stack trace
console.trace("How did we get here?");
```

### React DevTools

```typescript
// Name components for DevTools
export const MyComponent = memo(function MyComponent() {
  // ...
});

// Use displayName
MyComponent.displayName = "MyComponent";
```

### Network Debugging

```typescript
// Log all fetch requests
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  console.log("[Fetch]", args[0]);
  const response = await originalFetch(...args);
  console.log("[Response]", response.status);
  return response;
};
```

---

## Git Workflows

### Branch Strategy

```
main          → Production
├── develop   → Integration
├── feature/* → New features
├── fix/*     → Bug fixes
└── hotfix/*  → Production fixes
```

### Commit Convention

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore
Scope: component, api, auth, etc.
Subject: imperative, lowercase, no period
```

Examples:

```
feat(auth): add password reset flow
fix(api): handle rate limit errors
test(products): add unit tests for ProductCard
```

### Interactive Rebase

```bash
# Squash last 3 commits
git rebase -i HEAD~3

# In editor:
pick abc123 First commit
squash def456 Second commit
squash ghi789 Third commit
```

### Cherry Pick

```bash
git cherry-pick <commit-hash>
git cherry-pick <hash1> <hash2> <hash3>
```

### Bisect (Find Bug)

```bash
git bisect start
git bisect bad                 # Current is bad
git bisect good <commit-hash>  # Known good commit
# Git will checkout commits, test each:
git bisect good  # or git bisect bad
# Until found:
git bisect reset
```

### Reflog (Recovery)

```bash
git reflog                     # See all actions
git checkout HEAD@{5}          # Go to state 5 actions ago
git branch recovered HEAD@{5}  # Create branch from that state
```

---

## Pre-Commit Hooks (Husky)

### Setup

```bash
npm install -D husky lint-staged
npx husky init
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
npm test -- --run
```

### File Count Check

```bash
# .husky/pre-commit
FILE_COUNT=$(git diff --cached --name-only | wc -l)
if [ "$FILE_COUNT" -gt 15 ]; then
  echo "❌ Too many files ($FILE_COUNT). Max is 15."
  echo "Split your changes into smaller commits."
  exit 1
fi
```

---

## CI Pipeline

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test -- --coverage
      - run: npm run build

      - name: Coverage check
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 70" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 70%"
            exit 1
          fi
```

---

## Automated Fix Loops (Ralph Wiggum)

Use Ralph Wiggum loops for automated error resolution.

### Prerequisites

```bash
/plugin install ralph-loop@claude-plugins-official
```

### Test Fixer Loop

When tests fail after changes:

```bash
/ralph-loop:ralph-loop "Run npm test. Read failures, fix code, repeat. Say ALL TESTS PASS when done" --max-iterations 20 --completion-promise "ALL TESTS PASS"
```

### Lint/Type Fixer Loop

When lint or type errors exist:

```bash
/ralph-loop:ralph-loop "Run npm run lint && npm run typecheck. Fix errors one by one. Say ZERO ERRORS when clean" --max-iterations 50 --completion-promise "ZERO ERRORS"
```

### Build Fixer Loop

When build fails:

```bash
/ralph-loop:ralph-loop "Run npm run build. Fix errors. Say BUILD SUCCESS when done" --max-iterations 15 --completion-promise "BUILD SUCCESS"
```

### Full Quality Gate Loop

Run all gates and fix failures:

```bash
/ralph-loop:ralph-loop "Run npm test && npm run lint && npm run build. Fix any failures. Say GATES PASS when all succeed" --max-iterations 30 --completion-promise "GATES PASS"
```

### Safety Note

Always set reasonable `--max-iterations` limits. Monitor the first few iterations to ensure the loop is progressing correctly.

---

## UX Quality Gate (Pre-Merge)

Run the UX decisions checklist before merging any feature branch:

### UX Checklist

Reference: `ux-planning/references/UX-DECISIONS-CHECKLIST.md`

- [ ] **Colors match tokens** — No hardcoded hex values, using `bg-card`, `text-muted-foreground`, etc.
- [ ] **Spacing on grid** — Using Tailwind scale (p-4, gap-6), not arbitrary values
- [ ] **All button states work** — hover, focus, active, disabled
- [ ] **All screen states implemented** — empty, loading, error, ideal (per PRP Section 10.5)
- [ ] **Error messages have recovery path** — Retry button, support link, or clear next step
- [ ] **Contrast passes WCAG AA** — Text readable, focus indicators visible
- [ ] **Loading shows skeleton** — Not blank screen or only spinner

### Quick UX Audit Command

```bash
/audit --ux-states
```

Validates:

- Section 10.5 screen states exist
- Error states have recovery paths
- Loading states use skeletons

### UX Gate Failure

If UX gate fails:

1. Read `ux-planning/SKILL.md` for state design guidance
2. Check PRP Section 10.5 for required states
3. Implement missing states
4. Re-run audit

---

## Quality Checklist

Before every commit:

- [ ] Tests pass (`npm test`)
- [ ] Coverage ≥70% (`npm run test:coverage`)
- [ ] Lint passes (`npm run lint`)
- [ ] Types check (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] ≤15 files changed

Before every PR:

- [ ] All commits squashed/clean
- [ ] CodeRabbit review requested
- [ ] 0 blockers resolved
- [ ] E2E tests pass
- [ ] UX quality gate passed

Before production deploy (PRODUCTION READY CHECKLIST):

- [ ] **Feature audit passes (`/audit --critical`)**
  - 0 critical issues
  - 0 high issues
  - ≥95% functional rate
  - All buttons verified working
- [ ] All gates pass
- [ ] Manual QA complete
- [ ] Rollback plan documented

### What "Production Ready" Means

"Production ready" is NOT just "backend is wired." It means:

1. **Every button works** - Not just renders, but `onClick` handlers fire
2. **Every form submits** - Data persists to database
3. **Every modal opens** - Trigger buttons connected to modal state
4. **Feature audit passes** - `/audit --critical` shows 0 issues

If feature audit fails, the app is NOT production ready, regardless of:

- Build status
- Test coverage
- Code review approval

### Feature Audit Integration

Run the feature audit at these checkpoints:

| Checkpoint              | Command                 | Threshold        |
| ----------------------- | ----------------------- | ---------------- |
| Per page (after wiring) | `/audit PageName --fix` | All elements ✅  |
| Per phase gate          | `/audit --phase {N}`    | 0 critical, ≥90% |
| Production release      | `/audit --critical`     | 0 critical, ≥95% |

See `skills/feature-audit/SKILL.md` for detailed audit usage.

---

## Sandbox Runner Integration (E2B Sandboxes)

The sandbox-runner skill provides automated quality gate execution in isolated E2B sandboxes.

### Manual Execution

```bash
npm run sandbox:test      # Run tests in E2B
npm run sandbox:lint      # Run linting in E2B
npm run sandbox:build     # Run build in E2B
npm run sandbox:all       # Run all gates in E2B
```

### When Tests Run in E2B

| Gate       | Runs In            | Why            |
| ---------- | ------------------ | -------------- |
| TypeScript | E2B                | Isolation      |
| ESLint     | E2B                | Isolation      |
| Build      | E2B                | Isolation      |
| Unit Tests | E2B                | Isolation      |
| Coverage   | E2B                | Isolation      |
| E2E Tests  | E2B (e2e template) | Needs Chromium |
| CodeRabbit | Local              | Needs GitHub   |

### E2B Evaluator Configuration

```typescript
{
  name: 'Unit Tests',
  command: 'npm test -- --run',
  blocking: true,
  runInE2B: true,        // Run in E2B sandbox
  e2bTemplate: 'z-thread-node-v1',  // Optional template override
  timeout: 120000,
}
```

### Agent Browser E2E Tests

For frontend, use Agent Browser instead of Playwright for 95% first-try success:

```typescript
{
  name: 'E2E Tests (Agent Browser)',
  command: 'npm run test:e2e:agent-browser',
  blocking: true,
  runInE2B: true,
  e2bTemplate: 'z-thread-e2e-v1',  // Has Chromium
  layer: 'frontend',
}
```

See `skills/07-tools/agent-browser/SKILL.md` for Agent Browser usage.

### Automatic Execution (Stop Validator)

When agent says "done", ALL evaluators run in E2B automatically:

```
Agent: "Task complete"
     |
     v
Stop Validator triggers
     |
     v
For each evaluator:
  - Upload project to E2B sandbox
  - Run command
  - Collect results
     |
     v
Any failures? --> Reject stop, reinject errors
All pass? --> Allow completion
```

### Environment Variables

```bash
Z_THREAD_E2B_ENABLED=true          # Enable E2B (default: true)
Z_THREAD_E2B_TEMPLATE=z-thread-node-v1  # Default template
Z_THREAD_E2B_TIMEOUT=300000        # 5 min timeout
```

---

## Layer-Specific Gate Behavior

### Backend (DNA Layer) - Full Z-Thread

All gates automated, no human review:

```
PLAN -> DATABASE -> API -> TEST (E2B) -> REVIEW -> DEPLOY
                           ^__________|
                           (auto-loop)
```

### Frontend (FACE Layer) - Hybrid Z-Thread

Automated tests in E2B, human visual review:

```
PLAN -> SCAFFOLD -> IMPLEMENT -> TEST (E2B) -> E2E (E2B) -> VISUAL_REVIEW -> DEPLOY
                                 ^___________________|
                                     (auto-loop)              (human)
```
