**PRP: Music Catalog – “Sound Library”**

---

## **1\. Product Context & Goals**

- **Problem**: Users can’t easily discover and organize our full library of AI-generated tracks—browsing is flat and there’s no lightweight playlist workflow.

- **Who**: Fans building personal playlists, supervisors hunting mood- or tempo-based tracks, and power users curating collections.

- **User Story**:

  As a listener, I want to filter and browse all available tracks and add them to a temporary playlist so I can preview and save my favorite selections.

## **2\. Success Metrics**

- **Filter Usage**: ≥ 35% of visits

- **Add-to-Playlist Rate**: ≥ 25% of track cards

- **Average Tracks per Session**: ≥ 5 tracks

## **3\. Feature Specifications**

| User Story                                                           | Acceptance Criteria                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Browse all tracks with metadata and save them to a session playlist. | 1\. **FilterBar** displays controls for genre, mood, BPM range, key signature, and duration. 2\. **TrackList** shows paginated (or infinite-scroll) cards with title, artist, genre tags, duration, and “Add to Playlist” button. 3\. **PlaylistBuilder** sidebar (or floating drawer) lists selected tracks with reordering and “Play All” / “Clear” actions. |

### **Data & API**

- **Endpoint**:
  - `GET /api/tracks?genre=&mood=&bpmMin=&bpmMax=&key=&durationMin=&durationMax=&page=&limit=`

- **DB Table**:
  - `tracks` (fields used: `slug`, `title`, `artist_id`, `genre_tags[]`, `mood_tags[]`, `bpm`, `key_signature`, `duration`, `audio_url`)

### **Components**

- **FilterBar** (Client) – multi-control filter panel

- **TrackList** (Server) – fetches & renders track cards

- **TrackCard** (Client) – individual track display \+ action

- **PlaylistBuilder** (Client) – session-level sidebar/drawer

## **4\. Prompt Examples for UI Generation**

- **FilterBar**

  “Generate a React 19 client component `FilterBar` using shadcn/ui form controls and react-hook-form. It should render dropdowns for genre and mood, range sliders for BPM and duration, and call `onChange(filters)` on update.”

- **TrackList & TrackCard**

  “Create a Next.js 15 Server Component `TrackList` that fetches from `/api/tracks` with current filters and renders a responsive grid of `TrackCard` client components. Each `TrackCard` accepts `{ title, artistName, genreTags, duration, slug }` and shows an “Add to Playlist” button.”

- **PlaylistBuilder**

  “Build a React client component `PlaylistBuilder` that displays a slide-in drawer of selected tracks. Include drag-to-reorder, a “Play All” button (HTML5 audio), and a “Clear Playlist” action.”
