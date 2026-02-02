# Notification & Background Jobs PRP - Caregiving Companion (Enhanced with Intelligent Escalation)

## Goal

Build an intelligent notification system with proactive escalation (notification → SMS → voice call), Cal.com-scheduled wellness calls, and autonomous engagement based on user patterns - creating a truly proactive caregiving system that initiates contact when needed.

## Why

- **Proactive Engagement**: System initiates contact based on patterns and missed actions
- **Intelligent Escalation**: Automatically escalates from gentle nudge to urgent call
- **Voice-First Priority**: Critical notifications trigger immediate voice calls
- **Pattern Recognition**: Learns user response patterns to optimize engagement
- **Zero-Miss Compliance**: Ensures critical medications and appointments aren't missed

## What (User-Visible Behavior)

- **Smart Escalation**: Missed medication → Notification (5min) → SMS (15min) → Voice Call (30min)
- **Proactive Calls**: "Hi Sarah, I noticed you haven't logged Mom's evening medication"
- **Channel Preference Learning**: System learns best channel for each user/situation
- **Family Escalation**: Alert family members if primary caregiver doesn't respond
- **Contextual Urgency**: Critical medications trigger faster escalation than routine tasks

## All Needed Context

### Documentation References

- **Redis Cloud**: https://redis.io/docs/cloud/
- **Resend API**: https://resend.com/docs/introduction
- **Retell AI API**: https://docs.retellai.com/api-references/overview
- **Sentry for Node.js**: https://docs.sentry.io/platforms/node/
- **Bull Queue**: https://github.com/OptimalBits/bull
- **Next.js API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions

### Package Dependencies

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.18.0",
    "retell-sdk": "^4.0.0",
    "@supabase/supabase-js": "^2.45.4",
    "@sentry/nextjs": "^8.3.1",
    "bull": "^4.16.3",
    "ioredis": "^5.4.1",
    "node-cron": "^3.0.3",
    "node-schedule": "^2.1.1",
    "resend": "^3.4.0",
    "web-push": "^3.6.7"
  }
}
```

### Environment Variables

```env
# Redis Cloud
REDIS_URL=redis://username:password@redis-host:redis-port
REDIS_PASSWORD=your-redis-password

# Resend
RESEND_API_KEY=re_123456789
EMAIL_FROM=noreply@yourdomain.com

# Retell AI
RETELL_API_KEY=rt_123456789
RETELL_AGENT_ID=agent_123
RETELL_FROM_NUMBER=+15551234567

# Sentry
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-auth-token

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Tech Stack Alignment

- **Frontend**: Next.js 15 + React + TypeScript
- **Backend**: Next.js API Routes + Supabase Edge Functions
- **Database**: Supabase PostgreSQL with Row-Level Security
- **Queue**: Redis Cloud + Bull for distributed job processing
- **Email**: Resend for transactional emails with React components
- **Voice & SMS**: Retell AI for voice calls and SMS notifications
- **Monitoring**: Sentry for error tracking and performance monitoring
- **AI**: Claude for generating natural language notifications
- **Analytics**: Vercel Analytics for usage metrics

### Critical Implementation Notes

- **Security**:
  - Never log or expose sensitive data in notifications
  - Use Redis ACLs and secure connections
  - Encrypt PII in transit and at rest
  - Implement rate limiting and abuse prevention

- **Reliability**:
  - Use Redis transactions for job processing
  - Implement dead-letter queues for failed jobs
  - Set appropriate TTLs for all Redis keys
  - Monitor queue depth and worker health

- **Performance**:
  - Use Redis pipelining for batch operations
  - Implement connection pooling for Redis clients
  - Cache frequently accessed user preferences
  - Use Redis Streams for high-volume event processing

- **Observability**:
  - Track all notification events in Sentry
  - Log delivery metrics to Vercel Analytics
  - Set up alerts for failed deliveries
  - Monitor Redis Cloud metrics and scaling

## Implementation Blueprint

### 1. Notification Service Core (/lib/services/NotificationService.ts)

