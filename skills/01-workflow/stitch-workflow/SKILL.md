---
name: stitch-workflow
description: Design-First workflow where Google Stitch drives the product vision. Complete UX and copy first, then design all screens in Stitch, extract data model from designs, build backend, and wire up. Best for consumer products, marketing sites, and UI-driven apps.
---

# Stitch Workflow (Design-First)

Design-First development workflow where Google Stitch drives the product vision. Plan UX, write copy, create design prompts, then design all screens visually. Get stakeholder sign-off, extract the data model, build backend, and wire it all up.

## When to Use

- **Stitch is your primary design tool** - You want visual design to drive development
- **Stakeholder buy-in needed early** - Product owners need to see the UI before engineering
- **Consumer-facing products** - User experience is the primary concern
- **Marketing sites** - Visual impact matters more than data complexity
- **Rapid visual iteration** - Design changes frequently, code shouldn't be written yet
- **UI-driven apps** - The interface is more important than the data model

## When NOT to Use

Use `backend-first-workflow` instead when:

- Complex data relationships drive the product
- You're building APIs that multiple clients consume
- The UI is secondary to the data model
- You need generated types before designing

---

## Prerequisites

Before starting, ensure these are configured:

### 1. E2B Sandbox Testing (Required for Stage 11-12)

```bash
# Install E2B CLI (requires Node.js 20+)
npm install -g @e2b/cli

# Login to E2B
e2b auth login

# Create the z-thread-node-v1 template (one-time setup)
cd ai-coder/e2b-templates/z-thread-node-v1
e2b template create z-thread-node-v1 --dockerfile ./Dockerfile --memory-mb 2048 --cpu-count 2

# Set API key
export E2B_API_KEY=your_key_here
```

### 2. Project Sandbox Scripts

Add to your project's `package.json` (uses global runner at `~/.claude/scripts`):

```json
{
  "scripts": {
    "sandbox:test": "npx tsx C:/Users/info/.claude/scripts/sandbox-runner.ts --test",
    "sandbox:build": "npx tsx C:/Users/info/.claude/scripts/sandbox-runner.ts --build",
    "sandbox:lint": "npx tsx C:/Users/info/.claude/scripts/sandbox-runner.ts --lint",
    "sandbox:typecheck": "npx tsx C:/Users/info/.claude/scripts/sandbox-runner.ts --typecheck",
    "sandbox:all": "npx tsx C:/Users/info/.claude/scripts/sandbox-runner.ts --all",
    "sandbox:status": "npx tsx C:/Users/info/.claude/scripts/sandbox-runner.ts --status"
  }
}
```

> **Note:** The global sandbox runner at `~/.claude/scripts/sandbox-runner.ts` handles:
> - Windows → Unix path normalization for E2B sandboxes
> - Automatic .env.local loading for E2B_API_KEY
> - Proper E2B SDK imports (`{ Sandbox }` named export)

### 3. Verify Setup

```bash
npm run sandbox:status
```

---

## Architecture Overview

```
PROJECT STAGES (1-13) = Milestones
├── Stage 1: Light PRP (business requirements only)
│   └── Phases: Plan → Build
├── Stage 2: UX Planning ← User journeys, states, friction audit
│   └── Phases: Plan → Build
├── Stage 3: Copywriting ← All text content by page
│   └── Phases: Plan → Build
├── Stage 4: Stitch Prompts ← Design prompts with copy embedded
│   └── Phases: Plan → Build
├── Stage 5: Stitch Design Phase ← Design all screens in Stitch
│   └── Phases: Build → Review (stakeholder sign-off)
├── Stage 6: Data Model Extraction ← Extract from designs
│   └── Phases: Build → Review
├── Stage 7: Backend Foundation
│   └── Phases: Plan → Build → Review → Test → Deploy
├── Stage 8: Integration Scaffold ← Generates hooks/actions/types
│   └── Phases: Build → Review → Test
├── Stage 9: Stitch → Code Conversion ← 1:1 fidelity
│   └── Phases: Build
├── Stage 10: Wiring ← Connect UI to hooks
│   └── Phases: Build → Review → Test
├── Stage 11: Final Integration Audit
│   └── Phases: Review → Test
├── Stage 12: Quality Gates
│   └── Phases: Test → Deploy
└── Stage 13: Agent Handoff
    └── Phases: Build
```

