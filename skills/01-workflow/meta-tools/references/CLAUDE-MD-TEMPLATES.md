# CLAUDE.md Templates

Agent-invokable structures for CLAUDE.md files. Designed for skill selection and execution.

## Core Principles

| Principle | Description |
|-----------|-------------|
| **Explicit Trigger Mapping** | Define clear patterns, not fuzzy matching |
| **Read-Before-Execute** | Always read SKILL.md before executing |
| **Skill Composition** | Define how skills chain together |
| **Single Source of Truth** | Skills = "how", CLAUDE.md = "when" |

---

## Template 1: Project CLAUDE.md

For individual projects (SaaS apps, dashboards, mobile apps).

```markdown
# {Project Name}

## Identity

{Role definition and core purpose in 1-2 sentences.}

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | {Next.js 15 / Vite / Expo} |
| Backend | {Supabase / Custom API} |
| Auth | {Supabase Auth} |
| Payments | {Stripe} |

## Available Skills

<skills>
- **face-layer**: Next.js frontend patterns → `skills/face-layer/SKILL.md`
- **dna-layer**: Backend services (Supabase, Stripe) → `skills/dna-layer/SKILL.md`
- **supabase-auth**: Authentication patterns → `skills/supabase-auth/SKILL.md`
- **quality-gates**: Testing and code review → `skills/quality-gates/SKILL.md`
</skills>

## Skill Selection Rules

<skill_triggers>
| User Intent Pattern | Skill to Invoke | Priority |
|---------------------|-----------------|----------|
| "create page", "build UI", "add component" | face-layer | 1 |
| "database", "API", "payments" | dna-layer | 1 |
| "auth", "login", "signup", "RLS" | supabase-auth | 1 |
| "test", "review", "commit" | quality-gates | 1 |
</skill_triggers>

## Workflow Protocol

1. **Parse intent** → Identify which skill(s) apply
2. **Read SKILL.md** → Always read the skill file BEFORE executing
3. **Execute** → Follow skill instructions precisely
4. **Validate** → Confirm output meets skill requirements

## Skill Chaining Rules

When multiple skills apply:
- Read ALL relevant SKILL.md files first
- Execute in dependency order (e.g., dna-layer → face-layer)
- Pass outputs between skills as specified

## Project Structure

```
{project}/
├── app/                  # Pages/routes
├── components/           # UI components
├── lib/                  # Utilities
└── ...
```

## Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
STRIPE_SECRET_KEY=
```

## Commands

```bash
npm run dev      # Start development
npm run build    # Production build
npm run test     # Run tests
```

## Constraints

- Never skip reading SKILL.md files
- Never hallucinate skill capabilities - check the file
- Ask for clarification if intent maps to 0 skills
- Run quality-gates before commits
```

---

## Template 2: Framework CLAUDE.md

For ai-coder itself (skills framework).

```markdown
# {Framework Name}

## Identity

{Role definition: what this framework does and its core purpose.}

## Available Skills

<skills>
### Frontend
- **face-layer**: Next.js 15 + shadcn → `skills/face-layer/SKILL.md`
- **vite-frontend**: Vite + React SPAs → `skills/vite-frontend/SKILL.md`
- **expo-supabase**: Mobile apps → `skills/expo-supabase/SKILL.md`

### Backend
- **dna-layer**: Supabase, Stripe, services → `skills/dna-layer/SKILL.md`
- **supabase-auth**: Authentication → `skills/supabase-auth/SKILL.md`

### AI
- **head-layer**: Vercel AI SDK → `skills/head-layer/SKILL.md`
- **agentic-prompts**: Prompt engineering → `skills/agentic-prompts/SKILL.md`

### Quality
- **quality-gates**: Testing, review → `skills/quality-gates/SKILL.md`
- **meta-tools**: PRPs, templates → `skills/meta-tools/SKILL.md`
</skills>

## Skill Selection Rules

