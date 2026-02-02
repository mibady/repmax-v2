# Developer Handoff Spec Template

Technical bridge document between Stitch visual design and code implementation.

**Purpose:** Eliminate guesswork during frontend build by documenting every technical decision before coding begins.

---

## When to Create

Create a Developer Handoff Spec after Stage 5 (Stitch Prompts) and before Stage 6 (Frontend Build).

**Location:** `docs/DEVELOPER-HANDOFF-SPEC.md` (per project)

---

## Template Structure

For each screen/page, document the following sections:

````markdown
# [Project Name] Developer Handoff Spec

Generated: [Date]
Stitch Prompts: docs/STITCH-DESIGN-PROMPTS.md
Backend Ready: [Yes/No]

---

## Global Decisions

### Component Library

| Element      | Implementation                  | Import                                           |
| ------------ | ------------------------------- | ------------------------------------------------ |
| Buttons      | shadcn/ui `<Button>`            | `@/components/ui/button`                         |
| Cards        | shadcn/ui `<Card>`              | `@/components/ui/card`                           |
| Inputs       | shadcn/ui `<Input>` + `<Label>` | `@/components/ui/input`, `@/components/ui/label` |
| Select       | shadcn/ui `<Select>`            | `@/components/ui/select`                         |
| Dialog/Modal | shadcn/ui `<Dialog>`            | `@/components/ui/dialog`                         |
| Icons        | Google Material Symbols         | Font link in layout.tsx (Stitch default)         |
| Avatars      | shadcn/ui `<Avatar>`            | `@/components/ui/avatar`                         |
| Badges       | shadcn/ui `<Badge>`             | `@/components/ui/badge`                          |
| Tables       | shadcn/ui `<Table>`             | `@/components/ui/table`                          |
| Toast        | shadcn/ui + sonner              | `sonner`                                         |

### Color Palette

| Design Color   | Hex     | CSS Variable         | Tailwind Token          |
| -------------- | ------- | -------------------- | ----------------------- |
| Primary        | #3B82F6 | --primary            | bg-primary              |
| Primary Text   | #FFFFFF | --primary-foreground | text-primary-foreground |
| Background     | #FFFFFF | --background         | bg-background           |
| Surface/Card   | #FFFFFF | --card               | bg-card                 |
| Muted BG       | #F4F4F5 | --muted              | bg-muted                |
| Text Primary   | #18181B | --foreground         | text-foreground         |
| Text Secondary | #71717A | --muted-foreground   | text-muted-foreground   |
| Border         | #E4E4E7 | --border             | border-border           |
| Destructive    | #EF4444 | --destructive        | bg-destructive          |
| Success        | #22C55E | N/A                  | bg-green-500            |
| Warning        | #F59E0B | N/A                  | bg-amber-500            |

### Typography Scale

| Element       | Size | Weight   | Tailwind Class                  |
| ------------- | ---- | -------- | ------------------------------- |
| Page Title    | 24px | Bold     | `text-2xl font-bold`            |
| Section Title | 18px | Semibold | `text-lg font-semibold`         |
| Card Title    | 16px | Medium   | `text-base font-medium`         |
| Body          | 14px | Normal   | `text-sm`                       |
| Label         | 12px | Medium   | `text-xs font-medium`           |
| Caption       | 12px | Normal   | `text-xs text-muted-foreground` |

### Spacing System

| Token         | Value | Usage   |
| ------------- | ----- | ------- |
| Page padding  | 24px  | `p-6`   |
| Card padding  | 16px  | `p-4`   |
| Section gap   | 24px  | `gap-6` |
| Component gap | 16px  | `gap-4` |
| Inline gap    | 8px   | `gap-2` |
| Icon gap      | 8px   | `gap-2` |

### Border Radius

| Element | Radius | Tailwind       |
| ------- | ------ | -------------- |
| Cards   | 12px   | `rounded-xl`   |
| Buttons | 8px    | `rounded-lg`   |
| Inputs  | 8px    | `rounded-lg`   |
| Badges  | 9999px | `rounded-full` |
| Avatars | 9999px | `rounded-full` |

---

## Screen: [Screen Name]

### Layout Pattern

| Pattern       | Implementation                       |
| ------------- | ------------------------------------ |
| Overall       | Sidebar (fixed 256px) + Main content |
| Main layout   | `ml-64 flex-1`                       |
| Content width | `max-w-6xl mx-auto`                  |
| Grid          | `grid grid-cols-4 gap-4`             |

### Component Breakdown

| Stitch Element | Component              | Props/Data                                     |
| -------------- | ---------------------- | ---------------------------------------------- |
| Stats row      | `<StatCard>` x 4       | `{ title, value, icon, trend }`                |
| Project grid   | `<ProjectCard>` mapped | `projects.map(p => <ProjectCard {...p} />)`    |
| Activity feed  | `<ActivityItem>` list  | `activities.map(a => <ActivityItem {...a} />)` |
| Quick actions  | `<Button>` group       | Static buttons with onClick handlers           |

### Interactive Elements

| Element              | Trigger | Handler                            | Service Call                    | Response                     |
| -------------------- | ------- | ---------------------------------- | ------------------------------- | ---------------------------- |
| "New Project" button | Click   | `onClick={handleNewProject}`       | Opens modal                     | N/A                          |
| Project card         | Click   | `onClick={() => router.push(...)}` | N/A                             | Navigate to `/projects/[id]` |
| Delete icon          | Click   | `onClick={handleDelete}`           | `deleteProject(id)`             | Toast + refetch              |
| Status toggle        | Change  | `onChange={handleStatusChange}`    | `updateProject(id, { status })` | Optimistic update            |
| Search input         | Input   | `onChange={handleSearch}`          | Client-side filter              | Filtered list                |

