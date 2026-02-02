# Frontend Specification Template

Use this template to generate `docs/FRONTEND-SPECIFICATION.md`.

---

```markdown
# Frontend Specification: {ProjectName}

**Version:** {version}
**Generated:** {date}
**API Base URL:** {baseUrl}

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
| Name | {projectName} |
| Version | {version} |
| API Base URL | {baseUrl} |
| Authentication | {authMethod} |
| Primary Framework | {framework} |

### Overview

{Brief 2-3 sentence description of what this application does and who it's for.}

### Tech Stack Recommendations

| Layer | Recommendation | Notes |
|-------|----------------|-------|
| Framework | {React/Vue/Svelte/etc.} | {Any constraints} |
| State | {Redux/Zustand/Pinia/etc.} | {Justification} |
| HTTP Client | {fetch/axios/etc.} | {Any wrappers needed} |
| Forms | {React Hook Form/Formik/etc.} | {Validation library} |

---

## 2. Authentication

### Auth Method: {JWT/Session/OAuth}

{Description of how authentication works.}

### Getting a Token

```bash
# Login
curl -X POST {baseUrl}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

**Response:**
```json
{
  "access_token": "eyJhbG...",
  "refresh_token": "dGhpc...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

### Using the Token

Include in all authenticated requests:

```
Authorization: Bearer {access_token}
```

### Token Refresh

```bash
curl -X POST {baseUrl}/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "dGhpc..."}'
```

### Logout

```bash
curl -X POST {baseUrl}/api/auth/logout \
  -H "Authorization: Bearer {access_token}"
```

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
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'member' | 'guest';

// Add more core types...
```

### Domain Types

```typescript
// {PrimaryEntity}
export interface {Entity} {
  id: string;
  user_id: string;
  {field1}: {type};
  {field2}: {type};
  status: {Entity}Status;
  created_at: string;
  updated_at: string;
}

export type {Entity}Status = 'draft' | 'active' | 'archived';

// {SecondaryEntity}
export interface {Entity2} {
  id: string;
  {entity}_id: string;
  {field1}: {type};
  created_at: string;
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

// Create Requests
export interface Create{Entity}Request {
  {field1}: {type};
  {field2}?: {type};
}

// Update Requests
export interface Update{Entity}Request {
  {field1}?: {type};
  {field2}?: {type};
}
```

---

## 4. API Endpoints

### Authentication

#### POST /api/auth/login

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
  user: User;
}
```

**Errors:**
| Code | Message | Action |
|------|---------|--------|
| 401 | Invalid credentials | Show error, allow retry |
| 429 | Too many attempts | Show lockout message with countdown |

---

#### POST /api/auth/register

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
  message: string; // "Check email to verify"
}
```

**Errors:**
| Code | Message | Action |
|------|---------|--------|
| 400 | Validation failed | Show field errors |
| 409 | Email already exists | Suggest login instead |

---

### {Entity} Endpoints

#### GET /api/{entities}

**Description:** List all {entities} for authenticated user

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| per_page | number | 20 | Items per page |
| status | string | - | Filter by status |
| search | string | - | Search by name |

**Response:** `200 OK`
```typescript
PaginatedResponse<{Entity}>
```

---

#### GET /api/{entities}/{id}

**Description:** Get single {entity} by ID

**Response:** `200 OK`
```typescript
{Entity}
```

**Errors:**
| Code | Message | Action |
|------|---------|--------|
| 404 | Not found | Navigate to list |
| 403 | Forbidden | Show access denied |

---

#### POST /api/{entities}

**Description:** Create a new {entity}

**Request:**
```typescript
Create{Entity}Request
```

**Response:** `201 Created`
```typescript
{Entity}
```

---

#### PUT /api/{entities}/{id}

**Description:** Update an existing {entity}

**Request:**
```typescript
Update{Entity}Request
```

**Response:** `200 OK`
```typescript
{Entity}
```

---

#### DELETE /api/{entities}/{id}

**Description:** Delete an {entity}

**Response:** `204 No Content`

---

## 5. Screen Requirements

### Screen: {ScreenName}

**Route:** `/{route}`
**Auth Required:** Yes/No

