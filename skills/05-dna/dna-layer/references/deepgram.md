# Deepgram SDK

**Category:** Voice & Speech Processing
**Service Type:** Official SDK (Voice AI)
**Official Website:** https://deepgram.com
**Documentation:** https://developers.deepgram.com
**GitHub:** https://github.com/deepgram/deepgram-js-sdk

---

## Overview

Deepgram SDK provides **real-time speech-to-text (STT) and text-to-speech (TTS)** capabilities for voice-enabled AI applications. It's the **recommended voice processing solution** for AI Coder projects requiring voice interfaces.

**Why Deepgram:**
- ✅ **Template Reference** - Used in template-nextjslive-transcription
- ✅ **Real-Time Streaming** - WebSocket-based live transcription
- ✅ **High Accuracy** - 95%+ accuracy with AI-optimized models
- ✅ **Fast Processing** - <300ms latency for live transcription
- ✅ **Multi-Language** - 30+ languages supported
- ✅ **Speaker Diarization** - Identify different speakers
- ✅ **Custom Vocabulary** - Medical terms, names, technical jargon
- ✅ **Sentiment Analysis** - Detect emotions in speech
- ✅ **Generous Free Tier** - $200 credits for new accounts

---

## Key Features

### 1. Speech-to-Text (STT)
- **Live Streaming** - Real-time transcription via WebSocket
- **Pre-Recorded** - Transcribe audio files (MP3, WAV, FLAC, etc.)
- **Punctuation & Formatting** - Auto-capitalize, add punctuation
- **Diarization** - Separate speakers in conversation
- **Custom Vocabulary** - Add domain-specific terms
- **Timestamps** - Word-level timing data

### 2. Text-to-Speech (TTS)
- **Natural Voices** - 40+ realistic AI voices
- **Streaming Audio** - Real-time audio generation
- **Custom Voice Cloning** - Train on your own voice
- **Emotion Control** - Adjust tone, speed, pitch
- **SSML Support** - Fine-grained control over pronunciation

### 3. Audio Intelligence
- **Summarization** - Generate summaries of conversations
- **Topic Detection** - Identify key topics discussed
- **Sentiment Analysis** - Detect positive/negative/neutral tones
- **Entity Recognition** - Extract names, dates, locations
- **Intent Detection** - Understand user intentions

---

## Installation

```bash
# Install Deepgram SDK
npm install @deepgram/sdk

# Optional: Audio processing utilities
npm install mic  # For microphone input
npm install speaker  # For audio playback
```

---

## Environment Variables

```bash
# Deepgram API Key
DEEPGRAM_API_KEY=your_api_key_here

# Optional: Specific API URL (usually not needed)
DEEPGRAM_API_URL=https://api.deepgram.com
```

Get your API key: https://console.deepgram.com

---

## Quick Start: Speech-to-Text

### 1. Pre-Recorded Audio Transcription

```typescript
import { createClient } from '@deepgram/sdk';

const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

async function transcribeAudio(audioUrl: string) {
  const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
    {
      url: audioUrl,
    },
    {
      model: 'nova-2',
      smart_format: true,
      punctuate: true,
      diarize: true,
      language: 'en-US',
    }
  );

  if (error) throw error;

  const transcript = result.results.channels[0].alternatives[0].transcript;
  console.log('Transcript:', transcript);

  return transcript;
}

// Usage
await transcribeAudio('https://example.com/audio.mp3');
```

### 2. Live Streaming Transcription

```typescript
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

async function liveTranscription() {
  const connection = deepgram.listen.live({
    model: 'nova-2',
    language: 'en-US',
    smart_format: true,
    interim_results: true,
  });

  connection.on(LiveTranscriptionEvents.Open, () => {
    console.log('Connection opened');

    connection.on(LiveTranscriptionEvents.Transcript, (data) => {
      const transcript = data.channel.alternatives[0].transcript;

      if (transcript !== '') {
        console.log('Transcript:', transcript);
      }
    });

    connection.on(LiveTranscriptionEvents.Error, (error) => {
      console.error('Error:', error);
    });

    // Send audio data
    // Example: Stream from microphone
    const mic = require('mic');
    const micInstance = mic({
      rate: '16000',
      channels: '1',
      encoding: 'signed-integer',
    });

    const micInputStream = micInstance.getAudioStream();

    micInputStream.on('data', (data) => {
      connection.send(data);
    });

    micInstance.start();
  });
}
```