### Key Concepts

| Concept               | Definition                                                          |
| --------------------- | ------------------------------------------------------------------- |
| **Stage**             | Project milestone (1-13) with specific deliverables                 |
| **Phase**             | Execution loop within a stage (Plan→Build→Review→Test→Deploy→Learn) |
| **Gate**              | Validation checkpoint between stages                                |
| **Integration Layer** | Generated hooks, actions, and types from database schema            |

---

## Stage Overview

| Stage | Name                  | Skill                            | Owner                 | Output                               |
| ----- | --------------------- | -------------------------------- | --------------------- | ------------------------------------ |
| 1     | Light PRP             | `meta-tools`                     | Claude                | `.ai-coder/prps/{project}.md`        |
| 2     | UX Planning           | `ux-planning`                    | Claude                | `.ai-coder/ux/{project}/`            |
| 3     | Copywriting           | `copywriting`                    | Claude                | `.ai-coder/copy/{project}/`          |
| 4     | Stitch Prompts        | `google-stitch-prompts-*`        | Claude                | `docs/STITCH-DESIGN-PROMPTS.md`      |
| 5     | Stitch Design         | `google-stitch-base`             | Claude + Stakeholders | Stitch project                       |
| 6     | Data Model Extraction | (script)                         | Claude                | `schema-suggestion.json`, migrations |
| 7     | Backend Foundation    | `dna-layer`                      | Claude                | Database, RLS, APIs                  |
| 8     | Integration Scaffold  | (auto-gen)                       | Claude                | Hooks, Actions, Types                |
| 9     | Stitch Conversion     | (script)                         | Claude                | `app/**/page.tsx`                    |
| 10    | Wiring                | `face-layer`                     | Claude                | Connected UI                         |
| 11    | Final Integration     | `quality-gates`                  | Collaborative         | Verified app                         |
| 12    | Quality Gates         | `quality-gates`, `feature-audit` | Collaborative         | Release-ready                        |
| 13    | Agent Handoff         | `/handoff`                       | Collaborative         | `CLAUDE.md`                          |

---

## Stage 1: Light PRP

**Skill:** `meta-tools`

**Purpose:** Create a light Product Requirement Prompt with business requirements only. Data model and API design will be extracted from designs later.

### Entry Criteria

- Project concept defined
- User personas identified
- Basic requirements known

### Workflow

1. Analyze project requirements
2. Complete sections 1-7 of PRP:
   - 1. Project Overview
   - 2. Goals & Success Metrics
   - 3. User Personas
   - 4. User Stories
   - 5. Functional Requirements
   - 6. Non-Functional Requirements
   - 7. Technical Architecture (platform choice only)
3. Mark sections 8-9 (Data Model, API Design) as "TBD - Extracted from Stitch designs"
4. Complete section 16 (Design System Foundation)
5. Record Stitch project ID in PRP (create project if needed)

### Exit Criteria

- [ ] Sections 1-7 complete
- [ ] Section 16 (Design System) complete
- [ ] Stitch project created
- [ ] `stitch_project_id` recorded in PRP

### Deliverables

```
.ai-coder/prps/{project-name}.md
```

### Milestone Commit

```
M1: Light PRP - {Project Name} Business Requirements
```

---

## Stage 2: UX Planning

**Skill:** `ux-planning`

**Purpose:** Define user journeys, required states, and identify friction points BEFORE visual design.

### Entry Criteria

- Light PRP complete (Stage 1)
- User personas defined (PRP section 3)
- Functional requirements known (PRP section 5)

### Workflow

1. Map user journeys for each persona
   - Entry: Where they came from, mental state, expectations
   - Action: Primary task, decisions forced, feedback needed
   - Exit: Success indicator, next step, undo option

2. Document all required UI states per screen
   - Empty state (first use)
   - Loading state (fetching)
   - Ideal state (happy path)
   - Error state (what went wrong)
   - Overload state (too much data)

3. Run friction audit
   - Clicks to complete (target < 3)
   - Decisions forced (each = drop-off risk)
   - Error recovery paths
   - Trust signals needed

4. Audit for accessibility
   - Focus management
   - Labels and ARIA
   - Contrast requirements

### UX State Template

For each screen, document:

```markdown
## Screen: [Name]

### JTBD

The [user type] wants to [action] so they can [outcome].

### Entry

- **Source:** [Where they came from]
- **Mental state:** [Rushed/Exploring/Frustrated/Confident]
- **Expectation:** [What they think they'll see]

### Action

- **Primary action:** [The ONE thing]
- **Required decisions:** [List each choice point]
- **Feedback needed:** [Loading/progress/validation]

### Exit

- **Success indicator:** [How they know it worked]
- **Next step:** [Where we guide them]

### States

| State   | Trigger      | User Sees     | User Can Do |
| ------- | ------------ | ------------- | ----------- |
| Empty   | No items     | [Description] | [CTA]       |
| Loading | Fetching     | [Skeleton]    | Wait        |
| Ideal   | Items loaded | [Primary UI]  | [Actions]   |
| Error   | API failed   | [Message]     | [Retry]     |
```

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
M2: UX Planning - User Journeys and States Documented
```

---

## Stage 3: Copywriting

**Skill:** `copywriting`

**Purpose:** Generate all text content BEFORE UI design. Every word that appears in the app.

### Entry Criteria

- UX Planning complete (Stage 2)
- Screen states documented
- User journeys mapped

### Workflow

1. Analyze target audience and awareness stage
2. Generate copy for marketing pages (using frameworks from copywriting skill)
   - Headlines (H1, H2)
   - Subheadlines
   - Body copy
   - CTAs
   - Social proof

3. Generate copy for auth pages
   - Login/signup microcopy
   - Error messages
   - Success messages

4. Generate copy for app pages
   - Dashboard copy
   - Feature-specific copy
   - Empty state messages
   - Error messages
   - Success toasts

5. Provide 3 variations per key page
   - Fear/Loss-based
   - Desire/Gain-based
   - Status/Identity-based

### Copy Document Structure

```markdown
## Page: [Name]

### Headlines

| Element | Copy          |
| ------- | ------------- |
| H1      | [Headline]    |
| H2      | [Subheadline] |

### Body Copy

[Main body text]

### CTAs

| Button    | Copy   | Context      |
| --------- | ------ | ------------ |
| Primary   | [Copy] | [Where/when] |
| Secondary | [Copy] | [Where/when] |

### States

| State   | Copy                    |
| ------- | ----------------------- |
| Empty   | [Message + CTA]         |
| Loading | [Optional message]      |
| Error   | [Helpful error message] |
| Success | [Confirmation message]  |

### Microcopy

| Element      | Copy  |
| ------------ | ----- |
| Form labels  | [...] |
| Placeholders | [...] |
| Validation   | [...] |
```

### Exit Criteria

- [ ] Copy for all marketing pages
- [ ] Copy for auth pages
- [ ] Copy for app pages
- [ ] Empty state messages
- [ ] Error messages
- [ ] 3 variations per key page

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
M3: Copywriting - All Page Content Written
```

---

## Stage 4: Stitch Prompt Generation

**Skill:** `google-stitch-prompts-*` (select based on platform)

**Purpose:** Create UI prompts with copy embedded. These prompts will be used in Stage 5 to design in Stitch.

### Entry Criteria

- UX Planning complete (Stage 2)
- Copywriting complete (Stage 3)
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

### Workflow

1. Read the appropriate `google-stitch-prompts-*` skill
2. Create color scheme and CSS variables section
3. Create global style instructions
4. For each page, create:
   - **Stitch Design Prompt** - Detailed prompt with copy embedded
   - **Webcopy Reference** - Table mapping elements to copy
   - **State Requirements** - From UX planning (empty, loading, error, success)

### Output Structure

```markdown
# {Project Name} Google Stitch Design Prompts

## 1. Color Scheme & CSS Variables

[Full color scheme from PRP section 16]

## 2. Global Style Instructions

[Typography, spacing, components, icons]

## 3. Phase 1: Marketing & Auth

### 3.1 Landing Page (/)

#### Stitch Design Prompt

Design a landing page for [product]:

Hero Section:

- Headline: "[H1 copy from Stage 3]"
- Subheadline: "[H2 copy from Stage 3]"
- Primary CTA button: "[CTA copy]"
- Secondary CTA: "[Secondary CTA copy]"
  [... continue with all sections and copy embedded]

#### Webcopy Reference

| Element | Copy               |
| ------- | ------------------ |
| H1      | [From copywriting] |
| H2      | [From copywriting] |
| CTA     | [From copywriting] |

#### State Requirements

| State   | UI Treatment       |
| ------- | ------------------ |
| Loading | [From UX planning] |

---

[Repeat for each page]
```

