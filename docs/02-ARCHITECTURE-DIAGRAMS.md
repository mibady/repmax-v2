# RepMax v2 — Architecture Diagrams

## 1. Stitch Workflow Stage Flow

```mermaid
flowchart TD
    S1[Stage 1: Light PRP<br/>Business Requirements<br/>0.5 days] --> S2
    S2[Stage 2: UX Planning<br/>Journeys · States · Friction<br/>1.5 days] --> S3
    S3[Stage 3: Copywriting<br/>Every word in the app<br/>1 day] --> S4
    S4[Stage 4: Stitch Prompts<br/>26 design briefs + copy<br/>1 day] --> S5
    S5[Stage 5: Stitch Design<br/>Visual sign-off<br/>1.5 days]

    S5 --> GATE{SIGN-OFF GATE<br/>No code before this}

    GATE --> S6[Stage 6: Data Model<br/>Validate schemas<br/>0.5 days]
    S6 --> S7[Stage 7: Backend<br/>Migrations · RLS · Sanity<br/>1.5 days]
    S6 --> S8[Stage 8: Integration<br/>Hooks · Actions · Types<br/>0.5 days]
    S7 --> S9
    S8 --> S9[Stage 9: Stitch → Code<br/>Convert to React<br/>2 days]
    S9 --> S10[Stage 10: Wiring<br/>Connect UI to backend<br/>2 days]
    S10 --> S11[Stage 11: Integration Audit<br/>Cross-dashboard flows<br/>1 day]
    S11 --> S12[Stage 12: Quality Gates<br/>Tests · Performance<br/>1 day]
    S12 --> S13[Stage 13: Agent Handoff<br/>CLAUDE.md + commands<br/>0.5 days]
    S13 --> SHIP[🚀 Ship]

    style S1 fill:#374151,stroke:#6B7280,color:#F9FAFB
    style S2 fill:#374151,stroke:#6B7280,color:#F9FAFB
    style S3 fill:#374151,stroke:#6B7280,color:#F9FAFB
    style S4 fill:#374151,stroke:#6B7280,color:#F9FAFB
    style S5 fill:#374151,stroke:#6B7280,color:#F9FAFB
    style GATE fill:#DC2626,stroke:#EF4444,color:#FFF
    style S6 fill:#1E3A5F,stroke:#3B82F6,color:#F9FAFB
    style S7 fill:#1E3A5F,stroke:#3B82F6,color:#F9FAFB
    style S8 fill:#1E3A5F,stroke:#3B82F6,color:#F9FAFB
    style S9 fill:#1E3A5F,stroke:#3B82F6,color:#F9FAFB
    style S10 fill:#1E3A5F,stroke:#3B82F6,color:#F9FAFB
    style S11 fill:#065F46,stroke:#10B981,color:#F9FAFB
    style S12 fill:#065F46,stroke:#10B981,color:#F9FAFB
    style S13 fill:#065F46,stroke:#10B981,color:#F9FAFB
    style SHIP fill:#7C3AED,stroke:#A78BFA,color:#FFF
```

## 2. Entity Relationship Diagram

```mermaid
erDiagram
    PROFILES ||--o{ TEAM_ROSTERS : "athlete on roster"
    PROFILES ||--o{ TEAMS : "coach manages"
    PROFILES ||--o{ COACH_TASKS : "assigned to"
    PROFILES ||--o{ ACTIVITY_LOG : "activity about"
    PROFILES ||--o{ COACH_NOTES : "note about"
    PROFILES ||--o{ RECRUITER_SHORTLISTS : "shortlisted"
    PROFILES ||--o{ PROFILE_VIEWS : "viewed"
    PROFILES ||--o{ DOCUMENTS : "uploaded by"

    TEAMS ||--o{ TEAM_ROSTERS : "has players"
    TEAMS ||--o{ COACH_TASKS : "tasks for"
    TEAMS ||--o{ ACTIVITY_LOG : "activity for"
    TEAMS ||--o{ COLLEGE_RELATIONSHIPS : "tracks"
    TEAMS ||--o{ COACH_NOTES : "notes for"
    TEAMS ||--o{ RECRUITING_EVENTS : "events for"

    PROFILES {
        uuid id PK
        text repmax_id UK
        text full_name
        text position
        text grad_year
        text school
        text city
        text state
        text photo_url
        text cutout_url
        boolean is_verified
        decimal gpa
        decimal weighted_gpa
        text highlight_video_url
        text player_summary
        text intangibles
        text coach_contact_name
        text coach_contact_phone
        text coach_contact_email
        text_array roles
    }

    TEAMS {
        uuid id PK
        uuid coach_id FK
        text school_name
        text city
        text state
        text zone
        text logo_url
    }

    TEAM_ROSTERS {
        uuid id PK
        uuid team_id FK
        uuid athlete_id FK
        int jersey_number
        text position
        text status
    }

    COACH_TASKS {
        uuid id PK
        uuid team_id FK
        uuid coach_id FK
        uuid athlete_id FK
        text type
        text title
        timestamptz due_date
        text priority
        boolean completed
    }

    ACTIVITY_LOG {
        uuid id PK
        uuid team_id FK
        uuid athlete_id FK
        uuid created_by FK
        text type
        text college
        text description
        jsonb metadata
    }

    COLLEGE_RELATIONSHIPS {
        uuid id PK
        uuid team_id FK
        text college_name
        text heat
        int athletes_interested
        int upcoming_visits
    }

    COACH_NOTES {
        uuid id PK
        uuid team_id FK
        uuid coach_id FK
        uuid athlete_id FK
        text content
        text category
        boolean pinned
    }

    RECRUITING_EVENTS {
        uuid id PK
        uuid team_id FK
        uuid created_by FK
        uuid_array athlete_ids
        text type
        text title
        timestamptz start_date
    }

    RECRUITER_SHORTLISTS {
        uuid id PK
        uuid recruiter_id FK
        uuid athlete_id FK
        text notes
        text status
    }

    PROFILE_VIEWS {
        uuid id PK
        uuid athlete_id FK
        uuid viewer_id FK
        text viewer_role
        text source
    }

    DOCUMENTS {
        uuid id PK
        uuid athlete_id FK
        text category
        text file_url
    }
```

