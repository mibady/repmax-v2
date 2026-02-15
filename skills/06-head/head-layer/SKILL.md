---
name: head-layer
description: AI/LLM integration with Vercel AI SDK, multi-provider support, RAG, and tool calling.
---

# Head Layer

AI logic: LLM orchestration, tool calling, RAG, and streaming.

## When to Use

- AI chat interfaces
- LLM-powered features
- RAG (Retrieval Augmented Generation)
- Tool/function calling
- Multi-provider AI (OpenAI, Anthropic, Google)

## Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Vercel AI SDK | 4.1+ / 5.0+ | Unified LLM interface |
| @ai-sdk/openai | 1.0+ | OpenAI provider |
| @ai-sdk/anthropic | 1.0+ | Anthropic provider |
| @ai-sdk/google | 1.0+ | Google Gemini provider |
| Upstash Vector | 1.2+ | RAG / semantic search |
| Zod | 3.0+ | Schema validation for tools |

## Installation

```bash
npm install ai @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/google zod
npm install @upstash/vector  # For RAG
```

## Environment Variables

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=...
UPSTASH_VECTOR_REST_URL=...
UPSTASH_VECTOR_REST_TOKEN=...
```

---

## Core Functions

### generateText — Complete Generation
```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-4'),
  prompt: 'Explain quantum computing simply',
  temperature: 0.7,
  maxTokens: 500,
});

console.log(result.text);
console.log(result.usage); // { promptTokens, completionTokens, totalTokens }
```

### streamText — Streaming Generation
```typescript
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

const result = await streamText({
  model: anthropic('claude-3-5-sonnet-20241022'),
  prompt: 'Write a blog post about AI',
});

// Stream chunks
for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
```

### generateObject — Structured Output
```typescript
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const result = await generateObject({
  model: openai('gpt-4'),
  prompt: 'Extract: John Doe, 30 years old, NYC',
  schema: z.object({
    name: z.string(),
    age: z.number(),
    city: z.string(),
  }),
});

console.log(result.object); // { name: 'John Doe', age: 30, city: 'NYC' }
```

---

## Multi-Provider Setup

### Provider Configuration
```typescript
// lib/ai-providers.ts
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';

export const providers = {
  // OpenAI
  gpt4: openai('gpt-4'),
  gpt4Turbo: openai('gpt-4-turbo'),
  gpt35: openai('gpt-3.5-turbo'),

  // Anthropic
  claude35Sonnet: anthropic('claude-3-5-sonnet-20241022'),
  claude3Opus: anthropic('claude-3-opus-20240229'),
  claude3Haiku: anthropic('claude-3-haiku-20240307'),

  // Google
  gemini2Flash: google('gemini-2.0-flash-exp'),
  gemini15Pro: google('gemini-1.5-pro-latest'),
};
```

### Provider Fallback
```typescript
async function generateWithFallback(prompt: string) {
  const chain = [
    providers.claude35Sonnet,
    providers.gpt4,
    providers.gemini2Flash,
  ];

  for (const provider of chain) {
    try {
      return await generateText({ model: provider, prompt });
    } catch (error) {
      console.error(`Provider failed:`, error);
      continue;
    }
  }
  throw new Error('All providers failed');
}
```

---

## Tool/Function Calling

### Single Tool
```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const result = await generateText({
  model: openai('gpt-4'),
  prompt: 'What is the weather in San Francisco?',
  tools: {
    getWeather: {
      description: 'Get weather for a city',
      parameters: z.object({
        city: z.string().describe('City name'),
      }),
      execute: async ({ city }) => {
        const res = await fetch(`https://api.weather.com/${city}`);
        return res.json();
      },
    },
  },
});

console.log(result.toolCalls);   // Tools that were called
console.log(result.toolResults); // Results from tools
```

### Multiple Tools with Roundtrips
```typescript
const tools = {
  searchWeb: {
    description: 'Search the web',
    parameters: z.object({ query: z.string() }),
    execute: async ({ query }) => await searchDDG(query),
  },
  queryDatabase: {
    description: 'Query database',
    parameters: z.object({ sql: z.string() }),
    execute: async ({ sql }) => await db.query(sql),
  },
  sendEmail: {
    description: 'Send email',
    parameters: z.object({
      to: z.string(),
      subject: z.string(),
      body: z.string(),
    }),
    execute: async (params) => await resend.emails.send(params),
  },
};

const result = await generateText({
  model: openai('gpt-4'),
  prompt: 'Search for AI news and email me a summary',
  tools,
  maxToolRoundtrips: 5, // Allow multiple tool calls
});
```

---

## RAG with Upstash Vector

### Setup
```typescript
// lib/vector.ts
import { Index } from '@upstash/vector';

