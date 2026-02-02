# UX State File Integration

The AI Coder Framework enforces UX planning via hooks that check state files. This document explains how to work with them.

---

## State Files

| File                                | Purpose                        | Updated By                     |
| ----------------------------------- | ------------------------------ | ------------------------------ |
| `.claude/hooks/workflow-state.json` | Tracks skills read per session | `skill-tracker.ts` (automatic) |
| `.claude/hooks/ux-audit-state.json` | UX audit results               | Manual or script               |
| `.claude/hooks/audit-state.json`    | Feature audit results          | Manual or script               |

---

## ux-audit-state.json

### Structure

```json
{
  "lastAudit": "2025-01-22T03:00:00Z",
  "screens": {
    "dashboard": {
      "empty": true,
      "loading": true,
      "error": true,
      "ideal": true,
      "states_complete": true
    },
    "settings": {
      "empty": true,
      "loading": true,
      "error": false,
      "ideal": true,
      "states_complete": false
    }
  },
  "summary": {
    "total_screens": 2,
    "complete": 1,
    "incomplete": 1,
    "pass_rate": 0.5
  },
  "enforcement_level": "ui"
}
```

### When Hook Blocks

The `ux-gate-validator.ts` blocks commits when:

| Enforcement Level | Block Condition                                 |
| ----------------- | ----------------------------------------------- |
| `standard`        | Never (warnings only)                           |
| `ui`              | `ux-planning` skill not read OR no audit exists |
| `release`         | Any screen has `states_complete: false`         |

### Updating the State File

**Option 1: Manual (after visual review)**

```bash
# Create/update the state file
cat > .claude/hooks/ux-audit-state.json << 'EOF'
{
  "lastAudit": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "screens": {
    "dashboard": { "empty": true, "loading": true, "error": true, "ideal": true, "states_complete": true }
  },
  "summary": { "total_screens": 1, "complete": 1, "incomplete": 0, "pass_rate": 1.0 },
  "enforcement_level": "ui"
}
EOF
```

**Option 2: Automated Script**

```typescript
// scripts/ux-audit.ts
import { glob } from "glob";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

interface ScreenState {
  empty: boolean;
  loading: boolean;
  error: boolean;
  ideal: boolean;
  states_complete: boolean;
}

interface AuditState {
  lastAudit: string;
  screens: Record<string, ScreenState>;
  summary: {
    total_screens: number;
    complete: number;
    incomplete: number;
    pass_rate: number;
  };
  enforcement_level: string;
}

async function auditUXStates(): Promise<AuditState> {
  const pages = await glob("app/**/page.tsx");
  const screens: Record<string, ScreenState> = {};

  for (const page of pages) {
    const dir = page.replace("/page.tsx", "");
    const screenName = dir.replace("app/", "").replace(/\//g, "-") || "home";

    const hasLoading = existsSync(join(dir, "loading.tsx"));
    const hasError = existsSync(join(dir, "error.tsx"));

    // Check page content for empty state handling
    const pageContent = readFileSync(page, "utf-8");
    const hasEmptyCheck =
      pageContent.includes(".length") ||
      pageContent.includes("EmptyState") ||
      pageContent.includes("empty");

    const state: ScreenState = {
      empty: hasEmptyCheck,
      loading: hasLoading,
      error: hasError,
      ideal: true, // Assume ideal exists if page exists
      states_complete: hasEmptyCheck && hasLoading && hasError,
    };

    screens[screenName] = state;
  }

  const total = Object.keys(screens).length;
  const complete = Object.values(screens).filter(
    (s) => s.states_complete,
  ).length;

  return {
    lastAudit: new Date().toISOString(),
    screens,
    summary: {
      total_screens: total,
      complete,
      incomplete: total - complete,
      pass_rate: total > 0 ? complete / total : 1,
    },
    enforcement_level: "ui",
  };
}

async function main() {
  const state = await auditUXStates();

  // Ensure directory exists
  const dir = ".claude/hooks";
  if (!existsSync(dir)) {
    require("fs").mkdirSync(dir, { recursive: true });
  }

  // Write state file
  writeFileSync(
    join(dir, "ux-audit-state.json"),
    JSON.stringify(state, null, 2),
  );

  // Report
  console.log("\nUX State Audit Results:");
  console.log("========================");

  for (const [screen, s] of Object.entries(state.screens)) {
    const status = s.states_complete ? "✅" : "❌";
    console.log(`${status} ${screen}`);
    if (!s.states_complete) {
      if (!s.empty) console.log("   - Missing: empty state");
      if (!s.loading) console.log("   - Missing: loading.tsx");
      if (!s.error) console.log("   - Missing: error.tsx");
    }
  }

  console.log("\nSummary:");
  console.log(`  Total: ${state.summary.total_screens}`);
  console.log(`  Complete: ${state.summary.complete}`);
  console.log(`  Pass Rate: ${(state.summary.pass_rate * 100).toFixed(0)}%`);

  // Exit with error if incomplete
  if (state.summary.incomplete > 0) {
    process.exit(1);
  }
}

main();
```

