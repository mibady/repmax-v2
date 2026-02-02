# API Client for Mobile

Auth-injected API client for connecting mobile apps to Vercel/backend APIs.

## Client Implementation

```typescript
// lib/api.ts
import { supabase } from './supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || '';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions<T = unknown> {
  method?: RequestMethod;
  body?: T;
  headers?: Record<string, string>;
  timeout?: number;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * API client that automatically includes Supabase auth token
 */
export async function api<TResponse = unknown, TBody = unknown>(
  endpoint: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const { method = 'GET', body, headers = {}, timeout = 30000 } = options;

  // Get auth token
  const { data: { session } } = await supabase.auth.getSession();
  
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (session?.access_token) {
    requestHeaders['Authorization'] = `Bearer ${session.access_token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data?.message || data?.error || 'An error occurred',
        data
      );
    }

    return data as TResponse;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) throw error;
    
    if ((error as Error).name === 'AbortError') {
      throw new ApiError(408, 'Request timeout');
    }
    
    throw new ApiError(0, (error as Error).message);
  }
}

// Convenience methods
export const apiClient = {
  get: <T>(endpoint: string, headers?: Record<string, string>) =>
    api<T>(endpoint, { method: 'GET', headers }),

  post: <T, B = unknown>(endpoint: string, body: B, headers?: Record<string, string>) =>
    api<T, B>(endpoint, { method: 'POST', body, headers }),

  put: <T, B = unknown>(endpoint: string, body: B, headers?: Record<string, string>) =>
    api<T, B>(endpoint, { method: 'PUT', body, headers }),

  patch: <T, B = unknown>(endpoint: string, body: B, headers?: Record<string, string>) =>
    api<T, B>(endpoint, { method: 'PATCH', body, headers }),

  delete: <T>(endpoint: string, headers?: Record<string, string>) =>
    api<T>(endpoint, { method: 'DELETE', headers }),
};
```

## Usage Examples

### Basic Requests

```typescript
import { apiClient, ApiError } from '@/lib/api';

// GET
const users = await apiClient.get<User[]>('/users');

// GET with query params
const users = await apiClient.get<User[]>('/users?limit=10&page=1');

// POST
const newUser = await apiClient.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com',
});

// PATCH
const updatedUser = await apiClient.patch<User>(`/users/${id}`, {
  name: 'John Updated',
});

// DELETE
await apiClient.delete(`/users/${id}`);
```

### Error Handling

```typescript
try {
  const data = await apiClient.get('/protected-resource');
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        // Unauthorized - redirect to login
        router.replace('/auth/sign-in');
        break;
      case 403:
        // Forbidden
        Alert.alert('Access Denied', 'You do not have permission');
        break;
      case 404:
        // Not found
        Alert.alert('Not Found', error.message);
        break;
      case 422:
        // Validation error
        console.log('Validation errors:', error.data);
        break;
      case 500:
        // Server error
        Alert.alert('Server Error', 'Please try again later');
        break;
      default:
        Alert.alert('Error', error.message);
    }
  } else {
    // Network error
    Alert.alert('Network Error', 'Please check your connection');
  }
}
```

### With React Hook

```typescript
// hooks/use-api.ts
import { useState, useCallback } from 'react';
import { apiClient, ApiError } from '@/lib/api';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async (
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    endpoint: string,
    body?: unknown
  ) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    
    try {
      const data = body
        ? await (apiClient[method] as Function)(endpoint, body)
        : await apiClient[method](endpoint);
      
      setState({ data, isLoading: false, error: null });
      return data as T;
    } catch (error) {
      const apiError = error as ApiError;
      setState({ data: null, isLoading: false, error: apiError });
      throw error;
    }
  }, []);

  return {
    ...state,
    get: (endpoint: string) => execute('get', endpoint),
    post: (endpoint: string, body: unknown) => execute('post', endpoint, body),
    put: (endpoint: string, body: unknown) => execute('put', endpoint, body),
    patch: (endpoint: string, body: unknown) => execute('patch', endpoint, body),
    delete: (endpoint: string) => execute('delete', endpoint),
  };
}
```

```tsx
// In component
function UserList() {
  const { data: users, isLoading, error, get } = useApi<User[]>();

  useEffect(() => {
    get('/users');
  }, []);

  if (isLoading) return <Loading />;
  if (error) return <Text>Error: {error.message}</Text>;
  
  return (
    <FlatList
      data={users}
      renderItem={({ item }) => <UserCard user={item} />}
    />
  );
}
```

### With Zustand Store

```typescript
// store/products.ts
import { create } from 'zustand';
import { apiClient, ApiError } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  price: number;
}

