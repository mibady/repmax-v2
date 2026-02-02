# AG-UI Protocol - Quick Reference Card

**For:** Developers & AI Coder Agent
**Version:** 1.0
**Print-friendly:** Yes

---

## What is AG-UI? (30 seconds)

**AG-UI = Agent-UI Protocol**

The "Face" layer (Layer 1) in the 3-Layer Architecture.

**NOT:** A package to install
**IS:** A design pattern for user-agent interaction

---

## The 3-Layer Architecture

```
┌─────────────────────────────┐
│ Layer 1: Face (AG-UI)       │ ← User interacts here
│ React + Streaming           │
└──────────┬──────────────────┘
           ↓ HTTP/SSE
┌─────────────────────────────┐
│ Layer 2: Head (Backend)     │ ← Agent orchestration
│ Next.js + Vercel AI SDK     │
└──────────┬──────────────────┘
           ↓
┌─────────────────────────────┐
│ Layer 3: DNA (Services)     │ ← Data & tools
│ Supabase + Upstash + APIs   │
└─────────────────────────────┘
```

---

## Quick Implementation (2 minutes)

### Frontend (Layer 1)
```typescript
import { useChat } from 'ai/react';

const { messages, input, handleSubmit } = useChat({
  api: '/api/chat'
});
```

### Backend (Layer 2)
```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({ model: openai('gpt-4'), messages });
  return result.toDataStreamResponse();
}
```

**That's it! You have AG-UI.**

---

## Templates with AG-UI (All Pattern 05)

| Template | AG-UI Type | Use Case |
|----------|-----------|----------|
| **nextjs-ai-chatbot** | Basic chat | General AI apps |
| **e2b** | **Artifacts** | Code generation |
| **multi-tenant** | Workspace chat | B2B SaaS |
| **online-store** | Product chat | E-commerce |
| **platforms** | Multi-site | Platform services |

---

## AG-UI Implementations

### 1. Basic Chat (useChat)
**Template:** template-nextjs-ai-chatbot

```typescript
const { messages, input, handleSubmit } = useChat();
```

**Features:**
- Streaming responses
- Multi-model support
- Tool calling
- Chat history

---

### 2. Artifacts Protocol ⭐ (Most Advanced)
**Template:** template-e2b

```typescript
const { artifact, isGenerating } = useArtifact({
  endpoint: '/api/artifact',
  kind: 'code'  // or 'text', 'sheet'
});
```

**Features:**
- Interactive code generation
- React component rendering
- E2B sandbox execution
- Live preview
- Diagrams/charts

**Artifact Types:**
- `text` - Markdown, documents
- `code` - TypeScript with execution
- `sheet` - Spreadsheets with formulas

---

### 3. Workspace Chat (Server Actions)
**Template:** template-multi-tenant-full-stack

```typescript
await createChatMessage({
  workspaceId,
  message
});
```

**Features:**
- Workspace isolation
- Clerk auth
- Supabase RLS
- Team collaboration

---

### 4. Product Chat (E-commerce)
**Template:** template-online-store-with-stripe

```typescript
const { messages } = useChat({
  api: '/api/product-chat',
  body: { productId }
});
```

**Features:**
- Product context
- Stripe checkout tool
- Inventory checks
- Purchase assistance

---

## Can I Mix Templates?

**YES!** Copy AG-UI implementations between templates.

### Example: Add Artifacts to Chatbot

```bash
# 1. Start with chatbot
cp -r templates/template-nextjs-ai-chatbot ./my-app

# 2. Copy Artifacts Protocol
cp -r templates/template-e2b/lib/artifacts ./my-app/lib/
cp -r templates/template-e2b/components/artifact* ./my-app/components/

# 3. Install E2B
npm install @e2b/code-interpreter

# 4. Set API key
echo "E2B_API_KEY=your-key" >> .env.local
```

**Result:** Chatbot + Code Generation

---

## Common Patterns

### Pattern 1: Observable (Streaming)
```typescript
agent.onThought(thought => console.log('Thinking:', thought));
agent.onToolCall(tool => console.log('Using:', tool));
agent.onComplete(response => console.log('Done:', response));
```

### Pattern 2: SSE Streaming
```typescript
// Backend
const result = streamText({ model, messages });
return result.toDataStreamResponse();

// Frontend: receives chunks automatically
```

