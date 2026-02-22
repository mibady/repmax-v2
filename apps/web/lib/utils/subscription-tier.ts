// ---------------------------------------------------------------------------
// Subscription Tier Utilities
// Maps plan slugs (from Stripe/Supabase) to typed tier enums.
// Pure functions — no side effects, safe for server and client use.
// ---------------------------------------------------------------------------

export type AthleteTier = "basic" | "premium" | "pro";
export type RecruiterTier = "free" | "pro" | "team" | "ai";
export type SchoolTier = "none" | "small" | "medium" | "large";

// ---- Ordered tiers (index = rank) -----------------------------------------

const ATHLETE_TIERS: readonly AthleteTier[] = ["basic", "premium", "pro"];
const RECRUITER_TIERS: readonly RecruiterTier[] = ["free", "pro", "team", "ai"];
const SCHOOL_TIERS: readonly SchoolTier[] = ["none", "small", "medium", "large"];

// ---- Slug-to-tier maps -----------------------------------------------------

const ATHLETE_SLUG_MAP: Record<string, AthleteTier> = {
  "athlete-premium": "premium",
  "athlete-premium-annual": "premium",
  "athlete-pro": "pro",
  "athlete-pro-annual": "pro",
};

const RECRUITER_SLUG_MAP: Record<string, RecruiterTier> = {
  "recruiter-pro": "pro",
  "recruiter-pro-annual": "pro",
  "recruiter-team": "team",
  "recruiter-team-annual": "team",
  "recruiter-ai": "ai",
  "recruiter-ai-annual": "ai",
  // Legacy slugs (kept for migration compatibility)
  pro: "pro",
  team: "team",
  scout: "ai",
};

const SCHOOL_SLUG_MAP: Record<string, SchoolTier> = {
  "school-small": "small",
  "school-small-annual": "small",
  "school-medium": "medium",
  "school-medium-annual": "medium",
  "school-large": "large",
  "school-large-annual": "large",
};

// ---- Tier resolvers ---------------------------------------------------------

export function getAthleteTier(slug: string | null | undefined): AthleteTier {
  if (!slug) return "basic";
  return ATHLETE_SLUG_MAP[slug] ?? "basic";
}

export function getRecruiterTier(
  slug: string | null | undefined,
): RecruiterTier {
  if (!slug) return "free";
  return RECRUITER_SLUG_MAP[slug] ?? "free";
}

export function getSchoolTier(slug: string | null | undefined): SchoolTier {
  if (!slug) return "none";
  return SCHOOL_SLUG_MAP[slug] ?? "none";
}

// ---- Comparison helpers -----------------------------------------------------

function tierAtLeast<T>(
  tiers: readonly T[],
  current: T,
  minimum: T,
): boolean {
  return tiers.indexOf(current) >= tiers.indexOf(minimum);
}

export function athleteTierAtLeast(
  slug: string | null | undefined,
  minTier: AthleteTier,
): boolean {
  return tierAtLeast(ATHLETE_TIERS, getAthleteTier(slug), minTier);
}

export function recruiterTierAtLeast(
  slug: string | null | undefined,
  minTier: RecruiterTier,
): boolean {
  return tierAtLeast(RECRUITER_TIERS, getRecruiterTier(slug), minTier);
}

export function schoolTierAtLeast(
  slug: string | null | undefined,
  minTier: SchoolTier,
): boolean {
  return tierAtLeast(SCHOOL_TIERS, getSchoolTier(slug), minTier);
}
