# Example: Complete Frontend Specification

This is a complete example of a frontend specification for a "Task Manager" application. Use this as a reference when generating specifications.

---

```markdown
# Frontend Specification: TaskFlow

**Version:** 1.0.0
**Generated:** 2024-01-15
**API Base URL:** https://api.taskflow.app/v1

---

## Table of Contents

1. [Project Summary](#1-project-summary)
2. [Authentication](#2-authentication)
3. [Data Types](#3-data-types)
4. [API Endpoints](#4-api-endpoints)
5. [Screen Requirements](#5-screen-requirements)
6. [Form Specifications](#6-form-specifications)
7. [State Enumeration](#7-state-enumeration)
8. [Error Handling](#8-error-handling)
9. [Design System](#9-design-system)

---

## 1. Project Summary

| Field | Value |
|-------|-------|
| Name | TaskFlow |
| Version | 1.0.0 |
| API Base URL | https://api.taskflow.app/v1 |
| Authentication | JWT Bearer Token |
| Primary Framework | Any (React/Vue/Svelte) |

### Overview

TaskFlow is a collaborative task management application for small teams. Users can create projects, add tasks with due dates, assign team members, and track progress through customizable workflows.

### Tech Stack Recommendations

| Layer | Recommendation | Notes |
|-------|----------------|-------|
| Framework | React 18+ or Vue 3+ | Component-based architecture |
| State | Zustand or Pinia | Simple state needs |
| HTTP Client | fetch with wrapper | See error handling section |
| Forms | React Hook Form or VeeValidate | Schema-based validation |
| Date Handling | date-fns | Lightweight date formatting |

---

## 2. Authentication

### Auth Method: JWT Bearer Token

TaskFlow uses JWT tokens for authentication. Tokens expire after 1 hour and can be refreshed using a refresh token.

### Getting a Token

```bash
curl -X POST https://api.taskflow.app/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securepassword"}'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "expires_in": 3600,
  "token_type": "Bearer",
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "full_name": "Jane Doe",
    "avatar_url": "https://cdn.taskflow.app/avatars/abc123.jpg"
  }
}
```

### Using the Token

Include in all authenticated requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Refresh

When you receive a 401 with code `AUTH_EXPIRED`, refresh the token:

```bash
curl -X POST https://api.taskflow.app/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."}'
```

### Logout

```bash
curl -X POST https://api.taskflow.app/v1/auth/logout \
  -H "Authorization: Bearer {access_token}"
```

This invalidates both access and refresh tokens.

### Auth Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │────>│  Get Token  │────>│  Store in   │
│   Screen    │     │  from API   │     │  Memory     │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               v
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Logout    │<────│  Clear      │<────│  Use Token  │
│             │     │  Storage    │     │  in Requests│
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## 3. Data Types

Copy these TypeScript interfaces to your `types/api.ts` file.

### Core Types

```typescript
// User & Authentication
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

// Team
export interface Team {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
}

export interface TeamMember {
  user_id: string;
  team_id: string;
  role: UserRole;
  user: User;
  joined_at: string;
}
```

### Domain Types

```typescript
// Project
export interface Project {
  id: string;
  team_id: string;
  name: string;
  description: string | null;
  color: string;
  status: ProjectStatus;
  task_count: number;
  completed_count: number;
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = 'active' | 'archived';

// Task
export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  assignee: User | null;
  due_date: string | null;
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// Comment
export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  user: User;
  content: string;
  created_at: string;
  updated_at: string;
}
```

### Request/Response Types

```typescript
// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

// API Error
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// Project Requests
export interface CreateProjectRequest {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  color?: string;
  status?: ProjectStatus;
}

// Task Requests
export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string;
  due_date?: string;
  tags?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string | null;
  due_date?: string | null;
  tags?: string[];
}

