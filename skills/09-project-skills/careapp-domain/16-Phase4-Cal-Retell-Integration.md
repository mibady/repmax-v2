# Cal.com + Retell AI Integration for Unified Agent - Caregiving Companion

## Goal

Integrate Cal.com scheduling and Retell AI voice capabilities with the UnifiedCaregivingCompanion agent, enabling the SAME agent personality to handle appointment booking, scheduled wellness calls, and proactive check-ins across all channels while maintaining continuous conversation context.

## Why

- **Unified Experience**: Same agent personality handles scheduling across all channels
- **Context Awareness**: Agent remembers previous appointments when scheduling new ones
- **Proactive Wellness**: Your familiar companion makes scheduled check-in calls
- **Channel Flexibility**: Book via chat, confirm via voice, reminder via SMS - one agent
- **Relationship Continuity**: Wellness calls continue ongoing conversations, not starting fresh

## What (User-Visible Behavior)

- **Voice Booking**: "Schedule an appointment with Dr. Smith" → Agent books it
- **Automated Calls**: Wellness checks scheduled weekly, agent calls automatically
- **Smart Reminders**: Pre-appointment calls: "Your appointment is tomorrow, do you have questions?"
- **Family Meetings**: "Schedule a family call for Sunday" → Creates group call
- **Rescheduling**: "Move my Tuesday appointment to Thursday" → Agent handles it

## All Needed Context

### Documentation References

- **Cal.com API v2**: https://cal.com/docs/api-reference/v2
- **Cal.com Webhooks**: https://cal.com/docs/webhooks
- **Retell AI Webhooks**: https://docs.retellai.com/api-references/webhook
- **Cal.com Event Types**: https://cal.com/docs/event-types
- **Retell Dynamic Variables**: https://docs.retellai.com/guides/llm-dynamic-variables

### Package Dependencies

```json
{
  "dependencies": {
    "@calcom/sdk": "^1.0.0",
    "retell-sdk": "^4.0.0",
    "bullmq": "^5.0.0",
    "date-fns": "^3.0.0",
    "zod": "^3.22.4",
    "ioredis": "^5.4.1"
  }
}
```

### Environment Variables

```env
# Cal.com Configuration
CAL_API_KEY=cal_live_xxxxxxxxxxxx
CAL_WEBHOOK_SECRET=your_webhook_secret
CAL_BASE_URL=https://api.cal.com/v2

# Event Type IDs (from Cal.com dashboard)
CAL_WELLNESS_CHECK_EVENT_ID=123456
CAL_APPOINTMENT_EVENT_ID=123457
CAL_FAMILY_MEETING_EVENT_ID=123458
CAL_MEDICATION_REMINDER_EVENT_ID=123459

# Retell Configuration
RETELL_API_KEY=rt_xxxxxxxxxxxx
RETELL_AGENT_ID=agent_xxxxxxxxxxxx
RETELL_FROM_NUMBER=+12137771234
RETELL_WEBHOOK_URL=https://your-app.com/api/webhooks/retell
```

### Critical Implementation Notes

- **Webhook Security**: Always verify webhook signatures from both services
- **Time Zones**: Handle user time zones correctly for scheduling
- **Recurring Events**: Support both one-time and recurring wellness checks
- **Conflict Resolution**: Check for scheduling conflicts before booking
- **Rate Limiting**: Respect API rate limits for both services

## Implementation Blueprint

### CRITICAL: Integration with Unified Agent

This service is used BY the UnifiedCaregivingCompanion agent, not a separate system:

- The unified agent calls these methods during conversations
- All scheduled calls are made by the SAME agent personality
- Context from all channels is available when scheduling
- The agent remembers all past appointments and conversations

### 1. Cal.com Service Integration (/lib/services/CalSchedulingService.ts)

