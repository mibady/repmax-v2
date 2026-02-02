# Project Scaffolding PRP - Caregiving Companion

## Goal

Initialize and scaffold the complete Caregiving Companion Next.js project with all necessary dependencies, configuration files, and folder structure to enable immediate development of Phase 1 features.

## Why

- **Zero Friction Start**: Enable developers to begin feature implementation immediately
- **Consistency**: Ensure all team members work with identical configurations
- **Best Practices**: Establish TypeScript, ESLint, and testing patterns from day one
- **Dependency Management**: Prevent version conflicts by consolidating all dependencies upfront
- **Environment Setup**: Provide clear template for all required environment variables

## What (User-Visible Behavior)

- **5-Minute Setup**: Complete project initialization in under 5 minutes
- **Type Safety**: Full TypeScript configuration with strict mode
- **Code Quality**: ESLint, Prettier, and Husky pre-commit hooks
- **Development Ready**: Hot reload, error overlay, and debugging tools configured
- **Production Optimized**: Build optimization and bundle analysis ready

## All Needed Context

### Documentation References

- Next.js 15 Setup: https://nextjs.org/docs/getting-started
- TypeScript Configuration: https://nextjs.org/docs/basic-features/typescript
- Tailwind CSS Setup: https://tailwindcss.com/docs/guides/nextjs
- ESLint Configuration: https://nextjs.org/docs/basic-features/eslint
- Clerk Setup: https://clerk.com/docs/quickstarts/nextjs
- Supabase Setup: https://supabase.com/docs/guides/with-nextjs

## Implementation Blueprint

### 1. Project Initialization

```bash
# Create Next.js project with TypeScript and Tailwind
npx create-next-app@latest caregiving-companion \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack

cd caregiving-companion

# Initialize git with proper gitignore
git init
git add .
git commit -m "Initial commit: Next.js scaffolding"
```

### 2. Complete Package.json

```json
{
  "name": "caregiving-companion",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:auth:signup": "jest src/__tests__/auth/signup.test.ts",
    "test:auth:signin": "jest src/__tests__/auth/signin.test.ts",
    "test:auth:oauth": "jest src/__tests__/auth/oauth.test.ts",
    "test:rbac": "jest src/__tests__/auth/rbac.test.ts",
    "test:org-isolation": "jest src/__tests__/auth/org-isolation.test.ts",
    "test:permissions": "jest src/__tests__/auth/permissions.test.ts",
    "test:webhook-sync": "jest src/__tests__/integration/webhook-sync.test.ts",
    "test:middleware": "jest src/__tests__/middleware.test.ts",
    "test:emergency-access": "jest src/__tests__/auth/emergency-access.test.ts",
    "db:migrate": "supabase migration up",
    "db:reset": "supabase db reset",
    "analyze": "ANALYZE=true next build",
    "prepare": "husky install"
  },
  "dependencies": {
    "next": "15.0.3",
    "react": "18.3.1",
    "react-dom": "18.3.1",

    "// Authentication": "",
    "@clerk/nextjs": "^5.7.1",
    "@clerk/themes": "^2.1.35",
    "@clerk/types": "^4.20.1",

    "// Database & Storage": "",
    "@supabase/supabase-js": "^2.45.4",
    "@supabase/ssr": "^0.5.1",

    "// AI & Voice": "",
    "@ai-sdk/anthropic": "^0.0.64",
    "ai": "^3.4.33",
    "retell-sdk": "^4.0.0",
    "@calcom/sdk": "^1.0.0",

    "// Caching & Queues": "",
    "@upstash/redis": "^1.34.3",
    "ioredis": "^5.4.1",
    "redis-om": "^0.4.0",
    "bullmq": "^5.0.0",
    "bull": "^4.16.3",

    "// Email": "",
    "resend": "^4.0.0",
    "react-email": "^3.0.1",
    "@react-email/components": "^0.0.25",

    "// UI Components": "",
    "@radix-ui/react-accordion": "^1.2.0",
    "@radix-ui/react-alert-dialog": "^1.1.1",
    "@radix-ui/react-aspect-ratio": "^1.1.0",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-checkbox": "^1.1.1",
    "@radix-ui/react-collapsible": "^1.1.0",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-hover-card": "^1.1.1",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-menubar": "^1.1.1",
    "@radix-ui/react-navigation-menu": "^1.2.0",
    "@radix-ui/react-popover": "^1.1.1",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-radio-group": "^1.2.0",
    "@radix-ui/react-scroll-area": "^1.1.0",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slider": "^1.2.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.1",
    "@radix-ui/react-toggle": "^1.1.0",
    "@radix-ui/react-toggle-group": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.2",

    "// Forms & Validation": "",
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.23.8",

    "// Data Fetching": "",
    "@tanstack/react-query": "^5.51.0",
    "swr": "^2.2.5",

    "// State Management": "",
    "zustand": "^4.5.5",

    "// Animations": "",
    "framer-motion": "^11.2.0",

    "// Charts & Visualizations": "",
    "recharts": "^2.12.0",

    "// Calendar & Date": "",
    "date-fns": "^3.6.0",
    "react-big-calendar": "^1.15.0",
    "react-day-picker": "^8.10.1",

    "// Drag & Drop": "",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2",

    "// File Upload": "",
    "react-dropzone": "^14.2.9",
    "react-camera-pro": "^1.4.0",

    "// Rich Text": "",
    "react-textarea-autosize": "^8.5.3",
    "react-mentions": "^4.4.10",
    "emoji-picker-react": "^4.11.1",

    "// Icons": "",
    "lucide-react": "^0.350.0",

    "// Utilities": "",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.2",
    "class-variance-authority": "^0.7.0",
    "jose": "^5.0.0",
    "rate-limiter-flexible": "^3.3.5",

    "// Monitoring": "",
    "@sentry/nextjs": "^8.3.1",
    "@vercel/analytics": "^1.2.1",
    "@vercel/speed-insights": "^1.1.0",

    "// PWA Support": "",
    "next-pwa": "^5.6.0",
    "@ducanh2912/next-pwa": "^10.2.8"
  },
  "devDependencies": {
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/react-big-calendar": "^1.8.12",

    "// TypeScript": "",
    "typescript": "^5.5.0",

    "// CSS": "",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",

    "// Linting & Formatting": "",
    "eslint": "^8.57.0",
    "eslint-config-next": "15.0.3",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-react-hooks": "^4.6.2",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "prettier": "^3.3.0",
    "prettier-plugin-tailwindcss": "^0.6.0",

    "// Testing": "",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/user-event": "^14.5.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",

    "// Git Hooks": "",
    "husky": "^9.1.0",
    "lint-staged": "^15.2.0",

    "// Bundle Analysis": "",
    "@next/bundle-analyzer": "^15.0.0"
  }
}
```

