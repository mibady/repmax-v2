# Agent Experts Usage Guide

**Pattern:** Pattern 05+ (Production Platforms with Self-Improving Agents)
**Created:** 2025-12-25

---

## Quick Start

### 1. Create Your First Expert

```bash
# Create a WebSocket expert by analyzing WebSocket-related files
ai-coder expert create websocket "src/server/websocket/**/*.ts"

# Create a database expert
ai-coder expert create database "src/lib/db/**/*.ts"

# Create an authentication expert
ai-coder expert create auth "src/lib/auth/**/*.ts"
```

### 2. List All Experts

```bash
ai-coder expert list
```

Output:
```
Found 3 domain expert(s):

📚 websocket
   Version: 1.0.0
   Confidence: 85.0%
   Learnings: 0
   Patterns: 2
   Last updated: 12/25/2025

📚 database
   Version: 1.0.0
   Confidence: 80.0%
   Learnings: 0
   Patterns: 3
   Last updated: 12/25/2025
```

### 3. Query a Specific Expert

```bash
ai-coder expert query websocket "How do we handle reconnections?"
```

The expert will:
1. Load its mental model
2. Validate understanding against source code
3. Answer based on accumulated knowledge
4. Update its mental model after answering

### 4. Ask Multiple Experts

```bash
# Ask all experts
ai-coder expert ask "How are user sessions managed?"

# Ask specific experts
ai-coder expert ask "How are WebSocket events stored?" --domains websocket,database
```

### 5. Auto-Discover Experts

```bash
# Auto-discover from src/ directory
ai-coder expert discover src

# Discover with custom depth
ai-coder expert discover src --depth 3
```

---

## Workflow Integration

### The 6-Phase Workflow

When you execute tasks through the AI Coder workflow, Phase 6 (Self-Improve) automatically updates relevant experts:

```typescript
import { StagedWorkflow } from './core/StagedWorkflow';

const workflow = new StagedWorkflow({
  enableSelfImprove: true,     // Enable Agent Experts
  autoIdentifyDomains: true,   // Auto-identify relevant experts
  parallelExperts: true        // Update experts in parallel
});

await workflow.executeWorkflow(
  'my-project',
  'Add real-time notifications using WebSocket'
);
```

**What happens:**
1. **Planning** - Consults relevant experts for context
2. **Building** - Executes the work
3. **Reviewing** - Code review
4. **Testing** - Runs tests
5. **Deploying** - Builds and deploys
6. **Self-Improve** - 🧠 **Experts update their mental models**

---

## Programmatic Usage

### Creating Experts Programmatically

```typescript
import { ExpertFactory } from './meta/ExpertFactory';

// Create single expert
const wsExpert = await ExpertFactory.createExpertFromCodebase(
  'websocket',
  'src/server/websocket/**/*.ts'
);

// Create multiple experts from directory structure
const experts = await ExpertFactory.createExpertsFromDirectory(
  'src/server',
  2  // depth
);
```

### Using the Orchestrator

```typescript
import { ExpertOrchestrator } from './agents/ExpertOrchestrator';

const orchestrator = new ExpertOrchestrator();

// Register experts
orchestrator.registerExpert('websocket');
orchestrator.registerExpert('database');
orchestrator.registerExpert('auth');

// Query single expert
const wsExpert = orchestrator.getExpert('websocket');
await wsExpert.loadMentalModel();
const answer = await wsExpert.executeWork('How do we handle errors?');

// Query multiple experts in parallel
const synthesized = await orchestrator.queryExperts(
  ['websocket', 'database', 'auth'],
  'How do we ensure WebSocket events are properly authenticated and stored?'
);

console.log(synthesized);
```

### Direct Expert Usage

```typescript
import { DomainExpertAgent } from './agents/DomainExpertAgent';
import { AgentMemory } from './services/agentMemory';

const expert = new DomainExpertAgent(
  'websocket-expert',
  'websocket',
  new AgentMemory()
);

// Load mental model
await expert.loadMentalModel();

// Execute work (automatically triggers self-improve after completion)
const result = await expert.executeWork('Add reconnection logic');

// Manual self-improve
await expert.selfImprove('Completed feature X');
```

---

## Expert Mental Models

### Understanding Expertise Files

