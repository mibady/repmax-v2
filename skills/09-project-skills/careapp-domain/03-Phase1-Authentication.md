# Clerk Authentication PRP - Caregiving Companion

## Goal

Implement complete authentication and authorization system using Clerk for the Caregiving Companion app, including multi-tenant organization support, role-based access control, and Supabase integration.

## Why

- Provide secure, HIPAA-compliant authentication for health data access
- Enable seamless onboarding with social logins and magic links
- Support multi-factor authentication for sensitive operations
- Manage complex caregiving team permissions and roles
- Ensure proper session management across devices

## What (User-Visible Behavior)

- **Quick Sign-up**: < 30 second registration with email or social providers
- **Secure Access**: MFA for sensitive health and financial data
- **Team Management**: Invite family members with specific roles
- **Session Persistence**: Stay logged in across devices
- **Emergency Access**: Quick-access mode for crisis situations

## All Needed Context

### Documentation References

- Clerk Next.js Setup: https://clerk.com/docs/quickstarts/nextjs
- Clerk Organizations: https://clerk.com/docs/organizations/overview
- Clerk Webhooks: https://clerk.com/docs/integrations/webhooks
- Clerk + Supabase: https://clerk.com/docs/integrations/databases/supabase
- Clerk Roles & Permissions: https://clerk.com/docs/organizations/roles-permissions

### Environment Variables Required

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_[...]
CLERK_SECRET_KEY=sk_test_[...]
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
CLERK_WEBHOOK_SECRET=whsec_[...]
REDIS_URL=redis://localhost:6379
REDIS_TOKEN=your_redis_token
SENTRY_DSN=https://your_sentry_dsn@sentry.io/your_sentry_id
```

### Package Dependencies

```json
{
  "dependencies": {
    "@clerk/nextjs": "^5.7.1",
    "@clerk/themes": "^2.1.35",
    "@clerk/types": "^4.20.1",
    "@sentry/nextjs": "^8.0.0",
    "@upstash/redis": "^1.34.3",
    "@vercel/analytics": "^1.2.1",
    "jose": "^5.0.0",
    "rate-limiter-flexible": "^3.3.5"
  }
}
```

### Critical Implementation Notes

- **Security**:
  - Implement rate limiting for authentication endpoints using Redis
  - Use Redis for session management and token blacklisting
  - Enable MFA for all admin and caregiver roles
  - Implement IP-based rate limiting and suspicious activity detection
  - Use HTTP-only, secure, and same-site cookies
- **Performance**:
  - Cache user sessions and permissions in Redis
  - Use Redis for rate limiting and brute force protection
  - Implement session clustering for high availability
- **Monitoring**:
  - Log all authentication events to Sentry
  - Track failed login attempts and security events
  - Set up alerts for suspicious activities
  - Monitor session duration and token usage
- **Compliance**:
  - Implement audit logging for all authentication events
  - Support GDPR right to be forgotten
  - Maintain session logs for compliance
  - Document all security measures and access controls

## Implementation Blueprint

### 1. Enhanced Clerk Provider with Redis and Sentry (/app/providers/auth-provider.tsx)

```typescript
'use client';

import { ClerkProvider as ClerkProviderBase } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import * as Sentry from '@sentry/nextjs';
import { Redis } from '@upstash/redis';

// Initialize Redis client for session management
export const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProviderBase
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#3B82F6',
          colorBackground: '#1F2937',
          borderRadius: '0.5rem',
        },
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
          card: 'shadow-xl',
        },
      }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/onboarding"
      afterSignOutUrl="/"
      afterSwitchSessionUrl="/dashboard"
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      clerkJSUrl="https://clerk.caregiverapp.com/npm/@clerk/clerk-js@5.7.1/dist/clerk.browser.js"
      navigate={(to) => window.location.href = to}
      // Custom session cache implementation with Redis
      sessionCache={{
        async get(key) {
          try {
            const data = await redis.get(`clerk:session:${key}`);
            return data ? JSON.parse(data as string) : null;
          } catch (error) {
            Sentry.captureException(error);
            return null;
          }
        },
        async set(key, value) {
          try {
            await redis.set(
              `clerk:session:${key}`,
              JSON.stringify(value),
              { ex: 60 * 60 } // 1 hour TTL
            );
          } catch (error) {
            Sentry.captureException(error);
          }
        },
        async remove(key) {
          try {
            await redis.del(`clerk:session:${key}`);
          } catch (error) {
            Sentry.captureException(error);
          }
        },
      }}
    >
      {children}
    </ClerkProviderBase>
  );
}
```

### 2. Rate Limiting Middleware with Redis (/lib/rate-limit.ts)

```typescript
import { Redis } from "@upstash/redis";
import { RateLimiter } from "rate-limiter-flexible";

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

