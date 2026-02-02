# RepMax v2 — Seed Data for Full UX Testing

> **Purpose:** Every screen, every state, every user journey needs data behind it. This document defines the exact seed data per role so QA can test every flow without hitting empty states by accident.
>
> **Coverage:** MVP (Batches 1-8) + Phase 2A + Phase 2B + PRP Cleanup = 82 screens
>
> **Format:** Narrative-first (who these people are), then structured tables, then SQL-ready inserts

---

## Quick Reference: Seed Commands

```bash
# Full seed (recommended for complete testing)
npx tsx test/seed/seed-loader.ts seed

# Individual seeders
npx tsx test/seed/seed-loader.ts seed:users      # Auth users + profiles
npx tsx test/seed/seed-loader.ts seed:films      # Athlete films
npx tsx test/seed/seed-loader.ts seed:docs       # Athlete documents
npx tsx test/seed/seed-loader.ts seed:coach      # Tasks, notes, activities, roster links
npx tsx test/seed/seed-loader.ts seed:club       # Tournaments + teams + brackets
npx tsx test/seed/seed-loader.ts seed:pipeline   # Recruiter pipeline prospects
npx tsx test/seed/seed-loader.ts seed:parent     # Parent-athlete links + activity
npx tsx test/seed/seed-loader.ts seed:payments   # Tournament payments
npx tsx test/seed/seed-loader.ts seed:verify     # Verification queue items

# Cleanup
npx tsx test/seed/seed-loader.ts clean           # Remove all test data
npx tsx test/seed/seed-loader.ts reset           # Clean + re-seed
```

---

## Seed Data Architecture

```
                    ┌─────────────────────────────────┐
                    │     SOUTHWEST ZONE CLUSTER       │
                    │   (Primary test environment)     │
                    └─────────────┬───────────────────┘
                                  │
        ┌────────────┬────────────┼─────────────┬──────────────┐
        │            │            │             │              │
   ┌────▼────┐  ┌────▼────┐  ┌───▼─────┐  ┌───▼─────┐  ┌─────▼────┐
   │ ATHLETE │  │ PARENT  │  │  COACH  │  │RECRUITER│  │   CLUB   │
   │ Jaylen  │  │  Lisa   │  │ Davis   │  │Williams │  │   Mike   │
   │ Marcus  │  │  Karen  │  │         │  │Martinez │  │          │
   │ DeShawn │  │         │  │         │  │         │  │          │
   │ Sofia   │  │         │  │         │  │         │  │          │
   │ Tyler   │  │         │  │         │  │         │  │          │
   │+10 roster│  │         │  │         │  │         │  │          │
   └─────────┘  └─────────┘  └─────────┘  └─────────┘  └──────────┘

   15 athletes    2 parents    1 coach      2 recruiters   1 club org
   (varied        (linked +    (full        (different     (active
    completion)    unlinked)    roster)      pipelines)     tournaments)
```

---

## THE CAST

### Why These Specific People

Each test user exists to validate specific UX states. Nobody is random.

| User | Role | Exists to Test |
|------|------|----------------|
| Jaylen Washington | Athlete (ideal) | 100% complete profile, all features active, the "golden path" |
| Marcus Thompson | Athlete (partial) | 45% complete, missing film + some stats, upgrade prompts |
| DeShawn Harris | Athlete (new) | Just completed onboarding, minimal data, empty states |
| Sofia Rodriguez | Athlete (multi-role) | Athlete + Club volunteer, role switching |
| Tyler Chen | Athlete (empty) | Created account, abandoned onboarding, zero data |
| +10 roster athletes | Athletes | Coach Davis's team roster |
| Lisa Washington | Parent (linked) | Linked to Jaylen, full parent experience |
| Karen Thompson | Parent (unlinked) | Just signed up, hasn't linked yet, empty parent dashboard |
| Coach Davis | Coach | Full roster (12 athletes), tasks, notes, activity log |
| Coach Williams | Recruiter (TCU) | Active pipeline, shortlists, messages, visits scheduled |
| Coach Martinez | Recruiter (ASU) | Same department as hypothetical staff, territory assignments |
| Mike Torres | Club Organizer | 2 active tournaments, 12 teams, live brackets, payments flowing |

**All test accounts use password:** `TestPass123!`

---

## DASHBOARD-SPECIFIC SEED DATA REQUIREMENTS

### 1. ATHLETE DASHBOARD

**Required for full feature testing:**

