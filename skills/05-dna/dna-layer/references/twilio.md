# Twilio

**Category:** Communications & Telephony
**Service Type:** Official SDK (Voice, SMS, Video)
**Official Website:** https://twilio.com
**Documentation:** https://www.twilio.com/docs
**GitHub:** https://github.com/twilio/twilio-node

---

## Overview

Twilio provides **programmable voice, SMS, and video communications** for AI Coder applications. It's the **recommended telephony solution** for projects requiring phone calls, text messaging, or video conferencing.

**Why Twilio:**
- ✅ **Industry Standard** - Used by Uber, Airbnb, Lyft, and 10M+ developers
- ✅ **Global Reach** - Phone numbers in 180+ countries
- ✅ **Programmable Voice** - Make/receive calls with TwiML or AI
- ✅ **SMS/MMS** - Send text messages and media worldwide
- ✅ **WhatsApp/Signal** - Multi-channel messaging
- ✅ **Video** - WebRTC-based video conferencing
- ✅ **Voice Intelligence** - Transcription, recording, sentiment analysis
- ✅ **HIPAA Compliant** - BAA available for healthcare apps
- ✅ **Free Trial** - $15 credit for testing

---

## Key Features

### 1. Programmable Voice
- **Outbound Calls** - Initiate calls from your application
- **Inbound Calls** - Handle incoming calls with IVR/AI
- **Call Recording** - Record conversations for quality assurance
- **Call Forwarding** - Route calls to different numbers
- **Conference Calls** - Multi-party voice conferences
- **TwiML** - XML-based call flow control
- **SIP Integration** - Connect to existing phone systems

### 2. Programmable SMS
- **Send SMS** - Deliver text messages worldwide
- **Receive SMS** - Handle incoming messages via webhooks
- **MMS** - Send/receive images and media
- **Short Codes** - High-volume messaging (e.g., 555555)
- **Long Codes** - Standard phone numbers
- **Message Status** - Track delivery, read receipts

### 3. Programmable Messaging (Multi-Channel)
- **WhatsApp** - Business messaging on WhatsApp
- **Facebook Messenger** - Reach customers on Messenger
- **Chat** - In-app messaging
- **Conversations API** - Unified messaging across channels

### 4. Voice Intelligence
- **Transcription** - Convert call audio to text
- **Recording** - Store call recordings
- **Sentiment Analysis** - Detect customer emotions
- **Call Insights** - Analytics on call quality, duration

### 5. Verify (2FA)
- **SMS Verification** - Send OTP codes
- **Voice Verification** - Call-based verification
- **TOTP** - Time-based one-time passwords
- **Silent Network Auth** - Passwordless verification

---

## Installation

```bash
# Install Twilio SDK
npm install twilio

# TypeScript types (included in SDK)
# npm install @types/twilio (not needed, types bundled)
```

---

## Environment Variables

```bash
# Twilio Credentials (from https://console.twilio.com)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+15551234567

# Optional: For webhooks
TWILIO_WEBHOOK_URL=https://yourdomain.com/api/twilio/webhook

# Optional: For Video
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SECRET=your_api_key_secret
```

Get credentials: https://console.twilio.com/account/keys-credentials

---

## Quick Start: SMS

### 1. Send SMS

```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

async function sendSMS(to: string, message: string) {
  const result = await client.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: to, // E.164 format: +15551234567
    body: message,
  });

  console.log('Message SID:', result.sid);
  console.log('Status:', result.status);

  return result;
}

// Usage
await sendSMS('+15559876543', 'Hello from AI Coder!');
```

### 2. Receive SMS (Webhook)

```typescript
// app/api/twilio/sms/route.ts
import { NextRequest } from 'next/server';
import twilio from 'twilio';

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const from = formData.get('From') as string;
  const body = formData.get('Body') as string;
  const messageSid = formData.get('MessageSid') as string;

  console.log(`SMS from ${from}: ${body}`);

  // Process message (e.g., save to database, trigger AI response)
  await processSMS(from, body);

  // Respond with TwiML
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message('Thanks for your message! We received it.');

  return new Response(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  });
}

async function processSMS(from: string, body: string) {
  // Example: Save to Supabase
  await supabase.from('sms_messages').insert({
    from_number: from,
    body: body,
    received_at: new Date().toISOString(),
  });
}
```

