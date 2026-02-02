# Voice Channel Adapters PRP - Unified Caregiving Companion

## Goal

Build channel adapters that connect the Unified Caregiving Companion agent to various voice interfaces (in-app voice, phone calls, SMS). These are NOT separate agents but different ways to interact with the SAME unified agent personality, maintaining continuous conversation across all channels.

## Why

- **One Agent, Multiple Channels**: Users always talk to the same companion personality
- **Seamless Continuity**: Switch channels mid-conversation without losing context
- **Unified Memory**: Agent remembers everything regardless of communication channel
- **Natural Interaction**: Voice adapters provide human-like conversation flow
- **Consistent Experience**: Same tools and capabilities across all channels

## What (User-Visible Behavior)

- **Same Personality Everywhere**: "Hi Sarah, it's me" - recognizable voice across channels
- **Channel Switching**: "Can you call me instead?" → Same conversation continues on phone
- **Unified Context**: "As we discussed yesterday on the phone..." works in chat
- **Voice Transcription**: See words as you speak them with real-time display
- **Proactive Engagement**: Your familiar companion calls when help is needed
- **Continuous Relationship**: Agent remembers all interactions across all channels

## All Needed Context

### Documentation References

- Retell AI Web SDK: https://docs.retellai.com/sdks/web-sdk
- Retell AI REST API: https://docs.retellai.com/api-reference/overview
- Vercel AI SDK: https://sdk.vercel.ai/docs
- React Hooks: https://react.dev/reference/react/hooks
- Sentry Error Tracking: https://docs.sentry.io/platforms/javascript/
- Billing Integration: See PRP 25-Billing-Monetization.md for usage tracking

### Browser Compatibility

- Chrome/Edge: Full support
- Safari: Full support on iOS 14.5+, macOS 11.1+
- Firefox: Full support
- Mobile: Full support on modern iOS/Android browsers

### Package Dependencies

```json
{
  "dependencies": {
    "retell-sdk": "^4.0.0",
    "ai": "^3.4.33",
    "lucide-react": "^0.400.0",
    "clsx": "^2.1.1",
    "@sentry/nextjs": "^8.3.1",
    "react-use": "^17.5.0",
    "@upstash/redis": "^1.34.3",
    "@vercel/analytics": "^1.2.1",
    "@vercel/speed-insights": "^1.1.0"
  },
  "devDependencies": {
    "@types/retell-sdk": "^1.0.0"
  }
}
```

### Critical Implementation Notes

- **Security & Compliance**:
  - Retell AI requires HTTPS in production
  - Comply with HIPAA and GDPR for voice data
  - Encrypt all voice data in transit and at rest
  - Implement proper authentication for voice endpoints
  - Use environment variables for sensitive configuration

- **Performance**:
  - Cache voice responses using Redis to reduce latency
  - Implement connection pooling for Redis clients
  - Optimize audio streaming for low-bandwidth conditions
  - Use Redis for rate limiting to prevent abuse

- **Reliability**:
  - Implement comprehensive error handling with Sentry
  - Handle call states and transitions smoothly
  - Implement proper cleanup on component unmount
  - Add retry logic with exponential backoff
  - Monitor call quality and connection health

- **Monitoring**:
  - Track voice interaction metrics with Vercel Analytics
  - Log errors and performance issues to Sentry
  - Monitor Redis cache hit/miss ratios
  - Set up alerts for failed voice interactions

## Implementation Blueprint

### CRITICAL: Channel Adapter Architecture

These components are NOT separate agents but channel adapters that connect to the UnifiedCaregivingCompanion:

- VoiceAdapter: Handles in-app voice interactions
- PhoneAdapter: Manages phone call connections
- SMSAdapter: Processes text message exchanges
  All adapters route to the SAME agent instance, maintaining unified personality and memory.

### 1. Retell AI Client Setup with Redis Caching (/lib/retell.ts)

