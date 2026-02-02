---
name: dna-layer
description: Backend services layer with Supabase, Upstash, Stripe, and API patterns.
---

# DNA Layer

Backend services: database, auth, payments, caching, and API design.

## When to Use

- Database operations (Supabase PostgreSQL)
- Authentication and authorization
- Payment processing (Stripe)
- Caching and rate limiting (Upstash Redis)
- Background jobs (QStash)
- Email (Resend)

## Stack

| Service | Package | Purpose | Reference |
|---------|---------|---------|-----------|
| Supabase | @supabase/supabase-js | PostgreSQL, real-time, storage | `references/supabase.md` |
| Upstash Redis | @upstash/redis | Caching, sessions, rate limiting | `references/upstash-redis.md` |
| Upstash Vector | @upstash/vector | RAG, semantic search | `references/upstash-vector.md` |
| Upstash QStash | @upstash/qstash | Background jobs, scheduling | `references/upstash-qstash.md` |
| Stripe | stripe | Payments, subscriptions | `references/stripe.md` |
| Resend | resend | Transactional email | `references/resend.md` |
| Inngest | inngest | Durable workflows | `references/inngest.md` |
| Sentry | @sentry/nextjs | Error tracking | `references/sentry.md` |
| Arcjet | @arcjet/next | Security, rate limiting | `references/arcjet.md` |
| Deepgram | @deepgram/sdk | Speech-to-text, TTS | `references/deepgram.md` |
| Twilio | twilio | Voice, SMS, video | `references/twilio.md` |
| Mux | @mux/mux-node | Video hosting | `references/mux.md` |
| Liveblocks | @liveblocks/client | Real-time collaboration | `references/liveblocks.md` |
| Sanity | @sanity/client | Headless CMS | `references/sanity.md` |
| FAL.ai | @fal-ai/client | AI image/video generation | `references/fal-ai.md` |
| Zustand | zustand | State management | `references/zustand.md` |

**Full integration docs:** See `references/INTEGRATION-MATRIX.md` for service combinations.

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Upstash
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
UPSTASH_VECTOR_REST_URL=https://xxx.upstash.io
UPSTASH_VECTOR_REST_TOKEN=xxx
QSTASH_TOKEN=xxx

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## Supabase (Database)

### Client Setup
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookies) => cookies.forEach(({ name, value, options }) => 
          cookieStore.set(name, value, options)
        ),
      },
    }
  );
}
```

### CRUD Operations
```typescript
const supabase = createClient();

// Create
const { data, error } = await supabase
  .from('products')
  .insert({ name: 'Widget', price: 25 })
  .select()
  .single();

// Read
const { data: products } = await supabase
  .from('products')
  .select('*, reviews(*)')
  .order('created_at', { ascending: false })
  .limit(10);

// Update
const { data } = await supabase
  .from('products')
  .update({ price: 30 })
  .eq('id', productId)
  .select()
  .single();

// Delete
await supabase.from('products').delete().eq('id', productId);
```

### Real-time Subscriptions
```typescript
const channel = supabase
  .channel('products')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'products' },
    (payload) => console.log('Change:', payload)
  )
  .subscribe();

// Cleanup
channel.unsubscribe();
```

### Row Level Security (RLS)
```sql
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Users can only see their own products
CREATE POLICY "Users see own products"
ON products FOR SELECT
USING (auth.uid() = user_id);

-- Users can only insert their own products
CREATE POLICY "Users insert own products"
ON products FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

---

## Upstash Redis (Caching)

### Setup
```typescript
// lib/upstash.ts
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

### Caching Pattern
```typescript
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 3600
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached) return cached;

  const data = await fetcher();
  await redis.set(key, data, { ex: ttl });
  return data;
}

// Usage
const products = await getCachedData(
  'products:all',
  () => supabase.from('products').select('*'),
  300
);
```

### Rate Limiting
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/upstash';

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
});

export async function checkRateLimit(identifier: string) {
  const { success, limit, remaining } = await ratelimit.limit(identifier);
  return { success, limit, remaining };
}
```

---

## Authentication

For authentication patterns, see the **`supabase-auth`** skill which covers:
- Supabase Auth setup with `@supabase/ssr`
- Middleware for route protection
- Organizations and multi-tenant RBAC
- Stripe billing integration

---

## Stripe (Payments)

### Checkout Session
```typescript
// app/api/checkout/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { priceId } = await req.json();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
  });

  return Response.json({ url: session.url });
}
```

### Webhook Handler
```typescript
// app/api/webhooks/stripe/route.ts
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleCheckoutComplete(session);
      break;
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      await handleSubscriptionCanceled(subscription);
      break;
  }

  return new Response('OK', { status: 200 });
}
```

---

## Resend (Email)

```typescript
// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, name: string) {
  await resend.emails.send({
    from: 'noreply@yourdomain.com',
    to,
    subject: 'Welcome!',
    html: `<h1>Welcome, ${name}!</h1><p>Thanks for signing up.</p>`,
  });
}
```

---

## API Design Patterns

### RESTful Routes
```typescript
// app/api/products/route.ts
export async function GET() {
  const products = await db.product.findMany();
  return Response.json(products);
}

export async function POST(req: Request) {
  const body = await req.json();
  const product = await db.product.create({ data: body });
  return Response.json(product, { status: 201 });
}

// app/api/products/[id]/route.ts
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const product = await db.product.findUnique({ where: { id: params.id } });
  if (!product) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(product);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const product = await db.product.update({ where: { id: params.id }, data: body });
  return Response.json(product);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await db.product.delete({ where: { id: params.id } });
  return new Response(null, { status: 204 });
}
```

### Error Handling
```typescript
export async function GET() {
  try {
    const data = await fetchData();
    return Response.json(data);
  } catch (error) {
    console.error('Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Validation with Zod
```typescript
import { z } from 'zod';

const CreateProductSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  description: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  
  const parsed = CreateProductSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const product = await db.product.create({ data: parsed.data });
  return Response.json(product, { status: 201 });
}
```

---

## Architecture Patterns

### Clean Architecture
```
src/
├── domain/           # Business logic (entities, use cases)
│   ├── entities/
│   └── use-cases/
├── infrastructure/   # External services (DB, APIs)
│   ├── database/
│   └── external/
├── presentation/     # UI layer (pages, components)
│   ├── pages/
│   └── components/
└── shared/           # Utilities, types
```

### Repository Pattern
```typescript
// domain/repositories/product-repository.ts
export interface ProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  create(data: CreateProductDTO): Promise<Product>;
  update(id: string, data: UpdateProductDTO): Promise<Product>;
  delete(id: string): Promise<void>;
}

// infrastructure/repositories/supabase-product-repository.ts
export class SupabaseProductRepository implements ProductRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll() {
    const { data } = await this.supabase.from('products').select('*');
    return data || [];
  }

  async findById(id: string) {
    const { data } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    return data;
  }
  // ...
}
```

---

## Checklist

- [ ] Supabase client configured (browser + server)
- [ ] RLS policies enabled for all tables
- [ ] Redis caching implemented for expensive queries
- [ ] Rate limiting on API routes
- [ ] Supabase Auth protecting routes (see supabase-auth skill)
- [ ] Stripe webhooks secured with signature verification
- [ ] Email templates created
- [ ] API routes validated with Zod
- [ ] Error handling standardized
- [ ] Sentry configured for error tracking
