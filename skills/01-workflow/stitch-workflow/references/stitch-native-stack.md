# Stitch Native Design Stack

Reference documentation for Google Stitch's native design principles and how they map to our implementation stack.

## Stitch's Design DNA

Google Stitch generates UI based on these core design principles:

### Typography

| Principle   | Details                                                 |
| ----------- | ------------------------------------------------------- |
| Font Family | Sans-serif (Inter, Roboto, San Francisco)               |
| Hierarchy   | Strict: Display > H1 > H2 > H3 > Body > Caption         |
| Weights     | 400 (regular), 500 (medium), 600 (semibold), 700 (bold) |
| Line Height | 1.2 for headings, 1.5-1.75 for body                     |

### Grid System

| Context     | Grid                                       |
| ----------- | ------------------------------------------ |
| Web Desktop | 12-column responsive, 1280px max container |
| Web Tablet  | 8-column, fluid                            |
| Web Mobile  | 4-column, full width                       |
| Native Apps | 8dp base unit grid                         |

### Spacing Scale

Based on 4px/8dp base unit:

| Token | Value | Usage                     |
| ----- | ----- | ------------------------- |
| xs    | 4px   | Inline spacing, icon gaps |
| sm    | 8px   | Tight component padding   |
| md    | 16px  | Standard padding/gaps     |
| lg    | 24px  | Section spacing           |
| xl    | 32px  | Major section breaks      |
| 2xl   | 48px  | Page section separation   |

### Color Theory

| Principle     | Implementation                                             |
| ------------- | ---------------------------------------------------------- |
| Accessibility | WCAG AA minimum (4.5:1 text contrast)                      |
| Primary       | Brand color, CTAs, key actions                             |
| Secondary     | Supporting elements, secondary actions                     |
| Semantic      | Success (green), Error (red), Warning (amber), Info (blue) |
| Surfaces      | Background, Card, Muted, Popover                           |

---

## Design System Influences

Stitch draws from these established systems:

### Material Design 3

- Elevation system (0-5 levels with shadows)
- State layers (hover, pressed, focused, disabled)
- Motion principles (duration, easing curves)
- Container shapes (rounded corners by context)

### Human Interface Guidelines

- Layout margins and safe areas
- Touch targets (44pt minimum)
- Gesture patterns (swipe, tap, long press)
- Navigation patterns (tabs, sidebar, stack)

### Tailwind CSS / shadcn/ui

- Utility-first class naming
- Component variants (default, destructive, outline, ghost)
- CSS custom properties for theming
- Responsive breakpoint system (sm, md, lg, xl, 2xl)

### Icon Libraries

- **Primary**: Google Material Symbols Outlined (Stitch default)
- **Usage**: Keep as-is from Stitch output, no conversion needed
- **Setup**: Add font link to layout.tsx:
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
  ```

---

## Stack Mapping

### Our Implementation Stack

| Stitch Generates | We Convert To                   |
| ---------------- | ------------------------------- |
| HTML/Tailwind    | React + TypeScript              |
| Generic `<div>`  | Semantic HTML + shadcn/ui       |
| Hardcoded colors | CSS variables / Tailwind tokens |
| Static content   | Dynamic props/data              |
| Material Symbols | Keep as-is (add font to layout) |

### Component Library Mapping

| Stitch Pattern   | shadcn/ui Component                                           |
| ---------------- | ------------------------------------------------------------- |
| Card container   | `<Card>` with `<CardHeader>`, `<CardContent>`, `<CardFooter>` |
| Primary button   | `<Button>` (default variant)                                  |
| Secondary button | `<Button variant="secondary">`                                |
| Ghost button     | `<Button variant="ghost">`                                    |
| Text input       | `<Input>` with `<Label>`                                      |
| Select dropdown  | `<Select>` with `<SelectTrigger>`, `<SelectContent>`          |
| Checkbox         | `<Checkbox>` with label                                       |
| Toggle           | `<Switch>`                                                    |
| Avatar           | `<Avatar>` with `<AvatarImage>`, `<AvatarFallback>`           |
| Badge/Tag        | `<Badge>` with variants                                       |
| Modal            | `<Dialog>` with header, content, footer                       |
| Sidebar          | Custom or `<Sheet>` on mobile                                 |
| Tabs             | `<Tabs>` with `<TabsList>`, `<TabsTrigger>`, `<TabsContent>`  |
| Tooltip          | `<Tooltip>` with `<TooltipTrigger>`, `<TooltipContent>`       |
| Dropdown menu    | `<DropdownMenu>` with items                                   |

### Icon Usage

Stitch outputs Google Material Symbols. **Do not convert** - use as-is:

```tsx
// Stitch output (keep this)
<span className="material-symbols-outlined">account_balance</span>