### 3. Send MMS (Image Message)

```typescript
async function sendMMS(to: string, message: string, imageUrl: string) {
  const result = await client.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: to,
    body: message,
    mediaUrl: [imageUrl], // Can send multiple images
  });

  return result;
}

// Usage
await sendMMS(
  '+15559876543',
  'Here is your medication schedule:',
  'https://example.com/medication-chart.png'
);
```

---

## Quick Start: Voice Calls

### 1. Make Outbound Call

```typescript
async function makeCall(to: string, message: string) {
  const call = await client.calls.create({
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: to,
    url: `https://yourdomain.com/api/twilio/voice?message=${encodeURIComponent(message)}`,
  });

  console.log('Call SID:', call.sid);
  console.log('Status:', call.status);

  return call;
}

// Usage
await makeCall('+15559876543', 'This is a reminder to take your medication');
```

### 2. Voice Call Webhook (TwiML)

```typescript
// app/api/twilio/voice/route.ts
import { NextRequest } from 'next/server';
import twilio from 'twilio';

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const message = searchParams.get('message') || 'Hello, this is a test call';

  const twiml = new twilio.twiml.VoiceResponse();

  // Text-to-speech
  twiml.say(
    {
      voice: 'Polly.Joanna', // AWS Polly voice
      language: 'en-US',
    },
    message
  );

  // Gather user input (e.g., "Press 1 to confirm")
  const gather = twiml.gather({
    numDigits: 1,
    action: '/api/twilio/voice/gather',
  });

  gather.say('Press 1 to confirm, or 2 to snooze this reminder.');

  // If no input, repeat
  twiml.say('We did not receive your input. Goodbye.');

  return new Response(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  });
}
```

### 3. Handle User Input (DTMF/Keypad)

```typescript
// app/api/twilio/voice/gather/route.ts
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const digits = formData.get('Digits') as string;
  const callSid = formData.get('CallSid') as string;

  const twiml = new twilio.twiml.VoiceResponse();

  if (digits === '1') {
    twiml.say('Thank you for confirming. Have a great day!');
    // Log confirmation in database
    await logMedicationConfirmation(callSid);
  } else if (digits === '2') {
    twiml.say('Your reminder has been snoozed for 1 hour.');
    // Schedule follow-up call
    await snoozeReminder(callSid, 3600); // 1 hour
  } else {
    twiml.say('Invalid input. Goodbye.');
  }

  return new Response(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  });
}
```

### 4. Call Recording

```typescript
async function makeRecordedCall(to: string, webhookUrl: string) {
  const call = await client.calls.create({
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: to,
    url: webhookUrl,
    record: true, // Enable call recording
    recordingStatusCallback: '/api/twilio/recording-callback',
  });

  return call;
}

// Handle recording completion
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const recordingUrl = formData.get('RecordingUrl') as string;
  const callSid = formData.get('CallSid') as string;

  // Download and transcribe with Deepgram
  const transcript = await transcribeRecording(recordingUrl);

  // Save to database
  await supabase.from('call_recordings').insert({
    call_sid: callSid,
    recording_url: recordingUrl,
    transcript: transcript,
    created_at: new Date().toISOString(),
  });

  return Response.json({ success: true });
}
```

---

## CARE App Integration

### Proactive Medication Reminder Call

```typescript
// lib/care/medication-reminder.ts
import twilio from 'twilio';
import { createClient } from '@deepgram/sdk';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

