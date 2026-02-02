---
name: frontend-handoff
description: Generate standalone frontend specification for external teams
triggers: handoff, frontend team, external developers, API contract, external agency
---

# Frontend Handoff

Generate a self-contained specification document for external frontend teams. Unlike internal handoff documents, this produces a **single, standalone file** with zero references to ai-coder internals.

## When to Use

- Handing off to external design/frontend agency
- Working with freelance frontend developers
- Providing specs to separate frontend team
- Creating API consumer documentation
- Generating contract for offshore development

## Prerequisites

Before running this skill, ensure:

1. **Database schema defined** - Supabase migrations exist or types are available
2. **API routes documented** - Endpoints are either implemented or spec'd
3. **UX requirements defined** - PRP or equivalent with screen list
4. **Design system exists** - Colors, typography, spacing tokens defined

## Inputs Required

| Input | Source | Purpose |
|-------|--------|---------|
| Database types | `supabase gen types typescript` or migrations | Generate TypeScript interfaces |
| API endpoints | Route files or API spec | Document request/response shapes |
| Screen list | PRP or requirements doc | Define per-screen data needs |
| Design tokens | CSS variables or Tailwind config | Populate design system section |

## Output

**Single file:** `docs/FRONTEND-SPECIFICATION.md`

This file is immediately usable by any frontend developer without additional context.

## Document Sections

| # | Section | Purpose |
|---|---------|---------|
| 1 | Project Summary | Name, version, API base URL, auth method |
| 2 | Authentication | How to get/use tokens, header format |
| 3 | Data Types | TypeScript interfaces (copy-paste ready) |
| 4 | API Endpoints | Method, path, request/response shapes, errors |
| 5 | Screen Requirements | Per-screen data needs + interactive elements |
| 6 | Form Specifications | Fields, validation rules, submit behavior |
| 7 | State Enumeration | All UI states as TypeScript union types |
| 8 | Error Handling | Standard error shapes and how to handle |
| 9 | Design System | Colors, typography, spacing tokens |

## Workflow

### Step 1: Gather Database Types

```bash
# From Supabase project
npx supabase gen types typescript --local > /tmp/db-types.ts

# Or read existing types
cat types/database.ts
```

Extract all table types and convert to clean interfaces.

### Step 2: Document API Endpoints

For each endpoint, document:

```markdown
### GET /api/projects

**Description:** Fetch all projects for authenticated user

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {token} | Yes |

**Response:** `200 OK`
```typescript
{
  data: Project[],
  meta: { total: number, page: number }
}
```

**Errors:**
| Code | Meaning | Action |
|------|---------|--------|
| 401 | Token expired | Refresh token |
| 500 | Server error | Retry with backoff |
```

### Step 3: Map Screens to Data

For each screen, document:

1. **Data Requirements** - What data is needed and from which endpoint
2. **Interactive Elements** - Every button, link, form with its action
3. **Required States** - Loading, empty, error, success states

### Step 4: Define All UI States

Create exhaustive TypeScript unions for all possible states:

```typescript
export type ProjectListState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'empty' }
  | { status: 'loaded'; data: Project[] }
```

### Step 5: Document Forms

For each form:

```markdown
### Create Project Form

**Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | text | Yes | 3-100 chars |
| description | textarea | No | Max 500 chars |

**Submit:** POST /api/projects
**Success:** Redirect to /projects/{id}
**Error:** Display inline field errors
```

### Step 6: Generate Specification

Compile all sections into `docs/FRONTEND-SPECIFICATION.md` using the template.

## Quality Checklist

Before delivering:

- [ ] Zero internal references (no hooks, actions, skills mentioned)
- [ ] All TypeScript types valid (paste into TS playground)
- [ ] All API endpoints have request/response documented
- [ ] All screens have data requirements listed
- [ ] All interactive elements have actions defined
- [ ] All states exhaustively enumerated
- [ ] Design tokens are copy-paste ready

## Anti-Patterns

| Avoid | Instead |
|-------|---------|
| `import { useProjects } from '@/hooks'` | Just show the endpoint: `GET /api/projects` |
| "See SKILL.md for details" | Include all details inline |
| "Use the unified-workflow" | Omit internal workflow references |
| Hardcoded sample data | Show type shapes with descriptive field names |
| Internal component names | Use generic descriptions |

## Example Usage

```markdown
# When user says:
"Generate a frontend spec for the coaches portal"

# You should:
1. Read the database schema/types
2. Read existing API routes
3. Read the PRP for screen list
4. Generate docs/FRONTEND-SPECIFICATION.md
```

## References

| Document | Purpose |
|----------|---------|
| `references/output-template.md` | Full template with all 9 sections |
| `references/example-handoff.md` | Complete example specification |

## Verification

After generating, verify by asking:

1. Can a frontend dev understand this without ai-coder context?
2. Are all TypeScript types syntactically valid?
3. Are all API endpoints documented with shapes?
4. Are all screens covered with data requirements?
5. Are all states enumerated exhaustively?