// Stats
export interface DashboardStats {
  total_tasks: number;
  completed_today: number;
  overdue_count: number;
  in_progress_count: number;
}
```

---

## 4. API Endpoints

### Authentication

#### POST /auth/login

**Description:** Authenticate user with email and password

**Request:**
```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

**Response:** `200 OK`
```typescript
interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: "Bearer";
  user: User;
}
```

**Errors:**
| Code | Message | Action |
|------|---------|--------|
| 401 | Invalid credentials | Show error, allow retry |
| 429 | Too many attempts | Show lockout message (retry after header) |

---

#### POST /auth/register

**Description:** Create a new user account

**Request:**
```typescript
interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}
```

**Response:** `201 Created`
```typescript
interface RegisterResponse {
  user: User;
  message: "Check your email to verify your account";
}
```

**Errors:**
| Code | Message | Action |
|------|---------|--------|
| 400 | Validation failed | Show field errors |
| 409 | Email already exists | Suggest login |

---

### Projects

#### GET /projects

**Description:** List all projects for the current team

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| per_page | number | 20 | Items per page (max 100) |
| status | string | - | Filter: active, archived |
| search | string | - | Search by name |

**Response:** `200 OK`
```typescript
PaginatedResponse<Project>
```

---

#### GET /projects/{id}

**Description:** Get single project by ID

**Response:** `200 OK`
```typescript
Project
```

**Errors:**
| Code | Message | Action |
|------|---------|--------|
| 404 | Project not found | Navigate to projects list |
| 403 | Access denied | Show permission error |

---

#### POST /projects

**Description:** Create a new project

**Request:**
```typescript
CreateProjectRequest
```

**Response:** `201 Created`
```typescript
Project
```

**Errors:**
| Code | Message | Action |
|------|---------|--------|
| 400 | Validation failed | Show field errors |
| 402 | Project limit reached | Show upgrade prompt |

---

#### PUT /projects/{id}

**Description:** Update an existing project

**Request:**
```typescript
UpdateProjectRequest
```

**Response:** `200 OK`
```typescript
Project
```

---

#### DELETE /projects/{id}

**Description:** Delete a project (moves to trash for 30 days)

**Response:** `204 No Content`

---

### Tasks

#### GET /projects/{project_id}/tasks

**Description:** List all tasks in a project

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| per_page | number | 50 | Items per page |
| status | string | - | Filter by status |
| priority | string | - | Filter by priority |
| assignee_id | string | - | Filter by assignee |
| search | string | - | Search in title/description |

**Response:** `200 OK`
```typescript
PaginatedResponse<Task>
```

---

#### POST /projects/{project_id}/tasks

**Description:** Create a new task

**Request:**
```typescript
CreateTaskRequest
```

**Response:** `201 Created`
```typescript
Task
```

---

#### PUT /tasks/{id}

**Description:** Update a task

**Request:**
```typescript
UpdateTaskRequest
```

**Response:** `200 OK`
```typescript
Task
```

---

#### DELETE /tasks/{id}

**Description:** Delete a task permanently

**Response:** `204 No Content`

---

#### PATCH /tasks/{id}/status

**Description:** Quick status update (for drag-and-drop)

**Request:**
```typescript
{ status: TaskStatus }
```

**Response:** `200 OK`
```typescript
Task
```

---

### Dashboard

#### GET /dashboard/stats

**Description:** Get dashboard statistics for current user

**Response:** `200 OK`
```typescript
DashboardStats
```

---

#### GET /dashboard/my-tasks

**Description:** Get tasks assigned to current user

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| limit | number | 10 | Max items |
| status | string | - | Filter by status |

**Response:** `200 OK`
```typescript
Task[]
```

---

## 5. Screen Requirements

### Screen: Dashboard

**Route:** `/dashboard`
**Auth Required:** Yes

#### Data Requirements

| Data | Endpoint | Type | Refresh |
|------|----------|------|---------|
| Stats | GET /dashboard/stats | DashboardStats | On mount, every 60s |
| My Tasks | GET /dashboard/my-tasks?limit=5 | Task[] | On mount |
| Projects | GET /projects?per_page=5 | Project[] | On mount |

