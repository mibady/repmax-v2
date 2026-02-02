# Agent Experts Workflow Implementation

**Pattern:** Pattern 05+ (Production Platforms with Self-Improving Agents)
**Status:** Implementation Guide
**Created:** 2025-12-25

---

## Overview

The **Agent Experts workflow** transforms agents from task executors into self-improving experts that maintain persistent, evolving understanding of specific domains by autonomously updating their mental models after every action.

### Core Problem Solved
**Generic agents "forget"** - they reset after every task with no accumulated expertise.

**Agent Experts "remember"** - they execute, learn, and update their understanding automatically.

---

## Architecture Integration

### Mapping to Existing ai-coder Framework

| Agent Experts Concept | ai-coder Equivalent | Status |
|----------------------|---------------------|--------|
| **Expertise File (YAML)** | Domain-specific mental models | ⚠️ NEW |
| **Mental Model Validation** | Code analysis + RAG verification | ⚠️ ENHANCE |
| **3-Step Workflow** | 6-Phase workflow (add Self-Improve) | ⚠️ ENHANCE |
| **Meta-Agentics** | Pattern 04 Multi-Agent Orchestrator | ✅ EXISTS |
| **Domain Experts** | Specialized StatefulAgents | ⚠️ ENHANCE |
| **Self-Improve Loop** | Session learning + automatic pattern detection | ⚠️ ENHANCE |

### Enhanced 6-Phase Workflow

```
┌─────────────────────────────────────────────────────────┐
│ PHASE 1: PLANNING                                       │
│ - Agent reads expertise file (mental model)             │
│ - Validates understanding against source code           │
│ - Creates execution plan                                │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ PHASE 2: BUILDING                                       │
│ - Execute work against plan                             │
│ - Track all changes (files modified, code written)      │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ PHASE 3: REVIEWING                                      │
│ - CodeRabbit review                                     │
│ - Quality gates (0 blockers)                            │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ PHASE 4: TESTING                                        │
│ - Run unit tests (Jest)                                 │
│ - Run E2E tests (Playwright)                            │
│ - Verify 70% coverage                                   │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ PHASE 5: DEPLOYING                                      │
│ - Build verification                                    │
│ - Deployment (if configured)                            │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ PHASE 6: SELF-IMPROVE (NEW - Agent Experts)            │
│ - Analyze git diff of changes                           │
│ - Extract learnings from session                        │
│ - Update expertise file (mental model)                  │
│ - Index new patterns in knowledge base                  │
│ - Validate updated mental model                         │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Components

### 1. Expertise Files (Mental Models)

**Location:** `.ai-coder/experts/{domain}/expertise.yaml`

**Example Structure:**

```yaml
# .ai-coder/experts/websocket/expertise.yaml
expert:
  domain: "WebSocket Event Flow"
  version: "1.3.0"
  last_updated: "2025-12-25T10:30:00Z"
  confidence: 0.92

mental_model:
  architecture:
    entry_points:
      - file: "src/server/websocket/handler.ts"
        function: "handleWebSocketConnection"
        purpose: "Main WebSocket connection handler"

    event_flow:
      - step: 1
        description: "Client connects to /ws endpoint"
        file: "src/server/api/ws.ts"
        handler: "wsRoute"

      - step: 2
        description: "Connection authenticated via JWT"
        file: "src/lib/auth/ws-auth.ts"
        handler: "authenticateWsConnection"

      - step: 3
        description: "Event stored in Supabase real-time"
        file: "src/lib/db/events.ts"
        table: "websocket_events"
        rls_policy: "authenticated users only"

    state_management:
      - store: "Redis (Upstash)"
        key_pattern: "ws:session:{userId}"
        purpose: "Active connection tracking"

      - store: "Supabase"
        table: "user_sessions"
        purpose: "Persistent session history"

  patterns:
    - name: "Event Broadcasting"
      implementation: "Supabase real-time subscriptions"
      files:
        - "src/lib/realtime/broadcast.ts"
        - "src/hooks/useRealtimeEvents.ts"

    - name: "Connection Pooling"
      implementation: "Redis connection registry"
      files:
        - "src/server/websocket/pool.ts"

  dependencies:
    primary:
      - "@supabase/supabase-js": "^2.39.0"
      - "@upstash/redis": "^1.35.6"

    related:
      - "ai": "^5.0.0"  # For AI-driven event responses

  common_pitfalls:
    - issue: "Memory leaks from unclosed connections"
      solution: "Implement cleanup in handleDisconnect"
      file: "src/server/websocket/cleanup.ts"

    - issue: "Race conditions on simultaneous events"
      solution: "Use Redis locks with expiry"
      file: "src/lib/locks/redis-lock.ts"