#### Data Requirements

| Data | Endpoint | Type | Refresh |
|------|----------|------|---------|
| {Data1} | GET /api/{endpoint} | {Type}[] | On mount |
| {Data2} | GET /api/{endpoint2} | {Type2} | On mount |
| {Stats} | GET /api/{stats} | {StatsType} | Every 30s |

#### Interactive Elements

| Element | Trigger | Action | Endpoint | Payload |
|---------|---------|--------|----------|---------|
| "Create" button | Click | Open modal | - | - |
| Modal submit | Form submit | Create {entity} | POST /api/{entities} | Create{Entity}Request |
| Row click | Click | Navigate to detail | - | - |
| Delete icon | Click | Show confirm dialog | - | - |
| Confirm delete | Click | Delete {entity} | DELETE /api/{entities}/{id} | - |
| Search input | Change (debounced) | Filter list | GET /api/{entities}?search= | - |
| Status filter | Change | Filter list | GET /api/{entities}?status= | - |
| Pagination | Click | Load page | GET /api/{entities}?page= | - |

#### Required States

| State | Trigger | Visual |
|-------|---------|--------|
| Loading | Initial fetch | Skeleton cards/rows |
| Empty | 0 items returned | Illustration + CTA |
| Error | API failure | Error banner + retry button |
| Loaded | Data returned | Populated list/grid |
| Refreshing | Background refresh | Subtle loading indicator |

---

### Screen: {ScreenName2}

**Route:** `/{route2}`
**Auth Required:** Yes

#### Data Requirements

| Data | Endpoint | Type | Refresh |
|------|----------|------|---------|
| {Entity} detail | GET /api/{entities}/{id} | {Entity} | On mount |
| Related items | GET /api/{entities}/{id}/related | Related[] | On mount |

#### Interactive Elements

| Element | Trigger | Action | Endpoint | Payload |
|---------|---------|--------|----------|---------|
| Edit button | Click | Enable edit mode | - | - |
| Save button | Click | Update {entity} | PUT /api/{entities}/{id} | Update{Entity}Request |
| Cancel button | Click | Discard changes | - | - |
| Delete button | Click | Show confirm | - | - |
| Back link | Click | Navigate to list | - | - |

#### Required States

| State | Trigger | Visual |
|-------|---------|--------|
| Loading | Initial fetch | Skeleton layout |
| Not found | 404 response | Not found illustration |
| View mode | Default | Read-only display |
| Edit mode | Edit clicked | Editable form fields |
| Saving | Form submitted | Disabled form + spinner |
| Save error | API error | Inline error message |

---

## 6. Form Specifications

### Form: {FormName}

**Location:** {ScreenName} modal/page
**Submit Endpoint:** POST /api/{endpoint}

#### Fields

| Field | Name | Type | Required | Validation | Default |
|-------|------|------|----------|------------|---------|
| Name | name | text | Yes | 3-100 chars | - |
| Description | description | textarea | No | Max 500 chars | - |
| Status | status | select | Yes | One of: draft, active | draft |
| Due Date | due_date | date | No | Future date | - |
| Tags | tags | multi-select | No | Max 5 | [] |

#### Validation Rules

```typescript
const {formName}Schema = {
  name: {
    required: "Name is required",
    minLength: { value: 3, message: "Name must be at least 3 characters" },
    maxLength: { value: 100, message: "Name cannot exceed 100 characters" }
  },
  description: {
    maxLength: { value: 500, message: "Description cannot exceed 500 characters" }
  },
  due_date: {
    validate: (value) => !value || new Date(value) > new Date() || "Due date must be in the future"
  },
  tags: {
    validate: (value) => value.length <= 5 || "Maximum 5 tags allowed"
  }
};
```

#### Submit Behavior

**On Success:**
- Close modal (if modal)
- Show success toast: "{Entity} created successfully"
- Navigate to detail page OR refresh list

**On Error:**
- Display field-level errors inline
- Display general error in toast/banner
- Keep form open with entered values

---

### Form: {FormName2}

**Location:** Settings page
**Submit Endpoint:** PUT /api/settings

#### Fields

