// PRP Package: The Caregiving Companion - Voice-First Autonomous Agent
//
// IMPORTANT: See PRP-Development-Order.md for the recommended implementation sequence
// This main PRP describes the FULL VISION. Start with Phase 1 (MVP) and build incrementally.

// ---- 1. Unified Agent Architecture ----
// CRITICAL: This is ONE AGENT with a single personality across all channels
// Users always interact with "The Caregiving Companion" - never multiple bots
//
// Core Agent Pipeline:
// Multi-Channel Input ➝ Unified Claude Agent ➝ Tool Execution ➝ Response with Actions ➝ Channel Output
//
// Channels (Same Agent, Different Mediums):
// App Voice ↔️ Phone Call ↔️ SMS ↔️ Chat (Seamless Switching with Full Context)
//
// Unified Agent Components:
// - UnifiedCaregivingCompanion (Single agent brain for ALL interactions)
// - ConversationMemory (One continuous thread across all channels)
// - ChannelAdapters (Voice/SMS/Chat interfaces to the SAME agent)
// - ProactiveEngine (Agent-initiated engagement patterns)
// - EscalationEngine (Intelligent notification → SMS → call escalation)
//
// Tool Framework:
// - bookAppointment (Cal.com integration)
// - sendSMSReminder (Retell AI SMS)
// - checkMedications (Supabase queries)
// - scheduleWellnessCall (Cal.com + Retell)
// - initiatePhoneCall (Channel switching)
// - webSearch (Real-time information)
//
// Server Functions:
// - /api/ai/chat → Enhanced Claude with tool execution
// - /api/webhooks/cal-retell → Cal.com + Retell orchestration
// - /api/voice/outbound → Proactive call initiation
// - /api/escalation → Intelligent escalation management
// - /api/tools/\* → Individual tool endpoints
//
// Core Services:
// - Agent Brain: Claude with Vercel AI SDK tool orchestration
// - Scheduling: Cal.com for appointment and call scheduling
// - Voice/SMS: Retell AI for all voice and SMS communications
// - Email: Resend with intelligent queuing
// - Memory: Redis for conversation persistence and patterns
// - Database: Supabase with real-time subscriptions
// - Monitoring: Sentry for comprehensive tracking
// - Analytics: Vercel Analytics + custom voice metrics

// ---- 2. Next.js App Structure ----
// Pages:
// - / → Landing page
// - /chat → Main conversational interface (chat + voice)
// - /dashboard → Placeholder: health, tasks, finances
// - /api/ai/chat → AI route
// - /api/tts → TTS route
//
// Layout:
// - App Router (Next.js 15)
// - Shared layout.tsx w/ ClerkProvider

// Core Components:
// - ChatWindow.tsx – Uses useChat from Vercel AI SDK with Redis caching
// - VoiceInterface.tsx – Retell AI integration with Redis caching for TTS
// - NotificationCenter.tsx – Unified notifications (in-app, email, SMS)
// - AnalyticsProvider.tsx – Vercel Analytics + Speed Insights
// - ErrorBoundary.tsx – Error tracking with Sentry
// - RedisProvider.tsx – Redis Cloud client wrapper

// ---- 3. Environment Setup ----
// .env.local (required values - NEVER commit this file):

# Core Services

NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication (Clerk)

NEXT*PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test*_
CLERK*SECRET_KEY=sk_test*_
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# AI Services (Anthropic Claude)

ANTHROPIC_API_KEY=sk-ant-\*

# Voice & Communication (Retell AI)

RETELL*API_KEY=rt*_
RETELL*AGENT_ID=agent*_
RETELL_FROM_NUMBER=+1234567890 # Your Twilio/Retell provisioned number

# Email (Resend)

RESEND*API_KEY=re*\*
RESEND_FROM_EMAIL=notifications@yourdomain.com

# Redis Cloud

REDIS_URL=your-redis-url
REDIS_TOKEN=your-redis-token

# Monitoring (Sentry)

NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_ENVIRONMENT=production

# Analytics (Vercel)

NEXT_PUBLIC_VERCEL_ANALYTICS_ID=vercel-analytics-id
NEXT_PUBLIC_VERCEL_URL=your-vercel-url

# Deployment (Vercel)

VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

// ---- 4. Voice & Communication ----
// Voice Interface (Retell AI with Redis Caching):
// - Real-time voice streaming with ultra-low latency (<300ms)
// - Built-in noise cancellation and echo reduction
// - Redis-based TTS response caching
// - Automatic reconnection with exponential backoff
// - Fallback to text chat if voice fails
// - Supports multiple languages and accents
// - Adaptive bitrate streaming

// Notifications System:
// - Email: Transactional emails via Resend with queue management
// - SMS: Text messages via Retell AI with rate limiting
// - In-app: Real-time updates via Supabase Realtime
// - Web Push: Browser notifications with service worker
// - Priority queuing for urgent notifications

// Monitoring & Analytics:
// - Error Tracking: Sentry for client and server errors
// - Performance: Vercel Analytics + Speed Insights
// - Usage Metrics: Voice interactions, API response times
// - Cache Performance: Redis hit/miss ratios
// - Uptime Monitoring: Status page integration
// - Compliance: Audit logging for HIPAA/GDPR

// ---- 5. Development Phases (See PRP-Development-Order.md for details) ----
//
// Phase 1: Foundation & Basic Chat (Week 1-2)
// [ ] Clerk Authentication setup
// [ ] Supabase database schema
// [ ] Basic Claude AI chat (no tools)
// [ ] UI style guide implementation

// Phase 2: Core Caregiving Features (Week 3-4)
// [ ] Dashboard implementation
// [ ] Health management (medications, appointments)
// [ ] Task & team management
// [ ] Financial tracking

// Phase 3: Communication & Notifications (Week 5-6)
// [ ] Email notifications via Resend
// [ ] SMS notifications via Retell AI
// [ ] Background job processing
// [ ] Document management

// Phase 4: Voice Integration (Week 7-8)
// [ ] In-app voice with Retell AI
// [ ] Tool execution during chat
// [ ] Voice commands for all features
// [ ] TTS/STT with caching

// Phase 5: Autonomous Agent Features (Week 9-10)
// [ ] Voice-first agent core
// [ ] Cal.com scheduling integration
// [ ] Proactive outbound calling
// [ ] Intelligent escalation (notification → SMS → call)
// [ ] Channel switching (app → phone → chat)
// [ ] Conversation memory and patterns

// Phase 6: Polish & Production (Week 11-12)
// [ ] Marketing site
// [ ] Production deployment
// [ ] Performance optimization
// [ ] Load testing

// ---- 6. Marketing Site PRP ----
// Structure:
// - / → Public marketing landing page
// - Hero: "The Overwhelm Stops Here"
// - Problem: Disorganization, emotional load, miscommunication
// - Features: Health, Finance, Home, Collaboration
// - How It Works: Talk → Automate → Track
// - Testimonials: 3 caregiver stories
// - Local Resources: highlight regional care info (placeholder)
// - CTA: Get Started / Request Invite

// Milestone:
// [ ] Create public layout.tsx
// [ ] Build / page with sections above
// [ ] Configure routing from app to site

// ---- 7. Onboarding Flow PRP ----
// Goals:
// - Simple progressive form capture via chat
// - Guided entry: Health → Finance → Home → Legal
// - Handle missing info with reminders + tasks

// UX:
// - Agent prompts: "Let’s begin with health. What medications is Mom taking?"
// - If unknown: create reminder + placeholder
// - Store info in Supabase by category

// Milestone:
// [ ] Define onboarding schema
// [ ] Build chat-guided onboarding mode
// [ ] Add fallback paths for missing or partial info

// ---- 8. Status ----
// PRP Complete: Agent + Marketing + Onboarding packages ready
// Ready for task decomposition and team handoff
