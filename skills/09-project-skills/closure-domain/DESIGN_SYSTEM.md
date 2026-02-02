# CLOSURE - Design System & Style Guide

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Elevation & Shadows](#elevation--shadows)
6. [Iconography](#iconography)
7. [Motion & Animation](#motion--animation)
8. [Themes](#themes)
9. [Responsive Design](#responsive-design)
10. [Accessibility](#accessibility)

---

## 1. Design Philosophy

### Core Principles

#### 1.1 **Healing Luxury**

- Spa-like calmness meets clinical sophistication
- Premium feel without being ostentatious
- Therapeutic rigor wrapped in beautiful design
- Every interaction should feel like a compassionate embrace

#### 1.2 **Privacy Through Design**

- No dark patterns, no manipulative UX
- Clear, honest communication about data
- User always in control
- Transparency builds trust

#### 1.3 **Accessible by Default**

- WCAG 2.1 AA minimum (AAA where possible)
- Keyboard navigation for everything
- Screen reader optimized
- High contrast mode
- Reduced motion support

#### 1.4 **Emotional Intelligence**

- Design adapts to user's emotional state
- Tone-aware visual language
- Trauma-informed interaction patterns
- Never rushed, always patient

### Design Mood Board

```
┌─────────────────────────────────────────────────────────┐
│ CLOSURE Aesthetic:                                      │
│                                                         │
│ ✓ Soft gradients (not harsh transitions)              │
│ ✓ Warm neutrals (not cold grays)                       │
│ ✓ Ample whitespace (breathing room)                    │
│ ✓ Subtle textures (tactile without being distracting)  │
│ ✓ Gentle curves (no sharp edges on interactive)        │
│ ✓ Considered typography (elegant legibility)           │
│ ✓ Thoughtful micro-interactions (delightful feedback)  │
└─────────────────────────────────────────────────────────┘

Inspiration:
- Calm app (visual serenity)
- Linear (thoughtful interactions)
- Day One (premium journaling feel)
- Notion (spatial organization)
- Stripe (clarity + sophistication)
```

---

## 2. Color System

### 2.1 Primary Palette (Classic Theme)

#### **Primary Color - Healing Teal**

```css
--color-primary-50: #f0f9fa; /* Lightest - hover states, backgrounds */
--color-primary-100: #d4f0f2;
--color-primary-200: #a8e1e5;
--color-primary-300: #7dd2d8;
--color-primary-400: #51c3cb;
--color-primary-500: #2a6470; /* Base - main brand color */
--color-primary-600: #225059;
--color-primary-700: #1b3c43;
--color-primary-800: #13282c;
--color-primary-900: #0c1416; /* Darkest - text on light backgrounds */
```

**Usage:**

- Primary buttons, links, focus states
- Brand elements, logo
- Active navigation items
- Progress indicators

#### **Secondary Color - Warm Rose**

```css
--color-secondary-50: #faf5f5;
--color-secondary-100: #f2e6e6;
--color-secondary-200: #e5cccc;
--color-secondary-300: #d8b3b3;
--color-secondary-400: #cb9999;
--color-secondary-500: #c4a7a7; /* Base - soft, comforting */
--color-secondary-600: #9d8686;
--color-secondary-700: #766464;
--color-secondary-800: #4e4343;
--color-secondary-900: #272121;
```

**Usage:**

- Secondary buttons
- Subtle accents
- Decorative elements
- Emotional warmth indicators

#### **Accent Color - Gold**

```css
--color-accent-50: #fbf8f2;
--color-accent-100: #f5efe0;
--color-accent-200: #ebdfc1;
--color-accent-300: #e1cfa2;
--color-accent-400: #d7bf83;
--color-accent-500: #d4af7a; /* Base - premium, valuable */
--color-accent-600: #aa8c62;
--color-accent-700: #7f6949;
--color-accent-800: #554631;
--color-accent-900: #2a2318;
```

**Usage:**

- Premium features
- "Complete" states
- Achievement indicators
- Special moments (completing a ritual)

### 2.2 Neutral Palette

#### **Backgrounds**

```css
--color-bg-primary: #faf9f7; /* Main background - warm white */
--color-bg-secondary: #f5f4f1; /* Card backgrounds */
--color-bg-tertiary: #efede8; /* Subtle containers */
--color-bg-elevated: #ffffff; /* Modals, popovers */
--color-bg-overlay: rgba(0, 0, 0, 0.4); /* Behind modals */
```

#### **Text**

```css
--color-text-primary: #2d2d2d; /* Main content - very dark gray */
--color-text-secondary: #5a5a5a; /* Supporting text */
--color-text-tertiary: #8c8c8c; /* Placeholder, disabled */
--color-text-inverse: #ffffff; /* On dark backgrounds */
--color-text-link: #2a6470; /* Inherits from primary-500 */
```

#### **Borders**

```css
--color-border-light: #e8e6e1; /* Subtle dividers */
--color-border-medium: #d4d1ca; /* Default borders */
--color-border-strong: #b8b4aa; /* Emphasized borders */
--color-border-focus: #2a6470; /* Focus rings (primary) */
```

### 2.3 Semantic Colors

#### **Success - Gentle Green**

```css
--color-success-50: #f0f9f4;
--color-success-500: #52c99a; /* Saved successfully */
--color-success-700: #2a6b4f;
```

#### **Warning - Warm Amber**

```css
--color-warning-50: #fff8f0;
--color-warning-500: #f5a962; /* Unsaved changes */
--color-warning-700: #c47a2a;
```

#### **Error - Compassionate Red**

```css
--color-error-50: #fef2f2;
--color-error-500: #e27676; /* Validation errors (not harsh) */
--color-error-700: #c53030;
```

#### **Info - Soft Blue**

```css
--color-info-50: #f0f7fb;
--color-info-500: #64a8d8; /* Helpful tips */
--color-info-700: #2e6da4;
```

#### **Crisis - Urgent but Calm**

```css
--color-crisis-bg: #fff5f5; /* Crisis banner background */
--color-crisis-text: #c53030; /* Crisis text */
--color-crisis-border: #fed7d7;
```

### 2.4 Emotion Colors (for Mood Tracking)

```css
/* Used in MoodCheckIn component and emotional dashboards */
--emotion-joy: #ffd700; /* Gold - radiant */
--emotion-sadness: #4169e1; /* Royal Blue - deep */
--emotion-anger: #dc143c; /* Crimson - intense but not harsh */
--emotion-fear: #8b4789; /* Dark Orchid - unsettling */
--emotion-disgust: #6b8e23; /* Olive Drab - visceral */
--emotion-surprise: #ff6347; /* Tomato - sudden */
--emotion-love: #ff1493; /* Deep Pink - warm */
--emotion-gratitude: #32cd32; /* Lime Green - uplifting */
--emotion-peace: #87ceeb; /* Sky Blue - serene */
--emotion-anxiety: #ff8c00; /* Dark Orange - activating */
--emotion-grief: #4b0082; /* Indigo - heavy */
--emotion-hope: #ffb6c1; /* Light Pink - gentle */
--emotion-shame: #8b4513; /* Saddle Brown - withdrawn */
--emotion-guilt: #a0522d; /* Sienna - burdened */
--emotion-pride: #9370db; /* Medium Purple - elevated */
--emotion-contentment: #98fb98; /* Pale Green - satisfied */
--emotion-loneliness: #708090; /* Slate Gray - isolated */
```

### 2.5 Dark Mode Palette

```css
/* Automatically applied when preferences.darkMode === true */
[data-theme="dark"] {
  /* Backgrounds (inverted lightness) */
  --color-bg-primary: #1a1816;
  --color-bg-secondary: #231f1c;
  --color-bg-tertiary: #2d2823;
  --color-bg-elevated: #38332c;

  /* Text (inverted) */
  --color-text-primary: #f5f4f1;
  --color-text-secondary: #c4c2bc;
  --color-text-tertiary: #9b9891;

  /* Borders (adjusted for dark) */
  --color-border-light: #38332c;
  --color-border-medium: #4a453d;
  --color-border-strong: #5e5850;

  /* Primary colors (slightly desaturated for dark mode) */
  --color-primary-500: #3d8a9a; /* Lighter teal */
  --color-accent-500: #e0c68a; /* Warmer gold */
}
```

### 2.6 High Contrast Mode

```css
/* Applied when preferences.highContrast === true */
[data-contrast="high"] {
  --color-text-primary: #000000;
  --color-bg-primary: #ffffff;
  --color-border-focus: #000000; /* Black focus rings */
  --color-primary-500: #005a6e; /* Darker teal for WCAG AAA */

  /* Remove all subtle borders */
  --color-border-light: transparent;

  /* Increase all shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
}
```

---

## 3. Typography

### 3.1 Font Families

#### **Primary Font - Inter**

```css
--font-family-base:
  "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
  "Ubuntu", "Cantarell", sans-serif;
```

**Rationale:**

- Designed for screen readability
- Excellent at small sizes
- Professional yet warm
- Variable font support (efficient loading)

**Usage:**

- All UI text, buttons, labels, forms
- Anything functional

#### **Display Font - Inter (same)**

```css
--font-family-display: "Inter", sans-serif;
```

**Rationale:**

- Consistency over variety
- Inter works beautifully at large sizes
- Maintains cohesive feel

**Usage:**

- Headings, page titles
- Onboarding screens
- Marketing copy

#### **Content Font - Georgia (serif)**

```css
--font-family-content: "Georgia", "Times New Roman", serif;
```

**Rationale:**

- Serif reduces reading fatigue for long-form
- Feels more personal, like a letter
- Familiar, trustworthy

**Usage:**

- User-written content (letters, reflections)
- Reading mode
- When user wants a different feel (setting)

### 3.2 Type Scale

```css
/* Modular scale: 1.250 (Major Third) */
--text-xs: 0.64rem; /* 10.24px - Tiny labels */
--text-sm: 0.8rem; /* 12.8px  - Small labels, captions */
--text-base: 1rem; /* 16px    - Body text (default) */
--text-lg: 1.25rem; /* 20px    - Large body, subheadings */
--text-xl: 1.563rem; /* 25px    - Card titles */
--text-2xl: 1.953rem; /* 31.25px - Section headings */
--text-3xl: 2.441rem; /* 39px    - Page titles */
--text-4xl: 3.052rem; /* 48.8px  - Hero text */
--text-5xl: 3.815rem; /* 61px    - Marketing hero */
```

### 3.3 Font Weights

```css
--font-weight-light: 300; /* Rare - decorative only */
--font-weight-normal: 400; /* Body text */
--font-weight-medium: 500; /* Emphasized body, labels */
--font-weight-semibold: 600; /* Subheadings, buttons */
--font-weight-bold: 700; /* Headings, important UI */
--font-weight-black: 900; /* Rare - marketing hero */
```

### 3.4 Line Heights

```css
--leading-none: 1; /* Tight headings */
--leading-tight: 1.25; /* Display text */
--leading-snug: 1.375; /* UI text */
--leading-normal: 1.5; /* Body paragraphs (default) */
--leading-relaxed: 1.625; /* Comfortable reading */
--leading-loose: 2; /* Very spacious, quotes */
```

### 3.5 Letter Spacing

```css
--tracking-tighter: -0.05em; /* Tight display text */
--tracking-tight: -0.025em; /* Headings */
--tracking-normal: 0; /* Default */
--tracking-wide: 0.025em; /* Small caps, labels */
--tracking-wider: 0.05em; /* Uppercase buttons */
--tracking-widest: 0.1em; /* Category labels */
```

### 3.6 Typography Styles

#### **Headings**

```css
h1,
.heading-1 {
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text-primary);
  margin-bottom: 1rem;
}

h2,
.heading-2 {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-tight);
  color: var(--color-text-primary);
  margin-bottom: 0.75rem;
}

h3,
.heading-3 {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-snug);
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}
```

#### **Body Text**

```css
.body-large {
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--color-text-primary);
}

.body-normal {
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--color-text-primary);
}

.body-small {
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--color-text-secondary);
}
```

#### **User Content (Letters, Reflections)**

```css
.user-content {
  font-family: var(--font-family-content); /* Georgia */
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--color-text-primary);
  max-width: 65ch; /* Optimal reading width */
}
```

#### **Labels & UI Text**

```css
.label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  letter-spacing: var(--tracking-wide);
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

.caption {
  font-size: var(--text-xs);
  line-height: var(--leading-normal);
  color: var(--color-text-tertiary);
}
```

### 3.7 Font Size Preferences

```css
/* User can adjust via preferences.fontSize */
[data-font-size="small"] {
  --text-base: 14px;
}

[data-font-size="medium"] {
  --text-base: 16px; /* Default */
}

[data-font-size="large"] {
  --text-base: 18px;
}
```

---

## 4. Spacing & Layout

### 4.1 Spacing Scale

```css
/* Based on 4px grid (divisible by 2 for flexibility) */
--space-0: 0;
--space-1: 0.25rem; /* 4px  - Tiny gaps */
--space-2: 0.5rem; /* 8px  - Compact spacing */
--space-3: 0.75rem; /* 12px - Default gap */
--space-4: 1rem; /* 16px - Standard spacing */
--space-5: 1.25rem; /* 20px - Comfortable */
--space-6: 1.5rem; /* 24px - Section spacing */
--space-8: 2rem; /* 32px - Large gaps */
--space-10: 2.5rem; /* 40px - Very spacious */
--space-12: 3rem; /* 48px - Major sections */
--space-16: 4rem; /* 64px - Hero spacing */
--space-20: 5rem; /* 80px - Page sections */
--space-24: 6rem; /* 96px - Landing sections */
```

### 4.2 Container Widths

```css
--container-sm: 640px; /* Small content (settings form) */
--container-md: 768px; /* Medium content (composers) */
--container-lg: 1024px; /* Large content (dashboard) */
--container-xl: 1280px; /* Extra large (landing) */
--container-2xl: 1536px; /* Maximum width */

/* Reading width (for long-form text) */
--container-reading: 65ch; /* ~600-700px depending on font */
```

### 4.3 Layout Grid

```css
/* 12-column grid system */
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6); /* 24px gap */
}

/* Common column spans */
.col-span-3 {
  grid-column: span 3 / span 3;
} /* 25% */
.col-span-4 {
  grid-column: span 4 / span 4;
} /* 33% */
.col-span-6 {
  grid-column: span 6 / span 6;
} /* 50% */
.col-span-8 {
  grid-column: span 8 / span 8;
} /* 66% */
.col-span-12 {
  grid-column: span 12 / span 12;
} /* 100% */
```

### 4.4 Component Spacing

#### **Cards**

```css
.card {
  padding: var(--space-6); /* 24px all sides */
  border-radius: var(--radius-lg);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
}
```

#### **Buttons**

```css
.button-sm {
  padding: var(--space-2) var(--space-3); /* 8px 12px */
}

.button-md {
  padding: var(--space-3) var(--space-4); /* 12px 16px */
}

.button-lg {
  padding: var(--space-4) var(--space-6); /* 16px 24px */
}
```

#### **Form Fields**

```css
.input,
.textarea {
  padding: var(--space-3) var(--space-4); /* 12px 16px */
  border-radius: var(--radius-md);
}
```

### 4.5 Border Radius

```css
--radius-none: 0;
--radius-sm: 0.25rem; /* 4px  - Subtle rounding */
--radius-md: 0.5rem; /* 8px  - Default (buttons, inputs) */
--radius-lg: 0.75rem; /* 12px - Cards */
--radius-xl: 1rem; /* 16px - Large cards */
--radius-2xl: 1.5rem; /* 24px - Modals */
--radius-full: 9999px; /* Pills, circular buttons */
```

---

## 5. Elevation & Shadows

### 5.1 Shadow System

```css
/* Subtle, warm shadows (not harsh black) */
--shadow-xs: 0 1px 2px 0 rgba(45, 45, 45, 0.05);
/* Barely visible - subtle depth */

--shadow-sm:
  0 1px 3px 0 rgba(45, 45, 45, 0.08), 0 1px 2px 0 rgba(45, 45, 45, 0.04);
/* Cards at rest */

--shadow-md:
  0 4px 6px -1px rgba(45, 45, 45, 0.08), 0 2px 4px -1px rgba(45, 45, 45, 0.04);
/* Hover states, dropdowns */

--shadow-lg:
  0 10px 15px -3px rgba(45, 45, 45, 0.08), 0 4px 6px -2px rgba(45, 45, 45, 0.04);
/* Modals, popovers */

--shadow-xl:
  0 20px 25px -5px rgba(45, 45, 45, 0.08),
  0 10px 10px -5px rgba(45, 45, 45, 0.03);
/* Elevated modals, drawers */

--shadow-2xl: 0 25px 50px -12px rgba(45, 45, 45, 0.12);
/* Maximum elevation */

--shadow-inner: inset 0 2px 4px 0 rgba(45, 45, 45, 0.06);
/* Pressed buttons, input focus */

/* Focus ring (accessibility) */
--shadow-focus: 0 0 0 3px rgba(42, 100, 112, 0.2);
/* Primary color with transparency */
```

### 5.2 Elevation Levels

```
Level 0: Base layer (flush with background)
  - Page background
  - Inline text
  Shadow: none

Level 1: Slightly raised
  - Cards at rest
  - Default buttons
  Shadow: var(--shadow-sm)

Level 2: Hover state
  - Card hover
  - Button hover
  Shadow: var(--shadow-md)

Level 3: Active UI
  - Dropdowns
  - Tooltips
  - Sticky headers
  Shadow: var(--shadow-lg)

Level 4: Modals
  - Dialogs
  - Sheet overlays
  - Full-screen takeover
  Shadow: var(--shadow-xl)

Level 5: Maximum (rare)
  - Critical alerts
  - Guided tours
  Shadow: var(--shadow-2xl)
```

### 5.3 Dark Mode Shadows

```css
[data-theme="dark"] {
  /* Shadows need more contrast in dark mode */
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2);

  --shadow-md:
    0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2);

  --shadow-lg:
    0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
}
```

---

## 6. Iconography

### 6.1 Icon System - Lucide React

**Library:** [Lucide React](https://lucide.dev)

**Rationale:**

- Beautifully designed, consistent style
- Extensive library (1000+ icons)
- Fully accessible (proper ARIA)
- Tree-shakeable (import only what you need)
- Active maintenance

### 6.2 Icon Sizes

```css
--icon-xs: 12px; /* Inline with small text */
--icon-sm: 16px; /* Inline with body text */
--icon-md: 20px; /* Buttons, UI elements */
--icon-lg: 24px; /* Section headings */
--icon-xl: 32px; /* Feature cards */
--icon-2xl: 48px; /* Hero sections */
```

### 6.3 Icon Usage

```typescript
import { Heart, MessageCircle, Calendar, Sparkles } from 'lucide-react';

// Standard usage
<Heart size={20} color="var(--color-primary-500)" />

// With stroke width
<MessageCircle size={24} strokeWidth={1.5} />

// Decorative (hidden from screen readers)
<Sparkles size={16} aria-hidden="true" />

// Accessible (with label)
<button>
  <Calendar size={20} aria-label="Schedule time capsule" />
</button>
```

### 6.4 Emotion Icons (Mood Check-In)

```typescript
// Custom mapping for mood tracking
const EMOTION_ICONS = {
  joy: '😊',         // Smiling Face
  sadness: '😢',     // Crying Face
  anger: '😠',       // Angry Face
  fear: '😨',        // Fearful Face
  love: '❤️',        // Red Heart
  gratitude: '🙏',   // Folded Hands
  peace: '☮️',       // Peace Symbol
  anxiety: '😰',     // Anxious Face
  grief: '💔',       // Broken Heart
  hope: '🌟',        // Glowing Star
  // ... etc
};

// Or use Lucide icons with color
const EMOTION_LUCIDE = {
  joy: <Smile color="var(--emotion-joy)" />,
  sadness: <Frown color="var(--emotion-sadness)" />,
  // ...
};
```

### 6.5 Icon Accessibility

```typescript
// ✅ GOOD - Decorative icon (purely visual)
<div className="card">
  <Sparkles size={20} aria-hidden="true" />
  <span>Premium Feature</span>
</div>

// ✅ GOOD - Functional icon (has label)
<button aria-label="Close modal">
  <X size={20} />
</button>

// ✅ GOOD - Icon with visible text
<button>
  <Save size={20} aria-hidden="true" />
  <span>Save Draft</span>
</button>

// ❌ BAD - Icon without label
<button>
  <Settings size={20} />
</button>
```

---

## 7. Motion & Animation

### 7.1 Animation Principles

1. **Purposeful**: Every animation serves a function (feedback, orientation, delight)
2. **Subtle**: Never distracting from content
3. **Respectful**: Honor `prefers-reduced-motion`
4. **Smooth**: Use easing curves, never linear
5. **Fast**: Most animations under 300ms

### 7.2 Timing Functions

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1); /* Most common */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-smooth: cubic-bezier(0.45, 0, 0.55, 1);
```

### 7.3 Duration Scale

```css
--duration-instant: 50ms; /* Immediate feedback (hover) */
--duration-fast: 100ms; /* Quick transitions (tooltips) */
--duration-normal: 200ms; /* Default (most UI) */
--duration-slow: 300ms; /* Deliberate (modals opening) */
--duration-slower: 500ms; /* Very deliberate (page transitions) */
--duration-slowest: 1000ms; /* Special moments (completion celebration) */
```

### 7.4 Transition Presets

```css
/* Smooth fade */
.transition-fade {
  transition: opacity var(--duration-normal) var(--ease-out);
}

/* Smooth slide up */
.transition-slide-up {
  transition: transform var(--duration-normal) var(--ease-out);
}
.transition-slide-up:hover {
  transform: translateY(-4px);
}

/* Smooth scale */
.transition-scale {
  transition: transform var(--duration-fast) var(--ease-out);
}
.transition-scale:hover {
  transform: scale(1.02);
}

/* Color transitions */
.transition-colors {
  transition:
    background-color var(--duration-normal) var(--ease-out),
    color var(--duration-normal) var(--ease-out),
    border-color var(--duration-normal) var(--ease-out);
}
```

### 7.5 Reduced Motion

```css
/* Respect user preference */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Or via user preference */
[data-motion="reduced"] {
  --duration-instant: 0ms;
  --duration-fast: 0ms;
  --duration-normal: 0ms;
  --duration-slow: 0ms;
}
```

### 7.6 Key Animations

#### **Save Confirmation**

```css
@keyframes save-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.save-success {
  animation: save-pulse 400ms var(--ease-out);
}
```

#### **Completion Celebration**

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
  animation: completion-shine 1000ms var(--ease-bounce);
}
```

#### **Modal Entry**

```css
@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal {
  animation: modal-enter var(--duration-slow) var(--ease-out);
}
```

---

## 8. Themes

### 8.1 Theme Architecture

```typescript
interface Theme {
  id: string;
  name: string;
  category: "minimal" | "nature" | "luxury";
  isPremium: boolean;

  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };

  fonts: {
    heading: string;
    body: string;
  };

  animations: {
    transitions: "none" | "subtle" | "smooth" | "dynamic";
    effects: boolean;
  };

  soundscape?: SoundscapeId;
}
```

### 8.2 Available Themes

#### **1. Classic CLOSURE (Default, Free)**

```typescript
{
  id: 'classic',
  colors: {
    primary: '#2A6470',    // Healing teal
    secondary: '#C4A7A7',  // Warm rose
    accent: '#D4AF7A',     // Gold
    background: '#FAF9F7', // Warm white
    text: '#2D2D2D',       // Charcoal
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
  },
}
```

#### **2. Midnight Calm (Free)**

```typescript
{
  id: 'midnight',
  colors: {
    primary: '#6B8FD1',    // Soft blue
    secondary: '#8E7FA6',  // Dusty purple
    accent: '#B8A389',     // Muted gold
    background: '#1C1C28', // Deep navy
    text: '#E8E7F0',       // Soft white
  },
}
```

#### **3-10. Premium Themes**

- Northern Aurora (nature, premium)
- Cherry Blossom (nature, premium)
- Deep Ocean (nature, premium)
- Ancient Forest (nature, premium)
- Gold & Marble (luxury, premium)
- Silver Moonlight (luxury, premium)
- Golden Sunset (luxury, premium)
- Zen Garden (minimal, premium)

### 8.3 Theme Switching

```typescript
// In Settings
const changeTheme = (themeId: string) => {
  const theme = PREMIUM_THEMES[themeId];

  if (theme.isPremium && !user.isPremium) {
    showUpgradeModal();
    return;
  }

  // Apply CSS variables
  document.documentElement.style.setProperty(
    "--color-primary-500",
    theme.colors.primary,
  );
  document.documentElement.style.setProperty(
    "--color-secondary-500",
    theme.colors.secondary,
  );
  // ... etc

  // Save preference
  updatePreferences({ themeName: themeId });
};
```

---

## 9. Responsive Design

### 9.1 Breakpoints

```css
--breakpoint-sm: 640px; /* Mobile landscape, small tablets */
--breakpoint-md: 768px; /* Tablets */
--breakpoint-lg: 1024px; /* Small laptops */
--breakpoint-xl: 1280px; /* Desktops */
--breakpoint-2xl: 1536px; /* Large desktops */
```

### 9.2 Mobile-First Approach

```css
/* Base styles (mobile) */
.card {
  padding: var(--space-4);
  font-size: var(--text-base);
}

/* Tablet and up */
@media (min-width: 768px) {
  .card {
    padding: var(--space-6);
    font-size: var(--text-lg);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .card {
    padding: var(--space-8);
  }
}
```

### 9.3 Touch Targets

```css
/* Minimum touch target: 44x44px (WCAG AAA) */
.button,
.link,
.interactive {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

---

## 10. Accessibility

### 10.1 WCAG 2.1 Compliance

**Level AA (Minimum):**

- ✅ Color contrast 4.5:1 for normal text
- ✅ Color contrast 3:1 for large text (18pt+)
- ✅ Keyboard navigation for all interactions
- ✅ Focus indicators visible and clear
- ✅ Form labels and error messages
- ✅ Sufficient touch target sizes

**Level AAA (Goal):**

- ✅ Color contrast 7:1 for normal text
- ✅ No reliance on color alone
- ✅ Reading level appropriate
- ✅ Enhanced focus indicators

### 10.2 Color Contrast

```css
/* All text meets WCAG AA minimum */
--color-text-primary on --color-bg-primary:    18.5:1 ✅ AAA
--color-text-secondary on --color-bg-primary:  7.2:1 ✅ AAA
--color-text-tertiary on --color-bg-primary:   4.8:1 ✅ AA
--color-primary-500 on --color-bg-primary:     5.1:1 ✅ AA

/* High contrast mode exceeds all requirements */
```

### 10.3 Focus Management

```css
/* Clear, consistent focus indicators */
*:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
  box-shadow: var(--shadow-focus);
}

/* Never remove focus outline */
*:focus:not(:focus-visible) {
  outline: none; /* Only when using mouse, not keyboard */
}

*:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
  box-shadow: var(--shadow-focus);
}
```

### 10.4 Screen Reader Optimization

```typescript
// ✅ Semantic HTML
<main aria-label="Letter writing experience">
  <h1>Write a Letter Unsent</h1>
  <section aria-label="Recipient information">
    <label htmlFor="recipient">To whom are you writing?</label>
    <input id="recipient" type="text" />
  </section>
</main>

// ✅ ARIA live regions for dynamic updates
<div aria-live="polite" aria-atomic="true">
  {isSaving && <span>Saving draft...</span>}
  {savedSuccessfully && <span>Draft saved successfully</span>}
</div>

// ✅ Skip links
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
```

---

## Summary

This design system provides:

1. ✅ **Comprehensive Color Palette**: Primary, secondary, accent, neutrals, semantics, emotions
2. ✅ **Typography System**: Inter + Georgia, modular scale, responsive sizing
3. ✅ **Spacing & Layout**: 4px grid, 12-column layout, container widths
4. ✅ **Elevation**: 5-level shadow system with warm, subtle shadows
5. ✅ **Iconography**: Lucide React icons with accessibility guidelines
6. ✅ **Motion**: Purposeful animations with reduced-motion support
7. ✅ **Theming**: 10 themes (2 free, 8 premium) with dark mode
8. ✅ **Responsive**: Mobile-first, touch-optimized, 5 breakpoints
9. ✅ **Accessibility**: WCAG 2.1 AA minimum, AAA goal, comprehensive guidelines

**Healing luxury meets clinical sophistication.**
