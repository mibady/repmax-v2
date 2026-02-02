# Import Existing Project Workflow

**Bring existing codebases into AI Coder with full RAG indexing and semantic understanding.**

---

## Purpose

Import and understand existing projects to enable context-aware development, bug fixing, and enhancement. This workflow indexes your entire codebase into the RAG knowledge base, extracts patterns, and generates a PRP for continued development.

---

## Prerequisites

- ✅ AI Coder installed and configured
- ✅ MCP server running (`npm run dev`)
- ✅ Upstash Vector configured (for RAG)
- ✅ OpenAI API key (for embeddings)
- ✅ Existing project accessible on filesystem

---

## Workflow Phases

### Phase 1: Project Analysis

**Objective:** Understand the project's tech stack and structure.

**Steps:**

1. **Analyze Project Structure**
   ```bash
   # Via MCP tool
   {
     "tool": "analyze_existing_project",
     "projectPath": "/path/to/your/project"
   }
   ```

2. **Review Analysis Results**
   - Project type (web, api, mobile)
   - Programming language
   - Framework (Next.js, React, Express, etc.)
   - Dependencies (package.json)
   - Tech stack detected:
     - Database (Supabase, PostgreSQL, MongoDB)
     - Auth (Clerk, NextAuth, Auth0)
     - Deployment (Vercel, Docker)
     - Testing (Vitest, Jest, Playwright)
     - Styling (Tailwind, Material-UI)

3. **Identify Missing Services**
   - Compare detected stack vs. AI Coder's 14 services
   - Note which services are already integrated
   - Plan which services to add

**Output:** Complete tech stack analysis

---

### Phase 2: Full Import with RAG Indexing

**Objective:** Import project and index all code into RAG knowledge base.

**Steps:**

1. **Execute Full Import**
   ```bash
   # Via MCP tool
   {
     "tool": "import_existing_project",
     "sourcePath": "/path/to/your/project",
     "projectName": "my-app",
     "indexToRAG": true,
     "generatePRP": true,
     "extractPatterns": true
   }
   ```

2. **Wait for Indexing**
   - System scans all code files
   - Chunks content intelligently (1000 chars, 200 overlap)
   - Generates embeddings (OpenAI text-embedding-3-small)
   - Upserts to Upstash Vector
   - Typical time: 30-60 seconds for 100 files

3. **Review Import Results**
   ```json
   {
     "success": true,
     "filesIndexed": 156,
     "chunksCreated": 847,
     "patternsExtracted": 23,
     "prpGenerated": true
   }
   ```

**Output:** Project fully indexed in RAG

---

### Phase 3: Pattern Extraction

**Objective:** Identify and index business logic patterns.

**Automatically Extracted Patterns:**

1. **API Patterns**
   - Express REST endpoints
   - Next.js Route Handlers
   - API middleware

2. **Database Patterns**
   - Prisma ORM usage
   - Supabase queries
   - MongoDB operations

3. **Authentication Patterns**
   - Clerk integration
   - NextAuth sessions
   - Auth middleware

4. **State Management**
   - Zustand stores
   - React Context
   - Redux patterns

5. **Service Integrations**
   - Stripe payments
   - Resend emails
   - Vercel AI SDK
   - OpenAI API

**Output:** Extracted patterns indexed to RAG

---

### Phase 4: PRP Generation

**Objective:** Create a Product Requirement Prompt from existing code.

**Generated PRP Includes:**

1. **User Story**
   ```
   As a developer continuing work on my-app,
   I want to enhance the web application built with Next.js
   so that I can add new features and fix bugs efficiently.
   ```

2. **Acceptance Criteria**
   - Existing functionality continues to work
   - Code follows existing patterns
   - All tests pass
   - No TypeScript errors
   - Project builds successfully

3. **Technical Requirements**
   - Language: TypeScript
   - Framework: Next.js
   - Database: Supabase
   - Auth: Clerk
   - Testing: Vitest
   - Styling: Tailwind CSS

**Output:** PRP ready for staged development

---

### Phase 5: Validation

**Objective:** Verify import was successful.

**Verification Steps:**

1. **Check Vector Count**
   ```bash
   # Query RAG info
   {
     "tool": "query_knowledge_base",
     "question": "How many files were indexed?"
   }
   ```

2. **Test Semantic Search**
   ```bash
   # Test queries
   {
     "tool": "query_knowledge_base",
     "question": "How is authentication implemented?"
   }

   {
     "tool": "query_knowledge_base",
     "question": "What database queries are used?"
   }

   {
     "tool": "query_knowledge_base",
     "question": "How are API routes structured?"
   }
   ```

3. **Review Project Context**
   ```bash
   {
     "tool": "get_project_context",
     "projectPath": "/path/to/my-app"
   }
   ```

**Success Criteria:**
- ✅ All files indexed successfully
- ✅ Semantic search returns relevant results
- ✅ Patterns extracted and indexed
- ✅ PRP generated
- ✅ Project context loaded

**Output:** Verified working import

---

## Quality Gates