learnings:
  - date: "2025-12-20"
    task: "Added reconnection logic"
    insight: "WebSocket reconnects need exponential backoff (2s, 4s, 8s, 16s)"
    files_modified:
      - "src/hooks/useWebSocket.ts"

  - date: "2025-12-22"
    task: "Fixed event ordering"
    insight: "Events must be timestamped server-side to prevent client clock drift"
    files_modified:
      - "src/server/websocket/events.ts"
      - "src/lib/db/events.ts"

validation:
  last_validated: "2025-12-25T10:30:00Z"
  source_files_checked:
    - "src/server/websocket/handler.ts"
    - "src/lib/db/events.ts"
    - "src/hooks/useWebSocket.ts"

  discrepancies: []
  confidence_score: 0.92
```

---

### 2. Domain Expert Agent Class

**File:** `src/agents/DomainExpertAgent.ts`

```typescript
import { StatefulAgent } from './StatefulAgent';
import { AgentMemory } from '../services/agentMemory';
import * as fs from 'fs/promises';
import * as yaml from 'js-yaml';
import { glob } from 'glob';
import { execSync } from 'child_process';

interface ExpertiseFile {
  expert: {
    domain: string;
    version: string;
    last_updated: string;
    confidence: number;
  };
  mental_model: {
    architecture: any;
    patterns: any[];
    dependencies: any;
    common_pitfalls: any[];
  };
  learnings: Array<{
    date: string;
    task: string;
    insight: string;
    files_modified: string[];
  }>;
  validation: {
    last_validated: string;
    source_files_checked: string[];
    discrepancies: any[];
    confidence_score: number;
  };
}

export class DomainExpertAgent extends StatefulAgent {
  private expertisePath: string;
  private expertise: ExpertiseFile | null = null;

  constructor(
    agentId: string,
    domain: string,
    memory: AgentMemory
  ) {
    super(agentId, memory);
    this.expertisePath = `.ai-coder/experts/${domain}/expertise.yaml`;
  }

  /**
   * STEP 1: Load and validate mental model before planning
   */
  async loadMentalModel(): Promise<void> {
    console.log(`[${this.agentId}] Loading mental model from ${this.expertisePath}`);

    try {
      const content = await fs.readFile(this.expertisePath, 'utf-8');
      this.expertise = yaml.load(content) as ExpertiseFile;

      console.log(`[${this.agentId}] Mental model loaded: ${this.expertise.expert.domain} v${this.expertise.expert.version}`);
      console.log(`[${this.agentId}] Confidence: ${this.expertise.expert.confidence * 100}%`);

      // Validate against source code
      await this.validateMentalModel();
    } catch (error) {
      console.warn(`[${this.agentId}] No existing mental model found. Will create new one.`);
      this.expertise = this.createEmptyExpertise();
    }
  }

  /**
   * STEP 2: Validate mental model against actual source code
   */
  async validateMentalModel(): Promise<void> {
    if (!this.expertise) return;

    console.log(`[${this.agentId}] Validating mental model against source code...`);

    const filesToCheck = this.expertise.validation.source_files_checked;
    const discrepancies: any[] = [];

    for (const file of filesToCheck) {
      try {
        await fs.access(file);
        // File exists - could do deeper validation here
      } catch {
        discrepancies.push({
          file,
          issue: 'File no longer exists',
          severity: 'high'
        });
      }
    }

    this.expertise.validation.discrepancies = discrepancies;
    this.expertise.validation.last_validated = new Date().toISOString();

    if (discrepancies.length > 0) {
      console.warn(`[${this.agentId}] Found ${discrepancies.length} discrepancies in mental model`);
      this.expertise.expert.confidence *= 0.8; // Reduce confidence
    } else {
      console.log(`[${this.agentId}] Mental model is up to date`);
    }
  }

