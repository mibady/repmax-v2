# Deployment & DevOps PRP - Caregiving Companion

## Goal

Establish a secure, scalable, and observable deployment pipeline for the Caregiving Companion app, leveraging Redis Cloud, Retell AI, and enhanced monitoring with Sentry across all environments.

## Why

- **Reliability**: Ensure 99.9% uptime for critical caregiving features
- **Security**: Maintain HIPAA compliance with encrypted data and secure access controls
- **Scalability**: Handle variable loads with Redis Cloud and serverless architecture
- **Observability**: Comprehensive monitoring with Sentry and Vercel Analytics
- **Reproducibility**: Infrastructure as Code (IaC) for consistent environments

## What (User-Visible Behavior)

- **Zero Downtime Deployments**: Seamless updates with Vercel's deployment pipeline
- **Global Performance**: <1.5s page loads with Edge Network and Redis caching
- **Real-time Monitoring**: Instant alerts for system issues and performance degradation
- **Secure Data Handling**: End-to-end encryption for all PHI and PII
- **Automated Recovery**: Self-healing infrastructure with automated rollbacks

## All Needed Context

### Documentation References

- **Vercel**: https://vercel.com/docs
- **Supabase Production**: https://supabase.com/docs/guides/platform/going-to-prod
- **Redis Cloud**: https://redis.io/docs/cloud/
- **Retell AI**: https://docs.retellai.com/
- **Sentry for Next.js**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **GitHub Actions**: https://docs.github.com/en/actions
- **Terraform**: https://developer.hashicorp.com/terraform/docs

### Infrastructure Stack

- **Frontend**: Vercel (Global Edge Network)
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **AI & Voice**: Claude AI + Retell AI (Voice/SMS)
- **Caching & Queues**: Redis Cloud (Fully Managed)
- **Email**: Resend (Transactional Emails)
- **Monitoring**: Sentry (Error Tracking) + Vercel Analytics
- **CI/CD**: GitHub Actions
- **Security**: Clerk (Auth), Supabase RLS, Vercel Security Headers
- **Backup**: Supabase PITR + S3 (Encrypted)

### Environment Requirements

```env
# Core Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://caregivingcompanion.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Redis Cloud
REDIS_URL=rediss://default:password@redis-host:port
REDIS_PASSWORD=your-secure-password
REDIS_TLS={}

# AI & Voice
ANTHROPIC_API_KEY=sk-ant-api03-...
RETELL_API_KEY=rt_...
RETELL_AGENT_ID=agent_...
RETELL_FROM_NUMBER=+15551234567

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@caregivingcompanion.com

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=...
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=...

# Security (GitHub Secrets)
ENCRYPTION_KEY=...
SESSION_SECRET=...
```

### Critical Implementation Notes

#### Security & Compliance

- **Secrets Management**:
  - Store all secrets in GitHub Secrets
  - Rotate API keys quarterly or per security policy
  - Use Vercel Environment Variables with production protection

#### Infrastructure

- **Redis Cloud**:
  - Enable persistence with AOF (Append Only File)
  - Configure memory limits and eviction policies
  - Set up alerts for memory usage >80%
  - Enable TLS for all connections

- **Retell AI**:
  - Implement call recording consent flows
  - Store call metadata only (no PHI in logs)
  - Set up usage alerts to prevent unexpected costs

#### Monitoring & Observability

- **Sentry Setup**:

  ```typescript
  // sentry.client.config.js
  import * as Sentry from "@sentry/nextjs";

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
    attachStacktrace: true,
    autoSessionTracking: true,
  });
  ```

- **Vercel Analytics**:
  - Track core web vitals
  - Monitor API route performance
  - Set up custom events for critical user flows

#### Performance

- **Redis Optimization**:
  - Use pipelining for batch operations
  - Implement connection pooling
  - Cache frequently accessed data with appropriate TTL

- **Edge Config**:
  - Use Vercel Edge Config for feature flags
  - Implement regional caching for global performance

## Implementation Blueprint

