# Liveblocks - Real-time Collaboration Platform

**Official Website:** https://liveblocks.io
**Documentation:** https://liveblocks.io/docs
**Pricing:** Free tier: 100 MAUs (Monthly Active Users)

---

## Overview

Liveblocks is a real-time collaboration infrastructure for building collaborative experiences like Google Docs, Figma, or Notion. It provides presence, document synchronization, comments, notifications, and text editing features out of the box with a developer-friendly API.

### Key Features

- ✅ Real-time presence
- ✅ Collaborative document sync
- ✅ Comments & threads
- ✅ Notifications
- ✅ Text editor integration (Lexical, Tiptap, Slate, etc.)
- ✅ Conflict-free data structures (CRDTs)
- ✅ Authentication integration
- ✅ React hooks
- ✅ TypeScript support
- ✅ Next.js optimized

---

## Use Cases for AI Coder

1. **Collaborative Editing**
   - Document collaboration
   - Code editors
   - Design tools
   - Spreadsheets

2. **Real-time Features**
   - Live cursors
   - User presence
   - Typing indicators
   - Activity feeds

3. **Communication**
   - Comments system
   - Discussions
   - Notifications
   - Mentions

4. **Shared State**
   - Collaborative forms
   - Shared canvases
   - Multiplayer games
   - Live dashboards

---

## Quick Start

### 1. Installation

```bash
npm install @liveblocks/client @liveblocks/react
# or
pnpm add @liveblocks/client @liveblocks/react
```

### 2. Get API Keys

1. Sign up at https://liveblocks.io
2. Create a new project
3. Copy your public and secret keys
4. Add to `.env.local`:

```bash
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_xxx
LIVEBLOCKS_SECRET_KEY=sk_xxx
```

### 3. Setup Liveblocks Provider

```typescript
// app/providers.tsx
'use client';

import { LiveblocksProvider } from '@liveblocks/react/suspense';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LiveblocksProvider
      authEndpoint="/api/liveblocks-auth"
      throttle={16}
    >
      {children}
    </LiveblocksProvider>
  );
}
```

```typescript
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 4. Create Auth Endpoint

```typescript
// app/api/liveblocks-auth/route.ts
import { Liveblocks } from '@liveblocks/node';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get room ID from request
  const { room } = await request.json();

  // Create Liveblocks session
  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name: `${user.firstName} ${user.lastName}`,
      email: user.emailAddresses[0].emailAddress,
      avatar: user.imageUrl,
    },
  });

  // Give user access to room
  session.allow(room, session.FULL_ACCESS);

  const { body, status } = await session.authorize();

  return new Response(body, { status });
}
```

---

## Presence

### Use Presence

```typescript
// components/live-cursors.tsx
'use client';

import { useOthers, useSelf } from '@liveblocks/react/suspense';

export function LiveCursors() {
  const others = useOthers();
  const self = useSelf();

  return (
    <div>
      {/* Show other users */}
      <div>
        {others.map(({ connectionId, info }) => (
          <div key={connectionId}>
            <img src={info.avatar} alt={info.name} />
            <span>{info.name}</span>
          </div>
        ))}
      </div>

      {/* Current user */}
      {self && (
        <div>
          <span>You: {self.info.name}</span>
        </div>
      )}
    </div>
  );
}
```

### Update Presence

```typescript
// components/cursor-tracker.tsx
'use client';

import { useMyPresence } from '@liveblocks/react/suspense';
import { PointerEvent } from 'react';

type Presence = {
  cursor: { x: number; y: number } | null;
};

export function CursorTracker() {
  const [myPresence, updateMyPresence] = useMyPresence<Presence>();

  const handlePointerMove = (e: PointerEvent) => {
    updateMyPresence({
      cursor: {
        x: e.clientX,
        y: e.clientY,
      },
    });
  };

  const handlePointerLeave = () => {
    updateMyPresence({ cursor: null });
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="h-screen w-screen"
    >
      {/* Your content */}
    </div>
  );
}
```

### Render Other Cursors

```typescript
// components/cursors.tsx
'use client';

