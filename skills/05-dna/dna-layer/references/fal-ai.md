# fal.ai - AI Image & Video Generation

**Official Website:** https://fal.ai
**Documentation:** https://fal.ai/docs
**Pricing:** Pay-per-use: $0.025-$0.10 per image (model dependent)

---

## Overview

fal.ai is a serverless AI platform that provides fast, scalable access to state-of-the-art AI models for image and video generation. It offers the latest models like FLUX, Stable Diffusion XL, and video generation models with optimized inference and queue management.

### Key Features

- ✅ Fast AI image generation
- ✅ Video generation models
- ✅ Image-to-image transformation
- ✅ Upscaling & enhancement
- ✅ Background removal
- ✅ Face swap & editing
- ✅ Real-time generation
- ✅ Queue management
- ✅ Webhook callbacks
- ✅ TypeScript SDK
- ✅ Next.js optimized

---

## Use Cases for AI Coder

1. **Content Generation**
   - Marketing images
   - Social media content
   - Product mockups
   - Illustrations

2. **Image Editing**
   - Background removal
   - Upscaling
   - Style transfer
   - Face editing

3. **Video Creation**
   - Text-to-video
   - Image-to-video
   - Video editing
   - Animations

4. **Personalization**
   - User avatars
   - Custom artwork
   - Brand assets
   - Dynamic content

---

## Quick Start

### 1. Installation

```bash
npm install @fal-ai/serverless-client
# or
pnpm add @fal-ai/serverless-client
```

### 2. Get API Key

1. Sign up at https://fal.ai
2. Navigate to Dashboard → API Keys
3. Create new API key
4. Add to `.env.local`:

```bash
FAL_KEY=xxx
```

### 3. Configure Client

```typescript
// lib/fal.ts
import * as fal from '@fal-ai/serverless-client';

fal.config({
  credentials: process.env.FAL_KEY!,
});

export { fal };
```

---

## Image Generation

### Text-to-Image (FLUX)

```typescript
// app/actions/generate-image.ts
'use server';

import * as fal from '@fal-ai/serverless-client';

export async function generateImage(prompt: string) {
  const result = await fal.run('fal-ai/flux/dev', {
    input: {
      prompt,
      image_size: 'landscape_4_3',
      num_inference_steps: 28,
      guidance_scale: 3.5,
      num_images: 1,
    },
  });

  return result.images[0];
}
```

### Text-to-Image (Stable Diffusion XL)

```typescript
// app/actions/generate-sdxl.ts
'use server';

import * as fal from '@fal-ai/serverless-client';

export async function generateSDXL(prompt: string, negativePrompt?: string) {
  const result = await fal.run('fal-ai/stable-diffusion-xl', {
    input: {
      prompt,
      negative_prompt: negativePrompt,
      image_size: 'square_hd',
      num_inference_steps: 30,
      guidance_scale: 7.5,
      num_images: 1,
    },
  });

  return result.images[0];
}
```

### Image Component

```typescript
// components/ai-image-generator.tsx
'use client';

import { useState } from 'react';
import { generateImage } from '@/app/actions/generate-image';
import Image from 'next/image';

export function AIImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return;

    setLoading(true);
    try {
      const result = await generateImage(prompt);
      setImage(result.url);
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          rows={4}
        />
        <button onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Image'}
        </button>
      </div>

      {image && (
        <div>
          <Image
            src={image}
            alt="Generated image"
            width={1024}
            height={768}
          />
          <a href={image} download>
            Download
          </a>
        </div>
      )}
    </div>
  );
}
```

---

## Image-to-Image

### Image Transformation

```typescript
// app/actions/transform-image.ts
'use server';

import * as fal from '@fal-ai/serverless-client';

export async function transformImage(imageUrl: string, prompt: string) {
  const result = await fal.run('fal-ai/flux/dev', {
    input: {
      prompt,
      image_url: imageUrl,
      strength: 0.75, // How much to transform (0-1)
      num_inference_steps: 28,
    },
  });

  return result.images[0];
}
```

### Background Removal

```typescript
// app/actions/remove-background.ts
'use server';

import * as fal from '@fal-ai/serverless-client';

export async function removeBackground(imageUrl: string) {
  const result = await fal.run('fal-ai/birefnet', {
    input: {
      image_url: imageUrl,
    },
  });

  return result.image;
}
```

### Image Upscaling

```typescript
// app/actions/upscale-image.ts
'use server';

import * as fal from '@fal-ai/serverless-client';

export async function upscaleImage(imageUrl: string, scale: number = 2) {
  const result = await fal.run('fal-ai/clarity-upscaler', {
    input: {
      image_url: imageUrl,
      scale,
    },
  });

  return result.image;
}
```

---

## Video Generation

### Text-to-Video

```typescript
// app/actions/generate-video.ts
'use server';

import * as fal from '@fal-ai/serverless-client';

export async function generateVideo(prompt: string) {
  const result = await fal.run('fal-ai/stable-video', {
    input: {
      prompt,
      num_inference_steps: 25,
      num_frames: 60,
      fps: 6,
    },
  });

  return result.video;
}
```

