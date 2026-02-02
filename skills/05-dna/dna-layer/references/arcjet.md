# Arcjet - Security Layer for Applications

**Official Website:** https://arcjet.com
**Documentation:** https://docs.arcjet.com
**Pricing:** Free tier: 100,000 requests/month

---

## Overview

Arcjet is a security layer for applications that provides rate limiting, bot detection, DDoS protection, email validation, and PII detection. It's designed to be developer-friendly with a TypeScript-first SDK and works seamlessly with Next.js, Node.js, and other frameworks.

### Key Features

- ✅ Rate limiting & throttling
- ✅ Bot detection & blocking
- ✅ DDoS protection
- ✅ Email validation
- ✅ PII detection & redaction
- ✅ Attack monitoring
- ✅ Real-time analytics
- ✅ Edge runtime support
- ✅ TypeScript-first SDK
- ✅ Next.js optimized

---

## Use Cases for AI Coder

1. **API Protection**
   - Rate limit API endpoints
   - Prevent abuse
   - Block bots
   - Monitor attacks

2. **Authentication Security**
   - Login rate limiting
   - Signup protection
   - Password reset throttling
   - Email validation

3. **User Input Protection**
   - PII detection
   - Email validation
   - Bot detection on forms
   - Spam prevention

4. **AI/LLM Protection**
   - Rate limit AI endpoints
   - Prevent prompt injection
   - Monitor usage
   - Control costs

---

## Quick Start

### 1. Installation

```bash
npm install @arcjet/next
# or
pnpm add @arcjet/next
```

### 2. Get API Key

1. Sign up at https://arcjet.com
2. Create a new site
3. Copy your site key
4. Add to `.env.local`:

```bash
ARCJET_KEY=ajkey_xxx
```

### 3. Basic Setup

```typescript
// lib/arcjet.ts
import arcjet, { detectBot, shield } from '@arcjet/next';

export const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // Bot detection
    detectBot({
      mode: 'LIVE', // or 'DRY_RUN' for testing
      allow: [], // Allow specific bots
    }),
    // Shield from common attacks
    shield({
      mode: 'LIVE',
    }),
  ],
});
```

### 4. Protect API Route

```typescript
// app/api/protected/route.ts
import { aj } from '@/lib/arcjet';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    return NextResponse.json(
      { error: 'Forbidden', reason: decision.reason },
      { status: 403 }
    );
  }

  return NextResponse.json({ message: 'Success' });
}
```

---

## Rate Limiting

### Token Bucket Rate Limiting

```typescript
// app/api/chat/route.ts
import arcjet, { tokenBucket } from '@arcjet/next';
import { NextResponse } from 'next/server';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    tokenBucket({
      mode: 'LIVE',
      refillRate: 10, // 10 tokens
      interval: 60, // per 60 seconds
      capacity: 20, // bucket capacity
    }),
  ],
});

export async function POST(request: Request) {
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          resetAt: decision.reason.resetTime,
        },
        { status: 429 }
      );
    }
  }

  // Process request
  const body = await request.json();
  return NextResponse.json({ success: true });
}
```

### Sliding Window Rate Limiting

```typescript
import arcjet, { slidingWindow } from '@arcjet/next';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    slidingWindow({
      mode: 'LIVE',
      max: 100, // 100 requests
      interval: 3600, // per hour
    }),
  ],
});
```

### Fixed Window Rate Limiting

```typescript
import arcjet, { fixedWindow } from '@arcjet/next';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    fixedWindow({
      mode: 'LIVE',
      max: 1000, // 1000 requests
      interval: 86400, // per day
    }),
  ],
});
```

### Per-User Rate Limiting

```typescript
// app/api/user-action/route.ts
import { aj } from '@/lib/arcjet';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit per user
  const decision = await aj.protect(request, {
    userId, // Use userId as the identifier
  });

  if (decision.isDenied()) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  // Process request
  return NextResponse.json({ success: true });
}
```

