---
name: discord-activities
description: Build Discord Activities (embedded apps in voice channels). Use when creating multiplayer games, watch parties, collaborative tools, or any interactive experience for Discord.
version: 1.0.0
---

# Discord Activities Skill

Build embedded applications that run inside Discord voice channels.

## Overview

| Feature | Description |
|---------|-------------|
| **Embedded App SDK** | Discord's official SDK for activities |
| **OAuth Flow** | Automatic user authentication |
| **Voice Integration** | Speaking indicators, mute states |
| **Multiplayer** | Participant tracking, real-time sync |

---

## Quick Setup

### 1. Developer Portal

1. Create app at [discord.com/developers](https://discord.com/developers/applications)
2. Go to **Activities** → Enable
3. Add URL mappings for development
4. Copy Client ID and Client Secret

### 2. Environment

```env
VITE_DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
```

### 3. Initialize SDK

```typescript
import { DiscordSDK } from '@discord/embedded-app-sdk';

const sdk = new DiscordSDK(CLIENT_ID);
await sdk.ready();

// Authorize
const { code } = await sdk.commands.authorize({
  client_id: CLIENT_ID,
  response_type: 'code',
  scope: ['identify', 'guilds'],
});

// Exchange code for token (via your backend)
const { access_token } = await exchangeCode(code);

// Authenticate
const auth = await sdk.commands.authenticate({ access_token });
console.log('User:', auth.user);
```

---

## Provider Pattern

```typescript
// DiscordProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { DiscordSDK } from '@discord/embedded-app-sdk';

const DiscordContext = createContext(null);

export function DiscordProvider({ clientId, children }) {
  const [sdk, setSdk] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const discordSdk = new DiscordSDK(clientId);
      await discordSdk.ready();

      const { code } = await discordSdk.commands.authorize({
        client_id: clientId,
        response_type: 'code',
        scope: ['identify', 'guilds'],
      });

      const { access_token } = await fetch('/api/token', {
        method: 'POST',
        body: JSON.stringify({ code }),
      }).then(r => r.json());

      const auth = await discordSdk.commands.authenticate({ access_token });

      setSdk(discordSdk);
      setUser(auth.user);
      setReady(true);
    };

    init();
  }, [clientId]);

  return (
    <DiscordContext.Provider value={{ sdk, user, ready }}>
      {ready ? children : <Loading />}
    </DiscordContext.Provider>
  );
}

export const useDiscord = () => useContext(DiscordContext);
```

---

## Core SDK Features

### Get Channel/Guild

```typescript
// Get current channel
const { channel } = await sdk.commands.getChannel(sdk.channelId);

// Get current guild
if (sdk.guildId) {
  const { guild } = await sdk.commands.getGuild(sdk.guildId);
}
```

### Participants

```typescript
// Get connected participants
const { participants } = await sdk.commands.getInstanceConnectedParticipants();

// Subscribe to updates
sdk.subscribe('ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE', ({ participants }) => {
  console.log('Participants updated:', participants);
});
```

### Voice States

```typescript
// Voice states are on the channel
const { channel } = await sdk.commands.getChannel(sdk.channelId);
console.log('Voice states:', channel.voice_states);

// Subscribe to voice updates
sdk.subscribe('VOICE_STATE_UPDATE', ({ voice_state }) => {
  console.log('Voice state changed:', voice_state);
});

// Speaking events
sdk.subscribe('SPEAKING_START', ({ user_id }) => {
  console.log('Started speaking:', user_id);
});

sdk.subscribe('SPEAKING_STOP', ({ user_id }) => {
  console.log('Stopped speaking:', user_id);
});
```

### Set Activity (Rich Presence)

```typescript
await sdk.commands.setActivity({
  state: 'In Game',
  details: 'Playing Chess',
  timestamps: { start: Date.now() },
  party: {
    id: 'party_123',
    size: [2, 4], // current, max
  },
});
```

### Open Dialogs

```typescript
// Open invite dialog
await sdk.commands.openInviteDialog();

// Open external link
await sdk.commands.openExternalLink('https://example.com');

// Share moment (screenshot)
await sdk.commands.openShareMomentDialog(mediaUrl);
```

---

## Token Exchange Server

Activities require a backend to exchange OAuth codes:

```typescript
// server.ts
import express from 'express';

const app = express();
app.use(express.json());

app.post('/api/token', async (req, res) => {
  const { code } = req.body;

  const response = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
    }),
  });

  const data = await response.json();
  res.json({ access_token: data.access_token });
});
```

---

## URL Mappings

Configure in Developer Portal → Activities:

| Environment | Prefix | Target |
|-------------|--------|--------|
| Development | `/` | `http://localhost:5173` |
| Development | `/.proxy` | `http://localhost:3001` |
| Production | `/` | `https://your-activity.com` |
| Production | `/.proxy` | `https://api.your-activity.com` |

---

## Event Reference

| Event | Data | Description |
|-------|------|-------------|
| `READY` | - | SDK initialized |
| `VOICE_STATE_UPDATE` | `{ voice_state }` | User voice state changed |
| `SPEAKING_START` | `{ user_id }` | User started speaking |
| `SPEAKING_STOP` | `{ user_id }` | User stopped speaking |
| `ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE` | `{ participants }` | Participants changed |
| `ACTIVITY_LAYOUT_MODE_UPDATE` | `{ layout_mode }` | Layout changed |
| `ORIENTATION_UPDATE` | `{ orientation }` | Device rotated |

---

## Dev Mode Pattern

Test outside Discord with mock data:

```typescript
const isInDiscord = 
  window.location.search.includes('frame_id=') ||
  window.location.search.includes('instance_id=');

if (!isInDiscord) {
  // Use mock data for development
  setUser({
    id: '123',
    username: 'DevUser',
    avatar: null,
  });
  setReady(true);
}
```

---

## Common Patterns

### Speaking Indicator

```typescript
function SpeakingAvatar({ userId }) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const onStart = sdk.subscribe('SPEAKING_START', ({ user_id }) => {
      if (user_id === userId) setSpeaking(true);
    });
    const onStop = sdk.subscribe('SPEAKING_STOP', ({ user_id }) => {
      if (user_id === userId) setSpeaking(false);
    });
    return () => { onStart(); onStop(); };
  }, [userId]);

  return (
    <Avatar className={speaking ? 'ring-2 ring-green-500' : ''} />
  );
}
```

### Participant Sync

```typescript
function useParticipants() {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    // Initial load
    sdk.commands.getInstanceConnectedParticipants()
      .then(({ participants }) => setParticipants(participants));

    // Subscribe to updates
    return sdk.subscribe('ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE', 
      ({ participants }) => setParticipants(participants)
    );
  }, []);

  return participants;
}
```

---

## Checklist

- [ ] Application created in Developer Portal
- [ ] Activities enabled
- [ ] URL mappings configured
- [ ] Client ID in environment
- [ ] Client Secret on server
- [ ] Token exchange endpoint working
- [ ] CSP headers allow Discord domains
- [ ] Tested in Discord voice channel
