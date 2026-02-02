# Supabase - PostgreSQL Database with Real-time Features

**Official Website:** https://supabase.com
**Documentation:** https://supabase.com/docs
**Pricing:** Free tier: 500MB database, 2GB bandwidth

---

## Overview

Supabase is an open-source Firebase alternative built on PostgreSQL. It provides a full Postgres database, real-time subscriptions, authentication, instant APIs, storage, and edge functions. Perfect for building modern applications with real-time features.

### Key Features

- ✅ PostgreSQL database
- ✅ Real-time subscriptions
- ✅ Auto-generated REST APIs
- ✅ Auto-generated GraphQL APIs
- ✅ File storage
- ✅ Edge functions
- ✅ Database webhooks
- ✅ Row-level security (RLS)
- ✅ Full-text search
- ✅ Database migrations
- ✅ TypeScript support
- ✅ Next.js optimized

---

## Use Cases for AI Coder

1. **Data Storage**
   - User data
   - Application state
   - Transaction history
   - Logs and analytics

2. **Real-time Features**
   - Live chat
   - Collaborative editing
   - Notifications
   - Activity feeds

3. **File Storage**
   - User uploads
   - Images and videos
   - Documents
   - AI-generated content

4. **Vector Storage**
   - AI embeddings
   - Similarity search
   - RAG applications
   - Semantic search

---

## Quick Start

### 1. Installation

```bash
npm install @supabase/supabase-js
# or
pnpm add @supabase/supabase-js
```

### 2. Create Supabase Project

1. Sign up at https://supabase.com
2. Create a new project
3. Copy your project URL and anon key
4. Add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
```

### 3. Initialize Client

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### 4. Server-Side Client

```typescript
// lib/supabase/server.ts
import { createClient } from '@supabase/supabase-js';

export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
```

---

## Database Operations

### Insert Data

```typescript
// app/actions/create-post.ts
'use server';

import { supabase } from '@/lib/supabase/client';
import { createClient } from '@/lib/supabase/server';

export async function createPost(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  const { data, error } = await supabase
    .from('posts')
    .insert([
      {
        title,
        content,
        user_id: userId,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
```

### Query Data

```typescript
// app/posts/page.tsx
import { createServerClient } from '@/lib/supabase/server';

export default async function PostsPage() {
  const supabase = createServerClient();

  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:users(name, avatar_url),
      comments(count)
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching posts:', error);
    return <div>Error loading posts</div>;
  }

  return (
    <div>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <span>By {post.author.name}</span>
          <span>{post.comments[0].count} comments</span>
        </article>
      ))}
    </div>
  );
}
```

### Update Data

```typescript
// app/actions/update-post.ts
'use server';

