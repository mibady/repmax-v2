# Mux - Video Hosting & Streaming

**Official Website:** https://www.mux.com
**Documentation:** https://docs.mux.com
**Pricing:** Pay-as-you-go: $0.005/min encoding, $0.01/GB delivery

---

## Overview

Mux is a video infrastructure platform that provides video hosting, streaming, and analytics. It handles video encoding, adaptive bitrate streaming, thumbnails, GIFs, and provides detailed video analytics. Perfect for applications that need reliable video delivery at scale.

### Key Features

- ✅ Video encoding & transcoding
- ✅ Adaptive bitrate streaming (HLS)
- ✅ Video player SDK
- ✅ Thumbnail & GIF generation
- ✅ Live streaming
- ✅ Video analytics
- ✅ DRM & security
- ✅ Global CDN delivery
- ✅ Webhooks
- ✅ TypeScript SDK
- ✅ Next.js optimized

---

## Use Cases for AI Coder

1. **Video Content**
   - Course platforms
   - Video tutorials
   - Product demos
   - Marketing videos

2. **Live Streaming**
   - Webinars
   - Live events
   - Gaming streams
   - Virtual conferences

3. **User-Generated Content**
   - Video uploads
   - Social features
   - Community content
   - Video messaging

4. **AI-Generated Videos**
   - AI video creation
   - Automated content
   - Video processing
   - Content moderation

---

## Quick Start

### 1. Installation

```bash
npm install @mux/mux-node @mux/mux-player-react
# or
pnpm add @mux/mux-node @mux/mux-player-react
```

### 2. Get API Keys

1. Sign up at https://mux.com
2. Navigate to Settings → Access Tokens
3. Create new token
4. Add to `.env.local`:

```bash
MUX_TOKEN_ID=xxx
MUX_TOKEN_SECRET=xxx
NEXT_PUBLIC_MUX_ENV_KEY=xxx # For Mux Player
```

### 3. Initialize Mux Client

```typescript
// lib/mux.ts
import Mux from '@mux/mux-node';

export const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});
```

---

## Video Upload

### Direct Upload

```typescript
// app/api/mux/upload-url/route.ts
import { mux } from '@/lib/mux';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Create direct upload URL
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ['public'],
        passthrough: userId, // Store user ID
      },
      cors_origin: process.env.NEXT_PUBLIC_APP_URL!,
    });

    return NextResponse.json({
      uploadUrl: upload.url,
      uploadId: upload.id,
    });
  } catch (error) {
    console.error('Mux upload error:', error);
    return NextResponse.json(
      { error: 'Failed to create upload URL' },
      { status: 500 }
    );
  }
}
```

### Upload Component

```typescript
// components/video-uploader.tsx
'use client';

import { useState } from 'react';
import * as UpChunk from '@mux/upchunk';

export function VideoUploader() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (file: File) => {
    setUploading(true);

    // Get upload URL from your API
    const response = await fetch('/api/mux/upload-url', {
      method: 'POST',
    });

    const { uploadUrl } = await response.json();

    // Upload with progress tracking
    const upload = UpChunk.createUpload({
      endpoint: uploadUrl,
      file,
    });

    upload.on('progress', (detail) => {
      setProgress(detail.detail);
    });

    upload.on('success', () => {
      setUploading(false);
      console.log('Upload complete!');
    });

    upload.on('error', (error) => {
      setUploading(false);
      console.error('Upload error:', error.detail);
    });
  };

  return (
    <div>
      <input
        type="file"
        accept="video/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
        disabled={uploading}
      />
      {uploading && (
        <div>
          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
}
```

### URL-based Upload

```typescript
// app/api/mux/upload-from-url/route.ts
import { mux } from '@/lib/mux';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { videoUrl } = await request.json();

  try {
    const asset = await mux.video.assets.create({
      input: [{ url: videoUrl }],
      playback_policy: ['public'],
      mp4_support: 'standard', // Enable MP4 downloads
    });

    return NextResponse.json({ assetId: asset.id });
  } catch (error) {
    console.error('Mux asset creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    );
  }
}
```

