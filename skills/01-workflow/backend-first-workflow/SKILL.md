---
name: backend-first-workflow
description: Backend-First workflow where the data model drives development. Define complete requirements, build database and APIs first, then design and build UI. Best for data-heavy apps, APIs, and complex business logic.
---

# Backend-First Workflow

Backend-First development workflow where the data model drives the product. Define complete requirements including data model and API design upfront, build the backend, generate integration layer, then design and build the UI.

## When to Use

- **Complex data relationships** - The data model drives the product logic
- **Building APIs first** - Multiple clients will consume the same backend
- **Need generated types before designing** - Type safety from day one
- **Data-heavy applications** - Dashboards, admin panels, B2B tools
- **Existing data model** - Migrating from another system
- **Multi-client architecture** - Web, mobile, and API clients share backend

## When NOT to Use

Use `stitch-workflow` instead when:

- Stitch is your primary design tool
- You want stakeholder buy-in before engineering
- The product is visual/consumer-facing
- You have rapid iteration cycles on design

---

## Architecture Overview

```
PROJECT STAGES (1-9) = Milestones
├── Stage 1: PRP Creation (includes data model)
│   └── Phases: Plan → Build
├── Stage 2: Backend Foundation
│   └── Phases: Plan → Build → Review → Test → Deploy → Learn
├── Stage 3: Integration Scaffold ← Generates hooks/actions/types
│   └── Phases: Plan → Build → Review → Test → Deploy → Learn
├── Stage 4: UX Planning ← User journeys, states, friction audit
│   └── Phases: Plan → Build
├── Stage 4.5: Web Copy ← All text content by page
│   └── Phases: Plan → Build
├── Stage 5: Stitch Prompts ← Visual design with copy embedded
│   └── Phases: Plan → Build
├── Stage 5.5: Developer Handoff Spec ← Technical bridge document
│   └── Phases: Build
├── Stages 6-7: Frontend Build
│   └── BUILD-WIRE-VERIFY loop per page
├── Stage 7.5: Final Integration Audit
│   └── Phases: Review → Test
├── Stage 8: Quality Gates
│   └── Phases: Test → Deploy
└── Stage 9: Agent Handoff
    └── Phases: Build
```

### Key Concepts

| Concept               | Definition                                                          |
| --------------------- | ------------------------------------------------------------------- |
| **Stage**             | Project milestone (1-9) with specific deliverables                  |
| **Phase**             | Execution loop within a stage (Plan→Build→Review→Test→Deploy→Learn) |
| **Gate**              | Validation checkpoint between stages                                |
| **Integration Layer** | Generated hooks, actions, and types from database schema            |

---

## Stage Overview

| Stage | Name                   | Owner         | Output                                |
| ----- | ---------------------- | ------------- | ------------------------------------- |
| 1     | PRP Creation           | Claude        | `.ai-coder/prps/{project}.md`         |
| 2     | Backend Foundation     | Claude        | Database, RLS, APIs, Webhooks         |
| 3     | Integration Scaffold   | Claude        | Hooks, Actions, Types, Placeholders   |
| 4     | UX Planning            | Claude        | User journeys, states, friction audit |
| 4.5   | Web Copy               | Claude        | `.ai-coder/copy/{project}/`           |
| 5     | Stitch Prompts         | Claude        | `docs/STITCH-DESIGN-PROMPTS.md`       |
| 5.5   | Developer Handoff Spec | Claude        | `docs/DEVELOPER-HANDOFF-SPEC.md`      |
| 6-7   | Frontend Build         | Frontend Team | UI components integrated              |
| 7.5   | Final Integration      | Collaborative | Cross-phase verification              |
| 8     | Quality Gates          | Collaborative | Production-ready release              |
| 9     | Agent Handoff          | Collaborative | `CLAUDE.md`, `.claude/commands/`      |

---

## Phase Execution Loop

Each stage executes through these phases:

```
┌─────────────────────────────────────────────────────┐
│              6-PHASE EXECUTION LOOP                 │
│                                                     │
│  ┌────────┐  ┌────────┐  ┌────────┐               │
│  │ 1.PLAN │→ │ 2.BUILD│→ │3.REVIEW│               │
│  └────────┘  └────────┘  └────────┘               │
│       ↑                        ↓                   │
│  ┌────────┐  ┌────────┐  ┌────────┐               │
│  │ 6.LEARN│← │5.DEPLOY│← │ 4.TEST │               │
│  └────────┘  └────────┘  └────────┘               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

| Phase      | Purpose               | Tools/Actions                            |
| ---------- | --------------------- | ---------------------------------------- |
| **Plan**   | Create execution plan | Read PRP, identify tasks                 |
| **Build**  | Execute the work      | Write code, create files                 |
| **Review** | Quality check         | CodeRabbit, peer review                  |
| **Test**   | Verify correctness    | TypeScript, unit tests, E2E              |
| **Deploy** | Build and stage       | `npm run build`, preview deploy          |
| **Learn**  | Self-improve          | Update expert models, document learnings |

---

## Stage 1: PRP Creation

**Skill:** `meta-tools`

**Purpose:** Create complete Product Requirement Prompt with full data model and API design.

### Entry Criteria

- Project concept defined
- User personas identified
- Basic requirements known

### Workflow

1. Analyze project requirements
2. Select pattern (01-05)
3. Map to 3-layer architecture
4. Complete all 17 PRP sections
5. Define skills assessment
6. Create design system foundation

### PRP Sections Checklist

| Section | Content                     | Required           |
| ------- | --------------------------- | ------------------ |
| 1       | Project Overview            | Yes                |
| 2       | Goals & Success Metrics     | Yes                |
| 3       | User Personas               | Yes                |
| 4       | User Stories                | Yes                |
| 5       | Functional Requirements     | Yes                |
| 6       | Non-Functional Requirements | Yes                |
| 7       | Technical Architecture      | Yes                |
| 8       | Data Model                  | **Yes - Complete** |
| 9       | API Design                  | **Yes - Complete** |
| 10      | UI/UX Requirements          | Yes                |
| 11      | Integration Points          | Yes                |
| 12      | Testing Strategy            | Yes                |
| 13      | Deployment Plan             | Yes                |
| 14      | Implementation Roadmap      | Yes                |
| 15      | Skills Assessment           | Yes                |
| 16      | Design System Foundation    | Yes                |
| 17      | Open Questions              | Optional           |

### Exit Criteria

- [ ] All 17 sections complete
- [ ] Pattern selected
- [ ] Skills mapped
- [ ] Design system defined
- [ ] Implementation roadmap drafted
- [ ] Data model fully defined (Section 8)
- [ ] API design complete (Section 9)

### Deliverables

```
.ai-coder/prps/{project-name}.md
```

### Milestone Commit

```
M1: PRP Creation - {Project Name} Requirements Complete
```

---

## Stage 2: Backend Foundation

**Skill:** `dna-layer` + platform auth

**Purpose:** Build fully functional backend.

### Entry Criteria

- PRP with data model (section 8)
- PRP with API design (section 9)

### Platform Stack Matrix

| Platform           | Skills                             | Backend Stack             |
| ------------------ | ---------------------------------- | ------------------------- |
| Web (Next.js/Vite) | dna-layer, supabase-auth           | Supabase + API routes     |
| Mobile (Expo)      | dna-layer, supabase-auth           | Supabase + Vercel API     |
| Telegram           | dna-layer, supabase-edge-functions | Edge Functions            |
| Discord            | dna-layer, supabase-edge-functions | Express + Edge Functions  |
| ChatGPT            | dna-layer (optional)               | Standalone or GPT Actions |

### Workflow

1. Create database schema from PRP section 8
2. Set up RLS policies
3. Create API routes from PRP section 9
4. Configure auth (platform-specific)
5. Set up webhook handlers
6. Run tests

### Exit Criteria

- [ ] All tables created with RLS
- [ ] Auth flows working
- [ ] API endpoints responding
- [ ] Webhooks configured
- [ ] Database migrations committed

### Deliverables

```
supabase/migrations/*.sql
app/api/** or supabase/functions/**
lib/supabase/
```

### Milestone Commit

```
M2: Backend Foundation - Schema, Auth, APIs
```

---

## Stage 3: Integration Scaffold

**Purpose:** Generate integration layer and placeholder pages.

This is the **critical stage** where hooks, actions, and types are auto-generated.

### Entry Criteria

- Backend complete (Stage 2)
- Database schema finalized

### What Gets Generated

```
lib/
├── hooks/
│   ├── use-user.ts              # Auth hook
│   └── use-{entity}.ts          # Data hook per entity
├── actions/
│   └── {entity}-actions.ts      # Server actions (CRUD)
└── types/
    └── database.ts              # Generated from Supabase
```

### Auto-Generation Process

1. **Generate Types**

   ```bash
   npx supabase gen types typescript --local > types/database.ts
   ```

2. **Parse Schema for Entities**
   - Extract table names from schema
   - Identify relationships
   - Note RLS policies

3. **Generate Hooks** (per entity)

   ```typescript
   // hooks/use-{entity}.ts
   'use client'
   import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
   import type { {Entity} } from '@/types/database'

   export function use{Entity}s() {
     return useQuery({
       queryKey: ['{entity}s'],
       queryFn: async () => {
         const res = await fetch('/api/{entity}s')
         if (!res.ok) throw new Error('Failed to fetch')
         return res.json() as Promise<{Entity}[]>
       },
     })
   }
   // ... useCreate, useUpdate, useDelete
   ```

4. **Generate Actions** (per entity)

   ```typescript
   // lib/actions/{entity}-actions.ts
   'use server'
   import { createClient } from '@/lib/supabase/server'
   import { revalidatePath } from 'next/cache'

   export async function get{Entity}s() { ... }
   export async function create{Entity}(formData: FormData) { ... }
   export async function update{Entity}(id: string, formData: FormData) { ... }
   export async function delete{Entity}(id: string) { ... }
   ```

5. **Create Placeholder Pages**

   ```typescript
   // app/(app)/{entity}s/page.tsx
   import { get{Entity}s } from '@/lib/actions/{entity}-actions'

   export default async function {Entity}sPage() {
     const {entity}s = await get{Entity}s()

     return (
       <main className="min-h-screen p-8">
         <h1 className="text-2xl font-bold mb-4">{Entity}s</h1>
         <p className="text-muted-foreground">
           Replace with Stitch-generated UI from docs/STITCH-DESIGN-PROMPTS.md
         </p>
         {/*
           INTEGRATION POINTS:
           - Data: {entity}s loaded via get{Entity}s()
           - Hooks: import { use{Entity}s } from '@/hooks/use-{entity}'
           - Actions: import { create{Entity}, delete{Entity} } from '@/lib/actions/{entity}-actions'
         */}
       </main>
     )
   }
   ```

### Running Integration Layer Generator

```bash
npm run workflow:generate
```

### Exit Criteria

- [ ] Types generated from Supabase
- [ ] Hook for each entity
- [ ] Actions for each entity (CRUD)
- [ ] Placeholder pages with integration comments
- [ ] Working auth pages (minimal UI)
- [ ] App shell renders

### Deliverables

```
lib/hooks/use-*.ts
lib/actions/*-actions.ts
types/database.ts
app/(app)/**/page.tsx (placeholders)
app/(auth)/**/page.tsx (working, minimal)
```

### Milestone Commit

```
M3: Integration Scaffold - Hooks, Actions, Types Generated
```

---

## Stage 4: UX Planning

**Skill:** `ux-planning`

**Purpose:** Define user journeys, required states, and identify friction points before visual design.

### Entry Criteria

- PRP with user personas (section 3)
- PRP with functional requirements (section 5)
- Backend complete (Stage 2)

### Workflow

1. Map user journeys for each persona
2. Document all required UI states per screen
3. Identify potential friction points
4. Define empty states, loading states, error states
5. Create state transition diagrams
6. Audit for accessibility concerns

### UX State Checklist

For each screen, document:

| State   | Trigger     | UI Treatment          |
| ------- | ----------- | --------------------- |
| Empty   | No data     | Illustration + CTA    |
| Loading | Fetching    | Skeleton              |
| Error   | API fail    | Error message + retry |
| Success | Action done | Toast notification    |
| Partial | Some data   | Content + skeleton    |

### Exit Criteria

- [ ] User journeys documented per persona
- [ ] All screen states identified
- [ ] Friction points noted with solutions
- [ ] Empty/loading/error states for each screen
- [ ] Accessibility considerations documented

### Deliverables

```
.ai-coder/ux/{project-name}/
├── user-journeys.md
├── screen-states.md
├── friction-audit.md
└── accessibility-notes.md
```

### Milestone Commit

```
M3.5: UX Planning - User Journeys and States Documented
```

---

## Stage 4.5: Web Copy Generation

**Skill:** `copywriting`

**Purpose:** Generate all text content before UI design.

### Entry Criteria

- UX Planning complete (Stage 4)
- Screen states documented
- User journeys mapped

### Workflow

1. Analyze target audience and awareness stage
2. Generate copy for marketing pages
3. Generate copy for auth pages
4. Generate copy for app pages
5. Create empty state and error messages
6. Provide 3 variations per key page

### Exit Criteria

- [ ] Copy for all marketing pages
- [ ] Copy for auth pages
- [ ] Copy for app pages
- [ ] Empty states documented
- [ ] Error messages documented

### Deliverables

```
.ai-coder/copy/{project-name}/
├── marketing/
│   ├── homepage.md
│   ├── pricing.md
│   └── features.md
├── auth/
│   ├── login.md
│   └── signup.md
└── app/
    ├── dashboard.md
    └── {feature}.md
