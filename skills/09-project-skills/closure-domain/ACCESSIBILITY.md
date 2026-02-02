# CLOSURE - Accessibility Standards & Implementation

## Table of Contents

1. [Accessibility Philosophy](#accessibility-philosophy)
2. [WCAG 2.1 Compliance](#wcag-21-compliance)
3. [Keyboard Navigation](#keyboard-navigation)
4. [Screen Reader Support](#screen-reader-support)
5. [Visual Accessibility](#visual-accessibility)
6. [Cognitive Accessibility](#cognitive-accessibility)
7. [Motor Accessibility](#motor-accessibility)
8. [Testing & Validation](#testing--validation)

---

## 1. Accessibility Philosophy

### Core Commitment

**CLOSURE is accessible by default, not as an afterthought.**

```
┌─────────────────────────────────────────────────────────────────┐
│ Accessibility Principles:                                      │
│                                                                 │
│ 1. Universal Design: Build for everyone from the start        │
│ 2. User Control: Let users customize their experience         │
│ 3. Perceivable: Information available through multiple senses │
│ 4. Operable: Interface works with diverse input methods       │
│ 5. Understandable: Clear language and predictable behavior    │
│ 6. Robust: Works with assistive technologies                  │
└─────────────────────────────────────────────────────────────────┘
```

### Why Accessibility Matters for CLOSURE

Emotional wellness is for **everyone**:

- Vision impairments shouldn't prevent processing grief
- Motor disabilities shouldn't block writing letters
- Cognitive differences deserve respectful accommodation
- Sensory sensitivities need customization options

**We serve users who:**

- Use screen readers (NVDA, JAWS, VoiceOver)
- Navigate by keyboard only
- Need high contrast or dark mode
- Prefer reduced motion
- Require larger text
- Use voice control
- Have dyslexia or ADHD
- Experience photosensitivity

---

## 2. WCAG 2.1 Compliance

### Compliance Level: AA (Minimum), AAA (Goal)

CLOSURE meets all WCAG 2.1 Level AA criteria and aims for AAA where possible.

### 2.1 Perceivable

#### 1.1 Text Alternatives

**Requirement:** All non-text content has text alternatives.

**Implementation:**

```tsx
// ✅ Images with alt text
<img src="/icon-letters.png" alt="Letters Unsent icon showing an envelope" />

// ✅ Decorative images hidden from screen readers
<img src="/decorative-pattern.svg" alt="" role="presentation" />

// ✅ Icons with aria-labels
<button aria-label="Close modal">
  <X size={20} aria-hidden="true" />
</button>

// ✅ Complex graphics with descriptions
<svg aria-labelledby="mood-chart-title mood-chart-desc">
  <title id="mood-chart-title">Your mood trends over 30 days</title>
  <desc id="mood-chart-desc">
    Line chart showing mood intensity fluctuating between 4 and 8,
    with an overall upward trend from 5 to 7.
  </desc>
  {/* chart elements */}
</svg>
```

#### 1.2 Time-Based Media

**Requirement:** Provide alternatives for audio and video.

**Implementation:**

- Soundscapes include text descriptions
- Future: Video content will have captions and transcripts

```tsx
<audio src="/soundscape-arctic.mp3" controls>
  <p>
    Soundscape: Arctic Winds - Gentle northern winds with distant ice cracking.
    Meditative and calm.
  </p>
</audio>
```

#### 1.3 Adaptable

**Requirement:** Content can be presented in different ways without losing information.

**Implementation:**

```tsx
// ✅ Semantic HTML (structure maintained)
<main>
  <h1>Your Vault</h1>
  <section aria-label="Letters">
    <h2>Letters Unsent</h2>
    <article>
      <h3>Letter to Mom</h3>
      <p>Last edited 2 days ago</p>
    </article>
  </section>
</main>

// ✅ Proper heading hierarchy (never skip levels)
<h1>Dashboard</h1>
  <h2>Recent Entries</h2>
    <h3>Letter to Mom</h3>
    <h3>Conversation with Dad</h3>
  <h2>Mood Trends</h2>
    <h3>Last 7 Days</h3>
```

#### 1.4 Distinguishable

**Requirement:** Make it easy to see and hear content.

**Implementation:**

**Color Contrast:**

```css
/* WCAG AA: 4.5:1 for normal text */
--color-text-primary on --color-bg-primary:    18.5:1 ✅ AAA
--color-text-secondary on --color-bg-primary:  7.2:1  ✅ AAA
--color-text-tertiary on --color-bg-primary:   4.8:1  ✅ AA

/* WCAG AA: 3:1 for large text (18pt+) */
All headings meet 7:1+ ✅ AAA

/* WCAG AA: 3:1 for UI components */
--color-primary-500 on --color-bg-primary:     5.1:1  ✅ AA
Buttons, borders, icons all meet 3:1 minimum  ✅
```

**Test with:**

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Contrast Ratio Tool](https://contrast-ratio.com/)

**High Contrast Mode:**

```css
[data-contrast="high"] {
  --color-text-primary: #000000; /* Pure black */
  --color-bg-primary: #ffffff; /* Pure white */
  --color-primary-500: #005a6e; /* Darker teal, 7:1 contrast */
  --color-border-focus: #000000; /* Black focus rings */

  /* Remove subtle borders */
  --color-border-light: transparent;
}
```

**No Information by Color Alone:**

```tsx
// ❌ BAD: Color only
<div className="bg-error-500">Error occurred</div>

// ✅ GOOD: Color + icon + text
<div className="bg-error-50 text-error-700 border-l-4 border-error-500">
  <AlertCircle size={20} aria-hidden="true" />
  <span className="font-medium">Error:</span> Could not save letter.
</div>
```

**Text Resize:**

```css
/* Text can be resized up to 200% without loss of functionality */

/* User font size preference */
[data-font-size="large"] {
  --text-base: 18px; /* 112.5% of default */
}

/* All layouts use relative units */
.container {
  max-width: 65ch; /* Not pixels */
  padding: 1.5rem; /* Not pixels */
}
```

### 2.2 Operable

#### 2.1 Keyboard Accessible

**Requirement:** All functionality available via keyboard.

**Implementation:**

```tsx
// ✅ All interactive elements keyboard accessible
<button>Save</button>                    // Native button, keyboard works
<a href="/vault">Vault</a>              // Native link, keyboard works
<input type="text" />                    // Native input, keyboard works

// ✅ Custom interactive elements have keyboard support
const Card = ({ onClick }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    }}
  >
    {children}
  </div>
);

// ✅ Modal focus trap
const Modal = () => {
  useEffect(() => {
    if (isOpen) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      firstElement?.focus();

      const handleTab = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        } else if (e.key === 'Escape') {
          closeModal();
        }
      };

      document.addEventListener('keydown', handleTab);
      return () => document.removeEventListener('keydown', handleTab);
    }
  }, [isOpen]);

  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      {/* modal content */}
    </div>
  );
};
```

**Keyboard Shortcuts:**

```
Tab:          Navigate forward
Shift + Tab:  Navigate backward
Enter:        Activate button/link
Space:        Activate button, check checkbox
Escape:       Close modal/dropdown
Arrow keys:   Navigate within component (tabs, select)

CLOSURE-specific:
Ctrl/Cmd + S: Save draft (in composer)
Ctrl/Cmd + K: Open search (in vault)
```

#### 2.2 Enough Time

**Requirement:** Users have enough time to read and use content.

**Implementation:**

```tsx
// ✅ No time limits on user tasks
// User can take as long as needed to write
// Auto-save preserves work without forcing completion

// ✅ Session doesn't time out
// App works offline, no server session

// ✅ Animations can be disabled
const preferences = useAppStore((state) => state.preferences);

const animationClass = preferences.reducedMotion
  ? "transition-none"
  : "transition-all duration-200";
```

#### 2.3 Seizures and Physical Reactions

**Requirement:** Do not design content that causes seizures.

**Implementation:**

```css
/* ✅ No flashing content (nothing flashes more than 3 times per second) */
/* ✅ No rapid animations */
/* ✅ Respect prefers-reduced-motion */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* User can also disable via preferences */
[data-motion="reduced"] {
  --duration-normal: 0ms;
  --duration-slow: 0ms;
}
```

#### 2.4 Navigable

**Requirement:** Provide ways to help users navigate and find content.

**Implementation:**

```tsx
// ✅ Skip links
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

// ✅ Page titles
<title>Letters Unsent | CLOSURE</title>

// ✅ Focus order matches visual order
// (DOM order = visual order = tab order)

// ✅ Link purpose clear from text
// ❌ BAD: <a href="/vault">Click here</a>
// ✅ GOOD: <a href="/vault">View your vault</a>

// ✅ Multiple ways to find content
// - Vault search
// - Filter by type
// - Filter by date
// - Browse all

// ✅ Clear headings and labels
<h1>Your Vault</h1>
<section aria-labelledby="letters-heading">
  <h2 id="letters-heading">Letters Unsent</h2>
</section>

// ✅ Visible focus indicator
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
```

### 2.3 Understandable

#### 3.1 Readable

**Requirement:** Make text readable and understandable.

**Implementation:**

```tsx
// ✅ Language declared
<html lang="en">

// ✅ Language changes declared
<blockquote lang="es">
  "La vida es un carnaval"
</blockquote>

// ✅ Unusual words explained
<p>
  CLOSURE uses <abbr title="Advanced Encryption Standard">AES</abbr>-256
  encryption to protect your content.
</p>

// ✅ Reading level appropriate
// Aim for 8th grade or below (Flesch-Kincaid)
// Use short sentences
// Prefer common words over jargon
```

#### 3.2 Predictable

**Requirement:** Web pages behave in predictable ways.

**Implementation:**

```tsx
// ✅ Consistent navigation
// Header appears same on all pages
// Settings always in top right
// Vault always accessible via header

// ✅ Consistent identification
// "Save Draft" button always says "Save Draft"
// Icons consistent (Heart = Letters, Calendar = Time Capsules)

// ✅ No context changes on focus
// Focusing an input doesn't submit form
// Tabbing doesn't open modals

// ✅ Context changes on request only
// Submit button submits
// Close button closes
// Delete button asks first, then deletes
```

#### 3.3 Input Assistance

**Requirement:** Help users avoid and correct mistakes.

**Implementation:**

```tsx
// ✅ Error identification
<Input
  label="Email"
  error="Please enter a valid email address"
  hasError={!isValidEmail(email)}
/>

// ✅ Labels and instructions
<Input
  label="Recipient"
  helperText="Who are you writing to? (e.g., Mom, my younger self)"
/>

// ✅ Error suggestion
<Input
  label="Delivery date"
  error="Date must be in the future. Try tomorrow or later."
/>

// ✅ Error prevention (destructive operations)
const handleDelete = () => {
  showModal({
    title: "Delete this letter?",
    message: "This will permanently remove your letter. This cannot be undone.",
    actions: [
      { label: "Cancel", variant: "secondary" },
      { label: "Delete Forever", variant: "danger", onClick: confirmDelete }
    ]
  });
};

// ✅ Reversible actions
// Deleted letters go to trash first (30-day recovery)
// Can undo archive
// Can restore from backup
```

### 2.4 Robust

#### 4.1 Compatible

**Requirement:** Maximize compatibility with current and future tools.

**Implementation:**

```tsx
// ✅ Valid HTML (no parsing errors)
// Use HTML validator: https://validator.w3.org/

// ✅ Unique IDs
// Every id attribute is unique on the page

// ✅ Proper name, role, value for all UI components
<button
  type="button"
  aria-label="Close modal"
  aria-pressed={isPressed}
>
  Close
</button>

<input
  type="checkbox"
  id="dark-mode"
  checked={preferences.darkMode}
  aria-checked={preferences.darkMode}
/>

// ✅ Status messages
<div role="status" aria-live="polite">
  {isSaving && <span>Saving draft...</span>}
  {savedSuccessfully && <span>Draft saved</span>}
</div>

<div role="alert" aria-live="assertive">
  {hasError && <span>Could not save. Please try again.</span>}
</div>
```

---

## 3. Keyboard Navigation

### 3.1 Tab Order

**Logical Flow:**

```
1. Skip link
2. Header logo
3. Navigation items
4. Main content first interactive element
5. ...rest of main content...
6. Footer links
```

**Implementation:**

```tsx
// ✅ Natural tab order (DOM order = visual order)
<header>
  <a href="/">Logo</a>
  <nav>
    <a href="/vault">Vault</a>
    <a href="/settings">Settings</a>
  </nav>
</header>

<main id="main-content">
  <h1>Letters Unsent</h1>
  <button>Write New Letter</button>
  {/* ... */}
</main>

// ❌ AVOID: Manipulating tabindex
// Don't use tabindex > 0
// Only use tabindex="0" to make non-interactive elements focusable
// Use tabindex="-1" to remove from tab order (programmatically focusable)
```

### 3.2 Focus Indicators

**Always Visible:**

```css
/* ✅ Clear, consistent focus indicators */
*:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(42, 100, 112, 0.2);
}

/* ✅ Higher contrast in high contrast mode */
[data-contrast="high"] *:focus-visible {
  outline: 3px solid #000000;
  outline-offset: 2px;
  box-shadow: 0 0 0 6px rgba(0, 0, 0, 0.3);
}

/* ❌ NEVER remove focus outline entirely */
/* This breaks keyboard navigation */
```

### 3.3 Keyboard Shortcuts

**Global:**

```
Tab / Shift+Tab:  Navigate
Enter / Space:    Activate
Escape:           Close/Cancel
Arrow keys:       Navigate within component

Custom:
Ctrl/Cmd + S:     Save draft (composer)
Ctrl/Cmd + K:     Search vault
Ctrl/Cmd + ,:     Open settings
```

**In Modals:**

```
Escape:  Close modal
Tab:     Cycle through modal elements (trapped)
```

---

## 4. Screen Reader Support

### 4.1 ARIA Landmarks

```tsx
<body>
  <a href="#main-content" className="skip-link">
    Skip to main content
  </a>

  <header>
    <nav aria-label="Main navigation">{/* navigation items */}</nav>
  </header>

  <main id="main-content">{/* primary content */}</main>

  <aside aria-label="Tips and resources">{/* complementary content */}</aside>

  <footer>{/* footer content */}</footer>
</body>
```

### 4.2 ARIA Labels

```tsx
// ✅ Button with only icon
<button aria-label="Delete letter">
  <Trash size={20} aria-hidden="true" />
</button>

// ✅ Section with heading
<section aria-labelledby="letters-heading">
  <h2 id="letters-heading">Letters Unsent</h2>
</section>

// ✅ Form field descriptions
<Input
  label="Email"
  helperText="We'll only use this for time capsule delivery"
  aria-describedby="email-helper"
/>
<p id="email-helper" className="text-sm">
  We'll only use this for time capsule delivery
</p>
```

### 4.3 Live Regions

```tsx
// ✅ Polite announcements (don't interrupt)
<div role="status" aria-live="polite" aria-atomic="true">
  {isSaving && <span>Saving draft...</span>}
  {savedSuccessfully && <span>Draft saved successfully</span>}
</div>

// ✅ Urgent announcements (interrupt)
<div role="alert" aria-live="assertive">
  {hasError && <span>Error: Could not save. Please try again.</span>}
</div>

// ✅ Dynamic content updates
<div aria-live="polite" aria-atomic="true">
  {moodEntries.length} mood entries logged
</div>
```

### 4.4 Hidden Content

```tsx
// ✅ Visually hidden but available to screen readers
<span className="sr-only">
  Current step: 2 of 3
</span>

// CSS for .sr-only
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

// ✅ Hide decorative elements from screen readers
<img src="/pattern.svg" alt="" aria-hidden="true" />
<Sparkles size={16} aria-hidden="true" />
```

### 4.5 Form Accessibility

```tsx
// ✅ Proper label association
<label htmlFor="recipient-input">
  Who is this letter for?
</label>
<input
  id="recipient-input"
  type="text"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby="recipient-helper recipient-error"
/>
<p id="recipient-helper">e.g., Mom, my younger self</p>
{hasError && (
  <p id="recipient-error" role="alert">
    Please enter a recipient
  </p>
)}
```

---

## 5. Visual Accessibility

### 5.1 Color Contrast

**Minimum Ratios (WCAG AA):**

- Normal text (< 18pt): 4.5:1
- Large text (≥ 18pt): 3:1
- UI components: 3:1

**CLOSURE Standards (AAA Goal):**

- Body text: 7:1 or higher
- Headings: 7:1 or higher
- Interactive elements: 4.5:1 or higher

**Testing Tools:**

- Chrome DevTools: Inspect → Accessibility → Contrast ratio
- axe DevTools Extension
- WebAIM Contrast Checker

### 5.2 Text Sizing

```css
/* ✅ Relative units */
font-size: 1rem; /* Not px */
line-height: 1.5; /* Not px */
padding: 1.5rem; /* Not px */

/* ✅ User preference */
[data-font-size="small"] {
  --text-base: 14px;
}
[data-font-size="medium"] {
  --text-base: 16px; /* Default */
}
[data-font-size="large"] {
  --text-base: 18px;
}

/* ✅ Zoom to 200% works */
/* Test by zooming browser to 200% - no horizontal scroll, no lost content */
```

### 5.3 Dark Mode

```tsx
// ✅ User-controlled dark mode
const { preferences, updatePreferences } = useAppStore();

<button
  onClick={() => updatePreferences({ darkMode: !preferences.darkMode })}
  aria-label={preferences.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
>
  {preferences.darkMode ? <Sun size={20} /> : <Moon size={20} />}
</button>

// ✅ Dark mode maintains contrast ratios
[data-theme="dark"] {
  --color-bg-primary: #1A1816;
  --color-text-primary: #F5F4F1;    /* 16.8:1 contrast ✅ */
}
```

### 5.4 High Contrast Mode

```tsx
// ✅ User-controlled high contrast
<button
  onClick={() => updatePreferences({ highContrast: !preferences.highContrast })}
  aria-label={preferences.highContrast ? 'Disable high contrast' : 'Enable high contrast'}
>
  Toggle High Contrast
</button>

[data-contrast="high"] {
  --color-text-primary: #000000;
  --color-bg-primary: #FFFFFF;
  --color-primary-500: #005A6E;      /* 7.5:1 contrast ✅ */
  --color-border-focus: #000000;     /* Pure black */

  /* Remove subtle borders */
  --color-border-light: transparent;

  /* Increase shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
}
```

---

## 6. Cognitive Accessibility

### 6.1 Clear Language

```tsx
// ✅ Plain language (8th grade reading level or below)
"Your letter has been saved.";

// ❌ Complex language
"Your epistolary composition has been successfully persisted to local storage.";

// ✅ Short sentences
"This will delete your letter. You cannot undo this action.";

// ❌ Long sentences
"This irreversible operation will permanently remove your letter from the encrypted vault storage system, and once completed, there will be no method by which the content can be recovered or restored.";
```

### 6.2 Consistent Patterns

```tsx
// ✅ Same action, same button text
"Save Draft" always means save without completing
"Complete" always means mark as finished and move to vault

// ✅ Same icon, same meaning
<Heart /> always means Letters Unsent
<MessageCircle /> always means Conversations
<Calendar /> always means Time Capsules
```

### 6.3 Error Prevention

```tsx
// ✅ Confirmation for destructive actions
const handleDelete = () => {
  showModal({
    title: "Delete this letter?",
    message: "This cannot be undone.",
    actions: [
      { label: "Cancel" },
      { label: "Delete Forever", variant: "danger" },
    ],
  });
};

// ✅ Auto-save prevents data loss
// Saves every 3 seconds automatically

// ✅ Clear validation
<Input
  label="Email"
  type="email"
  error={!isValid && "Please enter a valid email address"}
/>;
```

### 6.4 Focus Management

```tsx
// ✅ Focus moves logically after actions
const handleSave = () => {
  saveLetter();
  // Focus moves to success message
  successMessageRef.current?.focus();
};

// ✅ Focus returns after modal closes
const closeModal = () => {
  setIsOpen(false);
  // Return focus to element that opened modal
  triggerElementRef.current?.focus();
};
```

---

## 7. Motor Accessibility

### 7.1 Touch Targets

```css
/* ✅ Minimum 44x44px (WCAG AAA) */
.button,
.link,
.interactive {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* ✅ Adequate spacing between targets */
.button + .button {
  margin-left: 0.5rem; /* 8px minimum gap */
}
```

### 7.2 No Fine Motor Control Required

```tsx
// ✅ Large click areas
// ✅ No drag-and-drop required (provide alternatives)
// ✅ No hover-only interactions
// ✅ No double-click required

// ❌ BAD: Hover-only menu
<div className="dropdown">
  <button>Menu</button>
  <div className="menu" /* only visible on hover */>
    <a href="/vault">Vault</a>
  </div>
</div>

// ✅ GOOD: Click to open menu
<button onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen}>
  Menu
</button>
{isOpen && (
  <div role="menu">
    <a href="/vault" role="menuitem">Vault</a>
  </div>
)}
```

### 7.3 Voice Control Support

```tsx
// ✅ Buttons have accessible names
<button aria-label="Save draft">
  <Save size={20} />
</button>

// Voice command: "Click save draft" works

// ✅ Links have descriptive text
<a href="/vault">View your vault</a>

// Voice command: "Click view your vault" works
```

---

## 8. Testing & Validation

### 8.1 Automated Testing

**Tools:**

- **axe DevTools**: Browser extension for automated testing
- **Lighthouse**: Chrome DevTools audit
- **WAVE**: Web accessibility evaluation tool
- **Pa11y**: Command-line accessibility testing

**Example (using axe):**

```bash
npm install --save-dev @axe-core/react

# In development
import React from 'react';
import ReactDOM from 'react-dom';
import axe from '@axe-core/react';
import App from './App';

if (process.env.NODE_ENV !== 'production') {
  axe(React, ReactDOM, 1000);
}

ReactDOM.render(<App />, document.getElementById('root'));
```

### 8.2 Manual Testing

**Keyboard Navigation:**

1. Unplug mouse
2. Navigate entire app using only keyboard
3. Verify all functionality accessible
4. Check focus indicators are visible
5. Verify logical tab order

**Screen Reader Testing:**

1. **macOS:** VoiceOver (Cmd + F5)
2. **Windows:** NVDA (free) or JAWS
3. **iOS:** VoiceOver (Settings → Accessibility)
4. **Android:** TalkBack (Settings → Accessibility)

**Test Checklist:**

- [ ] All images have alt text or are decorative
- [ ] All buttons have accessible names
- [ ] All forms have labels
- [ ] All links describe their destination
- [ ] Headings are in logical order
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Page is usable at 200% zoom
- [ ] All functionality works with keyboard
- [ ] Focus indicators are visible
- [ ] Screen reader announces all content
- [ ] Live regions announce dynamic updates
- [ ] Modal traps focus correctly

### 8.3 Real User Testing

**Recruit users with disabilities:**

- Vision impairments (blind, low vision, color blind)
- Motor disabilities (limited hand movement, no mouse)
- Cognitive differences (dyslexia, ADHD)
- Hearing impairments (for future video content)

**Ask:**

- Can you complete the onboarding?
- Can you write and save a letter?
- Can you navigate to your vault?
- Can you change settings?
- What was frustrating?
- What worked well?

---

## 9. Accessibility Checklist

### Before Each Release

**Visual:**

- [ ] All text meets color contrast ratios (4.5:1 minimum)
- [ ] UI components meet contrast ratios (3:1 minimum)
- [ ] High contrast mode works
- [ ] Dark mode works
- [ ] Text can be resized to 200% without loss
- [ ] No information conveyed by color alone

**Keyboard:**

- [ ] All functionality available via keyboard
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] No keyboard traps
- [ ] Escape closes modals
- [ ] Enter/Space activates buttons

**Screen Reader:**

- [ ] All images have alt text
- [ ] All buttons have accessible names
- [ ] All form fields have labels
- [ ] Headings are in logical order
- [ ] ARIA landmarks present
- [ ] Live regions announce updates
- [ ] Error messages are announced

**Content:**

- [ ] Language is clear (8th grade level)
- [ ] Instructions are concise
- [ ] Error messages are helpful
- [ ] No flashing content
- [ ] Reduced motion option works

**Testing:**

- [ ] axe DevTools shows no violations
- [ ] Lighthouse accessibility score 90+
- [ ] Manual keyboard test passed
- [ ] Manual screen reader test passed
- [ ] Tested at 200% zoom

---

## 10. Resources

### Standards

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)

### Testing Tools

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WAVE](https://wave.webaim.org/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Screen Readers

- [NVDA](https://www.nvaccess.org/) (Windows, free)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) (Windows, paid)
- [VoiceOver](https://www.apple.com/accessibility/voiceover/) (macOS/iOS, built-in)
- [TalkBack](https://support.google.com/accessibility/android/answer/6283677) (Android, built-in)

---

## Summary

CLOSURE's accessibility commitment:

1. ✅ **WCAG 2.1 AA Minimum**: All criteria met, many AAA
2. ✅ **Keyboard Navigation**: Full functionality, visible focus
3. ✅ **Screen Reader Support**: ARIA landmarks, labels, live regions
4. ✅ **Visual Accessibility**: High contrast, dark mode, text resize
5. ✅ **Cognitive Accessibility**: Clear language, consistent patterns
6. ✅ **Motor Accessibility**: Large targets, no fine motor required
7. ✅ **Testing**: Automated + manual + real user testing

**Healing is for everyone. Access is not optional.**