  /**
   * STEP 3: Execute work (Planning → Building → Reviewing → Testing → Deploying)
   */
  async executeWork(task: string): Promise<string> {
    console.log(`[${this.agentId}] Executing task: ${task}`);

    // Load mental model first
    await this.loadMentalModel();

    // Get context from mental model
    const context = this.buildContextFromMentalModel();

    // Execute work (this would call existing workflow)
    const result = await super.processTask(task, context);

    // CRITICAL: Trigger self-improve after work is done
    await this.selfImprove(task);

    return result;
  }

  /**
   * STEP 4: SELF-IMPROVE - Analyze work and update mental model
   */
  async selfImprove(task: string): Promise<void> {
    console.log(`[${this.agentId}] Starting self-improvement phase...`);

    if (!this.expertise) {
      this.expertise = this.createEmptyExpertise();
    }

    // 1. Get git diff to see what changed
    const changes = await this.analyzeChanges();

    // 2. Extract insights from changes
    const insights = await this.extractInsights(task, changes);

    // 3. Update mental model with learnings
    this.expertise.learnings.push({
      date: new Date().toISOString().split('T')[0],
      task,
      insight: insights.summary,
      files_modified: changes.filesModified
    });

    // 4. Update architecture understanding if needed
    if (insights.architectureChanges.length > 0) {
      this.updateArchitecture(insights.architectureChanges);
    }

    // 5. Update patterns if new ones detected
    if (insights.newPatterns.length > 0) {
      this.updatePatterns(insights.newPatterns);
    }

    // 6. Bump version
    this.expertise.expert.version = this.incrementVersion(this.expertise.expert.version);
    this.expertise.expert.last_updated = new Date().toISOString();

    // 7. Re-validate
    await this.validateMentalModel();

    // 8. Save updated mental model
    await this.saveMentalModel();

    console.log(`[${this.agentId}] Self-improvement complete. New version: ${this.expertise.expert.version}`);
  }

  /**
   * Analyze git changes
   */
  private async analyzeChanges(): Promise<{
    diff: string;
    filesModified: string[];
    linesAdded: number;
    linesRemoved: number;
  }> {
    try {
      const diff = execSync('git diff HEAD~1 HEAD', { encoding: 'utf-8' });
      const filesModified = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf-8' })
        .split('\n')
        .filter(f => f.length > 0);

      const stats = execSync('git diff --stat HEAD~1 HEAD', { encoding: 'utf-8' });
      const linesMatch = stats.match(/(\d+) insertion.*?(\d+) deletion/);

      return {
        diff,
        filesModified,
        linesAdded: linesMatch ? parseInt(linesMatch[1]) : 0,
        linesRemoved: linesMatch ? parseInt(linesMatch[2]) : 0
      };
    } catch {
      return {
        diff: '',
        filesModified: [],
        linesAdded: 0,
        linesRemoved: 0
      };
    }
  }

  /**
   * Extract insights from changes using AI
   */
  private async extractInsights(task: string, changes: any): Promise<{
    summary: string;
    architectureChanges: any[];
    newPatterns: any[];
  }> {
    // This would use Vercel AI SDK to analyze the diff
    // and extract meaningful insights about what changed and why

    return {
      summary: `Completed: ${task}. Modified ${changes.filesModified.length} files.`,
      architectureChanges: [],
      newPatterns: []
    };
  }

  /**
   * Update architecture section of mental model
   */
  private updateArchitecture(changes: any[]): void {
    if (!this.expertise) return;

    for (const change of changes) {
      // Update architecture based on changes
      // This would be more sophisticated in practice
    }
  }

  /**
   * Update patterns section of mental model
   */
  private updatePatterns(patterns: any[]): void {
    if (!this.expertise) return;

    for (const pattern of patterns) {
      this.expertise.mental_model.patterns.push(pattern);
    }
  }

  /**
   * Build context from mental model for task execution
   */
  private buildContextFromMentalModel(): string {
    if (!this.expertise) return '';

    return `
# Domain Expertise: ${this.expertise.expert.domain}

## Architecture Understanding
${JSON.stringify(this.expertise.mental_model.architecture, null, 2)}

## Known Patterns
${this.expertise.mental_model.patterns.map(p => `- ${p.name}: ${p.implementation}`).join('\n')}

## Common Pitfalls to Avoid
${this.expertise.mental_model.common_pitfalls.map(p => `- ${p.issue}: ${p.solution}`).join('\n')}

## Recent Learnings
${this.expertise.learnings.slice(-5).map(l => `- ${l.date}: ${l.insight}`).join('\n')}
`;
  }

