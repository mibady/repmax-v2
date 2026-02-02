---
name: agent-browser
version: 1.0.0
description: Browser automation for AI agents using snapshot + ref pattern. 95% first-try task completion vs 75-80% for selector-based tools. Use for E2E testing, form filling, screenshots, and web automation in Z-Thread workflows.
---

# Agent Browser: AI-Native Browser Automation

## Why Agent Browser > Playwright for Z-Thread

| Metric | Agent Browser | Playwright MCP | Chrome DevTools MCP |
|--------|---------------|----------------|---------------------|
| **First-try success** | 95% | ~75-80% | ~75-80% |
| **Element selection** | Deterministic refs | Non-deterministic selectors | Non-deterministic selectors |
| **AI optimization** | Snapshot-based | DOM queries | DOM queries |

**The key difference**: Traditional tools use CSS selectors and XPath - non-deterministic matching that often fails when the DOM changes slightly. Agent Browser takes a snapshot, returns condensed refs like `@e1` and `@e2`, and lets the agent decide how to navigate.

## Installation

```bash
npm install -g agent-browser
agent-browser install  # Download Chromium
```

---

## Core Workflow (Z-Thread Optimized)

```
1. OPEN URL
   agent-browser open https://app.example.com
                     |
2. SNAPSHOT (get refs)
   agent-browser snapshot -i
   Returns: @e1 (button), @e2 (textbox), @e3 (link)...
                     |
3. INTERACT (using refs)
   agent-browser click @e1
   agent-browser fill @e2 "test@example.com"
                     |
4. RE-SNAPSHOT (after DOM changes)
   agent-browser snapshot -i
   New refs: @e1 (success message), @e2 (dashboard)...
                     |
5. VALIDATE
   agent-browser get text @e1
   -> "Login successful"
```

---

## Quick Reference

### Navigation

```bash
agent-browser open <url>      # Navigate to URL
agent-browser back            # Go back
agent-browser forward         # Go forward
agent-browser reload          # Reload page
agent-browser close           # Close browser
```

### Snapshot (The Key Command)

```bash
agent-browser snapshot            # Full accessibility tree
agent-browser snapshot -i         # Interactive elements only (RECOMMENDED)
agent-browser snapshot -c         # Compact output
agent-browser snapshot -d 3       # Limit depth to 3
agent-browser snapshot -s "#main" # Scope to CSS selector
agent-browser snapshot -i --json  # Machine-readable output
```

**Example output:**

```
- heading "Example Domain" [ref=e1] [level=1]
- button "Submit" [ref=e2]
- textbox "Email" [ref=e3]
- link "Learn more" [ref=e4]
```

### Interactions (Use @refs from Snapshot)

```bash
agent-browser click @e1           # Click
agent-browser dblclick @e1        # Double-click
agent-browser fill @e2 "text"     # Clear and type
agent-browser type @e2 "text"     # Type without clearing
agent-browser press Enter         # Press key
agent-browser press Control+a     # Key combination
agent-browser hover @e1           # Hover
agent-browser check @e1           # Check checkbox
agent-browser uncheck @e1         # Uncheck checkbox
agent-browser select @e1 "value"  # Select dropdown
agent-browser scroll down 500     # Scroll page
agent-browser scrollintoview @e1  # Scroll element into view
agent-browser upload @e1 file.pdf # Upload files
```

### Get Information

```bash
agent-browser get text @e1        # Get element text
agent-browser get html @e1        # Get innerHTML
agent-browser get value @e1       # Get input value
agent-browser get attr @e1 href   # Get attribute
agent-browser get title           # Get page title
agent-browser get url             # Get current URL
agent-browser get count ".item"   # Count matching elements
```

### Check State

```bash
agent-browser is visible @e1      # Check if visible
agent-browser is enabled @e1      # Check if enabled
agent-browser is checked @e1      # Check if checked
```

### Screenshots & Recording

```bash
agent-browser screenshot              # Screenshot to stdout
agent-browser screenshot path.png     # Save to file
agent-browser screenshot --full       # Full page
agent-browser pdf output.pdf          # Save as PDF

# Video recording
agent-browser record start ./demo.webm
# ... perform actions ...
agent-browser record stop
```

### Wait

```bash
agent-browser wait @e1                     # Wait for element
agent-browser wait 2000                    # Wait milliseconds
agent-browser wait --text "Success"        # Wait for text
agent-browser wait --url "**/dashboard"    # Wait for URL pattern
agent-browser wait --load networkidle      # Wait for network idle
agent-browser wait --fn "window.ready"     # Wait for JS condition
```

---

## Z-Thread E2E Test Pattern

### Test File Structure

```typescript
// e2e/login.test.ts
import { execSync } from 'child_process';

function agentBrowser(command: string): string {
  return execSync(`agent-browser ${command}`, { encoding: 'utf-8' }).trim();
}

function agentBrowserJson(command: string): any {
  const output = execSync(`agent-browser ${command} --json`, { encoding: 'utf-8' });
  return JSON.parse(output);
}

describe('Login Flow', () => {
  beforeAll(() => {
    agentBrowser('open http://localhost:3000/login');
  });

  afterAll(() => {
    agentBrowser('close');
  });

  it('should login with valid credentials', () => {
    // Get interactive elements
    const snapshot = agentBrowserJson('snapshot -i');

    // Find refs for email, password, submit
    // (In practice, parse snapshot.data.refs)
    agentBrowser('fill @e1 "test@example.com"');
    agentBrowser('fill @e2 "password123"');
    agentBrowser('click @e3');

    // Wait for navigation
    agentBrowser('wait --url "**/dashboard"');

    // Verify
    const url = agentBrowser('get url');
    expect(url).toContain('/dashboard');

    // Capture screenshot for review
    agentBrowser('screenshot e2e-results/login-success.png');
  });

  it('should show error for invalid credentials', () => {
    agentBrowser('open http://localhost:3000/login');

    agentBrowser('fill @e1 "wrong@example.com"');
    agentBrowser('fill @e2 "wrongpassword"');
    agentBrowser('click @e3');

    // Wait for error message
    agentBrowser('wait --text "Invalid credentials"');

    // Verify error is visible
    const snapshot = agentBrowserJson('snapshot -i');
    const hasError = snapshot.data.snapshot.includes('Invalid credentials');
    expect(hasError).toBe(true);
  });
});
```