```yaml
athlete_profile:
  - All measurables (height, weight, forty, vertical, bench, squat, etc.)
  - Academic data (GPA, SAT/ACT)
  - Bio and intangibles
  - Verified status
  - Photo/avatar

films:
  - At least 3 videos (highlight, game, camp)
  - View counts
  - Featured flag
  - Thumbnails

documents:
  - Transcript (verified)
  - Recommendation letter (verified)
  - Test scores (verified)

profile_views:
  - 30+ views over 30 days
  - Multiple viewer roles (recruiter, coach, parent)
  - Geographic distribution by zone
  - Section views (stats, film, academics)

shortlists:
  - 3-5 active shortlist entries
  - From different schools

notifications:
  - Profile view alerts
  - Shortlist alerts
  - Deadline reminders
  - Parent link notifications

messages:
  - 2+ active threads
  - Coach thread
  - Parent thread
```

**Tested by:** Jaylen (ideal), Marcus (partial), DeShawn (new), Tyler (empty)

---

### 2. PARENT DASHBOARD

**Required for full feature testing:**

```yaml
parent_athlete_links:
  - athlete_id: Jaylen Washington
  - relationship: "mother"
  - status: "active"
  - verified_at: timestamp

child_activity_feed:
  - Profile view events
  - Shortlist additions
  - Film updates
  - Message received events

schools_tracking:
  - Schools that shortlisted the athlete
  - Interest level (High Interest, Following, Offered)

calendar_events:
  - Recruiting deadlines
  - Camp invites
  - Visit dates
  - Signing periods

metrics:
  - Profile views (from athlete)
  - Unread coach messages
  - Schools tracking count
  - Upcoming deadlines count
```

**Tested by:** Lisa (linked to Jaylen), Karen (unlinked/empty)

---

### 3. COACH DASHBOARD

**Required for full feature testing:**

```yaml
coach_roster:
  - 12 athletes linked to coach
  - Various class years (2026, 2027, 2028)
  - Various positions
  - Various completion levels
  - Various offer counts

coach_tasks:
  - 6 tasks (mix of pending, in_progress, completed)
  - High/medium/low priorities
  - Due dates
  - Linked to specific athletes

coach_notes:
  - 5 notes on different athletes
  - Categories: recruiting, performance, academic, character
  - Timestamps

coach_activities:
  - 10 recent activities
  - Types: profile_view, film_view, note_added, message_sent, shortlist_add
  - Linked to athletes
  - Timestamps for sorting

metrics:
  - Total athletes count
  - With offers count
  - Committed count
  - Pending tasks count
```

**Tested by:** Coach Davis (full roster)

---

### 4. RECRUITER DASHBOARD

**Required for full feature testing:**

```yaml
recruiter_pipeline:
  - 30+ prospects across all stages
  - Stages: watching, evaluating, priority, offer_extended, committed
  - Notes per prospect
  - Added timestamps

shortlists:
  - 2 named lists
  - Multiple athletes per list
  - Notes per athlete

scheduled_visits:
  - 3 visits
  - Types: Junior Day, Unofficial, Official
  - Status: confirmed, pending

communication_logs:
  - 10+ entries
  - Types: call, email, message, visit
  - Linked to prospects

territory_assignments:
  - Zone assignments (SOUTHWEST, SOUTHEAST, WEST)
  - Target schools per zone

film_bookmarks:
  - Bookmarks on athlete films
  - Timestamps within videos
  - Notes per bookmark
```

**Tested by:** Coach Williams (TCU), Coach Martinez (ASU)

---

### 5. CLUB DASHBOARD

**Required for full feature testing:**

```yaml
tournaments:
  - 2 tournaments (registration_open, in_progress)
  - Full tournament data (dates, location, fees)
  - Capacity limits

tournament_teams:
  - 12 teams per tournament (6 per division: 16U, 18U)
  - Mix of paid/unpaid
  - Mix of verification status
  - Team rosters (10-14 athletes per team)

tournament_brackets:
  - Pool play structure
  - Completed games with scores
  - In-progress games (live scoring)
  - Upcoming games

live_game_data:
  - Current game in progress
  - Period/quarter
  - Time remaining
  - Score by period
  - Scoring log (plays)

verification_queue:
  - 5-10 pending verifications
  - Types: identity, academic, athletic
  - Timestamps

tournament_payments:
  - Payment per team
  - Status: completed, pending, failed
  - Amounts and dates

metrics:
  - Active events count
  - Total registrations
  - Total revenue
  - Pending verifications count
```

