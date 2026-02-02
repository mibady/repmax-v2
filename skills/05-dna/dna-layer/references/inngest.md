# Inngest - Workflow Automation & Background Jobs

**Official Website:** https://www.inngest.com
**Documentation:** https://www.inngest.com/docs
**Pricing:** Free tier: 10,000 steps/month

---

## Overview

Inngest is a developer platform for background jobs, scheduled tasks, and complex workflows. It provides reliable event-driven execution with built-in retries, concurrency control, and observability.

### Key Features

- ✅ Event-driven workflows
- ✅ Automatic retries
- ✅ Built-in

 cron scheduling
- ✅ Concurrency control
- ✅ Type-safe TypeScript SDK
- ✅ Real-time observability
- ✅ Local development tools
- ✅ Zero infrastructure management
- ✅ Next.js optimized

---

## Use Cases for AI Coder

1. **Background Processing**
   - Image processing
   - Video transcoding
   - Data exports
   - Report generation

2. **User Workflows**
   - Onboarding sequences
   - Email campaigns
   - Payment processing
   - Notification delivery

3. **Scheduled Tasks**
   - Daily reports
   - Data cleanup
   - Subscription renewals
   - Content publishing

4. **AI Workflows**
   - RAG document processing
   - Batch AI inference
   - Model fine-tuning
   - Vector embedding generation

---

## Quick Start

### 1. Installation

```bash
npm install inngest
# or
pnpm add inngest
```

### 2. Setup Inngest Client

```typescript
// lib/inngest.ts
import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'my-app',
  name: 'My App',
});
```

### 3. Create Your First Function

```typescript
// inngest/functions/hello-world.ts
import { inngest } from '@/lib/inngest';

export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'demo/hello.world' },
  async ({ event, step }) => {
    await step.run('send-greeting', async () => {
      console.log('Hello', event.data.name);
      return { message: `Hello ${event.data.name}!` };
    });
  }
);
```

### 4. Create API Route

```typescript
// app/api/inngest/route.ts
import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import { helloWorld } from '@/inngest/functions/hello-world';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld,
    // Add more functions here
  ],
});
```

### 5. Send Events

```typescript
// app/actions/send-event.ts
'use server';

import { inngest } from '@/lib/inngest';

export async function triggerHelloWorld(name: string) {
  await inngest.send({
    name: 'demo/hello.world',
    data: { name },
  });
}
```

---

## Core Concepts

### Events

Events trigger functions:

```typescript
// Send a single event
await inngest.send({
  name: 'user.created',
  data: {
    userId: '123',
    email: 'user@example.com',
  },
});

// Send multiple events
await inngest.send([
  { name: 'user.created', data: { userId: '123' } },
  { name: 'email.send', data: { to: 'user@example.com' } },
]);
```

### Functions

Functions process events:

```typescript
export const processUser = inngest.createFunction(
  {
    id: 'process-user',
    retries: 3, // Auto-retry on failure
  },
  { event: 'user.created' },
  async ({ event, step }) => {
    // Function logic
  }
);
```

### Steps

Steps are retriable units of work:

```typescript
export const onboardUser = inngest.createFunction(
  { id: 'onboard-user' },
  { event: 'user.created' },
  async ({ event, step }) => {
    // Step 1: Create user profile
    const profile = await step.run('create-profile', async () => {
      return await createProfile(event.data.userId);
    });

    // Step 2: Send welcome email
    await step.run('send-welcome-email', async () => {
      return await sendEmail(profile.email);
    });

    // Step 3: Add to marketing list
    await step.run('add-to-marketing', async () => {
      return await addToList(profile.email);
    });
  }
);
```

---

## Advanced Features

### Sleep & Delays

```typescript
export const delayedNotification = inngest.createFunction(
  { id: 'delayed-notification' },
  { event: 'user.trial.started' },
  async ({ event, step }) => {
    // Wait 7 days
    await step.sleep('wait-for-trial-end', '7d');

    // Send reminder
    await step.run('send-reminder', async () => {
      return await sendEmail(event.data.email, 'Trial ending soon!');
    });
  }
);
```

### Scheduled Functions (Cron)

