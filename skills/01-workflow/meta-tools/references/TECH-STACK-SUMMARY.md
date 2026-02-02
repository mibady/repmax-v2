# Tech Stack Summary for AI Coder Projects

**Generated:** 2025-12-25
**Purpose:** Complete technology reference for developing Claude skills to manage and build projects
**Repository:** ai-coder-agents v2.0.0

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Technologies](#core-technologies)
3. [3-Layer Architecture (Face → Head → DNA)](#3-layer-architecture)
4. [Complete Technology Stack](#complete-technology-stack)
5. [Service Integration Stack (20+ Services)](#service-integration-stack)
6. [Development Tools & Infrastructure](#development-tools--infrastructure)
7. [Project Types & Templates](#project-types--templates)
8. [Testing & Quality](#testing--quality)
9. [Deployment & DevOps](#deployment--devops)
10. [Key Patterns for Claude Skills](#key-patterns-for-claude-skills)

---

## Architecture Overview

### 5 Core Agent Patterns

```
Pattern 01: Ad Hoc Prompts         → Direct CLI interaction, no code
Pattern 02: Reusable Prompts       → Custom commands (.md/.toml files)
Pattern 03: Sub-Agent Pattern      → Specialized agent execution
Pattern 04: Multi-Agent Systems    → Complex orchestration with MCP
Pattern 05: Production Platforms   → Full-scale production applications
```

### 3-Layer Architecture: Face → Head → DNA

```
┌─────────────────────────────────────────────────┐
│  LAYER 1: FACE (Frontend-to-Backend)           │
│  Purpose: User interaction & UI components      │
│  SDKs: React, AG-UI, Radix UI, shadcn/ui       │
└─────────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────┐
│  LAYER 2: HEAD (Backend-to-LLM Abstraction)    │
│  Purpose: AI logic & model orchestration        │
│  SDKs: Vercel AI SDK, Multi-provider SDKs      │
└─────────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────┐
│  LAYER 3: DNA (Data & Backend Services)        │
│  Purpose: Persistence, auth, payments, jobs     │
│  SDKs: Supabase, Upstash, Stripe               │
└─────────────────────────────────────────────────┘
```

---

## Core Technologies

### Primary Language & Runtime

| Technology | Version | Purpose |
|------------|---------|---------|
| **TypeScript** | ^5.0.0 | Primary language (strict mode) |
| **Node.js** | 18.17.0+ | Runtime (ES2020 target) |
| **NPM** | Latest | Package manager |

### Frontend Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | ^15.0.0 | Full-stack React framework (App Router) |
| **React** | ^18.0.0 / ^19.0.0 | UI library |
| **Tailwind CSS** | ^3.4.0 / ^4.0.0 | Utility-first CSS |

---

## 3-Layer Architecture

### Layer 1: FACE (Frontend-to-Backend)

#### UI Component Libraries

```json
{
  "@ag-ui/client": "latest",
  "@ag-ui/core": "latest",
  "@radix-ui/react-dialog": "^1.0.0",
  "@radix-ui/react-dropdown-menu": "^2.0.0",
  "@radix-ui/react-select": "^2.0.0",
  "@radix-ui/react-toast": "^1.0.0",
  "@radix-ui/react-tooltip": "^1.0.0"
}
```

**shadcn/ui:** 50+ pre-styled components (copy to project)
- Install via: `npx shadcn@latest add <component>`
- Available via MCP: shadcn-ui MCP server

#### Animation & Styling

```json
{
  "framer-motion": "^11.0.0",
  "tailwindcss": "^3.4.0",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.2.0"
}
```

---

### Layer 2: HEAD (Backend-to-LLM)

#### Vercel AI SDK (Primary - ALWAYS PREFER)

```json
{
  "ai": "^4.1.0 || ^5.0.26"
}
```

**Features:**
- Unified interface for all LLM providers
- Streaming text generation
- Tool/function calling
- Edge runtime compatible
- React hooks: `useChat`, `useCompletion`

#### AI SDK Providers

```json
{
  "@ai-sdk/openai": "^1.0.0",
  "@ai-sdk/anthropic": "^1.0.0",
  "@ai-sdk/google": "^1.0.0",
  "@ai-sdk/google-vertex": "^1.0.0",
  "@ai-sdk/fireworks": "^1.0.0",
  "@ai-sdk/replicate": "^1.0.0",
  "@ai-sdk/mistral": "^1.0.0",
  "@ai-sdk/xai": "^1.0.0",
  "@ai-sdk/fal": "^1.0.0"
}
```

#### Provider Selection Guide

| Use Case | Provider | SDK |
|----------|----------|-----|
| Chat/reasoning | OpenAI GPT-4 | `@ai-sdk/openai` |
| Code generation | Anthropic Claude | `@ai-sdk/anthropic` |
| Multimodal | Google Gemini | `@ai-sdk/google` |
| Enterprise | Google Vertex AI | `@ai-sdk/google-vertex` |
| Fast inference | Fireworks AI | `@ai-sdk/fireworks` |
| Image generation | Replicate | `@ai-sdk/replicate` |

#### Direct Provider SDKs (Use Only for Specific Features)

```json
{
  "openai": "^6.6.0",
  "@google/genai": "^0.21.0"
}
```

**Use direct SDKs ONLY for:**
- OpenAI: Assistants API, Fine-tuning, Embeddings
- Google GenAI: Gemini-specific features

**DO NOT use for chat/completion** (use Vercel AI SDK instead)

#### Specialized AI SDKs

```json
{
  "@fal-ai/client": "^1.0.0",
  "@fal-ai/server-proxy": "^1.0.0",
  "@e2b/code-interpreter": "^1.0.0",
  "@deepgram/sdk": "^3.0.0"
}
```

---

### Layer 3: DNA (Data & Backend Services)

#### Primary Database: Supabase (Recommended)

```json
{
  "@supabase/supabase-js": "^2.39.0",
  "pg": "^8.16.3"
}
```

**Features:**
- PostgreSQL database
- Real-time subscriptions
- Row-level security
- File storage
- Built-in authentication

**When to use:** Pattern 04, 05 (persistent data)

#### Alternative Databases

```json
{
  "drizzle-orm": "^0.30.0",
  "@neondatabase/serverless": "^0.9.0"
}
```

#### Cache & Vector Storage: Upstash Stack (Serverless)

```json
{
  "@upstash/redis": "^1.35.6",
  "@upstash/vector": "^1.2.2",
  "@upstash/qstash": "^2.0.0",
  "@upstash/ratelimit": "^2.0.0"
}
```

**Upstash Redis:** Caching, sessions, real-time data
**Upstash Vector:** RAG, semantic search, embeddings (384-dimension)
**Upstash QStash:** Background jobs, scheduled tasks
**Upstash Ratelimit:** API rate limiting

#### Object Storage

```json
{
  "@vercel/blob": "^0.24.0",
  "@vercel/kv": "^3.0.0"
}
```

#### Authentication

```json
{
  "@supabase/ssr": "^0.5.0",
  "next-auth": "^5.0.0"
}
```

**Supabase Auth (Recommended for SaaS):**
- Social logins (Google, GitHub, etc.)
- Email/password + Magic links
- Multi-factor auth
- Row-level security integration
- Custom organization tables

**NextAuth.js:** Flexible authentication for custom flows

#### Payments

```json
{
  "stripe": "^18.0.0",
  "@stripe/react-stripe-js": "^3.0.0"
}
```

**Features:** One-time payments, subscriptions, invoices, webhooks

---

## Complete Technology Stack

### Communication & Workflows

#### Email (Resend)
```json
{
  "resend": "^4.0.0",
  "@react-email/components": "^0.0.25"
}
```

#### Background Jobs (Inngest)
```json
{
  "inngest": "^3.0.0"
}
```

**Features:** Durable workflows, retries, step functions, scheduled jobs

#### Analytics
```json
{
  "posthog-js": "^1.200.0"
}
```

### Content & Media

#### Sanity CMS
```json
{
  "@sanity/client": "^6.0.0",
  "@sanity/image-url": "^1.0.0",
  "next-sanity": "^9.0.0"
}
```

#### Mux Video
```json
{
  "@mux/mux-node": "^8.0.0",
  "@mux/mux-player-react": "^3.0.0"
}
```

#### Media Optimization
```json
{
  "cloudinary": "^2.0.0",
  "next-video": "^1.0.0"
}
```

### Collaboration

#### Liveblocks
```json
{
  "@liveblocks/client": "^2.0.0",
  "@liveblocks/react": "^2.0.0",
  "@liveblocks/node": "^2.0.0"
}
```

**Features:** Presence, cursors, comments, real-time sync

### Monitoring & Security

#### Sentry (Error Tracking)
```json
{
  "@sentry/nextjs": "^9.0.0"
}
```

#### Arcjet (Security)
```json
{
  "@arcjet/next": "^1.0.0",
  "@arcjet/react": "^1.0.0"
}
```

**Features:** Rate limiting, bot detection, WAF, email validation

---

## Service Integration Stack (20+ Services)

### 🤖 AI & LLM Integration
- **Vercel AI SDK** - Core LLM integration layer

### 🎤 Voice & Speech
- **Deepgram** - Speech-to-text and text-to-speech AI

### 📧 Email & Communications
- **Resend** - Modern email API for transactional emails
- **Twilio** - Programmable voice, SMS, and video

### ⚙️ Workflow & Automation
- **Inngest** - Background job processing and workflow automation
- **Vercel Cron** - Scheduled task execution

### 🔒 Security & Protection
- **Arcjet** - Application security (rate limiting, bot detection, DDoS)

### 💾 Databases & Storage
- **Upstash Redis** - Serverless Redis database
- **Upstash Vector** - Vector database for AI/RAG applications
- **Upstash QStash** - Message queue and task scheduling
- **Supabase** - PostgreSQL database with real-time features
- **Vercel Blob** - File storage

### 🎥 Media & Content
- **Mux** - Video hosting and streaming
- **fal.ai** - AI image and video generation
- **Sanity** - Headless CMS

### 🤝 Collaboration
- **Liveblocks** - Real-time collaboration features

### 💳 Payments
- **Stripe** - Payment processing and billing

### 🔐 Authentication
- **Supabase Auth** - User authentication with RLS integration

### 📊 Monitoring & Analytics
- **Sentry** - Error tracking and performance monitoring

### 🐙 Development Tools
- **GitHub** - Version control and CI/CD integration

**Full Documentation:** `/docs/services/` (20 comprehensive guides)

---

## Development Tools & Infrastructure

### MCP (Model Context Protocol)

```json
{
  "@modelcontextprotocol/sdk": "^1.0.0"
}
```

**Purpose:** Build MCP servers for AI agents
**Current Usage:** ai-coder MCP server with 12+ tools

**Available MCP Tools:**
- `query_knowledge_base` - RAG semantic search
- `get_active_context` - Session state recovery
- `run_quality_gates` - CodeRabbit + tests + build
- `create_prp` - Product Requirement Prompt generation
- `parse_prp` - Structured PRP parsing
- `get_project_context` - Project information
- `create_documentation` - Template-based docs
- `run_tests` - Test execution
- `list_projects` - Project listing
- `get_prp_list` - PRP enumeration

### CLI Framework

```json
{
  "commander": "^11.1.0",
  "chalk": "^5.0.0",
  "ora": "^8.0.0",
  "inquirer": "^11.0.0"
}
```

### Utility Libraries

```json
{
  "dotenv": "^16.0.0",
  "glob": "^10.4.5",
  "uuid": "^9.0.1"
}
```

---

## Project Types & Templates

### Supported Project Types (8)

1. **web** - Standard web applications
2. **api** - API services
3. **agent-saas** - AI-powered SaaS platforms
4. **agent-chat** - Chatbot applications
5. **rag-app** - RAG-enabled applications
6. **mcp-platform** - MCP server platforms
7. **multi-agent** - Multi-agent systems
8. **custom** - Custom project types

### Template Categories (20+ Templates)

#### Multi-Tenancy & SaaS
- **Platforms Starter Kit** - Multi-tenant with custom subdomains

#### Authentication
- **Supabase Auth Starter**

#### Content Management (CMS)
- **Sanity Template (Next.js Clean)**

#### AI & Machine Learning
- **Open Source AI Artifacts**
- **FAL Video Generator**
- **FAL Image Generator**
- **Next.js AI Chatbot**
- **Gemini AI Chatbot**
- **Live Transcription**
- **Gemini 2.0 Flash Image Generation**
- **Upstash Vector + Vercel AI SDK Starter**

#### Media & Video
- **Next Video Starter**
- **Blob Starter**
- **Image Gallery Starter**

#### Storage & Data
- **Upstash QStash + Next.js**
- **Upstash Redis + Next.js**
- **Upstash Vector + Next.js**

#### Automation & Cron
- **Vercel Cron**

#### Collaboration & Real-time
- **Liveblocks Starter Kit**

#### Admin Templates
- **Materio MUI Next.js Admin Template**

**Full Documentation:** `/docs/templates/` (7 comprehensive guides)

---

## Testing & Quality

### Unit Testing

```json
{
  "jest": "^29.0.0",
  "@types/jest": "^29.0.0",
  "ts-jest": "^29.0.0",
  "vitest": "^3.2.4"
}
```

**Jest Configuration:**
- Coverage threshold: 70% (branches, functions, lines, statements)
- Test files: `**/__tests__/**/*.test.ts`

### E2E Testing

```json
{
  "@playwright/test": "^1.40.0",
  "playwright": "^1.40.0"
}
```

**Playwright Configuration:**
- Browsers: Chromium, Firefox, WebKit
- Mobile: Pixel 5, iPhone 12
- Features: Screenshots on failure, video retention, trace collection

### Code Quality

```json
{
  "eslint": "^8.0.0",
  "@typescript-eslint/eslint-plugin": "^6.0.0",
  "@typescript-eslint/parser": "^6.0.0",
  "prettier": "^3.0.0",
  "husky": "^9.1.7"
}
```

### Quality Gates

**Pre-commit Hooks (Enforced via Husky):**
1. Secret detection
2. Commit size limits (max 15 files)
3. Markdown file location validation
4. Workflow template verification
5. Linting (if npm script exists)

**CodeRabbit Integration:**
- Automated code review
- Review profile: "chill"
- Focus: Security, TypeScript types, MCP tools, async/await, error handling
- Mandatory: 0 blockers before progression

---

## Deployment & DevOps

### Vercel Deployment

**Environment Variables (Comprehensive Stack):**

```bash
# Database & Auth (Supabase)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PRISMA_URL=

# Email (Resend)
RESEND_API_KEY=

# Payments (Stripe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Security (Arcjet)
ARCJET_KEY=

# Upstash Services
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
UPSTASH_VECTOR_REST_URL=
UPSTASH_VECTOR_REST_TOKEN=
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=

# Workflow (Inngest)
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Media (Mux)
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=

# AI Media (fal.ai)
FAL_KEY=

# CMS (Sanity)
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
SANITY_API_TOKEN=

# Collaboration (Liveblocks)
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=
LIVEBLOCKS_SECRET_KEY=

# Monitoring (Sentry)
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Storage (Vercel)
BLOB_READ_WRITE_TOKEN=

# AI & LLM (Vercel AI SDK)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=

# Voice & Speech (Deepgram)
DEEPGRAM_API_KEY=

# Telephony (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

### External CLIs

#### GitHub CLI (`gh`)
- **Version:** v2.45.0
- **Installation:** `brew install gh`
- **Authentication:** `gh auth login`
- **Uses:** Pull requests, issues, workflow monitoring

#### Vercel CLI (`vercel`)
- **Version:** v48.4.0
- **Installation:** `npm i -g vercel`
- **Authentication:** `vercel login`
- **Uses:** Deployments, environment variables, monitoring

#### Supabase CLI (`supabase`)
- **Version:** ^2.48.3 (dev dependency)
- **Uses:** Local development, migrations, database management

---

## Key Patterns for Claude Skills

### SDK Selection Decision Trees

#### "Should I use Vercel AI SDK or direct provider SDK?"

```
Are you doing chat/completion/streaming?
  ├─ YES → Use Vercel AI SDK (ai) ✅
  └─ NO → Do you need provider-specific features?
          ├─ YES → Use direct SDK (openai, @google/genai)
          └─ NO → Use Vercel AI SDK anyway (better DX)
```

#### "Which database SDK should I use?"

```
Do you need real-time features?
  ├─ YES → Supabase (@supabase/supabase-js) ✅
  └─ NO → Do you need serverless scaling?
          ├─ YES → Neon (@neondatabase/serverless)
          └─ NO → Supabase or raw PostgreSQL (pg)
```

#### "Which auth SDK should I use?"

```
Do you need organization/team features?
  ├─ YES → Supabase Auth (@supabase/ssr) + custom org tables ✅
  └─ NO → Do you need complete control?
          ├─ YES → NextAuth (next-auth)
          └─ NO → Supabase Auth (integrated with database)
```

### SDK Stack by Pattern

#### Pattern 01: Ad Hoc Prompts
- **SDKs:** None or minimal
- **Approach:** Direct API calls, no infrastructure

#### Pattern 02: Reusable Prompt
```json
{
  "next": "^15.0.0",
  "react": "^19.0.0",
  "tailwindcss": "^3.4.0"
}
```
**Plus ONE service SDK:** Supabase, Upstash, Vercel Blob, or Sanity

#### Pattern 03: Sub-Agent Pattern
```json
{
  "@ag-ui/client": "latest",
  "ai": "^5.0.0",
  "zustand": "^5.0.0"
}
```
**Plus ONE AI provider:** `@ai-sdk/google`, `@deepgram/sdk`, or `@fal-ai/client`

#### Pattern 04: MCP Wrapper
```json
{
  "@modelcontextprotocol/sdk": "^1.0.0",
  "ai": "^5.0.0",
  "@ai-sdk/openai": "^1.0.0",
  "@ai-sdk/anthropic": "^1.0.0"
}
```
**Plus 3+ service SDKs:** Upstash Vector, E2B, FAL, Stripe

#### Pattern 05: Full Application

**Layer 1 (Face):**
```json
{
  "@ag-ui/client": "latest",
  "react": "^19.0.0",
  "@radix-ui/*": "^2.0.0",
  "framer-motion": "^11.0.0"
}
```

**Layer 2 (Head):**
```json
{
  "ai": "^5.0.0",
  "@ai-sdk/openai": "^1.0.0",
  "@ai-sdk/anthropic": "^1.0.0",
  "@ai-sdk/google": "^1.0.0"
}
```

**Layer 3 (DNA):**
```json
{
  "@supabase/supabase-js": "^2.39.0",
  "@supabase/ssr": "^0.5.0",
  "@upstash/redis": "^1.35.6",
  "@upstash/vector": "^1.2.2",
  "stripe": "^18.0.0",
  "inngest": "^3.0.0",
  "resend": "^4.0.0",
  "@sentry/nextjs": "^9.0.0"
}
```

---

## Best Practices for Claude Skills

### 1. Prefer Vercel AI SDK Over Direct Provider SDKs

✅ **Good:**
```typescript
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const result = await generateText({
  model: openai('gpt-4'),
  prompt: 'Hello'
});
```

❌ **Avoid:**
```typescript
import OpenAI from 'openai';

const client = new OpenAI();
const result = await client.chat.completions.create({...});
```

### 2. Use Supabase for Pattern 05, Upstash for Pattern 04
- **Pattern 05 (Full App):** Supabase (complete backend)
- **Pattern 04 (MCP Wrapper):** Upstash (serverless services)

### 3. Always Include Error Tracking (Sentry)
Every production app should have `@sentry/nextjs`

### 4. Use MCP SDKs for Pattern 04
When building MCP wrappers, use `@modelcontextprotocol/sdk`

### 5. Follow 5-Phase Workflow Pipeline
**Planning → Building → Reviewing → Testing → Deploying**

### 6. Enforce Quality Gates
- CodeRabbit review after each milestone
- 0 blockers before progression
- 70% test coverage minimum

---

## Architecture Patterns

### RAG-First Architecture
- Vector-backed knowledge base for all projects
- Upstash Vector (384-dimension)
- OpenAI `text-embedding-3-small` embeddings

### Template-Based Scaffolding
- 29+ production templates
- Service integration matrix
- Documented best practices for 20+ services

### Session Persistence
- Automatic state recovery across sessions
- Session storage: `.ai-coder/sessions/`

### Milestone-Based Development
- Naming: `M{number}: {Phase} - {Feature}`
- Quality gate enforcement
- CodeRabbit reviews between phases

### Multi-Tenancy Support
- Subdomain-based architecture
- Documented patterns for SaaS platforms
- Redis key pattern: `subdomain:{name}`

---

## Common Stack Combinations

### For SaaS Applications
1. **Authentication:** Supabase Auth
2. **Database:** Supabase
3. **Payments:** Stripe
4. **Email:** Resend
5. **Background Jobs:** Inngest
6. **Security:** Arcjet
7. **Monitoring:** Sentry

### For AI Applications
1. **LLM Integration:** Vercel AI SDK
2. **Vector Database:** Upstash Vector
3. **AI Media:** fal.ai
4. **Caching:** Upstash Redis
5. **Background Processing:** Inngest

### For Voice-Enabled Apps
1. **LLM Integration:** Vercel AI SDK
2. **Speech Processing:** Deepgram
3. **Telephony:** Twilio
4. **Database:** Supabase
5. **Caching:** Upstash Redis

### For Content Platforms
1. **CMS:** Sanity
2. **Media Storage:** Vercel Blob or Mux
3. **Image Delivery:** fal.ai

### For Collaborative Apps
1. **Real-time Features:** Liveblocks
2. **Database:** Supabase
3. **Authentication:** Supabase Auth

---

## Summary Statistics

**Total SDKs/CLIs Documented:** 60+

**By Category:**
- AI/LLM SDKs: 15+
- Database/Storage: 8
- Authentication: 2
- Cache/Vector: 4
- Payments: 2
- Communication: 3
- Media/Content: 6
- Collaboration: 1
- Monitoring/Security: 2
- Development Tools: 10+
- External CLIs: 3

**By Pattern:**
- Pattern 01: 0 SDKs (ad hoc)
- Pattern 02: 3-5 SDKs (minimal stack)
- Pattern 03: 5-8 SDKs (specialized)
- Pattern 04: 8-12 SDKs (service integration)
- Pattern 05: 15+ SDKs (complete stack)

**Project Types:** 8
**Templates:** 20+
**Service Integrations:** 20+
**MCP Tools:** 12+
**Test Coverage Threshold:** 70%

---

## Quick Reference Checklist

### Essential SDKs for Every Project

**Layer 1 (Face):**
```
react, next, @ag-ui/client, @radix-ui/*, tailwindcss
```

**Layer 2 (Head):**
```
ai, @ai-sdk/openai, @ai-sdk/anthropic, @ai-sdk/google
```

**Layer 3 (DNA):**
```
@supabase/supabase-js, @supabase/ssr, @upstash/redis, @upstash/vector,
stripe, inngest, resend, @sentry/nextjs
```

### Configuration Files Required

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration (strict mode)
- `tailwind.config.js` - Tailwind CSS configuration
- `next.config.js` - Next.js configuration
- `.env.local` - Environment variables
- `.eslintrc.json` - ESLint configuration
- `jest.config.js` - Jest configuration
- `playwright.config.ts` - Playwright E2E configuration
- `.husky/pre-commit` - Git hooks

### Development Workflow

1. **Initialize:** `ai-coder init <project-name> --type <type> --scaffold`
2. **Install:** `npm install`
3. **Configure:** Set up `.env.local` with service credentials
4. **Develop:** `npm run dev`
5. **Test:** `npm test` (Jest) and `npm run test:e2e` (Playwright)
6. **Lint:** `npm run lint`
7. **Build:** `npm run build`
8. **Deploy:** `vercel` or `vercel --prod`

### Quality Gates Before Deployment

1. ✅ All tests passing (70% coverage minimum)
2. ✅ Build successful
3. ✅ Linting passed
4. ✅ CodeRabbit review completed (0 blockers)
5. ✅ Environment variables configured
6. ✅ Error tracking (Sentry) configured

---

## Related Documentation

- [AI Coder Framework](/docs/AI-CODER-FRAMEWORK.md) - 5 Core Patterns
- [SDK CLI Architecture](/docs/SDK-CLI-ARCHITECTURE.md) - 3-Layer Architecture
- [Template Framework Mapping](/docs/TEMPLATE-FRAMEWORK-MAPPING.md) - Templates by pattern
- [Services Integration Matrix](/docs/services/INTEGRATION-MATRIX.md) - Service docs
- [CLI Tools Usage](/docs/CLI-TOOLS-USAGE.md) - GitHub & Vercel CLI
- [CLI Commands Reference](/docs/CLI-COMMANDS-REFERENCE.md) - Command reference
- [Quick Implementation Checklist](/docs/QUICK-IMPLEMENTATION-CHECKLIST.md) - Quick reference

---

**This comprehensive tech stack summary provides everything needed for Claude skills to build and manage production-grade AI applications following the exact same stack used across all projects.**

**Status:** ✅ Production Reference
**Knowledge Base:** Ready for ingestion
**Last Updated:** 2025-12-25
