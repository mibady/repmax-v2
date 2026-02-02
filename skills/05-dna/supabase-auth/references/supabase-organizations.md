# Supabase Organizations & Multi-Tenant RBAC

Complete multi-tenant patterns with organizations, invitations, member management, and RBAC.

## Database Schema

```sql
-- ============================================================================
-- ORGANIZATION TABLES
-- ============================================================================

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  owner_id uuid references auth.users not null,

  -- Stripe billing
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  subscription_status text default 'incomplete' check (
    subscription_status in ('incomplete', 'incomplete_expired', 'trialing',
                           'active', 'past_due', 'canceled', 'unpaid')
  ),

  -- Plan details
  plan_tier text default 'free' check (plan_tier in ('free', 'pro', 'enterprise')),
  trial_ends_at timestamptz,
  subscription_ends_at timestamptz,

  -- Usage limits
  max_team_members int default 1,
  max_projects int default 3,
  max_api_calls int default 1000,

  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Organization members
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

-- Invitations
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

-- User preferences (current org)
create table public.user_preferences (
  user_id uuid references auth.users primary key,
  current_organization_id uuid references organizations,
  theme text default 'light' check (theme in ('light', 'dark', 'system')),
  preferences jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- Indexes
create index idx_org_members_user on organization_members(user_id);
create index idx_org_members_org on organization_members(organization_id);
create index idx_invitations_email on organization_invitations(email);
create index idx_invitations_token on organization_invitations(token);
```

---

## Auto-Create Organization on Signup

```sql
-- Function to create default organization on user signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_org_id uuid;
begin
  -- Create profile
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');

  -- Create default organization
  insert into public.organizations (name, slug, owner_id)
  values (
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)) || '''s Organization',
    lower(replace(coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), ' ', '-')) || '-' || substr(md5(random()::text), 1, 6),
    new.id
  )
  returning id into new_org_id;

  -- Add user as owner
  insert into public.organization_members (organization_id, user_id, role)
  values (new_org_id, new.id, 'owner');

  -- Set as current organization
  insert into public.user_preferences (user_id, current_organization_id)
  values (new.id, new_org_id);

  return new;
end;
$$ language plpgsql security definer;

-- Trigger on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## Organization CRUD

### Create Organization

```typescript
// app/api/organizations/create/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()

  // Generate unique slug
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substr(2, 6)

  // Create organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({ name, slug, owner_id: user.id })
    .select()
    .single()

  if (orgError) return NextResponse.json({ error: orgError.message }, { status: 400 })

  // Add user as owner
  await supabase
    .from('organization_members')
    .insert({ organization_id: org.id, user_id: user.id, role: 'owner' })

  return NextResponse.json({ organization: org })
}
```

### Get User's Organizations

```typescript
// lib/organizations.ts
import { createClient } from '@/lib/supabase/server'

export async function getUserOrganizations(userId: string) {
  const supabase = createClient()

  const { data } = await supabase
    .from('organization_members')
    .select(`
      role,
      joined_at,
      organization:organizations (
        id, name, slug, logo_url, plan_tier, subscription_status
      )
    `)
    .eq('user_id', userId)
    .order('joined_at', { ascending: true })

  return data?.map(d => ({
    ...d.organization,
    userRole: d.role,
    joinedAt: d.joined_at,
  })) || []
}

