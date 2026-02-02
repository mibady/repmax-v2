# Sandbox Runner (E2B Integrated)

**Run tests and builds in E2B cloud sandboxes instead of locally.**

Full compute isolation - tests run in cloud sandboxes, not on your machine.

## Quick Comparison

| Feature              | Local Execution | Sandbox Runner    |
| -------------------- | --------------- | ----------------- |
| **Test execution**   | Your machine    | E2B cloud sandbox |
| **Isolation**        | Process-level   | Full container    |
| **Parallelism**      | Git worktrees   | N sandboxes       |
| **Can damage local** | Theoretically   | Impossible        |
| **Agent Browser**    | Local Chromium  | Cloud Chromium    |
| **Scale**            | Your CPU        | E2B's cloud       |

## Architecture

```
+-------------------------------------------------------------+
|                    YOUR DESKTOP                              |
|  +-------------------------------------------------------+  |
|  |  Claude Code + Hooks                                  |  |
|  |  - pre-tool-safety (blocks destructive locally)       |  |
|  |  - stop-validator -> TRIGGERS E2B                     |  |
|  +-------------------------------------------------------+  |
|                            |                                 |
+----------------------------|---------------------------------+
                             |
                    +--------+--------+
                    |                 |
         +----------+---------+  +----+------------+
         |  E2B SANDBOX 1     |  |  E2B SANDBOX 2  |
         |  z-thread-node     |  |  z-thread-e2e   |
         |                    |  |                 |
         |  npm test          |  |  agent-browser  |
         |  typecheck         |  |  E2E tests      |
         |  lint              |  |  screenshots    |
         |  build             |  |                 |
         +--------------------+  +-----------------+
```

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set E2B API key
export E2B_API_KEY=your_key_here

# 3. Run tests in cloud
npm run sandbox:test

# 4. Run all quality gates in cloud
npm run sandbox:all
```

## Commands

```bash
npm run sandbox:test       # Run unit tests in E2B
npm run sandbox:lint       # Run ESLint in E2B
npm run sandbox:build      # Run build in E2B
npm run sandbox:typecheck  # Run TypeScript check in E2B
npm run sandbox:all        # Run all gates
```

## Environment Variables

```bash
# Required
E2B_API_KEY=your_e2b_api_key

# Optional
SANDBOX_TIMEOUT=300000           # Sandbox timeout (5 min default)
SANDBOX_TEMPLATE=z-thread-node-v1  # Default template
```

## Sandbox Templates

### z-thread-node-v1

General purpose Node.js sandbox for:

- TypeScript checking
- ESLint
- Unit tests (Vitest)
- Build verification

```dockerfile
# Pre-installed:
# - Node.js 20
# - TypeScript
# - Vitest
# - ESLint
```

### z-thread-e2e-v1

E2E testing sandbox with Chromium:

- Agent Browser
- Headless Chromium
- Xvfb (virtual display)

```dockerfile
# Pre-installed:
# - Node.js 20
# - agent-browser
# - Chromium
# - Xvfb
```

## Files Structure

```
ai-coder/
+-- .claude/hooks/
|   +-- stop-validator.ts       # E2B: runs all gates in sandbox
|
+-- src/services/
|   +-- e2b-runner.ts           # E2B SDK wrapper
|
+-- scripts/
|   +-- sandbox-runner.ts       # CLI entry point
|
+-- skills/07-tools/sandbox-runner/
    +-- SKILL.md                # Main skill documentation
    +-- README.md               # This file (detailed architecture)
```

## Quality Gates (E2B Execution)

### Blocking Gates (must pass)

| Gate       | Command                          | Runs In              |
| ---------- | -------------------------------- | -------------------- |
| TypeScript | `npm run typecheck`              | E2B                  |
| ESLint     | `npm run lint`                   | E2B                  |
| Unit Tests | `npm test -- --run`              | E2B                  |
| Coverage   | `npm test -- --coverage`         | E2B                  |
| Build      | `npm run build`                  | E2B                  |
| E2E Tests  | `npm run test:e2e:agent-browser` | E2B (e2e template)   |
| CodeRabbit | `npx coderabbit review`          | Local (needs GitHub) |

### Non-Blocking (warnings)

| Gate            | Command                    | Runs In            |
| --------------- | -------------------------- | ------------------ |
| Visual Snapshot | `agent-browser screenshot` | E2B (e2e template) |

## Workflow: Backend (Full Automation)

```
PRP -> Build -> Test (E2B) -> CodeRabbit -> Ship
         ^__________________|
              (auto-loop)
```

No human needed. Tests run in isolated E2B sandbox.

## Workflow: Frontend (Hybrid)

```
PRP -> Build -> Test (E2B) -> E2E (E2B) -> CodeRabbit -> Visual Review -> Ship
         ^__________________________|
              (auto-loop in E2B)              ^
                                     (human glance only)
```

E2E tests with Agent Browser run in E2B sandbox with Chromium.

## E2B SDK Usage

```typescript
import { runInSandbox, PersistentSandbox } from "./src/services/e2b-runner";

// One-off execution
const result = await runInSandbox("npm test -- --run", {
  template: "z-thread-node-v1",
  files: projectFiles,
  cwd: "/home/user/project",
  timeout: 180000,
});

// Persistent session (multiple commands)
const sandbox = new PersistentSandbox("z-thread-node-v1");
await sandbox.start();
await sandbox.run("npm install");
await sandbox.run("npm test");
await sandbox.stop();
```

## Building Custom Templates

```bash
# Create template
cd sandbox-templates/z-thread-node
e2b template build -n my-custom-template

# Push to E2B
e2b template push my-custom-template
```

## Cost Considerations

E2B charges per sandbox-second. Optimize by:

- Using persistent sandboxes for multi-command workflows
- Uploading only necessary files
- Setting appropriate timeouts
- Using the right template (don't use e2e template for unit tests)

## Troubleshooting

### Sandbox timeout

Increase timeout:

```bash
SANDBOX_TIMEOUT=600000 npm run sandbox:test
```

### Agent Browser fails in E2B

Ensure using `z-thread-e2e-v1` template which has Chromium:

```bash
SANDBOX_TEMPLATE=z-thread-e2e-v1 npm run sandbox:test
```

### Large project upload fails

The runner automatically filters to essential files. If still failing, check that you don't have unusually large source files.

### E2B API key not found

```bash
export E2B_API_KEY=your_key
# Or add to .env
```

## Future Features (Not Yet Implemented)

- Best-of-N parallel execution (multiple agents racing)
- Visual snapshot comparison
- Custom sandbox templates
- Cost tracking dashboard

## Philosophy

> "Agents + Code + Isolation outperforms everything"

E2B adds the final piece: **true isolation**. Your agent can run any test, any number of times, without risk to your local environment. This is the foundation for real compute maxing - running dozens of agents in parallel, 24/7, with zero human oversight.
