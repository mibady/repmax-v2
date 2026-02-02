# Sentry - Error Tracking & Performance Monitoring

**Official Website:** https://sentry.io
**Documentation:** https://docs.sentry.io
**Pricing:** Free tier: 5,000 errors/month, 10k performance units

---

## Overview

Sentry is an application monitoring platform that helps developers identify, diagnose, and fix errors and performance issues in real-time. It provides error tracking, performance monitoring, session replay, and detailed stack traces with source maps support.

### Key Features

- ✅ Error tracking & reporting
- ✅ Performance monitoring
- ✅ Session replay
- ✅ Release tracking
- ✅ Source maps support
- ✅ User feedback
- ✅ Alert notifications
- ✅ Issue assignment & workflow
- ✅ Integration with dev tools
- ✅ Custom dashboards
- ✅ TypeScript support
- ✅ Next.js optimized

---

## Use Cases for AI Coder

1. **Error Monitoring**
   - Runtime errors
   - API failures
   - Database errors
   - Integration issues

2. **Performance Tracking**
   - Page load times
   - API response times
   - Database queries
   - Asset loading

3. **User Experience**
   - Session replay
   - User feedback
   - Error context
   - User journey tracking

4. **Development**
   - Debug production issues
   - Track releases
   - Monitor deployments
   - Code-level insights

---

## Quick Start

### 1. Installation

```bash
npm install --save @sentry/nextjs
# or
pnpm add @sentry/nextjs
```

### 2. Initialize Sentry

```bash
npx @sentry/wizard@latest -i nextjs
```

This will:
- Create Sentry configuration files
- Add necessary environment variables
- Set up source maps upload

### 3. Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx # For uploading source maps
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

### 4. Sentry Configuration

The wizard creates these files:

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production
  tracesSampleRate: 1.0,

  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  debug: false,
});
```

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
});
```

```typescript
// sentry.edge.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
});
```

---

## Error Tracking

### Automatic Error Capture

Sentry automatically captures unhandled errors:

```typescript
// This error will be automatically captured
throw new Error('Something went wrong!');
```

### Manual Error Capture

```typescript
import * as Sentry from '@sentry/nextjs';

try {
  // Your code
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error);
  // Handle error
}
```

### Capture Messages

```typescript
import * as Sentry from '@sentry/nextjs';

// Log informational messages
Sentry.captureMessage('User completed checkout', 'info');

// Log warnings
Sentry.captureMessage('API rate limit approaching', 'warning');

// Log errors
Sentry.captureMessage('Critical system failure', 'error');
```

### Add Context to Errors

```typescript
import * as Sentry from '@sentry/nextjs';

try {
  await processPayment(orderId);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'payment',
      orderId,
    },
    level: 'error',
    extra: {
      orderDetails: order,
      timestamp: Date.now(),
    },
  });
}
```

---

## User Context

### Set User Information

```typescript
// app/layout.tsx
'use client';

import { useEffect } from 'react';
import { useUser } from '@/hooks/use-user'; // Custom hook for Supabase Auth
import * as Sentry from '@sentry/nextjs';

export function SentryUserProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        username: user.username || undefined,
      });
    } else {
      Sentry.setUser(null);
    }
  }, [user]);

  return <>{children}</>;
}
```

### Add Custom Context

```typescript
import * as Sentry from '@sentry/nextjs';

// Set custom context
Sentry.setContext('subscription', {
  tier: 'pro',
  status: 'active',
  endDate: '2024-12-31',
});

// Set tags
Sentry.setTag('environment', 'production');
Sentry.setTag('feature', 'ai-generation');
```

---

## Performance Monitoring

### Automatic Performance Tracking

Sentry automatically tracks:
- Page loads
- Navigation
- API calls
- Database queries (with integrations)

### Manual Performance Tracking

```typescript
import * as Sentry from '@sentry/nextjs';

export async function processData(data: any[]) {
  const transaction = Sentry.startTransaction({
    name: 'Process Data',
    op: 'data.process',
  });

  try {
    // Track specific operations
    const span1 = transaction.startChild({
      op: 'data.validate',
      description: 'Validate data',
    });
    await validateData(data);
    span1.finish();

    const span2 = transaction.startChild({
      op: 'data.transform',
      description: 'Transform data',
    });
    const transformed = await transformData(data);
    span2.finish();

    const span3 = transaction.startChild({
      op: 'db.insert',
      description: 'Insert to database',
    });
    await insertData(transformed);
    span3.finish();

    transaction.setStatus('ok');
  } catch (error) {
    transaction.setStatus('internal_error');
    Sentry.captureException(error);
  } finally {
    transaction.finish();
  }
}
```