### Pre-Import Checks
- [ ] Project path exists and is accessible
- [ ] Upstash Vector configured
- [ ] OpenAI API key set
- [ ] Sufficient disk space (for copied projects)

### Post-Import Checks
- [ ] Files indexed count matches expected
- [ ] Chunks created > 0
- [ ] Semantic search works
- [ ] Patterns extracted
- [ ] PRP generated

---

## Output

After completing this workflow, you have:

1. **Fully Indexed Project**
   - All code searchable via semantic search
   - Natural language queries work
   - AI understands codebase structure

2. **Extracted Patterns**
   - Business logic patterns identified
   - Service integrations cataloged
   - Architectural patterns documented

3. **Generated PRP**
   - Ready for staged development
   - Context-aware requirements
   - Tech stack documented

4. **Ready for Development**
   - Can query codebase semantically
   - Can continue development
   - Can fix bugs with context

---

## Example: Importing a Next.js App

```typescript
// Step 1: Analyze first
const analysis = await mcp.call({
  tool: "analyze_existing_project",
  projectPath: "/Users/dev/my-nextjs-app"
});

console.log(analysis);
// {
//   name: "my-nextjs-app",
//   type: "web",
//   language: "typescript",
//   framework: "Next.js",
//   techStack: {
//     framework: "Next.js",
//     database: ["Supabase"],
//     auth: ["Clerk"],
//     testing: ["Vitest"],
//     styling: ["Tailwind CSS"]
//   },
//   fileCount: 156,
//   suggestedNextSteps: [...]
// }

// Step 2: Full import with RAG
const result = await mcp.call({
  tool: "import_existing_project",
  sourcePath: "/Users/dev/my-nextjs-app",
  projectName: "my-nextjs-app",
  indexToRAG: true,
  generatePRP: true,
  extractPatterns: true
});

console.log(result);
// {
//   success: true,
//   filesIndexed: 156,
//   chunksCreated: 847,
//   patternsExtracted: 23,
//   prpTitle: "Continue Development: my-nextjs-app"
// }

// Step 3: Query your codebase
const authInfo = await mcp.call({
  tool: "query_knowledge_base",
  question: "How is user authentication implemented?"
});

// Returns: Relevant code snippets from Clerk integration
```

---

## Troubleshooting

### Issue: "No files found to index"

**Cause:** Wrong project path or excluded by patterns

**Solution:**
1. Verify path is correct
2. Check project contains code files (.ts, .tsx, .js, .jsx)
3. Ensure not all files are in excluded directories (node_modules, dist)

---

### Issue: "Embedding generation failed"

**Cause:** OpenAI API key missing or invalid

**Solution:**
1. Check `.env` file for `OPENAI_API_KEY`
2. Verify API key is valid
3. Check OpenAI account has credits

---

### Issue: "Vector upsert failed"

**Cause:** Upstash Vector not configured

**Solution:**
1. Check `.env` for `UPSTASH_VECTOR_REST_URL` and `UPSTASH_VECTOR_REST_TOKEN`
2. Verify Upstash Vector index exists
3. Confirm dimension is 384
4. Check Upstash account status

---

### Issue: "Import successful but search returns nothing"

**Cause:** Indexing pending or dimension mismatch

**Solution:**
1. Wait 10-30 seconds for indexing to complete
2. Check vector info: pending count should be 0
3. Verify embedding dimension is 384
4. Re-run import if needed

---

## Next Steps

After successfully importing:

1. **→ [Continue Development Workflow](./continue-development.md)**
   - Resume work on features
   - Query RAG for context

2. **→ [Fix Bugs Workflow](./fix-bugs.md)**
   - Debug issues with context
   - Semantic bug search

3. **→ [Staged Development Workflow](./staged-development.md)**
   - Add new features
   - Follow quality gates

4. **→ [Pre-Development Setup](./pre-development-setup.md)**
   - Configure any missing services
   - Validate integrations

---

## Related Documentation

- **[Continue Development](./continue-development.md)** - Resume existing work
- **[Fix Bugs](./fix-bugs.md)** - Debug with RAG
- **[RAG Setup Guide](../SUPABASE-RAG-SETUP.md)** - RAG configuration
- **[Template Mapping Guide](../TEMPLATE-MAPPING-GUIDE.md)** - Service integration patterns

---

## Tips & Best Practices

### 1. Always Analyze First
Run `analyze_existing_project` before full import to understand structure.

### 2. Index Incrementally for Large Projects
For projects with 1000+ files, consider indexing in batches.

### 3. Query Immediately After Import
Verify semantic search works right after indexing completes.

### 4. Review Extracted Patterns
Check extracted patterns to understand what AI detected.

### 5. Use Generated PRP
The auto-generated PRP is a great starting point for planning.

### 6. Keep RAG Updated
After major changes, re-index modified files:
```typescript
{
  "tool": "learn_from_session",
  "sessionId": "current-session",
  "projectPath": "/path/to/project"
}
```

---

**Last Updated:** 2025-10-22
**Version:** 2.0.0
