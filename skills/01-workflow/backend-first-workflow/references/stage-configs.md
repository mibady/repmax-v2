# Stage Configurations

Detailed configuration for each stage of the unified workflow.

---

## Stage 1: PRP Creation

### Configuration

```yaml
stage: 1
name: PRP Creation
skill: meta-tools
owner: claude
phases: [plan, build]

entry_criteria:
  - project_concept_defined
  - user_personas_identified
  - basic_requirements_known

exit_criteria:
  - all_17_sections_complete
  - pattern_selected
  - skills_mapped
  - design_system_defined
  - implementation_roadmap_drafted

deliverables:
  - path: ".ai-coder/prps/{project-name}.md"
    type: document
    template: PRP_TEMPLATE

milestone_commit: "M1: PRP Creation - {Project Name} Requirements Complete"
```

### PRP Sections Checklist

| Section | Content                     | Required |
| ------- | --------------------------- | -------- |
| 1       | Project Overview            | Yes      |
| 2       | Goals & Success Metrics     | Yes      |
| 3       | User Personas               | Yes      |
| 4       | User Stories                | Yes      |
| 5       | Functional Requirements     | Yes      |
| 6       | Non-Functional Requirements | Yes      |
| 7       | Technical Architecture      | Yes      |
| 8       | Data Model                  | Yes      |
| 9       | API Design                  | Yes      |
| 10      | UI/UX Requirements          | Yes      |
| 11      | Integration Points          | Yes      |
| 12      | Testing Strategy            | Yes      |
| 13      | Deployment Plan             | Yes      |
| 14      | Implementation Roadmap      | Yes      |
| 15      | Skills Assessment           | Yes      |
| 16      | Design System Foundation    | Yes      |
| 17      | Open Questions              | Optional |

---

## Stage 2: Backend Foundation

### Configuration

```yaml
stage: 2
name: Backend Foundation
skills:
  core: dna-layer
  auth:
    web: supabase-auth
    mobile: supabase-auth
    telegram: supabase-edge-functions
    discord: supabase-edge-functions
    chatgpt: optional
owner: claude
phases: [plan, build, review, test, deploy, learn]

entry_criteria:
  - prp_section_8_complete # Data Model
  - prp_section_9_complete # API Design

exit_criteria:
  - all_tables_created_with_rls
  - auth_flows_working
  - api_endpoints_responding
  - webhooks_configured
  - migrations_committed

deliverables:
  - path: "supabase/migrations/*.sql"
    type: migrations
  - path: "app/api/**"
    type: api_routes
    conditional: web
  - path: "supabase/functions/**"
    type: edge_functions
    conditional: telegram|discord
  - path: "lib/supabase/"
    type: client_setup

milestone_commit: "M2: Backend Foundation - Schema, Auth, APIs"
```

### Platform-Specific Backend

| Platform | Auth Method           | API Layer                |
| -------- | --------------------- | ------------------------ |
| Next.js  | Supabase JWT          | API Routes               |
| Vite SPA | Supabase JWT          | API Routes (Vercel)      |
| Expo     | Supabase JWT          | API Routes (Vercel)      |
| Telegram | initData verification | Edge Functions           |
| Discord  | OAuth token exchange  | Express + Edge Functions |
| ChatGPT  | Custom GPT Actions    | API Routes               |

---

## Stage 3: Integration Scaffold

### Configuration

```yaml
stage: 3
name: Integration Scaffold
skills:
  web_ssr: face-layer
  web_spa: vite-frontend
  mobile: expo-supabase
  telegram: telegram-miniapp
  discord: discord-activities
  chatgpt: chatgpt-app
owner: claude
phases: [plan, build, review, test, deploy, learn]

entry_criteria:
  - backend_complete
  - database_schema_finalized

exit_criteria:
  - types_generated_from_supabase
  - hook_per_entity
  - actions_per_entity
  - placeholder_pages_with_comments
  - auth_pages_working
  - app_shell_renders

deliverables:
  - path: "lib/hooks/use-*.ts"
    type: hooks
    generator: IntegrationLayerGenerator
  - path: "lib/actions/*-actions.ts"
    type: server_actions
    generator: IntegrationLayerGenerator
  - path: "types/database.ts"
    type: types
    command: "npx supabase gen types typescript --local"
  - path: "app/(app)/**/page.tsx"
    type: placeholder_pages
  - path: "app/(auth)/**/page.tsx"
    type: working_auth_pages

milestone_commit: "M3: Integration Scaffold - Hooks, Actions, Types Generated"
```