// Rate limiter for authentication endpoints
export const authRateLimiter = new RateLimiter({
  storeClient: redis,
  keyPrefix: "auth_rate_limit",
  points: 5, // 5 requests
  duration: 60, // per 60 seconds
  blockDuration: 300, // Block for 5 minutes if limit exceeded
});

// Rate limiter for password reset
export const passwordResetLimiter = new RateLimiter({
  storeClient: redis,
  keyPrefix: "password_reset_limit",
  points: 3, // 3 requests
  duration: 3600, // per hour
  blockDuration: 3600, // Block for 1 hour if limit exceeded
});

// Middleware to apply rate limiting
export async function rateLimit(
  req: Request,
  key: string,
  limiter: RateLimiter,
) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const cacheKey = `${key}:${ip}`;

  try {
    await limiter.consume(cacheKey);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "Too many requests",
      retryAfter: error.msBeforeNext / 1000,
    };
  }
}
```

### 3. Middleware Configuration with Enhanced Security (/middleware.ts)

```typescript
import { authMiddleware, redirectToSignIn } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { authRateLimiter, rateLimit } from '@/lib/rate-limit';

// List of protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/billing',
  '/api/trpc',
];

// List of public routes that don't require authentication
const publicRoutes = [
  '/',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/api/webhooks/clerk',
];

export default authMiddleware({
  // Allow signed out users to access public routes
  publicRoutes: (req) => {
    const { pathname } = req.nextUrl;
    return publicRoutes.some(route =>
      pathname === route ||
      pathname.startsWith(`${route}/`) ||
      pathname.startsWith('/_next') ||
      pathname.endsWith('.js') ||
      pathname.endsWith('.css') ||
      pathname.endsWith('.svg') ||
      pathname.endsWith('.png') ||
      pathname.endsWith('.jpg') ||
      pathname.endsWith('.jpeg') ||
      pathname.endsWith('.gif') ||
      pathname.endsWith('.ico')
    );
  },
    '/',
    '/sign-in',
    '/sign-up',
    '/api/webhooks/clerk',
    '/emergency-access',
  ],

  // Routes that require specific permissions
  ignoredRoutes: ['/api/health-check'],

  afterAuth(auth, req) {
    // Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // Handle users without an organization
    if (
      auth.userId &&
      !auth.orgId &&
      req.nextUrl.pathname !== '/org-selection' &&
      req.nextUrl.pathname !== '/create-organization'
    ) {
      const orgSelection = new URL('/org-selection', req.url);
      return NextResponse.redirect(orgSelection);
    }

    // Check role-based access for sensitive routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (auth.orgRole !== 'admin' && auth.orgRole !== 'owner') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Check for completed onboarding
    if (
      auth.userId &&
      !auth.sessionClaims?.onboardingComplete &&
      req.nextUrl.pathname !== '/onboarding'
    ) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }
  },
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

### 3. Sign In Page (/app/sign-in/[[...sign-in]]/page.tsx)

```typescript
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome Back
          </h1>
          <p className="mt-2 text-gray-600">
            Sign in to manage your caregiving tasks
          </p>
        </div>

        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-2xl',
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
        />

        <div className="mt-4 text-center">
          <a
            href="/emergency-access"
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Emergency Access →
          </a>
        </div>
      </div>
    </div>
  );
}
```

### 4. Sign Up Page (/app/sign-up/[[...sign-up]]/page.tsx)

```typescript
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Start Your Care Journey
          </h1>
          <p className="mt-2 text-gray-600">
            Create an account to begin managing care together
          </p>
        </div>

        <SignUp
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-2xl',
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/onboarding"
          unsafeMetadata={{
            careRole: 'primary_caregiver',
            onboardingStep: 'profile',
          }}
        />
      </div>
    </div>
  );
}
```

### 5. Organization Selection (/app/org-selection/page.tsx)

```typescript
import { OrganizationList, CreateOrganization } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs';

export default async function OrgSelectionPage() {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">
          Select or Create a Care Team
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Join Existing Team
            </h2>
            <OrganizationList
              afterSelectOrganizationUrl="/dashboard"
              appearance={{
                elements: {
                  organizationPreview: 'border-2 hover:border-blue-500',
                },
              }}
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">
              Create New Team
            </h2>
            <CreateOrganization
              afterCreateOrganizationUrl="/onboarding"
              appearance={{
                elements: {
                  rootBox: 'w-full',
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 6. User Profile Component (/components/UserProfile.tsx)

```typescript
import { UserButton, useUser, useOrganization } from '@clerk/nextjs';

