# Phone Number Management PRP - Unified Communication Channel

## Goal

Implement a comprehensive phone number provisioning and management system where each user account gets ONE dedicated Retell AI phone number that handles voice calls, SMS, and serves as their consistent contact point with their AI caregiving companion.

## Why

- **One Number, All Channels**: Users have a single phone number for all interactions
- **Consistent Identity**: The AI companion always calls/texts from the same number
- **SMS Campaign Compliance**: Properly manage SMS campaign requirements for healthcare
- **Cost Efficiency**: One number per account instead of multiple numbers
- **Trust Building**: Users recognize and trust their companion's phone number

## What (User-Visible Behavior)

- **Personal Phone Number**: "Your companion's number is (415) 555-0123"
- **Save to Contacts**: Users can save their companion as a contact
- **Incoming Calls**: See "Sarah (Your Companion)" when receiving calls
- **Text Conversations**: Send and receive SMS with the same number
- **Number Portability**: Keep the same number even if upgrading plans

## All Needed Context

### Retell AI SMS Requirements

- Business profile approval required (one-time, free)
- SMS campaign approval required ($4 for low-volume, $45 for standard)
- Currently limited to US Twilio numbers only
- Must match actual message content to approved campaign
- Violations can result in number/account suspension

### Documentation References

- Retell SMS Setup: https://docs.retellai.com/deploy/enable-sms
- Retell Phone Numbers API: https://docs.retellai.com/api-reference/phone-number
- Twilio SMS Compliance: https://www.twilio.com/docs/sms/compliance

## Implementation Blueprint

### 1. Database Schema for Phone Numbers

```sql
-- Add to users table
ALTER TABLE users ADD COLUMN retell_phone_number VARCHAR(20);
ALTER TABLE users ADD COLUMN retell_phone_sid VARCHAR(50);
ALTER TABLE users ADD COLUMN phone_number_provisioned_at TIMESTAMP;
ALTER TABLE users ADD COLUMN sms_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN sms_campaign_approved_at TIMESTAMP;

-- Phone number usage tracking
CREATE TABLE phone_number_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  phone_number VARCHAR(20),
  month DATE,
  voice_minutes INTEGER DEFAULT 0,
  sms_segments INTEGER DEFAULT 0,
  incoming_calls INTEGER DEFAULT 0,
  outgoing_calls INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, phone_number, month)
);

-- SMS campaign status
CREATE TABLE sms_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id VARCHAR(100),
  brand_type VARCHAR(20) CHECK (brand_type IN ('low_volume', 'standard')),
  status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  use_case TEXT,
  sample_messages JSONB,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Phone Number Provisioning Service (/lib/phone-number-service.ts)

```typescript
import Retell from "retell-sdk";
import { createClient } from "@supabase/supabase-js";
import * as Sentry from "@sentry/nextjs";

