# Milestone-Based Development Convention

**Version:** 1.0
**Created:** 2025-10-23
**Status:** Production Standard

---

## Overview

This document defines the **milestone-based development convention** for AI Coder projects. Milestones replace informal naming like "Day 1", "Day 2" with a structured, phase-aligned approach that enforces CodeRabbit review gates.

**Key Principle:** Every milestone is a reviewable, committable unit of work.

---

## Milestone Format

### Standard Naming Convention

```
M{number}: {Phase} - {Feature/Component}
```

**Components:**
- **M{number}**: Sequential milestone number (M1, M2, M3...)
- **{Phase}**: One of 5 core phases (see below)
- **{Feature/Component}**: Brief description of what's being built

### Examples

```
✅ M1: Planning - Database Schema Design
✅ M2: Building - Neon Migration & Tables
✅ M3: Building - RLS Policies Implementation
✅ M4: Building - Clerk Authentication Setup
✅ M5: Building - MCP Server Integration
✅ M6: Testing - Integration Test Suite
✅ M7: Reviewing - Security Audit
✅ M8: Deploying - Production Launch
```

---

## The 5 Core Phases

Aligned with [AI-CODER-FRAMEWORK.md](../AI-CODER-FRAMEWORK.md)

### Phase 1: Planning
**Purpose:** Design, research, architecture decisions

**Activities:**
- Read documentation
- Query knowledge base
- Select templates
- Design database schema
- Plan architecture
- Create PRPs
- Define requirements

**Deliverable:** Plan document, architecture diagram, PRP

**Examples:**
- `M1: Planning - Database Schema Design`
- `M2: Planning - Authentication Strategy`
- `M3: Planning - API Architecture`

---

### Phase 2: Building
**Purpose:** Implement features and components

**Activities:**
- Write code
- Create components
- Integrate services
- Implement APIs
- Build UI
- Configure services

**Deliverable:** Working code, tests

**Examples:**
- `M4: Building - Neon Database Tables`
- `M5: Building - Clerk Auth Integration`
- `M6: Building - RAG System`
- `M7: Building - MCP Server Wrapper`

---

### Phase 3: Reviewing
**Purpose:** Code quality, security, performance validation

**Activities:**
- Run CodeRabbit reviews
- Fix blocker issues
- Address security concerns
- Performance testing
- Architecture review
- Peer review

**Deliverable:** Reviewed, validated code

**Examples:**
- `M8: Reviewing - Security Audit`
- `M9: Reviewing - Performance Optimization`
- `M10: Reviewing - Code Quality Check`

---

### Phase 4: Testing
**Purpose:** Functional, integration, E2E testing

**Activities:**
- Write tests
- Run test suites
- Integration testing
- E2E testing
- Load testing
- UAT

**Deliverable:** Passing test suite, test reports

**Examples:**
- `M11: Testing - Unit Test Suite`
- `M12: Testing - Integration Tests`
- `M13: Testing - E2E User Flows`

---

### Phase 5: Deploying
**Purpose:** Production deployment and launch

**Activities:**
- Deploy to staging
- Deploy to production
- Configure CI/CD
- Monitor deployment
- Rollback if needed

**Deliverable:** Live production system

**Examples:**
- `M14: Deploying - Staging Deployment`
- `M15: Deploying - Production Launch`
- `M16: Deploying - Monitoring Setup`

---

## Milestone Scope Guidelines

### Recommended Scope

**File Count:**
- **Maximum:** 15 files per milestone
- **Recommended:** 5-10 files
- **If exceeds:** Split into multiple milestones

**Time Estimate:**
- **Maximum:** 4 hours of work
- **Recommended:** 1-2 hours
- **If exceeds:** Split into smaller milestones

**Logical Scope:**
- ✅ Single feature or component
- ✅ One service integration
- ✅ One architectural layer
- ❌ Multiple unrelated changes
- ❌ Entire application phases

### Examples: Good vs Bad Scope

#### ✅ Good Milestone Scope

```markdown
M5: Building - Supabase Authentication

**Scope:**
- Install @supabase/ssr package
- Create Supabase client helpers (server/browser)
- Add middleware for protected routes
- Create sign-in/sign-up pages with auth actions
- Test auth flow

**Files:** ~8 files
```

#### ❌ Bad Milestone Scope (Too Large)

```markdown
M5: Building - Complete Authentication System

**Scope:**
- Clerk authentication
- Email verification
- Password reset
- 2FA setup
- Session management
- Role-based access control
- Audit logging
- User profile management

**Files:** ~30+ files ❌
**Time:** ~8+ hours ❌
```

