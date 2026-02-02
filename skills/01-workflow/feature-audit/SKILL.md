# Feature Audit Skill

Systematic framework for auditing user-facing functionality across web applications. Combines UI inventory, interaction mapping, BDD preparation, and gap analysis into a single comprehensive audit process.

## Trigger Phrases

- "audit", "feature audit", "functionality audit"
- "what's broken", "what doesn't work"
- "test all pages", "check all buttons"
- "BDD specs", "test cases", "test matrix"
- "gap analysis", "find placeholders"
- "smoke test", "click-through test"

## Invocation

```
/audit                    # Full project audit
/audit LoginPage          # Single page audit
/audit --critical         # Show only critical issues
/audit --bdd              # Output as Gherkin specs
/audit --matrix           # Output as test matrix
/audit --playwright       # Generate Playwright tests
/audit --cypress          # Generate Cypress tests
/audit --fix              # Audit and fix critical issues
```

## Audit Process

### Phase 1: Discovery

1. **Find all routes/pages**
   - Check App.tsx, router config, routes folder
   - List all page components

2. **Categorize pages**
   - Public vs authenticated
   - By user role (athlete, parent, recruiter, etc.)
   - By feature area (auth, dashboard, settings)

3. **Create inventory**
   ```markdown
   | Page | File | Auth | Roles |
   |------|------|------|-------|
   | Home | HomePage.tsx | No | All |
   | Dashboard | Dashboard.tsx | Yes | All |
   ```

### Phase 2: Per-Page Analysis

For each page component, read the file and document:

#### Interactive Elements

| Element | Capture |
|---------|---------|
| `<button>` | Label, onClick handler, target |
| `<a>`, `<Link>` | Text, href/to, destination |
| `<input>` | Name, type, onChange, validation |
| `<select>` | Options, onChange |
| `<form>` | onSubmit handler |
| Cards/rows | onClick, navigation |
| Modals | Trigger element, actions |

#### State Variables

```typescript
// Document all useState calls
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [data, setData] = useState([]);
```

#### API Calls

```typescript
// Document all service function calls
await authService.login(email, password);
const data = await fetchAthletes(filters);
```

### Phase 3: Status Classification

| Status | Symbol | Definition |
|--------|--------|------------|
| Functional | ✅ | Works as expected |
| Broken | ❌ | Handler exists but errors |
| Not Implemented | 🚫 | No handler, does nothing |
| Partial | ⚠️ | Works but incomplete |
| Placeholder | 📝 | Intentional TODO |

### Phase 4: Severity Assignment

| Severity | Definition | Action |
|----------|------------|--------|
| **Critical** | Blocks core user flow | Fix immediately |
| **High** | Major feature broken | Fix this sprint |
| **Medium** | Feature degraded | Schedule fix |
| **Low** | Minor inconvenience | Backlog |

## Output Formats

### Default: Audit Report

```markdown
# [Project] Feature Audit Report
**Date:** YYYY-MM-DD
**Pages Audited:** N
**Elements Tested:** N

## Executive Summary
- Total Elements: N
- Functional: N (X%)
- Issues Found: N
- Critical: N | High: N | Medium: N | Low: N

## Critical Issues (Must Fix)

| Page | Element | Issue | File:Line |
|------|---------|-------|-----------|
| Login | Submit button | No onClick handler | LoginPage.tsx:45 |

## High Priority Issues
...

## Page-by-Page Details

### HomePage.tsx

**Features:**
- Hero section with CTA
- Role selector grid
- Pricing section

**Interactive Elements:**

| Element | Expected Action | Handler | Status |
|---------|-----------------|---------|--------|
| "Get Started" btn | Open signup | `onAuthIntent('athlete', true)` | ✅ |
| "Watch Demo" btn | Navigate to demo | `onNavigate(Page.DEMO)` | ✅ |
| Article card | Open article | None | 🚫 |

**State:**
- `isLoading`: boolean

**API Calls:**
- None (static page)
```

### BDD Format (--bdd)

