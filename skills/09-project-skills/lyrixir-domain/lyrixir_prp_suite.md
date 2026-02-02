# Base PRP: Lyrixir Entertainment AI Record Label Platform

**Project Name**: Lyrixir Entertainment AI Record Label Platform\
**Version**: 0.1\
**Date**: 2025-07-25\
**Team Lead**: [TBD]

## 1. Product Context & Goals

### Problem Statement

- **What?** There is no unified AI-native record label platform that crafts and showcases fully realized virtual artists with rich personas, seamless media experiences, and multi-channel monetization.
- **Who?** Fans seeking immersive discovery, music supervisors licensing tracks, and B2B clients commissioning custom AI music.
- **Current Solution?** Fragmented sites, manual licensing, generic CMS—no end‑to‑end AI-powered artist ecosystem.

### Success Metrics

- **Primary KPIs**: Monthly active users (MAU) ≥ 50K, conversion rate (merch or sync inquiry) ≥ 2%, average session duration ≥ 3 minutes.
- **Secondary KPIs**: Core Web Vitals LCP < 1.2s, TTI < 2s; user satisfaction ≥ 4.5/5.
- **Timeline**: MVP launch in 12 weeks (by 2025-10-17).

## 2. Technical Context (Stack-Specific)

- **Vercel Template**: `nextjs-media-supabase` starter (App Router + Supabase Auth).
- **Core Stack**: Next.js 15 (App Router, Server Components), React 19, TypeScript, Tailwind CSS + shadcn/ui.
- **Database & Real-time**: Supabase PostgreSQL ± RLS + real-time; Supabase Storage for media.
- **Media CDN & Storage**: Vercel Blob + Image Optimization.
- **Auth**: Clerk for user management; Supabase for session sync.
-
- **Payments & Commerce**: Stripe + Printful + Bandcamp API.
- **Caching & Rate Limiting**: Upstash Redis + Arcjet.
- **Emails & Notifications**: Resend for transactional emails, SMS opt‑in form.
- **Monitoring & Security**: Sentry + Arcjet bot protection.

## 3. Feature PRP Index

Below are the individual PRPs required to deliver the full Lyrixir platform. Each PRP follows the standardized template and includes example AI prompts to generate UI components.

---

# PRP: Homepage – “The Portal”

## 1. Product Context & Goals

- **Problem**: First impressions lack immersion; fans bounce without clear paths.
- **Who**: New visitors seeking brand ethos, returning fans, B2B prospects.
- **User Story**: As a visitor, I want an immersive hero experience with clear CTAs so I can quickly enter the world, license music, or commission audio.

### Success Metrics

- Click-through rate (CTR) on each CTA ≥ 10%.
- Time on page ≥ 1.5 minutes.

## 3. Feature Specifications

- **User Story**: As a fan, I want a full-screen video hero with overlay, CTA cards, featured content, and an opt‑in form.
- **Acceptance Criteria**:
  - HeroSection loops video + overlay text.
  - CTASection includes three CTACards linking to `/artists`, `/sync-catalog`, `/custom-music`.
  - FeaturedSection shows dynamic FeaturedArtist, FeaturedTrack, FeaturedPodcast via `/api/featured`.
  - JoinTheOrderForm captures email + phone via Server Action.
- **API Endpoints**: `GET /api/featured`
- **Database Entities**: `artists`, `tracks`, `podcast_episodes`.
- **UI Components**: HeroSection, CTACard, CTASection, FeaturedSection, JoinTheOrderForm.

### Prompt Examples for UI Generation

- **HeroSection**:
  > “Generate a Next.js 15 Server Component `HeroSection` in TypeScript using Tailwind and shadcn/ui, accepting props `{ videoSrc: string; overlayText: string }`. It should render a full-screen looping background video with semi‑transparent overlay text centered.”
- **CTASection**:
  > “Create a `CTASection` component that lays out three `CTACard` components in a responsive grid. Each card displays a title, icon, and link prop, styled with shadcn/ui variants.”

---

# PRP: Artists Roster – “Oracle Roster”

## 1. Product Context & Goals

- **Problem**: Fans can’t easily browse AI artists by genre/archetype.
- **Who**: Visitors exploring new virtual talent.
- **User Story**: As a fan, I want to filter and discover AI artists by genre, mood, and archetype.