```

### Milestone Commit

```
M3.6: Web Copy - All Page Content Written
```

---

## Stage 5: Stitch Prompt Generation

**Skill:** `google-stitch-prompts-*`

**Purpose:** Create UI prompts with copy embedded.

### Entry Criteria

- UX Planning complete (Stage 4)
- Web copy complete (Stage 4.5)
- Design system defined (PRP section 16)

### Platform → Stitch Skill

| Platform | Stitch Skill                     |
| -------- | -------------------------------- |
| Next.js  | `google-stitch-prompts-nextjs`   |
| Vite     | `google-stitch-prompts-vite`     |
| Expo     | `google-stitch-prompts-expo`     |
| Telegram | `google-stitch-prompts-telegram` |
| Discord  | `google-stitch-prompts-discord`  |
| ChatGPT  | `google-stitch-prompts-chatgpt`  |

### Output Structure

````markdown
# {Project Name} Google Stitch Design Prompts

## 1. Color Scheme & CSS Variables

[Full color scheme]

## 2. Global Style Instructions

[Typography, spacing, components]

## 3. Phase 1: Marketing & Auth

### 3.1 Landing Page (/)

#### Stitch Design Prompt

[Prompt with copy embedded]

#### Webcopy Reference

| Element | Copy |
| ------- | ---- |
| H1      | ...  |
| CTA     | ...  |

#### Backend Integration

```typescript
// Reference hooks and actions
import { useProducts } from "@/hooks/use-products";
```
````

## 4-7. [Additional Phases]

[Same pattern per page]

```