#### Interactive Elements

| Element | Trigger | Action | Endpoint | Payload |
|---------|---------|--------|----------|---------|
| Task checkbox | Click | Toggle complete | PATCH /tasks/{id}/status | { status: 'done' } |
| Task row | Click | Navigate to task | - | - |
| Project card | Click | Navigate to project | - | - |
| "New Task" button | Click | Open quick-add modal | - | - |
| Quick-add submit | Form submit | Create task | POST /projects/{id}/tasks | CreateTaskRequest |
| "View All" link | Click | Navigate to tasks list | - | - |

#### Required States

| State | Trigger | Visual |
|-------|---------|--------|
| Loading | Initial fetch | 4 skeleton stat cards, skeleton task list |
| Empty (no tasks) | 0 assigned tasks | "No tasks assigned" with CTA |
| Empty (no projects) | 0 projects | "Create your first project" with CTA |
| Error | API failure | Error banner with retry button |
| Loaded | Data returned | Stats grid, task list, project cards |

---

### Screen: Projects List

**Route:** `/projects`
**Auth Required:** Yes

#### Data Requirements

| Data | Endpoint | Type | Refresh |
|------|----------|------|---------|
| Projects | GET /projects | PaginatedResponse<Project> | On mount |

#### Interactive Elements

| Element | Trigger | Action | Endpoint | Payload |
|---------|---------|--------|----------|---------|
| "New Project" button | Click | Open create modal | - | - |
| Create modal submit | Form submit | Create project | POST /projects | CreateProjectRequest |
| Project card | Click | Navigate to project | - | - |
| Archive icon | Click | Archive project | PUT /projects/{id} | { status: 'archived' } |
| Delete icon | Click | Open confirm dialog | - | - |
| Confirm delete | Click | Delete project | DELETE /projects/{id} | - |
| Search input | Change (300ms debounce) | Filter list | GET /projects?search= | - |
| Status tabs | Click | Filter by status | GET /projects?status= | - |
| Pagination | Click | Load page | GET /projects?page= | - |

#### Required States

| State | Trigger | Visual |
|-------|---------|--------|
| Loading | Initial fetch | Grid of 6 skeleton cards |
| Empty | 0 projects | Illustration + "Create your first project" |
| Empty (filtered) | 0 results | "No projects match your search" |
| Error | API failure | Error banner + retry |
| Loaded | Data returned | Project card grid |

---

### Screen: Project Detail / Task Board

**Route:** `/projects/{id}`
**Auth Required:** Yes

#### Data Requirements

| Data | Endpoint | Type | Refresh |
|------|----------|------|---------|
| Project | GET /projects/{id} | Project | On mount |
| Tasks | GET /projects/{id}/tasks | PaginatedResponse<Task> | On mount, after mutations |
| Team Members | GET /teams/{team_id}/members | TeamMember[] | On mount |

#### Interactive Elements

| Element | Trigger | Action | Endpoint | Payload |
|---------|---------|--------|----------|---------|
| "Add Task" button | Click | Open create modal | - | - |
| Task modal submit | Form submit | Create task | POST /projects/{id}/tasks | CreateTaskRequest |
| Task card | Click | Open task detail panel | - | - |
| Task drag | Drag end | Update status | PATCH /tasks/{id}/status | { status } |
| Edit project | Click | Open edit modal | - | - |
| Edit modal submit | Form submit | Update project | PUT /projects/{id} | UpdateProjectRequest |
| Filter by assignee | Select change | Filter tasks | Client-side | - |
| Filter by priority | Select change | Filter tasks | Client-side | - |
| Search tasks | Input change | Filter tasks | Client-side | - |

#### Required States