### Exit Criteria

- [ ] Color scheme documented
- [ ] Global style instructions complete
- [ ] Every page has: Prompt + Webcopy Reference + State Requirements
- [ ] Copy from Stage 3 is embedded (not placeholders)
- [ ] States from Stage 2 are referenced

### Deliverables

```
docs/STITCH-DESIGN-PROMPTS.md
```

### Milestone Commit

```
M4: Stitch Prompts - Design Prompts with Copy Embedded
```

---

## Stage 5: Stitch Design Phase

**Skill:** `google-stitch-base`

**Purpose:** Design all screens in Google Stitch using the prompts from Stage 4. Get visual sign-off from stakeholders.

### Entry Criteria

- Stitch Prompts complete (Stage 4)
- Stitch project created (from Stage 1)

### Workflow

1. **Open Stitch project**

   ```
   # In Claude Code:
   mcp__stitch__get_project({ name: "projects/<id>" })
   ```

2. **Create each screen using prompts**
   - Copy prompts from `docs/STITCH-DESIGN-PROMPTS.md`
   - Use `mcp__stitch__generate_screen_from_text()` for each screen
   - Include all copy exactly as specified
   - Ensure all states are represented

3. **Iterate with stakeholders**
   - Share Stitch project for review
   - Make visual adjustments based on feedback

4. **Get visual sign-off**
   - Confirm all screens represent final visual direction
   - Record sign-off date in PRP

5. **Export screens list**
   ```bash
   # In Claude Code:
   mcp__stitch__list_screens({ projectId: "projects/<id>" })
   # Save response to screens.json
   ```

### Screen Design Checklist

For each screen, verify:

- [ ] All copy from Stage 3 is present
- [ ] All states from Stage 2 are designed (empty, loading, error, success)
- [ ] Colors match design system
- [ ] Typography follows hierarchy
- [ ] Interactive elements are clear
- [ ] Responsive considerations noted

### Exit Criteria

- [ ] All screens designed in Stitch
- [ ] Stakeholder visual sign-off obtained
- [ ] Sign-off date recorded in PRP
- [ ] Screens exported (list available)
- [ ] Stitch project ID confirmed in PRP

### Deliverables

```
Stitch Project (in Google Stitch)
screens.json (screen list export)
.ai-coder/prps/{project}.md (updated with sign-off date)
```

### Milestone Commit

```
M5: Stitch Design - Visual Sign-off Complete
```

---

## Stage 6: Data Model Extraction

**Purpose:** Analyze Stitch designs and extract data requirements.

### Entry Criteria

- Stitch designs complete with sign-off (Stage 5)
- All screens available in Stitch

### Workflow

1. **Get screen details from Stitch**

   ```bash
   # For each screen, get HTML:
   mcp__stitch__get_screen({ projectId: "<id>", screenId: "<screenId>" })
   ```

2. **Extract data model from designs**

   ```bash
   npm run stitch:extract -- --dir stitch-exports/ --output schema-suggestion.json
   ```

3. **Review extracted schema**
   - Verify entities and relationships
   - Adjust field types if needed
   - Add missing relationships

4. **Generate Supabase migration**

   ```bash
   npm run stitch:schema -- --input schema-suggestion.json --output supabase/migrations/001_from_design.sql
   ```

5. **Update PRP with finalized data model**
   - Fill in section 8 (Data Model)
   - Fill in section 9 (API Design)

### What Gets Extracted

| UI Element              | Extracted As           |
| ----------------------- | ---------------------- |
| Form inputs             | Entity fields + types  |
| `<input type="email">`  | `email: string`        |
| `<input type="number">` | `field: number`        |
| Tables/Lists            | Entities from headers  |
| Cards with data         | Entity fields          |
| Select options          | Enum values            |
| "Add/Create" buttons    | POST endpoints         |
| "Delete" buttons        | DELETE endpoints       |
| "Save/Update" buttons   | PUT/PATCH endpoints    |
| Repeated cards          | has_many relationships |

### Example Extraction

**Input (Sign-up form):**

