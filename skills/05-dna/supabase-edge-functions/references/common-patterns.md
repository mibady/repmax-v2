# Supabase Edge Functions Common Patterns

Reusable patterns for Edge Functions.

## Webhook Receiver

### Generic Webhook Handler
```typescript
// supabase/functions/webhook-receiver/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createServiceClient } from '../_shared/supabase.ts';

interface WebhookPayload {
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
}

serve(async (req) => {
  // Verify webhook signature (implement based on provider)
  const signature = req.headers.get('x-webhook-signature');
  const body = await req.text();

  if (!verifySignature(body, signature)) {
    return new Response('Invalid signature', { status: 401 });
  }

  const payload: WebhookPayload = JSON.parse(body);
  const supabase = createServiceClient();

  // Log webhook for debugging
  await supabase.from('webhook_logs').insert({
    event: payload.event,
    payload,
    received_at: new Date().toISOString(),
  });

  // Route to handler
  try {
    await routeWebhook(payload, supabase);
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Error', { status: 500 });
  }
});

function verifySignature(body: string, signature: string | null): boolean {
  if (!signature) return false;
  // Implement signature verification based on webhook provider
  return true;
}

async function routeWebhook(payload: WebhookPayload, supabase: SupabaseClient) {
  switch (payload.event) {
    case 'user.created':
      await handleUserCreated(payload.data, supabase);
      break;
    case 'order.completed':
      await handleOrderCompleted(payload.data, supabase);
      break;
    default:
      console.log(`Unhandled event: ${payload.event}`);
  }
}
```

### Stripe Webhook
```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno';
import { createServiceClient } from '../_shared/supabase.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!;
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object, supabase);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object, supabase);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object, supabase);
      break;
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### GitHub Webhook
```typescript
// supabase/functions/github-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createServiceClient } from '../_shared/supabase.ts';

serve(async (req) => {
  const signature = req.headers.get('x-hub-signature-256');
  const event = req.headers.get('x-github-event');
  const body = await req.text();

  // Verify signature
  const isValid = await verifyGitHubSignature(
    body,
    signature,
    Deno.env.get('GITHUB_WEBHOOK_SECRET')!
  );

  if (!isValid) {
    return new Response('Invalid signature', { status: 401 });
  }

  const payload = JSON.parse(body);
  const supabase = createServiceClient();

  switch (event) {
    case 'push':
      await handlePush(payload, supabase);
      break;
    case 'pull_request':
      await handlePullRequest(payload, supabase);
      break;
    case 'issues':
      await handleIssue(payload, supabase);
      break;
  }

  return new Response('OK');
});

async function verifyGitHubSignature(
  body: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const expectedSig = 'sha256=' + Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return signature === expectedSig;
}
```

---

## Authenticated Endpoints

### Protected API
```typescript
// supabase/functions/protected-api/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createSupabaseClient, createServiceClient } from '../_shared/supabase.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Create client with user's auth token
  const supabase = createSupabaseClient(req);

  // Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Perform action as authenticated user (respects RLS)
  const { data, error } = await supabase
    .from('user_data')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(
    JSON.stringify({ data }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
});
```

### Admin-Only Endpoint
```typescript
// supabase/functions/admin-api/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createSupabaseClient, createServiceClient } from '../_shared/supabase.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createSupabaseClient(req);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  // Check if user is admin
  const serviceClient = createServiceClient();
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return new Response('Forbidden', { status: 403, headers: corsHeaders });
  }

  // Admin-only logic here
  const { data: allUsers } = await serviceClient
    .from('profiles')
    .select('*');

  return new Response(
    JSON.stringify({ users: allUsers }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
});
```

---

## External API Calls

### REST API Integration
```typescript
// supabase/functions/external-api/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

interface ExternalResponse {
  data: unknown;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const { endpoint, params } = await req.json();

  try {
    const response = await fetchExternalAPI(endpoint, params);

    return new Response(
      JSON.stringify(response),
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

async function fetchExternalAPI(
  endpoint: string,
  params: Record<string, string>
): Promise<ExternalResponse> {
  const url = new URL(`https://api.example.com/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${Deno.env.get('EXTERNAL_API_KEY')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return { data: await response.json() };
}
```

### With Caching
```typescript
// supabase/functions/cached-api/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createServiceClient } from '../_shared/supabase.ts';
import { corsHeaders } from '../_shared/cors.ts';

const CACHE_TTL = 300; // 5 minutes

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const { query } = await req.json();
  const cacheKey = `cache:${query}`;
  const supabase = createServiceClient();

  // Check cache
  const { data: cached } = await supabase
    .from('api_cache')
    .select('data, expires_at')
    .eq('key', cacheKey)
    .single();

  if (cached && new Date(cached.expires_at) > new Date()) {
    return new Response(
      JSON.stringify({ data: cached.data, cached: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Fetch from external API
  const response = await fetch(`https://api.example.com/search?q=${query}`);
  const data = await response.json();

  // Store in cache
  const expiresAt = new Date(Date.now() + CACHE_TTL * 1000);
  await supabase
    .from('api_cache')
    .upsert({
      key: cacheKey,
      data,
      expires_at: expiresAt.toISOString(),
    });

  return new Response(
    JSON.stringify({ data, cached: false }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
});
```

---

## AI/LLM Orchestration

### Chat Completion
```typescript
// supabase/functions/ai-chat/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const { messages, stream = false } = await req.json();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      stream,
    }),
  });

  if (stream) {
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  }

  const data = await response.json();
  return new Response(
    JSON.stringify(data),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
});
```

### RAG with Embeddings
```typescript
// supabase/functions/rag-query/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createServiceClient } from '../_shared/supabase.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const { query } = await req.json();

  // Generate embedding for query
  const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: query,
    }),
  });

  const { data } = await embeddingResponse.json();
  const embedding = data[0].embedding;

  // Search for similar documents
  const supabase = createServiceClient();
  const { data: documents } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_count: 5,
    match_threshold: 0.7,
  });

  // Generate response with context
  const context = documents?.map(d => d.content).join('\n\n') || '';

  const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Answer questions based on the following context:\n\n${context}`,
        },
        { role: 'user', content: query },
      ],
    }),
  });

  const completion = await chatResponse.json();

  return new Response(
    JSON.stringify({
      answer: completion.choices[0].message.content,
      sources: documents,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
});
```

---

## Error Handling

### Structured Error Response
```typescript
// supabase/functions/_shared/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorResponse(error: unknown, corsHeaders: Record<string, string>) {
  if (error instanceof AppError) {
    return new Response(
      JSON.stringify({
        error: error.message,
        code: error.code,
      }),
      {
        status: error.statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  console.error('Unexpected error:', error);
  return new Response(
    JSON.stringify({ error: 'Internal server error' }),
    {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

// Usage
serve(async (req) => {
  try {
    // ... your logic
    throw new AppError(400, 'Invalid input', 'VALIDATION_ERROR');
  } catch (error) {
    return errorResponse(error, corsHeaders);
  }
});
```

---

## File Upload

```typescript
// supabase/functions/upload/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createSupabaseClient } from '../_shared/supabase.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createSupabaseClient(req);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return new Response('No file provided', { status: 400, headers: corsHeaders });
  }

  // Generate unique filename
  const ext = file.name.split('.').pop();
  const filename = `${user.id}/${crypto.randomUUID()}.${ext}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(filename, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('uploads')
    .getPublicUrl(filename);

  return new Response(
    JSON.stringify({ path: data.path, url: publicUrl }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
});
```
