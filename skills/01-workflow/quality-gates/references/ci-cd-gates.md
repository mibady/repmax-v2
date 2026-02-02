# CI/CD Gates Reference

Block bad code from deploying automatically.

## The Goal

```
Push Code → GitHub Actions runs tests → Tests pass? → Deploy
                                      → Tests fail? → BLOCKED
```

---

## GitHub Actions Setup

### Basic Workflow

Create `.github/workflows/test.yml`:

```yaml
name: E2E Tests

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npx playwright test
        env:
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}

      - name: Upload test report
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

### Setting Up Secrets

1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Add these secrets:
   - `TEST_USER_EMAIL` - Your test account email
   - `TEST_USER_PASSWORD` - Your test account password

---

## Vercel Integration

### Option 1: Block Deploy on Test Failure (Recommended)

Vercel can run checks before deploying. Add to your workflow:

```yaml
name: Test and Deploy

on:
  push:
    branches: [main]

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
      - run: npx playwright install --with-deps
      - run: npx playwright test
        env:
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}

  deploy:
    needs: test # Only runs if test job passes
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"
```

### Option 2: Vercel Checks (Built-in)

In your Vercel project settings:

1. Go to Settings → Git
2. Enable "Run checks before deploy"
3. Add your GitHub Actions workflow as a required check

---

## Branch Protection Rules

Force tests to pass before merging:

1. Go to repo → Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
4. Add "test" (or your job name) as required check

Now PRs cannot merge until tests pass.

---

## Complete Production Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: "20"

jobs:
  # Job 1: Lint and Type Check (fast feedback)
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  # Job 2: Unit Tests (if you have them)
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"
      - run: npm ci
      - run: npm run test:unit
    continue-on-error: false

  # Job 3: E2E Tests (the big one)
  e2e-test:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps chromium

      - name: Build app
        run: npm run build

      - name: Run E2E tests
        run: npx playwright test
        env:
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
          TEST_BASE_URL: http://localhost:3000

      - name: Upload report on failure
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

  # Job 4: Deploy (only if all tests pass)
  deploy:
    needs: [lint, e2e-test]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"
```

---

## Getting Vercel Secrets

To deploy via GitHub Actions:

1. **VERCEL_TOKEN**:
   - Go to vercel.com → Settings → Tokens
   - Create new token, copy it

2. **VERCEL_ORG_ID** and **VERCEL_PROJECT_ID**:
   - Run `vercel link` in your project
   - Check `.vercel/project.json` for `orgId` and `projectId`

Add all three to GitHub Secrets.

---

## Testing Preview Deployments

Test against Vercel preview URLs:

```yaml
# .github/workflows/preview-test.yml
name: Test Preview Deployment

on:
  deployment_status:

jobs:
  test:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - name: Run tests against preview
        run: npx playwright test
        env:
          TEST_BASE_URL: ${{ github.event.deployment_status.target_url }}
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
```

---

## Quick Setup Checklist

```
[ ] Create .github/workflows/test.yml
[ ] Add TEST_USER_EMAIL to GitHub Secrets
[ ] Add TEST_USER_PASSWORD to GitHub Secrets
[ ] (Optional) Add VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
[ ] Enable branch protection on main
[ ] Add "test" as required status check
[ ] Push code and verify workflow runs
```

---

## Troubleshooting CI

### Tests pass locally but fail in CI

**1. Missing environment variables**

```yaml
env:
  TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
```

Check: Are secrets set correctly? Names match exactly?

**2. Timeout issues**

```yaml
timeout-minutes: 20 # Increase if needed
```

**3. Browser not installed**

```yaml
- run: npx playwright install --with-deps chromium
```

**4. App not building**

```yaml
- run: npm run build
- run: npx playwright test
```

### Viewing failed test reports

When tests fail in CI:

1. Go to the failed workflow run
2. Scroll down to "Artifacts"
3. Download "playwright-report"
4. Unzip and open `index.html`

You'll see screenshots, videos, and traces of failures.

---

## Local Pre-Push Hook (Optional)

Run tests before every push automatically:

Create `.husky/pre-push`:

```bash
#!/bin/sh
npm run test
```

Setup:

```bash
npm install husky --save-dev
npx husky init
```

Now `git push` will fail if tests fail.