**Tested by:** Mike Torres (club organizer)

---

## TOURNAMENT TEAMS DATA (Club Dashboard)

### Winter Classic 2026 — 18U Division (6 teams)

```yaml
teams_18u:
  - team_id: team_001
    name: "Austin Aces"
    coach_name: "Marcus Rodriguez"
    contact_email: "coach.rodriguez@austinaces.com"
    division: "18U"
    registration_status: "confirmed"
    payment_status: "paid"
    payment_amount: 375
    payment_date: "2026-01-20T10:00:00Z"
    athletes_count: 12
    athletes_verified: 12
    pool: "A"
    roster:
      - { name: "Jordan Williams", position: "QB", jersey: 7, verified: true }
      - { name: "Chris Martinez", position: "WR", jersey: 11, verified: true }
      - { name: "DeMarcus Johnson", position: "RB", jersey: 22, verified: true }
      - { name: "Tyler Anderson", position: "WR", jersey: 3, verified: true }
      - { name: "Marcus Lee", position: "DB", jersey: 24, verified: true }
      - { name: "Devon Thomas", position: "LB", jersey: 54, verified: true }
      - { name: "Jaylen Moore", position: "OL", jersey: 72, verified: true }
      - { name: "Antonio Garcia", position: "DL", jersey: 90, verified: true }
      - { name: "Brandon Smith", position: "TE", jersey: 88, verified: true }
      - { name: "Isaiah Brown", position: "K", jersey: 1, verified: true }
      - { name: "Michael Davis", position: "S", jersey: 21, verified: true }
      - { name: "Nathan Clark", position: "CB", jersey: 5, verified: true }

  - team_id: team_002
    name: "Houston Heat"
    coach_name: "James Patterson"
    contact_email: "jpatterson@houstonheat.net"
    division: "18U"
    registration_status: "confirmed"
    payment_status: "paid"
    payment_amount: 375
    payment_date: "2026-01-22T14:30:00Z"
    athletes_count: 14
    athletes_verified: 14
    pool: "A"

  - team_id: team_003
    name: "Dallas Dragons"
    coach_name: "Robert Chen"
    contact_email: "chen@dallasdragons.org"
    division: "18U"
    registration_status: "confirmed"
    payment_status: "paid"
    payment_amount: 375
    payment_date: "2026-01-25T09:15:00Z"
    athletes_count: 13
    athletes_verified: 11
    pool: "A"
    # 2 athletes pending verification

  - team_id: team_004
    name: "San Antonio Storm"
    coach_name: "Luis Hernandez"
    contact_email: "hernandez@sastorm.com"
    division: "18U"
    registration_status: "confirmed"
    payment_status: "pending"  # UNPAID
    payment_amount: 375
    payment_date: null
    athletes_count: 12
    athletes_verified: 0  # No verifications until paid
    pool: "B"

  - team_id: team_005
    name: "Fort Worth Flames"
    coach_name: "Derek Washington"
    contact_email: "dwash@fwflames.net"
    division: "18U"
    registration_status: "confirmed"
    payment_status: "paid"
    payment_amount: 375
    payment_date: "2026-01-28T11:00:00Z"
    athletes_count: 11
    athletes_verified: 11
    pool: "B"

  - team_id: team_006
    name: "El Paso Eagles"
    coach_name: "Carlos Moreno"
    contact_email: "moreno@epeagles.org"
    division: "18U"
    registration_status: "confirmed"
    payment_status: "paid"
    payment_amount: 375
    payment_date: "2026-01-30T08:45:00Z"
    athletes_count: 12
    athletes_verified: 10
    pool: "B"
    # 2 athletes pending verification
```

### Winter Classic 2026 — 16U Division (6 teams)