### 3. Project Folder Structure

```
caregiving-companion/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── sign-in/
│   │   │   │   └── [[...sign-in]]/
│   │   │   │       └── page.tsx
│   │   │   ├── sign-up/
│   │   │   │   └── [[...sign-up]]/
│   │   │   │       └── page.tsx
│   │   │   ├── onboarding/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── chat/
│   │   │   │   └── page.tsx
│   │   │   ├── health/
│   │   │   │   ├── medications/
│   │   │   │   ├── appointments/
│   │   │   │   └── page.tsx
│   │   │   ├── tasks/
│   │   │   │   └── page.tsx
│   │   │   ├── finances/
│   │   │   │   └── page.tsx
│   │   │   ├── documents/
│   │   │   │   └── page.tsx
│   │   │   ├── team/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (marketing)/
│   │   │   ├── page.tsx
│   │   │   ├── about/
│   │   │   ├── pricing/
│   │   │   ├── contact/
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── ai/
│   │   │   │   ├── chat/
│   │   │   │   │   └── route.ts
│   │   │   │   └── tools/
│   │   │   │       └── route.ts
│   │   │   ├── voice/
│   │   │   │   ├── inbound/
│   │   │   │   │   └── route.ts
│   │   │   │   └── outbound/
│   │   │   │       └── route.ts
│   │   │   ├── webhooks/
│   │   │   │   ├── clerk/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── retell/
│   │   │   │   │   └── route.ts
│   │   │   │   └── cal/
│   │   │   │       └── route.ts
│   │   │   ├── notifications/
│   │   │   │   └── route.ts
│   │   │   └── health/
│   │   │       └── route.ts
│   │   ├── emergency/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── favicon.ico
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ... (all shadcn components)
│   │   ├── chat/
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageList.tsx
│   │   │   └── MessageInput.tsx
│   │   ├── voice/
│   │   │   ├── VoiceInterface.tsx
│   │   │   └── VoiceButton.tsx
│   │   ├── dashboard/
│   │   │   ├── StatsCard.tsx
│   │   │   └── QuickActions.tsx
│   │   ├── health/
│   │   │   ├── MedicationCard.tsx
│   │   │   └── AppointmentCard.tsx
│   │   └── shared/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── redis/
│   │   │   ├── client.ts
│   │   │   └── cache.ts
│   │   ├── ai/
│   │   │   ├── claude.ts
│   │   │   └── tools.ts
│   │   ├── voice/
│   │   │   └── retell.ts
│   │   ├── email/
│   │   │   └── resend.ts
│   │   ├── utils/
│   │   │   ├── cn.ts
│   │   │   └── format.ts
│   │   └── constants.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useChat.ts
│   │   ├── useVoice.ts
│   │   └── useSupabase.ts
│   ├── providers/
│   │   ├── AuthProvider.tsx
│   │   ├── QueryProvider.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── AnalyticsProvider.tsx
│   ├── types/
│   │   ├── database.ts
│   │   ├── api.ts
│   │   └── index.ts
│   ├── styles/
│   │   └── globals.css
│   └── middleware.ts
├── public/
│   ├── images/
│   ├── sounds/
│   └── manifest.json
├── prisma/
│   └── schema.prisma (if using Prisma with Supabase)
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed.sql
├── emails/
│   └── templates/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── deploy.yml
│   │   └── test.yml
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── CONTRIBUTING.md
├── scripts/
│   ├── setup.sh
│   └── seed-db.ts
├── .env.example
├── .env.local
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── jest.config.js
├── package.json
├── package-lock.json
└── README.md
```