---

## Bot Detection

### Basic Bot Protection

```typescript
// app/api/signup/route.ts
import arcjet, { detectBot } from '@arcjet/next';
import { NextResponse } from 'next/server';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: 'LIVE',
      // Allow specific bots (e.g., search engines)
      allow: [
        'CATEGORY:SEARCH_ENGINE',
        'GOOGLE_CRAWLER',
        'BING_CRAWLER',
      ],
    }),
  ],
});

export async function POST(request: Request) {
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    if (decision.reason.isBot()) {
      return NextResponse.json(
        { error: 'Bot detected' },
        { status: 403 }
      );
    }
  }

  // Process signup
  const body = await request.json();
  return NextResponse.json({ success: true });
}
```

### Allow Specific Bots

```typescript
import arcjet, { detectBot } from '@arcjet/next';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: 'LIVE',
      allow: [
        // Categories
        'CATEGORY:SEARCH_ENGINE',
        'CATEGORY:MONITOR',
        'CATEGORY:PREVIEW',
        // Specific bots
        'GOOGLE_CRAWLER',
        'BING_CRAWLER',
        'SLACKBOT',
      ],
    }),
  ],
});
```

---

## Email Validation

### Validate Email on Signup

```typescript
// app/api/auth/signup/route.ts
import arcjet, { validateEmail } from '@arcjet/next';
import { NextResponse } from 'next/server';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    validateEmail({
      mode: 'LIVE',
      block: [
        'DISPOSABLE', // Block disposable emails
        'NO_MX_RECORDS', // Block emails with no MX records
        'INVALID', // Block invalid emails
      ],
    }),
  ],
});

export async function POST(request: Request) {
  const body = await request.json();
  const { email } = body;

  const decision = await aj.protect(request, {
    email,
  });

  if (decision.isDenied()) {
    if (decision.reason.isEmail()) {
      return NextResponse.json(
        {
          error: 'Invalid email',
          details: decision.reason.emailTypes,
        },
        { status: 400 }
      );
    }
  }

  // Create user
  return NextResponse.json({ success: true });
}
```

### Email Validation Options

```typescript
validateEmail({
  mode: 'LIVE',
  block: [
    'DISPOSABLE',      // temp-mail.org, guerrillamail.com
    'NO_MX_RECORDS',   // No mail server
    'INVALID',         // Malformed email
    'NO_GRAVATAR',     // No Gravatar (optional)
    'FREE',            // Free email providers (optional)
  ],
  requireTopLevelDomain: true, // Require TLD
  allowDomains: ['company.com'], // Allow specific domains
  blockDomains: ['competitor.com'], // Block specific domains
})
```

---

## PII Detection

### Detect and Redact PII

```typescript
// app/api/support/route.ts
import arcjet, { detectPII } from '@arcjet/next';
import { NextResponse } from 'next/server';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectPII({
      mode: 'LIVE',
      detect: [
        'EMAIL',
        'PHONE_NUMBER',
        'CREDIT_CARD',
        'SSN',
        'IP_ADDRESS',
      ],
      redact: true, // Auto-redact PII
    }),
  ],
});

export async function POST(request: Request) {
  const body = await request.json();
  const { message } = body;

  const decision = await aj.protect(request, {
    text: message,
  });

  if (decision.isDenied()) {
    return NextResponse.json(
      { error: 'PII detected in message' },
      { status: 400 }
    );
  }

  // If redaction is enabled, get redacted text
  const redactedMessage = decision.reason.isPII()
    ? decision.reason.redactedText
    : message;

  // Save support ticket with redacted message
  return NextResponse.json({
    success: true,
    message: redactedMessage,
  });
}
```

---

## Shield (DDoS Protection)

### Basic Shield Protection