### Image-to-Video

```typescript
// app/actions/animate-image.ts
'use server';

import * as fal from '@fal-ai/serverless-client';

export async function animateImage(imageUrl: string, motion: string) {
  const result = await fal.run('fal-ai/stable-video', {
    input: {
      image_url: imageUrl,
      motion_bucket_id: 127,
      num_inference_steps: 25,
    },
  });

  return result.video;
}
```

---

## Advanced Features

### Streaming & Real-time

```typescript
// app/actions/stream-generation.ts
'use server';

import * as fal from '@fal-ai/serverless-client';

export async function streamGeneration(prompt: string) {
  const stream = fal.stream('fal-ai/flux/dev', {
    input: {
      prompt,
      enable_safety_checker: true,
    },
  });

  const partialResults: any[] = [];

  for await (const event of stream) {
    if (event.type === 'partial') {
      partialResults.push(event.data);
      console.log('Partial result:', event.data);
    }
  }

  const result = await stream.done();
  return result.images[0];
}
```

### Queue with Webhooks

```typescript
// app/api/ai/generate/route.ts
import * as fal from '@fal-ai/serverless-client';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  const { prompt } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Queue the generation
    const { request_id } = await fal.queue.submit('fal-ai/flux/dev', {
      input: { prompt },
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/fal`,
    });

    // Store request_id in database
    await db.aiGeneration.create({
      data: {
        requestId: request_id,
        userId,
        prompt,
        status: 'queued',
      },
    });

    return NextResponse.json({ requestId: request_id });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Generation failed' },
      { status: 500 }
    );
  }
}
```

### Webhook Handler

```typescript
// app/api/webhooks/fal/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  const { request_id, status } = body;

  if (status === 'COMPLETED') {
    // Update database
    await db.aiGeneration.update({
      where: { requestId: request_id },
      data: {
        status: 'completed',
        result: body.result,
        completedAt: new Date(),
      },
    });

    // Notify user
    await notifyUser(request_id);
  } else if (status === 'FAILED') {
    await db.aiGeneration.update({
      where: { requestId: request_id },
      data: {
        status: 'failed',
        error: body.error,
      },
    });
  }

  return NextResponse.json({ received: true });
}
```

### Check Queue Status

```typescript
// app/actions/check-status.ts
'use server';

import * as fal from '@fal-ai/serverless-client';

export async function checkGenerationStatus(requestId: string) {
  const status = await fal.queue.status('fal-ai/flux/dev', {
    requestId,
  });

  return status;
}
```

---

## Integration with AI Coder Services

### With Clerk (User Management)

```typescript
// app/api/ai/generate/route.ts
import { createClient } from '@/lib/supabase/server';
import * as fal from '@fal-ai/serverless-client';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Track generations per user
  const count = await db.aiGeneration.count({
    where: {
      userId,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
  });

  // Check limits
  if (count >= 10) {
    return NextResponse.json(
      { error: 'Daily limit reached' },
      { status: 429 }
    );
  }

  // Generate image
  const { prompt } = await request.json();
  const result = await fal.run('fal-ai/flux/dev', {
    input: { prompt },
  });

  return NextResponse.json({ image: result.images[0] });
}
```

### With Arcjet (Rate Limiting)

```typescript
// app/api/ai/generate/route.ts
import arcjet, { tokenBucket } from '@arcjet/next';
import * as fal from '@fal-ai/serverless-client';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    tokenBucket({
      mode: 'LIVE',
      refillRate: 10, // 10 generations
      interval: 3600, // per hour
      capacity: 20,
    }),
  ],
});

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  // Rate limit by user
  const decision = await aj.protect(request, { userId });

  if (decision.isDenied()) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  // Generate image
  const { prompt } = await request.json();
  const result = await fal.run('fal-ai/flux/dev', {
    input: { prompt },
  });

  return NextResponse.json({ image: result.images[0] });
}
```

### With Supabase (Storage)

```typescript
// app/actions/generate-and-store.ts
'use server';

import * as fal from '@fal-ai/serverless-client';
import { createServerClient } from '@/lib/supabase/server';

