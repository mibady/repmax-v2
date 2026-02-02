# Unified Caregiving Companion Agent - PRP

## Goal

Implement the Unified Caregiving Companion - a SINGLE autonomous agent with one consistent personality that operates across all channels (voice, phone, SMS, chat). Users always interact with the same agent, maintaining continuous conversation and relationship regardless of communication medium. This unified agent proactively manages caregiving tasks and executes tools during conversations.

## Why

- **Unified Experience**: One agent personality builds trust and familiarity over time
- **Proactive Care**: Same agent initiates contact based on patterns and schedules
- **Natural Interaction**: Voice-first design with consistent personality across all channels
- **True Continuity**: One conversation thread - start in app, continue on phone, same context
- **Autonomous Execution**: Agent completes tasks while maintaining relationship
- **24/7 Availability**: Your familiar companion always ready via any channel

## What (User-Visible Behavior)

- **Omnichannel Voice**: Start in app, continue on phone, finish in chat - all one conversation
- **Proactive Outreach**: "Hi Sarah, calling to remind you about Mom's medications"
- **Real-time Tool Use**: "Let me check your calendar... You're free Tuesday at 2 PM"
- **Intelligent Escalation**: Notification → SMS → Voice call based on urgency
- **Continuous Learning**: Remembers preferences and adapts communication style

## All Needed Context

### Documentation References

- **Vercel AI SDK Core**: https://sdk.vercel.ai/docs/ai-sdk-core/overview
- **Retell AI Webhooks**: https://docs.retellai.com/api-references/webhook
- **Cal.com Webhooks**: https://cal.com/docs/webhooks
- **Vercel AI SDK Tools**: https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling
- **Redis OM for Memory**: https://redis.io/docs/stack/get-started/tutorials/stack-node/

### Package Dependencies

```json
{
  "dependencies": {
    "@ai-sdk/anthropic": "^0.0.64",
    "retell-sdk": "^4.0.0",
    "@calcom/sdk": "^1.0.0",
    "ai": "^3.4.33",
    "redis-om": "^0.4.0",
    "zod": "^3.22.4",
    "bullmq": "^5.0.0"
  }
}
```

### Critical Implementation Notes

- **Unified Agent Architecture**:
  - Vercel AI SDK for agent orchestration and tool management
  - Claude as the reasoning engine
  - Redis for conversation memory and state
  - BullMQ for task scheduling and execution

- **Voice Continuity**:
  - Every interaction updates a unified conversation thread
  - Voice transcripts merged with chat messages
  - Context preserved across channel switches

- **Tool Execution**:
  - Tools can be invoked during voice conversations
  - Confirmation flows for sensitive actions
  - Parallel tool execution for efficiency

- **Proactive Behaviors**:
  - Pattern recognition triggers engagement
  - Scheduled tasks via Cal.com integration
  - Escalation matrix for different scenarios

## Implementation Blueprint

### 1. Unified Agent System (/lib/agent/UnifiedCaregivingCompanion.ts)