export async function sendMedicationReminder(
  patientId: string,
  medicationName: string,
  phone: string
) {
  // 1. Generate personalized message with Deepgram TTS
  const message = `Hi, this is Sarah, your care assistant. It's time to take your ${medicationName}. Please press 1 when you have taken it.`;

  const ttsResponse = await deepgram.speak.request(
    { text: message },
    { model: 'aura-asteria-en', encoding: 'linear16', container: 'wav' }
  );

  // Upload audio to Vercel Blob
  const audioBuffer = await getAudioBuffer(await ttsResponse.getStream());
  const { url: audioUrl } = await put(`reminder-${Date.now()}.wav`, audioBuffer, {
    access: 'public',
  });

  // 2. Make Twilio call
  const call = await twilioClient.calls.create({
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: phone,
    url: `https://yourdomain.com/api/care/medication/twiml?audioUrl=${encodeURIComponent(audioUrl)}&patientId=${patientId}`,
  });

  // 3. Log call initiation
  await supabase.from('medication_reminders').insert({
    patient_id: patientId,
    call_sid: call.sid,
    medication_name: medicationName,
    initiated_at: new Date().toISOString(),
    status: 'pending',
  });

  return call;
}
```

### TwiML for Medication Reminder

```typescript
// app/api/care/medication/twiml/route.ts
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const audioUrl = searchParams.get('audioUrl')!;
  const patientId = searchParams.get('patientId')!;

  const twiml = new twilio.twiml.VoiceResponse();

  // Play personalized audio (Deepgram TTS)
  twiml.play(audioUrl);

  // Gather confirmation
  const gather = twiml.gather({
    numDigits: 1,
    action: `/api/care/medication/confirm?patientId=${patientId}`,
    timeout: 10,
  });

  gather.say({ voice: 'Polly.Joanna' }, 'Press 1 to confirm, or 2 to snooze.');

  // No input handling
  twiml.say('We did not receive your input. We will call you again in 30 minutes.');

  return new Response(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  });
}
```

### Escalation Engine (Notification → SMS → Call → Caregiver)

```typescript
// lib/care/escalation-engine.ts
export class EscalationEngine {
  async escalate(patientId: string, alertType: string, message: string) {
    // Level 1: In-app notification (via Supabase Realtime)
    await this.sendNotification(patientId, message);
    await this.sleep(300000); // Wait 5 minutes

    // Check if acknowledged
    if (await this.isAcknowledged(patientId, alertType)) return;

    // Level 2: SMS
    const patient = await this.getPatient(patientId);
    await this.sendSMS(patient.phone, message);
    await this.sleep(600000); // Wait 10 minutes

    if (await this.isAcknowledged(patientId, alertType)) return;

    // Level 3: Voice call
    await this.makeCall(patient.phone, message);
    await this.sleep(900000); // Wait 15 minutes

    if (await this.isAcknowledged(patientId, alertType)) return;

    // Level 4: Alert primary caregiver
    const caregiver = await this.getPrimaryCaregiver(patientId);
    await this.sendSMS(
      caregiver.phone,
      `URGENT: ${patient.name} has not responded to ${alertType} alert. Please check on them.`
    );
    await this.makeCall(
      caregiver.phone,
      `This is an urgent alert. ${patient.name} has not responded to a ${alertType} notification. Please check on them immediately.`
    );
  }

  private async sendSMS(phone: string, message: string) {
    return twilioClient.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phone,
      body: message,
    });
  }

  private async makeCall(phone: string, message: string) {
    return twilioClient.calls.create({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phone,
      url: `https://yourdomain.com/api/escalation/twiml?message=${encodeURIComponent(message)}`,
    });
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Daily Wellness Check Call

```typescript
// lib/wellness/daily-check.ts
export async function dailyWellnessCheck(patientId: string) {
  const patient = await getPatient(patientId);

  const call = await twilioClient.calls.create({
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: patient.phone,
    url: `https://yourdomain.com/api/wellness/check?patientId=${patientId}`,
    record: true, // Record for sentiment analysis
    recordingStatusCallback: '/api/wellness/process-recording',
  });

  return call;
}

// TwiML for wellness check
// app/api/wellness/check/route.ts
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patientId')!;

  const patient = await getPatient(patientId);

  const twiml = new twilio.twiml.VoiceResponse();

  twiml.say(
    { voice: 'Polly.Joanna' },
    `Good morning ${patient.firstName}, this is Sarah, your care assistant. How are you feeling today?`
  );

  // Record response (up to 60 seconds)
  twiml.record({
    action: `/api/wellness/process-response?patientId=${patientId}`,
    maxLength: 60,
    transcribe: false, // We'll use Deepgram for better accuracy
  });

  return new Response(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  });
}

