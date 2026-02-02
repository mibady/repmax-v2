# Upstash QStash - Message Queue & Task Scheduling

**Official Website:** https://upstash.com/qstash
**Documentation:** https://upstash.com/docs/qstash
**Pricing:** Free tier: 500 messages/day

---

## Overview

Upstash QStash is a serverless message queue and task scheduler built for serverless and edge functions. It provides reliable message delivery, scheduling, retries, and callbacks without requiring persistent connections. Perfect for background jobs, webhooks, and scheduled tasks.

### Key Features

- ✅ HTTP-based message queue
- ✅ Task scheduling (cron & one-time)
- ✅ Automatic retries with backoff
- ✅ Message callbacks & DLQ
- ✅ Request signing & verification
- ✅ URL groups for load balancing
- ✅ Message deduplication
- ✅ At-least-once delivery
- ✅ Edge-compatible
- ✅ TypeScript SDK

---

## Use Cases for AI Coder

1. **Background Jobs**
   - Email sending
   - Image processing
   - Data exports
   - Report generation

2. **Scheduled Tasks**
   - Cron jobs
   - Recurring reports
   - Data cleanup
   - Reminder emails

3. **Webhooks**
   - Webhook forwarding
   - Retry failed webhooks
   - Webhook fan-out
   - Webhook reliability

4. **Event Processing**
   - Async event handling
   - Event fan-out
   - Event orchestration
   - Delayed events

---

## Quick Start

### 1. Installation

```bash
npm install @upstash/qstash
# or
pnpm add @upstash/qstash
```

### 2. Get API Keys

1. Sign up at https://upstash.com
2. Navigate to QStash
3. Copy your token and signing keys
4. Add to `.env.local`:

```bash
QSTASH_URL=https://qstash.upstash.io
QSTASH_TOKEN=xxx
QSTASH_CURRENT_SIGNING_KEY=xxx
QSTASH_NEXT_SIGNING_KEY=xxx
```

### 3. Initialize Client

```typescript
// lib/qstash.ts
import { Client } from '@upstash/qstash';

export const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});
```

---

## Publishing Messages

### Basic Message

```typescript
// app/api/send-email/route.ts
import { qstash } from '@/lib/qstash';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, subject, message } = await request.json();

  // Publish message to endpoint
  await qstash.publishJSON({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/process-email`,
    body: {
      email,
      subject,
      message,
    },
  });

  return NextResponse.json({ success: true });
}
```

### Delayed Message

```typescript
// app/api/schedule-reminder/route.ts
import { qstash } from '@/lib/qstash';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { userId, message, delaySeconds } = await request.json();

  // Send message after delay
  await qstash.publishJSON({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/send-reminder`,
    body: { userId, message },
    delay: delaySeconds, // Delay in seconds
  });

  return NextResponse.json({ success: true });
}
```

### Scheduled Message (Cron)

```typescript
// scripts/setup-cron.ts
import { qstash } from '@/lib/qstash';

async function setupDailyReport() {
  // Create schedule
  const schedule = await qstash.schedules.create({
    destination: `${process.env.NEXT_PUBLIC_APP_URL}/api/daily-report`,
    cron: '0 9 * * *', // Every day at 9 AM
  });

  console.log('Created schedule:', schedule.scheduleId);
}

setupDailyReport();
```

---

## Receiving Messages

### Verify and Process

```typescript
// app/api/process-email/route.ts
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { resend } from '@/lib/resend';
import { NextResponse } from 'next/server';

async function handler(request: Request) {
  const { email, subject, message } = await request.json();

  // Process the message
  await resend.emails.send({
    from: 'noreply@yourdomain.com',
    to: email,
    subject,
    html: `<p>${message}</p>`,
  });

  return NextResponse.json({ success: true });
}

export const POST = verifySignatureAppRouter(handler);
```

### Manual Verification

```typescript
// app/api/webhook/route.ts
import { Receiver } from '@upstash/qstash';
import { NextResponse } from 'next/server';

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function POST(request: Request) {
  const signature = request.headers.get('upstash-signature')!;
  const body = await request.text();

  try {
    await receiver.verify({
      signature,
      body,
    });

    // Process message
    const data = JSON.parse(body);
    console.log('Verified message:', data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
}
```

---

## Advanced Features

### Retry Configuration

```typescript
// Custom retry configuration
await qstash.publishJSON({
  url: `${process.env.NEXT_PUBLIC_APP_URL}/api/process`,
  body: { data: 'important' },
  retries: 3, // Number of retries
  delay: 60, // Initial delay in seconds
});

// Default retry schedule:
// 1st retry: after 60s
// 2nd retry: after 120s (2x)
// 3rd retry: after 240s (2x)
```

### Callbacks

```typescript
// Get notified when message is delivered or fails
await qstash.publishJSON({
  url: `${process.env.NEXT_PUBLIC_APP_URL}/api/process`,
  body: { data: 'test' },
  callback: `${process.env.NEXT_PUBLIC_APP_URL}/api/callback`,
  failureCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/failure`,
});
```

### Callback Handler

```typescript
// app/api/callback/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  console.log('Message delivered:', {
    messageId: body.messageId,
    status: body.status,
    url: body.url,
  });

  return NextResponse.json({ received: true });
}
```

### URL Groups

```typescript
// Create URL group for load balancing
const urlGroup = await qstash.urlGroups.upsertUrlGroup({
  name: 'my-workers',
  urls: [
    {
      url: 'https://worker1.example.com/process',
    },
    {
      url: 'https://worker2.example.com/process',
    },
    {
      url: 'https://worker3.example.com/process',
    },
  ],
});