```html
<form>
  <input name="email" type="email" required />
  <input name="password" type="password" required />
  <input name="full_name" type="text" />
  <select name="role">
    <option>Admin</option>
    <option>User</option>
    <option>Viewer</option>
  </select>
  <button type="submit">Create Account</button>
</form>
```

**Output (schema-suggestion.json):**

```json
{
  "entities": [
    {
      "name": "users",
      "fields": [
        { "name": "id", "type": "uuid", "required": true },
        { "name": "email", "type": "string", "required": true },
        { "name": "full_name", "type": "string", "required": false },
        {
          "name": "role",
          "type": "enum",
          "enumValues": ["Admin", "User", "Viewer"]
        }
      ],
      "source_screens": ["sign-up"]
    }
  ],
  "api_endpoints": [
    { "method": "POST", "path": "/api/auth/signup", "source": "sign-up form" }
  ]
}
```

### Exit Criteria

- [ ] Data model extracted from all screens
- [ ] Schema reviewed and adjusted
- [ ] Supabase migration generated
- [ ] PRP section 8 (Data Model) complete
- [ ] PRP section 9 (API Design) complete

### Deliverables

```
schema-suggestion.json
supabase/migrations/001_from_design.sql
.ai-coder/prps/{project}.md (sections 8-9 complete)
```

### Milestone Commit

```
M6: Data Model - Schema Extracted from Designs
```

---

## Stage 7: Backend Foundation

**Skill:** `dna-layer` + platform auth skill

**Purpose:** Build fully functional backend from extracted schema.

### Entry Criteria

- Data model extracted (Stage 6)
- Supabase migration generated
- PRP sections 8-9 complete

### Platform Stack Matrix

| Platform           | Skills                             | Backend Stack            |
| ------------------ | ---------------------------------- | ------------------------ |
| Web (Next.js/Vite) | dna-layer, supabase-auth           | Supabase + API routes    |
| Mobile (Expo)      | dna-layer, supabase-auth           | Supabase + Vercel API    |
| Telegram           | dna-layer, supabase-edge-functions | Edge Functions           |
| Discord            | dna-layer, supabase-edge-functions | Express + Edge Functions |

### Workflow

1. Apply database migration
   ```bash
   npx supabase db push
   ```
2. Set up RLS policies
3. Create API routes from PRP section 9
4. Configure auth (platform-specific)
5. Set up webhook handlers
6. Run tests

### Exit Criteria

- [ ] All tables created with RLS
- [ ] Auth flows working
- [ ] API endpoints responding
- [ ] Webhooks configured (if needed)
- [ ] Database migrations committed

### Deliverables

```
supabase/migrations/*.sql
app/api/** or supabase/functions/**
lib/supabase/
```

### Milestone Commit

```
M7: Backend Foundation - Schema, Auth, APIs
```

---

## Stage 8: Integration Scaffold

**Purpose:** Generate integration layer from database schema.

### Entry Criteria

- Backend complete (Stage 7)
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

2. **Generate Hooks** (per entity)
   - `use{Entity}s()` - List all
   - `use{Entity}(id)` - Get one
   - `useCreate{Entity}()` - Create mutation
   - `useUpdate{Entity}()` - Update mutation
   - `useDelete{Entity}()` - Delete mutation

3. **Generate Actions** (per entity)
   - `get{Entity}s()` - Server action to list
   - `get{Entity}(id)` - Server action to get one
   - `create{Entity}(formData)` - Server action to create
   - `update{Entity}(id, formData)` - Server action to update
   - `delete{Entity}(id)` - Server action to delete

### Running Generator

```bash
npm run workflow:generate
```

### Exit Criteria

- [ ] Types generated from Supabase
- [ ] Hook for each entity
- [ ] Actions for each entity (CRUD)
- [ ] Working auth pages (minimal UI)

### Deliverables

```
lib/hooks/use-*.ts
lib/actions/*-actions.ts
types/database.ts
app/(auth)/**/page.tsx (working, minimal)
```

### Milestone Commit

```
M8: Integration Scaffold - Hooks, Actions, Types Generated
```

---

## Stage 9: Stitch → Code Conversion

**Purpose:** Batch convert all Stitch designs to framework pages with 1:1 fidelity.

### Entry Criteria

- All screens designed in Stitch (Stage 5)
- Integration scaffold complete (Stage 8)

### Workflow

