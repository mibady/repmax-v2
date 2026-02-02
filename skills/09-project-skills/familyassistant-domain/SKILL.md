---
name: familyassistant-domain
description: Domain knowledge for Family Assistant - A family logistics personal assistant app for managing schedules, activities, and daily coordination.
---

# Family Assistant Domain

## Product Overview

Family logistics and coordination platform:
- Shared family calendar
- Activity and event management
- Task assignments
- Meal planning
- Carpool coordination
- AI-powered scheduling assistant

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15+ (App Router) |
| UI | React 19, Tailwind CSS 4, shadcn/ui |
| Backend | Supabase |
| AI | OpenAI GPT-4 |
| Notifications | Push notifications |

## Core Entities

- `families` - Family groups
- `family_members` - Parents, children
- `events` - Calendar events
- `tasks` - To-do items
- `meals` - Meal plans
- `carpools` - Carpool schedules
- `reminders` - Notifications
- `ai_suggestions` - Smart recommendations

## Key Features

1. **Family Calendar** - Shared schedule, color-coded by member
2. **Task Manager** - Assign chores, track completion
3. **Meal Planner** - Weekly meals, grocery lists
4. **Carpool Coordinator** - Driving schedules, routes
5. **AI Assistant** - Smart scheduling, conflict detection
6. **Notifications** - Reminders for all family members

## Business Logic

### Scheduling Rules
- Detect conflicts across family members
- Suggest optimal times for activities
- Balance workload among parents
- Consider travel time between events

## Trigger Phrases

- "family assistant", "family calendar", "family logistics"
- "meal planning", "carpool", "chores"
- "family schedule", "kids activities"