```typescript
export const dailyReport = inngest.createFunction(
  { id: 'daily-report' },
  { cron: '0 9 * * *' }, // Every day at 9 AM
  async ({ step }) => {
    const data = await step.run('fetch-data', async () => {
      return await fetchDailyMetrics();
    });

    await step.run('send-report', async () => {
      return await sendReport(data);
    });
  }
);
```

### Concurrency Control

```typescript
export const processVideo = inngest.createFunction(
  {
    id: 'process-video',
    concurrency: {
      limit: 5, // Only 5 concurrent executions
    },
  },
  { event: 'video.uploaded' },
  async ({ event, step }) => {
    await step.run('transcode', async () => {
      return await transcodeVideo(event.data.videoId);
    });
  }
);
```

### Rate Limiting

```typescript
export const sendEmail = inngest.createFunction(
  {
    id: 'send-email',
    rateLimit: {
      limit: 100,
      period: '1h', // Max 100 emails per hour
    },
  },
  { event: 'email.send' },
  async ({ event, step }) => {
    await step.run('send', async () => {
      return await resend.emails.send(event.data);
    });
  }
);
```

### Batching Events

```typescript
export const batchProcess = inngest.createFunction(
  {
    id: 'batch-process',
    batchEvents: {
      maxSize: 100,
      timeout: '5s',
    },
  },
  { event: 'data.process' },
  async ({ events, step }) => {
    await step.run('process-batch', async () => {
      const data = events.map(e => e.data);
      return await processBatch(data);
    });
  }
);
```

### Error Handling

```typescript
export const resilientFunction = inngest.createFunction(
  {
    id: 'resilient-function',
    retries: 3,
    onFailure: async ({ error, event }) => {
      // Log to Sentry
      Sentry.captureException(error);

      // Send alert
      await sendAlert(`Function failed: ${error.message}`);
    },
  },
  { event: 'critical.task' },
  async ({ event, step }) => {
    return await step.run('process', async () => {
      // Your logic
    });
  }
);
```

---

## Integration with AI Coder Services

### With Resend (Email)

```typescript
import { inngest } from '@/lib/inngest';
import { resend } from '@/lib/resend';
import { WelcomeEmail } from '@/emails/welcome-email';

export const sendWelcomeEmail = inngest.createFunction(
  { id: 'send-welcome-email' },
  { event: 'user.created' },
  async ({ event, step }) => {
    await step.run('send-email', async () => {
      return await resend.emails.send({
        from: 'onboarding@yourdomain.com',
        to: event.data.email,
        subject: 'Welcome!',
        react: WelcomeEmail({ username: event.data.name }),
      });
    });
  }
);
```

### With Stripe (Payments)

```typescript
export const handlePaymentSuccess = inngest.createFunction(
  { id: 'handle-payment-success' },
  { event: 'stripe/payment.succeeded' },
  async ({ event, step }) => {
    // 1. Update database
    const subscription = await step.run('update-subscription', async () => {
      return await updateUserSubscription(event.data);
    });

    // 2. Send invoice
    await step.run('send-invoice', async () => {
      return await sendInvoice(subscription);
    });

    // 3. Grant access
    await step.run('grant-access', async () => {
      return await grantPremiumAccess(event.data.userId);
    });
  }
);
```

### With fal.ai (AI Generation)

```typescript
export const generateImage = inngest.createFunction(
  {
    id: 'generate-image',
    concurrency: { limit: 10 }, // Limit concurrent AI calls
  },
  { event: 'image.generate' },
  async ({ event, step }) => {
    // 1. Generate image
    const result = await step.run('call-fal-ai', async () => {
      return await fal.run('fal-ai/flux/dev', {
        input: { prompt: event.data.prompt },
      });
    });

    // 2. Upload to storage
    const url = await step.run('upload-image', async () => {
      return await uploadToBlob(result.images[0].url);
    });

    // 3. Save to database
    await step.run('save-to-db', async () => {
      return await saveImage({
        userId: event.data.userId,
        url,
        prompt: event.data.prompt,
      });
    });

    return { url };
  }
);
```

### With Upstash Vector (RAG)