1. **Get screens list from Stitch**

   ```bash
   # In Claude Code:
   mcp__stitch__list_screens({ projectId: "projects/<id>" })
   # Save to screens.json
   ```

2. **Batch convert all screens**

   ```bash
   npm run stitch:batch -- --screens screens.json --output ./app --project myapp --skip-no-html
   ```

3. **Review manifest**
   Check `./app/manifest.json` for conversion results.

### Output Structure

```
./app/
├── page.tsx              (home/landing/index screens)
├── dashboard/
│   └── page.tsx
├── auth/
│   ├── sign-in/
│   │   └── page.tsx
│   └── sign-up/
│       └── page.tsx
├── profile/
│   └── page.tsx
└── manifest.json         (conversion results)
```

### Route Mapping

| Screen Title         | Output Path                 |
| -------------------- | --------------------------- |
| Home, Landing, Index | `app/page.tsx`              |
| Dashboard            | `app/dashboard/page.tsx`    |
| Sign In, Login       | `app/auth/sign-in/page.tsx` |
| Sign Up, Register    | `app/auth/sign-up/page.tsx` |
| Profile              | `app/profile/page.tsx`      |
| Settings             | `app/settings/page.tsx`     |
| Other                | `app/{slug}/page.tsx`       |

### Exit Criteria

- [ ] All screens converted
- [ ] manifest.json shows all success
- [ ] Pages render without errors
- [ ] Build passes

### Deliverables

```
app/**/page.tsx (all pages)
app/manifest.json (conversion results)
```

### Milestone Commit

```
M9: Stitch Conversion - All Screens Converted
```

---

## Stage 10: Wiring

**Skill:** `face-layer` (or platform equivalent)

**Purpose:** Connect converted Stitch UI to hooks and actions.

### Workflow

For each converted page:

1. **Replace hardcoded data with hooks**

   ```typescript
   // Before (hardcoded from Stitch)
   const users = [{ name: "John" }, { name: "Jane" }];

   // After (hooked to real data)
   const { data: users, isLoading } = useUsers();
   ```

2. **Add 'use client' directive**

   ```typescript
   "use client";
   // ... component with hooks
   ```

3. **Add event handlers**

   ```typescript
   const { mutate: createUser } = useCreateUser();

   <button onClick={() => createUser(formData)}>Create</button>
   ```

4. **Add loading/error states** (from UX planning Stage 2)

   ```typescript
   if (isLoading) return <Skeleton />;
   if (error) return <ErrorState error={error} onRetry={refetch} />;
   ```

5. **Wire forms to server actions**

   ```typescript
   <form action={createUser}>
     <input name="email" />
     <button type="submit">Create</button>
   </form>
   ```

6. **Run feature audit per page**
   ```bash
   /audit PageName --fix
   ```

### Wiring Checklist Per Page

| Task                 | Description                                |
| -------------------- | ------------------------------------------ |
| Import hooks         | Add `import { useX } from '@/hooks/use-x'` |
| Replace static data  | Swap hardcoded arrays with hook data       |
| Add 'use client'     | Add directive if using hooks               |
| Connect forms        | Bind form actions to server actions        |
| Add loading state    | Implement loading UI from Stage 2          |
| Add error state      | Implement error UI from Stage 2            |
| Add empty state      | Implement empty UI from Stage 2            |
| Add success feedback | Toast on successful actions                |

### Exit Criteria

- [ ] All pages connected to real data
- [ ] Event handlers connected to actions
- [ ] All states implemented (loading, error, empty, success)
- [ ] Feature audit passes per page

### Milestone Commit

```
M10: Wiring Complete - All Pages Connected to Backend
```

---

## Stage 11: Final Integration Audit

**Skills:** `quality-gates`, `sandbox-runner`

**Purpose:** Verify cross-page integration using cloud sandboxes for isolated testing.

### Verification Checks

- [ ] All routes accessible (no 404s)
- [ ] Auth state persists across app
- [ ] Shared components consistent
- [ ] Data updates reflect across pages
- [ ] No regressions

### Workflow

```bash
# Run build in E2B cloud sandbox (isolated, consistent environment)
npm run sandbox:build

# If sandbox not configured, fall back to local:
# npm run build

# Navigate full flow (manual or E2E)
# Landing → Sign up → Dashboard → Features → Settings → Logout

# Code review
coderabbit review --plain
```