## 3. User Flow — Athlete Creates Profile → Coach Adds → Recruiter Finds

```mermaid
sequenceDiagram
    participant A as Athlete (Marcus)
    participant App as RepMax App
    participant DB as Supabase
    participant C as Coach (Davis)
    participant R as Recruiter (Williams)
    participant Pub as Public URL

    Note over A,Pub: PHASE 1: Athlete Creates Profile
    A->>App: Sign up (Clerk auth)
    App->>DB: Create profile row
    DB-->>App: RepMax ID generated (REP-ABC)
    App-->>A: Welcome! Complete your profile
    A->>App: Fill metrics, academics, upload film
    App->>DB: Update profile fields
    App-->>A: Your Companion Card is ready! ✓

    Note over A,Pub: PHASE 2: Coach Adds to Roster
    C->>App: Login → Team Dashboard
    C->>App: "+ Add Athlete" → enter REP-ABC
    App->>DB: Search profiles by repmax_id
    DB-->>App: Marcus Johnson found
    App-->>C: Confirm: Add Marcus Johnson?
    C->>App: Confirm
    App->>DB: Insert team_rosters row
    App-->>C: Marcus added to roster ✓

    Note over A,Pub: PHASE 3: Coach Logs Activity
    C->>App: Marcus's card → Log Activity
    C->>App: Type: Offer, College: Texas A&M
    App->>DB: Insert activity_log row
    App->>DB: Update/insert college_relationship
    App-->>C: Activity logged ✓

    Note over A,Pub: PHASE 4: Recruiter Discovers
    R->>App: Login → Recruiter Dashboard → Search
    R->>App: Filter: QB, Southwest zone, 2026
    App->>DB: Query profiles + metrics
    DB-->>App: Results including Marcus
    R->>App: Click Marcus's card
    App->>DB: Fetch companion card data
    App->>DB: Log profile_view
    DB-->>App: Full companion card data
    App-->>R: Companion Card displayed

    Note over A,Pub: PHASE 5: Recruiter Shortlists
    R->>App: Click ⭐ Shortlist
    App->>DB: Insert recruiter_shortlists row
    App-->>R: Added to shortlist ✓

    Note over A,Pub: PHASE 6: Public Sharing
    A->>App: Click Share → Copy Link
    App-->>A: repmax.com/athletes/REP-ABC/card
    A->>Pub: Shares on Twitter/text
    Pub->>DB: Fetch by repmax_id (public read)
    Pub-->>Pub: SSR render with OG tags
```

## 4. Dashboard Layout — Team Dashboard Grid

```mermaid
block-beta
    columns 5

    Header["HEADER / NAV BAR"]:5

    space:5

    block:sidebar:1
        Tasks["📋 Tasks Widget"]
        Activity["📊 Activity Feed"]
        Colleges["🏈 College Heat"]
        Calendar["📅 Calendar"]
        Notes["📝 Coach Notes"]
        Actions["⚡ Quick Actions"]
    end

    block:main:4
        block:statsrow:4
            Logo["🏫<br/>Team Logo"]
            Stats["Stats 2x2<br/>Roster | Verified<br/>PWO | Committed"]
            QR["QR Code"]
            ZoneMap["Zone Map"]
        end

        Filters["🔍 Search | Position ▾ | Year ▾ | Zone ▾ | Status ▾ | Grid/List | + Add"]:4

        block:grid:4
            Card1["Athlete<br/>Card 1"]
            Card2["Athlete<br/>Card 2"]
            Card3["Athlete<br/>Card 3"]
            Card4["Athlete<br/>Card 4"]
            Card5["Athlete<br/>Card 5"]
            Card6["Athlete<br/>Card 6"]
            Card7["Athlete<br/>Card 7"]
            Card8["Athlete<br/>Card 8"]
        end
    end

    style Header fill:#1F2937,color:#F9FAFB
    style sidebar fill:#111827,color:#F9FAFB
    style main fill:#1F2937,color:#F9FAFB
    style statsrow fill:#374151,color:#F9FAFB
    style Filters fill:#374151,color:#F9FAFB
    style grid fill:#1F2937,color:#F9FAFB
```

