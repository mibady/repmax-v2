**PRP: Artist Profile – “Deep Persona Page”**

---

## **1\. Product Context & Goals**

- **Problem**: AI artist pages currently lack the immersive narrative, multimedia showcase, and interactive components needed to truly bring a virtual persona to life.

- **Who**: Fans who want to dive deep into an artist’s mythology, listen to tracks, explore voice profiles, and shop merch.

- **User Story**:

  As a fan, I want a rich, multimedia profile for each AI artist—complete with backstory, audio samples, visual assets, and merch—so I can fully immerse myself in their world.

## **2\. Success Metrics**

- **Average Time on Profile**: ≥ 2.5 minutes

- **Track Plays from Profile**: ≥ 20% of page visits

- **Merch Click-through Rate**: ≥ 5% of profile visits

## **3\. Feature Specifications**

| User Story                                                                       | Acceptance Criteria                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Display hero section with artist’s name and mythos video.                        | \- **ArtistHero** renders full-screen background video (or image fallback) with stageName and a “Play Story” CTA that smooth-scrolls to backstory.                                                                                              |
| Show artist biography & backstory with supporting visuals.                       | \- **ArtistStory** displays bio text, backstoryMythos, and a carousel of concept art images from `visual_lexicon.imageUrls`.                                                                                                                    |
| Provide a seamless music listening experience (Spotify, Bandcamp, custom).       | \- **MusicSection** embeds Spotify iframe (if `spotifyPlaylistId`), Bandcamp widget (if `bandcampAlbumId`), and falls back to **CustomAudioPlayer** for local `tracks`. \- Player persists position across page navigations (via localStorage). |
| Highlight the artist’s vocal “timbreDNA” with audio samples and profile details. | \- **VoiceProfileSection** shows vocalProfile.range, toneTexture, deliveryModes. \- Displays a grid of sample clips generated via Kits.ai (voiceSamples array) with play controls.                                                              |
| Showcase visual identity & merch aligned to their persona.                       | \- **VisualsSection** presents lyric videos, official images, and a **ArtistMerch** grid linking to `/shop?artist=[slug]`.                                                                                                                      |
| Offer action links for purchase, merch, interviews, and social share.            | \- **ArtistActions** shows buttons for “Buy Music,” “Explore Merch,” “Listen to Interview,” and a Twitter/X share link.                                                                                                                         |

### **Data & API**

- **Endpoint**:
  - `GET /api/artists/[slug]` → returns full artist JSON (persona fields \+ track list \+ merch items).

- **DB Tables**:
  - `artists` (all persona JSONB fields)

  - `tracks` (filter by `artist_id`)

  - `products` (filter by `artist_id`)

### **Components**

- **ArtistHero** (Server)

- **ArtistStory** (Server)

- **MusicSection** (Client)

- **CustomAudioPlayer** (Client)

- **VoiceProfileSection** (Client)

- **VisualsSection** (Server)

- **ArtistMerch** (Client)

- **ArtistActions** (Client)

## **4\. Prompt Examples for UI Generation**

- **ArtistHero**

  “Generate a **Next.js 15** Server Component `ArtistHero` in TypeScript using Tailwind and shadcn/ui. Props: `{ stageName: string; backgroundVideo: string; }`. It should render a full-viewport video (with poster fallback), overlay the stageName in large typography, and include a “Play Story” button.”

- **ArtistStory**

  “Create a Server Component `ArtistStory` that takes `{ bio: string; backstory: string; images: string[] }`. Render the bio and backstory in styled sections, and map `images` into a responsive image carousel using shadcn/ui `Carousel`.”

- **MusicSection**

  “Build a **client** component `MusicSection` that conditionally renders: a Spotify `<iframe>`, a Bandcamp `<iframe>`, and a `CustomAudioPlayer tracks={tracks}` fallback. Use HTML5 audio and canvas for the custom player waveform.”

- **VoiceProfileSection**

  “Generate a client component `VoiceProfileSection` that displays vocalProfile details and a grid of playable audio clips (`voiceSamples`), each with a play/pause toggle and waveform preview.”

- **ArtistMerch**

  “Create a client component `ArtistMerch` that fetches merch items for an artist and displays them in a grid of shadcn/ui `Card` components with image, title, price, and ‘View in Shop’ link.”