// Publish to URL group
await qstash.publishJSON({
  urlGroup: 'my-workers',
  body: { data: 'test' },
});
```

### Content-Based Deduplication

```typescript
// Prevent duplicate messages
await qstash.publishJSON({
  url: `${process.env.NEXT_PUBLIC_APP_URL}/api/process`,
  body: { userId: '123', action: 'welcome' },
  contentBasedDeduplication: true,
  deduplicationId: 'welcome-123', // Optional custom ID
});

// Same message within 5 minutes won't be sent twice
```

---

## Schedules Management

### Create Schedule

```typescript
// lib/schedules.ts
import { qstash } from '@/lib/qstash';

export async function createDailyBackup() {
  return await qstash.schedules.create({
    destination: `${process.env.NEXT_PUBLIC_APP_URL}/api/backup`,
    cron: '0 2 * * *', // Daily at 2 AM
  });
}

export async function createHourlySync() {
  return await qstash.schedules.create({
    destination: `${process.env.NEXT_PUBLIC_APP_URL}/api/sync`,
    cron: '0 * * * *', // Every hour
    body: JSON.stringify({ type: 'sync' }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
```

### List Schedules

```typescript
const schedules = await qstash.schedules.list();

for (const schedule of schedules) {
  console.log({
    id: schedule.scheduleId,
    cron: schedule.cron,
    destination: schedule.destination,
  });
}
```

### Delete Schedule

```typescript
await qstash.schedules.delete(scheduleId);
```

### Pause/Resume Schedule

```typescript
// Pause
await qstash.schedules.pause(scheduleId);

// Resume
await qstash.schedules.resume(scheduleId);
```

---

## Integration with AI Coder Services

### With Resend (Email Queue)

```typescript
// app/api/queue-email/route.ts
import { qstash } from '@/lib/qstash';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { emails } = await request.json();

  // Queue emails for processing
  for (const email of emails) {
    await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/send-email`,
      body: email,
      retries: 3,
    });
  }

  return NextResponse.json({ queued: emails.length });
}
```

```typescript
// app/api/send-email/route.ts
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { resend } from '@/lib/resend';
import { NextResponse } from 'next/server';

async function handler(request: Request) {
  const { to, subject, body } = await request.json();

  await resend.emails.send({
    from: 'noreply@yourdomain.com',
    to,
    subject,
    html: body,
  });

  return NextResponse.json({ sent: true });
}

export const POST = verifySignatureAppRouter(handler);
```

### With Supabase Auth (User Events)

```typescript
// Database trigger or Edge Function for user creation
// Queue user onboarding tasks when user signs up

import { qstash } from '@/lib/qstash';

export async function queueOnboarding(userId: string, email: string) {
  await qstash.publishJSON({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/onboard-user`,
    body: { userId, email },
    delay: 5, // Wait 5 seconds
  });
}
```

### With Stripe (Payment Processing)

```typescript
// app/api/webhooks/stripe/route.ts
import { qstash } from '@/lib/qstash';
import Stripe from 'stripe';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const event: Stripe.Event = await verifyStripeWebhook(request);

  if (event.type === 'checkout.session.completed') {
    // Queue payment processing
    await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/process-payment`,
      body: event.data.object,
      retries: 5, // Important to retry
      callback: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment-callback`,
    });
  }

  return NextResponse.json({ received: true });
}
```

### With Supabase (Data Sync)

```typescript
// app/api/sync-data/route.ts
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

async function handler(request: Request) {
  const { data } = await request.json();
  const supabase = createServerClient();

  await supabase.from('analytics').insert(data);

  return NextResponse.json({ synced: true });
}

export const POST = verifySignatureAppRouter(handler);
```

### With Inngest (Workflow Orchestration)

```typescript
// Use QStash for simple tasks, Inngest for complex workflows