```typescript
import Retell from "retell-sdk";
import * as Sentry from "@sentry/nextjs";
import { Redis } from "@upstash/redis";

// Initialize Redis client for caching
export const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

// Initialize Retell client for browser use
export let retellClient: Retell | null = null;

// Cache TTS responses with 1-hour TTL
const TTS_CACHE_TTL = 60 * 60; // 1 hour

// Initialize Retell client with error handling and caching
export async function initRetell(apiKey: string) {
  const cacheKey = `retell:init:client`;

  try {
    // Check cache first
    const cachedConfig = await redis.get(cacheKey);
    if (cachedConfig && retellClient) {
      return true;
    }

    // Initialize fresh if not in cache
    retellClient = new Retell({
      apiKey,
    });

    // Cache the configuration
    await redis.set(cacheKey, JSON.stringify({ initialized: true }), {
      ex: TTS_CACHE_TTL,
    });

    return true;
  } catch (error) {
    console.error("Failed to initialize Retell:", error);
    Sentry.captureException(error, {
      tags: { component: "retell-init" },
      extra: { agentId },
    });
    return false;
  }
}

// Get cached TTS response or generate new one
async function getCachedTTS(text: string, voiceId: string) {
  const cacheKey = `tts:${voiceId}:${Buffer.from(text).toString("base64")}`;

  try {
    // Try to get from cache
    const cachedAudio = await redis.get(cacheKey);
    if (cachedAudio) {
      return cachedAudio;
    }

    // Generate new TTS if not in cache
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voiceId }),
    });

    if (!response.ok) throw new Error("TTS generation failed");

    const audioData = await response.text();

    // Cache the result
    await redis.set(cacheKey, audioData, { ex: TTS_CACHE_TTL });

    return audioData;
  } catch (error) {
    console.error("TTS cache error:", error);
    Sentry.captureException(error, {
      tags: { component: "tts-cache" },
      extra: { textLength: text.length, voiceId },
    });
    throw error;
  }
}
```

### 2. Voice Call Component with Analytics (/components/voice/VoiceCall.tsx)

````typescript
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { retellClient, initRetell, getCachedTTS } from '@/lib/retell';
import * as Sentry from '@sentry/nextjs';
import { Analytics } from '@vercel/analytics/react';

// Track voice call events in Vercel Analytics
const trackVoiceEvent = (event: string, properties: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', `voice_${event}`, properties);
  }
};