### Exit Criteria
- [ ] Color scheme documented
- [ ] Global style instructions
- [ ] Every page has: Prompt + Webcopy + Integration
- [ ] Copy from Stage 4.5 embedded
- [ ] Integration snippets reference actual hooks/actions

### Deliverables
```

docs/STITCH-DESIGN-PROMPTS.md

````

---

## Stage 5.5: Developer Handoff Spec

**Purpose:** Create technical bridge document between Stitch visual design and code implementation.

**Reference:** `references/developer-handoff-spec.md` (template)

### Entry Criteria
- Stitch Prompts complete (Stage 5)
- Design exported from Google Stitch

### Workflow
1. Generate DEVELOPER-HANDOFF-SPEC.md using template
2. Generate HANDOFF-CHECKLIST.md
3. Generate FUNCTIONAL-CONTRACT.md

### Developer Handoff Spec Contents

For each screen, document:

```markdown
## Screen: [Name]

### Component Mapping
| Stitch Element | Implementation | Import |
|----------------|----------------|--------|
| Card container | `<Card>` | `@/components/ui/card` |
| Avatar circle | `<Avatar>` | `@/components/ui/avatar` |

### Color Mapping
| Design Color | CSS Variable | Tailwind Token |
|--------------|--------------|----------------|
| Navy #1a365d | --primary | bg-primary |

### Interactive Elements
| Element | Handler | Service Call |
|---------|---------|--------------|
| "Create" button | `onClick={handleCreate}` | `createProject()` |