| Field | Name | Type | Required | Validation | Default |
|-------|------|------|----------|------------|---------|
| Email | email | email | Yes | Valid email | {current} |
| Notifications | notifications_enabled | toggle | No | - | true |
| Theme | theme | radio | No | One of: light, dark, system | system |

#### Submit Behavior

**On Success:**
- Show success toast: "Settings saved"
- Stay on page

**On Error:**
- Show inline field errors
- Highlight invalid fields

---

## 7. State Enumeration

All possible UI states as TypeScript union types. Use these for exhaustive type checking.

### Auth States

```typescript
export type AuthState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'authenticated'; user: User }
  | { status: 'unauthenticated' }
  | { status: 'error'; error: string };
```

### List States

```typescript
export type ListState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: string; retry: () => void }
  | { status: 'empty' }
  | { status: 'loaded'; data: T[]; meta: PaginationMeta }
  | { status: 'refreshing'; data: T[]; meta: PaginationMeta };
```

### Detail States

```typescript
export type DetailState<T> =
  | { status: 'loading' }
  | { status: 'not_found' }
  | { status: 'forbidden' }
  | { status: 'error'; error: string }
  | { status: 'loaded'; data: T }
  | { status: 'editing'; data: T; draft: Partial<T> }
  | { status: 'saving'; data: T; draft: Partial<T> };
```

### Form States

```typescript
export type FormState<T> =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; data: T }
  | { status: 'error'; errors: ValidationErrors };

export interface ValidationErrors {
  [field: string]: string[];
}
```

### Modal States

```typescript
export type ModalState<T = void> =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'edit'; item: T }
  | { open: true; mode: 'confirm'; action: () => void };
```

---

## 8. Error Handling

### Standard Error Shape

All API errors follow this structure:

```typescript
interface ApiError {
  code: string;        // Machine-readable code
  message: string;     // Human-readable message
  details?: {          // Field-level errors (validation)
    [field: string]: string[];
  };
}
```

### Error Codes Reference

| Code | HTTP Status | Meaning | User Action |
|------|-------------|---------|-------------|
| `AUTH_INVALID` | 401 | Invalid credentials | Re-enter credentials |
| `AUTH_EXPIRED` | 401 | Token expired | Auto-refresh, then retry |
| `AUTH_FORBIDDEN` | 403 | Insufficient permissions | Contact admin |
| `NOT_FOUND` | 404 | Resource doesn't exist | Navigate away |
| `VALIDATION_ERROR` | 400 | Invalid input | Fix highlighted fields |
| `CONFLICT` | 409 | Resource conflict | Refresh and retry |
| `RATE_LIMITED` | 429 | Too many requests | Wait and retry |
| `SERVER_ERROR` | 500 | Internal error | Retry with backoff |

### Error Handling Patterns

#### Global Error Handler

```typescript
async function handleApiError(error: ApiError): Promise<void> {
  switch (error.code) {
    case 'AUTH_EXPIRED':
      await refreshToken();
      // Retry original request
      break;
    case 'AUTH_INVALID':
    case 'AUTH_FORBIDDEN':
      redirectToLogin();
      break;
    case 'RATE_LIMITED':
      showToast('Too many requests. Please wait.');
      break;
    case 'SERVER_ERROR':
      showToast('Something went wrong. Please try again.');
      break;
    default:
      showToast(error.message);
  }
}
```

#### Form Error Display

```typescript
// Map API validation errors to form fields
function mapApiErrorsToForm(
  apiErrors: Record<string, string[]>
): Record<string, string> {
  const formErrors: Record<string, string> = {};
  for (const [field, messages] of Object.entries(apiErrors)) {
    formErrors[field] = messages[0]; // Show first error only
  }
  return formErrors;
}
```

### Retry Strategy

```typescript
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,  // 1 second
  maxDelay: 10000,  // 10 seconds
  retryOn: [408, 429, 500, 502, 503, 504],
};

function calculateDelay(attempt: number): number {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
}
```

---

## 9. Design System

### Color Palette

Copy to your CSS variables:

```css
:root {
  /* Primary */
  --color-primary: {hex};
  --color-primary-hover: {hex};
  --color-primary-foreground: {hex};

  /* Secondary */
  --color-secondary: {hex};
  --color-secondary-hover: {hex};
  --color-secondary-foreground: {hex};

  /* Neutral */
  --color-background: {hex};
  --color-foreground: {hex};
  --color-muted: {hex};
  --color-muted-foreground: {hex};
  --color-border: {hex};

  /* Semantic */
  --color-success: {hex};
  --color-success-foreground: {hex};
  --color-warning: {hex};
  --color-warning-foreground: {hex};
  --color-error: {hex};
  --color-error-foreground: {hex};
  --color-info: {hex};
  --color-info-foreground: {hex};

  /* Surfaces */
  --color-card: {hex};
  --color-card-foreground: {hex};
  --color-popover: {hex};
  --color-popover-foreground: {hex};
}
```

### Typography

| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| H1 | {font} | 32px | 700 | 1.2 |
| H2 | {font} | 24px | 600 | 1.3 |
| H3 | {font} | 20px | 600 | 1.4 |
| H4 | {font} | 16px | 600 | 1.5 |
| Body | {font} | 14px | 400 | 1.6 |
| Small | {font} | 12px | 400 | 1.5 |
| Caption | {font} | 11px | 400 | 1.4 |

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Inline elements |
| sm | 8px | Tight spacing |
| md | 16px | Default spacing |
| lg | 24px | Section spacing |
| xl | 32px | Large gaps |
| 2xl | 48px | Page sections |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| none | 0 | - |
| sm | 4px | Inputs, small elements |
| md | 8px | Cards, buttons |
| lg | 12px | Modals, large cards |
| full | 9999px | Pills, avatars |

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| sm | 0 1px 2px rgba(0,0,0,0.05) | Subtle elevation |
| md | 0 4px 6px rgba(0,0,0,0.1) | Cards |
| lg | 0 10px 15px rgba(0,0,0,0.1) | Modals, dropdowns |
| xl | 0 20px 25px rgba(0,0,0,0.1) | Large overlays |

### Component Specifications

#### Buttons

| Variant | Background | Text | Border | Hover |
|---------|------------|------|--------|-------|
| Primary | var(--color-primary) | var(--color-primary-foreground) | none | var(--color-primary-hover) |
| Secondary | var(--color-secondary) | var(--color-secondary-foreground) | none | var(--color-secondary-hover) |
| Outline | transparent | var(--color-foreground) | var(--color-border) | var(--color-muted) |
| Ghost | transparent | var(--color-foreground) | none | var(--color-muted) |
| Destructive | var(--color-error) | var(--color-error-foreground) | none | darker |

**Sizes:**
| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| sm | 32px | 12px 16px | 12px |
| md | 40px | 16px 24px | 14px |
| lg | 48px | 20px 32px | 16px |

#### Inputs

| State | Border | Background | Focus Ring |
|-------|--------|------------|------------|
| Default | var(--color-border) | var(--color-background) | - |
| Focus | var(--color-primary) | var(--color-background) | 2px primary |
| Error | var(--color-error) | var(--color-background) | 2px error |
| Disabled | var(--color-border) | var(--color-muted) | - |

#### Cards

```css
.card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
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

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful delete) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Rate Limited |
| 500 | Server Error |

### Date Formats

All dates from API are ISO 8601:
```
2024-01-15T09:30:00.000Z
```

Display formats:
| Context | Format | Example |
|---------|--------|---------|
| Timestamp | MMM D, YYYY h:mm A | Jan 15, 2024 9:30 AM |
| Date only | MMM D, YYYY | Jan 15, 2024 |
| Relative | {n} {unit} ago | 2 hours ago |

### File Upload Limits

| Type | Max Size | Allowed Extensions |
|------|----------|--------------------|
| Avatar | 2MB | jpg, png, webp |
| Document | 10MB | pdf, doc, docx |
| Image | 5MB | jpg, png, webp, gif |
```

---

## Usage Notes

1. Replace all `{placeholders}` with actual values
2. Delete any sections not applicable to your project
3. Add additional endpoints as needed
4. Ensure all TypeScript is valid before delivery
