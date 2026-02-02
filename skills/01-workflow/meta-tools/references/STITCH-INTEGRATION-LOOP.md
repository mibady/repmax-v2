# Ralph Loop: Stitch Integration Template

Automate the integration of multiple Stitch exports into your Next.js project using Ralph Loop.

## Quick Start

```bash
# Install ralph-loop plugin if not already installed
/plugin install ralph-loop@claude-plugins-official

# Run the integration loop
/ralph-loop:ralph-loop --max-iterations 25 --completion-promise "ALL PAGES INTEGRATED"
```

## Prompt Template

Use this template when launching the Ralph Loop:

```
Integrate Stitch exports from `{stitch_folder}/` into `{app_folder}/`

Process these exports in order:
{list_of_exports_and_target_files}

For each page:
1. Read the Stitch code.html file
2. Read the current scaffold page.tsx
3. Convert HTML to React:
   - class → className
   - Use project theme: bg-card, border-border, text-muted-foreground
   - Material Symbols icons (already loaded in layout)
   - <a href> → <Link> from next/link
   - <img src> → <Image> from next/image with width/height
   - Add 'use client' only if needed for interactivity
4. Preserve ALL existing data fetching, hooks, and server actions
5. Merge Stitch design with existing functionality
6. Run: npx tsc --noEmit 2>&1 | grep -E '{page_name}' || echo 'No errors'
7. Fix any TypeScript errors before moving to next file

Say {completion_promise} when all pages pass TypeScript
```

## Example Usage

### Basic Integration

```bash
/ralph-loop:ralph-loop "Integrate Stitch exports from stitch-exports/ into app/

Process these exports in order:
1. stitch-exports/dashboard/code.html → app/(app)/dashboard/page.tsx
2. stitch-exports/settings/code.html → app/(app)/settings/page.tsx
3. stitch-exports/profile/code.html → app/(app)/profile/page.tsx

For each:
1. Read the Stitch code.html
2. Read the current page.tsx
3. Convert HTML to React:
   - class → className
   - Theme: bg-card, border-border, text-muted-foreground
   - Material Symbols icons
   - <a href> → <Link>
4. Preserve existing data fetching and server actions
5. Run: npx tsc --noEmit 2>&1 | grep -E 'page\.tsx' || echo 'No errors'
6. Fix TypeScript errors before next file

Say ALL PAGES INTEGRATED when done" --max-iterations 25 --completion-promise "ALL PAGES INTEGRATED"
```

### Phase-Based Integration

```bash
/ralph-loop:ralph-loop "Integrate Phase 4 Stitch exports.

Exports to integrate:
- stitch-exports/loads/code.html → app/(app)/loads/page.tsx
- stitch-exports/loads-new/code.html → app/(app)/loads/new/page.tsx
- stitch-exports/carriers/code.html → app/(app)/carriers/page.tsx

Conversion rules:
- class → className
- Icons: Material Symbols Outlined (loaded in layout)
- Theme tokens: bg-card, bg-secondary, border-border, text-foreground, text-muted-foreground
- <a href> → <Link href> from next/link
- Add 'use client' only if onClick handlers needed

CRITICAL: Preserve ALL existing:
- Data fetching functions
- Server actions
- TypeScript interfaces
- Form handlers
- API calls

After each file:
npx tsc --noEmit 2>&1 | grep -E 'page\.tsx' | head -20

Say PHASE 4 INTEGRATED when all pages pass TypeScript" --max-iterations 35 --completion-promise "PHASE 4 INTEGRATED"
```

## TypeScript Verification Patterns

### Check Specific Page

```bash
npx tsc --noEmit 2>&1 | grep -E 'dashboard' || echo 'No errors'
```

### Check All Pages (Ignore API Routes)

```bash
npx tsc --noEmit 2>&1 | grep -E 'page\.tsx' | grep -v 'route\.ts'
```

### Check Specific Directory

```bash
npx tsc --noEmit 2>&1 | grep -E 'app/\(app\)' | head -20
```

### Full Build Check

```bash
npm run build 2>&1 | tail -30
```

## Common Conversion Rules

| Stitch Output  | Convert To                                |
| -------------- | ----------------------------------------- |
| `class=""`     | `className=""`                            |
| `<a href="">`  | `<Link href="">`                          |
| `<img src="">` | `<Image src="" width={} height={}>`       |
| Stitch colors  | Theme tokens (`bg-card`, `border-border`) |
| Custom icons   | Material Symbols Outlined                 |
| `onclick=""`   | `'use client'` + React handler            |

## Theme Tokens Reference

| Token                        | Usage                          |
| ---------------------------- | ------------------------------ |
| `bg-card`                    | Card/section backgrounds       |
| `bg-secondary`               | Input backgrounds, muted areas |
| `border-border`              | All borders                    |
| `text-foreground`            | Primary text                   |
| `text-muted-foreground`      | Secondary text, labels         |
| `text-primary`               | Accent text, links             |
| `bg-primary`                 | Primary buttons                |
| `bg-primary/20 text-primary` | Icon badges                    |

## Troubleshooting

### Issue: Undefined Card/Button/Input

**Cause**: Scaffold used shadcn components, Stitch uses raw HTML
**Fix**: Use Stitch-compatible patterns from `face-layer/SKILL.md`

### Issue: Lucide Icons in Scaffold

**Cause**: Scaffold generated with Lucide, Stitch uses Material Symbols
**Fix**: Replace all Lucide icons with Material Symbols Outlined

### Issue: API Route TypeScript Errors

**Cause**: Separate concern from page integration
**Fix**: Filter out with `grep -v 'route\.ts'`, fix later

### Issue: Form Not Wired

**Cause**: Stitch design replaced scaffold form handling
**Fix**: Preserve existing server actions and form handlers

### Issue: Data Not Rendering

**Cause**: Stitch static content replaced dynamic data
**Fix**: Ensure data fetching and mapping from scaffold preserved

## Best Practices

1. **One phase at a time**: Don't try to integrate all phases in one loop
2. **Backup before running**: Create a git commit before starting
3. **Verify after each file**: Check TypeScript before moving to next
4. **Preserve functionality**: Always keep existing hooks/actions
5. **Test interactivity**: After integration, manually verify forms and buttons work

## Integration Order

Recommended order for large projects:

1. **Dashboard** - Core layout, sets the pattern
2. **List pages** - Tables, data display
3. **Detail pages** - Single item views
4. **Form pages** - Create/edit flows
5. **Settings/Profile** - User account pages

## Related Resources

- `google-stitch-prompts-nextjs` → Post-Export Integration Guide
- `face-layer` → Stitch-Compatible Patterns
- `ralph-wiggum` → Loop automation patterns