// Process wellness check response
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const recordingUrl = formData.get('RecordingUrl') as string;
  const patientId = searchParams.get('patientId')!;

  // Transcribe with Deepgram
  const { result } = await deepgram.listen.prerecorded.transcribeUrl(
    { url: recordingUrl },
    {
      model: 'nova-2',
      sentiment: true, // Detect sentiment
      smart_format: true,
    }
  );

  const transcript = result.results.channels[0].alternatives[0].transcript;
  const sentiment = detectOverallSentiment(result); // "positive", "negative", "neutral"

  // Save wellness check
  await supabase.from('wellness_checks').insert({
    patient_id: patientId,
    check_type: 'daily_call',
    data: {
      transcript,
      sentiment,
      recording_url: recordingUrl,
    },
    checked_at: new Date().toISOString(),
  });

  // Alert caregiver if negative sentiment detected
  if (sentiment === 'negative') {
    await alertCaregiver(patientId, 'Patient reported negative wellness during daily check');
  }

  return Response.json({ success: true });
}
```

---

## Advanced Features

### 1. WhatsApp Business Messaging

```typescript
async function sendWhatsApp(to: string, message: string) {
  const result = await client.messages.create({
    from: 'whatsapp:+14155238886', // Twilio WhatsApp number
    to: `whatsapp:${to}`, // User's WhatsApp number
    body: message,
  });

  return result;
}

// Send WhatsApp with media
async function sendWhatsAppWithImage(to: string, message: string, imageUrl: string) {
  return client.messages.create({
    from: 'whatsapp:+14155238886',
    to: `whatsapp:${to}`,
    body: message,
    mediaUrl: [imageUrl],
  });
}
```

### 2. Conference Calls (Multi-Party)

```typescript
async function createConference(participants: string[]) {
  const conferenceName = `family-meeting-${Date.now()}`;

  // Call all participants
  for (const phone of participants) {
    await client.calls.create({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phone,
      url: `https://yourdomain.com/api/conference?name=${conferenceName}`,
    });
  }

  return conferenceName;
}

// TwiML for conference
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const conferenceName = searchParams.get('name')!;

  const twiml = new twilio.twiml.VoiceResponse();

  const dial = twiml.dial();
  dial.conference(
    {
      startConferenceOnEnter: true,
      endConferenceOnExit: false,
      record: 'record-from-start', // Record entire conference
    },
    conferenceName
  );

  return new Response(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  });
}
```

### 3. Call Forwarding / IVR (Interactive Voice Response)

```typescript
export async function POST(req: NextRequest) {
  const twiml = new twilio.twiml.VoiceResponse();

  twiml.say('Welcome to CARE App support.');

  const gather = twiml.gather({
    numDigits: 1,
    action: '/api/ivr/menu',
  });

  gather.say('Press 1 for medication support. Press 2 for appointment scheduling. Press 3 for emergency assistance.');

  return new Response(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  });
}

// Handle menu selection
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const digits = formData.get('Digits') as string;

  const twiml = new twilio.twiml.VoiceResponse();

  switch (digits) {
    case '1':
      // Forward to medication support
      twiml.dial('+15551234567'); // Support line
      break;
    case '2':
      // Handle with AI agent
      twiml.redirect('/api/agent/appointment');
      break;
    case '3':
      // Emergency - forward to 911 or emergency contact
      twiml.dial('911');
      break;
    default:
      twiml.say('Invalid option. Goodbye.');
  }

  return new Response(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  });
}
```

### 4. Verify (2FA / Phone Verification)

```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

// Send verification code
async function sendVerificationCode(phone: string) {
  const verification = await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
    .verifications.create({
      to: phone,
      channel: 'sms', // or 'call', 'whatsapp'
    });

  return verification.status; // "pending"
}

// Check verification code
async function checkVerificationCode(phone: string, code: string) {
  const verification = await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
    .verificationChecks.create({
      to: phone,
      code: code,
    });

  return verification.status; // "approved" or "failed"
}
```

---

## Best Practices

### 1. E.164 Phone Number Format

```typescript
// Always use E.164 format: +[country code][number]
const validNumber = '+15551234567'; // ✅ Correct
const invalidNumber = '(555) 123-4567'; // ❌ Wrong

// Normalize phone numbers
import { parsePhoneNumber } from 'libphonenumber-js';

