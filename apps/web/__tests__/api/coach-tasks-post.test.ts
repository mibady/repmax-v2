import { describe, it, expect, beforeEach } from 'vitest';
import {
  configureMockSupabase,
  createMockRequest,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { coachDavis } from '../fixtures/users';

import { POST } from '@/app/api/coach/tasks/route';

const BASE = 'http://localhost:3000/api/coach/tasks';

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

const mockCreatedTask = {
  id: 'new-task-1',
  title: 'Review game film',
  description: null,
  due_date: null,
  priority: 'medium',
  status: 'pending',
  athlete_id: null,
  coach_id: 'coach-db-001',
  created_at: '2026-02-18T10:00:00Z',
};

// ===========================================================================
// POST /api/coach/tasks
// ===========================================================================
describe('POST /api/coach/tasks', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockUnauthenticated();
    const request = createMockRequest(BASE, {
      method: 'POST',
      body: { title: 'Review game film' },
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 400 with invalid body (missing title)', async () => {
    mockAuthenticated(coachDavis);
    const request = createMockRequest(BASE, {
      method: 'POST',
      body: { priority: 'high' },
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid request body');
  });

  it('returns 400 with empty title', async () => {
    mockAuthenticated(coachDavis);
    const request = createMockRequest(BASE, {
      method: 'POST',
      body: { title: '' },
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid request body');
  });

  it('returns 404 when profile not found', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: null, error: null },
    });

    const request = createMockRequest(BASE, {
      method: 'POST',
      body: { title: 'Review game film' },
    });

    const response = await POST(request as any);
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

    const request = createMockRequest(BASE, {
      method: 'POST',
      body: { title: 'Review game film' },
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Coach profile not found');
  });

  it('returns 500 on database insert error', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      coaches: { data: mockCoach, error: null },
      coach_tasks: { data: null, error: { message: 'Database error', code: '23505' } },
    });

    const request = createMockRequest(BASE, {
      method: 'POST',
      body: { title: 'Review game film' },
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Database error');
  });

  it('returns 201 with created task on success', async () => {
    mockAuthenticated(coachDavis);
    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      coaches: { data: mockCoach, error: null },
      coach_tasks: { data: mockCreatedTask, error: null },
    });

    const request = createMockRequest(BASE, {
      method: 'POST',
      body: { title: 'Review game film' },
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.task).toBeDefined();
    expect(json.task.id).toBe('new-task-1');
    expect(json.task.title).toBe('Review game film');
    expect(json.task.status).toBe('pending');
    expect(json.task.priority).toBe('medium');
    expect(json.task.description).toBeNull();
    expect(json.task.dueDate).toBeNull();
    expect(json.task.athleteId).toBeNull();
    expect(json.task.createdAt).toBe('2026-02-18T10:00:00Z');
  });

  it('accepts all valid priority values', async () => {
    mockAuthenticated(coachDavis);

    for (const priority of ['high', 'medium', 'low']) {
      configureMockSupabase({
        profiles: { data: mockProfile, error: null },
        coaches: { data: mockCoach, error: null },
        coach_tasks: { data: { ...mockCreatedTask, priority }, error: null },
      });

      const request = createMockRequest(BASE, {
        method: 'POST',
        body: { title: 'Review game film', priority },
      });

      const response = await POST(request as any);
      expect(response.status).toBe(201);
    }
  });

  it('creates task with optional fields (description, due_date, athlete_id)', async () => {
    mockAuthenticated(coachDavis);

    const athleteUuid = '550e8400-e29b-41d4-a716-446655440000';
    const taskWithOptionals = {
      ...mockCreatedTask,
      description: 'Watch the 4th quarter plays',
      due_date: '2026-03-01',
      athlete_id: athleteUuid,
    };

    configureMockSupabase({
      profiles: { data: mockProfile, error: null },
      coaches: { data: mockCoach, error: null },
      coach_tasks: { data: taskWithOptionals, error: null },
    });

    const request = createMockRequest(BASE, {
      method: 'POST',
      body: {
        title: 'Review game film',
        description: 'Watch the 4th quarter plays',
        due_date: '2026-03-01',
        priority: 'high',
        athlete_id: athleteUuid,
      },
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.task.description).toBe('Watch the 4th quarter plays');
    expect(json.task.dueDate).toBe('2026-03-01');
    expect(json.task.athleteId).toBe(athleteUuid);
  });
});