  /**
   * Save mental model to disk
   */
  private async saveMentalModel(): Promise<void> {
    if (!this.expertise) return;

    const dir = this.expertisePath.split('/').slice(0, -1).join('/');
    await fs.mkdir(dir, { recursive: true });

    const yamlContent = yaml.dump(this.expertise);
    await fs.writeFile(this.expertisePath, yamlContent, 'utf-8');

    console.log(`[${this.agentId}] Mental model saved to ${this.expertisePath}`);
  }

  /**
   * Create empty expertise file
   */
  private createEmptyExpertise(): ExpertiseFile {
    return {
      expert: {
        domain: this.agentId,
        version: '1.0.0',
        last_updated: new Date().toISOString(),
        confidence: 0.5
      },
      mental_model: {
        architecture: {},
        patterns: [],
        dependencies: {},
        common_pitfalls: []
      },
      learnings: [],
      validation: {
        last_validated: new Date().toISOString(),
        source_files_checked: [],
        discrepancies: [],
        confidence_score: 0.5
      }
    };
  }

  /**
   * Increment semantic version
   */
  private incrementVersion(version: string): string {
    const parts = version.split('.');
    parts[2] = (parseInt(parts[2]) + 1).toString();
    return parts.join('.');
  }
}
```

---

### 3. Expert Agent Orchestrator

**File:** `src/agents/ExpertOrchestrator.ts`

```typescript
import { DomainExpertAgent } from './DomainExpertAgent';
import { AgentMemory } from '../services/agentMemory';

export class ExpertOrchestrator {
  private experts: Map<string, DomainExpertAgent> = new Map();
  private memory: AgentMemory;

  constructor() {
    this.memory = new AgentMemory();
  }

  /**
   * Register a domain expert
   */
  registerExpert(domain: string): DomainExpertAgent {
    const expert = new DomainExpertAgent(`${domain}-expert`, domain, this.memory);
    this.experts.set(domain, expert);
    return expert;
  }

  /**
   * Get expert for a domain
   */
  getExpert(domain: string): DomainExpertAgent | undefined {
    return this.experts.get(domain);
  }

  /**
   * Query multiple experts in parallel and synthesize results
   */
  async queryExperts(domains: string[], question: string): Promise<string> {
    console.log(`Querying ${domains.length} experts: ${domains.join(', ')}`);

    const results = await Promise.all(
      domains.map(domain => {
        const expert = this.experts.get(domain);
        if (!expert) {
          throw new Error(`Expert not found: ${domain}`);
        }
        return expert.executeWork(question);
      })
    );

    // Synthesize results from all experts
    return this.synthesizeResults(results);
  }

  /**
   * Synthesize results from multiple experts
   */
  private synthesizeResults(results: string[]): string {
    // This would use AI to synthesize multiple expert perspectives
    // For now, just combine them
    return results.join('\n\n---\n\n');
  }

  /**
   * Get all registered experts
   */
  listExperts(): string[] {
    return Array.from(this.experts.keys());
  }
}
```

---

### 4. Integration with Existing Workflow

**File:** `src/core/StagedWorkflow.ts` (ENHANCED)

```typescript
// Add Self-Improve phase to existing 5-phase workflow

export class StagedWorkflow {
  // ... existing code ...

  async executeWorkflow(projectId: string, task: string): Promise<void> {
    console.log('Starting 6-phase workflow with Agent Experts...');

    // Phase 1: Planning
    await this.executePlanning(projectId, task);

    // Phase 2: Building
    await this.executeBuilding(projectId, task);

    // Phase 3: Reviewing
    await this.executeReviewing(projectId);

    // Phase 4: Testing
    await this.executeTesting(projectId);

    // Phase 5: Deploying
    await this.executeDeploying(projectId);

    // Phase 6: Self-Improve (NEW - Agent Experts)
    await this.executeSelfImprove(projectId, task);
  }

  /**
   * NEW: Phase 6 - Self-Improve
   */
  private async executeSelfImprove(projectId: string, task: string): Promise<void> {
    console.log('Phase 6: Self-Improve (Agent Experts)');

    const orchestrator = new ExpertOrchestrator();

    // Identify which domain experts should learn from this task
    const relevantDomains = await this.identifyRelevantDomains(task);

    for (const domain of relevantDomains) {
      const expert = orchestrator.registerExpert(domain);
      await expert.selfImprove(task);
    }

    console.log('Self-improvement complete for all relevant experts');
  }

