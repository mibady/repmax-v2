# AI Agent Development Guardrails

**Version:** 2.0.0
**Last Updated:** 2025-10-22
**Status:** Mandatory for All AI Agents

---

## 🎯 Purpose

This document establishes **mandatory guardrails** for AI agents working on AI Coder projects. These guardrails prevent technical debt, ensure architecture alignment, and leverage our living, breathing production code template marketplace.

**Key Principle:** We have production-ready templates and code snippets. USE THEM. Don't reinvent.

---

## 🔗 Related Documentation

**IMPORTANT:** This document works in conjunction with the **AI Coder Framework**:

- **[AI-CODER-FRAMEWORK.md](./AI-CODER-FRAMEWORK.md)** - Mandatory coding standards and decision framework
  - The 5 Core Agent Patterns (01-05)
  - Pattern Selection Decision Tree
  - Multi-Agent Orchestration
  - The 3-Layer Architecture (Face/Head/DNA)
  - Agent Handoff Patterns
  - PRP Process Integration

**Read the Framework document FIRST** to understand the overall architecture and pattern selection process, then use this document for implementation-specific guardrails.

---

## 📋 Mandatory Pre-Code Checklist

Before writing ANY code, AI agents MUST complete this checklist:

### ✅ Step 0: Project Structure Enforcement (CRITICAL - FIRST CHECK)

**Question:** Does this project have the mandatory AI Coder structure?

**Reference:** [PROJECT-STRUCTURE-GUARDRAILS.md](./guardrails/PROJECT-STRUCTURE-GUARDRAILS.md)

**WHY THIS IS FIRST:** Prevents sloppy projects, ensures consistency, enables CLI tools, maintains documentation standards. Every project must follow the same structure whether imported or created.

**Actions:**
1. Check if working on a project (not just framework development)
2. Verify the 6 mandatory structure elements:
   ```bash
   # Quick validation
   ./.ai-coder/cli.sh validate

   # OR manual check:
   ls -la .ai-coder/             # Must exist with subdirs
   test -x .ai-coder/cli.sh      # Must be executable
   ls docs/README.md docs/ARCHITECTURE.md docs/DEPLOYMENT.md
   test -f .env.example
   test -f .gitignore
   test -f .ai-coder/config.json
   ```
3. If ANY check fails:
   ```bash
   # Auto-fix structure
   ./.ai-coder/cli.sh init

   # OR for imported projects
   import_existing_project({ autoFix: true })
   ```
4. Only proceed to coding when structure is valid ✅

**Required Structure:**
```
project-name/
├── .ai-coder/              # REQUIRED - AI Coder metadata
│   ├── prps/               # Problem-Requirements-Plans
│   ├── sessions/           # Session history
│   ├── scripts/            # Validation scripts
│   ├── config.json         # Project configuration
│   └── cli.sh              # Project CLI (EXECUTABLE)
├── docs/                   # REQUIRED - Documentation
│   ├── README.md           # Project overview
│   ├── ARCHITECTURE.md     # System architecture
│   └── DEPLOYMENT.md       # Deployment guide
├── .env.example            # REQUIRED - Env template
├── .gitignore              # REQUIRED - Git rules
└── README.md               # REQUIRED - Root readme
```

**Time Required:** 10 seconds (validation) or 2 minutes (auto-fix)

**Mandatory:** YES - Check BEFORE any coding begins

**See Full Rules:** `/docs/guardrails/PROJECT-STRUCTURE-GUARDRAILS.md`

---

### ✅ Step 1: External Stack Detection (CRITICAL)

**Question:** Are ALL proposed technologies in the AI Coder ecosystem?

**Reference:** [EXTERNAL-STACK-DETECTION.md](./guardrails/EXTERNAL-STACK-DETECTION.md)

**WHY THIS IS FIRST:** Prevents 6+ weeks wasted building on wrong foundation. Catches external frameworks (like Lobe Chat, Leon AI) before they derail the project.

**Actions:**
1. List ALL technologies/frameworks/libraries in your plan
2. For EACH technology, run the 60-second verification:
   ```bash
   # Quick check commands
   grep -i "tech-name" /docs/TEMPLATE-FRAMEWORK-MAPPING.md
   grep -i "tech-name" /docs/services/README.md
   ls /docs/code-snippets/ | grep -i "tech-name"
   ```