### 3. Next.js API Route (Server-Side)

```typescript
// app/api/transcribe/route.ts
import { createClient } from '@deepgram/sdk';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

  const formData = await req.formData();
  const audioFile = formData.get('audio') as File;

  if (!audioFile) {
    return Response.json({ error: 'No audio file provided' }, { status: 400 });
  }

  const buffer = Buffer.from(await audioFile.arrayBuffer());

  const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
    buffer,
    {
      model: 'nova-2',
      smart_format: true,
      punctuate: true,
    }
  );

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const transcript = result.results.channels[0].alternatives[0].transcript;

  return Response.json({ transcript });
}
```

---

## Quick Start: Text-to-Speech

### 1. Generate Audio from Text

```typescript
import { createClient } from '@deepgram/sdk';
import fs from 'fs';

const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

async function textToSpeech(text: string, outputPath: string) {
  const response = await deepgram.speak.request(
    { text },
    {
      model: 'aura-asteria-en',
      encoding: 'linear16',
      container: 'wav',
    }
  );

  const stream = await response.getStream();
  const buffer = await getAudioBuffer(stream);

  fs.writeFileSync(outputPath, buffer);
  console.log(`Audio saved to ${outputPath}`);
}

async function getAudioBuffer(response: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = response.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  return Buffer.concat(chunks);
}

// Usage
await textToSpeech('Hello, this is a test of Deepgram text to speech', 'output.wav');
```

### 2. Streaming TTS (Real-Time)

```typescript
import { createClient } from '@deepgram/sdk';

const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

async function streamTTS(text: string) {
  const response = await deepgram.speak.request(
    { text },
    {
      model: 'aura-asteria-en',
      encoding: 'linear16',
      container: 'wav',
    }
  );

  const stream = await response.getStream();
  const reader = stream.getReader();

  // Play audio in real-time (example with speaker library)
  const Speaker = require('speaker');
  const speaker = new Speaker({
    channels: 1,
    bitDepth: 16,
    sampleRate: 24000,
  });

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    speaker.write(value);
  }

  speaker.end();
}
```

---

## CARE App Integration

### Wake Word Detection + Voice Commands

```typescript
// lib/voice/sarah-voice-interface.ts
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

export class SarahVoiceInterface {
  private deepgram = createClient(process.env.DEEPGRAM_API_KEY!);
  private connection: any;
  private isWakeWordDetected = false;

  async startListening() {
    this.connection = this.deepgram.listen.live({
      model: 'nova-2',
      language: 'en-US',
      smart_format: true,
      interim_results: true,
      keywords: ['hey sarah:5'], // Boost "hey sarah" detection
    });

    this.connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
      const transcript = data.channel.alternatives[0].transcript.toLowerCase();

      // Wake word detection
      if (transcript.includes('hey sarah')) {
        this.isWakeWordDetected = true;
        this.speak('Yes, how can I help you?');
        return;
      }

      // Process commands if wake word detected
      if (this.isWakeWordDetected && transcript !== '') {
        this.processCommand(transcript);
        this.isWakeWordDetected = false;
      }
    });

    this.connection.on(LiveTranscriptionEvents.Error, (error: any) => {
      console.error('Deepgram error:', error);
    });
  }

  private async processCommand(command: string) {
    // Route to Vercel AI SDK agent
    const response = await fetch('/api/agent/sarah', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: command }],
        mode: 'voice',
      }),
    });

    const { text } = await response.json();
    await this.speak(text);
  }

  private async speak(text: string) {
    const response = await this.deepgram.speak.request(
      { text },
      {
        model: 'aura-asteria-en', // Warm, professional female voice
        encoding: 'linear16',
        container: 'wav',
      }
    );

    const stream = await response.getStream();
    // Play audio (implementation depends on platform)
    this.playAudio(stream);
  }

  private async playAudio(stream: ReadableStream<Uint8Array>) {
    // Web Audio API (browser)
    const audioContext = new AudioContext();
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const audioBuffer = await audioContext.decodeAudioData(
      Buffer.concat(chunks).buffer
    );

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  }

  stopListening() {
    this.connection?.finish();
  }
}
```