```typescript
// app/api/public/route.ts
import arcjet, { shield } from '@arcjet/next';
import { NextResponse } from 'next/server';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({
      mode: 'LIVE',
    }),
  ],
});

export async function GET(request: Request) {
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    return NextResponse.json(
      { error: 'Request blocked' },
      { status: 403 }
    );
  }

  return NextResponse.json({ message: 'Success' });
}
```

---

## Advanced Patterns

### Multiple Rules

```typescript
// app/api/ai/generate/route.ts
import arcjet, { tokenBucket, detectBot, shield } from '@arcjet/next';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // Bot detection
    detectBot({
      mode: 'LIVE',
      allow: [],
    }),
    // DDoS protection
    shield({
      mode: 'LIVE',
    }),
    // Rate limiting for AI generation
    tokenBucket({
      mode: 'LIVE',
      refillRate: 5, // 5 generations
      interval: 3600, // per hour
      capacity: 10, // burst capacity
    }),
  ],
});

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const decision = await aj.protect(request, { userId });

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          resetAt: decision.reason.resetTime,
        },
        { status: 429 }
      );
    }

    if (decision.reason.isBot()) {
      return NextResponse.json(
        { error: 'Bot detected' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Request blocked' },
      { status: 403 }
    );
  }

  // Process AI generation
  const body = await request.json();
  return NextResponse.json({ success: true });
}
```

### Middleware Protection

```typescript
// middleware.ts
import arcjet, { createMiddleware, detectBot, shield } from '@arcjet/next';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: 'LIVE',
      allow: ['CATEGORY:SEARCH_ENGINE'],
    }),
    shield({
      mode: 'LIVE',
    }),
  ],
});

export default createMiddleware(aj);

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### Conditional Rules

```typescript
// app/api/data/route.ts
import arcjet, { tokenBucket } from '@arcjet/next';
import { NextResponse } from 'next/server';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // Authenticated users: 100 req/hour
    tokenBucket({
      mode: 'LIVE',
      refillRate: 100,
      interval: 3600,
      capacity: 150,
      characteristics: ['userId'],
    }),
    // Anonymous users: 10 req/hour
    tokenBucket({
      mode: 'LIVE',
      refillRate: 10,
      interval: 3600,
      capacity: 15,
      characteristics: ['ip'],
    }),
  ],
});

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id');

  const decision = await aj.protect(request, {
    userId: userId || undefined,
    requested: 1,
  });

  if (decision.isDenied()) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  return NextResponse.json({ data: [] });
}
```

---

## Integration with AI Coder Services

### With Clerk (Authentication)

```typescript
// app/api/auth/signin/route.ts
import arcjet, { tokenBucket, shield } from '@arcjet/next';
import { NextResponse } from 'next/server';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: 'LIVE' }),
    tokenBucket({
      mode: 'LIVE',
      refillRate: 5, // 5 login attempts
      interval: 900, // per 15 minutes
      capacity: 5,
    }),
  ],
});

export async function POST(request: Request) {
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    return NextResponse.json(
      { error: 'Too many login attempts' },
      { status: 429 }
    );
  }

  // Process login with Clerk
  return NextResponse.json({ success: true });
}
```

### With Resend (Email)

```typescript
// app/api/contact/route.ts
import arcjet, { tokenBucket, validateEmail, detectBot } from '@arcjet/next';
import { resend } from '@/lib/resend';
import { NextResponse } from 'next/server';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({ mode: 'LIVE' }),
    validateEmail({
      mode: 'LIVE',
      block: ['DISPOSABLE', 'INVALID'],
    }),
    tokenBucket({
      mode: 'LIVE',
      refillRate: 3, // 3 emails
      interval: 3600, // per hour
      capacity: 5,
    }),
  ],
});