```typescript
import { Cal } from "@calcom/sdk";
import Retell from "retell-sdk";
import { addDays, addHours, format, parseISO } from "date-fns";
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";

// This service is used by the UnifiedCaregivingCompanion
export class CalSchedulingService {
  private cal: Cal;
  private retellClient: Retell;

  constructor() {
    this.cal = new Cal({
      apiKey: process.env.CAL_API_KEY!,
      baseUrl: process.env.CAL_BASE_URL,
    });

    this.retellClient = new Retell({
      apiKey: process.env.RETELL_API_KEY!,
    });
  }

  // Book appointment via voice command
  async bookAppointmentViaVoice(params: {
    userId: string;
    providerName: string;
    preferredDates: string[];
    appointmentType: string;
    voiceContext: any;
  }) {
    try {
      // Search for available slots
      const availableSlots = await this.cal.availability.slots({
        eventTypeId: this.getEventTypeId(params.appointmentType),
        startTime: params.preferredDates[0],
        endTime: params.preferredDates[params.preferredDates.length - 1],
        timeZone: params.voiceContext.userTimeZone || "America/New_York",
      });

      if (availableSlots.length === 0) {
        return {
          success: false,
          message:
            "No available slots found. Would you like to try different dates?",
          suggestAlternatives: true,
        };
      }

      // Present options via voice
      const voiceResponse = this.formatSlotsForVoice(
        availableSlots.slice(0, 3),
      );

      // Create booking with Retell call metadata
      const booking = await this.cal.bookings.create({
        eventTypeId: this.getEventTypeId(params.appointmentType),
        name: params.voiceContext.userName,
        email: params.voiceContext.userEmail,
        start: availableSlots[0].start,
        end: availableSlots[0].end,
        timeZone: params.voiceContext.userTimeZone,
        metadata: {
          bookedViaVoice: true,
          retellCallId: params.voiceContext.callId,
          userId: params.userId,
          providerName: params.providerName,
          // Schedule pre-appointment reminder call
          reminderCall: {
            scheduled: true,
            time: this.calculateReminderTime(availableSlots[0].start),
          },
        },
        customInputs: {
          specialRequests: params.voiceContext.specialRequests || "",
        },
      });

      // Schedule pre-appointment Retell call
      await this.schedulePreAppointmentCall({
        booking,
        userId: params.userId,
      });

      return {
        success: true,
        bookingId: booking.id,
        message: `Perfect! I've booked your appointment with ${params.providerName} on ${this.formatDateForVoice(booking.start)}. I'll call you the day before to help you prepare.`,
        booking,
      };
    } catch (error) {
      console.error("Booking error:", error);
      return {
        success: false,
        message:
          "I encountered an issue booking the appointment. Let me try another approach.",
        error,
      };
    }
  }

  // Schedule recurring wellness check calls
  async scheduleWellnessChecks(params: {
    userId: string;
    frequency: "daily" | "weekly" | "biweekly" | "monthly";
    preferredTime: string; // "10:00 AM"
    duration: number; // minutes
    startDate: Date;
    endDate?: Date;
  }) {
    const recurringRule = this.getRecurringRule(params.frequency);

    // Create recurring event type for wellness checks
    const eventType = await this.cal.eventTypes.create({
      title: `Wellness Check - ${params.userId}`,
      slug: `wellness-${params.userId}`,
      length: params.duration,
      schedulingType: "recurring",
      recurringEvent: {
        interval: recurringRule.interval,
        count: recurringRule.count,
        freq: recurringRule.freq,
      },
      metadata: {
        userId: params.userId,
        type: "wellness_check",
        autoCallEnabled: true,
        retellAgentId: process.env.RETELL_AGENT_ID,
      },
    });

    // Create initial booking
    const booking = await this.cal.bookings.create({
      eventTypeId: eventType.id,
      name: "Wellness Check",
      email: await this.getUserEmail(params.userId),
      start: this.combineDateTime(params.startDate, params.preferredTime),
      end: this.addMinutes(
        this.combineDateTime(params.startDate, params.preferredTime),
        params.duration,
      ),
      recurringEventId: `wellness-${params.userId}-${Date.now()}`,
      metadata: {
        autoCall: true,
        retellConfig: {
          agentId: process.env.RETELL_AGENT_ID,
          purpose: "wellness_check",
          checkItems: [
            "medication_compliance",
            "general_wellbeing",
            "upcoming_appointments",
            "family_updates",
          ],
        },
      },
    });

    return {
      success: true,
      eventTypeId: eventType.id,
      bookingId: booking.id,
      message: `I've scheduled ${params.frequency} wellness checks starting ${this.formatDateForVoice(params.startDate)} at ${params.preferredTime}. I'll call you automatically at each scheduled time.`,
    };
  }

  // Schedule family coordination calls
  async scheduleFamilyMeeting(params: {
    organizerId: string;
    participantPhones: string[];
    preferredTimes: Date[];
    duration: number;
    topic: string;
  }) {
    // Create multi-participant event
    const eventType = await this.cal.eventTypes.create({
      title: `Family Care Meeting: ${params.topic}`,
      slug: `family-meeting-${Date.now()}`,
      length: params.duration,
      schedulingType: "collective", // All participants must be available
      metadata: {
        organizerId: params.organizerId,
        topic: params.topic,
        multiCall: true,
        retellConference: true,
      },
    });

    // Find time that works for all
    const availableSlot = await this.findCollectiveAvailability({
      participants: params.participantPhones,
      preferredTimes: params.preferredTimes,
      duration: params.duration,
    });

    if (!availableSlot) {
      return {
        success: false,
        message:
          "I couldn't find a time that works for everyone. Would you like me to suggest some alternatives?",
      };
    }

    // Create booking with all participants
    const booking = await this.cal.bookings.create({
      eventTypeId: eventType.id,
      name: "Family Care Coordination",
      email: await this.getUserEmail(params.organizerId),
      start: availableSlot.start,
      end: availableSlot.end,
      attendees: params.participantPhones.map((phone) => ({
        phone,
        name: "Family Member",
      })),
      metadata: {
        conferenceCall: true,
        retellConfig: {
          multiParty: true,
          agentId: process.env.RETELL_AGENT_ID,
          role: "moderator",
          agenda: params.topic,
        },
      },
    });

    // Schedule Retell conference call
    await this.scheduleConferenceCall({
      booking,
      participants: params.participantPhones,
    });

    return {
      success: true,
      bookingId: booking.id,
      message: `I've scheduled the family meeting for ${this.formatDateForVoice(availableSlot.start)}. I'll call everyone at that time and connect you all together.`,
    };
  }
}
```