| State | Trigger | Visual |
|-------|---------|--------|
| Loading | Initial fetch | Skeleton board columns |
| Not found | 404 response | "Project not found" illustration |
| Empty (no tasks) | 0 tasks | Empty columns + "Add your first task" |
| Loaded | Data returned | Kanban board with tasks |
| Dragging | Drag start | Drag preview, drop zones highlighted |

---

### Screen: Task Detail Panel

**Route:** `/projects/{project_id}/tasks/{task_id}` (or slide-over panel)
**Auth Required:** Yes

#### Data Requirements

| Data | Endpoint | Type | Refresh |
|------|----------|------|---------|
| Task | GET /tasks/{id} | Task | On mount |
| Comments | GET /tasks/{id}/comments | Comment[] | On mount, after add |

#### Interactive Elements

| Element | Trigger | Action | Endpoint | Payload |
|---------|---------|--------|----------|---------|
| Title | Blur | Update title | PUT /tasks/{id} | { title } |
| Description | Blur | Update description | PUT /tasks/{id} | { description } |
| Status dropdown | Change | Update status | PATCH /tasks/{id}/status | { status } |
| Priority dropdown | Change | Update priority | PUT /tasks/{id} | { priority } |
| Assignee dropdown | Change | Update assignee | PUT /tasks/{id} | { assignee_id } |
| Due date picker | Change | Update due date | PUT /tasks/{id} | { due_date } |
| Add comment | Form submit | Create comment | POST /tasks/{id}/comments | { content } |
| Delete task | Click | Confirm + delete | DELETE /tasks/{id} | - |
| Close panel | Click X / Escape | Close panel | - | - |

#### Required States

| State | Trigger | Visual |
|-------|---------|--------|
| Loading | Initial fetch | Skeleton form fields |
| Not found | 404 response | "Task not found" |
| Loaded | Data returned | Editable task form |
| Saving | Field blur | Subtle saving indicator |
| Save error | API error | Inline error, revert field |

---

### Screen: Settings

**Route:** `/settings`
**Auth Required:** Yes

#### Data Requirements

| Data | Endpoint | Type | Refresh |
|------|----------|------|---------|
| User profile | GET /users/me | User | On mount |
| Team | GET /teams/current | Team | On mount |

#### Interactive Elements

| Element | Trigger | Action | Endpoint | Payload |
|---------|---------|--------|----------|---------|
| Profile form submit | Form submit | Update profile | PUT /users/me | { full_name, avatar_url } |
| Avatar upload | File select | Upload avatar | POST /users/me/avatar | FormData |
| Change password | Form submit | Update password | PUT /users/me/password | { current, new } |
| Email notifications toggle | Change | Update setting | PUT /users/me/settings | { email_notifications } |
| Delete account | Click | Confirm + delete | DELETE /users/me | - |

#### Required States

| State | Trigger | Visual |
|-------|---------|--------|
| Loading | Initial fetch | Skeleton form |
| Loaded | Data returned | Populated forms |
| Saving | Form submit | Button loading state |
| Saved | Success | Success toast |
| Error | API error | Inline field errors |

---

## 6. Form Specifications

### Form: Create Project

**Location:** Projects list modal
**Submit Endpoint:** POST /projects

#### Fields

| Field | Name | Type | Required | Validation | Default |
|-------|------|------|----------|------------|---------|
| Name | name | text | Yes | 2-100 chars | - |
| Description | description | textarea | No | Max 500 chars | - |
| Color | color | color picker | No | Valid hex | #3B82F6 |

#### Validation Rules

```typescript
const createProjectSchema = {
  name: {
    required: "Project name is required",
    minLength: { value: 2, message: "Name must be at least 2 characters" },
    maxLength: { value: 100, message: "Name cannot exceed 100 characters" }
  },
  description: {
    maxLength: { value: 500, message: "Description cannot exceed 500 characters" }
  },
  color: {
    pattern: { value: /^#[0-9A-Fa-f]{6}$/, message: "Invalid color format" }
  }
};
```

