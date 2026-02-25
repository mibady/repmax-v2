#!/usr/bin/env bash
set -euo pipefail

# -----------------------------------------------------------------------------
# RepMax Staging Sync Helper
# -----------------------------------------------------------------------------
# Clones the production Supabase database into staging, masks PII, and reloads
# non-athlete seed data (club, admin, recruiter). This script is a template —
# fill in environment variables or source an .env file before running.
# -----------------------------------------------------------------------------
# Required env vars:
#   SUPABASE_PROD_DB_URL       - postgres:// connection string (service role)
#   SUPABASE_STAGING_DB_URL    - postgres:// connection string (service role)
#   SUPABASE_STAGING_SERVICE_ROLE_KEY - used by seed scripts
# Optional:
#   SUPABASE_PROD_STORAGE_BUCKET / SUPABASE_STAGING_STORAGE_BUCKET
#   ENABLE_SYNTHETIC_ATHLETES   - should remain "false" for staging
# -----------------------------------------------------------------------------

REQUIRED_VARS=(
  SUPABASE_PROD_DB_URL
  SUPABASE_STAGING_DB_URL
  SUPABASE_STAGING_SERVICE_ROLE_KEY
)

for var in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "[sync] Missing required env var: $var" >&2
    exit 1
  fi
fi

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DUMP_FILE="/tmp/repmax-prod-${TIMESTAMP}.dump"
MASK_SQL="supabase/masking/mask-staging.sql"

cleanup() {
  rm -f "$DUMP_FILE" >/dev/null 2>&1 || true
}
trap cleanup EXIT

# Step 1: Dump production DB
ECHO_PREFIX="[sync]"
echo "$ECHO_PREFIX Dumping production database to $DUMP_FILE ..."
pg_dump --dbname="$SUPABASE_PROD_DB_URL" --format=custom --file="$DUMP_FILE"

echo "$ECHO_PREFIX Restoring into staging (this drops existing data)..."
pg_restore \
  --dbname="$SUPABASE_STAGING_DB_URL" \
  --clean \
  --if-exists \
  --no-owner \
  "$DUMP_FILE"

# Step 2: Mask PII
if [[ -f "$MASK_SQL" ]]; then
  echo "$ECHO_PREFIX Running masking script ($MASK_SQL) ..."
  psql "$SUPABASE_STAGING_DB_URL" -f "$MASK_SQL"
else
  echo "$ECHO_PREFIX WARNING: Masking SQL not found at $MASK_SQL. Skipping anonymization."
fi

# Step 3 (optional): mirror Supabase Storage assets
if [[ -n "${SUPABASE_PROD_STORAGE_BUCKET:-}" && -n "${SUPABASE_STAGING_STORAGE_BUCKET:-}" ]]; then
  echo "$ECHO_PREFIX Mirroring storage from $SUPABASE_PROD_STORAGE_BUCKET to $SUPABASE_STAGING_STORAGE_BUCKET ..."
  echo "          TODO: implement storage sync (Upstash, rclone, or Supabase Storage API)."
fi

# Step 4: seed non-athlete fixtures (club, recruiter, admin)
# Extract the https://...supabase.co URL from the postgres connection string.
# If SUPABASE_STAGING_URL is set explicitly, prefer that; otherwise derive from DB URL.
STAGING_URL="${SUPABASE_STAGING_URL:-}"
if [[ -z "$STAGING_URL" ]]; then
  # SUPABASE_STAGING_DB_URL is like postgresql://postgres.<ref>:<pw>@aws-0-...pooler.supabase.com:6543/postgres
  # Extract the project ref and build the REST URL from it.
  REF=$(echo "$SUPABASE_STAGING_DB_URL" | sed -n 's|.*postgres\.\([a-z0-9]*\):.*|\1|p')
  if [[ -n "$REF" ]]; then
    STAGING_URL="https://${REF}.supabase.co"
  else
    echo "$ECHO_PREFIX WARNING: Could not derive SUPABASE_STAGING_URL from DB URL. Seed scripts may fail."
  fi
fi
export ENABLE_SYNTHETIC_ATHLETES="false"
export SUPABASE_URL="$STAGING_URL"
export NEXT_PUBLIC_SUPABASE_URL="$STAGING_URL"
export SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_STAGING_SERVICE_ROLE_KEY"

echo "$ECHO_PREFIX Seeding recruiter/club/admin fixtures ..."
npx tsx test/seed/seed-loader.ts seed:users
npx tsx test/seed/seed-loader.ts seed:club

echo "$ECHO_PREFIX Staging sync complete."
