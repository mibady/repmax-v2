# Pattern 04: MCP Wrapper - Deep Dive Implementation Guide

**Version:** 1.0
**Last Updated:** 2025-10-22
**Status:** Production Reference

---

## Table of Contents

1. [Overview](#overview)
2. [When to Use Pattern 04](#when-to-use-pattern-04)
3. [Architecture](#architecture)
4. [Core Components](#core-components)
5. [Implementation Guide](#implementation-guide)
6. [Service Integration Examples](#service-integration-examples)
7. [Advanced Features](#advanced-features)
8. [Deployment Strategies](#deployment-strategies)
9. [Best Practices](#best-practices)
10. [Production Checklist](#production-checklist)

---

## Overview

**Pattern 04: MCP Wrapper** creates a **central coordinator** that consolidates access to 3+ distinct services through a unified MCP (Model Context Protocol) interface. This pattern is essential when your agents need to interact with multiple external services, APIs, or internal systems.

### The Central Coordinator Pattern

```
┌─────────────────────────────────────────────────────────┐
│                 15+ AI Agents                           │
│  (ChatAgent, RAGAgent, PaymentAgent, etc.)             │
└───────────────────┬─────────────────────────────────────┘
                    │
                    │ Single MCP Interface
                    ▼
┌─────────────────────────────────────────────────────────┐
│              MCP Wrapper (Pattern 04)                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Service Registry • Auth • Rate Limiting • Cache  │  │
│  └──────────────────────────────────────────────────┘  │
└───┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬───┘
    │     │     │     │     │     │     │     │     │
    ▼     ▼     ▼     ▼     ▼     ▼     ▼     ▼     ▼
┌────────────────────────────────────────────────────────┐
│              9+ External Services                      │
│  Stripe • GitHub • Slack • Supabase • Redis • etc.    │
└────────────────────────────────────────────────────────┘
```

### Key Benefits

- **Single Integration Point:** Agents call one MCP server instead of 9+ APIs
- **Unified Authentication:** Manage all service credentials in one place
- **Rate Limiting:** Prevent API quota exhaustion across all services
- **Caching:** Optimize repeated requests with multi-tier caching
- **Observability:** Centralized logging, metrics, and tracing
- **Composite Tools:** Orchestrate multi-service workflows
- **Security:** RBAC, secret management, and audit trails

---

## When to Use Pattern 04

### Trigger Conditions

Use Pattern 04 when you need to integrate **3+ distinct services**:

```
Decision Tree:
├─ Integrating 1-2 services? → Pattern 02 or 03
├─ Integrating 3+ services? → Pattern 04 ✅
└─ Building full product with UI? → Pattern 05 (includes Pattern 04)
```

### Real-World Use Cases

| Use Case | Services | Why Pattern 04? |
|----------|----------|-----------------|
| **RAG System** | Upstash Vector + OpenAI + Supabase | 3 services, complex queries |
| **SaaS Billing** | Stripe + Clerk + Supabase + Resend | 4 services, payment workflows |
| **DevOps Platform** | GitHub + Slack + CodeRabbit + Sentry | 4+ services, CI/CD automation |
| **Content Generation** | Replicate + Fal.ai + OpenAI + Blob Storage | 4 services, multi-model orchestration |
| **E-commerce** | Stripe + Shippo + SendGrid + Supabase | 4+ services, order fulfillment |

---

## Architecture

### High-Level Architecture

```typescript
// MCP Wrapper Architecture
┌──────────────────────────────────────────────────────┐
│                  Wrapper Server                      │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │         MCP Protocol Handler                   │ │
│  │  • List Tools                                  │ │
│  │  • Execute Tool                                │ │
│  │  • List Resources                              │ │
│  │  • Read Resource                               │ │
│  └────────────────┬───────────────────────────────┘ │
│                   │                                  │
│  ┌────────────────▼───────────────────────────────┐ │
│  │         Service Registry                       │ │
│  │  • Register services                           │ │
│  │  • Generate tool definitions                   │ │
│  │  • Route tool calls                            │ │
│  │  • Handle responses                            │ │
│  └────────────────┬───────────────────────────────┘ │
│                   │                                  │
│  ┌────────────────▼───────────────────────────────┐ │
│  │      Cross-Cutting Concerns                    │ │
│  │  ┌─────────────────────────────────────────┐  │ │
│  │  │ Agent Authenticator (verify agents)     │  │ │
│  │  ├─────────────────────────────────────────┤  │ │
│  │  │ Rate Limiter (global, per-agent, tool)  │  │ │
│  │  ├─────────────────────────────────────────┤  │ │
│  │  │ Cache Manager (memory, Redis, CDN)      │  │ │
│  │  ├─────────────────────────────────────────┤  │ │
│  │  │ Metrics Collector (OpenTelemetry)       │  │ │
│  │  ├─────────────────────────────────────────┤  │ │
│  │  │ Logger (structured, distributed trace)  │  │ │
│  │  └─────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### Service Integration Pattern

```typescript
// Each service has:
1. Service Client (initialized with credentials)
2. Tool Definitions (name, description, schema)
3. Tool Handlers (execute operations)
4. Health Check (verify service availability)

// Example: Stripe Service
{
  client: Stripe instance,
  tools: [
    { name: "stripe_create_customer", ... },
    { name: "stripe_create_checkout", ... },
    { name: "stripe_list_subscriptions", ... }
  ],
  handlers: Map<toolName, handler>,
  healthCheck: () => stripe.customers.list({ limit: 1 })
}
```

---

## Core Components

### 1. Wrapper Server

**Responsibility:** Implements MCP protocol and coordinates all services

```typescript
// src/core/wrapper-server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

class WrapperServer {
  private server: Server;
  private serviceRegistry: ServiceRegistry;
  private authenticator: AgentAuthenticator;
  private rateLimiter: RateLimiter;
  private cacheManager: CacheManager;
  private metrics: MetricsCollector;

  constructor(config: WrapperConfig) {
    this.server = new Server(
      { name: config.name, version: config.version },
      { capabilities: { tools: {} } }
    );

    // Initialize components
    this.serviceRegistry = new ServiceRegistry(config.services);
    this.authenticator = new AgentAuthenticator(config.agents);
    this.rateLimiter = new RateLimiter(config.rateLimits);
    this.cacheManager = new CacheManager(config.cache);
    this.metrics = new MetricsCollector(config.metrics);

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async (request) => {
      const agentId = request.params?.agentId;

      // Authenticate agent
      const agent = await this.authenticator.authenticate(agentId);

      // Get tools based on agent permissions
      const tools = this.serviceRegistry.getToolsForAgent(agent);

      return { tools };
    });

    // Execute tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const agentId = request.params?.agentId;

      try {
        // 1. Authenticate
        const agent = await this.authenticator.authenticate(agentId);

        // 2. Check rate limits
        await this.rateLimiter.checkLimit(agentId, name);

        // 3. Check cache
        const cacheKey = this.cacheManager.generateKey(name, args);
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
          this.metrics.increment('cache.hit', { tool: name });
          return cached;
        }

        // 4. Execute tool
        const result = await this.serviceRegistry.executeTool(name, args, agent);

        // 5. Cache result
        await this.cacheManager.set(cacheKey, result);

        // 6. Record metrics
        this.metrics.increment('tool.success', { tool: name, agent: agentId });

        return result;

      } catch (error) {
        this.metrics.increment('tool.error', { tool: name, error: error.message });
        throw error;
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('MCP Wrapper Server running');
  }

  async shutdown() {
    console.log('Shutting down gracefully...');

    // Drain connections (30 seconds)
    await this.drainConnections(30000);

    // Close services
    await this.serviceRegistry.closeAll();

    // Flush metrics
    await this.metrics.flush();

    console.log('Shutdown complete');
  }
}
```

---

### 2. Service Registry

**Responsibility:** Manages all integrated services and routes tool calls

```typescript
// src/core/service-registry.ts
class ServiceRegistry {
  private services: Map<string, ServiceConfig>;
  private toolHandlers: Map<string, ToolHandler>;

  constructor(serviceConfigs: ServiceConfig[]) {
    this.services = new Map();
    this.toolHandlers = new Map();

    // Register each service
    for (const config of serviceConfigs) {
      this.registerService(config);
    }
  }

  registerService(config: ServiceConfig) {
    const { name, type, credentials, tools } = config;

    // Initialize service client
    const client = this.createClient(type, credentials);

    // Register tools
    for (const tool of tools) {
      const toolName = `${name}_${tool.operation}`;

      // Store tool definition
      this.services.set(toolName, {
        service: name,
        client,
        definition: tool,
        healthCheck: config.healthCheck
      });

      // Store handler
      this.toolHandlers.set(toolName, tool.handler);
    }
  }

  async executeTool(toolName: string, args: any, agent: Agent): Promise<any> {
    const service = this.services.get(toolName);
    if (!service) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    // Check permissions
    if (!this.hasPermission(agent, toolName)) {
      throw new Error(`Agent ${agent.id} lacks permission for ${toolName}`);
    }

    // Get handler
    const handler = this.toolHandlers.get(toolName);
    if (!handler) {
      throw new Error(`Handler not found: ${toolName}`);
    }

    // Execute with service client
    return await handler(service.client, args);
  }

  getToolsForAgent(agent: Agent): ToolDefinition[] {
    const tools: ToolDefinition[] = [];

    for (const [toolName, service] of this.services.entries()) {
      if (this.hasPermission(agent, toolName)) {
        tools.push({
          name: toolName,
          description: service.definition.description,
          inputSchema: service.definition.inputSchema
        });
      }
    }

    return tools;
  }

  private createClient(type: string, credentials: any): any {
    switch (type) {
      case 'stripe':
        return new Stripe(credentials.secretKey, { apiVersion: '2025-09-30' });
      case 'supabase':
        return createClient(credentials.url, credentials.anonKey);
      case 'redis':
        return new Redis({ url: credentials.url, token: credentials.token });
      case 'github':
        return new Octokit({ auth: credentials.token });
      // ... other services
      default:
        throw new Error(`Unknown service type: ${type}`);
    }
  }

  async healthCheck(serviceName?: string): Promise<HealthStatus> {
    if (serviceName) {
      const service = Array.from(this.services.values())
        .find(s => s.service === serviceName);

      if (!service) throw new Error(`Service not found: ${serviceName}`);

      return await service.healthCheck(service.client);
    }

    // Check all services
    const results = await Promise.allSettled(
      Array.from(this.services.values()).map(s => s.healthCheck(s.client))
    );

    return {
      status: results.every(r => r.status === 'fulfilled') ? 'healthy' : 'degraded',
      services: results
    };
  }
}
```

---

### 3. Agent Authenticator

**Responsibility:** Verify agent identity and permissions

```typescript
// src/core/agent-authenticator.ts
class AgentAuthenticator {
  private agents: Map<string, AgentConfig>;

  constructor(agentConfigs: AgentConfig[]) {
    this.agents = new Map(
      agentConfigs.map(agent => [agent.id, agent])
    );
  }

  async authenticate(agentId: string, token?: string): Promise<Agent> {
    const config = this.agents.get(agentId);
    if (!config) {
      throw new Error(`Unknown agent: ${agentId}`);
    }

    // Verify token if provided
    if (token) {
      const valid = await this.verifyToken(agentId, token);
      if (!valid) {
        throw new Error(`Invalid token for agent: ${agentId}`);
      }
    }

    return {
      id: config.id,
      name: config.name,
      roles: config.roles,
      permissions: config.permissions
    };
  }

  private async verifyToken(agentId: string, token: string): Promise<boolean> {
    // Implementation depends on your auth strategy:
    // - JWT verification
    // - API key lookup
    // - OAuth validation
    // etc.
    return true; // Placeholder
  }
}
```

---

### 4. Rate Limiter

**Responsibility:** Prevent API quota exhaustion

```typescript
// src/core/rate-limiter.ts
class RateLimiter {
  private limits: Map<string, RateLimit>;
  private redis: Redis;

  constructor(config: RateLimitConfig) {
    this.limits = new Map(
      config.limits.map(limit => [limit.key, limit])
    );
    this.redis = new Redis(config.redis);
  }

  async checkLimit(agentId: string, toolName: string): Promise<void> {
    // Check global limit
    await this.check('global', this.limits.get('global'));

    // Check per-agent limit
    await this.check(`agent:${agentId}`, this.limits.get('per-agent'));

    // Check per-tool limit
    await this.check(`tool:${toolName}`, this.limits.get('per-tool'));

    // Check agent+tool combination
    await this.check(
      `agent:${agentId}:tool:${toolName}`,
      this.limits.get('per-agent-tool')
    );
  }

  private async check(key: string, limit?: RateLimit): Promise<void> {
    if (!limit) return;

    const count = await this.redis.incr(key);

    if (count === 1) {
      // First request, set expiry
      await this.redis.expire(key, limit.windowSeconds);
    }

    if (count > limit.maxRequests) {
      throw new Error(`Rate limit exceeded: ${key}`);
    }
  }
}
```

---

### 5. Cache Manager

**Responsibility:** Optimize repeated requests with multi-tier caching

```typescript
// src/core/cache-manager.ts
class CacheManager {
  private memoryCache: Map<string, CacheEntry>;
  private redis: Redis;
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.memoryCache = new Map();
    this.redis = new Redis(config.redis);
    this.config = config;

    // Start cache cleanup interval
    setInterval(() => this.cleanup(), 60000); // Every minute
  }

  generateKey(toolName: string, args: any): string {
    // Sort arguments for consistent cache keys
    const sortedArgs = JSON.stringify(args, Object.keys(args).sort());
    return `${toolName}:${createHash('sha256').update(sortedArgs).digest('hex')}`;
  }

  async get(key: string): Promise<any | null> {
    // Try memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
      return memoryEntry.value;
    }

    // Try Redis
    const redisValue = await this.redis.get(key);
    if (redisValue) {
      // Promote to memory cache
      this.memoryCache.set(key, {
        value: JSON.parse(redisValue),
        expiresAt: Date.now() + this.config.memoryTTL
      });
      return JSON.parse(redisValue);
    }

    return null;
  }

  async set(key: string, value: any): Promise<void> {
    const entry = {
      value,
      expiresAt: Date.now() + this.config.memoryTTL
    };

    // Store in memory
    this.memoryCache.set(key, entry);

    // Store in Redis
    await this.redis.set(
      key,
      JSON.stringify(value),
      'EX',
      this.config.redisTTL
    );
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expiresAt <= now) {
        this.memoryCache.delete(key);
      }
    }
  }
}
```

---

## Implementation Guide

### Step 1: Define Configuration

```typescript
// config/wrapper-config.ts
export const wrapperConfig: WrapperConfig = {
  name: 'my-mcp-wrapper',
  version: '1.0.0',

  // Define agents that can use this wrapper
  agents: [
    {
      id: 'chat-agent',
      name: 'Chat Agent',
      roles: ['read', 'write'],
      permissions: ['stripe_*', 'supabase_read_*', 'github_read_*']
    },
    {
      id: 'payment-agent',
      name: 'Payment Agent',
      roles: ['admin'],
      permissions: ['stripe_*', 'supabase_*', 'resend_*']
    }
  ],

  // Define services to integrate
  services: [
    {
      name: 'stripe',
      type: 'stripe',
      credentials: {
        secretKey: process.env.STRIPE_SECRET_KEY!
      },
      tools: [
        {
          operation: 'create_customer',
          description: 'Create a new Stripe customer',
          inputSchema: {
            type: 'object',
            properties: {
              email: { type: 'string' },
              name: { type: 'string' }
            },
            required: ['email']
          },
          handler: async (client, args) => {
            return await client.customers.create(args);
          }
        },
        {
          operation: 'create_checkout',
          description: 'Create a Stripe Checkout session',
          inputSchema: {
            type: 'object',
            properties: {
              priceId: { type: 'string' },
              customerId: { type: 'string' }
            },
            required: ['priceId', 'customerId']
          },
          handler: async (client, args) => {
            return await client.checkout.sessions.create({
              customer: args.customerId,
              line_items: [{ price: args.priceId, quantity: 1 }],
              mode: 'subscription',
              success_url: `${process.env.APP_URL}/success`,
              cancel_url: `${process.env.APP_URL}/cancel`
            });
          }
        }
      ],
      healthCheck: async (client) => {
        await client.customers.list({ limit: 1 });
        return { status: 'healthy' };
      }
    },
    {
      name: 'supabase',
      type: 'supabase',
      credentials: {
        url: process.env.SUPABASE_URL!,
        anonKey: process.env.SUPABASE_ANON_KEY!
      },
      tools: [
        {
          operation: 'read_table',
          description: 'Read data from a Supabase table',
          inputSchema: {
            type: 'object',
            properties: {
              table: { type: 'string' },
              filter: { type: 'object' }
            },
            required: ['table']
          },
          handler: async (client, args) => {
            let query = client.from(args.table).select('*');

            if (args.filter) {
              for (const [key, value] of Object.entries(args.filter)) {
                query = query.eq(key, value);
              }
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
          }
        }
      ],
      healthCheck: async (client) => {
        const { error } = await client.from('_health').select('*').limit(1);
        return { status: error ? 'unhealthy' : 'healthy' };
      }
    }
  ],

  // Rate limiting configuration
  rateLimits: {
    redis: { url: process.env.UPSTASH_REDIS_URL!, token: process.env.UPSTASH_REDIS_TOKEN! },
    limits: [
      { key: 'global', maxRequests: 1000, windowSeconds: 60 },
      { key: 'per-agent', maxRequests: 100, windowSeconds: 60 },
      { key: 'per-tool', maxRequests: 50, windowSeconds: 60 }
    ]
  },

  // Caching configuration
  cache: {
    redis: { url: process.env.UPSTASH_REDIS_URL!, token: process.env.UPSTASH_REDIS_TOKEN! },
    memoryTTL: 60000, // 1 minute
    redisTTL: 3600 // 1 hour
  },

  // Metrics configuration
  metrics: {
    endpoint: process.env.OTEL_ENDPOINT,
    serviceName: 'my-mcp-wrapper'
  }
};
```

### Step 2: Initialize Wrapper

```typescript
// src/index.ts
import { WrapperServer } from './core/wrapper-server.js';
import { wrapperConfig } from './config/wrapper-config.js';

async function main() {
  const server = new WrapperServer(wrapperConfig);

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await server.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await server.shutdown();
    process.exit(0);
  });

  await server.start();
}

main().catch(console.error);
```

### Step 3: Deploy

```bash
# Install dependencies
npm install @modelcontextprotocol/sdk stripe @supabase/supabase-js @upstash/redis

# Build
npm run build

# Run locally
npm start

# Or deploy serverless (see Deployment section)
```

---

## Service Integration Examples

### Example 1: Stripe + Supabase + Resend (SaaS Billing)

**Use Case:** Complete billing flow with database tracking and email receipts

```typescript
// Composite tool: Create subscription + record in DB + send email
{
  name: 'billing',
  type: 'composite',
  tools: [
    {
      operation: 'create_subscription',
      steps: [
        {
          tool: 'stripe_create_customer',
          input: { email: '{{userEmail}}', name: '{{userName}}' },
          output: 'customerId'
        },
        {
          tool: 'stripe_create_checkout',
          input: { customerId: '{{customerId}}', priceId: '{{priceId}}' },
          output: 'checkoutUrl'
        },
        {
          tool: 'supabase_insert',
          input: {
            table: 'subscriptions',
            data: {
              user_id: '{{userId}}',
              stripe_customer_id: '{{customerId}}',
              status: 'pending'
            }
          }
        },
        {
          tool: 'resend_send_email',
          input: {
            to: '{{userEmail}}',
            subject: 'Complete your subscription',
            template: 'subscription-checkout',
            data: { checkoutUrl: '{{checkoutUrl}}' }
          }
        }
      ]
    }
  ]
}
```

### Example 2: GitHub + Slack + CodeRabbit (DevOps Automation)

**Use Case:** Automated PR review workflow

```typescript
// Composite tool: PR opened → Review → Notify team
{
  name: 'devops',
  type: 'composite',
  tools: [
    {
      operation: 'review_pr',
      steps: [
        {
          tool: 'github_get_pr',
          input: { owner: '{{owner}}', repo: '{{repo}}', pr: '{{prNumber}}' },
          output: 'prData'
        },
        {
          tool: 'coderabbit_review',
          input: { diff: '{{prData.diff}}', rules: '{{.ai-rules.md}}' },
          output: 'review'
        },
        {
          tool: 'github_add_comment',
          input: {
            owner: '{{owner}}',
            repo: '{{repo}}',
            pr: '{{prNumber}}',
            comment: '{{review.markdown}}'
          }
        },
        {
          tool: 'slack_send_message',
          input: {
            channel: '#code-review',
            message: 'PR #{{prNumber}} reviewed: {{review.summary}}'
          }
        }
      ]
    }
  ]
}
```

---

## Advanced Features

### 1. Composite Tools

Composite tools orchestrate multiple service calls into a single workflow:

```typescript
class CompositeToolExecutor {
  async execute(compositeTool: CompositeTool, initialInput: any): Promise<any> {
    let context = { ...initialInput };

    for (const step of compositeTool.steps) {
      // Replace template variables
      const input = this.replaceTemplates(step.input, context);

      // Execute tool
      const result = await this.serviceRegistry.executeTool(step.tool, input);

      // Store output in context
      if (step.output) {
        context[step.output] = result;
      }
    }

    return context;
  }

  private replaceTemplates(input: any, context: any): any {
    const json = JSON.stringify(input);
    const replaced = json.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return context[key] !== undefined ? context[key] : match;
    });
    return JSON.parse(replaced);
  }
}
```

### 2. Circuit Breaker

Protect against cascading failures:

```typescript
class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failures = 0;
  private readonly threshold = 5;
  private readonly timeout = 60000; // 1 minute

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.openedAt < this.timeout) {
        throw new Error('Circuit breaker is open');
      }
      this.state = 'half-open';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    if (this.state === 'half-open') {
      this.state = 'closed';
    }
  }

  private onFailure() {
    this.failures++;
    if (this.failures >= this.threshold) {
      this.state = 'open';
      this.openedAt = Date.now();
    }
  }
}
```

### 3. Distributed Tracing

Track requests across services:

```typescript
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