### State Requirements
- [ ] Empty state
- [ ] Loading skeleton
- [ ] Error state
````

### Exit Criteria

- [ ] DEVELOPER-HANDOFF-SPEC.md complete
- [ ] HANDOFF-CHECKLIST.md complete
- [ ] FUNCTIONAL-CONTRACT.md complete
- [ ] Every interactive element documented
- [ ] Handler → Service mappings complete
- [ ] Color mappings to theme tokens documented

### Deliverables

```
docs/DEVELOPER-HANDOFF-SPEC.md
docs/HANDOFF-CHECKLIST.md
docs/FUNCTIONAL-CONTRACT.md
```

### Milestone Commit

```
M4: Handoff Ready - Backend Complete, Design Spec Generated
```

---

## Stages 6-7: Frontend Build & Integration

**Owner:** Frontend Team

**Purpose:** Build UI and wire backend with BUILD-WIRE-VERIFY loop.

### BUILD-WIRE-VERIFY Loop (Per Page)

```
For each page:
  1. STITCH   → Generate UI in Google Stitch
  2. CONVERT  → HTML to framework component
  3. WIRE     → Connect to hooks/actions
  4. AUDIT    → Run /audit PageName --fix
  5. VERIFY   → Quick test (renders, data, forms)
  6. REVIEW   → CodeRabbit or peer review
  7. FIX      → Address issues

  ✓ Page complete → Next page
```

### Phase Gate (After All Pages in Phase)

```bash
# 1. TypeScript check
npx tsc --noEmit

# 2. Lint
npx eslint src/app --fix

# 3. Phase audit
/audit --phase {N}

# 4. Code review
coderabbit review --staged --plain

# 5. Milestone commit
git commit -m "M5.{phase}: Phase {N} - {Name} Integration"
```

### Milestone Commits

```
M5.1: Phase 1 - Marketing Integration
M5.2: Phase 2 - Auth Integration
M5.3: Phase 3 - Dashboard Integration
M5.N: Phase N - {Feature} Integration
```

---

## Stage 7.5: Final Integration Audit

**Purpose:** Verify cross-phase integration.

### Verification Checks

- [ ] All routes accessible (no 404s)
- [ ] Auth state persists across app
- [ ] Shared components consistent
- [ ] Data updates reflect across pages
- [ ] No regressions from earlier phases

### Workflow

```bash
# Full build
npm run build
npm run start

# Navigate full flow
# Marketing → Sign up → Dashboard → Features → Settings

# Code review
coderabbit review --plain
```

### Milestone Commit

```
M5.final: All Phases Integrated - Full App Working
```

---

## Stage 8: Quality Gates

**Skills:** `quality-gates`, `feature-audit`

**Purpose:** Ensure production readiness.

### Gate Sequence

1. **Feature Audit** (Mandatory)

   ```bash
   /audit --critical
   # Must pass: 0 critical, 0 high, ≥95% functional
   ```

2. **TypeScript Check**

   ```bash
   npx tsc --noEmit
   ```

3. **ESLint**

   ```bash
   npx eslint . --fix
   ```

4. **Build**

   ```bash
   npm run build
   ```

5. **Tests**

   ```bash
   npm run test
   npm run test:e2e
   ```

6. **Lighthouse**
   - Performance > 90
   - Accessibility > 90
   - Best Practices > 90
   - SEO > 90

### Exit Criteria

- [ ] Feature audit passes
- [ ] TypeScript clean
- [ ] ESLint clean
- [ ] Build succeeds
- [ ] Tests pass
- [ ] Lighthouse scores met

### Milestone Commit

```
M6: Production Release - Quality Gates Passed
```

---

## Stage 9: Agent Handoff

**Command:** `/handoff`

**Purpose:** Generate Claude agent scaffolding.

### What Gets Generated

```
{project}/
├── CLAUDE.md                    # Project instructions
├── .claude/
│   ├── commands/
│   │   ├── dev.md               # Start dev server
│   │   ├── test.md              # Run tests
│   │   ├── deploy.md            # Deploy
│   │   ├── status.md            # Check health
│   │   └── db.md                # Database ops
│   └── settings.json            # MCP plugins
└── docs/
    └── ARCHITECTURE.md          # System overview
```