### Proactive Wellness Check Calls (Twilio + Deepgram)

```typescript
// lib/wellness/proactive-call.ts
import { createClient } from '@deepgram/sdk';
import twilio from 'twilio';

const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function initiateWellnessCheck(patientId: string, phone: string) {
  // 1. Start Twilio call
  const call = await twilioClient.calls.create({
    url: `https://yourdomain.com/api/wellness/twiml?patientId=${patientId}`,
    to: phone,
    from: process.env.TWILIO_PHONE_NUMBER!,
  });

  console.log('Wellness check call initiated:', call.sid);
}

// TwiML webhook for call flow
export async function handleWellnessCall(patientId: string) {
  // 1. Greet patient with TTS
  const greeting = await generateTTS(
    "Hi, this is Sarah, your care assistant. I'm calling for your daily wellness check. How are you feeling today?"
  );

  // 2. Listen for response
  // 3. Transcribe response
  // 4. Analyze sentiment and log data
  // 5. Ask follow-up questions based on response

  // Example TwiML response
  return `
    <?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Play>${greeting.audioUrl}</Play>
      <Record
        action="/api/wellness/process-response?patientId=${patientId}"
        transcribe="false"
        maxLength="30"
      />
    </Response>
  `;
}

async function generateTTS(text: string): Promise<{ audioUrl: string }> {
  const response = await deepgram.speak.request(
    { text },
    {
      model: 'aura-asteria-en',
      encoding: 'linear16',
      container: 'wav',
    }
  );

  const buffer = await getAudioBuffer(await response.getStream());

  // Upload to Vercel Blob or S3
  const { url } = await put(`wellness-${Date.now()}.wav`, buffer, {
    access: 'public',
  });

  return { audioUrl: url };
}
```

---

## Advanced Features

### 1. Speaker Diarization (Identify Speakers)

```typescript
const { result } = await deepgram.listen.prerecorded.transcribeUrl(
  { url: audioUrl },
  {
    model: 'nova-2',
    diarize: true, // Enable speaker diarization
    punctuate: true,
  }
);

// Access speaker-separated transcript
result.results.channels[0].alternatives[0].words.forEach((word: any) => {
  console.log(`Speaker ${word.speaker}: ${word.word}`);
});
```

### 2. Custom Vocabulary (Medical Terms)

```typescript
const { result } = await deepgram.listen.prerecorded.transcribeUrl(
  { url: audioUrl },
  {
    model: 'nova-2',
    keywords: [
      'acetaminophen:5',
      'hypertension:5',
      'metformin:5',
      'blood pressure:5',
    ], // Boost medical term recognition
  }
);
```

### 3. Sentiment Analysis

```typescript
const { result } = await deepgram.listen.prerecorded.transcribeUrl(
  { url: audioUrl },
  {
    model: 'nova-2',
    sentiment: true, // Enable sentiment detection
  }
);

result.results.channels[0].alternatives[0].words.forEach((word: any) => {
  if (word.sentiment) {
    console.log(`${word.word}: ${word.sentiment} (${word.sentiment_score})`);
  }
});
```

### 4. Summarization

```typescript
const { result } = await deepgram.listen.prerecorded.transcribeUrl(
  { url: audioUrl },
  {
    model: 'nova-2',
    summarize: 'v2', // Enable AI summarization
  }
);

const summary = result.results.summary;
console.log('Summary:', summary.short); // Brief summary
console.log('Details:', summary.text); // Detailed summary
```

### 5. Multi-Language Support

```typescript
// Auto-detect language
const { result } = await deepgram.listen.prerecorded.transcribeUrl(
  { url: audioUrl },
  {
    model: 'nova-2',
    detect_language: true,
  }
);

