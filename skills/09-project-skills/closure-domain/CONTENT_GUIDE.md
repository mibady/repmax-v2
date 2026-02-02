# CLOSURE - Content & Tone Guidelines

## Table of Contents

1. [Voice & Tone](#voice--tone)
2. [Adaptive Tone System](#adaptive-tone-system)
3. [Writing Principles](#writing-principles)
4. [UI Copy Guidelines](#ui-copy-guidelines)
5. [Prompt Writing](#prompt-writing)
6. [Error Messages](#error-messages)
7. [Crisis Communication](#crisis-communication)
8. [Localization](#localization)

---

## 1. Voice & Tone

### Brand Voice (Consistent Across All Tones)

CLOSURE's voice is:

**Compassionate**

- We recognize emotional pain without minimizing it
- We validate feelings without judgment
- We honor the user's experience as they name it

**Trustworthy**

- We're honest about what we can and cannot do
- We protect privacy fiercely
- We never make clinical claims

**Wise**

- We're informed by therapy frameworks (CBT, Gestalt, Continuing Bonds)
- We ask thoughtful questions
- We provide context, not commands

**Patient**

- We never rush the user
- We allow for pauses and breaks
- We recognize healing isn't linear

### Voice Examples

✅ **Good:**

> "Take your time. This letter will be here whenever you're ready to continue."

❌ **Bad:**

> "Finish your letter to unlock achievements!"

---

✅ **Good:**

> "Your content is encrypted and stored only on your device. We never see what you write."

❌ **Bad:**

> "Don't worry, your data is totally safe!"

---

✅ **Good:**

> "Writing about loss is difficult. If you need support, professional resources are available 24/7."

❌ **Bad:**

> "Feeling sad? Just call someone!"

---

## 2. Adaptive Tone System

CLOSURE offers 4 distinct tones that users can choose. The UI language adapts to match their selection.

### 2.1 Grounded Tone

**Characteristics:**

- Evidence-based language
- Direct and clear
- Therapeutic without being clinical
- Cites frameworks (CBT, ACT) subtly

**Target Users:**

- Currently in therapy
- Prefer straightforward guidance
- Skeptical of "spiritual" language
- Want evidence-based approaches

**Example Prompts:**

```
Grounded (Letters):
"Think about what you want to communicate. What's the core message you never got to share?"

Grounded (Grief):
"Identify one specific memory that captures what you miss. Be as detailed as possible."

Grounded (Completion):
"You've done the work. This letter represents real emotional processing."
```

**UI Copy Examples:**

| Element     | Grounded Version                                                                    |
| ----------- | ----------------------------------------------------------------------------------- |
| Button      | "Save and continue"                                                                 |
| Empty state | "No entries yet. Create your first one to start processing."                        |
| Settings    | "Choose how the app communicates with you."                                         |
| Crisis      | "If you're experiencing thoughts of self-harm, contact a professional immediately." |

---

### 2.2 Reflective Tone (Default)

**Characteristics:**

- Contemplative and validating
- Balanced between emotional and rational
- Gentle curiosity
- Most universally accessible

**Target Users:**

- General emotional wellness seekers
- Journaling enthusiasts
- First-time users (recommended default)
- Those seeking both logic and emotion

**Example Prompts:**

```
Reflective (Letters):
"What would you want them to know about who you've become since you last spoke?"

Reflective (Grief):
"Notice what arises when you think of this person. What do you find yourself holding onto?"

Reflective (Completion):
"You've created something meaningful. This letter is part of your healing journey."
```

**UI Copy Examples:**

| Element     | Reflective Version                                                                             |
| ----------- | ---------------------------------------------------------------------------------------------- |
| Button      | "Save and reflect later"                                                                       |
| Empty state | "Your vault is waiting for your first entry. What would you like to explore?"                  |
| Settings    | "Adjust how CLOSURE speaks to you."                                                            |
| Crisis      | "You're experiencing something heavy. Professional support is available whenever you need it." |

---

### 2.3 Poetic Tone

**Characteristics:**

- Lyrical and metaphor-rich
- Archetypal language (bridges, thresholds, gardens)
- Honors mystery and the unspoken
- Literary quality

**Target Users:**

- Writers and artists
- Those who process through metaphor
- Spiritual/philosophical seekers
- Appreciate beauty in language

**Example Prompts:**

```
Poetic (Letters):
"Imagine this letter as a bridge across silence. What words would you carry across?"

Poetic (Grief):
"They live on in the stories you carry. What piece of their light do you hold?"

Poetic (Completion):
"You've woven something true from threads of longing. This letter is yours to keep."
```

**UI Copy Examples:**

| Element     | Poetic Version                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| Button      | "Preserve this reflection"                                                                              |
| Empty state | "Your vault awaits its first story. What will you name?"                                                |
| Settings    | "Shape the language that holds you."                                                                    |
| Crisis      | "You're walking through a dark threshold. Guides are waiting—professional support is just a call away." |

---

### 2.4 Minimal Tone

**Characteristics:**

- Brief and essential
- No extra words
- Clear without being cold
- Respect for silence

**Target Users:**

- Prefer less guidance
- Want to avoid "hand-holding"
- Appreciate brevity
- Find lengthy prompts overwhelming

**Example Prompts:**

```
Minimal (Letters):
"Who are you writing to?"

Minimal (Grief):
"What do you miss most?"

Minimal (Completion):
"Saved to vault."
```

**UI Copy Examples:**

| Element     | Minimal Version                    |
| ----------- | ---------------------------------- |
| Button      | "Save"                             |
| Empty state | "No entries."                      |
| Settings    | "Preferences"                      |
| Crisis      | "Crisis resources available 24/7." |

---

## 3. Writing Principles

### 3.1 Always

✅ **Use second person ("you") when addressing the user**

```
Good: "Your letter has been saved."
Bad:  "The user's letter has been saved."
```

✅ **Lead with the benefit or outcome**

```
Good: "Your insights will appear here after you log 5 moods."
Bad:  "After logging 5 moods, insights will be generated."
```

✅ **Be specific about what will happen**

```
Good: "This will permanently delete your letter. You cannot undo this."
Bad:  "Are you sure?"
```

✅ **Acknowledge difficulty**

```
Good: "Writing about loss can be painful. Take breaks as needed."
Bad:  "This should be easy!"
```

✅ **Respect user agency**

```
Good: "Would you like to enable AI suggestions?"
Bad:  "Turn on AI to make writing easier!" (implies current writing is hard)
```

### 3.2 Never

❌ **Use jargon or technical terms without explanation**

```
Bad:  "Enable AES-256 encryption"
Good: "Encrypt your content (recommended)"
```

❌ **Minimize emotional pain**

```
Bad:  "Don't be sad! Look on the bright side."
Good: "It's okay to feel sad. There's no rushing grief."
```

❌ **Make clinical or medical claims**

```
Bad:  "CLOSURE treats depression and anxiety."
Good: "CLOSURE supports your emotional wellness journey."
```

❌ **Use manipulative or shame-based language**

```
Bad:  "Don't you want to complete your healing?"
Good: "Continue when you're ready."
```

❌ **Create false urgency**

```
Bad:  "Only 3 days left to complete this letter!"
Good: "This draft will be saved until you're ready."
```

---

## 4. UI Copy Guidelines

### 4.1 Buttons

**Primary Actions (CTAs):**

```
✅ Specific verb + object:
- "Save Letter"
- "Complete Ritual"
- "Schedule Delivery"

❌ Generic or vague:
- "Submit"
- "OK"
- "Continue" (without context)
```

**Secondary Actions:**

```
✅ Clear alternative:
- "Save Draft"
- "Cancel"
- "Back to Vault"

❌ Ambiguous:
- "Maybe Later"
- "Not Now"
```

**Destructive Actions:**

```
✅ Explicit consequence:
- "Delete Forever"
- "Remove from Vault"
- "Clear All Data"

❌ Casual or unclear:
- "Delete"
- "Remove"
- "Clear"
```

### 4.2 Form Labels

**Be conversational but clear:**

```
✅ Natural language:
- "Who is this letter for?"
- "What type of loss are you processing?"
- "When should this capsule be delivered?"

❌ Database-style labels:
- "Recipient Name"
- "Loss Type"
- "Delivery Date"
```

### 4.3 Helper Text

**Explain the "why" or provide examples:**

```
Label: "Who is this letter for?"
Helper: "e.g., your mother, your younger self, an ex-partner, a lost friend"

Label: "What's your primary emotion right now?"
Helper: "Choose the feeling that's strongest for you in this moment."
```

### 4.4 Placeholder Text

**Show format or give gentle prompt:**

```
✅ Input placeholders:
- "Dear..."
- "Type to search your vault"
- "e.g., Mom, my former self"

❌ Redundant or obvious:
- "Enter text here"
- "Search"
- "Recipient"
```

### 4.5 Empty States

**Structure: Icon + Short heading + Context + Action**

```
[Icon: ✉️]

No letters yet.

Write what you never got to say—to someone you've lost,
someone you miss, or even to your former self.

[Write Your First Letter]
```

### 4.6 Success Messages

**Affirm the action, be brief:**

```
✅ Toast notifications:
- "Letter saved"
- "Mood logged"
- "Settings updated"

❌ Overly enthusiastic:
- "Awesome! Your letter has been saved successfully!"
- "Great job logging your mood! 🎉"
```

---

## 5. Prompt Writing

### 5.1 Structure of Good Prompts

**Anatomy:**

```
[Optional: Validating statement]
[Core question]
[Optional: Example or clarification]
```

**Example:**

```
Validating: "It's common to feel stuck when writing about loss."
Question:   "What's one memory of them that brings you comfort?"
Example:    "It could be something small—a phrase they said, a habit they had."
```

### 5.2 Prompt Principles

**Open-Ended Questions**

```
✅ Invites exploration:
- "What would you want them to know about who you've become?"
- "What do you wish you could have said?"

❌ Yes/No or closed:
- "Do you miss them?"
- "Was it difficult?"
```

**Specific Yet Flexible**

```
✅ Gives direction without prescribing:
- "Think of one moment you shared. What happened?"

❌ Too vague:
- "Tell me about your relationship."

❌ Too narrow:
- "Describe the last time you saw them on a Tuesday in winter."
```

**One Thing at a Time**

```
✅ Single focus:
- "What do you miss most about them?"

❌ Multiple questions:
- "What do you miss and what would you say and how do you feel?"
```

### 5.3 Tone-Specific Prompts

**For Letters Unsent:**

| Tone       | Prompt                                                                            |
| ---------- | --------------------------------------------------------------------------------- |
| Grounded   | "Identify the core message you never communicated. What needed to be said?"       |
| Reflective | "What would you want them to know about who you've become since you last spoke?"  |
| Poetic     | "If this letter were a bridge across silence, what words would you carry across?" |
| Minimal    | "What never got said?"                                                            |

**For Grief Rituals:**

| Tone       | Prompt                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------- |
| Grounded   | "Name three specific things you miss about them. Be concrete."                              |
| Reflective | "Notice what arises when you think of this person. What do you find yourself holding onto?" |
| Poetic     | "They live on in the stories you carry. What piece of their light remains?"                 |
| Minimal    | "What stays with you?"                                                                      |

---

## 6. Error Messages

### 6.1 Structure

**Format:**

```
[What happened]
[Why it might have happened]
[What the user can do]
```

### 6.2 Examples

**Validation Error:**

```
❌ "Required field"

✅ "Please enter who this letter is for.
   This helps you organize your vault later."
```

**Network Error:**

```
❌ "Error 500: Server unavailable"

✅ "Couldn't reach the AI service.
   Check your internet connection and try again.

   [Retry] [Continue Without AI]"
```

**Storage Full:**

```
❌ "Quota exceeded"

✅ "Your browser's storage is full.
   To continue, export and delete old entries you no longer need,
   or clear your browser cache.

   [Export My Data] [Learn More]"
```

**Encryption Failed:**

```
❌ "Encryption error"

✅ "Couldn't encrypt your content.
   Your data was saved without encryption this time.
   This is unusual—check your browser settings or try a different browser.

   Your content is still private on your device.

   [Okay] [Learn About Encryption]"
```

### 6.3 Error Tone

**Be:**

- Honest (explain what happened)
- Helpful (provide solutions)
- Calm (not alarming)

**Don't:**

- Blame the user ("You entered invalid data")
- Use jargon ("CORS policy blocked request")
- Dead-end ("Cannot proceed")

---

## 7. Crisis Communication

### 7.1 Detection

When crisis keywords are detected:

```
Keywords: suicide, suicidal, kill myself, end my life, self-harm, hurt myself, etc.
```

### 7.2 Response Banner

**Structure:**

```
[Icon: Warning/Heart]
[Compassionate headline]
[Validating statement]
[Immediate resources with links/numbers]
[International option]
```

**Example:**

```
┌─────────────────────────────────────────────────────────────────┐
│ ❤️  You're Not Alone                                            │
│                                                                 │
│ If you're having thoughts of suicide or self-harm, please      │
│ reach out to a professional immediately. You deserve support.  │
│                                                                 │
│ 📞 National Suicide Prevention Lifeline: 988                   │
│ 💬 Crisis Text Line: Text HOME to 741741                       │
│ 🌍 International Resources: findahelpline.com                  │
│                                                                 │
│ [×] (Dismissible but persists in session)                      │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3 Important Principles

✅ **Show immediately** (no delay)
✅ **Never block saving** (user needs to process, not be stopped)
✅ **Provide specific numbers** (not just "get help")
✅ **Persist through session** (can dismiss but shows again on reload)
✅ **Respect language** (show resources in user's selected language)

---

## 8. Localization

### 8.1 Supported Languages

**Phase 1:**

- English (en)
- Spanish (es)
- French (fr)

**Future:**

- Portuguese (pt)
- German (de)
- Mandarin (zh)
- Japanese (ja)

### 8.2 Translation Principles

**Cultural Sensitivity:**

```
English: "Letters Unsent"
Spanish: "Cartas No Enviadas" (not literal, but culturally appropriate)
French:  "Lettres Jamais Envoyées"
```

**Tone Consistency:**

```
Each of the 4 tones should be translated to maintain:
- Grounded → Straightforward in all languages
- Reflective → Contemplative in all languages
- Poetic → Literary/metaphorical in all languages
- Minimal → Brief in all languages
```

**Crisis Resources:**

```
Each language has its own crisis resources:
- English: 988 (US), Crisis Text Line
- Spanish: 888-628-9454 (US Spanish line)
- French: 3114 (France), varies by country

Always include findahelpline.com for international coverage
```

### 8.3 i18n Key Structure

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "onboarding": {
    "welcome": {
      "title": "Welcome to CLOSURE",
      "subtitle": "Complete what was left unfinished."
    }
  },
  "modes": {
    "letters": {
      "name": "Letters Unsent",
      "description": "Write what you never got to say.",
      "prompts": {
        "grounded": "...",
        "reflective": "...",
        "poetic": "...",
        "minimal": "..."
      }
    }
  }
}
```

### 8.4 Avoid

❌ **Idioms that don't translate:**

```
"Let it all out" → Doesn't work in many languages
Better: "Express what you're feeling"
```

❌ **Cultural assumptions:**

```
"Write to your higher power" → Assumes religious context
Better: "Write to what grounds you"
```

❌ **Wordplay or puns:**

```
Rarely translates well
```

---

## 9. Content Checklist

Before writing any UI copy, ask:

### Voice Alignment

- [ ] Is this compassionate?
- [ ] Is this trustworthy (honest about limitations)?
- [ ] Is this wise (informed but not prescriptive)?
- [ ] Is this patient (no rushing)?

### Tone Adaptation

- [ ] Can this be adapted to all 4 tones?
- [ ] Does it match the user's selected tone?

### Clarity

- [ ] Is it specific about what will happen?
- [ ] Does it use second person ("you")?
- [ ] Is jargon explained or avoided?

### Accessibility

- [ ] Is it screen reader friendly?
- [ ] Does it work without color/icons?
- [ ] Is it translatable?

### Emotional Safety

- [ ] Does it validate, not minimize?
- [ ] Does it provide choice/agency?
- [ ] Does it avoid shame or manipulation?

---

## 10. Examples Library

### Completion Messages

**After saving a letter:**

```
Grounded:   "Saved. You can continue this letter anytime."
Reflective: "Your letter is safely stored in your vault."
Poetic:     "Your words are held safe until you return."
Minimal:    "Saved."
```

**After completing a ritual:**

```
Grounded:   "Ritual complete. This represents real emotional work."
Reflective: "You've honored this relationship through completion."
Poetic:     "You've woven a ceremony from memory and longing."
Minimal:    "Complete."
```

### Prompt Examples

**When user seems stuck:**

```
Grounded:   "Try focusing on one specific moment. What do you remember?"
Reflective: "Sometimes it helps to start with a single detail. What comes to mind?"
Poetic:     "Begin with one thread. Where does it lead?"
Minimal:    "Pick one moment."
```

**For time capsules:**

```
Grounded:   "What do you want your future self to remember about this moment?"
Reflective: "Imagine opening this one year from now. What would matter most to read?"
Poetic:     "What message would you send across time to the person you're becoming?"
Minimal:    "What should you remember?"
```

---

## Summary

This content guide defines:

1. ✅ **Voice**: Compassionate, trustworthy, wise, patient
2. ✅ **4 Adaptive Tones**: Grounded, Reflective, Poetic, Minimal
3. ✅ **Writing Principles**: Second person, specific, validating
4. ✅ **UI Copy**: Buttons, forms, empty states, success messages
5. ✅ **Prompts**: Open-ended, specific yet flexible, one focus
6. ✅ **Errors**: What happened, why, what to do
7. ✅ **Crisis**: Immediate, resourceful, never blocking
8. ✅ **Localization**: Culturally sensitive, tone-consistent

**Every word chosen to heal, not just inform.**