// Track errors with Sentry
const trackError = (error: Error, context: Record<string, any> = {}) => {
  console.error('Voice call error:', error, context);
  Sentry.captureException(error, {
    tags: { component: 'voice-call' },
    extra: context
  });
};
```typescript
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { retellClient, initRetell } from '@/lib/retell';
import * as Sentry from '@sentry/nextjs';

interface VoiceCallProps {
  agentId: string;
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function VoiceCall({
  agentId,
  onCallStart,
  onCallEnd,
  onError,
  className,
}: VoiceCallProps) {
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const callStartTimeRef = useRef<number | null>(null);

  // Initialize Retell client when component mounts
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        const token = await fetchRetellToken(); // Implement this function
        if (!token) throw new Error('Failed to get auth token');

        const success = await initRetell(agentId, token);
        if (!success) throw new Error('Failed to initialize Retell');

        // Set up event listeners
        retellClient.on('call_started', () => {
          callStartTimeRef.current = Date.now();
          setIsInCall(true);
          onCallStart?.();
        });

        retellClient.on('call_ended', async () => {
          const callDuration = callStartTimeRef.current
            ? Date.now() - callStartTimeRef.current
            : 0;

          // Track usage for billing
          await trackVoiceUsage({
            userId: currentUserId,
            callId: retellClient.getCallId(),
            duration: Math.floor(callDuration / 1000), // Convert to seconds
            channel: 'web_voice',
            purpose: 'conversation'
          });

          // Log call analytics
          trackCallEnded({
            duration: callDuration,
            agentId,
            wasSuccessful: callDuration > 1000, // Basic success heuristic
          });

          setIsInCall(false);
          onCallEnd?.();
        });

      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error('Voice call initialization failed:', error);
        Sentry.captureException(error);
        setError('Failed to initialize voice call');
        onError?.(error);
      } finally {
        setIsLoading(false);
      }
    };

    init();

    // Cleanup function
    return () => {
      if (retellClient.isCallInProgress()) {
        retellClient.stopCall();
      }
    };
  }, [agentId, onCallStart, onCallEnd, onError]);

  const toggleCall = useCallback(async () => {
    if (isInCall) {
      retellClient.stopCall();
    } else {
      try {
        setIsLoading(true);
        await retellClient.startCall({
          agentId,
          audioConfig: {
            encoding: 's16le',
            sampleRate: 24000,
            channels: 1,
          },
        });

        // Initialize Redis client for caching
        const redis = new Redis({
          url: process.env.NEXT_PUBLIC_REDIS_URL!,
          token: process.env.NEXT_PUBLIC_REDIS_TOKEN!,
        });

        // Cache TTS responses for improved performance
        const cacheKey = `tts:${voiceId}:${Buffer.from(text).toString('base64')}`;
        const cachedAudio = await redis.get(cacheKey);
        if (cachedAudio) {
          return cachedAudio;
        }

        // Generate new TTS if not in cache
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voiceId })
        });

        if (!response.ok) throw new Error('TTS generation failed');

        const audioData = await response.text();

        // Cache the result
        await redis.set(cacheKey, audioData, { ex: TTS_CACHE_TTL });

        return audioData;
      } catch (error) {
        console.error('TTS cache error:', error);
        Sentry.captureException(error, {
          tags: { component: 'tts-cache' },
          extra: { textLength: text.length, voiceId }
        });
        throw error;
      }
    } catch (error) {
      console.error('Failed to start call:', error);
      trackError(error as Error, { action: 'start-call' });
      onError?.(error as Error);
      setIsInCall(false);
    } finally {
      setIsLoading(false);
    }
  }, [isInCall, onError]);

  const toggleMute = useCallback(() => {
    if (!retellClient.isCallInProgress()) return;

    const newMuteState = !isMuted;
    retellClient.muteMicrophone(newMuteState);
    setIsMuted(newMuteState);

    // Track mute events
    trackVoiceEvent(newMuteState ? 'microphone_muted' : 'microphone_unmuted');
  }, [isMuted]);

  // Monitor call quality and connection health
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (retellClient.isCallInProgress()) {
        const callQuality = retellClient.getCallQuality();
        Sentry.addBreadcrumb({
          category: 'voice',
          message: `Call quality: ${callQuality}`,
          level: 'info'
        });
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Implement rate limiting to prevent abuse
  useEffect(() => {
    const rateLimit = 5; // 5 requests per minute
    const rateLimitInterval = 60000; // 1 minute

    const handleRateLimit = async () => {
      const now = Date.now();
      const cacheKey = `rate-limit:${userId}`;
      const cachedRateLimit = await redis.get(cacheKey);

      if (cachedRateLimit) {
        const rateLimitCount = JSON.parse(cachedRateLimit).count;
        const rateLimitTimestamp = JSON.parse(cachedRateLimit).timestamp;

        if (now - rateLimitTimestamp < rateLimitInterval) {
          if (rateLimitCount >= rateLimit) {
            throw new Error('Rate limit exceeded');
          }
        } else {
          await redis.set(cacheKey, JSON.stringify({ count: 1, timestamp: now }));
        }
      } else {
        await redis.set(cacheKey, JSON.stringify({ count: 1, timestamp: now }));
      }
    };

    handleRateLimit();
  }, [userId]);

  // Implement adaptive bitrate streaming
  useEffect(() => {
    const bitrate = 128000; // 128 kbps
    const bitrateInterval = 1000; // 1 second

    const handleBitrate = async () => {
      const now = Date.now();
      const cacheKey = `bitrate:${userId}`;
      const cachedBitrate = await redis.get(cacheKey);

      if (cachedBitrate) {
        const bitrateValue = JSON.parse(cachedBitrate).bitrate;
        const bitrateTimestamp = JSON.parse(cachedBitrate).timestamp;

        if (now - bitrateTimestamp < bitrateInterval) {
          if (bitrateValue < bitrate) {
            retellClient.setBitrate(bitrate);
          }
        } else {
          await redis.set(cacheKey, JSON.stringify({ bitrate, timestamp: now }));
        }
      } else {
        await redis.set(cacheKey, JSON.stringify({ bitrate, timestamp: now }));
      }
    };

    handleBitrate();
  }, [userId]);

  // Implement automatic reconnection with exponential backoff
  useEffect(() => {
    const backoffInterval = 1000; // 1 second
    const maxBackoff = 30000; // 30 seconds

    const handleReconnection = async () => {
      const now = Date.now();
      const cacheKey = `reconnection:${userId}`;
      const cachedReconnection = await redis.get(cacheKey);

      if (cachedReconnection) {
        const reconnectionCount = JSON.parse(cachedReconnection).count;
        const reconnectionTimestamp = JSON.parse(cachedReconnection).timestamp;

        if (now - reconnectionTimestamp < backoffInterval) {
          if (reconnectionCount >= maxBackoff) {
            throw new Error('Max reconnection attempts exceeded');
          }
        } else {
          await redis.set(cacheKey, JSON.stringify({ count: 1, timestamp: now }));
        }
      } else {
        await redis.set(cacheKey, JSON.stringify({ count: 1, timestamp: now }));
      }
    };

    handleReconnection();
  }, [userId]);

  // Implement noise reduction and echo cancellation
  useEffect(() => {
    retellClient.enableNoiseReduction(true);
    retellClient.enableEchoCancellation(true);
  }, []);

  // Implement automatic microphone sensitivity adjustment
  useEffect(() => {
    const sensitivityInterval = 1000; // 1 second

    const handleSensitivity = async () => {
      const now = Date.now();
      const cacheKey = `sensitivity:${userId}`;
      const cachedSensitivity = await redis.get(cacheKey);

      if (cachedSensitivity) {
        const sensitivityValue = JSON.parse(cachedSensitivity).sensitivity;
        const sensitivityTimestamp = JSON.parse(cachedSensitivity).timestamp;

        if (now - sensitivityTimestamp < sensitivityInterval) {
          if (sensitivityValue < 0.5) {
            retellClient.setMicrophoneSensitivity(0.5);
          }
        } else {
          await redis.set(cacheKey, JSON.stringify({ sensitivity: 0.5, timestamp: now }));
        }
      } else {
        await redis.set(cacheKey, JSON.stringify({ sensitivity: 0.5, timestamp: now }));
      }
    };

    handleSensitivity();
  }, [userId]);

  // Implement audio quality metrics collection
  useEffect(() => {
    const qualityInterval = 1000; // 1 second

    const handleQuality = async () => {
      const now = Date.now();
      const cacheKey = `quality:${userId}`;
      const cachedQuality = await redis.get(cacheKey);

      if (cachedQuality) {
        const qualityValue = JSON.parse(cachedQuality).quality;
        const qualityTimestamp = JSON.parse(cachedQuality).timestamp;

        if (now - qualityTimestamp < qualityInterval) {
          if (qualityValue < 0.5) {
            Sentry.addBreadcrumb({
              category: 'voice',
              message: `Audio quality: ${qualityValue}`,
              level: 'info'
            });
          }
        } else {
          await redis.set(cacheKey, JSON.stringify({ quality: 0.5, timestamp: now }));
        }
      } else {
        await redis.set(cacheKey, JSON.stringify({ quality: 0.5, timestamp: now }));
      }
    };

    handleQuality();
  }, [userId]);

  return (
    <div className={cn("relative", className)}>
      {/* Voice UI components */}
    </div>
  );
}
````

### 2.5. Voice Usage Tracking for Billing (/lib/billing/VoiceUsageTracker.ts)

```typescript
import { UsageTracker } from "@/lib/billing/UsageTracker";

