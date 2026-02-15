---
name: meta-tools
description: Tools for skill creation, PRPs, template selection, and project planning.
---

# Meta Tools

Tools for creating skills, PRPs, and managing projects.

## When to Use

- Creating new skills
- Writing Product Requirement Prompts (PRPs)
- Selecting project templates
- Analyzing existing codebases
- Planning new projects

## Stack

| Component         | Purpose                           |
| ----------------- | --------------------------------- |
| Skill Creator     | Build new skills                  |
| PRP Creator       | Generate requirement prompts      |
| Template Selector | Choose from 20+ project templates |
| Code Analyzer     | Understand codebases              |

## References

| Document                                    | Purpose                                          |
| ------------------------------------------- | ------------------------------------------------ |
| **`unified-workflow` skill**                | **THE source of truth for 9-stage project workflow** |
| `references/HANDOFF-TEMPLATE.md`            | Template for backend→frontend handoff document   |
| `references/PROJECT-CLAUDE-TEMPLATE.md`     | CLAUDE.md template for project agent handoff     |
| `references/PROJECT-COMMANDS-TEMPLATE.md`   | Standard commands template for projects          |
| `references/MCP-PLUGINS-TEMPLATE.md`        | MCP plugin detection and configuration           |
| `references/STITCH-INTEGRATION-LOOP.md`     | Ralph Loop template for batch Stitch integration |
| `references/AI-CODER-FRAMEWORK.md`          | 5 patterns, 3-layer architecture, standards      |
| `references/AI-AGENT-GUARDRAILS.md`         | Safety, context, error handling                  |
| `references/CLI-COMMANDS-REFERENCE.md`      | All CLI commands                                 |
| `references/new-project-template.md`        | Start new projects                               |
| `references/continue-development.md`        | Resume work                                      |
| `references/fix-bugs.md`                    | Debugging workflow                               |
| `references/import-existing-project.md`     | Onboard existing code                            |
| `references/MILESTONE-CONVENTION.md`        | Naming, checkpoints                              |
| `references/PATTERN-04-DEEP-DIVE.md`        | MCP wrapper details                              |

> **Note:** The 9-stage workflow documentation has been consolidated into the `unified-workflow` skill.
> Read `skills/unified-workflow/SKILL.md` for complete stage definitions, integration layer generation, and validation gates.

## Components

| Tool              | Purpose                              |
| ----------------- | ------------------------------------ |
| Skill Creator     | Build new skills                     |
| PRP Creator       | Generate Product Requirement Prompts |
| Template Selector | Choose from 20+ project templates    |
| Code Analyzer     | Understand codebases                 |

---

## Skill Creation

### Skill Structure

```
my-skill/
├── SKILL.md           # Main skill file (required)
├── LICENSE.txt        # License (optional)
├── references/        # Supporting docs (optional)
│   └── details.md
└── scripts/           # Automation (optional)
    └── helper.py
```

### SKILL.md Template

```markdown
---
name: skill-name
description: One-line description. Use when [trigger conditions].
---

# Skill Title

Brief overview of what this skill does.

## When to Use

- Trigger condition 1
- Trigger condition 2

## Core Concepts

### Concept 1

Explanation with code examples.

### Concept 2

More explanation.

## Patterns

### Pattern Name

\`\`\`typescript
// Code example
\`\`\`

## Checklist

- [ ] Item 1
- [ ] Item 2
```

### Packaging

```bash
# Validate
python3 /mnt/skills/examples/skill-creator/scripts/quick_validate.py ./my-skill

# Package
python3 /mnt/skills/examples/skill-creator/scripts/package_skill.py ./my-skill ./output/
```

### Best Practices

- **Focused**: One domain per skill
- **Actionable**: Include code examples
- **Trigger-aware**: Clear "when to use" conditions
- **Self-contained**: All info in skill files
- **Versioned**: Include version in description

---

## PRP Creation

### PRP Structure (17 Sections)