### 4. Environment Variables (.env.example)

```env
# ============================================
# CORE CONFIGURATION
# ============================================
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Caregiving Companion"

# ============================================
# AUTHENTICATION (Clerk)
# ============================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
CLERK_WEBHOOK_SECRET=whsec_...

# ============================================
# DATABASE (Supabase)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=your-jwt-secret

# ============================================
# CACHING (Redis Cloud)
# ============================================
REDIS_URL=rediss://default:password@redis-host:port
REDIS_PASSWORD=your-redis-password
REDIS_TOKEN=your-redis-token
REDIS_TLS={}

# ============================================
# AI SERVICES (Anthropic Claude)
# ============================================
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# ============================================
# VOICE & SMS (Retell AI)
# ============================================
# IMPORTANT: Each user account gets ONE dedicated Retell phone number
# This number handles both voice calls and SMS (after SMS campaign approval)
# SMS requires: 1) Business profile approval 2) SMS campaign approval
# Currently limited to US Twilio numbers only
RETELL_API_KEY=rt_...
RETELL_AGENT_ID=agent_...
RETELL_SMS_AGENT_ID=agent_sms_... # Optional: Different agent config for SMS
RETELL_DEFAULT_AREA_CODE=415 # For provisioning new numbers
RETELL_WEBHOOK_SECRET=webhook_secret_...
RETELL_SMS_CAMPAIGN_ID=campaign_... # After SMS campaign approval

# ============================================
# SCHEDULING (Cal.com)
# ============================================
CALCOM_API_KEY=cal_...
CALCOM_EVENT_TYPE_ID=event_...
CALCOM_WEBHOOK_SECRET=cal_webhook_...

# ============================================
# EMAIL (Resend)
# ============================================
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=notifications@yourdomain.com
RESEND_REPLY_TO=support@yourdomain.com

# ============================================
# MONITORING (Sentry)
# ============================================
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=your-org
SENTRY_PROJECT=caregiving-companion
SENTRY_ENVIRONMENT=development

# ============================================
# ANALYTICS (Vercel)
# ============================================
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=...
NEXT_PUBLIC_VERCEL_URL=https://your-app.vercel.app
VERCEL_TOKEN=...
VERCEL_ORG_ID=...
VERCEL_PROJECT_ID=...

# ============================================
# SECURITY
# ============================================
ENCRYPTION_KEY=your-32-char-encryption-key-here
SESSION_SECRET=your-session-secret-here
NEXTAUTH_SECRET=your-nextauth-secret-here

# ============================================
# FEATURE FLAGS
# ============================================
NEXT_PUBLIC_ENABLE_VOICE=true
NEXT_PUBLIC_ENABLE_SMS=true
NEXT_PUBLIC_ENABLE_EMERGENCY_MODE=true
NEXT_PUBLIC_MAINTENANCE_MODE=false

# ============================================
# RATE LIMITING
# ============================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 5. Configuration Files

#### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "localhost",
      "supabase.co",
      "lh3.googleusercontent.com",
      "avatars.githubusercontent.com",
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  widenClientFileUpload: true,
  transpileClientSDK: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
};

module.exports = withBundleAnalyzer(
  withSentryConfig(nextConfig, sentryWebpackPluginOptions),
);
```

#### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"],
      "@/styles/*": ["./src/styles/*"],
      "@/app/*": ["./src/app/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom colors for Caregiving Companion
        care: {
          primary: "#3B82F6",
          secondary: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
          info: "#6366F1",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

#### .eslintrc.json

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

#### .prettierrc

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindConfig": "./tailwind.config.ts"
}
```

#### .gitignore

```
# Dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Supabase
**/supabase/.branches
**/supabase/.temp

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
Thumbs.db

# Sentry
.sentryclirc

# PWA
public/sw.js
public/workbox-*.js
```

### 6. Setup Scripts

#### scripts/setup.sh

```bash
#!/bin/bash

echo "🚀 Setting up Caregiving Companion project..."

# Check Node version
required_node_version="18"
current_node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$current_node_version" -lt "$required_node_version" ]; then
    echo "❌ Node.js version $required_node_version or higher is required"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env.local ]; then
    echo "📋 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your actual values"
fi

# Install shadcn/ui components
echo "🎨 Installing UI components..."
npx shadcn-ui@latest init -y
npx shadcn-ui@latest add button card dialog input label select toast tabs

# Setup Supabase (if CLI is installed)
if command -v supabase &> /dev/null; then
    echo "🗄️  Initializing Supabase..."
    supabase init
fi

# Setup git hooks
echo "🔗 Setting up git hooks..."
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm run typecheck"

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p src/app/api/ai/chat
mkdir -p src/app/api/voice/inbound
mkdir -p src/components/ui
mkdir -p src/lib/supabase
mkdir -p src/hooks
mkdir -p src/providers
mkdir -p src/types
mkdir -p public/images
mkdir -p supabase/migrations
mkdir -p tests/unit

echo "✅ Setup complete! Run 'npm run dev' to start the development server."
```

## Task Checklist

### Initial Setup

- [ ] Run `npx create-next-app` with specified options
- [ ] Install all dependencies from package.json
- [ ] Copy .env.example to .env.local
- [ ] Update .env.local with actual values
- [ ] Initialize git repository

### Configuration

- [ ] Configure next.config.js
- [ ] Set up tsconfig.json with path aliases
- [ ] Configure tailwind.config.ts
- [ ] Set up ESLint and Prettier
- [ ] Configure jest.config.js for testing

### Folder Structure

- [ ] Create all app routes structure
- [ ] Set up components directory
- [ ] Create lib utilities structure
- [ ] Set up hooks directory
- [ ] Create providers directory
- [ ] Set up types directory

### Development Tools

- [ ] Install and configure Husky
- [ ] Set up lint-staged
- [ ] Configure VS Code settings
- [ ] Set up debugging configuration

### Documentation

- [ ] Create README.md with setup instructions
- [ ] Document environment variables
- [ ] Create CONTRIBUTING.md
- [ ] Set up API documentation structure

## Validation Loop

### Level 1: Project Setup

```bash
# Verify installation
npm run dev
# Should start on http://localhost:3000

# Check TypeScript
npm run typecheck
# Should pass with no errors

# Check linting
npm run lint
# Should pass with no errors
```

### Level 2: Build Verification

```bash
# Production build
npm run build
# Should build successfully

# Start production server
npm run start
# Should serve production build
```

### Level 3: Environment Check

```bash
# Check all required env vars
node -e "
const required = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'ANTHROPIC_API_KEY'
];
const missing = required.filter(key => !process.env[key]);
if (missing.length) {
  console.error('Missing env vars:', missing);
  process.exit(1);
} else {
  console.log('✅ All required env vars present');
}
"
```

## Success Metrics

- ✅ Project initializes in < 5 minutes
- ✅ All dependencies install without conflicts
- ✅ TypeScript compilation succeeds
- ✅ ESLint passes with no errors
- ✅ Development server starts successfully
- ✅ Production build completes
- ✅ All environment variables documented

## Next Steps

After successful scaffolding:

1. Proceed to `03-Phase1-Authentication.md` for Clerk setup
2. Continue with `04-Phase1-Database-Schema.md` for Supabase configuration
3. Follow the phase progression in `01-Development-Roadmap.md`

## Notes

- This scaffolding creates a production-ready foundation
- All security headers and CSP policies are configured
- Monitoring and analytics are ready but require API keys
- The project is optimized for Vercel deployment but can be adapted for other platforms
