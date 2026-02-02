# Stitch Prompts - Next.js

Templates optimized for Next.js App Router conversion.

## Output Target

- React Server Components (default)
- Client Components (for interactivity)
- shadcn/ui + Tailwind CSS

## Template

```markdown
## Screen: [PageName]

**Framework target:** Next.js 15 App Router

**Purpose:** [Screen purpose]

**Component type:** Server Component / Client Component

**Layout:**

- Uses app/[route]/layout.tsx structure
- [Sidebar/header/main content description]

**Components (shadcn/ui):**

- Card, Button, Input, etc.

**Data requirements:**

- [What data this screen needs]
- [Fetching strategy: server-side, client-side, streaming]

**Copy:**

- H1: "[Page title]"
- Description: "[Subtitle]"
- CTA: "[Primary action]"

**States:**

- Loading: Skeleton components
- Empty: [Empty state design]
- Error: Error boundary UI
- Success: [Normal state]

**Responsive:**

- Mobile: Single column, bottom nav
- Desktop: Sidebar + main content
```

## Conversion Notes

1. Replace `<div>` wrappers with semantic HTML
2. Add `'use client'` directive for interactive components
3. Replace inline styles with Tailwind classes
4. Import shadcn/ui components
5. Add TypeScript types
6. Connect to server actions for forms

## Output Structure

```
app/
├── dashboard/
│   ├── page.tsx          # Server Component
│   ├── loading.tsx       # Streaming fallback
│   └── _components/
│       └── DashboardCard.tsx  # Client Component
```
