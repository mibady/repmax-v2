# Vercel AI SDK

**Category:** AI & LLM Integration
**Service Type:** Framework Service #2
**Official Website:** https://sdk.vercel.ai
**Documentation:** https://sdk.vercel.ai/docs
**GitHub:** https://github.com/vercel/ai

---

## Overview

Vercel AI SDK is the **core AI/LLM integration layer** for the AI Coder framework. It provides TypeScript-first abstractions for working with language models, streaming responses, tool calling, and multi-modal AI applications.

**Why Vercel AI SDK:**
- ✅ **Framework Service #2** - Official AI Coder LLM abstraction
- ✅ **Provider Agnostic** - Works with OpenAI, Anthropic, Google, Mistral, Groq, and 20+ providers
- ✅ **TypeScript-Native** - Type-safe tool calling, structured outputs, Zod schemas
- ✅ **Streaming First** - Real-time streaming with React hooks (useChat, useCompletion)
- ✅ **Tool Calling** - Execute functions from LLM responses (agents, workflows)
- ✅ **Multi-Modal** - Text, images, audio, video support
- ✅ **Edge Ready** - Optimized for Vercel Edge Runtime
- ✅ **Template Integration** - Used in 15+ AI Coder templates

---

## Key Features

### 1. Universal LLM Provider Support
```typescript
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { mistral } from '@ai-sdk/mistral';

// Switch providers without changing code
const model = openai('gpt-4-turbo');
// const model = anthropic('claude-3-5-sonnet-20241022');
// const model = google('gemini-pro');
```

### 2. Streaming Text Generation
```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await streamText({
  model: openai('gpt-4-turbo'),
  messages: [
    { role: 'user', content: 'Explain quantum computing in 3 sentences' }
  ],
});

// Stream to client
for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
```

### 3. Tool Calling (Agents)
```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const result = await generateText({
  model: openai('gpt-4-turbo'),
  messages: [
    { role: 'user', content: 'What is the weather in SF and the latest exchange rate for USD to EUR?' }
  ],
  tools: {
    weather: {
      description: 'Get the current weather in a location',
      parameters: z.object({
        location: z.string().describe('The city and state, e.g. San Francisco, CA'),
      }),
      execute: async ({ location }) => ({
        location,
        temperature: 72,
        condition: 'Sunny',
      }),
    },
    exchangeRate: {
      description: 'Get the current exchange rate between two currencies',
      parameters: z.object({
        from: z.string().describe('Source currency code'),
        to: z.string().describe('Target currency code'),
      }),
      execute: async ({ from, to }) => ({
        from,
        to,
        rate: 0.92,
      }),
    },
  },
});

console.log(result.text);
// "The weather in San Francisco is currently 72°F and sunny. The exchange rate from USD to EUR is 0.92."
```

### 4. Structured Outputs (Type-Safe)
```typescript
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const result = await generateObject({
  model: openai('gpt-4-turbo'),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(
        z.object({
          name: z.string(),
          amount: z.string(),
        }),
      ),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a recipe for chocolate chip cookies.',
});

console.log(result.object.recipe);
// Fully typed object matching schema
```

### 5. React Hooks (Real-Time UI)
```typescript
'use client';

import { useChat } from 'ai/react';

export default function ChatComponent() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          <strong>{m.role}:</strong> {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          disabled={isLoading}
          placeholder="Say something..."
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
}
```

### 6. Multi-Modal Support
```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-4-vision-preview'),
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'What is in this image?' },
        {
          type: 'image',
          image: 'https://example.com/image.jpg',
          // or: image: fs.readFileSync('image.png')
        },
      ],
    },
  ],
});

console.log(result.text);
```

---

## Installation

```bash
# Core AI SDK
npm install ai

# Provider packages (install as needed)
npm install @ai-sdk/openai
npm install @ai-sdk/anthropic
npm install @ai-sdk/google
npm install @ai-sdk/mistral
npm install @ai-sdk/cohere
npm install @ai-sdk/groq

# For type-safe schemas
npm install zod
```

---

## Environment Variables

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Google AI
GOOGLE_GENERATIVE_AI_API_KEY=...

# Mistral
MISTRAL_API_KEY=...

# Groq
GROQ_API_KEY=...

# Cohere
COHERE_API_KEY=...
```

---

## Quick Start: Next.js App Router

### 1. Create API Route

```typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const runtime = 'edge'; // Optional: Use Edge Runtime

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
  });

  return result.toAIStreamResponse();
}
```

### 2. Create Chat UI Component

```typescript
// app/chat/page.tsx
'use client';