export async function trackVoiceUsage(params: {
  userId: string;
  callId: string;
  duration: number; // seconds
  channel: "web_voice" | "phone_call";
  purpose: string;
}) {
  const tracker = new UsageTracker();

  // Track the voice usage
  const usageRecord = await tracker.trackVoiceUsage(params);

  // Check if user is approaching limits
  const usage = await tracker.getCurrentMonthUsage(params.userId);
  const plan = await tracker.getUserPlan(params.userId);

  // Show in-app warning if approaching limit
  if (usage.minutesUsed > plan.includedMinutes * 0.8) {
    showUsageWarning({
      minutesRemaining: plan.includedMinutes - usage.minutesUsed,
      overageRate: plan.overageRate,
    });
  }

  return usageRecord;
}
```

### 3. Outbound Calling System (/lib/voice/OutboundCaller.ts)

```typescript
import Retell from "retell-sdk";
import { Cal } from "@calcom/sdk";
import { ConversationMemory } from "@/lib/agent/ConversationMemory";

export class OutboundCaller {
  private retellClient: Retell;
  private cal: Cal;
  private memory: ConversationMemory;

  constructor() {
    this.retellClient = new Retell({ apiKey: process.env.RETELL_API_KEY! });
    this.cal = new Cal({ apiKey: process.env.CAL_API_KEY! });
    this.memory = new ConversationMemory();
  }

