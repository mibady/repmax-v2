# API Integration PRP - Caregiving Companion (Enhanced with Tool Execution)

## Goal

Implement a robust API integration layer for Claude AI chat with tool execution, Retell AI voice services with Cal.com scheduling, enabling an autonomous agent that can execute complex tasks while conversing naturally across voice, phone, and chat channels.

## Why

- **Autonomous Agent**: Claude can execute tools (book appointments, check calendars) during conversations
- **Voice-First Design**: Retell AI enables proactive calling and seamless channel switching
- **Smart Scheduling**: Cal.com integration for automated wellness checks and appointments
- **Unified Experience**: Consistent API layer across all communication channels
- **Mission-Critical Reliability**: Robust error handling with fallback mechanisms

## What (User-Visible Behavior)

- **Tool Execution During Chat**: "Let me book that appointment for you..." → Actually books it
- **Voice with Actions**: During calls, agent can send SMS, book appointments, check records
- **Proactive Scheduling**: "I've scheduled your weekly wellness checks" → Cal.com bookings created
- **Channel Continuity**: Start in chat, switch to voice, continue conversation seamlessly
- **Real-time Updates**: See actions happening as agent performs them

## All Needed Context

### Documentation References

- **Vercel AI SDK with Tools**: https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling
- **Anthropic Claude API**: https://docs.anthropic.com/claude/reference/messages
- **Retell AI API**: https://docs.retellai.com/api-references/overview
- **Cal.com API v2**: https://cal.com/docs/api-reference/v2
- **Vercel AI SDK Streaming**: https://sdk.vercel.ai/docs/ai-sdk-core/streaming
- **Next.js Route Handlers**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Redis OM for Chat History**: https://redis.io/docs/stack/get-started/tutorials/stack-node/

### Environment Variables Required

```env
# Core Configuration
NODE_ENV=production

# Claude AI
ANTHROPIC_API_KEY=[REDACTED]

# Retell AI
RETELL_API_KEY=[REDACTED]
RETELL_AGENT_ID=[REDACTED]
RETELL_FROM_NUMBER=[REDACTED]

# Cal.com
CAL_API_KEY=[REDACTED]
CAL_WEBHOOK_SECRET=[REDACTED]
CAL_WELLNESS_EVENT_ID=[REDACTED]
CAL_APPOINTMENT_EVENT_ID=[REDACTED]

# Redis
REDIS_URL=[REDACTED]
REDIS_PASSWORD=[REDACTED]

# Security
ENCRYPTION_KEY=[REDACTED]  # 32-byte encryption key for chat history
```

### Package Dependencies

```json
{
  "dependencies": {
    "@ai-sdk/anthropic": "^0.0.64",
    "ai": "^3.4.33",
    "retell-sdk": "^4.0.0",
    "@calcom/sdk": "^1.0.0",
    "redis-om": "^0.4.0",
    "ioredis": "^5.4.1",
    "zod": "^3.22.4",
    "bullmq": "^5.0.0"
  }
}
```

### Critical Implementation Notes

- **Claude AI**:
  - 200k token context window for handling extensive caregiving histories
  - Supports system prompts for consistent assistant behavior
  - Enable response caching for common queries

- **Retell AI**:
  - Unified API for voice calls, SMS, and TTS
  - WebSocket-based real-time communication
  - HIPAA-compliant voice processing

- **Security**:
  - Never expose API keys in client-side code
  - Encrypt sensitive chat history at rest
  - Implement strict CORS policies

- **Performance**:
  - Use Redis for chat history and session management
  - Implement connection pooling for database and Redis
  - Enable compression for API responses

## Implementation Blueprint

### 1. Enhanced Claude Chat with Tool Execution (/app/api/ai/chat/route.ts)

