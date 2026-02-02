# Upstash Redis - Serverless Redis Database

**Official Website:** https://upstash.com
**Documentation:** https://upstash.com/docs/redis
**Pricing:** Free tier: 10,000 commands/day

---

## Overview

Upstash Redis is a serverless Redis database designed for serverless and edge functions. It provides a REST API alongside the traditional Redis protocol, making it perfect for serverless environments with connection limitations. Pay-per-request pricing with built-in durability and global replication.

### Key Features

- ✅ Serverless Redis (no connection management)
- ✅ REST API & Redis protocol
- ✅ Global replication
- ✅ Durable storage
- ✅ TLS encryption
- ✅ Built-in rate limiting
- ✅ Multi-region support
- ✅ Edge-compatible
- ✅ TypeScript SDK
- ✅ Pay-per-request pricing

---

## Use Cases for AI Coder

1. **Caching**
   - API responses
   - Database queries
   - Computed results
   - Session data

2. **Rate Limiting**
   - API throttling
   - User quotas
   - Abuse prevention
   - Cost control

3. **Session Management**
   - User sessions
   - Shopping carts
   - Temporary data
   - Form progress

4. **Real-time Features**
   - Leaderboards
   - Counters
   - Live analytics
   - Pub/Sub messaging

---

## Quick Start

### 1. Installation

```bash
npm install @upstash/redis
# or
pnpm add @upstash/redis
```

### 2. Create Redis Database

1. Sign up at https://upstash.com
2. Create a new Redis database
3. Copy your REST URL and token
4. Add to `.env.local`:

```bash
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

### 3. Initialize Client

```typescript
// lib/upstash-redis.ts
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

---

## Basic Operations

### Get & Set

```typescript
// app/api/cache/route.ts
import { redis } from '@/lib/upstash-redis';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (!key) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 });
  }

  // Get value
  const value = await redis.get(key);

  return NextResponse.json({ value });
}

export async function POST(request: Request) {
  const { key, value, ttl } = await request.json();

  // Set value with optional TTL (in seconds)
  if (ttl) {
    await redis.setex(key, ttl, value);
  } else {
    await redis.set(key, value);
  }

  return NextResponse.json({ success: true });
}
```

### Expiration

```typescript
// Set with expiration
await redis.setex('session:123', 3600, { userId: 'user-123' }); // 1 hour

// Set expiration on existing key
await redis.expire('key', 300); // 5 minutes

// Get TTL
const ttl = await redis.ttl('key');
```

### Delete

```typescript
// Delete single key
await redis.del('key');

// Delete multiple keys
await redis.del('key1', 'key2', 'key3');
```

---

## Caching Patterns

### Cache Aside

```typescript
// app/actions/get-user.ts
'use server';

import { redis } from '@/lib/upstash-redis';
import { db } from '@/lib/db';

export async function getUser(userId: string) {
  // Try cache first
  const cached = await redis.get(`user:${userId}`);

  if (cached) {
    return JSON.parse(cached as string);
  }

  // Fetch from database
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  // Store in cache for 1 hour
  await redis.setex(`user:${userId}`, 3600, JSON.stringify(user));

  return user;
}
```

### Write-Through Cache

```typescript
// app/actions/update-user.ts
'use server';

import { redis } from '@/lib/upstash-redis';
import { db } from '@/lib/db';

export async function updateUser(userId: string, data: any) {
  // Update database
  const user = await db.user.update({
    where: { id: userId },
    data,
  });

  // Update cache
  await redis.setex(`user:${userId}`, 3600, JSON.stringify(user));

  return user;
}
```

### Cache Invalidation

```typescript
// app/actions/delete-user.ts
'use server';

import { redis } from '@/lib/upstash-redis';
import { db } from '@/lib/db';

export async function deleteUser(userId: string) {
  // Delete from database
  await db.user.delete({
    where: { id: userId },
  });

  // Invalidate cache
  await redis.del(`user:${userId}`);
}
```

---

## Rate Limiting

### Fixed Window Rate Limiting

```typescript
// lib/rate-limit.ts
import { redis } from '@/lib/upstash-redis';

export async function rateLimit(
  identifier: string,
  limit: number,
  window: number
) {
  const key = `rate_limit:${identifier}`;

  // Increment counter
  const count = await redis.incr(key);

  // Set expiration on first request
  if (count === 1) {
    await redis.expire(key, window);
  }

  // Check if limit exceeded
  const isAllowed = count <= limit;
  const remaining = Math.max(0, limit - count);

  return {
    isAllowed,
    remaining,
    count,
  };
}
```

