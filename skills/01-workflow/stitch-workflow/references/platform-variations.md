# Platform Variations

Platform-specific adjustments for each stage of the unified workflow.

---

## Platform Matrix

| Platform | Framework    | Auth Method       | API Layer          | State       | Routing      |
| -------- | ------------ | ----------------- | ------------------ | ----------- | ------------ |
| Next.js  | React 18+    | Supabase JWT      | API Routes         | React Query | App Router   |
| Vite SPA | React 18+    | Supabase JWT      | External API       | React Query | React Router |
| Expo     | React Native | Supabase JWT      | External API       | React Query | Expo Router  |
| Telegram | React/Vite   | initData          | Edge Functions     | Zustand     | React Router |
| Discord  | React/Vite   | OAuth             | Express + Supabase | React Query | React Router |
| ChatGPT  | React        | N/A (client-only) | N/A                | useState    | Single Page  |

---

## Next.js (SSR/SSG)

### Stage 2: Backend

- Use API routes in `app/api/`
- Server components for data fetching
- Supabase SSR client

### Stage 3: Scaffold

```
app/
├── (auth)/
│   ├── sign-in/page.tsx
│   └── sign-up/page.tsx
├── (marketing)/
│   └── page.tsx
├── (app)/
│   ├── layout.tsx          # Auth check
│   ├── dashboard/page.tsx
│   └── [feature]/page.tsx
├── api/
│   ├── auth/callback/route.ts
│   └── [domain]/route.ts
lib/
├── supabase/
│   ├── client.ts           # Browser client
│   ├── server.ts           # Server client
│   └── middleware.ts       # Auth middleware
├── hooks/
│   └── use-*.ts            # Client hooks
├── actions/
│   └── *-actions.ts        # Server actions
```

### Stage 6-7: Integration

```typescript
// Conversion rules
// class="" → className=""
// <img>   → <Image> from next/image
// <a>     → <Link> from next/link
// onclick → 'use client' + onClick
// Forms   → Server actions
```

### Auth Pattern

```typescript
// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );
}
```

---

## Vite SPA

### Stage 2: Backend

- External API (Vercel, Railway, etc.)
- All client-side rendering
- Token stored in localStorage

### Stage 3: Scaffold

```
src/
├── pages/
│   ├── auth/
│   │   ├── SignIn.tsx
│   │   └── SignUp.tsx
│   ├── app/
│   │   ├── Dashboard.tsx
│   │   └── [Feature].tsx
│   └── marketing/
│       └── Landing.tsx
├── components/
├── hooks/
│   └── use-*.ts
├── lib/
│   ├── supabase.ts
│   └── api.ts
├── router.tsx              # React Router setup
└── main.tsx
```

### Stage 6-7: Integration

```typescript
// Conversion rules (same as Next.js except)
// <a>     → <Link> from react-router-dom
// <img>   → <img> (no special component)
// Forms   → React state + API calls
```

### Auth Pattern

```typescript
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

// hooks/use-user.ts
export function useUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) =>
      setUser(session?.user ?? null),
    );

    return () => subscription.unsubscribe();
  }, []);

  return user;
}
```

---

## Expo (React Native)

### Stage 2: Backend

- Same as web (Supabase)
- API via Vercel or Supabase Edge Functions
- Secure storage for tokens

### Stage 3: Scaffold

```
app/
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx           # Dashboard
│   ├── [feature].tsx
│   └── profile.tsx
├── (auth)/
│   ├── _layout.tsx
│   ├── sign-in.tsx
│   └── sign-up.tsx
├── _layout.tsx             # Root layout
└── index.tsx               # Entry redirect
lib/
├── supabase.ts
├── secureStore.ts          # expo-secure-store
hooks/
├── use-user.ts
└── use-*.ts
```

### Stage 6-7: Integration

```typescript
// Conversion rules
// <div>          → <View>
// <p>, <span>    → <Text>
// <img>          → <Image source={require('./image.png')} />
// <button>       → <Pressable> or <TouchableOpacity>
// <input>        → <TextInput>
// class=""       → style={styles.xxx} or className="" (NativeWind)
// onclick        → onPress
```

### Auth Pattern

```typescript
// lib/supabase.ts
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
```

---

## Telegram Mini App

### Stage 2: Backend

- Supabase Edge Functions (Deno)
- initData verification
- Bot token authentication

### Stage 3: Scaffold

```
src/
├── pages/
│   ├── Home.tsx
│   └── [Feature].tsx
├── components/
│   └── TelegramProvider.tsx
├── hooks/
│   ├── useTelegramUser.ts
│   └── use-*.ts
├── lib/
│   ├── telegram.ts         # SDK init
│   └── api.ts              # Edge function calls
└── main.tsx

supabase/functions/
├── verify-init-data/
│   └── index.ts
├── [domain]/
│   └── index.ts
└── telegram-webhook/
    └── index.ts
```

### Stage 6-7: Integration

```typescript
// Conversion rules
// <button>       → <Button> from @telegram-apps/telegram-ui
// <input>        → <Input> from @telegram-apps/telegram-ui
// onclick        → onClick with hapticFeedback.impactOccurred('medium')
```

### Auth Pattern

