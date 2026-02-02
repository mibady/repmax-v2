**PRP: Track Detail – “Sonic Showcase”**

---

## **1\. Product Context & Goals**

- **Problem**: Individual track pages lack the rich, interactive features that engage listeners—waveform exploration, lyrics display, deep metadata, and clear purchase/licensing actions are missing.

- **Who**: Fans seeking in-depth track information and immersive audio exploration; supervisors or clients considering sync/licensing.

- **User Story**:

  As a listener, I want detailed track info—including interactive waveform, full lyrics, metadata, and purchase/license options—so I can explore and act on my favorite songs.

## **2\. Success Metrics**

- **Avg. Time on Page** ≥ 1 minute

- **“Purchase/License” Click-Through Rate** ≥ 10%

- **“Add to Playlist” from Detail** ≥ 5% of visits

## **3\. Feature Specifications**

| User Story                                                           | Acceptance Criteria                                                                                                                                                                                  |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Display interactive waveform so I can scrub and zoom into the audio. | \- **WaveformVisualizer** renders JSON `waveform_data` as an interactive canvas. \- Supports hover-scrub preview and click-to-seek. \- Zoom slider adjusts time window (min: 10 s, max: full track). |
| Show full lyrics in a readable, scroll-sync’d panel.                 | \- **LyricsDisplay** presents `lyrics` text, highlighting current line as audio plays. \- Scrolls automatically in sync with playback position.                                                      |
| Present track metadata (BPM, key, genre, mood) and artist link.      | \- **TrackMetadata** lists `title`, `artistName` (link to profile), `duration` (mm:ss), `bpm`, `key_signature`, genre/mood tags as badges. \- “Add to Playlist” button visible next to metadata.     |
| Provide clear purchase, license-request, and add-to-cart actions.    | \- **PurchaseLicensePanel** shows price (if `sync_available`), “Add to Cart” for direct purchase, and “Request License” which opens a modal/clearance form.                                          |
| Suggest related tracks to keep users exploring.                      | \- **RelatedTracks** queries `/api/tracks?relatedTo=[slug]` and displays 4 cards (using `TrackCard` style) below the fold.                                                                           |

### **Data & API**

- **Endpoint**:
  - `GET /api/tracks/[slug]` → full track object (fields: `waveform_data`, `lyrics`, metadata, `sync_available`, `sync_price`).

  - `GET /api/tracks?relatedTo=[slug]` → array of 4 related track summaries.

- **DB Tables**:
  - `tracks` (JSONB `waveform_data`, TEXT `lyrics`, INT `bpm`, TEXT `key_signature`, BOOL `sync_available`, DECIMAL `sync_price`, etc.)

### **Components**

- **WaveformVisualizer** (Client)

- **LyricsDisplay** (Client)

- **TrackMetadata** (Server)

- **PurchaseLicensePanel** (Client)

- **RelatedTracks** (Server)

- **AddToPlaylistButton** (Client)

## **4\. Prompt Examples for UI Generation**

- **WaveformVisualizer**

  “Generate a **React 19** client component `WaveformVisualizer` in TypeScript. Props: `{ waveformData: number[]; audioRef: Ref<HTMLAudioElement> }`. Render an HTML5 `<canvas>` that plots the waveform, supports hover-scrub tooltips, click-seek, and a slider to zoom the time window.”

- **LyricsDisplay**

  “Create a client component `LyricsDisplay` that accepts `{ lyrics: string; audioRef: Ref<HTMLAudioElement> }`. Render each lyric line in a scrollable container and highlight the current line based on `audioRef.currentTime`, auto-scrolling to keep it centered.”

- **PurchaseLicensePanel**

  “Build a `PurchaseLicensePanel` client component using shadcn/ui. Props: `{ syncAvailable: boolean; syncPrice: number; trackSlug: string }`. Show price if available, an ‘Add to Cart’ button triggering `/api/cart`, and a ‘Request License’ button opening a Clerk-protected modal form.”

- **RelatedTracks**

  “Generate a Next.js 15 Server Component `RelatedTracks` that fetches `/api/tracks?relatedTo=[slug]` and maps results to a responsive grid of `TrackCard` items.”