export async function generateAndStore(prompt: string, userId: string) {
  // Generate image
  const result = await fal.run('fal-ai/flux/dev', {
    input: { prompt },
  });

  // Download image
  const response = await fetch(result.images[0].url);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();

  // Upload to Supabase Storage
  const supabase = createServerClient();
  const fileName = `${userId}/${Date.now()}.png`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('ai-images')
    .upload(fileName, arrayBuffer, {
      contentType: 'image/png',
    });

  if (uploadError) {
    throw uploadError;
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('ai-images').getPublicUrl(fileName);

  // Store metadata in database
  const { data, error } = await supabase.from('ai_generations').insert({
    user_id: userId,
    prompt,
    image_url: publicUrl,
    model: 'flux/dev',
    created_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }

  return publicUrl;
}
```

### With Inngest (Background Processing)

```typescript
// inngest/functions/generate-images.ts
import { inngest } from '@/lib/inngest';
import * as fal from '@fal-ai/serverless-client';

export const generateBatchImages = inngest.createFunction(
  {
    id: 'generate-batch-images',
    concurrency: { limit: 5 }, // Limit concurrent generations
  },
  { event: 'ai.generate.batch' },
  async ({ event, step }) => {
    const { prompts, userId } = event.data;

    for (let i = 0; i < prompts.length; i++) {
      await step.run(`generate-${i}`, async () => {
        const result = await fal.run('fal-ai/flux/dev', {
          input: { prompt: prompts[i] },
        });

        // Store result
        await db.aiGeneration.create({
          data: {
            userId,
            prompt: prompts[i],
            imageUrl: result.images[0].url,
          },
        });

        return result;
      });
    }
  }
);
```

### With Stripe (Usage-based Billing)

```typescript
// app/api/ai/generate/route.ts
import * as fal from '@fal-ai/serverless-client';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  const { prompt } = await request.json();

  // Generate image
  const result = await fal.run('fal-ai/flux/dev', {
    input: { prompt },
  });

  // Track usage for billing
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { subscription: true },
  });

  if (user?.subscription?.stripeSubscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(
      user.subscription.stripeSubscriptionId
    );

    // Find metered item
    const meteredItem = subscription.items.data.find(
      (item) => item.price.recurring?.usage_type === 'metered'
    );

    if (meteredItem) {
      // Report 1 image generated
      await stripe.subscriptionItems.createUsageRecord(meteredItem.id, {
        quantity: 1,
        timestamp: Math.floor(Date.now() / 1000),
        action: 'increment',
      });
    }
  }

  return NextResponse.json({ image: result.images[0] });
}
```

---

## Available Models

### Image Generation

```typescript
// FLUX (fastest, high quality)
'fal-ai/flux/dev'
'fal-ai/flux/schnell' // Even faster

// Stable Diffusion XL
'fal-ai/stable-diffusion-xl'
'fal-ai/fast-sdxl'

// Specialized
'fal-ai/face-swap'
'fal-ai/photorealistic'
```

### Image Editing

```typescript
// Background removal
'fal-ai/birefnet'

// Upscaling
'fal-ai/clarity-upscaler'
'fal-ai/ccsr' // Creative upscaler

// Inpainting
'fal-ai/flux-pro/inpainting'
```

### Video Generation

```typescript
// Text/Image to video
'fal-ai/stable-video'
'fal-ai/animatediff'
```

---

## Best Practices

### 1. Environment Variables

```bash
# Required
FAL_KEY=xxx

# Optional
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. Error Handling

```typescript
try {
  const result = await fal.run('fal-ai/flux/dev', {
    input: { prompt },
  });
  return result.images[0];
} catch (error) {
  if (error.status === 429) {
    // Rate limited
    console.error('Rate limit exceeded');
  } else if (error.status === 402) {
    // Payment required
    console.error('Insufficient credits');
  } else {
    console.error('Generation failed:', error);
  }
  throw error;
}
```

### 3. Cost Optimization

```typescript
// Use faster models for preview
const preview = await fal.run('fal-ai/flux/schnell', {
  input: {
    prompt,
    num_inference_steps: 4, // Fewer steps = faster + cheaper
  },
});

// Use high-quality for final
const final = await fal.run('fal-ai/flux/dev', {
  input: {
    prompt,
    num_inference_steps: 28,
  },
});
```

### 4. Content Moderation

```typescript
// Enable safety checker
const result = await fal.run('fal-ai/flux/dev', {
  input: {
    prompt,
    enable_safety_checker: true,
  },
});

if (result.has_nsfw_concepts?.[0]) {
  throw new Error('Generated content flagged by safety checker');
}
```

### 5. Prompt Engineering

```typescript
// Good prompts are specific and detailed
const goodPrompt = 'A serene mountain landscape at sunset, with snow-capped peaks, pine trees, and a crystal-clear lake reflecting the orange and pink sky, photorealistic, 4k quality';

// Add negative prompts to avoid unwanted elements
const result = await fal.run('fal-ai/stable-diffusion-xl', {
  input: {
    prompt: goodPrompt,
    negative_prompt: 'blurry, low quality, distorted, artifacts, watermark',
  },
});
```

---

## Pricing

**Image Generation:**
- FLUX Schnell: $0.025/image
- FLUX Dev: $0.05/image
- SDXL: $0.03/image

**Video Generation:**
- Stable Video: $0.10/generation

**Other:**
- Background Removal: $0.01/image
- Upscaling: $0.02/image

**Credits:**
- Pay-as-you-go
- Volume discounts available

---

## Resources

- **Documentation:** https://fal.ai/docs
- **Dashboard:** https://fal.ai/dashboard
- **Models:** https://fal.ai/models
- **Discord:** https://discord.gg/fal-ai
- **Examples:** https://github.com/fal-ai/examples

---

## Next Steps

1. Sign up for fal.ai account
2. Get API key
3. Install SDK
4. Choose appropriate model
5. Implement generation logic
6. Add error handling
7. Set up rate limiting
8. Track usage and costs

For more examples, see the template repositories in `/home/mibady/ai-coder-workspace/templates/`.
