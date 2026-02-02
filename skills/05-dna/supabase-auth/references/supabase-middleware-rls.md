# Supabase Middleware & RLS Policies

Complete middleware patterns and Row Level Security policies for Next.js 15+.

## Middleware

### Basic Route Protection

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
  const publicRoutes = ['/login', '/signup', '/auth', '/invite', '/']
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
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Advanced Middleware with Subscription Checks

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
  const publicRoutes = ['/login', '/signup', '/auth', '/invite', '/', '/pricing']
  if (publicRoutes.some(route => request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route + '/'))) {
    return response
  }

  // Redirect unauthenticated users
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check subscription for protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const orgIdFromCookie = request.cookies.get('current_org_id')?.value

    if (orgIdFromCookie) {
      const { data: org } = await supabase
        .from('organizations')
        .select('plan_tier, subscription_status')
        .eq('id', orgIdFromCookie)
        .single()

      // Block pro features on free plan
      if (request.nextUrl.pathname.startsWith('/dashboard/pro-features')) {
        if (org?.plan_tier === 'free' || org?.subscription_status !== 'active') {
          return NextResponse.redirect(new URL('/dashboard/upgrade', request.url))
        }
      }

      // Redirect to billing if subscription past due
      if (org?.subscription_status === 'past_due') {
        if (!request.nextUrl.pathname.startsWith('/dashboard/billing')) {
          return NextResponse.redirect(new URL('/dashboard/billing', request.url))
        }
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Route Matchers Pattern

```typescript
// lib/route-matchers.ts
export function createRouteMatcher(patterns: string[]) {
  return (pathname: string) => {
    return patterns.some(pattern => {
      if (pattern.endsWith('(.*)')) {
        const base = pattern.replace('(.*)', '')
        return pathname.startsWith(base)
      }
      return pathname === pattern || pathname.startsWith(pattern + '/')
    })
  }
}

// Usage in middleware
const isPublicRoute = createRouteMatcher([
  '/login',
  '/signup',
  '/auth(.*)',
  '/invite(.*)',
  '/api/webhooks(.*)',
])

const isProRoute = createRouteMatcher([
  '/dashboard/analytics',
  '/dashboard/api-keys',
  '/dashboard/team',
])
```

---

## Complete SQL Schema

```sql
-- ============================================================================
-- CORE USER TABLES
-- ============================================================================

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================================
-- ORGANIZATION TABLES
-- ============================================================================

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  owner_id uuid references auth.users not null,

  -- Stripe
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  subscription_status text default 'incomplete' check (
    subscription_status in ('incomplete', 'incomplete_expired', 'trialing',
                           'active', 'past_due', 'canceled', 'unpaid')
  ),

  -- Plan
  plan_tier text default 'free' check (plan_tier in ('free', 'pro', 'enterprise')),
  trial_ends_at timestamptz,
  subscription_ends_at timestamptz,

  -- Limits
  max_team_members int default 1,
  max_projects int default 3,
  max_api_calls int default 1000,

  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  role text default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  permissions jsonb default '[]'::jsonb,
  invited_by uuid references auth.users,
  joined_at timestamptz default now(),
  unique(organization_id, user_id)
);

create table public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations on delete cascade not null,
  email text not null,
  role text default 'member' check (role in ('admin', 'member', 'viewer')),
  invited_by uuid references auth.users not null,
  token text unique not null default gen_random_uuid()::text,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  declined_at timestamptz,
  created_at timestamptz default now(),
  unique(organization_id, email)
);

create table public.user_preferences (
  user_id uuid references auth.users primary key,
  current_organization_id uuid references organizations,
  theme text default 'light' check (theme in ('light', 'dark', 'system')),
  preferences jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- ============================================================================
-- BILLING TABLES
-- ============================================================================

create table public.subscription_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations not null,
  event_type text not null,
  from_plan text,
  to_plan text,
  stripe_event_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations not null,
  stripe_payment_intent_id text unique,
  stripe_invoice_id text,
  amount int not null,
  currency text default 'usd',
  status text check (status in ('succeeded', 'pending', 'failed', 'refunded')),
  description text,
  receipt_url text,
  created_at timestamptz default now()
);

create table public.usage_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations not null,
  resource_type text not null,
  quantity int not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  created_at timestamptz default now()
);

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations,
  user_id uuid references auth.users,
  action text not null,
  resource_type text,
  resource_id uuid,
  metadata jsonb default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz default now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

create index idx_org_members_user on organization_members(user_id);
create index idx_org_members_org on organization_members(organization_id);
create index idx_invitations_email on organization_invitations(email);
create index idx_invitations_token on organization_invitations(token);
create index idx_orgs_stripe_customer on organizations(stripe_customer_id);
create index idx_orgs_stripe_subscription on organizations(stripe_subscription_id);
create index idx_audit_logs_org on audit_logs(organization_id);
create index idx_audit_logs_user on audit_logs(user_id);
```

---

## Row Level Security (RLS) Policies

### Enable RLS

```sql
alter table profiles enable row level security;
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table organization_invitations enable row level security;
alter table subscription_events enable row level security;
alter table payments enable row level security;
alter table usage_records enable row level security;
alter table audit_logs enable row level security;
alter table user_preferences enable row level security;
```

### Profiles Policies

```sql
-- Anyone can view profiles
create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

-- Users can update their own profile
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Users can insert their own profile
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);
```

### Organizations Policies

```sql
-- Users can only view orgs they're members of
create policy "Users can view their organizations"
  on organizations for select using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = organizations.id
      and organization_members.user_id = auth.uid()
    )
  );

-- Users can create organizations (become owner)
create policy "Users can create organizations"
  on organizations for insert with check (auth.uid() = owner_id);

-- Only owners and admins can update
create policy "Owners and admins can update organization"
  on organizations for update using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = organizations.id
      and organization_members.user_id = auth.uid()
      and organization_members.role in ('owner', 'admin')
    )
  );
```

### Organization Members Policies

```sql
-- Members can view other members in their orgs
create policy "Users can view members of their organizations"
  on organization_members for select using (
    exists (
      select 1 from organization_members om
      where om.organization_id = organization_members.organization_id
      and om.user_id = auth.uid()
    )
  );

-- Admins can manage members
create policy "Admins can manage members"
  on organization_members for all using (
    exists (
      select 1 from organization_members om
      where om.organization_id = organization_members.organization_id
      and om.user_id = auth.uid()
      and om.role in ('owner', 'admin')
    )
  );
```

### Invitations Policies

```sql
-- Admins can view invitations, invitees can view their own
create policy "Users can view organization invitations"
  on organization_invitations for select using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = organization_invitations.organization_id
      and organization_members.user_id = auth.uid()
      and organization_members.role in ('owner', 'admin')
    )
    or email = (select email from auth.users where id = auth.uid())
  );

-- Admins can create invitations
create policy "Admins can create invitations"
  on organization_invitations for insert with check (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = organization_invitations.organization_id
      and organization_members.user_id = auth.uid()
      and organization_members.role in ('owner', 'admin')
    )
  );
```

### Billing Policies

```sql
-- Members can view subscription events
create policy "Users can view org subscription events"
  on subscription_events for select using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = subscription_events.organization_id
      and organization_members.user_id = auth.uid()
    )
  );

-- Only owners can view payments
create policy "Owners can view payment history"
  on payments for select using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = payments.organization_id
      and organization_members.user_id = auth.uid()
      and organization_members.role = 'owner'
    )
  );
```

### User Preferences Policies

```sql
-- Users can only access their own preferences
create policy "Users can manage own preferences"
  on user_preferences for all using (auth.uid() = user_id);
```

### Generic Resource Pattern (Projects, etc.)

```sql
-- Example: Projects table with org-based RLS
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations not null,
  name text not null,
  created_by uuid references auth.users not null,
  created_at timestamptz default now()
);

alter table projects enable row level security;

-- All org members can view projects
create policy "Members can view org projects"
  on projects for select using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = projects.organization_id
      and organization_members.user_id = auth.uid()
    )
  );

-- Members can create projects
create policy "Members can create projects"
  on projects for insert with check (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = projects.organization_id
      and organization_members.user_id = auth.uid()
      and organization_members.role in ('owner', 'admin', 'member')
    )
  );

-- Only owners/admins can delete
create policy "Admins can delete projects"
  on projects for delete using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = projects.organization_id
      and organization_members.user_id = auth.uid()
      and organization_members.role in ('owner', 'admin')
    )
  );
```

---

## Database Triggers

### Auto-create Profile & Org on Signup

```sql
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_org_id uuid;
begin
  -- Create profile
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');

  -- Create default org
  insert into public.organizations (name, slug, owner_id)
  values (
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)) || '''s Workspace',
    lower(replace(coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), ' ', '-')) || '-' || substr(md5(random()::text), 1, 6),
    new.id
  )
  returning id into new_org_id;

  -- Add as owner
  insert into public.organization_members (organization_id, user_id, role)
  values (new_org_id, new.id, 'owner');

  -- Set current org
  insert into public.user_preferences (user_id, current_organization_id)
  values (new.id, new_org_id);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### Auto-update updated_at

```sql
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on profiles
  for each row execute procedure handle_updated_at();

create trigger set_updated_at before update on organizations
  for each row execute procedure handle_updated_at();
```

### RBAC Helper Function

```sql
create or replace function public.user_can(
  p_user_id uuid,
  p_org_id uuid,
  p_required_role text
)
returns boolean as $$
declare
  v_user_role text;
begin
  select role into v_user_role
  from organization_members
  where user_id = p_user_id and organization_id = p_org_id;

  return case p_required_role
    when 'owner' then v_user_role = 'owner'
    when 'admin' then v_user_role in ('owner', 'admin')
    when 'member' then v_user_role in ('owner', 'admin', 'member')
    when 'viewer' then v_user_role in ('owner', 'admin', 'member', 'viewer')
    else false
  end;
end;
$$ language plpgsql security definer;

-- Usage in RLS policies:
-- create policy "Check role"
--   on some_table for select using (user_can(auth.uid(), organization_id, 'member'));
```

---

## Common RLS Patterns

### User-owned data

```sql
-- Simple user isolation
create policy "Users own their data"
  on user_data for all using (auth.uid() = user_id);
```

### Org-scoped data

```sql
-- Members can access org data
create policy "Org members can access"
  on org_data for select using (
    exists (
      select 1 from organization_members
      where organization_id = org_data.organization_id
      and user_id = auth.uid()
    )
  );
```

### Role-based write access

```sql
-- Only admins can write
create policy "Admins can write"
  on sensitive_data for insert with check (
    exists (
      select 1 from organization_members
      where organization_id = sensitive_data.organization_id
      and user_id = auth.uid()
      and role in ('owner', 'admin')
    )
  );
```

### Public read, authenticated write

```sql
create policy "Public read"
  on public_content for select using (true);

create policy "Authenticated write"
  on public_content for insert with check (auth.uid() is not null);
```