export async function getCurrentOrganization(userId: string) {
  const supabase = createClient()

  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('current_organization_id')
    .eq('user_id', userId)
    .single()

  if (prefs?.current_organization_id) {
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', prefs.current_organization_id)
      .single()

    if (org) return org
  }

  // Fallback to first organization
  const orgs = await getUserOrganizations(userId)
  return orgs[0] || null
}
```

### Switch Organization

```typescript
// app/api/organizations/switch/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { organizationId } = await req.json()

  // Verify user is member
  const { data: member } = await supabase
    .from('organization_members')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return NextResponse.json({ error: 'Not a member' }, { status: 403 })
  }

  // Update preferences
  await supabase
    .from('user_preferences')
    .upsert({ user_id: user.id, current_organization_id: organizationId })

  // Set cookie for faster access
  cookies().set('current_org_id', organizationId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  })

  return NextResponse.json({ success: true })
}
```

---

## Invitation System

### Send Invitation

```typescript
// app/api/invitations/send/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { organizationId, email, role } = await req.json()

  // Check permissions
  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single()

  if (!member || !['owner', 'admin'].includes(member.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  // Get organization
  const { data: org } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', organizationId)
    .single()

  // Create invitation
  const { data: invitation, error } = await supabase
    .from('organization_invitations')
    .insert({ organization_id: organizationId, email, role, invited_by: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Send email
  const inviteUrl = `${process.env.NEXT_PUBLIC_URL}/invite/${invitation.token}`

  await resend.emails.send({
    from: 'App <noreply@yourapp.com>',
    to: email,
    subject: `You've been invited to join ${org?.name}`,
    html: `
      <h1>You've been invited!</h1>
      <p>${user.email} has invited you to join ${org?.name}.</p>
      <a href="${inviteUrl}">Accept Invitation</a>
      <p>This invitation expires in 7 days.</p>
    `,
  })

  return NextResponse.json({ invitation })
}
```

### Accept Invitation

```typescript
// app/api/invitations/accept/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { token } = await req.json()

  // Get invitation
  const { data: invitation, error: inviteError } = await supabase
    .from('organization_invitations')
    .select('*')
    .eq('token', token)
    .is('accepted_at', null)
    .single()

  if (inviteError || !invitation) {
    return NextResponse.json({ error: 'Invalid invitation' }, { status: 400 })
  }

  // Check expiration
  if (new Date(invitation.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Invitation expired' }, { status: 400 })
  }

  // Check email matches
  if (invitation.email !== user.email) {
    return NextResponse.json({ error: 'Email mismatch' }, { status: 400 })
  }

  // Add to organization
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({
      organization_id: invitation.organization_id,
      user_id: user.id,
      role: invitation.role,
      invited_by: invitation.invited_by,
    })

  if (memberError) return NextResponse.json({ error: memberError.message }, { status: 400 })

  // Mark accepted
  await supabase
    .from('organization_invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invitation.id)

  return NextResponse.json({ success: true })
}
```

---

## Member Management

### List Members

```typescript
// app/api/members/list/route.ts
export async function GET(req: Request) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const organizationId = url.searchParams.get('organizationId')

  const { data: members } = await supabase
    .from('organization_members')
    .select(`
      id, role, joined_at,
      user:profiles!inner (id, email, full_name, avatar_url)
    `)
    .eq('organization_id', organizationId)
    .order('joined_at', { ascending: true })

  return NextResponse.json({ members })
}
```

### Update Member Role

```typescript
// app/api/members/update-role/route.ts
export async function POST(req: Request) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { organizationId, memberId, newRole } = await req.json()

  // Check actor permissions
  const { data: actor } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single()

  if (!actor || !['owner', 'admin'].includes(actor.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  // Get target member
  const { data: target } = await supabase
    .from('organization_members')
    .select('role, user_id')
    .eq('id', memberId)
    .single()

  if (!target) return NextResponse.json({ error: 'Member not found' }, { status: 404 })

  // Can't change own role
  if (target.user_id === user.id) {
    return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 })
  }

  // Can't promote to owner
  if (newRole === 'owner') {
    return NextResponse.json({ error: 'Use transfer ownership' }, { status: 400 })
  }

  // Update role
  await supabase
    .from('organization_members')
    .update({ role: newRole })
    .eq('id', memberId)

  return NextResponse.json({ success: true })
}
```

### Remove Member

```typescript
// app/api/members/remove/route.ts
export async function POST(req: Request) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { organizationId, memberId } = await req.json()

  // Check permissions
  const { data: actor } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single()

  if (!actor || !['owner', 'admin'].includes(actor.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  // Get target
  const { data: target } = await supabase
    .from('organization_members')
    .select('role, user_id')
    .eq('id', memberId)
    .single()

  if (!target) return NextResponse.json({ error: 'Member not found' }, { status: 404 })

  // Can't remove yourself or owner
  if (target.user_id === user.id) {
    return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 })
  }
  if (target.role === 'owner') {
    return NextResponse.json({ error: 'Cannot remove owner' }, { status: 400 })
  }

  await supabase.from('organization_members').delete().eq('id', memberId)

  return NextResponse.json({ success: true })
}
```

### Transfer Ownership

```typescript
// app/api/organizations/transfer-ownership/route.ts
export async function POST(req: Request) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { organizationId, newOwnerId } = await req.json()

  // Only owner can transfer
  const { data: org } = await supabase
    .from('organizations')
    .select('owner_id')
    .eq('id', organizationId)
    .single()

  if (org?.owner_id !== user.id) {
    return NextResponse.json({ error: 'Only owner can transfer' }, { status: 403 })
  }

  // Update organization owner
  await supabase
    .from('organizations')
    .update({ owner_id: newOwnerId })
    .eq('id', organizationId)

  // Update new owner's role
  await supabase
    .from('organization_members')
    .update({ role: 'owner' })
    .eq('organization_id', organizationId)
    .eq('user_id', newOwnerId)

  // Downgrade current owner to admin
  await supabase
    .from('organization_members')
    .update({ role: 'admin' })
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)

  return NextResponse.json({ success: true })
}
```

---

## RBAC Permissions

### Permission Definitions

```typescript
// lib/permissions.ts
export const PERMISSIONS = {
  'org.update': ['owner', 'admin'],
  'org.delete': ['owner'],
  'org.billing': ['owner'],

  'members.invite': ['owner', 'admin'],
  'members.remove': ['owner', 'admin'],
  'members.update_role': ['owner'],

  'projects.create': ['owner', 'admin', 'member'],
  'projects.update': ['owner', 'admin', 'member'],
  'projects.delete': ['owner', 'admin'],
  'projects.view': ['owner', 'admin', 'member', 'viewer'],
} as const