```typescript
// lib/telegram.ts
import { init, initData, postEvent } from "@telegram-apps/sdk";

export function initTelegram() {
  init();

  return {
    initData: initData.raw(),
    user: initData.user(),
  };
}

// supabase/functions/verify-init-data/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { initData } = await req.json();

  // Verify initData with bot token
  const isValid = verifyTelegramWebAppData(initData, BOT_TOKEN);

  if (!isValid) {
    return new Response(JSON.stringify({ error: "Invalid initData" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Create or get user
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const telegramUser = parseInitData(initData).user;
  // ... upsert user logic

  return new Response(JSON.stringify({ user, token }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
```

---

## Discord Activity

### Stage 2: Backend

- Express server for OAuth
- Supabase for data
- Discord SDK for activity

### Stage 3: Scaffold

```
client/
├── src/
│   ├── App.tsx
│   ├── components/
│   ├── hooks/
│   │   ├── useDiscordSdk.ts
│   │   └── use-*.ts
│   └── lib/
│       └── api.ts
server/
├── src/
│   ├── routes/
│   │   └── oauth.ts        # Token exchange
│   └── index.ts
├── package.json
```

### Stage 6-7: Integration

```typescript
// Conversion rules (same as Vite)
// Discord-specific:
// Activity events → discordSdk.commands.setActivity()
// Voice channel  → useVoiceChannel hook
```

### Auth Pattern

```typescript
// client/hooks/useDiscordSdk.ts
import { DiscordSDK } from "@discord/embedded-app-sdk";

const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);

export function useDiscordSdk() {
  const [ready, setReady] = useState(false);
  const [auth, setAuth] = useState<{ access_token: string } | null>(null);

  useEffect(() => {
    async function setup() {
      await discordSdk.ready();

      // Authorize with Discord
      const { code } = await discordSdk.commands.authorize({
        client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
        response_type: "code",
        state: "",
        prompt: "none",
        scope: ["identify", "guilds"],
      });

      // Exchange code for token
      const response = await fetch("/api/oauth/token", {
        method: "POST",
        body: JSON.stringify({ code }),
      });

      const authData = await response.json();
      setAuth(authData);
      setReady(true);
    }

    setup();
  }, []);

  return { sdk: discordSdk, ready, auth };
}

// server/routes/oauth.ts
app.post("/api/oauth/token", async (req, res) => {
  const { code } = req.body;

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: "authorization_code",
      code,
    }),
  });

  const tokens = await response.json();
  res.json(tokens);
});
```

---

## ChatGPT Canvas

### Stage 2: Backend

- Usually none (client-only)
- Optional: GPT Actions for persistence

### Stage 3: Scaffold

```
src/
├── App.tsx                 # Single page app
├── components/
│   └── [Feature].tsx
├── hooks/
│   └── useState.ts         # Just React state
├── lib/
│   └── storage.ts          # localStorage wrapper
└── main.tsx
```

### Stage 6-7: Integration

```typescript
// Conversion rules
// class=""       → className="" (Tailwind via CDN ok)
// All state      → useState (no React Query needed)
// Persistence    → localStorage
// No routing     → Single page, use tabs/modals
```

### "Auth" Pattern

```typescript
// No real auth - use localStorage for state persistence
// lib/storage.ts
const STORAGE_KEY = 'chatgpt-app-state'

export function saveState<T>(state: T) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function loadState<T>(): T | null {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved ? JSON.parse(saved) : null
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY)
}

// App.tsx
function App() {
  const [data, setData] = useState(() => loadState() || initialData)

  useEffect(() => {
    saveState(data)
  }, [data])

  return (...)
}
```

---

## Platform Detection

```typescript
// Detect platform from project structure

interface PlatformDetection {
  platform: "nextjs" | "vite" | "expo" | "telegram" | "discord" | "chatgpt";
  indicators: string[];
}

export function detectPlatform(projectPath: string): PlatformDetection {
  const packageJson = readPackageJson(projectPath);

  // Check dependencies
  if (packageJson.dependencies?.["next"]) {
    return { platform: "nextjs", indicators: ["next dependency"] };
  }

  if (packageJson.dependencies?.["expo"]) {
    return { platform: "expo", indicators: ["expo dependency"] };
  }

  if (packageJson.dependencies?.["@telegram-apps/sdk"]) {
    return { platform: "telegram", indicators: ["@telegram-apps/sdk"] };
  }

  if (packageJson.dependencies?.["@discord/embedded-app-sdk"]) {
    return { platform: "discord", indicators: ["@discord/embedded-app-sdk"] };
  }

  if (packageJson.dependencies?.["vite"]) {
    // Check for ChatGPT indicators
    const hasLocalStoragePattern = checkForLocalStoragePattern(projectPath);
    if (hasLocalStoragePattern) {
      return {
        platform: "chatgpt",
        indicators: ["vite", "localStorage pattern"],
      };
    }
    return { platform: "vite", indicators: ["vite dependency"] };
  }

  return { platform: "nextjs", indicators: ["default"] };
}
```

---

## Stitch Skill Mapping

| Platform | Stitch Skill                   | Key Differences                                     |
| -------- | ------------------------------ | --------------------------------------------------- |
| Next.js  | google-stitch-prompts-nextjs   | Image/Link imports, 'use client', Server Components |
| Vite     | google-stitch-prompts-vite     | React Router, no special components                 |
| Expo     | google-stitch-prompts-expo     | React Native components, StyleSheet                 |
| Telegram | google-stitch-prompts-telegram | Telegram UI kit, haptics                            |
| Discord  | google-stitch-prompts-discord  | Discord SDK integration                             |
| ChatGPT  | google-stitch-prompts-chatgpt  | Single page, localStorage                           |
