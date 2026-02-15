# Code Review Gates: Mandatory Quality Checkpoints

**Version:** 1.0
**Last Updated:** 2025-10-22
**Status:** MANDATORY for All Development

---

## Overview

**Code review gates** are **mandatory checkpoints** between pattern evolution stages. They prevent technical debt accumulation by ensuring code quality before moving to the next phase of development.

**Key Principle:** Review after EVERY phase. No exceptions.

---

## The Problem

### What Happens Without Code Review Gates

```
❌ WRONG WORKFLOW (No Gates):

Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Disaster
(50+ files, 5,000+ LOC, zero reviews, massive technical debt)

Issues Found Too Late:
- Security vulnerabilities
- Race conditions
- Memory leaks
- Type safety issues
- Architecture problems
```

### What Should Happen

```
✅ CORRECT WORKFLOW (With Gates):

Phase 1 → [REVIEW GATE] → Commit
Phase 2 → [REVIEW GATE] → Commit
Phase 3 → [REVIEW GATE] → Commit
Phase 4 → [REVIEW GATE] → Commit
Phase 5 → [REVIEW GATE] → Commit

Result: Clean, reviewed, production-ready code
```

---

## When to Run Code Reviews

### Mandatory Review Points

| Trigger | Review Required |
|---------|-----------------|
| **Pattern Evolution** | ✅ Before moving from Pattern 01 → 02 → 03 → 04 → 05 |
| **Phase Completion** | ✅ After each development phase (Phase 1, 2, 3, etc.) |
| **Before Commit** | ✅ All commits must pass review (via git hooks) |
| **Before PR** | ✅ Before creating pull request |
| **Major Feature** | ✅ After implementing any major component |
| **File Threshold** | ✅ When approaching 15+ files in changes |

### Commit Size Limits

**Maximum 15 files per commit**

If your changes exceed 15 files:
1. Split into logical components
2. Review and commit each component separately
3. Never batch large changes without reviews

---

## How to Run Code Reviews

### Method 1: MCP Tool (Recommended for Claude Code)

**In Claude Code terminal:**

```
"Before we continue to Phase 5, I need you to:
1. Call the run_quality_gates MCP tool on this project
2. Show me the results
3. Fix any blocker issues
4. Only then can we proceed to Phase 5"
```

The `run_quality_gates` tool will:
- Analyze all changed files
- Check for security issues
- Verify type safety
- Detect code smells
- Report blockers, major, and minor issues

---

### Method 2: CodeRabbit CLI (Fastest)

```bash
# Navigate to project
cd /path/to/your/project

# Review current changes
coderabbit review

# Review specific files
coderabbit review src/api/*.ts

# Review with custom profile
coderabbit review --profile assertive
```

**CodeRabbit Profiles:**
- `chill` - Minimal checks, fast
- `assertive` (default) - Balanced checks
- `pythonic` - Python-specific rules

---

### Method 3: AI Coder CLI

```bash
# Navigate to project
cd /path/to/your/project

# Run review
node /path/to/ai-coder/dist/index.js review

# Or if globally installed
ai-coder review
```

---

## Understanding Review Results

### Issue Categories

| Category | Severity | Action Required |
|----------|----------|-----------------|
| **🚫 BLOCKER** | Critical | MUST fix before commit |
| **⚠️ MAJOR** | Important | Should fix (can defer with justification) |
| **ℹ️ MINOR** | Suggestion | Nice to have (optional) |

### Example Review Output

```markdown
## Code Review Results

### 🚫 BLOCKERS (2)

1. **SQL Injection Risk** in `src/api/users.ts:45`
   - Query uses string concatenation with user input
   - Fix: Use parameterized queries
   ```typescript
   // ❌ Vulnerable
   const result = await db.query(`SELECT * FROM users WHERE id = ${userId}`);

   // ✅ Safe
   const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
   ```

2. **Missing Error Handling** in `src/services/payment.ts:78`
   - Stripe call has no try/catch
   - Fix: Wrap in try/catch with proper error response

### ⚠️ MAJOR (3)

1. **Race Condition** in `src/utils/cache.ts:23`
   - Cache read/write not atomic
   - Recommend: Use Redis transactions

2. **Memory Leak** in `src/agents/chat.ts:156`
   - Event listener not cleaned up
   - Fix: Add cleanup in finally block

3. **Type Safety** in `src/types/api.ts:12`
   - Using `any` instead of proper type
   - Fix: Define specific interface

### ℹ️ MINOR (5)
- Code formatting inconsistencies
- Missing JSDoc comments
- Variable naming could be clearer
```