import { useOthers } from '@liveblocks/react/suspense';

type Presence = {
  cursor: { x: number; y: number } | null;
};

export function Cursors() {
  const others = useOthers<Presence>();

  return (
    <>
      {others.map(({ connectionId, presence, info }) => {
        if (!presence.cursor) return null;

        return (
          <div
            key={connectionId}
            style={{
              position: 'absolute',
              left: presence.cursor.x,
              top: presence.cursor.y,
              pointerEvents: 'none',
            }}
          >
            <svg width="24" height="24">
              <path d="M0 0L24 8L8 12L0 24Z" fill={info.color} />
            </svg>
            <span className="ml-2">{info.name}</span>
          </div>
        );
      })}
    </>
  );
}
```

---

## Storage (Collaborative Data)

### Setup Room

```typescript
// app/room.tsx
'use client';

import { RoomProvider } from '@liveblocks/react/suspense';
import { ReactNode } from 'react';

export function Room({
  roomId,
  children,
}: {
  roomId: string;
  children: ReactNode;
}) {
  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        cursor: null,
      }}
    >
      {children}
    </RoomProvider>
  );
}
```

### Use Storage

```typescript
// components/collaborative-form.tsx
'use client';

import { useStorage, useMutation } from '@liveblocks/react/suspense';

export function CollaborativeForm() {
  const formData = useStorage((root) => root.formData);

  const updateField = useMutation(({ storage }, field: string, value: string) => {
    storage.get('formData').set(field, value);
  }, []);

  return (
    <form>
      <input
        value={formData.get('name') || ''}
        onChange={(e) => updateField('name', e.target.value)}
      />
      <input
        value={formData.get('email') || ''}
        onChange={(e) => updateField('email', e.target.value)}
      />
    </form>
  );
}
```

### Initialize Storage

```typescript
// app/room.tsx
import { RoomProvider } from '@liveblocks/react/suspense';
import { LiveMap } from '@liveblocks/client';

export function Room({ roomId, children }) {
  return (
    <RoomProvider
      id={roomId}
      initialPresence={{ cursor: null }}
      initialStorage={{
        formData: new LiveMap([
          ['name', ''],
          ['email', ''],
        ]),
      }}
    >
      {children}
    </RoomProvider>
  );
}
```

---

## Text Editor Collaboration

### With Lexical

```bash
npm install @liveblocks/react-lexical lexical @lexical/react
```

```typescript
// components/collaborative-editor.tsx
'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LiveblocksPlugin } from '@liveblocks/react-lexical';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';

const initialConfig = {
  namespace: 'CollaborativeEditor',
  onError: (error: Error) => console.error(error),
};

export function CollaborativeEditor() {
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable className="editor" />}
        placeholder={<div>Start typing...</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <LiveblocksPlugin />
    </LexicalComposer>
  );
}
```

### With Tiptap

```bash
npm install @liveblocks/react-tiptap @tiptap/react @tiptap/starter-kit
```

```typescript
// components/tiptap-editor.tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useLiveblocksExtension } from '@liveblocks/react-tiptap';

export function TiptapEditor() {
  const liveblocks = useLiveblocksExtension();

  const editor = useEditor({
    extensions: [StarterKit, liveblocks],
    content: '<p>Start collaborating...</p>',
  });

  return <EditorContent editor={editor} />;
}
```

---

## Comments

### Enable Comments

```bash
npm install @liveblocks/react-comments
```

```typescript
// components/comments-thread.tsx
'use client';

import { useThreads } from '@liveblocks/react/suspense';
import { Composer, Thread } from '@liveblocks/react-comments';

export function CommentsThread() {
  const { threads } = useThreads();

  return (
    <div>
      {threads.map((thread) => (
        <Thread key={thread.id} thread={thread} />
      ))}
      <Composer />
    </div>
  );
}
```

### Add Comment

```typescript
// components/add-comment.tsx
'use client';