```yaml
teams_16u:
  - team_id: team_007
    name: "Austin Jr Aces"
    coach_name: "Kevin Miller"
    division: "16U"
    registration_status: "confirmed"
    payment_status: "paid"
    athletes_count: 11
    athletes_verified: 11
    pool: "C"

  - team_id: team_008
    name: "Houston Jr Heat"
    coach_name: "Tony Nguyen"
    division: "16U"
    registration_status: "confirmed"
    payment_status: "paid"
    athletes_count: 12
    athletes_verified: 9
    pool: "C"
    # 3 athletes pending verification

  - team_id: team_009
    name: "Dallas Jr Dragons"
    coach_name: "Mike Thompson"
    division: "16U"
    registration_status: "confirmed"
    payment_status: "paid"
    athletes_count: 10
    athletes_verified: 10
    pool: "C"

  - team_id: team_010
    name: "San Antonio Jr Storm"
    coach_name: "Ray Garcia"
    division: "16U"
    registration_status: "confirmed"
    payment_status: "paid"
    athletes_count: 13
    athletes_verified: 13
    pool: "D"

  - team_id: team_011
    name: "Fort Worth Jr Flames"
    coach_name: "Steve Adams"
    division: "16U"
    registration_status: "confirmed"
    payment_status: "pending"  # UNPAID
    athletes_count: 11
    athletes_verified: 0
    pool: "D"

  - team_id: team_012
    name: "El Paso Jr Eagles"
    coach_name: "Juan Lopez"
    division: "16U"
    registration_status: "confirmed"
    payment_status: "paid"
    athletes_count: 12
    athletes_verified: 12
    pool: "D"
```

---

## TOURNAMENT BRACKETS DATA

### Winter Classic 2026 — 18U Bracket

```yaml
bracket_18u:
  format: "Pool Play → Single Elimination"
  pools:
    pool_a:
      teams: ["Austin Aces", "Houston Heat", "Dallas Dragons"]
      games:
        - game_id: "18U-PA-G1"
          home: "Austin Aces"
          away: "Houston Heat"
          score_home: 28
          score_away: 21
          status: "completed"
          winner: "Austin Aces"
          completed_at: "2026-02-15T10:30:00Z"

        - game_id: "18U-PA-G2"
          home: "Austin Aces"
          away: "Dallas Dragons"
          score_home: 35
          score_away: 14
          status: "completed"
          winner: "Austin Aces"
          completed_at: "2026-02-15T14:00:00Z"

        - game_id: "18U-PA-G3"
          home: "Houston Heat"
          away: "Dallas Dragons"
          score_home: 21
          score_away: 21
          status: "completed"
          winner: "tie"
          completed_at: "2026-02-15T17:30:00Z"

    pool_b:
      teams: ["San Antonio Storm", "Fort Worth Flames", "El Paso Eagles"]
      games:
        - game_id: "18U-PB-G1"
          home: "San Antonio Storm"
          away: "Fort Worth Flames"
          score_home: 14
          score_away: 7
          status: "in_progress"  # LIVE GAME
          period: "Q3"
          time_remaining: "4:32"
          scoring_log:
            - { time: "Q1 8:22", team: "San Antonio Storm", play: "TD Pass", scorer: "Marcus Johnson", points: 7 }
            - { time: "Q2 6:15", team: "Fort Worth Flames", play: "TD Run", scorer: "Chris Davis", points: 7 }
            - { time: "Q2 1:03", team: "San Antonio Storm", play: "TD Pass", scorer: "Tyler Williams", points: 7 }

        - game_id: "18U-PB-G2"
          home: "San Antonio Storm"
          away: "El Paso Eagles"
          score_home: null
          score_away: null
          status: "upcoming"
          scheduled_time: "2026-02-15T19:00:00Z"

        - game_id: "18U-PB-G3"
          home: "Fort Worth Flames"
          away: "El Paso Eagles"
          score_home: null
          score_away: null
          status: "upcoming"
          scheduled_time: "2026-02-16T09:00:00Z"

  elimination:
    semifinal_1:
      game_id: "18U-SF1"
      home: "Austin Aces"  # Pool A Winner
      away: "TBD"  # Pool B Runner-up
      status: "pending"
      scheduled_time: "2026-02-16T13:00:00Z"

    semifinal_2:
      game_id: "18U-SF2"
      home: "TBD"  # Pool B Winner
      away: "Houston Heat"  # Pool A Runner-up
      status: "pending"
      scheduled_time: "2026-02-16T15:00:00Z"

    final:
      game_id: "18U-F"
      status: "pending"
      scheduled_time: "2026-02-16T18:00:00Z"
```

### Winter Classic 2026 — 16U Bracket

```yaml
bracket_16u:
  format: "Pool Play → Single Elimination"
  # All pool play complete
  elimination:
    semifinal_1:
      game_id: "16U-SF1"
      home: "Austin Jr Aces"
      away: "San Antonio Jr Storm"
      status: "upcoming"
      scheduled_time: "2026-02-16T10:00:00Z"

    semifinal_2:
      game_id: "16U-SF2"
      home: "Dallas Jr Dragons"
      away: "El Paso Jr Eagles"
      status: "upcoming"
      scheduled_time: "2026-02-16T12:00:00Z"

    final:
      game_id: "16U-F"
      status: "pending"
      scheduled_time: "2026-02-16T16:00:00Z"
```