class TracedServiceRegistry extends ServiceRegistry {
  async executeTool(toolName: string, args: any, agent: Agent): Promise<any> {
    const tracer = trace.getTracer('mcp-wrapper');

    return await tracer.startActiveSpan(toolName, async (span) => {
      span.setAttribute('agent.id', agent.id);
      span.setAttribute('tool.name', toolName);
      span.setAttribute('args', JSON.stringify(args));

      try {
        const result = await super.executeTool(toolName, args, agent);
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
        span.recordException(error);
        throw error;
      } finally {
        span.end();
      }
    });
  }
}
```

---

## Deployment Strategies

### 1. Serverless (Vercel/AWS Lambda/Google Cloud)

**Best for:** Low-moderate traffic, cost optimization

```typescript
// vercel.json
{
  "functions": {
    "api/mcp.ts": {
      "runtime": "nodejs20.x",
      "maxDuration": 60
    }
  },
  "env": {
    "STRIPE_SECRET_KEY": "@stripe-secret",
    "SUPABASE_URL": "@supabase-url",
    "UPSTASH_REDIS_URL": "@redis-url"
  }
}

// api/mcp.ts (Vercel Function)
import { WrapperServer } from '../src/core/wrapper-server.js';

export default async function handler(req, res) {
  const server = new WrapperServer(config);

  // Handle MCP request
  const result = await server.handleRequest(req.body);

  res.json(result);
}
```

### 2. Container (Docker/Kubernetes)

**Best for:** High traffic, complex orchestration

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-wrapper
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mcp-wrapper
  template:
    metadata:
      labels:
        app: mcp-wrapper
    spec:
      containers:
      - name: mcp-wrapper
        image: my-mcp-wrapper:latest
        ports:
        - containerPort: 3000
        env:
        - name: STRIPE_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: stripe-secrets
              key: secret-key
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 3. Edge (Cloudflare Workers)

**Best for:** Global distribution, ultra-low latency

```typescript
// wrangler.toml
name = "mcp-wrapper"
main = "src/worker.ts"
compatibility_date = "2025-10-22"

