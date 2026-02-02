# New Project from Template Workflow

**Start fresh with production-ready templates from 29+ Vercel templates.**

---

## Purpose

Scaffold a new project from proven templates with pre-integrated services, deployment workflows, and best practices baked in.

---

## When to Use

- Starting a brand new project
- Want proven patterns and structure
- Need pre-integrated services
- Rapid prototyping
- Learning best practices

---

## Available Templates

### AI Chatbots
- `template-nextjs-ai-chatbot` - Vercel AI SDK chatbot
- `template-gemini-ai-chatbot` - Google Gemini integration
- `template-e2b` - Claude AI with artifacts

### SaaS Applications
- `template-multi-tenant-full-stack` - Complete multi-tenant stack
- `template-clerk-nextjs-demo-app-router` - Clerk auth demo
- `template-platforms-starter-kit` - Multi-tenant platforms

### Media & Content
- `template-fal-image-generator` - Fal AI image generation
- `template-fal-video-generator` - Fal AI video generation
- `template-sanity-cms` - Sanity CMS integration

**See:** `docs/templates/` for full catalog

---

## Workflow Phases

### Phase 1: Choose Template

**Browse templates:**

```typescript
{
  "tool": "list_templates"
}
```

**Or consult Template Mapping Guide:**

See `docs/TEMPLATE-MAPPING-GUIDE.md` for feature → template mapping.

---

### Phase 2: Scaffold Project

```bash
# Using CLI
npx tsx src/cli/scaffold.ts <template-name> <project-name>

# Example
npx tsx src/cli/scaffold.ts template-nextjs-ai-chatbot my-chatbot
```

**What happens:**
1. Template cloned from workspace
2. Dependencies installed
3. Git initialized
4. Deployment workflow added
5. Project indexed in AI Coder

---

### Phase 3: Configure Services

**Follow [Pre-Development Setup](./pre-development-setup.md):**

1. Copy `.env.example` to `.env`
2. Configure required services:
   - Clerk (auth)
   - Supabase (database)
   - Upstash (Redis/Vector)
   - Stripe (payments)
   - OpenAI/Anthropic (AI)
3. Validate all services

---

### Phase 4: Start Development

**Use [Staged Development Workflow](./staged-development.md):**

1. Create PRP for first feature
2. Query RAG for template patterns
3. Implement feature
4. Run quality gates
5. Commit
6. Learn from session

---

## Template Categories

### 1. AI/ML Templates
Best for: Chatbots, AI apps, RAG systems

### 2. SaaS Templates
Best for: Multi-tenant apps, B2B platforms

### 3. Content/Media Templates
Best for: CMS, galleries, video platforms

### 4. E-commerce Templates
Best for: Stores, payments, subscriptions

---

## Next Steps

- **→ [Pre-Development Setup](./pre-development-setup.md)** - Configure services
- **→ [Staged Development](./staged-development.md)** - Build features
- **→ [Pre-Deployment Testing](./pre-deployment-testing.md)** - Validate before deploy

---

**Last Updated:** 2025-10-22