```typescript
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import Retell from "retell-sdk";
import webpush from "web-push";
import { addJobToQueue } from "./QueueService";

interface NotificationPayload {
  userId: string;
  type: "medication" | "appointment" | "bill" | "team" | "health_alert";
  title: string;
  message: string;
  data?: Record<string, any>;
  urgency: "low" | "medium" | "high" | "critical";
  channels: ("push" | "email" | "sms" | "in_app")[];
  scheduledFor?: Date;
  expiresAt?: Date;
}

export class NotificationService {
  private static instance: NotificationService;
  private supabase: any;
  private resend: Resend;
  private retellClient: Retell;

  private constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    this.resend = new Resend(process.env.RESEND_API_KEY);

    this.retellClient = new Retell({
      apiKey: process.env.RETELL_API_KEY!,
    });

    // Initialize Web Push
    webpush.setVapidDetails(
      "mailto:notifications@caregivingcompanion.com",
      process.env.VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!,
    );
  }

  static getInstance(): NotificationService {
    if (!this.instance) {
      this.instance = new NotificationService();
    }
    return this.instance;
  }

  async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      // Get user preferences
      const { data: user } = await this.supabase
        .from("users")
        .select("notification_preferences, email, phone, timezone")
        .eq("id", payload.userId)
        .single();

      if (!user) {
        throw new Error("User not found");
      }

      // Check user preferences for this notification type
      const preferences = user.notification_preferences || {};
      const typePrefs = preferences[payload.type] || {};

      // Filter channels based on user preferences
      const enabledChannels = payload.channels.filter(
        (channel) => typePrefs[channel] !== false,
      );

      // Store notification in database
      const { data: notification } = await this.supabase
        .from("notifications")
        .insert({
          user_id: payload.userId,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          data: payload.data,
          urgency: payload.urgency,
          channels: enabledChannels,
          scheduled_for: payload.scheduledFor,
          expires_at: payload.expiresAt,
        })
        .select()
        .single();

      // Send via each enabled channel
      const promises = enabledChannels.map((channel) => {
        switch (channel) {
          case "push":
            return this.sendPushNotification(user, notification);
          case "email":
            return this.sendEmailNotification(user, notification);
          case "sms":
            return this.sendRetellSMS(user, notification);
          case "voice":
            return this.sendRetellVoiceCall(user, notification);
          case "in_app":
            return this.sendInAppNotification(user, notification);
          default:
            return Promise.resolve();
        }
      });

      await Promise.allSettled(promises);

      // Update notification status
      await this.supabase
        .from("notifications")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .eq("id", notification.id);
    } catch (error) {
      console.error("Notification send failed:", error);

      // Log failure for retry
      await this.supabase
        .from("notifications")
        .update({
          status: "failed",
          error_message: error.message,
        })
        .eq("id", payload.userId);

      throw error;
    }
  }

  private async sendPushNotification(
    user: any,
    notification: any,
  ): Promise<void> {
    try {
      // Get user's push subscriptions
      const { data: subscriptions } = await this.supabase
        .from("push_subscriptions")
        .select("subscription_data")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (!subscriptions || subscriptions.length === 0) {
        console.log("No push subscriptions found for user");
        return;
      }

      const payload = JSON.stringify({
        title: notification.title,
        body: notification.message,
        icon: "/icons/notification-icon.png",
        badge: "/icons/badge-icon.png",
        data: {
          notificationId: notification.id,
          type: notification.type,
          urgency: notification.urgency,
          url: `/notifications/${notification.id}`,
          ...notification.data,
        },
      });

      // Send to all subscriptions
      const promises = subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            JSON.parse(sub.subscription_data),
            payload,
          );
        } catch (error) {
          console.error("Push notification failed for subscription:", error);

          // Remove invalid subscription
          if (error.statusCode === 410) {
            await this.supabase
              .from("push_subscriptions")
              .update({ is_active: false })
              .eq("subscription_data", sub.subscription_data);
          }
        }
      });

      await Promise.allSettled(promises);
    } catch (error) {
      console.error("Push notification failed:", error);
      throw error;
    }
  }

  private async sendEmailNotification(
    user: any,
    notification: any,
  ): Promise<void> {
    try {
      if (!user.email) {
        console.log("No email address for user");
        return;
      }

      const template = this.getEmailTemplate(notification.type);

      await this.resend.emails.send({
        from: "Caregiving Companion <notifications@caregivingcompanion.com>",
        to: user.email,
        subject: notification.title,
        html: template.render({
          title: notification.title,
          message: notification.message,
          data: notification.data,
          user: user,
        }),
      });
    } catch (error) {
      console.error("Email notification failed:", error);
      throw error;
    }
  }

  private async sendSMSNotification(
    user: any,
    notification: any,
  ): Promise<void> {
    try {
      if (!user.phone) {
        console.log("No phone number for user");
        return;
      }

      const message = `${notification.title}\n\n${notification.message}`;

      // Use Retell AI for SMS notifications
      await this.sendSMS(user.phone, message);
    } catch (error) {
      console.error("SMS notification failed:", error);
      throw error;
    }
  }

  private async sendInAppNotification(
    user: any,
    notification: any,
  ): Promise<void> {
    try {
      // Broadcast to user's active sessions via Supabase Realtime
      await this.supabase.channel(`user:${user.id}`).send({
        type: "broadcast",
        event: "notification",
        payload: notification,
      });
    } catch (error) {
      console.error("In-app notification failed:", error);
      throw error;
    }
  }

  private getEmailTemplate(type: string) {
    // Return appropriate email template based on notification type
    const templates = {
      medication: {
        render: (data: any) => `
          <h2>Medication Reminder</h2>
          <p>It's time to take: <strong>${data.data?.medicationName}</strong></p>
          <p>Dosage: ${data.data?.dosage}</p>
          <p>Instructions: ${data.data?.instructions}</p>
          <a href="${process.env.APP_URL}/health/medications/log" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Log Dose</a>
        `,
      },
      appointment: {
        render: (data: any) => `
          <h2>Appointment Reminder</h2>
          <p><strong>${data.title}</strong></p>
          <p>When: ${data.data?.appointmentDate}</p>
          <p>Where: ${data.data?.location}</p>
          <p>Provider: ${data.data?.provider}</p>
          <a href="${process.env.APP_URL}/health/appointments" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Details</a>
        `,
      },
      bill: {
        render: (data: any) => `
          <h2>Bill Payment Due</h2>
          <p><strong>${data.data?.billName}</strong></p>
          <p>Amount: $${data.data?.amount}</p>
          <p>Due: ${data.data?.dueDate}</p>
          <a href="${process.env.APP_URL}/finances/bills" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Pay Now</a>
        `,
      },
    };

    return templates[type as keyof typeof templates] || templates.medication;
  }

  // Send SMS notification using Retell AI phone number
  // IMPORTANT: SMS requires approved business profile and campaign with Retell
  // SMS is only available for Retell Twilio numbers (US only currently)
  // Each user account gets one dedicated Retell phone number for both voice and SMS
  private async sendSMS(phoneNumber: string, message: string): Promise<void> {
    try {
      // Get user's dedicated Retell phone number from their account
      const userRetellNumber = await this.getUserRetellPhoneNumber();

      // Retell AI handles SMS through their phone numbers after SMS campaign approval
      // The SMS API is integrated with their phone number system
      const response = await this.retellClient.phoneNumber.sendSms({
        from: userRetellNumber, // User's dedicated Retell number (voice + SMS)
        to: phoneNumber,
        text: message,
      });

      console.log("SMS sent successfully via Retell AI:", response.message_id);

      // Track SMS usage for billing
      await this.trackUsage({
        type: "sms",
        segments: Math.ceil(message.length / 160),
        phoneNumber: userRetellNumber,
      });
    } catch (error) {
      console.error("Failed to send SMS via Retell AI:", error);
      // If SMS campaign not approved yet, fall back to voice call
      if (error.code === "SMS_NOT_ENABLED") {
        console.log("SMS not enabled, falling back to voice call");
        await this.sendVoiceCall(phoneNumber, message);
      }
      throw error;
    }
  }

  // Get the user's dedicated Retell phone number
  private async getUserRetellPhoneNumber(): Promise<string> {
    // Each user account has one dedicated Retell number for all communications
    const userId = await this.getCurrentUserId();
    const cacheKey = `retell-number:${userId}`;

    // Check cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached as string;

    // Get from database
    const { data: user } = await this.supabase
      .from("users")
      .select("retell_phone_number")
      .eq("id", userId)
      .single();

    if (!user?.retell_phone_number) {
      // Provision a new number if user doesn't have one yet
      const number = await this.provisionRetellPhoneNumber(userId);
      return number;
    }

    // Cache for 1 hour
    await this.redis.set(cacheKey, user.retell_phone_number, { ex: 3600 });
    return user.retell_phone_number;
  }

  // Send voice call using Retell AI
  private async sendVoiceCall(
    phoneNumber: string,
    message: string,
  ): Promise<void> {
    try {
      const call = await this.retellClient.call.createPhoneCall({
        from_number: process.env.RETELL_FROM_NUMBER!,
        to_number: phoneNumber,
        agent_id: process.env.RETELL_AGENT_ID!,
        retell_llm_dynamic_variables: {
          notification_message: message,
          call_type: "notification",
        },
      });

      console.log("Voice call initiated via Retell AI:", call.call_id);
    } catch (error) {
      console.error("Failed to send voice call via Retell AI:", error);
      throw error;
    }
  }
}
```