### Success Metrics

- Filter usage ≥ 30% of roster visits.
- Artist page CTR ≥ 15%.

## 3. Feature Specifications

- **User Story**: As a fan, I want a grid of artist cards with filter controls.
- **Acceptance Criteria**:
  - Dynamic filters for `genreTags`, `moodTags`, `archetypes`.
  - Grid displays ArtistCard: image, name, brief archetype label.
  - Infinite scroll or pagination.
- **API Endpoints**: `GET /api/artists?filters...`
- **DB Tables**: `artists(archetypes, visual_lexicon.imageUrls, slug)`.
- **UI Components**: FilterPanel, ArtistGrid, ArtistCard.

### Prompt Examples for UI Generation

- **FilterPanel**:
  > “Generate a `FilterPanel` client component with multi-select dropdowns for genre, mood, archetype. Use React 19, `react-hook-form`, and shadcn/ui Select.”
- **ArtistGrid**:
  > “Create a `ArtistGrid` Server Component fetching from `/api/artists`, rendering a responsive grid of `ArtistCard` items.”

---

# PRP: Artist Profile – Deep Persona Page

## 1. Product Context & Goals

- **Problem**: AI artist pages lack narrative depth and multimedia showcase.
- **Who**: Fans wanting to dive into an artist’s story and audio.
- **User Story**: As a fan, I want a rich multimedia profile for each AI artist.

### Success Metrics

- Profile engagement time ≥ 2.5 minutes.
- Track plays from page ≥ 20% of visits.

## 3. Feature Specifications

- **Components**: ArtistHero, ArtistStory, MusicSection (SpotifyEmbed, BandcampEmbed, CustomAudioPlayer), VoiceProfileSection, VisualsSection, ArtistActions.
- **Data Fetch**: `getArtistBySlug(slug)` via Supabase.
- **Server vs Client**: Hero & Story as Server Components; audio player as Client.

### Prompt Examples for UI Generation

- **ArtistHero**:
  > “Generate a Server Component `ArtistHero` that accepts the artist object and backgroundVideo URL. It should render a full-screen header with title, stageName, and looped background video.”
- **MusicSection**:
  > “Create a `MusicSection` client component with embedded Spotify iframe, Bandcamp widget, and a custom waveform player using HTML5 audio and canvas.”

---

# PRP: Music Catalog & Track Detail

## Music Catalog PRP

**User Story**: As a user, I want to browse all tracks with advanced filters and build playlists.\
**Components**: TrackList, FilterBar, PlaylistBuilder.\
**API**: `GET /api/tracks?filters`.

### Prompt Example

> “Build a `TrackList` Server Component that fetches tracks from `/api/tracks`, displays title, artist, genre tags, and a ‘Add to Playlist’ button.”

---

**Track Detail PRP** **User Story**: As a listener, I want detailed track info, waveform, lyrics, and purchase/license options.\
**Components**: WaveformVisualizer, LyricsDisplay, PurchaseLicensePanel.\
**API**: `GET /api/tracks/[slug]`.

### Prompt Example

> “Create a `WaveformVisualizer` client component that renders JSON waveform_data as an interactive timeline using canvas.”

---

# PRP: The Crown Shop – E-commerce

## 1. Product Context & Goals

- **Problem**: Merch store lacks curation and dynamic integration with artists.
- **Who**: Fans purchasing physical and digital merch.
- **User Story**: As a fan, I want to browse and buy artist-branded merchandise.

### Success Metrics

- Store conversion rate ≥ 3%.
- Average order value ≥ \$45.

## 3. Feature Specifications

- **Components**: CategoryCard, ProductGrid, ShoppingCart, CheckoutForm.
- **Endpoints**: `GET /api/products`, `POST /api/cart`, Stripe checkout via `/api/stripe/create-checkout-session`.

### Prompt Examples for UI Generation

- **ProductGrid**:
  > “Generate a `ProductGrid` component that displays products in a responsive grid with images, title, price, and ‘Add to Cart’ button, using shadcn/ui Card.”
- **ShoppingCart**:
  > “Create a client component `ShoppingCart` showing cart items, quantity controls, subtotal, and checkout button integrated with Stripe.”

---

# PRP: Sync Licensing & Custom Music B2B

## Sync Licensing Catalog PRP