### Package.json Scripts

```json
{
  "scripts": {
    "test:e2e:agent-browser": "vitest run e2e/ --config vitest.e2e.config.ts",
    "test:e2e:agent-browser:headed": "agent-browser open http://localhost:3000 --headed",
    "get-preview-url": "echo http://localhost:3000"
  }
}
```

### Vitest E2E Config

```typescript
// vitest.e2e.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['e2e/**/*.test.ts'],
    testTimeout: 60000,  // E2E tests need more time
    hookTimeout: 30000,
    setupFiles: ['./e2e/setup.ts'],
    // Run tests sequentially (browser state)
    sequence: {
      concurrent: false,
    },
  },
});
```

### E2E Setup

```typescript
// e2e/setup.ts
import { execSync } from 'child_process';
import { beforeAll, afterAll } from 'vitest';

beforeAll(async () => {
  // Ensure agent-browser is installed
  try {
    execSync('which agent-browser', { stdio: 'ignore' });
  } catch {
    execSync('npm install -g agent-browser && agent-browser install');
  }
});

afterAll(() => {
  // Clean up
  try {
    execSync('agent-browser close', { stdio: 'ignore' });
  } catch {
    // Browser might already be closed
  }
});
```

---

## Advanced Features

### Sessions (Parallel Testing)

```bash
# Run tests in parallel sessions
agent-browser --session test1 open site-a.com
agent-browser --session test2 open site-b.com

# List active sessions
agent-browser session list
```

### Authentication State

```bash
# Save auth state after login
agent-browser state save auth.json

# Load in future sessions (skip login)
agent-browser state load auth.json
agent-browser open https://app.example.com/dashboard
```

### Network Interception

```bash
# Mock API responses
agent-browser network route "**/api/user" --body '{"id": 1, "name": "Test"}'

# Block analytics
agent-browser network route "**/analytics" --abort
```

### Debugging

```bash
# Show browser window
agent-browser open example.com --headed

# View console messages
agent-browser console

# View errors
agent-browser errors

# Highlight element
agent-browser highlight @e1

# Record session
agent-browser record start debug.webm
# ... actions ...
agent-browser record stop
```

---

## Integration with Z-Thread Stop Validator

The stop validator runs Agent Browser E2E tests as a quality gate:

```typescript
{
  name: 'E2E Tests (Agent Browser)',
  command: 'npm run test:e2e:agent-browser',
  blocking: true,
  reinjectOnFail: true,
  timeout: 300000,
  layer: 'frontend',
}
```

When E2E tests fail, the error output is reinjected to the agent:

```
## EVALUATOR FAILED: E2E Tests (Agent Browser)

Error output:
FAIL e2e/login.test.ts > Login Flow > should login with valid credentials
AssertionError: expected '/login' to contain '/dashboard'

Snapshot at failure:
- heading "Login" [ref=e1]
- alert "Invalid credentials" [ref=e2]  <- Error visible
- textbox "Email" [ref=e3]

REQUIRED ACTIONS:
1. Analyze the error - login is failing
2. Check auth logic in the API
3. Fix the issue
4. Re-run: npm run test:e2e:agent-browser
```

---

## Best Practices

### 1. Always Snapshot Before Interacting

```bash
# DON'T
agent-browser click "#submit"  # Selector might not exist

# DO
agent-browser snapshot -i      # Get refs first
agent-browser click @e3        # Use ref from snapshot
```

### 2. Re-Snapshot After Navigation

```bash
agent-browser click @e1        # Submit form
agent-browser wait --load networkidle
agent-browser snapshot -i      # Get NEW refs for new page
```

### 3. Use Compact Snapshots for Large Pages

```bash
agent-browser snapshot -i -c -d 3  # Interactive, compact, depth 3
```

### 4. Capture Screenshots for Human Review

```bash
# In hybrid Z-Thread, capture for visual review
agent-browser screenshot e2e-results/$(date +%s).png --full
```

### 5. Use Sessions for Parallel Tests

```bash
# Parallel test execution
for i in {1..5}; do
  agent-browser --session test$i open http://localhost:3000 &
done
```

---

## Quick Reference Card

```bash
# Core workflow
agent-browser open <url>          # 1. Navigate
agent-browser snapshot -i         # 2. Get refs
agent-browser click @e1           # 3. Interact
agent-browser snapshot -i         # 4. Re-snapshot

# Key flags
--json          # Machine-readable output
--headed        # Show browser window
-i              # Interactive elements only
-c              # Compact output
--full          # Full page screenshot

# Validation
agent-browser get text @e1        # Verify content
agent-browser is visible @e1      # Check visibility
agent-browser get url             # Check navigation
```