3. Verify each technology:
   - [ ] Exists in TEMPLATE-FRAMEWORK-MAPPING.md (10 essential templates)
   - [ ] OR exists in services/README.md (14 core services)
   - [ ] Has code snippets in /docs/code-snippets/
   - [ ] Listed in approved SDK table (line 171 below)
4. If ANY technology fails ALL checks → 🚨 EXTERNAL STACK - Find AI Coder alternative
5. Re-verify alternatives
6. Only proceed when ALL technologies verified ✅

**Example:**
```bash
# Bad: External stack not detected
❌ "I'll use Lobe Chat (30.9k ⭐) for the interface"
→ No verification run
→ 6 weeks wasted on wrong foundation

# Good: External stack caught immediately
❌ "I'll use Lobe Chat for the interface"
→ Check: grep -i "lobe" TEMPLATE-FRAMEWORK-MAPPING.md
→ Result: Not found ❌
→ Check: grep -i "lobe" services/README.md
→ Result: Not found ❌
→ 🚨 EXTERNAL STACK DETECTED
→ Alternative: template-nextjs-ai-chatbot (verified ✅)
→ Proceed with framework-aligned solution
```

**Red Flags:**
- 🚨 "High GitHub stars" ≠ AI Coder compatible
- 🚨 "Popular framework" ≠ in our template library
- 🚨 "Best tool for X" ≠ framework-aligned
- 🚨 "Modern/TypeScript" ≠ we support it

**Time Required:** 60 seconds per technology (saves 6+ weeks)

**Mandatory:** YES - Run BEFORE Step 1

**See Full Guide:** `/docs/guardrails/EXTERNAL-STACK-DETECTION.md`

---

### ✅ Step 2: Framework Pattern Selection

**Question:** Which of the 5 core agent patterns does this task fall under?