---

## Fixing Issues

### Priority Order

1. **Fix all BLOCKERS** (no exceptions)
2. **Address MAJOR issues** (or document why deferring)
3. **Consider MINOR issues** (time permitting)

### Example Fix Workflow

```bash
# 1. Run review
coderabbit review

# 2. See 2 blockers, 3 major, 5 minor
# Output saved to .coderabbit-review.md

# 3. Fix blockers first
# Edit files...

# 4. Re-run review to verify
coderabbit review

# 5. Blockers resolved, address major issues
# Edit files...

# 6. Commit reviewed code
git add .
git commit -m "feat: implement Phase 4 RAG system

Reviewed with CodeRabbit - no blockers
Fixed 2 blockers, addressed 3 major issues"
```

---

## Automating Code Reviews with Git Hooks

### Setup Git Hooks

```bash
# Install husky
npm install --save-dev husky
npx husky install

# Create pre-commit hook (fast checks)
npx husky add .husky/pre-commit "npm run lint"

# Create pre-push hook (comprehensive review)
npx husky add .husky/pre-push "coderabbit review"
```

### Pre-Commit Hook (Fast)

**File:** `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "Running pre-commit checks..."

# Check for secrets
if git diff --cached --name-only | xargs grep -i "sk_live\|sk_test\|password\|secret" > /dev/null 2>&1; then
  echo "❌ Potential secret detected in staged files!"
  exit 1
fi

# Check file count
file_count=$(git diff --cached --name-only | wc -l)
if [ "$file_count" -gt 15 ]; then
  echo "⚠️  Warning: $file_count files staged (max recommended: 15)"
  echo "Consider splitting into smaller commits"
fi

# Run linter
npm run lint

echo "✅ Pre-commit checks passed"
```

### Pre-Push Hook (Comprehensive)

**File:** `.husky/pre-push`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "Running pre-push validation..."

# Run tests
npm test

# Run build
npm run build

# Run CodeRabbit review
coderabbit review

echo "✅ Pre-push validation complete"
```

---

## Creating `.ai-rules.md` for Claude

Create this file in your project root to enforce review gates with AI assistants:

**File:** `.ai-rules.md`

```markdown
# AI Development Rules

## Code Review - MANDATORY

1. **After implementing ANY feature/component:**
   - Call `run_quality_gates` MCP tool
   - Fix all BLOCKER issues
   - Address MAJOR issues
   - Commit changes

2. **NEVER build multiple phases without reviews**

3. **Maximum 15 files per commit**

4. **All commits must pass CodeRabbit review**

## Pattern Evolution Gates

Before moving to next pattern:
- ✅ Pattern 01 → 02: Review ad-hoc code before templating
- ✅ Pattern 02 → 03: Review reusable prompt before subagents
- ✅ Pattern 03 → 04: Review subagents before MCP wrapper
- ✅ Pattern 04 → 05: Review MCP wrapper before full app

## Development Workflow

```
Implement → Review → Fix → Commit → Repeat
```

NO skipping review steps. NO accumulating changes without reviews.
```

**Tell Claude to follow these rules:**

```
"Read .ai-rules.md and follow those rules for all development"
```

---

## Integration with AI Coder Framework

### Pattern Evolution with Review Gates

```
Pattern 01: Ad Hoc Prompts
    ↓
[REVIEW GATE] ← Run coderabbit review
    ↓
    ✅ Blockers fixed
    ↓
Pattern 02: Reusable Prompt
    ↓
[REVIEW GATE] ← Run run_quality_gates
    ↓
    ✅ No major issues
    ↓
Pattern 03: Subagent Pattern
    ↓
[REVIEW GATE] ← Comprehensive review
    ↓
    ✅ Architecture validated
    ↓
Pattern 04: MCP Wrapper
    ↓
[REVIEW GATE] ← Security audit
    ↓
    ✅ Production-ready
    ↓
Pattern 05: Full Application
```

### PRP Process Integration

**Enhanced PRP Template with Review Gates:**

```markdown
# PRP: [Feature Name]

## Problem Statement
[Description]

## Requirements
[List requirements]

## Implementation Plan

### Phase 1: [Name]
- [ ] Implement components
- [ ] **REVIEW GATE**: Run `coderabbit review`
- [ ] Fix blockers
- [ ] Commit