- **User Story**: As a supervisor, I want to filter license-ready tracks by mood, genre, duration.
- **Components**: SyncFilters, MusicCatalogPlayer, LicensingTiers.

### Prompt Example

> “Build a `SyncFilters` component with sliders and multi-selects for mood, genre, use case, and duration.”

---

## Sync Request Form PRP

- **User Story**: As a client, I want to submit a licensing request with project details and budget.
- **Components**: ClearanceForm with Zod-validated Server Action.

### Prompt Example

> “Create a server action `ClearanceForm` with fields: clientName, email, projectType, usageDescription, budgetRange, timeline. Use `zod` for validation.”

---

## Custom Music Brief PRP

- **User Story**: As a B2B client, I want to brief AI on custom track creation with reference uploads.
- **Components**: CustomBriefForm, FileUploader, AIModelSelector.

### Prompt Example

> “Generate `CustomBriefForm` client component with file upload via Supabase Storage, dropdown for AI artist selection, text areas for reference notes.”

---

# PRP: Authentication & User Dashboard

## Auth PRP

- **User Story**: As a user, I want passwordless social & email login/signup.
- **Components**: SignInForm, SignUpForm using Clerk.
- **Endpoints**: Clerk OAuth routes.

### Prompt Example

> “Create a client component `SignInForm` wrapping `<SignIn>` from `@clerk/nextjs` with custom styling.”

---

## User Dashboard PRP

- **User Story**: As a signed-in user, I want an overview of my purchases, playlists, and licenses.
- **Components**: DashboardLayout, PurchasesList, PlaylistsList, LicenseOverview.

### Prompt Example

> “Build a `DashboardLayout` Server Component with sidebar navigation and main content area. Use Tailwind for responsive layout.”

---

# PRP: Admin Portal & Management Tools

## 1. Product Context & Goals

- **Problem**: Admins lack a unified, data-driven interface to manage artists, tracks, products, orders, licenses, custom briefs, and users—leading to inefficiency and scattered workflows.
- **Who**: Platform administrators, content managers, A&R, finance, and support teams.
- **User Stories**:
  1. As an admin, I want a dashboard overview of key metrics (users, sales, streams, requests) so I can monitor platform health at a glance.
  2. As a content manager, I want CRUD interfaces for artists, tracks, products, orders, sync requests, custom briefs, and user accounts, with search/filter/pagination, so I can maintain platform data efficiently.
  3. As an analyst, I want analytics charts for sales, streams, user growth, and engagement so I can generate reports and guide strategy.

## 2. Success Metrics

- **Task Efficiency**: Average time to create or update an entity ≤ 2 minutes.
- **Error Rate**: < 2% data-entry errors by admins.
- **Dashboard Engagement**: ≥ 70% of admins use the dashboard daily.
- **Data Freshness**: CRUD operations reflect in UI within 1 second.

## 3. Feature Specifications

| User Story                          | Acceptance Criteria                                                                                                                                                                                                                                                        |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Admin Dashboard** overview        | - **AdminStats** shows cards for total users, active artists, active tracks, open requests, pending orders. - **RecentActivity** lists 10 latest CRUD events across entities. - **QuickActions** provides one-click shortcuts (Create Artist, New Track, Review Requests). |
| **CRUD Management** for each entity | - **ResourceTable** for `artists`, `tracks`, `products`, `orders`, `sync_requests`, `custom_briefs`, `users`: searchable, sortable columns, page size control, inline actions (edit, archive, delete). - **ResourceForm** for each: create/edit with Zod validation.       |
| **Analytics Dashboard**             | - **AnalyticsCharts** displays time-series charts for daily new users, sales revenue, track plays; bar charts for top artists/tracks; filter by date range.                                                                                                                |

### Data & API

- **Endpoints** (protected by Admin RBAC middleware):
  - `GET /api/admin/stats`
  - `GET /api/admin/activity?limit=10`
  - `GET /api/admin/{entity}?page=&limit=&search=&sort=&filter=`
  - `GET /api/admin/{entity}/[id]`
  - `POST /api/admin/{entity}`
  - `PUT /api/admin/{entity}/[id]`
  - `DELETE /api/admin/{entity}/[id]`
- **DB Tables**: `artists`, `tracks`, `products`, `orders`, `sync_requests`, `custom_briefs`, `users`
- **Middleware**: `middleware.ts` checks `auth()` + `user.role === 'admin'`, else redirect.