// CSS classes from Stitch
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400; }
.icon-filled { font-variation-settings: 'FILL' 1, 'wght' 400; }
```

Common icons used by Stitch:
| Category   | Icons                                                    |
| ---------- | -------------------------------------------------------- |
| Navigation | `home`, `settings`, `person`, `menu`, `close`            |
| Actions    | `add`, `edit`, `delete`, `download`, `upload`            |
| Status     | `check_circle`, `error`, `info`, `warning`               |
| Arrows     | `chevron_right`, `chevron_left`, `arrow_forward`         |
| Media            | `Image`, `Video`, `Music`, `File`                        |
| Social           | `Mail`, `Phone`, `Globe`, `Share2`                       |

---

## Color Token Reference

### Semantic Tokens (shadcn/ui compatible)

| Token              | CSS Variable           | Usage                 |
| ------------------ | ---------------------- | --------------------- |
| Background         | `--background`         | Page background       |
| Foreground         | `--foreground`         | Primary text          |
| Card               | `--card`               | Card backgrounds      |
| Card Foreground    | `--card-foreground`    | Card text             |
| Primary            | `--primary`            | Primary actions, CTAs |
| Primary Foreground | `--primary-foreground` | Text on primary       |
| Secondary          | `--secondary`          | Secondary elements    |
| Muted              | `--muted`              | Subtle backgrounds    |
| Muted Foreground   | `--muted-foreground`   | Secondary text        |
| Accent             | `--accent`             | Highlights            |
| Destructive        | `--destructive`        | Danger/delete actions |
| Border             | `--border`             | Default borders       |
| Input              | `--input`              | Input borders         |
| Ring               | `--ring`               | Focus rings           |

### Tailwind Token Classes

| CSS Variable         | Tailwind Class                       |
| -------------------- | ------------------------------------ |
| `--background`       | `bg-background`                      |
| `--foreground`       | `text-foreground`                    |
| `--card`             | `bg-card`                            |
| `--primary`          | `bg-primary`, `text-primary`         |
| `--secondary`        | `bg-secondary`                       |
| `--muted`            | `bg-muted`                           |
| `--muted-foreground` | `text-muted-foreground`              |
| `--border`           | `border-border`                      |
| `--destructive`      | `bg-destructive`, `text-destructive` |

---

## Typography Scale

### Heading Scale

| Element | Size | Weight   | Tailwind                 |
| ------- | ---- | -------- | ------------------------ |
| Display | 48px | Bold     | `text-5xl font-bold`     |
| H1      | 36px | Bold     | `text-4xl font-bold`     |
| H2      | 24px | Semibold | `text-2xl font-semibold` |
| H3      | 20px | Semibold | `text-xl font-semibold`  |
| H4      | 18px | Medium   | `text-lg font-medium`    |

### Body Scale

| Element    | Size | Weight | Tailwind                                          |
| ---------- | ---- | ------ | ------------------------------------------------- |
| Body Large | 18px | Normal | `text-lg`                                         |
| Body       | 16px | Normal | `text-base`                                       |
| Body Small | 14px | Normal | `text-sm`                                         |
| Caption    | 12px | Normal | `text-xs`                                         |
| Overline   | 10px | Medium | `text-[10px] font-medium uppercase tracking-wide` |

---

## Layout Patterns

### Common Layouts

| Pattern           | Implementation                                         |
| ----------------- | ------------------------------------------------------ |
| Sidebar + Content | `flex` with fixed `w-64` sidebar                       |
| Top Nav + Content | `flex flex-col` with fixed header                      |
| Split View        | `grid grid-cols-2` or `grid grid-cols-3`               |
| Cards Grid        | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` |
| Centered Content  | `max-w-4xl mx-auto px-4`                               |

### Responsive Breakpoints

| Breakpoint | Width   | Typical Layout           |
| ---------- | ------- | ------------------------ |
| Default    | 0-639px | Single column, stacked   |
| sm         | 640px+  | 2 columns possible       |
| md         | 768px+  | Tablet, 2-3 columns      |
| lg         | 1024px+ | Desktop, sidebar visible |
| xl         | 1280px+ | Wide desktop, 4 columns  |
| 2xl        | 1536px+ | Ultra-wide               |

---

## State Patterns

### Interactive States

| State          | Visual Treatment                                  |
| -------------- | ------------------------------------------------- |
| Default        | Base styling                                      |
| Hover          | Slight background change, cursor pointer          |
| Focus          | Focus ring (`ring-2 ring-ring ring-offset-2`)     |
| Active/Pressed | Slightly darker, scale down (`active:scale-95`)   |
| Disabled       | Reduced opacity (`opacity-50`), no pointer events |
| Loading        | Skeleton or spinner, disabled interactions        |

### Data States

| State   | UI Pattern                           |
| ------- | ------------------------------------ |
| Empty   | Illustration + CTA button            |
| Loading | Skeleton placeholders                |
| Error   | Error message + retry button         |
| Success | Toast notification + checkmark       |
| Partial | Content + skeleton for loading parts |

---

## Animation Guidelines

### Duration Scale

| Type    | Duration  | Usage                     |
| ------- | --------- | ------------------------- |
| Instant | 0ms       | Immediate feedback        |
| Fast    | 100-150ms | Micro-interactions, hover |
| Normal  | 200-300ms | State changes, reveals    |
| Slow    | 300-500ms | Large transitions, modals |

### Easing Curves

| Curve       | CSS           | Usage                |
| ----------- | ------------- | -------------------- |
| Ease Out    | `ease-out`    | Enter animations     |
| Ease In     | `ease-in`     | Exit animations      |
| Ease In-Out | `ease-in-out` | State changes        |
| Spring      | Custom bezier | Playful interactions |

### Tailwind Transitions

```css
/* Standard transition */
transition-all duration-200

/* Hover effects */
hover:scale-105 transition-transform duration-200

/* Color transitions */
transition-colors duration-150

/* Opacity transitions */
transition-opacity duration-300
```

---

## Usage in Workflow

### Stage 5: Stitch Prompts

Reference this document when writing Stitch prompts:

```
Design System Reference: Use the Stitch Native Stack principles.
- Typography: Inter font family, heading scale as specified
- Colors: Use semantic tokens (bg-card, text-muted-foreground)
- Icons: Google Material Symbols (Stitch default, no conversion needed)
- Components: Map to shadcn/ui equivalents
- Spacing: 4px/8dp grid system
```

### Stage 5.5: Developer Handoff

Use the mappings in this document to create the Developer Handoff Spec:

1. Map each Stitch visual element to shadcn/ui component
2. Document color token conversions
3. Specify icon replacements
4. Note any custom patterns needed