### Why Cloud Sandbox?

- **Isolated environment** - Can't break local setup
- **Consistent Node.js version** - Same as production
- **Parallel testing** - Run multiple checks simultaneously
- **Clean state** - No stale dependencies

### Milestone Commit

```
M11: Integration Verified - Full App Working
```

---

## Stage 12: Quality Gates

**Skills:** `quality-gates`, `feature-audit`, `sandbox-runner`

**Purpose:** Ensure production readiness using cloud sandboxes for all quality checks.

### Prerequisites

```bash
# Ensure E2B API key is set
export E2B_API_KEY=your_key_here

# Check sandbox configuration
npm run sandbox:status
```

### Gate Sequence (Cloud Sandbox)

1. **Feature Audit** (Mandatory)

   ```bash
   /audit --critical
   # Must pass: 0 critical, 0 high, ≥95% functional
   ```

2. **Run All Gates in E2B Sandbox**

   ```bash
   # Runs typecheck + lint + build + test in isolated cloud environment
   npm run sandbox:all
   ```

   This single command runs:
   - TypeScript check (`sandbox:typecheck`)
   - ESLint (`sandbox:lint`)
   - Build (`sandbox:build`)
   - Tests (`sandbox:test`)

3. **E2E Tests** (if configured)

   ```bash
   # Uses z-thread-e2e-v1 template with Chromium
   SANDBOX_TEMPLATE=z-thread-e2e-v1 npm run sandbox:test
   ```

4. **Lighthouse** (local or CI)
   - Performance > 90
   - Accessibility > 90
   - Best Practices > 90
   - SEO > 90

### Fallback (Local)

If E2B is not configured:

```bash
npx tsc --noEmit
npx eslint . --fix
npm run build
npm run test
npm run test:e2e
```

### Exit Criteria

- [ ] Feature audit passes
- [ ] `sandbox:all` passes (or local equivalents)
- [ ] E2E tests pass
- [ ] Lighthouse scores met

### Milestone Commit

```
M12: Production Release - Quality Gates Passed
```

---

## Stage 13: Agent Handoff

**Command:** `/handoff`

**Purpose:** Generate Claude agent scaffolding for the project.

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

1. Gather context from PRP
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
M13: Agent Handoff Complete - Claude Scaffolding Generated
```

---

## Quick Reference

### Workflow Commands

```bash
# Stage 6: Extract data model from Stitch HTML
npm run stitch:extract -- --dir stitch-exports/ --output schema-suggestion.json

# Stage 6: Generate Supabase migration from extracted schema
npm run stitch:schema -- --input schema-suggestion.json --output supabase/migrations/001_from_design.sql

# Stage 8: Generate integration layer
npm run workflow:generate

# Stage 9: Batch convert all Stitch screens
npm run stitch:batch -- --screens screens.json --output ./app --project myapp

# Stage 9: Single screen conversion
npm run stitch:convert -- --url <downloadUrl> --output app/page.tsx
```

### Trigger Phrases

- "Design-first workflow"
- "Stitch workflow"
- "I want to design in Stitch first"
- "Visual-first approach"
- "Let's design before building"
- "Start with the UI"

### Milestone Commit Pattern

```
M{N}: {Stage Name} - {Description}

- Bullet point 1
- Bullet point 2

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

---

## Checklist: Design-First Workflow

- [ ] Stage 1: Light PRP created (business requirements)
- [ ] Stage 2: UX Planning complete (journeys, states)
- [ ] Stage 3: Copywriting complete (all text content)
- [ ] Stage 4: Stitch Prompts generated (with copy embedded)
- [ ] Stage 5: Stitch designs complete, stakeholder sign-off
- [ ] Stage 6: Data model extracted from designs
- [ ] Stage 7: Backend functional
- [ ] Stage 8: Integration layer generated
- [ ] Stage 9: Stitch screens converted to pages
- [ ] Stage 10: All pages wired to backend
- [ ] Stage 11: Cross-page verified
- [ ] Stage 12: Quality gates passed
- [ ] Stage 13: Agent handoff complete

---

## References

| Document                               | Purpose                                         |
| -------------------------------------- | ----------------------------------------------- |
| `references/stitch-native-stack.md`    | Stitch design principles and component mappings |
| `references/feature-fidelity-gate.md`  | Feature omission prevention system              |
| `references/developer-handoff-spec.md` | Technical bridge template for Stitch → Code     |
| `references/platform-variations.md`    | Platform-specific adjustments                   |