export function UserProfile() {
  const { user } = useUser();
  const { organization, membership } = useOrganization();

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: 'w-10 h-10',
          },
        }}
        userProfileMode="navigation"
        userProfileUrl="/settings/profile"
      />

      <div className="hidden md:block">
        <p className="text-sm font-medium text-gray-900">
          {user.fullName || user.primaryEmailAddress?.emailAddress}
        </p>
        <p className="text-xs text-gray-500">
          {organization?.name} • {membership?.role}
        </p>
      </div>
    </div>
  );
}
```

### 7. Protected Route Wrapper (/components/ProtectedRoute.tsx)

```typescript
import { useAuth, useOrganization } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'owner' | 'admin' | 'member' | 'viewer';
  requireOrg?: boolean;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requireOrg = true,
}: ProtectedRouteProps) {
  const { isLoaded, userId } = useAuth();
  const { organization, membership } = useOrganization();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!userId) {
    redirect('/sign-in');
  }

  if (requireOrg && !organization) {
    redirect('/org-selection');
  }

  if (requiredRole && membership?.role !== requiredRole) {
    const allowedRoles = {
      owner: ['owner'],
      admin: ['owner', 'admin'],
      member: ['owner', 'admin', 'member'],
      viewer: ['owner', 'admin', 'member', 'viewer'],
    };

    if (!allowedRoles[requiredRole].includes(membership?.role || '')) {
      redirect('/unauthorized');
    }
  }

  return <>{children}</>;
}
```

### 8. Webhook Handler (/app/api/webhooks/clerk/route.ts)

```typescript
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET");
  }

  // Get headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  // Handle different event types
  const eventType = evt.type;

  switch (eventType) {
    case "user.created":
      await handleUserCreated(evt.data);
      break;

    case "user.updated":
      await handleUserUpdated(evt.data);
      break;

    case "organizationMembership.created":
      await handleOrgMembershipCreated(evt.data);
      break;

    case "organization.created":
      await handleOrganizationCreated(evt.data);
      break;

    default:
      console.log(`Unhandled event type: ${eventType}`);
  }

  return new Response("Webhook processed", { status: 200 });
}

async function handleUserCreated(data: any) {
  const { id, email_addresses, first_name, last_name } = data;

  // Create user in Supabase
  const { error } = await supabase.from("users").insert({
    clerk_id: id,
    email: email_addresses[0].email_address,
    full_name: `${first_name} ${last_name}`.trim(),
    role: "primary_caregiver",
  });

  if (error) {
    console.error("Error creating user in Supabase:", error);
  }
}

async function handleOrganizationCreated(data: any) {
  const { id, name, created_by } = data;

  // Create organization in Supabase
  const { error } = await supabase.from("organizations").insert({
    clerk_id: id,
    name: name,
    created_by: created_by,
  });

  if (error) {
    console.error("Error creating organization:", error);
  }
}
```

### 9. Auth Utilities (/lib/auth.ts)

```typescript
import { auth, currentUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

export async function getAuthenticatedUser() {
  const user = await currentUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  return {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress,
    name: `${user.firstName} ${user.lastName}`.trim(),
    imageUrl: user.imageUrl,
  };
}

export async function getUserOrganizations() {
  const { userId, orgId } = auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data, error } = await supabase
    .from("organization_members")
    .select("*, organizations(*)")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return data;
}

export function hasPermission(
  userRole: string,
  requiredPermission: string,
): boolean {
  const permissions = {
    owner: ["read", "write", "delete", "admin"],
    admin: ["read", "write", "delete"],
    member: ["read", "write"],
    viewer: ["read"],
  };

  return (
    permissions[userRole as keyof typeof permissions]?.includes(
      requiredPermission,
    ) || false
  );
}
```

### 10. Enhanced Emergency Access with Rate Limiting and Audit Logging (/app/emergency-access/page.tsx)

```typescript
'use client';

import { SignIn } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authRateLimiter } from '@/lib/rate-limit';
import * as Sentry from '@sentry/nextjs';

