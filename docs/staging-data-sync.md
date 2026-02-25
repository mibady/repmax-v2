# Staging Data Sync Plan

## Why we need this
- **Real UX coverage**: our school/athlete flows must run against the same roster, onboarding, and messaging data that production users see.
- **Safe experimentation**: staging gives PMs and QA a playground that mirrors production without touching live users.
- **Deterministic tests**: Playwright journeys and manual QA can finally assert against meaningful dashboards instead of empty placeholders.

## High-level workflow
1. **Clone production → staging nightly** (or ad‑hoc before a release).
2. **Mask sensitive fields** (emails, phone numbers, guardian info) while keeping relational integrity.
3. **Refresh Supabase storage objects** (if/when athletes upload media).
4. **Load non-athlete fixtures** (club, recruiter, admin) with the existing seed commands.
5. **Run automated journeys** against staging with real persona credentials.

## Required tooling
- `supabase` CLI (`npm i -g supabase` or `brew install supabase/tap/supabase`).
- `pg_dump` and `psql` (ships with Postgres / Supabase CLI Docker image).
- Service-role keys for both environments.
- Access to Supabase project IDs (production + staging).

## Environment variables
Add the following to your CI secrets or local shell before running syncs:

| Variable | Description |
|----------|-------------|
| `SUPABASE_PROD_DB_URL` | `postgresql://...` connection string for production (service role) |
| `SUPABASE_STAGING_DB_URL` | Connection string for staging project |
| `SUPABASE_PROD_STORAGE_BUCKET` | (optional) bucket ID for athlete uploads |
| `SUPABASE_STAGING_STORAGE_BUCKET` | (optional) destination bucket |
| `SUPABASE_STAGING_ANON_KEY` | Used by Playwright/tests when hitting staging |
| `SUPABASE_STAGING_SERVICE_ROLE_KEY` | Used by server-side scripts/tests |

Create an `.env.staging` file (see `apps/web/.env.staging.example`) and load it for local dev / Playwright:

```bash
set -a && . apps/web/.env.staging && set +a
```

## Data sync script
We ship `scripts/sync-staging-from-prod.sh` as a template:

1. Dumps production with `pg_dump --format=custom`.
2. Restores into staging via `pg_restore --clean --no-owner`.
3. Runs `supabase/masking/mask-staging.sql` to scrub PII.
4. Optionally syncs Supabase Storage via `rsync` + signed URLs (placeholder hook in the script).

> ⚠️ The script intentionally stops if required env vars are missing. Wire it into CI/CD (GitHub Actions, Jenkins, etc.) once you’ve filled the secrets.

## PII masking
`supabase/masking/mask-staging.sql` contains safe defaults:

- Hashes athlete/parent emails → `<hash>@staging.repmax.io`.
- Blanks phone numbers, guardian notes, addresses.
- Keeps roster metadata (positions, class_year) so dashboards look real.

You can extend the SQL file as needed. It runs immediately after the restore step.

## Playwright + QA configuration
1. Set `PLAYWRIGHT_TEST_BASE_URL=https://staging.repmax.app` (or tunnel URL).
2. Provide real persona credentials via secrets:
   - `PLAYWRIGHT_TEST_EMAIL_WILSON`, `PLAYWRIGHT_TEST_PASSWORD_WILSON`
   - `PLAYWRIGHT_TEST_EMAIL_SIERRACANYON`, ...
3. Update `apps/web/journeys/*.json` to reference these env keys.
4. Run journeys sequentially for any persona that mutates shared data.

## Validation checklist after each sync
- [ ] Staging Supabase shows the latest production rosters / offers.
- [ ] Masking script ran (spot-check a few parent emails to ensure obfuscation).
- [ ] Storage assets (if mirrored) load on `/athlete` and `/recruiter` dashboards.
- [ ] Playwright `02-onboarding` group passes against staging.
- [ ] Manual smoke: log in as at least one school coach and athlete.

## Ongoing maintenance
- Run the sync nightly, plus on demand before major QA pushes.
- Keep the masking SQL in version control and review before production schema changes.
- Extend the Playwright persona list as new schools/roles onboard.
- If production adds parents/club organizers, remove the synthetic counterparts from the default seed to avoid conflicts.