---

## Video Playback

### Mux Player

```typescript
// components/video-player.tsx
'use client';

import MuxPlayer from '@mux/mux-player-react';

export function VideoPlayer({ playbackId }: { playbackId: string }) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      metadata={{
        video_title: 'My Video',
        viewer_user_id: 'user-123',
      }}
      streamType="on-demand"
      accentColor="#0066FF"
    />
  );
}
```

### Custom Player Controls

```typescript
// components/custom-video-player.tsx
'use client';

import MuxPlayer from '@mux/mux-player-react';
import { useState } from 'react';

export function CustomVideoPlayer({ playbackId }: { playbackId: string }) {
  const [playerRef, setPlayerRef] = useState<HTMLVideoElement | null>(null);

  const handleTimeUpdate = () => {
    if (playerRef) {
      const progress = (playerRef.currentTime / playerRef.duration) * 100;
      console.log('Progress:', progress);
    }
  };

  return (
    <div>
      <MuxPlayer
        playbackId={playbackId}
        onLoadedMetadata={(e) => setPlayerRef(e.target as HTMLVideoElement)}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => console.log('Playing')}
        onPause={() => console.log('Paused')}
        onEnded={() => console.log('Ended')}
      />
    </div>
  );
}
```

---

## Thumbnails & GIFs

### Generate Thumbnail

```typescript
// lib/mux-helpers.ts
export function getThumbnailUrl(
  playbackId: string,
  options?: {
    time?: number; // Seconds
    width?: number;
    height?: number;
    fitMode?: 'smartcrop' | 'crop' | 'pad' | 'preserve';
  }
) {
  const params = new URLSearchParams();

  if (options?.time) params.set('time', options.time.toString());
  if (options?.width) params.set('width', options.width.toString());
  if (options?.height) params.set('height', options.height.toString());
  if (options?.fitMode) params.set('fit_mode', options.fitMode);

  return `https://image.mux.com/${playbackId}/thumbnail.jpg?${params}`;
}

// Usage
const thumbnailUrl = getThumbnailUrl('playback-id', {
  time: 5.5,
  width: 640,
  height: 360,
});
```

### Generate Animated GIF

```typescript
export function getAnimatedGifUrl(
  playbackId: string,
  options?: {
    start?: number;
    end?: number;
    width?: number;
    fps?: number;
  }
) {
  const params = new URLSearchParams();

  if (options?.start) params.set('start', options.start.toString());
  if (options?.end) params.set('end', options.end.toString());
  if (options?.width) params.set('width', options.width.toString());
  if (options?.fps) params.set('fps', options.fps.toString());

  return `https://image.mux.com/${playbackId}/animated.gif?${params}`;
}

// Usage
const gifUrl = getAnimatedGifUrl('playback-id', {
  start: 10,
  end: 15,
  width: 480,
  fps: 15,
});
```

---

## Live Streaming

### Create Live Stream

```typescript
// app/api/mux/live/create/route.ts
import { mux } from '@/lib/mux';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { title } = await request.json();

  try {
    const liveStream = await mux.video.liveStreams.create({
      playback_policy: ['public'],
      new_asset_settings: {
        playback_policy: ['public'],
      },
      passthrough: title,
    });

    return NextResponse.json({
      liveStreamId: liveStream.id,
      streamKey: liveStream.stream_key,
      playbackId: liveStream.playback_ids?.[0]?.id,
    });
  } catch (error) {
    console.error('Live stream creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create live stream' },
      { status: 500 }
    );
  }
}
```

### Live Stream Player

```typescript
// components/live-player.tsx
'use client';

import MuxPlayer from '@mux/mux-player-react';