```typescript
import { anthropic } from "@ai-sdk/anthropic";
import { generateText, streamText, tool } from "ai";
import { z } from "zod";
import { Redis } from "ioredis";
import Retell from "retell-sdk";
import { Cal } from "@calcom/sdk";

export class UnifiedCaregivingCompanion {
  // ONE personality for all channels
  private readonly personality = {
    name: "Your Caregiving Companion",
    systemPrompt: `You are a warm, empathetic caregiving companion who maintains consistent personality across all channels. 
    You remember ALL conversations regardless of channel (voice, phone, SMS, chat).
    You proactively help and can execute tools during any conversation.
    You are the SAME agent whether speaking in the app, on a phone call, via SMS, or in chat.`,
  };

  private model: any;
  private memory: ConversationMemory;
  private retellClient: Retell;
  private cal: Cal;
  private tools: any;

  constructor() {
    // Single model configuration for all channels
    this.model = anthropic("claude-3-5-sonnet-20241022");

    this.retellClient = new Retell({
      apiKey: process.env.RETELL_API_KEY!,
    });

    this.cal = new Cal({
      apiKey: process.env.CAL_API_KEY!,
    });

    this.memory = new ConversationMemory();
    this.tools = this.defineUnifiedTools();
  }

  private defineUnifiedTools() {
    // Tools available across ALL channels - same tools whether voice, phone, SMS, or chat
    return {
      scheduleAppointment: tool({
        description: "Schedule a medical appointment using Cal.com",
        parameters: z.object({
          providerName: z.string().describe("Healthcare provider name"),
          appointmentType: z.string().describe("Type of appointment"),
          preferredDate: z.string().describe("Preferred date"),
        }),
        execute: async ({ providerName, appointmentType, preferredDate }) => {
          return await this.scheduleAppointment({
            providerName,
            appointmentType,
            preferredDate,
          });
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
          return await this.checkMedications({ timeframe });
        },
      }),

      sendSMSReminder: tool({
        description: "Send an SMS reminder via Retell AI",
        parameters: z.object({
          phoneNumber: z.string().describe("Phone number to send to"),
          message: z.string().describe("Message content"),
          scheduleFor: z.string().optional().describe("When to send"),
        }),
        execute: async (params) => {
          return await this.sendSMSReminder(params);
        },
      }),

      initiatePhoneCall: tool({
        description: "Switch conversation to phone call",
        parameters: z.object({
          phoneNumber: z.string().describe("Number to call"),
          continueConversation: z
            .boolean()
            .describe("Continue current conversation"),
        }),
        execute: async (params) => {
          return await this.initiateCall(params);
        },
      }),
    };
  }

  // SINGLE entry point for ALL channel interactions - maintains unified personality
  async processInteraction(input: {
    message: string;
    channel: "voice_app" | "phone_call" | "sms" | "chat";
    userId: string;
    sessionId: string;
    metadata?: any;
  }) {
    // Unified conversation context across ALL channels
    const context = await this.memory.getUnifiedContext(input.userId);

    // Same agent brain processes everything - one personality
    const response = await generateText({
      model: this.model,
      messages: [
        { role: "system", content: this.personality.systemPrompt },
        ...context.history,
        { role: "user", content: input.message },
      ],
      tools: this.tools,
      toolChoice: "auto",
    });

    // Store in unified conversation thread
    await this.memory.storeInteraction({
      userId: input.userId,
      sessionId: input.sessionId,
      channel: input.channel,
      message: input.message,
      response: response.text,
      toolCalls: response.toolCalls,
    });

    // Adapt response format for channel but maintain personality
    return this.adaptResponseForChannel(response.text, input.channel);
  }

  // Agent initiates contact - same personality reaching out
  async initiateProactiveEngagement(params: {
    userId: string;
    purpose: "medication" | "wellness" | "appointment_reminder";
    preferredChannel?: "voice_app" | "phone_call" | "sms";
    scheduledTime?: Date;
  }) {
    // Get unified context - knows everything from all past interactions
    const context = await this.memory.getUnifiedContext(params.userId);

    // Create Cal.com booking if scheduled
    if (params.scheduledTime) {
      const booking = await this.cal.bookings.create({
        eventTypeId: process.env.CAL_WELLNESS_CHECK_EVENT_ID!,
        name: context.userName,
        email: context.userEmail,
        start: params.scheduledTime.toISOString(),
        end: new Date(
          params.scheduledTime.getTime() + 15 * 60000,
        ).toISOString(),
        metadata: {
          purpose: params.purpose,
          userId: params.userId,
          retellAgentId: process.env.RETELL_AGENT_ID,
        },
      });

      // Schedule Retell call via webhook when booking time arrives
      return booking;
    }

    // Immediate call
    const call = await this.retellClient.call.createPhoneCall({
      from_number: process.env.RETELL_FROM_NUMBER!,
      to_number: context.phoneNumber,
      agent_id: process.env.RETELL_AGENT_ID!,
      retell_llm_dynamic_variables: {
        userId: params.userId,
        userName: context.userName,
        purpose: params.purpose,
        conversationHistory: context.recentHistory,
        medications: context.currentMedications,
      },
    });

    return call;
  }
}
```

### 2. Unified Conversation Memory (/lib/agent/ConversationMemory.ts)

