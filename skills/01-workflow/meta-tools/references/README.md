# AI Coder - Workflows

**Complete development workflows for building production-ready software with templates and existing codebases.**

---

## 📖 Available Workflows

### Project Initialization Workflows

| Workflow | Description | Status | When to Use |
|----------|-------------|--------|-------------|
| [New Project from Template](./new-project-template.md) | Scaffold from 29+ production templates | ✅ **RECOMMENDED** | Starting fresh with proven patterns |
| [Import Existing Project](./import-existing-project.md) | Import & index existing codebases | ✅ **NEW** | Continue work on existing apps |
| [Pre-Development Setup](./pre-development-setup.md) | "Setup-First" workflow for services | ✅ **MANDATORY** | Before ANY new project |

### Core Development Workflows

| Workflow | Description | Status | When to Use |
|----------|-------------|--------|-------------|
| [Staged Development](./staged-development.md) | Multi-phase workflow with quality gates | ✅ **RECOMMENDED** | All feature development |
| [Continue Development](./continue-development.md) | Work on existing features/codebases | ✅ **NEW** | Resuming or enhancing existing code |
| [Fix Bugs](./fix-bugs.md) | RAG-powered bug fixing workflow | ✅ **NEW** | Debugging existing codebases |

### Deployment & Testing

| Workflow | Description | When to Use |
|----------|-------------|-------------|
| [Pre-Deployment Testing](./pre-deployment-testing.md) | Comprehensive validation before deploy | Before EVERY deployment |
| [Deployment](./deployment.md) | Complete deployment process | When deploying to production |

### Templates & Patterns

| Workflow | Description | When to Use |
|----------|-------------|-------------|
| [Prompt Templates](./prompt-templates.md) | Reusable prompt patterns | Creating new features |

### Advanced Learning (NEW)

| Workflow | Description | Status | When to Use |
|----------|-------------|--------|-------------|
| [Advanced Learning Features](./advanced-learning.md) | Pattern matching, recommendations, metrics | ✅ **NEW (Phase 6)** | Continuous learning & optimization |

---

## 🎯 Workflow Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│ START: Choose Your Path                                 │
├─────────────────────────────────────────────────────────┤
│  Path A: New Project → Template Scaffolding             │
│  Path B: Existing Project → Import & Index              │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 1. PRE-DEVELOPMENT SETUP (First Time)                  │
│    - Install dependencies                               │
│    - Configure environment variables                    │
│    - Set up 14 core services                           │
│    - Validate ALL integrations                          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 2. STAGED DEVELOPMENT (Per Feature - Repeat)           │
│    Phase 1: Planning → Create PRP                      │
│    Phase 2: RAG Query → Search knowledge base          │
│    Phase 3: Building → Write code + tests              │
│    Phase 4: Review → CodeRabbit analysis               │
│    Phase 5: Quality Gate → Tests + Build + Lint        │
│    Phase 6: Commit → Atomic commits                    │
│    Phase 7: Learn → Index patterns to RAG              │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 3. PRE-DEPLOYMENT TESTING (Before Deploy)              │
│    - Environment validation                             │
│    - Service validation (14 services)                   │
│    - Authentication testing                             │
│    - Database validation                                │
│    - Security audit                                     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 4. DEPLOYMENT (When Ready)                             │
│    - Push to production (Vercel)                        │
│    - Run smoke tests                                    │
│    - Monitor deployment                                 │
│    - Verify all services                                │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Workflow Descriptions

### NEW: Import Existing Project Workflow

**Purpose:** Bring existing codebases into AI Coder with full RAG indexing.

**Key Principle:** Understand before modifying - index first, code second.

**Phases:**
1. Analyze tech stack and dependencies
2. Index entire codebase into RAG (1000+ vectors)
3. Extract business logic patterns
4. Generate PRP from existing code
5. Ready for continued development

**Output:** Fully indexed project with AI understanding of codebase.

**See:** [Import Existing Project Guide](./import-existing-project.md)

---

### NEW: Continue Development Workflow

**Purpose:** Resume work on existing projects with full context.

**Key Principle:** RAG-first - query knowledge base before coding.

**Phases:**
1. Load project context
2. Query RAG for relevant code
3. Understand existing patterns
4. Implement changes following existing style
5. Learn from session

**Output:** Context-aware changes that align with existing codebase.

**See:** [Continue Development Guide](./continue-development.md)

---

### NEW: Fix Bugs Workflow

**Purpose:** Debug existing code using RAG-powered semantic search.

**Key Principle:** Search semantically, not just syntactically.

**Phases:**
1. Describe the bug in natural language
2. Query RAG for related code
3. Analyze patterns and dependencies
4. Implement fix with full context
5. Add test to prevent regression

**Output:** Bug fix with comprehensive understanding and tests.

**See:** [Fix Bugs Guide](./fix-bugs.md)

---

### Staged Development Workflow

**Purpose:** Enforce quality gates at every development stage.

**Key Principle:** "Query → Write → Review → Test → Commit → Learn" for each feature.

**Phases:**
1. **Planning** - Create structured PRP
2. **RAG Query** - Search for relevant patterns (NEW)
3. **Building** - Implement ONE step at a time
4. **Internal Review** - Analyze code quality
5. **Quality Gate** - Automated checks (CodeRabbit, tests, linting)
6. **Testing** - Run all test suites
7. **Committing** - Create atomic commits
8. **Learning** - Index patterns to RAG (NEW)

**Enforcement:**
- Pre-commit hooks (fast checks)
- Pre-push hooks (comprehensive validation)
- CodeRabbit review (security, quality)
- RAG compliance tracking (NEW)

**Output:** High-quality, tested, reviewed code with learned patterns.

**See:** [Staged Development Guide](./staged-development.md)