### 2. Webhook Orchestration (/app/api/webhooks/cal-scheduler/route.ts)

```typescript
import { NextRequest, NextResponse } from "next/server";
import Retell from "retell-sdk";
import { CalSchedulingService } from "@/lib/services/CalSchedulingService";
import crypto from "crypto";

const retellClient = new Retell({ apiKey: process.env.RETELL_API_KEY! });
const scheduler = new CalSchedulingService();

// Verify Cal.com webhook signature
function verifyCalSignature(payload: string, signature: string): boolean {
  const hmac = crypto.createHmac("sha256", process.env.CAL_WEBHOOK_SECRET!);
  const digest = hmac.update(payload).digest("hex");
  return signature === digest;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("cal-signature-256");

  // Verify webhook authenticity
  if (!verifyCalSignature(body, signature!)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);

  switch (event.triggerEvent) {
    case "BOOKING_CREATED":
      await handleBookingCreated(event);
      break;

    case "BOOKING_RESCHEDULED":
      await handleBookingRescheduled(event);
      break;

    case "BOOKING_CANCELLED":
      await handleBookingCancelled(event);
      break;

    case "MEETING_STARTED":
      await handleMeetingStarted(event);
      break;
  }

  return NextResponse.json({ success: true });
}

async function handleBookingCreated(event: any) {
  const booking = event.payload;

  // Check if this is an auto-call booking
  if (booking.metadata?.autoCall) {
    // Schedule Retell call at booking time
    const callTime = new Date(booking.startTime);
    const now = new Date();
    const delay = callTime.getTime() - now.getTime();

    if (delay <= 0) {
      // Time to make the call now
      await initiateRetellCall(booking);
    } else {
      // Schedule for later
      await scheduleDelayedCall(booking, delay);
    }
  }

  // Send confirmation SMS
  if (booking.attendees?.[0]?.phone) {
    await sendBookingConfirmation(booking);
  }
}

async function initiateRetellCall(booking: any) {
  try {
    const call = await retellClient.call.createPhoneCall({
      from_number: process.env.RETELL_FROM_NUMBER!,
      to_number: booking.attendees[0].phone || booking.metadata.userPhone,
      agent_id:
        booking.metadata?.retellConfig?.agentId || process.env.RETELL_AGENT_ID!,
      retell_llm_dynamic_variables: {
        bookingId: booking.id,
        userName: booking.attendees[0].name,
        purpose: booking.metadata?.retellConfig?.purpose || "appointment",
        appointmentDetails: {
          date: booking.startTime,
          provider: booking.metadata?.providerName,
          type: booking.eventType?.title,
        },
        conversationContext: await getConversationContext(
          booking.metadata?.userId,
        ),
      },
    });

    // Store call ID with booking
    await updateBookingMetadata(booking.id, {
      retellCallId: call.call_id,
      callInitiated: new Date().toISOString(),
    });

    return call;
  } catch (error) {
    console.error("Failed to initiate Retell call:", error);

    // Fallback to SMS
    await sendSMSFallback(booking);
  }
}

async function handleMeetingStarted(event: any) {
  const booking = event.payload;

  // For conference calls, initiate multi-party Retell session
  if (booking.metadata?.conferenceCall) {
    const participants = booking.attendees.map((a: any) => a.phone);

    // Create conference room
    const conference = await retell.conferences.create({
      participants,
      agent_id: process.env.RETELL_AGENT_ID!,
      metadata: {
        bookingId: booking.id,
        topic: booking.metadata.topic,
      },
    });

    // Call each participant
    for (const phone of participants) {
      await retellClient.call.createPhoneCall({
        from_number: process.env.RETELL_FROM_NUMBER!,
        to_number: phone,
        conference_id: conference.id,
        agent_id: process.env.RETELL_AGENT_ID!,
      });
    }
  }
}
```