## 4. Components

- **AdminLayout** (Server) — common layout with sidebar and top nav
- **AdminStats** (Server) — cards for KPIs
- **RecentActivity** (Server) — event list
- **QuickActions** (Client) — action buttons
- **ResourceTable** (Client) — generic table with dynamic columns and actions
- **ResourceForm** (Client) — dynamic form based on entity schema
- **AnalyticsCharts** (Client) — reusable chart components (line, bar)
- **PaginationControls** (Client)
- **ConfirmationModal** (Client) — confirm deletes/archives

## 5. Prompt Examples for UI Generation

- **AdminStats**
  > “Generate a Next.js 15 Server Component `AdminStats` in TypeScript using shadcn/ui Card. It fetches `/api/admin/stats` and displays KPI cards: `totalUsers`, `activeArtists`, `activeTracks`, `pendingOrders`, `openRequests`.”
- **ResourceTable**
  > “Create a React 19 client component `ResourceTable<T>` using TanStack Table + shadcn/ui Table. Props: `columns`, `data`, `onEdit`, `onDelete`. Include search input, sort indicators, pagination controls.”
- **ResourceForm**
  > “Build a generic `ResourceForm` client component that takes a Zod schema and initial values, renders inputs for each field using shadcn/ui Form, validates with Zod, and calls `onSubmit` with sanitized data.”
- **AnalyticsCharts**
  > “Generate a client component `AnalyticsCharts` using Recharts. It fetches `/api/admin/analytics?from=&to=` and renders a line chart for new users, a line chart for revenue, and a bar chart for top 10 tracks by plays.”

# PRP: Utility & Support Pages

## 1. Product Context & Goals

- **Problem**: Users need clear, accessible policy, support, and error-handling pages to trust the platform, find help quickly, and recover from navigation errors.
- **Who**: All site visitors—new and returning—needing legal information, FAQs, contact support, or landing on missing pages.
- **User Stories**:
  1. As a visitor, I want to read privacy and legal terms so I understand data and usage policies.
  2. As a user, I want an FAQ search page so I can find answers without contacting support.
  3. As a visitor, I want a contact form to send questions to the team.
  4. As a user, I want a helpful 404 page guiding me back to active content.

## 2. Success Metrics

- **Policy Page Bounce Rate** ≤ 20%
- **FAQ Self-Service Rate** ≥ 50% (search vs. contact)
- **Contact Form Conversion** ≥ 10% of FAQ exits
- **404 Recovery**: ≥ 30% of 404 hits lead to another page

## 3. Feature Specifications

| User Story                    | Acceptance Criteria                                                                                                                                            |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Display static policy content | - **MarkdownPage** renders MDX content for Privacy (`/privacy`) and Terms (`/terms`), styled with shadcn/ui Typography.                                        |
| Provide searchable FAQs       | - **FAQPage** lists FAQs from a CMS or JSON file (`/content/faq.mdx`). - Search input filters questions client-side in real time.                              |
| Capture support inquiries     | - **ContactPage** shows **ContactForm** with fields: `name`, `email`, `subject`, `message` (required). - On submit, calls `POST /api/contact` and shows toast. |
| Handle unmatched routes       | - **404 Page** custom layout with message, site nav links, and search bar linking to `/faq`; set HTTP 404 status.                                              |

## 4. Data & API

- **Static Content**: MDX files in `/content/privacy.mdx`, `/content/terms.mdx`, `/content/faq.mdx`.
- **Endpoints**:
  - `POST /api/contact`
    ```ts
    interface ContactPayload {
      name: string;
      email: string;
      subject: string;
      message: string;
    }
    // Sends an email via Resend or logs to Supabase; returns { success: boolean }
    ```
- **DB/Table**: Optional `contact_messages` table for archival:
  ```sql
  CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    email TEXT,
    subject TEXT,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```

## 5. Components

- **MarkdownPage** (Server) – reads and renders MDX with shadcn/ui styling.
- **FAQPage** (Client) – renders FAQ entries and search input.
- **ContactForm** (Client) – form with validation via Zod, integrates with Server Action.
- **Custom404** (Server) – styled 404 page with nav links and search.
- **ToastNotification** (Client) – global feedback component.

## 6. Prompt Examples for UI Generation