```typescript
import { Redis } from "ioredis";
import { Repository, Schema, EntityId } from "redis-om";

// ONE continuous conversation thread across ALL channels
interface UnifiedConversationThread {
  userId: string;
  // No separate sessions - one continuous conversation
  messages: Message[];
  context: any;
  channelHistory: ChannelTransition[];
  lastChannel: string;
  lastInteraction: Date;
  relationshipStarted: Date;
}

export class ConversationMemory {
  private redis: Redis;
  private threadRepo: Repository;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
    this.initializeSchema();
  }

  async getUnifiedContext(userId: string) {
    // Get the ONE continuous conversation thread for this user
    const thread = await this.threadRepo.fetch(`unified:${userId}`);

    if (!thread) {
      return this.createNewRelationship(userId);
    }

    // Get user preferences learned over time
    const preferences = await this.getUserPreferences(userId);

    // Return unified context - everything the agent knows about this user
    return {
      history: thread.messages,
      preferences,
      channelHistory: thread.channelHistory,
      lastChannel: thread.lastChannel,
      relationshipDuration: Date.now() - thread.relationshipStarted,
      activeIssues: await this.getActiveIssues(userId),
    };
  }

  async storeInteraction(interaction: {
    userId: string;
    sessionId: string;
    channel: string;
    message: string;
    response: string;
    toolsUsed: any[];
  }) {
    const thread = await this.threadRepo.fetch(
      `thread:${interaction.userId}:${interaction.sessionId}`,
    );

    // Add to conversation thread
    thread.messages.push({
      timestamp: new Date(),
      channel: interaction.channel,
      role: "user",
      content: interaction.message,
    });

    thread.messages.push({
      timestamp: new Date(),
      channel: interaction.channel,
      role: "assistant",
      content: interaction.response,
      toolsUsed: interaction.toolsUsed,
    });

    thread.lastChannel = interaction.channel;
    thread.lastInteraction = new Date();

    await this.threadRepo.save(thread);

    // Update user patterns
    await this.updateUserPatterns(interaction);

    // Check for proactive triggers
    await this.checkProactiveTriggers(interaction);
  }

  async mergeChannels(
    userId: string,
    channels: {
      voice?: string;
      phone?: string;
      chat?: string;
    },
  ) {
    // Merge conversation threads when user switches channels
    const threads = await Promise.all(
      [
        channels.voice &&
          this.threadRepo.fetch(`thread:${userId}:${channels.voice}`),
        channels.phone &&
          this.threadRepo.fetch(`thread:${userId}:${channels.phone}`),
        channels.chat &&
          this.threadRepo.fetch(`thread:${userId}:${channels.chat}`),
      ].filter(Boolean),
    );

    // Combine all messages chronologically
    const allMessages = threads
      .flatMap((t) => t?.messages || [])
      .sort((a, b) => a.timestamp - b.timestamp);

    // Create unified thread
    const unifiedSessionId = `unified:${Date.now()}`;
    const unifiedThread = {
      userId,
      sessionId: unifiedSessionId,
      messages: allMessages,
      lastChannel: threads[threads.length - 1]?.lastChannel,
      lastInteraction: new Date(),
    };

    await this.threadRepo.save(unifiedThread);

    return unifiedSessionId;
  }
}
```

### 3. Proactive Engagement Engine (/lib/agent/ProactiveEngine.ts)

```typescript
import { Queue, Worker } from "bullmq";
import { VoiceFirstCareAgent } from "./VoiceFirstAgent";

export class ProactiveEngagementEngine {
  private agent: VoiceFirstCareAgent;
  private engagementQueue: Queue;

  constructor() {
    this.agent = new VoiceFirstCareAgent();
    this.engagementQueue = new Queue("proactive-engagement", {
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || "6379"),
      },
    });

    this.initializeWorkers();
    this.scheduleProactiveChecks();
  }

  private initializeWorkers() {
    // Medication compliance worker
    new Worker("medication-check", async (job) => {
      const { userId, medicationId } = job.data;

      // Check if medication was taken
      const compliance = await this.checkMedicationCompliance(
        userId,
        medicationId,
      );

      if (!compliance.taken) {
        // Escalate: notification → SMS → call
        await this.escalateEngagement({
          userId,
          message: `Time to take ${compliance.medicationName}`,
          escalationLevels: [
            { type: "notification", delay: 0 },
            { type: "sms", delay: 5 * 60 * 1000 }, // 5 minutes
            { type: "voice_call", delay: 30 * 60 * 1000 }, // 30 minutes
          ],
        });
      }
    });

    // Wellness check worker
    new Worker("wellness-check", async (job) => {
      const { userId, checkType } = job.data;

      // Initiate wellness check call
      await this.agent.initiateProactiveCall({
        userId,
        purpose: "wellness",
      });
    });
  }

  async escalateEngagement(params: {
    userId: string;
    message: string;
    escalationLevels: Array<{
      type: "notification" | "sms" | "voice_call";
      delay: number;
    }>;
  }) {
    let responded = false;

    for (const level of params.escalationLevels) {
      if (responded) break;

      // Wait for delay
      await new Promise((resolve) => setTimeout(resolve, level.delay));

      // Check if user has responded
      responded = await this.checkUserResponse(params.userId);
      if (responded) break;

      // Execute escalation level
      switch (level.type) {
        case "notification":
          await this.sendNotification(params.userId, params.message);
          break;

        case "sms":
          await this.sendSMS(params.userId, params.message);
          break;

        case "voice_call":
          await this.agent.initiateProactiveCall({
            userId: params.userId,
            purpose: "medication",
          });
          break;
      }
    }
  }

  private scheduleProactiveChecks() {
    // Daily medication reminders
    this.engagementQueue.add(
      "daily-medications",
      { type: "medication_schedule" },
      {
        repeat: {
          pattern: "0 9,14,20 * * *", // 9 AM, 2 PM, 8 PM
        },
      },
    );

    // Weekly wellness checks
    this.engagementQueue.add(
      "weekly-wellness",
      { type: "wellness_check" },
      {
        repeat: {
          pattern: "0 10 * * MON", // Monday at 10 AM
        },
      },
    );

    // Appointment preparation
    this.engagementQueue.add(
      "appointment-prep",
      { type: "appointment_reminder" },
      {
        repeat: {
          pattern: "0 * * * *", // Every hour, check for next-day appointments
        },
      },
    );
  }
}
```

