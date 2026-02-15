import { describe, it, expect, beforeEach } from 'vitest';
import {
  configureMockSupabase,
  createMockRequest,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { coachDavis } from '../fixtures/users';

import { PATCH } from '@/app/api/coach/tasks/[taskId]/route';

const BASE = 'http://localhost:3000/api/coach/tasks';

// Helper to create the params object for Next.js 15 route handlers
function makeParams(taskId: string) {
  return { params: Promise.resolve({ taskId }) };
}

const mockProfile = {
  id: coachDavis.id,
  full_name: 'James Davis',
  avatar_url: null,
};

const mockCoach = {
  id: 'coach-db-001',
  school_name: 'Allen High School',
  division: 'FBS',
  conference: 'Big 12',
  title: 'Head Coach',
};

const mockUpdatedTask = {
  id: 'task-1',
  title: 'Upload highlight reels',
  description: 'Senior highlight reels for recruiting',
  due_date: '2026-03-01',
  priority: 'high',
  status: 'completed',
  athlete_id: null,
  coach_id: 'coach-db-001',
  created_at: '2026-02-10T10:00:00Z',
  updated_at: '2026-02-15T12:00:00Z',
};

// ===========================================================================
// PATCH /api/coach/tasks/[taskId]
// ===========================================================================
describe('PATCH /api/coach/tasks/[taskId]', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const request = createMockRequest(`${BASE}/task-1`, {
      method: 'PATCH',
      body: { status: 'completed' },
    });

    const response = await PATCH(request as any, makeParams('task-1'));
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 400 on invalid status value', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      coaches: { data: mockCoach, error: null },
    });

    const request = createMockRequest(`${BASE}/task-1`, {
      method: 'PATCH',
      body: { status: 'invalid_status' },
    });

    const response = await PATCH(request as any, makeParams('task-1'));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid request body');
  });

  it('returns 400 when status is missing', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      coaches: { data: mockCoach, error: null },
    });

    const request = createMockRequest(`${BASE}/task-1`, {
      method: 'PATCH',
      body: {},
    });

    const response = await PATCH(request as any, makeParams('task-1'));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid request body');
  });

  it('returns 404 when profile not found', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: null, error: null },
    });

    const request = createMockRequest(`${BASE}/task-1`, {
      method: 'PATCH',
      body: { status: 'completed' },
    });

    const response = await PATCH(request as any, makeParams('task-1'));
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Profile not found');
  });

  it('returns 404 when coach profile not found', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      coaches: { data: null, error: null },
    });

    const request = createMockRequest(`${BASE}/task-1`, {
      method: 'PATCH',
      body: { status: 'completed' },
    });

    const response = await PATCH(request as any, makeParams('task-1'));
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Coach profile not found');
  });

  it('returns 404 when task not found or not owned by coach', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      coaches: { data: mockCoach, error: null },
      coach_tasks: { data: null, error: { message: 'No rows returned', code: 'PGRST116' } },
    });

    const request = createMockRequest(`${BASE}/task-nonexistent`, {
      method: 'PATCH',
      body: { status: 'completed' },
    });

    const response = await PATCH(request as any, makeParams('task-nonexistent'));
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Task not found');
  });

  it('returns 200 with updated task on success', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      coaches: { data: mockCoach, error: null },
      coach_tasks: { data: mockUpdatedTask, error: null },
    });

    const request = createMockRequest(`${BASE}/task-1`, {
      method: 'PATCH',
      body: { status: 'completed' },
    });

    const response = await PATCH(request as any, makeParams('task-1'));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.task).toBeDefined();
    expect(json.task.id).toBe('task-1');
    expect(json.task.title).toBe('Upload highlight reels');
    expect(json.task.status).toBe('completed');
    expect(json.task.priority).toBe('high');
    expect(json.task.dueDate).toBe('2026-03-01');
  });

  it('accepts all valid status values', async () => {
    mockAuthenticated(coachDavis);

    for (const status of ['pending', 'in_progress', 'completed']) {
      configureMockSupabase({
        profiles: { data: mockProfile, error: null },
        coaches: { data: mockCoach, error: null },
        coach_tasks: { data: { ...mockUpdatedTask, status }, error: null },
      });

      const request = createMockRequest(`${BASE}/task-1`, {
        method: 'PATCH',
        body: { status },
      });

      const response = await PATCH(request as any, makeParams('task-1'));
      expect(response.status).toBe(200);
    }
  });
});
