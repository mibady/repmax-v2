# Supabase Auth for Mobile

Secure authentication with Supabase in Expo/React Native apps.

## Supabase Client Setup

```typescript
// lib/supabase.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Database } from '@/types/database';

// Secure storage adapter (uses Keychain on iOS, Keystore on Android)
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Important for mobile
    },
  }
);
```

## Auth Store (Zustand)

```typescript
// store/auth.ts
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isInitialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      set({
        session,
        user: session?.user ?? null,
        isLoading: false,
        isInitialized: true,
      });

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          session,
          user: session?.user ?? null,
        });
      });
    } catch (error) {
      console.error('Auth init error:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ isLoading: false });
      return { error };
    }

    set({
      user: data.user,
      session: data.session,
      isLoading: false,
    });

    return { error: null };
  },

  signUp: async (email, password, fullName) => {
    set({ isLoading: true });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    set({ isLoading: false });

    if (error) return { error };
    
    // Note: If email confirmation is required, session will be null
    if (data.session) {
      set({ user: data.user, session: data.session });
    }

    return { error: null };
  },

  signOut: async () => {
    set({ isLoading: true });
    await supabase.auth.signOut();
    set({ user: null, session: null, isLoading: false });
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'myapp://auth/reset-password', // Deep link
    });
    return { error };
  },
}));

// Selector hooks
export const useUser = () => useAuthStore((s) => s.user);
export const useSession = () => useAuthStore((s) => s.session);
export const useIsAuthenticated = () => useAuthStore((s) => !!s.session);
export const useIsAuthLoading = () => useAuthStore((s) => s.isLoading);
```

## Root Layout (Auth Initialization)

```typescript
// app/_layout.tsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '@/store/auth';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    initialize().finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  if (!isInitialized) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
```

## Protected Routes

```typescript
// app/(tabs)/_layout.tsx
import { Redirect, Tabs } from 'expo-router';
import { useIsAuthenticated, useIsAuthLoading } from '@/store/auth';
import { Loading } from '@/components/ui';

export default function TabsLayout() {
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useIsAuthLoading();

  if (isLoading) return <Loading fullScreen />;
  if (!isAuthenticated) return <Redirect href="/auth/sign-in" />;

  return (
    <Tabs>
      {/* Tab screens */}
    </Tabs>
  );
}
```

## Sign In Screen

```typescript
// app/auth/sign-in.tsx
import { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { Button, Input } from '@/components/ui';

export default function SignInScreen() {
  const { signIn, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setError('');
    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
      return;
    }
    
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 justify-center px-6 bg-black">
      {error && <Text className="text-red-500 mb-4">{error}</Text>}
      
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Button onPress={handleSignIn} isLoading={isLoading}>
        Sign In
      </Button>
    </View>
  );
}
```

## OAuth Providers

```typescript
// Google Sign-In with expo-auth-session
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    webClientId: 'YOUR_WEB_CLIENT_ID',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      
      supabase.auth.signInWithIdToken({
        provider: 'google',
        token: id_token,
      });
    }
  }, [response]);

  return { request, promptAsync };
}
```

## Deep Linking for Auth

```json
// app.json
{
  "expo": {
    "scheme": "myapp",
    "plugins": ["expo-router"]
  }
}
```

```typescript
// Handle deep link in app
import { useURL } from 'expo-linking';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useAuthDeepLink() {
  const url = useURL();

  useEffect(() => {
    if (url) {
      // Supabase will handle the token extraction
      supabase.auth.getSession();
    }
  }, [url]);
}
```

## Session Refresh

The Supabase client automatically refreshes tokens when `autoRefreshToken: true`. For manual refresh:

```typescript
// Force refresh session
const { data, error } = await supabase.auth.refreshSession();

// Check if session is expired
const isExpired = session?.expires_at 
  ? new Date(session.expires_at * 1000) < new Date()
  : true;
```

## Error Handling

Common Supabase auth errors:

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid login credentials` | Wrong email/password | Show error message |
| `Email not confirmed` | User hasn't verified email | Prompt to check email |
| `User already registered` | Duplicate signup | Redirect to sign in |
| `Password too weak` | Password < 6 chars | Show requirements |

```typescript
const handleAuthError = (error: AuthError) => {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Email or password is incorrect';
    case 'Email not confirmed':
      return 'Please verify your email first';
    case 'User already registered':
      return 'An account with this email already exists';
    default:
      return error.message;
  }
};
```
