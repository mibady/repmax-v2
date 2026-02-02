# React Router Patterns

Client-side routing patterns for React Router v7.

## Basic Setup

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Nested Layouts

### Layout with Outlet
```typescript
// src/components/layout/RootLayout.tsx
import { Outlet, Link } from 'react-router-dom';

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <nav className="container mx-auto flex gap-4 p-4">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
        </nav>
      </header>
      <main className="flex-1 container mx-auto p-4">
        <Outlet />
      </main>
      <footer className="border-t p-4 text-center text-muted-foreground">
        © 2024 My App
      </footer>
    </div>
  );
}
```

### Dashboard Layout
```typescript
// src/components/layout/DashboardLayout.tsx
import { Outlet, NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const sidebarLinks = [
  { to: '/dashboard', label: 'Overview', end: true },
  { to: '/dashboard/analytics', label: 'Analytics' },
  { to: '/dashboard/products', label: 'Products' },
  { to: '/dashboard/customers', label: 'Customers' },
  { to: '/dashboard/settings', label: 'Settings' },
];

export function DashboardLayout() {
  return (
    <div className="flex h-[calc(100vh-64px)]">
      <aside className="w-64 border-r bg-muted/40 p-4">
        <nav className="flex flex-col gap-1">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              {link.label}
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

### Route Configuration
```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          {/* Public routes */}
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="login" element={<Login />} />

          {/* Protected dashboard routes */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="customers" element={<Customers />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Protected Routes

### Basic Protected Route
```typescript
// src/components/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login, preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
```

### Role-Based Routes
```typescript
// src/App.tsx
<Route
  path="admin"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<AdminDashboard />} />
  <Route path="users" element={<UserManagement />} />
</Route>
```

### Redirect After Login
```typescript
// src/routes/auth/login.tsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const from = location.state?.from?.pathname || '/dashboard';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await login(
      formData.get('email') as string,
      formData.get('password') as string
    );

    // Redirect to the page they tried to access
    navigate(from, { replace: true });
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

---

## Dynamic Routes

### URL Parameters
```typescript
// src/routes/products/[id].tsx
import { useParams } from 'react-router-dom';
import { useProduct } from '@/lib/hooks/useProducts';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useProduct(id!);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading product</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <p className="text-muted-foreground">{product.description}</p>
      <p className="text-xl font-semibold">${product.price}</p>
    </div>
  );
}
```

### Search Parameters
```typescript
// src/routes/products/index.tsx
import { useSearchParams } from 'react-router-dom';

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'name';

  function handleCategoryChange(newCategory: string) {
    setSearchParams((prev) => {
      if (newCategory) {
        prev.set('category', newCategory);
      } else {
        prev.delete('category');
      }
      prev.set('page', '1'); // Reset to page 1
      return prev;
    });
  }

  function handlePageChange(newPage: number) {
    setSearchParams((prev) => {
      prev.set('page', newPage.toString());
      return prev;
    });
  }

  return (
    <div>
      {/* Filters */}
      <select
        value={category}
        onChange={(e) => handleCategoryChange(e.target.value)}
      >
        <option value="">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="clothing">Clothing</option>
      </select>

      {/* Products list */}
      {/* Pagination */}
    </div>
  );
}
```

---

## Navigation

### Programmatic Navigation
```typescript
import { useNavigate } from 'react-router-dom';

