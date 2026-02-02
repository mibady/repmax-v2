---
name: vite-frontend
description: SPA development with Vite, React, React Router, and Tailwind CSS.
---

# Vite Frontend

Client-side rendered SPAs with Vite + React. Alternative to Next.js for non-SSR apps.

## When to Use

| Use Vite Frontend | Use Face Layer (Next.js) |
|-------------------|--------------------------|
| Dashboards & admin panels | Marketing sites |
| Internal tools | SEO-critical pages |
| Embedded widgets | E-commerce |
| Electron/Tauri apps | Blog/content sites |
| API-backed SPAs | Full-stack apps |

## Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Vite | 6+ | Build tool & dev server |
| React | 18/19 | UI library |
| TypeScript | 5.5+ | Type safety |
| React Router | 7+ | Client-side routing |
| Tailwind CSS | 3.4/4.0 | Utility-first CSS |
| shadcn/ui | Latest | 50+ pre-styled components |
| TanStack Query | 5+ | Data fetching & caching |
| Zustand | 5+ | State management |
| Vitest | 2+ | Unit testing |
| Playwright | Latest | E2E testing |

**Routing:** See `references/react-router-patterns.md` for routing patterns.
**Build:** See `references/vite-config-patterns.md` for configuration.

## Project Structure

```
src/
├── main.tsx                # Entry point
├── App.tsx                 # Root component with router
├── routes/                 # Route components (pages)
│   ├── index.tsx           # Home page
│   ├── dashboard/
│   │   ├── index.tsx       # Dashboard home
│   │   └── settings.tsx    # Settings page
│   └── auth/
│       ├── login.tsx
│       └── signup.tsx
├── components/
│   ├── ui/                 # shadcn components
│   ├── features/           # Feature components
│   └── layout/             # Layout components
├── lib/
│   ├── api.ts              # API client
│   ├── utils.ts            # cn() helper
│   └── hooks/              # Custom hooks
├── stores/                 # Zustand stores
└── types/                  # TypeScript types
public/
├── favicon.ico
└── assets/
index.html                  # HTML entry point
vite.config.ts              # Vite configuration
tailwind.config.ts          # Tailwind configuration
```

---

## Project Setup

### Create New Project
```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
```

### Install Dependencies
```bash
# Core
npm install react-router-dom @tanstack/react-query zustand

# Styling
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card dialog input

# Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D @playwright/test
```

### Tailwind Configuration
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
```

---

## React Router Setup

### Basic Router Configuration
```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootLayout } from '@/components/layout/RootLayout';
import { Home } from '@/routes';
import { Dashboard } from '@/routes/dashboard';
import { Login } from '@/routes/auth/login';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route
              path="dashboard/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

### Protected Route Component
```typescript
// src/components/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

---

## Data Fetching with TanStack Query

### API Client Setup
```typescript
// src/lib/api.ts
const API_BASE = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint);
  }

  post<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  patch<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE);
```

### Query Hooks
```typescript
// src/lib/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Product, CreateProductDTO } from '@/types';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => api.get<Product[]>('/products'),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => api.get<Product>(`/products/${id}`),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductDTO) => api.post<Product>('/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
```

### Using Queries in Components
```typescript
// src/routes/dashboard/products.tsx
import { useProducts, useDeleteProduct } from '@/lib/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function Products() {
  const { data: products, isLoading, error } = useProducts();
  const deleteProduct = useDeleteProduct();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {products?.map((product) => (
        <Card key={product.id}>
          <CardHeader>
            <CardTitle>{product.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">${product.price}</p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteProduct.mutate(product.id)}
              disabled={deleteProduct.isPending}
            >
              Delete
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## State Management (Zustand)

```typescript
// src/stores/auth.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isLoading: false,

        login: async (email, password) => {
          set({ isLoading: true });
          try {
            const { user, token } = await api.post<{ user: User; token: string }>(
              '/auth/login',
              { email, password }
            );
            api.setToken(token);
            set({ user, token, isLoading: false });
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },

        logout: () => {
          api.setToken(null);
          set({ user: null, token: null });
        },

        setUser: (user) => set({ user }),
      }),
      { name: 'auth-store' }
    )
  )
);
```

---

## Layouts

### Root Layout with Outlet
```typescript
// src/components/layout/RootLayout.tsx
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
```

### Dashboard Layout
```typescript
// src/components/layout/DashboardLayout.tsx
import { Outlet, NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Overview', end: true },
  { to: '/dashboard/products', label: 'Products' },
  { to: '/dashboard/settings', label: 'Settings' },
];

export function DashboardLayout() {
  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r bg-muted/40">
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'px-3 py-2 rounded-md text-sm',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 overflow-auto p-6">
        <Outlet />
      </div>
    </div>
  );
}
```

---

## Environment Variables

```bash
# .env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=My App

# .env.production
VITE_API_URL=https://api.myapp.com
```

```typescript
// Access in code
const apiUrl = import.meta.env.VITE_API_URL;
const appName = import.meta.env.VITE_APP_NAME;
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;
```

---

## Testing

### Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Test Setup
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
```

### Component Test
```typescript
// src/components/ui/button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('can be disabled', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### E2E with Playwright
```typescript
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('displays products', async ({ page }) => {
    await page.goto('/dashboard/products');
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
  });

  test('can create a product', async ({ page }) => {
    await page.goto('/dashboard/products');
    await page.click('button:has-text("Add Product")');
    await page.fill('[name="name"]', 'Test Product');
    await page.fill('[name="price"]', '29.99');
    await page.click('button:has-text("Save")');
    await expect(page.getByText('Test Product')).toBeVisible();
  });
});
```

---

## Build & Deployment

### Build Commands
```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Deployment Options

**Vercel/Netlify (Static)**
```bash
# Build output is in dist/
npm run build
```

**Docker**
```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /assets {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

---

## Checklist

- [ ] Vite project initialized with React + TypeScript
- [ ] React Router configured with layouts
- [ ] TanStack Query provider set up
- [ ] Zustand stores created
- [ ] shadcn/ui components installed
- [ ] Tailwind CSS configured
- [ ] Environment variables set
- [ ] API client created
- [ ] Protected routes implemented
- [ ] Vitest configured for unit tests
- [ ] Playwright configured for E2E tests
- [ ] Build and preview working
