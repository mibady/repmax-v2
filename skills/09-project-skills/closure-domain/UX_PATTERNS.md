# CLOSURE - UX Patterns & User Flows

## Table of Contents

1. [UX Philosophy](#ux-philosophy)
2. [User Flows](#user-flows)
3. [Interaction Patterns](#interaction-patterns)
4. [Empty States](#empty-states)
5. [Loading States](#loading-states)
6. [Error Handling](#error-handling)
7. [Onboarding](#onboarding)
8. [Micro-interactions](#micro-interactions)

---

## 1. UX Philosophy

### Core Principles

#### 1.1 **Trauma-Informed Design**

```
┌─────────────────────────────────────────────────────┐
│ Trauma-Informed UX Principles:                      │
│                                                     │
│ ✓ Never rush the user (no auto-advancing screens)  │
│ ✓ Always provide an exit (clear cancel/back)       │
│ ✓ Preserve agency (user always in control)         │
│ ✓ Avoid triggers (gentle language, no harsh colors)│
│ ✓ Predictable interactions (no surprises)          │
│ ✓ Clear expectations (what will happen next)       │
└─────────────────────────────────────────────────────┘
```

**Implementation:**

- All destructive actions require confirmation
- Every screen has a "Back" or "Cancel" option
- No forced progression through flows
- Progress can be paused and resumed anytime
- User data auto-saves (never lose work)

#### 1.2 **Compassionate Friction**

Some friction is therapeutic. We intentionally add moments of pause:

```typescript
// Example: Deleting a letter forever
const deleteFlow = () => {
  // Step 1: Confirmation modal
  showModal({
    title: "Delete this letter?",
    message: "This will permanently remove your letter. This cannot be undone.",
    actions: [
      { label: "Cancel", variant: "secondary" },
      { label: "Delete Forever", variant: "danger" },
    ],
  });

  // Step 2: After confirmation, brief pause
  if (confirmed) {
    showToast({ message: "Deleting...", variant: "info" });
    setTimeout(() => {
      performDelete();
      showToast({ message: "Letter deleted", variant: "success" });
    }, 800); // Brief pause for emotional processing
  }
};
```

**Why:** Gives user a moment to reconsider emotionally significant actions.

#### 1.3 **Progressive Disclosure**

Show only what's needed, when it's needed:

```
Simple Flow (New Users):
┌──────────────┐
│ Quick Start  │ → Straight to writing (minimal setup)
└──────────────┘

Advanced Flow (Returning Users):
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Mode Selector│ →  │ AI Support?  │ →  │ Composer     │
└──────────────┘    └──────────────┘    └──────────────┘
                         ↓ (optional)
                    ┌──────────────┐
                    │ Skip for now │
                    └──────────────┘
```

---

## 2. User Flows

### 2.1 First-Time User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│ Landing Screen                                                  │
│                                                                 │
│  [LOGO] CLOSURE                                                 │
│  Complete what was left unfinished.                             │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │   Quick Start    │  │ Guided Setup     │                   │
│  │   (1 minute)     │  │ (5 minutes)      │                   │
│  └──────────────────┘  └──────────────────┘                   │
│                                                                 │
│  "Your data is encrypted and stored only on your device."      │
└─────────────────────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ↓                       ↓
┌──────────────┐        ┌──────────────┐
│ Quick Start  │        │ Guided Setup │
└──────────────┘        └──────────────┘
        │                       │
        │               ┌───────┴───────┐
        │               ↓               ↓
        │       ┌──────────────┐  ┌────────────┐
        │       │ Tone         │→ │Preferences │
        │       │ Selection    │  │(Dark mode, │
        │       │              │  │ Font size) │
        │       └──────────────┘  └────────────┘
        │               │               │
        │               └───────┬───────┘
        │                       ↓
        │               ┌──────────────┐
        │               │ Privacy      │
        │               │ Explanation  │
        │               └──────────────┘
        │                       │
        └───────────┬───────────┘
                    ↓
        ┌──────────────────────┐
        │ Experience Mode      │
        │ Selector (5 cards)   │
        │                      │
        │ □ Letters Unsent     │
        │ □ Conversations      │
        │ □ Transitions        │
        │ □ Grief Rituals      │
        │ □ Time Capsules      │
        └──────────────────────┘
                    │
                    ↓
        ┌──────────────────────┐
        │ Composer (selected)  │
        │                      │
        │ [Writing interface]  │
        │                      │
        │ Auto-saves every 3s  │
        └──────────────────────┘
```

**Key Decisions:**

1. **Quick Start vs Guided:** User chooses their comfort level
2. **Tone Selection:** Happens early to personalize experience
3. **Privacy First:** Explained upfront to build trust
4. **Mode Selection:** Clear cards with descriptions

---

### 2.2 Returning User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│ App Opens                                                       │
│                                                                 │
│ [Loading encrypted vault...]                                   │
└─────────────────────────────────────────────────────────────────┘
                    │
                    ↓
        ┌──────────────────────┐
        │ Mood Check-In        │  (Can skip)
        │ (Optional, shown     │
        │  once per session)   │
        └──────────────────────┘
                    │
            ┌───────┴───────┐
            ↓               ↓
    ┌──────────────┐  ┌────────────┐
    │ Complete     │  │ Skip       │
    │ check-in     │  │            │
    └──────────────┘  └────────────┘
            │               │
            └───────┬───────┘
                    ↓
        ┌──────────────────────┐
        │ Vault Dashboard      │
        │                      │
        │ Summary Stats:       │
        │ • 12 letters         │
        │ • 5 conversations    │
        │ • 3 grief rituals    │
        │                      │
        │ Recent Entries:      │
        │ • "Letter to Mom"    │
        │   (Last edited 2d)   │
        │ • "Conversation..."  │
        │   (Completed 1w)     │
        │                      │
        │ [+ New Experience]   │
        └──────────────────────┘
                    │
        ┌───────────┼───────────┐
        ↓           ↓           ↓
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Continue │  │ New      │  │ Browse   │
│ Draft    │  │Experience│  │ Vault    │
└──────────┘  └──────────┘  └──────────┘
        │           │           │
        └───────────┴───────────┘
                    ↓
        ┌──────────────────────┐
        │ Composer / List View │
        └──────────────────────┘
```

**Smart Resume:**

- If user has a draft in progress → Offer to continue
- If user completed something recently → Show completion badge
- If user has scheduled time capsule → Show countdown

---

### 2.3 Complete Letter Flow (Detailed)

```
┌─────────────────────────────────────────────────────────────────┐
│ Letter Composer                                                 │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ To: [Mom                            ]                   │    │
│ │     ↑ Focus here on load                                │    │
│ │                                                          │    │
│ │ [Dear Mom,                                              ]│    │
│ │ [                                                       ]│    │
│ │ [I wish I could have told you how much I appreciated   ]│    │
│ │ [all those small moments...                            ]│    │
│ │ [                                                       ]│    │
│ │                                    ↑ Auto-expanding     │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ 💡 Tone: Reflective                                     │    │
│ │                                                          │    │
│ │ Prompt: "What memory of them brings you the most       │    │
│ │ comfort right now?"                                     │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ 📊 237 words • ~2 min read              💾 Saved 3s ago       │
│                                                                 │
│ [Need help writing? Show AI suggestions] ← (Collapsible)       │
│                                                                 │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│ │ Save Draft   │  │ Complete     │  │ Cancel       │         │
│ └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

**Interaction Details:**

1. **Auto-save Every 3 Seconds**
   - Silent (no toast spam)
   - Small indicator: "💾 Saved just now"
   - Updates to "Saved 1m ago", "Saved 5m ago"

2. **Crisis Detection**
   - Real-time scan for crisis keywords
   - If detected → Banner slides in from top
   - Banner persists but can be minimized
   - Never blocks saving

3. **Tone-Aware Prompts**
   - Change based on user's selected tone
   - Appear as gentle suggestions
   - Can be dismissed permanently

4. **AI Support (Optional)**
   - Click to expand panel
   - Three options:
     - "I'm stuck" → Writing prompts
     - "Find better words" → Vocabulary suggestions
     - "Different perspective" → Gentle reframing

5. **Completion Flow**
   ```
   User clicks "Complete"
           ↓
   ┌──────────────────┐
   │ "Mark complete?" │
   │                  │
   │ This will move   │
   │ the letter to    │
   │ your vault and   │
   │ mark it as       │
   │ finished.        │
   │                  │
   │ [Yes, Complete]  │
   │ [Keep Writing]   │
   └──────────────────┘
           ↓ (if Yes)
   ┌──────────────────┐
   │ ✨ Completion    │
   │    Animation     │
   │    (1 second)    │
   └──────────────────┘
           ↓
   ┌──────────────────┐
   │ "Well done."     │
   │                  │
   │ This letter is   │
   │ now in your      │
   │ vault, safe and  │
   │ encrypted.       │
   │                  │
   │ [Back to Vault]  │
   │ [Write Another]  │
   └──────────────────┘
   ```

---

### 2.4 Mood Check-In Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1 of 3: How are you feeling right now?                    │
│                                                                 │
│ ○○○○○○○○○○○○ (12 emotion options)                              │
│                                                                 │
│ 😊 Joy        😢 Sadness     😠 Anger       😨 Fear           │
│ 🥰 Love       🙏 Gratitude   ☮️ Peace       😰 Anxiety        │
│ 💔 Grief      🌟 Hope        😳 Shame       😌 Content        │
│                                                                 │
│ [Skip for now]                              Progress: ●○○      │
└─────────────────────────────────────────────────────────────────┘
            │ (user selects "Sadness")
            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 2 of 3: Any other emotions? (Optional)                    │
│                                                                 │
│ Primary: 😢 Sadness                                            │
│                                                                 │
│ Select up to 3 more:                                           │
│                                                                 │
│ ☑️ Hope        □ Anxiety     ☑️ Peace       □ Anger           │
│ □ Gratitude   □ Loneliness  □ Fear         □ Joy             │
│                                                                 │
│ [Back]  [Skip]                              Progress: ●●○      │
└─────────────────────────────────────────────────────────────────┘
            │ (user selects Hope and Peace)
            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 3 of 3: Rate your intensity and energy                    │
│                                                                 │
│ How intense is this feeling?                                   │
│ Gentle ●●●●●●○○○○ Overwhelming                                │
│         └── 6/10                                               │
│                                                                 │
│ What's your energy level?                                      │
│ Drained ●●●○○○○○○○ Energized                                  │
│          └── 3/10                                              │
│                                                                 │
│ [Back]                                      Progress: ●●●      │
│                                                                 │
│            [Complete Check-In]                                 │
└─────────────────────────────────────────────────────────────────┘
            │
            ↓
┌─────────────────────────────────────────────────────────────────┐
│ ✓ Mood logged                                                  │
│                                                                 │
│ "It sounds like you're navigating some difficult feelings,    │
│  but there's also hope and peace present. That's meaningful." │
│                                                                 │
│ [Continue to Dashboard]                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Interaction Patterns

### 3.1 Auto-Save Pattern

**Behavior:**

```typescript
// Debounced auto-save (3 seconds after last keystroke)
useEffect(() => {
  const timer = setTimeout(() => {
    saveDraft(formData);
    setSaveStatus("saved");
  }, 3000);

  return () => clearTimeout(timer);
}, [formData]);
```

**UI Feedback:**

```
While typing:    (no indicator)
After 3s pause:  💾 Saved just now
After 1m:        💾 Saved 1 minute ago
After 1h:        💾 Saved 1 hour ago
```

**Error Handling:**

```
If save fails:   ⚠️ Couldn't save. Retrying...
After retry:     ✓ Saved successfully
```

---

### 3.2 Hover States

**Buttons:**

```css
Default:     bg-primary-500, shadow-sm
Hover:       bg-primary-600, shadow-md, translateY(-2px)
Active:      bg-primary-700, shadow-inner, translateY(0)
```

**Cards:**

```css
Default:     shadow-sm
Hover:       shadow-md, translateY(-4px)
Active:      shadow-sm, translateY(-2px)
```

**Links:**

```css
Default:     text-primary-500, underline-offset-4
Hover:       underline, brightness(1.1)
Active:      brightness(0.9)
```

---

### 3.3 Focus States

**All Interactive Elements:**

```css
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(42, 100, 112, 0.2);
}
```

**Form Inputs:**

```css
:focus {
  border-color: var(--color-primary-500);
  ring: 2px solid var(--color-primary-500);
}
```

**Keyboard Navigation Indicator:**

```
When navigating via Tab:
  → Each focused element has visible ring
  → Screen reader announces element label
  → Skip links available at top of page
```

---

### 3.4 Drag & Drop (Future)

**Reordering Letters:**

```
Default state:   Cursor: grab
While dragging:  Cursor: grabbing, opacity: 0.5
Drop target:     Border: 2px dashed primary, bg: primary/5
After drop:      Smooth reorder animation (300ms)
```

---

## 4. Empty States

### 4.1 No Letters Yet

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    ✉️                                           │
│                                                                 │
│              No letters yet.                                    │
│                                                                 │
│    Write what you never got to say—to someone you've lost,     │
│    someone you miss, or even to your former self.              │
│                                                                 │
│              ┌──────────────────┐                              │
│              │ Write Your First │                              │
│              │     Letter       │                              │
│              └──────────────────┘                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Search with No Results

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    🔍                                           │
│                                                                 │
│         No results for "forgiveness"                           │
│                                                                 │
│    Try different keywords, or browse all your entries below.   │
│                                                                 │
│              ┌──────────────────┐                              │
│              │ Clear Search     │                              │
│              └──────────────────┘                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 No Mood Entries

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    📊                                           │
│                                                                 │
│         Start tracking your emotional patterns.                │
│                                                                 │
│    Log your moods to see insights and trends over time.        │
│                                                                 │
│              ┌──────────────────┐                              │
│              │ Log Your First   │                              │
│              │     Mood         │                              │
│              └──────────────────┘                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Empty State Principles:**

1. Always include an illustration/icon
2. Explain what goes here
3. Provide clear next action
4. Never show "No data" or "Empty" alone

---

## 5. Loading States

### 5.1 Initial App Load

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    ⚪ (Spinner)                                 │
│                                                                 │
│              Loading your vault...                             │
│                                                                 │
│         (Decrypting your content securely)                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Duration:** Usually <500ms
**Fallback:** If >2s, show "Taking longer than usual..."

---

### 5.2 Saving Content

```
Button state:
┌──────────────────┐
│ ⚪ Saving...     │  ← Spinner + text
└──────────────────┘
         ↓ (after save)
┌──────────────────┐
│ ✓ Saved          │  ← Brief success state (1s)
└──────────────────┘
         ↓
┌──────────────────┐
│ Save Draft       │  ← Returns to default
└──────────────────┘
```

---

### 5.3 AI Suggestions Loading

```
┌─────────────────────────────────────────────────────────────────┐
│ AI Writing Support                                              │
│                                                                 │
│ ⚪ Thinking...                                                  │
│                                                                 │
│ (This may take a moment)                                       │
└─────────────────────────────────────────────────────────────────┘
         ↓ (after 2-5 seconds)
┌─────────────────────────────────────────────────────────────────┐
│ AI Writing Support                                              │
│                                                                 │
│ 💡 Try exploring: "What would you want them to know about      │
│    who you've become?"                                         │
│                                                                 │
│ [Use This Prompt]  [Show More]                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 5.4 Skeleton Screens

For dashboard loading:

```
┌─────────────────────────────────────────────────────────────────┐
│ Your Vault                                                      │
│                                                                 │
│ ▓▓▓▓▓▓▓▓▓▓ (Shimmer animation)                                 │
│ ▓▓▓▓▓▓░░░░                                                     │
│                                                                 │
│ ▓▓▓▓▓▓▓▓▓▓                                                     │
│ ▓▓▓▓░░░░░░                                                     │
│                                                                 │
│ ▓▓▓▓▓▓▓▓▓▓                                                     │
│ ▓▓▓▓▓▓▓░░░                                                     │
└─────────────────────────────────────────────────────────────────┘
```

**Better than:** Blank screen or spinner alone
**Shows:** Structure is loading (sets expectation)

---

## 6. Error Handling

### 6.1 Form Validation Errors

```
┌─────────────────────────────────────────────────────────────────┐
│ Recipient                                                       │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ [                                              ]         │    │
│ └─────────────────────────────────────────────────────────┘    │
│ ⚠️ Please enter who this letter is for.                        │
└─────────────────────────────────────────────────────────────────┘
```

**Principles:**

- Show errors immediately after blur (not on every keystroke)
- Use gentle language ("Please enter..." not "Required")
- Icon + color + text (don't rely on color alone)
- Link error to field via `aria-describedby`

---

### 6.2 Network Errors (AI Service)

```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ Couldn't reach AI service                                   │
│                                                                 │
│ Check your internet connection and try again.                  │
│                                                                 │
│ [Retry]  [Continue Without AI]                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Always provide:**

1. What happened
2. Why it might have happened
3. What the user can do
4. Alternative path (never dead-end)

---

### 6.3 Storage Full

```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ Storage limit reached                                       │
│                                                                 │
│ Your browser's storage is full. To continue:                   │
│                                                                 │
│ • Export and delete old entries you no longer need             │
│ • Clear browser cache and try again                            │
│                                                                 │
│ [Export My Data]  [Learn More]                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 6.4 Encryption Failed

```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ Couldn't encrypt your content                               │
│                                                                 │
│ This is unusual. Your data was saved without encryption.       │
│ Please check your browser settings or try a different browser. │
│                                                                 │
│ Your content is still private on your device.                  │
│                                                                 │
│ [Okay]  [Learn About Encryption]                              │
└─────────────────────────────────────────────────────────────────┘
```

**Key:** Never block the user, always degrade gracefully

---

## 7. Onboarding

### 7.1 Quick Start (1 Minute)

```
Screen 1:
┌─────────────────────────────────────────────────────────────────┐
│                    Welcome to CLOSURE                           │
│                                                                 │
│         Complete what was left unfinished.                     │
│                                                                 │
│   This app helps you process difficult emotions through        │
│   writing. Everything is encrypted and stored only on          │
│   your device—we never see your content.                       │
│                                                                 │
│                  [Get Started]                                 │
└─────────────────────────────────────────────────────────────────┘
                         ↓
Screen 2:
┌─────────────────────────────────────────────────────────────────┐
│               Choose your communication style:                  │
│                                                                 │
│ ○ Grounded - Clear, direct, therapeutic                        │
│ ○ Reflective - Contemplative, validating (Recommended)         │
│ ○ Poetic - Lyrical, metaphor-rich                             │
│ ○ Minimal - Brief, essential                                   │
│                                                                 │
│ (You can change this anytime in settings)                      │
│                                                                 │
│                    [Continue]                                  │
└─────────────────────────────────────────────────────────────────┘
                         ↓
                [Experience Mode Selector]
```

---

### 7.2 Guided Setup (5 Minutes)

```
Screen 1: Welcome (same as Quick Start)
Screen 2: Tone Selection (same as Quick Start)
Screen 3: Accessibility Preferences
┌─────────────────────────────────────────────────────────────────┐
│              Customize for your comfort:                        │
│                                                                 │
│ ☐ Dark mode                                                    │
│ ☐ Reduce animations                                            │
│ ☐ High contrast                                                │
│                                                                 │
│ Font size:  ○ Small  ● Medium  ○ Large                        │
│                                                                 │
│                    [Continue]                                  │
└─────────────────────────────────────────────────────────────────┘

Screen 4: Privacy & Encryption
┌─────────────────────────────────────────────────────────────────┐
│              Your privacy, guaranteed.                          │
│                                                                 │
│ ✓ All content encrypted with AES-256                          │
│ ✓ Stored only on your device (not our servers)                │
│ ✓ No analytics, no tracking, no ads                           │
│ ✓ Optional AI features (you control when)                     │
│                                                                 │
│ You can export or delete your data anytime.                    │
│                                                                 │
│                [I Understand, Continue]                        │
└─────────────────────────────────────────────────────────────────┘

Screen 5: Experience Mode Selector (same as Quick Start)
```

---

## 8. Micro-interactions

### 8.1 Button Press

```css
@keyframes button-press {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

.button:active {
  animation: button-press 150ms ease-out;
}
```

---

### 8.2 Completion Celebration

```css
@keyframes completion-shine {
  0% {
    opacity: 0;
    transform: scale(0.8) rotate(-10deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    opacity: 0;
    transform: scale(1.2) rotate(10deg);
  }
}

.completion-badge {
  animation: completion-shine 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

**Visual:** Sparkle ✨ appears and fades

---

### 8.3 Card Hover Lift

```css
.card {
  transition:
    transform 200ms ease-out,
    box-shadow 200ms ease-out;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}
```

---

### 8.4 Toast Slide In

```css
@keyframes toast-slide-in {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast {
  animation: toast-slide-in 300ms ease-out;
}
```

---

### 8.5 Input Focus Glow

```css
.input {
  transition:
    box-shadow 200ms ease-out,
    border-color 200ms ease-out;
}

.input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 4px rgba(42, 100, 112, 0.1);
}
```

---

## Summary

This UX guide defines:

1. ✅ **Philosophy**: Trauma-informed, compassionate friction, progressive disclosure
2. ✅ **User Flows**: First-time, returning, complete letter, mood check-in
3. ✅ **Interactions**: Auto-save, hover, focus, drag-drop patterns
4. ✅ **Empty States**: Helpful, actionable, never just "No data"
5. ✅ **Loading**: Skeletons, spinners, progress indicators
6. ✅ **Errors**: Graceful degradation, clear actions, never dead-ends
7. ✅ **Onboarding**: Quick (1min) and Guided (5min) paths
8. ✅ **Micro-interactions**: Subtle, delightful, purposeful

**Every interaction designed for healing, not hustle.**