import { useChat } from 'ai/react';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`p-4 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-100 ml-auto max-w-[80%]'
                : 'bg-gray-100 max-w-[80%]'
            }`}
          >
            <p className="font-semibold mb-1">
              {message.role === 'user' ? 'You' : 'AI'}
            </p>
            <p>{message.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send
        </button>
      </form>
    </div>
  );
}
```

---

## Advanced Use Cases

### Agent with Multiple Tools (CARE App Pattern)

```typescript
// app/api/agent/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: {
      // Medication tracking
      trackMedication: {
        description: 'Record that a patient took their medication',
        parameters: z.object({
          medicationId: z.string(),
          patientId: z.string(),
          takenAt: z.string().optional(),
        }),
        execute: async ({ medicationId, patientId, takenAt }) => {
          // Save to Supabase
          const { data } = await supabase
            .from('medication_logs')
            .insert({
              medication_id: medicationId,
              patient_id: patientId,
              taken_at: takenAt || new Date().toISOString(),
              status: 'taken',
            });
          return { success: true, data };
        },
      },

      // Flight search (Travel MCP pattern)
      searchFlights: {
        description: 'Search for flights between two cities',
        parameters: z.object({
          from: z.string(),
          to: z.string(),
          date: z.string(),
        }),
        execute: async ({ from, to, date }) => {
          // Call external Travel MCP or API
          const flights = await fetch('https://api.travel.com/flights', {
            method: 'POST',
            body: JSON.stringify({ from, to, date }),
          }).then(r => r.json());
          return flights;
        },
      },

      // Schedule appointment (Cal.com MCP pattern)
      scheduleAppointment: {
        description: 'Schedule a medical appointment',
        parameters: z.object({
          patientId: z.string(),
          providerId: z.string(),
          dateTime: z.string(),
          type: z.enum(['medical', 'therapy', 'dentist']),
        }),
        execute: async ({ patientId, providerId, dateTime, type }) => {
          // Save to Supabase
          const { data } = await supabase
            .from('appointments')
            .insert({
              patient_id: patientId,
              provider_id: providerId,
              scheduled_at: dateTime,
              type,
            });
          return { success: true, appointment: data };
        },
      },
    },
  });

  return result.toAIStreamResponse();
}
```

### Multi-Agent Orchestration (Sarah Pattern)

```typescript
// lib/agents/sarah-orchestrator.ts
import { generateText, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export class SarahOrchestrator {
  private model = openai('gpt-4-turbo');

  async route(message: string, context: any) {
    // Determine which sub-agent to use
    const routing = await generateText({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'Classify this message as: logistics, care, wellness, or emergency',
        },
        { role: 'user', content: message },
      ],
    });

    const category = routing.text.toLowerCase();

    // Route to appropriate sub-agent
    switch (category) {
      case 'logistics':
        return this.logisticsAgent(message, context);
      case 'care':
        return this.careAgent(message, context);
      case 'wellness':
        return this.wellnessAgent(message, context);
      case 'emergency':
        return this.emergencyAgent(message, context);
      default:
        return this.generalAgent(message, context);
    }
  }

  private async logisticsAgent(message: string, context: any) {
    return streamText({
      model: this.model,
      system: 'You are Sarah, a family logistics assistant...',
      messages: [{ role: 'user', content: message }],
      tools: {
        // Travel, calendar, budget tools
        searchFlights: { /* ... */ },
        scheduleEvent: { /* ... */ },
        trackExpense: { /* ... */ },
      },
    });
  }

  private async careAgent(message: string, context: any) {
    return streamText({
      model: this.model,
      system: 'You are Sarah, an elderly care assistant...',
      messages: [{ role: 'user', content: message }],
      tools: {
        // Medication, appointment, health record tools
        trackMedication: { /* ... */ },
        scheduleAppointment: { /* ... */ },
        getHealthRecord: { /* ... */ },
      },
    });
  }

  // ... other sub-agents
}
```

### RAG with Upstash Vector

```typescript
import { generateText, embed } from 'ai';
import { openai } from '@ai-sdk/openai';
import { Index } from '@upstash/vector';

const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

export async function ragQuery(question: string) {
  // 1. Embed the question
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: question,
  });

  // 2. Search vector database
  const results = await vectorIndex.query({
    vector: embedding,
    topK: 5,
    includeMetadata: true,
  });

  // 3. Build context from results
  const context = results
    .map(r => r.metadata?.text)
    .filter(Boolean)
    .join('\n\n');

  // 4. Generate answer with context
  const { text } = await generateText({
    model: openai('gpt-4-turbo'),
    messages: [
      {
        role: 'system',
        content: `Answer questions using the following context:\n\n${context}`,
      },
      { role: 'user', content: question },
    ],
  });

  return text;
}
```

---

## Templates Using Vercel AI SDK

- **template-nextjs-ai-chatbot** - Full-featured AI chat (Pattern 05)
- **template-ai-chatbot** - Basic AI chat
- **template-gemini-ai-chatbot** - Google Gemini integration
- **template-postgres-pgvector** - RAG with PostgreSQL
- **template-upstash-vector-ai-sdk-starter** - RAG with Upstash Vector
- **template-ai-sdk-preview-rsc-genui** - Generative UI
- **template-ai-sdk-preview-tool-calling** - Tool calling examples
- **template-nextjslive-transcription** - Audio transcription with AI

See: [Template Catalog](../templates/vercel-templates-catalog.md)

---

## Best Practices

### 1. Error Handling
```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

