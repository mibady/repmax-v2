# CLOSURE - Complete Technical Architecture Blueprint

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Data Architecture](#data-architecture)
3. [Security Architecture](#security-architecture)
4. [Component Architecture](#component-architecture)
5. [State Management](#state-management)
6. [Storage Layer](#storage-layer)
7. [AI Integration](#ai-integration)
8. [Performance Optimization](#performance-optimization)
9. [Error Handling](#error-handling)
10. [Testing Strategy](#testing-strategy)

---

## 1. System Architecture

### 1.1 Technology Stack

#### Core Framework

- **React 19.2.0**: Latest stable release with concurrent features
- **TypeScript 5.7.3**: Strict mode enabled for maximum type safety
- **Vite 7.2.4**: Lightning-fast build tool with HMR

#### State Management

- **Zustand 5.0.9**: Minimal, fast state management
- Pattern: Single global store with sliced concerns
- No Redux needed - Zustand provides simpler API with equal power

#### Styling

- **TailwindCSS 4.1.17**: Utility-first CSS framework
- **CSS Variables**: For dynamic theming
- **Animations**: Framer Motion (to be added) or CSS transitions

#### Encryption & Security

- **CryptoJS 4.2.0**: AES-256 encryption for all sensitive data
- Client-side only - zero server knowledge
- Key derivation from device fingerprint + user salt

#### Utilities

- **Lucide React 0.555.0**: Beautiful, accessible icon system
- **i18next 24.2.2**: Internationalization framework
- **date-fns**: Date manipulation (to be added for time capsules)

### 1.2 Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    React App (SPA)                     │  │
│  │                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │  │
│  │  │   UI Layer   │  │  State Layer │  │ Data Layer │  │  │
│  │  │              │  │              │  │            │  │  │
│  │  │ Components   │←→│   Zustand    │←→│  Storage   │  │  │
│  │  │ - Onboarding │  │   Store      │  │  - Local   │  │  │
│  │  │ - Composers  │  │              │  │  - Encrypt │  │  │
│  │  │ - Dashboard  │  │ - User prefs │  │  - Decrypt │  │  │
│  │  │ - Settings   │  │ - Session    │  │            │  │  │
│  │  │              │  │ - UI state   │  │            │  │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘  │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │            Service Layer                         │ │  │
│  │  │  - Encryption (CryptoJS)                        │ │  │
│  │  │  - AI Service (Mock → Real API)                 │ │  │
│  │  │  - Pattern Detection (Client-side ML)           │ │  │
│  │  │  - Crisis Detection                             │ │  │
│  │  │  - i18n Translation                             │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │         Browser APIs                             │ │  │
│  │  │  - localStorage (encrypted vault)               │ │  │
│  │  │  - IndexedDB (future: large files)              │ │  │
│  │  │  - Service Worker (PWA, offline)                │ │  │
│  │  │  - Notification API (time capsule delivery)     │ │  │
│  │  │  - Web Audio API (soundscapes)                  │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

External Services (Optional, User-Controlled):
┌────────────────────────────────────────────────────────────┐
│ - OpenAI API (GPT-4) for AI writing support               │
│ - Anthropic API (Claude) for reflections                  │
│ - Email delivery service (time capsule delivery)          │
│ - Therapist integration portal (future)                   │
└────────────────────────────────────────────────────────────┘
```

### 1.3 File Structure

```
closure/
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker
│   ├── icon-192.png           # App icons
│   ├── icon-512.png
│   └── sounds/                # Soundscape audio files
│       ├── arctic-winds.mp3
│       ├── japanese-garden.mp3
│       └── ...
│
├── src/
│   ├── main.tsx               # App entry point
│   ├── App.tsx                # Root component & routing
│   │
│   ├── types/
│   │   ├── index.ts           # Core types (Letter, Conversation, etc.)
│   │   └── advanced.ts        # Advanced types (MoodEntry, Pattern, etc.)
│   │
│   ├── stores/
│   │   └── useAppStore.ts     # Zustand store (single source of truth)
│   │
│   ├── lib/
│   │   ├── encryption.ts      # AES-256 encryption/decryption
│   │   ├── storage.ts         # localStorage wrapper with encryption
│   │   ├── storage-extended.ts # Extended storage for new types
│   │   ├── tones.ts           # Adaptive tone system
│   │   ├── crisis-resources.ts # Crisis detection & resources
│   │   ├── ai-service.ts      # AI API integration (mock → real)
│   │   ├── emotional-intelligence.ts # Pattern detection
│   │   └── premium-themes.ts  # Theme system
│   │
│   ├── i18n/
│   │   ├── config.ts          # i18n initialization
│   │   └── locales/
│   │       ├── en.json        # English translations
│   │       ├── es.json        # Spanish translations
│   │       └── fr.json        # French translations
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ExperienceModeSelector.tsx
│   │   │
│   │   ├── ui/ (Reusable UI components)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── ProgressBar.tsx
│   │   │
│   │   └── features/
│   │       ├── MoodCheckIn.tsx
│   │       └── (other feature components)
│   │
│   ├── features/
│   │   ├── onboarding/
│   │   │   ├── QuickStart.tsx
│   │   │   └── GuidedOnboarding.tsx
│   │   │
│   │   ├── letters/
│   │   │   ├── LetterComposer.tsx
│   │   │   └── LettersList.tsx
│   │   │
│   │   ├── conversations/
│   │   │   ├── ConversationComposer.tsx
│   │   │   └── ConversationsList.tsx
│   │   │
│   │   ├── transitions/
│   │   │   ├── TransitionComposer.tsx
│   │   │   └── TransitionsList.tsx
│   │   │
│   │   ├── grief/
│   │   │   ├── GriefRitualComposer.tsx
│   │   │   └── GriefRitualsList.tsx
│   │   │
│   │   ├── timecapsules/
│   │   │   ├── TimeCapsuleComposer.tsx
│   │   │   └── TimeCapsulesList.tsx
│   │   │
│   │   ├── vault/
│   │   │   └── VaultDashboard.tsx
│   │   │
│   │   └── settings/
│   │       └── Settings.tsx
│   │
│   └── hooks/ (Custom React hooks)
│       ├── useAutoSave.ts
│       ├── useEncryptedStorage.ts
│       ├── useCrisisDetection.ts
│       └── useTheme.ts
│
├── docs/
│   ├── TECHNICAL_BLUEPRINT.md (this file)
│   ├── DESIGN_SYSTEM.md
│   ├── COMPONENT_LIBRARY.md
│   ├── UX_PATTERNS.md
│   └── CONTENT_GUIDE.md
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## 2. Data Architecture

### 2.1 Core Data Models

#### User Preferences

```typescript
interface UserPreferences {
  // Identity & Personalization
  tone: "grounded" | "reflective" | "poetic" | "minimal";
  language: "en" | "es" | "fr" | string;

  // Accessibility
  darkMode: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: "small" | "medium" | "large";

  // Features
  hasCompletedOnboarding: boolean;
  enableAISupport: boolean;

  // Premium
  isPremium?: boolean;
  subscriptionTier?: "free" | "premium" | "professional";
  themeName?: string;
  soundscapeEnabled?: boolean;
}
```

#### Letter (Core Experience Type)

```typescript
interface Letter {
  id: string; // UUID v4
  recipient: string; // Name or relationship
  content: string; // The letter body
  createdAt: Date; // ISO 8601 timestamp
  updatedAt: Date; // ISO 8601 timestamp
  completedAt?: Date; // When marked complete
  isArchived: boolean; // Soft delete
  tags?: string[]; // User-defined tags

  // Metadata
  wordCount?: number;
  estimatedReadTime?: number; // Minutes
  emotionalTone?: EmotionCategory;

  // AI Support
  aiSuggestions?: AIWritingSuggestion[];
  aiReflection?: string;
}
```

#### Conversation

```typescript
interface Conversation {
  id: string;
  withPerson: string; // Who the conversation is with
  context: string; // Where/when it happened
  whatYouWantedToSay: string; // Your side of the ideal conversation
  whatYouWishTheySaid: string; // Their side of the ideal conversation
  resolution: string; // How it ends
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  isArchived: boolean;
  tags?: string[];
}
```

#### Transition

```typescript
interface Transition {
  id: string;
  fromIdentity: string; // Old self
  toIdentity: string; // New self
  catalystEvent: string; // What triggered the change
  whatYouGained: string; // Positive aspects
  whatYouLost: string; // Grief for the road not taken
  bridgeMessage: string; // Message from old self to new self
  futureIntentions: string; // Moving forward
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  isArchived: boolean;
  tags?: string[];
}
```

#### Grief Ritual

```typescript
interface GriefRitual {
  id: string;
  lossType:
    | "death"
    | "estrangement"
    | "divorce"
    | "miscarriage"
    | "pet"
    | "other";
  personOrThing: string; // Who/what was lost
  relationship: string; // Your connection
  whatYouMiss: string; // Specific memories
  unsaidWords: string; // What you never got to say
  meaningMaking: string; // How this shaped you
  continuingBond: string; // How they live on
  ceremonialClose?: string; // Optional ritual ending
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  isArchived: boolean;
  tags?: string[];
}
```

#### Time Capsule

```typescript
type DeliveryTrigger = "date" | "milestone" | "random" | "legacy";

interface TimeCapsule {
  id: string;
  toFutureSelf: string; // Message to future you
  currentState: string; // Where you are now
  hopesAndFears: string; // Emotions about the future
  advice: string; // What you want to remember
  deliveryTrigger: DeliveryTrigger;
  deliveryDate?: Date; // If trigger is 'date'
  milestoneDescription?: string; // If trigger is 'milestone'
  isDelivered: boolean;
  createdAt: Date;
  scheduledDeliveryAt?: Date;
  deliveredAt?: Date;
  tags?: string[];
}
```

#### Mood Entry (Phase 3)

```typescript
type MoodLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

type EmotionCategory =
  | "joy"
  | "sadness"
  | "anger"
  | "fear"
  | "disgust"
  | "surprise"
  | "love"
  | "gratitude"
  | "peace"
  | "anxiety"
  | "grief"
  | "hope"
  | "shame"
  | "guilt"
  | "pride"
  | "contentment"
  | "loneliness";

interface MoodEntry {
  id: string;
  timestamp: Date;
  primaryEmotion: EmotionCategory;
  secondaryEmotions: EmotionCategory[]; // Max 3
  intensity: MoodLevel; // 1-10 scale
  energyLevel: MoodLevel; // 1-10 scale
  triggers?: string[]; // What caused this mood
  context?: string; // Free-form notes
  notes?: string;

  // Contextual data
  weather?: string;
  sleepQuality?: MoodLevel;
  physicalSymptoms?: string[];

  // Linked to experiences
  linkedLetterId?: string;
  linkedConversationId?: string;
}
```

#### Emotional Pattern (AI-Generated)

```typescript
interface EmotionalPattern {
  id: string;
  patternType: "trigger" | "cycle" | "correlation" | "trend";
  description: string; // Human-readable pattern description
  confidence: number; // 0-100 confidence score
  firstDetected: Date;
  lastOccurrence: Date;
  occurrences: number;
  insight: string; // Therapeutic insight
  recommendation?: string; // Actionable suggestion

  // Pattern-specific data
  triggerKeywords?: string[];
  cycleDays?: number; // For cyclical patterns
  correlatedFactors?: string[];
  trendDirection?: "improving" | "declining" | "stable";
}
```

### 2.2 Data Relationships

```
User Preferences (1)
  ↓
Multiple Experiences (N)
  ├── Letters (N)
  ├── Conversations (N)
  ├── Transitions (N)
  ├── Grief Rituals (N)
  └── Time Capsules (N)

Mood Entries (N)
  ├── Can link to → Letter (0..1)
  ├── Can link to → Conversation (0..1)
  └── Generates → Emotional Patterns (N)

Emotional Patterns (N)
  └── Derived from → Mood Entries (N)
```

### 2.3 Storage Keys

All data stored in `localStorage` with the following keys:

```typescript
const STORAGE_KEYS = {
  // Core
  PREFERENCES: "closure_preferences",
  ENCRYPTION_KEY: "closure_encryption_key",

  // Experiences
  LETTERS: "closure_letters",
  CONVERSATIONS: "closure_conversations",
  TRANSITIONS: "closure_transitions",
  GRIEF_RITUALS: "closure_grief_rituals",
  TIME_CAPSULES: "closure_time_capsules",

  // Emotional Intelligence
  MOOD_ENTRIES: "closure_mood_entries",
  EMOTIONAL_PATTERNS: "closure_emotional_patterns",
  USER_PROFILE: "closure_user_profile",

  // Premium Features
  PREMIUM_STATUS: "closure_premium_status",
  ACTIVE_THEME: "closure_active_theme",
  SOUNDSCAPE_SETTINGS: "closure_soundscape_settings",
} as const;
```

---

## 3. Security Architecture

### 3.1 Encryption Strategy

#### Encryption Algorithm

- **Algorithm**: AES-256-CBC
- **Library**: CryptoJS 4.2.0
- **Key Derivation**: Device fingerprint + user-specific salt
- **IV Generation**: Random IV per encryption operation

#### What Gets Encrypted

```typescript
// ✅ ENCRYPTED (Sensitive user content)
- All letter content
- All conversation content
- All transition reflections
- All grief ritual responses
- All time capsule messages
- All mood entry notes
- User profile data

// ❌ NOT ENCRYPTED (Non-sensitive preferences)
- UI preferences (dark mode, font size)
- Language selection
- Accessibility settings
- App version
```

#### Encryption Implementation

```typescript
// src/lib/encryption.ts

import CryptoJS from "crypto-js";

// Generate device-specific key
const getDeviceFingerprint = (): string => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "fallback-key";

  ctx.textBaseline = "top";
  ctx.font = "14px Arial";
  ctx.fillText("CLOSURE", 2, 2);

  return canvas.toDataURL();
};

const getEncryptionKey = (): string => {
  let key = localStorage.getItem("closure_encryption_key");

  if (!key) {
    const fingerprint = getDeviceFingerprint();
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36);

    key = CryptoJS.SHA256(fingerprint + timestamp + random).toString();
    localStorage.setItem("closure_encryption_key", key);
  }

  return key;
};

export const encrypt = (data: any): string => {
  const key = getEncryptionKey();
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, key).toString();
};

export const decrypt = <T>(encryptedData: string): T | null => {
  try {
    const key = getEncryptionKey();
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedString) {
      throw new Error("Decryption failed - empty result");
    }

    return JSON.parse(decryptedString) as T;
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};
```

### 3.2 Data Privacy Principles

#### Zero-Knowledge Architecture

```
┌─────────────────────────────────────────────────────┐
│  CLOSURE Never Knows:                               │
│  ✓ What you write (all content encrypted)          │
│  ✓ Who you're writing to                           │
│  ✓ Your emotional patterns (detected client-side)  │
│  ✓ Your mood data                                  │
│  ✓ Any personally identifying information          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Data NEVER Leaves Your Device:                     │
│  ✓ All storage is localStorage (browser-based)     │
│  ✓ All processing is client-side JavaScript        │
│  ✓ Pattern detection runs in your browser          │
│  ✓ No analytics, no tracking, no telemetry         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Optional External Services (User Control):         │
│  • AI writing support (OpenAI/Anthropic)           │
│    → Only if user enables                           │
│    → Only sends context, not full content           │
│    → User can disable anytime                       │
│  • Time capsule email delivery                     │
│    → Only email address, not content                │
│    → Content encrypted before sending               │
└─────────────────────────────────────────────────────┘
```

### 3.3 Crisis Detection Protocol

```typescript
// src/lib/crisis-resources.ts

const CRISIS_KEYWORDS = [
  "suicide",
  "suicidal",
  "kill myself",
  "end my life",
  "want to die",
  "self-harm",
  "hurt myself",
  "can't go on",
  "no reason to live",
  "better off dead",
];

export const detectCrisisLanguage = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return CRISIS_KEYWORDS.some((keyword) => lowerText.includes(keyword));
};

export const CRISIS_RESOURCES = {
  en: {
    hotline: "988",
    hotlineName: "National Suicide Prevention Lifeline",
    textLine: "Text HOME to 741741",
    textLineName: "Crisis Text Line",
    international: "https://findahelpline.com",
  },
  es: {
    hotline: "888-628-9454",
    hotlineName: "Línea Nacional de Prevención del Suicidio",
    textLine: "Text HOLA to 741741",
    textLineName: "Línea de Texto de Crisis",
    international: "https://findahelpline.com",
  },
  // ... other languages
};
```

**Crisis Detection Flow:**

1. Text input monitored in real-time (debounced)
2. If crisis keyword detected → Show banner immediately
3. Banner contains:
   - Compassionate message
   - Local crisis hotline number
   - Text line option
   - Link to international resources
4. User can dismiss but banner persists in session
5. Save operation still works (never block user from saving)

---

## 4. Component Architecture

### 4.1 Component Hierarchy

```
App (Root)
├── Onboarding Flow
│   ├── QuickStart
│   └── GuidedOnboarding
│       ├── Step 1: Welcome
│       ├── Step 2: Tone Selection
│       ├── Step 3: Accessibility Preferences
│       └── Step 4: Privacy Explanation
│
├── Main Application
│   ├── Header
│   │   ├── Logo
│   │   ├── Navigation
│   │   └── Settings Button
│   │
│   ├── Experience Mode Selector
│   │   └── Mode Cards (5)
│   │       ├── Letters Unsent
│   │       ├── Conversations Revisited
│   │       ├── Transitions
│   │       ├── Grief Rituals
│   │       └── Time Capsules
│   │
│   ├── Experience Composers
│   │   ├── LetterComposer
│   │   │   ├── Recipient Input
│   │   │   ├── Content Textarea
│   │   │   ├── AI Support Panel (optional)
│   │   │   ├── Crisis Banner (conditional)
│   │   │   ├── Tone-Aware Prompts
│   │   │   └── Action Buttons
│   │   │
│   │   ├── ConversationComposer
│   │   ├── TransitionComposer
│   │   ├── GriefRitualComposer
│   │   └── TimeCapsuleComposer
│   │
│   ├── Vault Dashboard
│   │   ├── Summary Stats
│   │   ├── Recent Entries
│   │   ├── Emotional Trends (if enabled)
│   │   └── Filtered Lists
│   │
│   ├── Mood Check-In (Phase 3)
│   │   ├── Step 1: Primary Emotion
│   │   ├── Step 2: Secondary Emotions
│   │   └── Step 3: Intensity & Energy
│   │
│   └── Settings
│       ├── Preferences Tab
│       ├── Accessibility Tab
│       ├── Premium Tab
│       ├── Data & Privacy Tab
│       └── About Tab
│
└── Modals & Overlays
    ├── Crisis Resources Modal
    ├── AI Suggestion Modal
    ├── Theme Selector
    ├── Export Data Modal
    └── Confirmation Dialogs
```

### 4.2 Component Patterns

#### Composer Pattern (All Experience Types)

Every composer follows this consistent structure:

```typescript
interface ComposerProps<T> {
  item?: T;                    // Existing item for editing
  onSave: (item: T) => void;  // Save draft
  onComplete: (item: T) => void; // Mark complete
  onCancel: () => void;        // Exit without saving
}

// State management
- Local state for form fields
- Debounced auto-save (3 seconds)
- Crisis detection on content change
- Tone-aware prompts based on user preference
- Word count and estimated time
- AI support panel (collapsible)

// Accessibility
- Proper label associations
- Keyboard navigation
- Focus management
- ARIA live regions for status updates
```

#### Auto-Save Pattern

```typescript
useEffect(() => {
  if (!isFormValid()) return;

  const saveTimeout = setTimeout(() => {
    handleSave();
  }, 3000); // 3 second debounce

  return () => clearTimeout(saveTimeout);
}, [formField1, formField2, formField3]);
```

#### Crisis Detection Pattern

```typescript
useEffect(() => {
  if (content && detectCrisisLanguage(content)) {
    setShowCrisisResources(true);
  }
}, [content]);
```

---

## 5. State Management

### 5.1 Zustand Store Structure

```typescript
// src/stores/useAppStore.ts

interface AppState {
  // User Preferences
  preferences: UserPreferences;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;

  // Current Session
  currentView: "onboarding" | "dashboard" | "mode-selector" | "experience";
  selectedMode: ExperienceMode | null;
  setCurrentView: (view: string) => void;
  setSelectedMode: (mode: ExperienceMode | null) => void;

  // Vault Data (Loaded from localStorage)
  letters: Letter[];
  conversations: Conversation[];
  transitions: Transition[];
  griefRituals: GriefRitual[];
  timeCapsules: TimeCapsule[];
  moodEntries: MoodEntry[];

  // Data Actions
  loadVaultData: () => void;
  saveVaultData: () => void;

  // UI State
  isSidebarOpen: boolean;
  activeModal: string | null;
  toastMessage: string | null;
  isLoading: boolean;

  // UI Actions
  toggleSidebar: () => void;
  showModal: (modalId: string) => void;
  hideModal: () => void;
  showToast: (message: string) => void;
  setLoading: (loading: boolean) => void;
}

const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  preferences: loadPreferences(),
  currentView: "onboarding",
  selectedMode: null,
  letters: [],
  conversations: [],
  // ... etc

  // Actions
  updatePreferences: (prefs) => {
    const updated = { ...get().preferences, ...prefs };
    set({ preferences: updated });
    savePreferences(updated);
  },

  // ... all other actions
}));
```

### 5.2 State Persistence

```typescript
// On app load (main.tsx)
useEffect(() => {
  const store = useAppStore.getState();
  store.loadVaultData(); // Decrypt and load all data from localStorage
}, []);

// On data change (automatic via Zustand middleware)
subscribe((state) => {
  // Encrypt and save to localStorage
  saveLetters(state.letters);
  saveConversations(state.conversations);
  // ... etc
});
```

---

## 6. Storage Layer

### 6.1 Storage Implementation

```typescript
// src/lib/storage.ts

import { encrypt, decrypt } from "./encryption";

// Generic save function
export const saveEncryptedData = <T>(key: string, data: T[]): void => {
  try {
    const encrypted = encrypt(data);
    localStorage.setItem(key, encrypted);
  } catch (error) {
    console.error(`Failed to save ${key}:`, error);
    throw error;
  }
};

// Generic load function
export const loadEncryptedData = <T>(key: string): T[] => {
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return [];

    const decrypted = decrypt<T[]>(encrypted);
    return decrypted || [];
  } catch (error) {
    console.error(`Failed to load ${key}:`, error);
    return [];
  }
};

// Specific loaders
export const loadLetters = (): Letter[] =>
  loadEncryptedData<Letter>(STORAGE_KEYS.LETTERS);

export const saveLetters = (letters: Letter[]): void =>
  saveEncryptedData(STORAGE_KEYS.LETTERS, letters);

// ... same pattern for all data types
```

### 6.2 Data Migration Strategy

```typescript
// For future schema changes
const CURRENT_VERSION = 3;

interface StorageMetadata {
  version: number;
  lastUpdated: Date;
  backupAvailable: boolean;
}

export const migrateData = (): void => {
  const metadata = loadMetadata();

  if (metadata.version < CURRENT_VERSION) {
    // Create backup before migration
    createBackup();

    // Run migrations
    if (metadata.version < 2) migrateV1toV2();
    if (metadata.version < 3) migrateV2toV3();

    // Update metadata
    saveMetadata({ version: CURRENT_VERSION, lastUpdated: new Date() });
  }
};
```

---

## 7. AI Integration

### 7.1 AI Service Architecture

```typescript
// src/lib/ai-service.ts

type AIProvider = "openai" | "anthropic" | "mock";

interface AIConfig {
  provider: AIProvider;
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface AIWritingSuggestion {
  type: "prompt" | "vocabulary" | "reframe";
  content: string;
}

interface AIReflection {
  insight: string;
  suggestedTheme: string;
  emotionalTone: EmotionCategory;
}

// Main AI service
export class AIService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  async getWritingSuggestion(
    type: "prompt" | "vocabulary" | "reframe",
    context: string,
  ): Promise<AIWritingSuggestion> {
    if (this.config.provider === "mock") {
      return this.mockSuggestion(type);
    }

    // Real API call
    const response = await this.callAPI({
      prompt: this.buildPrompt(type, context),
      temperature: 0.7,
      maxTokens: 150,
    });

    return {
      type,
      content: response.text,
    };
  }

  async generateReflection(content: string): Promise<AIReflection> {
    // Call AI to analyze content and provide therapeutic reflection
    // ...
  }

  private async callAPI(params: any): Promise<any> {
    if (this.config.provider === "openai") {
      return this.callOpenAI(params);
    } else if (this.config.provider === "anthropic") {
      return this.callAnthropic(params);
    }
  }

  private async callOpenAI(params: any): Promise<any> {
    // OpenAI GPT-4 integration
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a compassionate writing assistant for emotional wellness.",
          },
          {
            role: "user",
            content: params.prompt,
          },
        ],
        temperature: params.temperature,
        max_tokens: params.maxTokens,
      }),
    });

    const data = await response.json();
    return { text: data.choices[0].message.content };
  }

  private async callAnthropic(params: any): Promise<any> {
    // Anthropic Claude integration
    // Similar structure
  }
}
```

### 7.2 AI Ethical Boundaries

```typescript
// Prompts are designed with ethical constraints

const AI_SYSTEM_PROMPT = `
You are a compassionate writing assistant for CLOSURE, an emotional wellness app.

CRITICAL RULES:
1. NEVER roleplay as a deceased person or lost loved one
2. NEVER simulate responses from real people in the user's life
3. NEVER provide medical or psychiatric advice
4. NEVER claim to be a therapist or mental health professional
5. ALWAYS suggest professional help for serious mental health concerns

YOUR ROLE:
- Suggest writing prompts to help users express emotions
- Offer vocabulary options for articulating complex feelings
- Provide gentle reframing perspectives (not advice)
- Recognize and affirm the user's emotional experience

TONE: Warm, validating, non-directive, trauma-informed
`;
```

---

## 8. Performance Optimization

### 8.1 Bundle Size

**Current Production Build:**

- Total: 390 KB (124 KB gzipped)
- Target: Keep under 500 KB uncompressed

**Code Splitting Strategy:**

```typescript
// Lazy load experience modes
const LetterComposer = lazy(() => import("./features/letters/LetterComposer"));
const ConversationComposer = lazy(
  () => import("./features/conversations/ConversationComposer"),
);
// ... etc

// Lazy load heavy features
const MoodCheckIn = lazy(() => import("./components/features/MoodCheckIn"));
const EmotionalDashboard = lazy(
  () => import("./features/dashboard/EmotionalDashboard"),
);
```

### 8.2 Rendering Optimization

```typescript
// Memoize expensive components
const MoodChart = React.memo(({ data }: MoodChartProps) => {
  // Complex visualization
});

// Virtualize long lists
import { FixedSizeList } from 'react-window';

const LettersList = ({ letters }: { letters: Letter[] }) => (
  <FixedSizeList
    height={600}
    itemCount={letters.length}
    itemSize={80}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        <LetterCard letter={letters[index]} />
      </div>
    )}
  </FixedSizeList>
);
```

### 8.3 Storage Optimization

```typescript
// For very large vaults, use IndexedDB instead of localStorage
const STORAGE_THRESHOLD = 5 * 1024 * 1024; // 5 MB

export const saveData = async <T>(key: string, data: T): Promise<void> => {
  const size = new Blob([JSON.stringify(data)]).size;

  if (size > STORAGE_THRESHOLD) {
    // Use IndexedDB for large data
    await saveToIndexedDB(key, data);
  } else {
    // Use localStorage for small data
    localStorage.setItem(key, encrypt(data));
  }
};
```

---

## 9. Error Handling

### 9.1 Error Boundaries

```typescript
// src/components/ErrorBoundary.tsx

class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error tracking service (optional, privacy-respecting)
    console.error('App error:', error, errorInfo);

    // Try to save user's current work before crashing
    this.saveCurrentWork();
  }

  saveCurrentWork = () => {
    try {
      const store = useAppStore.getState();
      store.saveVaultData();
    } catch (e) {
      console.error('Failed to save on error:', e);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-screen">
          <h1>Something went wrong</h1>
          <p>Your data is safe. Please refresh the page.</p>
          <button onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 9.2 Graceful Degradation

```typescript
// If encryption fails, still allow user to work (with warning)
export const saveWithFallback = <T>(key: string, data: T): void => {
  try {
    const encrypted = encrypt(data);
    localStorage.setItem(key, encrypted);
  } catch (encryptionError) {
    console.warn("Encryption failed, saving unencrypted:", encryptionError);

    // Show warning to user
    showToast("⚠️ Data saved without encryption. Check your browser settings.");

    // Save unencrypted as fallback
    localStorage.setItem(`${key}_unencrypted`, JSON.stringify(data));
  }
};
```

---

## 10. Testing Strategy

### 10.1 Test Pyramid

```
        ┌─────────────┐
       ╱  E2E Tests   ╱│  (10% - Critical user flows)
      ╱──────────────╱ │
     ├──────────────┤  │
    ╱ Integration   ╱  │  (30% - Component interactions)
   ╱──────────────╱   │
  ├──────────────┤    │
 ╱  Unit Tests   ╱    │  (60% - Business logic, utils)
╱──────────────╱     │
└──────────────┴─────┘
```

### 10.2 Test Coverage Goals

**Unit Tests (60%):**

- `src/lib/encryption.ts` - 100% coverage
- `src/lib/storage.ts` - 100% coverage
- `src/lib/crisis-resources.ts` - 100% coverage
- `src/lib/emotional-intelligence.ts` - 90% coverage
- `src/lib/tones.ts` - 80% coverage

**Integration Tests (30%):**

- Composer components with store
- Storage layer with encryption
- AI service with mock providers

**E2E Tests (10%):**

- Complete onboarding flow
- Write and save a letter
- Mood check-in flow
- Data export/import

### 10.3 Test Examples

```typescript
// Unit test - encryption
describe('encryption', () => {
  it('should encrypt and decrypt data correctly', () => {
    const original = { id: '123', content: 'sensitive data' };
    const encrypted = encrypt(original);
    const decrypted = decrypt(encrypted);

    expect(decrypted).toEqual(original);
    expect(encrypted).not.toContain('sensitive data');
  });

  it('should generate consistent encryption keys', () => {
    const key1 = getEncryptionKey();
    const key2 = getEncryptionKey();

    expect(key1).toBe(key2);
  });
});

// Integration test - auto-save
describe('LetterComposer auto-save', () => {
  it('should auto-save after 3 seconds of inactivity', async () => {
    const mockSave = jest.fn();
    render(<LetterComposer onSave={mockSave} />);

    const textarea = screen.getByRole('textbox');
    userEvent.type(textarea, 'Dear Mom, I never got to tell you...');

    await waitFor(() => expect(mockSave).toHaveBeenCalled(), { timeout: 3500 });
  });
});

// E2E test - complete flow
describe('Letter writing flow', () => {
  it('should complete full letter writing experience', async () => {
    await page.goto('http://localhost:5173');

    // Complete onboarding
    await page.click('[data-testid="quick-start"]');

    // Select experience mode
    await page.click('[data-testid="mode-letters-unsent"]');

    // Write letter
    await page.fill('[data-testid="recipient-input"]', 'Mom');
    await page.fill('[data-testid="content-textarea"]', 'Dear Mom, I wish I could have told you...');

    // Save and complete
    await page.click('[data-testid="complete-button"]');

    // Verify in vault
    expect(await page.textContent('[data-testid="vault-count"]')).toBe('1 letter');
  });
});
```

---

## Summary

This technical blueprint defines:

1. ✅ **System Architecture**: React + TypeScript + Vite + Zustand
2. ✅ **Data Architecture**: 6 core data models + emotional intelligence layer
3. ✅ **Security**: AES-256 encryption, zero-knowledge, client-side only
4. ✅ **Components**: Hierarchical structure with consistent patterns
5. ✅ **State Management**: Zustand store with encrypted persistence
6. ✅ **Storage**: localStorage with migration strategy
7. ✅ **AI Integration**: Ethical, optional, user-controlled
8. ✅ **Performance**: Code splitting, virtualization, <500 KB target
9. ✅ **Error Handling**: Boundaries, graceful degradation, auto-save
10. ✅ **Testing**: 60/30/10 pyramid with clear coverage goals

**Next Documents:**

- `DESIGN_SYSTEM.md` - Visual design, typography, colors, spacing
- `COMPONENT_LIBRARY.md` - Detailed component specs and usage
- `UX_PATTERNS.md` - User flows, interactions, accessibility
- `CONTENT_GUIDE.md` - Writing style, tone guidelines, copy specs