```markdown
# Product Requirement Prompt (PRP)

## 1. Project Overview

- Name, description, pattern (01-05)

## 2. Goals & Success Metrics

- Primary goals, KPIs

## 3. User Personas

- Target users, needs

## 4. User Stories

- As a [role], I want [feature], so that [benefit]

## 5. Functional Requirements

- Core features, must-haves

## 6. Non-Functional Requirements

- Performance, security, scalability

## 7. Technical Architecture

- 3-layer mapping (Face/Head/DNA)
- Technology choices

## 8. Data Model

- Entities, relationships

## 9. API Design

- Endpoints, authentication

## 10. UI/UX Requirements

Reference: `ux-planning/references/PRP-UX-SECTION.md`

Before implementation, complete:

- [ ] 10.1 User Journeys (JTBD for each feature)
- [ ] 10.2 Visual System Decisions (spacing, tokens)
- [ ] 10.3 Component Hierarchy (button emphasis)
- [ ] 10.4 Component States (loading, error, disabled)
- [ ] 10.5 Screen States (empty, loading, error, ideal)
- [ ] 10.6 Form UX (if applicable)
- [ ] 10.7 AI/Chat UX (if applicable)
- [ ] 10.8 Navigation & Wayfinding
- [ ] 10.9 Error Handling & Recovery
- [ ] 10.10 UX Decisions Checklist

## 11. Integration Points

- External services (Supabase, Stripe, etc.)

## 12. Testing Strategy

- Unit, integration, E2E

## 13. Deployment Plan

- Environment, CI/CD

## 14. Implementation Roadmap

- 7-phase development structure (see below)

## 15. Skills Assessment

- Project type, pattern, skills map

## 16. Design System Foundation

- Colors, typography, global Stitch instructions

## 17. Open Questions

- Decisions needed
```

### Pattern Selection

| Pattern         | Use When                  | Complexity |
| --------------- | ------------------------- | ---------- |
| 01: Ad Hoc      | Quick one-off tasks       | None       |
| 02: Reusable    | Repeated tasks            | Low        |
| 03: Subagent   | Specialized AI task       | Medium     |
| 04: MCP Wrapper | Multi-service integration | High       |
| 05: Full App    | Production application    | Very High  |

### 3-Layer Mapping

```
FACE (Frontend)
├── Framework: Next.js 15
├── UI: shadcn/ui, Radix
├── State: Zustand
└── Styling: Tailwind

HEAD (AI/LLM)
├── SDK: Vercel AI SDK
├── Providers: OpenAI, Anthropic, Google
├── RAG: Upstash Vector
└── Tools: Zod schemas

DNA (Backend)
├── Database: Supabase
├── Cache: Upstash Redis
├── Auth: Supabase Auth (@supabase/ssr)
├── Payments: Stripe
└── Email: Resend
```

---

## Skills Assessment Template

### Project Type Classification

```markdown
## 15. Skills Assessment

### Project Type

Select one:

- [ ] SaaS Web App
- [ ] Dashboard/Admin
- [ ] Mobile App (Expo)
- [ ] Telegram Mini App
- [ ] ChatGPT App (Frontend)
- [ ] Custom GPT (Backend)
- [ ] Discord Activity
- [ ] AI Assistant
- [ ] Marketing Site

### Pattern Classification

- [ ] Pattern 01: Ad Hoc — Quick one-off tasks
- [ ] Pattern 02: Reusable — Repeated tasks with templates
- [ ] Pattern 03: Subagent — Specialized AI task processing
- [ ] Pattern 04: MCP Wrapper — Multi-service integration
- [ ] Pattern 05: Full Application — Production-grade app

### Skills Map

| Layer | Skill           | Justification                 |
| ----- | --------------- | ----------------------------- |
| FACE  | face-layer      | Next.js 15 for SSR/SEO        |
| FACE  | vite-frontend   | Vite for SPA dashboard        |
| HEAD  | head-layer      | AI agents with tool calling   |
| HEAD  | agentic-prompts | Structured AI workflows       |
| DNA   | dna-layer       | Supabase + Stripe integration |
| DNA   | supabase-auth   | Auth + RLS policies           |

### Skills NOT Used

Document skills explicitly excluded:
| Skill | Reason for Exclusion |
|-------|---------------------|
| expo-supabase | Web-only project |
| telegram-miniapp | Not a Telegram app |

### Skill Chaining Order

Define execution order:
```

dna-layer → supabase-auth → head-layer → face-layer → quality-gates

```

```

---

