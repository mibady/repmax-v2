---
name: face-layer
description: Frontend development with Next.js 15+, React, shadcn/ui, and Tailwind CSS.
---

# Face Layer

Frontend development: UI components, layouts, and client-side logic.

## When to Use

- Marketing sites and landing pages
- SEO-critical applications
- E-commerce storefronts
- Full-stack web apps with SSR
- Server Components with data fetching

## Stack

| Technology    | Version | Purpose                                 |
| ------------- | ------- | --------------------------------------- |
| Next.js       | 15+     | Full-stack React framework (App Router) |
| React         | 18/19   | UI library                              |
| Tailwind CSS  | 3.4/4.0 | Utility-first CSS                       |
| shadcn/ui     | Latest  | 50+ pre-styled components               |
| Radix UI      | Latest  | Accessible primitives                   |
| Framer Motion | 11+     | Animation                               |
| AG-UI         | Latest  | Agent-aware UI protocol                 |
| Zustand       | 5+      | State management                        |
| lucide-react  | Latest  | Icon library                            |

**AG-UI Protocol:** See `references/AG-UI-QUICK-REF.md` for streaming UI patterns.

## Pre-Implementation Checklist

Before building any screen, verify PRP Section 10 is complete:

- [ ] **User journeys defined** → Know Entry → Action → Exit for each flow
- [ ] **Visual tokens defined** → Apply to `tailwind.config.ts`
- [ ] **Button hierarchy defined** → Map to variants (primary, secondary, ghost)
- [ ] **Screen states listed** → Create loading.tsx, error.tsx, empty states
- [ ] **Form UX decided** → Configure validation, feedback patterns
- [ ] **AI/Chat UX defined** → Streaming indicators, error recovery (if applicable)

Reference: `ux-planning/SKILL.md`

**Design Libraries:** See `references/DESIGN-LIBRARIES.md` for icons, illustrations, fonts, and animations.

## Project Structure

```
app/
├── layout.tsx              # Root layout
├── page.tsx                # Home page
├── (auth)/                 # Route group
│   ├── login/page.tsx
│   └── signup/page.tsx
├── dashboard/
│   ├── layout.tsx          # Dashboard layout
│   ├── page.tsx
│   └── [id]/page.tsx       # Dynamic route
├── api/
│   └── chat/route.ts       # API endpoint
components/
├── ui/                     # shadcn components
├── features/               # Feature components
└── layout/                 # Layout components
lib/
├── utils.ts                # cn() helper
└── hooks/                  # Custom hooks
```

---

## Next.js App Router

### Root Layout

```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'App',
  description: 'Description',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Server Components (Default)

```typescript
// app/products/page.tsx
import { db } from '@/lib/db';

