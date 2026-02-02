# Services in AI Coder Stack

**Last Updated:** 2025-10-23

This directory contains comprehensive documentation for all third-party services integrated with AI Coder.

## Service Categories

### 🤖 AI & LLM Integration
- **[Vercel AI SDK](./vercel-ai-sdk.md)** - Core LLM integration layer (Service #2)

### 🎤 Voice & Speech
- **[Deepgram](./deepgram.md)** - Speech-to-text and text-to-speech AI

### 📧 Email & Communications
- **[Resend](./resend.md)** - Modern email API for transactional emails
- **[Twilio](./twilio.md)** - Programmable voice, SMS, and video communications

### ⚙️ Workflow & Automation
- **[Inngest](./inngest.md)** - Background job processing and workflow automation
- **[Vercel Cron](./vercel-cron.md)** - Scheduled task execution

### 🔒 Security & Protection
- **[Arcjet](./arcjet.md)** - Application security (rate limiting, bot detection, DDoS protection)

### 💾 Databases & Storage
- **[Upstash Redis](./upstash-redis.md)** - Serverless Redis database
- **[Upstash Vector](./upstash-vector.md)** - Vector database for AI/RAG applications
- **[Upstash QStash](./upstash-qstash.md)** - Message queue and task scheduling
- **[Supabase](./supabase.md)** - PostgreSQL database with real-time features
- **[Vercel Blob](./vercel-blob.md)** - File storage

### 🎥 Media & Content
- **[Mux](./mux.md)** - Video hosting and streaming
- **[fal.ai](./fal-ai.md)** - AI image and video generation
- **[Sanity](./sanity.md)** - Headless CMS

### 🤝 Collaboration
- **[Liveblocks](./liveblocks.md)** - Real-time collaboration features

### 💳 Payments
- **[Stripe](./stripe.md)** - Payment processing and billing

### 🔐 Authentication
- **[Clerk](./clerk.md)** - User authentication and management

### 📊 Monitoring & Analytics
- **[Sentry](./sentry.md)** - Error tracking and performance monitoring

### 🐙 Development Tools
- **[GitHub](./github.md)** - Version control and CI/CD integration

---

## Quick Integration Guides

### For SaaS Applications
1. **Authentication:** [Clerk](./clerk.md)
2. **Database:** [Supabase](./supabase.md) or [Upstash Redis](./upstash-redis.md)
3. **Payments:** [Stripe](./stripe.md)
4. **Email:** [Resend](./resend.md)
5. **Background Jobs:** [Inngest](./inngest.md)
6. **Security:** [Arcjet](./arcjet.md)
7. **Monitoring:** [Sentry](./sentry.md)

### For AI Applications
1. **LLM Integration:** [Vercel AI SDK](./vercel-ai-sdk.md)
2. **Vector Database:** [Upstash Vector](./upstash-vector.md)
3. **AI Media:** [fal.ai](./fal-ai.md)
4. **Caching:** [Upstash Redis](./upstash-redis.md)
5. **Background Processing:** [Inngest](./inngest.md)

### For Voice-Enabled Apps
1. **LLM Integration:** [Vercel AI SDK](./vercel-ai-sdk.md)
2. **Speech Processing:** [Deepgram](./deepgram.md)
3. **Telephony:** [Twilio](./twilio.md)
4. **Database:** [Supabase](./supabase.md)
5. **Caching:** [Upstash Redis](./upstash-redis.md)

### For Content Platforms
1. **CMS:** [Sanity](./sanity.md)
2. **Media Storage:** [Vercel Blob](./vercel-blob.md) or [Mux](./mux.md)
3. **Image Delivery:** [fal.ai](./fal-ai.md)

### For Collaborative Apps
1. **Real-time Features:** [Liveblocks](./liveblocks.md)
2. **Database:** [Supabase](./supabase.md)
3. **Authentication:** [Clerk](./clerk.md)

---

## Usage with AI Coder

All services are documented with:
- ✅ Setup instructions
- ✅ Environment variables
- ✅ Code examples
- ✅ Integration with Next.js
- ✅ Best practices
- ✅ Cost estimates

### Using Context7 for Documentation

When working with these services in Claude Code, you can request up-to-date documentation using:

```
"Implement [feature] using [service]. use context7"
```

Example:
```
"Create a Next.js API route that sends emails using Resend. use context7"
```

---

## Environment Variables Template

Create a `.env.local` file with the following variables (add as needed):

```bash
# Database & Auth (Supabase)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Email (Resend)
RESEND_API_KEY=

# Payments (Stripe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Security (Arcjet)
ARCJET_KEY=

# Upstash Services
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
UPSTASH_VECTOR_REST_URL=
UPSTASH_VECTOR_REST_TOKEN=
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=

# Workflow (Inngest)
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Media (Mux)
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=

# AI Media (fal.ai)
FAL_KEY=

# CMS (Sanity)
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
SANITY_API_TOKEN=

# Collaboration (Liveblocks)
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=
LIVEBLOCKS_SECRET_KEY=

# Monitoring (Sentry)
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Storage (Vercel)
BLOB_READ_WRITE_TOKEN=

# AI & LLM (Vercel AI SDK)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=

# Voice & Speech (Deepgram)
DEEPGRAM_API_KEY=

# Telephony (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

---

## Next Steps

1. Browse the service documentation
2. Choose services for your project
3. Set up environment variables
4. Follow integration guides
5. Use Context7 for real-time assistance

For template-specific service integrations, see:
- [Template Catalog](../templates/vercel-templates-catalog.md)
- [Using Templates Guide](../guides/using-actual-templates.md)