// QStash: Simple background task
await qstash.publishJSON({
  url: `${process.env.NEXT_PUBLIC_APP_URL}/api/simple-task`,
  body: { data },
});

// Inngest: Complex multi-step workflow
await inngest.send({
  name: 'user.onboarding',
  data: { userId },
});
```

---

## Patterns & Best Practices

### 1. Environment Variables

```bash
# Required
QSTASH_URL=https://qstash.upstash.io
QSTASH_TOKEN=xxx
QSTASH_CURRENT_SIGNING_KEY=xxx
QSTASH_NEXT_SIGNING_KEY=xxx

# Optional
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. Idempotent Handlers

```typescript
// Make handlers idempotent to handle retries safely
import { redis } from '@/lib/upstash-redis';

async function handler(request: Request) {
  const { messageId, data } = await request.json();

  // Check if already processed
  const processed = await redis.get(`processed:${messageId}`);
  if (processed) {
    return NextResponse.json({ success: true, cached: true });
  }

  // Process message
  await processData(data);

  // Mark as processed (store for 7 days)
  await redis.setex(`processed:${messageId}`, 604800, 'true');

  return NextResponse.json({ success: true });
}
```

### 3. Error Handling

```typescript
async function handler(request: Request) {
  try {
    const data = await request.json();
    await processData(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Processing error:', error);

    // Return 200 to prevent retry for known errors
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 200 });
    }

    // Return 5xx to trigger retry
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
}
```

### 4. Monitoring

```typescript
// app/api/callback/route.ts
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function POST(request: Request) {
  const body = await request.json();

  // Log successful deliveries
  if (body.status === 200) {
    console.log('Message delivered:', body.messageId);
  }

  // Alert on failures
  if (body.status >= 400) {
    Sentry.captureMessage('QStash delivery failed', {
      level: 'error',
      extra: body,
    });
  }

  return NextResponse.json({ received: true });
}
```

### 5. Batch Processing

```typescript
// Queue multiple messages efficiently
async function queueBatch(items: any[]) {
  const promises = items.map((item) =>
    qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/process`,
      body: item,
      retries: 3,
    })
  );

  await Promise.all(promises);
}
```

---

## Common Use Cases

### 1. Email Drip Campaign

```typescript
// Setup drip campaign
async function startDripCampaign(userId: string, email: string) {
  // Day 0: Welcome email
  await qstash.publishJSON({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/send-campaign-email`,
    body: { userId, email, template: 'welcome' },
    delay: 0,
  });

  // Day 1: Getting started
  await qstash.publishJSON({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/send-campaign-email`,
    body: { userId, email, template: 'getting-started' },
    delay: 86400, // 1 day
  });

  // Day 3: Tips & tricks
  await qstash.publishJSON({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/send-campaign-email`,
    body: { userId, email, template: 'tips' },
    delay: 259200, // 3 days
  });

  // Day 7: Upgrade offer
  await qstash.publishJSON({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/send-campaign-email`,
    body: { userId, email, template: 'upgrade' },
    delay: 604800, // 7 days
  });
}
```

### 2. Webhook Relay

```typescript
// Reliably forward webhooks
export async function POST(request: Request) {
  const payload = await request.json();

  // Queue webhook for reliable delivery
  await qstash.publishJSON({
    url: 'https://customer-endpoint.com/webhook',
    body: payload,
    retries: 5,
    callback: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook-status`,
  });

  return NextResponse.json({ accepted: true });
}
```

### 3. Scheduled Reports

```typescript
// Setup weekly report
const schedule = await qstash.schedules.create({
  destination: `${process.env.NEXT_PUBLIC_APP_URL}/api/generate-report`,
  cron: '0 8 * * 1', // Every Monday at 8 AM
  body: JSON.stringify({ type: 'weekly' }),
});
```

---

## Pricing

**Free Tier:**
- 500 messages/day
- All features included

**Pay-as-you-go:**
- $1.00 per 100,000 messages
- No minimum commitment

**Pro ($10/month):**
- Includes 500,000 messages
- Additional messages: $0.50 per 100,000

---

## Resources

- **Documentation:** https://upstash.com/docs/qstash
- **Console:** https://console.upstash.com/qstash
- **SDK Reference:** https://upstash.com/docs/qstash/sdks/ts/overview
- **Examples:** https://github.com/upstash/qstash-js/tree/main/examples

---

## Next Steps

1. Sign up for Upstash account
2. Get QStash token and signing keys
3. Install @upstash/qstash
4. Create message handler endpoints
5. Implement signature verification
6. Queue first message
7. Set up schedules for recurring tasks
8. Monitor callbacks and failures

For more examples, see the template repositories in `/home/mibady/ai-coder-workspace/templates/`.