### Data Requirements

| Data          | Hook/Action                | Type             |
| ------------- | -------------------------- | ---------------- |
| Projects list | `useProjects()`            | `Project[]`      |
| Current user  | `useUser()`                | `User`           |
| Activity feed | `useActivities(limit: 10)` | `Activity[]`     |
| Stats         | `useStats()`               | `DashboardStats` |

### State Requirements

| State            | Trigger       | UI Treatment                                   |
| ---------------- | ------------- | ---------------------------------------------- |
| Empty            | 0 projects    | Illustration + "Create your first project" CTA |
| Loading          | Initial fetch | Skeleton cards (4 in grid)                     |
| Error            | API failure   | Error banner + retry button                    |
| Success (create) | After create  | Toast: "Project created"                       |
| Success (delete) | After delete  | Toast: "Project deleted" + remove from list    |
| Confirm delete   | Before delete | Dialog: "Are you sure?"                        |

### Forms on This Screen

| Form               | Fields                                  | Action                        | Validation       |
| ------------------ | --------------------------------------- | ----------------------------- | ---------------- |
| New Project Modal  | name (required), description (optional) | `createProject(formData)`     | Name min 3 chars |
| Edit Project Modal | name, description, status               | `updateProject(id, formData)` | Same as create   |

---

## Screen: [Next Screen Name]

[Repeat structure for each screen]

---

## Shared Components to Create

| Component         | Props                                        | Usage                    |
| ----------------- | -------------------------------------------- | ------------------------ |
| `<StatCard>`      | `{ title, value, icon, trend? }`             | Dashboard, Analytics     |
| `<ProjectCard>`   | `{ project, onEdit, onDelete }`              | Dashboard, Projects list |
| `<EmptyState>`    | `{ icon, title, description, action }`       | Any empty list           |
| `<PageHeader>`    | `{ title, description?, actions? }`          | All pages                |
| `<ConfirmDialog>` | `{ title, description, onConfirm, variant }` | Delete actions           |

---

## Integration Checklist

Before starting frontend build:

- [ ] All screens have component breakdown
- [ ] All interactive elements have handlers mapped
- [ ] All data requirements identified with hooks
- [ ] All forms documented with validation rules
- [ ] All states (empty, loading, error, success) specified
- [ ] Color palette matches design system
- [ ] Typography scale documented
- [ ] Icon library confirmed (Google Material Symbols from Stitch)

---

## Quick Reference

### Common Patterns

**Stat Card:**

```tsx
<Card>
  <CardContent className="p-4">
    <div className="flex items-center justify-between">
      <div className="bg-primary/10 p-2 rounded-lg">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      {trend && <TrendBadge value={trend} />}
    </div>
    <p className="text-2xl font-bold mt-2">{value}</p>
    <p className="text-sm text-muted-foreground">{title}</p>
  </CardContent>
</Card>
```
````

**Empty State:**

```tsx
<div className="flex flex-col items-center justify-center py-12">
  <Icon className="h-12 w-12 text-muted-foreground mb-4" />
  <h3 className="text-lg font-semibold">{title}</h3>
  <p className="text-muted-foreground mb-4">{description}</p>
  <Button onClick={onAction}>{actionLabel}</Button>
</div>
```

**Loading Skeleton:**

```tsx
<div className="grid grid-cols-4 gap-4">
  {[...Array(4)].map((_, i) => (
    <Card key={i}>
      <CardContent className="p-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-8 w-24 mt-2" />
        <Skeleton className="h-4 w-16 mt-1" />
      </CardContent>
    </Card>
  ))}
</div>
```

**Delete Confirmation:**

```tsx
<AlertDialog open={showDelete} onOpenChange={setShowDelete}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete {itemName}?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleConfirmDelete} variant="destructive">
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

```

---

## Stitch to Code Mapping Reference

### Visual Elements

| Stitch Shows | Convert To |
|--------------|------------|
| Card with shadow | `<Card>` (shadcn) |
| Rounded button | `<Button>` with appropriate variant |
| Text input | `<Input>` + `<Label>` |
| Dropdown | `<Select>` or `<DropdownMenu>` |
| Toggle switch | `<Switch>` |
| Checkbox | `<Checkbox>` |
| Avatar circle | `<Avatar>` with fallback |
| Icon (any) | Keep Material Symbols as-is |
| Badge/pill | `<Badge>` with variant |
| Modal/dialog | `<Dialog>` |
| Sidebar | Custom `<Sidebar>` component |
| Data table | `<Table>` or @tanstack/react-table |
| Toast message | `sonner` toast |

### Color Replacements

| Stitch Color | Replace With |
|--------------|--------------|
| White background | `bg-card` or `bg-background` |
| Gray-100 background | `bg-muted` |
| Gray-200 border | `border-border` |
| Gray-500 text | `text-muted-foreground` |
| Gray-900 text | `text-foreground` |
| Blue-600 button | `bg-primary` |
| Red-500 error | `bg-destructive` or `text-destructive` |
| Green-500 success | `bg-green-500` (semantic, keep) |

### Layout Conversions

| Stitch Layout | Tailwind Implementation |
|---------------|------------------------|
| Fixed sidebar | `w-64 fixed left-0 top-0 h-screen` |
| Main with sidebar | `ml-64 flex-1 min-h-screen` |
| 4-column grid | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4` |
| 2/3 + 1/3 split | `grid grid-cols-3` (main spans 2) |
| Centered content | `max-w-4xl mx-auto px-4` |
| Full-width container | `w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` |
```