Add to `package.json`:

```json
{
  "scripts": {
    "audit:ux": "tsx scripts/ux-audit.ts"
  }
}
```

---

## audit-state.json

### Structure

```json
{
  "lastAudit": "2025-01-22T03:00:00Z",
  "feature": "appointment-confirmation",
  "results": {
    "functional_tests": 12,
    "functional_passed": 11,
    "smoke_tests": 5,
    "smoke_passed": 5,
    "critical_issues": 0,
    "major_issues": 1,
    "minor_issues": 2
  },
  "functional_rate": 0.917,
  "ready_for_release": false,
  "notes": "Missing error recovery on phone validation"
}
```

### When Hook Blocks

The `audit-gate-validator.ts` blocks commits when:

| Commit Type         | Block Condition                |
| ------------------- | ------------------------------ |
| Any `MN:` milestone | `feature-audit` skill not read |
| Any `MN:` milestone | No audit state file exists     |
| Release commits     | `critical_issues > 0`          |
| Release commits     | `functional_rate < 0.95`       |

### Updating the State File

**After running feature audit:**

```bash
cat > .claude/hooks/audit-state.json << 'EOF'
{
  "lastAudit": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "feature": "your-feature-name",
  "results": {
    "functional_tests": 10,
    "functional_passed": 10,
    "smoke_tests": 5,
    "smoke_passed": 5,
    "critical_issues": 0,
    "major_issues": 0,
    "minor_issues": 0
  },
  "functional_rate": 1.0,
  "ready_for_release": true,
  "notes": ""
}
EOF
```

---

## Workflow Integration

```
1. Read ux-planning skill
   └── skill-tracker.ts updates workflow-state.json ✓

2. Fill PRP Section 10
   └── Human decisions documented

3. Implement feature (face-layer)
   └── build-stage-validator.ts checks ux-planning was read ✓

4. Run UX audit
   └── npm run audit:ux
   └── Updates ux-audit-state.json

5. Run feature audit
   └── Manual or Playwright tests
   └── Update audit-state.json

6. Commit
   └── ux-gate-validator.ts checks ux-audit-state.json ✓
   └── audit-gate-validator.ts checks audit-state.json ✓
   └── Pre-commit hook runs all gates ✓
```

---

## Bypassing (When Needed)

| Situation                  | Bypass                                 |
| -------------------------- | -------------------------------------- |
| Quick fix, no UI changes   | `SKIP_UX_GATE=true git commit`         |
| Backend only changes       | `SKIP_UX_GATE=true git commit`         |
| Emergency hotfix           | `SKIP_PRECOMMIT_GATES=true git commit` |
| WIP commit (not milestone) | Gates only trigger on `MN:` pattern    |

---

## Enforcement Levels

Set in `ux-audit-state.json`:

| Level      | Behavior                                  |
| ---------- | ----------------------------------------- |
| `standard` | Warnings only, never blocks               |
| `ui`       | Blocks if skill not read or audit missing |
| `release`  | Blocks if any states incomplete           |

Upgrade enforcement as project matures:

```bash
# Early development
jq '.enforcement_level = "standard"' .claude/hooks/ux-audit-state.json > tmp && mv tmp .claude/hooks/ux-audit-state.json

# Active UI development
jq '.enforcement_level = "ui"' .claude/hooks/ux-audit-state.json > tmp && mv tmp .claude/hooks/ux-audit-state.json

# Pre-release
jq '.enforcement_level = "release"' .claude/hooks/ux-audit-state.json > tmp && mv tmp .claude/hooks/ux-audit-state.json
```
