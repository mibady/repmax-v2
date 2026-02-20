# Coach Dashboard Backend — Implementation Spec

## Overview

Complete the coach dashboard backend so the API returns all data the frontend expects. The page (`coach/page.tsx`) and hook (`use-coach-dashboard.ts`) are already fully built and typed — they just need the API to return the right shape.

## Layers

- [x] Database: Yes — new `coach_tasks` table
- [x] Backend: Yes — expand dashboard route + new tasks PATCH endpoint
- [ ] Frontend: No changes needed (page + hook already correct)
- [ ] AI: No

## Current State

| Component | Status | What Works | What's Missing |
|-----------|--------|------------|----------------|
| Page (`coach/page.tsx`) | Done | Roster table, filters, bulk actions, tasks widget, activity widget, metrics | Nothing — waits for API |
| Hook (`use-coach-dashboard.ts`) | Done | Fetch, state mgmt, `updateTask()` | Nothing — defaults to `[]` gracefully |
| API Route (`api/coach/dashboard`) | Partial | Auth, coach profile, roster from shortlists, messages as activity | `tasks` array, `status` field on roster, correct metrics |
| Tasks endpoint | Missing | — | `PATCH /api/coach/tasks/[taskId]` |
| Database | Partial | profiles, coaches, athletes, shortlists, messages, offers | `coach_tasks` table |
| Tests | Partial | 6 tests passing for current route shape | Tests for new fields + tasks endpoint |

## Contract

### Dashboard API Response (target shape)

```typescript
// GET /api/coach/dashboard
{
  coach: {
    name: string;
    school: string;
    division: string;
    conference: string;
    title: string;
    avatarUrl: string | null;
  };
  roster: Array<{
    id: string;
    name: string;
    position: string;
    classYear: number;
    gpa: number | null;
    offers: number;
    status: "active" | "committed" | "transferred" | "graduated";
    avatarUrl: string | null;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    dueDate: string | null;
    priority: "high" | "medium" | "low";
    status: "pending" | "in_progress" | "completed";
    athleteId: string | null;
    athleteName: string | null;
    createdAt: string;
  }>;
  activity: Array<{
    id: string;
    type: string;
    description: string;
    athleteName: string;
    timestamp: string;
  }>;
  metrics: {
    totalAthletes: number;
    activeAthletes: number;
    committedAthletes: number;
    pendingTasks: number;
    totalOffers: number;
  };
}
```

### Tasks PATCH Endpoint

```typescript
// PATCH /api/coach/tasks/[taskId]
// Body: { status: "pending" | "in_progress" | "completed" }
// Returns: { task: CoachTask }
```

## Files to Create/Modify

| # | File | Action | Owner |
|---|------|--------|-------|
| 1 | `supabase/migrations/005_coach_tasks.sql` | **Create** | Backend |
| 2 | `apps/web/app/api/coach/dashboard/route.ts` | **Modify** | Backend |
| 3 | `apps/web/app/api/coach/tasks/[taskId]/route.ts` | **Create** | Backend |
| 4 | `apps/web/__tests__/api/coach-dashboard.test.ts` | **Modify** | Backend |
| 5 | `apps/web/__tests__/api/coach-tasks.test.ts` | **Create** | Backend |

## Implementation Order

### Step 1: Database Migration — `coach_tasks` table

Create `supabase/migrations/005_coach_tasks.sql`:

```sql
CREATE TABLE coach_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES athletes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE coach_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage own tasks"
  ON coach_tasks FOR ALL
  USING (coach_id IN (
    SELECT c.id FROM coaches c
    JOIN profiles p ON p.id = c.profile_id
    WHERE p.user_id = auth.uid()
  ));

-- Index for coach lookups
CREATE INDEX idx_coach_tasks_coach_id ON coach_tasks(coach_id);
```

### Step 2: Expand Dashboard API Route

Modify `apps/web/app/api/coach/dashboard/route.ts`:

1. **Add tasks query** — fetch from `coach_tasks` table, join athlete name via profiles
2. **Derive roster status** — query `offers` table for committed athletes; default others to `"active"`
3. **Fix metrics** — return `activeAthletes`, `committedAthletes`, `pendingTasks` instead of `highPriority`/`messagesUnread`
4. **Drop `priority`/`notes`/`addedAt`** from roster items (page doesn't use them); add `status` field

Key logic for status derivation:
- Query `offers` table: `SELECT DISTINCT athlete_id FROM offers WHERE committed = true`
- If athlete_id is in committed set → status = `"committed"`
- Otherwise → status = `"active"`
- ("transferred"/"graduated" deferred — no DB field exists yet)

### Step 3: Create Tasks PATCH Endpoint

Create `apps/web/app/api/coach/tasks/[taskId]/route.ts`:

- Auth check (same pattern as all routes)
- Verify task belongs to the coach (via coach_id)
- Update `status` and `updated_at`
- Return updated task
- Zod validation for request body

### Step 4: Update Dashboard Tests

Modify `apps/web/__tests__/api/coach-dashboard.test.ts`:

- Add `coach_tasks` to mock data
- Add `offers` to mock data (for committed status derivation)
- Update metric assertions to new shape (`activeAthletes`, `committedAthletes`, `pendingTasks`)
- Add test for tasks array in response
- Add test for roster status derivation (active vs committed)

### Step 5: Create Tasks Endpoint Tests

Create `apps/web/__tests__/api/coach-tasks.test.ts`:

- 401 when unauthenticated
- 400 on invalid body (bad status value)
- 404 when task not found or doesn't belong to coach
- 200 on successful status update
- Verify updated task is returned

## Acceptance Criteria

- [ ] `GET /api/coach/dashboard` returns `tasks` array from `coach_tasks` table
- [ ] `GET /api/coach/dashboard` roster items have `status` field (`active`|`committed`)
- [ ] `GET /api/coach/dashboard` metrics include `activeAthletes`, `committedAthletes`, `pendingTasks`
- [ ] `PATCH /api/coach/tasks/[taskId]` updates task status with auth + ownership check
- [ ] All existing tests still pass
- [ ] New tests cover expanded API shape
- [ ] Quality gates pass: `tsc`, `lint`, `vitest`, `build`
