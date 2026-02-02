# Clerk to Supabase Auth Migration Guide

Complete migration guide from Clerk authentication to Supabase Auth for Next.js 15+ applications.

---

## Migration Overview

| Clerk | Supabase Auth |
|-------|---------------|
| `@clerk/nextjs` | `@supabase/ssr` |
| `auth()` | `supabase.auth.getUser()` |
| `currentUser()` | `supabase.auth.getUser()` |
| `useAuth()` | Custom hook with `onAuthStateChange` |
| `useUser()` | Custom hook with `getUser()` |
| `clerkMiddleware()` | Custom middleware |
| `ClerkProvider` | No provider needed |
| `SignIn` / `SignUp` components | Custom forms |
| `auth.jwt()->>'sub'` (RLS) | `auth.uid()` (RLS) |
| Svix webhooks | Postgres triggers or Edge Functions |
| Built-in organizations | Custom tables + RLS |
| `publicMetadata` | `user_metadata` / custom tables |

---

## Phase 1: Install Dependencies

### Remove Clerk

```bash
npm uninstall @clerk/nextjs @clerk/themes
```

### Install Supabase

```bash
npm install @supabase/ssr @supabase/supabase-js
```

---

## Phase 2: Environment Variables

### Before (Clerk)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

### After (Supabase)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...  # Server-side only, bypasses RLS
```

---

## Phase 3: Create Supabase Clients

### Server Client

```typescript
// lib/supabase/server.ts
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
            // Called from Server Component - ignore
          }
        },
      },
    }
  )
}
```

### Browser Client

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Admin Client (Bypass RLS)

```typescript
// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

---

## Phase 4: Replace ClerkProvider

### Before (Clerk)

```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

### After (Supabase)

```typescript
// app/layout.tsx
// No provider needed - Supabase uses cookies

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

---

## Phase 5: Replace Middleware

### Before (Clerk)

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect()
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

### After (Supabase)

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

  // Public routes - no auth required
  const publicRoutes = ['/login', '/signup', '/auth', '/', '/pricing']
  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname === route ||
    request.nextUrl.pathname.startsWith(route + '/')
  )

  if (isPublicRoute) {
    return response
  }

  // Redirect to login if not authenticated
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## Phase 6: Replace Auth Functions

### Get Current User

#### Before (Clerk)

```typescript
// Server Component
import { auth, currentUser } from '@clerk/nextjs/server'

export default async function Page() {
  const { userId } = await auth()
  const user = await currentUser()

  return <div>Hello {user?.firstName}</div>
}
```

#### After (Supabase)

```typescript
// Server Component
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Page() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <div>Hello {user.user_metadata?.full_name || user.email}</div>
}
```

### Client-Side User Hook

#### Before (Clerk)

```typescript
'use client'
import { useUser, useAuth } from '@clerk/nextjs'

export function UserProfile() {
  const { user, isLoaded } = useUser()
  const { userId, isSignedIn } = useAuth()

  if (!isLoaded) return <div>Loading...</div>

  return <div>{user?.firstName}</div>
}
```

#### After (Supabase)

```typescript
// hooks/use-user.ts
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    loading,
    isSignedIn: !!user,
    userId: user?.id
  }
}

// Usage
export function UserProfile() {
  const { user, loading, isSignedIn } = useUser()

  if (loading) return <div>Loading...</div>

  return <div>{user?.user_metadata?.full_name}</div>
}
```

---

## Phase 7: Replace Auth Components

### Sign Up

#### Before (Clerk)

```typescript
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return <SignUp />
}
```

#### After (Supabase)

```typescript
// app/signup/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    if (data?.user && !data.user.confirmed_at) {
      router.push('/auth/verify-email')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      {error && <div className="text-red-600">{error}</div>}

      <input
        type="text"
        placeholder="Full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password (min 6 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={6}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating account...' : 'Sign up'}
      </button>
    </form>
  )
}
```

### Sign In

#### Before (Clerk)

```typescript
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return <SignIn />
}
```

#### After (Supabase)

```typescript
// app/login/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }

    const redirect = searchParams.get('redirect') || '/dashboard'
    router.push(redirect)
    router.refresh()
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && <div className="text-red-600">{error}</div>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}
```

