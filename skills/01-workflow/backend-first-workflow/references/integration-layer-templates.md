# Integration Layer Templates

Code templates for auto-generating hooks, actions, and types at Stage 3.

---

## Type Generation

### Command

```bash
npx supabase gen types typescript --local > types/database.ts
```

### Output Structure

```typescript
// types/database.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // ... more tables
    }
  }
}

// Convenience exports
export type Profile = Database['public']['Tables']['profiles']['Row']
export type {Entity} = Database['public']['Tables']['{entity}s']['Row']
```

---

## Hook Templates

### Base Hook (List)

```typescript
// Template: hooks/use-{entity}.ts

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Database } from '@/types/database'

type {Entity} = Database['public']['Tables']['{entity}s']['Row']

/**
 * Fetch all {entity}s for the current user
 */
export function use{Entity}s() {
  return useQuery({
    queryKey: ['{entity}s'],
    queryFn: async () => {
      const res = await fetch('/api/{entity}s')
      if (!res.ok) {
        throw new Error('Failed to fetch {entity}s')
      }
      return res.json() as Promise<{Entity}[]>
    },
  })
}

/**
 * Fetch a single {entity} by ID
 */
export function use{Entity}(id: string | undefined) {
  return useQuery({
    queryKey: ['{entity}s', id],
    queryFn: async () => {
      const res = await fetch(`/api/{entity}s/${id}`)
      if (!res.ok) {
        throw new Error('Failed to fetch {entity}')
      }
      return res.json() as Promise<{Entity}>
    },
    enabled: !!id,
  })
}

/**
 * Create a new {entity}
 */
export function useCreate{Entity}() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Omit<{Entity}, 'id' | 'created_at' | 'updated_at'>>) => {
      const res = await fetch('/api/{entity}s', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to create {entity}')
      }
      return res.json() as Promise<{Entity}>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['{entity}s'] })
    },
  })
}

/**
 * Update an existing {entity}
 */
export function useUpdate{Entity}() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<{Entity}> & { id: string }) => {
      const res = await fetch(`/api/{entity}s/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to update {entity}')
      }
      return res.json() as Promise<{Entity}>
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['{entity}s'] })
      queryClient.invalidateQueries({ queryKey: ['{entity}s', variables.id] })
    },
  })
}

/**
 * Delete a {entity}
 */
export function useDelete{Entity}() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/{entity}s/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to delete {entity}')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['{entity}s'] })
    },
  })
}
```

### Auth Hook

```typescript
// hooks/use-user.ts

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchProfile(user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    setProfile(data);
    setLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  async function signInWithEmail(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }

  return {
    user,
    profile,
    loading,
    signOut,
    signInWithGoogle,
    signInWithEmail,
  };
}
```

### Preferences/Settings Hook

```typescript
// hooks/use-preferences.ts

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface Preferences {
  theme: "light" | "dark" | "system";
  notifications_enabled: boolean;
  email_frequency: "daily" | "weekly" | "never";
  sidebar_collapsed: boolean;
}

export function usePreferences() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["preferences"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as Preferences | null;
    },
  });

  const mutation = useMutation({
    mutationFn: async (preferences: Partial<Preferences>) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preferences"] });
    },
  });

  return {
    preferences: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updatePreferences: mutation.mutate,
    isUpdating: mutation.isPending,
  };
}
```

---

## Action Templates

### Base Actions (CRUD)

```typescript
// Template: lib/actions/{entity}-actions.ts

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/database'

type {Entity} = Database['public']['Tables']['{entity}s']['Row']
type {Entity}Insert = Database['public']['Tables']['{entity}s']['Insert']
type {Entity}Update = Database['public']['Tables']['{entity}s']['Update']

/**
 * Get all {entity}s for the current user
 */
export async function get{Entity}s(): Promise<{Entity}[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('{entity}s')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get a single {entity} by ID
 */
export async function get{Entity}(id: string): Promise<{Entity}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('{entity}s')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Create a new {entity}
 */
export async function create{Entity}(
  formData: FormData
): Promise<{ success: boolean; data?: {Entity}; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const insertData: {Entity}Insert = {
    user_id: user.id,
    // Map form data to columns - customize per entity
    name: formData.get('name') as string,
    description: formData.get('description') as string | null,
    // Add more fields as needed
  }

  const { data, error } = await supabase
    .from('{entity}s')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/app/{entity}s')
  return { success: true, data }
}

/**
 * Update an existing {entity}
 */
export async function update{Entity}(
  id: string,
  formData: FormData
): Promise<{ success: boolean; data?: {Entity}; error?: string }> {
  const supabase = await createClient()

  const updateData: {Entity}Update = {
    // Map form data to columns - customize per entity
    name: formData.get('name') as string,
    description: formData.get('description') as string | null,
    updated_at: new Date().toISOString(),
    // Add more fields as needed
  }

  const { data, error } = await supabase
    .from('{entity}s')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/app/{entity}s')
  revalidatePath(`/app/{entity}s/${id}`)
  return { success: true, data }
}

/**
 * Delete a {entity}
 */
export async function delete{Entity}(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('{entity}s')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/app/{entity}s')
  return { success: true }
}
```

### Auth Actions

```typescript
// lib/actions/auth-actions.ts

"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/auth/verify");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/app/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();

  const password = formData.get("password") as string;

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  redirect("/app/dashboard");
}
```

---

## Placeholder Page Templates

### List Page

```typescript
// Template: app/(app)/{entity}s/page.tsx

