# Stitch Prompts - ChatGPT

Templates for ChatGPT plugin interfaces.

## Output Target

- Web interfaces for GPT plugins
- OAuth consent screens
- Settings/configuration pages

## Template

```markdown
## Screen: [ScreenName]

**Framework target:** ChatGPT Plugin Web UI

**Purpose:** [Screen purpose]

**Context:**

- OAuth callback page / Settings page / Results display

**Layout:**

- Centered card layout
- Clean, minimal design
- OpenAI-inspired aesthetics

**Components:**

- Forms for settings
- Success/error states
- Data displays

**Copy:**

- Header: "[Text]"
- Description: "[Text]"
- Action: "[Button text]"

**States:**

- Loading: Skeleton
- Error: Error message + retry
- Success: Confirmation

**Style notes:**

- White/light backgrounds
- Green (#10A37F) for success
- Clean typography
- Generous whitespace
```

## Conversion Notes

1. Keep designs minimal and focused
2. Handle OAuth flow states
3. Display API results cleanly
4. Error states are critical
5. Match OpenAI's clean aesthetic