### Entity Detection Rules

```typescript
// Entities to generate hooks/actions for
const entityRules = {
  // Include tables that:
  include: [
    "has_user_id_column", // User-owned data
    "has_rls_policies", // Protected data
    "not_system_table", // Not profiles, subscriptions
  ],
  // Exclude:
  exclude: [
    "profiles", // Has dedicated use-user hook
    "subscriptions", // Handled by Stripe integration
    "audit_logs", // Read-only
  ],
  // Custom entity naming:
  naming: {
    user_projects: "Project", // Table → Entity
    team_members: "TeamMember",
  },
};
```

---

## Stage 4: Web Copy Generation

### Configuration

```yaml
stage: 4
name: Web Copy Generation
skill: copywriting
owner: claude
phases: [plan, build]

entry_criteria:
  - prp_section_3_complete # User Personas
  - prp_section_5_complete # Functional Requirements

exit_criteria:
  - marketing_pages_copy
  - auth_pages_copy
  - app_pages_copy
  - empty_states_documented
  - error_messages_documented
  - three_variations_per_key_page

deliverables:
  - path: ".ai-coder/copy/{project-name}/"
    type: copy_documents
    structure:
      - marketing/
      - auth/
      - app/
```

### Copy Requirements Matrix

| Page Type | H1  | Subheadline | Body           | CTAs                | Meta |
| --------- | --- | ----------- | -------------- | ------------------- | ---- |
| Landing   | Yes | Yes         | 3+ sections    | Primary + Secondary | Yes  |
| Pricing   | Yes | Yes         | Per tier       | Per tier            | Yes  |
| Features  | Yes | Yes         | Per feature    | Primary             | Yes  |
| Auth      | Yes | No          | Microcopy only | Primary             | No   |
| Dashboard | Yes | No          | Empty state    | Context-specific    | No   |

---

## Stage 5: Stitch Prompt Generation

### Configuration

```yaml
stage: 5
name: Stitch Prompt Generation
skills:
  nextjs: google-stitch-prompts-nextjs
  vite: google-stitch-prompts-vite
  expo: google-stitch-prompts-expo
  telegram: google-stitch-prompts-telegram
  discord: google-stitch-prompts-discord
  chatgpt: google-stitch-prompts-chatgpt
owner: claude
phases: [plan, build]

entry_criteria:
  - copy_complete
  - design_system_defined

exit_criteria:
  - color_scheme_documented
  - global_style_instructions
  - every_page_has_prompt_webcopy_integration
  - copy_embedded_not_placeholder
  - integration_snippets_reference_actual_code

deliverables:
  - path: "docs/STITCH-DESIGN-PROMPTS.md"
    type: stitch_prompts

milestone_commit: "M4: Handoff Ready - Backend Complete, Prompts Generated"
```

### Stitch Prompt Structure

````markdown
## {Section Number}. {Page Name} (/{route})

### Stitch Design Prompt

[Detailed prompt with embedded copy]

### Webcopy Reference

| Element | Copy          |
| ------- | ------------- |
| H1      | {Actual copy} |
| CTA     | {Actual copy} |

### Backend Integration

```typescript
// Data fetching
import { use{Entity}s } from '@/hooks/use-{entity}'

// Actions
import { create{Entity} } from '@/lib/actions/{entity}-actions'

// Types
import type { {Entity} } from '@/types/database'
```
````

````

---

## Stage 5.5: Handoff Documents

### Configuration

```yaml
stage: 5.5
name: Handoff Documents
owner: claude
phases: [build]

entry_criteria:
  - stages_1_through_5_complete

exit_criteria:
  - handoff_checklist_complete
  - functional_contract_complete
  - every_interactive_element_documented
  - handler_service_mappings_complete

deliverables:
  - path: "docs/HANDOFF-CHECKLIST.md"
    type: handoff_checklist
    template: HANDOFF_TEMPLATE
  - path: "docs/FUNCTIONAL-CONTRACT.md"
    type: functional_contract
    template: FUNCTIONAL_CONTRACT_TEMPLATE
````

---

## Stages 6-7: Frontend Build

### Configuration

```yaml
stage: "6-7"
name: Frontend Build & Integration
owner: frontend_team
phases: [build_wire_verify_loop]