### Track API Performance

```typescript
// app/api/data/route.ts
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const transaction = Sentry.startTransaction({
    name: 'GET /api/data',
    op: 'http.server',
  });

  try {
    const data = await fetchData();

    transaction.setHttpStatus(200);
    transaction.setStatus('ok');

    return NextResponse.json({ data });
  } catch (error) {
    transaction.setHttpStatus(500);
    transaction.setStatus('internal_error');
    Sentry.captureException(error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    transaction.finish();
  }
}
```

---

## Integration with AI Coder Services

### With Clerk (User Context)

```typescript
// Already shown above - automatically track authenticated users
import { useUser } from '@/hooks/use-user'; // Custom hook for Supabase Auth

// Set user in Sentry whenever user changes
Sentry.setUser({
  id: user.id,
  email: user.emailAddresses[0]?.emailAddress,
});
```

### With Stripe (Payment Errors)

```typescript
// app/api/checkout/route.ts
import * as Sentry from '@sentry/nextjs';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const session = await stripe.checkout.sessions.create({
      // ... config
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    // Capture Stripe errors with context
    Sentry.captureException(error, {
      tags: {
        service: 'stripe',
        operation: 'checkout.create',
      },
      contexts: {
        stripe: {
          requestId: error.requestId,
          type: error.type,
          code: error.code,
        },
      },
    });

    return NextResponse.json(
      { error: 'Payment failed' },
      { status: 500 }
    );
  }
}
```

### With Supabase (Database Errors)

```typescript
// lib/supabase/with-sentry.ts
import { createClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/nextjs';

export const supabaseWithSentry = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Wrap queries with error tracking
export async function queryWithTracking<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
) {
  const span = Sentry.getCurrentHub().getScope()?.getSpan();
  const childSpan = span?.startChild({
    op: 'db.query',
    description: 'Supabase query',
  });

  try {
    const { data, error } = await queryFn();

    if (error) {
      Sentry.captureException(error, {
        tags: { service: 'supabase' },
      });
      throw error;
    }

    childSpan?.setStatus('ok');
    return data;
  } catch (error) {
    childSpan?.setStatus('internal_error');
    throw error;
  } finally {
    childSpan?.finish();
  }
}
```

### With Inngest (Background Job Errors)

```typescript
// inngest/functions/process-job.ts
import { inngest } from '@/lib/inngest';
import * as Sentry from '@sentry/nextjs';

export const processJob = inngest.createFunction(
  {
    id: 'process-job',
    onFailure: async ({ error, event }) => {
      // Capture Inngest function failures in Sentry
      Sentry.captureException(error, {
        tags: {
          service: 'inngest',
          function: 'process-job',
        },
        contexts: {
          inngest: {
            eventId: event.id,
            eventName: event.name,
          },
        },
      });
    },
  },
  { event: 'job.process' },
  async ({ event, step }) => {
    const transaction = Sentry.startTransaction({
      name: 'Inngest: process-job',
      op: 'inngest.function',
    });

    try {
      await step.run('process', async () => {
        return await processData(event.data);
      });

      transaction.setStatus('ok');
    } catch (error) {
      transaction.setStatus('internal_error');
      throw error;
    } finally {
      transaction.finish();
    }
  }
);
```

### With fal.ai (AI Service Errors)

```typescript
// app/api/ai/generate/route.ts
import * as Sentry from '@sentry/nextjs';
import * as fal from '@fal-ai/serverless-client';

export async function POST(request: Request) {
  const transaction = Sentry.startTransaction({
    name: 'AI Image Generation',
    op: 'ai.generate',
  });

  try {
    const { prompt } = await request.json();

    const span = transaction.startChild({
      op: 'ai.api',
      description: 'fal.ai API call',
    });

    const result = await fal.run('fal-ai/flux/dev', {
      input: { prompt },
    });

    span.finish();
    transaction.setStatus('ok');

    return NextResponse.json({ result });
  } catch (error) {
    transaction.setStatus('internal_error');

    Sentry.captureException(error, {
      tags: {
        service: 'fal-ai',
        model: 'flux/dev',
      },
      extra: {
        prompt: request.body,
      },
    });

    return NextResponse.json(
      { error: 'Generation failed' },
      { status: 500 }
    );
  } finally {
    transaction.finish();
  }
}
```

---