  // Initiate proactive wellness check call
  async makeWellnessCall(params: {
    userId: string;
    phoneNumber: string;
    purpose: "medication" | "wellness" | "appointment_reminder";
    context?: any;
  }) {
    // Get user's conversation history
    const conversationContext = await this.memory.getUserContext(params.userId);

    // Create outbound call
    const call = await this.retellClient.call.createPhoneCall({
      from_number: process.env.RETELL_FROM_NUMBER!,
      to_number: params.phoneNumber,
      agent_id: process.env.RETELL_AGENT_ID!,
      retell_llm_dynamic_variables: {
        userId: params.userId,
        userName: conversationContext.userName,
        purpose: params.purpose,
        lastInteraction: conversationContext.lastInteraction,
        medications: conversationContext.currentMedications,
        upcomingAppointments: conversationContext.appointments,
        // Enable tool use during call
        toolsEnabled: true,
        availableTools: ["calendar", "medications", "appointments", "sms"],
      },
      metadata: {
        initiated: "proactive",
        timestamp: new Date().toISOString(),
      },
    });

    // Log call initiation
    await this.memory.logOutboundCall({
      callId: call.call_id,
      userId: params.userId,
      purpose: params.purpose,
      status: "initiated",
    });

    return call;
  }

  // Schedule a call via Cal.com
  async scheduleCall(params: {
    userId: string;
    scheduledTime: Date;
    purpose: string;
    duration: number;
  }) {
    // Create Cal.com booking
    const booking = await this.cal.bookings.create({
      eventTypeId: process.env.CAL_WELLNESS_EVENT_ID!,
      name: "Scheduled Check-in Call",
      email: "noreply@caregiving.com",
      start: params.scheduledTime.toISOString(),
      end: new Date(
        params.scheduledTime.getTime() + params.duration * 60000,
      ).toISOString(),
      metadata: {
        userId: params.userId,
        purpose: params.purpose,
        autoCall: true,
        retellAgentId: process.env.RETELL_AGENT_ID,
      },
    });

    return booking;
  }
}
```

### 4. Channel Switching Handler (/lib/voice/ChannelSwitcher.ts)

```typescript
export class ChannelSwitcher {
  private currentChannel: "app_voice" | "phone_call" | "sms" | "chat";
  private sessionId: string;
  private userId: string;

  // Seamlessly switch from app voice to phone call
  async switchToPhoneCall(currentContext: any) {
    // Save current conversation state
    await this.memory.saveChannelState({
      channel: "app_voice",
      sessionId: this.sessionId,
      context: currentContext,
      transcript: currentContext.transcript,
    });

    // Initiate phone call
    const call = await this.outboundCaller.makeWellnessCall({
      userId: this.userId,
      phoneNumber: currentContext.userPhone,
      purpose: "continue_conversation",
      context: {
        previousChannel: "app_voice",
        conversationId: this.sessionId,
        lastMessage: currentContext.lastMessage,
      },
    });

    // Update channel state
    this.currentChannel = "phone_call";

    return {
      success: true,
      message: "I'm calling you now. We can continue our conversation there.",
      callId: call.call_id,
    };
  }