export class PhoneNumberService {
  private retell: Retell;
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    this.retell = new Retell({
      apiKey: process.env.RETELL_API_KEY!,
    });
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  /**
   * Provision a dedicated phone number for a user account
   * This number will handle both voice and SMS communications
   */
  async provisionPhoneNumber(
    userId: string,
    preferences?: {
      areaCode?: string;
      contains?: string;
    },
  ): Promise<string> {
    try {
      // Check if user already has a number
      const { data: user } = await this.supabase
        .from("users")
        .select("retell_phone_number, subscription_tier")
        .eq("id", userId)
        .single();

      if (user?.retell_phone_number) {
        console.log("User already has phone number:", user.retell_phone_number);
        return user.retell_phone_number;
      }

      // Search for available numbers
      const availableNumbers = await this.retell.phoneNumber.search({
        area_code:
          preferences?.areaCode || process.env.RETELL_DEFAULT_AREA_CODE,
        contains: preferences?.contains,
        country: "US", // Currently only US numbers support SMS
        capabilities: ["voice", "sms"], // Ensure number supports both
        limit: 10,
      });

      if (!availableNumbers.phone_numbers?.length) {
        throw new Error("No phone numbers available in requested area");
      }

      // Select the first available number
      const selectedNumber = availableNumbers.phone_numbers[0];

      // Purchase the number
      const purchasedNumber = await this.retell.phoneNumber.purchase({
        phone_number: selectedNumber.phone_number,
        agent_id: process.env.RETELL_AGENT_ID!, // Link to default agent
      });

      // Configure the number for both voice and SMS
      await this.configurePhoneNumber(purchasedNumber.phone_number, userId);

      // Save to database
      await this.supabase
        .from("users")
        .update({
          retell_phone_number: purchasedNumber.phone_number,
          retell_phone_sid: purchasedNumber.sid,
          phone_number_provisioned_at: new Date().toISOString(),
          sms_enabled: await this.checkSMSCampaignStatus(),
        })
        .eq("id", userId);

      // Initialize usage tracking
      await this.initializeUsageTracking(userId, purchasedNumber.phone_number);

      console.log(
        `Provisioned phone number ${purchasedNumber.phone_number} for user ${userId}`,
      );
      return purchasedNumber.phone_number;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { operation: "phone_number_provisioning" },
        extra: { userId, preferences },
      });
      throw error;
    }
  }

  /**
   * Configure phone number for voice and SMS
   */
  private async configurePhoneNumber(
    phoneNumber: string,
    userId: string,
  ): Promise<void> {
    // Configure voice settings
    await this.retell.phoneNumber.update(phoneNumber, {
      agent_id: process.env.RETELL_AGENT_ID!,
      inbound_action: "transfer_to_agent",
      outbound_enabled: true,
      webhook_url: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/retell/voice`,
    });

    // Configure SMS settings (if campaign approved)
    if (await this.checkSMSCampaignStatus()) {
      await this.configureSMS(phoneNumber, userId);
    }
  }

  /**
   * Configure SMS for a phone number
   */
  private async configureSMS(
    phoneNumber: string,
    userId: string,
  ): Promise<void> {
    try {
      // SMS webhook configuration
      await this.retell.phoneNumber.updateSmsSettings(phoneNumber, {
        sms_webhook_url: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/retell/sms`,
        sms_fallback_url: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/retell/sms-fallback`,
        campaign_id: process.env.RETELL_SMS_CAMPAIGN_ID,
      });

      // Update user record
      await this.supabase
        .from("users")
        .update({ sms_enabled: true })
        .eq("id", userId);
    } catch (error) {
      console.error("Failed to configure SMS:", error);
      // SMS configuration failure is not critical - voice still works
    }
  }

  /**
   * Check if SMS campaign is approved
   */
  async checkSMSCampaignStatus(): Promise<boolean> {
    try {
      const { data: campaign } = await this.supabase
        .from("sms_campaigns")
        .select("status")
        .eq("campaign_id", process.env.RETELL_SMS_CAMPAIGN_ID)
        .single();

      return campaign?.status === "approved";
    } catch {
      return false;
    }
  }

  /**
   * Send SMS using user's dedicated Retell number
   */
  async sendSMS(
    fromUserId: string,
    toNumber: string,
    message: string,
  ): Promise<void> {
    try {
      // Get user's Retell number
      const { data: user } = await this.supabase
        .from("users")
        .select("retell_phone_number, sms_enabled")
        .eq("id", fromUserId)
        .single();

      if (!user?.retell_phone_number) {
        throw new Error("User does not have a provisioned phone number");
      }

      if (!user.sms_enabled) {
        throw new Error("SMS not enabled for this account");
      }

      // Send SMS through Retell
      const response = await this.retell.phoneNumber.sendSms({
        from: user.retell_phone_number,
        to: toNumber,
        body: message,
      });

      // Track usage
      await this.trackSMSUsage(fromUserId, user.retell_phone_number, message);

      console.log("SMS sent:", response.sid);
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }

  /**
   * Track SMS usage for billing
   */
  private async trackSMSUsage(
    userId: string,
    phoneNumber: string,
    message: string,
  ): Promise<void> {
    const segments = Math.ceil(message.length / 160);
    const currentMonth = new Date().toISOString().slice(0, 7) + "-01";

    await this.supabase.rpc("increment_phone_usage", {
      p_user_id: userId,
      p_phone_number: phoneNumber,
      p_month: currentMonth,
      p_sms_segments: segments,
    });
  }

  /**
   * Initialize usage tracking for a new phone number
   */
  private async initializeUsageTracking(
    userId: string,
    phoneNumber: string,
  ): Promise<void> {
    const currentMonth = new Date().toISOString().slice(0, 7) + "-01";

    await this.supabase.from("phone_number_usage").upsert({
      user_id: userId,
      phone_number: phoneNumber,
      month: currentMonth,
      voice_minutes: 0,
      sms_segments: 0,
      incoming_calls: 0,
      outgoing_calls: 0,
    });
  }

  /**
   * Handle incoming SMS webhook
   */
  async handleIncomingSMS(data: {
    from: string;
    to: string;
    body: string;
    messageSid: string;
  }): Promise<void> {
    try {
      // Find user by their Retell number
      const { data: user } = await this.supabase
        .from("users")
        .select("id")
        .eq("retell_phone_number", data.to)
        .single();

      if (!user) {
        console.error("No user found for phone number:", data.to);
        return;
      }

      // Process the SMS through the unified agent
      await this.processIncomingSMSWithAgent(user.id, data.from, data.body);
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  /**
   * Process incoming SMS with the unified agent
   */
  private async processIncomingSMSWithAgent(
    userId: string,
    fromNumber: string,
    message: string,
  ): Promise<void> {
    // This will be handled by the UnifiedCaregivingCompanion
    // The agent maintains context across all channels
    const response = await fetch("/api/agent/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        channel: "sms",
        message,
        metadata: {
          fromNumber,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    const agentResponse = await response.json();

    // Send agent's response back via SMS
    await this.sendSMS(userId, fromNumber, agentResponse.message);
  }
}
```

### 3. API Endpoint for Phone Number Provisioning (/app/api/phone-number/provision/route.ts)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { PhoneNumberService } from "@/lib/phone-number-service";
import { auth } from "@clerk/nextjs";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { areaCode, contains } = await req.json();

    const service = new PhoneNumberService();
    const phoneNumber = await service.provisionPhoneNumber(userId, {
      areaCode,
      contains,
    });

    return NextResponse.json({
      success: true,
      phoneNumber,
      message: "Phone number provisioned successfully",
    });
  } catch (error) {
    console.error("Phone provisioning error:", error);
    return NextResponse.json(
      { error: "Failed to provision phone number" },
      { status: 500 },
    );
  }
}
```

### 4. SMS Webhook Handler (/app/api/webhooks/retell/sms/route.ts)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { PhoneNumberService } from "@/lib/phone-number-service";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature
    const signature = req.headers.get("x-retell-signature");
    const body = await req.text();

    if (!verifyWebhookSignature(body, signature!)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(body);
    const service = new PhoneNumberService();

    // Handle incoming SMS
    if (data.type === "sms.received") {
      await service.handleIncomingSMS({
        from: data.from,
        to: data.to,
        body: data.body,
        messageSid: data.message_sid,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SMS webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

function verifyWebhookSignature(payload: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RETELL_WEBHOOK_SECRET!)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}
```

### 5. User Interface Component (/components/settings/PhoneNumberSettings.tsx)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Phone, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function PhoneNumberSettings({ userId }: { userId: string }) {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPhoneNumber();
  }, [userId]);

  const fetchPhoneNumber = async () => {
    const response = await fetch('/api/phone-number/status');
    const data = await response.json();
    setPhoneNumber(data.phoneNumber);
    setSmsEnabled(data.smsEnabled);
  };

  const provisionNumber = async () => {
    setIsProvisioning(true);
    try {
      const response = await fetch('/api/phone-number/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ areaCode: '415' }),
      });

      const data = await response.json();
      if (data.success) {
        setPhoneNumber(data.phoneNumber);
        toast({
          title: 'Phone number provisioned!',
          description: `Your companion's number is ${data.phoneNumber}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Provisioning failed',
        description: 'Unable to provision phone number. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProvisioning(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Your Companion's Phone Number</h3>

      {phoneNumber ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5" />
              <span className="font-mono text-lg">{phoneNumber}</span>
            </div>
            <Button variant="outline" size="sm">
              Add to Contacts
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Voice Calls Enabled</span>
            </div>
            <div className="flex items-center gap-2">
              {smsEnabled ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">SMS Enabled</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">SMS Pending Approval</span>
                </>
              )}
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              Save this number to your contacts as "Sarah (Caregiver Companion)"
            </p>
            <p className="text-sm text-muted-foreground">
              You can call or text this number anytime to reach your companion.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Phone className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            Get a dedicated phone number for your AI companion
          </p>
          <Button
            onClick={provisionNumber}
            disabled={isProvisioning}
          >
            {isProvisioning ? 'Provisioning...' : 'Get Phone Number'}
          </Button>
        </div>
      )}
    </Card>
  );
}
```

## Validation Loop

### Syntax & Type Check

```bash
npm run type-check
npm run lint
```

### Component Testing

```bash
npm run test -- phone-number-service.test.ts
```

### Integration Testing

```bash
# Test phone number provisioning
curl -X POST http://localhost:3000/api/phone-number/provision \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"areaCode": "415"}'

# Test SMS sending
curl -X POST http://localhost:3000/api/phone-number/send-sms \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to": "+14155551234", "message": "Test message from your companion"}'
```

## Task Checklist

### Setup & Configuration

- [ ] Apply for Retell SMS business profile
- [ ] Submit SMS campaign for approval
- [ ] Configure SMS webhook endpoints
- [ ] Set up phone number database schema

### Implementation

- [ ] Create PhoneNumberService class
- [ ] Implement number provisioning flow
- [ ] Build SMS sending/receiving handlers
- [ ] Create webhook endpoints
- [ ] Add usage tracking

### User Interface

- [ ] Phone number settings page
- [ ] Add to contacts functionality
- [ ] SMS conversation interface
- [ ] Usage dashboard

### Testing & Validation

- [ ] Test number provisioning
- [ ] Verify SMS sending/receiving
- [ ] Test webhook signatures
- [ ] Validate usage tracking
- [ ] Test error handling

### Documentation

- [ ] SMS campaign application guide
- [ ] User setup instructions
- [ ] Troubleshooting guide
- [ ] Compliance documentation

## Success Metrics

- Each user has one dedicated phone number
- SMS delivery rate > 98%
- Voice call connection rate > 95%
- Users save companion number to contacts
- Consistent companion identity across channels
