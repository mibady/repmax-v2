# Expo Router Navigation

File-based routing for React Native with Expo Router.

## Project Structure

```
app/
├── _layout.tsx           # Root layout (wraps everything)
├── index.tsx             # / route
├── about.tsx             # /about route
├── [id].tsx              # /123 dynamic route
├── [...slug].tsx         # /a/b/c catch-all route
├── (group)/              # Route group (no URL segment)
│   ├── _layout.tsx
│   └── settings.tsx      # /settings (not /group/settings)
├── (tabs)/               # Tab navigator
│   ├── _layout.tsx       # Tab configuration
│   ├── index.tsx         # First tab
│   └── profile.tsx       # Second tab
└── auth/                 # Nested stack
    ├── _layout.tsx
    ├── sign-in.tsx       # /auth/sign-in
    └── sign-up.tsx       # /auth/sign-up
```

## Layouts

### Root Layout

```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
```

### Tab Layout

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopColor: '#27272a',
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#0ea5e9',
        tabBarInactiveTintColor: '#71717a',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Stack Layout (Auth)

```typescript
// app/auth/_layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
```

## Navigation

### Link Component

```typescript
import { Link } from 'expo-router';

// Basic link
<Link href="/profile">Go to Profile</Link>

// With params
<Link href="/user/123">View User</Link>

// With query params
<Link href="/search?q=hello">Search</Link>

// Replace instead of push
<Link href="/auth/sign-in" replace>Sign In</Link>

// As child (custom component)
<Link href="/settings" asChild>
  <Pressable>
    <Text>Settings</Text>
  </Pressable>
</Link>
```

### Imperative Navigation

```typescript
import { router } from 'expo-router';

// Push (adds to stack)
router.push('/profile');

// Replace (replaces current)
router.replace('/auth/sign-in');

// Back
router.back();

// Can go back?
router.canGoBack();

// Navigate with params
router.push({
  pathname: '/user/[id]',
  params: { id: '123' },
});

// Navigate with query
router.push({
  pathname: '/search',
  params: { q: 'hello', filter: 'recent' },
});

// Dismiss all modals
router.dismissAll();
```

### Reading Params

```typescript
// app/user/[id].tsx
import { useLocalSearchParams, useGlobalSearchParams } from 'expo-router';

export default function UserScreen() {
  // Local params (from this segment only)
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // Global params (from entire URL)
  const params = useGlobalSearchParams();
  
  return <Text>User ID: {id}</Text>;
}
```

## Route Groups

Route groups `(name)` organize files without affecting URLs:

```
app/
├── (auth)/               # Auth flow
│   ├── _layout.tsx
│   ├── sign-in.tsx       # /sign-in
│   └── sign-up.tsx       # /sign-up
├── (main)/               # Main app
│   ├── _layout.tsx
│   ├── index.tsx         # /
│   └── profile.tsx       # /profile
```

## Protected Routes

### Redirect Pattern

```typescript
// app/(protected)/_layout.tsx
import { Redirect, Stack } from 'expo-router';
import { useIsAuthenticated } from '@/store/auth';

export default function ProtectedLayout() {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <Redirect href="/auth/sign-in" />;
  }

  return <Stack />;
}
```

### Entry Point Pattern

```typescript
// app/index.tsx
import { Redirect } from 'expo-router';
import { useIsAuthenticated, useIsAuthLoading } from '@/store/auth';
import { Loading } from '@/components/ui';

export default function Index() {
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useIsAuthLoading();

  if (isLoading) return <Loading fullScreen />;
  if (isAuthenticated) return <Redirect href="/(tabs)" />;
  return <Redirect href="/auth/sign-in" />;
}
```

## Modals

```typescript
// app/_layout.tsx
<Stack>
  <Stack.Screen name="(tabs)" />
  <Stack.Screen
    name="modal"
    options={{
      presentation: 'modal',
      animation: 'slide_from_bottom',
    }}
  />
</Stack>
```

```typescript
// Open modal
router.push('/modal');

// Close modal
router.back();
// or
router.dismiss();
```

## Deep Linking

### Configuration

```json
// app.json
{
  "expo": {
    "scheme": "myapp",
    "plugins": ["expo-router"]
  }
}
```

### URL Patterns

```
myapp://                    → /
myapp://profile             → /profile
myapp://user/123            → /user/123
myapp://auth/reset?token=x  → /auth/reset?token=x
```

### Handling Deep Links

```typescript
import { useURL } from 'expo-linking';
import { router } from 'expo-router';
import { useEffect } from 'react';

export function useDeepLinkHandler() {
  const url = useURL();

  useEffect(() => {
    if (url) {
      // Expo Router handles this automatically
      // Custom logic if needed:
      const path = url.replace('myapp://', '/');
      router.push(path);
    }
  }, [url]);
}
```

## Screen Options

```typescript
// Static options
export const unstable_settings = {
  initialRouteName: 'index',
};

// Dynamic options
import { Stack } from 'expo-router';

export default function Screen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'My Screen',
          headerShown: true,
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
        }}
      />
      {/* Screen content */}
    </>
  );
}
```

## Navigation Events

```typescript
import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback } from 'react';

export default function Screen() {
  // Called when screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused');
      
      return () => {
        console.log('Screen unfocused');
      };
    }, [])
  );

  return <View />;
}
```

## Error Handling

```typescript
// app/+not-found.tsx
import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View className="flex-1 items-center justify-center">
        <Text>This screen doesn't exist.</Text>
        <Link href="/">Go to home</Link>
      </View>
    </>
  );
}
```

## TypeScript

Enable typed routes in `app.json`:

```json
{
  "expo": {
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

Then routes are type-checked:

```typescript
router.push('/profile');        // ✓ Valid
router.push('/nonexistent');    // ✗ Type error
```