#### Submit Behavior

**On Success:**
- Close modal
- Show toast: "Project created"
- Navigate to new project

**On Error:**
- Display field-level errors inline
- Keep modal open

---

### Form: Create Task

**Location:** Project detail modal
**Submit Endpoint:** POST /projects/{project_id}/tasks

#### Fields

| Field | Name | Type | Required | Validation | Default |
|-------|------|------|----------|------------|---------|
| Title | title | text | Yes | 3-200 chars | - |
| Description | description | textarea | No | Max 2000 chars | - |
| Status | status | select | No | Valid status | todo |
| Priority | priority | select | No | Valid priority | medium |
| Assignee | assignee_id | select | No | Valid user ID | null |
| Due Date | due_date | date | No | Not in past | null |
| Tags | tags | multi-input | No | Max 10, each max 30 chars | [] |

#### Validation Rules

```typescript
const createTaskSchema = {
  title: {
    required: "Title is required",
    minLength: { value: 3, message: "Title must be at least 3 characters" },
    maxLength: { value: 200, message: "Title cannot exceed 200 characters" }
  },
  description: {
    maxLength: { value: 2000, message: "Description cannot exceed 2000 characters" }
  },
  due_date: {
    validate: (value: string | null) => {
      if (!value) return true;
      return new Date(value) >= new Date() || "Due date cannot be in the past";
    }
  },
  tags: {
    validate: (value: string[]) => {
      if (value.length > 10) return "Maximum 10 tags allowed";
      if (value.some(t => t.length > 30)) return "Each tag must be 30 characters or less";
      return true;
    }
  }
};
```

#### Submit Behavior

**On Success:**
- Close modal
- Show toast: "Task created"
- Add task to board (optimistic or refetch)

**On Error:**
- Display field-level errors inline
- Keep modal open

---

### Form: Login

**Location:** /login page
**Submit Endpoint:** POST /auth/login

#### Fields

| Field | Name | Type | Required | Validation | Default |
|-------|------|------|----------|------------|---------|
| Email | email | email | Yes | Valid email | - |
| Password | password | password | Yes | Min 8 chars | - |
| Remember | remember | checkbox | No | - | false |

#### Validation Rules

```typescript
const loginSchema = {
  email: {
    required: "Email is required",
    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address" }
  },
  password: {
    required: "Password is required",
    minLength: { value: 8, message: "Password must be at least 8 characters" }
  }
};
```

#### Submit Behavior

**On Success:**
- Store tokens (memory for access, secure cookie for refresh)
- Redirect to /dashboard

