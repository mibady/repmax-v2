---
name: supabase-auth
description: Authentication with Supabase Auth, organizations, RLS, and Stripe billing.
---

# Supabase Auth

Multi-tenant SaaS authentication with Supabase Auth, organizations, and Stripe billing.

## When to Use

- Setting up authentication in a Next.js app
- Multi-tenant SaaS with organizations/teams
- Subscription billing with Stripe
- Row Level Security (RLS) policies

## Stack

| Component | Technology |
|-----------|------------|
| Auth | @supabase/ssr |
| Database | Supabase PostgreSQL |
| Security | Row Level Security (RLS) |
| Billing | Stripe |
| Framework | Next.js 15+ |

## Quick Start

### 1. Install Dependencies

```bash
npm install @supabase/ssr @supabase/supabase-js
```

### 2. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...  # Server-side only

# Stripe (if billing)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# App
NEXT_PUBLIC_URL=http://localhost:3000
```

### 3. Create Supabase Clients

**Server Client** (`lib/supabase/server.ts`):
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component
          }
        },
      },
    }
  )
}
```

**Browser Client** (`lib/supabase/client.ts`):
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 4. Middleware (Route Protection)

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Public routes
  const publicRoutes = ['/login', '/signup', '/auth']
  if (publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    return response
  }

  // Redirect to login if not authenticated
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

## Decision Tree

| Context | Function | Package |
|---------|----------|---------|
| Server Component | `createClient()` | `@supabase/ssr` |
| Client Component | `createClient()` | `@supabase/ssr` (browser) |
| API Route | `createClient()` | `@supabase/ssr` |
| Middleware | `createServerClient()` | `@supabase/ssr` |
| Webhooks (bypass RLS) | `createClient()` with service role | `@supabase/supabase-js` |

## Core Patterns

### Get Current User

```typescript
// Server Component or API Route
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
```

### Protected Server Action

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createProject(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('projects')
    .insert({ name: formData.get('name'), user_id: user.id })
    .select()
    .single()

  return data
}
```

### RLS Policy Pattern

```sql
-- Users can only access their own data
create policy "Users can view own data"
  on my_table for select using (auth.uid() = user_id);

-- Organization members can access org data
create policy "Members can view org data"
  on org_projects for select using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = org_projects.organization_id
      and organization_members.user_id = auth.uid()
    )
  );
```

## References

| Document | Content |
|----------|---------|
| [supabase-auth-setup.md](references/supabase-auth-setup.md) | Auth flows, OAuth, callbacks |
| [supabase-organizations.md](references/supabase-organizations.md) | Multi-tenant, invitations, RBAC |
| [supabase-stripe-billing.md](references/supabase-stripe-billing.md) | Checkout, webhooks, portal |
| [supabase-middleware-rls.md](references/supabase-middleware-rls.md) | Middleware, RLS, SQL schema |
| [clerk-to-supabase-migration.md](references/clerk-to-supabase-migration.md) | Complete Clerk migration guide |

## Key Differences from Clerk

| Clerk | Supabase Auth |
|-------|---------------|
| `@clerk/nextjs` | `@supabase/ssr` |
| `auth()` | `supabase.auth.getUser()` |
| `useAuth()` | `supabase.auth.getUser()` (client) |
| `clerkMiddleware()` | Custom middleware with `createServerClient()` |
| `ClerkProvider` | No provider needed |
| `auth.jwt()->>'sub'` (RLS) | `auth.uid()` (RLS) |
| Svix webhooks | Postgres triggers or Edge Functions |
| Built-in organizations | Custom tables + RLS |