### Related Skills

| Skill                                            | Used In Stage |
| ------------------------------------------------ | ------------- |
| `meta-tools`                                     | Stage 1 (PRP) |
| `ux-planning`                                    | Stage 2       |
| `copywriting`                                    | Stage 3       |
| `google-stitch-prompts-*`                        | Stage 4       |
| `google-stitch-base`                             | Stage 5       |
| `dna-layer`                                      | Stage 7       |
| `supabase-auth`                                  | Stage 7       |
| `face-layer` / `vite-frontend` / `expo-supabase` | Stage 10      |
| `quality-gates`                                  | Stage 11, 12  |
| `feature-audit`                                  | Stage 12      |
| `sandbox-runner`                                 | Stage 11, 12  |

### Environment Variables

For cloud sandbox testing (Stage 11-12):

| Variable           | Required | Description                              |
| ------------------ | -------- | ---------------------------------------- |
| `E2B_API_KEY`      | Yes      | E2B API key for cloud sandboxes          |
| `SANDBOX_TIMEOUT`  | No       | Timeout in ms (default: 300000 / 5 min)  |
| `SANDBOX_TEMPLATE` | No       | E2B template (default: z-thread-node-v1) |

For E2E testing:

| Variable           | Value              | Description          |
| ------------------ | ------------------ | -------------------- |
| `SANDBOX_TEMPLATE` | `z-thread-e2e-v1`  | Template with Chrome |

---

## Hook Enforcement

The stitch-workflow uses hooks to enforce sandbox testing during Stage 11-12:

### Sandbox Testing Validator Hook

**File:** `.claude/hooks/sandbox-testing-validator.ts`

**Trigger:** Bash tool invocations

**Purpose:** Blocks local testing commands (`npm run test`, `npm run build`, etc.) during quality gate stages and enforces use of `npm run sandbox:*` commands.

### What Gets Blocked

When `stitch-workflow` or `sandbox-runner` skills are read AND `E2B_API_KEY` is set:

| Local Command             | Blocked? | Use Instead                 |
| ------------------------- | -------- | --------------------------- |
| `npm run test`            | Yes      | `npm run sandbox:test`      |
| `npm run build`           | Yes      | `npm run sandbox:build`     |
| `npm run lint`            | Yes      | `npm run sandbox:lint`      |
| `npx tsc --noEmit`        | Yes      | `npm run sandbox:typecheck` |
| `npm run sandbox:*`       | No       | (Already correct)           |

### Bypass Options

```bash
# Disable sandbox enforcement
SKIP_SANDBOX_ENFORCEMENT=true

# Relaxed mode (warns but doesn't block)
SANDBOX_ENFORCEMENT_MODE=relaxed
```

### Activation Conditions

The hook enforces sandbox testing when:
1. `stitch-workflow` skill has been read in the session
2. OR `sandbox-runner` skill has been read
3. OR `quality-gates` skill has been read
4. AND `E2B_API_KEY` environment variable is set

If `E2B_API_KEY` is not set, the hook warns but allows local testing.

### State Tracking

Sandbox runs are tracked in `.claude/hooks/sandbox-state.json`:

```json
{
  "last_run": "2026-01-31T...",
  "command": "npm run sandbox:all",
  "success": true,
  "total_runs": 5,
  "successful_runs": 4,
  "failed_runs": 1
}
```

---

## Why Design-First?

### Advantages

- **Complete UX before any visuals** - User journeys and states planned first
- **Copy-driven design** - Real words, not lorem ipsum
- **Stitch drives the product vision** - Design leads, engineering follows
- **Stakeholders see the product before engineering** - Early buy-in, fewer pivots
- **Backend is built to serve the actual UI** - No theoretical requirements
- **Data model reflects real needs** - Extracted from actual designs

### The Flow

```
Business Requirements → UX Planning → Copywriting → Design Prompts →
Stitch Designs → Data Extraction → Backend → Code → Wire → Ship
```

### Best For

- Consumer-facing products
- Marketing sites
- UI-heavy applications
- Projects where visual design is the primary differentiator
- Teams with strong design input
- Products needing stakeholder approval before engineering