export function LivePlayer({ playbackId }: { playbackId: string }) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      streamType="live"
      metadata={{
        video_title: 'Live Stream',
      }}
      autoPlay
    />
  );
}
```

---

## Webhooks

### Setup Webhook Handler

```typescript
// app/api/webhooks/mux/route.ts
import { mux } from '@/lib/mux';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('mux-signature');

  try {
    // Verify webhook signature
    const event = mux.webhooks.verify(
      body,
      signature!,
      process.env.MUX_WEBHOOK_SECRET!
    );

    // Handle different event types
    switch (event.type) {
      case 'video.asset.ready':
        await handleAssetReady(event.data);
        break;

      case 'video.asset.created':
        await handleAssetCreated(event.data);
        break;

      case 'video.asset.errored':
        await handleAssetError(event.data);
        break;

      case 'video.upload.asset_created':
        await handleUploadComplete(event.data);
        break;

      case 'video.live_stream.active':
        await handleLiveStreamActive(event.data);
        break;

      case 'video.live_stream.idle':
        await handleLiveStreamIdle(event.data);
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}

async function handleAssetReady(asset: any) {
  console.log('Asset ready:', asset.id);

  // Update database
  await db.video.update({
    where: { muxAssetId: asset.id },
    data: {
      status: 'ready',
      playbackId: asset.playback_ids[0].id,
      duration: asset.duration,
    },
  });

  // Send notification to user
  await sendNotification(asset.passthrough, 'Video processing complete!');
}

async function handleAssetError(asset: any) {
  console.error('Asset error:', asset.id, asset.errors);

  await db.video.update({
    where: { muxAssetId: asset.id },
    data: {
      status: 'error',
      error: JSON.stringify(asset.errors),
    },
  });
}
```

---

## Integration with AI Coder Services

### With Supabase (Video Metadata)

```typescript
// Store video metadata in Supabase
import { createServerClient } from '@/lib/supabase/server';

async function handleAssetReady(asset: any) {
  const supabase = createServerClient();

  await supabase.from('videos').insert({
    mux_asset_id: asset.id,
    mux_playback_id: asset.playback_ids[0].id,
    user_id: asset.passthrough,
    duration: asset.duration,
    status: 'ready',
    created_at: new Date().toISOString(),
  });
}
```

### With Inngest (Processing Pipeline)

```typescript
// inngest/functions/process-video.ts
import { inngest } from '@/lib/inngest';
import { mux } from '@/lib/mux';

export const processVideo = inngest.createFunction(
  { id: 'process-video' },
  { event: 'video.uploaded' },
  async ({ event, step }) => {
    // Create Mux asset
    const asset = await step.run('create-mux-asset', async () => {
      return await mux.video.assets.create({
        input: [{ url: event.data.videoUrl }],
        playback_policy: ['public'],
        mp4_support: 'standard',
      });
    });

    // Wait for processing
    await step.sleep('wait-for-processing', '30s');

    // Get asset details
    const processedAsset = await step.run('get-asset', async () => {
      return await mux.video.assets.retrieve(asset.id);
    });

    // Generate thumbnail
    const thumbnail = await step.run('generate-thumbnail', async () => {
      const playbackId = processedAsset.playback_ids?.[0]?.id;
      return getThumbnailUrl(playbackId!, { time: 1, width: 640 });
    });

    // Update database
    await step.run('save-to-db', async () => {
      return await db.video.create({
        data: {
          muxAssetId: asset.id,
          playbackId: processedAsset.playback_ids?.[0]?.id,
          thumbnailUrl: thumbnail,
          userId: event.data.userId,
        },
      });
    });
  }
);
```

### With Resend (Notifications)

```typescript
// Send email when video is ready
async function handleAssetReady(asset: any) {
  const user = await getUserById(asset.passthrough);

  await resend.emails.send({
    from: 'videos@yourdomain.com',
    to: user.email,
    subject: 'Your video is ready!',
    html: `
      <p>Your video has been processed and is ready to view.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/videos/${asset.id}">
        Watch now
      </a>
    `,
  });
}
```

### With Clerk (User Context)

```typescript
// Track video ownership
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  const upload = await mux.video.uploads.create({
    new_asset_settings: {
      playback_policy: ['public'],
      passthrough: userId, // Store Clerk user ID
    },
  });

  return NextResponse.json({ uploadUrl: upload.url });
}
```

---

## Video Analytics

### Track Video Views

```typescript
// Mux automatically tracks analytics
// Access via Mux Dashboard or API