---

## VERIFICATION QUEUE DATA (Club Dashboard)

```yaml
verification_queue:
  pending:
    - id: "ver_001"
      athlete_name: "Tyler Evans"
      team: "Dallas Dragons"
      division: "18U"
      type: "identity"
      method: "photo_upload"
      submitted_at: "2026-02-14T16:30:00Z"
      status: "pending_review"

    - id: "ver_002"
      athlete_name: "Chris Park"
      team: "Dallas Dragons"
      division: "18U"
      type: "academic"
      method: "transcript_upload"
      submitted_at: "2026-02-14T15:00:00Z"
      status: "pending_review"
      notes: "GPA verification needed"

    - id: "ver_003"
      athlete_name: "Brandon Cole"
      team: "Houston Jr Heat"
      division: "16U"
      type: "athletic"
      method: "birth_certificate"
      submitted_at: "2026-02-14T14:00:00Z"
      status: "age_check_needed"
      notes: "Verify age for 16U eligibility"

    - id: "ver_004"
      athlete_name: "James Miller"
      team: "Houston Jr Heat"
      division: "16U"
      type: "identity"
      method: "qr_scan"
      submitted_at: "2026-02-14T12:00:00Z"
      status: "pending_review"

    - id: "ver_005"
      athlete_name: "David Wilson"
      team: "Houston Jr Heat"
      division: "16U"
      type: "identity"
      method: "photo_upload"
      submitted_at: "2026-02-14T11:30:00Z"
      status: "pending_review"

    - id: "ver_006"
      athlete_name: "Kevin Martinez"
      team: "El Paso Eagles"
      division: "18U"
      type: "academic"
      method: "transcript_upload"
      submitted_at: "2026-02-13T10:00:00Z"
      status: "pending_review"

    - id: "ver_007"
      athlete_name: "Antonio Lee"
      team: "El Paso Eagles"
      division: "18U"
      type: "identity"
      method: "photo_upload"
      submitted_at: "2026-02-12T09:00:00Z"
      status: "pending_review"

  recently_verified:
    - athlete_name: "Jordan Williams"
      team: "Austin Aces"
      checks: { identity: "pass", age: "pass", eligibility: "pass" }
      verified_at: "2026-02-14T08:30:00Z"
      verified_by: "Mike Torres"

    - athlete_name: "Marcus Lee"
      team: "Austin Aces"
      checks: { identity: "pass", age: "pass", eligibility: "warning_grade" }
      verified_at: "2026-02-14T08:35:00Z"
      verified_by: "Mike Torres"
```

---

## TOURNAMENT PAYMENTS DATA (Club Dashboard)

```yaml
tournament_payments:
  winter_classic_2026:
    summary:
      total_expected: 4500  # 12 teams × $375
      total_collected: 3750  # 10 teams paid
      outstanding: 750  # 2 teams unpaid
      platform_fee_rate: 0.15
      platform_fee_amount: 562.50
      net_payout: 3187.50
      next_payout_date: "2026-02-17T00:00:00Z"

    transactions:
      - id: "pmt_001"
        team: "Austin Aces"
        division: "18U"
        amount: 375
        status: "completed"
        payment_method: "stripe"
        paid_at: "2026-01-20T10:00:00Z"
        stripe_payment_id: "pi_3N..."

      - id: "pmt_002"
        team: "Houston Heat"
        division: "18U"
        amount: 375
        status: "completed"
        payment_method: "stripe"
        paid_at: "2026-01-22T14:30:00Z"

      - id: "pmt_003"
        team: "Dallas Dragons"
        division: "18U"
        amount: 375
        status: "completed"
        payment_method: "stripe"
        paid_at: "2026-01-25T09:15:00Z"

      - id: "pmt_004"
        team: "San Antonio Storm"
        division: "18U"
        amount: 375
        status: "pending"  # UNPAID
        payment_method: null
        paid_at: null
        reminder_sent_at: "2026-02-10T09:00:00Z"

      - id: "pmt_005"
        team: "Fort Worth Flames"
        division: "18U"
        amount: 375
        status: "completed"
        payment_method: "stripe"
        paid_at: "2026-01-28T11:00:00Z"

      - id: "pmt_006"
        team: "El Paso Eagles"
        division: "18U"
        amount: 375
        status: "completed"
        payment_method: "stripe"
        paid_at: "2026-01-30T08:45:00Z"

      - id: "pmt_007"
        team: "Austin Jr Aces"
        division: "16U"
        amount: 375
        status: "completed"
        payment_method: "stripe"
        paid_at: "2026-01-21T16:00:00Z"

      - id: "pmt_008"
        team: "Houston Jr Heat"
        division: "16U"
        amount: 375
        status: "completed"
        payment_method: "stripe"
        paid_at: "2026-01-23T10:00:00Z"

      - id: "pmt_009"
        team: "Dallas Jr Dragons"
        division: "16U"
        amount: 375
        status: "completed"
        payment_method: "stripe"
        paid_at: "2026-01-26T14:00:00Z"

      - id: "pmt_010"
        team: "San Antonio Jr Storm"
        division: "16U"
        amount: 375
        status: "completed"
        payment_method: "stripe"
        paid_at: "2026-01-27T09:00:00Z"

      - id: "pmt_011"
        team: "Fort Worth Jr Flames"
        division: "16U"
        amount: 375
        status: "pending"  # UNPAID
        payment_method: null
        paid_at: null
        reminder_sent_at: "2026-02-10T09:00:00Z"

      - id: "pmt_012"
        team: "El Paso Jr Eagles"
        division: "16U"
        amount: 375
        status: "completed"
        payment_method: "stripe"
        paid_at: "2026-01-31T12:00:00Z"
```

