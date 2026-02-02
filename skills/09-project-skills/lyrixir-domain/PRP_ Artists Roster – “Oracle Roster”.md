**PRP: Artists Roster – “Oracle Roster”**

---

## **1\. Product Context & Goals**

- **Problem**: Fans can’t easily browse AI artists by genre, archetype, or mood—discovery feels flat.

- **Who**: Visitors exploring the Lyrixir roster for new virtual talent.

- **User Story**:

  As a fan, I want to filter and discover AI-generated artists by genre, mood, and archetype so I can find performers that match my tastes.

## **2\. Success Metrics**

- **Filter Engagement**: ≥ 30% of roster visitors use at least one filter

- **Artist Click-Through**: ≥ 15% of roster views lead to an Artist Profile page

- **Time on Page**: ≥ 1 minute average

## **3\. Feature Specifications**

| User Story                                                           | Acceptance Criteria                                                                                                                                                                                                                                                   |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| As a fan, I want to see a grid of artist cards with filter controls. | 1\. **FilterPanel** shows multi-select controls for **genreTags**, **moodTags**, **archetypes**. 2\. **ArtistGrid** renders a responsive grid of **ArtistCard** entries (image, name, archetype badge). 3\. Paging or infinite scroll loads more results dynamically. |

### **Data & API**

- **Endpoint**: `GET /api/artists?genre=…&mood=…&archetype=…&page=…&limit=…`

- **DB Table**: `artists` (fields: `slug`, `stage_name`, `archetypes[]`, `visual_lexicon->imageUrls`, `genre_tags[]`, `mood_tags[]`)

### **Components**

- **FilterPanel** (Client)

- **ArtistGrid** (Server)

- **ArtistCard** (Client)

## **4\. Prompt Examples for UI Generation**

- **FilterPanel**

  “Generate a **React 19** client component `FilterPanel` using `react-hook-form` and **shadcn/ui** Select controls. It should render three multi-select dropdowns for genre, mood, and archetype, then call an `onChange(filters)` callback.”

- **ArtistGrid**

  “Create a **Next.js 15** Server Component `ArtistGrid` that fetches from `/api/artists` with given filters, and renders a responsive Tailwind grid of `ArtistCard` items.”

- **ArtistCard**

  “Build a client component `ArtistCard` that accepts `{ name, imageUrl, archetype, slug }` and renders a clickable card (shadcn/ui Card) linking to `/artists/[slug]`, displaying the artist image, name, and an archetype badge.”