import { useCreateThread } from '@liveblocks/react/suspense';
import { ComposerSubmitComment } from '@liveblocks/react-comments';

export function AddComment() {
  const createThread = useCreateThread();

  const handleSubmit = ({ body }: ComposerSubmitComment) => {
    createThread({
      body,
      metadata: {
        resolved: false,
      },
    });
  };

  return (
    <Composer onComposerSubmit={handleSubmit} />
  );
}
```

### Resolve Comments

```typescript
// components/thread-actions.tsx
'use client';

import { useUpdateThread } from '@liveblocks/react/suspense';

export function ThreadActions({ threadId }: { threadId: string }) {
  const updateThread = useUpdateThread();

  const handleResolve = () => {
    updateThread({
      threadId,
      metadata: {
        resolved: true,
      },
    });
  };

  return (
    <button onClick={handleResolve}>
      Resolve
    </button>
  );
}
```

---

## Notifications

### Enable Notifications

```typescript
// components/notifications.tsx
'use client';

import {
  useInboxNotifications,
  useMarkAllInboxNotificationsAsRead,
} from '@liveblocks/react/suspense';
import { InboxNotification, InboxNotificationList } from '@liveblocks/react-comments';

export function Notifications() {
  const { inboxNotifications } = useInboxNotifications();
  const markAllAsRead = useMarkAllInboxNotificationsAsRead();

  return (
    <div>
      <div>
        <h2>Notifications ({inboxNotifications.length})</h2>
        <button onClick={markAllAsRead}>Mark all as read</button>
      </div>
      <InboxNotificationList>
        {inboxNotifications.map((notification) => (
          <InboxNotification
            key={notification.id}
            inboxNotification={notification}
          />
        ))}
      </InboxNotificationList>
    </div>
  );
}
```

---

## Integration with AI Coder Services

### With Clerk (Authentication)

```typescript
// app/api/liveblocks-auth/route.ts (already shown above)
import { Liveblocks } from '@liveblocks/node';
import { createClient } from '@/lib/supabase/server';

// Integrate Clerk user data with Liveblocks
```

### With Supabase (Persistence)

```typescript
// Save room data to Supabase when changed
import { useStorage } from '@liveblocks/react/suspense';
import { createServerClient } from '@/lib/supabase/server';
import { useEffect } from 'react';

export function SyncToSupabase({ roomId }: { roomId: string }) {
  const data = useStorage((root) => root.data);

  useEffect(() => {
    // Debounce saves
    const timer = setTimeout(async () => {
      const supabase = createServerClient();
      await supabase
        .from('rooms')
        .upsert({ id: roomId, data })
        .eq('id', roomId);
    }, 1000);

    return () => clearTimeout(timer);
  }, [data, roomId]);

  return null;
}
```

### With Resend (Email Notifications)

```typescript
// Send email when mentioned in comment
import { WebhookHandler } from '@liveblocks/node';
import { resend } from '@/lib/resend';

const webhookHandler = new WebhookHandler(
  process.env.LIVEBLOCKS_WEBHOOK_SECRET!
);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('liveblocks-signature')!;

  const event = webhookHandler.verifyRequest({
    body,
    signature,
  });

  if (event.type === 'threadCreated') {
    const { thread } = event.data;

    // Extract mentions
    const mentions = extractMentions(thread.body);

    // Send email notifications
    for (const userId of mentions) {
      const user = await getUserById(userId);

      await resend.emails.send({
        from: 'notifications@yourdomain.com',
        to: user.email,
        subject: 'You were mentioned in a comment',
        html: `<p>You were mentioned in a comment by ${thread.createdBy}</p>`,
      });
    }
  }

  return new Response(null, { status: 200 });
}
```

---

## Advanced Patterns

### Room Permissions

```typescript
// app/api/liveblocks-auth/route.ts
import { Liveblocks } from '@liveblocks/node';
import { createClient } from '@/lib/supabase/server';

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: Request) {
  const { userId } = auth();
  const { room } = await request.json();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Check if user has access to room
  const hasAccess = await checkRoomAccess(userId, room);

  if (!hasAccess) {
    return new Response('Forbidden', { status: 403 });
  }

  const session = liveblocks.prepareSession(userId, {
    userInfo: await getUserInfo(userId),
  });

  // Grant appropriate permissions
  const userRole = await getUserRoleInRoom(userId, room);

  if (userRole === 'viewer') {
    session.allow(room, session.READ_ACCESS);
  } else if (userRole === 'editor') {
    session.allow(room, session.WRITE_ACCESS);
  } else {
    session.allow(room, session.FULL_ACCESS);
  }

  const { body, status } = await session.authorize();
  return new Response(body, { status });
}
```

### Undo/Redo

```typescript
// components/editor-with-history.tsx
'use client';

