# Plan: Phase 4 — Testing Sprint (Target 70% Coverage)

## Objective

Add unit tests for all 12+ functional API routes + integration tests for key flows. Target 70% coverage threshold (already configured in `vitest.config.ts`).

## Context

RepMax v2 has 40 API routes (12 functional, 3 partial, 25 stubs), but only 3 test files exist — RLS simulation, RBAC role checks, and a dashboard component test. Coverage is estimated at <20%. Phases 1-3 built real DB-backed routes; without tests, regressions from Phase 5-6 will go undetected.

**Linear:** NGE-49 — Testing sprint (70% coverage)

---

## Current Test Landscape

| Asset | Location | Status |
|-------|----------|--------|
| Vitest config | `apps/web/vitest.config.ts` | Configured, 70% thresholds |
| Setup + MSW | `apps/web/__tests__/setup.ts` | Supabase mock + MSW server |
| MSW handlers | `apps/web/__tests__/mocks/handlers.ts` | 11 mock endpoints |
| Test fixtures | `apps/web/__tests__/fixtures/users.ts` | 15 test users with `createMockAuthUser()`, `createMockProfile()` |
| RLS tests | `apps/web/__tests__/integration/rls-policies.test.ts` | Simulated RLS for 7 tables |
| RBAC tests | `apps/web/__tests__/rbac/role-enforcement.test.tsx` | 5 roles + multi-role |
| Dashboard tests | `apps/web/__tests__/screens/dashboard.test.tsx` | 4 states (loading/empty/error/loaded) |

**Existing mock limitation:** `mockSupabaseClient.from()` always resolves to `{ data: [], error: null }`. Route tests need per-table, per-test result configuration.

---

## Testing Strategy

**Approach:** Unit-test route handlers by importing them directly, configuring mock Supabase returns per-test, calling with mock `Request` objects, asserting `Response` shape and status codes.

**What we test:**
- Auth gates (401 when no user, 403 when wrong role)
- Input validation (Zod rejects bad params → 400)
- Happy path response shapes (correct JSON structure)
- Error handling (DB error → 500, not found → 404, duplicate → 409)
- Edge cases (empty results, null fields, boundary values)

**What we DON'T test** (by design):
- Exact Supabase filter chains — that's the client library's job
- Real database queries — that's integration/E2E territory
- UI rendering — covered by existing component tests

---

## Team Members

| Agent | Role | Files Owned |
|-------|------|-------------|
| **Lead** | Orchestration, task creation, monitoring | — |
| **Builder 1** | Test infrastructure + utility tests | `route-test-utils.ts`, `mcp-cache.test.ts`, `zone-data.test.ts` |
| **Builder 2** | Dashboard route tests | `athletes.test.ts`, `athlete-dashboard.test.ts`, `coach-dashboard.test.ts`, `parent-dashboard.test.ts` |
| **Builder 3** | CRUD route tests | `shortlists.test.ts`, `messages.test.ts`, `film-bookmarks.test.ts`, `admin-analytics.test.ts` |
| **Builder 4** | MCP + auth tests | `mcp-routes.test.ts`, `auth-flow.test.ts` |
| **Validator** | Run vitest + coverage report | — |
| **Fixer** | Fix any test failures | — |

---

## Contract — File Ownership

All files under `apps/web/__tests__/`. No file may be modified by more than one builder.

| # | File | Owner | Type | What |
|---|------|-------|------|------|
| 1 | `helpers/route-test-utils.ts` | Builder 1 | **NEW** | Mock Supabase configurator + Request builder |
| 2 | `lib/mcp-cache.test.ts` | Builder 1 | **NEW** | TTL cache set/get/expiry tests |
| 3 | `lib/zone-data.test.ts` | Builder 1 | **NEW** | Zone mapping + `getPlaceholderImage()` tests |
| 4 | `api/athletes.test.ts` | Builder 2 | **NEW** | `GET /api/athletes` + `GET /api/athletes/[id]` |
| 5 | `api/athlete-dashboard.test.ts` | Builder 2 | **NEW** | `GET /api/athlete/dashboard` |
| 6 | `api/coach-dashboard.test.ts` | Builder 2 | **NEW** | `GET /api/coach/dashboard` |
| 7 | `api/parent-dashboard.test.ts` | Builder 2 | **NEW** | `GET /api/parent/dashboard` |
| 8 | `api/shortlists.test.ts` | Builder 3 | **NEW** | `GET, POST, DELETE /api/shortlists` |
| 9 | `api/messages.test.ts` | Builder 3 | **NEW** | `GET, POST, PATCH /api/messages` |
| 10 | `api/film-bookmarks.test.ts` | Builder 3 | **NEW** | `GET, POST /api/film/bookmarks` |
| 11 | `api/admin-analytics.test.ts` | Builder 3 | **NEW** | `GET /api/admin/analytics` |
| 12 | `api/mcp-routes.test.ts` | Builder 4 | **NEW** | All 5 MCP routes |
| 13 | `integration/auth-flow.test.ts` | Builder 4 | **NEW** | Server action login/signup/logout |

---

## Implementation Details

### Route Test Utilities (`helpers/route-test-utils.ts`)

Core helper that all API tests import:

```typescript
// Configurable mock: per-table result mapping
export function configureMockSupabase(tableResults: Record<string, MockQueryResult>) { ... }

// Creates a chainable query builder that resolves to configured data
function createQueryBuilder(result: MockQueryResult) {
  // All chain methods (select, eq, gte, order, etc.) return `this`
  // Terminal methods (single, maybeSingle) resolve to { data, error }
  // Implicit await resolves to { data: [], error, count }
}

// Request factory
export function createMockRequest(url: string, options?: RequestInit): Request { ... }

// Auth helpers
export function mockAuthenticated(user: TestUser) { ... }  // sets getUser to return user
export function mockUnauthenticated() { ... }  // sets getUser to return null
```

### API Route Test Pattern

Each test file follows this structure:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/[route]/route';
import { configureMockSupabase, createMockRequest, mockAuthenticated } from '../helpers/route-test-utils';
import { jaylenWashington } from '../fixtures/users';

describe('GET /api/[route]', () => {
  beforeEach(() => { /* reset mocks */ });

  it('returns 401 when not authenticated', async () => { ... });
  it('returns data on success', async () => { ... });
  it('returns 500 on database error', async () => { ... });
});
```

### Test Counts per File

| File | Describe Blocks | Est. Tests | Key Scenarios |
|------|----------------|------------|---------------|
| `athletes.test.ts` | 2 (list + detail) | ~12 | Filters (position, zone, class_year, min_stars), pagination, Zod validation, 404 |
| `athlete-dashboard.test.ts` | 1 | ~8 | Auth, profile+stats aggregation, empty stats, profile not found |
| `coach-dashboard.test.ts` | 1 | ~6 | Auth, coach role check, team roster, tasks |
| `parent-dashboard.test.ts` | 1 | ~6 | Auth, parent link, child profile access |
| `shortlists.test.ts` | 3 (GET/POST/DELETE) | ~14 | Auth, role=coach check, Zod body validation, duplicate 409, missing athlete_id |
| `messages.test.ts` | 3 (GET/POST/PATCH) | ~14 | Auth, inbox/sent folder, recipient validation, mark-as-read, message_id required |
| `mcp-routes.test.ts` | 5 (one per route) | ~18 | Zone list aggregation, zone detail + cache, prospects filters, programs static, calendar dynamic dates |
| `film-bookmarks.test.ts` | 2 (GET/POST) | ~10 | Auth, role=coach/recruiter, highlight validation, duplicate 409 |
| `admin-analytics.test.ts` | 1 | ~6 | Auth, role distribution, profile completeness, KPIs |
| `mcp-cache.test.ts` | 1 | ~6 | Set/get, TTL expiry, cache miss, custom TTL |
| `zone-data.test.ts` | 2 | ~8 | DB↔UI mapping, placeholder image, zone metadata completeness |
| `auth-flow.test.ts` | 2 (login/signup) | ~8 | Valid credentials, invalid email, missing fields, redirect on success |

**Total: ~116 tests** across 13 files.

---

## Tasks (Execution Order)

### Phase A: Infrastructure (Builder 1, blocks all others)

1. **T1:** Create `route-test-utils.ts` — mock configurator, request builder, auth helpers
2. **T2:** Create `mcp-cache.test.ts` — set/get, TTL expiry, custom TTL
3. **T3:** Create `zone-data.test.ts` — DB↔UI mappings, placeholder image, metadata completeness

### Phase B: Route Tests (Builders 2-4, parallel after Phase A)

**Builder 2:**
4. **T4:** Create `athletes.test.ts` — filters, pagination, Zod validation, 404
5. **T5:** Create `athlete-dashboard.test.ts` — auth, profile+stats, calendar events
6. **T6:** Create `coach-dashboard.test.ts` — auth, coach role, roster/tasks
7. **T7:** Create `parent-dashboard.test.ts` — auth, parent link, child profile

**Builder 3:**
8. **T8:** Create `shortlists.test.ts` — GET/POST/DELETE, auth, role, duplicate 409
9. **T9:** Create `messages.test.ts` — GET/POST/PATCH, auth, folder, recipient
10. **T10:** Create `film-bookmarks.test.ts` — auth, role, highlight validation
11. **T11:** Create `admin-analytics.test.ts` — auth, aggregation queries

**Builder 4:**
12. **T12:** Create `mcp-routes.test.ts` — zones, zone detail, prospects, programs, calendar
13. **T13:** Create `auth-flow.test.ts` — login/signup/logout server actions

### Phase C: Validation

14. **T14:** Validator runs `vitest run --coverage`, reports results
15. **T15:** Fixer addresses any failures (if needed)

---

## Validation Criteria

1. `npx vitest run` — all tests pass (0 failures)
2. `npx vitest run --coverage` — ≥70% lines/branches/functions/statements
3. `tsc --noEmit` — 0 type errors (test files included)
4. Individual test files run in isolation

---

## Coverage Estimate

| Source | Lines (est.) | Coverage Impact |
|--------|-------------|----------------|
| Existing 3 test files | ~860 | ~15% baseline |
| 13 new test files (~116 tests) | ~2,500-3,000 | +50-55% |
| **Projected total** | | **~65-70%** |