[vars]
ENVIRONMENT = "production"

[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "mcp-storage"

// src/worker.ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const server = new WrapperServer({
      ...config,
      cache: { kv: env.CACHE },
      storage: { r2: env.STORAGE }
    });

    const result = await server.handleRequest(await request.json());

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

---

## Best Practices

### 1. Security

```typescript
// ✅ DO: Store secrets in environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// ❌ DON'T: Hardcode secrets
const stripe = new Stripe('sk_live_...');

// ✅ DO: Validate all inputs
const schema = z.object({
  email: z.string().email(),
  amount: z.number().positive()
});
const validated = schema.parse(args);

// ❌ DON'T: Trust raw inputs
const customer = await stripe.customers.create(args);
```

### 2. Error Handling

```typescript
// ✅ DO: Provide actionable error messages
try {
  await stripe.customers.create(args);
} catch (error) {
  if (error.type === 'StripeCardError') {
    throw new Error(`Payment failed: ${error.message}. Please check your card details.`);
  }
  throw new Error(`Stripe error: ${error.message}`);
}

// ❌ DON'T: Expose internal errors
catch (error) {
  throw error; // Leaks internal details
}
```

### 3. Observability

```typescript
// ✅ DO: Log structured data
logger.info('Tool executed', {
  tool: toolName,
  agent: agentId,
  duration: Date.now() - startTime,
  success: true
});

// ❌ DON'T: Log unstructured text
console.log(`Tool ${toolName} executed by ${agentId} in ${duration}ms`);
```

