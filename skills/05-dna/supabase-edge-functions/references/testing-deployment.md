# Supabase Edge Functions Testing & Deployment

Guide for testing locally and deploying to production.

## Local Development Setup

### Prerequisites
```bash
# Install Supabase CLI
npm install -g supabase

# Or with Homebrew
brew install supabase/tap/supabase

# Verify installation
supabase --version
```

### Initialize Project
```bash
# Initialize Supabase in existing project
supabase init

# Start local Supabase services
supabase start
```

### Create Function
```bash
# Create new function
supabase functions new my-function

# This creates:
# supabase/functions/my-function/index.ts
```

---

## Local Testing

### Serve Functions Locally
```bash
# Serve all functions
supabase functions serve

# Serve specific function
supabase functions serve my-function

# With environment file
supabase functions serve --env-file .env.local

# With debug logging
supabase functions serve --debug
```

### Local Environment Variables
```bash
# Create .env.local in supabase directory
cat > supabase/.env.local << EOF
STRIPE_SECRET_KEY=sk_test_xxx
OPENAI_API_KEY=sk-xxx
RESEND_API_KEY=re_xxx
EOF
```

### Test with cURL
```bash
# Simple GET request
curl http://localhost:54321/functions/v1/hello-world

# POST with JSON body
curl -X POST http://localhost:54321/functions/v1/my-function \
  -H "Content-Type: application/json" \
  -d '{"name": "John"}'

# With Authorization header
curl http://localhost:54321/functions/v1/protected-function \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data": "value"}'
```

### Get Local JWT Token
```bash
# Get anon key from local config
supabase status

# Or use service role for admin access
supabase status | grep service_role
```

---

## Hot Reloading

Functions automatically reload when files change during `supabase functions serve`.

### Watch Mode
```bash
# Functions serve automatically watches for changes
supabase functions serve my-function

# Make changes to index.ts
# Function automatically reloads
```

### Debugging
```bash
# Enable debug mode for verbose logging
supabase functions serve --debug

# View function logs
supabase functions logs my-function
```

---

## Testing with JavaScript/TypeScript

### Test Client Setup
```typescript
// test/setup.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'http://localhost:54321',
  'your-local-anon-key'
);

export async function callFunction(name: string, body?: unknown) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  return { data, error };
}
```

### Unit Test Example
```typescript
// test/hello-world.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { callFunction } from './setup';

describe('hello-world function', () => {
  it('returns greeting with name', async () => {
    const { data, error } = await callFunction('hello-world', {
      name: 'John',
    });

    expect(error).toBeNull();
    expect(data.message).toBe('Hello, John!');
  });

  it('handles missing name', async () => {
    const { data, error } = await callFunction('hello-world', {});

    expect(error).toBeNull();
    expect(data.message).toBe('Hello, World!');
  });
});
```

### Integration Test with Auth
```typescript
// test/protected-function.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('protected function', () => {
  let supabase: ReturnType<typeof createClient>;
  let userToken: string;

  beforeAll(async () => {
    supabase = createClient(
      'http://localhost:54321',
      'your-local-anon-key'
    );

    // Sign in test user
    const { data } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword',
    });
    userToken = data.session?.access_token || '';
  });

  it('returns user data when authenticated', async () => {
    const { data, error } = await supabase.functions.invoke('protected-function');

    expect(error).toBeNull();
    expect(data.userId).toBeDefined();
  });

  it('returns 401 when not authenticated', async () => {
    const anonClient = createClient(
      'http://localhost:54321',
      'your-local-anon-key'
    );

    const { error } = await anonClient.functions.invoke('protected-function');

    expect(error?.message).toContain('Unauthorized');
  });
});
```

---

## Deployment

### Deploy Single Function
```bash
# Deploy specific function
supabase functions deploy my-function

# Deploy with import map
supabase functions deploy my-function --import-map ./import_map.json
```

### Deploy All Functions
```bash
# Deploy all functions in supabase/functions
supabase functions deploy
```

### Deploy with Secrets
```bash
# Set secrets first
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx OPENAI_API_KEY=sk-xxx

# Then deploy
supabase functions deploy my-function
```

### Verify Deployment
```bash
# List deployed functions
supabase functions list

# Get function details
supabase functions download my-function
```