### 1. GitHub Actions CI/CD Pipeline (/.github/workflows/deploy.yml)

```yaml
name: Deploy Caregiving Companion

on:
  push:
    branches: [main, development]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run type-check

      - name: Run unit tests
        run: npm test -- --coverage --watchAll=false
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379

      - name: Run integration tests
        run: npm run test:integration
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379

      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run security audit
        run: npm audit --audit-level high

      - name: Scan for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          head: HEAD

      - name: SAST scan
        uses: github/codeql-action/init@v2
        with:
          languages: typescript, javascript

      - name: Perform CodeQL analysis
        uses: github/codeql-action/analyze@v2

  deploy-staging:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/development'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Install Vercel CLI
        run: npm install --global vercel@canary

      - name: Pull Vercel environment information
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to staging
        run: vercel deploy --token=${{ secrets.VERCEL_TOKEN }}

      - name: Run E2E tests against staging
        run: npm run test:e2e:staging
        env:
          STAGING_URL: ${{ steps.deploy.outputs.url }}

  deploy-production:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Install Vercel CLI
        run: npm install --global vercel@canary

      - name: Pull Vercel environment information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to production
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Run smoke tests
        run: npm run test:smoke:production
        env:
          PRODUCTION_URL: https://caregivingcompanion.com

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: "#deployments"
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 2. Vercel Configuration (/vercel.json)

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "regions": ["iad1", "sfo1", "lhr1"],
  "functions": {
    "app/api/**/*.js": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/health",
      "destination": "/health/overview",
      "permanent": false
    }
  ],
  "rewrites": [
    {
      "source": "/api/health-check",
      "destination": "/api/monitoring/health"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "build": {
    "env": {
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  }
}
```

### 3. Health Check API (/app/api/monitoring/health/route.ts)

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Redis from "ioredis";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const redis = new Redis(process.env.REDIS_URL!);

interface HealthCheck {
  service: string;
  status: "healthy" | "unhealthy" | "degraded";
  responseTime: number;
  details?: any;
}

export async function GET() {
  const startTime = Date.now();
  const checks: HealthCheck[] = [];

  // Database health check
  try {
    const dbStart = Date.now();
    const { data, error } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    checks.push({
      service: "database",
      status: error ? "unhealthy" : "healthy",
      responseTime: Date.now() - dbStart,
      details: error ? { error: error.message } : { connected: true },
    });
  } catch (error) {
    checks.push({
      service: "database",
      status: "unhealthy",
      responseTime: Date.now() - startTime,
      details: { error: error.message },
    });
  }

  // Redis health check
  try {
    const redisStart = Date.now();
    await redis.ping();

    checks.push({
      service: "redis",
      status: "healthy",
      responseTime: Date.now() - redisStart,
      details: { connected: true },
    });
  } catch (error) {
    checks.push({
      service: "redis",
      status: "unhealthy",
      responseTime: Date.now() - redisStart,
      details: { error: error.message },
    });
  }

  // Claude AI health check
  try {
    const aiStart = Date.now();
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 10,
        messages: [{ role: "user", content: "health check" }],
      }),
    });

    checks.push({
      service: "claude_ai",
      status: response.ok ? "healthy" : "unhealthy",
      responseTime: Date.now() - aiStart,
      details: { status: response.status },
    });
  } catch (error) {
    checks.push({
      service: "claude_ai",
      status: "unhealthy",
      responseTime: Date.now() - startTime,
      details: { error: error.message },
    });
  }

  // 11Labs TTS health check
  try {
    const ttsStart = Date.now();
    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      },
    });

    checks.push({
      service: "elevenlabs",
      status: response.ok ? "healthy" : "unhealthy",
      responseTime: Date.now() - ttsStart,
      details: { status: response.status },
    });
  } catch (error) {
    checks.push({
      service: "elevenlabs",
      status: "unhealthy",
      responseTime: Date.now() - startTime,
      details: { error: error.message },
    });
  }

  // Overall system health
  const allHealthy = checks.every((check) => check.status === "healthy");
  const anyUnhealthy = checks.some((check) => check.status === "unhealthy");

  const overallStatus = allHealthy
    ? "healthy"
    : anyUnhealthy
      ? "unhealthy"
      : "degraded";
  const totalResponseTime = Date.now() - startTime;

  const healthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    responseTime: totalResponseTime,
    version: process.env.VERCEL_GIT_COMMIT_SHA || "unknown",
    environment: process.env.NODE_ENV,
    services: checks,
  };

  const statusCode = overallStatus === "healthy" ? 200 : 503;

  return NextResponse.json(healthStatus, { status: statusCode });
}
```

### 4. Error Tracking with Sentry (/lib/monitoring/sentry.ts)

```typescript
import * as Sentry from "@sentry/nextjs";

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    integrations: [
      new Sentry.BrowserTracing({
        // Performance monitoring for Core Web Vitals
        trackInteractions: true,
      }),
    ],
    beforeSend(event, hint) {
      // Filter out sensitive data for HIPAA compliance
      if (event.request?.headers) {
        delete event.request.headers["authorization"];
        delete event.request.headers["cookie"];
      }

      // Remove sensitive URL parameters
      if (event.request?.url) {
        const url = new URL(event.request.url);
        url.searchParams.delete("token");
        url.searchParams.delete("api_key");
        event.request.url = url.toString();
      }

      return event;
    },
    beforeBreadcrumb(breadcrumb) {
      // Filter out sensitive breadcrumbs
      if (
        breadcrumb.category === "console" &&
        breadcrumb.message?.includes("password")
      ) {
        return null;
      }
      return breadcrumb;
    },
  });
}

