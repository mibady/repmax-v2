**PRP: Authentication & User Dashboard**

---

## **1\. Product Context & Goals**

- **Problem**: There’s no seamless, secure way for fans and clients to sign up, authenticate, and access personalized content—leading to friction in account creation and engagement.

- **Who**: New visitors converting to registered users, returning fans accessing purchases/playlists, and supervisors viewing license history.

- **User Stories**:
  1. As a visitor, I want passwordless email and social login so I can start engaging quickly.

  2. As a signed-in user, I want a central dashboard showing my orders, playlists, and licenses so I can manage my activity.

## **2\. Success Metrics**

- **Signup Conversion** ≥ 25% of visits to `/auth`

- **Login Success Rate** ≥ 98%

- **Dashboard Engagement** ≥ 60% of signed-in sessions

- **Feature Usage**: ≥ 30% of users access at least one dashboard section monthly

## **3\. Feature Specifications**

| User Story                               | Acceptance Criteria                                                                                                                                                                          |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Passwordless email & social signup/login | \- **SignUpForm** uses Clerk’s `<SignUp>` component with email, Google, and GitHub providers. \- **SignInForm** wraps Clerk’s `<SignIn>` component. \- Redirect to intended page after auth. |
| Protect all dashboard routes             | \- Middleware checks `auth()` from `@clerk/nextjs`. Unauthenticated users are redirected to `/auth?redirectTo=/dashboard`.                                                                   |
| Display user’s purchase history          | \- **PurchasesList** fetches `/api/user/purchases` server-side and lists orders with date, items, total, and “Reorder” action.                                                               |
| Show saved playlists                     | \- **PlaylistsList** fetches `/api/user/playlists` and renders each playlist with cover image, title, track count, and “Play All” button.                                                    |
| Present licensing dashboard              | \- **LicenseOverview** fetches `/api/user/licenses` and lists active/past licenses with status, track title (link), and renewal actions.                                                     |
| Allow account details management         | \- **AccountSettings** lets user update display name, email preferences, and opt in/out of SMS notifications. \- Changes saved via `POST /api/user/settings` with Zod validation.            |

## **4\. Data & API**

- **Auth**: Clerk via `@clerk/nextjs` for client plumbing; no custom DB for credentials.

- **Endpoints** (all require Clerk auth middleware):
  - `GET /api/user/purchases` → `{ orders: Order[] }`

  - `GET /api/user/playlists` → `{ playlists: Playlist[] }`

  - `GET /api/user/licenses` → `{ licenses: LicenseRequest[] }`

  - `GET /api/user/settings` → `{ user: { name, email, smsOptIn } }`

  - `POST /api/user/settings` → validates `{ name, emailPrefs, smsOptIn }` via Zod, updates Clerk & Supabase metadata

ts  
CopyEdit  
`// Example Purchase type`  
`interface Order {`  
 `id: string;`  
 `date: string;`  
 `total: number;`  
 `items: { productName: string; qty: number; price: number }[];`  
`}`

`// Example Playlist type`  
`interface Playlist {`  
 `id: string;`  
 `title: string;`  
 `coverUrl: string;`  
 `trackCount: number;`  
`}`

`// Example License type`  
`interface LicenseRequest {`  
 `id: string;`  
 `trackTitle: string;`  
 `status: 'active' | 'expired' | 'pending';`  
 `expiresAt?: string;`  
`}`

## **5\. Components**

- **SignUpForm** (Client) — wraps `<SignUp>` from Clerk with custom styling

- **SignInForm** (Client) — wraps `<SignIn>` from Clerk

- **DashboardLayout** (Server Component) — sidebar nav \+ top bar with user avatar

- **PurchasesList** (Server) — table of past orders

- **PlaylistsList** (Server) — grid/list view of saved playlists

- **LicenseOverview** (Server) — list of license requests with statuses

- **AccountSettings** (Client) — form for profile & preference edits

- **ProtectedRoute Middleware** — checks `auth()` in `middleware.ts`

## **6\. Prompt Examples for UI Generation**

- **SignUpForm & SignInForm**

  “Generate a client component `SignUpForm` in Next.js 15 that wraps Clerk’s `<SignUp>` UI with Tailwind-styled card and custom header. Similarly, create `SignInForm` wrapping `<SignIn>`, ensuring redirect after successful auth.”

- **DashboardLayout**

  “Create a Next.js 15 Server Component `DashboardLayout` using shadcn/ui `Sidebar` and `TopNav`. It should render children in a two-column grid: nav links (Dashboard, Purchases, Playlists, Licenses, Settings) and main content.”

- **PurchasesList**

  “Build a Server Component `PurchasesList` that fetches `/api/user/purchases` and displays a table: Order ID, Date, Items (comma-separated), Total, and a “Reorder” button linking to `/shop/cart?order=[id]`.”

- **PlaylistsList**

  “Generate a Server Component `PlaylistsList` that fetches `/api/user/playlists` and renders a responsive card grid. Each card shows cover image, title, track count, and a ‘Play All’ button using HTML5 audio.”

- **LicenseOverview**

  “Create a Server Component `LicenseOverview` that fetches `/api/user/licenses` and lists each license with track title (link), status badge, expiration date, and a “Renew” button for expired licenses.”

- **AccountSettings**

  “Implement a client component `AccountSettings` with fields for display name, email preferences (checkboxes), and SMS opt-in. Validate inputs with Zod and submit via a Next.js Server Action `updateUserSettings`.”