## Design System Foundation Template

````markdown
## 16. Design System Foundation

### Color Palette

Define CSS variables for consistent theming:

```css
:root {
  --primary: hsl(222.2 47.4% 11.2%);
  --primary-foreground: hsl(210 40% 98%);
  --secondary: hsl(210 40% 96.1%);
  --secondary-foreground: hsl(222.2 47.4% 11.2%);
  --accent: hsl(210 40% 96.1%);
  --accent-foreground: hsl(222.2 47.4% 11.2%);
  --background: hsl(0 0% 100%);
  --foreground: hsl(222.2 84% 4.9%);
  --muted: hsl(210 40% 96.1%);
  --muted-foreground: hsl(215.4 16.3% 46.9%);
  --destructive: hsl(0 84.2% 60.2%);
  --border: hsl(214.3 31.8% 91.4%);
  --ring: hsl(222.2 84% 4.9%);
  --radius: 0.5rem;
}
```
````

### Typography

- **Font Family**: Inter / Geist Sans
- **Headings**: font-bold tracking-tight
- **Body**: font-normal leading-relaxed
- **Code**: font-mono

### Spacing & Sizing

- Border radius: rounded-lg (0.5rem)
- Shadows: shadow-sm, shadow-md
- Spacing scale: 4px base (p-1, p-2, p-4, p-6, p-8)

### Global Stitch Instructions

Add to EVERY Stitch prompt for consistency:

```
Use Inter font family. Colors: primary (#1a1a2e), secondary (#f1f5f9),
accent (#3b82f6). All buttons and cards use rounded-lg borders.
Subtle shadows (shadow-sm) on cards. Consistent 16px/24px spacing.
Mobile-first responsive design with Tailwind CSS.
```

### Component Library by Phase

| Phase | shadcn/ui Components | Custom Components    |
| ----- | -------------------- | -------------------- |
| 1     | Button, Card         | Hero, FeatureGrid    |
| 2     | Form, Input, Label   | AuthForm             |
| 3     | Sidebar, Sheet       | AppShell, Navigation |
| 4     | Table, Dialog        | Domain-specific      |
| 5     | Tabs, Accordion      | Secondary features   |
| 6     | Avatar, DropdownMenu | UserProfile          |
| 7     | Badge, Alert         | PublicFlow           |

```

---

## Implementation Roadmap (7 Phases)

### Backend Integration Matrix
Quick reference for all phases:
| Phase | Tables | API Routes | Services |
|-------|--------|------------|----------|
| 1 | — | — | — |
| 2 | profiles | /api/auth/* | Supabase Auth |
| 3 | settings | /api/settings | Supabase |
| 4 | [domain] | /api/[domain]/* | Supabase, Stripe |
| 5 | [secondary] | /api/[secondary]/* | Supabase |
| 6 | profiles, preferences | /api/user/* | Supabase |
| 7 | [public_domain] | /api/public/* | Supabase |

---

### Phase 1: Marketing Site (Public)

**Skills Used**
- face-layer (Next.js SSR for SEO)

**Pages in This Phase**
- Homepage (`/`)
- Pricing (`/pricing`)
- Features (`/features`)
- About (`/about`)
- Contact (`/contact`)

**Stitch Prompts**

> **Important:** Add Integration Constraints to every Stitch prompt. See `google-stitch-prompts-*` skills for platform-specific constraint templates.

#### Homepage
```

Create a modern SaaS homepage with:

- Hero section with headline "{tagline}", subheadline, CTA button with onClick={handleCTA}
- Feature grid using {features.map((f) => <FeatureCard key={f.id} {...f} />)}
- Social proof section with {testimonials.map(...)}
- Pricing teaser with onClick={handleViewPricing}
- Footer with links

[Insert Design System Foundation here]
Mobile-first, conversion-optimized layout.

**Integration Constraints:**

- DATA: Features and testimonials use {items.map(...)} pattern
- HANDLERS: CTA buttons have onClick={handleAction}
- DYNAMIC: Headline shows {tagline}, not hardcoded text
- STATES: Include loading skeleton for dynamic sections

```

#### Pricing
```

Create a pricing page with:

- 3-tier pricing cards using {plans.map((plan) => <PricingCard key={plan.id} {...plan} />)}
- Feature comparison table with {features.map(...)}
- FAQ accordion using {faqs.map(...)}
- CTA buttons per tier with onClick={handleSelectPlan}

[Insert Design System Foundation here]

**Integration Constraints:**

- DATA: Plans, features, FAQs use {items.map(...)} pattern
- HANDLERS: CTA buttons have onClick={handleSelectPlan}
- DYNAMIC: Prices show {plan.price}, features show {plan.features}
- STATES: Include loading state for pricing data

```

**Backend Integration**
- None (static pages, SSR for SEO)

**Post-Export Checklist**
- [ ] Convert `<img>` to `<Image>` from next/image
- [ ] Convert `<a>` to `<Link>` from next/link
- [ ] Add metadata export for SEO
- [ ] Verify responsive design
- [ ] Add analytics tracking

---

### Phase 2: Authentication

**Skills Used**
- supabase-auth
- face-layer

**Pages in This Phase**
- Login (`/login`)
- Signup (`/signup`)
- Forgot Password (`/forgot-password`)
- Reset Password (`/reset-password`)

**Stitch Prompts**

#### Login
```

Create a login page with:

- Centered card layout
- Email and password inputs
- "Remember me" checkbox
- "Forgot password?" link
- Sign up link
- OAuth buttons (Google, GitHub)

[Insert Design System Foundation here]

```

#### Signup
```

Create a signup page with:

- Centered card layout
- Name, email, password inputs
- Password strength indicator
- Terms acceptance checkbox
- Login link
- OAuth buttons

[Insert Design System Foundation here]

````

**Backend Integration**

#### TypeScript Interfaces
```typescript
interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}
````

#### API Routes

```
POST /api/auth/signup     — Create account
POST /api/auth/login      — Sign in
POST /api/auth/logout     — Sign out
POST /api/auth/refresh    — Refresh token
POST /api/auth/forgot     — Request reset
POST /api/auth/reset      — Reset password
```

#### Database Schema

```sql
-- Supabase handles auth.users
-- Link to public profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

**Post-Export Checklist**

- [ ] Add 'use client' to form components
- [ ] Wire up Supabase Auth
- [ ] Implement OAuth providers
- [ ] Add RLS policies
- [ ] Test auth flow end-to-end

---

### Phase 3: App Shell & Core

**Skills Used**

- face-layer
- dna-layer

**Pages in This Phase**

- Dashboard (`/app` or `/dashboard`)
- App Layout (sidebar, header)

**Stitch Prompts**

#### App Shell

```
Create an application shell with:
- Collapsible sidebar navigation
- Header with user avatar dropdown
- Main content area
- Mobile hamburger menu
- Breadcrumb navigation

[Insert Design System Foundation here]
Dark/light mode support.
```

**Backend Integration**

#### TypeScript Interfaces

```typescript
interface AppSettings {
  user_id: string;
  theme: "light" | "dark" | "system";
  notifications_enabled: boolean;
  sidebar_collapsed: boolean;
}
```

#### API Routes

```
GET  /api/settings        — Get user settings
PUT  /api/settings        — Update settings
```

**Post-Export Checklist**

- [ ] Add 'use client' to interactive components
- [ ] Implement theme switching
- [ ] Wire up settings persistence
- [ ] Add navigation state management
- [ ] Test responsive behavior

---

### Phase 4: Primary Features

**Skills Used**

- face-layer
- dna-layer
- head-layer (if AI features)

**Pages in This Phase**

- [Primary Feature 1] (`/app/[feature1]`)
- [Primary Feature 2] (`/app/[feature2]`)
- [Primary Feature 3] (`/app/[feature3]`)

**Stitch Prompts**
(Customize for your specific domain)

#### [Feature 1 Name]

```
Create a [feature] page with:
- [Specific UI requirements]
- [Data display format]
- [Actions available]
- [Empty state]

[Insert Design System Foundation here]
```

**Backend Integration**

#### TypeScript Interfaces

```typescript
interface DomainEntity {
  id: string;
  user_id: string;
  // Domain-specific fields
  created_at: string;
  updated_at: string;
}
```

#### API Routes