export const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});
```

### Embed + Search + Generate
```typescript
import { generateText, embed } from 'ai';
import { openai } from '@ai-sdk/openai';
import { vectorIndex } from '@/lib/vector';

export async function ragQuery(userQuery: string) {
  // 1. Generate embedding
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: userQuery,
  });

  // 2. Vector search
  const results = await vectorIndex.query({
    vector: embedding,
    topK: 5,
    includeMetadata: true,
  });

  // 3. Build context
  const context = results
    .map((r) => r.metadata?.content)
    .join('\n\n');

  // 4. Generate with context
  const result = await generateText({
    model: openai('gpt-4'),
    prompt: `Context:\n${context}\n\nQuestion: ${userQuery}\n\nAnswer:`,
  });

  return {
    answer: result.text,
    sources: results.map((r) => r.metadata),
  };
}
```

### Index Documents
```typescript
import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';
import { vectorIndex } from '@/lib/vector';

export async function indexDocument(doc: { id: string; content: string; metadata: any }) {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: doc.content,
  });

  await vectorIndex.upsert({
    id: doc.id,
    vector: embedding,
    metadata: { content: doc.content, ...doc.metadata },
  });
}
```

---

## Next.js API Routes

### Chat Endpoint (Streaming)
```typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const runtime = 'edge'; // Edge for lower latency

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4'),
    messages,
  });

  return result.toDataStreamResponse();
}
```

### Completion Endpoint
```typescript
// app/api/completion/route.ts
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = await streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    prompt,
  });

  return result.toDataStreamResponse();
}
```

---

## React Hooks (Frontend)

### useChat
```typescript
'use client';

import { useChat } from 'ai/react';

export function ChatComponent() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}>{m.role}: {m.content}</div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} disabled={isLoading} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

### useCompletion
```typescript
'use client';

import { useCompletion } from 'ai/react';

export function CompletionComponent() {
  const { completion, input, handleInputChange, handleSubmit } = useCompletion({
    api: '/api/completion',
  });

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit">Generate</button>
      </form>
      <div>{completion}</div>
    </div>
  );
}
```

---

## Agent Patterns

### Pattern 03: Subagent (Specialized)
```typescript
// lib/agents/code-reviewer.ts
export async function reviewCode(code: string) {
  return await generateText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    prompt: `Review this code for bugs and security:\n\n${code}`,
    temperature: 0.3,
  });
}
```

### Pattern 04: MCP Wrapper (Multi-Tool)
```typescript
// lib/agents/developer-assistant.ts
const tools = {
  searchGitHub: { ... },
  queryDatabase: { ... },
  searchDocs: { ... },
};

export async function processDeveloperQuery(query: string) {
  return await generateText({
    model: openai('gpt-4'),
    prompt: query,
    tools,
    maxToolRoundtrips: 5,
  });
}
```

### Pattern 05: Full Application
```typescript
// app/api/ai/route.ts
export async function POST(req: Request) {
  // 1. Auth (Clerk)
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  // 2. Rate limit (Upstash)
  const limited = await checkRateLimit(userId);
  if (limited) return new Response('Rate limited', { status: 429 });

  // 3. Get messages
  const { messages } = await req.json();

  // 4. Generate with tools
  const result = await streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    messages,
    tools: {
      searchKnowledge: {
        description: 'Search knowledge base',
        parameters: z.object({ query: z.string() }),
        execute: async ({ query }) => await ragQuery(query),
      },
    },
  });

  // 5. Save to DB (background)
  saveConversation(userId, messages);

  return result.toDataStreamResponse();
}
```

---

## Error Handling

### Retry Logic
```typescript
async function generateWithRetry(prompt: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateText({ model: openai('gpt-4'), prompt });
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

### Caching
```typescript
import { redis } from '@/lib/upstash';

async function generateWithCache(prompt: string) {
  const cacheKey = `ai:${hash(prompt)}`;
  
  const cached = await redis.get(cacheKey);
  if (cached) return cached;

  const result = await generateText({ model, prompt });
  await redis.set(cacheKey, result.text, { ex: 3600 });
  
  return result.text;
}
```

---

## Best Practices

### ✅ DO
```typescript
// Use Vercel AI SDK
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-4'),
  prompt: 'Hello',
});
```

### ❌ DON'T
```typescript
// Direct provider SDK (avoid for chat/completion)
import OpenAI from 'openai';

const client = new OpenAI();
const result = await client.chat.completions.create({...});
```

---

## Checklist

- [ ] Vercel AI SDK installed (not direct provider SDKs)
- [ ] Providers configured with env vars
- [ ] Edge runtime enabled for streaming routes
- [ ] Tool schemas defined with Zod
- [ ] Error handling with retries
- [ ] Rate limiting implemented
- [ ] Caching for expensive operations
- [ ] RAG indexed and searchable
