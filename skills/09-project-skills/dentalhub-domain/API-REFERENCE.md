# DentalHub v3 API Reference

> **Version:** 1.0.0
> **Base URL:** `https://your-domain.com/api`
> **Last Updated:** January 2026

---

## Table of Contents

1. [Authentication](#authentication)
2. [Response Format](#response-format)
3. [Error Handling](#error-handling)
4. [Pagination](#pagination)
5. [Endpoints](#endpoints)
   - [Patients](#patients)
   - [Appointments](#appointments)
   - [Billing](#billing)
   - [Clinical](#clinical)
   - [Recalls](#recalls)
   - [Communications](#communications)
   - [Campaigns](#campaigns)
   - [Lab Cases](#lab-cases)
   - [Forms](#forms)
   - [Settings](#settings)
   - [Webhooks](#webhooks)
   - [Cron Jobs](#cron-jobs)
   - [AI Features](#ai-features)

---

## Authentication

All API endpoints require authentication via **Supabase Auth**. Include the session token in requests.

### Headers

```http
Authorization: Bearer <supabase_access_token>
Content-Type: application/json
```

### Practice Context

User authentication automatically resolves practice context through the `practice_users` table:

```sql
-- User -> Practice mapping
SELECT practice_id FROM practice_users WHERE auth_user_id = <user.id>
```

### Role-Based Access Control (RBAC)

| Role         | Access Level                         |
| ------------ | ------------------------------------ |
| `owner`      | Full access, practice settings       |
| `admin`      | Full access, no billing changes      |
| `dentist`    | Clinical, patients, scheduling       |
| `hygienist`  | Clinical (limited), patients         |
| `assistant`  | Patients, scheduling                 |
| `front_desk` | Patients, scheduling, billing (view) |
| `billing`    | Billing, patients (view)             |

---

## Response Format

### Success Response

```json
{
  "data": { ... },
  "error": null
}
```

### Created Response (201)

```json
{
  "data": { ... },
  "error": null
}
```

### Paginated Response

```json
{
  "data": [ ... ],
  "count": 150,
  "page": 1,
  "per_page": 20,
  "total_pages": 8
}
```

---

## Error Handling

### Error Response Format

```json
{
  "data": null,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Validation Error

```json
{
  "data": null,
  "error": "Validation failed",
  "validation_errors": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "phone", "message": "Phone number is required" }
  ]
}
```

### HTTP Status Codes

| Code  | Description            |
| ----- | ---------------------- |
| `200` | Success                |
| `201` | Created                |
| `400` | Bad Request            |
| `401` | Unauthorized           |
| `403` | Forbidden              |
| `404` | Not Found              |
| `409` | Conflict               |
| `422` | Validation Error       |
| `429` | Rate Limited           |
| `500` | Server Error           |
| `502` | External Service Error |

### Error Codes

| Code                     | Description                |
| ------------------------ | -------------------------- |
| `VALIDATION_ERROR`       | Request validation failed  |
| `AUTHENTICATION_ERROR`   | Auth required or invalid   |
| `AUTHORIZATION_ERROR`    | Permission denied          |
| `NOT_FOUND`              | Resource not found         |
| `CONFLICT`               | Resource already exists    |
| `RATE_LIMIT`             | Too many requests          |
| `EXTERNAL_SERVICE_ERROR` | Third-party service failed |

---

## Pagination

Paginated endpoints accept these query parameters:

| Parameter  | Type    | Default | Description               |
| ---------- | ------- | ------- | ------------------------- |
| `page`     | integer | 1       | Page number               |
| `per_page` | integer | 20      | Items per page (max: 100) |

---

## Endpoints

### Patients

#### List Patients

```http
GET /patients
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search by name, email, or phone |
| `status` | string | Filter by status: `active`, `inactive` |
| `provider_id` | uuid | Filter by primary provider |
| `page` | integer | Page number |
| `per_page` | integer | Items per page |

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone_mobile": "+15551234567",
      "date_of_birth": "1985-03-15",
      "status": "active",
      "primary_provider": {
        "id": "uuid",
        "first_name": "Dr. Jane",
        "last_name": "Smith"
      }
    }
  ],
  "count": 150,
  "page": 1,
  "per_page": 20,
  "total_pages": 8
}
```

---

#### Create Patient

```http
POST /patients
```

**Request Body:**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone_mobile": "+15551234567",
  "date_of_birth": "1985-03-15",
  "address_line1": "123 Main St",
  "city": "Springfield",
  "state": "IL",
  "postal_code": "62701",
  "primary_provider_id": "uuid",
  "sms_consent": true,
  "voice_consent": true
}
```

**Response:** `201 Created`

---

#### Get Patient

```http
GET /patients/{id}
```

**Response:** Full patient record with related data

---

#### Search Patients (Fuzzy)

```http
GET /patients/search?q=john
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | **Required.** Search query |
| `limit` | integer | Max results (default: 10) |

---

#### Get Patient Appointments

```http
GET /patients/{id}/appointments
```

---

#### Get Patient Ledger

```http
GET /patients/{id}/ledger
```

---

#### Get Patient Insurance

```http
GET /patients/{id}/insurance
```

---

#### Get Patient Chart

```http
GET /patients/{id}/chart
```

---

#### Get Patient Recalls

```http
GET /patients/{id}/recalls
```

---

### Appointments

#### List Appointments

```http
GET /appointments
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | date | Filter by date (YYYY-MM-DD) |
| `start_date` | date | Range start |
| `end_date` | date | Range end |
| `provider_id` | uuid | Filter by provider |
| `operatory_id` | uuid | Filter by operatory |
| `status` | string | `scheduled`, `confirmed`, `checked_in`, `completed`, `cancelled` |

---

#### Create Appointment

```http
POST /appointments
```

**Request Body:**

```json
{
  "patient_id": "uuid",
  "provider_id": "uuid",
  "operatory_id": "uuid",
  "appointment_type_id": "uuid",
  "start_time": "2026-01-20T09:00:00Z",
  "duration_minutes": 60,
  "notes": "New patient exam"
}
```

---

#### Get Appointment

```http
GET /appointments/{id}
```

---

#### Get Available Slots

```http
GET /appointments/available-slots
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | date | **Required.** Date to check |
| `provider_id` | uuid | Filter by provider |
| `duration_minutes` | integer | Required slot duration |

---

#### Confirm Appointment

```http
POST /appointments/{id}/confirm
```

---

#### Check In

```http
POST /appointments/{id}/check-in
```

---

#### Check Out (Complete)

```http
POST /appointments/{id}/check-out
```

**Request Body:**

```json
{
  "notes": "Completed procedures...",
  "procedure_codes": ["D0120", "D1110"]
}
```

---

#### Cancel Appointment

```http
POST /appointments/{id}/cancel
```

**Request Body:**

```json
{
  "reason": "Patient requested cancellation",
  "no_show": false
}
```

---

### Billing

#### List Ledger Transactions

```http
GET /billing/ledger
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `patient_id` | uuid | Filter by patient |
| `type` | string | `charge`, `payment`, `adjustment`, `refund` |
| `start_date` | date | Range start |
| `end_date` | date | Range end |

---

#### Get Ledger Transaction

```http
GET /billing/ledger/{id}
```

---

#### Record Payment

```http
POST /billing/payments
```

**Request Body:**

```json
{
  "patient_id": "uuid",
  "amount": 150.0,
  "payment_method": "credit_card",
  "stripe_payment_intent_id": "pi_xxx",
  "notes": "Copay for visit"
}
```

---

#### Get Terminal Status

```http
GET /billing/payments/terminal
```

---

#### Check Eligibility

```http
POST /billing/eligibility
```

**Request Body:**

```json
{
  "patient_id": "uuid",
  "insurance_id": "uuid"
}
```

**Note:** Returns stub response - DentalXChange integration pending.

---

#### List Claims

```http
GET /billing/claims
```

---

#### Create Claim

```http
POST /billing/claims
```

**Request Body:**

```json
{
  "patient_id": "uuid",
  "insurance_id": "uuid",
  "appointment_id": "uuid",
  "procedures": [
    {
      "code": "D0120",
      "tooth": null,
      "surfaces": null,
      "fee": 75.0
    }
  ]
}
```

---

#### List Membership Plans

```http
GET /billing/memberships/plans
```

---

#### Get Patient Membership

```http
GET /billing/memberships/patient/{id}
```

---

### Clinical

#### Get Odontogram (Tooth Conditions)

```http
GET /clinical/tooth-conditions
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `patient_id` | uuid | **Required.** |

---

#### List Clinical Notes

```http
GET /clinical/notes
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `patient_id` | uuid | Filter by patient |
| `appointment_id` | uuid | Filter by appointment |
| `signed` | boolean | Filter by signature status |

---

#### Sign Clinical Note

```http
POST /clinical/notes/{id}/sign
```

---

#### List Perio Exams

```http
GET /clinical/perio/exams
```

---

#### Record Perio Measurements

```http
POST /clinical/perio/measurements
```

**Request Body:**

```json
{
  "patient_id": "uuid",
  "exam_date": "2026-01-17",
  "measurements": [
    {
      "tooth_number": 3,
      "site": "MB",
      "probing_depth": 3,
      "recession": 0,
      "bleeding": false,
      "suppuration": false
    }
  ]
}
```

---

#### List Treatment Plans

```http
GET /clinical/treatment-plans
```

---

#### Get Treatment Plan

```http
GET /clinical/treatment-plans/{id}
```

---

#### Accept Treatment Plan

```http
POST /clinical/treatment-plans/{id}/accept
```

**Request Body:**

```json
{
  "signature_data": "base64_signature",
  "accepted_procedures": ["uuid1", "uuid2"]
}
```

---

### Recalls

#### List Recalls

```http
GET /recalls
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | `pending`, `contacted`, `scheduled`, `completed` |
| `type` | string | `prophy`, `perio`, `exam`, `xray` |
| `due_before` | date | Filter by due date |

---

#### Get Recall

```http
GET /recalls/{id}
```

---

#### Get Due Recalls (for Outreach)

```http
GET /recalls/due
```

Returns recalls that are due and haven't been contacted recently.

---

### Communications

#### List Communication Logs

```http
GET /communications
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `patient_id` | uuid | Filter by patient |
| `channel` | string | `sms`, `voice`, `email` |
| `direction` | string | `inbound`, `outbound` |
| `start_date` | date | Range start |

---

#### Send Communication

```http
POST /communications/send
```

**Request Body:**

```json
{
  "patient_id": "uuid",
  "channel": "sms",
  "template_id": "uuid",
  "variables": {
    "appointment_date": "January 20, 2026",
    "appointment_time": "9:00 AM"
  }
}
```

---

#### List Communication Templates

```http
GET /communications/templates
```

---

#### Get Communication Template

```http
GET /communications/templates/{id}
```

---

### Campaigns

#### List Campaigns

```http
GET /campaigns
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | `draft`, `active`, `paused`, `completed` |
| `type` | string | `recare`, `reactivation`, `treatment`, `custom` |

---

#### Create Campaign

```http
POST /campaigns
```

**Request Body:**

```json
{
  "name": "6 Month Recall Campaign",
  "type": "recare",
  "description": "Automated recall outreach",
  "sequence": [
    {
      "delay_days": 0,
      "channel": "sms",
      "template_id": "uuid"
    },
    {
      "delay_days": 3,
      "channel": "voice",
      "template_id": "uuid"
    },
    {
      "delay_days": 7,
      "channel": "sms",
      "template_id": "uuid"
    }
  ]
}
```

---

#### Get Campaign

```http
GET /campaigns/{id}
```

---

#### Start Campaign

```http
POST /campaigns/{id}/start
```

---

#### Pause Campaign

```http
POST /campaigns/{id}/pause
```

---

#### Enroll Patient

```http
POST /campaigns/{id}/enroll
```

**Request Body:**

```json
{
  "patient_id": "uuid"
}
```

---

#### Get Campaign Stats

```http
GET /campaigns/{id}/stats
```

**Response:**

```json
{
  "data": {
    "total_enrolled": 150,
    "active": 120,
    "completed": 25,
    "scheduled": 5,
    "sms_sent": 300,
    "voice_calls": 45,
    "response_rate": 0.32
  }
}
```

---

### Lab Cases

#### List Lab Vendors

```http
GET /lab/vendors
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `practice_id` | uuid | **Required.** |
| `active` | boolean | Filter active vendors |

---

#### Create Lab Vendor

```http
POST /lab/vendors
```

**Request Body:**

```json
{
  "practice_id": "uuid",
  "name": "Premier Dental Lab",
  "contact_name": "John Smith",
  "phone": "+15551234567",
  "email": "orders@premierlab.com",
  "specialties": ["crowns", "bridges", "dentures"],
  "average_turnaround_days": 10
}
```

---

#### List Lab Cases

```http
GET /lab/cases
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `practice_id` | uuid | **Required.** |
| `patient_id` | uuid | Filter by patient |
| `vendor_id` | uuid | Filter by vendor |
| `status` | string | Case status |
| `provider_id` | uuid | Filter by ordering provider |

---

#### Create Lab Case

```http
POST /lab/cases
```

**Request Body:**

```json
{
  "practice_id": "uuid",
  "patient_id": "uuid",
  "vendor_id": "uuid",
  "provider_id": "uuid",
  "case_type": "crown",
  "tooth_numbers": [14],
  "shade": "A2",
  "material": "zirconia",
  "due_date": "2026-01-30",
  "notes": "Full contour"
}
```

---

#### Get Lab Case

```http
GET /lab/cases/{id}
```

---

#### Update Lab Case

```http
PATCH /lab/cases/{id}
```

---

#### Update Case Status

```http
POST /lab/cases/{id}/status
```

**Request Body:**

```json
{
  "status": "shipped",
  "tracking_number": "1Z999AA10123456784",
  "notes": "UPS Ground"
}
```

**Valid Status Transitions:**
| From | To |
|------|-----|
| `pending` | `sent_to_lab`, `cancelled` |
| `sent_to_lab` | `in_fabrication`, `cancelled` |
| `in_fabrication` | `shipped`, `on_hold`, `cancelled` |
| `on_hold` | `in_fabrication`, `cancelled` |
| `shipped` | `received`, `returned` |
| `received` | `quality_check`, `returned` |
| `quality_check` | `completed`, `returned` |
| `completed` | `delivered` |
| `returned` | `sent_to_lab` |

---

#### Get Case Status History

```http
GET /lab/cases/{id}/status
```

---

### Forms

#### List Form Templates

```http
GET /forms/templates
```

---

#### List Form Submissions

```http
GET /forms/submissions
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `patient_id` | uuid | Filter by patient |
| `template_id` | uuid | Filter by template |
| `status` | string | `pending`, `completed`, `reviewed` |

---

#### Public Form Submit

```http
POST /forms/public/{formId}
```

**Note:** This is a public endpoint (no auth required). Uses form token validation.

**Request Body:**

```json
{
  "token": "form_token_xxx",
  "responses": {
    "medical_conditions": ["diabetes", "hypertension"],
    "medications": "Metformin 500mg",
    "allergies": "Penicillin",
    "signature": "base64_signature"
  }
}
```

---

### Settings

#### Get Practice Settings

```http
GET /settings/practice
```

---

#### List Providers

```http
GET /settings/providers
```

---

#### List Operatories

```http
GET /settings/operatories
```

---

#### List Appointment Types

```http
GET /settings/appointment-types
```

---

#### List Users

```http
GET /settings/users
```

---

### Webhooks

These endpoints receive external webhooks. They verify signatures and require no user auth.

#### Stripe Webhook

```http
POST /webhooks/stripe
```

Handles: `payment_intent.succeeded`, `payment_intent.payment_failed`, `invoice.paid`, `customer.subscription.*`

---

#### Retell Webhook

```http
POST /webhooks/retell
```

Handles: Call completion, SMS delivery, conversation updates

---

#### QStash Webhook

```http
POST /webhooks/qstash
```

Handles: Scheduled job callbacks

---

### Cron Jobs

These endpoints are called by QStash scheduled jobs. They verify QStash signatures.

#### Appointment Reminders

```http
POST /cron/appointment-reminders
```

Sends SMS/voice reminders for upcoming appointments.

---

#### Recall Outreach

```http
POST /cron/recall-outreach
```

Processes due recalls and initiates outreach.

---

#### Campaign Processor

```http
POST /cron/campaign-processor
```

Executes campaign steps with retry logic (max 3 retries, exponential backoff).

---

#### Eligibility Check

```http
POST /cron/eligibility-check
```

Batch eligibility verification (stub - pending DentalXChange integration).

---

### AI Features

#### AI Consultant (Chat)

```http
POST /ai/consultant
```

**Request Body:**

```json
{
  "message": "What are the treatment options for patient with Class II cavity?",
  "patient_id": "uuid",
  "context": "clinical"
}
```

**Response:** Streaming response (Server-Sent Events)

---

#### Morning Huddle

```http
GET /ai/huddle
```

Returns AI-generated daily briefing with:

- Today's schedule summary
- Patient alerts
- Pending tasks
- Revenue projections

---

#### AI Insights

```http
GET /ai/insights
```

Returns actionable insights:

- Patients due for treatment
- Revenue opportunities
- Scheduling optimization suggestions

---

#### Take Action on Insight

```http
POST /ai/insights/{id}/action
```

---

#### Knowledge Base Search

```http
GET /ai/knowledge/search?q=crown+prep
```

---

#### Add to Knowledge Base

```http
POST /ai/knowledge
```

---

## Rate Limits

| Endpoint Type | Limit        |
| ------------- | ------------ |
| Standard API  | 100 req/min  |
| Search        | 30 req/min   |
| AI Features   | 20 req/min   |
| Webhooks      | 1000 req/min |

---

## Changelog

### v1.0.0 (January 2026)

- Initial API release
- 70+ endpoints across 12 feature areas
- Campaign processor retry logic (max 3 retries with exponential backoff)
- Comprehensive error handling
- HIPAA-compliant audit logging

---

## Support

For API issues or questions:

- GitHub Issues: [dentalhub-v3/issues](https://github.com/your-org/dentalhub-v3/issues)
- Email: api-support@dentalhub.com
