---
name: credvona-domain
description: Domain knowledge for Credvona - AI-powered credit repair and financial education platform helping users understand and improve their credit scores.
---

# Credvona Domain

## Product Overview

AI-powered credit repair platform:
- Credit score analysis and tracking
- Dispute letter generation
- Financial education content
- Document analysis (credit reports)
- Personalized action plans

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router) |
| Backend | Supabase (PostgreSQL) |
| AI | OpenAI GPT-4 (document analysis) |
| Payments | Stripe |

## Core Entities

- `users` - Platform users
- `credit_profiles` - User credit data
- `credit_reports` - Uploaded reports
- `disputes` - Dispute letters/cases
- `creditors` - Creditor database
- `action_items` - Recommended actions
- `education_content` - Financial literacy
- `subscriptions` - Service tiers

## Key Features

1. **Credit Report Upload** - Parse and analyze reports
2. **AI Analysis** - Identify errors, suggest disputes
3. **Dispute Generator** - Auto-generate FCRA letters
4. **Score Simulator** - "What-if" scenarios
5. **Education Hub** - Credit building guides
6. **Progress Tracker** - Score improvement over time

## Credit Dispute Flow

1. Upload credit report (PDF)
2. AI extracts accounts and identifies issues
3. Generate dispute letters for errors
4. Track dispute status
5. Monitor score changes

## Trigger Phrases

- "credvona", "credit repair", "credit score"
- "dispute letter", "FCRA", "credit report"
- "financial education", "credit building"