interface ProductsState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  
  fetchProducts: () => Promise<void>;
  createProduct: (data: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const products = await apiClient.get<Product[]>('/products');
      set({ products, isLoading: false });
    } catch (error) {
      set({ 
        error: (error as ApiError).message, 
        isLoading: false 
      });
    }
  },

  createProduct: async (data) => {
    set({ isLoading: true, error: null });
    
    try {
      const product = await apiClient.post<Product>('/products', data);
      set((state) => ({
        products: [...state.products, product],
        isLoading: false,
      }));
      return product;
    } catch (error) {
      set({ error: (error as ApiError).message, isLoading: false });
      throw error;
    }
  },

  updateProduct: async (id, data) => {
    set({ isLoading: true, error: null });
    
    try {
      const updated = await apiClient.patch<Product>(`/products/${id}`, data);
      set((state) => ({
        products: state.products.map((p) => 
          p.id === id ? updated : p
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as ApiError).message, isLoading: false });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      await apiClient.delete(`/products/${id}`);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as ApiError).message, isLoading: false });
      throw error;
    }
  },
}));
```

## Vercel Backend Integration

### Next.js API Route (Vercel)

```typescript
// app/api/users/route.ts (on Vercel)
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  // Get token from mobile app request
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Create authenticated Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    }
  );

  // Verify user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Fetch data (RLS policies apply based on user)
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
```

## Offline Support

```typescript
// lib/api-offline.ts
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api';

const PENDING_REQUESTS_KEY = 'pending_requests';

interface PendingRequest {
  id: string;
  method: string;
  endpoint: string;
  body?: unknown;
  timestamp: number;
}

export async function queueRequest(
  method: 'post' | 'put' | 'patch' | 'delete',
  endpoint: string,
  body?: unknown
) {
  const state = await NetInfo.fetch();
  
  if (state.isConnected) {
    // Online - execute immediately
    return apiClient[method](endpoint, body);
  }
  
  // Offline - queue for later
  const pending = await getPendingRequests();
  const request: PendingRequest = {
    id: Date.now().toString(),
    method,
    endpoint,
    body,
    timestamp: Date.now(),
  };
  
  pending.push(request);
  await AsyncStorage.setItem(PENDING_REQUESTS_KEY, JSON.stringify(pending));
  
  return { queued: true, id: request.id };
}

export async function syncPendingRequests() {
  const pending = await getPendingRequests();
  
  for (const request of pending) {
    try {
      await apiClient[request.method](request.endpoint, request.body);
      await removePendingRequest(request.id);
    } catch (error) {
      console.error('Failed to sync request:', request.id);
    }
  }
}

async function getPendingRequests(): Promise<PendingRequest[]> {
  const data = await AsyncStorage.getItem(PENDING_REQUESTS_KEY);
  return data ? JSON.parse(data) : [];
}

async function removePendingRequest(id: string) {
  const pending = await getPendingRequests();
  const filtered = pending.filter((r) => r.id !== id);
  await AsyncStorage.setItem(PENDING_REQUESTS_KEY, JSON.stringify(filtered));
}
```

## File Uploads

```typescript
// Upload image to Supabase Storage
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';

export async function uploadImage(bucket: string, path: string) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });

  if (result.canceled) return null;

  const uri = result.assets[0].uri;
  const ext = uri.split('.').pop();
  const fileName = `${path}/${Date.now()}.${ext}`;

  // Read file as blob
  const response = await fetch(uri);
  const blob = await response.blob();

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, blob, {
      contentType: `image/${ext}`,
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
}
```