Expertise files are stored in `.ai-coder/experts/{domain}/expertise.yaml`:

```yaml
expert:
  domain: websocket
  version: 1.3.2
  last_updated: '2025-12-25T10:00:00Z'
  confidence: 0.92          # 0.0 to 1.0

mental_model:
  architecture:
    entry_points:           # Main entry points
      - file: src/server/websocket/handler.ts
        function: handleWebSocketConnection
        purpose: Main WebSocket connection handler

    event_flow:             # How data flows
      - step: 1
        description: Client connects
        file: src/server/api/ws.ts

    state_management:       # Where state is stored
      - store: Redis (Upstash)
        key_pattern: 'ws:session:{userId}'
        purpose: Active connection tracking

  patterns:                 # Reusable patterns
    - name: Event Broadcasting
      implementation: Supabase real-time subscriptions
      files:
        - src/lib/realtime/broadcast.ts

  dependencies:             # Key dependencies
    primary:
      '@supabase/supabase-js': ^2.39.0

  common_pitfalls:          # Things to avoid
    - issue: Memory leaks from unclosed connections
      solution: Implement cleanup in handleDisconnect

learnings:                  # Accumulated knowledge
  - date: '2025-12-20'
    task: Added reconnection logic
    insight: WebSocket reconnects need exponential backoff
    files_modified:
      - src/hooks/useWebSocket.ts

validation:                 # Mental model validation
  last_validated: '2025-12-25T10:00:00Z'
  source_files_checked:
    - src/server/websocket/handler.ts
  discrepancies: []
  confidence_score: 0.92
```

### Confidence Scoring

Expert confidence adjusts automatically:

- **Increases** when:
  - Mental model validated successfully against source code
  - New learnings added
  - Patterns successfully applied

- **Decreases** when:
  - Source files no longer exist
  - Validation finds discrepancies
  - Time passes without validation

---

## Meta-Agentics

### Meta-Prompts (Prompts that Write Prompts)

```typescript
import { MetaPromptBuilder } from './meta/MetaPromptBuilder';

// Create expert creation prompt
const prompt = MetaPromptBuilder.buildExpertCreationPrompt(
  'websocket',
  ['src/server/websocket/handler.ts'],
  { 'src/server/websocket/handler.ts': '...' }
);

// Create self-improve prompt
const improvePrompt = MetaPromptBuilder.buildSelfImprovePrompt(
  'websocket',
  'Add reconnection logic',
  gitDiff,
  filesModified,
  currentExpertise
);

// Create synthesis prompt (combine multiple expert perspectives)
const synthesisPrompt = MetaPromptBuilder.buildSynthesisPrompt(
  'How are events stored?',
  [
    { domain: 'websocket', answer: '...' },
    { domain: 'database', answer: '...' }
  ]
);
```

### Meta-Agents (Agents that Build Agents)

The `ExpertFactory` is a meta-agent - it creates other agents:

```typescript
// This agent creates websocket expert agent
const expert = await ExpertFactory.createExpertFromCodebase(
  'websocket',
  'src/**/*websocket*.ts'
);
```

---

## Best Practices

### 1. Create Domain-Specific Experts

❌ **Don't:** Create one giant "general" expert

✅ **Do:** Create focused experts for specific domains:
- `websocket` - WebSocket handling
- `database` - Database operations
- `auth` - Authentication
- `api` - API routes
- `ui` - UI components

### 2. Let Experts Learn Automatically

The self-improve phase runs automatically after each task. You don't need to manually update experts.

### 3. Query Multiple Experts for Complex Questions

For questions spanning multiple domains, query all relevant experts:

```bash
ai-coder expert ask "How do we authenticate WebSocket connections and store events?" \
  --domains websocket,auth,database
```

### 4. Validate Regularly

Experts auto-validate when loaded, but you can manually check:

```bash
ai-coder expert status websocket
```

### 5. Use Auto-Discovery for New Projects

When starting with a new codebase:

```bash
# Discover all possible experts
ai-coder expert discover src --depth 3

# Review what was created
ai-coder expert list

# Ask a broad question to see if experts understand the code
ai-coder expert ask "What is the architecture of this application?"
```

---

## Advanced Usage

### Deploy Multiple Experts for Accuracy

Deploy 3 experts on the same question to synthesize perspectives:

