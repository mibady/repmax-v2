# E2E Test Authentication Setup

Standard pattern for authenticated E2E tests with Agent Browser.

## Overview

```
+-------------------------------------------------------------+
|                     E2E Auth Flow                            |
|-------------------------------------------------------------|
|                                                              |
|  .env.test (credentials)                                     |
|       |                                                      |
|       v                                                      |
|  Auth helper (login function)                                |
|       |                                                      |
|       v                                                      |
|  agent-browser state save (optional session caching)         |
|       |                                                      |
|       v                                                      |
|  Tests run with authenticated session                        |
|                                                              |
+-------------------------------------------------------------+
```

## File Structure

```
e2e/
+-- .env.test              # Test credentials (gitignored)
+-- .env.test.example      # Template (committed)
+-- state/
|   +-- auth.json          # Saved auth state (gitignored)
+-- helpers/
|   +-- browser.ts         # Agent Browser wrapper
|   +-- auth.ts            # Login/logout helpers
+-- setup.ts               # Global setup
+-- auth.test.ts           # Auth flow tests
+-- dashboard.test.ts      # Authenticated tests
```

## Setup Steps

### 1. Create Test User

Create a dedicated test account in your auth system:

- Email: `test@yourapp.com`
- Password: Strong test password
- Permissions: Whatever the tests need

**Never use a real user account for testing.**

### 2. Configure Environment

Copy the example and fill in credentials:

```bash
cp e2e/.env.test.example e2e/.env.test
```

Edit `e2e/.env.test`:

```bash
TEST_USER_EMAIL=test@yourapp.com
TEST_USER_PASSWORD=YourTestPassword123!
TEST_BASE_URL=http://localhost:3000
```

### 3. Create Auth Helper

```typescript
// e2e/helpers/auth.ts
import { agentBrowser, agentBrowserJson } from "./browser";
import * as fs from "fs";
import * as path from "path";

const AUTH_STATE_PATH = path.join(__dirname, "../state/auth.json");

export async function login(
  email?: string,
  password?: string
): Promise<void> {
  const testEmail = email || process.env.TEST_USER_EMAIL!;
  const testPassword = password || process.env.TEST_USER_PASSWORD!;

  // Navigate to login
  agentBrowser(`open ${process.env.TEST_BASE_URL}/login`);

  // Get interactive elements
  agentBrowser("snapshot -i");

  // Find and fill email (look for email/username input)
  agentBrowser(`fill @e1 "${testEmail}"`);
  agentBrowser(`fill @e2 "${testPassword}"`);

  // Click login button
  agentBrowser("click @e3");

  // Wait for redirect
  agentBrowser('wait --url "**/dashboard"');
}

export async function loginWithSavedState(): Promise<boolean> {
  // Check if saved state exists
  if (fs.existsSync(AUTH_STATE_PATH)) {
    try {
      agentBrowser(`state load ${AUTH_STATE_PATH}`);
      agentBrowser(`open ${process.env.TEST_BASE_URL}/dashboard`);

      // Verify still logged in
      const url = agentBrowser("get url");
      if (url.includes("/dashboard")) {
        return true;
      }
    } catch {
      // State invalid, will login fresh
    }
  }

  // Fresh login
  await login();

  // Save state for future runs
  fs.mkdirSync(path.dirname(AUTH_STATE_PATH), { recursive: true });
  agentBrowser(`state save ${AUTH_STATE_PATH}`);

  return true;
}

export function logout(): void {
  // Get snapshot to find logout button
  agentBrowser("snapshot -i");

  // Click user menu then logout
  // Note: Adjust refs based on your actual UI
  agentBrowser("click @user-menu");
  agentBrowser("snapshot -i");
  agentBrowser("click @logout-btn");

  // Wait for redirect to login
  agentBrowser('wait --url "**/login"');
}

export function isLoggedIn(): boolean {
  const url = agentBrowser("get url");
  return !url.includes("/login") && !url.includes("/signup");
}
```

### 4. Customize for Your App

Update the selectors in auth.ts to match your app. Use Agent Browser interactively to find the right refs:

