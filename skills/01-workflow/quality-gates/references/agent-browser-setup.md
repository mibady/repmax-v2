# Agent Browser Setup Guide

Complete setup from zero to running E2E tests with Agent Browser.

## Why Agent Browser?

| Metric | Agent Browser | Playwright |
|--------|---------------|------------|
| **First-try success** | 95% | ~75-80% |
| **Element selection** | Deterministic refs | Non-deterministic selectors |
| **AI optimization** | Snapshot-based | DOM queries |
| **Z-Thread ready** | Yes | Requires adaptation |

## Installation

```bash
# Install Agent Browser globally
npm install -g agent-browser

# Download Chromium
agent-browser install
```

## Project Structure After Setup

```
your-app/
├── e2e/
│   ├── setup.ts           # E2E setup file
│   ├── login.test.ts      # Login flow tests
│   ├── dashboard.test.ts  # Dashboard tests
│   └── helpers/
│       └── browser.ts     # Agent Browser helpers
├── vitest.e2e.config.ts   # E2E test config
└── package.json           # Now has vitest + agent-browser
```

## The Config File (vitest.e2e.config.ts)

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["e2e/**/*.test.ts"],
    testTimeout: 60000,  // E2E tests need more time
    hookTimeout: 30000,
    setupFiles: ["./e2e/setup.ts"],
    // Run tests sequentially (browser state)
    sequence: {
      concurrent: false,
    },
  },
});
```

## E2E Setup File

```typescript
// e2e/setup.ts
import { execSync } from "child_process";
import { beforeAll, afterAll } from "vitest";

beforeAll(async () => {
  // Ensure agent-browser is installed
  try {
    execSync("which agent-browser", { stdio: "ignore" });
  } catch {
    execSync("npm install -g agent-browser && agent-browser install");
  }
});

afterAll(() => {
  // Clean up
  try {
    execSync("agent-browser close", { stdio: "ignore" });
  } catch {
    // Browser might already be closed
  }
});
```

## Browser Helper

```typescript
// e2e/helpers/browser.ts
import { execSync } from "child_process";

export function agentBrowser(command: string): string {
  return execSync(`agent-browser ${command}`, { encoding: "utf-8" }).trim();
}

export function agentBrowserJson(command: string): any {
  const output = execSync(`agent-browser ${command} --json`, {
    encoding: "utf-8",
  });
  return JSON.parse(output);
}

export function open(url: string): void {
  agentBrowser(`open ${url}`);
}

export function snapshot(): any {
  return agentBrowserJson("snapshot -i");
}

export function click(ref: string): void {
  agentBrowser(`click ${ref}`);
}

export function fill(ref: string, text: string): void {
  agentBrowser(`fill ${ref} "${text}"`);
}

export function getText(ref: string): string {
  return agentBrowser(`get text ${ref}`);
}

export function getUrl(): string {
  return agentBrowser("get url");
}

export function waitForText(text: string): void {
  agentBrowser(`wait --text "${text}"`);
}

export function waitForUrl(pattern: string): void {
  agentBrowser(`wait --url "${pattern}"`);
}

export function screenshot(path: string): void {
  agentBrowser(`screenshot ${path}`);
}

export function close(): void {
  agentBrowser("close");
}
```

## Environment Setup

### 1. Create .env.test

```bash
# .env.test - Test credentials (NEVER commit this)
TEST_BASE_URL=http://localhost:3000
TEST_USER_EMAIL=testuser@example.com
TEST_USER_PASSWORD=TestPassword123!
```

### 2. Add to .gitignore

```
# .gitignore
.env.test
e2e-results/
```

## First Test File

Create `e2e/smoke.test.ts`:

```typescript
// e2e/smoke.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { agentBrowser, agentBrowserJson } from "./helpers/browser";

describe("Smoke Tests", () => {
  beforeAll(() => {
    agentBrowser("open http://localhost:3000");
  });

  afterAll(() => {
    agentBrowser("close");
  });

  it("Homepage loads", () => {
    const title = agentBrowser("get title");
    expect(title).toBeTruthy();
  });

  it("Login page accessible", () => {
    agentBrowser("open http://localhost:3000/login");
    const snapshot = agentBrowserJson("snapshot -i");
    expect(snapshot.data.snapshot).toContain("Email");
  });
});
```

## Running Tests

### Standard Mode (Fast)

```bash
npm run test:e2e
```

### Debug Mode (Show Browser)

```bash
AGENT_BROWSER_HEADED=true npm run test:e2e
```

### Interactive Exploration

```bash
# Open browser manually
agent-browser open http://localhost:3000 --headed

# Get interactive elements
agent-browser snapshot -i

# Interact using refs
agent-browser fill @e1 "test@example.com"
agent-browser click @e3
```

## Package.json Scripts

```json
{
  "scripts": {
    "test:e2e": "vitest run e2e/ --config vitest.e2e.config.ts",
    "test:e2e:headed": "AGENT_BROWSER_HEADED=true vitest run e2e/ --config vitest.e2e.config.ts",
    "test:e2e:agent-browser": "vitest run e2e/ --config vitest.e2e.config.ts"
  }
}
```

## Folder Structure Recommendation

```
e2e/
├── smoke.test.ts          # Basic page loads
├── auth.test.ts           # Login, signup, logout
├── onboarding.test.ts     # First-time user experience
├── [your-core].test.ts    # Main feature tests
├── settings.test.ts       # User settings, profile
├── helpers/
│   ├── browser.ts         # Agent Browser wrapper
│   ├── auth.ts            # Login/logout helpers
│   └── fixtures.ts        # Test data factories
└── setup.ts               # Global setup/teardown
```

## Core Workflow Pattern

Every E2E test follows this pattern:

```typescript
import { agentBrowser, agentBrowserJson } from "./helpers/browser";

it("should do something", () => {
  // 1. Navigate
  agentBrowser("open http://localhost:3000/page");

  // 2. Get refs
  const snapshot = agentBrowserJson("snapshot -i");
  // Returns: @e1 (button), @e2 (input), @e3 (link)...

  // 3. Interact
  agentBrowser('fill @e2 "my input"');
  agentBrowser("click @e1");

  // 4. Re-snapshot (after DOM changes)
  agentBrowser("snapshot -i");

  // 5. Validate
  const url = agentBrowser("get url");
  expect(url).toContain("/success");
});
```

## Troubleshooting Setup

### "agent-browser: command not found"

```bash
npm install -g agent-browser
```

### "Browser not found"

```bash
agent-browser install
```

### "Connection refused localhost:3000"

Your dev server isn't running. Either:

- Start it manually: `npm run dev`
- Use a webServer configuration in vitest

### Tests pass locally but fail in CI

- Check `TEST_BASE_URL` matches CI environment
- Ensure env vars are set in CI secrets
- Agent Browser needs Chromium - use `agent-browser install` in CI setup

## CI Setup (GitHub Actions)

```yaml
- name: Install Agent Browser
  run: |
    npm install -g agent-browser
    agent-browser install

- name: Run E2E tests
  run: npm run test:e2e
  env:
    TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
    TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
    TEST_BASE_URL: http://localhost:3000
```

## Migration from Playwright

| Playwright | Agent Browser |
|------------|---------------|
| `page.goto(url)` | `agentBrowser('open url')` |
| `page.getByTestId('x').click()` | `agentBrowser('click @ref')` |
| `page.fill('input', 'text')` | `agentBrowser('fill @ref "text"')` |
| `expect(page).toHaveURL(url)` | `expect(agentBrowser('get url')).toContain(url)` |
| `expect(locator).toBeVisible()` | `expect(snapshot).toContain('element text')` |
