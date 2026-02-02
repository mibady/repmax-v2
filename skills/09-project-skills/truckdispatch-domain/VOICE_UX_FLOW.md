# 🎤 Gemini Live Voice Dispatch - UX Flow Design

## Overview

This document outlines the complete user experience flow for voice-controlled truck dispatching using Google's Gemini Multimodal Live API.

---

## 🎯 Design Principles

1. **Hands-Free Operation** - Dispatchers are often multitasking (on phone, driving, at loading dock)
2. **Natural Language** - No special syntax; speak like you would to a coworker
3. **Confirmations** - Critical actions require verbal confirmation
4. **Visual Feedback** - Real-time transcription and status indicators
5. **Graceful Fallback** - Text input always available as backup

---

## 🚀 Connection Flow

### Initial State

```
┌─────────────────────────────────────┐
│                                     │
│     🎙️ Voice Dispatch Assistant    │
│                                     │
│   [  📞 Start Voice Session  ]      │
│                                     │
│   Tap to start hands-free dispatch  │
│                                     │
└─────────────────────────────────────┘
```

### Connecting

```
┌─────────────────────────────────────┐
│  🟡 Connecting...                   │
│                                     │
│        ⏳                           │
│     Connecting to                   │
│     voice assistant                 │
│                                     │
│   [  Cancel  ]                      │
└─────────────────────────────────────┘
```

### Connected - Ready

```
┌─────────────────────────────────────┐
│  🟢 Connected         [🔇] [➖]     │
├─────────────────────────────────────┤
│                                     │
│  👋 Hi! I'm your dispatch           │
│     assistant. How can I help?      │
│                                     │
│  ┌─────────┐ ┌─────────┐            │
│  │🚚 Show  │ │📦 Loads │            │
│  │carriers │ │in transit│           │
│  └─────────┘ └─────────┘            │
│  ┌─────────┐ ┌─────────┐            │
│  │✨ Find  │ │💰 Today's│           │
│  │loads    │ │revenue  │            │
│  └─────────┘ └─────────┘            │
│                                     │
├─────────────────────────────────────┤
│                                     │
│    [📷]    [ 📞 End ]    [🎤]       │
│   Camera      Call      Mic OFF     │
│                                     │
│     Tap mic to start speaking       │
└─────────────────────────────────────┘
```

---

## 🎤 Voice Interaction States

### Listening (Mic Active)

```
┌─────────────────────────────────────┐
│  🟢 Connected • Listening...        │
├─────────────────────────────────────┤
│                                     │
│  🎤 "Find loads for Pacific..."     │
│     ━━━━━━━━━━━━━━━░░░░░            │
│     Volume indicator                │
│                                     │
├─────────────────────────────────────┤
│                                     │
│    [📷]    [ 📞 End ]    [🎤]       │
│   Camera      Call      Mic ON      │
│              ⭕ Tap to mute          │
│                                     │
└─────────────────────────────────────┘
```

### Processing (After Speech)

```
┌─────────────────────────────────────┐
│  🟢 Connected • Processing...       │
├─────────────────────────────────────┤
│                                     │
│  👤 "Find loads for Pacific Coast"  │
│                                     │
│  🤖 ⏳ Finding loads...             │
│     ├─ 📊 searchLoadBoard           │
│     └─ ✨ findBestLoads             │
│                                     │
└─────────────────────────────────────┘
```

### Response (AI Speaking)

```
┌─────────────────────────────────────┐
│  🟢 Connected • Speaking...  🔊     │
├─────────────────────────────────────┤
│                                     │
│  👤 "Find loads for Pacific Coast"  │
│                                     │
│  🤖 I found 5 great matches for     │
│     Pacific Coast Logistics.        │
│                                     │
│     The best one is Dallas to LA,   │
│     1,450 miles paying $3,800 -     │
│     that's $2.62 per mile.          │
│                                     │
│     Want me to book it?             │
│                                     │
│  ┌──────────┐ ┌───────────┐         │
│  │ Yes, book│ │ Show more │         │
│  └──────────┘ └───────────┘         │
│                                     │
└─────────────────────────────────────┘
```