---

## Environment Variables (Secrets)

### Set Secrets
```bash
# Set single secret
supabase secrets set MY_SECRET=value

# Set multiple secrets
supabase secrets set \
  STRIPE_SECRET_KEY=sk_live_xxx \
  OPENAI_API_KEY=sk-xxx \
  WEBHOOK_SECRET=whsec_xxx

# Set from file
supabase secrets set --env-file .env.production
```

### List Secrets
```bash
# List all secret names (values hidden)
supabase secrets list
```

### Unset Secrets
```bash
# Remove a secret
supabase secrets unset MY_SECRET
```

### Built-in Variables
These are automatically available:
- `SUPABASE_URL` - Your project URL
- `SUPABASE_ANON_KEY` - Anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key

```typescript
// Access in function
const url = Deno.env.get('SUPABASE_URL');
const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
```

---

## Monitoring & Logs

### View Logs
```bash
# Stream logs for a function
supabase functions logs my-function

# View recent logs
supabase functions logs my-function --scroll

# Filter by time
supabase functions logs my-function --since 1h
```

### Dashboard Monitoring
1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Select your function
4. View invocations, errors, and latency

### Add Custom Logging
```typescript
// In your function
serve(async (req) => {
  console.log('Request received:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers),
  });

  try {
    // ... logic
    console.log('Success:', { result });
    return new Response(JSON.stringify(result));
  } catch (error) {
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
    });
    return new Response('Error', { status: 500 });
  }
});
```

---

## CI/CD Integration

### GitHub Actions
```yaml
# .github/workflows/deploy-functions.yml
name: Deploy Edge Functions

on:
  push:
    branches: [main]
    paths:
      - 'supabase/functions/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Link Supabase project
        run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_ID }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Set secrets
        run: |
          supabase secrets set \
            STRIPE_SECRET_KEY=${{ secrets.STRIPE_SECRET_KEY }} \
            OPENAI_API_KEY=${{ secrets.OPENAI_API_KEY }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Deploy functions
        run: supabase functions deploy
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

### Deploy Specific Functions on Change
```yaml
# .github/workflows/deploy-changed-functions.yml
name: Deploy Changed Functions

on:
  push:
    branches: [main]
    paths:
      - 'supabase/functions/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - uses: supabase/setup-cli@v1

      - name: Get changed functions
        id: changed
        run: |
          FUNCTIONS=$(git diff --name-only HEAD~1 HEAD -- supabase/functions | \
            grep -oP 'supabase/functions/\K[^/]+' | \
            sort -u | \
            grep -v '^_' | \
            tr '\n' ' ')
          echo "functions=$FUNCTIONS" >> $GITHUB_OUTPUT

      - name: Link project
        run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_ID }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Deploy changed functions
        if: steps.changed.outputs.functions != ''
        run: |
          for func in ${{ steps.changed.outputs.functions }}; do
            echo "Deploying $func..."
            supabase functions deploy $func
          done
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

---

## Performance Optimization

### Cold Start Optimization
```typescript
// Initialize outside handler for warm starts
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  // Use pre-initialized client
  const customers = await stripe.customers.list();
  return new Response(JSON.stringify(customers));
});
```

### Connection Pooling
```typescript
// Reuse Supabase client
let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
  }
  return supabaseClient;
}
```

### Response Caching
```typescript
serve(async (req) => {
  const data = await fetchData();

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
    },
  });
});
```

---

## Troubleshooting

### Common Issues

**Function not found (404)**
```bash
# Verify function is deployed
supabase functions list

# Redeploy
supabase functions deploy my-function
```

**CORS errors**
```typescript
// Ensure CORS headers are set
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle OPTIONS preflight
if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders });
}
```

**Timeout (30s limit)**
```typescript
// Break long operations into chunks
// Or use background jobs with pg_cron
```

**Module not found**
```typescript
// Use esm.sh for npm packages
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno';

// Or use deno.land/std
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
```

### Debug Checklist
1. Check function logs: `supabase functions logs my-function`
2. Verify secrets are set: `supabase secrets list`
3. Test locally first: `supabase functions serve`
4. Check CORS headers for browser requests
5. Verify JWT token is valid for authenticated endpoints
