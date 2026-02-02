# Stitch Prompts - Telegram

Templates for Telegram Mini App UIs.

## Output Target

- Telegram Mini App components
- @telegram-apps/telegram-ui styling
- Theme-aware designs

## Template

```markdown
## Screen: [ScreenName]

**Framework target:** Telegram Mini App

**Purpose:** [Screen purpose]

**Layout:**

- Mobile-only (100% width, full height)
- Safe area padding
- Bottom-anchored main button

**Components (Telegram UI):**

- Cell, List, Section
- [Specific components]

**Telegram integration:**

- Main Button: "[Button text]"
- Back Button: [Yes/No]
- Theme colors: Use themeParams

**Copy:**

- Header: "[Text]"
- Description: "[Text]"

**States:**

- Loading: Placeholder components
- Empty: Centered illustration + CTA
- Error: Inline error message
- Success: Checkmark animation

**Style notes:**

- iOS-style rounded corners
- Telegram's default spacing
- Support light/dark themes
```

## Conversion Notes

1. Use Telegram UI components where possible
2. Apply theme colors from `themeParams`
3. Handle safe areas properly
4. Connect Main Button / Back Button
5. Keep touch targets 44px minimum
