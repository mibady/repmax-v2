# AI Coder Framework: Coding Standards & Decision Framework

**Version:** 1.0
**Last Updated:** 2025-10-22
**Status:** Production Standard

---

## Executive Summary

This document defines the **mandatory coding standards and decision framework** for all projects built, maintained, or refactored using the AI Coder system. In an agent-first development environment, consistency is critical - this framework ensures that both human developers and AI agents follow the same architectural patterns, orchestration strategies, and implementation standards.

**Purpose:** Establish a consistent framework for:
- **When to do what** (Pattern Selection)
- **How to build it** (Implementation Standards)
- **When to escalate complexity** (Pattern Evolution)

---

## Table of Contents

1. [The 5 Core Agent Patterns](#1-the-5-core-agent-patterns)
2. [Pattern Selection Decision Tree](#2-pattern-selection-decision-tree)
3. [Agent Architecture Patterns](#3-agent-architecture-patterns)
4. [Multi-Agent Orchestration](#4-multi-agent-orchestration)
5. [The 3-Layer Architecture](#5-the-3-layer-architecture)
6. [Agent Handoff Patterns](#6-agent-handoff-patterns)
7. [Context Preservation Strategies](#7-context-preservation-strategies)
8. [Implementation Standards](#8-implementation-standards)
9. [PRP Process Integration](#9-prp-process-integration)
10. [Compliance & Validation](#10-compliance--validation)

---

## 1. The 5 Core Agent Patterns

These patterns form the **progression path** from simple iteration to production applications. Each pattern builds on the previous, with clear triggers for evolution.

### Pattern 01: Ad Hoc Prompts (Iterative Human-in-the-Loop)

**Description:** Direct, back-and-forth interaction with an agent to find a solution manually.

**When to Use:**
- ✅ First encounter with a new problem
- ✅ Exploratory work or prototyping
- ✅ One-off tasks with no repetition expected

**Implementation:**
```bash
# Direct CLI interaction
claude-code "Help me debug this authentication issue"
```

**Evolution Trigger:** Repeating the same task 3+ times → Move to Pattern 02

---

### Pattern 02: Reusable Prompt (Custom Command)

**Description:** Codifying a prompt into a reusable custom command (`.md` or `.toml` file).

**When to Use:**
- ✅ Task has been repeated 3+ times
- ✅ Clear, repeatable workflow identified
- ✅ No complex orchestration needed

**Implementation:**
```markdown
<!-- .claude/commands/debug-auth.md -->
# Debug Authentication Issues

Analyze the authentication flow and identify issues:
1. Check JWT token validation
2. Verify middleware order
3. Test session persistence
4. Review CORS configuration
```

**Usage:**
```bash
/debug-auth
```

**Evolution Trigger:** Need for specialization or parallelization → Move to Pattern 03

---

### Pattern 03: Subagent Pattern (Specialized Execution)

**Description:** A primary agent deploys one or more specialized subagents to handle focused tasks, often in parallel.

**When to Use:**
- ✅ Need to specialize (assign focused expertise)
- ✅ Need to parallelize (run tasks simultaneously)
- ✅ Multiple distinct capabilities required
- ✅ Task complexity exceeds single-agent capacity

**Implementation:**
```typescript
// Orchestrator coordinates specialized subagents
class OrchestratorAgent extends BaseAgent {
  private ragAgent: RAGAgent;      // Knowledge retrieval
  private mcpAgent: MCPAgent;      // Tool execution
  private chatAgent: ChatAgent;    // User interaction

  async execute(task: string): Promise<string> {
    // Parallel execution of specialized agents
    const [context, toolResults] = await Promise.all([
      this.ragAgent.query(task),
      this.mcpAgent.executeTool('github', { task })
    ]);

    // Synthesize results
    return this.chatAgent.respond(context, toolResults);
  }
}
```

**Evolution Trigger:** Need to interact with 3+ distinct services → Move to Pattern 04

**Code Review Gate:** ✋ **MANDATORY** - Run `/run-quality-gates` or `coderabbit review` before pattern evolution

---

### Pattern 04: MCP Wrapper (Integration Platform)

**Description:** A custom MCP server that acts as a dedicated interface for your agents, consolidating access to various tools and APIs.

**When to Use:**
- ✅ Agent needs to interact with 3+ distinct services
- ✅ Unique internal assets require standardized access
- ✅ Complex tool orchestration required
- ✅ Need centralized authentication/authorization

**Implementation:**
```typescript
// MCP Server consolidates tool access
export const mcpServer = new MCPServer({
  name: "enterprise-tools",
  tools: {
    github: githubToolkit,
    stripe: stripeToolkit,
    sendgrid: sendgridToolkit,
    internal: internalAPIToolkit
  }
});

// Agents access all tools through unified interface
const agent = new MCPAgent(mcpServer);
await agent.executeTool('github', { action: 'create-pr' });
await agent.executeTool('stripe', { action: 'create-subscription' });
```

**Evolution Trigger:** Long-term product vision with multiple interfaces → Move to Pattern 05

---

### Pattern 05: Full Application (Production Product)

**Description:** A complete software application with multiple interfaces (CLI, MCP server, UI, API). A full-fledged, long-term product.

**When to Use:**
- ✅ Long-term vision for a solution
- ✅ Building a product for end-users
- ✅ Multiple client interfaces required (Web, CLI, API)
- ✅ Production-grade requirements (auth, multi-tenancy, monitoring)

**Implementation:** See [The 3-Layer Architecture](#5-the-3-layer-architecture)

**Key Components:**
- Layer 1: Frontend (AG-UI Protocol)
- Layer 2: Backend (Vercel AI SDK)
- Layer 3: Data Services (Supabase + Upstash)

---

## 2. Pattern Selection Decision Tree

Use this decision tree to determine which pattern to implement:

```
START: New Task/Feature/Project
│
├─ First time encountering this problem?
│  └─ YES → Pattern 01: Ad Hoc Prompts
│      (Iterate manually, learn the solution)
│
├─ Repeated this task 3+ times?
│  └─ YES → Pattern 02: Reusable Prompt
│      (Create custom command in .claude/commands/)
│
├─ Need specialized agents or parallel execution?
│  └─ YES → Pattern 03: Subagent Pattern
│      (Build orchestrator with specialized subagents)
│
├─ Need to integrate 3+ external services?
│  └─ YES → Pattern 04: MCP Wrapper
│      (Build MCP server as unified tool interface)
│
└─ Building a long-term product with multiple interfaces?
   └─ YES → Pattern 05: Full Application
       (Implement 3-layer architecture with AG-UI)
```

### Complexity Score Matrix

| Pattern | Complexity | Time Investment | Maintenance | Scalability |
|---------|-----------|-----------------|-------------|-------------|
| 01      | Low       | Minutes         | None        | Not scalable |
| 02      | Low       | Hours           | Minimal     | Repeatable |
| 03      | Medium    | Days            | Low         | Parallelizable |
| 04      | High      | Weeks           | Medium      | Highly scalable |
| 05      | Very High | Months          | High        | Production-grade |

---

## 3. Agent Architecture Patterns

### 3.1 BaseAgent vs Orchestrator Agent

#### BaseAgent - Single-Purpose Execution

**Use when:** You need an agent to handle one specific task with a single LLM interaction.

**Characteristics:**
- ✅ Extends `BaseAgent` class directly
- ✅ Has ONE clear responsibility
- ✅ Executes ONE LLM call per task
- ✅ Returns a direct response

**Examples:**
```typescript
// ChatAgent - handles conversation
class ChatAgent extends BaseAgent {
  async chat(message: string): Promise<string> {
    return await this.run(messages);
  }
}

// RAGAgent - handles retrieval + generation
class RAGAgent extends BaseAgent {
  async query(question: string): Promise<string> {
    const context = await this.retrieve(question);
    return await this.generate(question, context);
  }
}
```

**Use Cases:**
- ✅ Simple chat interface
- ✅ Document Q&A (RAG)
- ✅ Single-step processing
- ✅ One agent does everything

---

#### Orchestrator Agent - Multi-Agent Coordination

**Use when:** You need to coordinate multiple agents or handle complex multi-step workflows.

**Characteristics:**
- ✅ Manages OTHER agents as subagents
- ✅ Decides which agent to call and when
- ✅ Combines results from multiple agents
- ✅ Does NOT directly call LLMs (delegates to subagents)

**Examples:**
```typescript
// Micro SDLC Orchestrator
class MicroSDLCOrchestrator extends BaseAgent {
  private plannerAgent: PlannerAgent;
  private builderAgent: BuilderAgent;
  private reviewerAgent: ReviewerAgent;

  async execute(task: string): Promise<SDLCResult> {
    // Step 1: Planning phase
    const plan = await this.plannerAgent.createPlan(task);

    // Step 2: Building phase
    const code = await this.builderAgent.implement(plan);

    // Step 3: Review phase
    const review = await this.reviewerAgent.analyze(code);

    return { plan, code, review };
  }
}
```

**Use Cases:**
- ✅ Complex workflows with multiple steps
- ✅ Need to combine different capabilities (RAG + Tools + Chat)
- ✅ Decision logic about which agent to use
- ✅ Sequential or parallel agent execution
- ✅ Business logic around agent coordination

---

### 3.2 Decision Matrix: BaseAgent vs Orchestrator

| Aspect              | BaseAgent                  | Orchestrator Agent                   |
|---------------------|----------------------------|--------------------------------------|
| **Purpose**         | Execute one specific task  | Coordinate multiple agents/tasks     |
| **LLM Calls**       | Makes LLM calls directly   | Delegates to subagents              |
| **Complexity**      | Simple, focused            | Complex, multi-step                  |
| **Example**         | ChatAgent, RAGAgent        | SdrAgent, MicroSDLC                  |
| **Inheritance**     | `extends BaseAgent`        | `extends BaseAgent` (or custom)      |
| **Sub-components**  | None                       | Has multiple subagents              |
| **Decision logic**  | Minimal                    | Significant (routing, coordination)  |

---

## 4. Multi-Agent Orchestration

### 4.1 Multi-Agent Orchestration Pattern

**Core Concept:** Move beyond a single agent performing a single task. Use a coordinator agent (orchestrator) that manages a team of specialized subagents to handle complex, multi-step workflows.

**Orchestrator Responsibilities:**

1. **Delegation:** Receives initial prompt and decides which specialized subagent to call first
2. **Validation & Transformation:** Validates output against predefined data contracts
3. **Data Flow Management:** Transforms Agent A's output to fit Agent B's input schema
4. **Aggregation:** Collects final outputs and synthesizes them into a coherent response

### 4.2 Strict Data Contract Pattern

**Key Principle:** Agent handoffs use **rigid JSON schemas** for inputs and outputs.

```typescript
// Define strict contracts
interface PlanOutput {
  tasks: Task[];
  dependencies: Dependency[];
  estimatedTime: number;
}

interface BuildInput {
  plan: PlanOutput; // Exact schema match required
  context: ProjectContext;
}

// Orchestrator enforces contracts
class Orchestrator {
  async handoff(planOutput: PlanOutput): Promise<BuildResult> {
    // Validate contract
    if (!this.validatePlanOutput(planOutput)) {
      throw new Error('Plan output does not match expected schema');
    }

    // Transform to BuildInput
    const buildInput: BuildInput = {
      plan: planOutput,
      context: await this.loadContext()
    };

    // Execute next agent
    return await this.builderAgent.build(buildInput);
  }
}
```

### 4.3 Real-World Orchestration Example: Micro SDLC

```typescript
// Micro SDLC: Software Development Life Cycle for microservices
class MicroSDLCSystem {
  private planner: PlannerAgent;
  private builder: BuilderAgent;
  private reviewer: ReviewerAgent;

  async executeSDLC(feature: string): Promise<SDLCResult> {
    // Phase 1: Planning
    const plan: PlanOutput = await this.planner.execute({
      feature,
      constraints: this.getConstraints()
    });

    // Validation checkpoint
    if (!this.validatePlan(plan)) {
      throw new Error('Invalid plan generated');
    }

    // Phase 2: Building (handoff validated plan)
    const code: CodeOutput = await this.builder.execute({
      plan, // Strict data contract
      templates: this.getTemplates()
    });

    // Phase 3: Review (handoff code)
    const review: ReviewOutput = await this.reviewer.execute({
      code,
      standards: this.getCodingStandards()
    });

    // Aggregate and return
    return { plan, code, review };
  }
}
```

---

## 5. The 3-Layer Architecture

**Pattern 05 (Full Application)** implements a **3-layer architecture** that provides clear separation of concerns for building, deploying, and maintaining scalable, AI-first systems.

### Layer 1: The "Face" (Frontend-to-Backend Communication)

**Purpose:** Interactive user interface for agent interaction

**Technology:**
- React UI Components
- `@ag-ui/client` + `@ag-ui/core`

**How it Works:**
- AG-UI SDK acts as an "agent-aware frontend"
- Uses Observable pattern with SSE streaming
- Handles real-time, asynchronous, multi-part responses (thoughts, tool calls, final text)
- Translates agent activity into coherent user experience

**Implementation:**
```typescript
// Frontend: AG-UI Client
import { useAgent } from '@ag-ui/client';

function ChatInterface() {
  const { agent, messages, isStreaming } = useAgent({
    endpoint: '/api/agent',
    streamMode: 'sse'
  });

  // Observable pattern handles streaming responses
  agent.onThought((thought) => console.log('Agent thinking:', thought));
  agent.onToolCall((tool) => console.log('Agent using tool:', tool));
  agent.onComplete((response) => console.log('Agent response:', response));

  return <ChatUI messages={messages} streaming={isStreaming} />;
}
```

---

### Layer 2: The "Head" & "Nervous System" (Backend & LLM Abstraction)

**Purpose:** Core backend logic and LLM abstraction

**Technology:**
- **Backend (Head):** Next.js API Routes (`app/api/`)
- **LLM Abstraction (Nervous System):** Vercel AI SDK (`ai` + `@ai-sdk/*`)

**How it Works:**
- API routes are the "home" for your agents
- Central coordinators (MCP Wrapper from Pattern 04)
- Receive standardized requests from "Face" (via AG-UI protocol)
- Orchestrate agent workflow
- Vercel AI SDK provides LLM-agnostic abstraction (avoids vendor lock-in)
- `streamText()` translates unified commands to specific API calls (OpenAI, Anthropic, Google, etc.)

**Implementation:**
```typescript
// Backend: Next.js API Route
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';

export async function POST(req: Request) {
  const { messages, provider } = await req.json();

  // LLM-agnostic abstraction
  const model = provider === 'openai' ? openai('gpt-4') : anthropic('claude-3-5-sonnet');

  // Unified streaming interface
  const result = streamText({
    model,
    messages,
    tools: {
      github: githubTool,
      database: databaseTool
    }
  });

  // SSE stream to frontend
  return result.toDataStreamResponse();
}
```

---

### Layer 3: The "DNA" (Data, Memory & Tools)

**Purpose:** Agent's unique identity, memory, and connection to the outside world

**Technology:**
- Supabase (PostgreSQL, RLS)
- Upstash (Redis, Vector, QStash)

**How it Works:**
- **System Prompts:** "DNA" or "source code" for agent behavior
- **Agent Tools:** Direct interaction with data layer
- **Persistence & Memory:** Supabase as long-term memory with RLS for multi-tenancy
- **Knowledge (RAG):** Upstash Vector for fast semantic searches
- **Cache:** Upstash Redis for short-term memory and expensive LLM call caching
- **Asynchronous Actions:** Upstash QStash for background jobs

**Implementation:**
```typescript
// Layer 3: Data & Services
import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';
import { Index } from '@upstash/vector';
import { Client } from '@upstash/qstash';

// Persistence
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Cache
const redis = new Redis({ url: UPSTASH_REDIS_URL, token: UPSTASH_REDIS_TOKEN });

// Knowledge Base (RAG)
const vectorIndex = new Index({ url: UPSTASH_VECTOR_URL, token: UPSTASH_VECTOR_TOKEN });

// Background Jobs
const qstash = new Client({ token: QSTASH_TOKEN });

// Agent Tool: Query Knowledge Base
async function queryKnowledgeBase(question: string) {
  // Check cache first
  const cached = await redis.get(`kb:${question}`);
  if (cached) return cached;

  // Vector search
  const results = await vectorIndex.query({
    vector: await embedQuestion(question),
    topK: 5
  });

  // Cache results
  await redis.set(`kb:${question}`, results, { ex: 3600 });

  return results;
}
```

---

### 3-Layer Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: The "Face" (Frontend)                          │
│ ─────────────────────────────────────────────────────── │
│ React UI + @ag-ui/client                                │
│ Observable Pattern + SSE Streaming                      │
│                                                         │
│ Handles: User interaction, real-time updates           │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP Request (AG-UI Protocol)
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 2: The "Head" & "Nervous System" (Backend)       │
│ ─────────────────────────────────────────────────────── │
│ Next.js API Routes + Vercel AI SDK                     │
│ LLM-Agnostic Abstraction                               │
│                                                         │
│ Handles: Agent orchestration, LLM calls, tool routing  │
└────────────┬───────────────┬────────────────────────────┘
             │               │
             │               │ Tool Calls
             │               │
             ▼               ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 3: The "DNA" (Data, Memory & Tools)              │
│ ─────────────────────────────────────────────────────── │
│ Supabase: PostgreSQL + RLS (Persistence)               │
│ Upstash Redis: Cache + Short-term memory               │
│ Upstash Vector: RAG + Semantic search                  │
│ Upstash QStash: Background jobs + Async tasks          │
│                                                         │
│ Handles: Data persistence, caching, knowledge, jobs    │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Agent Handoff Patterns

### 6.1 Event-Driven Handoffs

**Trigger Types:**
1. **Programmatic:** Orchestrator immediately calls next agent after previous completes
2. **Event-Based:** User action triggers handoff (e.g., drag task on Kanban board)
3. **Conditional:** Business logic determines next agent based on results

**Example: Event-Driven Kanban System**
```typescript
// User drags task from "Planning" to "Development"
async function onTaskMoved(taskId: string, fromStatus: string, toStatus: string) {
  if (fromStatus === 'planning' && toStatus === 'development') {
    // Load context from database
    const task = await db.tasks.findById(taskId);

    // Trigger BuilderAgent handoff
    await orchestrator.handoffToBuilder(task.plan);
  }
}
```

### 6.2 Strict Data Contract Handoffs

**Key Principle:** Output from Agent A must **perfectly validate** against input schema for Agent B.

```typescript
// Define schemas
const PlanOutputSchema = z.object({
  tasks: z.array(TaskSchema),
  dependencies: z.array(DependencySchema),
  estimatedTime: z.number()
});

const BuildInputSchema = z.object({
  plan: PlanOutputSchema,
  context: ProjectContextSchema
});

// Orchestrator validates handoff
async function handoffPlanToBuilder(planOutput: unknown) {
  // Validate Agent A's output
  const validatedPlan = PlanOutputSchema.parse(planOutput);

  // Transform to Agent B's input
  const buildInput = BuildInputSchema.parse({
    plan: validatedPlan,
    context: await loadProjectContext()
  });

  // Execute Agent B
  return await builderAgent.execute(buildInput);
}
```

---

## 7. Context Preservation Strategies

### 7.1 Three Context Preservation Methods

#### Method 1: Accumulating Payload (Short-Term / In-Memory)

**Use for:** Simple, synchronous workflows

**How it works:** Context is an "accumulating payload" that grows as workflow progresses.

```typescript
// Context accumulates through pipeline
async function simpleWorkflow(initialTask: string) {
  let payload = { task: initialTask };

  // Agent A adds to payload
  const planResult = await plannerAgent.execute(payload);
  payload = { ...payload, plan: planResult };

  // Agent B receives accumulated payload
  const buildResult = await builderAgent.execute(payload);
  payload = { ...payload, code: buildResult };

  // Agent C receives full accumulated context
  return await reviewerAgent.execute(payload);
}
```

---

#### Method 2: SDK Client (Conversational Context)

**Use for:** Single agent with continuous conversation

**How it works:** SDK client automatically manages chat history and feeds it back to LLM.

```typescript
// Stateful SDK maintains conversation history
import { createAgent } from '@ag-ui/core';

const agent = createAgent({
  model: 'gpt-4',
  systemPrompt: 'You are a helpful assistant'
});

// History is automatically maintained
await agent.chat('Hello'); // Message 1
await agent.chat('What did I just say?'); // Has context of Message 1
```

---

#### Method 3: External State (Long-Term / Asynchronous)

**Use for:** Complex applications with asynchronous workflows

**How it works:** State saved to external database; loaded when handoff triggered.

```typescript
// Save context to database
async function savePlanContext(taskId: string, plan: PlanOutput) {
  await db.tasks.update(taskId, {
    status: 'plan_complete',
    context: { plan }
  });
}

// Load context when handoff triggered
async function onUserTriggersHandoff(taskId: string) {
  // Load from database
  const task = await db.tasks.findById(taskId);

  // Pass context to next agent
  return await builderAgent.execute(task.context.plan);
}
```

---

## 8. Implementation Standards

### 8.1 Mandatory Template-First Development

**Rule:** Always start with established templates from `/ai-coder-workspace/templates/`

**The 10 Essential Templates** (Consolidated from 33):

**⭐ Pattern 05 - Full Applications (5 templates):**
- `template-nextjs-ai-chatbot`: Gold standard AI chatbot (most versatile)
- `template-e2b`: Code generation with E2B sandbox
- `template-multi-tenant-full-stack`: Multi-tenant SaaS with Clerk + Supabase
- `template-online-store-with-stripe`: E-commerce with Stripe payments
- `template-platforms-starter-kit`: Multi-site platform architecture

**🔹 Pattern 04 - MCP Wrappers (3 templates):**
- `template-upstash-vector-ai-sdk-starter`: RAG and semantic search
- `template-sanity-cms`: Headless CMS integration
- `templates-liveblocks-starter-kit`: Real-time collaboration

**🔸 Pattern 03 - Subagents (2 templates):**
- `template-ai-sdk-image-generator`: Multi-provider image AI
- `template-cron-jobs`: Automation and background jobs

**Template Selection Guide:**
```bash
# Quick selection by use case:
AI Chatbot         → template-nextjs-ai-chatbot
Code Generation    → template-e2b
Multi-tenant SaaS  → template-multi-tenant-full-stack
E-commerce         → template-online-store-with-stripe
RAG/Knowledge Base → template-upstash-vector-ai-sdk-starter
Not sure?          → template-nextjs-ai-chatbot (default)

# Scaffolding Command:
cp -r /home/mibady/ai-coder-workspace/templates/template-name ./my-project
cd my-project && npm install
```

**Full Selection Guide:** `/ai-coder-workspace/templates/README.md`

---

### 8.2 SDK-First Enforcement

**Rule:** Use official SDKs for all integrations. Never build custom API clients.

**Required SDKs:**
- **AG-UI:** `@ag-ui/client`, `@ag-ui/core`
- **Vercel AI SDK:** `ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`
- **Supabase:** `@supabase/supabase-js`
- **Upstash:** `@upstash/redis`, `@upstash/vector`, `@upstash/qstash`

---

### 8.3 Architecture Alignment Checklist

Before implementing any feature, verify alignment:

- [ ] **Pattern Selected:** Which of the 5 patterns applies?
- [ ] **Template Used:** Started from correct boilerplate?
- [ ] **Layer Identified:** Which layer (1, 2, or 3) is this feature in?
- [ ] **Agent Type:** BaseAgent or Orchestrator?
- [ ] **Handoff Defined:** If multi-agent, are data contracts defined?
- [ ] **Context Strategy:** How is context preserved?
- [ ] **Multi-Tenancy:** RLS enabled for Supabase? Metadata for Upstash?
- [ ] **Monitoring:** Real-time monitoring implemented?
- [ ] **Testing:** Tests written for all agents?

---

### 8.4 Anti-Patterns to Avoid

❌ **Custom API Clients:** Always use official SDKs
❌ **Skipping Templates:** Never start from scratch
❌ **Mixed Layers:** Don't blur Layer 1/2/3 responsibilities
❌ **God Agents:** Don't create single agents that do everything
❌ **Implicit Contracts:** Always define explicit data schemas for handoffs
❌ **Stateless Orchestrators:** Orchestrators must track context
❌ **Direct LLM Calls:** Always use Vercel AI SDK abstraction

---

## 9. PRP Process Integration

### 9.1 PRP (Problem-Requirements-Plan) Process

**Purpose:** Ensure proper planning and architectural alignment before implementation.

**When to Create PRPs:**
- New project initialization
- New feature development
- Major refactoring
- Integration of new services

### 9.2 PRP Template with Framework Integration

```markdown
# PRP: [Feature Name]

## Problem Statement
[Clear description of the problem]

## Requirements
[Functional and non-functional requirements]

## Framework Compliance

### Pattern Selection
**Selected Pattern:** [01, 02, 03, 04, or 05]

**Justification:**
- [ ] Complexity analysis completed
- [ ] Pattern evolution path considered
- [ ] Resource requirements estimated

### Architecture Layer
**Primary Layer:** [Layer 1 (Face) / Layer 2 (Head) / Layer 3 (DNA)]

**Cross-Layer Interactions:**
[Describe any interactions with other layers]

### Agent Architecture
**Agent Type:** [BaseAgent / Orchestrator]

**If Orchestrator:**
- Subagents required: [List specialized agents]
- Handoff sequence: [Describe agent-to-agent workflow]
- Data contracts: [Link to schema definitions]

### Context Preservation
**Strategy:** [Accumulating Payload / SDK Client / External State]

**Implementation:**
[Describe how context is maintained]

### Template Selection
**Template Used:** [agent-saas / agent-chat / rag-app / mcp-platform / multi-agent]

**Customizations Required:**
[List any necessary modifications]

## Implementation Plan
[Detailed implementation steps]

## Testing Strategy
[How will this be tested?]

## Monitoring & Observability
[How will this be monitored in production?]
```

---

## 10. Compliance & Validation

### 10.1 Pre-Implementation Checklist

Before writing any code, verify:

- [ ] PRP document created and approved
- [ ] Pattern selected from 5 core patterns
- [ ] Template identified and scaffolded
- [ ] Architecture layer assignments clear
- [ ] Agent type determined (BaseAgent vs Orchestrator)
- [ ] Data contracts defined (if multi-agent)
- [ ] Context preservation strategy selected
- [ ] Multi-tenancy requirements addressed
- [ ] Monitoring plan defined
- [ ] Testing approach documented

### 10.2 Code Review Checklist

During code review, verify:

- [ ] Follows selected pattern implementation
- [ ] Uses template structure (not custom)
- [ ] SDKs used correctly (no custom API clients)
- [ ] Layers properly separated
- [ ] Data contracts validated
- [ ] Context properly preserved
- [ ] Multi-tenancy enforced (RLS + metadata filtering)
- [ ] Error handling implemented
- [ ] Monitoring/logging added
- [ ] Tests written and passing

### 10.3 Pattern Evolution Validation

When evolving from one pattern to another:

- [ ] Evolution trigger verified (e.g., 3+ repetitions for Pattern 01 → 02)
- [ ] Previous pattern fully exhausted
- [ ] Complexity justifies escalation
- [ ] Resource impact assessed
- [ ] Migration path documented
- [ ] Backward compatibility considered

---

## Appendix A: Quick Reference

### Pattern Selection Quick Reference

| Scenario | Pattern | Template |
|----------|---------|----------|
| First time doing this | 01 | None (iterate manually) |
| Done this 3+ times | 02 | None (custom command) |
| Need specialization | 03 | template-cron-jobs, template-ai-sdk-image-generator |
| Integrating 3+ services | 04 | template-upstash-vector-ai-sdk-starter, template-sanity-cms, templates-liveblocks-starter-kit |
| Building a product | 05 | template-nextjs-ai-chatbot (default), template-e2b, template-multi-tenant-full-stack, template-online-store-with-stripe, template-platforms-starter-kit |

### Agent Type Quick Reference

| Need | Agent Type | Example |
|------|------------|---------|
| Single task | BaseAgent | ChatAgent, RAGAgent |
| Coordinate multiple agents | Orchestrator | MicroSDLC, SdrAgent |
| Complex business logic | Orchestrator | SubscriptionAgent |

### Layer Responsibility Quick Reference

| Layer | Responsibility | Technology |
|-------|---------------|------------|
| 1 (Face) | User interaction | React + AG-UI |
| 2 (Head) | Agent orchestration | Next.js + Vercel AI SDK |
| 3 (DNA) | Data & tools | Supabase + Upstash |

---

## Appendix B: Resources

### Documentation
- `/docs/AI-AGENT-GUARDRAILS.md` - Development guidelines
- `/docs/architecture/boilerplate-implementation.md` - 3-layer architecture details
- `/docs/workflows/advanced-learning.md` - Learning and pattern discovery

### Templates
- `/ai-coder-workspace/templates/` - 10 essential templates (consolidated from 33)
- `/ai-coder-workspace/templates/README.md` - Template selection guide
- `/ai-coder-workspace/templates/ESSENTIAL-TEMPLATES-BY-PATTERN.md` - Detailed template analysis
- `/ai-coder-workspace/templates/archived/` - 24 archived templates (reference only)

### Code Examples
- `/src/agents/BaseAgent.ts` - Base agent implementation
- `/src/agents/StatefulAgent.ts` - Stateful agent with memory
- `/src/agents/CompleteBusinessAgent.ts` - Full-featured agent with RAG

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-22 | Initial framework documentation |

---

**Status:** Production Standard
**Enforcement:** Mandatory for all AI Coder projects
**Review Cycle:** Quarterly