export async function POST(request: Request) {
  const body = await request.json();
  const { email, message } = body;

  const decision = await aj.protect(request, { email });

  if (decision.isDenied()) {
    return NextResponse.json(
      { error: 'Request blocked' },
      { status: 403 }
    );
  }

  // Send email
  await resend.emails.send({
    from: 'contact@yourdomain.com',
    to: 'support@yourdomain.com',
    subject: 'Contact Form Submission',
    html: `<p>From: ${email}</p><p>${message}</p>`,
  });

  return NextResponse.json({ success: true });
}
```

### With Stripe (Payments)

```typescript
// app/api/checkout/route.ts
import arcjet, { tokenBucket, shield } from '@arcjet/next';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: 'LIVE' }),
    tokenBucket({
      mode: 'LIVE',
      refillRate: 10, // 10 checkout attempts
      interval: 3600, // per hour
      capacity: 15,
    }),
  ],
});

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const decision = await aj.protect(request, { userId });

  if (decision.isDenied()) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    // ... checkout config
  });

  return NextResponse.json({ sessionId: session.id });
}
```

### With fal.ai (AI Generation)

```typescript
// app/api/ai/image/route.ts
import arcjet, { tokenBucket, detectBot } from '@arcjet/next';
import * as fal from '@fal-ai/serverless-client';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({ mode: 'LIVE' }),
    tokenBucket({
      mode: 'LIVE',
      refillRate: 10, // 10 images
      interval: 3600, // per hour
      capacity: 20,
    }),
  ],
});

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const decision = await aj.protect(request, { userId });

  if (decision.isDenied()) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        resetAt: decision.reason.resetTime,
      },
      { status: 429 }
    );
  }

  // Generate image with fal.ai
  const body = await request.json();
  const result = await fal.run('fal-ai/flux/dev', {
    input: { prompt: body.prompt },
  });

  return NextResponse.json({ image: result.images[0] });
}
```

### With Sentry (Error Tracking)

```typescript
// lib/arcjet.ts
import arcjet from '@arcjet/next';
import * as Sentry from '@sentry/nextjs';

export const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // ... rules
  ],
  onError: (error) => {
    // Log Arcjet errors to Sentry
    Sentry.captureException(error, {
      tags: {
        service: 'arcjet',
      },
    });
  },
});
```

---

## Server Actions Protection

```typescript
// app/actions/create-post.ts
'use server';

import arcjet, { tokenBucket } from '@arcjet/next';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    tokenBucket({
      mode: 'LIVE',
      refillRate: 30, // 30 posts
      interval: 3600, // per hour
      capacity: 50,
    }),
  ],
});

export async function createPost(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Create request from headers
  const headersList = headers();
  const request = new Request('http://localhost', {
    headers: headersList,
  });

  const decision = await aj.protect(request, { userId });

  if (decision.isDenied()) {
    throw new Error('Rate limit exceeded');
  }

  // Create post
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  // Save to database
  return { success: true };
}
```

---

## Best Practices

### 1. Environment Setup

```bash
# Development
ARCJET_KEY=ajkey_test_xxx
ARCJET_ENV=development

# Production
ARCJET_KEY=ajkey_live_xxx
ARCJET_ENV=production
```

### 2. Start with DRY_RUN

```typescript
// Test rules in dry run mode first
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    tokenBucket({
      mode: process.env.NODE_ENV === 'production' ? 'LIVE' : 'DRY_RUN',
      refillRate: 10,
      interval: 60,
      capacity: 20,
    }),
  ],
});
```

### 3. Handle Denied Requests Gracefully

```typescript
export async function POST(request: Request) {
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    // Log for monitoring
    console.warn('Request denied:', {
      reason: decision.reason.type,
      ip: decision.ip,
    });

    // Return helpful error
    if (decision.reason.isRateLimit()) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          resetAt: decision.reason.resetTime,
          retryAfter: decision.reason.resetInSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(decision.reason.resetInSeconds),
          },
        }
      );
    }

    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  // Process request
}
```

### 4. Monitor and Adjust

```typescript
// Track decision results
const decision = await aj.protect(request, { userId });

// Log metrics
console.log({
  allowed: decision.isAllowed(),
  denied: decision.isDenied(),
  reason: decision.reason?.type,
  userId,
});