```typescript
export const processDocument = inngest.createFunction(
  { id: 'process-document' },
  { event: 'document.uploaded' },
  async ({ event, step }) => {
    // 1. Extract text
    const text = await step.run('extract-text', async () => {
      return await extractText(event.data.documentUrl);
    });

    // 2. Chunk text
    const chunks = await step.run('chunk-text', async () => {
      return splitIntoChunks(text);
    });

    // 3. Generate embeddings
    const embeddings = await step.run('generate-embeddings', async () => {
      return await generateEmbeddings(chunks);
    });

    // 4. Store in vector DB
    await step.run('store-vectors', async () => {
      return await vectorIndex.upsert(embeddings);
    });
  }
);
```

### With Supabase (Database)

```typescript
export const syncUserData = inngest.createFunction(
  { id: 'sync-user-data' },
  { cron: '0 * * * *' }, // Every hour
  async ({ step }) => {
    // 1. Fetch users from Supabase
    const users = await step.run('fetch-users', async () => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('needs_sync', true);
      return data;
    });

    // 2. Sync each user
    for (const user of users) {
      await step.run(`sync-user-${user.id}`, async () => {
        return await syncUserToExternalService(user);
      });
    }

    // 3. Update sync status
    await step.run('update-sync-status', async () => {
      return await supabase
        .from('users')
        .update({ needs_sync: false, last_synced: new Date() })
        .in('id', users.map(u => u.id));
    });
  }
);
```

---

## Real-World Examples

### User Onboarding Flow

```typescript
export const userOnboarding = inngest.createFunction(
  { id: 'user-onboarding' },
  { event: 'user.signup.completed' },
  async ({ event, step }) => {
    const { userId, email, name } = event.data;

    // Day 0: Welcome email
    await step.run('send-welcome', async () => {
      return await resend.emails.send({
        to: email,
        subject: 'Welcome!',
        react: WelcomeEmail({ name }),
      });
    });

    // Day 1: Setup guide
    await step.sleep('wait-1-day', '1d');
    await step.run('send-setup-guide', async () => {
      return await resend.emails.send({
        to: email,
        subject: 'Getting Started Guide',
        react: SetupGuideEmail({ name }),
      });
    });

    // Day 3: Feature highlights
    await step.sleep('wait-2-days', '2d');
    await step.run('send-features', async () => {
      return await resend.emails.send({
        to: email,
        subject: 'Discover Features',
        react: FeaturesEmail({ name }),
      });
    });

    // Day 7: Upgrade prompt
    await step.sleep('wait-4-days', '4d');
    await step.run('send-upgrade', async () => {
      const { data } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', userId)
        .single();

      if (data.subscription_tier === 'free') {
        return await resend.emails.send({
          to: email,
          subject: 'Upgrade to Pro',
          react: UpgradeEmail({ name }),
        });
      }
    });
  }
);
```

### Subscription Renewal

```typescript
export const subscriptionRenewal = inngest.createFunction(
  { id: 'subscription-renewal' },
  { cron: '0 0 * * *' }, // Daily at midnight
  async ({ step }) => {
    // Find expiring subscriptions
    const expiring = await step.run('find-expiring', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data } = await supabase
        .from('subscriptions')
        .select('*, users(*)')
        .eq('status', 'active')
        .lte('expires_at', tomorrow.toISOString());

      return data;
    });

    // Process each subscription
    for (const sub of expiring) {
      await step.run(`renew-${sub.id}`, async () => {
        // Attempt renewal
        const result = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);

        if (result.status === 'active') {
          // Update database
          await supabase
            .from('subscriptions')
            .update({ expires_at: new Date(result.current_period_end * 1000) })
            .eq('id', sub.id);
        } else {
          // Send payment failed email
          await resend.emails.send({
            to: sub.users.email,
            subject: 'Payment Failed',
            react: PaymentFailedEmail(sub),
          });
        }
      });
    }
  }
);
```

### Video Processing Pipeline