**Fix:** Split into 4 milestones:
- M5: Building - Clerk Auth Integration
- M6: Building - Email Verification & Password Reset
- M7: Building - 2FA & Session Management
- M8: Building - RBAC & Audit Logging

---

## Milestone Review Gates (MANDATORY)

### After Every Milestone

**Required Steps:**

1. **Complete milestone work**
   - Finish all tasks
   - Ensure code runs
   - Basic manual testing

2. **Run CodeRabbit Review**
   ```bash
   coderabbit review
   ```

3. **Fix ALL Blocker Issues**
   - 0 blockers required to proceed
   - No exceptions

4. **Address Major Issues**
   - Fix if possible
   - Document if deferring (with justification)

5. **Review Minor Issues**
   - Consider fixes (time permitting)

6. **Commit with Milestone Tag**
   ```bash
   git add .
   git commit -m "M{number}: {Phase} - {Feature}

   [Brief description of changes]

   CodeRabbit Review: ✅ No blockers
   - Fixed: [list of issues fixed]

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

7. **Update PRP/Tracking Document**
   - Mark milestone as complete
   - Update progress percentage

**See:** [code-review-gates.md](./code-review-gates.md) for detailed review process

---

## Milestone Tracking

### In PRP Documents

```markdown
## Implementation Plan

### M1: Planning - Database Schema Design ✅
**Status:** Complete
**Committed:** 2025-10-23
**Review:** No blockers

### M2: Building - Neon Database Migration ✅
**Status:** Complete
**Committed:** 2025-10-23
**Review:** 2 blockers fixed

### M3: Building - Clerk Authentication Setup 🔄
**Status:** In Progress
**Started:** 2025-10-24
**Review:** Pending

### M4: Building - MCP Server Integration ⏳
**Status:** Not Started
**Planned:** 2025-10-25
**Review:** Pending
```

### In Project Status Documents

```markdown
## Week 1 Progress

**Overall Goal:** Lobe Chat Foundation + MCP Setup

**Milestones:**
- [x] M1: Planning - Architecture Design ✅
- [x] M2: Building - Neon Migration ✅
- [ ] M3: Building - Clerk Auth 🔄
- [ ] M4: Building - MCP Servers ⏳
- [ ] M5: Testing - Integration Tests ⏳
- [ ] M6: Deploying - Production Launch ⏳

**Progress:** 2/6 milestones (33%)
```

---

## Integration with AI Coder Framework

### Pattern-Based Milestones

Different patterns require different milestone structures:

#### Pattern 01: Ad Hoc Prompts
**Typical Milestones:**
- M1: Planning - Exploration
- M2: Building - Quick Implementation

**Minimal structure** - fast iteration

---

#### Pattern 02: Reusable Prompt
**Typical Milestones:**
- M1: Planning - Service Research
- M2: Building - SDK Integration
- M3: Building - Code Snippet Creation
- M4: Testing - Validation

**Single-service focus** - 3-5 milestones

---

#### Pattern 03: Subagent Pattern
**Typical Milestones:**
- M1: Planning - Agent Architecture
- M2: Building - Primary Agent
- M3: Building - Subagent 1
- M4: Building - Subagent 2
- M5: Building - Agent Handoff
- M6: Testing - Agent Integration

**Multi-agent coordination** - 5-8 milestones

---

#### Pattern 04: MCP Wrapper
**Typical Milestones:**
- M1: Planning - MCP Tool Design
- M2: Building - Tool Definitions
- M3: Building - Orchestrator Logic
- M4: Building - Service Integrations
- M5: Testing - MCP Tool Testing
- M6: Reviewing - Security Audit

**Service orchestration** - 6-10 milestones

---

#### Pattern 05: Full Application
**Typical Milestones:**
- M1: Planning - Architecture Design
- M2: Planning - Template Selection
- M3: Building - Layer 1 (Face/UI)
- M4: Building - Layer 2 (Head/Logic)
- M5: Building - Layer 3a (DNA/Auth)
- M6: Building - Layer 3b (DNA/Database)
- M7: Building - Layer 3c (DNA/Storage)
- M8: Testing - Unit Tests
- M9: Testing - Integration Tests
- M10: Testing - E2E Tests
- M11: Reviewing - Security Audit
- M12: Reviewing - Performance Optimization
- M13: Deploying - Staging
- M14: Deploying - Production

**Complete application** - 12-20+ milestones

---

## Migration from Informal Naming

### Converting "Day X" to Milestones

#### Before (Informal)
```markdown
- [x] Day 1: Deploy Lobe Chat
- [x] Day 2: Database setup
- [ ] Day 3: Authentication
- [ ] Day 4-5: MCP servers
```

#### After (Milestone-Based)
```markdown
- [x] M1: Planning - Week 1 Architecture ✅
- [x] M2: Building - Neon Migration ✅
- [ ] M3: Building - Clerk Authentication 🔄
- [ ] M4: Building - MCP Server Integration ⏳
- [ ] M5: Testing - Integration Tests ⏳
- [ ] M6: Deploying - Production Launch ⏳
```

**Benefits:**
- ✅ Clear phase alignment
- ✅ Review gates enforced
- ✅ Scope controlled
- ✅ Progress trackable

---

## Best Practices

### ✅ DO

- **Use sequential numbering** (M1, M2, M3...)
- **Align with 5 phases** (Planning/Building/Reviewing/Testing/Deploying)
- **Keep scope small** (< 15 files, < 4 hours)
- **Review after every milestone** (CodeRabbit mandatory)
- **Commit after review** (reviewed code only)
- **Track progress** (update PRP and status docs)
- **Tag commits** with milestone number

### ❌ DON'T

- **Skip milestone reviews** (no accumulating work)
- **Use informal naming** (no "Day 1", "Phase A")
- **Create huge milestones** (split if > 15 files)
- **Mix unrelated changes** (one feature per milestone)
- **Commit without review** (all commits must be reviewed)
- **Ignore blockers** (0 blockers required to proceed)

---

## Real-World Example: CARE App V2

### Initial Plan (Informal - Before)

```
Week 1: Lobe Chat Foundation
- Day 1: Deploy
- Day 2: Database
- Day 3: Auth
- Day 4-5: MCP
- Day 6-7: Testing
```

### Milestone Plan (Structured - After)

```
Week 1: Foundation Setup