```gherkin
Feature: Login Page
  As a user
  I want to log into my account
  So that I can access my dashboard

  Background:
    Given I am on the login page

  Scenario: Successful login
    When I enter valid email "user@test.com"
    And I enter valid password "password123"
    And I click the "Sign In" button
    Then I should be redirected to the dashboard
    # Status: ✅ PASSING

  Scenario: Forgot password
    When I click "Forgot password?"
    Then I should see the password reset form
    # Status: 🚫 NOT IMPLEMENTED - No onClick handler
```

### Test Matrix (--matrix)

```markdown
| ID | Page | Element | Action | Expected | Actual | Status | Priority |
|----|------|---------|--------|----------|--------|--------|----------|
| T001 | Login | Email input | Type | Updates state | Updates state | ✅ | - |
| T002 | Login | Submit btn | Click | API call | Nothing | 🚫 | Critical |
| T003 | Login | Forgot link | Click | Show modal | Nothing | 🚫 | High |
| T004 | Home | Hero CTA | Click | Open auth | Opens auth | ✅ | - |
```

### Playwright Tests (--playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('email input updates on type', async ({ page }) => {
    const emailInput = page.getByPlaceholder('Email');
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
  });

  // 🚫 NOT IMPLEMENTED - Needs handler
  test.skip('submit button triggers login', async ({ page }) => {
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### Cypress Tests (--cypress)

```typescript
describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('email input updates on type', () => {
    cy.get('[name="email"]').type('test@example.com');
    cy.get('[name="email"]').should('have.value', 'test@example.com');
  });

  // 🚫 NOT IMPLEMENTED
  it.skip('submit button triggers login', () => {
    cy.get('[name="email"]').type('test@example.com');
    cy.get('[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

## Common Bug Patterns

### Pattern 1: Missing onClick
```tsx
// 🚫 Bug
<button className="btn">Submit</button>

// ✅ Fix
<button onClick={handleSubmit} className="btn">Submit</button>
```

### Pattern 2: Placeholder href
```tsx
// 🚫 Bug
<a href="#">Learn More</a>

// ✅ Fix
<Link to="/learn-more">Learn More</Link>
// or
<button onClick={() => navigate('/learn-more')}>Learn More</button>
```

### Pattern 3: Empty handler
```tsx
// 🚫 Bug
const handleClick = () => {
  // TODO
};

// ✅ Fix
const handleClick = () => {
  navigate('/destination');
};
```

### Pattern 4: Prevent-only handler
```tsx
// 🚫 Bug
<form onSubmit={(e) => e.preventDefault()}>

// ✅ Fix
<form onSubmit={(e) => {
  e.preventDefault();
  handleSubmit();
}}>
```

### Pattern 5: Missing error handling
```tsx
// ⚠️ Partial
const data = await fetchData();

// ✅ Complete
try {
  const data = await fetchData();
  setData(data);
} catch (err) {
  setError(err.message);
}
```

## Audit Checklist

### Pre-Audit
- [ ] Identify framework (React, Vue, Angular, etc.)
- [ ] Locate router configuration
- [ ] Identify auth system and user roles
- [ ] Note state management (Context, Redux, Zustand)
- [ ] List external API dependencies

### Per-Page Audit
- [ ] Read full component file
- [ ] List all useState/useReducer
- [ ] List all onClick/onChange/onSubmit
- [ ] Check for TODO/FIXME comments
- [ ] Verify service/API calls exist
- [ ] Test all navigation paths
- [ ] Check error boundary coverage

### Post-Audit
- [ ] Classify all issues by severity
- [ ] Group by page/feature
- [ ] Identify quick wins (5-min fixes)
- [ ] Note architectural concerns
- [ ] Create prioritized fix list

## Metrics

| Metric | Formula | Target |
|--------|---------|--------|
| Functional Rate | Functional / Total * 100 | > 95% |
| Critical Issues | Count | 0 |
| High Issues | Count | < 5 |
| Coverage | Tested / Total * 100 | > 80% |

## Fix Mode (--fix)

When `--fix` flag is used:

1. Run normal audit
2. For each **Critical** issue:
   - Show the issue
   - Propose a fix
   - Apply the fix
   - Verify build still passes
3. Report fixes applied

```
Audit found 3 critical issues.

Fixing 1/3: ParentDashboard.tsx:77 - "Link Athlete" missing handler
  Adding: onClick={() => handleLinkAthlete()}
  Creating: handleLinkAthlete function
  ✅ Fixed

Fixing 2/3: ClubDashboard.tsx:56 - "Add Athlete" missing handler
  Adding: onClick={() => setShowAddAthleteModal(true)}
  ✅ Fixed

Fixing 3/3: LoginPage.tsx:285 - "Forgot password" missing handler
  Adding: onClick={() => setShowForgotPassword(true)}
  ✅ Fixed

Build check: ✅ Passing
3/3 critical issues fixed.
```

## Enforcement Integration

Feature audit is code-enforced in the ai-coder framework:

### Audit Gate Validator

Milestone commits (M1, M2, M3, etc.) are blocked until:
1. `feature-audit` skill has been read
2. An audit has been performed this session
3. For release commits: No critical issues and functional rate ≥95%

### Recording Audit Results

After completing an audit, record results to enable commits:

```bash
npx tsx .claude/hooks/update-audit-state.ts '{"pages": [
  {
    "page": "LoginPage",
    "file": "app/login/page.tsx",
    "elements_total": 10,
    "elements_functional": 9,
    "critical_issues": 0,
    "high_issues": 1,
    "medium_issues": 0,
    "low_issues": 0
  }
]}'
```

### Bypass Options

```bash
# Bypass audit gate only
SKIP_AUDIT_GATE=true