console.log('Detected language:', result.results.channels[0].detected_language);

// Or specify language
const spanishResult = await deepgram.listen.prerecorded.transcribeUrl(
  { url: audioUrl },
  { model: 'nova-2', language: 'es' } // Spanish
);
```

---

## Best Practices

### 1. Choose the Right Model

```typescript
// Best accuracy (recommended for production)
{ model: 'nova-2' } // Latest, most accurate

// Faster processing (lower latency)
{ model: 'base' }

// Cost-effective (legacy, cheaper)
{ model: 'general' }

// Specialized models
{ model: 'medical' } // Medical terminology
{ model: 'finance' } // Financial jargon
{ model: 'conversationalai' } // Optimized for chatbots
```

### 2. Audio Quality Optimization

```typescript
// For best results:
const options = {
  model: 'nova-2',
  smart_format: true,
  punctuate: true,
  diarize: false, // Only enable if needed (slower)

  // Audio parameters (if source is known)
  channels: 1, // Mono audio
  sample_rate: 16000, // 16kHz recommended for speech
  encoding: 'linear16', // WAV/PCM encoding
};
```

### 3. Error Handling

```typescript
try {
  const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
    { url: audioUrl },
    { model: 'nova-2' }
  );

  if (error) {
    console.error('Deepgram error:', error);
    // Fallback to alternative provider or cached response
    return cachedTranscript;
  }

  return result.results.channels[0].alternatives[0].transcript;
} catch (err) {
  console.error('Transcription failed:', err);
  throw new Error('Voice processing unavailable');
}
```

### 4. Cost Optimization

```typescript
// Cache transcripts (avoid re-processing)
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function transcribeWithCache(audioUrl: string) {
  const cacheKey = `transcript:${hash(audioUrl)}`;

  // Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) return cached;

  // Transcribe
  const { result } = await deepgram.listen.prerecorded.transcribeUrl(
    { url: audioUrl },
    { model: 'nova-2' }
  );

  const transcript = result.results.channels[0].alternatives[0].transcript;

  // Cache for 24 hours
  await redis.set(cacheKey, transcript, { ex: 86400 });

  return transcript;
}
```

### 5. Real-Time Latency Optimization

```typescript
// Use interim results for faster UX
const connection = deepgram.listen.live({
  model: 'nova-2',
  interim_results: true, // Get partial results while speaking
  endpointing: 300, // Milliseconds of silence before finalizing
});

connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
  const transcript = data.channel.alternatives[0].transcript;
  const isFinal = data.is_final;

  if (isFinal) {
    console.log('Final:', transcript);
    // Process command
  } else {
    console.log('Interim:', transcript);
    // Show live feedback to user
  }
});
```

---

## Security Best Practices

### 1. Secure API Keys

```typescript
// ❌ WRONG - Never expose in client
'use client';
const apiKey = process.env.DEEPGRAM_API_KEY; // Will be exposed!

// ✅ CORRECT - Use server-side API routes
// app/api/transcribe/route.ts
export async function POST(req: Request) {
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);
  // ... transcription logic
}
```

### 2. Validate Audio Input

```typescript
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
const ALLOWED_TYPES = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/flac'];

export async function POST(req: Request) {
  const formData = await req.formData();
  const audioFile = formData.get('audio') as File;

  if (!audioFile) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  if (audioFile.size > MAX_FILE_SIZE) {
    return Response.json({ error: 'File too large' }, { status: 413 });
  }

  if (!ALLOWED_TYPES.includes(audioFile.type)) {
    return Response.json({ error: 'Invalid file type' }, { status: 400 });
  }

  // Process...
}
```

### 3. Rate Limiting (Arcjet)

```typescript
import arcjet, { tokenBucket } from '@arcjet/next';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    tokenBucket({
      mode: 'LIVE',
      refillRate: 20, // 20 transcriptions
      interval: 60, // per minute
      capacity: 40,
    }),
  ],
});