---

## PARENT DASHBOARD DATA

### Lisa Washington (Linked Parent)

```yaml
parent_dashboard:
  linked_athlete:
    id: "jaylen-washington-uuid"
    name: "Jaylen Washington"
    position: "QB"
    class_year: 2026
    gpa: 3.8
    school: "Riverside Poly HS"

  metrics:
    profile_views: 47
    profile_views_change: 12  # percent
    coach_messages: 3  # unread
    schools_tracking: 8
    upcoming_deadlines: 2

  activity_feed:
    - id: "act_001"
      type: "view"
      message: "TCU coach viewed Jaylen's profile"
      time: "2 hours ago"
      timestamp: "2026-01-30T14:00:00Z"

    - id: "act_002"
      type: "shortlist"
      message: "Jaylen added to Arizona State shortlist"
      time: "1 day ago"
      timestamp: "2026-01-29T10:00:00Z"

    - id: "act_003"
      type: "message"
      message: "New message from Coach Williams"
      time: "2 days ago"
      timestamp: "2026-01-28T16:00:00Z"

    - id: "act_004"
      type: "update"
      message: "Jaylen updated his highlight reel"
      time: "3 days ago"
      timestamp: "2026-01-27T12:00:00Z"

  schools_tracking:
    - name: "TCU"
      status: "High Interest"
      status_color: "text-green-400 bg-green-400/10"
      last_contact: "2026-01-30"

    - name: "Arizona State"
      status: "Following"
      status_color: "text-blue-400 bg-blue-400/10"
      last_contact: "2026-01-29"

    - name: "Oregon"
      status: "High Interest"
      status_color: "text-green-400 bg-green-400/10"
      last_contact: "2026-01-26"

    - name: "USC"
      status: "Following"
      status_color: "text-blue-400 bg-blue-400/10"
      last_contact: "2026-01-25"

    - name: "UCLA"
      status: "Following"
      status_color: "text-blue-400 bg-blue-400/10"
      last_contact: "2026-01-22"

  calendar_events:
    - id: "cal_001"
      date: "2026-02-15"
      title: "TCU Junior Day"
      type: "visit"

    - id: "cal_002"
      date: "2026-03-01"
      title: "Spring Combine Registration Deadline"
      type: "deadline"

    - id: "cal_003"
      date: "2026-03-15"
      title: "Oregon Camp Invite"
      type: "camp"

    - id: "cal_004"
      date: "2026-04-01"
      title: "Arizona State OV"
      type: "visit"
```

---

## RECRUITER DASHBOARD DATA

### Coach Williams (TCU) — Full Pipeline