```typescript
const orchestrator = new ExpertOrchestrator();

// Create 3 instances of websocket expert
orchestrator.registerExpert('websocket-1');
orchestrator.registerExpert('websocket-2');
orchestrator.registerExpert('websocket-3');

// Query all 3 in parallel
const answer = await orchestrator.queryExperts(
  ['websocket-1', 'websocket-2', 'websocket-3'],
  'Explain the exact WebSocket event flow'
);

// Orchestrator synthesizes the 3 perspectives
```

### Custom Expert Configuration

```typescript
const expert = new DomainExpertAgent(
  'custom-expert',
  'my-domain',
  memory
);

// Load custom expertise file
await expert.loadMentalModel();

// Get expertise for inspection
const expertise = expert.getExpertise();

// Manually trigger self-improve
await expert.selfImprove('Custom task');

// Save updated mental model
await expert.saveMentalModel();
```

---

## MCP Integration

### Available MCP Tools

When using ai-coder as an MCP server, these tools are available:

```typescript
// Query a domain expert
mcp.call('query_domain_expert', {
  domain: 'websocket',
  question: 'How do we handle reconnections?'
});

// List all experts
mcp.call('list_domain_experts', {});

// Deploy parallel experts
mcp.call('deploy_parallel_experts', {
  domains: ['websocket', 'database', 'auth'],
  question: 'How are sessions managed?'
});
```

---

## Troubleshooting

### Expert Has Low Confidence

```bash
# Check what's wrong
ai-coder expert status websocket

# If files are missing or changed, the expert will have discrepancies listed
# The expert will auto-update next time it's used
```

### No Experts Found

```bash
# Create experts manually
ai-coder expert create websocket "src/**/*websocket*.ts"

# Or auto-discover
ai-coder expert discover src
```

### Expert Gives Wrong Answer

Experts learn over time. If an answer is wrong:

1. Correct it by executing a task that fixes the issue
2. The expert will learn from the correction via self-improve
3. Next time, the expert will have that learning in its mental model

---

## Examples

### Example 1: WebSocket Expert Workflow

```bash
# 1. Create expert
ai-coder expert create websocket "src/server/websocket/**/*.ts"

# 2. Execute a task (triggers self-improve)
# Via workflow or directly:
ai-coder expert query websocket "Add error handling to WebSocket connections"

# 3. Check what the expert learned
ai-coder expert status websocket

# Output shows new learning:
# Learnings: 1
# Recent learnings:
#   • 2025-12-25: Error handling should use try/catch with exponential backoff
```

### Example 2: Multi-Expert Synthesis

```bash
# Ask about authentication across domains
ai-coder expert ask "How do we authenticate users across WebSocket and API endpoints?" \
  --domains websocket,api,auth

# Each expert provides their perspective:
# - websocket expert: JWT validation in WebSocket middleware
# - api expert: Bearer token in API routes
# - auth expert: Token generation and refresh logic

# Orchestrator synthesizes into cohesive answer
```

### Example 3: Auto-Discover & Query

```bash
# Discover all experts from codebase
ai-coder expert discover src --depth 2

# List what was found
ai-coder expert list

# Ask all discovered experts
ai-coder expert ask "What are the main architectural patterns?"
```

---

## Summary

Agent Experts transform AI agents from stateless task executors into **self-improving domain specialists** that:

1. ✅ Maintain persistent knowledge (mental models)
2. ✅ Validate understanding against source code
3. ✅ Learn from every task execution
4. ✅ Answer questions with accumulated expertise
5. ✅ Collaborate with other experts for complex questions

**Key Commands:**
- `ai-coder expert create <domain> <pattern>` - Create expert
- `ai-coder expert list` - List all experts
- `ai-coder expert query <domain> <question>` - Query single expert
- `ai-coder expert ask <question> --domains <list>` - Query multiple experts
- `ai-coder expert status [domain]` - Check expert status
- `ai-coder expert discover [dir]` - Auto-create experts

**The workflow automatically runs Phase 6 (Self-Improve) after every task, ensuring experts continuously evolve their understanding of your codebase.**

---

**Next Steps:**
1. Create your first expert
2. Execute some tasks
3. Check what the expert learned
4. Query the expert with questions

The more you use experts, the smarter they become!
