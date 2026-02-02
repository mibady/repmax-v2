---
name: supabase-edge-functions
description: Deno-based serverless functions for webhooks, APIs, and AI orchestration.
---

# Supabase Edge Functions

Deno-based serverless functions on Supabase's edge network.

## When to Use

| Use Case | Description |
|----------|-------------|
| **Webhook Receivers** | Handle Stripe, GitHub, or external webhooks |
| **Low-Latency APIs** | Edge-deployed for minimal latency |
| **AI Orchestration** | LLM calls, embeddings, RAG pipelines |
| **Scheduled Tasks** | Cron jobs via pg_cron |
| **Custom Auth Logic** | Pre/post authentication hooks |
| **Third-Party Integrations** | Connect to external APIs securely |

## Stack

| Technology | Purpose |
|------------|---------|
| Deno | TypeScript runtime |
| Supabase Client | Database access |
| Edge Runtime | Global edge deployment |

**Common Patterns:** See `references/common-patterns.md`
**Testing & Deployment:** See `references/testing-deployment.md`

---

## Project Structure

```
supabase/
├── functions/
│   ├── hello-world/
│   │   └── index.ts           # Function entrypoint
│   ├── stripe-webhook/
│   │   └── index.ts
│   ├── ai-chat/
│   │   └── index.ts
│   └── _shared/               # Shared utilities (underscore = not deployed)
│       ├── supabase.ts        # Supabase client
│       ├── cors.ts            # CORS headers
│       └── validation.ts      # Input validation
├── config.toml                # Supabase config
└── .env.local                 # Local secrets
```

---

## Quick Start

### Create a Function
```bash
# Initialize Supabase (if not done)
supabase init

# Create a new function
supabase functions new hello-world
```

### Basic Function
```typescript
// supabase/functions/hello-world/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { name } = await req.json();

  return new Response(
    JSON.stringify({ message: `Hello, ${name}!` }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    }
  );
});
```

### Run Locally
```bash
supabase start
supabase functions serve hello-world --env-file .env.local
```

### Deploy
```bash
supabase functions deploy hello-world
```

---

## Request/Response Handling

### Complete Request Handler
```typescript
// supabase/functions/api/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request
    const url = new URL(req.url);
    const method = req.method;

    // Route handling
    if (method === 'GET') {
      const id = url.searchParams.get('id');
      return handleGet(id);
    }

    if (method === 'POST') {
      const body = await req.json();
      return handlePost(body);
    }

    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function handleGet(id: string | null) {
  // Implementation
  return new Response(
    JSON.stringify({ id }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function handlePost(body: unknown) {
  // Implementation
  return new Response(
    JSON.stringify({ received: body }),
    {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
```

### CORS Helper
```typescript
// supabase/functions/_shared/cors.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

export function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
  return new Response(response.body, {
    status: response.status,
    headers,
  });
}
```

---

## Database Access

### Supabase Client Setup
```typescript
// supabase/functions/_shared/supabase.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export function createSupabaseClient(req: Request) {
  // Get auth header from request (for RLS)
  const authHeader = req.headers.get('Authorization');

  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    {
      global: {
        headers: {
          Authorization: authHeader || '',
        },
      },
    }
  );
}

export function createServiceClient() {
  // Service role client - bypasses RLS
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
}
```

### Using Database in Function
```typescript
// supabase/functions/get-products/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createSupabaseClient } from '../_shared/supabase.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createSupabaseClient(req);

    // This respects RLS policies based on the user's JWT
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return new Response(
      JSON.stringify(products),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
```

---

## Secrets Management

### Set Secrets
```bash
# Set a secret
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx

# Set multiple secrets
supabase secrets set \
  OPENAI_API_KEY=sk-xxx \
  STRIPE_SECRET_KEY=sk_live_xxx \
  RESEND_API_KEY=re_xxx

# List secrets (names only)
supabase secrets list
```

### Access Secrets in Functions
```typescript
// Access environment variables
const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
const openaiKey = Deno.env.get('OPENAI_API_KEY');

// Validate required secrets
function requireEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
```

### Local Development
```bash
# Create .env.local for local secrets
echo "STRIPE_SECRET_KEY=sk_test_xxx" >> supabase/.env.local
echo "OPENAI_API_KEY=sk-xxx" >> supabase/.env.local

# Run with local env file
supabase functions serve --env-file supabase/.env.local
```

---

## Webhook Handler Pattern

```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno';
import { createServiceClient } from '../_shared/supabase.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response('Webhook Error', { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await supabase.from('orders').insert({
          stripe_session_id: session.id,
          customer_id: session.customer,
          amount: session.amount_total,
          status: 'paid',
        });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000),
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response('Handler Error', { status: 500 });
  }
});
```

---

## AI/LLM Integration

```typescript
// supabase/functions/ai-chat/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const { messages } = await req.json();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      stream: true,
    }),
  });

  // Stream the response
  return new Response(response.body, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
});
```

---

## Authentication

### Verify User Token
```typescript
// supabase/functions/_shared/auth.ts
import { createSupabaseClient } from './supabase.ts';

export async function getUser(req: Request) {
  const supabase = createSupabaseClient(req);

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function requireAuth(req: Request) {
  const user = await getUser(req);

  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  return user;
}
```

### Protected Function
```typescript
// supabase/functions/protected-endpoint/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { requireAuth } from '../_shared/auth.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // This will throw 401 if not authenticated
    const user = await requireAuth(req);

    return new Response(
      JSON.stringify({
        message: `Hello, ${user.email}!`,
        userId: user.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
```

---

## Calling Functions from Client

### JavaScript/TypeScript
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Call function with authentication
const { data, error } = await supabase.functions.invoke('hello-world', {
  body: { name: 'John' },
});

// Call function without body
const { data: products } = await supabase.functions.invoke('get-products');
```

### With Custom Headers
```typescript
const { data, error } = await supabase.functions.invoke('custom-function', {
  body: { data: 'value' },
  headers: {
    'X-Custom-Header': 'custom-value',
  },
});
```

---

## Scheduled Functions

### Using pg_cron
```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule a function to run every hour
SELECT cron.schedule(
  'cleanup-job',
  '0 * * * *',  -- Every hour
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/cleanup',
    headers := '{"Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- List scheduled jobs
SELECT * FROM cron.job;

-- Remove a job
SELECT cron.unschedule('cleanup-job');
```

### Cleanup Function
```typescript
// supabase/functions/cleanup/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createServiceClient } from '../_shared/supabase.ts';

serve(async (req) => {
  // Verify it's from pg_cron (check for service role)
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.includes('service_role')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createServiceClient();

  // Delete old records
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { error } = await supabase
    .from('temp_data')
    .delete()
    .lt('created_at', thirtyDaysAgo.toISOString());

  if (error) {
    console.error('Cleanup error:', error);
    return new Response('Error', { status: 500 });
  }

  return new Response('Cleanup complete', { status: 200 });
});
```

---

## Checklist

- [ ] Supabase CLI installed (`npm i -g supabase`)
- [ ] Project initialized (`supabase init`)
- [ ] Local development working (`supabase start`)
- [ ] Functions serving locally (`supabase functions serve`)
- [ ] Secrets configured (`supabase secrets set`)
- [ ] CORS headers configured for web clients
- [ ] Database access with RLS working
- [ ] Authentication verification implemented
- [ ] Error handling and logging in place
- [ ] Functions deployed (`supabase functions deploy`)
- [ ] Webhook endpoints secured with signature verification
