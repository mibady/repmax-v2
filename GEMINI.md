# RepMax v2

Data-driven recruiting intelligence platform connecting elite football talent with top-tier college programs.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15.3.6 (App Router) |
| Language | TypeScript 5.7 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Stripe |
| Styling | Tailwind CSS 3.4 |
| Validation | Zod |

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint
npm test         # Run tests
```

## Project Structure

```
repmax-v2/
├── app/
│   ├── (auth)/                   # Auth routes
│   ├── (app)/dashboard/          # User dashboard
│   ├── api/
│   │   ├── athletes/             # Athletes CRUD
│   │   ├── messages/             # NCAA-compliant messaging
│   │   ├── shortlists/           # Coach shortlists
│   │   └── webhooks/stripe/      # Stripe webhooks
│   ├── card/[id]/                # Public athlete profile card
│   └── pricing/                  # Pricing page
├── lib/
│   ├── supabase/                 # Supabase clients
│   ├── actions/                  # Server actions
│   └── hooks/                    # React hooks
├── types/                        # TypeScript types
├── supabase/migrations/          # Database migrations
└── stitch-exports/               # Stitch design exports
```

## Key Features

### For Athletes
- Verified profile with measurables and academics
- Highlight video uploads
- College offers management
- NCAA-compliant messaging

### For Coaches/Recruiters
- Search and filter athlete database
- Shortlists with priority levels
- Direct messaging, data export

### Subscription Plans
| Plan | Price | Features |
|------|-------|----------|
| Starter | Free | Basic access, 10 searches/day |
| Pro | $9.99/mo | Full database, unlimited search |
| Team | $29.99/mo | 5 seats, collaboration |
| Scout | Custom | API access, custom reporting |

## Database Schema

9 tables with RLS: profiles, athletes, coaches, highlights, shortlists, messages, subscription_plans, subscriptions, offers

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
STRIPE_TEAM_PRICE_ID=
```

## Key Patterns

- Server actions with `'use server'` and `createClient()` from `@/lib/supabase/server`
- Middleware handles auth state refresh and route protection
- Data hooks: `useAthletes()`, `useShortlist()`, `useMessages()`

## Testing Infrastructure

### Gemini Docker Journey Runner
A native, Docker-based Playwright E2E testing system located in `~/.gemini/scripts/`. It provides isolated, production-realistic testing with zero local dependency overhead.

#### Key Technical Features
- **Smart Hydration Waiting**: Automatically handles Next.js hydration and data loading by polling for skeleton loaders (max 20s).
- **Persona-Based Auth**: Injects session cookies for Athletes, Recruiters, and Admins to bypass repetitive login flows.
- **Resilient Reporting**: Filters non-critical console errors (fonts, CDNs) while failing on app crashes and "bad text" (NaN, undefined).
- **Visual Feedback**: Saves high-resolution screenshots of every failure in `journey-results/`.

#### Coverage for RepMax v2
- **Public (00-01)**: Landing, pricing, auth, and directories.
- **Personas (02-12)**: 
  - **Athletes**: Profiles, film, onboarding, and empty states.
  - **Recruiters**: Search, dashboards, and evaluation tools.
  - **Other Roles**: Coaches, Parents, Clubs, and Admins.
- **Systems (13-15)**: Messaging, checkout, settings, and responsive layout.

#### Command
```bash
# Run full suite for RepMax v2
cd Projects/repmax-v2 && bash ~/.gemini/scripts/journey-docker.sh --dir apps/web/journeys
```

## Imagery & Media (Banana Squad)

This project uses the **Banana Squad** (Gemini 3 Pro) for all professional imagery. 

### Generation Workflow
Use the global skill to generate assets:
```bash
tsx ~/.gemini/skills/imagegen/scripts/imagegen.ts generate --prompt "..." --output "apps/web/public/images/..."
```

### Standards
- **Hero/Banners**: 16:9 or 4:3, 1K resolution.
- **Avatars/Icons**: 1:1, 1K resolution.
- **Style**: High-contrast, cinematic, sports-tech aesthetic. Deep blacks, primary gold, and accent purple gradients.