  /**
   * Identify which domain experts are relevant to this task
   */
  private async identifyRelevantDomains(task: string): Promise<string[]> {
    // This would use AI or pattern matching to determine
    // which domains are relevant (e.g., "websocket", "database", "auth")

    // For now, return common domains
    return ['general'];
  }
}
```

---

### 5. MCP Tool Integration

**File:** `src/mcp/ai-coder-server.ts` (ADD NEW TOOLS)

```typescript
// Add new MCP tools for Agent Experts

server.tool(
  'query_domain_expert',
  'Query a specific domain expert for specialized knowledge',
  {
    domain: z.string().describe('Domain name (e.g., websocket, database, auth)'),
    question: z.string().describe('Question to ask the expert')
  },
  async ({ domain, question }) => {
    const orchestrator = new ExpertOrchestrator();
    const expert = orchestrator.getExpert(domain) || orchestrator.registerExpert(domain);

    await expert.loadMentalModel();
    const answer = await expert.executeWork(question);

    return {
      content: [
        {
          type: 'text',
          text: answer
        }
      ]
    };
  }
);

server.tool(
  'list_domain_experts',
  'List all registered domain experts and their expertise',
  {},
  async () => {
    const orchestrator = new ExpertOrchestrator();
    const experts = orchestrator.listExperts();

    return {
      content: [
        {
          type: 'text',
          text: `Registered Domain Experts:\n${experts.map(e => `- ${e}`).join('\n')}`
        }
      ]
    };
  }
);

server.tool(
  'deploy_parallel_experts',
  'Deploy multiple domain experts in parallel to answer a question',
  {
    domains: z.array(z.string()).describe('Array of domain names'),
    question: z.string().describe('Question for all experts')
  },
  async ({ domains, question }) => {
    const orchestrator = new ExpertOrchestrator();

    // Register all experts
    domains.forEach(domain => orchestrator.registerExpert(domain));

    // Query in parallel and synthesize
    const synthesized = await orchestrator.queryExperts(domains, question);

    return {
      content: [
        {
          type: 'text',
          text: synthesized
        }
      ]
    };
  }
);
```

---

## Usage Examples

### Example 1: Create WebSocket Expert

```bash
# Via CLI
ai-coder expert create websocket --analyze src/server/websocket/

# Expert will:
# 1. Analyze all WebSocket-related files
# 2. Build initial mental model
# 3. Save to .ai-coder/experts/websocket/expertise.yaml
```

### Example 2: Execute Task with Expert

```typescript
const orchestrator = new ExpertOrchestrator();
const wsExpert = orchestrator.registerExpert('websocket');

// Expert will:
// 1. Load mental model
// 2. Validate against source code
// 3. Execute task with domain knowledge
// 4. Update mental model after completion
await wsExpert.executeWork('Add reconnection logic with exponential backoff');
```

### Example 3: Query Multiple Experts in Parallel

```typescript
const orchestrator = new ExpertOrchestrator();

// Deploy 3 experts to answer question
const answer = await orchestrator.queryExperts(
  ['websocket', 'database', 'auth'],
  'How do we ensure WebSocket events are properly authenticated and stored?'
);

// Each expert provides perspective from their domain
// Orchestrator synthesizes into comprehensive answer
console.log(answer);
```

---

## Meta-Agentics Integration

### Meta-Prompts (Prompts that Write Prompts)

```typescript
// src/meta/MetaPromptBuilder.ts

export class MetaPromptBuilder {
  static buildExpertCreationPrompt(domain: string, files: string[]): string {
    return `
You are creating a new Domain Expert for: ${domain}

Analyze the following files:
${files.join('\n')}

Create a mental model (expertise.yaml) that includes:
1. Architecture overview
2. Key patterns used
3. Dependencies
4. Common pitfalls
5. Entry points and data flow

Format as YAML following the DomainExpertAgent schema.
`;
  }

  static buildSelfImprovePrompt(task: string, diff: string): string {
    return `
You just completed task: ${task}

Git diff:
${diff}

Update your mental model by:
1. Analyzing what changed and why
2. Extracting key insights
3. Identifying new patterns
4. Documenting pitfalls avoided
5. Updating architecture understanding

Provide structured updates for the expertise.yaml file.
`;
  }
}
```

### Meta-Agents (Agents that Build Agents)

```typescript
// src/meta/ExpertFactory.ts