try {
  const result = await generateText({
    model: openai('gpt-4-turbo'),
    messages: [{ role: 'user', content: 'Hello' }],
  });
  console.log(result.text);
} catch (error) {
  if (error instanceof Error) {
    console.error('AI Error:', error.message);
  }
}
```

### 2. Token Usage Tracking
```typescript
const result = await generateText({
  model: openai('gpt-4-turbo'),
  messages: [{ role: 'user', content: 'Hello' }],
});

console.log('Tokens used:', result.usage);
// { promptTokens: 10, completionTokens: 5, totalTokens: 15 }
```

### 3. Temperature Control
```typescript
// More creative (0.7-1.0)
const creative = await generateText({
  model: openai('gpt-4-turbo'),
  temperature: 0.9,
  messages: [{ role: 'user', content: 'Write a poem' }],
});

// More deterministic (0.0-0.3)
const factual = await generateText({
  model: openai('gpt-4-turbo'),
  temperature: 0.1,
  messages: [{ role: 'user', content: 'What is 2+2?' }],
});
```

### 4. Streaming with Abort
```typescript
const controller = new AbortController();

const result = streamText({
  model: openai('gpt-4-turbo'),
  messages: [{ role: 'user', content: 'Long story...' }],
  abortSignal: controller.signal,
});

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Stream aborted');
  }
}
```

### 5. Caching Conversations (Redis)
```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Save conversation
await redis.set(`conversation:${userId}`, JSON.stringify(messages), {
  ex: 3600, // 1 hour TTL
});

// Load conversation
const cached = await redis.get(`conversation:${userId}`);
const messages = cached ? JSON.parse(cached) : [];
```

---

## Cost Optimization

### 1. Use Smaller Models When Possible
```typescript
// Expensive (GPT-4 Turbo)
const expensive = openai('gpt-4-turbo'); // ~$0.01-0.03/1K tokens

// Cheaper (GPT-3.5 Turbo)
const cheap = openai('gpt-3.5-turbo'); // ~$0.0005-0.0015/1K tokens

// Free tier (Groq)
import { groq } from '@ai-sdk/groq';
const free = groq('mixtral-8x7b-32768'); // Free (rate limited)
```

### 2. Limit Max Tokens
```typescript
const result = await generateText({
  model: openai('gpt-4-turbo'),
  maxTokens: 500, // Limit response length
  messages: [{ role: 'user', content: 'Explain AI in detail' }],
});
```

### 3. Cache Embeddings (RAG)
```typescript
// Cache embeddings in Redis to avoid re-computing
const cacheKey = `embedding:${hash(text)}`;
let embedding = await redis.get(cacheKey);

if (!embedding) {
  const result = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  });
  embedding = result.embedding;
  await redis.set(cacheKey, JSON.stringify(embedding), { ex: 86400 });
}
```

---

## Monitoring & Debugging

### 1. Log All LLM Calls (Sentry)
```typescript
import * as Sentry from '@sentry/nextjs';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const transaction = Sentry.startTransaction({
    op: 'ai.chat',
    name: 'Chat Completion',
  });

  try {
    const result = await streamText({
      model: openai('gpt-4-turbo'),
      messages,
    });

    transaction.setData('usage', result.usage);
    transaction.finish();

    return result.toAIStreamResponse();
  } catch (error) {
    Sentry.captureException(error);
    transaction.finish();
    throw error;
  }
}
```

### 2. Debug Mode
```typescript
const result = await generateText({
  model: openai('gpt-4-turbo'),
  messages: [{ role: 'user', content: 'Hello' }],
  experimental_telemetry: {
    isEnabled: true,
    functionId: 'chat-completion',
  },
});

console.log('Full response:', result);
```

---

## Security Best Practices

### 1. Never Expose API Keys to Client
```typescript
// ❌ WRONG - Never do this
'use client';
const apiKey = process.env.OPENAI_API_KEY; // Will be exposed!

// ✅ CORRECT - Always use API routes
// app/api/chat/route.ts
export async function POST(req: Request) {
  // API key stays on server
  const result = await streamText({
    model: openai('gpt-4-turbo'),
    messages: await req.json(),
  });
  return result.toAIStreamResponse();
}
```

### 2. Validate User Input
```typescript
import { z } from 'zod';

const messageSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().max(10000), // Limit length
    })
  ).max(50), // Limit conversation history
});

export async function POST(req: Request) {
  const body = await req.json();
  const validated = messageSchema.parse(body); // Throws if invalid
  // ... use validated.messages
}
```

### 3. Rate Limiting (Arcjet)
```typescript
import arcjet, { tokenBucket } from '@arcjet/next';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    tokenBucket({
      mode: 'LIVE',
      refillRate: 10, // 10 requests
      interval: 60, // per minute
      capacity: 20,
    }),
  ],
});

export async function POST(req: Request) {
  const decision = await aj.protect(req);
  if (decision.isDenied()) {
    return new Response('Too many requests', { status: 429 });
  }

  // Process AI request
}
```

---

## Common Patterns

### Pattern 1: Conversational Memory
```typescript
const messages = [
  { role: 'system', content: 'You are a helpful assistant' },
  { role: 'user', content: 'What is the capital of France?' },
  { role: 'assistant', content: 'The capital of France is Paris.' },
  { role: 'user', content: 'What is its population?' },
];

const result = await generateText({
  model: openai('gpt-4-turbo'),
  messages, // AI understands context ("its" = Paris)
});
```

### Pattern 2: System Prompts
```typescript
const result = await generateText({
  model: openai('gpt-4-turbo'),
  system: `You are Sarah, a warm and professional healthcare assistant.
- Always be empathetic and patient
- Use simple language for elderly users
- Confirm medication times before logging
- Escalate emergencies immediately`,
  messages: [{ role: 'user', content: 'I took my blood pressure pill' }],
});
```

### Pattern 3: Function Calling with Retries
```typescript
const result = await generateText({
  model: openai('gpt-4-turbo'),
  messages: [{ role: 'user', content: 'Book a flight to NYC' }],
  tools: {
    searchFlights: {
      description: 'Search for flights',
      parameters: z.object({
        from: z.string(),
        to: z.string(),
        date: z.string(),
      }),
      execute: async (args) => {
        // Retry logic
        let retries = 3;
        while (retries > 0) {
          try {
            return await fetch('https://api.flights.com', {
              method: 'POST',
              body: JSON.stringify(args),
            }).then(r => r.json());
          } catch (error) {
            retries--;
            if (retries === 0) throw error;
            await new Promise(r => setTimeout(r, 1000));
          }
        }
      },
    },
  },
  maxToolRoundtrips: 5, // Allow multiple tool calls
});
```

---

## Troubleshooting

### Issue 1: "Module not found: @ai-sdk/openai"
```bash
# Install provider package
npm install @ai-sdk/openai
```

### Issue 2: Streaming not working
```typescript
// Ensure you're using .toAIStreamResponse()
return result.toAIStreamResponse();

// NOT .toDataStreamResponse() (old API)
```

### Issue 3: Type errors with tools
```typescript
// Ensure parameters use Zod schemas
tools: {
  myTool: {
    description: 'My tool',
    parameters: z.object({ // Must be z.object()
      name: z.string(),
    }),
    execute: async ({ name }) => { // Params auto-typed!
      return { result: name };
    },
  },
}
```

---

## Resources

- **Official Docs:** https://sdk.vercel.ai/docs
- **Examples:** https://github.com/vercel/ai/tree/main/examples
- **Discord:** https://discord.gg/vercel
- **Provider Docs:** https://sdk.vercel.ai/providers
- **Template Examples:** See `/templates/` directory

---

## Cost Estimates

**Development (Testing):**
- GPT-4 Turbo: ~$5-10/month (moderate usage)
- GPT-3.5 Turbo: ~$1-2/month
- Groq (Free tier): $0

**Production (1,000 users):**
- GPT-4 Turbo: ~$500-1,000/month
- GPT-3.5 Turbo: ~$50-100/month
- Anthropic Claude: ~$300-600/month

**Tips:**
- Use GPT-3.5 for simple tasks, GPT-4 for complex reasoning
- Cache frequent queries in Redis
- Limit max_tokens to control costs
- Monitor usage with provider dashboards

---

## Next Steps

1. Install Vercel AI SDK and provider packages
2. Set up API keys in `.env.local`
3. Choose a template from [Template Catalog](../templates/vercel-templates-catalog.md)
4. Explore [code snippets](../code-snippets/) for common patterns
5. Build your AI-powered application

For CARE App specific patterns, see:
- [CARE App V3.0 PRP](../../.ai-coder/prps/care-app-v3-hybrid-open-source.md)
- [Week 1 Quick Start](../../.ai-coder/sessions/care-app-week1-quickstart.md)

---

**Last Updated:** 2025-10-23
**Status:** Production Ready
**Framework Service:** #2 (Core LLM Integration)