import { supabase } from '@/lib/supabase/client';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updatePost(postId: string, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  const { data, error } = await supabase
    .from('posts')
    .update({ title, content, updated_at: new Date().toISOString() })
    .eq('id', postId)
    .eq('user_id', userId) // Ensure user owns the post
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/posts/${postId}`);
  return data;
}
```

### Delete Data

```typescript
// app/actions/delete-post.ts
'use server';

import { supabase } from '@/lib/supabase/client';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deletePost(postId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/posts');
}
```

---

## Real-time Subscriptions

### Subscribe to Changes

```typescript
// components/real-time-posts.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type Post = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

export function RealTimePosts() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    // Initial fetch
    const fetchPosts = async () => {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setPosts(data);
      }
    };

    fetchPosts();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('posts-channel')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPosts((current) => [payload.new as Post, ...current]);
          }

          if (payload.eventType === 'UPDATE') {
            setPosts((current) =>
              current.map((post) =>
                post.id === payload.new.id ? (payload.new as Post) : post
              )
            );
          }

          if (payload.eventType === 'DELETE') {
            setPosts((current) =>
              current.filter((post) => post.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  );
}
```

### Presence (Online Users)

```typescript
// components/online-users.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type User = {
  id: string;
  name: string;
  online_at: string;
};

export function OnlineUsers({ roomId }: { roomId: string }) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const channel = supabase.channel(`room:${roomId}`, {
      config: {
        presence: {
          key: 'user-id',
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineUsers = Object.values(state).flat() as User[];
        setUsers(onlineUsers);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: 'user-123',
            name: 'John Doe',
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return (
    <div>
      <h3>Online Users ({users.length})</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## File Storage

### Upload File

```typescript
// app/actions/upload-file.ts
'use server';

import { createServerClient } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';

export async function uploadFile(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const file = formData.get('file') as File;
  const supabase = createServerClient();

  // Upload file
  const fileName = `${userId}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('uploads').getPublicUrl(data.path);

  return { url: publicUrl, path: data.path };
}
```

### Download File

```typescript
// app/actions/download-file.ts
'use server';

import { createServerClient } from '@/lib/supabase/server';

export async function downloadFile(path: string) {
  const supabase = createServerClient();

  const { data, error } = await supabase.storage
    .from('uploads')
    .download(path);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
```

### Delete File

```typescript
// app/actions/delete-file.ts
'use server';

import { createServerClient } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';

export async function deleteFile(path: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const supabase = createServerClient();

  const { error } = await supabase.storage.from('uploads').remove([path]);

  if (error) {
    throw new Error(error.message);
  }
}
```

### Upload Component

```typescript
// components/file-upload.tsx
'use client';

import { useState } from 'react';
import { uploadFile } from '@/app/actions/upload-file';

export function FileUpload() {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await uploadFile(formData);
      console.log('Uploaded:', result.url);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <input type="file" name="file" required />
      <button type="submit" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
}
```

---

## Row-Level Security (RLS)

### Enable RLS

```sql
-- Enable RLS on posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all posts
CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT
  USING (true);

-- Policy: Users can insert their own posts
CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own posts
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);
```

### RLS with Clerk

```sql
-- Create function to get Clerk user ID from JWT
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    (current_setting('request.jwt.claims', true)::json->>'user_metadata')::json->>'user_id'
  )::text;
$$ LANGUAGE SQL STABLE;

-- Policy using Clerk user ID
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (requesting_user_id() = user_id);
```

---

## Database Types

### Generate TypeScript Types

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Generate types
supabase gen types typescript --project-id your-project-ref > lib/supabase/database.types.ts
```

### Use Generated Types

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Typed queries
const { data } = await supabase.from('posts').select('*');
// data is typed as Database['public']['Tables']['posts']['Row'][]
```

---

## Vector Search (pgvector)

### Enable Vector Extension

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table with vector column
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT,
  embedding vector(1536), -- OpenAI embeddings are 1536 dimensions
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster similarity search
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops);
```

### Store Embeddings

```typescript
// app/actions/store-document.ts
'use server';

import { createServerClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function storeDocument(content: string, metadata: any) {
  // Generate embedding
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: content,
  });

  const embedding = response.data[0].embedding;

  // Store in Supabase
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('documents')
    .insert([
      {
        content,
        embedding,
        metadata,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
```

### Similarity Search

```typescript
// app/actions/search-documents.ts
'use server';

import { createServerClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function searchDocuments(query: string, limit = 5) {
  // Generate query embedding
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });

  const embedding = response.data[0].embedding;

  // Search for similar documents
  const supabase = createServerClient();

  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.78,
    match_count: limit,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
```

### Create Match Function

```sql
-- Function to find similar documents
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity float
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    id,
    content,
    metadata,
    1 - (embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
```

---

## Integration with AI Coder Services

### With Clerk (Authentication)

```typescript
// lib/supabase/with-clerk.ts
import { createClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

export async function getSupabaseWithClerk() {
  const { getToken } = auth();

  // Get Supabase token from Clerk
  const token = await getToken({ template: 'supabase' });

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
}

// Usage
const supabase = await getSupabaseWithClerk();
const { data } = await supabase.from('posts').select('*');
```

### With Inngest (Background Jobs)

```typescript
// inngest/functions/sync-data.ts
import { inngest } from '@/lib/inngest';
import { createServerClient } from '@/lib/supabase/server';

export const syncDataToSupabase = inngest.createFunction(
  { id: 'sync-data-to-supabase' },
  { event: 'data.sync' },
  async ({ event, step }) => {
    const supabase = createServerClient();

    await step.run('insert-data', async () => {
      const { error } = await supabase.from('analytics').insert(event.data);

      if (error) {
        throw new Error(error.message);
      }
    });
  }
);
```

### With Resend (Email)

```typescript
// Trigger email when data changes
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM
    net.http_post(
      url := 'https://yourdomain.com/api/webhooks/supabase',
      body := jsonb_build_object(
        'event', 'comment.created',
        'data', row_to_json(NEW)
      )
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_created
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_comment();
```

---

## Best Practices

### 1. Environment Variables

```bash
# Public (safe for client-side)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx

# Secret (server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
```

### 2. Use RLS for Security

Always enable Row-Level Security and create appropriate policies:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);
```

### 3. Optimize Queries

```typescript
// Good: Select only needed columns
const { data } = await supabase
  .from('posts')
  .select('id, title, created_at')
  .limit(10);

// Bad: Select everything
const { data } = await supabase.from('posts').select('*');
```

### 4. Handle Errors

```typescript
const { data, error } = await supabase.from('posts').select('*');

if (error) {
  console.error('Supabase error:', error);
  // Handle error appropriately
  throw new Error(error.message);
}

return data;
```

### 5. Use Indexes

```sql
-- Create index for faster queries
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

---

## Pricing

**Free Tier:**
- 500MB database
- 1GB file storage
- 2GB bandwidth
- 50,000 monthly active users
- Unlimited API requests

**Pro ($25/month):**
- 8GB database
- 100GB file storage
- 250GB bandwidth
- 100,000 monthly active users
- Daily backups

**Enterprise:**
- Custom pricing
- Dedicated resources
- SLA guarantees
- Priority support

---

## Supabase CLI

The Supabase CLI allows direct database operations, migrations, and project management from the terminal.

### Installation

```bash
# macOS
brew install supabase/tap/supabase

# npm (cross-platform)
npm install -g supabase

# Or use npx without installing
npx supabase <command>
```

### Authentication

```bash
# Interactive login (opens browser)
supabase login

# Or set access token as environment variable
export SUPABASE_ACCESS_TOKEN=your_access_token_here

# Verify login
supabase projects list
```

**Get your access token:** https://supabase.com/dashboard/account/tokens

### Project Setup

```bash
# Initialize Supabase in your project
supabase init

# Link to existing remote project
supabase link --project-ref <project-id>

# Start local development stack (Postgres, Auth, Storage, etc.)
supabase start

# Stop local stack
supabase stop
```

### Database Operations

```bash
# Open psql connection to remote database
supabase db remote commit

# Execute SQL directly on remote database
supabase db execute --file ./path/to/script.sql

# Execute inline SQL
supabase db execute --command "SELECT * FROM users LIMIT 10;"

# Dump remote database schema
supabase db dump --file schema.sql

# Dump with data
supabase db dump --file backup.sql --data-only

# Push local migrations to remote
supabase db push

# Pull remote schema changes to local
supabase db pull

# Reset local database
supabase db reset
```

### Migrations

```bash
# Create new migration
supabase migration new create_users_table

# Apply migrations to local database
supabase migration up

# List migrations
supabase migration list

# Repair migration history
supabase migration repair --status applied <version>
```

### Type Generation

```bash
# Generate TypeScript types from remote database
supabase gen types typescript --project-id <project-id> > lib/supabase/database.types.ts

# Generate from local database
supabase gen types typescript --local > lib/supabase/database.types.ts

# Generate with schema filter
supabase gen types typescript --project-id <project-id> --schema public,auth > types.ts
```

### Edge Functions

```bash
# Create new edge function
supabase functions new my-function

# Serve functions locally
supabase functions serve

# Deploy function to remote
supabase functions deploy my-function

# Deploy all functions
supabase functions deploy

# View function logs
supabase functions logs my-function
```

### Storage

```bash
# List storage buckets
supabase storage ls

# Create bucket
supabase storage create my-bucket

# Upload file
supabase storage upload my-bucket/path/file.txt ./local-file.txt

# Download file
supabase storage download my-bucket/path/file.txt ./local-file.txt
```

### Secrets Management

```bash
# List secrets
supabase secrets list

# Set secret
supabase secrets set MY_SECRET=value

# Set multiple secrets from .env file
supabase secrets set --env-file .env.production

# Unset secret
supabase secrets unset MY_SECRET
```

### Useful Commands

```bash
# View project status
supabase status

# View all projects
supabase projects list

# Get database connection string
supabase db remote connection-string

# Inspect database schema
supabase inspect db table-sizes
supabase inspect db index-sizes
supabase inspect db blocking
supabase inspect db locks
```

### Environment Variables for CLI

```bash
# Add to .env or shell profile
export SUPABASE_ACCESS_TOKEN=sbp_xxxxx      # Personal access token
export SUPABASE_DB_PASSWORD=your_db_pass     # Database password (for some operations)
```

### AI Agent Usage

When working with Supabase via CLI in an AI coding context:

1. **Always use environment variables** - never hardcode tokens
2. **Prefer `supabase db execute`** for direct SQL execution
3. **Use `--project-ref`** flag when not in a linked project directory
4. **Generate types after schema changes** to keep TypeScript in sync

```bash
# Example: Run migration on remote database
export SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN
supabase db execute --project-ref <project-id> --file ./supabase/migrations/001_create_tables.sql

# Example: Quick query
supabase db execute --project-ref <project-id> --command "SELECT count(*) FROM users;"
```

---

## Resources

- **Documentation:** https://supabase.com/docs
- **Dashboard:** https://app.supabase.com
- **SQL Editor:** https://app.supabase.com/project/_/sql
- **Examples:** https://github.com/supabase/supabase/tree/master/examples
- **Discord:** https://discord.supabase.com

---

## Next Steps

1. Create Supabase project
2. Install Supabase JS client
3. Set up environment variables
4. Create database tables
5. Enable Row-Level Security
6. Generate TypeScript types
7. Implement queries
8. Set up real-time subscriptions
9. Configure storage buckets

For more examples, see the template repositories in `/home/mibady/ai-coder-workspace/templates/`.