### Use in API Route

```typescript
// app/api/ai/chat/route.ts
import { rateLimit } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: 10 requests per hour
  const { isAllowed, remaining } = await rateLimit(userId, 10, 3600);

  if (!isAllowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        remaining: 0,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  // Process request
  const { message } = await request.json();
  const response = await processChat(message);

  return NextResponse.json(
    { response },
    {
      headers: {
        'X-RateLimit-Remaining': remaining.toString(),
      },
    }
  );
}
```

### Sliding Window Rate Limiting

```typescript
// lib/sliding-rate-limit.ts
import { redis } from '@/lib/upstash-redis';

export async function slidingRateLimit(
  identifier: string,
  limit: number,
  window: number
) {
  const key = `sliding:${identifier}`;
  const now = Date.now();
  const windowStart = now - window * 1000;

  // Remove old entries
  await redis.zremrangebyscore(key, 0, windowStart);

  // Count current requests
  const count = await redis.zcard(key);

  if (count >= limit) {
    return {
      isAllowed: false,
      remaining: 0,
      count,
    };
  }

  // Add current request
  await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` });

  // Set expiration
  await redis.expire(key, window);

  return {
    isAllowed: true,
    remaining: limit - count - 1,
    count: count + 1,
  };
}
```

---

## Advanced Data Structures

### Lists

```typescript
// Queue implementation
export class Queue {
  constructor(private queueName: string) {}

  async push(item: any) {
    await redis.rpush(this.queueName, JSON.stringify(item));
  }

  async pop() {
    const item = await redis.lpop(this.queueName);
    return item ? JSON.parse(item as string) : null;
  }

  async length() {
    return redis.llen(this.queueName);
  }
}

// Usage
const taskQueue = new Queue('tasks');
await taskQueue.push({ type: 'email', to: 'user@example.com' });
const task = await taskQueue.pop();
```

### Sets

```typescript
// Track unique visitors
async function trackVisitor(pageId: string, userId: string) {
  const key = `visitors:${pageId}`;
  await redis.sadd(key, userId);
  await redis.expire(key, 86400); // 24 hours
}

// Get unique visitor count
async function getVisitorCount(pageId: string) {
  return redis.scard(`visitors:${pageId}`);
}

// Check if user visited
async function hasVisited(pageId: string, userId: string) {
  return redis.sismember(`visitors:${pageId}`, userId);
}
```

### Sorted Sets (Leaderboards)

```typescript
// lib/leaderboard.ts
import { redis } from '@/lib/upstash-redis';

export class Leaderboard {
  constructor(private name: string) {}

  async addScore(userId: string, score: number) {
    await redis.zadd(this.name, { score, member: userId });
  }

  async getTopPlayers(count: number = 10) {
    return redis.zrange(this.name, 0, count - 1, {
      rev: true,
      withScores: true,
    });
  }

  async getRank(userId: string) {
    return redis.zrevrank(this.name, userId);
  }

  async getScore(userId: string) {
    return redis.zscore(this.name, userId);
  }

  async incrementScore(userId: string, increment: number) {
    return redis.zincrby(this.name, increment, userId);
  }
}

// Usage
const leaderboard = new Leaderboard('game:scores');
await leaderboard.addScore('user-123', 1000);
const topPlayers = await leaderboard.getTopPlayers(10);
```

### Hashes

```typescript
// Store user sessions
async function createSession(sessionId: string, data: Record<string, any>) {
  const key = `session:${sessionId}`;
  await redis.hset(key, data);
  await redis.expire(key, 86400); // 24 hours
}

async function getSession(sessionId: string) {
  return redis.hgetall(`session:${sessionId}`);
}

async function updateSession(sessionId: string, field: string, value: any) {
  await redis.hset(`session:${sessionId}`, { [field]: value });
}
```

---

## Integration with AI Coder Services

### With Next.js App Router

```typescript
// app/api/data/route.ts
import { redis } from '@/lib/upstash-redis';
import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Works in Edge Runtime!

export async function GET() {
  const data = await redis.get('app:config');
  return NextResponse.json({ data });
}
```

### With Clerk (Session Management)

```typescript
// lib/session.ts
import { redis } from '@/lib/upstash-redis';
import { createClient } from '@/lib/supabase/server';

