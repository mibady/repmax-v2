# Fix Bugs Workflow

**Debug and fix bugs using RAG-powered semantic search and contextual understanding.**

---

## Purpose

Identify and fix bugs by leveraging semantic search across your entire codebase, finding related code, and understanding dependencies before making changes.

---

## When to Use

- Debugging unexpected behavior
- Fixing reported bugs
- Investigating errors
- Understanding error stack traces
- Finding root causes

---

## Prerequisites

- ✅ Project imported and indexed in RAG
- ✅ Bug description or error message
- ✅ MCP server running

---

## Workflow Phases

### Phase 1: Understand the Bug

**Describe the bug in natural language:**

```typescript
{
  "tool": "query_knowledge_base",
  "question": "Where is [error message] coming from?"
}

{
  "tool": "query_knowledge_base",
  "question": "What code handles [feature that's broken]?"
}

{
  "tool": "query_knowledge_base",
  "question": "Show me all code related to [component/function]"
}
```

---

### Phase 2: Find Related Code

**Search semantically, not just syntactically:**

```typescript
// Instead of grepping for exact error text, ask semantically:

{
  "tool": "query_knowledge_base",
  "question": "What code validates user input?"
}

{
  "tool": "query_knowledge_base",
  "question": "How is this API endpoint implemented?"
}

{
  "tool": "query_knowledge_base",
  "question": "What dependencies does this component have?"
}
```

**Benefits over traditional search:**
- Finds conceptually related code, not just text matches
- Understands context and relationships
- Discovers code you didn't know existed
- Identifies patterns across the codebase

---

### Phase 3: Analyze Patterns

**Understand why bug exists:**

1. Query for similar working implementations
2. Compare broken code vs working code
3. Identify missing patterns or validations
4. Check for edge cases

```typescript
{
  "tool": "query_knowledge_base",
  "question": "How do other parts handle [similar scenario]?"
}
```

---

### Phase 4: Implement Fix

**Apply fix following existing patterns:**

1. Write fix matching codebase style
2. Add validation if missing
3. Handle edge cases found in analysis
4. Follow error handling patterns from RAG

---

### Phase 5: Prevent Regression

**Add test to prevent bug from returning:**

```typescript
// Query for similar test patterns
{
  "tool": "query_knowledge_base",
  "question": "How are [similar features] tested?"
}

// Implement test following discovered patterns
```

---

### Phase 6: Learn from Fix

**Index the fix for future reference:**

```typescript
{
  "tool": "learn_from_session",
  "sessionId": "bug-fix-session-id",
  "projectPath": "/path/to/project",
  "extractPatterns": true
}
```

---

## Example: Fixing an Auth Bug

```typescript
// Bug: "Users can't log in after password reset"

// 1. Understand the bug
const loginFlow = await query(
  "How is the login flow implemented?"
);
// Returns: Login route, Clerk integration, session handling

const passwordReset = await query(
  "How is password reset handled?"
);
// Returns: Reset logic, email sending, token validation

// 2. Find the issue
const sessionHandling = await query(
  "How are sessions managed after password change?"
);
// Discovers: Session isn't invalidated after reset!

// 3. Find the fix pattern
const sessionPatterns = await query(
  "How do we invalidate sessions in Clerk?"
);
// Returns: Example code from other features

// 4. Implement fix using discovered pattern
// ... add session invalidation ...

// 5. Add test
const authTests = await query(
  "How are authentication flows tested?"
);
// Returns: Test patterns to follow

// 6. Learn from fix
await learn_from_session("bug-fix-123", "/path/to/project");
```

---

## RAG Query Strategies

### Strategy 1: Error-First
Start with the error message, then work backwards.

### Strategy 2: Feature-First
Start with the feature, then drill down to bug location.

### Strategy 3: Pattern-First
Find similar working code, compare with broken code.

### Strategy 4: Dependency-First
Map all dependencies, find where it breaks.

---

## Best Practices

### 1. Query Before Debugging
Don't dive into code blindly - understand context first.

### 2. Use Natural Language
Describe what you're looking for naturally, not technically.

### 3. Search Broadly, Fix Precisely
Cast a wide net for context, then narrow to specific fix.

### 4. Always Add Tests
Use RAG to find test patterns, then add regression test.

### 5. Learn from Every Fix
Index fixes so similar bugs are easier to solve next time.

---

## Common Bug Patterns

### Authentication Bugs
Query: "How is user authentication implemented?"

### Database Bugs
Query: "How are database queries handled?"

### API Bugs
Query: "How are API errors handled?"

### State Management Bugs
Query: "How is state updated in [component]?"

### Permission Bugs
Query: "How are permissions checked?"

---

## Next Steps

- **→ [Continue Development](./continue-development.md)** - Resume feature work
- **→ [Staged Development](./staged-development.md)** - Add tests following workflow
- **→ [Pre-Deployment Testing](./pre-deployment-testing.md)** - Validate fix before deploy

---

**Last Updated:** 2025-10-22