```typescript
// Enhanced streaming chat with tool execution
import { anthropic } from "@ai-sdk/anthropic";
import { streamText, tool } from "ai";
import { z } from "zod";
import { Cal } from "@calcom/sdk";
import Retell from "retell-sdk";
import { createClient } from "@supabase/supabase-js";

// Initialize service clients
const cal = new Cal({ apiKey: process.env.CAL_API_KEY! });
const retellClient = new Retell({ apiKey: process.env.RETELL_API_KEY! });
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Enhanced system prompt with tool awareness
const SYSTEM_PROMPT = `You are a proactive caregiving assistant with the ability to take real actions. 
You can book appointments, send reminders, check calendars, and make phone calls. 
When users ask you to do something, you actually do it - not just provide instructions.
Be empathetic, clear, and action-oriented. Always confirm before taking sensitive actions.`;

export async function POST(req: Request) {
  const { messages, conversationId, userId } = await req.json();

  // Define available tools
  const tools = {
    bookAppointment: tool({
      description: "Book a medical appointment using Cal.com",
      parameters: z.object({
        providerName: z.string().describe("Name of the healthcare provider"),
        appointmentType: z.string().describe("Type of appointment"),
        preferredDate: z.string().describe("Preferred date for appointment"),
        notes: z.string().optional().describe("Additional notes"),
      }),
      execute: async ({ providerName, appointmentType, preferredDate }) => {
        const slots = await cal.availability.slots({
          eventTypeId: process.env.CAL_APPOINTMENT_EVENT_ID!,
          startTime: preferredDate,
          endTime: new Date(
            Date.parse(preferredDate) + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        });

        if (slots.length > 0) {
          const booking = await cal.bookings.create({
            eventTypeId: process.env.CAL_APPOINTMENT_EVENT_ID!,
            start: slots[0].start,
            end: slots[0].end,
            metadata: { providerName, appointmentType, bookedViaChat: true },
          });

          return {
            success: true,
            message: `Appointment booked with ${providerName} on ${new Date(slots[0].start).toLocaleDateString()}`,
            bookingId: booking.id,
          };
        }

        return {
          success: false,
          message:
            "No available slots found. Would you like to try different dates?",
        };
      },
    }),

    sendSMSReminder: tool({
      description: "Send an SMS reminder via Retell AI",
      parameters: z.object({
        phoneNumber: z.string().describe("Phone number to send SMS to"),
        message: z.string().describe("Message content"),
        scheduleFor: z.string().optional().describe("When to send (ISO date)"),
      }),
      execute: async ({ phoneNumber, message, scheduleFor }) => {
        // Use Retell AI to send SMS
        const result = await retellClient.sms.send({
          to: phoneNumber,
          message,
          scheduleFor: scheduleFor ? new Date(scheduleFor) : undefined,
        });

        return {
          success: true,
          message: `SMS ${scheduleFor ? "scheduled" : "sent"} successfully`,
          smsId: result.id,
        };
      },
    }),

    checkMedications: tool({
      description: "Check medication schedule and compliance",
      parameters: z.object({
        timeframe: z
          .enum(["today", "upcoming", "missed"])
          .describe("What medications to check"),
      }),
      execute: async ({ timeframe }) => {
        const { data: medications } = await supabase
          .from("medications")
          .select("*")
          .eq("user_id", userId)
          .eq("is_active", true);

        const filtered = filterMedicationsByTimeframe(medications, timeframe);

        return {
          medications: filtered,
          summary: `You have ${filtered.length} medications ${timeframe}`,
        };
      },
    }),

    scheduleWellnessCall: tool({
      description: "Schedule a wellness check-in call",
      parameters: z.object({
        date: z.string().describe("Date for the call"),
        time: z.string().describe("Time for the call"),
        recurring: z.boolean().optional().describe("Make it recurring"),
      }),
      execute: async ({ date, time, recurring }) => {
        const booking = await cal.bookings.create({
          eventTypeId: process.env.CAL_WELLNESS_EVENT_ID!,
          start: `${date}T${time}`,
          end: new Date(
            Date.parse(`${date}T${time}`) + 15 * 60000,
          ).toISOString(),
          recurring: recurring ? { interval: "weekly", count: 52 } : undefined,
          metadata: {
            autoCall: true,
            retellAgentId: process.env.RETELL_AGENT_ID,
            purpose: "wellness_check",
          },
        });

        return {
          success: true,
          message: `Wellness call scheduled for ${date} at ${time}${recurring ? " (weekly)" : ""}`,
          bookingId: booking.id,
        };
      },
    }),

    initiatePhoneCall: tool({
      description: "Switch conversation to a phone call",
      parameters: z.object({
        phoneNumber: z.string().describe("Phone number to call"),
        continueConversation: z
          .boolean()
          .describe("Continue current conversation on phone"),
      }),
      execute: async ({ phoneNumber, continueConversation }) => {
        const call = await retellClient.call.createPhoneCall({
          from_number: process.env.RETELL_FROM_NUMBER!,
          to_number: phoneNumber,
          agent_id: process.env.RETELL_AGENT_ID!,
          retell_llm_dynamic_variables: {
            conversationId,
            continueFrom: continueConversation ? "chat" : "new",
            userId,
          },
        });

        return {
          success: true,
          message:
            "I'm calling you now. We can continue our conversation there.",
          callId: call.call_id,
        };
      },
    }),
  };

  // Stream response with tool execution
  const result = await streamText({
    model: anthropic("claude-3-5-sonnet-20241022"),
    system: SYSTEM_PROMPT,
    messages,
    tools,
    toolChoice: "auto", // Let Claude decide when to use tools
    temperature: 0.7,
    maxTokens: 2048,
    onToolCall: async ({ toolCall }) => {
      console.log(`Executing tool: ${toolCall.toolName}`, toolCall.args);
      // Tool execution is handled by the framework
    },
  });

  return result.toDataStreamResponse();
}
```

### 2. Retell AI Voice Integration (/app/api/voice/route.ts)

```typescript
// Text-to-speech synthesis endpoint
import axios from "axios";

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech";

export async function POST(req: Request) {
  // 1. Parse text from request
  const { text, voiceId = "21m00Tcm4TlvDq8ikWAM" } = await req.json();

  // 2. Validate text length (11Labs limit)
  if (text.length > 5000) {
    return new Response("Text too long for TTS", { status: 400 });
  }

  // 3. Call 11Labs API
  try {
    const response = await axios.post(
      `${ELEVENLABS_API_URL}/${voiceId}`,
      {
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      },
      {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      },
    );

    // 4. Return audio stream
    return new Response(response.data, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("TTS Error:", error);
    return new Response("TTS synthesis failed", { status: 500 });
  }
}
```