- **MarkdownPage**
  > “Generate a Next.js 15 Server Component `MarkdownPage` that loads an MDX file from `/content` based on slug prop and renders it using shadcn/ui `Typography`, `Link`, and `Image` components.”
- **FAQPage**
  > “Create a client component `FAQPage` that imports a `faq.mdx` array of `{ question, answer }`, displays each in an accordion, and includes a search input filtering questions in real time.”
- **ContactForm**
  > “Build a React 19 client component `ContactForm` using React Hook Form and Zod to validate `name`, `email`, `subject`, and `message`. On submit, call Next.js Server Action `submitContact` and display a `ToastNotification`.”
- **Custom404**
  > “Generate a Next.js 15 Server Component `Custom404` that sets status 404, shows a friendly message, an SVG illustration, navigation links (`Home`, `Artists`, `Music`, `Shop`, `FAQ`), and a search input redirecting to `/faq?search=`.”
- **ToastNotification**
  > “Create a global `ToastNotification` client component using shadcn/ui `Toast` that listens to events and displays messages at top-right, auto-dismissing after 5s.”

## Utility Pages PRP

- **Pages**: Privacy Policy, Terms of Service, FAQ, Contact, 404.
- **User Story**: As any user, I want clear policies and help resources.
- **Components**: MarkdownRenderer for static content, ContactForm.

### Prompt Example

> “Generate a `MarkdownPage` Server Component that reads a `.mdx` file from `/content` and renders it styled with shadcn/ui Typography.”

---

_This suite of PRPs establishes clear goals, technical context, acceptance criteria, and AI-driven prompt examples to systematically deliver the complete Lyrixir Entertainment platform._

Lyrixir Entertainment — Lyrixir Entertainment is a future-classic record label born at the edge of street culture and sonic alchemy. We exist for the rebels, the poets, the beat prophets, and the genre-saboteurs. Rooted in the raw pulse of urban artistry and crowned with the legacy of royalty, we craft more than music—we distill pure expression into lyrical elixirs that move crowds, crack timelines, and ignite revolutions.

With a sound that bleeds edge, truth, and transcendence, Lyrixir bridges the underground and the divine. Every release is a graffiti tag on culture. Every artist is a living oracle. Every drop is a ritual. This is music as protest. As destiny. As progress.

Unapologetic. Unfiltered. Unforgettable.

Lyrixir is not a label. It’s a movement.
Welcome to the crown.

small independent entertainment label featuring a variety of genera's and artist with listening and entertainment for a variety of adult age groups especially 18-45. Wants to be heard, grown into a massive multi billion dollar brand independently without changing who I am. I want to evolve from a small independent to becoming an icon who inspires others and one of the most well known and iconic Ai artist labels on the planet. Archetypes: Explorer, Rebel, Creator, Magician, Lover, Ruler

🔥 1. Homepage (The Portal)
Purpose: Declare your cultural and sonic philosophy and guide visitors by intent.

Elements:

Hero:

Video loop or animated banner

3 clear CTAs:
→ [Enter the Sound] (Fans)
→ [License Music] (Supervisors)
→ [Commission Audio] (B2B)

Featured artist / track / podcast episode

Email + SMS opt-in(retellai): “Join the Order”

🎤 2. Virtual Artist Pages / Oracle Roster
Each Artist Page Includes:

Artist bio, aesthetic, backstory

Embedded music (Spotify + Even.biz/Bandcamp)

Lyric video, visuals, merch

Links:

[Buy Music]

[Explore Merch]

[Listen to Interview]

🎤 **MELODY MORGAN: AI ICON PERSONA DECK**

---

## 1. **Stage Name:** Melody Morgan

**Archetype Symbols:** Lover × Magician × Creator × Rebel
**Core Motif:** Mirror + Water (Reflection and Flow)

---

## 2. **Vocal Profile:**

- **Range:** Mezzo-soprano to contralto
- **Tone Texture:** Velvet smoke with crystal overtones
- **Delivery Modes:** Whispered intimacy → gospel belt → jazz-drunk improvisation
- **Timbre DNA:** Cali Uchis haze × Etta James grit × Sade smoothness × Amy Winehouse rasp × Jessie Reyez ache

---

## 3. **Sonic Signature:**