function normalizePhone(phone: string, defaultCountry: string = 'US'): string {
  try {
    const parsed = parsePhoneNumber(phone, defaultCountry);
    return parsed.number; // Returns E.164 format
  } catch {
    throw new Error('Invalid phone number');
  }
}
```

### 2. Handle Webhook Security

```typescript
import twilio from 'twilio';

export async function POST(req: NextRequest) {
  // Verify webhook signature
  const signature = req.headers.get('x-twilio-signature')!;
  const url = req.url;

  const formData = await req.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    params[key] = value.toString();
  });

  const isValid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    signature,
    url,
    params
  );

  if (!isValid) {
    return Response.json({ error: 'Invalid signature' }, { status: 403 });
  }

  // Process webhook...
}
```

### 3. Error Handling

```typescript
try {
  const message = await client.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: phone,
    body: text,
  });

  console.log('Message sent:', message.sid);
} catch (error: any) {
  if (error.code === 21211) {
    console.error('Invalid phone number');
  } else if (error.code === 21408) {
    console.error('Permission denied (number not verified in trial mode)');
  } else if (error.code === 21610) {
    console.error('Number is unsubscribed');
  } else {
    console.error('Twilio error:', error.message);
  }

  throw error;
}
```

### 4. Rate Limiting

```typescript
// Twilio has default rate limits:
// - 1 message/second per phone number
// - 100 messages/second per account

// Use queue for high-volume sending
import { Queue } from '@upstash/qstash';

const queue = new Queue({
  token: process.env.QSTASH_TOKEN!,
});

