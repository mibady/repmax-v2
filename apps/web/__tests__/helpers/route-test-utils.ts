import { vi } from 'vitest';
import { mockSupabaseClient } from '../setup';
import { TestUser, createMockAuthUser } from '../fixtures/users';

// ============================================
// Types
// ============================================

export interface MockQueryResult {
  data: unknown;
  error: { message: string; code?: string } | null;
  count?: number;
}

// ============================================
// Supabase Mock Configurator
// ============================================

/**
 * Configures mockSupabaseClient.from() to return different results per table name.
 * Chain methods (select, eq, order, etc.) return `this`.
 * Terminal methods: single()/maybeSingle() resolve to first item.
 * Implicit await (.then) resolves to full data array.
 */
export function configureMockSupabase(
  tableResults: Record<string, MockQueryResult>
): void {
  (mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockImplementation(
    (table: string) => {
      const result: MockQueryResult = tableResults[table] ?? {
        data: [],
        error: null,
      };

      const chain: Record<string, unknown> = {};

      // All chainable methods return `this`
      const chainMethods = [
        'select',
        'insert',
        'update',
        'delete',
        'upsert',
        'eq',
        'neq',
        'gt',
        'gte',
        'lt',
        'lte',
        'like',
        'ilike',
        'is',
        'in',
        'contains',
        'order',
        'limit',
        'range',
        'not',
        'filter',
        'match',
        'textSearch',
        'or',
        'and',
      ];

      for (const method of chainMethods) {
        chain[method] = vi.fn(() => chain);
      }

      // Terminal: single() — resolves to first item (from array) or the object itself
      chain.single = vi.fn(() =>
        Promise.resolve({
          data: Array.isArray(result.data)
            ? (result.data[0] ?? null)
            : (result.data ?? null),
          error: result.error,
        })
      );

      // Terminal: maybeSingle() — same behavior as single
      chain.maybeSingle = vi.fn(() =>
        Promise.resolve({
          data: Array.isArray(result.data)
            ? (result.data[0] ?? null)
            : (result.data ?? null),
          error: result.error,
        })
      );

      // Implicit await: .then makes the chain thenable (acts as a Promise)
      chain.then = vi.fn(
        (
          resolve: (value: {
            data: unknown;
            error: { message: string; code?: string } | null;
            count: number;
          }) => void
        ) =>
          resolve({
            data: result.data,
            error: result.error,
            count:
              result.count ??
              (Array.isArray(result.data) ? result.data.length : 0),
          })
      );

      return chain;
    }
  );
}

// ============================================
// Request Builder
// ============================================

/**
 * Creates a real Request object for testing API route handlers.
 */
export function createMockRequest(
  url: string,
  options?: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  }
): Request {
  const init: RequestInit = {
    method: options?.method ?? 'GET',
    headers: new Headers(options?.headers),
  };

  if (options?.body !== undefined) {
    init.body = JSON.stringify(options.body);
    (init.headers as Headers).set('Content-Type', 'application/json');
  }

  return new Request(url, init);
}

// ============================================
// Auth Helpers
// ============================================

/**
 * Sets mockSupabaseClient.auth.getUser to resolve as authenticated.
 */
export function mockAuthenticated(user: TestUser): void {
  (
    mockSupabaseClient.auth.getUser as ReturnType<typeof vi.fn>
  ).mockResolvedValue({
    data: { user: createMockAuthUser(user) },
    error: null,
  });
}

/**
 * Sets mockSupabaseClient.auth.getUser to resolve as unauthenticated.
 */
export function mockUnauthenticated(): void {
  (
    mockSupabaseClient.auth.getUser as ReturnType<typeof vi.fn>
  ).mockResolvedValue({
    data: { user: null },
    error: null,
  });
}

// ============================================
// Reset
// ============================================

/**
 * Resets all mock implementations to defaults (unauthenticated, empty table results).
 */
export function resetMocks(): void {
  // Reset auth to unauthenticated
  mockUnauthenticated();

  // Reset from() to return empty results for any table
  (mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockImplementation(
    () => {
      const chain: Record<string, unknown> = {};

      const chainMethods = [
        'select',
        'insert',
        'update',
        'delete',
        'upsert',
        'eq',
        'neq',
        'gt',
        'gte',
        'lt',
        'lte',
        'like',
        'ilike',
        'is',
        'in',
        'contains',
        'order',
        'limit',
        'range',
        'not',
        'filter',
        'match',
        'textSearch',
        'or',
        'and',
      ];

      for (const method of chainMethods) {
        chain[method] = vi.fn(() => chain);
      }

      chain.single = vi.fn(() =>
        Promise.resolve({ data: null, error: null })
      );
      chain.maybeSingle = vi.fn(() =>
        Promise.resolve({ data: null, error: null })
      );
      chain.then = vi.fn(
        (
          resolve: (value: {
            data: unknown[] | null;
            error: null;
            count: number;
          }) => void
        ) => resolve({ data: [], error: null, count: 0 })
      );

      return chain;
    }
  );
}