### 4. Performance

```typescript
// ✅ DO: Parallel execution when possible
const [customers, subscriptions] = await Promise.all([
  stripe.customers.list(),
  stripe.subscriptions.list()
]);

// ❌ DON'T: Sequential when not needed
const customers = await stripe.customers.list();
const subscriptions = await stripe.subscriptions.list();
```

---

## Production Checklist

Before deploying to production:

### Configuration
- [ ] All secrets in environment variables
- [ ] Rate limits configured appropriately
- [ ] Cache TTLs tuned for your use case
- [ ] Health check endpoints implemented
- [ ] Graceful shutdown handling

### Security
- [ ] Agent authentication enabled
- [ ] RBAC permissions configured
- [ ] Input validation on all tools
- [ ] Secret rotation strategy in place
- [ ] Audit logging enabled

### Observability
- [ ] Structured logging configured
- [ ] Distributed tracing enabled (OpenTelemetry)
- [ ] Metrics exported (Prometheus/CloudWatch)
- [ ] Error tracking configured (Sentry)
- [ ] Dashboards created for monitoring

### Reliability
- [ ] Circuit breakers on external services
- [ ] Retry logic with exponential backoff
- [ ] Timeout configuration on all operations
- [ ] Health checks for all services
- [ ] Load tested under expected traffic

### Documentation
- [ ] Tool descriptions clear and complete
- [ ] Input schemas documented
- [ ] Example requests provided
- [ ] Error codes documented
- [ ] Runbooks for common issues

---

## Summary

Pattern 04 (MCP Wrapper) creates a **central coordinator** that:

1. **Consolidates** 3+ services into a single MCP interface
2. **Manages** authentication, rate limiting, and caching centrally
3. **Orchestrates** multi-service workflows with composite tools
4. **Observes** all operations with distributed tracing
5. **Scales** via serverless, container, or edge deployment

**When to Use:**
- Integrating 3+ distinct services
- Need centralized rate limiting/caching
- Building complex multi-service workflows
- Require RBAC and audit trails

**Next Steps:**
1. Review scaffold code: `/home/mibady/old/ai-coder-agents/scaffolds/mcp-wrapper-server`
2. Study real examples: Stripe+Supabase+Resend, GitHub+Slack+CodeRabbit
3. Start with 3 services, expand incrementally
4. Deploy serverless first, scale to containers as needed

---

**Last Updated:** 2025-10-22
**Next Review:** When new services added
**Maintained By:** AI Coder Team
