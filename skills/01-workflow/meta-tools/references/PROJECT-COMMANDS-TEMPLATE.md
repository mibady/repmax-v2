# Project Commands Template

Standard commands generated for every project during `/handoff`.

---

## Command: /dev

**File:** `.claude/commands/dev.md`

```markdown
# Start Development Server

Start the development server for local development.

## Steps

1. Check if node_modules exists, if not run `npm install`
2. Start the development server: `{DEV_COMMAND}`
3. Report the local URL (typically http://localhost:{PORT})

## Commands

\`\`\`bash
# Install dependencies if needed
npm install

# Start dev server
{DEV_COMMAND}
\`\`\`

## Environment

Ensure `.env.local` exists with required variables. See `.env.example` for template.

## Troubleshooting

- **Port in use**: Kill process on port {PORT} or change PORT in .env
- **Missing env vars**: Copy from `.env.example` and fill values
- **Database connection failed**: Check Supabase URL and keys
```

---

## Command: /test

**File:** `.claude/commands/test.md`

```markdown
# Run Tests

Run the project test suite.

## Arguments

`$ARGUMENTS` - Optional test filter (file path or pattern)

## Steps

1. Run TypeScript check: `npx tsc --noEmit`
2. Run ESLint: `npm run lint`
3. Run tests: `{TEST_COMMAND}`
4. If arguments provided, filter tests accordingly
5. Report results summary

## Commands

\`\`\`bash
# Full test suite
npm run test

# With coverage
npm run test:coverage

# Specific file
npm run test -- {path}

# E2E tests (if available)
npm run test:e2e
\`\`\`

## Quality Gates

Before committing, all must pass:
- [ ] TypeScript: `npx tsc --noEmit`
- [ ] Lint: `npm run lint`
- [ ] Tests: `npm run test`
- [ ] Build: `npm run build`
```

---

## Command: /deploy

**File:** `.claude/commands/deploy.md`

```markdown
# Deploy to Production

Deploy the application to production environment.

## Arguments

`$ARGUMENTS` - Optional: `staging` or `production` (default: production)

## Pre-Deploy Checklist

1. Run all quality gates: `/test`
2. Verify build succeeds: `npm run build`
3. Check environment variables are set in hosting platform
4. Verify database migrations are applied

## Steps

1. Run quality gates
2. Build the application
3. Deploy using the appropriate method

## Commands

\`\`\`bash
# Vercel deployment
vercel --prod

# Or via Git (if auto-deploy configured)
git push origin main

# Staging deployment
vercel --env preview
\`\`\`

## Post-Deploy

1. Verify deployment at production URL
2. Check critical flows (auth, main features)
3. Monitor error tracking (Sentry/etc.)
```

---

## Command: /status

**File:** `.claude/commands/status.md`

```markdown
# Check Project Status

Check the health of the project: build, lint, types, and tests.

## Steps

1. Check TypeScript errors: `npx tsc --noEmit`
2. Check ESLint errors: `npm run lint`
3. Check build status: `npm run build`
4. Check test status: `npm run test`
5. Report summary with pass/fail for each

## Output Format

\`\`\`
Project Status: {PROJECT_NAME}
─────────────────────────────
TypeScript:  ✅ Pass / ❌ {N} errors
ESLint:      ✅ Pass / ❌ {N} errors
Build:       ✅ Pass / ❌ Failed
Tests:       ✅ {N} passing / ❌ {N} failed

Overall: ✅ Ready to commit / ❌ Issues found
\`\`\`

## Quick Fix Commands

\`\`\`bash
# Auto-fix lint errors
npm run lint -- --fix

# Check specific TypeScript errors
npx tsc --noEmit 2>&1 | head -50
\`\`\`
```

---

## Command: /db

**File:** `.claude/commands/db.md`

```markdown
# Database Operations

Manage database migrations, seeding, and type generation.

## Arguments

`$ARGUMENTS` - Operation to perform:
- `migrate` - Run pending migrations
- `seed` - Seed database with test data
- `reset` - Reset and reseed (dev only)
- `schema` - Show current schema
- `types` - Regenerate TypeScript types

## Operations

### migrate
Run pending migrations against the database.

\`\`\`bash
{MIGRATE_COMMAND}
\`\`\`

### seed
Seed the database with test data.

\`\`\`bash
{SEED_COMMAND}
\`\`\`

### reset
Reset database and reseed (DEVELOPMENT ONLY - will delete all data).

\`\`\`bash
{RESET_COMMAND}
\`\`\`

### schema
Display current database schema.

\`\`\`bash
{SCHEMA_COMMAND}
\`\`\`

### types
Regenerate TypeScript types from database schema.

\`\`\`bash
{TYPES_COMMAND}
\`\`\`

## Safety

- **Never** run `reset` on production
- Always backup before running migrations on production
- Test migrations locally first
```

---

## Platform-Specific Variations

### Next.js (face-layer)

```yaml
DEV_COMMAND: npm run dev
TEST_COMMAND: npm run test
PORT: 3000
MIGRATE_COMMAND: npx supabase db push
SEED_COMMAND: npx supabase db seed
RESET_COMMAND: npx supabase db reset
SCHEMA_COMMAND: npx supabase db diff
TYPES_COMMAND: npx supabase gen types typescript --local > types/database.ts
```

### Vite (vite-frontend)

```yaml
DEV_COMMAND: npm run dev
TEST_COMMAND: npm run test
PORT: 5173
MIGRATE_COMMAND: npx supabase db push
SEED_COMMAND: npx supabase db seed
RESET_COMMAND: npx supabase db reset
SCHEMA_COMMAND: npx supabase db diff
TYPES_COMMAND: npx supabase gen types typescript --local > src/types/database.ts
```

### Expo (expo-supabase)

```yaml
DEV_COMMAND: npx expo start
TEST_COMMAND: npm run test
PORT: 8081
MIGRATE_COMMAND: npx supabase db push
SEED_COMMAND: npx supabase db seed
RESET_COMMAND: npx supabase db reset
SCHEMA_COMMAND: npx supabase db diff
TYPES_COMMAND: npx supabase gen types typescript --local > src/types/database.ts
```

### Telegram Mini App (telegram-miniapp)

```yaml
DEV_COMMAND: npm run dev
TEST_COMMAND: npm run test
PORT: 5173
MIGRATE_COMMAND: npx supabase db push
SEED_COMMAND: npx supabase db seed
RESET_COMMAND: npx supabase db reset
SCHEMA_COMMAND: npx supabase db diff
TYPES_COMMAND: npx supabase gen types typescript --local > src/types/database.ts
```

### Discord Activity (discord-activities)

```yaml
DEV_COMMAND: npm run dev
TEST_COMMAND: npm run test
PORT: 3000
MIGRATE_COMMAND: npx supabase db push
SEED_COMMAND: npx supabase db seed
RESET_COMMAND: npx supabase db reset
SCHEMA_COMMAND: npx supabase db diff
TYPES_COMMAND: npx supabase gen types typescript --local > src/types/database.ts
```

### ChatGPT (chatgpt-app)

```yaml
DEV_COMMAND: npm run dev
TEST_COMMAND: npm run test
PORT: 5173
# No database commands for client-only apps
```

---

## Usage in /handoff

1. Detect platform from package.json or PRP
2. Select platform-specific command variations
3. Fill in template placeholders
4. Write commands to `target-project/.claude/commands/`
