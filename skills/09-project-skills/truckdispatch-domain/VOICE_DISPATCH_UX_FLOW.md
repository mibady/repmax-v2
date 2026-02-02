# Voice Dispatch UX Flow - TruckDispatch Pro

## Overview

The Voice Dispatch Assistant uses Google's Gemini Multimodal Live API to provide hands-free dispatch operations through:

- **Voice Input** → Natural language commands
- **Voice Output** → Spoken responses
- **Camera Input** → Document scanning (rate cons, BOLs, insurance)
- **Function Calling** → 15+ dispatch operations

---

## User Journey Flows

### Flow 1: First-Time Connection

```
┌─────────────────────────────────────────────────────────────────┐
│                      INITIAL STATE                              │
├─────────────────────────────────────────────────────────────────┤
│  User lands on /voice page                                      │
│  ↓                                                              │
│  System checks GEMINI_API_KEY configuration                     │
│  ↓                                                              │
│  ┌──────────────┐     ┌──────────────┐                         │
│  │ Key Missing  │     │ Key Found    │                         │
│  └──────┬───────┘     └──────┬───────┘                         │
│         ↓                    ↓                                  │
│  Show "Get API Key"    Show "Gemini Available"                 │
│  link to Google AI     + Connect button                        │
│  Studio                                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Flow 2: Voice Session Start

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONNECTION FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User clicks GREEN PHONE button                                 │
│  ↓                                                              │
│  ┌────────────────────────────────┐                            │
│  │   STATE: CONNECTING            │                            │
│  │   - Phone button pulses        │                            │
│  │   - Status: "Connecting..."    │                            │
│  │   - WebSocket opens            │                            │
│  └────────────────────────────────┘                            │
│  ↓                                                              │
│  Send setup message with:                                       │
│  - Model: gemini-2.0-flash-exp                                  │
│  - Voice: Aoede (professional female)                           │
│  - System prompt with dispatch context                          │
│  - 15 function declarations                                     │
│  ↓                                                              │
│  ┌────────────────────────────────┐                            │
│  │   STATE: READY                 │                            │
│  │   - Status: Green dot          │                            │
│  │   - Message: "Connected!"      │                            │
│  │   - Mic button becomes active  │                            │
│  └────────────────────────────────┘                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Flow 3: Voice Command Cycle

```
┌─────────────────────────────────────────────────────────────────┐
│                  VOICE COMMAND FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User taps RED MIC button                                       │
│  ↓                                                              │
│  ┌────────────────────────────────┐                            │
│  │   STATE: LISTENING             │                            │
│  │   - Mic button pulses red      │                            │
│  │   - Audio level visualization  │                            │
│  │   - Status: "Listening..."     │                            │
│  └────────────────────────────────┘                            │
│  ↓                                                              │
│  User speaks: "Show me all my carriers"                         │
│  ↓                                                              │
│  Audio streams to Gemini in 4096-sample chunks                  │
│  ↓                                                              │
│  User releases mic OR silence detected (VAD)                    │
│  ↓                                                              │
│  ┌────────────────────────────────┐                            │
│  │   STATE: PROCESSING            │                            │
│  │   - Status: "Processing..."    │                            │
│  │   - Spinner animation          │                            │
│  └────────────────────────────────┘                            │
│  ↓                                                              │
│  Gemini decides to call tool: listCarriers                      │
│  ↓                                                              │
│  ┌────────────────────────────────┐                            │
│  │   TOOL EXECUTION               │                            │
│  │   - Show: "Executing: listCarriers"                         │
│  │   - Query Supabase with RLS    │                            │
│  │   - Return carrier data        │                            │
│  └────────────────────────────────┘                            │
│  ↓                                                              │
│  Send tool result back to Gemini                                │
│  ↓                                                              │
│  ┌────────────────────────────────┐                            │
│  │   STATE: SPEAKING              │                            │
│  │   - Status: Purple pulse       │                            │
│  │   - Audio plays from speaker   │                            │
│  └────────────────────────────────┘                            │
│  ↓                                                              │
│  Gemini speaks: "You have 5 active carriers. Fast Freight       │
│  in Dallas, Mountain Express in Denver..."                      │
│  ↓                                                              │
│  Turn complete                                                  │
│  ↓                                                              │
│  ┌────────────────────────────────┐                            │
│  │   STATE: READY                 │                            │
│  │   - Ready for next command     │                            │
│  └────────────────────────────────┘                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Flow 4: Document Scanning