export default function EmergencyAccessPage() {
  const router = useRouter();
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  // Check rate limiting on mount
  useEffect(() => {
    const checkRateLimit = async () => {
      try {
        const ip = await fetch('/api/ip').then(res => res.json());
        const result = await authRateLimiter.get(`emergency:${ip.ip}`);

        if (result && result.remainingPoints <= 0) {
          setIsRateLimited(true);
          setRemainingTime(Math.ceil(result.msBeforeNext / 1000));

          const timer = setInterval(() => {
            setRemainingTime(prev => {
              if (prev <= 1) {
                clearInterval(timer);
                setIsRateLimited(false);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(timer);
        }
      } catch (error) {
        console.error('Error checking rate limit:', error);
        Sentry.captureException(error);
      }
    };

    checkRateLimit();
  }, []);

  const handleSuccess = () => {
    // Log successful emergency access
    Sentry.captureMessage('Emergency access granted', {
      level: 'info',
      tags: { type: 'emergency_access' },
    });

    // Redirect to emergency dashboard
    router.push('/emergency/dashboard');
  };

  if (isRateLimited) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-red-600">Access Temporarily Restricted</h1>
            <p className="mb-6 text-gray-600">
              Too many login attempts. Please try again in {remainingTime} seconds.
            </p>
            <p className="text-sm text-gray-500">
              For immediate assistance, please contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-red-600">Emergency Access</h1>
          <p className="mt-2 text-gray-600">
            Restricted access for authorized personnel only
          </p>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-lg">
          <SignIn
            path="/emergency-access"
            routing="path"
            signUpUrl="/sign-up"
            afterSignInUrl="/emergency/dashboard"
            afterSignUpUrl="/emergency/setup"
            onSuccess={handleSuccess}
            appearance={{
              elements: {
                card: 'shadow-none',
                headerTitle: 'text-red-600',
                headerSubtitle: 'text-gray-600',
                socialButtonsBlockButton: 'border-gray-300 hover:bg-gray-50',
                formFieldInput: 'border-gray-300 focus:ring-2 focus:ring-red-500',
                formButtonPrimary: 'bg-red-600 hover:bg-red-700',
                footerActionLink: 'text-red-600 hover:text-red-800',
              },
            }}
          />
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>All access is logged and monitored.</p>
          <p>Unauthorized access is prohibited.</p>
        </div>
      </div>
    </div>
  );
}
```

```typescript
import { SignIn } from '@clerk/nextjs';

export default function EmergencyAccessPage() {
  return (
    <div className="min-h-screen bg-red-50 py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-red-600">
              Emergency Access
            </h1>
            <p className="mt-2 text-gray-600">
              Quick access to critical care information
            </p>
          </div>

          <SignIn
            appearance={{
              elements: {
                rootBox: 'emergency-signin',
                formButtonPrimary: 'bg-red-600 hover:bg-red-700',
              },
            }}
            redirectUrl="/emergency/dashboard"
          />

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Emergency access provides read-only
              access to critical health information. Full access requires
              standard sign-in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Task Checklist

### Initial Setup

- [ ] Install Clerk packages
- [ ] Configure environment variables
- [ ] Set up Clerk dashboard with app settings
- [ ] Configure OAuth providers (Google, Apple)
- [ ] Set up organization features in Clerk

### Authentication Pages

- [ ] Create sign-in page with Clerk components
- [ ] Create sign-up page with onboarding flow
- [ ] Implement organization selection page
- [ ] Build emergency access mode
- [ ] Add password reset flow

### Middleware & Protection

- [ ] Configure authMiddleware in middleware.ts
- [ ] Set up public and protected routes
- [ ] Implement role-based route protection
- [ ] Add organization-based access control
- [ ] Handle unauthorized access redirects

### User Management

- [ ] Create UserProfile component
- [ ] Implement UserButton integration
- [ ] Build organization member management
- [ ] Add invitation system for family members
- [ ] Create role assignment interface

### Webhook Integration

- [ ] Set up Clerk webhook endpoint
- [ ] Implement user creation sync with Supabase
- [ ] Handle organization lifecycle events
- [ ] Sync membership changes
- [ ] Add webhook signature verification

### Session Management

- [ ] Configure session duration settings
- [ ] Implement remember me functionality
- [ ] Add device management interface
- [ ] Create session activity logging
- [ ] Handle concurrent session limits

## Validation Loop

### Level 1: Authentication Flow

```bash
# Test sign-up flow
npm run test:auth:signup

# Test sign-in flow
npm run test:auth:signin

# Test OAuth providers
npm run test:auth:oauth
```

### Level 2: Authorization Testing

```bash
# Test role-based access
npm run test:rbac

# Test organization isolation
npm run test:org-isolation

# Test permission checks
npm run test:permissions
```

### Level 3: Integration Testing

```bash
# Test Clerk-Supabase sync
npm run test:webhook-sync

# Test middleware protection
npm run test:middleware

# Test emergency access
npm run test:emergency-access
```

### Level 4: Security Audit

```bash
# Run security scan
npm audit

# Test session security
npm run test:session-security

# Verify CSRF protection
npm run test:csrf

# Check for auth bypasses
npm run test:auth-bypass
```

## Success Criteria

- [ ] Users can sign up in < 30 seconds
- [ ] OAuth login works with Google and Apple
- [ ] Organization members see only their data
- [ ] Role-based permissions properly enforced
- [ ] Webhook sync maintains data consistency
- [ ] Emergency access provides read-only view

## Common Gotchas

- Clerk session tokens expire - implement refresh logic
- Organization switching requires clearing local state
- Webhook retries can cause duplicate records
- Development keys don't support all production features
- Custom claims need to be configured in Clerk dashboard
- Rate limits apply to authentication attempts