export async function POST(req: Request) {
  const decision = await aj.protect(req);
  if (decision.isDenied()) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // Process transcription
}
```

---

## Templates Using Deepgram

- **template-nextjslive-transcription** - Live audio transcription with Deepgram
- **template-nextjs-ai-chatbot** - Voice chat integration (optional feature)

See: [Template Catalog](../templates/vercel-templates-catalog.md)

---

## Cost Estimates

**Pricing (Pay-as-you-go):**
- **Speech-to-Text:** $0.0043/minute (~$0.26/hour)
- **Text-to-Speech:** $0.015/1K characters (~$1.50 per 100K words)
- **Free Tier:** $200 credits for new accounts

**CARE App Estimates (100 users):**
- **Daily wellness calls:** 100 calls × 2 min × 30 days = 6,000 minutes/month
- **STT Cost:** 6,000 × $0.0043 = $25.80/month
- **TTS Cost:** ~50K characters/month = $0.75/month
- **Total:** ~$26.55/month for 100 users

**Development (Testing):**
- Free $200 credits = ~46,000 minutes of transcription
- Enough for 3-6 months of development

---

## Monitoring & Debugging

### 1. Log All Requests

```typescript
import * as Sentry from '@sentry/nextjs';

async function transcribe(audioUrl: string) {
  const transaction = Sentry.startTransaction({
    op: 'voice.transcribe',
    name: 'Deepgram Transcription',
  });

  try {
    const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
      { url: audioUrl },
      { model: 'nova-2' }
    );

    if (error) throw error;

    transaction.setData('characters', result.results.channels[0].alternatives[0].transcript.length);
    transaction.finish();

    return result;
  } catch (error) {
    Sentry.captureException(error);
    transaction.finish();
    throw error;
  }
}
```

### 2. Track Usage

```typescript
// Track Deepgram usage in database
await supabase.from('voice_usage').insert({
  user_id: userId,
  type: 'stt', // or 'tts'
  duration_seconds: audioDuration,
  characters: transcriptLength,
  cost: calculatedCost,
  created_at: new Date().toISOString(),
});
```

---

## Troubleshooting

### Issue 1: "Invalid API Key"
```bash
# Verify API key is set
echo $DEEPGRAM_API_KEY

# Get new key from https://console.deepgram.com
```

### Issue 2: Poor Transcription Accuracy
```typescript
// Try these improvements:
{
  model: 'nova-2', // Use latest model
  smart_format: true,
  punctuate: true,
  keywords: ['custom', 'terms:5'], // Boost custom vocabulary
  language: 'en-US', // Specify language instead of auto-detect
}
```

### Issue 3: WebSocket Connection Failures
```typescript
// Add reconnection logic
let reconnectAttempts = 0;
const MAX_RECONNECT = 5;

connection.on(LiveTranscriptionEvents.Close, () => {
  if (reconnectAttempts < MAX_RECONNECT) {
    reconnectAttempts++;
    setTimeout(() => startListening(), 1000 * reconnectAttempts);
  }
});
```

---

## Resources

- **Official Docs:** https://developers.deepgram.com
- **API Reference:** https://developers.deepgram.com/reference
- **Playground:** https://playground.deepgram.com
- **Discord Community:** https://discord.gg/deepgram
- **Status Page:** https://status.deepgram.com

---

## Next Steps

1. Get API key from https://console.deepgram.com
2. Install `@deepgram/sdk` package
3. Choose template: template-nextjslive-transcription
4. Build voice-enabled features (wake words, commands, wellness checks)
5. Monitor usage and optimize costs

For CARE App voice integration, see:
- [CARE App V3.0 PRP](../../.ai-coder/prps/care-app-v3-hybrid-open-source.md)
- [Week 2 Voice Implementation](../../.ai-coder/sessions/care-app-week1-quickstart.md)

---

**Last Updated:** 2025-10-23
**Status:** Production Ready
**Template Reference:** template-nextjslive-transcription