export class ExpertFactory {
  /**
   * Meta-Agent: Creates domain experts automatically
   */
  static async createExpertFromCodebase(domain: string, pattern: string): Promise<DomainExpertAgent> {
    console.log(`Creating ${domain} expert from codebase analysis...`);

    // 1. Find relevant files
    const files = await glob(pattern);

    // 2. Analyze code structure
    const analysis = await this.analyzeFiles(files);

    // 3. Build initial mental model
    const expertise = await this.buildMentalModel(domain, analysis);

    // 4. Create expert agent
    const expert = new DomainExpertAgent(domain, domain, new AgentMemory());

    // 5. Save initial expertise
    await expert.saveMentalModel();

    return expert;
  }

  private static async analyzeFiles(files: string[]): Promise<any> {
    // Use AI to analyze code and extract patterns
    return {};
  }

  private static async buildMentalModel(domain: string, analysis: any): Promise<ExpertiseFile> {
    // Use AI to build structured mental model
    return {
      expert: {
        domain,
        version: '1.0.0',
        last_updated: new Date().toISOString(),
        confidence: 0.7
      },
      mental_model: analysis,
      learnings: [],
      validation: {
        last_validated: new Date().toISOString(),
        source_files_checked: [],
        discrepancies: [],
        confidence_score: 0.7
      }
    };
  }
}
```

---

## Directory Structure

```
.ai-coder/
├── experts/                      # Domain expert mental models
│   ├── websocket/
│   │   └── expertise.yaml
│   ├── database/
│   │   └── expertise.yaml
│   ├── auth/
│   │   └── expertise.yaml
│   └── api/
│       └── expertise.yaml
├── sessions/                     # Existing session storage
└── knowledge/                    # Existing knowledge base

src/
├── agents/
│   ├── DomainExpertAgent.ts     # NEW
│   ├── ExpertOrchestrator.ts    # NEW
│   └── StatefulAgent.ts         # Existing
├── meta/                         # NEW - Meta-agentics
│   ├── MetaPromptBuilder.ts
│   ├── ExpertFactory.ts
│   └── MetaSkills.ts
└── core/
    └── StagedWorkflow.ts         # Enhanced with Phase 6
```

---

## Benefits

### 1. Persistent Domain Knowledge
Experts maintain understanding across sessions without human intervention.

### 2. Specialized Expertise
Each expert focuses on specific domain (WebSocket, Database, Auth, etc.).

### 3. Validation Loop
Mental models constantly validated against actual source code.

### 4. Parallel Expert Deployment
Deploy 3+ experts to answer complex questions from multiple perspectives.

### 5. Self-Improving
Experts automatically update their understanding after every task.

### 6. Meta-Agentics
Build agents that create other agents, prompts that write prompts.

---

## Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1)
- [ ] Implement `DomainExpertAgent` class
- [ ] Create expertise file YAML schema
- [ ] Add mental model loading/saving
- [ ] Implement validation loop

### Phase 2: Self-Improve Workflow (Week 2)
- [ ] Add Phase 6 to `StagedWorkflow`
- [ ] Implement git diff analysis
- [ ] Add insight extraction using AI
- [ ] Auto-update mental models

### Phase 3: Expert Orchestration (Week 3)
- [ ] Implement `ExpertOrchestrator`
- [ ] Add parallel expert queries
- [ ] Build result synthesis
- [ ] Create expert registry

### Phase 4: MCP Integration (Week 4)
- [ ] Add MCP tools for experts
- [ ] Integrate with existing tools
- [ ] Test end-to-end workflow

### Phase 5: Meta-Agentics (Week 5)
- [ ] Implement `MetaPromptBuilder`
- [ ] Create `ExpertFactory`
- [ ] Add auto-expert-creation
- [ ] Meta-skills system

---

## Related Documentation

- [AI Coder Framework](/docs/AI-CODER-FRAMEWORK.md) - 5 Core Patterns
- [SDK CLI Architecture](/docs/SDK-CLI-ARCHITECTURE.md) - 3-Layer Architecture
- [Staged Workflow](/docs/workflows/staged-workflow.md) - Current 5-phase workflow
- [Agent Memory](/docs/services/agentMemory.md) - Existing memory system

---

**Status:** Implementation Guide Ready ✅
**Pattern:** Pattern 05+ (Self-Improving Production Platforms)
**Next Step:** Begin Phase 1 implementation