### OAuth (Google, GitHub)

#### Before (Clerk)

```typescript
// Clerk handles OAuth via its SignIn/SignUp components
<SignIn
  appearance={{
    elements: { socialButtonsBlockButton: 'w-full' }
  }}
/>
```

#### After (Supabase)

```typescript
// app/login/page.tsx (add to existing)
const handleGoogleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) setError(error.message)
}

const handleGitHubLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) setError(error.message)
}

// In JSX
<button onClick={handleGoogleLogin}>Sign in with Google</button>
<button onClick={handleGitHubLogin}>Sign in with GitHub</button>
```

### Auth Callback Route

```typescript
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL(next, request.url))
}
```

### Sign Out

#### Before (Clerk)

```typescript
import { SignOutButton } from '@clerk/nextjs'

<SignOutButton>
  <button>Sign out</button>
</SignOutButton>

// Or programmatically
import { useClerk } from '@clerk/nextjs'
const { signOut } = useClerk()
await signOut()
```

#### After (Supabase)

```typescript
// Server Action
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// Client Component
'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return <button onClick={handleSignOut}>Sign out</button>
}
```

---

## Phase 8: Migrate RLS Policies

### Before (Clerk JWT)

```sql
-- Clerk uses JWT sub claim
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    (current_setting('request.jwt.claims', true)::json->>'user_metadata')::json->>'user_id'
  )::text;
$$ LANGUAGE SQL STABLE;

CREATE POLICY "Users can view own data"
  ON user_data FOR SELECT
  USING (requesting_user_id() = clerk_user_id);
```

### After (Supabase Auth)

```sql
-- Supabase uses auth.uid() built-in function
CREATE POLICY "Users can view own data"
  ON user_data FOR SELECT
  USING (auth.uid() = user_id);

-- For insert
CREATE POLICY "Users can insert own data"
  ON user_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- For update
CREATE POLICY "Users can update own data"
  ON user_data FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- For delete
CREATE POLICY "Users can delete own data"
  ON user_data FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Phase 9: Migrate User Data

### Database Schema Changes

```sql
-- Rename clerk_user_id column to user_id (UUID)
ALTER TABLE profiles
  DROP COLUMN clerk_user_id,
  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Or if keeping existing data, migrate the column
ALTER TABLE profiles
  RENAME COLUMN clerk_user_id TO legacy_clerk_id;

ALTER TABLE profiles
  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
```

### Create Profile Trigger

```sql
-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Migrate Clerk Metadata to Supabase

```typescript
// Migration script
import { clerkClient } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

async function migrateUsers() {
  // Get all Clerk users
  const clerkUsers = await clerkClient.users.getUserList({ limit: 100 })

  for (const clerkUser of clerkUsers.data) {
    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: clerkUser.emailAddresses[0]?.emailAddress,
      email_confirm: true,
      user_metadata: {
        full_name: `${clerkUser.firstName} ${clerkUser.lastName}`,
        avatar_url: clerkUser.imageUrl,
        legacy_clerk_id: clerkUser.id,
      },
    })

    if (authError) {
      console.error(`Failed to migrate ${clerkUser.id}:`, authError)
      continue
    }

    // Update profile with new user_id
    await supabaseAdmin
      .from('profiles')
      .update({ user_id: authUser.user.id })
      .eq('legacy_clerk_id', clerkUser.id)

    console.log(`Migrated ${clerkUser.emailAddresses[0]?.emailAddress}`)
  }
}
```

---

## Phase 10: Replace Webhooks

### Before (Clerk Webhooks via Svix)

```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix'

export async function POST(request: Request) {
  const payload = await request.json()
  const headers = request.headers

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
  const evt = wh.verify(JSON.stringify(payload), {
    'svix-id': headers.get('svix-id')!,
    'svix-timestamp': headers.get('svix-timestamp')!,
    'svix-signature': headers.get('svix-signature')!,
  })

  if (evt.type === 'user.created') {
    // Handle user created
  }
}
```

### After (Supabase Database Triggers)

```sql
-- Option 1: Database trigger (recommended)
CREATE OR REPLACE FUNCTION handle_user_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');

  -- Call external webhook if needed
  PERFORM net.http_post(
    url := 'https://your-app.com/api/webhooks/user-created',
    body := jsonb_build_object(
      'user_id', NEW.id,
      'email', NEW.email
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_created();
```