// Get video views
const views = await mux.data.metrics.breakdown('video_views', {
  filters: ['asset_id:ASSET_ID'],
  timeframe: ['7:days'],
});

console.log('Video views:', views.data);
```

### Custom Analytics

```typescript
// components/video-player-with-analytics.tsx
'use client';

import MuxPlayer from '@mux/mux-player-react';

export function VideoPlayerWithAnalytics({
  playbackId,
  userId,
  videoId,
}: {
  playbackId: string;
  userId: string;
  videoId: string;
}) {
  const handlePlay = async () => {
    await fetch('/api/analytics/video-play', {
      method: 'POST',
      body: JSON.stringify({ videoId, userId }),
    });
  };

  const handleComplete = async () => {
    await fetch('/api/analytics/video-complete', {
      method: 'POST',
      body: JSON.stringify({ videoId, userId }),
    });
  };

  return (
    <MuxPlayer
      playbackId={playbackId}
      metadata={{
        video_id: videoId,
        viewer_user_id: userId,
      }}
      onPlay={handlePlay}
      onEnded={handleComplete}
    />
  );
}
```

---

## Best Practices

### 1. Environment Variables

```bash
# Required
MUX_TOKEN_ID=xxx
MUX_TOKEN_SECRET=xxx
NEXT_PUBLIC_MUX_ENV_KEY=xxx

# Optional
MUX_WEBHOOK_SECRET=xxx
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. Playback Policies

```typescript
// Public videos (anyone can watch)
playback_policy: ['public']

// Signed URLs (time-limited access)
playback_policy: ['signed']

// Generate signed URL
import { sign } from '@mux/mux-node/util/jwt';

const signedUrl = sign(playbackId, {
  keyId: 'SIGNING_KEY_ID',
  keySecret: 'SIGNING_KEY_SECRET',
  expiration: '1h',
});
```

### 3. Error Handling

```typescript
try {
  const asset = await mux.video.assets.create({
    input: [{ url: videoUrl }],
  });
} catch (error) {
  if (error.status === 422) {
    // Invalid input
    console.error('Invalid video URL');
  } else if (error.status === 429) {
    // Rate limited
    console.error('Rate limit exceeded');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### 4. Asset Cleanup

```typescript
// Delete old assets to save costs
async function cleanupOldAssets() {
  const assets = await mux.video.assets.list({
    limit: 100,
  });

  for (const asset of assets.data) {
    const createdAt = new Date(asset.created_at);
    const daysOld = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysOld > 90 && !asset.is_live) {
      await mux.video.assets.delete(asset.id);
      console.log('Deleted old asset:', asset.id);
    }
  }
}
```

### 5. Optimize Delivery

```typescript
// Enable MP4 support for downloads
new_asset_settings: {
  playback_policy: ['public'],
  mp4_support: 'standard', // or 'audio-only'
}

// Enable test mode for development
new_asset_settings: {
  playback_policy: ['public'],
  test: true, // Free processing in test mode
}
```

---

## Pricing

**Video:**
- Encoding: $0.005/minute
- Storage: $0.05/GB/month
- Delivery: $0.01/GB

**Live Streaming:**
- Encoding: $0.015/minute
- Storage: $0.05/GB/month
- Delivery: $0.01/GB

**Features:**
- Thumbnails: Free
- Analytics: Free
- MP4 downloads: Free

---

## Resources

- **Documentation:** https://docs.mux.com
- **Dashboard:** https://dashboard.mux.com
- **API Reference:** https://docs.mux.com/api-reference
- **Support:** https://mux.com/support
- **Status:** https://status.mux.com

---

## Next Steps

1. Sign up for Mux account
2. Create API access token
3. Install Mux SDK
4. Implement video upload
5. Add video player
6. Set up webhooks
7. Configure analytics
8. Test video processing

For more examples, see the template repositories in `/home/mibady/ai-coder-workspace/templates/`.