```
GET    /api/[domain]       — List entities
POST   /api/[domain]       — Create entity
GET    /api/[domain]/[id]  — Get entity
PUT    /api/[domain]/[id]  — Update entity
DELETE /api/[domain]/[id]  — Delete entity
```

#### Database Schema

```sql
CREATE TABLE [domain] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  -- Domain-specific columns
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE [domain] ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own [domain]"
  ON [domain] FOR ALL
  USING (auth.uid() = user_id);
```

**Post-Export Checklist**

- [ ] Add 'use client' where needed
- [ ] Wire up data fetching (React Query/SWR)
- [ ] Implement CRUD operations
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test all operations

---

### Phase 5: Secondary Features

**Skills Used**

- face-layer
- dna-layer

**Pages in This Phase**

- [Secondary Feature 1] (`/app/[secondary1]`)
- [Secondary Feature 2] (`/app/[secondary2]`)

**Structure**
Same pattern as Phase 4:

- Stitch Prompts for each page
- TypeScript Interfaces
- API Routes
- Database Schema
- Post-Export Checklist

---

### Phase 6: User Portal/Account

**Skills Used**

- face-layer
- dna-layer
- supabase-auth

**Pages in This Phase**

- Profile (`/app/profile`)
- Settings (`/app/settings`)
- Billing (`/app/billing`)
- Notifications (`/app/notifications`)

**Stitch Prompts**

#### Profile Page

```
Create a user profile page with:
- Avatar upload/change
- Name and email display
- Edit profile form
- Account created date
- Danger zone (delete account)

[Insert Design System Foundation here]
```

#### Billing Page

```
Create a billing management page with:
- Current plan display
- Usage metrics
- Plan upgrade options
- Payment method management
- Invoice history table

[Insert Design System Foundation here]
```

**Backend Integration**

#### API Routes

```
GET  /api/user/profile    — Get profile
PUT  /api/user/profile    — Update profile
POST /api/user/avatar     — Upload avatar
GET  /api/user/billing    — Get billing info
POST /api/user/subscribe  — Create subscription
DELETE /api/user/account  — Delete account
```

**Post-Export Checklist**

- [ ] Add 'use client' to forms
- [ ] Wire up Stripe for billing
- [ ] Implement avatar upload
- [ ] Add account deletion flow
- [ ] Test profile updates

---

### Phase 7: Public Flows

**Skills Used**

- face-layer
- dna-layer

**Pages in This Phase**

- Public Profile (`/u/[username]`)
- Shared Content (`/share/[id]`)
- Embed (`/embed/[id]`)

**Stitch Prompts**

#### Public Profile

```
Create a public user profile page with:
- User avatar and name
- Public bio
- Public content grid
- Follow/contact button (if logged in)

[Insert Design System Foundation here]
No sensitive data shown.
```

**Backend Integration**

#### API Routes

```
GET /api/public/profile/[username]  — Get public profile
GET /api/public/content/[id]        — Get shared content
```

#### Database Considerations

```sql
-- Add public flag to relevant tables
ALTER TABLE [domain] ADD COLUMN is_public BOOLEAN DEFAULT FALSE;

-- Public read policy
CREATE POLICY "Anyone can view public [domain]"
  ON [domain] FOR SELECT
  USING (is_public = TRUE);
```

**Post-Export Checklist**

- [ ] Convert to `<Image>` and `<Link>`
- [ ] Add metadata for social sharing
- [ ] Implement OG image generation
- [ ] Test public access (no auth)
- [ ] Verify RLS for public data

---

## Stitch Import & Integration

After receiving Stitch exports, follow this workflow to integrate them with your scaffold.

### Two-Layer Defense

```
Stage 5: Stitch Prompts
         ↓
         Add Integration Constraints ← PROACTIVE (prevents issues)
         ↓
Stage 6-7: Stitch Export → Convert
         ↓
Stage 7.5: Integration Audit ← REACTIVE (catches remaining issues)
         ↓
Stage 8: Quality Gates
```

> **Important:** Always add Integration Constraints to Stitch prompts. See `google-stitch-prompts-*` skills for platform-specific constraint templates that ensure Stitch output uses mapping patterns, handlers, and dynamic content instead of hardcoded data.

### Quick Start