## Session Replay

### Enable Session Replay

Already configured in `sentry.client.config.ts`:

```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Capture 10% of all sessions
  replaysSessionSampleRate: 0.1,

  // Capture 100% of sessions with errors
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    new Sentry.Replay({
      // Mask all text content
      maskAllText: true,
      // Block all media elements
      blockAllMedia: true,
    }),
  ],
});
```

### Privacy Settings

```typescript
// Fine-tune privacy controls
new Sentry.Replay({
  // Mask sensitive data
  maskAllText: false,
  maskAllInputs: true,

  // Block sensitive elements
  block: ['.password-field', '.credit-card'],

  // Unmask specific elements
  unmask: ['.public-data'],

  // Block media
  blockAllMedia: false,
})
```

---

## Release Tracking

### Configure Releases

```javascript
// next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(
  {
    // Your Next.js config
  },
  {
    // Sentry webpack plugin options
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  },
  {
    // Sentry SDK options
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: '/monitoring',
    hideSourceMaps: true,
    disableLogger: true,
  }
);
```

### Set Release

```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',
});
```

---

## Alerts & Notifications

### Configure in Sentry Dashboard

1. Go to Alerts → Create Alert Rule
2. Choose conditions:
   - Error rate threshold
   - Performance degradation
   - New issue types
3. Set notification channels:
   - Email
   - Slack
   - PagerDuty
   - Discord

### Slack Integration

```typescript
// Errors automatically sent to Slack when configured
// in Sentry dashboard under Settings → Integrations
```

---

## Best Practices

### 1. Environment Variables

```bash
# Required
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# For source maps upload
SENTRY_AUTH_TOKEN=xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project

# Optional
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
SENTRY_IGNORE_API_RESOLUTION_ERROR=1
```

### 2. Sample Rates

```typescript
// Adjust sample rates for production
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance: Sample 10% of transactions
  tracesSampleRate: 0.1,

  // Session Replay: Sample 1% of sessions
  replaysSessionSampleRate: 0.01,

  // But capture 100% of errors
  replaysOnErrorSampleRate: 1.0,
});
```

### 3. Filtering Events

```typescript
// Filter out known issues
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  beforeSend(event, hint) {
    // Don't send browser extension errors
    if (event.exception?.values?.[0]?.value?.includes('chrome-extension')) {
      return null;
    }

    // Don't send specific errors
    if (event.exception?.values?.[0]?.type === 'ChunkLoadError') {
      return null;
    }

    return event;
  },

  ignoreErrors: [
    // Ignore specific error messages
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
});
```

### 4. Source Maps

Ensure source maps are uploaded:

```json
// package.json
{
  "scripts": {
    "build": "next build",
    "sentry:sourcemaps": "sentry-cli sourcemaps inject .next && sentry-cli sourcemaps upload .next"
  }
}
```

### 5. Error Boundaries

```typescript
// components/error-boundary.tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

---

## Testing

### Test Sentry Setup

```typescript
// app/sentry-test/page.tsx
'use client';

import * as Sentry from '@sentry/nextjs';

export default function SentryTestPage() {
  const throwError = () => {
    throw new Error('Test error from Sentry test page');
  };

  const captureMessage = () => {
    Sentry.captureMessage('Test message from Sentry', 'info');
  };

  return (
    <div>
      <h1>Sentry Test</h1>
      <button onClick={throwError}>Throw Error</button>
      <button onClick={captureMessage}>Send Message</button>
    </div>
  );
}
```

---

## Pricing

**Free Tier:**
- 5,000 errors/month
- 10,000 performance units/month
- 30-day retention
- 1 project

**Team ($26/month):**
- 50,000 errors/month
- 100,000 performance units/month
- 90-day retention
- Unlimited projects

**Business ($80/month):**
- 100,000 errors/month
- 300,000 performance units/month
- 90-day retention
- Priority support

---

## Resources

- **Documentation:** https://docs.sentry.io
- **Dashboard:** https://sentry.io
- **Next.js Integration:** https://docs.sentry.io/platforms/javascript/guides/nextjs
- **Discord:** https://discord.gg/sentry
- **Status:** https://status.sentry.io

---

## Next Steps

1. Sign up for Sentry account
2. Run Sentry wizard for Next.js
3. Configure environment variables
4. Test error capture
5. Set up alerts
6. Configure release tracking
7. Enable session replay
8. Monitor production errors

For more examples, see the template repositories in `/home/mibady/ai-coder-workspace/templates/`.