```
┌─────────────────────────────────────────────────────────────────┐
│                 DOCUMENT SCAN FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User taps CAMERA button                                        │
│  ↓                                                              │
│  Request camera permission                                      │
│  ↓                                                              │
│  ┌────────────────────────────────┐                            │
│  │   CAMERA PREVIEW               │                            │
│  │   - Live video feed            │                            │
│  │   - "Capture Document" button  │                            │
│  └────────────────────────────────┘                            │
│  ↓                                                              │
│  User positions rate confirmation document                      │
│  ↓                                                              │
│  User says: "Scan this rate con"                                │
│  OR clicks "Capture Document"                                   │
│  ↓                                                              │
│  Capture JPEG frame from video                                  │
│  ↓                                                              │
│  Send to Gemini as multimodal input:                           │
│  - Image (base64 JPEG)                                         │
│  - Text: "Scan this rate confirmation"                         │
│  ↓                                                              │
│  ┌────────────────────────────────┐                            │
│  │   GEMINI VISION PROCESSING     │                            │
│  │   - Identifies document type   │                            │
│  │   - Extracts 15 data fields    │                            │
│  │   - Calculates confidence      │                            │
│  └────────────────────────────────┘                            │
│  ↓                                                              │
│  Gemini responds (voice):                                       │
│  "I see a rate confirmation from CH Robinson.                   │
│   Dallas to Los Angeles, 1,450 miles, paying $3,800.           │
│   That's $2.62 per mile. Pickup is tomorrow at 8 AM.           │
│   Should I book this for one of your carriers?"                │
│  ↓                                                              │
│  User responds: "Yes, book it for Pacific Coast"               │
│  ↓                                                              │
│  Gemini calls: createLoad tool with extracted data              │
│  ↓                                                              │
│  Gemini responds:                                               │
│  "Done. Load LD-2411-0023 is booked for Pacific Coast          │
│   Logistics. I'll send you the confirmation."                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## State Machine

```
                         ┌─────────────┐
                         │ DISCONNECTED│
                         └──────┬──────┘
                                │ connect()
                                ▼
                         ┌─────────────┐
                    ┌────│ CONNECTING  │
                    │    └──────┬──────┘
                    │           │ setup_complete
            error   │           ▼
                    │    ┌─────────────┐
                    └───▶│   READY     │◀─────────────────┐
                         └──────┬──────┘                  │
                                │ mic on                  │
                                ▼                         │
                         ┌─────────────┐                  │
                         │  LISTENING  │                  │
                         └──────┬──────┘                  │
                                │ audio complete          │
                                ▼                         │
                         ┌─────────────┐                  │
                         │ PROCESSING  │                  │
                         └──────┬──────┘                  │
                                │ tool_call │ text       │
                                ▼           ▼             │
                         ┌─────────────┐                  │
                         │  SPEAKING   │──────────────────┘
                         └─────────────┘  turn_complete