entry_criteria:
  - handoff_documents_complete
  - stitch_prompts_ready

loop_per_page:
  - stitch: "Generate UI"
  - convert: "HTML to framework"
  - wire: "Connect hooks/actions"
  - audit: "/audit PageName --fix"
  - verify: "Quick test"
  - review: "CodeRabbit"
  - fix: "Address issues"

phase_gate:
  commands:
    - "npx tsc --noEmit"
    - "npx eslint src/app --fix"
    - "/audit --phase {N}"
    - "coderabbit review --staged --plain"

milestone_commits:
  - "M5.1: Phase 1 - Marketing Integration"
  - "M5.2: Phase 2 - Auth Integration"
  - "M5.{N}: Phase {N} - {Feature} Integration"
```

---

## Stage 7.5: Final Integration

### Configuration

```yaml
stage: 7.5
name: Final Integration Audit
owner: collaborative
phases: [review, test]

entry_criteria:
  - all_phase_milestones_committed

exit_criteria:
  - all_routes_accessible
  - auth_state_persists
  - shared_components_consistent
  - data_updates_reflect
  - no_regressions

verification_flow:
  - "npm run build"
  - "npm run start"
  - "Navigate: Marketing → Auth → Dashboard → Features → Settings"
  - "coderabbit review --plain"

milestone_commit: "M5.final: All Phases Integrated - Full App Working"
```

---

## Stage 8: Quality Gates

### Configuration

```yaml
stage: 8
name: Quality Gates
skills:
  - quality-gates
  - feature-audit
owner: collaborative
phases: [test, deploy]

entry_criteria:
  - cross_phase_audit_passes

gates_sequence:
  - name: feature_audit
    command: "/audit --critical"
    criteria:
      critical: 0
      high: 0
      functional_rate: ">=95%"
  - name: typescript
    command: "npx tsc --noEmit"
  - name: eslint
    command: "npx eslint . --fix"
  - name: build
    command: "npm run build"
  - name: unit_tests
    command: "npm run test"
  - name: e2e_tests
    command: "npm run test:e2e"
  - name: lighthouse
    criteria:
      performance: ">90"
      accessibility: ">90"
      best_practices: ">90"
      seo: ">90"

milestone_commit: "M6: Production Release - Quality Gates Passed"
```

---

## Stage 9: Agent Handoff

### Configuration

```yaml
stage: 9
name: Agent Handoff
command: "/handoff"
owner: collaborative
phases: [build]

entry_criteria:
  - all_quality_gates_passed

deliverables:
  - path: "CLAUDE.md"
    type: project_instructions
  - path: ".claude/commands/"
    type: custom_commands
    files:
      - dev.md
      - test.md
      - deploy.md
      - status.md
      - db.md
  - path: ".claude/settings.json"
    type: mcp_plugins
  - path: "docs/ARCHITECTURE.md"
    type: architecture_docs
    conditional: not_exists

plugin_detection:
  supabase: "@supabase/* dependencies OR SUPABASE_* env vars"
  stripe: "stripe dependency OR STRIPE_* env vars"
  playwright: "@playwright/* dependency"
  context7: "always included"

milestone_commit: "M7: Agent Handoff Complete - Claude Scaffolding Generated"
```

---

## Stage State Machine

```typescript
type StageState = "not_started" | "in_progress" | "blocked" | "completed";

interface StageTransition {
  from: number;
  to: number;
  gate: () => Promise<boolean>;
  onFailure: string;
}

const transitions: StageTransition[] = [
  {
    from: 1,
    to: 2,
    gate: async () => await validatePRP(),
    onFailure: "PRP validation failed. Check 17 sections.",
  },
  {
    from: 2,
    to: 3,
    gate: async () => await checkBackend(),
    onFailure: "Backend not ready. Check database and APIs.",
  },
  {
    from: 3,
    to: 4,
    gate: async () => await checkScaffold(),
    onFailure: "Scaffold incomplete. Check hooks and actions.",
  },
  // ... more transitions
];
```