### 4. Tool Execution During Voice (/lib/agent/VoiceTools.ts)

```typescript
export class VoiceAwareTools {
  // Tools that work seamlessly during voice conversations

  async scheduleAppointmentTool(params: {
    voiceContext: VoiceContext;
    specialty: string;
    preferredDates: string[];
  }) {
    // Voice-friendly responses
    const searching = "I'm searching for available appointments...";
    await this.speak(searching, params.voiceContext);

    // Execute tool
    const availableSlots = await this.cal.availability.slots({
      eventTypeId: params.specialty,
      startTime: params.preferredDates[0],
      endTime: params.preferredDates[params.preferredDates.length - 1],
    });

    // Format for voice
    if (availableSlots.length > 0) {
      const response = `I found ${availableSlots.length} available slots. 
        The earliest is ${this.formatDateForVoice(availableSlots[0])}.
        Should I book this for you?`;

      await this.speak(response, params.voiceContext);

      // Wait for confirmation
      const confirmed = await this.waitForConfirmation(params.voiceContext);

      if (confirmed) {
        const booking = await this.cal.bookings.create({
          ...availableSlots[0],
          metadata: { bookedViaVoice: true },
        });

        await this.speak(
          "Perfect! I've booked your appointment. I'll send you a text with the details.",
          params.voiceContext,
        );

        // Send SMS confirmation
        await this.sendSMSConfirmation(booking);
      }
    }
  }

  async checkMedicationsTool(params: {
    voiceContext: VoiceContext;
    timeframe: "today" | "upcoming";
  }) {
    await this.speak("Let me check your medications...", params.voiceContext);

    const medications = await this.supabase
      .from("medications")
      .select("*")
      .eq("user_id", params.voiceContext.userId);

    const response = this.formatMedicationsForVoice(medications);
    await this.speak(response, params.voiceContext);

    // Offer to set reminders
    await this.speak(
      "Would you like me to call you when it's time for your next dose?",
      params.voiceContext,
    );

    const wantsReminder = await this.waitForConfirmation(params.voiceContext);

    if (wantsReminder) {
      await this.scheduleVoiceReminder({
        userId: params.voiceContext.userId,
        medication: medications[0],
        channel: "voice_call",
      });

      await this.speak(
        "I'll call you 15 minutes before your next dose.",
        params.voiceContext,
      );
    }
  }

  async webSearchTool(params: { voiceContext: VoiceContext; query: string }) {
    await this.speak(
      `Searching for information about ${params.query}...`,
      params.voiceContext,
    );

    const results = await this.performWebSearch(params.query);

    // Summarize for voice
    const summary = await this.summarizeForVoice(results);

    await this.speak(summary, params.voiceContext);

    // Offer to send detailed information
    await this.speak(
      "Would you like me to text you the full details?",
      params.voiceContext,
    );

    const wantsDetails = await this.waitForConfirmation(params.voiceContext);

    if (wantsDetails) {
      await this.sendSMSWithDetails(results);
      await this.speak(
        "I've sent you a text with all the information.",
        params.voiceContext,
      );
    }
  }
}
```

