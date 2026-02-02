# Z-Thread Infrastructure (E2B Integrated)

**Zero Touch Agentic Coding with E2B Sandbox Execution**

Full compute isolation - tests run in cloud sandboxes, not on your machine.

## What's Different from Local Z-Thread?

| Feature | Local Z-Thread | E2B Z-Thread |
|---------|---------------|--------------|
| **Test execution** | Your machine | E2B cloud sandbox |
| **Isolation** | Process-level | Full container |
| **Parallelism** | Git worktrees | N sandboxes |
| **Can damage local** | Theoretically | Impossible |
| **Agent Browser** | Local Chromium | Cloud Chromium |
| **Scale** | Your CPU | E2B's cloud |

## Architecture

```
+-------------------------------------------------------------+
|                    YOUR DESKTOP                              |
|  +-------------------------------------------------------+  |
|  |  Claude Code + Z-Thread Hooks                         |  |
|  |  - pre-tool-safety (blocks destructive locally)       |  |
|  |  - post-tool-validator (quick local checks)           |  |
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

# 3. Build sandbox templates (one-time)
npm run e2b:build
npm run e2b:build:e2e

# 4. Copy hooks to your project
cp -r .claude/hooks/ /path/to/your/project/.claude/hooks/

# 5. Run a Z-Thread
./scripts/z-thread.sh your-project "Implement user auth"
```

## Environment Variables

```bash
# Required
E2B_API_KEY=your_e2b_api_key

# Optional
Z_THREAD_E2B_ENABLED=true          # Enable E2B (default: true)
Z_THREAD_E2B_TEMPLATE=z-thread-node-v1  # Default template
Z_THREAD_E2B_TIMEOUT=300000        # Sandbox timeout (5 min)
Z_THREAD_PARALLEL_EVALUATORS=false # Run evaluators in parallel
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
|   +-- pre-tool-safety.ts      # Local: blocks destructive commands
|   +-- stop-validator.ts       # E2B: runs all gates in sandbox
|   +-- index.ts
|
+-- .ai-coder/workflows/
|   +-- backend-z-thread.ts     # Full automation, E2B tests
|   +-- frontend-hybrid-thread.ts # E2B tests + visual review
|   +-- types.ts
|
+-- src/services/
|   +-- e2b-runner.ts           # E2B SDK wrapper
|
+-- scripts/
|   +-- z-thread.sh             # CLI trigger
|   +-- best-of-n-e2b.ts        # Parallel sandboxes
|
+-- skills/
    +-- quality-gates/SKILL.md
    +-- ralph-wiggum/SKILL.md
    +-- agent-browser/SKILL.md
```

## Quality Gates (E2B Execution)

### Blocking Gates (must pass)

| Gate | Command | Runs In |
|------|---------|---------|
| TypeScript | `npm run typecheck` | E2B |
| ESLint | `npm run lint` | E2B |
| Unit Tests | `npm test -- --run` | E2B |
| Coverage | `npm test -- --coverage` | E2B |
| Build | `npm run build` | E2B |
| E2E Tests | `npm run test:e2e:agent-browser` | E2B (e2e template) |
| CodeRabbit | `npx coderabbit review` | Local (needs GitHub) |

### Non-Blocking (warnings)

| Gate | Command | Runs In |
|------|---------|---------|
| Visual Snapshot | `agent-browser screenshot` | E2B (e2e template) |

## Parallel Execution (Best-of-N)

Run N Z-Threads in parallel E2B sandboxes:

```bash
npx tsx scripts/best-of-n-e2b.ts "Fix login bug" 5
```

This:
1. Creates 5 E2B sandboxes
2. Uploads project files to each
3. Runs Z-Thread in parallel
4. First to pass all gates wins
5. Downloads winning code
6. Destroys all sandboxes

## Workflow: Backend (Full Z-Thread)

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
import { runInSandbox, PersistentSandbox } from './src/services/e2b-runner';

// One-off execution
const result = await runInSandbox('npm test -- --run', {
  template: 'z-thread-node-v1',
  files: projectFiles,
  cwd: '/home/user/project',
  timeout: 180000,
});

// Persistent session (multiple commands)
const sandbox = new PersistentSandbox('z-thread-node-v1');
await sandbox.start();
await sandbox.run('npm install');
await sandbox.run('npm test');
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
Z_THREAD_E2B_TIMEOUT=600000 ./scripts/z-thread.sh project "task"
```

### Agent Browser fails in E2B

Ensure using `z-thread-e2e-v1` template which has Chromium:
```typescript
{
  runInE2B: true,
  e2bTemplate: 'z-thread-e2e-v1',
}
```

### Large project upload fails

Filter files in `uploadPatterns`:
```typescript
uploadPatterns: [
  'package.json',
  'src/**/*.ts',  // Only source
  // Exclude node_modules, dist, etc.
]
```

### E2B API key not found

```bash
export E2B_API_KEY=your_key
# Or add to .env
```

## Migration from Local Z-Thread

If you have the local Z-Thread infrastructure, upgrading is straightforward:

1. Replace `.claude/hooks/stop-validator.ts` with E2B version
2. Add `src/services/e2b-runner.ts`
3. Update workflow files
4. Build sandbox templates
5. Set `E2B_API_KEY`

The hooks API is unchanged - only the execution location changes.

## Philosophy

> "Agents + Code + Isolation outperforms everything"

E2B adds the final piece: **true isolation**. Your agent can run any test, any number of times, without risk to your local environment. This is the foundation for real compute maxing - running dozens of agents in parallel, 24/7, with zero human oversight.