export type Permission = keyof typeof PERMISSIONS
export type Role = 'owner' | 'admin' | 'member' | 'viewer'

export function hasPermission(userRole: Role, permission: Permission): boolean {
  return PERMISSIONS[permission].includes(userRole)
}
```

### Server-Side Permission Check

```typescript
// lib/rbac.ts
import { createClient } from '@/lib/supabase/server'
import { hasPermission, type Permission, type Role } from './permissions'

export async function requirePermission(
  userId: string,
  organizationId: string,
  permission: Permission
) {
  const supabase = createClient()

  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .single()

  if (!member) throw new Error('Not a member')
  if (!hasPermission(member.role as Role, permission)) {
    throw new Error(`Insufficient permissions: requires ${permission}`)
  }

  return member.role as Role
}
```

### Client-Side Permission Hook

```typescript
// hooks/use-permissions.ts
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { hasPermission, type Permission, type Role } from '@/lib/permissions'

export function usePermissions(organizationId: string) {
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function loadRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: member } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', user.id)
        .eq('organization_id', organizationId)
        .single()

      setRole(member?.role as Role || null)
      setLoading(false)
    }

    loadRole()
  }, [organizationId])

  const can = (permission: Permission) => role ? hasPermission(role, permission) : false
  const isOwner = role === 'owner'
  const isAdmin = role === 'admin' || role === 'owner'

  return { role, can, isOwner, isAdmin, loading }
}

// Usage:
// const { can, isOwner } = usePermissions(orgId)
// {can('members.invite') && <InviteButton />}
```

---

## Usage Limits

### Check Limits

```typescript
// lib/usage.ts
import { createClient } from '@/lib/supabase/server'

export async function checkUsageLimit(
  organizationId: string,
  resourceType: 'team_members' | 'projects' | 'api_calls'
) {
  const supabase = createClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single()

  if (!org) throw new Error('Organization not found')

  let currentUsage = 0
  let limit = 0

  switch (resourceType) {
    case 'team_members':
      const { count: memberCount } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)

      currentUsage = memberCount || 0
      limit = org.max_team_members
      break

    case 'projects':
      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)

      currentUsage = projectCount || 0
      limit = org.max_projects
      break
  }

  return {
    currentUsage,
    limit,
    canCreate: currentUsage < limit,
    percentage: (currentUsage / limit) * 100,
    remaining: limit - currentUsage,
  }
}
```

### Enforce in API Routes

```typescript
// app/api/projects/create/route.ts
export async function POST(req: Request) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { organizationId, name } = await req.json()

  // Check limit
  const usage = await checkUsageLimit(organizationId, 'projects')

  if (!usage.canCreate) {
    return NextResponse.json({
      error: 'Project limit reached',
      currentUsage: usage.currentUsage,
      limit: usage.limit,
      upgradeRequired: true,
    }, { status: 403 })
  }

  // Create project
  const { data: project, error } = await supabase
    .from('projects')
    .insert({ organization_id: organizationId, name, created_by: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ project })
}
```