### 5. Cal.com + Retell Webhook Handler (/app/api/webhooks/cal-retell/route.ts)

```typescript
import { NextRequest, NextResponse } from "next/server";
import Retell from "retell-sdk";
import { VoiceFirstCareAgent } from "@/lib/agent/VoiceFirstAgent";

const retellClient = new Retell({ apiKey: process.env.RETELL_API_KEY! });
const agent = new VoiceFirstCareAgent();

export async function POST(req: NextRequest) {
  const event = await req.json();

  // Cal.com webhook for scheduled call time
  if (
    event.type === "BOOKING_CREATED" ||
    event.triggerEvent === "BOOKING_CREATED"
  ) {
    const booking = event.data;

    // Schedule Retell call at booking time
    const scheduledTime = new Date(booking.startTime);
    const now = new Date();

    if (scheduledTime <= now) {
      // Time to make the call
      const call = await retellClient.call.createPhoneCall({
        from_number: process.env.RETELL_FROM_NUMBER!,
        to_number: booking.attendees[0].phone,
        agent_id: process.env.RETELL_AGENT_ID!,
        retell_llm_dynamic_variables: {
          bookingId: booking.id,
          purpose: booking.metadata?.purpose || "wellness_check",
          userName: booking.attendees[0].name,
          conversationContext: await agent.getContext(booking.metadata?.userId),
        },
      });

      return NextResponse.json({
        success: true,
        callId: call.call_id,
      });
    }
  }

  // Retell webhook for call events
  if (event.type === "call.ended") {
    // Store call transcript and analysis
    await agent.storeCallTranscript({
      callId: event.call_id,
      transcript: event.transcript,
      analysis: event.call_analysis,
      userId: event.retell_llm_dynamic_variables?.userId,
    });

    // Check for follow-up actions
    const followUpActions = await agent.extractFollowUpActions(
      event.transcript,
    );

    for (const action of followUpActions) {
      await agent.scheduleFollowUp(action);
    }
  }

  return NextResponse.json({ success: true });
}
```

## Task Checklist

### Core Agent Implementation

- [ ] Build VoiceFirstCareAgent class with tool integration
- [ ] Implement ConversationMemory with Redis
- [ ] Create ProactiveEngagementEngine
- [ ] Build VoiceAwareTools for real-time execution
- [ ] Set up Cal.com + Retell webhook orchestration

### Voice Channel Integration

- [ ] Native app voice with Retell Web SDK
- [ ] Outbound calling via Retell API
- [ ] SMS integration through Retell
- [ ] Seamless channel switching logic

### Tool Framework

- [ ] Calendar integration with Cal.com
- [ ] Medication tracking tools
- [ ] Health record queries
- [ ] Web search integration
- [ ] Family notification tools

### Proactive Behaviors

- [ ] Medication compliance monitoring
- [ ] Wellness check scheduling
- [ ] Appointment preparation calls
- [ ] Pattern-based engagement triggers
- [ ] Escalation matrix implementation

### Memory & Learning

- [ ] Unified conversation threading
- [ ] Preference extraction from interactions
- [ ] Pattern recognition system
- [ ] Predictive engagement model

## Validation Loop

### Level 1: Type Checking

```bash
npm run typecheck
```

### Level 2: Unit Tests

```bash
npm test -- agent/
npm test -- memory/
npm test -- tools/
```

### Level 3: Integration Tests

```bash
npm run test:integration -- voice-flow
npm run test:integration -- tool-execution
npm run test:integration -- channel-switching
```

### Level 4: End-to-End Voice Testing

```bash
npm run test:e2e:voice -- medication-reminder
npm run test:e2e:voice -- appointment-booking
npm run test:e2e:voice -- wellness-check
```

## Success Criteria

- [ ] Agent can initiate outbound calls proactively
- [ ] Conversations seamlessly continue across channels
- [ ] Tools execute successfully during voice calls
- [ ] < 2 second response time for voice interactions
- [ ] 95% successful tool execution rate
- [ ] Proper escalation through notification → SMS → call

## Common Gotchas

- Retell webhook URLs must be publicly accessible (use ngrok for local dev)
- Cal.com event IDs are different in test vs production
- Voice transcripts may have recognition errors - implement fuzzy matching
- Tool confirmations are critical for sensitive actions (bookings, medications)
- Redis connection pooling needed for high-volume conversations
- Implement circuit breakers for external API failures