  // Continue conversation in chat after voice
  async switchToChat(voiceContext: any) {
    // Merge voice transcript with chat history
    const unifiedThread = await this.memory.mergeChannels(this.userId, {
      voice: voiceContext.sessionId,
      chat: await this.getChatSessionId(),
    });

    return {
      success: true,
      message: "Let's continue in chat. I have our full conversation history.",
      sessionId: unifiedThread,
    };
  }
}
```

### 5. Real-time Tool Execution During Voice (/lib/voice/VoiceToolExecutor.ts)

```typescript
export class VoiceToolExecutor {
  // Execute tools while maintaining voice conversation
  async executeToolDuringCall(params: {
    tool: string;
    parameters: any;
    voiceContext: any;
  }) {
    // Acknowledge tool execution verbally
    await this.speak("Let me check that for you...", params.voiceContext);

    let result;
    switch (params.tool) {
      case "check_calendar":
        result = await this.checkCalendarTool(params);
        break;

      case "book_appointment":
        result = await this.bookAppointmentTool(params);
        break;

      case "send_reminder":
        result = await this.sendReminderTool(params);
        break;

      case "check_medications":
        result = await this.checkMedicationsTool(params);
        break;
    }

    // Speak the result
    await this.speak(result.voiceResponse, params.voiceContext);

    // Execute any follow-up actions
    if (result.followUpActions) {
      for (const action of result.followUpActions) {
        await this.executeFollowUp(action);
      }
    }

    return result;
  }

  private async bookAppointmentTool(params: any) {
    const { specialty, preferredDates } = params.parameters;

    // Search availability
    const slots = await this.cal.availability.slots({
      eventTypeId: this.getEventTypeForSpecialty(specialty),
      startTime: preferredDates[0],
      endTime: preferredDates[preferredDates.length - 1],
    });

    if (slots.length > 0) {
      // Offer first available slot
      const slot = slots[0];

      return {
        voiceResponse: `I found an opening on ${this.formatDateForVoice(slot.start)}. Should I book it for you?`,
        data: slot,
        requiresConfirmation: true,
        confirmationAction: async () => {
          const booking = await this.cal.bookings.create(slot);
          return {
            voiceResponse:
              "Perfect! I've booked your appointment and sent you a confirmation text.",
            booking,
          };
        },
      };
    } else {
      return {
        voiceResponse:
          "I couldn't find any available slots for those dates. Would you like to try different dates?",
        data: null,
        suggestAlternatives: true,
      };
    }
  }
}
```

## Task Checklist

### Core Voice Components

- [ ] Build enhanced VoiceCall component with outbound support
- [ ] Implement OutboundCaller for proactive calls
- [ ] Create ChannelSwitcher for seamless transitions
- [ ] Build VoiceToolExecutor for real-time tool use
- [ ] Set up conversation memory persistence

### Proactive Calling Features

- [ ] Medication reminder calls
- [ ] Wellness check scheduling
- [ ] Appointment preparation calls
- [ ] Family coordination calls
- [ ] Emergency escalation system

### Channel Continuity

- [ ] App voice to phone call handoff
- [ ] Phone to chat transition
- [ ] SMS to voice escalation
- [ ] Unified conversation threading
- [ ] Context preservation across channels

### Tool Integration

- [ ] Calendar checking during calls
- [ ] Appointment booking via voice
- [ ] SMS sending while talking
- [ ] Medication lookup in conversation
- [ ] Web search during calls

### Cal.com Integration

- [ ] Schedule wellness calls
- [ ] Book appointments via voice
- [ ] Family meeting coordination
- [ ] Recurring check-in setup
- [ ] Calendar conflict resolution

## Validation Loop

### Level 1: Component Testing

```bash
npm test -- voice/
npm test -- outbound/
npm test -- channel-switching/
```

### Level 2: Integration Testing

```bash
npm run test:voice-tools
npm run test:channel-continuity
npm run test:proactive-calls
```

### Level 3: End-to-End Voice Flows

```bash
npm run test:e2e:medication-call
npm run test:e2e:appointment-booking
npm run test:e2e:channel-switch
```

### Level 4: Live Testing

```bash
npm run test:live:outbound-call
npm run test:live:tool-execution
npm run test:live:channel-transition
```

## Success Criteria

- [ ] < 1 second latency for voice responses
- [ ] Successful channel switching without context loss
- [ ] 95% tool execution success rate during calls
- [ ] Proactive calls initiated on schedule
- [ ] Voice transcription accuracy > 90%
- [ ] Seamless Cal.com appointment booking

## Common Gotchas

- Retell webhook URLs must be publicly accessible
- Voice context must be preserved during channel switches
- Tool confirmations are critical for sensitive actions
- Cal.com event IDs differ between environments
- Phone number verification required for outbound calls
- WebRTC permissions needed for browser voice
- Redis connection pooling for high-volume calls