export function trackError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    tags: {
      section: "caregiving-app",
    },
    extra: context,
  });
}

export function trackPerformance(
  name: string,
  duration: number,
  metadata?: Record<string, any>,
) {
  Sentry.addBreadcrumb({
    category: "performance",
    message: `${name} took ${duration}ms`,
    level: "info",
    data: metadata,
  });
}
```

### 5. Performance Monitoring (/lib/monitoring/performance.ts)

```typescript
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!this.instance) {
      this.instance = new PerformanceMonitor();
    }
    return this.instance;
  }

  init() {
    if (typeof window === "undefined") return;

    // Core Web Vitals monitoring
    this.observeCoreWebVitals();

    // API call monitoring
    this.observeApiCalls();

    // User interaction monitoring
    this.observeUserInteractions();
  }

  private observeCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lcpEntry = entries[entries.length - 1];

      this.reportMetric("LCP", lcpEntry.startTime, {
        url: window.location.pathname,
        element: lcpEntry.element?.tagName,
      });
    });

    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
    this.observers.push(lcpObserver);

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.reportMetric("FID", entry.processingStart - entry.startTime, {
          url: window.location.pathname,
          eventType: (entry as any).name,
        });
      });
    });

    fidObserver.observe({ type: "first-input", buffered: true });
    this.observers.push(fidObserver);

    // Cumulative Layout Shift (CLS)
    let clsScore = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          clsScore += (entry as any).value;
        }
      });

      this.reportMetric("CLS", clsScore, {
        url: window.location.pathname,
      });
    });

    clsObserver.observe({ type: "layout-shift", buffered: true });
    this.observers.push(clsObserver);
  }

  private observeApiCalls() {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0] as string;

      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;

        this.reportMetric("API_CALL", duration, {
          url: url.replace(/\/api\/.*\/([^\/]+)$/, "/api/.../***"), // Anonymize IDs
          status: response.status,
          method: args[1]?.method || "GET",
        });

        return response;
      } catch (error) {
        const duration = performance.now() - startTime;

        this.reportMetric("API_ERROR", duration, {
          url: url.replace(/\/api\/.*\/([^\/]+)$/, "/api/.../***"),
          error: error.message,
        });

        throw error;
      }
    };
  }

  private observeUserInteractions() {
    // Track navigation timing
    const navigationObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.reportMetric("NAVIGATION", entry.duration, {
          from: entry.name,
          to: window.location.pathname,
        });
      });
    });

    navigationObserver.observe({ type: "navigation", buffered: true });
    this.observers.push(navigationObserver);

    // Track long tasks
    const longTaskObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.reportMetric("LONG_TASK", entry.duration, {
          url: window.location.pathname,
        });
      });
    });

    longTaskObserver.observe({ type: "longtask", buffered: true });
    this.observers.push(longTaskObserver);
  }

  private reportMetric(
    name: string,
    value: number,
    metadata?: Record<string, any>,
  ) {
    // Send to analytics service
    if (process.env.NODE_ENV === "production") {
      fetch("/api/analytics/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metric: name,
          value,
          timestamp: Date.now(),
          metadata,
        }),
      }).catch(console.error);
    }
  }

  cleanup() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}