## 5. Multi-Role Switching Flow

```mermaid
stateDiagram-v2
    [*] --> Login

    Login --> RoleCheck: Clerk auth success

    RoleCheck --> SingleRole: roles.length === 1
    RoleCheck --> MultiRole: roles.length > 1

    SingleRole --> AthleteDash: role === 'athlete'
    SingleRole --> ParentDash: role === 'parent'
    SingleRole --> TeamDash: role === 'team'
    SingleRole --> RecruiterDash: role === 'recruiter'
    SingleRole --> ClubDash: role === 'club'

    MultiRole --> RoleSelector: Show role picker
    RoleSelector --> AthleteDash: Select Athlete
    RoleSelector --> ParentDash: Select Parent
    RoleSelector --> TeamDash: Select HS Coach
    RoleSelector --> RecruiterDash: Select Recruiter
    RoleSelector --> ClubDash: Select Club

    TeamDash --> RoleSwitcher: Header dropdown
    ClubDash --> RoleSwitcher: Header dropdown
    RoleSwitcher --> TeamDash: Switch to HS Coach
    RoleSwitcher --> ClubDash: Switch to Club

    note right of RoleSwitcher
        Most common multi-role:
        HS Coach + Club Organizer
        (same person, different hat)
    end note
```

## 6. Sanity CMS Content Flow

```mermaid
flowchart LR
    subgraph Editorial["SANITY STUDIO (Editors)"]
        E1[Create Zone Content]
        E2[Add College Profiles]
        E3[Add Recruiter Entries]
        E4[Create Camp Listings]
        E5[Write Success Stories]
    end

    subgraph CDN["SANITY CDN"]
        C1[(Zone Documents)]
        C2[(College Documents)]
        C3[(Recruiter Documents)]
        C4[(Camp Documents)]
        C5[(Story Documents)]
    end

    subgraph App["REPMAX APP"]
        A1[Zone Intelligence Widget<br/>Athlete Dashboard]
        A2[Zone Map<br/>Team Dashboard]
        A3[Zone Landing Page<br/>Public]
        A4[College Cards<br/>All Dashboards]
        A5[Camp Calendar<br/>Sidebar Widget]
    end

    E1 --> C1
    E2 --> C2
    E3 --> C3
    E4 --> C4
    E5 --> C5

    C1 -->|GROQ Query| A1
    C1 -->|GROQ Query| A2
    C1 -->|GROQ Query| A3
    C2 -->|GROQ Query| A4
    C4 -->|GROQ Query| A5

    style Editorial fill:#374151,stroke:#6B7280,color:#F9FAFB
    style CDN fill:#1E3A5F,stroke:#3B82F6,color:#F9FAFB
    style App fill:#065F46,stroke:#10B981,color:#F9FAFB
```

## 7. Companion Card Rendering Contexts

```mermaid
flowchart TD
    CC[Companion Card Component]

    CC -->|mode=edit| AD[Athlete Dashboard<br/>Owner edits their card]
    CC -->|mode=view| PD[Parent Dashboard<br/>View child's card]
    CC -->|mode=view| TD[Team Dashboard<br/>Coach views roster cards]
    CC -->|mode=view| RD[Recruiter Dashboard<br/>Evaluating prospects]
    CC -->|mode=view| PUB[Public Route<br/>/athletes/REP-ABC/card]
    CC -->|mode=preview| MKT[Marketing Page<br/>Mock data demo]

    AD ---|useCompanionCard hook| SUP[(Supabase)]
    PD ---|useCompanionCard hook| SUP
    TD ---|useCompanionCard hook| SUP
    RD ---|useCompanionCard hook| SUP
    PUB ---|getCompanionCardByRepmaxId SSR| SUP
    MKT ---|Static mock data| MOCK[Mock JSON]

    style CC fill:#7C3AED,stroke:#A78BFA,color:#FFF
    style AD fill:#374151,stroke:#6B7280,color:#F9FAFB
    style PD fill:#374151,stroke:#6B7280,color:#F9FAFB
    style TD fill:#374151,stroke:#6B7280,color:#F9FAFB
    style RD fill:#374151,stroke:#6B7280,color:#F9FAFB
    style PUB fill:#DC2626,stroke:#EF4444,color:#FFF
    style MKT fill:#065F46,stroke:#10B981,color:#F9FAFB
```
