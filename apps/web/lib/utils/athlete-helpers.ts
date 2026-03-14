import { ZONE_METADATA, type ZoneCode } from "@/lib/data/zone-data";
import type { SupabaseClient } from "@supabase/supabase-js";

// DB zone enum values used in the athletes table
const ZONE_DB_VALUES: Record<ZoneCode, string> = {
  WEST: "West",
  SOUTHWEST: "Southwest",
  MIDWEST: "Midwest",
  SOUTHEAST: "Southeast",
  NORTHEAST: "Northeast",
  PLAINS: "Plains",
};

/**
 * Maps a 2-letter state code to the DB zone enum value.
 * Returns null if the state isn't in any zone.
 */
export function stateToZone(state: string): string | null {
  const upper = state.toUpperCase().trim();
  for (const [zoneCode, meta] of Object.entries(ZONE_METADATA)) {
    if (meta.states.includes(upper)) {
      return ZONE_DB_VALUES[zoneCode as ZoneCode];
    }
  }
  return null;
}

/**
 * Generates a unique repmax_id in the format REP-{INITIALS}-{YEAR}.
 * Handles collisions by appending a numeric suffix (REP-JW2-2026, REP-JW3-2026, etc.)
 */
export async function generateRepmaxId(
  supabase: SupabaseClient,
  fullName: string,
  classYear: number
): Promise<string> {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0]?.toUpperCase() || "X";
  const last = parts.length > 1 ? parts[parts.length - 1][0]?.toUpperCase() : "X";
  const initials = `${first}${last}`;
  const basePrefix = `REP-${initials}`;
  const year = classYear || new Date().getFullYear() + 1;

  // Check for existing IDs with this prefix and year
  const { data: existing } = await supabase
    .from("athletes")
    .select("repmax_id")
    .like("repmax_id", `REP-${initials}%-${year}`);

  if (!existing || existing.length === 0) {
    return `${basePrefix}-${year}`;
  }

  // Find the next available suffix
  const usedIds = new Set(existing.map((r) => r.repmax_id));
  if (!usedIds.has(`${basePrefix}-${year}`)) {
    return `${basePrefix}-${year}`;
  }

  for (let suffix = 2; suffix < 1000; suffix++) {
    const candidate = `REP-${initials}${suffix}-${year}`;
    if (!usedIds.has(candidate)) {
      return candidate;
    }
  }

  // Fallback: append random chars
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `REP-${initials}${rand}-${year}`;
}
