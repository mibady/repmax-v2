**PRP: Custom Music Brief – “Bespoke Composer Interface”**

---

## **1\. Product Context & Goals**

- **Problem**: B2B clients lack a guided, in-app workflow to submit detailed briefs for custom AI-generated tracks—resulting in fragmented requests, unclear requirements, and manual back-and-forth.

- **Who**: Agencies, filmmakers, game studios, brands seeking unique AI-composed music tuned to their project needs.

- **User Story**:

  As a client, I want to complete a structured brief—uploading references, selecting AI artist/style, specifying mood, length, and budget—so I can receive a tailored custom track with minimal overhead.

## **2\. Success Metrics**

- **Form Completion Rate** ≥ 80%

- **Average Time to Complete Brief** ≤ 4 minutes

- **Conversion to Custom Project** ≥ 25% of submissions

- **Client Satisfaction** ≥ 4.7/5 on post-delivery survey

## **3\. Feature Specifications**

| User Story                                                                              | Acceptance Criteria                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Capture project overview and reference materials.                                       | \- **Step 1** of `CustomBriefForm` collects **projectTitle**, **description**, **referenceUploads** (audio/video/images). \- FileUploader supports drag-and-drop, previews, and multiple file types (max 50 MB each). |
| Let client choose AI artist/style and musical parameters.                               | \- **Step 2** presents a searchable **AIModelSelector** (list of active `artists`) with thumbnail, archetype badge. \- Controls for **genre**, **mood**, **tempoRange**, **duration**.                                |
| Specify budget, delivery timeline, and optional extras (mix stems, alternate versions). | \- **Step 3** captures **budgetRange** (predefined tiers), **timeline** (date picker), and checkboxes for **includeStems**, **alternateVersion**, **prioritySupport**.                                                |
| Review all inputs before submission.                                                    | \- **Step 4** displays a **ReviewSummary** of all fields, uploaded files, and selections. \- “Edit” links navigate back to each step.                                                                                 |
| Submit the brief and receive confirmation with next steps.                              | \- On final submit, disable button and call `POST /api/custom-briefs`. \- Show **ConfirmationToast**: “Your custom music brief has been submitted\! Our team will follow up within 24 h.”                             |

## **4\. Data & API**

- **Endpoints**:
  - `GET /api/artists?status=active` → for AIModelSelector

`POST /api/custom-briefs`

ts  
CopyEdit  
`interface CustomBriefPayload {`  
 `projectTitle: string;`  
 `description: string;`  
 `referenceUrls: string[];      // Supabase Storage URLs from uploads`  
 `artistId: string;`  
 `genre: string;`  
 `mood: string;`  
 `tempoRange: { min: number; max: number };`  
 `duration: number;             // seconds`  
 `budgetRange: string;          // e.g. "$1k–$5k"`  
 `timeline: string;             // ISO date`  
 `includeStems: boolean;`  
 `alternateVersion: boolean;`  
 `prioritySupport: boolean;`  
`}`  
`// Response { id: string; status: 'received'; }`

- **DB Table**: `custom_briefs`

sql  
CopyEdit  
`CREATE TABLE custom_briefs (`  
 `id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,`  
 `project_title TEXT NOT NULL,`  
 `description TEXT NOT NULL,`  
 `reference_urls TEXT[] NOT NULL,`  
 `artist_id UUID REFERENCES artists(id),`  
 `genre TEXT NOT NULL,`  
 `mood TEXT NOT NULL,`  
 `tempo_min INT,`  
 `tempo_max INT,`  
 `duration INT,              -- in seconds`  
 `budget_range TEXT,`  
 `timeline DATE,`  
 `include_stems BOOL DEFAULT FALSE,`  
 `alternate_version BOOL DEFAULT FALSE,`  
 `priority_support BOOL DEFAULT FALSE,`  
 `status TEXT DEFAULT 'received',`  
 `created_at TIMESTAMPTZ DEFAULT NOW()`  
`);`

-

## **5\. Components**

- **CustomBriefForm** (Client) – multi-step wizard using React 19 \+ React Hook Form \+ Zod

- **FileUploader** (Client) – wraps Supabase Storage upload API, shows previews

- **AIModelSelector** (Client) – searchable dropdown/grid of artist cards

- **ReviewSummary** (Client) – read-only overview with edit links

- **ConfirmationToast** (Client) – success/failure feedback

- **Server Action** (API Handler) – validates payload, persists to Supabase

## **6\. Prompt Examples for UI Generation**

- **CustomBriefForm**

  “Generate a **React 19** client component `CustomBriefForm` in TypeScript using React Hook Form and Zod. Implement a 4-step wizard:
  1. Project details \+ `FileUploader` (drag-and-drop).

  2. `AIModelSelector` (fetch `/api/artists?status=active`) \+ genre/mood/tempo/duration controls.

  3. Budget tier radio buttons, timeline date picker, include extras checkboxes.

  4. `ReviewSummary` with an Edit link per section.  
     On submit, call the Next.js Server Action `submitCustomBrief`.”

- **FileUploader**

  “Build a client component `FileUploader` that uses Supabase Storage to upload multiple files (max 50 MB each). Display thumbnail previews for images/videos and audio waveforms for audio files.”

- **AIModelSelector**

  “Generate a client component `AIModelSelector` that fetches active artists from `/api/artists?status=active` and renders a searchable grid of `ArtistCard` items. Selecting an artist highlights it.”

- **Server Action Handler**

  “Create a Next.js 15 Server Action `submitCustomBrief` in `app/api/custom-briefs/route.ts` that:
  1. Parses and validates the incoming JSON with Zod.

  2. Inserts a new record into `custom_briefs` via Supabase.

  3. Returns `{ id, status }`.  
     Handle errors with 4xx/5xx responses.”

- **ConfirmationToast**

  “Build a `ConfirmationToast` client component using shadcn/ui Toast. Show success or error messages, auto-dismiss after 5 seconds.”