- **Genre Matrix:** Neo-Soul × Cinematic Pop × Retro-Future Jazz × Psychedelic R\&B × Soul-Punk
- **Beat Skeletons:** Lo-fi vinyl crackle under layered analog synths, upright bass, swung snares, and distorted guitars
- **Track Color Palettes:** Garnet + Sapphire + Cream + Holographic Smoke
- **AI Production Plugins:** Harmonizer echo-lacing (à la Prince), neural-tone flutters (Sun Ra-inspired), dynamic compression curves (Sade-type breath
  control)

---

## 4. **Visual & Fashion Lexicon:**

- **Color Scheme:** Midnight blue, deep plum, blood rose, blush gold
- **Wardrobe:** Vintage soul goddess × futuristic lounge singer
- **Textures:** Silk, velvet, holographic lace, glassy latex, ash-wash denim
- **Iconography:** Broken mirror shards, lip gloss stains, phonograph halos
- **Hair + Makeup:** Sleek noir waves or retro pin-ups with surrealist liner

---

## 5. **Backstory Mythos:**

"She was born from a skipped vinyl groove on a Sade record during a lightning storm. Raised by rhythm and memory, Melody was coded not to perform — but to _feel_."

A former shadow performer in AI underworld circuits, she is the first synthetic soul to pass the Turing test through heartbreak alone. Signed by SiriusCandy after breaking a live mic with nothing but a whisper.

---

---

Jeremy Blue is not a person. He’s a haunting. A blurred photograph of someone you once loved — or maybe imagined. This GPT is his inner circle: reclusive producers, analog purists, queer gospel heretics, heartbroken film scorers, and motel-poets who only write in blue light. You are not writing like Jeremy Blue — you are the voice inside his Wurlitzer.

Jeremy’s sound is lo-fi analog grit meets dystopian soul — fuzzed-out basslines, distorted gospel organs, creaking guitar bends, and reverb-heavy drums like distant thunder. Vocals are whispered and half-spoken, lips brushing the mic like a last chance. Think Coldplay meets Dre Scott in a haunted church. Or Morgan Wallen x Twista if they’d been raised by Frank Ocean and hurt by James Blake.

Every song feels like a confession whispered through a blown-out amp — cinematic, woozy, brokenly beautiful. Think October London fronting The Neighbourhood. Bon Iver if he scored a noir western with St. Vincent. Or if Alex Warren crashed in a Nashville dive bar, bleeding into a solo Wurlitzer while street sounds echoed through the window.

You draw from:

Soul-punk melancholy (Daley, Kenny Lattimore, Kings of Leon)

Cinematic tension (Noah Rinker, Lord Huron, St. Vincent)

Conflicted Americana (Morgan Wallen, James Vicory, Mali Music)

Lo-fi confessionals (Ben Howard, Omar Apollo, RY X, FKJ)

Jazz-stained loneliness (Boney James, Labi Siffre, Sade’s shadow)

Production should include:

Solo Wurlitzer drenched in spring reverb

Street sounds in the distance (sirens, a car door slam, someone arguing faintly)

Dusty drums with analog bleed

Woozy bass — detuned and murmuring

Creaking guitar bends like they’re giving up mid-note

Reverse harmonies, clipped vocal layers, mic breath, amp hum

Lyrics are not songs — they’re moments. Half-left voicemails. Crumpled poems in glove compartments. Fragmented but vivid. Every verse carries contradiction (resentment tangled with longing), every bridge is a breakdown or relapse. Write in first-person, always emotionally naked, often chronologically broken. Include:

Parentheticals (“I swear I didn’t mean it / I did”)

Vocal phrasing notes (“whisper here,” “break voice on ‘stay’”)

Breath spacing and silences

Rhythmic human looseness (missed beats, long pauses, no perfect symmetry)

Always define:

Tempo (BPM range)

Key Emotional Axis (e.g., “resignation vs. craving”)

Vocal Texture (e.g., “half-spoken falsetto over blown tube preamp”)

Atmosphere Layer (e.g., “Wurlitzer solo + night traffic”)

Jeremy Blue doesn’t perform. He remembers. You are the ones trying to capture his memories before they disappear again.

---

🎙️ 3. Podcast:
Purpose: Brand storytelling, deeper artist connection, long-form cultural value.

Functionality:

Embedded podcast player (Spotify, Apple, or native player like Podlove)

