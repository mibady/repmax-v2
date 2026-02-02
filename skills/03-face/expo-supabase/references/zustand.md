# Zustand State Management for Mobile

Lightweight state management with Zustand in React Native.

## Basic Store

```typescript
// store/counter.ts
import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
```

```tsx
// In component
import { useCounterStore } from '@/store/counter';

function Counter() {
  const { count, increment, decrement } = useCounterStore();
  
  return (
    <View>
      <Text>{count}</Text>
      <Button onPress={increment}>+</Button>
      <Button onPress={decrement}>-</Button>
    </View>
  );
}
```

## Async Actions

```typescript
// store/users.ts
import { create } from 'zustand';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UsersState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const users = await apiClient.get<User[]>('/users');
      set({ users, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addUser: async (userData) => {
    set({ isLoading: true, error: null });
    
    try {
      const newUser = await apiClient.post<User>('/users', userData);
      set((state) => ({
        users: [...state.users, newUser],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
```

## Persistence

```typescript
// store/app.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  theme: 'light' | 'dark' | 'system';
  hasCompletedOnboarding: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  completeOnboarding: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'system',
      hasCompletedOnboarding: false,
      setTheme: (theme) => set({ theme }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist specific fields
      partialize: (state) => ({
        theme: state.theme,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    }
  )
);
```

## Selectors

Selectors prevent unnecessary re-renders:

```typescript
// store/auth.ts
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: false,
  // ... actions
}));

// Selector hooks (only re-render when specific value changes)
export const useUser = () => useAuthStore((state) => state.user);
export const useSession = () => useAuthStore((state) => state.session);
export const useIsAuthenticated = () => useAuthStore((state) => !!state.session);
export const useIsAuthLoading = () => useAuthStore((state) => state.isLoading);
```

```tsx
// In component - only re-renders when user changes
function ProfileHeader() {
  const user = useUser();
  return <Text>{user?.name}</Text>;
}

// NOT this - re-renders on any store change
function ProfileHeader() {
  const { user } = useAuthStore(); // Bad!
  return <Text>{user?.name}</Text>;
}
```

## Computed Values

```typescript
interface CartState {
  items: CartItem[];
  // Computed via selector, not stored
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
}));

// Computed selectors
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartTotal = () => useCartStore((state) => 
  state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);
export const useCartCount = () => useCartStore((state) => 
  state.items.reduce((sum, item) => sum + item.quantity, 0)
);
```

## Devtools (Debug)

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useStore = create<State>()(
  devtools(
    (set) => ({
      // ... state and actions
    }),
    { name: 'MyStore' } // Name shown in devtools
  )
);
```

For React Native, use Flipper with `react-native-flipper` and the Zustand plugin.

## Combining Middlewares

```typescript
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useStore = create<State>()(
  devtools(
    persist(
      (set) => ({
        // ... state and actions
      }),
      {
        name: 'storage-key',
        storage: createJSONStorage(() => AsyncStorage),
      }
    ),
    { name: 'StoreName' }
  )
);
```

## Immer Middleware (Mutable Updates)

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface State {
  todos: Todo[];
  toggleTodo: (id: string) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
}

export const useTodoStore = create<State>()(
  immer((set) => ({
    todos: [],
    
    toggleTodo: (id) => set((state) => {
      const todo = state.todos.find((t) => t.id === id);
      if (todo) todo.completed = !todo.completed;
    }),
    
    updateTodo: (id, updates) => set((state) => {
      const index = state.todos.findIndex((t) => t.id === id);
      if (index !== -1) {
        Object.assign(state.todos[index], updates);
      }
    }),
  }))
);
```

## Store Slices

Split large stores into slices:

```typescript
// store/slices/user.ts
export interface UserSlice {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const createUserSlice = (set: any): UserSlice => ({
  user: null,
  setUser: (user) => set({ user }),
});

// store/slices/settings.ts
export interface SettingsSlice {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const createSettingsSlice = (set: any): SettingsSlice => ({
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
});

// store/index.ts
import { create } from 'zustand';
import { createUserSlice, UserSlice } from './slices/user';
import { createSettingsSlice, SettingsSlice } from './slices/settings';

type StoreState = UserSlice & SettingsSlice;

export const useStore = create<StoreState>((set, get) => ({
  ...createUserSlice(set),
  ...createSettingsSlice(set),
}));
```

## Reset Store

```typescript
const initialState = {
  user: null,
  items: [],
  isLoading: false,
};

export const useStore = create<State>((set) => ({
  ...initialState,
  
  // Actions...
  
  reset: () => set(initialState),
}));
```

## Subscribe to Changes

```typescript
// Outside React (e.g., in a service)
const unsubscribe = useAuthStore.subscribe(
  (state) => state.session,
  (session) => {
    if (session) {
      console.log('User logged in');
    } else {
      console.log('User logged out');
    }
  }
);

// Cleanup
unsubscribe();
```

## Best Practices

1. **One store per domain** - auth, cart, settings, etc.
2. **Use selectors** - Prevent unnecessary re-renders
3. **Keep actions in store** - Not in components
4. **Persist only necessary data** - Use `partialize`
5. **Initialize async data** - In root layout or on screen focus
6. **Type everything** - Full TypeScript coverage