### Pattern 3: Context Injection
```typescript
const result = streamText({
  model: openai('gpt-4'),
  messages,
  system: `Context: ${workspaceContext}`,  // Inject context
  tools: { /* domain tools */ }
});
```

### Pattern 4: Tool Orchestration
```typescript
tools: {
  getWeather: {
    description: 'Get weather',
    execute: async ({ location }) => { /* ... */ }
  },
  createCheckout: {
    description: 'Create checkout',
    execute: async ({ items }) => { /* ... */ }
  }
}
```

---

## Decision Tree

```
Need AG-UI?
│
├─ General chat → template-nextjs-ai-chatbot
├─ Code generation → template-e2b (Artifacts)
├─ Multi-tenant → template-multi-tenant-full-stack
├─ E-commerce → template-online-store-with-stripe
└─ Custom → Mix templates
```

---

## Key Differences

| Feature | useChat | Artifacts Protocol |
|---------|---------|-------------------|
| **Type** | Text chat | Interactive artifacts |
| **Output** | Text messages | Code/React/diagrams |
| **Execution** | None | E2B sandbox |
| **Preview** | N/A | Live preview |
| **Complexity** | Simple | Advanced |
| **Use Case** | Conversation | Generation |

---

## Common Questions

### Q: Is AG-UI a package?
**A:** No, it's a design pattern.

### Q: Which template should I start with?
**A:** template-nextjs-ai-chatbot (default) or template-e2b (code generation)

### Q: Can I use Artifacts Protocol in other templates?
**A:** Yes! Copy from template-e2b to any Pattern 05 template.

### Q: Do I need to install AG-UI?
**A:** No. Install Vercel AI SDK (`npm install ai`)

### Q: What's the difference between AG-UI implementations?
**A:** Each template implements AG-UI differently based on use case:
- Chatbot: Basic text streaming
- E2B: Interactive artifacts with execution
- Multi-tenant: Workspace-scoped context
- E-commerce: Product-centric context

---

## Cheat Sheet

### Install
```bash
npm install ai @ai-sdk/openai
```

### Frontend Hook
```typescript
import { useChat } from 'ai/react';
const { messages, input, handleSubmit } = useChat();
```

### Backend Route
```typescript
import { streamText } from 'ai';
const result = streamText({ model, messages });
return result.toDataStreamResponse();
```

### With Tools
```typescript
tools: {
  toolName: {
    description: 'Tool description',
    parameters: z.object({ /* schema */ }),
    execute: async (params) => { /* implementation */ }
  }
}
```

### With Context
```typescript
system: `You are an assistant for ${context}`
```

---

## Templates Quick Pick

| I need... | Use this template |
|-----------|------------------|
| General AI chatbot | template-nextjs-ai-chatbot |
| Code generator | template-e2b |
| B2B SaaS | template-multi-tenant-full-stack |
| Online store | template-online-store-with-stripe |
| Multi-site platform | template-platforms-starter-kit |
| RAG/Search | template-upstash-vector-ai-sdk-starter + add AG-UI |
| Real-time collab | templates-liveblocks-starter-kit + add AG-UI |

---

## Advanced: Add AG-UI to Pattern 03/04

```bash
# 1. Install Vercel AI SDK
npm install ai @ai-sdk/openai

# 2. Create frontend (Layer 1)
# app/chat/page.tsx with useChat

# 3. Create backend (Layer 2)
# app/api/chat/route.ts with streamText

# Result: Pattern 03/04 → Pattern 05
```

---

## Resources

- **Full Docs:** docs/AG-UI-PROTOCOL-ARCHITECTURE.md
- **Detailed Guide:** .ai-coder/sessions/AG-UI-PROTOCOL-EXPLAINED.md
- **Framework:** docs/AI-CODER-FRAMEWORK.md (3-Layer Architecture)
- **Templates:** templates/README.md

---

## Summary

**AG-UI Protocol = Layer 1 (Face) in 3-Layer Architecture**

- ✅ Design pattern, not a package
- ✅ All Pattern 05 templates have it
- ✅ Implemented via Vercel AI SDK
- ✅ Can be mixed between templates
- ✅ Artifacts Protocol is most advanced

**Start with:** template-nextjs-ai-chatbot or template-e2b

---

**Last Updated:** 2025-10-25
**Print this:** PDF-friendly reference