---

## 📷 Document Scanning Flow

### Camera Activated

```
┌─────────────────────────────────────┐
│  🟢 Camera Active        [❌ Close] │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │   📄 ←──── Live Camera ────→  │  │
│  │                               │  │
│  │   Point at document           │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│   Hold steady • Good lighting       │
├─────────────────────────────────────┤
│                                     │
│  Say: "Scan this rate confirmation" │
│       "Check this insurance"        │
│       "Read this BOL"               │
│                                     │
└─────────────────────────────────────┘
```

### Document Detected

```
┌─────────────────────────────────────┐
│  🟢 Document Detected               │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │  ┌─────────────────────────┐  │  │
│  │  │ RATE CONFIRMATION       │  │  │
│  │  │ CH Robinson             │  │  │
│  │  │ Load: 12345             │  │  │
│  │  │ ───────────────────     │  │  │
│  │  │ Houston → Atlanta       │  │  │
│  │  │ Rate: $2,100            │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
│   ✅ Rate Confirmation detected     │
├─────────────────────────────────────┤
│                                     │
│  🤖 I see a rate confirmation from  │
│     CH Robinson. Houston to Atlanta │
│     for $2,100. Pickup is Friday.   │
│                                     │
│     Should I book this load?        │
│                                     │
│  ┌──────────┐ ┌───────────┐         │
│  │ Yes, book│ │ Just save │         │
│  └──────────┘ └───────────┘         │
│                                     │
└─────────────────────────────────────┘
```

---

## 💬 Conversation Examples

### Example 1: Finding Loads

```
USER:  "Hey, find some loads for Mountain Express"

AI:    "Looking for loads for Mountain Express. They're
        a reefer carrier currently in Denver, right?"

USER:  "Yes"

AI:    "I found 8 reefer loads. The top match is Denver
        to Los Angeles, 1,050 miles, paying $2,940 -
        that's $2.80 per mile, which is 15% above their
        average. Pickup tomorrow at 6 AM.

        Want me to book it?"

USER:  "What's the second option?"

AI:    "The second best is Denver to Phoenix, 600 miles
        for $1,680 - $2.80 per mile. Quicker run, delivers
        same day. After that they could pick up a Phoenix
        to Dallas load I found."

USER:  "Book the first one, Denver to LA"

AI:    "Done! Load LD-2411-0034 booked for Mountain Express.
        Denver to LA, $2,940, picking up tomorrow 6 AM.
        Should I send the rate con to the driver?"
```

### Example 2: Status Update

```
USER:  "Mark the Pacific Coast load as delivered"

AI:    "I see Pacific Coast has one in-transit load -
        Houston to Atlanta, load number LD-2411-0029.
        Is that the one?"

USER:  "Yes"

AI:    "Got it. Load LD-2411-0029 marked as delivered.
        Want me to create the invoice? It's $2,100 gross,
        your fee would be $105."

USER:  "Yes, invoice it"

AI:    "Invoice INV-2411-0089 created for $2,100.
        Net to Pacific Coast is $1,995.
        Anything else?"
```

### Example 3: Document Scan

```
USER:  [Points camera at rate confirmation]
       "Scan this and book it for ABC Trucking"

AI:    "I see a rate confirmation from CH Robinson.

        Let me read the details:
        - Load number: CHR-789456
        - Route: Dallas, TX to Miami, FL
        - Miles: 1,310
        - Rate: $3,275 - that's $2.50 per mile
        - Pickup: November 28th, 8 AM
        - Delivery: November 30th by 5 PM
        - Equipment: Dry van

        ABC Trucking is available and this matches their
        equipment. Should I book it?"

USER:  "Yes"

AI:    "Load booked! LD-2411-0035 created and assigned to
        ABC Trucking. I've saved the rate confirmation.
        They should be at the Dallas pickup by 8 AM Thursday."
```

### Example 4: Analytics Query