### 2. Intelligent Escalation Engine (/lib/services/EscalationEngine.ts)

```typescript
import { NotificationService } from "./NotificationService";
import Retell from "retell-sdk";
import { Cal } from "@calcom/sdk";
import { Queue, Worker } from "bullmq";
import { Redis } from "ioredis";

export class IntelligentEscalationEngine {
  private notificationService: NotificationService;
  private retellClient: Retell;
  private cal: Cal;
  private escalationQueue: Queue;
  private redis: Redis;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.retellClient = new Retell({ apiKey: process.env.RETELL_API_KEY! });
    this.cal = new Cal({ apiKey: process.env.CAL_API_KEY! });
    this.redis = new Redis(process.env.REDIS_URL!);

    this.escalationQueue = new Queue("escalation", {
      connection: this.redis,
    });

    this.initializeWorkers();
  }

  // Define escalation strategies based on urgency
  private getEscalationStrategy(urgency: string, type: string) {
    const strategies = {
      critical_medication: [
        { channel: "push", delay: 0 },
        { channel: "sms", delay: 5 * 60 * 1000 }, // 5 minutes
        { channel: "voice_call", delay: 10 * 60 * 1000 }, // 10 minutes
        { channel: "family_alert", delay: 15 * 60 * 1000 }, // 15 minutes
      ],
      routine_medication: [
        { channel: "push", delay: 0 },
        { channel: "sms", delay: 15 * 60 * 1000 }, // 15 minutes
        { channel: "voice_call", delay: 30 * 60 * 1000 }, // 30 minutes
      ],
      appointment_reminder: [
        { channel: "push", delay: 0 },
        { channel: "sms", delay: 60 * 60 * 1000 }, // 1 hour
        { channel: "voice_call", delay: 2 * 60 * 60 * 1000 }, // 2 hours
      ],
      wellness_check: [
        { channel: "in_app", delay: 0 },
        { channel: "sms", delay: 30 * 60 * 1000 }, // 30 minutes
        { channel: "voice_call", delay: 60 * 60 * 1000 }, // 1 hour
      ],
    };

    const key = urgency === "critical" ? `critical_${type}` : `routine_${type}`;
    return strategies[key] || strategies.routine_medication;
  }

  async initiateEscalation(params: {
    userId: string;
    notificationType: string;
    urgency: "low" | "medium" | "high" | "critical";
    message: string;
    metadata?: any;
  }) {
    const escalationId = `esc_${Date.now()}_${params.userId}`;

    // Get user's response patterns
    const patterns = await this.getUserResponsePatterns(params.userId);

    // Customize escalation based on patterns
    const strategy = this.customizeStrategy(
      this.getEscalationStrategy(params.urgency, params.notificationType),
      patterns,
    );

    // Store escalation state
    await this.redis.set(
      `escalation:${escalationId}`,
      JSON.stringify({
        ...params,
        strategy,
        currentLevel: 0,
        startedAt: new Date().toISOString(),
      }),
      "EX",
      24 * 60 * 60, // 24 hour expiry
    );

    // Start escalation
    await this.executeEscalationLevel(escalationId, 0);

    return escalationId;
  }

  private async executeEscalationLevel(escalationId: string, level: number) {
    const escalation = await this.redis.get(`escalation:${escalationId}`);
    if (!escalation) return;

    const data = JSON.parse(escalation);

    // Check if user has responded
    if (await this.hasUserResponded(data.userId, data.notificationType)) {
      await this.markEscalationComplete(escalationId, "user_responded");
      return;
    }

    // Check if we've exhausted all levels
    if (level >= data.strategy.length) {
      await this.markEscalationComplete(escalationId, "exhausted");
      return;
    }

    const currentStrategy = data.strategy[level];

    // Execute current level
    switch (currentStrategy.channel) {
      case "push":
      case "in_app":
        await this.notificationService.sendNotification({
          userId: data.userId,
          type: data.notificationType,
          title: "Reminder",
          message: data.message,
          urgency: data.urgency,
          channels: [currentStrategy.channel],
        });
        break;

      case "sms":
        await this.sendEscalationSMS(data);
        break;

      case "voice_call":
        await this.initiateEscalationCall(data);
        break;

      case "family_alert":
        await this.alertFamilyMembers(data);
        break;
    }

    // Update escalation state
    data.currentLevel = level;
    await this.redis.set(
      `escalation:${escalationId}`,
      JSON.stringify(data),
      "EX",
      24 * 60 * 60,
    );

    // Schedule next level if exists
    if (level + 1 < data.strategy.length) {
      const nextDelay = data.strategy[level + 1].delay - currentStrategy.delay;

      await this.escalationQueue.add(
        "next-level",
        { escalationId, level: level + 1 },
        { delay: nextDelay },
      );
    }
  }

  private async sendEscalationSMS(data: any) {
    const message = this.enhanceMessageForChannel(data.message, "sms", data);
    const userPhone = await this.getUserPhone(data.userId);

    // Use the unified sendSMS method that handles Retell phone numbers
    await this.sendSMS(userPhone, message);

    // Track escalation metadata
    await this.trackEscalation({
      escalationId: data.escalationId,
      level: data.currentLevel,
      channel: "sms",
      userId: data.userId,
    });
  }

  private async initiateEscalationCall(data: any) {
    // Use Retell AI to make a proactive call
    const call = await this.retell.calls.create({
      from_number: process.env.RETELL_FROM_NUMBER!,
      to_number: await this.getUserPhone(data.userId),
      agent_id: process.env.RETELL_AGENT_ID!,
      retell_llm_dynamic_variables: {
        purpose: "escalation",
        urgency: data.urgency,
        notificationType: data.notificationType,
        message: data.message,
        userName: await this.getUserName(data.userId),
        // Include context for natural conversation
        previousAttempts: data.currentLevel,
        metadata: data.metadata,
      },
    });

    // Log call in Cal.com for record keeping
    await this.cal.bookings.create({
      eventTypeId: process.env.CAL_ESCALATION_EVENT_ID!,
      name: "Escalation Call",
      email: "system@caregiving.com",
      start: new Date().toISOString(),
      end: new Date(Date.now() + 10 * 60000).toISOString(), // 10 min call
      metadata: {
        escalationId: data.escalationId,
        callId: call.call_id,
        automatic: true,
      },
    });
  }

  private async alertFamilyMembers(data: any) {
    const familyMembers = await this.getFamilyMembers(data.userId);

    for (const member of familyMembers) {
      // Send urgent notification to each family member
      await this.notificationService.sendNotification({
        userId: member.id,
        type: "family_alert",
        title: "Urgent: Care Alert",
        message: `${data.userName} hasn't responded to ${data.notificationType}. Please check in.`,
        urgency: "high",
        channels: ["push", "sms", "email"],
        data: {
          originalUserId: data.userId,
          escalationId: data.escalationId,
        },
      });
    }
  }

  private async getUserResponsePatterns(userId: string) {
    // Analyze historical response patterns
    const history = await this.redis.get(`patterns:${userId}`);

    if (!history) {
      return {
        preferredChannel: "push",
        averageResponseTime: 15 * 60 * 1000, // 15 minutes default
        bestTimeToContact: null,
        responseRateByChannel: {
          push: 0.5,
          sms: 0.7,
          voice_call: 0.9,
        },
      };
    }

    return JSON.parse(history);
  }

  private customizeStrategy(baseStrategy: any[], patterns: any) {
    // Adjust strategy based on user patterns
    const customized = [...baseStrategy];

    // If user responds better to SMS, prioritize it
    if (
      patterns.responseRateByChannel.sms > patterns.responseRateByChannel.push
    ) {
      // Swap push and SMS
      const pushIndex = customized.findIndex((s) => s.channel === "push");
      const smsIndex = customized.findIndex((s) => s.channel === "sms");
      if (pushIndex !== -1 && smsIndex !== -1) {
        [customized[pushIndex], customized[smsIndex]] = [
          customized[smsIndex],
          customized[pushIndex],
        ];
      }
    }

    // Adjust delays based on average response time
    if (patterns.averageResponseTime) {
      customized.forEach((level, index) => {
        if (index > 0) {
          level.delay = Math.min(
            level.delay,
            patterns.averageResponseTime * (index + 1),
          );
        }
      });
    }

    return customized;
  }

  private initializeWorkers() {
    new Worker(
      "escalation",
      async (job) => {
        if (job.name === "next-level") {
          const { escalationId, level } = job.data;
          await this.executeEscalationLevel(escalationId, level);
        }
      },
      {
        connection: this.redis,
      },
    );
  }
}
```

### 3. Background Job Queue (/lib/services/QueueService.ts)

```typescript
import Queue from "bull";
import Redis from "ioredis";
import { NotificationService } from "./NotificationService";
import { createClient } from "@supabase/supabase-js";

