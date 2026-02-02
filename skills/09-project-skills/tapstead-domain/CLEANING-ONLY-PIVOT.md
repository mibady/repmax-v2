# Tapstead Cleaning-Only Pivot

## Overview

As of January 2025, Tapstead has pivoted from a multi-service home services marketplace to focusing exclusively on **house cleaning services**.

## What Changed

### Services Removed

The following services were previously offered but are now discontinued:

- Handyman Services
- Plumbing Services
- Electrical Services
- Interior Painting
- Pressure Washing
- Gutter Services
- Junk Removal
- Welding Services
- Fire Debris Removal
- Storm Damage Cleanup
- Emergency Disaster Cleanup

### Current Service Offering

**House Cleaning Only** - Professional cleaning with instant booking and fixed pricing:

| Home Size    | Price |
| ------------ | ----- |
| 1-2 Bedrooms | $149  |
| 3-4 Bedrooms | $199  |
| 5+ Bedrooms  | $299  |

**Subscription Discounts:**

- Weekly: 33% off
- Bi-Weekly: 27% off
- Monthly: 20% off

**Add-ons:**

- Deep Clean: +$75
- Move-in/Move-out: +$99
- Inside Oven: +$25
- Inside Fridge: +$25
- Interior Windows: +$45
- Garage Cleaning: +$50

### Quote System Removed

The quote request system has been removed. All cleaning services use instant booking with fixed pricing.

## Database Migration Notes

### Tables Retained (but may have unused columns)

- `quote_requests` - Table retained for historical data, but no new records will be created
- `services` - The `service_type` column now only contains `house_cleaning`

### Types Updated

- `ServiceType` in TypeScript now only includes `'house_cleaning'`
- Quote-related types are marked as deprecated

### No Schema Migration Required

The existing database schema is compatible. Old enum values remain in the database for backward compatibility but are no longer used in the application.

## Files Cleaned Up

### Removed Components

- `components/booking/booking-flow.tsx` (deprecated)
- `components/ai/agent-chat.tsx` (unused)
- `components/ai/voice-interface.tsx` (unused)
- `components/provider/schedule-manager-enhanced.tsx` (duplicate)
- `components/provider/stripe-connect-enhanced.tsx` (duplicate)

### Removed Services

- `lib/services/google-maps-status.ts` (status doc only)
- `lib/services/communication-status.ts` (status doc only)
- `lib/services/provider-management-status.ts` (status doc only)
- `lib/services/communication-complete.ts` (unused)
- `lib/services/unified-communication-service.ts` (unused)
- `lib/services/communication-system.ts` (unused)
- `lib/services/notification-service-enhanced.ts` (duplicate)
- `lib/ai/agents-enhanced.ts` (unused)

### Archived Files

- `archived/test-booking-flow.js`
- `archived/test-migration.js`
- `archived/test-provider-matching.sql`

## Updated Components

### Simplified for Cleaning-Only

- `components/booking/service-selection.tsx` - Now shows only house cleaning
- `components/booking/customer-info.tsx` - Removed quote flow logic
- `types/service-types.ts` - Simplified to cleaning service types only
- `types/database.ts` - ServiceType now only `'house_cleaning'`

## Authentication

The project uses **Supabase Auth** (migrated from Clerk in a previous refactor). No Clerk remnants remain in the codebase.

## Stripe Integration

Stripe product IDs for cleaning services remain unchanged:

- One-time cleanings: `prod_Sb12PLJ0A1LqCG`, `prod_Sb13pjCHAoKvfH`, `prod_Sb14WX6Z00Lm03`
- Weekly subscriptions: `prod_Sb17TbF8GPiVup`, `prod_Sb18qm2WYFPL54`, `prod_Sb19b4GQXy8ida`
- Bi-weekly subscriptions: `prod_Sb1BUZ29cgzC7M`, `prod_Sb1DsWl4LphBiK`, `prod_Sb1EWMyr1guvit`
- Monthly subscriptions: `prod_Sb1FkY1IlJNdUq`, `prod_Sb1F7kMgxpCxkP`, `prod_Sb1GKzVhdUvnjt`
- Add-ons: `prod_Sb1JGVxMBfKm81` (Deep Clean), `prod_Sb1MrGld1Aytkk` (Move-in/out)