1. **Add constraints to prompts**: Include Integration Constraints block in every Stitch prompt
2. **Organize exports**: `stitch-exports/{page_name}/code.html`
3. **Use Ralph Loop for batch integration**: See `references/STITCH-INTEGRATION-LOOP.md`
4. **Or manual**: Read HTML → Convert → Merge with scaffold → TypeScript check

### Conversion Rules

| Stitch Output  | Convert To                        |
| -------------- | --------------------------------- |
| `class=""`     | `className=""`                    |
| `<a href="">`  | `<Link href="">` from `next/link` |
| `<img src="">` | `<Image>` with width/height       |
| Stitch colors  | Project theme tokens              |
| Icons          | lucide-react                      |
| `onclick=""`   | `'use client'` + React handlers   |

### Component Patterns

See `face-layer` → "Stitch-Compatible Patterns" section for:

- Card patterns (Stitch-compatible)
- Button patterns (Primary, Secondary, Ghost)
- Input/Select patterns
- Icon standard (Material Symbols)
- Data Table patterns
- Empty State patterns

### Theme Tokens

| Token                        | Usage                          |
| ---------------------------- | ------------------------------ |
| `bg-card`                    | Card/section backgrounds       |
| `bg-secondary`               | Input backgrounds, muted areas |
| `border-border`              | All borders                    |
| `text-foreground`            | Primary text                   |
| `text-muted-foreground`      | Secondary text, labels         |
| `text-primary`               | Accent text, links             |
| `bg-primary`                 | Primary buttons                |
| `bg-primary/20 text-primary` | Icon badges                    |

### Common Issues

| Issue                       | Fix                                                 |
| --------------------------- | --------------------------------------------------- |
| Undefined Card/Button/Input | Use Stitch-compatible patterns from face-layer      |
| Icon imports missing        | Add lucide-react imports                            |
| API route TS errors         | Separate concern, filter with `grep -v 'route\.ts'` |
| Form not wired              | Preserve existing server actions from scaffold      |
| Data not rendering          | Preserve data fetching and mapping from scaffold    |

### Integration Checklist

- [ ] Convert `class` → `className`
- [ ] Replace icons with lucide-react imports
- [ ] Apply project theme tokens (bg-card, text-muted-foreground)
- [ ] Convert `<a href>` → `<Link>`
- [ ] Convert `<img>` → `<Image>` with dimensions
- [ ] Map arbitrary Tailwind values to standard classes
- [ ] Add `'use client'` only where needed
- [ ] Preserve ALL existing data fetching
- [ ] Preserve server actions and form handlers
- [ ] Run TypeScript check: `npx tsc --noEmit`
- [ ] Test interactive elements

### Post-Integration Verification (Stage 7.5)

After Stitch conversion, verify backend connections before quality gates.

#### Verification Checks

| Check             | Command/Method                               |
| ----------------- | -------------------------------------------- |
| No hardcoded data | `grep -r "SAMPLE_\|mock" src/app/`           |
| Hooks imported    | Check imports match HANDOFF-CHECKLIST matrix |
| Actions wired     | All buttons have onClick handlers            |
| Forms connected   | All forms use server actions                 |
| TypeScript passes | `npx tsc --noEmit`                           |

#### Updated Post-Export Checklist

- [ ] **Verify data comes from hooks (not constants)**
- [ ] **Verify buttons call actions (not no-ops)**
- [ ] **Verify forms use server actions**
- [ ] **Verify OAuth buttons are wired**
- [ ] **Verify settings/preferences persist**
- [ ] Add loading states for async operations
- [ ] Add error boundaries
- [ ] Metadata exports for SEO pages

#### Common Integration Failures

| Symptom                | Root Cause          | Fix                             |
| ---------------------- | ------------------- | ------------------------------- |
| Page shows sample data | Hook import missing | Import and use hook             |
| Settings don't save    | No mutation wired   | Create/wire usePreferences hook |
| OAuth buttons inactive | No onClick handler  | Wire to signInWithGoogle/Apple  |
| Pagination broken      | No state/handlers   | Add page state + handlers       |

#### Ralph Loop Audit