### 3. Voice-Driven Scheduling Commands (/lib/agent/SchedulingCommands.ts)

```typescript
export class VoiceSchedulingCommands {
  private scheduler: CalSchedulingService;

  constructor() {
    this.scheduler = new CalSchedulingService();
  }

  // Parse natural language scheduling requests
  async parseSchedulingIntent(transcript: string, context: any) {
    const patterns = {
      appointment: /(?:book|schedule|make|set up)\s+(?:an?\s+)?appointment/i,
      reschedule: /(?:move|reschedule|change)\s+(?:my\s+)?appointment/i,
      cancel: /(?:cancel|remove|delete)\s+(?:my\s+)?appointment/i,
      check: /(?:what|when|check)\s+(?:appointments?|schedule)/i,
      wellness: /(?:schedule|set up)\s+(?:wellness|check-in)\s+calls?/i,
      family: /(?:schedule|arrange)\s+(?:family|group)\s+(?:call|meeting)/i,
    };

    for (const [intent, pattern] of Object.entries(patterns)) {
      if (pattern.test(transcript)) {
        return this.handleSchedulingIntent(intent, transcript, context);
      }
    }

    return null;
  }

  async handleSchedulingIntent(
    intent: string,
    transcript: string,
    context: any,
  ) {
    switch (intent) {
      case "appointment":
        return await this.handleAppointmentBooking(transcript, context);

      case "reschedule":
        return await this.handleRescheduling(transcript, context);

      case "cancel":
        return await this.handleCancellation(transcript, context);

      case "check":
        return await this.handleScheduleCheck(transcript, context);

      case "wellness":
        return await this.handleWellnessSetup(transcript, context);

      case "family":
        return await this.handleFamilyMeeting(transcript, context);
    }
  }

  async handleAppointmentBooking(transcript: string, context: any) {
    // Extract details from transcript
    const details = await this.extractAppointmentDetails(transcript);

    // Interactive voice flow
    const conversation = {
      agent:
        "I'll help you book an appointment. What type of appointment do you need?",
      user: details.type || (await this.waitForResponse(context)),

      agent: "Who would you like to see?",
      user: details.provider || (await this.waitForResponse(context)),

      agent:
        "When would you prefer? You can say things like 'next Tuesday' or 'sometime next week'.",
      user: details.timePreference || (await this.waitForResponse(context)),
    };

    // Search for availability
    const response = await this.scheduler.bookAppointmentViaVoice({
      userId: context.userId,
      providerName: conversation.user.provider,
      preferredDates: this.parseTimePreference(
        conversation.user.timePreference,
      ),
      appointmentType: conversation.user.type,
      voiceContext: context,
    });

    return {
      speak: response.message,
      action: response.success ? "booked" : "retry",
      data: response.booking,
    };
  }

  async handleWellnessSetup(transcript: string, context: any) {
    // Interactive setup for recurring wellness checks
    const flow = {
      frequency: await this.askFrequency(context),
      time: await this.askPreferredTime(context),
      topics: await this.askWellnessTopics(context),
    };

    const result = await this.scheduler.scheduleWellnessChecks({
      userId: context.userId,
      frequency: flow.frequency,
      preferredTime: flow.time,
      duration: 15,
      startDate: new Date(),
    });

    return {
      speak: result.message,
      action: "wellness_scheduled",
      data: result,
    };
  }

  private async askFrequency(context: any): Promise<string> {
    await this.speak(
      "How often would you like me to check in? Daily, weekly, or monthly?",
      context,
    );

    const response = await this.waitForResponse(context);

    // Validate and confirm
    if (response.includes("daily")) return "daily";
    if (response.includes("weekly")) return "weekly";
    if (response.includes("monthly")) return "monthly";

    // Ask for clarification
    return await this.askFrequency(context);
  }
}
```