### Workflow

1. Gather context from PRP and HANDOFF-CHECKLIST
2. Detect MCP plugins from dependencies
3. Generate project-specific CLAUDE.md
4. Create standard commands
5. Configure plugins

### Exit Criteria

- [ ] CLAUDE.md generated
- [ ] Commands created
- [ ] Plugins configured
- [ ] New Claude session understands project

### Milestone Commit

```
M7: Agent Handoff Complete - Claude Scaffolding Generated
```

---

## Validation Gates

### Between-Stage Gates

| From    | To                    | Gate                                  |
| ------- | --------------------- | ------------------------------------- |
| 1 → 2   | PRP → Backend         | PRP validation (17 sections complete) |
| 2 → 3   | Backend → Scaffold    | Database functional, APIs responding  |
| 3 → 4   | Scaffold → UX         | TypeScript compiles, auth works       |
| 4 → 4.5 | UX → Copy             | User journeys and states documented   |
| 4.5 → 5 | Copy → Stitch         | All copy written for pages            |
| 5 → 5.5 | Stitch → Handoff      | Design prompts complete with copy     |
| 5.5 → 6 | Handoff → Frontend    | Developer Handoff Spec generated      |
| 7.5 → 8 | Integration → Quality | Cross-phase audit passes              |
| 8 → 9   | Quality → Handoff     | All gates pass                        |

---

## Quick Reference

### Stage → Skill → Owner

| Stage | Skills                            | Owner         |
| ----- | --------------------------------- | ------------- |
| 1     | meta-tools                        | Claude        |
| 2     | dna-layer + auth                  | Claude        |
| 3     | face-layer/vite-frontend/expo     | Claude        |
| 4     | ux-planning                       | Claude        |
| 4.5   | copywriting                       | Claude        |
| 5     | google-stitch-prompts-\*          | Claude        |
| 5.5   | (developer-handoff-spec template) | Claude        |
| 6-7   | Stitch + React                    | Frontend Team |
| 7.5   | quality-gates                     | Collaborative |
| 8     | quality-gates, feature-audit      | Collaborative |
| 9     | /handoff                          | Collaborative |

### Trigger Phrases

- "Backend-first workflow"
- "Data model first"
- "API-driven development"
- "Traditional workflow"
- "Start with the database"
- "Build the backend first"

### Milestone Commit Pattern

```
M{N}: {Stage Name} - {Description}

- Bullet point 1
- Bullet point 2

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

---

## Checklist: Backend-First Workflow

- [ ] Stage 1: PRP created (with data model)
- [ ] Stage 2: Backend functional
- [ ] Stage 3: Integration layer generated
- [ ] Stage 4: UX planning complete
- [ ] Stage 4.5: Copy written
- [ ] Stage 5: Stitch prompts ready
- [ ] Stage 5.5: Developer handoff spec complete
- [ ] Stage 6-7: UI integrated (per phase)
- [ ] Stage 7.5: Cross-phase verified
- [ ] Stage 8: Quality gates passed
- [ ] Stage 9: Agent handoff complete

---

## References

| Document                                    | Purpose                       |
| ------------------------------------------- | ----------------------------- |
| `references/stage-configs.md`               | Detailed stage configurations |
| `references/integration-layer-templates.md` | Hook/action code templates    |
| `references/validation-gates.md`            | Gate definitions              |
| `references/platform-variations.md`         | Platform-specific adjustments |

---

## Why Backend-First?

### Advantages

- **Type safety from day one** - Generated types before any UI work
- **No designing unbuildable features** - Backend constraints are known
- **Clear API contracts** - Frontend team knows exactly what's available
- **Hooks reference real data** - `const { data } = useUsers()` works immediately
- **Multi-client ready** - Same backend serves web, mobile, API clients

### Challenges (and mitigations)

- **Requires knowing data model upfront** → Thorough PRP process
- **Can't iterate on visual design early** → UX planning stage helps
- **Stitch prompts must match reality** → Integration snippets reference actual hooks

### Best For

- Data-heavy applications
- B2B tools and dashboards
- API-first products
- Projects with complex business logic
- Teams with existing data models
- Multi-platform applications