import { useUndo, useRedo, useCanUndo, useCanRedo } from '@liveblocks/react/suspense';

export function EditorHistory() {
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  return (
    <div>
      <button onClick={undo} disabled={!canUndo}>
        Undo
      </button>
      <button onClick={redo} disabled={!canRedo}>
        Redo
      </button>
    </div>
  );
}
```

### Activity Summary

```typescript
// components/activity-summary.tsx
'use client';

import { useSelf, useOthers } from '@liveblocks/react/suspense';

export function ActivitySummary() {
  const self = useSelf();
  const others = useOthers();

  const activeUsers = others.filter((user) => user.presence.isActive);

  return (
    <div>
      <span>{activeUsers.length + 1} users active</span>
      <div>
        {activeUsers.map(({ connectionId, info }) => (
          <img key={connectionId} src={info.avatar} alt={info.name} />
        ))}
        {self && <img src={self.info.avatar} alt={self.info.name} />}
      </div>
    </div>
  );
}
```

---

## Best Practices

### 1. Environment Variables

```bash
# Required
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_xxx
LIVEBLOCKS_SECRET_KEY=sk_xxx

# Optional
LIVEBLOCKS_WEBHOOK_SECRET=whsec_xxx
```

### 2. Room Naming Convention

```typescript
// Use consistent room ID patterns
const roomIds = {
  document: (id: string) => `document:${id}`,
  workspace: (id: string) => `workspace:${id}`,
  canvas: (id: string) => `canvas:${id}`,
};
```

### 3. Optimize Presence Updates

```typescript
// Throttle presence updates
<LiveblocksProvider
  authEndpoint="/api/liveblocks-auth"
  throttle={16} // 60fps
>
```

### 4. Clean Up Subscriptions

```typescript
// Use Suspense components or properly clean up
useEffect(() => {
  const unsubscribe = room.subscribe('my-event', callback);
  return () => unsubscribe();
}, [room]);
```

### 5. Error Handling

```typescript
// Wrap collaborative features in error boundaries
<ErrorBoundary fallback={<div>Collaboration unavailable</div>}>
  <CollaborativeEditor />
</ErrorBoundary>
```

---

## Pricing

**Free Tier:**
- 100 Monthly Active Users (MAUs)
- Unlimited rooms
- All features included

**Starter ($49/month):**
- 1,000 MAUs included
- $0.10 per additional MAU
- Email support

**Pro ($249/month):**
- 5,000 MAUs included
- $0.07 per additional MAU
- Priority support
- Advanced features

---

## Resources

- **Documentation:** https://liveblocks.io/docs
- **Dashboard:** https://liveblocks.io/dashboard
- **Examples:** https://liveblocks.io/examples
- **Discord:** https://liveblocks.io/discord

---

## Next Steps

1. Sign up for Liveblocks account
2. Create a project and get API keys
3. Install Liveblocks packages
4. Set up authentication endpoint
5. Add LiveblocksProvider
6. Implement presence features
7. Add collaborative editing
8. Enable comments and notifications

For more examples, see the template repositories in `/home/mibady/ai-coder-workspace/templates/`.