```bash
/ralph-loop:ralph-loop "Audit all pages for backend integration.

For each page in src/app/:
1. Read the component
2. List all data displayed - verify uses hook from @/hooks/
3. List all buttons/forms - verify calls action from @/lib/actions/
4. If using hardcoded data, replace with hook
5. If button has no handler, wire to action
6. Run: npx tsc --noEmit

Say INTEGRATION AUDIT COMPLETE when verified" --max-iterations 30 --completion-promise "INTEGRATION AUDIT COMPLETE"
```

### Ralph Loop Integration

For batch integration of multiple pages:

```bash
/ralph-loop:ralph-loop "Integrate Stitch exports from stitch-exports/ into app/

Process: dashboard, settings, profile pages

For each:
1. Read Stitch code.html
2. Read scaffold page.tsx
3. Convert HTML to React with theme tokens
4. Preserve data fetching and actions
5. Run: npx tsc --noEmit

Say ALL INTEGRATED when done" --max-iterations 25 --completion-promise "ALL INTEGRATED"
```

See `references/STITCH-INTEGRATION-LOOP.md` for detailed templates.

---

## Template Selection

### Available Templates (20+)

**AI & Chat**

- `template-nextjs-ai-chatbot` — Full chat app (Pattern 05)
- `template-gemini-ai-chatbot` — Google Gemini
- `template-e2b` — Code execution sandbox
- `template-upstash-vector-ai-sdk-starter` — RAG starter

**Authentication**

- `supabase-auth` skill — Supabase Auth with @supabase/ssr

**Payments**

- `stripe-nextjs-template` — Stripe integration

**Multi-Tenancy**

- `platforms-starter-kit` — Multi-tenant SaaS

**CMS**

- `sanity-nextjs-clean` — Sanity CMS

**Media**

- `next-video-starter` — Video hosting
- `blob-starter` — File storage

**Real-time**

- `liveblocks-starter` — Collaboration

**Automation**

- `vercel-cron` — Scheduled tasks
- `upstash-qstash-nextjs` — Background jobs

### Selection Criteria

```
Need AI chat?
├── YES → template-nextjs-ai-chatbot
└── NO → Need auth?
         ├── YES → Need payments?
         │         ├── YES → platforms-starter-kit + supabase-auth
         │         └── NO → supabase-auth skill
         └── NO → Need CMS?
                  ├── YES → sanity-nextjs-clean
                  └── NO → basic Next.js
```

---

## Codebase Analysis

### Quick Analysis

```bash
# Structure
find . -type f -name "*.ts" -o -name "*.tsx" | head -50

# Dependencies
cat package.json | jq '.dependencies'

# LOC
find . -name "*.ts" -o -name "*.tsx" | xargs wc -l
```

### Pattern Detection

```typescript
// Look for indicators:

// Pattern 03 (Subagent)
- Single AI function
- generateText/streamText usage
- Limited tool calling

// Pattern 04 (MCP Wrapper)
- Multiple tools defined
- MCP SDK usage
- Service integrations

// Pattern 05 (Full App)
- Complete 3-layer architecture
- Auth (Supabase Auth)
- Database (Supabase PostgreSQL)
- Payments (Stripe)
```

### Architecture Assessment

```
Questions to answer:

1. What pattern is this? (01-05)
2. Which layers exist? (Face/Head/DNA)
3. What services are integrated?
4. What's the data model?
5. What's the deployment target?
6. What's missing for next pattern?
```

---

## MCP Tool Usage

The AI Coder MCP server provides:

| Tool                   | Purpose                    |
| ---------------------- | -------------------------- |
| `query_knowledge_base` | RAG semantic search        |
| `get_active_context`   | Session state recovery     |
| `run_quality_gates`    | CodeRabbit + tests + build |
| `create_prp`           | Generate PRP document      |
| `parse_prp`            | Parse existing PRP         |
| `get_project_context`  | Project information        |
| `create_documentation` | Template-based docs        |
| `run_tests`            | Execute tests              |
| `list_projects`        | List all projects          |

---

## Workflow: New Project