**On Error:**
- Show "Invalid email or password" (don't reveal which)
- Clear password field
- Keep email field

---

## 7. State Enumeration

All possible UI states as TypeScript union types.

### Auth States

```typescript
export type AuthState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'authenticated'; user: User; token: string }
  | { status: 'unauthenticated' }
  | { status: 'error'; error: string };
```

### Projects List States

```typescript
export type ProjectsListState =
  | { status: 'loading' }
  | { status: 'error'; error: string; retry: () => void }
  | { status: 'empty' }
  | { status: 'empty_filtered'; query: string }
  | { status: 'loaded'; projects: Project[]; meta: PaginationMeta };
```

### Task Board States

```typescript
export type TaskBoardState =
  | { status: 'loading' }
  | { status: 'project_not_found' }
  | { status: 'error'; error: string; retry: () => void }
  | { status: 'empty' }
  | { status: 'loaded'; tasks: Task[] }
  | { status: 'dragging'; tasks: Task[]; draggedId: string; overId: string | null };
```

### Task Detail States

```typescript
export type TaskDetailState =
  | { status: 'loading' }
  | { status: 'not_found' }
  | { status: 'error'; error: string }
  | { status: 'loaded'; task: Task; comments: Comment[] }
  | { status: 'saving'; task: Task; field: string };
```

### Form States

```typescript
export type FormState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; errors: ValidationErrors };

export interface ValidationErrors {
  [field: string]: string | undefined;
}
```

### Modal States

```typescript
export type CreateProjectModalState =
  | { open: false }
  | { open: true; form: FormState };

export type CreateTaskModalState =
  | { open: false }
  | { open: true; projectId: string; form: FormState };

export type ConfirmDeleteModalState =
  | { open: false }
  | { open: true; itemType: 'project' | 'task'; itemId: string; itemName: string };
```

---

## 8. Error Handling

### Standard Error Shape

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}
```

### Error Codes Reference

| Code | HTTP | Meaning | User Action |
|------|------|---------|-------------|
| `AUTH_INVALID` | 401 | Wrong email/password | Re-enter credentials |
| `AUTH_EXPIRED` | 401 | Token expired | Auto-refresh silently |
| `AUTH_FORBIDDEN` | 403 | No permission | Show "Access denied" |
| `NOT_FOUND` | 404 | Resource missing | Navigate away |
| `VALIDATION_ERROR` | 400 | Invalid input | Show field errors |
| `CONFLICT` | 409 | Duplicate entry | Show specific message |
| `RATE_LIMITED` | 429 | Too many requests | Wait, then retry |
| `SERVER_ERROR` | 500 | Internal error | "Something went wrong" + retry |

### Error Handling Implementation

```typescript
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.json();
  }

  const error: ApiError = await response.json();

  switch (error.code) {
    case 'AUTH_EXPIRED':
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry original request
        throw new RetryableError();
      }
      redirectToLogin();
      throw error;

    case 'AUTH_INVALID':
    case 'AUTH_FORBIDDEN':
      throw error; // Let form handle

    case 'RATE_LIMITED':
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError(error.message, parseInt(retryAfter || '60'));

    default:
      throw error;
  }
}
```

### Retry Strategy

```typescript
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  retryableCodes: [408, 429, 500, 502, 503, 504],
};