export function CreateProductForm() {
  const navigate = useNavigate();

  async function handleSubmit(data: ProductData) {
    const product = await createProduct(data);

    // Navigate to the new product page
    navigate(`/products/${product.id}`);

    // Or go back
    // navigate(-1);

    // Or replace current history entry
    // navigate('/products', { replace: true });

    // With state
    // navigate('/products', { state: { message: 'Product created!' } });
  }

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

### Link Components
```typescript
import { Link, NavLink } from 'react-router-dom';

// Basic link
<Link to="/products">Products</Link>

// Link with state
<Link to="/products/123" state={{ from: 'catalog' }}>
  View Product
</Link>

// NavLink for navigation (has isActive)
<NavLink
  to="/products"
  className={({ isActive, isPending }) =>
    cn(
      'px-3 py-2 rounded-md',
      isActive && 'bg-primary text-primary-foreground',
      isPending && 'opacity-50'
    )
  }
>
  Products
</NavLink>
```

---

## Error Boundaries

### Route Error Boundary
```typescript
// src/components/error/RouteErrorBoundary.tsx
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';

export function RouteErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold">{error.status}</h1>
        <p className="text-muted-foreground mt-2">{error.statusText}</p>
        <Link to="/" className="mt-4 text-primary hover:underline">
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Oops!</h1>
      <p className="text-muted-foreground mt-2">Something went wrong</p>
      <Link to="/" className="mt-4 text-primary hover:underline">
        Go home
      </Link>
    </div>
  );
}
```

### Using Error Boundary
```typescript
// src/App.tsx
<Route
  path="dashboard"
  element={<DashboardLayout />}
  errorElement={<RouteErrorBoundary />}
>
  {/* routes */}
</Route>
```

---

## Code Splitting with Lazy Loading

```typescript
// src/App.tsx
import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load routes
const Dashboard = lazy(() => import('@/routes/dashboard'));
const Products = lazy(() => import('@/routes/products'));
const Settings = lazy(() => import('@/routes/settings'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/products/*" element={<Products />} />
          <Route path="/settings/*" element={<Settings />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

---

## Data Loading Patterns

### With TanStack Query
```typescript
// src/routes/products/index.tsx
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';

export function Products() {
  const [searchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', { page }],
    queryFn: () => api.get(`/products?page=${page}`),
  });

  if (isLoading) return <ProductsSkeleton />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {data.products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
      <Pagination total={data.total} page={page} />
    </div>
  );
}
```

### Prefetching on Hover
```typescript
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function ProductLink({ id, children }: { id: string; children: React.ReactNode }) {
  const queryClient = useQueryClient();

  function handleMouseEnter() {
    queryClient.prefetchQuery({
      queryKey: ['products', id],
      queryFn: () => api.get(`/products/${id}`),
    });
  }

  return (
    <Link to={`/products/${id}`} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  );
}
```

---

## Route Guards Pattern

```typescript
// src/components/guards/AuthGuard.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';

export function AuthGuard() {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

// src/components/guards/GuestGuard.tsx
export function GuestGuard() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
```

### Using Guards
```typescript
// src/App.tsx
<Routes>
  {/* Guest-only routes (login, signup) */}
  <Route element={<GuestGuard />}>
    <Route path="login" element={<Login />} />
    <Route path="signup" element={<Signup />} />
  </Route>

  {/* Auth-required routes */}
  <Route element={<AuthGuard />}>
    <Route path="dashboard" element={<DashboardLayout />}>
      <Route index element={<Overview />} />
      <Route path="settings" element={<Settings />} />
    </Route>
  </Route>

  {/* Public routes */}
  <Route path="/" element={<Home />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

---

## Breadcrumbs

```typescript
// src/components/ui/Breadcrumbs.tsx
import { Link, useMatches } from 'react-router-dom';

interface BreadcrumbHandle {
  breadcrumb: string | ((params: Record<string, string>) => string);
}

export function Breadcrumbs() {
  const matches = useMatches();

  const crumbs = matches
    .filter((match) => Boolean((match.handle as BreadcrumbHandle)?.breadcrumb))
    .map((match) => {
      const handle = match.handle as BreadcrumbHandle;
      const breadcrumb =
        typeof handle.breadcrumb === 'function'
          ? handle.breadcrumb(match.params as Record<string, string>)
          : handle.breadcrumb;

      return {
        pathname: match.pathname,
        breadcrumb,
      };
    });

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      <Link to="/" className="hover:text-foreground">Home</Link>
      {crumbs.map((crumb, index) => (
        <span key={crumb.pathname} className="flex items-center gap-2">
          <span>/</span>
          {index === crumbs.length - 1 ? (
            <span className="text-foreground">{crumb.breadcrumb}</span>
          ) : (
            <Link to={crumb.pathname} className="hover:text-foreground">
              {crumb.breadcrumb}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
```

### Route with Handle
```typescript
// In route configuration
<Route
  path="products/:id"
  element={<ProductDetail />}
  handle={{
    breadcrumb: (params) => `Product ${params.id}`,
  }}
/>
```