M1: Planning - Architecture Design ✅
- 3-layer architecture defined
- Service matrix created
- Template selection completed
- Committed: 2025-10-22

M2: Building - Neon Database Migration ✅
- 9 tables created
- RLS enabled
- Indexes created
- Preview branching configured
- Committed: 2025-10-23
- Review: ⚠️ PENDING

M3: Building - Clerk Authentication (In Progress)
- Clerk SDK integration
- Sign-in/sign-up flows
- Protected routes
- User management
- Estimated: 2 hours, ~8 files

M4: Building - MCP Server Integration
- Travel MCP
- Cal.com MCP
- Weather/Traffic MCP
- Estimated: 3 hours, ~12 files

M5: Testing - Integration Test Suite
- Auth flow tests
- Database connection tests
- MCP tool tests
- Estimated: 2 hours, ~6 files

M6: Deploying - Production Launch
- Final review
- Production deployment
- Monitoring setup
- Estimated: 1 hour, ~3 files
```

---

## Quick Reference

| Old Style | New Milestone Style |
|-----------|---------------------|
| Day 1: Deploy | M1: Planning - Architecture Design |
| Day 2: Database | M2: Building - Database Migration |
| Day 3: Auth | M3: Building - Authentication Setup |
| Phase 1 | M4-M6: Building - [specific features] |
| Testing phase | M7-M9: Testing - [specific test types] |
| Launch | M10: Deploying - Production Launch |

---

## Templates

### Milestone Planning Template

```markdown
## M{number}: {Phase} - {Feature}

**Scope:**
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

**Estimated Files:** {count} (max 15)
**Estimated Time:** {hours} hours (max 4)

**Dependencies:**
- M{number}: {previous milestone}

**Review Gate:**
- [ ] Run CodeRabbit review
- [ ] Fix ALL blocker issues
- [ ] Address major issues
- [ ] Commit with milestone tag

**Success Criteria:**
- {Criterion 1}
- {Criterion 2}
```

---

## Resources

- **Code Review Gates:** [code-review-gates.md](./code-review-gates.md)
- **AI Coder Framework:** [AI-CODER-FRAMEWORK.md](../AI-CODER-FRAMEWORK.md)
- **PRP Template:** [prp-template.md](../templates/prp-template.md)
- **Milestone Checklist:** [milestone-checklist.md](../templates/milestone-checklist.md)

---

**Version:** 1.0
**Status:** Production Standard
**Last Updated:** 2025-10-23
**Next Review:** After first project completes using milestone system