```bash
# Start browser
agent-browser open http://localhost:3000/login --headed

# Get interactive elements
agent-browser snapshot -i

# Output shows refs:
# - textbox "Email" [ref=e1]
# - textbox "Password" [ref=e2]
# - button "Sign In" [ref=e3]
```

## Writing Tests

### Authenticated Tests

Most tests need authentication:

```typescript
// e2e/dashboard.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { agentBrowser, agentBrowserJson } from "./helpers/browser";
import { login } from "./helpers/auth";

describe("Dashboard", () => {
  beforeAll(() => {
    login();
  });

  afterAll(() => {
    agentBrowser("close");
  });

  it("user can see dashboard", () => {
    // Already logged in from beforeAll
    agentBrowser(`open ${process.env.TEST_BASE_URL}/dashboard`);

    const snapshot = agentBrowserJson("snapshot -i");
    expect(snapshot.data.snapshot).toContain("Dashboard");
  });

  it("user can access settings", () => {
    agentBrowser(`open ${process.env.TEST_BASE_URL}/settings`);

    const url = agentBrowser("get url");
    expect(url).toContain("/settings");
  });
});
```

### Using Auth Helpers

For tests that need manual login/logout:

```typescript
import { describe, it, expect } from "vitest";
import { agentBrowser } from "./helpers/browser";
import { login, logout, isLoggedIn } from "./helpers/auth";

describe("Auth Flow", () => {
  it("login and logout flow", () => {
    login();
    expect(isLoggedIn()).toBe(true);

    logout();
    expect(isLoggedIn()).toBe(false);
  });
});
```

### Unauthenticated Tests

For tests that should start logged out:

```typescript
// e2e/login.test.ts
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { agentBrowser, agentBrowserJson } from "./helpers/browser";

describe("Login Page (Unauthenticated)", () => {
  beforeEach(() => {
    // Fresh browser, no auth state
    agentBrowser(`open ${process.env.TEST_BASE_URL}/login`);
  });

  afterAll(() => {
    agentBrowser("close");
  });

  it("login page shows form", () => {
    const snapshot = agentBrowserJson("snapshot -i");
    expect(snapshot.data.snapshot).toContain("Email");
    expect(snapshot.data.snapshot).toContain("Password");
  });

  it("invalid credentials show error", () => {
    agentBrowser('fill @e1 "wrong@email.com"');
    agentBrowser('fill @e2 "wrongpassword"');
    agentBrowser("click @e3");

    agentBrowser('wait --text "Invalid"');

    const snapshot = agentBrowserJson("snapshot -i");
    expect(snapshot.data.snapshot).toContain("Invalid");
  });
});
```

## CI/CD Setup

### GitHub Secrets

Add these secrets in GitHub -> Settings -> Secrets -> Actions:

- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`

### Workflow Configuration

```yaml
# .github/workflows/ci.yml
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

## Troubleshooting

### "Test credentials not found"

Ensure `.env.test` exists and has the variables:

```bash
cat e2e/.env.test
# Should show TEST_USER_EMAIL and TEST_USER_PASSWORD
```

### "Element not found" during login

Use Agent Browser interactively to find correct refs:

```bash
agent-browser open http://localhost:3000/login --headed
agent-browser snapshot -i
```

### Tests pass locally, fail in CI

1. Check GitHub Secrets are set correctly
2. Verify secret names match exactly (case-sensitive)
3. Add debug output to CI:
   ```yaml
   - run: echo "Email is set:" && [ -n "$TEST_USER_EMAIL" ] && echo "yes" || echo "no"
     env:
       TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
   ```

### Session state not persisting

Make sure the state directory exists:

```bash
mkdir -p e2e/state
```

## Security Checklist

- [ ] `.env.test` is in `.gitignore`
- [ ] `e2e/state/` is in `.gitignore`
- [ ] Test account has limited permissions (not admin)
- [ ] Test account uses unique password (not shared)
- [ ] CI uses GitHub Secrets (not hardcoded values)
- [ ] Test database is separate from production