### 4. Proactive Call Scheduling (/lib/services/ProactiveCallScheduler.ts)

```typescript
import { Queue, Worker } from "bullmq";
import { CalSchedulingService } from "./CalSchedulingService";
import Retell from "retell-sdk";

export class ProactiveCallScheduler {
  private queue: Queue;
  private scheduler: CalSchedulingService;
  private retellClient: Retell;

  constructor() {
    this.queue = new Queue("proactive-calls", {
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || "6379"),
      },
    });

    this.scheduler = new CalSchedulingService();
    this.retellClient = new Retell({ apiKey: process.env.RETELL_API_KEY! });

    this.initializeWorkers();
    this.scheduleRecurringCalls();
  }

  private initializeWorkers() {
    // Worker for medication reminder calls
    new Worker("medication-reminder-call", async (job) => {
      const { userId, medications, scheduledTime } = job.data;

      // Create Cal.com booking for the call
      const booking = await this.scheduler.createQuickBooking({
        userId,
        type: "medication_reminder",
        time: scheduledTime,
        duration: 5,
      });

      // Initiate Retell call
      const call = await this.retellClient.call.createPhoneCall({
        from_number: process.env.RETELL_FROM_NUMBER!,
        to_number: await this.getUserPhone(userId),
        agent_id: process.env.RETELL_AGENT_ID!,
        retell_llm_dynamic_variables: {
          purpose: "medication_reminder",
          medications,
          userName: await this.getUserName(userId),
          checkCompliance: true,
        },
      });

      return { bookingId: booking.id, callId: call.call_id };
    });

    // Worker for appointment preparation calls
    new Worker("appointment-prep-call", async (job) => {
      const { userId, appointment, daysBefore } = job.data;

      // Schedule call via Cal.com
      const callTime = new Date(appointment.date);
      callTime.setDate(callTime.getDate() - daysBefore);

      const booking = await this.scheduler.createQuickBooking({
        userId,
        type: "appointment_prep",
        time: callTime,
        duration: 10,
        metadata: {
          appointmentId: appointment.id,
          prepItems: [
            "Confirm transportation",
            "Review questions for doctor",
            "Check insurance information",
            "Gather medical records",
          ],
        },
      });

      return { bookingId: booking.id };
    });
  }

  private scheduleRecurringCalls() {
    // Daily medication calls at specific times
    this.queue.add(
      "daily-medication-calls",
      { type: "medication_schedule" },
      {
        repeat: {
          pattern: "0 9,14,20 * * *", // 9 AM, 2 PM, 8 PM
        },
      },
    );

    // Weekly wellness checks
    this.queue.add(
      "weekly-wellness-calls",
      { type: "wellness_check" },
      {
        repeat: {
          pattern: "0 10 * * 1", // Mondays at 10 AM
        },
      },
    );

    // Check for upcoming appointments daily
    this.queue.add(
      "appointment-prep-check",
      { type: "appointment_preparation" },
      {
        repeat: {
          pattern: "0 9 * * *", // Daily at 9 AM
        },
      },
    );
  }

  // Manual scheduling methods
  async scheduleImmediateWellnessCall(userId: string) {
    const call = await this.retellClient.call.createPhoneCall({
      from_number: process.env.RETELL_FROM_NUMBER!,
      to_number: await this.getUserPhone(userId),
      agent_id: process.env.RETELL_AGENT_ID!,
      retell_llm_dynamic_variables: {
        purpose: "immediate_wellness_check",
        userName: await this.getUserName(userId),
        checkItems: [
          "current_wellbeing",
          "medication_status",
          "urgent_needs",
          "family_updates",
        ],
      },
    });

    // Log in Cal.com for record keeping
    await this.scheduler.logUnscheduledCall({
      userId,
      callId: call.call_id,
      type: "immediate_wellness",
      timestamp: new Date(),
    });

    return call;
  }
}
```

