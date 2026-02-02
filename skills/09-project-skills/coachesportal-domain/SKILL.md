---
name: coachesportal-domain
description: Domain knowledge for Coaches Portal - Dual-platform coaching marketplace with Web (Next.js) and Mobile (Expo) sharing a single Supabase backend.
---

# Coaches Portal Domain

## Product Overview

Dual-platform coaching job marketplace:
- **Web App** - Next.js for employers/schools
- **Mobile App** - Expo for coaches
- Shared Supabase backend

## Tech Stack

| Layer | Technology |
|-------|------------|
| Web | Next.js 15, shadcn/ui |
| Mobile | Expo, React Native |
| Shared | TypeScript, Zod schemas |
| Backend | Supabase |
| Payments | Stripe |

## Project Structure

```
coaches-portal/
├── packages/shared/     # Shared types, constants
├── coaches-portal-web/  # Next.js web app
└── coaches-portal-mobile/ # Expo mobile app
```

## Core Entities

- `coaches` - Coach profiles, certifications
- `employers` - Schools, organizations
- `jobs` - Coaching job listings
- `applications` - Job applications
- `messages` - In-app messaging
- `reviews` - Coach/employer reviews
- `subscriptions` - Premium features

## Key Features

### For Coaches (Mobile)
1. Browse job listings
2. Apply with profile
3. Message employers
4. Track applications
5. Receive notifications

### For Employers (Web)
1. Post job listings
2. Search coach database
3. Review applications
4. Message candidates
5. Manage hiring pipeline

## Trigger Phrases

- "coaches portal", "coaching jobs", "sports coaching"
- "job marketplace", "coach hiring"
- "employer dashboard", "coach profile"
