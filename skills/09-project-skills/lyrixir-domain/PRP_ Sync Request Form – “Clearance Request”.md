**PRP: Sync Request Form – “Clearance Request”**

---

## **1\. Product Context & Goals**

- **Problem**: Clients must tediously email or call to request sync licenses—there’s no structured, in-app workflow to capture all project details with validation and tracking.

- **Who**: Music supervisors, ad agencies, game developers, and content producers seeking to license AI-generated tracks.

- **User Story**:

  As a B2B client, I want a guided form to submit my sync-licensing request—covering project type, usage, budget, and timeline—so I can get a clear quote and status updates without back-and-forth emails.

## **2\. Success Metrics**

- **Form Completion Rate** ≥ 85%

- **Validation Error Rate** ≤ 5%

- **Avg. Time to Submit** ≤ 3 minutes

- **Conversion to Approved License** ≥ 20% of submissions

## **3\. Feature Specifications**

| User Story                                                      | Acceptance Criteria                                                                                                                                                                                       |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Present a clean, multi-step form for licensing details.         | \- **ClearanceForm** renders fields in logical groups (Project Info → Usage → Budget & Timeline → Review). \- Uses client-side validation (Zod \+ React Hook Form) with inline errors.                    |
| Ensure required fields are validated before submission.         | \- Fields `clientName`, `clientEmail`, `projectType`, `usageDescription`, `budgetRange`, `timeline`, `trackSlug` are all required. \- Invalid or empty inputs prevent submission, showing error messages. |
| Submit the request to the backend and show success feedback.    | \- On submit, form calls a **Server Action** (`POST /api/sync-requests`) and awaits response. \- Displays a toast confirmation “Request submitted\!” and clears the form.                                 |
| Prevent duplicate submissions and handle API errors gracefully. | \- Disable “Submit” button while awaiting response. \- If the API returns an error, show an error banner with the message and re-enable the button.                                                       |
| Track submission in admin dashboard with status “pending.”      | \- Backend persists to `sync_requests` table with default `status = 'pending'`. \- Returns the generated request `id` to client.                                                                          |

## **4\. Data & API**

- **Endpoint**:

`POST /api/sync-requests`

ts  
CopyEdit  
`// payload`  
`{`  
 `trackId: string;`  
 `clientName: string;`  
 `clientEmail: string;`  
 `projectType: 'film' | 'tv' | 'game' | 'commercial';`  
 `usageDescription: string;`  
 `budgetRange: string;`  
 `timeline: string;`  
`}`  
`// response`  
`{ id: string; status: 'pending'; }`

- **DB Table**: `sync_requests`

sql  
CopyEdit  
`CREATE TABLE sync_requests (`  
 `id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,`  
 `track_id UUID REFERENCES tracks(id),`  
 `client_name TEXT NOT NULL,`  
 `client_email TEXT NOT NULL,`  
 `project_type TEXT NOT NULL,`  
 `usage_description TEXT,`  
 `budget_range TEXT,`  
 `timeline TEXT,`  
 `status TEXT DEFAULT 'pending',`  
 `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`  
`);`

-

## **5\. Components**

- **ClearanceForm** (Client) – multi-step form with Zod \+ React Hook Form

- **ClearanceModal** (Client) – optional modal wrapper for in-page launch

- **Server Action** (API Handler) – validates payload server-side (Zod), persists to Supabase, returns `id`

- **ConfirmationToast** (Client) – success/failure feedback

## **6\. Prompt Examples for UI Generation**

- **ClearanceForm**

  “Generate a **React 19** client component `ClearanceForm` using `react-hook-form` and **shadcn/ui**. Implement a multi-step wizard: Step 1: `clientName`, `clientEmail`, `projectType` (select); Step 2: `usageDescription` (textarea); Step 3: `budgetRange`, `timeline`. Validate with Zod, display inline errors, and call a Next.js Server Action `submitClearance` on final submit.”

- **Server Action Handler**

  “Create a Next.js 15 Server Action `submitClearance` in `app/api/sync-requests/route.ts` that: 1\) parses and validates the JSON payload with Zod, 2\) inserts a new record into the `sync_requests` table via Supabase client, and 3\) returns `{ id, status }`.”

- **ClearanceModal**

  “Build a `ClearanceModal` client component that wraps `ClearanceForm` inside a shadcn/ui `Dialog`. It should open on clicking a “Request License” button and close on success or cancel.”

- **ConfirmationToast**

  “Generate a `ConfirmationToast` client component using shadcn/ui `Toast`. It displays success (“Your sync-license request has been submitted\!”) or error messages, auto-dismisses after 5 seconds.”