# Bypass all workflow enforcement
SKIP_WORKFLOW_ENFORCEMENT=true

# Relaxed mode (warns but doesn't block)
AUDIT_ENFORCEMENT_MODE=relaxed
```

### State Files

- `.claude/hooks/audit-state.json` - Audit results and metrics
- `.claude/hooks/workflow-state.json` - Tracks skill reads

## UX State Verification

For each screen defined in PRP Section 10.5, verify all states are implemented:

### State Checklist Per Screen

| State | Exists | Works | Notes |
|-------|--------|-------|-------|
| Empty | ☐ | ☐ | Has CTA to create first item |
| Loading | ☐ | ☐ | Skeleton, not blank |
| Error | ☐ | ☐ | Human-readable, has recovery path |
| Ideal | ☐ | ☐ | Primary design, all data present |
| Offline | ☐ | ☐ | (Mobile) Shows cached or retry |

### Fail Criteria (Blocks Production)

- Missing any state defined in Section 10.5
- Error messages not human-readable
- Loading state shows blank screen (must show skeleton)
- Error state has no recovery path (retry button, support link)
- Empty state has no CTA to guide user

### UX State Audit Command

```bash
/audit --ux-states
```

Output format:

```markdown
## UX State Audit Report

### Dashboard Page
| State | Defined | Implemented | Tested |
|-------|---------|-------------|--------|
| Empty | ✅ | ✅ | ✅ |
| Loading | ✅ | ✅ | ⚠️ No skeleton |
| Error | ✅ | ❌ | - |
| Ideal | ✅ | ✅ | ✅ |

**Issues Found:** 2
- Loading: Uses spinner instead of skeleton
- Error: State not implemented

### Settings Page
...
```

### Integration with PRP Section 10.5

The audit validates that every screen state listed in the PRP has been:

1. **Designed** — Mockup or description exists
2. **Implemented** — Code renders the state
3. **Tested** — State is reachable and works

Reference: `ux-planning/SKILL.md` for state definitions.

---

## Integration with Other Skills

- **ux-planning**: Validates Section 10.5 screen states are implemented
- **quality-gates**: Run audit as part of pre-commit checks
- **meta-tools**: Include audit results in PRPs and implementation plans
- **dna-layer**: Audit API integration patterns
- **face-layer**: Audit UI components and navigation

## Usage Examples

**Full audit:**
> "Run a feature audit on this project"

**Single page:**
> "Audit the checkout page"

**With output format:**
> "Audit and generate Playwright tests"

**Fix mode:**
> "Audit the dashboard and fix critical issues"
