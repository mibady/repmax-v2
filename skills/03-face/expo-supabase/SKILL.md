---
name: expo-supabase
description: Mobile app development with Expo, Supabase auth, and NativeWind styling.
---

# Expo + Supabase

Production-ready mobile app development with Expo, Supabase, and NativeWind.

## When to Use

- iOS/Android mobile apps
- Apps with Supabase backend
- Cross-platform development
- Apps requiring secure token storage

## Stack

| Component | Technology |
|-----------|------------|
| Framework | Expo SDK |
| Auth | Supabase + expo-secure-store |
| Navigation | Expo Router |
| Styling | NativeWind (Tailwind CSS) |
| State | Zustand |
| API | Custom client with JWT injection |

## Project Structure

```
expo-supabase-starter/
├── app/                    # Expo Router (file-based routing)
│   ├── auth/              # Sign in, Sign up, Forgot password
│   └── (tabs)/            # Home, Explore, Profile tabs
├── components/ui/         # Button, Input, Card, Loading
├── lib/
│   ├── supabase.ts       # Client with secure token storage
│   └── api.ts            # API client for your Vercel backend
├── store/                 # Zustand state management
│   ├── auth.ts           # Authentication state
│   └── app.ts            # App preferences
├── hooks/                 # useAsync, useDebounce
└── types/                 # TypeScript definitions
```

## Stack

| Feature | Implementation |
|---------|----------------|
| Auth | Supabase auth with secure token storage (expo-secure-store) |
| Navigation | Expo Router with protected routes |
| Styling | NativeWind (Tailwind CSS) |
| State | Zustand with persistence |
| API | Auto-injects auth token for Vercel calls |
| UI | Dark mode, iOS-native feel |

## Getting Started

```bash
# 1. Unzip and install
cd expo-supabase-starter
npm install

# 2. Configure environment
cp .env.example .env
# Add your Supabase URL, anon key, and API URL

# 3. Run
npm run dev
# Scan QR with Expo Go
```

## API Client Pattern

The API client automatically includes the Supabase JWT:

```typescript
import { apiClient } from '@/lib/api';

// These calls include Authorization: Bearer <token>
const data = await apiClient.get('/users');
const user = await apiClient.post('/users', { name: 'John' });
```

## Vercel Backend Integration

Your Next.js API routes verify the token:

```typescript
// app/api/users/route.ts (Vercel)
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const supabase = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: { user } } = await supabase.auth.getUser();
  // user is now authenticated
}
```

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Build
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## Key Patterns

### Protected Routes

```typescript
// app/(tabs)/_layout.tsx
import { useAuthStore } from '@/store/auth';
import { Redirect } from 'expo-router';

export default function TabsLayout() {
  const { user, loading } = useAuthStore();

  if (loading) return <Loading />;
  if (!user) return <Redirect href="/auth/sign-in" />;

  return <Tabs />;
}
```

### Secure Token Storage

```typescript
// lib/supabase.ts
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, anonKey, {
  auth: {
    storage: {
      getItem: (key) => SecureStore.getItemAsync(key),
      setItem: (key, value) => SecureStore.setItemAsync(key, value),
      removeItem: (key) => SecureStore.deleteItemAsync(key),
    },
  },
});
```

### Zustand Auth Store

```typescript
// store/auth.ts
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    set({ user: data.user });
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
```

## References

- `references/expo-router.md` - File-based routing patterns
- `references/nativewind.md` - Tailwind for React Native
- `references/zustand.md` - State management patterns