## Task Checklist

### Cal.com Integration

- [ ] Set up Cal.com SDK and authentication
- [ ] Create event types for different call types
- [ ] Implement availability checking
- [ ] Build booking creation with metadata
- [ ] Handle recurring events for wellness checks

### Retell AI Scheduling

- [ ] Implement scheduled call initiation
- [ ] Create conference call functionality
- [ ] Build dynamic variables for context
- [ ] Handle call scheduling via Cal.com webhooks
- [ ] Implement fallback mechanisms

### Voice Scheduling Commands

- [ ] Natural language parsing for scheduling
- [ ] Interactive voice flows for booking
- [ ] Confirmation and verification flows
- [ ] Rescheduling and cancellation handling
- [ ] Family meeting coordination

### Webhook Orchestration

- [ ] Cal.com webhook handler with signature verification
- [ ] Retell webhook integration
- [ ] Event-driven call initiation
- [ ] Error handling and retries
- [ ] Webhook event logging

### Proactive Scheduling

- [ ] Automated wellness check scheduling
- [ ] Medication reminder call system
- [ ] Pre-appointment preparation calls
- [ ] Family coordination scheduling
- [ ] Pattern-based call triggers

## Validation Loop

### Level 1: Configuration Testing

```bash
# Verify environment variables
npm run verify:env

# Test Cal.com connection
npm run test:cal-connection

# Test Retell connection
npm run test:retell-connection
```

### Level 2: Integration Testing

```bash
npm test -- scheduling/
npm test -- webhooks/
npm test -- voice-commands/
```

### Level 3: End-to-End Scheduling

```bash
npm run test:e2e:booking-flow
npm run test:e2e:wellness-scheduling
npm run test:e2e:family-meeting
```

### Level 4: Live Call Testing

```bash
npm run test:live:make-test-call
npm run test:live:schedule-and-receive
npm run test:live:conference-call
```

## Success Criteria

- [ ] Voice commands successfully book appointments
- [ ] Wellness calls happen at scheduled times
- [ ] Pre-appointment calls made 24 hours before
- [ ] Family meetings connect all participants
- [ ] Rescheduling works seamlessly via voice
- [ ] 99% webhook delivery success rate

## Common Gotchas

- Cal.com event type IDs change between environments
- Webhook URLs must be publicly accessible (use ngrok for dev)
- Time zone handling is critical - always specify
- Retell calls require verified phone numbers in test mode
- Cal.com rate limits: 10 req/sec (free), 30 req/sec (pro)
- Conference calls need special Retell plan features
- Recurring events need careful cleanup to avoid duplicates