export async function getUserSession() {
  const { userId, sessionId } = auth();

  if (!userId || !sessionId) {
    return null;
  }

  const key = `session:${userId}:${sessionId}`;
  const session = await redis.get(key);

  return session ? JSON.parse(session as string) : null;
}

export async function setUserSession(data: any) {
  const { userId, sessionId } = auth();

  if (!userId || !sessionId) {
    throw new Error('No active session');
  }

  const key = `session:${userId}:${sessionId}`;
  await redis.setex(key, 86400, JSON.stringify(data)); // 24 hours
}
```

### With Inngest (Job Queue)

```typescript
// inngest/functions/process-queue.ts
import { inngest } from '@/lib/inngest';
import { redis } from '@/lib/upstash-redis';

export const processQueue = inngest.createFunction(
  { id: 'process-queue' },
  { cron: '*/5 * * * *' }, // Every 5 minutes
  async ({ step }) => {
    // Get items from queue
    const items = await step.run('fetch-queue', async () => {
      const queueLength = await redis.llen('job-queue');
      const items = [];

      for (let i = 0; i < Math.min(queueLength, 10); i++) {
        const item = await redis.lpop('job-queue');
        if (item) {
          items.push(JSON.parse(item as string));
        }
      }

      return items;
    });

    // Process each item
    for (const item of items) {
      await step.run(`process-${item.id}`, async () => {
        return await processJob(item);
      });
    }
  }
);
```

### With Stripe (Usage Tracking)

```typescript
// app/api/ai/chat/route.ts
import { redis } from '@/lib/upstash-redis';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Track token usage
  const key = `usage:${userId}:${new Date().toISOString().slice(0, 7)}`; // Monthly key
  const tokensUsed = 1000; // From AI response

  await redis.incrby(key, tokensUsed);
  await redis.expire(key, 2592000); // 30 days

  // Get total usage
  const totalUsage = await redis.get(key);

  return NextResponse.json({
    tokensUsed,
    totalUsage,
  });
}
```

---

## Pub/Sub

### Publish Messages

```typescript
// app/api/notify/route.ts
import { redis } from '@/lib/upstash-redis';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { channel, message } = await request.json();

  await redis.publish(channel, JSON.stringify(message));

  return NextResponse.json({ success: true });
}
```

### Subscribe to Messages

```typescript
// Note: Subscribe is not recommended for serverless environments
// Use Upstash QStash instead for pub/sub in serverless
```

---

## Best Practices

### 1. Environment Variables

```bash
# Required
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

### 2. Use Appropriate TTLs

```typescript
// Short-lived data (sessions)
await redis.setex('session:123', 1800, data); // 30 minutes

// Medium-lived data (cache)
await redis.setex('cache:user:123', 3600, data); // 1 hour

// Long-lived data (config)
await redis.setex('config:app', 86400, data); // 24 hours
```

### 3. Key Naming Convention

```typescript
// Use prefixes and separators
const keys = {
  user: (id: string) => `user:${id}`,
  session: (userId: string, sessionId: string) => `session:${userId}:${sessionId}`,
  cache: (type: string, id: string) => `cache:${type}:${id}`,
  rateLimit: (userId: string) => `rate_limit:${userId}`,
};
```

### 4. Handle Errors

```typescript
try {
  const value = await redis.get('key');
  return value;
} catch (error) {
  console.error('Redis error:', error);
  // Fallback to database or return null
  return null;
}
```

### 5. Batch Operations

```typescript
// Use pipeline for multiple operations
const pipeline = redis.pipeline();
pipeline.set('key1', 'value1');
pipeline.set('key2', 'value2');
pipeline.get('key3');
const results = await pipeline.exec();
```

---

## Pricing

**Free Tier:**
- 10,000 commands/day
- 256 MB storage
- Single region

**Pay-as-you-go:**
- $0.20 per 100,000 commands
- $0.25 per GB storage
- Additional regions available

**Pro ($10/month):**
- Includes 1M commands
- 1GB storage
- Global replication

---

## Resources

- **Documentation:** https://upstash.com/docs/redis
- **Console:** https://console.upstash.com
- **SDK Reference:** https://upstash.com/docs/redis/sdks/ts/overview
- **Examples:** https://github.com/upstash/redis-examples

---

## Next Steps

1. Create Upstash Redis database
2. Install @upstash/redis
3. Configure environment variables
4. Initialize Redis client
5. Implement caching layer
6. Add rate limiting
7. Test in production

For more examples, see the template repositories in `/home/mibady/ai-coder-workspace/templates/`.