```

### 6. Database Migrations (/scripts/migrate.js)

```javascript
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function runMigrations() {
  try {
    console.log("Starting database migrations...");

    // Get migration files
    const migrationsDir = path.join(__dirname, "../supabase/migrations");
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    // Check for existing migrations table
    const { data: migrationsTable } = await supabase
      .from("schema_migrations")
      .select("version")
      .order("version", { ascending: false })
      .limit(1);

    const lastMigration = migrationsTable?.[0]?.version || "0";

    // Run pending migrations
    for (const file of migrationFiles) {
      const version = file.split("_")[0];

      if (version > lastMigration) {
        console.log(`Running migration: ${file}`);

        const migrationSQL = fs.readFileSync(
          path.join(migrationsDir, file),
          "utf8",
        );

        // Execute migration
        const { error } = await supabase.rpc("exec_sql", {
          sql: migrationSQL,
        });

        if (error) {
          throw new Error(`Migration ${file} failed: ${error.message}`);
        }

        // Record successful migration
        await supabase
          .from("schema_migrations")
          .insert({ version, filename: file });

        console.log(`✓ Migration ${file} completed`);
      }
    }

    console.log("All migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
```

### 7. Docker Configuration (/Dockerfile)

```dockerfile
# Multi-stage build for production optimization
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 8. Backup Strategy Script (/scripts/backup.js)

```javascript
const { createClient } = require("@supabase/supabase-js");
const AWS = require("aws-sdk");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

async function createBackup() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    console.log("Starting backup process...");

    // Backup critical tables
    const tables = [
      "users",
      "organizations",
      "care_recipients",
      "health_records",
      "medications",
      "appointments",
      "bills",
      "documents",
      "notifications",
    ];

    for (const table of tables) {
      console.log(`Backing up table: ${table}`);

      const { data, error } = await supabase.from(table).select("*");

      if (error) {
        throw new Error(`Failed to backup ${table}: ${error.message}`);
      }

      // Upload to S3
      const key = `backups/${timestamp}/${table}.json`;
      await s3
        .upload({
          Bucket: process.env.BACKUP_S3_BUCKET,
          Key: key,
          Body: JSON.stringify(data, null, 2),
          ContentType: "application/json",
          ServerSideEncryption: "AES256",
        })
        .promise();

      console.log(`✓ ${table} backed up to S3: ${key}`);
    }

    // Create backup manifest
    const manifest = {
      timestamp,
      tables: tables.length,
      created_at: new Date().toISOString(),
      version: process.env.APP_VERSION || "unknown",
    };

    await s3
      .upload({
        Bucket: process.env.BACKUP_S3_BUCKET,
        Key: `backups/${timestamp}/manifest.json`,
        Body: JSON.stringify(manifest, null, 2),
        ContentType: "application/json",
        ServerSideEncryption: "AES256",
      })
      .promise();

    console.log("Backup completed successfully");

    // Cleanup old backups (keep last 30 days)
    await cleanupOldBackups();
  } catch (error) {
    console.error("Backup failed:", error);

    // Send alert notification
    await sendBackupAlert(error.message);

    process.exit(1);
  }
}

async function cleanupOldBackups() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const objects = await s3
    .listObjectsV2({
      Bucket: process.env.BACKUP_S3_BUCKET,
      Prefix: "backups/",
    })
    .promise();

  const oldObjects = objects.Contents?.filter(
    (obj) => obj.LastModified && obj.LastModified < thirtyDaysAgo,
  );

  if (oldObjects && oldObjects.length > 0) {
    await s3
      .deleteObjects({
        Bucket: process.env.BACKUP_S3_BUCKET,
        Delete: {
          Objects: oldObjects.map((obj) => ({ Key: obj.Key })),
        },
      })
      .promise();

    console.log(`Cleaned up ${oldObjects.length} old backup files`);
  }
}

// Run backup if called directly
if (require.main === module) {
  createBackup();
}

module.exports = { createBackup };
```

## Git Workflow & Branching Strategy

### Branch Structure

```
main (production)
├── development (staging)
│   ├── feature/voice-integration
│   ├── feature/autonomous-agent
│   ├── feature/cal-integration
│   └── feature/[feature-name]
├── hotfix/[urgent-fix]
└── release/[version]
```

### Development Workflow

#### 1. Feature Development (Using Git Worktrees)

```bash
# Create worktree for new feature
git worktree add -b feature/voice-integration ../caregiving-voice development

# Navigate to worktree
cd ../caregiving-voice

# Work on feature
git add .
git commit -m "feat(voice): implement Retell AI integration"

# Push feature branch
git push -u origin feature/voice-integration

# Create PR to development
gh pr create --base development --title "Voice Integration" --body "..."
```

#### 2. Multi-Feature Parallel Development

```bash
# Set up multiple worktrees for parallel work
git worktree add -b feature/health-module ../caregiving-health development
git worktree add -b feature/task-management ../caregiving-tasks development
git worktree add -b feature/finance-tracking ../caregiving-finance development

# List all worktrees
git worktree list

# Remove worktree after feature merge
git worktree remove ../caregiving-health
```

#### 3. Merge Strategy

```bash
# Feature → Development (via PR with review)
gh pr create --base development --head feature/voice-integration

# Development → Main (after testing)
gh pr create --base main --head development --title "Release v1.2.0"

# Hotfix → Main & Development
git checkout -b hotfix/critical-fix main
# ... make fixes ...
git push origin hotfix/critical-fix
gh pr create --base main --head hotfix/critical-fix
# After merge to main, also merge to development
gh pr create --base development --head hotfix/critical-fix
```

### Protected Branch Rules

#### Main Branch

- Require PR reviews (2 approvals)
- Require status checks (CI/CD must pass)
- Require branches to be up to date
- Include administrators in restrictions
- Restrict force pushes and deletions

#### Development Branch

- Require PR reviews (1 approval)
- Require status checks (tests must pass)
- Automatically delete head branches after merge

### Commit Convention

```bash
# Format: type(scope): description
feat(auth): add Clerk authentication
fix(chat): resolve message ordering issue
docs(api): update endpoint documentation
style(ui): format button components
refactor(db): optimize query performance
test(health): add medication tracking tests
chore(deps): update dependencies
```

### Release Process

```bash
# 1. Create release branch from development
git checkout -b release/v1.2.0 development

# 2. Bump version
npm version minor

# 3. Update changelog
echo "## v1.2.0 - $(date +%Y-%m-%d)" >> CHANGELOG.md
git add . && git commit -m "chore(release): prepare v1.2.0"

# 4. Create PR to main
gh pr create --base main --head release/v1.2.0 \
  --title "Release v1.2.0" \
  --body "$(cat CHANGELOG.md | head -20)"

# 5. After merge, tag release
git checkout main
git pull
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin v1.2.0

# 6. Merge back to development
gh pr create --base development --head main \
  --title "Merge release v1.2.0 back to development"
```

### GitHub Actions Integration

```yaml
# .github/workflows/pr-checks.yml
name: PR Checks
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check branch naming
        run: |
          BRANCH=${GITHUB_HEAD_REF}
          if ! [[ "$BRANCH" =~ ^(feature|fix|hotfix|release)/[a-z0-9-]+$ ]]; then
            echo "Branch name must follow pattern: type/description"
            exit 1
          fi

      - name: Check commit messages
        uses: wagoid/commitlint-github-action@v5

      - name: Run tests
        run: npm test

      - name: Check code coverage
        run: npm run test:coverage
```

### Environment Promotion

```bash
# Development → Staging
git checkout development
npm run deploy:staging

# Staging → Production (after QA)
git checkout main
npm run deploy:production

# Rollback if needed
git revert HEAD
npm run deploy:production
```

### Conflict Resolution Guidelines

1. Always pull latest changes before starting work
2. Rebase feature branches on development regularly
3. Use interactive rebase to clean up commits before PR
4. Resolve conflicts locally, test thoroughly
5. Never force push to shared branches

### Team Collaboration Commands

```bash
# Sync with upstream
git fetch --all --prune

# Update local development branch
git checkout development
git pull origin development

# Rebase feature branch
git checkout feature/your-feature
git rebase development

# Interactive rebase to clean commits
git rebase -i HEAD~3

# Stash changes for branch switch
git stash save "WIP: feature description"
git checkout other-branch
git stash pop
```

## Task Checklist

### CI/CD Pipeline

- [ ] Set up GitHub Actions workflow with testing
- [ ] Configure Vercel deployment with proper environments
- [ ] Implement automated security scanning
- [ ] Add database migration automation
- [ ] Set up automated backup verification

### Monitoring & Observability

- [ ] Configure Sentry for error tracking
- [ ] Set up performance monitoring with Core Web Vitals
- [ ] Implement comprehensive health checks
- [ ] Create alerting for critical failures
- [ ] Set up log aggregation and analysis

### Security Implementation

- [ ] Configure security headers and CSP
- [ ] Set up automated security scanning
- [ ] Implement secrets rotation strategy
- [ ] Configure HIPAA-compliant logging
- [ ] Set up vulnerability management

### Infrastructure as Code

- [ ] Create Terraform configurations for cloud resources
- [ ] Set up environment-specific configurations
- [ ] Implement blue-green deployment strategy
- [ ] Configure auto-scaling policies
- [ ] Set up disaster recovery procedures

### Performance Optimization

- [ ] Configure CDN and edge caching
- [ ] Implement database query optimization
- [ ] Set up image optimization pipeline
- [ ] Configure compression and minification
- [ ] Optimize bundle size and loading

### Backup & Recovery

- [ ] Implement automated daily backups
- [ ] Set up point-in-time recovery
- [ ] Create disaster recovery runbooks
- [ ] Test backup restoration procedures
- [ ] Configure cross-region backup replication

## Validation Loop

### Level 1: Pipeline Testing

```bash
# Test CI/CD pipeline
npm run test:ci
npm run test:security-scan
npm run test:build-production
```

### Level 2: Deployment Testing

```bash
# Test staging deployment
npm run deploy:staging
npm run test:staging-health
npm run test:e2e:staging
```

### Level 3: Production Validation

```bash
# Test production deployment
npm run deploy:production
npm run test:production-health
npm run test:smoke:production
```

### Level 4: Disaster Recovery Testing

```bash
# Test backup and restore
npm run test:backup-restore
npm run test:failover
npm run test:recovery-procedures
```

## Success Criteria

- [ ] Zero-downtime deployments achieved
- [ ] 99.9% uptime SLA maintained
- [ ] Page load times < 2 seconds globally
- [ ] All security scans pass with no critical issues
- [ ] Automated backups complete successfully daily
- [ ] Monitoring alerts trigger within 60 seconds of issues

## Common Gotchas

- Vercel function timeout limits for long-running operations
- Supabase connection limits during high traffic
- Redis memory limits for queue processing
- Environment variable synchronization across deployments
- CORS configuration for API endpoints
- Rate limiting configuration for external APIs