```typescript
export const videoProcessing = inngest.createFunction(
  {
    id: 'video-processing',
    concurrency: { limit: 3 }, // Max 3 concurrent video processes
  },
  { event: 'video.uploaded' },
  async ({ event, step }) => {
    const { videoId, url } = event.data;

    // 1. Download video
    const file = await step.run('download', async () => {
      return await downloadVideo(url);
    });

    // 2. Generate thumbnail
    const thumbnail = await step.run('thumbnail', async () => {
      return await generateThumbnail(file);
    });

    // 3. Transcode to multiple formats
    const formats = await step.run('transcode', async () => {
      return await Promise.all([
        transcodeVideo(file, '1080p'),
        transcodeVideo(file, '720p'),
        transcodeVideo(file, '480p'),
      ]);
    });

    // 4. Upload to Mux
    const muxAsset = await step.run('upload-mux', async () => {
      return await mux.video.uploads.create({
        url: formats[0].url,
      });
    });

    // 5. Update database
    await step.run('update-db', async () => {
      return await supabase
        .from('videos')
        .update({
          status: 'ready',
          thumbnail_url: thumbnail.url,
          mux_asset_id: muxAsset.id,
          formats: formats.map(f => ({ quality: f.quality, url: f.url })),
        })
        .eq('id', videoId);
    });

    // 6. Notify user
    await step.run('notify-user', async () => {
      return await inngest.send({
        name: 'notification.send',
        data: {
          userId: event.data.userId,
          message: 'Your video is ready!',
        },
      });
    });
  }
);
```

---

## Local Development

### 1. Install Inngest CLI

```bash
npm install -g inngest-cli
# or
npx inngest-cli@latest dev
```

### 2. Run Dev Server

```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Start Inngest Dev Server
npx inngest-cli@latest dev
```

### 3. Test Functions

```typescript
// test-inngest.ts
import { inngest } from '@/lib/inngest';

async function test() {
  await inngest.send({
    name: 'user.created',
    data: {
      userId: 'test-123',
      email: 'test@example.com',
    },
  });
}

test();
```

---

## Environment Variables

```bash
# Development
INNGEST_EVENT_KEY=your-event-key
INNGEST_SIGNING_KEY=your-signing-key

# Production (auto-configured on Vercel/Netlify)
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
INNGEST_SERVE_PATH=/api/inngest
```

---

## Best Practices

### 1. Function Organization

```
inngest/
├── functions/
│   ├── users/
│   │   ├── onboarding.ts
│   │   └── sync.ts
│   ├── payments/
│   │   ├── process.ts
│   │   └── refund.ts
│   └── ai/
│       ├── generate-image.ts
│       └── process-document.ts
└── index.ts
```

### 2. Type Safety

```typescript
// lib/inngest-types.ts
export type Events = {
  'user.created': {
    data: {
      userId: string;
      email: string;
      name: string;
    };
  };
  'video.uploaded': {
    data: {
      videoId: string;
      url: string;
      userId: string;
    };
  };
};

// lib/inngest.ts
export const inngest = new Inngest<{ Events: Events }>({
  id: 'my-app',
});
```

### 3. Error Monitoring

```typescript
export const monitoredFunction = inngest.createFunction(
  {
    id: 'monitored-function',
    onFailure: async ({ error, event }) => {
      // Log to Sentry
      Sentry.captureException(error, {
        contexts: {
          inngest: {
            event: event.name,
            data: event.data,
          },
        },
      });
    },
  },
  { event: 'user.action' },
  async ({ event, step }) => {
    // Function logic
  }
);
```

---

## Pricing

**Free Tier:**
- 10,000 steps/month
- Unlimited functions
- All features included

**Pro ($20/month):**
- 100,000 steps/month
- $0.20 per 1,000 additional steps
- Priority support

**Enterprise:**
- Custom pricing
- Dedicated support
- SLA guarantees

---

## Resources

- **Documentation:** https://www.inngest.com/docs
- **Examples:** https://github.com/inngest/inngest-js/tree/main/examples
- **Discord:** https://www.inngest.com/discord
- **Status:** https://status.inngest.com

---

## Next Steps

1. Install Inngest SDK
2. Create Inngest client
3. Build your first function
4. Set up API route
5. Test locally with Inngest Dev Server
6. Deploy to production

For template examples using Inngest, see `/home/mibady/ai-coder-workspace/templates/`.