const redis = new Redis(process.env.REDIS_URL);

// Create job queues
export const notificationQueue = new Queue("notifications", {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
  },
});

export const reminderQueue = new Queue("reminders", {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
  },
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const notificationService = NotificationService.getInstance();

// Notification job processor
notificationQueue.process("send-notification", async (job) => {
  const { payload } = job.data;
  await notificationService.sendNotification(payload);
});

// Medication reminder processor
reminderQueue.process("medication-reminder", async (job) => {
  const { medicationId, userId } = job.data;

  // Get medication details
  const { data: medication } = await supabase
    .from("medications")
    .select("*, care_recipients(*)")
    .eq("id", medicationId)
    .single();

  if (!medication) {
    throw new Error("Medication not found");
  }

  // Check if already taken today
  const today = new Date().toISOString().split("T")[0];
  const { data: existingLog } = await supabase
    .from("medication_logs")
    .select("*")
    .eq("medication_id", medicationId)
    .gte("administered_at", `${today}T00:00:00Z`)
    .lt("administered_at", `${today}T23:59:59Z`)
    .eq("status", "given")
    .maybeSingle();

  if (existingLog) {
    console.log("Medication already taken today");
    return;
  }

  // Send reminder notification
  await notificationService.sendNotification({
    userId,
    type: "medication",
    title: "Medication Reminder",
    message: `Time to take ${medication.name} (${medication.dosage})`,
    data: {
      medicationId: medication.id,
      medicationName: medication.name,
      dosage: medication.dosage,
      instructions: medication.instructions,
      careRecipientName: medication.care_recipients?.full_name,
    },
    urgency: "high",
    channels: ["push", "in_app"],
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
  });
});

// Bill reminder processor
reminderQueue.process("bill-reminder", async (job) => {
  const { billId, userId, reminderType } = job.data;

  const { data: bill } = await supabase
    .from("bills")
    .select("*")
    .eq("id", billId)
    .single();

  if (!bill || bill.status === "paid") {
    return;
  }

  const daysUntilDue = Math.ceil(
    (new Date(bill.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  let title = "";
  let urgency: "low" | "medium" | "high" | "critical" = "medium";

  if (daysUntilDue < 0) {
    title = `Overdue: ${bill.payee}`;
    urgency = "critical";
  } else if (daysUntilDue === 0) {
    title = `Due Today: ${bill.payee}`;
    urgency = "high";
  } else if (daysUntilDue <= 3) {
    title = `Due Soon: ${bill.payee}`;
    urgency = "high";
  } else {
    title = `Upcoming: ${bill.payee}`;
    urgency = "medium";
  }

  await notificationService.sendNotification({
    userId,
    type: "bill",
    title,
    message: `$${bill.amount} due ${daysUntilDue === 0 ? "today" : `in ${daysUntilDue} days`}`,
    data: {
      billId: bill.id,
      billName: bill.payee,
      amount: bill.amount,
      dueDate: bill.due_date,
    },
    urgency,
    channels:
      urgency === "critical"
        ? ["push", "email", "sms", "in_app"]
        : ["push", "in_app"],
  });
});

// Appointment reminder processor
reminderQueue.process("appointment-reminder", async (job) => {
  const { appointmentId, userId, reminderType } = job.data;

  const { data: appointment } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", appointmentId)
    .single();

  if (!appointment || appointment.status === "cancelled") {
    return;
  }

  const hoursUntilAppointment = Math.ceil(
    (new Date(appointment.appointment_date).getTime() - Date.now()) /
      (1000 * 60 * 60),
  );

  let title = "";
  let message = "";

  if (reminderType === "24h") {
    title = "Tomorrow: " + appointment.title;
    message = `Your appointment is tomorrow at ${new Date(appointment.appointment_date).toLocaleTimeString()}`;
  } else if (reminderType === "1h") {
    title = "Soon: " + appointment.title;
    message = `Your appointment starts in 1 hour`;
  } else {
    title = "Now: " + appointment.title;
    message = `Your appointment is starting now`;
  }

  await notificationService.sendNotification({
    userId,
    type: "appointment",
    title,
    message,
    data: {
      appointmentId: appointment.id,
      appointmentDate: appointment.appointment_date,
      location: appointment.location,
      provider: appointment.provider,
    },
    urgency: reminderType === "now" ? "critical" : "high",
    channels: ["push", "in_app"],
  });
});

// Helper function to add jobs to queue
export async function addJobToQueue(
  queueName: "notifications" | "reminders",
  jobType: string,
  data: any,
  options: any = {},
) {
  const queue =
    queueName === "notifications" ? notificationQueue : reminderQueue;

  return queue.add(jobType, data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: 10,
    removeOnFail: 5,
    ...options,
  });
}
```

### 3. Scheduled Jobs Setup (/lib/services/SchedulerService.ts)

```typescript
import cron from "node-cron";
import { createClient } from "@supabase/supabase-js";
import { addJobToQueue } from "./QueueService";
import { addDays, addHours, startOfDay, endOfDay } from "date-fns";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export class SchedulerService {
  private static instance: SchedulerService;
  private tasks: cron.ScheduledTask[] = [];

  private constructor() {
    this.initializeScheduledJobs();
  }

  static getInstance(): SchedulerService {
    if (!this.instance) {
      this.instance = new SchedulerService();
    }
    return this.instance;
  }

  private initializeScheduledJobs() {
    // Medication reminders - every 15 minutes
    this.tasks.push(
      cron.schedule(
        "*/15 * * * *",
        () => {
          this.processMedicationReminders();
        },
        { scheduled: false },
      ),
    );

    // Bill reminders - daily at 9 AM
    this.tasks.push(
      cron.schedule(
        "0 9 * * *",
        () => {
          this.processBillReminders();
        },
        { scheduled: false },
      ),
    );

    // Appointment reminders - every hour
    this.tasks.push(
      cron.schedule(
        "0 * * * *",
        () => {
          this.processAppointmentReminders();
        },
        { scheduled: false },
      ),
    );

    // Health vitals reminders - daily at 8 AM
    this.tasks.push(
      cron.schedule(
        "0 8 * * *",
        () => {
          this.processVitalsReminders();
        },
        { scheduled: false },
      ),
    );

    // Cleanup old notifications - daily at 2 AM
    this.tasks.push(
      cron.schedule(
        "0 2 * * *",
        () => {
          this.cleanupOldNotifications();
        },
        { scheduled: false },
      ),
    );
  }

  start() {
    this.tasks.forEach((task) => task.start());
    console.log("Scheduler started with", this.tasks.length, "jobs");
  }

  stop() {
    this.tasks.forEach((task) => task.stop());
    console.log("Scheduler stopped");
  }

  private async processMedicationReminders() {
    try {
      // Get all active medications with schedules
      const { data: medications } = await supabase
        .from("medications")
        .select(
          `
          *,
          care_recipients!inner(*),
          organization_members!inner(user_id)
        `,
        )
        .eq("is_active", true);

      if (!medications) return;

      for (const medication of medications) {
        // Parse frequency to determine if reminder is due
        const shouldRemind = this.shouldSendMedicationReminder(medication);

        if (shouldRemind) {
          // Get all caregivers for this medication
          const userIds = medication.organization_members.map(
            (om: any) => om.user_id,
          );

          for (const userId of userIds) {
            await addJobToQueue("reminders", "medication-reminder", {
              medicationId: medication.id,
              userId,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error processing medication reminders:", error);
    }
  }

  private async processBillReminders() {
    try {
      const today = new Date();
      const nextWeek = addDays(today, 7);

      // Get bills due in the next week
      const { data: bills } = await supabase
        .from("bills")
        .select(
          `
          *,
          organization_members!inner(user_id)
        `,
        )
        .eq("status", "pending")
        .gte("due_date", today.toISOString().split("T")[0])
        .lte("due_date", nextWeek.toISOString().split("T")[0]);

      if (!bills) return;

      for (const bill of bills) {
        const daysUntilDue = Math.ceil(
          (new Date(bill.due_date).getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        // Send reminders at 7 days, 3 days, 1 day, and day of
        if ([7, 3, 1, 0].includes(daysUntilDue)) {
          const userIds = bill.organization_members.map(
            (om: any) => om.user_id,
          );

          for (const userId of userIds) {
            await addJobToQueue("reminders", "bill-reminder", {
              billId: bill.id,
              userId,
              reminderType: `${daysUntilDue}d`,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error processing bill reminders:", error);
    }
  }

  private async processAppointmentReminders() {
    try {
      const now = new Date();
      const next24Hours = addHours(now, 24);

      // Get appointments in the next 24 hours
      const { data: appointments } = await supabase
        .from("appointments")
        .select(
          `
          *,
          organization_members!inner(user_id)
        `,
        )
        .eq("status", "scheduled")
        .gte("appointment_date", now.toISOString())
        .lte("appointment_date", next24Hours.toISOString());

      if (!appointments) return;

      for (const appointment of appointments) {
        const hoursUntilAppointment = Math.ceil(
          (new Date(appointment.appointment_date).getTime() - now.getTime()) /
            (1000 * 60 * 60),
        );

        let reminderType = "";
        if (hoursUntilAppointment >= 23 && hoursUntilAppointment <= 25) {
          reminderType = "24h";
        } else if (
          hoursUntilAppointment >= 0.5 &&
          hoursUntilAppointment <= 1.5
        ) {
          reminderType = "1h";
        } else if (
          hoursUntilAppointment >= -0.25 &&
          hoursUntilAppointment <= 0.25
        ) {
          reminderType = "now";
        }

        if (reminderType) {
          const userIds = appointment.organization_members.map(
            (om: any) => om.user_id,
          );

          for (const userId of userIds) {
            await addJobToQueue("reminders", "appointment-reminder", {
              appointmentId: appointment.id,
              userId,
              reminderType,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error processing appointment reminders:", error);
    }
  }

  private async processVitalsReminders() {
    try {
      // Get users who should track vitals daily
      const { data: users } = await supabase
        .from("users")
        .select("*")
        .eq("vitals_reminder_enabled", true);

      if (!users) return;

      for (const user of users) {
        // Check if vitals were recorded today
        const today = new Date();
        const { data: todayVitals } = await supabase
          .from("vitals")
          .select("*")
          .eq("recorded_by", user.id)
          .gte("recorded_at", startOfDay(today).toISOString())
          .lte("recorded_at", endOfDay(today).toISOString());

        if (!todayVitals || todayVitals.length === 0) {
          await addJobToQueue("reminders", "vitals-reminder", {
            userId: user.id,
          });
        }
      }
    } catch (error) {
      console.error("Error processing vitals reminders:", error);
    }
  }

  private async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = addDays(new Date(), -30);

      // Delete old notifications
      await supabase
        .from("notifications")
        .delete()
        .lt("created_at", thirtyDaysAgo.toISOString());

      // Delete expired notifications
      await supabase
        .from("notifications")
        .delete()
        .lt("expires_at", new Date().toISOString());

      console.log("Cleaned up old notifications");
    } catch (error) {
      console.error("Error cleaning up notifications:", error);
    }
  }

  private shouldSendMedicationReminder(medication: any): boolean {
    // Parse medication frequency and determine if reminder is due
    const frequency = medication.frequency.toLowerCase();
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // For this example, assume simple frequencies
    if (frequency.includes("daily")) {
      // Send reminder at 9 AM if it's 9:00-9:14
      return currentHour === 9 && currentMinute < 15;
    } else if (frequency.includes("twice daily")) {
      // Send reminders at 9 AM and 6 PM
      return (currentHour === 9 || currentHour === 18) && currentMinute < 15;
    } else if (frequency.includes("three times daily")) {
      // Send reminders at 8 AM, 2 PM, and 8 PM
      return (
        (currentHour === 8 || currentHour === 14 || currentHour === 20) &&
        currentMinute < 15
      );
    }

    return false;
  }
}

// Initialize and start scheduler
if (process.env.NODE_ENV === "production") {
  const scheduler = SchedulerService.getInstance();
  scheduler.start();
}
```

### 4. Notification UI Components (/components/notifications/NotificationCenter.tsx)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, X, Check, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationItem } from './NotificationItem';
import { fetchNotifications, markAsRead, dismissNotification } from '@/lib/api/notifications';
import { useSupabase } from '@/hooks/useSupabase';
import { useUser } from '@clerk/nextjs';
import { format } from 'date-fns';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const { user } = useUser();
  const { supabase } = useSupabase();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: () => fetchNotifications({ filter }),
  });

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: dismissNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Real-time notification updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`user:${user.id}`)
      .on('broadcast', { event: 'notification' }, (payload) => {
        queryClient.setQueryData(['notifications', 'all'], (old: any) => [
          payload.payload,
          ...(old || []),
        ]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, supabase, queryClient]);

  const unreadCount = notifications?.filter(n => !n.read_at).length || 0;

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'medication', label: 'Medication' },
    { id: 'appointment', label: 'Appointments' },
    { id: 'bill', label: 'Bills' },
    { id: 'team', label: 'Team' },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'medication':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'appointment':
        return <Bell className="w-4 h-4 text-green-600" />;
      case 'bill':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 px-1 min-w-[1.25rem] h-5 text-xs bg-red-500">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-1 p-2 border-b border-gray-200 overflow-x-auto">
            {filters.map((filterOption) => (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id)}
                className={`px-3 py-1 text-sm rounded-lg whitespace-nowrap ${
                  filter === filterOption.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center p-2 border-b border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markReadMutation.mutate('all')}
              disabled={unreadCount === 0}
            >
              <Check className="w-4 h-4 mr-1" />
              Mark all read
            </Button>

            <span className="text-sm text-gray-500">
              {notifications?.length || 0} notifications
            </span>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : notifications?.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications?.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={() => markReadMutation.mutate(notification.id)}
                  onDismiss={() => dismissMutation.mutate(notification.id)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

### 5. API Routes for Notifications (/app/api/notifications/route.ts)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { NotificationService } from "@/lib/services/NotificationService";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (filter === "unread") {
      query = query.is("read_at", null);
    } else if (filter !== "all") {
      query = query.eq("type", filter);
    }

    const { data: notifications, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const notificationService = NotificationService.getInstance();

    await notificationService.sendNotification({
      userId,
      ...payload,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("id");
    const action = searchParams.get("action");

    if (action === "mark-read") {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notificationId)
        .eq("user_id", userId);

      if (error) throw error;
    } else if (action === "dismiss") {
      const { error } = await supabase
        .from("notifications")
        .update({ dismissed_at: new Date().toISOString() })
        .eq("id", notificationId)
        .eq("user_id", userId);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 },
    );
  }
}
```

## Task Checklist

### Core Notification System

- [ ] Build NotificationService with multi-channel delivery
- [ ] Implement queue system with Redis and Bull
- [ ] Create scheduled job processor with node-cron
- [ ] Set up email notifications with Resend
- [ ] Configure SMS/Voice notifications with Retell AI
- [ ] Implement push notifications with Web Push API

### Background Job Processing

- [ ] Medication reminder scheduling and delivery
- [ ] Bill payment alerts with escalation
- [ ] Appointment reminders (24h, 1h, now)
- [ ] Health vitals tracking reminders
- [ ] Team activity notifications
- [ ] Automated cleanup jobs

### User Interface Components

- [ ] NotificationCenter with real-time updates
- [ ] NotificationItem with action buttons
- [ ] Toast notifications for immediate alerts
- [ ] Notification preferences settings
- [ ] Snooze and dismiss functionality
- [ ] Notification history viewer

### API Integration

- [ ] Notification API routes for CRUD operations
- [ ] Webhook handlers for external services
- [ ] FCM token registration endpoints
- [ ] User preference management API
- [ ] Notification analytics and reporting
- [ ] Bulk notification operations

### Real-time Features

- [ ] Supabase realtime notification delivery
- [ ] Live notification count updates
- [ ] Team member presence indicators
- [ ] Instant messaging notifications
- [ ] Cross-device notification sync
- [ ] Connection recovery handling

### Security & Compliance

- [ ] User consent for notification channels
- [ ] GDPR compliance for notification data
- [ ] Rate limiting for notification sending
- [ ] Encryption for sensitive notification content
- [ ] Audit logging for all notifications
- [ ] Opt-out mechanisms for all channels

## Validation Loop

### Level 1: Service Testing

```bash
npm test -- services/NotificationService.test.ts
npm test -- services/QueueService.test.ts
npm test -- services/SchedulerService.test.ts
```

### Level 2: Integration Testing

```bash
npm run test:notification-delivery
npm run test:queue-processing
npm run test:real-time-updates
```

### Level 3: End-to-End Testing

```bash
npm run e2e:medication-reminders
npm run e2e:bill-notifications
npm run e2e:team-communications
```

### Level 4: Load Testing

```bash
npm run test:notification-scale
npm run test:queue-performance
npm run test:real-time-connections
```

## Success Criteria

- [ ] Notifications delivered within 30 seconds of trigger
- [ ] 99.9% delivery success rate for critical notifications
- [ ] Real-time updates appear within 500ms
- [ ] Queue processing handles 1000+ jobs per minute
- [ ] Email delivery rate > 95%
- [ ] SMS delivery rate > 98%
- [ ] Push notification delivery rate > 90%

## Common Gotchas

- Redis connection handling needs proper error recovery
- Email/SMS rate limits require exponential backoff
- Push notification tokens expire and need cleanup
- Time zone handling for scheduled notifications
- Queue job failures need retry logic with limits
- Real-time subscriptions can create memory leaks
