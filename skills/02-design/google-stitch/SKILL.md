---
name: google-stitch
description: Google Stitch AI-generated UI designs with platform-specific prompt templates. Use when creating Stitch prompts for any platform (Next.js, Vite, Expo, Telegram, Discord, ChatGPT) or converting Stitch HTML output to production code. Triggers on "stitch prompt", "stitch design", "generate UI with stitch", "stitch for nextjs/vite/expo/telegram/discord/chatgpt".
---

# Google Stitch

AI-powered design tool generating production-ready UI from text prompts.

## Workflow

```
1. Write prompt (using platform template)  →  references/prompts-{platform}.md
2. Generate in Stitch  →  Export HTML/CSS
3. Convert to framework  →  stitch-convert-* skills
4. Wire up with hooks/actions
```

## Universal Prompt Structure

```markdown
## Screen: [Name]

**Purpose:** [What this screen does]

**Layout:**

- [Structure description]

**Components:**

- [Component list with states]

**Copy:**

- Heading: "[Exact text]"
- CTA: "[Button text]"

**States:** Empty, Loading, Error, Success

**Style:** [Colors, fonts, spacing]
```

## Platform Templates

| Platform | Reference File                   | Output          |
| -------- | -------------------------------- | --------------- |
| Next.js  | `references/prompts-nextjs.md`   | RSC + shadcn/ui |
| Vite     | `references/prompts-vite.md`     | React SPA       |
| Expo     | `references/prompts-expo.md`     | React Native    |
| Telegram | `references/prompts-telegram.md` | Mini App UI     |
| Discord  | `references/prompts-discord.md`  | Activity UI     |
| ChatGPT  | `references/prompts-chatgpt.md`  | Plugin UI       |

Read the appropriate reference file for platform-specific templates.

## Conversion

After generating in Stitch:

1. Export HTML/CSS
2. Use `stitch-convert-nextjs` or `stitch-convert-vite` skill
3. Follow fidelity verification workflow

## Best Practices

- Always specify exact copy text
- Include all screen states
- Reference design system tokens
- Describe responsive behavior
- Note accessibility requirements