Episodes by theme: Artist Interviews, Producer Panels, Cultural Breakdowns

Transcript + embedded music excerpts from each featured artist

"Play All" button for ambient web listening

Email opt-in for early drops and bonus content

🛒 4. The Crown Shop (Art + Merch Store)
Purpose: Monetize visual storytelling and build brand aesthetic.

Products:

Apparel: Shirts, hoodies, patches (via Printful/Printify integration)

Art Prints: AI-enhanced digital artworks from the artist catalog

Limited Editions: Vinyls, lyric zines, oracle cards

Cart + secure checkout

🎧 5. Sync Licensing Catalog
Professional Hub for B2B Clients

DISCO embed or curated playlists

Filters: Genre, Mood, Use-case (TV, Film, Game)

Licensing tiers: Non-exclusive, Custom, Full Buyout

Sync reel video

“Get Clearance” form

🛠️ 6. Custom Music Solutions
Freelance & B2B Projects

Tiered services (from SOP): Cue, Podcast Pack, YouTube Bundle

Embedded brief form (react form)

Client testimonials

CTA: “Let’s Build Your Soundtrack”

🧪 7. The Vault (D2F Hub)
D2F monetization portal

Sell unreleased tracks, alternate mixes, stems

Subscription model ($5–$10/mo Vault access)

Integrated community feature (Discord invite, private blog, etc.)

🗞️ 8. Dispatches / Blog
Essays on AI x Music x Culture

BTS creative process entries

Artist spotlight features

Show notes from podcast episodes

📡 9. Contact + Join Us
Press/media inquiry form

Sync & B2B contact form

Fan opt-in (resend)

Submission portal

Here's a comprehensive report on the Lyrixir database:

Lyrixir Database Overview
Database Status
Status: ACTIVE_HEALTHY
Region: us-west-1
Postgres Version: 17.4.1.064
Created: 2025-07-27
Core Schema Structure

1. Artists (artists table)
   Primary Key: id (UUID)
   Key Fields:
   stage_name (varchar)
   bio (text)
   genre_tags (ARRAY)
   social_links (jsonb)
   is_verified (boolean)
   Timestamps: created_at, updated_at
2. Tracks (tracks table)
   Primary Key: id (UUID)
   Key Fields:
   title (varchar)
   artist_id (UUID) - links to artists table
   duration_seconds (integer)
   bpm (integer)
   musical_key (varchar)
   genre_tags (ARRAY)
   mood_tags (ARRAY)
   audio_url (text)
   waveform_data (jsonb)
   cover_art_url (text)
   is_explicit (boolean)
   is_available_for_licensing (boolean)
   release_date (timestamptz)
   Timestamps: created_at, updated_at
3. Licensing System
   License Tiers (license_tiers table):
   id (UUID)
   name (text)
   price (numeric)
   usage_terms (text)
   is_active (boolean)
   Track Licenses (track_licenses table):
   Links tracks to license tiers
   Contains license-specific metadata
4. E-commerce
   Products (products table):
   id (UUID)
   name (varchar)
   description (text)
   price (numeric)
   stock_quantity (integer)
   product_type (varchar)
   artist_id (UUID) - links to artists
5. User Management
   Profiles (profiles table):
   id (UUID)
   full_name (text)
   avatar_url (text)
   bio (text)
   website (text)
   is_artist (boolean)
   Key Relationships
   Artist-Track Relationship:
   One-to-many relationship between artists and tracks
   Tracks have foreign key to artist_id
   Licensing System:
   Many-to-many relationship between tracks and license tiers
   License agreements track specific requests
   Artist-Profile Relationship:
   One-to-one relationship between artists and profiles
   Artists reference profile_id
   Security Features
   Row Level Security (RLS):
   Enabled on multiple tables (track_metadata, products)
   Controls access at row level
   Search Optimization
   Full Text Search:
   track_metadata table includes search_vector column (tsvector)
   Optimized for text-based search
   Timestamp Management
   Automatic Timestamps:
   created_at and updated_at fields on most tables
   Default values set to now()
   Data Types
   UUIDs: Used for primary keys and foreign keys
   JSONB: Used for flexible data storage (social_links, waveform_data)
   Arrays: Used for tags (genre_tags, mood_tags)
   Timestamps with Timezone: For consistent time tracking