export default async function ProductsPage() {
  const products = await db.product.findMany();
  return (
    <div className="grid gap-4">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

### Client Components

```typescript
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Server Actions

```typescript
"use server";

import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  await db.product.create({ data: { name } });
  revalidatePath("/products");
}
```

---

## shadcn/ui Components

### Installation

```bash
npx shadcn@latest init
npx shadcn@latest add button card dialog input
```

### Usage

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default">Click</Button>
      </CardContent>
    </Card>
  );
}
```

### cn() Utility

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Stitch-Compatible Component Patterns

When integrating Stitch exports, use these patterns instead of shadcn abstractions for reduced conversion friction.

### Why Direct Tailwind?

Stitch outputs raw HTML/Tailwind. Using matching patterns:

- Reduces conversion friction
- Maintains visual consistency
- Enables copy-paste workflow

### Card Pattern (Stitch-Compatible)

```tsx
import { Settings } from "lucide-react";

// Instead of: <Card><CardHeader>...</CardHeader></Card>
// Use:
<section className="bg-card border border-border rounded-xl p-6 md:p-8">
  <div className="flex items-center gap-3 mb-6">
    <div className="bg-primary/20 p-2 rounded-lg">
      <Settings className="h-5 w-5 text-primary" />
    </div>
    <h3 className="text-xl font-bold text-foreground">Title</h3>
  </div>
  {/* Content */}
</section>;
```

### Button Patterns

```tsx
import { Plus, Trash2 } from 'lucide-react';

// Primary Button
<button className="flex items-center gap-2 rounded-lg h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold transition-colors">
  <Plus className="h-4 w-4" />
  Label
</button>

// Secondary Button
<button className="flex items-center gap-2 rounded-lg h-10 px-4 bg-secondary border border-border text-foreground text-sm font-bold hover:bg-secondary/80 transition-colors">
  Label
</button>

// Ghost Button
<button className="flex items-center gap-2 rounded-lg h-10 px-4 text-muted-foreground hover:text-foreground hover:bg-secondary/50 text-sm font-medium transition-colors">
  Label
</button>

// Destructive Button
<button className="flex items-center gap-2 rounded-lg h-10 px-4 bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors">
  <Trash2 className="h-4 w-4" />
  Delete
</button>
```

### Input Pattern

```tsx
<div>
  <label className="block mb-2 text-sm font-medium text-muted-foreground">
    Label
  </label>
  <input
    type="text"
    className="bg-secondary border border-border text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
    placeholder="Enter value..."
  />
</div>
```

### Select Pattern

```tsx
<div>
  <label className="block mb-2 text-sm font-medium text-muted-foreground">
    Label
  </label>
  <select className="bg-secondary border border-border text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5">
    <option value="">Select option...</option>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
  </select>
</div>
```

### Icon Standard

Default: lucide-react (tree-shakeable, consistent with shadcn/ui)

```tsx
import { Home, Settings, ChevronRight, Plus, X } from 'lucide-react';

// Usage in components
<Home className="h-5 w-5" />
<Settings className="h-5 w-5 text-muted-foreground" />

// Common sizes
<Home className="h-4 w-4" />   {/* 16px - small, inline */}
<Home className="h-5 w-5" />   {/* 20px - default */}
<Home className="h-6 w-6" />   {/* 24px - large */}
```

### Icon Badge Pattern

```tsx
import { LayoutDashboard } from "lucide-react";

<div className="bg-primary/20 p-2 rounded-lg">
  <LayoutDashboard className="h-5 w-5 text-primary" />
</div>;
```

### Empty State Pattern

```tsx
import { Inbox, Plus } from "lucide-react";

<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="bg-secondary p-4 rounded-full mb-4">
    <Inbox className="h-12 w-12 text-muted-foreground" />
  </div>
  <h3 className="text-lg font-semibold text-foreground mb-2">No items yet</h3>
  <p className="text-muted-foreground mb-4 max-w-sm">
    Get started by creating your first item.
  </p>
  <button className="flex items-center gap-2 rounded-lg h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold transition-colors">
    <Plus className="h-4 w-4" />
    Create Item
  </button>
</div>;
```

### Data Table Pattern

```tsx
import { MoreVertical } from "lucide-react";

<div className="bg-card border border-border rounded-xl overflow-hidden">
  <table className="w-full">
    <thead className="bg-secondary/50">
      <tr>
        <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">
          Name
        </th>
        <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">
          Status
        </th>
        <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">
          Actions
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-t border-border hover:bg-secondary/50 transition-colors">
        <td className="px-4 py-3 text-sm text-foreground">Item Name</td>
        <td className="px-4 py-3">
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-green-500/20 text-green-600">
            Active
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <button className="text-muted-foreground hover:text-foreground">
            <MoreVertical className="h-5 w-5" />
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>;
```

### When to Use shadcn vs Stitch Patterns

| Use Case                                | Recommendation             |
| --------------------------------------- | -------------------------- |
| Building from scratch                   | shadcn/ui components       |
| Integrating Stitch exports              | Stitch-compatible patterns |
| Complex interactions (Dialog, Dropdown) | shadcn/ui (accessibility)  |
| Simple display components               | Stitch-compatible patterns |
| Forms with validation                   | shadcn/ui Form components  |
| Visual-only cards/badges                | Stitch-compatible patterns |

---

## State Management (Zustand)

```typescript
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isLoading: false,
        login: async (email, password) => {
          set({ isLoading: true });
          const user = await loginAPI(email, password);
          set({ user, isLoading: false });
        },
        logout: () => set({ user: null }),
      }),
      { name: "auth-store" },
    ),
  ),
);
```

---

## Custom Hooks

### useAsync

```typescript
import { useState, useCallback, useEffect } from "react";

export function useAsync<T>(asyncFn: () => Promise<T>, immediate = true) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [asyncFn]);

  useEffect(() => {
    if (immediate) execute();
  }, [execute, immediate]);

  return { data, error, isLoading, execute };
}
```

### useDebounce

```typescript
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

---

## Performance Optimization

### Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';

export const ListItem = memo(function ListItem({ item, onSelect }: Props) {
  return <div onClick={() => onSelect(item.id)}>{item.name}</div>;
});

function ItemList({ items, onSelect }: Props) {
  const handleSelect = useCallback((id: string) => onSelect(id), [onSelect]);
  const sorted = useMemo(() => [...items].sort((a, b) =>
    a.name.localeCompare(b.name)
  ), [items]);

  return (
    <ul>
      {sorted.map((item) => (
        <ListItem key={item.id} item={item} onSelect={handleSelect} />
      ))}
    </ul>
  );
}
```

### Code Splitting

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
});
```

### Image Optimization

```typescript
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority
  placeholder="blur"
/>
```

---

## Tailwind Patterns

### Responsive Design

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map((item) => (
    <Card key={item.id} />
  ))}
</div>
```

### Dark Mode

```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
```

### Animation

```tsx
<div className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
  Hover me
</div>
```

---

## AG-UI Protocol Integration

For AI chat interfaces with streaming:

```typescript
'use client';

import { useChat } from 'ai/react';

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={cn(
            "p-4 rounded-lg",
            m.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
          )}>
            {m.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <input
          value={input}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          placeholder="Type a message..."
          disabled={isLoading}
        />
      </form>
    </div>
  );
}
```

---

## Testing

### Component Testing (Vitest + Testing Library)

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders and handles click', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

---

## Checklist

- [ ] App Router structure correct
- [ ] Server vs Client components separated
- [ ] shadcn/ui components installed
- [ ] Tailwind configured
- [ ] TypeScript strict mode
- [ ] Loading/error states implemented
- [ ] Responsive design verified
- [ ] Accessibility checked (Radix handles most)
- [ ] Performance profiled