import { get{Entity}s } from '@/lib/actions/{entity}-actions'

export default async function {Entity}sPage() {
  const {entity}s = await get{Entity}s()

  return (
    <main className="min-h-screen p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{Entity}s</h1>
        <p className="text-muted-foreground">
          Replace with Stitch-generated UI from docs/STITCH-DESIGN-PROMPTS.md
        </p>
      </div>

      {/*
        INTEGRATION POINTS:
        ────────────────────────────────────────────────────
        DATA:
          - {entity}s loaded via get{Entity}s() server action
          - {entity}s.length = {JSON.stringify({entity}s.length)} items

        HOOKS (for client components):
          import { use{Entity}s, useCreate{Entity}, useDelete{Entity} } from '@/hooks/use-{entity}'

        ACTIONS (for forms/buttons):
          import { create{Entity}, update{Entity}, delete{Entity} } from '@/lib/actions/{entity}-actions'

        TYPES:
          import type { {Entity} } from '@/types/database'

        STATES TO IMPLEMENT:
          - Empty state: when {entity}s.length === 0
          - Loading state: show skeleton while fetching
          - Error state: handle fetch failures
        ────────────────────────────────────────────────────
      */}

      {/* Debug output - remove after Stitch integration */}
      <div className="mt-4 p-4 bg-muted rounded text-xs font-mono">
        <p className="mb-2 text-muted-foreground">Loaded {entity}s ({entity}s.length}):</p>
        <pre>{JSON.stringify({entity}s, null, 2)}</pre>
      </div>
    </main>
  )
}
```

### Detail Page

```typescript
// Template: app/(app)/{entity}s/[id]/page.tsx

import { get{Entity} } from '@/lib/actions/{entity}-actions'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function {Entity}DetailPage({ params }: Props) {
  const { id } = await params

  try {
    const {entity} = await get{Entity}(id)

    return (
      <main className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-4">{Entity} Details</h1>
        <p className="text-muted-foreground">
          Replace with Stitch-generated UI from docs/STITCH-DESIGN-PROMPTS.md
        </p>

        {/*
          INTEGRATION POINTS:
          ────────────────────────────────────────────────────
          DATA:
            - {entity} loaded via get{Entity}(id)
            - {entity}.id = {id}

          HOOKS (for client components):
            import { use{Entity}, useUpdate{Entity}, useDelete{Entity} } from '@/hooks/use-{entity}'

          ACTIONS (for forms):
            import { update{Entity}, delete{Entity} } from '@/lib/actions/{entity}-actions'

            // Form example:
            <form action={update{Entity}.bind(null, id)}>
              <input name="name" defaultValue={{entity}.name} />
              <button type="submit">Save</button>
            </form>

          NAVIGATION:
            - Back link: /app/{entity}s
            - Edit: In-place or modal
            - Delete: With confirmation
          ────────────────────────────────────────────────────
        */}

        <div className="mt-4 p-4 bg-muted rounded text-xs font-mono">
          <pre>{JSON.stringify({entity}, null, 2)}</pre>
        </div>
      </main>
    )
  } catch {
    notFound()
  }
}
```

### Create Page

```typescript
// Template: app/(app)/{entity}s/new/page.tsx

import { create{Entity} } from '@/lib/actions/{entity}-actions'

export default function New{Entity}Page() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Create {Entity}</h1>
      <p className="text-muted-foreground mb-6">
        Replace with Stitch-generated UI from docs/STITCH-DESIGN-PROMPTS.md
      </p>

      {/*
        INTEGRATION POINTS:
        ────────────────────────────────────────────────────
        FORM ACTION:
          <form action={create{Entity}}>
            <input name="name" required />
            <textarea name="description" />
            <button type="submit">Create</button>
          </form>

        CLIENT ALTERNATIVE:
          import { useCreate{Entity} } from '@/hooks/use-{entity}'

          const create = useCreate{Entity}()
          const handleSubmit = (data) => create.mutate(data)

        VALIDATION:
          - Use Zod schema for validation
          - Show field-level errors
          - Disable submit while pending
        ────────────────────────────────────────────────────
      */}

      {/* Basic working form - replace with Stitch UI */}
      <form action={create{Entity}} className="space-y-4 max-w-md">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-primary text-primary-foreground rounded"
        >
          Create {Entity}
        </button>
      </form>
    </main>
  )
}
```

---

## API Route Templates

### List/Create Route

```typescript
// Template: app/api/{entity}s/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("{entity}s")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from("{entity}s")
      .insert({
        user_id: user.id,
        ...body,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

### Detail Route

```typescript
// Template: app/api/{entity}s/[id]/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("{entity}s")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from("{entity}s")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase.from("{entity}s").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return new Response(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```