async function sendBulkSMS(messages: Array<{ to: string; body: string }>) {
  for (const msg of messages) {
    await queue.publish({
      url: 'https://yourdomain.com/api/sms/send',
      body: JSON.stringify(msg),
    });

    // Rate limit: 1 message per second
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

### 5. Cost Optimization

```typescript
// Track SMS usage
async function sendSMSWithTracking(to: string, body: string) {
  const message = await client.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER!,
    to,
    body,
  });

  // Log cost (estimate: $0.0075/SMS in US)
  await supabase.from('sms_usage').insert({
    message_sid: message.sid,
    to_number: to,
    segments: message.numSegments, // SMS is charged per 160-char segment
    cost: message.numSegments * 0.0075,
    created_at: new Date().toISOString(),
  });

  return message;
}

// Use templates to reduce message length
const templates = {
  medReminder: (name: string, med: string) =>
    `Hi ${name}, time to take ${med}. Reply Y to confirm.`,
  // 65 characters = 1 SMS segment
};
```

---

## Security Best Practices

### 1. Secure Credentials

```typescript
// ❌ WRONG - Never expose credentials
'use client';
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Will be exposed!

// ✅ CORRECT - Use server-side API routes
// app/api/sms/route.ts
export async function POST(req: Request) {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );
  // ... send SMS
}
```

### 2. Validate Phone Numbers

```typescript
async function validatePhone(phone: string): Promise<boolean> {
  try {
    const lookup = await client.lookups.v2
      .phoneNumbers(phone)
      .fetch({ fields: 'line_type_intelligence' });

    // Check if number is valid and not VOIP (more secure)
    return lookup.valid && lookup.lineTypeIntelligence?.type !== 'voip';
  } catch {
    return false;
  }
}
```

### 3. Implement Opt-Out (REQUIRED by law)

```typescript
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const from = formData.get('From') as string;
  const body = (formData.get('Body') as string).toLowerCase();

  // Handle opt-out keywords (required by TCPA law)
  if (body.includes('stop') || body.includes('unsubscribe')) {
    await supabase.from('opt_outs').insert({
      phone_number: from,
      opted_out_at: new Date().toISOString(),
    });

    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message('You have been unsubscribed. Reply START to resubscribe.');

    return new Response(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  }

  // Process normal message...
}
```

---

## Cost Estimates

**Pricing (Pay-as-you-go):**
- **SMS (US):** $0.0079/message
- **Voice (US):** $0.0140/minute (inbound), $0.0130/minute (outbound)
- **Phone Number:** $1.15/month (US local)
- **WhatsApp:** $0.005/message (session-based pricing)

**CARE App Estimates (100 users):**
- **Daily wellness calls:** 100 × 2 min × 30 days = 6,000 minutes/month
- **Voice Cost:** 6,000 × $0.013 = $78/month
- **SMS reminders:** 100 × 3/day × 30 = 9,000 messages/month
- **SMS Cost:** 9,000 × $0.0079 = $71.10/month
- **Phone number:** $1.15/month
- **Total:** ~$150.25/month for 100 users

**Free Trial:**
- $15 credit (~1,000 SMS or 1,000 minutes)
- Enough for 1-2 months of development testing

---

## Monitoring & Debugging

### 1. Track All Communications

```typescript
import * as Sentry from '@sentry/nextjs';

async function sendSMS(to: string, body: string) {
  const transaction = Sentry.startTransaction({
    op: 'comms.sms',
    name: 'Send SMS',
  });

  try {
    const message = await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to,
      body,
    });

    transaction.setData('messageSid', message.sid);
    transaction.setData('status', message.status);
    transaction.finish();

    return message;
  } catch (error) {
    Sentry.captureException(error);
    transaction.finish();
    throw error;
  }
}
```

### 2. Monitor Delivery Status

```typescript
// app/api/twilio/status/route.ts
export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const messageSid = formData.get('MessageSid') as string;
  const status = formData.get('MessageStatus') as string;

  // Update database with delivery status
  await supabase
    .from('sms_messages')
    .update({ status })
    .eq('message_sid', messageSid);

  if (status === 'failed' || status === 'undelivered') {
    // Alert admin
    console.error(`Message ${messageSid} failed: ${status}`);
  }

  return Response.json({ success: true });
}

// When sending SMS, include statusCallback
await client.messages.create({
  from: process.env.TWILIO_PHONE_NUMBER!,
  to: phone,
  body: text,
  statusCallback: 'https://yourdomain.com/api/twilio/status',
});
```

---

## HIPAA Compliance

**For healthcare applications like CARE App:**

1. **Sign BAA (Business Associate Agreement)**
   - Required for HIPAA compliance
   - Request at: https://www.twilio.com/legal/hipaa

2. **Use Secure Endpoints**
```typescript
// Enable encryption at rest for recordings
await client.calls.create({
  from: process.env.TWILIO_PHONE_NUMBER!,
  to: phone,
  url: webhookUrl,
  record: true,
  recordingStatusCallback: '/api/recording',
  // Twilio automatically encrypts recordings for HIPAA customers
});
```

3. **Data Retention Policies**
```typescript
// Delete recordings after 30 days (HIPAA requirement)
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const recordings = await client.recordings.list({
  dateCreatedBefore: thirtyDaysAgo,
});

for (const recording of recordings) {
  await client.recordings(recording.sid).remove();
}
```

---

## Troubleshooting

### Issue 1: "Unable to create record" (21408)
```bash
# Trial accounts can only call/text verified numbers
# Solution: Verify number in console or upgrade account
https://console.twilio.com/verified-caller-ids
```

### Issue 2: Messages not delivering
```typescript
// Check message status
const message = await client.messages('SMxxxxxxxx').fetch();
console.log('Status:', message.status);
console.log('Error code:', message.errorCode);
console.log('Error message:', message.errorMessage);
```

### Issue 3: Webhook not receiving requests
```bash
# Use ngrok for local development
ngrok http 3000

# Update webhook URL in Twilio console
# https://abc123.ngrok.io/api/twilio/sms
```

---

## Resources

- **Official Docs:** https://www.twilio.com/docs
- **API Reference:** https://www.twilio.com/docs/api
- **Console:** https://console.twilio.com
- **Support:** https://support.twilio.com
- **Status Page:** https://status.twilio.com

---

## Next Steps

1. Sign up: https://www.twilio.com/try-twilio
2. Get phone number: https://console.twilio.com/phone-numbers
3. Install `twilio` package
4. Build voice/SMS features for CARE App
5. Sign BAA for HIPAA compliance (healthcare apps)

For CARE App telephony integration, see:
- [CARE App V3.0 PRP](../../.ai-coder/prps/care-app-v3-hybrid-open-source.md)
- [Week 5 Proactive Intelligence](../../.ai-coder/sessions/care-app-week1-quickstart.md)

---

**Last Updated:** 2025-10-23
**Status:** Production Ready
**HIPAA Compliance:** Available with BAA