```
1. ANALYZE
   - What problem are we solving?
   - Who are the users?
   - What's the complexity?

2. SELECT PATTERN & SKILLS
   - Map to Pattern 01-05
   - Identify 3-layer needs
   - Complete Skills Assessment (section 15)

3. CHOOSE TEMPLATE
   - Pick closest template
   - List modifications needed

4. CREATE PRP
   - Fill all 17 sections
   - Map to 3-layer architecture
   - Define Design System Foundation (section 16)

5. SCAFFOLD
   - Clone template
   - Configure services
   - Set environment variables

6. BUILD (7 Phases with gates)
   - Phase 1: Marketing Site → Gate → Commit
   - Phase 2: Authentication → Gate → Commit
   - Phase 3: App Shell & Core → Gate → Commit
   - Phase 4: Primary Features → Gate → Commit
   - Phase 5: Secondary Features → Gate → Commit
   - Phase 6: User Portal/Account → Gate → Commit
   - Phase 7: Public Flows → Gate → Commit

7. DEPLOY
   - All gates pass
   - Production checklist complete
```

---

## PRP Automation with Ralph Wiggum

Automate PRP implementation using iterative AI loops.

### Prerequisites

```bash
/plugin install ralph-loop@claude-plugins-official
```

### Phase-by-Phase Automation

Implement each phase from the Implementation Roadmap:

```bash
/ralph-loop:ralph-loop "Implement Phase 1: Marketing Site.
Create pages: Homepage, Pricing, Features, About, Contact.
For each page:
1. Create the component using design system
2. Add to routing
3. Verify renders correctly
Say PHASE 1 COMPLETE when all pages done" --max-iterations 30 --completion-promise "PHASE 1 COMPLETE"
```

### Milestone Loop

Implement full milestone with quality gates:

```bash
/ralph-loop:ralph-loop "Implement M1: Foundation.
1. Complete all Phase 1 pages
2. Run tests, lint, build
3. Fix any failures
4. Create commit when gates pass
Say M1 COMMITTED when done" --max-iterations 50 --completion-promise "M1 COMMITTED"
```

### Overnight Development

For longer implementation sessions:

```bash
/ralph-loop:ralph-loop "Implement phases 1-3 from the PRP.
Work through each phase sequentially.
Run quality gates after each phase.
Create milestone commits.
Say PHASES 1-3 COMPLETE when finished" --max-iterations 100 --completion-promise "PHASES 1-3 COMPLETE"
```

### Skill Scaffolding Loop

Create new skills automatically:

```bash
/ralph-loop:ralph-loop "Create a new skill called [skill-name].
1. Create skills/[skill-name]/SKILL.md with proper structure
2. Add references if needed
3. Update CLAUDE.md with skill entry and triggers
4. Validate skill structure
Say SKILL CREATED when complete" --max-iterations 15 --completion-promise "SKILL CREATED"
```

### Best Practice: Phased Approach

For large PRPs, run separate loops per phase:

1. Phase 1 loop → verify → commit
2. Phase 2 loop → verify → commit
3. Continue through all 7 phases

This provides checkpoints and easier debugging than one massive loop.

---

## Checklist: Creating a Skill

- [ ] Clear, focused domain
- [ ] Descriptive name and description
- [ ] Trigger conditions defined
- [ ] Code examples included
- [ ] Best practices documented
- [ ] Checklist at end
- [ ] Validated with quick_validate.py
- [ ] Packaged as .skill file

## Checklist: Creating a PRP

- [ ] All 17 sections filled
- [ ] Pattern selected (01-05)
- [ ] 3-layer architecture mapped
- [ ] User stories defined
- [ ] Data model documented
- [ ] API endpoints specified
- [ ] Testing strategy included

### Skills Assessment Verification

- [ ] Project type selected (1 of 9)
- [ ] Pattern classification documented
- [ ] Skills map complete (Layer → Skill → Justification)
- [ ] Skills NOT used documented with reasons
- [ ] Skill chaining order defined

### Design System Verification

- [ ] Color palette defined (CSS variables)
- [ ] Typography specified
- [ ] Global Stitch instructions written
- [ ] Component library by phase planned

### Implementation Roadmap Verification

- [ ] Backend Integration Matrix completed
- [ ] All 7 phases documented
- [ ] Each phase has:
  - [ ] Skills used listed
  - [ ] Pages identified
  - [ ] Stitch prompts written
  - [ ] Backend integration (interfaces, routes, schema)
  - [ ] Post-export checklist complete