async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  attempt = 0
): Promise<T> {
  try {
    const response = await fetch(url, options);
    return handleApiResponse<T>(response);
  } catch (error) {
    if (
      attempt < RETRY_CONFIG.maxRetries &&
      error instanceof RetryableError
    ) {
      const delay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(2, attempt),
        RETRY_CONFIG.maxDelay
      );
      await sleep(delay);
      return fetchWithRetry<T>(url, options, attempt + 1);
    }
    throw error;
  }
}
```

---

## 9. Design System

### Color Palette

```css
:root {
  /* Primary - Blue */
  --color-primary: #3B82F6;
  --color-primary-hover: #2563EB;
  --color-primary-foreground: #FFFFFF;

  /* Secondary - Slate */
  --color-secondary: #F1F5F9;
  --color-secondary-hover: #E2E8F0;
  --color-secondary-foreground: #1E293B;

  /* Neutral */
  --color-background: #FFFFFF;
  --color-foreground: #0F172A;
  --color-muted: #F8FAFC;
  --color-muted-foreground: #64748B;
  --color-border: #E2E8F0;

  /* Semantic */
  --color-success: #22C55E;
  --color-success-foreground: #FFFFFF;
  --color-warning: #F59E0B;
  --color-warning-foreground: #FFFFFF;
  --color-error: #EF4444;
  --color-error-foreground: #FFFFFF;
  --color-info: #3B82F6;
  --color-info-foreground: #FFFFFF;

  /* Surfaces */
  --color-card: #FFFFFF;
  --color-card-foreground: #0F172A;
  --color-popover: #FFFFFF;
  --color-popover-foreground: #0F172A;

  /* Task Status Colors */
  --color-status-todo: #94A3B8;
  --color-status-in-progress: #3B82F6;
  --color-status-review: #F59E0B;
  --color-status-done: #22C55E;

  /* Priority Colors */
  --color-priority-low: #94A3B8;
  --color-priority-medium: #3B82F6;
  --color-priority-high: #F59E0B;
  --color-priority-urgent: #EF4444;
}
```

### Typography

| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| H1 | Inter | 32px | 700 | 1.2 |
| H2 | Inter | 24px | 600 | 1.3 |
| H3 | Inter | 20px | 600 | 1.4 |
| H4 | Inter | 16px | 600 | 1.5 |
| Body | Inter | 14px | 400 | 1.6 |
| Small | Inter | 12px | 400 | 1.5 |
| Caption | Inter | 11px | 500 | 1.4 |

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, tight inline |
| sm | 8px | Inline spacing, small gaps |
| md | 16px | Default component spacing |
| lg | 24px | Section spacing |
| xl | 32px | Large section gaps |
| 2xl | 48px | Page-level spacing |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | 4px | Badges, small elements |
| md | 8px | Buttons, inputs, cards |
| lg | 12px | Modals, large cards |
| full | 9999px | Avatars, pills |

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| sm | 0 1px 2px rgba(0,0,0,0.05) | Subtle hover |
| md | 0 4px 6px -1px rgba(0,0,0,0.1) | Cards, dropdowns |
| lg | 0 10px 15px -3px rgba(0,0,0,0.1) | Modals |
| xl | 0 20px 25px -5px rgba(0,0,0,0.1) | Toasts, large overlays |

### Component Specifications

#### Buttons

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| Primary | var(--color-primary) | white | none |
| Secondary | var(--color-secondary) | var(--color-secondary-foreground) | none |
| Outline | transparent | var(--color-foreground) | 1px var(--color-border) |
| Ghost | transparent | var(--color-foreground) | none |
| Destructive | var(--color-error) | white | none |

**Sizes:**
| Size | Height | Padding | Font Size | Border Radius |
|------|--------|---------|-----------|---------------|
| sm | 32px | 0 12px | 12px | 6px |
| md | 40px | 0 16px | 14px | 8px |
| lg | 48px | 0 24px | 16px | 8px |

#### Inputs

| State | Border | Background |
|-------|--------|------------|
| Default | var(--color-border) | var(--color-background) |
| Focus | var(--color-primary) | var(--color-background) |
| Error | var(--color-error) | var(--color-background) |
| Disabled | var(--color-border) | var(--color-muted) |

**Dimensions:** Height 40px, padding 0 12px, border-radius 8px

#### Cards

```css
.card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.card:hover {
  box-shadow: var(--shadow-md);
}
```

#### Task Card (Kanban)

```css
.task-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 12px;
  cursor: grab;
}

.task-card:hover {
  border-color: var(--color-primary);
}

.task-card.dragging {
  opacity: 0.5;
  cursor: grabbing;
}
```

### Responsive Breakpoints

| Name | Min Width | Target |
|------|-----------|--------|
| sm | 640px | Large phones |
| md | 768px | Tablets |
| lg | 1024px | Laptops |
| xl | 1280px | Desktops |
| 2xl | 1536px | Large screens |

---

## Appendix: Quick Reference

### HTTP Methods

| Method | Purpose | Has Body |
|--------|---------|----------|
| GET | Retrieve | No |
| POST | Create | Yes |
| PUT | Full update | Yes |
| PATCH | Partial update | Yes |
| DELETE | Remove | No |

### Date Format

All dates are ISO 8601: `2024-01-15T09:30:00.000Z`

Display formats:
| Context | Example |
|---------|---------|
| Full | January 15, 2024 at 9:30 AM |
| Date | Jan 15, 2024 |
| Relative | 2 hours ago |
| Due date | Jan 15 (if this year) |
| Due date | Jan 15, 2025 (if different year) |

### File Uploads

| Type | Max Size | Formats |
|------|----------|---------|
| Avatar | 2MB | jpg, png, webp |

Upload via `POST /users/me/avatar` with `Content-Type: multipart/form-data`
```
