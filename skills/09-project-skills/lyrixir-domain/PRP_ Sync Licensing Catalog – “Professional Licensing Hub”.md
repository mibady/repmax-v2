**PRP: Sync Licensing Catalog – “Professional Licensing Hub”**

---

## **1\. Product Context & Goals**

- **Problem**: Music supervisors and B2B clients need a streamlined way to browse, preview, and license AI-generated tracks; current offerings lack professional filters and clear licensing tiers.

- **Who**: Supervisors for film/TV/games, ad agencies, content creators seeking ready-to-license music.

- **User Story**:

  As a supervisor, I want to filter license-ready tracks by genre, mood, duration, and view pricing tiers so I can quickly find and license the perfect music.

## **2\. Success Metrics**

- **Filter Engagement** ≥ 40% of catalog visits

- **“Request License” Click-Through** ≥ 15% of track cards

- **Avg. Tracks Previewed per Session** ≥ 8

## **3\. Feature Specifications**

| User Story                                                     | Acceptance Criteria                                                                                                                                                                                                               |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Browse and preview license-ready tracks with targeted filters. | 1\. **SyncFilters** renders multi-selects for genre & mood, range sliders for duration, and “Use Case” dropdown. 2\. **CatalogGrid** shows track cards with play-on-hover previews. 3\. Pagination or infinite scroll loads more. |
| Compare licensing tiers and initiate a request.                | 1\. **LicenseTierBar** displays Non-Exclusive, Custom, Buyout tiers with prices and features. 2\. Each track card shows a “Request License” button opening the **ClearanceForm** modal.                                           |
| Preview multiple tracks in-page without navigating away.       | 1\. **CatalogGrid** track cards include a play/pause icon; playing one card pauses any other. 2\. Audio previews capped at 30 s.                                                                                                  |

### **Data & API**

- **Endpoints**:
  - `GET /api/tracks?sync_available=true&genre=&mood=&durationMin=&durationMax=&useCase=&page=&limit=`

  - `GET /api/sync-tiers` → returns tier definitions & pricing

- **DB Tables**:
  - `tracks` (`sync_available`, `sync_price`, `genre_tags[]`, `mood_tags[]`, `duration`)

  - `sync_tiers` (`type`, `price`, `features[]`)

### **Components**

- **SyncFilters** (Client)

- **CatalogGrid** (Server)

- **TrackCard** (Client) – extended with sync labels

- **LicenseTierBar** (Server)

- **ClearanceForm** (Client; modal, Server Action)

## **4\. Prompt Examples for UI Generation**

- **SyncFilters**

  “Generate a React 19 client component `SyncFilters` using shadcn/ui form controls and react-hook-form. It should render multi-select dropdowns for genre and mood, range sliders for duration (in seconds), and a ‘Use Case’ single-select, then invoke `onChange(filters)`.”

- **CatalogGrid & TrackCard**

  “Create a Next.js 15 Server Component `CatalogGrid` that fetches `/api/tracks?sync_available=true` with applied filters, and renders a responsive grid of `TrackCard` items. Extend `TrackCard` to show a sync badge, price, and a hover-play preview icon.”

- **LicenseTierBar**

  “Build a Server Component `LicenseTierBar` that fetches `/api/sync-tiers` and displays tier cards (Non-Exclusive, Custom, Buyout) with title, price, and feature list. Use shadcn/ui Card and Badge components.”

- **ClearanceForm**

  “Generate a client component `ClearanceForm` as a modal with zod-validated Server Action. Fields: `clientName`, `email`, `projectType` (dropdown), `usageDescription`, `budgetRange`, `timeline`. On submit, POST to `/api/sync-requests` and show success toast.”