---

### Pre-Development Setup Workflow

**Purpose:** Ensure ALL infrastructure is configured before writing ANY code.

**Key Principle:** "Setup-First" approach - no coding until everything is ready.

**Phases:**
1. Environment Variables Setup
2. Service Integration (14 core services)
3. Local Development Configuration
4. Validation Tests (ALL services must pass)

**14 Core Services:**
- Authentication (Clerk)
- Database (Supabase)
- Caching (Upstash Redis)
- RAG/Vector (Upstash Vector)
- Payments (Stripe)
- Email (Resend)
- Security (Arcjet)
- Error Tracking (Sentry)
- AI (Vercel AI SDK)
- And more...

**Output:** Fully configured project ready for feature development.

**See:** [Pre-Development Setup Guide](./pre-development-setup.md)

---

### Pre-Deployment Testing Workflow

**Purpose:** Comprehensive validation of ALL services before deployment.

**Key Principle:** NO service skips. Every service must pass validation.

**Focus Areas:**
1. **Authentication** - Clerk integration tests
2. **Database** - Supabase migrations, RLS
3. **AI Services** - LLM, embeddings, RAG
4. **Storage** - Redis, Vector, QStash
5. **Payments** - Stripe webhooks
6. **Security** - Rate limiting, bot protection

**Output:** Confidence that ALL services work together correctly.

**See:** [Pre-Deployment Testing Guide](./pre-deployment-testing.md)

---

### Deployment Workflow

**Purpose:** Deploy to production safely and monitor results.

**Phases:**
1. Final validation (pre-deployment tests)
2. Push to Vercel
3. Smoke tests in production
4. Monitor for errors
5. Rollback if issues detected

**Output:** Production deployment with monitoring.

**See:** [Deployment Guide](./deployment.md)

---

## 🚨 Critical Rules

### Rule 1: Always Query RAG Before Coding (NEW)
❌ **WRONG:** Start coding immediately without context
✅ **CORRECT:** Query knowledge base for existing patterns first

### Rule 2: Choose the Right Workflow
❌ **WRONG:** Use template workflow for existing codebase
✅ **CORRECT:** Import workflow for existing, template for new

### Rule 3: Use Staged Workflow for All Features
❌ **WRONG:** Write all code, then test at the end
✅ **CORRECT:** Test each feature as you build it

### Rule 4: Learn from Every Session (NEW)
❌ **WRONG:** Complete feature and move on
✅ **CORRECT:** Index successful patterns to RAG

### Rule 5: Run Pre-Deployment Tests Before EVERY Deploy
❌ **WRONG:** Deploy without validation
✅ **CORRECT:** Run full pre-deployment test suite

### Rule 6: Never Skip Service Validation
❌ **WRONG:** "Database works, that's enough"
✅ **CORRECT:** ALL 14 services must pass validation

---

## 🎯 Workflow Selection Guide

### Starting a Brand New Project?
→ **[New Project from Template](./new-project-template.md)** → **[Pre-Development Setup](./pre-development-setup.md)**

### Have an Existing Codebase?
→ **[Import Existing Project](./import-existing-project.md)** → **[Pre-Development Setup](./pre-development-setup.md)**

### Resuming Work on a Project?
→ **[Continue Development](./continue-development.md)**

### Building a New Feature?
→ **[Staged Development](./staged-development.md)**

### Fixing a Bug?
→ **[Fix Bugs](./fix-bugs.md)**

### Ready to Deploy?
→ **[Pre-Deployment Testing](./pre-deployment-testing.md)** → **[Deployment](./deployment.md)**

### Need a Feature Template?
→ **[Prompt Templates](./prompt-templates.md)**

---

## 🧠 RAG Integration (NEW)

All workflows now integrate with the RAG knowledge base:

### What Gets Indexed
- All templates (29+ production templates)
- Your entire codebase (automatic chunking)
- Documentation (guides, services, patterns)
- Session learnings (successful patterns)
- Business logic (extracted automatically)

### How to Use RAG
```typescript
// Via MCP tool
{
  "tool": "query_knowledge_base",
  "question": "How is authentication implemented?",
  "limit": 5
}
```

### When to Query RAG
- Before starting any new feature
- When fixing bugs
- When adding to existing code
- When choosing implementation patterns
- When understanding codebase structure

**Current Index:** 1,049+ vectors (docs + templates + code)

---

## 📚 Related Documentation

- **[Services](../services/README.md)** - 14 core services integration guides
- **[Templates](../templates/)** - 29+ production templates
- **[AI Agent Guardrails](../AI-AGENT-GUARDRAILS.md)** - Development best practices
- **[Template Mapping Guide](../TEMPLATE-MAPPING-GUIDE.md)** - Feature → template lookup
- **[RAG Setup Guide](../SUPABASE-RAG-SETUP.md)** - Knowledge base configuration

---

## 🆕 What's New in AI Coder 2.0

### New Workflows
- ✅ Import Existing Project
- ✅ Continue Development
- ✅ Fix Bugs

### Enhanced Workflows
- ✅ RAG integration in all workflows
- ✅ Session learning after each feature
- ✅ Pattern extraction and indexing
- ✅ Semantic code search

### New Capabilities
- ✅ 1,049+ vectors indexed
- ✅ 15 MCP tools available
- ✅ Learn from every session
- ✅ Import any existing codebase

---

## 🤝 Contributing

To add a new workflow:

1. Create a markdown file in `docs/workflows/`
2. Follow the workflow template (see existing workflows)
3. Add entry to this README
4. Update knowledge base: `npx tsx src/scripts/updateKnowledgeBase.ts`

---

**Last Updated:** 2025-10-22
**Version:** 2.0.0 (RAG-Powered)
**Maintained By:** ai-coder contributors