### Phase 2: [Name]
- [ ] Implement components
- [ ] **REVIEW GATE**: Run `run_quality_gates`
- [ ] Fix blockers
- [ ] Commit

[...repeat for each phase]

## Review Checkpoints

- [ ] Phase 1 reviewed - no blockers
- [ ] Phase 2 reviewed - no blockers
- [ ] Phase 3 reviewed - no blockers
- [ ] Final review before PR - no blockers
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/code-review.yml
name: Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  coderabbit-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install CodeRabbit CLI
        run: npm install -g @coderabbitai/cli

      - name: Run CodeRabbit Review
        run: coderabbit review
        env:
          CODERABBIT_API_KEY: ${{ secrets.CODERABBIT_API_KEY }}

      - name: Check for Blockers
        run: |
          if grep -q "🚫 BLOCKER" .coderabbit-review.md; then
            echo "❌ Blockers found in code review"
            exit 1
          fi
```

---

## Troubleshooting

### Common Issues

**Issue:** "CodeRabbit command not found"
```bash
# Install CodeRabbit CLI
npm install -g @coderabbitai/cli

# Verify installation
coderabbit --version
```

**Issue:** "MCP tool not available in Claude"
```bash
# Ensure MCP server is running
# Check Claude Code settings for MCP configuration
```

**Issue:** "Review taking too long"
```bash
# Review specific files only
coderabbit review src/api/*.ts

# Use faster profile
coderabbit review --profile chill
```

**Issue:** "Too many issues reported"
```bash
# Fix blockers first, ignore minor
# Use .coderabbitignore to exclude generated files
```

---

## Best Practices

### ✅ DO

- **Review after every phase**
- **Fix all blockers immediately**
- **Commit reviewed code frequently**
- **Keep commits under 15 files**
- **Document deferred major issues**
- **Use git hooks for automation**
- **Create `.ai-rules.md` for AI assistants**

### ❌ DON'T

- **Skip reviews to "move faster"**
- **Accumulate 50+ files before review**
- **Ignore blocker issues**
- **Batch multiple phases without reviews**
- **Commit code with unresolved security issues**
- **Trust code without validation**

---

## Quick Command Reference

| Task | Command |
|------|---------|
| **Review current changes** | `coderabbit review` |
| **Review via MCP tool** | Tell Claude: "Call run_quality_gates" |
| **Review via AI Coder CLI** | `ai-coder review` |
| **Install git hooks** | `npx husky install` |
| **Check CodeRabbit status** | `coderabbit auth status` |
| **Install CodeRabbit** | `npm install -g @coderabbitai/cli` |

---

## Real-World Example

### Scenario: Building Multi-Phase Feature

**Task:** Implement complete RAG system (5 phases)

**❌ Wrong Approach:**
```
Build Phase 1 (Vector DB)
Build Phase 2 (Embeddings)
Build Phase 3 (Search)
Build Phase 4 (API)
Build Phase 5 (UI)
Run review ← TOO LATE!
(50+ files, dozens of issues found)
```

**✅ Correct Approach:**
```
Build Phase 1 (Vector DB)
→ Review (2 blockers found)
→ Fix blockers
→ Commit

Build Phase 2 (Embeddings)
→ Review (1 blocker found)
→ Fix blocker
→ Commit

Build Phase 3 (Search)
→ Review (no blockers)
→ Commit

Build Phase 4 (API)
→ Review (3 blockers found)
→ Fix blockers
→ Commit

Build Phase 5 (UI)
→ Review (no blockers)
→ Commit

Result: Clean, reviewed code throughout
```

---

## The Bottom Line

**Code review is NOT optional. It's mandatory.**

Without review gates:
- Security vulnerabilities slip through
- Technical debt accumulates
- Race conditions go undetected
- Type safety breaks
- Architecture degrades

With review gates:
- Issues caught early
- Code quality maintained
- Security validated
- Performance optimized
- Architecture preserved

**Slow down to speed up.**

Review after each phase. Fix issues early. Commit often.

That's how you build production-ready code.

---

## Resources

- **CodeRabbit Documentation:** https://docs.coderabbit.ai
- **AI Coder Guardrails:** [AI-AGENT-GUARDRAILS.md](../AI-AGENT-GUARDRAILS.md)
- **Framework Patterns:** [AI-CODER-FRAMEWORK.md](../AI-CODER-FRAMEWORK.md)
- **Commit Guidelines:** See `.ai-rules.md` in project root

---

**Last Updated:** 2025-10-22
**Next Review:** When code review tools updated
**Maintained By:** AI Coder Team
