# Stitch Prompts - Vite

Templates for Vite + React SPA applications.

## Output Target

- React functional components
- React Router for navigation
- TanStack Query for data
- Tailwind CSS + shadcn/ui

## Template

```markdown
## Screen: [RouteName]

**Framework target:** Vite + React SPA

**Purpose:** [Screen purpose]

**Route:** /[path]

**Layout:**

- [Layout description]
- Client-side rendered

**Components:**

- [Component list]

**Data fetching:**

- TanStack Query hooks
- [API endpoints needed]

**Copy:**

- [All text content]

**States:**

- Loading: Spinner/Skeleton
- Error: Error message + retry
- Success: Data display

**Interactivity:**

- [User interactions]
- [Form handling]
```

## Conversion Notes

1. All components are client-side
2. Use React Router `<Link>` for navigation
3. Use TanStack Query for data fetching
4. State management with Zustand if needed
5. Form handling with React Hook Form