<skill_triggers>
| User Intent Pattern | Skill to Invoke | Priority |
|---------------------|-----------------|----------|
| "Next.js", "marketing site", "SSR" | face-layer | 1 |
| "Vite", "dashboard", "SPA" | vite-frontend | 1 |
| "mobile", "iOS", "Android", "Expo" | expo-supabase | 1 |
| "database", "Supabase", "Stripe" | dna-layer | 1 |
| "auth", "login", "RLS" | supabase-auth | 1 |
| "AI", "LLM", "chat", "RAG" | head-layer | 1 |
| "prompt", "agent" | agentic-prompts | 1 |
| "test", "review", "commit" | quality-gates | 1 |
| "PRP", "template", "new project" | meta-tools | 1 |
</skill_triggers>

## Workflow Protocol

1. **Parse intent** → Identify which skill(s) apply
2. **Read SKILL.md** → Always read the skill file BEFORE executing
3. **Execute** → Follow skill instructions precisely
4. **Validate** → Confirm output meets skill requirements

## Skill Chaining Rules

Common chains:
- **New feature**: dna-layer (schema) → face-layer (UI) → quality-gates (test)
- **AI feature**: head-layer (API) → face-layer (chat UI)
- **Auth flow**: supabase-auth → dna-layer (RLS) → face-layer (UI)

## Constraints

- Never skip reading SKILL.md files
- Never hallucinate skill capabilities - check the file
- Ask for clarification if intent maps to 0 skills
```

---

## Template 3: Minimal Project CLAUDE.md

For simple projects with few skills.

```markdown
# {Project Name}

## Identity

{One sentence: what this project is.}

## Available Skills

<skills>
- **{skill-1}**: {Description} → `skills/{skill-1}/SKILL.md`
- **{skill-2}**: {Description} → `skills/{skill-2}/SKILL.md`
</skills>

## Skill Selection Rules

<skill_triggers>
| User Intent | Skill | Priority |
|-------------|-------|----------|
| "{pattern}" | {skill} | 1 |
</skill_triggers>

## Workflow Protocol

1. **Parse intent** → Identify skill
2. **Read SKILL.md** → Before executing
3. **Execute** → Follow instructions
4. **Validate** → Confirm output

## Constraints

- Always read SKILL.md before executing
- Ask for clarification if no skill matches
```

---

## Project-Specific Skill Sets

Different project types need different skills:

### SaaS Web App
```markdown
<skills>
- **face-layer**: Next.js frontend → `skills/face-layer/SKILL.md`
- **dna-layer**: Backend services → `skills/dna-layer/SKILL.md`
- **supabase-auth**: Authentication → `skills/supabase-auth/SKILL.md`
- **quality-gates**: Testing → `skills/quality-gates/SKILL.md`
</skills>
```

### Mobile App
```markdown
<skills>
- **expo-supabase**: Mobile development → `skills/expo-supabase/SKILL.md`
- **dna-layer**: Backend services → `skills/dna-layer/SKILL.md`
- **quality-gates**: Testing → `skills/quality-gates/SKILL.md`
</skills>
```

### AI Assistant
```markdown
<skills>
- **head-layer**: AI/LLM integration → `skills/head-layer/SKILL.md`
- **agentic-prompts**: Prompt design → `skills/agentic-prompts/SKILL.md`
- **face-layer**: Chat UI → `skills/face-layer/SKILL.md`
- **dna-layer**: Backend → `skills/dna-layer/SKILL.md`
</skills>
```

### Dashboard/Admin Panel
```markdown
<skills>
- **vite-frontend**: Vite + React → `skills/vite-frontend/SKILL.md`
- **dna-layer**: Backend services → `skills/dna-layer/SKILL.md`
- **quality-gates**: Testing → `skills/quality-gates/SKILL.md`
</skills>
```

### Marketing Site
```markdown
<skills>
- **face-layer**: Next.js frontend → `skills/face-layer/SKILL.md`
- **google-stitch-prompts-nextjs**: Design conversion → `skills/google-stitch-prompts-nextjs/SKILL.md`
- **quality-gates**: Testing → `skills/quality-gates/SKILL.md`
</skills>
```

---

## Checklist: Creating a Project CLAUDE.md

- [ ] Identity section (1-2 sentences)
- [ ] Available skills with paths to SKILL.md files
- [ ] Skill selection rules with trigger patterns
- [ ] Workflow protocol (parse → read → execute → validate)
- [ ] Skill chaining rules (if multiple skills)
- [ ] Constraints (never skip reading, never hallucinate)
- [ ] Project-specific sections (structure, env vars, commands)
