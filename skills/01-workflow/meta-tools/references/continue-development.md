# Continue Development Workflow

**Resume work on existing projects with full RAG context and semantic code understanding.**

---

## Purpose

Continue development on existing features and codebases using RAG-powered context to maintain consistency, follow existing patterns, and make informed decisions.

---

## When to Use

- Resuming work after a break
- Enhancing existing features
- Adding to established codebase
- Working with unfamiliar code
- Maintaining consistency with existing patterns

---

## Prerequisites

- ✅ Project imported via [Import Existing Project workflow](./import-existing-project.md)
- ✅ RAG knowledge base indexed
- ✅ MCP server running

---

## Workflow Phases

### Phase 1: Load Context

**Query RAG for understanding:**

```typescript
// Understand existing architecture
{
  "tool": "query_knowledge_base",
  "question": "What is the overall architecture of this project?"
}

// Find relevant code
{
  "tool": "query_knowledge_base",
  "question": "How is [feature X] currently implemented?"
}

// Understand patterns
{
  "tool": "query_knowledge_base",
  "question": "What patterns are used for [database/auth/API]?"
}
```

---

### Phase 2: Plan Changes

**Create PRP aligned with existing code:**

1. Reference existing patterns from RAG
2. Follow established conventions
3. Use same libraries/services
4. Match coding style

---

### Phase 3: Implement

**Follow [Staged Development workflow](./staged-development.md):**

1. Query RAG before coding each step
2. Write code matching existing patterns
3. Add tests following existing test patterns
4. Review with CodeRabbit
5. Run quality gates
6. Commit atomically

---

### Phase 4: Learn

**Index new patterns:**

```typescript
{
  "tool": "learn_from_session",
  "sessionId": "current-session-id",
  "projectPath": "/path/to/project",
  "indexNewFiles": true,
  "extractPatterns": true
}
```

---

## Best Practices

### 1. Always Query RAG First
Before writing ANY code, search for existing implementations.

### 2. Follow Existing Patterns
Match the style, structure, and conventions already in use.

### 3. Update RAG After Changes
Run `learn_from_session` to index your new code.

### 4. Query Broadly, Then Specifically
- First: "How is authentication done?"
- Then: "How is login implemented?"
- Finally: "Show me the login route handler"

---

## Example Session

```typescript
// 1. Understand current auth
const auth = await query("How is authentication currently implemented?");
// Returns: Clerk integration details, middleware, session handling

// 2. Find similar code
const similar = await query("Show me existing API route handlers");
// Returns: Route patterns, error handling, middleware usage

// 3. Implement new feature following patterns
// ... write code using discovered patterns ...

// 4. Learn from session
await learn_from_session("session-123", "/path/to/project");
// Indexes new patterns for future use
```

---

## Next Steps

- **→ [Staged Development](./staged-development.md)** - Full development workflow
- **→ [Fix Bugs](./fix-bugs.md)** - Debug with RAG
- **→ [Pre-Deployment Testing](./pre-deployment-testing.md)** - Validate before deploy

---

**Last Updated:** 2025-10-22
