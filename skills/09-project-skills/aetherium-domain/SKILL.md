---
name: aetherium-domain
description: Domain knowledge for Aetherium AI 2.0 - Mobile-First MLM Platform with AI Assistant using Face → Head → DNA Architecture.
---

# Aetherium Domain

## Product Overview

Mobile-first MLM (Multi-Level Marketing) platform featuring:
- AI-powered business assistant
- Binary tree network visualization
- Commission tracking and payouts
- Team management and recruitment
- Compliance monitoring

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | Expo (React Native) |
| Web | Next.js (admin dashboard) |
| Backend | Supabase |
| AI | OpenAI GPT-4, Claude |
| Payments | Stripe |

## Core Entities

- `users` - Members/distributors
- `networks` - Binary tree relationships
- `commissions` - Earnings and payouts
- `ranks` - Achievement levels
- `products` - MLM products
- `orders` - Product purchases
- `team_volume` - Sales volume tracking
- `compliance_logs` - Regulatory compliance

## Business Logic

### Binary Tree Structure
- Each member has max 2 direct downlines (left/right)
- Volume calculated from weaker leg
- Ranks based on team volume thresholds

### Commission Types
1. **Direct Sales** - Personal product sales
2. **Binary Bonus** - Team volume matching
3. **Leadership Bonus** - Rank-based overrides
4. **Matching Bonus** - Downline earnings match

## Key Features

1. **AI Assistant** - Business coaching, objection handling
2. **Network Visualizer** - Interactive binary tree
3. **Rank Tracker** - Progress to next rank
4. **Commission Dashboard** - Earnings breakdown
5. **Compliance Checker** - FTC/legal compliance

## Trigger Phrases

- "aetherium", "mlm platform", "network marketing"
- "binary tree", "commission", "downline"
- "rank advancement", "team volume"