```yaml
recruiter_dashboard:
  pipeline:
    watching:
      count: 12
      prospects:
        - name: "Andre Mitchell"
          position: "WR"
          school: "Allen High School"
          state: "TX"
          class: 2026
          stars: 3
          priority: "low"
          last_touch: "2026-01-20"
        # ... 11 more

    evaluating:
      count: 8
      prospects:
        - name: "DeShawn Harris"
          position: "WR"
          school: "North Gwinnett HS"
          state: "GA"
          class: 2026
          stars: 3
          priority: "medium"
          last_touch: "2026-01-25"
          note: "Speed receiver, watching spring film"
        # ... 7 more

    priority:
      count: 5
      prospects:
        - name: "Jaylen Washington"
          position: "QB"
          school: "Riverside Poly HS"
          state: "CA"
          class: 2026
          stars: 4
          priority: "high"
          last_touch: "2026-01-30"
          note: "Elite arm talent, dual threat. Campus visit scheduled Feb 20."
        # ... 4 more

    offer_extended:
      count: 3
      prospects:
        - name: "Michael Okonkwo"
          position: "QB"
          school: "Bishop Gorman"
          state: "NV"
          class: 2026
          stars: 4
          offer_date: "2026-01-20"
          status: "considering"
        # ... 2 more

    committed:
      count: 2
      prospects:
        - name: "Kyle Anderson"
          position: "DB"
          school: "Allen High School"
          state: "TX"
          class: 2026
          stars: 3
          commit_date: "2026-01-15"
          status: "verbal"
        # ... 1 more

  scheduled_visits:
    - prospect: "Jaylen Washington"
      date: "2026-02-20"
      time: "9:00 AM"
      type: "Junior Day"
      status: "confirmed"

    - prospect: "Brandon Cole"
      date: "2026-02-22"
      time: "10:00 AM"
      type: "Unofficial"
      status: "pending"

    - prospect: "Isaiah Reeves"
      date: "2026-03-05"
      time: "8:00 AM"
      type: "Official"
      status: "confirmed"

  communication_log:
    - date: "2026-01-30"
      prospect: "Jaylen Washington"
      type: "message"
      summary: "Sent visit confirmation details"
      staff: "Coach Williams"

    - date: "2026-01-28"
      prospect: "Andre Mitchell"
      type: "email"
      summary: "Follow-up on campus visit interest"
      staff: "Coach Williams"

    - date: "2026-01-25"
      prospect: "DeShawn Harris"
      type: "call"
      summary: "Initial contact with head coach"
      staff: "Coach Williams"

    - date: "2026-01-22"
      prospect: "Marcus Thompson"
      type: "message"
      summary: "Film request to HS coach"
      staff: "Coach Williams"

  film_bookmarks:
    - film: "Jaylen Washington - Junior Highlights"
      timestamp: 34
      note: "Great pocket awareness under pressure"

    - film: "Jaylen Washington - Junior Highlights"
      timestamp: 72
      note: "Strong downfield throw — 45 yards in the air"

    - film: "Jaylen Washington - Elite 11 Camp"
      timestamp: 15
      note: "4.55 forty — verified at camp"

  reports:
    funnel:
      watching: 12
      evaluating: 8
      priority: 5
      offer_extended: 3
      committed: 2

    conversion_rates:
      watching_to_evaluating: "67%"
      evaluating_to_priority: "63%"
      priority_to_offer: "60%"
      offer_to_commit: "67%"

    this_month:
      communications: 23
      visits_scheduled: 3
      offers_extended: 1
```

---

## DATABASE TABLES REQUIRED

### Core Tables

```sql
-- Already exist
profiles
athlete_profiles
parent_profiles
coach_profiles
recruiter_profiles
club_profiles
films
documents
messages

-- Need for dashboards
profile_views
shortlists
shortlist_athletes
parent_athlete_links
coach_roster
coach_tasks
coach_notes
coach_activities
recruiter_pipeline
recruiting_events

-- Need for club dashboard
tournaments
tournament_teams
tournament_team_athletes
tournament_brackets
tournament_games
tournament_scoring_log
tournament_payments
athlete_verifications
```

### New Tables Schema