**Reference:** [AI-CODER-FRAMEWORK.md - Pattern Selection Decision Tree](./AI-CODER-FRAMEWORK.md#2-pattern-selection-decision-tree)

**Actions:**
1. Read the Pattern Selection Decision Tree
2. Determine if this is Pattern 01 (Ad Hoc), 02 (Reusable Prompt), 03 (Sub-Agent), 04 (MCP Wrapper), or 05 (Full Application)
3. Verify pattern evolution triggers (e.g., 3+ repetitions → Pattern 02)
4. If Pattern 03-05, determine if BaseAgent or Orchestrator is needed
5. If multi-agent (Pattern 03-05), define agent handoff strategy

**Example:**
```bash
# Bad: Jump to implementation without pattern selection
❌ "I'll implement this feature with Supabase"

# Good: Select pattern first
✅ Read AI-CODER-FRAMEWORK.md
✅ Determine: This is Pattern 03 (Sub-Agent) - need RAGAgent + MCPAgent
✅ Architecture: Orchestrator pattern with strict data contracts
✅ Now proceed to template selection...
```

---

### ✅ Step 3: Architecture Alignment Check

**Question:** Does an architecture document exist for this feature/service?

**Files to check:**
- `docs/services/README.md` - 14 Core Services Reference
- `docs/architecture/*.md` - Architecture patterns
- `docs/services/INTEGRATION-MATRIX.md` - Service integration patterns

**Actions:**
1. Read relevant architecture section
2. Identify which of the 14 core services are involved
3. Verify SDK requirements (SDK-first is MANDATORY)
4. Note any integration patterns

**Example:**
```bash
# Bad: Jump straight to coding
❌ "I'll implement RAG with Supabase pgvector"

# Good: Check architecture first
✅ Read docs/services/README.md
✅ Find: "Service #6: Upstash Vector - Purpose: Semantic search and RAG"
✅ Note: "SDK: @upstash/vector + openai"
✅ Conclusion: Use Upstash Vector, not Supabase pgvector
```

---

### ✅ Step 4: Template Pattern Check

**Question:** Do we have a template that implements this pattern?

**Files to check:**
- `docs/templates/ai-chatbot-templates.md` - AI/chatbot patterns
- `docs/templates/storage-media-automation-templates.md` - Vector DB, storage patterns
- `docs/templates/saas-templates.md` - SaaS/multi-tenant patterns
- `docs/templates/*.md` - All other templates

**Actions:**
1. Search for relevant template
2. Read ENTIRE implementation example
3. Note SDK usage, patterns, and approach
4. Copy pattern structure, adapt to use case

**Example:**
```typescript
// Bad: Assume Upstash auto-embeds
❌ await vectorIndex.query({ data: query });

// Good: Check template (storage-media-automation-templates.md:298-301)
✅ Read template code
✅ See: const queryEmbedding = await generateEmbedding(query);
✅ See: await vectorIndex.query({ vector: queryEmbedding });
✅ Copy this pattern
```

---

### ✅ Step 5: Code Snippet Verification

**Question:** Do we have a production-ready code snippet for this?

**Files to check:**
- `docs/code-snippets/` directory structure:
  ```
  code-snippets/
  ├── ag-ui/           # AG-UI Protocol implementations
  ├── auth/            # Clerk authentication patterns
  ├── email/           # Resend email patterns
  ├── monitoring/      # Sentry, Arcjet patterns
  ├── payments/        # Stripe integration
  ├── state/           # Zustand state management
  ├── supabase/        # Supabase database patterns
  ├── upstash/         # Redis, Vector, QStash patterns
  └── vercel-ai/       # Vercel AI SDK patterns
  ```

**Actions:**
1. Navigate to relevant snippet directory
2. Find matching pattern
3. Copy snippet EXACTLY (it's production-tested)
4. Adapt variable names only, not structure

**Example:**
```typescript
// Bad: Write custom email logic
❌ const response = await fetch('https://api.resend.com/...');

// Good: Use code snippet (code-snippets/email/01-resend-setup.md)
✅ Copy snippet:
const { data, error } = await resend.emails.send({
  from: 'noreply@yourdomain.com',
  to: user.email,
  react: WelcomeEmail({ name: user.name }),
});
```

---

### ✅ Step 5: SDK-First Verification

**Question:** Am I using the official SDK for each service?

**Reference:** `docs/services/README.md` - "SDK-First Development Strategy" section

**Mandatory SDK List:**
| Service | Required SDK | ❌ Never Use |
|---------|--------------|-------------|
| Upstash Vector | `@upstash/vector` | Manual HTTP/fetch |
| OpenAI | `openai` | Custom API calls |
| Supabase | `@supabase/supabase-js`, `@supabase/ssr` | Raw PostgreSQL client |
| Stripe | `stripe` | Payment API calls |
| Resend | `resend` | Email API calls |
| Upstash Redis | `@upstash/redis` | node-redis |
| Sentry | `@sentry/nextjs` | Manual error tracking |
| Arcjet | `@arcjet/next` | Custom rate limiting |

**Actions:**
1. For each service involved, verify SDK is imported
2. Check package.json includes the SDK
3. If SDK missing, install it first
4. NEVER write custom implementations

**Example:**
```typescript
// Bad: Manual implementation
❌ const response = await fetch('https://api.upstash.io/vector', {
     method: 'POST',
     body: JSON.stringify({ ... })
   });

// Good: Use SDK
✅ import { Index } from '@upstash/vector';
✅ const vectorIndex = new Index({ url, token });
✅ await vectorIndex.upsert({ id, vector, metadata });
```

---

## 🚫 Anti-Patterns to Avoid

### 1. **The "I'll Just Code It" Trap**

**Symptom:** Jumping straight to implementation without research.

**Why it fails:**
- Misses existing patterns
- Creates inconsistent code
- Duplicates solved problems
- Ignores architecture decisions

**Fix:**
```
BEFORE: User asks for feature → AI codes immediately
AFTER:  User asks for feature → AI checks docs → AI finds template → AI adapts pattern
```

---

### 2. **The "Over-Engineering" Trap**

**Symptom:** Adding complexity not present in templates.

**Example from this session:**
```typescript
// AI's initial instinct: Use BOTH databases
❌ Upstash Vector for RAG
❌ Supabase pgvector as "backup"
❌ Sync between them
❌ Complex dual-storage logic

// What templates show: Use ONE database
✅ Upstash Vector for RAG (Service #6)
✅ Supabase for relational data only
✅ Simple, focused architecture
```

**Fix:** If templates don't do it, you probably don't need it.

---

### 3. **The "Comments Are Truth" Trap**

**Symptom:** Trusting code comments over actual implementation.

**Example from this session:**
```typescript
// Comment said:
"Upstash automatically generates embeddings for the query"

// Reality (from templates):
const embedding = await generateEmbedding(query); // Manual!
```

**Fix:** Templates > Comments. Always cross-reference with working code.

---

### 4. **The "Assumption" Trap**

**Symptom:** Assuming how a service works without verification.

**Example from this session:**
```
❌ Assumed: Upstash Vector has auto-embedding
✅ Reality: Manual OpenAI embeddings (proven by templates)
```

**Fix:** Search templates for "how does X actually work in production?"

---

### 5. **The "Custom Implementation" Trap**

**Symptom:** Writing custom code when SDK exists.

**Why it fails:**
- No type safety
- Missing error handling
- Breaks on API changes
- Harder to test

**Fix:** `docs/services/README.md` lists all required SDKs. Use them.

---

## 🛡️ Guardrail Implementation

### **Guardrail 1: Template-First Mandate**

**Rule:** Before writing any service integration code, find the template example.

**Implementation:**
```typescript
// Add to agent system prompt:
"Before implementing any service integration:
1. Search docs/templates/ for matching pattern
2. If found, copy template structure exactly
3. If not found, search code-snippets/
4. If still not found, ask user before creating custom implementation"
```

**Verification:**
- Agent must cite template file path
- Agent must show which lines were referenced
- Agent must explain any deviations from template

---

### **Guardrail 2: Architecture Document Authority**

**Rule:** `docs/services/README.md` is the source of truth for service selection.

**Implementation:**
```typescript
// When user requests feature involving services:
1. Check README.md for which of 14 services apply
2. Verify service is appropriate for use case
3. Note any integration patterns from INTEGRATION-MATRIX.md
4. Follow documented architecture
```

**Verification:**
- Agent must reference architecture doc section
- Agent must explain service selection rationale
- Agent must note any conflicts with existing code

---

### **Guardrail 3: SDK-First Enforcement**

**Rule:** All 14 core services MUST use their official SDKs (mandatory, not optional).

**Implementation:**
```typescript
// Before any service integration:
1. Check docs/services/README.md SDK list
2. Verify SDK is in package.json
3. If missing: npm install [sdk-package]
4. Import SDK at top of file
5. Use SDK methods, never manual HTTP
```

**Verification:**
- No `fetch()` calls to service APIs
- No custom implementations
- All imports match documented SDKs

---

### **Guardrail 4: Code Snippet Reuse**

**Rule:** If a production code snippet exists, use it verbatim.

**Implementation:**
```typescript
// When implementing feature:
1. Search docs/code-snippets/[service]/
2. Find matching pattern
3. Copy code exactly
4. Adapt only: variable names, env vars, metadata
5. Keep: structure, error handling, types, patterns
```

**Verification:**
- Snippet file path cited
- Code structure matches snippet
- Only surface-level adaptations made

---

### **Guardrail 5: Simplicity Bias**

**Rule:** If templates don't show a pattern, question if it's needed.

**Implementation:**
```typescript
// When considering adding complexity:
1. Search all templates for this pattern
2. If 0 templates use it → probably don't need it
3. If 1-2 templates use it → understand why first
4. If 3+ templates use it → established pattern, use it
```

**Verification:**
- Cite number of templates using pattern
- Explain why deviation is necessary
- Get user confirmation before proceeding

---

## 📚 Knowledge Base: Production Code Marketplace

### **What We Have**

**Location:** `docs/templates/*.md` + `docs/code-snippets/`

**Content:**
- ✅ 29 production-ready templates
- ✅ 100+ code snippets
- ✅ 14 service integrations documented
- ✅ Real-world patterns tested in production
- ✅ Multi-tenant SaaS examples
- ✅ AI chatbot implementations
- ✅ Payment flows
- ✅ Authentication patterns
- ✅ RAG systems
- ✅ Background jobs

**All code is:**
- ✅ Production-tested
- ✅ SDK-first
- ✅ Type-safe
- ✅ Error-handled
- ✅ Best practices

---

### **How to Use It**

#### **Scenario 1: User Wants RAG System**

**❌ Bad Approach:**
```
User: "Add RAG to my app"
AI: "I'll implement Supabase pgvector with custom embeddings"
→ Result: Over-engineered, not aligned with templates
```

**✅ Good Approach:**
```
User: "Add RAG to my app"
AI: "Let me check our templates..."
AI reads: docs/templates/storage-media-automation-templates.md (lines 182-353)
AI finds: Upstash Vector + OpenAI pattern
AI reads: docs/services/README.md (Service #6)
AI confirms: Upstash Vector is designated RAG service
AI reads: code-snippets/upstash/01-hybrid-search-complete.md
AI copies: Production pattern exactly
→ Result: Template-aligned, production-ready
```

---

#### **Scenario 2: User Wants Email Notifications**

**❌ Bad Approach:**
```
User: "Send welcome emails"
AI: Writes custom fetch() to email API
→ Result: No error handling, no types, fragile
```

**✅ Good Approach:**
```
User: "Send welcome emails"
AI checks: docs/services/README.md → Service #10: Resend
AI reads: docs/code-snippets/email/01-resend-setup.md
AI copies:
  const { data, error } = await resend.emails.send({
    from: 'welcome@yourdomain.com',
    to: user.email,
    react: WelcomeEmail({ name: user.name }),
  });
  if (error) { /* handle */ }
→ Result: SDK-based, error-handled, React Email support
```

---

#### **Scenario 3: User Wants Multi-Tenant SaaS**

**❌ Bad Approach:**
```
User: "Make this multi-tenant"
AI: Writes custom organization logic
→ Result: Reinvents Clerk Organizations
```

**✅ Good Approach:**
```
User: "Make this multi-tenant"
AI checks: docs/templates/saas-templates.md
AI finds: Clerk Organizations pattern
AI reads: docs/code-snippets/auth/01-clerk-setup.md
AI sees: Multi-tenancy built into Clerk
AI reads: docs/services/INTEGRATION-MATRIX.md (lines 34-165)
AI copies: SaaS Application Stack pattern
→ Result: Production multi-tenancy with Clerk
```

---

## 🔍 Template Search Strategy

### **Step-by-Step Template Lookup**

1. **Identify Feature Type**
   - AI/Chatbot → `ai-chatbot-templates.md`
   - Vector/Storage → `storage-media-automation-templates.md`
   - SaaS/Multi-tenant → `saas-templates.md`
   - Authentication → Check `code-snippets/auth/`
   - Payments → Check `code-snippets/payments/`

2. **Read Entire Template Section**
   - Don't just skim
   - Read setup, implementation, examples
   - Note environment variables
   - Understand integration points

3. **Find Code Snippet**
   - Match service from template to `code-snippets/[service]/`
   - Read complete snippet
   - Copy entire pattern

4. **Cross-Reference Architecture**
   - Verify against `docs/services/README.md`
   - Check service is in the 14 core services
   - Confirm SDK usage

5. **Verify Integration Pattern**
   - Check `INTEGRATION-MATRIX.md` for multi-service flows
   - See how services work together
   - Follow established patterns

---

## 📊 Template Coverage Matrix

| Feature | Template File | Code Snippet | Architecture Doc |
|---------|--------------|--------------|------------------|
| **RAG/Vector Search** | storage-media-automation-templates.md | upstash/01-hybrid-search-complete.md | README.md (Service #6) |
| **AI Chat** | ai-chatbot-templates.md | vercel-ai/01-multi-provider-setup.md | README.md (Service #2) |
| **Authentication** | saas-templates.md | auth/01-clerk-setup.md | README.md (Service #4) |
| **Payments** | saas-templates.md | payments/01-stripe-setup.md | README.md (Service #7) |
| **Email** | INTEGRATION-MATRIX.md | email/01-resend-setup.md | README.md (Service #10) |
| **Real-time** | ag-ui templates | ag-ui/01-client-setup.md | README.md (Service #1) |
| **State Management** | Various | state/01-zustand-setup.md | README.md (Service #11) |
| **Security** | All templates | monitoring/01-arcjet-security.md | README.md (Service #8) |
| **Error Tracking** | INTEGRATION-MATRIX.md | monitoring/02-sentry-error-tracking.md | README.md (Service #9) |
| **Caching** | storage-media-automation-templates.md | upstash/02-redis-caching.md | README.md (Service #5) |

**Coverage:** 100% of 14 core services have templates + code snippets

---

## 🎯 Decision Tree for AI Agents

```
User requests feature
    ↓
Does architecture doc mention this? (docs/services/README.md)
    ├─ Yes → Which service? (#1-14)
    │         ↓
    │    Does template exist for this service?
    │         ├─ Yes → Read template
    │         │         ↓
    │         │    Copy pattern from template
    │         │         ↓
    │         │    Find code snippet (code-snippets/[service]/)
    │         │         ↓
    │         │    Verify SDK usage
    │         │         ↓
    │         │    Implement using template pattern
    │         │
    │         └─ No → Check code-snippets/
    │                   ├─ Found → Use snippet
    │                   └─ Not found → ASK USER before custom implementation
    │
    └─ No → Is this a NEW feature?
              ├─ Yes → Ask user which service to use
              └─ No → Check if it's covered in templates under different name
```

---

## 💬 Communication Standards

### **When Citing Templates**

**Bad:**
```
❌ "I'll use the template pattern"
```

**Good:**
```
✅ "Using pattern from docs/templates/storage-media-automation-templates.md,
   lines 298-310, which shows Upstash Vector semantic search with manual
   OpenAI embeddings (text-embedding-3-small model)"
```

---

### **When Deviating from Templates**

**Bad:**
```
❌ "I'm modifying this to use Supabase instead"
```

**Good:**
```
✅ "Template uses Upstash Vector (Service #6), but I notice you've set up
   Supabase pgvector. Should I:
   A) Follow template (Upstash Vector)
   B) Use your Supabase setup (requires justification)

   Note: Templates show 0/29 using Supabase pgvector for RAG."
```

---

### **When Template Doesn't Exist**

**Bad:**
```
❌ "No template found, implementing custom solution"
```

**Good:**
```
✅ "I couldn't find a template for [feature] in:
   - docs/templates/*.md
   - docs/code-snippets/

   Before writing custom code, can you confirm:
   1. Is this a new feature not covered by templates?
   2. Should I use one of the 14 core services for this?
   3. Do you have an example project I can reference?"
```

---

## 📝 Checklist Template for Agents

Copy this checklist for every implementation:

```markdown
## Pre-Implementation Checklist

### Architecture Alignment
- [ ] Read relevant section in docs/services/README.md
- [ ] Identified which of 14 services are involved
- [ ] Verified SDK requirements
- [ ] Checked INTEGRATION-MATRIX.md for patterns

### Template Verification
- [ ] Searched docs/templates/ for matching pattern
- [ ] Read entire template section (not just skimmed)
- [ ] Identified template file: [FILE PATH]
- [ ] Identified relevant lines: [LINE NUMBERS]

### Code Snippet Check
- [ ] Searched docs/code-snippets/[service]/
- [ ] Found matching snippet: [FILE PATH]
- [ ] Verified snippet is production-ready
- [ ] Planned to copy snippet verbatim

### SDK Verification
- [ ] All services use official SDKs (no custom implementations)
- [ ] Verified SDKs in package.json
- [ ] No fetch() calls to service APIs
- [ ] Imports match architecture doc

### Simplicity Check
- [ ] Pattern exists in templates (cite count: X templates)
- [ ] Not over-engineering (compared to templates)
- [ ] Following established patterns
- [ ] Questioned any complexity not in templates

### User Confirmation (if needed)
- [ ] Cited template/snippet file paths
- [ ] Explained any deviations
- [ ] Asked for confirmation before proceeding
```

---

## 🚀 Implementation Example: The Right Way

**User Request:** "Add semantic search to my documentation"

**Agent Response:**

```markdown
I'll implement semantic search using our production template pattern.

## Research Summary

### 1. Architecture Check (docs/services/README.md)
- Service #6: Upstash Vector - "Semantic search and RAG"
- Service #2: Vercel AI SDK - "Multi-provider LLM integration" (for embeddings)
- Required SDKs: @upstash/vector, openai

### 2. Template Found
- File: docs/templates/storage-media-automation-templates.md
- Lines: 182-353 (Upstash Vector + Next.js)
- Pattern: Manual OpenAI embeddings → Upstash Vector storage

### 3. Code Snippet Located
- File: docs/code-snippets/upstash/01-hybrid-search-complete.md
- Shows: Complete RAG implementation with error handling

### 4. Implementation Plan
Following template pattern exactly:

1. Install SDKs:
   ```bash
   npm install @upstash/vector openai
   ```

2. Add env vars (from template):
   ```bash
   UPSTASH_VECTOR_REST_URL=
   UPSTASH_VECTOR_REST_TOKEN=
   OPENAI_API_KEY=
   ```

3. Copy embedding helper (lines 244-259 from template):
   ```typescript
   async function generateEmbedding(text: string) {
     const response = await openai.embeddings.create({
       model: 'text-embedding-3-small',
       input: text,
     });
     return response.data[0].embedding;
   }
   ```

4. Copy search pattern (lines 290-310 from template):
   ```typescript
   const queryEmbedding = await generateEmbedding(query);
   const results = await vectorIndex.query({
     vector: queryEmbedding,
     topK: 5,
     includeMetadata: true,
   });
   ```

Ready to implement. Proceed?
```

---

## 🎓 Training Examples

### **Example 1: What Good Looks Like**

**Scenario:** User wants email notifications

**Agent Process:**
1. ✅ Checks docs/services/README.md → Service #10: Resend
2. ✅ Reads docs/code-snippets/email/01-resend-setup.md
3. ✅ Copies pattern verbatim
4. ✅ Notes SDK: `resend`
5. ✅ Implements with error tuple pattern matching template

**Result:** Production-ready email in 5 minutes

---

### **Example 2: What Bad Looks Like**

**Scenario:** User wants email notifications

**Agent Process:**
1. ❌ Immediately codes custom solution
2. ❌ Uses fetch() to email API
3. ❌ No error handling
4. ❌ Missing types
5. ❌ Doesn't match any template

**Result:** Fragile code, user has to fix it

---

### **Example 3: Course Correction**

**Scenario:** Agent starts going off-template

**User intervention:**
```
User: "That doesn't match our templates"
Agent: [STOPS]
Agent: "You're right. Let me check docs/templates/..."
Agent: [Finds correct template]
Agent: "I should use [pattern from template]. Restarting..."
```

**Result:** Agent learns, implementation aligns

---

## 📖 Further Reading

### **For AI Agents:**
- Read: `docs/services/README.md` (complete reference)
- Read: `docs/templates/*.md` (all templates)
- Read: `docs/code-snippets/` (production patterns)
- Reference: This document before every implementation

### **For Users:**
- If agent deviates from templates → point to this doc
- If agent over-engineers → cite "Simplicity Bias" section
- If agent writes custom code → cite "SDK-First Enforcement"

---

## ✅ Success Criteria

An AI agent is following guardrails if:

1. ✅ Cites template file paths before coding
2. ✅ Uses SDKs for all 14 core services
3. ✅ Copies code snippet patterns verbatim
4. ✅ Asks before deviating from templates
5. ✅ Searches docs BEFORE proposing solutions
6. ✅ Explains architecture alignment
7. ✅ Avoids over-engineering
8. ✅ Verifies against production patterns

---

## 🔄 Continuous Improvement

### **When Templates Evolve:**
1. Update this document
2. Update code snippets
3. Update architecture doc
4. Announce changes to agents

### **When New Patterns Emerge:**
1. Document in templates
2. Create code snippet
3. Add to architecture doc
4. Update this guardrail doc

### **When Mistakes Happen:**
1. Document root cause
2. Add to anti-patterns section
3. Create new guardrail if needed
4. Update agent training

---

## 🎯 Summary: Golden Rules

1. **Templates First** - Search before coding
2. **Architecture Authority** - README.md is law
3. **SDK Mandatory** - No custom implementations
4. **Copy, Don't Create** - Code snippets are production-tested
5. **Simplicity Wins** - If templates don't do it, question it
6. **Cite Sources** - Always reference template/snippet paths
7. **Ask When Unsure** - User knows their architecture best

---

**Remember:** We're not building from scratch. We're adapting proven, production-ready patterns from our living template marketplace. Use them.

---

**Last Updated:** 2025-01-21
**Next Review:** When templates updated or new patterns added
**Maintained By:** AI Coder Team