### Option 2: Supabase Edge Function Webhook

```typescript
// supabase/functions/user-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createServiceClient } from '../_shared/supabase.ts'

serve(async (req) => {
  const payload = await req.json()
  const supabase = createServiceClient()

  // Handle auth events
  if (payload.type === 'INSERT' && payload.table === 'users') {
    // Send welcome email, sync to CRM, etc.
  }

  return new Response('ok')
})
```

---

## Phase 11: Replace Clerk Organizations

### Supabase Organization Tables

```sql
-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  owner_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization members
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view members of their organizations"
  ON organization_members FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
    )
  );
```

### Organization Hooks

```typescript
// hooks/use-organization.ts
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Organization = {
  id: string
  name: string
  slug: string
  role: string
}

export function useOrganization() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchOrgs = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('organization_members')
        .select(`
          role,
          organization:organizations(id, name, slug)
        `)
        .eq('user_id', user.id)

      const orgs = data?.map(m => ({
        ...m.organization,
        role: m.role,
      })) || []

      setOrganizations(orgs)

      // Get current org from cookie or first org
      const savedOrgId = document.cookie
        .split('; ')
        .find(row => row.startsWith('current_org_id='))
        ?.split('=')[1]

      setCurrentOrg(orgs.find(o => o.id === savedOrgId) || orgs[0] || null)
      setLoading(false)
    }

    fetchOrgs()
  }, [])

  const switchOrg = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId)
    if (org) {
      setCurrentOrg(org)
      document.cookie = `current_org_id=${orgId}; path=/`
    }
  }

  return { organizations, currentOrg, switchOrg, loading }
}
```

---

## Migration Checklist

### Pre-Migration
- [ ] Backup existing Clerk user data
- [ ] Document all Clerk features in use
- [ ] Create Supabase project and configure auth providers
- [ ] Set up OAuth apps in Google/GitHub with new redirect URLs

### Code Changes
- [ ] Install `@supabase/ssr` and `@supabase/supabase-js`
- [ ] Remove `@clerk/nextjs`
- [ ] Create Supabase client helpers
- [ ] Replace `ClerkProvider` (remove it)
- [ ] Replace middleware
- [ ] Replace auth hooks (`useUser`, `useAuth`)
- [ ] Replace auth components (SignIn, SignUp, UserButton)
- [ ] Add auth callback route
- [ ] Update all `auth()` calls to `supabase.auth.getUser()`
- [ ] Update all `currentUser()` calls

### Database Changes
- [ ] Update RLS policies to use `auth.uid()`
- [ ] Rename `clerk_user_id` columns to `user_id`
- [ ] Create user profile trigger
- [ ] Migrate organization tables if using Clerk Organizations

### Data Migration
- [ ] Run user migration script
- [ ] Verify all users migrated correctly
- [ ] Send password reset emails to migrated users

### Post-Migration
- [ ] Remove Clerk environment variables
- [ ] Delete Clerk webhook endpoints
- [ ] Update OAuth redirect URLs
- [ ] Test all auth flows thoroughly
- [ ] Monitor for auth errors in production

---

## Common Issues

### 1. Session Not Persisting

Ensure middleware is refreshing the session:

```typescript
// middleware.ts
const { data: { user } } = await supabase.auth.getUser()
// This call refreshes the session cookie
```

### 2. RLS Policies Failing

Check that you're using `auth.uid()` not the old Clerk function:

```sql
-- Wrong
USING (requesting_user_id() = user_id)

-- Correct
USING (auth.uid() = user_id)
```

### 3. OAuth Redirect Errors

Update redirect URLs in Supabase Dashboard:
- Site URL: `https://your-app.com`
- Redirect URLs: `https://your-app.com/auth/callback`

### 4. User Metadata Access

```typescript
// Clerk
user.publicMetadata.role

// Supabase
user.user_metadata?.role
// or from custom profiles table
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('user_id', user.id)
  .single()
```

---

## Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase SSR Package](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [OAuth Setup](https://supabase.com/docs/guides/auth/social-login)