```

---

## Voice Commands Reference

### Carrier Management

| Voice Command                            | Tool Called                       | Expected Response                                      |
| ---------------------------------------- | --------------------------------- | ------------------------------------------------------ |
| "Show me all my carriers"                | `listCarriers`                    | "You have X carriers. [list names]..."                 |
| "Who is available for a load?"           | `listCarriers` (status=active)    | "X carriers are available..."                          |
| "Find reefer carriers"                   | `listCarriers` (equipment=reefer) | "You have X reefer carriers..."                        |
| "What's the status of ABC Trucking?"     | `getCarrierDetails`               | "ABC Trucking is [status], last seen in [location]..." |
| "Update Fast Freight location to Denver" | `updateCarrierLocation`           | "Updated Fast Freight location to Denver, Colorado."   |

### Load Management

| Voice Command                           | Tool Called                     | Expected Response                      |
| --------------------------------------- | ------------------------------- | -------------------------------------- |
| "What loads are in transit?"            | `listLoads` (status=in_transit) | "You have X loads in transit..."       |
| "Book a load from Dallas to LA, $3,500" | `createLoad`                    | "Booking now... Load LD-XXXX created." |
| "Mark load 0005 as delivered"           | `updateLoadStatus`              | "Load 0005 marked as delivered."       |
| "Assign Mountain Express to load 7"     | `assignCarrierToLoad`           | "Assigned Mountain Express to load 7." |

### AI Features

| Voice Command                                   | Tool Called       | Expected Response                             |
| ----------------------------------------------- | ----------------- | --------------------------------------------- |
| "Find loads for Pacific Coast"                  | `findBestLoads`   | "Found X recommended loads. Best match is..." |
| "Search flatbed loads from Texas"               | `searchLoadBoard` | "Found X flatbed loads from Texas..."         |
| "What's the rate for dry van Chicago to Miami?" | `getMarketRates`  | "Current market rate is $X.XX per mile..."    |

### Analytics

| Voice Command                        | Tool Called                     | Expected Response                               |
| ------------------------------------ | ------------------------------- | ----------------------------------------------- |
| "How's my revenue this month?"       | `getDashboardStats`             | "This month: $XX,XXX revenue, XX loads..."      |
| "How is Midwest Haulers performing?" | `getCarrierPerformance`         | "Midwest Haulers: XX loads, $XX,XXX revenue..." |
| "What invoices are overdue?"         | `listInvoices` (status=overdue) | "You have X overdue invoices totaling $X,XXX."  |

### Document Scanning

| Voice Command + Camera         | Tool Called       | Expected Response                            |
| ------------------------------ | ----------------- | -------------------------------------------- |
| "Scan this rate con" + image   | `processDocument` | "I see a rate confirmation from [broker]..." |
| "Check this insurance" + image | `processDocument` | "This COI shows coverage until [date]..."    |
| "Process this BOL" + image     | `processDocument` | "BOL number [X], shipper is [name]..."       |

---

## UI Components Layout

### Desktop View (>1024px)

```
┌────────────────────────────────────────────────────────────────────┐
│  ┌─────────────┐  Voice Dispatch  [?Help] [⚙Settings]              │
│  │ 🎤 BETA     │  Control your dispatch operations with voice      │
│  └─────────────┘                                                   │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────┐  ┌──────────────────┐  │
│  │                                      │  │  Voice Engine    │  │
│  │          MAIN VOICE PANEL            │  │  ● Gemini Live   │  │
│  │                                      │  │                  │  │
│  │  [Messages scroll area]              │  │  ┌────┐ ┌────┐  │  │
│  │                                      │  │  │ 🎤 │ │ 📷 │  │  │
│  │  ┌──────────────────────────────┐   │  │  │ On │ │ On │  │  │
│  │  │  Camera Preview (if enabled) │   │  │  └────┘ └────┘  │  │
│  │  └──────────────────────────────┘   │  ├──────────────────┤  │
│  │                                      │  │                  │  │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐       │  │  Feature List    │  │
│  │  │ 📷 │ │ 🎤 │ │ 🔊 │ │ ☎️ │       │  │  ✓ Voice         │  │
│  │  └────┘ └────┘ └────┘ └────┘       │  │  ✓ Camera        │  │
│  │                                      │  │  ✓ Low Latency  │  │
│  └──────────────────────────────────────┘  └──────────────────┘  │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  COMMAND REFERENCE                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐              │
│  │ 🚚 Carriers  │ │ 📦 Loads     │ │ ✨ AI        │              │
│  │ "Show..."    │ │ "Book..."    │ │ "Find..."    │              │
│  └──────────────┘ └──────────────┘ └──────────────┘              │
└────────────────────────────────────────────────────────────────────┘
```

### Mobile View (<768px)

```
┌─────────────────────────┐
│  🎤 Voice Dispatch      │
│  [BETA]                 │
├─────────────────────────┤
│                         │
│  [Messages area]        │
│                         │
│  AI: "You have 5        │
│  carriers..."           │
│                         │
│  User: "Book a load     │
│  from Dallas"           │
│                         │
├─────────────────────────┤
│  ┌───────────────────┐  │
│  │  Camera Preview   │  │
│  │  (when enabled)   │  │
│  └───────────────────┘  │
├─────────────────────────┤
│                         │
│    ┌───┐ ┌───┐ ┌───┐   │
│    │📷│ │🎤│ │🔊│    │
│    └───┘ └───┘ └───┘   │
│          ┌───┐          │
│          │☎️│          │
│          └───┘          │
└─────────────────────────┘
```

---

## Audio Configuration

### Input (User Voice)

```javascript
{
  channelCount: 1,
  sampleRate: 16000,
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  encoding: 'LINEAR16'
}
```

### Output (Assistant Voice)

```javascript
{
  sampleRate: 24000,
  channels: 1,
  encoding: 'LINEAR16',
  voiceName: 'Aoede'  // Options: Puck, Charon, Kore, Fenrir, Aoede
}
```

### Voice Activity Detection (VAD)

```javascript
{
  startSpeakingThreshold: 0.5,
  endSpeakingThreshold: 0.3,
  silenceDurationMs: 1000,
  prefixPaddingMs: 300
}
```

---

## Error Handling

### Connection Errors

```
┌─────────────────────────────────────────────────┐
│  ERROR: WebSocket Connection Failed             │
│                                                 │
│  Possible causes:                               │
│  • API key invalid or missing                   │
│  • Network connectivity issue                   │
│  • Gemini service unavailable                   │
│                                                 │
│  [Retry Connection]  [Use Basic Mode]           │
└─────────────────────────────────────────────────┘
```

### Permission Errors

```
┌─────────────────────────────────────────────────┐
│  ⚠️ Microphone Access Denied                    │
│                                                 │
│  Please enable microphone access in your        │
│  browser settings to use voice commands.        │
│                                                 │
│  [Open Settings Guide]  [Use Text Mode]         │
└─────────────────────────────────────────────────┘
```

### Tool Execution Errors

```
┌─────────────────────────────────────────────────┐
│  AI: "I tried to search for carriers but        │
│       encountered an error. Would you like      │
│       me to try again?"                         │
│                                                 │
│  [Tool: listCarriers - FAILED]                  │
│  Error: Database connection timeout             │
└─────────────────────────────────────────────────┘
```

---

## Performance Targets

| Metric          | Target     | Measurement                       |
| --------------- | ---------- | --------------------------------- |
| Connection Time | <2 seconds | WebSocket open → setup_complete   |
| Voice Latency   | <500ms     | End of speech → start of response |
| Tool Execution  | <1 second  | Tool call → result returned       |
| Audio Quality   | 24kHz      | Output sample rate                |
| Camera Capture  | 720p       | Minimum resolution for OCR        |
| Memory Usage    | <100MB     | Browser heap                      |

---

## Accessibility

- **Keyboard Navigation**: Tab through controls, Enter to activate
- **Screen Reader**: ARIA labels on all buttons and status
- **Visual Feedback**: Color + icon + text for all states
- **High Contrast**: Supports OS high contrast mode
- **Reduced Motion**: Respects prefers-reduced-motion

---

## Privacy & Security

1. **Audio Processing**: Audio streams directly to Gemini, not stored locally
2. **Camera Access**: Only captured when user initiates, not continuous
3. **Tenant Isolation**: All tool calls include tenant_id, RLS enforced
4. **API Key**: Server-side only (GEMINI_API_KEY, not NEXT_PUBLIC)
5. **Session**: WebSocket authenticated per session, no persistent connection

---

## Implementation Files

| File                                        | Purpose                     |
| ------------------------------------------- | --------------------------- |
| `/lib/agents/gemini-tools.ts`               | Tool definitions + executor |
| `/lib/agents/gemini-live-client.ts`         | WebSocket client class      |
| `/components/ai/gemini-voice-assistant.tsx` | React component             |
| `/app/[domain]/voice/page.tsx`              | Voice assistant page        |
| `/api/ai/gemini-live/route.ts`              | Status check endpoint       |

---

## Future Enhancements

1. **Push-to-Talk Mode**: Hold spacebar to speak
2. **Wake Word**: "Hey Dispatch" activation
3. **Multi-language**: Spanish support for drivers
4. **Offline Queue**: Queue commands when disconnected
5. **Voice Profiles**: Learn dispatcher's voice patterns
6. **Shortcut Commands**: Custom voice macros