// Adjust rules based on metrics
```

### 5. Use Appropriate Identifiers

```typescript
// Per-user limits (authenticated)
await aj.protect(request, { userId });

// Per-IP limits (anonymous)
await aj.protect(request);

// Per-session limits
await aj.protect(request, { sessionId });

// Custom identifier
await aj.protect(request, {
  fingerprint: customFingerprint
});
```

---

## Testing

### Local Testing

```typescript
// test/arcjet.test.ts
import { aj } from '@/lib/arcjet';

describe('Arcjet Protection', () => {
  it('should allow requests under rate limit', async () => {
    const request = new Request('http://localhost/api/test');
    const decision = await aj.protect(request);

    expect(decision.isAllowed()).toBe(true);
  });

  it('should deny requests over rate limit', async () => {
    const request = new Request('http://localhost/api/test');

    // Make requests until rate limit
    for (let i = 0; i < 100; i++) {
      await aj.protect(request);
    }

    const decision = await aj.protect(request);
    expect(decision.isDenied()).toBe(true);
    expect(decision.reason.isRateLimit()).toBe(true);
  });
});
```

### Integration Testing

```typescript
// test/api/protected.test.ts
import { POST } from '@/app/api/protected/route';

describe('Protected API Route', () => {
  it('should return 429 when rate limited', async () => {
    const request = new Request('http://localhost/api/protected', {
      method: 'POST',
    });

    // Exhaust rate limit
    for (let i = 0; i < 100; i++) {
      await POST(request);
    }

    const response = await POST(request);
    expect(response.status).toBe(429);
  });
});
```

---

## Pricing

**Free Tier:**
- 100,000 requests/month
- All features included
- Community support

**Pro ($20/month):**
- 1,000,000 requests/month
- $0.50 per additional 100,000 requests
- Email support
- Advanced analytics

**Enterprise:**
- Custom volume
- Dedicated support
- SLA guarantees
- Custom rules

---

## Common Patterns

### 1. Public API with Tiered Limits

```typescript
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // Free tier: 100/hour
    tokenBucket({
      mode: 'LIVE',
      refillRate: 100,
      interval: 3600,
      capacity: 120,
      characteristics: ['userId'],
      when: (context) => context.tier === 'free',
    }),
    // Pro tier: 1000/hour
    tokenBucket({
      mode: 'LIVE',
      refillRate: 1000,
      interval: 3600,
      capacity: 1200,
      characteristics: ['userId'],
      when: (context) => context.tier === 'pro',
    }),
  ],
});
```

### 2. Form Submission Protection

```typescript
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({ mode: 'LIVE' }),
    shield({ mode: 'LIVE' }),
    validateEmail({
      mode: 'LIVE',
      block: ['DISPOSABLE', 'INVALID'],
    }),
    tokenBucket({
      mode: 'LIVE',
      refillRate: 5,
      interval: 3600,
      capacity: 10,
    }),
  ],
});
```

### 3. Webhook Security

```typescript
// app/api/webhooks/stripe/route.ts
import arcjet, { shield } from '@arcjet/next';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: 'LIVE' }),
  ],
});

export async function POST(request: Request) {
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  // Verify webhook signature
  const signature = request.headers.get('stripe-signature');
  // Process webhook...
}
```

---

## Resources

- **Documentation:** https://docs.arcjet.com
- **Examples:** https://github.com/arcjet/arcjet-js/tree/main/examples
- **Discord:** https://discord.gg/arcjet
- **Status:** https://status.arcjet.com
- **Blog:** https://arcjet.com/blog

---

## Next Steps

1. Sign up for Arcjet account
2. Install SDK
3. Configure rules for your use case
4. Test in DRY_RUN mode
5. Monitor analytics
6. Adjust rules based on traffic
7. Deploy to production in LIVE mode

For more examples, see the template repositories in `/home/mibady/ai-coder-workspace/templates/`.
