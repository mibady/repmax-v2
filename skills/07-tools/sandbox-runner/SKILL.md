---
name: sandbox-runner
description: Run tests/builds in E2B cloud sandbox with MCP integration. Supports GitHub, Database, Stripe analysis and cagent workflows.
---

# Sandbox Runner

Run your quality gates (tests, lint, build) in isolated E2B cloud sandboxes instead of locally. Now with MCP integration for GitHub, Database, Stripe analysis and multi-agent workflows.

## When to Use

- Tests/builds are slow on your machine
- Browser tests bog down your laptop
- You want isolation (can't break local environment)
- Running parallel test attempts
- E2E tests with Chromium
- **GitHub repository analysis** (NEW)
- **Database queries in isolation** (NEW)
- **Stripe/Business intelligence reports** (NEW)
- **Multi-agent workflows with cagent** (NEW)

## Quick Start

```bash
# 1. Set E2B API key
export E2B_API_KEY=your_key_here

# 2. Run tests in cloud
npm run sandbox:test

# 3. Run all quality gates in cloud
npm run sandbox:all

# 4. Check configuration status
npm run sandbox:status
```

## First-Time Setup

### 1. E2B Account Setup

```bash
# Install E2B CLI globally (requires Node.js 20+)
npm install -g @e2b/cli

# Login to E2B (opens browser)
e2b auth login
```

### 2. Create the z-thread-node-v1 Template

The default template `z-thread-node-v1` must be created in your E2B account:

```bash
# Navigate to template directory
cd ai-coder/e2b-templates/z-thread-node-v1

# Create the template (takes ~1 minute)
e2b template create z-thread-node-v1 --dockerfile ./Dockerfile --memory-mb 2048 --cpu-count 2
```

**Template Dockerfile** (`e2b-templates/z-thread-node-v1/Dockerfile`):

```dockerfile
FROM node:20-bookworm

RUN apt-get update && apt-get install -y git curl wget && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@9

WORKDIR /home/user/project
ENV NODE_ENV=development
ENV CI=true
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

RUN mkdir -p /home/user && chmod 777 /home/user
CMD ["bash"]
```

### 3. Configure Your Project

Add sandbox scripts to your project's `package.json`:

```json
{
  "scripts": {
    "sandbox:test": "npx tsx ../../../ai-coder/scripts/sandbox-runner.ts --test",
    "sandbox:build": "npx tsx ../../../ai-coder/scripts/sandbox-runner.ts --build",
    "sandbox:lint": "npx tsx ../../../ai-coder/scripts/sandbox-runner.ts --lint",
    "sandbox:typecheck": "npx tsx ../../../ai-coder/scripts/sandbox-runner.ts --typecheck",
    "sandbox:all": "npx tsx ../../../ai-coder/scripts/sandbox-runner.ts --all",
    "sandbox:status": "npx tsx ../../../ai-coder/scripts/sandbox-runner.ts --status"
  }
}
```

**Note:** Adjust the relative path to `ai-coder/scripts/sandbox-runner.ts` based on your project location.

### 4. Set Environment Variables

```bash
# Add to your shell profile (~/.bashrc or ~/.zshrc)
export E2B_API_KEY=your_e2b_api_key

# Or add to your project's .env file
E2B_API_KEY=your_e2b_api_key
```

### 5. Verify Setup

```bash
npm run sandbox:status
```

## Commands

### Quality Gates

| Command                     | Description                                     |
| --------------------------- | ----------------------------------------------- |
| `npm run sandbox:test`      | Run tests in E2B sandbox                        |
| `npm run sandbox:lint`      | Run linting in E2B sandbox                      |
| `npm run sandbox:build`     | Run build in E2B sandbox                        |
| `npm run sandbox:typecheck` | Run TypeScript check in sandbox                 |
| `npm run sandbox:all`       | Run all gates (test + lint + build + typecheck) |
| `npm run sandbox:status`    | Show E2B and MCP configuration status           |

### MCP Templates (NEW)

| Command                  | Description                                     |
| ------------------------ | ----------------------------------------------- |
| `npm run sandbox:github` | GitHub repository analysis sandbox              |
| `npm run sandbox:db`     | Database query sandbox (Supabase/Neon/Postgres) |
| `npm run sandbox:stripe` | Business intelligence sandbox (Stripe + Slack)  |
| `npm run sandbox:docs`   | Documentation generator sandbox                 |
| `npm run sandbox:full`   | Full-stack agent with all MCP tools             |

### cagent Workflows (NEW)

| Command                     | Description                          |
| --------------------------- | ------------------------------------ |
| `npm run cagent:wrapper`    | Start E2B MCP server for cagent      |
| `npm run cagent:simple`     | Instructions for simple workflow     |
| `npm run cagent:enterprise` | Instructions for enterprise workflow |

## How It Works

```
Your Machine                          E2B Cloud
+------------------+                  +------------------+
|                  |   1. Upload      |                  |
|  Project Files   | ---------------> |  Sandbox VM      |
|                  |                  |                  |
|                  |   2. Execute     |  - Node.js 20    |
|  sandbox:test    | ---------------> |  - npm test      |
|                  |                  |                  |
|                  |   3. Results     |  - Vitest        |
|  Output/Errors   | <--------------- |  - TypeScript    |
|                  |                  |                  |
+------------------+                  +------------------+
                                             |
                                             v (destroyed after)
```

## MCP Integration (NEW)

The sandbox-runner now supports MCP (Model Context Protocol) for enhanced capabilities:

### Architecture

```
                    +---------------------+
                    |   cagent / Claude   |
                    +---------------------+
                             |
                    +---------------------+
                    |  E2B MCP Wrapper    |
                    |  (10 MCP Tools)     |
                    +---------------------+
                             |
        +--------------------+--------------------+
        |                    |                    |
+---------------+    +---------------+    +---------------+
| GitHub MCP    |    | Database MCP  |    | Business MCP  |
| - Octokit     |    | - Postgres    |    | - Stripe      |
| - Repo API    |    | - Supabase    |    | - Slack       |
+---------------+    | - Neon        |    +---------------+
                     +---------------+
```

### 10 MCP Tools Available

1. `execute_github_analysis` - Analyze GitHub repositories
2. `execute_database_query` - Query databases (Postgres/Supabase/Neon)
3. `execute_business_intel` - Generate Stripe + Slack reports
4. `execute_docs_generator` - Generate documentation
5. `execute_full_stack` - Full-stack operations with all tools
6. `run_quality_gates` - Run AI Coder quality gates
7. `query_rag` - Query AI Coder knowledge base
8. `create_interactive_sandbox` - Create long-lived sandbox
9. `execute_in_sandbox` - Execute in existing sandbox
10. `close_sandbox` - Close a sandbox

### 14 Core Services

The full-stack-agent template has access to 14 AI Coder services:

| Category       | Services                                  |
| -------------- | ----------------------------------------- |
| Database       | Supabase, Neon (auto-detect)              |
| AI/LLM         | Vercel AI SDK (OpenAI, Anthropic, Google) |
| Cache          | Upstash Redis, Vector, QStash             |
| Auth           | Clerk                                     |
| Payments       | Stripe                                    |
| Communications | Resend, Twilio                            |
| Workflow       | Inngest                                   |
| Security       | Arcjet                                    |
| Monitoring     | Sentry                                    |
| Media          | Mux, fal.ai, Sanity                       |
| Voice          | Deepgram                                  |
| Collaboration  | Liveblocks                                |
| Storage        | Vercel Blob                               |

## Environment Variables

### Required

| Variable      | Description      |
| ------------- | ---------------- |
| `E2B_API_KEY` | Your E2B API key |

### Quality Gates

| Variable           | Default            | Description                   |
| ------------------ | ------------------ | ----------------------------- |
| `SANDBOX_TIMEOUT`  | `300000`           | Timeout in ms (5 min default) |
| `SANDBOX_TEMPLATE` | `z-thread-node-v1` | E2B template to use           |

### MCP Integration

| Variable                    | Description                        |
| --------------------------- | ---------------------------------- |
| `ENABLE_MCP`                | Enable MCP servers (default: true) |
| `GITHUB_TOKEN`              | GitHub Personal Access Token       |
| `SUPABASE_URL`              | Supabase project URL               |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key          |
| `DATABASE_URL`              | Neon/Postgres connection string    |
| `STRIPE_SECRET_KEY`         | Stripe API key                     |
| `SLACK_BOT_TOKEN`           | Slack Bot Token                    |
| `NOTION_INTEGRATION_TOKEN`  | Notion integration token           |

### AI Services

| Variable            | Description       |
| ------------------- | ----------------- |
| `OPENAI_API_KEY`    | OpenAI API key    |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `CLERK_SECRET_KEY`  | Clerk secret key  |
| `RESEND_API_KEY`    | Resend API key    |

## Sandbox Templates

### Quality Gate Templates

#### z-thread-node-v1 (default)

General purpose Node.js sandbox:

- Node.js 20
- TypeScript
- Vitest
- ESLint

Use for: Unit tests, type checking, lint, build

#### z-thread-e2e-v1

E2E testing with Chromium:

- Node.js 20
- Chromium browser
- Agent Browser
- Xvfb (virtual display)

Use for: E2E tests, screenshots, visual testing

### MCP Templates (NEW)

#### github-analyst

GitHub repository analysis:

- @octokit/rest
- axios, date-fns

Use for: Repo analysis, PR reviews, code search

#### database-analyst

Database operations:

- pg, better-sqlite3
- @supabase/supabase-js

Use for: SQL queries, data analysis, migrations

#### business-intel

Business intelligence:

- stripe, @slack/web-api
- csv-writer, date-fns

Use for: Revenue reports, customer analytics

#### docs-generator

Documentation generation:

- @notionhq/client
- @octokit/rest
- markdown-it

Use for: Auto-generating docs from code

#### full-stack-agent

All MCP tools:

- All dependencies from above
- All 14 AI Coder services

Use for: Complex multi-tool workflows

## cagent Workflows (NEW)

### Simple Workflow

```yaml
# workflows/cagent/simple-workflow.yaml
workflows:
  analyze_github_repo:
    steps:
      - agent: developer
        task: "Analyze repository: {repository}"

  query_database:
    steps:
      - agent: developer
        task: "Query database for: {query_description}"
```

Run with:

```bash
cagent run workflows/cagent/simple-workflow.yaml \
  --workflow analyze_github_repo \
  --input repository="owner/repo"
```

### Enterprise Workflow

```yaml
# workflows/cagent/enterprise-platform.yaml
agents:
  product_manager:
    capabilities: [query_rag, execute_docs_generator]
  github_analyst:
    capabilities: [execute_github_analysis]
  database_engineer:
    capabilities: [execute_database_query]
  business_analyst:
    capabilities: [execute_business_intel]
  full_stack_developer:
    capabilities: [execute_full_stack, run_quality_gates]
  qa_engineer:
    capabilities: [run_quality_gates]

workflows:
  feature_development:
    steps:
      - agent: product_manager
        task: "Create PRP for: {user_request}"
      - agent: full_stack_developer
        task: "Implement feature"
      - agent: qa_engineer
        task: "Run quality gates"
      - agent: github_analyst
        task: "Create PR"
```

## Integration with Quality Gates

The sandbox-runner works alongside the quality-gates skill:

```
Local Development
       |
       v
+------------------+
|  sandbox:all     |  <-- Runs in E2B cloud
|  - test          |
|  - lint          |
|  - build         |
+------------------+
       |
       v (if pass)
+------------------+
|  git commit      |  <-- Runs locally
|  CodeRabbit      |
+------------------+
```

## SDK Usage

### Basic Usage

```typescript
import { runInSandbox, PersistentSandbox } from "./src/services/e2b-runner";

// One-off execution
const result = await runInSandbox("npm test -- --run", {
  template: "z-thread-node-v1",
  files: projectFiles,
  cwd: "/home/user/project",
  timeout: 180000,
});

console.log(result.success); // true/false
console.log(result.stdout); // test output
console.log(result.duration); // execution time

// Persistent session (multiple commands)
const sandbox = new PersistentSandbox("z-thread-node-v1");
await sandbox.start();
await sandbox.run("npm install");
await sandbox.run("npm test");
await sandbox.stop();
```

### MCP Template Usage (NEW)

```typescript
import { createMCPSandbox, executeCode } from "./src/services/e2b-mcp-wrapper";

// Create GitHub analyst sandbox
const sandbox = await createMCPSandbox("github-analyst");

const code = `
import { Octokit } from '@octokit/rest';
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const repo = await octokit.repos.get({ owner: 'e2b-dev', repo: 'fragments' });
console.log('Stars:', repo.data.stargazers_count);
`;

const result = await executeCode(sandbox, code);
console.log(result.output);

await sandbox.kill();
```

### AI Coder Services (NEW)

```typescript
import {
  getAICoderMCPConfig,
  getAICoderEnvVars,
  detectDatabaseProvider,
} from "./src/services/ai-coder-mcp-config";

// Get all configured services
const config = getAICoderMCPConfig();
console.log("Database:", detectDatabaseProvider()); // 'supabase' | 'neon' | 'none'

// Get env vars for sandbox
const envVars = getAICoderEnvVars(config);
// Includes: SUPABASE_URL, STRIPE_SECRET_KEY, etc.
```

## Convenience Functions

```typescript
import { runTests, runTypeCheck, runE2ETests } from "./src/services/e2b-runner";

// Run unit tests
const testResult = await runTests(projectFiles, "npm test -- --run");

// Run TypeScript check
const typeResult = await runTypeCheck(projectFiles);

// Run E2E tests with Agent Browser
const e2eResult = await runE2ETests(projectFiles, "http://localhost:3000");
```

## Cost Considerations

E2B charges per sandbox-second. Optimize by:

1. **Upload only needed files** - Don't upload node_modules
2. **Set appropriate timeouts** - Don't use 10 min for a 30 sec test
3. **Use the right template** - Don't use full-stack-agent for unit tests
4. **Use persistent sandboxes** - For multi-command workflows
5. **Use MCP templates wisely** - Only include needed MCP servers

## Troubleshooting

### E2B_API_KEY not found

```bash
export E2B_API_KEY=your_key
# Or add to .env
```

### Sandbox timeout

Increase timeout:

```bash
SANDBOX_TIMEOUT=600000 npm run sandbox:test
```

### Large project upload fails

The runner filters to only essential files. If still failing, check project size.

### Agent Browser fails in E2B

Ensure using the e2e template:

```bash
SANDBOX_TEMPLATE=z-thread-e2e-v1 npm run sandbox:test
```

### MCP servers not connecting

Check configuration:

```bash
npm run sandbox:status
```

Verify environment variables are set:

```bash
echo $GITHUB_TOKEN
echo $SUPABASE_URL
```

### Database provider not detected

Set explicitly:

```bash
export DATABASE_PROVIDER=supabase  # or 'neon'
```

## Files

| File                                        | Purpose                          |
| ------------------------------------------- | -------------------------------- |
| `src/services/e2b-runner.ts`                | E2B SDK wrapper                  |
| `src/services/mcp-config.ts`                | MCP server configuration         |
| `src/services/ai-coder-mcp-config.ts`       | 14 services configuration        |
| `src/services/e2b-mcp-wrapper.ts`           | MCP server for cagent            |
| `src/services/sandbox-templates.ts`         | Template definitions             |
| `src/types/fragment.ts`                     | Fragment schema types            |
| `scripts/sandbox-runner.ts`                 | CLI entry point                  |
| `workflows/cagent/simple-workflow.yaml`     | Simple cagent workflows          |
| `workflows/cagent/enterprise-platform.yaml` | Enterprise multi-agent workflows |

## Hook Enforcement

When used with `stitch-workflow`, sandbox testing is enforced via hooks:

### Sandbox Testing Validator

**File:** `.claude/hooks/sandbox-testing-validator.ts`

**What It Does:**
- Blocks local `npm run build`, `npm run test`, `npm run lint` commands
- Requires use of `npm run sandbox:*` commands instead
- Only active when E2B_API_KEY is set and stitch-workflow/sandbox-runner skill is read

### Bypass Options

```bash
# Disable sandbox enforcement entirely
export SKIP_SANDBOX_ENFORCEMENT=true

# Relaxed mode (warns but doesn't block)
export SANDBOX_ENFORCEMENT_MODE=relaxed
```

### State Tracking

Sandbox runs are tracked in `.claude/hooks/sandbox-state.json`:

```json
{
  "last_run": "2026-01-31T...",
  "command": "npm run sandbox:all",
  "success": true,
  "total_runs": 5,
  "successful_runs": 4,
  "failed_runs": 1
}
```

---

## Files Uploaded to Sandbox

The sandbox-runner automatically collects and uploads these files:

| Category          | Patterns                                                    |
| ----------------- | ----------------------------------------------------------- |
| Package files     | `package.json`, `package-lock.json`, `pnpm-lock.yaml`       |
| Config            | `tsconfig.json`, `next.config.*`, `vite.config.*`           |
| CSS/Tailwind      | `*.css`, `postcss.config.*`, `tailwind.config.*`            |
| ESLint            | `.eslintrc.*`, `eslint.config.*`                            |
| Environment       | `.env.test`, `.env.local`                                   |
| Middleware        | `middleware.ts`, `middleware.js`                            |
| Source            | `src/**/*`, `lib/**/*`, `app/**/*`, `components/**/*`       |
| Types             | `types/**/*.ts`, `types/**/*.d.ts`                          |
| Tests             | `__tests__/**/*`, `tests/**/*`                              |

**Excluded:** `node_modules`, `.git`, `.next`, `dist`, files > 1MB

---

## Related Skills

- `quality-gates` - Testing and code review workflows
- `ralph-wiggum` - Automated fix loops
- `agent-browser` - E2E testing with LLM agents
- `dna-layer` - Backend development (Supabase/Stripe)
- `stitch-workflow` - Design-first workflow that uses sandbox testing in Stage 11-12