```
USER:  "How did we do this week?"

AI:    "Here's your week in review:

        📊 This week you booked 23 loads for a total of
        $58,400 in gross revenue. That's up 12% from
        last week.

        Your dispatch fees earned: $2,920

        Top performer was Mountain Express with 6 loads
        and $15,200 in revenue.

        All deliveries were on time - great job!

        You have 4 loads in transit right now and
        3 invoices pending payment totaling $6,800.

        Want more details on anything?"
```

---

## ⚠️ Error Handling

### Connection Lost

```
┌─────────────────────────────────────┐
│  🔴 Disconnected                    │
├─────────────────────────────────────┤
│                                     │
│  ⚠️ Connection lost                 │
│                                     │
│  Your session was interrupted.      │
│  This could be due to network       │
│  issues.                            │
│                                     │
│  [  🔄 Reconnect  ]                 │
│                                     │
└─────────────────────────────────────┘
```

### Microphone Permission Denied

```
┌─────────────────────────────────────┐
│  ⚠️ Microphone Access Needed        │
├─────────────────────────────────────┤
│                                     │
│  🎤 To use voice commands, please   │
│     allow microphone access in      │
│     your browser settings.          │
│                                     │
│  [  📝 Use Text Instead  ]          │
│                                     │
└─────────────────────────────────────┘
```

### Unclear Command

```
AI:    "I'm not sure what you mean by that.
        Could you try rephrasing?

        You can ask me to:
        • Find or book loads
        • Check on carriers
        • Update load status
        • Show analytics
        • Scan documents"
```

---

## 🎨 Visual Design Elements

### Color Coding

| State        | Color       | Indicator |
| ------------ | ----------- | --------- |
| Disconnected | Gray        | ⚪        |
| Connecting   | Yellow      | 🟡        |
| Connected    | Green       | 🟢        |
| Listening    | Blue pulse  | 🔵        |
| Processing   | Yellow spin | 🟡        |
| Speaking     | Green pulse | 🟢        |
| Error        | Red         | 🔴        |

### Voice Activity Indicator

```
Silent:     ░░░░░░░░░░░░░░░░░░░░
Quiet:      ▓▓░░░░░░░░░░░░░░░░░░
Speaking:   ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░
Loud:       ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░
```

### Tool Execution Status

```
⏳ Searching load board...
✅ Found 12 loads
⏳ Running AI matching...
✅ Ranked top 5 matches
```

---

## 📱 Mobile Considerations

### Portrait Mode

- Full-width voice interface
- Camera takes top 40% when active
- Controls at bottom (thumb-friendly)
- Swipe up to see command history

### Landscape Mode

- Camera on left, chat on right
- Controls centered at bottom
- Better for document scanning

### Accessibility

- High contrast mode available
- Large touch targets (48px minimum)
- Screen reader compatible
- Haptic feedback on actions

---

## 🔐 Privacy & Security

1. **Audio Processing** - All audio processed by Google's Gemini API
2. **No Recording** - Audio is not stored locally or on servers
3. **Tenant Isolation** - Voice commands scoped to user's tenant
4. **Confirmation Required** - Destructive actions need verbal confirmation
5. **Audit Log** - All voice-initiated actions logged

---

## 📊 Success Metrics

| Metric                     | Target        |
| -------------------------- | ------------- |
| Voice recognition accuracy | >95%          |
| Average response time      | <2 seconds    |
| Task completion rate       | >90%          |
| User satisfaction          | >4.5/5        |
| Daily active voice users   | >30% of users |

---

## 🗺️ Future Enhancements

1. **Multi-language Support** - Spanish, French for drivers
2. **Custom Wake Word** - "Hey Dispatch" to activate
3. **Proactive Alerts** - AI initiates conversation for urgent matters
4. **Voice Profiles** - Different voices for different dispatchers
5. **Offline Mode** - Basic commands work without internet
6. **Integration with Phone Calls** - Voice dispatch during broker calls

---

_This UX flow is designed for TruckDispatch Pro using Google Gemini Multimodal Live API_