### 3. API Client Utilities (/lib/api-client.ts)

```typescript
// Client-side API utilities with error handling
export class APIClient {
  private static instance: APIClient;

  static getInstance() {
    if (!this.instance) {
      this.instance = new APIClient();
    }
    return this.instance;
  }

  async sendChatMessage(messages: Message[]) {
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) throw new Error("Chat request failed");
      return response;
    } catch (error) {
      console.error("Chat API Error:", error);
      throw error;
    }
  }

  async synthesizeSpeech(text: string): Promise<Blob> {
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error("TTS request failed");
      return await response.blob();
    } catch (error) {
      console.error("TTS API Error:", error);
      throw error;
    }
  }
}
```

### 4. Rate Limiting Middleware (/lib/rate-limit.ts)

```typescript
// Simple in-memory rate limiter
const rateLimitMap = new Map();

export function rateLimit(limit = 10, window = 60000) {
  return async (req: Request) => {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const now = Date.now();

    const userLimit = rateLimitMap.get(ip) || {
      count: 0,
      resetTime: now + window,
    };

    if (now > userLimit.resetTime) {
      userLimit.count = 0;
      userLimit.resetTime = now + window;
    }

    if (userLimit.count >= limit) {
      return new Response("Rate limit exceeded", { status: 429 });
    }

    userLimit.count++;
    rateLimitMap.set(ip, userLimit);

    return null; // Continue processing
  };
}
```

### 5. Error Handling & Retry Logic (/lib/retry.ts)

```typescript
// Exponential backoff retry wrapper
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}
```

## Task Checklist

### Setup & Configuration

- [ ] Install required packages (@ai-sdk/anthropic, ai, @calcom/sdk, @retell-ai/sdk)
- [ ] Configure all environment variables including Cal.com and Retell
- [ ] Set up API key validation and webhook secrets

### Enhanced Claude Integration with Tools

- [ ] Create /api/ai/chat route with tool execution
- [ ] Implement bookAppointment tool with Cal.com
- [ ] Build sendSMSReminder tool with Retell AI
- [ ] Add checkMedications tool with Supabase
- [ ] Create scheduleWellnessCall tool
- [ ] Implement initiatePhoneCall for channel switching
- [ ] Add tool confirmation flows
- [ ] Set up tool execution logging

### Cal.com Integration

- [ ] Set up Cal.com SDK authentication
- [ ] Create event types for appointments and wellness calls
- [ ] Implement availability checking
- [ ] Build booking creation with metadata
- [ ] Add webhook handlers for Cal.com events
- [ ] Handle recurring events for regular check-ins

### Retell AI Voice & SMS

- [ ] Configure Retell AI for outbound calling
- [ ] Implement SMS sending via Retell
- [ ] Set up voice call initiation from chat
- [ ] Add dynamic variables for context
- [ ] Create webhook handlers for call events
- [ ] Implement call transcription storage

### Channel Continuity

- [ ] Build conversation memory with Redis
- [ ] Implement channel switching logic
- [ ] Create unified conversation threading
- [ ] Add context preservation across channels
- [ ] Build session management system

### Production Readiness

- [ ] Implement rate limiting for all APIs
- [ ] Add comprehensive error handling
- [ ] Set up monitoring with Sentry
- [ ] Create health check endpoints
- [ ] Add webhook signature verification
- [ ] Implement circuit breakers for external APIs

## Validation Loop

### Level 1: Syntax & Types

```bash
npm run build
npm run type-check
```

### Level 2: Unit Tests

```bash
# Test API routes
npm test -- api/ai/chat.test.ts
npm test -- api/tts.test.ts

# Test client utilities
npm test -- lib/api-client.test.ts
```

### Level 3: Integration Tests

```bash
# Start dev server
npm run dev

# Test Claude chat endpoint
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello, I need help managing medications"}]}'

# Test TTS endpoint
curl -X POST http://localhost:3000/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello, this is a test"}' \
  --output test.mp3
```

### Level 4: End-to-End Validation

```bash
# Test full conversation flow
npm run e2e:chat

# Verify streaming works
npm run test:streaming

# Check rate limiting
npm run test:rate-limit
```

## Success Criteria

- [ ] Chat API returns streaming responses in < 500ms
- [ ] TTS generates clear audio output
- [ ] Rate limiting prevents API abuse
- [ ] Error handling provides graceful degradation
- [ ] All API keys are securely managed
- [ ] Production deployment passes all health checks

## Common Gotchas

- Claude API has rate limits - implement exponential backoff
- 11Labs free tier is limited - consider fallback TTS
- Streaming responses need proper error boundaries
- CORS issues with audio playback - configure headers correctly
- Cache control requires specific message structure for Anthropic
- Large context windows can increase costs - monitor token usage