```sql
-- Tournament Teams
CREATE TABLE tournament_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id),
  name VARCHAR(255) NOT NULL,
  coach_name VARCHAR(255),
  contact_email VARCHAR(255),
  division VARCHAR(50),
  pool VARCHAR(10),
  registration_status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_amount DECIMAL(10,2),
  payment_date TIMESTAMPTZ,
  athletes_count INT DEFAULT 0,
  athletes_verified INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tournament Team Athletes
CREATE TABLE tournament_team_athletes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES tournament_teams(id),
  athlete_id UUID REFERENCES profiles(id),
  name VARCHAR(255) NOT NULL,
  position VARCHAR(50),
  jersey_number INT,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tournament Games
CREATE TABLE tournament_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id),
  game_code VARCHAR(50),
  division VARCHAR(50),
  round VARCHAR(50),
  home_team_id UUID REFERENCES tournament_teams(id),
  away_team_id UUID REFERENCES tournament_teams(id),
  home_score INT,
  away_score INT,
  status VARCHAR(50) DEFAULT 'upcoming',
  period VARCHAR(10),
  time_remaining VARCHAR(20),
  scheduled_time TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tournament Scoring Log
CREATE TABLE tournament_scoring_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES tournament_games(id),
  team_id UUID REFERENCES tournament_teams(id),
  period VARCHAR(10),
  game_time VARCHAR(20),
  play_type VARCHAR(50),
  scorer_name VARCHAR(255),
  points INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tournament Payments
CREATE TABLE tournament_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id),
  team_id UUID REFERENCES tournament_teams(id),
  organizer_id UUID REFERENCES profiles(id),
  amount DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  stripe_payment_id VARCHAR(255),
  paid_at TIMESTAMPTZ,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Athlete Verifications
CREATE TABLE athlete_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES profiles(id),
  athlete_id UUID REFERENCES profiles(id),
  team_id UUID REFERENCES tournament_teams(id),
  athlete_name VARCHAR(255),
  type VARCHAR(50),
  method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## SEED EXECUTION ORDER

Run seed scripts in this order (respects foreign key dependencies):

```
1. seed_auth_users.sql              # All Supabase Auth users
2. seed_profiles.sql                # All profiles with roles
3. seed_athlete_profiles.sql        # Athlete-specific data
4. seed_parent_profiles.sql         # Parent profiles
5. seed_coach_profiles.sql          # Coach profiles
6. seed_recruiter_profiles.sql      # Recruiter profiles
7. seed_club_profiles.sql           # Club profiles
8. seed_films.sql                   # Athlete films
9. seed_documents.sql               # Athlete documents
10. seed_profile_views.sql          # Views for athletes
11. seed_shortlists.sql             # Recruiter shortlists
12. seed_shortlist_athletes.sql     # Athletes in shortlists
13. seed_parent_athlete_links.sql   # Parent-athlete connections
14. seed_coach_roster.sql           # Coach roster links
15. seed_coach_tasks.sql            # Coach tasks
16. seed_coach_notes.sql            # Coach notes
17. seed_coach_activities.sql       # Coach activity log
18. seed_recruiter_pipeline.sql     # Pipeline prospects
19. seed_tournaments.sql            # Tournament data
20. seed_tournament_teams.sql       # Teams registered
21. seed_tournament_team_athletes.sql # Team rosters
22. seed_tournament_games.sql       # Bracket games
23. seed_tournament_scoring.sql     # Scoring log
24. seed_tournament_payments.sql    # Payment records
25. seed_athlete_verifications.sql  # Verification queue
26. seed_messages.sql               # Message threads
27. seed_notifications.sql          # User notifications
28. seed_recruiting_events.sql      # Calendar events
```

---

## TEST MATRIX: Which User Tests Which Feature

| Dashboard | User | Tests |
|-----------|------|-------|
| **Athlete** | Jaylen | Full profile, all stats, films, documents, analytics |
| **Athlete** | Marcus | 45% profile, empty film, partial analytics |
| **Athlete** | Tyler | Empty everything, all empty states |
| **Parent** | Lisa | Linked to Jaylen, full activity, schools, calendar |
| **Parent** | Karen | Unlinked, empty dashboard, link flow |
| **Coach** | Davis | 12-athlete roster, tasks, notes, activities |
| **Recruiter** | Williams | 30+ pipeline, visits, comms, bookmarks |
| **Recruiter** | Martinez | Smaller pipeline, different territory |
| **Club** | Mike | 2 tournaments, 12 teams, live brackets, payments, verifications |

---

## STATE TESTING CHECKLIST

| State | Triggered By |
|-------|-------------|
| **Empty** | Tyler (athlete), Karen (parent), new accounts |
| **Loading** | Any user on slow connection |
| **Partial** | Marcus (45% profile) |
| **Ideal** | Jaylen (100% complete) |
| **Error** | Network failure, RLS denial |
| **Overload** | Coach Davis (12 athletes), Williams (31 prospects) |
| **Live** | Mike Torres (live tournament scoring) |
| **Unpaid** | San Antonio Storm, Fort Worth Jr Flames |
| **Pending** | Verification queue items |
