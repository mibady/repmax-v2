import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ZoneCode, ZoneInfo, Program, Prospect } from "@/lib/data/zone-data";
import {
  DB_ZONE_TO_UI,
  UI_ZONE_TO_DB,
  ZONE_METADATA,
  ZONE_DISPLAY_NAMES,
  getPlaceholderImage,
} from "@/lib/data/zone-data";
import { getCached, setCache } from "@/lib/utils/mcp-cache";

const zoneSchema = z.enum(["MIDWEST", "NORTHEAST", "PLAINS", "SOUTHEAST", "SOUTHWEST", "WEST"]);

// Static programs data — no DB table for HS football programs
const PROGRAMS: Record<ZoneCode, Program[]> = {
  SOUTHWEST: [
    { id: "7c644cd5-ea93-49c9-85f4-9345e201dec2", team_name: "North Shore", city: "Houston", state: "TX", zone_code: "SOUTHWEST", current_rating: 891.164, state_rank: 1, current_record: "14-2", d1_prospect_count: 159 },
    { id: "064da9c8-77fd-48e6-a030-4cc7b3922267", team_name: "South Oak Cliff", city: "Dallas", state: "TX", zone_code: "SOUTHWEST", current_rating: 390.971, state_rank: 2, current_record: "14-1", d1_prospect_count: 159 },
    { id: "f992f604-7aed-4990-852a-aac71531be74", team_name: "DeSoto", city: "DeSoto", state: "TX", zone_code: "SOUTHWEST", current_rating: 86.377, state_rank: 3, current_record: "13-3", d1_prospect_count: 159 },
    { id: "fea929e6-60f2-43ea-9c70-53de4fef03d0", team_name: "Southlake Carroll", city: "Southlake", state: "TX", zone_code: "SOUTHWEST", current_rating: 86.324, state_rank: 4, current_record: "14-1", d1_prospect_count: 159 },
  ],
  SOUTHEAST: [
    { id: "se-1", team_name: "IMG Academy", city: "Bradenton", state: "FL", zone_code: "SOUTHEAST", current_rating: 950.0, state_rank: 1, current_record: "10-1", d1_prospect_count: 45 },
    { id: "se-2", team_name: "Buford", city: "Buford", state: "GA", zone_code: "SOUTHEAST", current_rating: 890.5, state_rank: 1, current_record: "15-0", d1_prospect_count: 32 },
    { id: "se-3", team_name: "Thompson", city: "Alabaster", state: "AL", zone_code: "SOUTHEAST", current_rating: 875.2, state_rank: 1, current_record: "14-1", d1_prospect_count: 28 },
  ],
  MIDWEST: [
    { id: "mw-1", team_name: "St. Edward", city: "Lakewood", state: "OH", zone_code: "MIDWEST", current_rating: 820.0, state_rank: 1, current_record: "14-1", d1_prospect_count: 22 },
    { id: "mw-2", team_name: "Loyola Academy", city: "Wilmette", state: "IL", zone_code: "MIDWEST", current_rating: 780.5, state_rank: 1, current_record: "12-2", d1_prospect_count: 18 },
  ],
  WEST: [
    { id: "w-1", team_name: "Mater Dei", city: "Santa Ana", state: "CA", zone_code: "WEST", current_rating: 920.0, state_rank: 1, current_record: "13-1", d1_prospect_count: 38 },
    { id: "w-2", team_name: "St. John Bosco", city: "Bellflower", state: "CA", zone_code: "WEST", current_rating: 905.0, state_rank: 2, current_record: "12-2", d1_prospect_count: 35 },
  ],
  NORTHEAST: [
    { id: "ne-1", team_name: "St. Joseph's Prep", city: "Philadelphia", state: "PA", zone_code: "NORTHEAST", current_rating: 780.0, state_rank: 1, current_record: "12-1", d1_prospect_count: 15 },
    { id: "ne-2", team_name: "Don Bosco Prep", city: "Ramsey", state: "NJ", zone_code: "NORTHEAST", current_rating: 760.0, state_rank: 1, current_record: "11-2", d1_prospect_count: 12 },
  ],
  PLAINS: [
    { id: "pl-1", team_name: "De Smet Jesuit", city: "St. Louis", state: "MO", zone_code: "PLAINS", current_rating: 720.0, state_rank: 1, current_record: "10-3", d1_prospect_count: 8 },
  ],
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ zone: string }> }
) {
  try {
    const { zone } = await params;

    const supabase = await createClient();

    const upperZone = zone.toUpperCase();

    const validZone = zoneSchema.safeParse(upperZone);
    if (!validZone.success) {
      return NextResponse.json({ error: "Invalid zone" }, { status: 400 });
    }

    const zoneCode = validZone.data as ZoneCode;
    const cacheKey = `zone-${zoneCode}`;

    const cached = getCached<{ zone: ZoneInfo; programs: Program[]; prospects: Prospect[] }>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const dbZones = UI_ZONE_TO_DB[zoneCode];
    const meta = ZONE_METADATA[zoneCode];

    // PLAINS has no DB athletes — return static metadata only
    if (dbZones.length === 0) {
      const result = {
        zone: {
          zone_code: zoneCode,
          zone_name: ZONE_DISPLAY_NAMES[zoneCode],
          states: meta.states,
          metro_areas: meta.metro_areas,
          description: meta.description,
          total_recruits: 0,
          blue_chip_count: 0,
          pending_alerts: 0,
          upcoming_events_30d: 0,
        } as ZoneInfo,
        programs: PROGRAMS[zoneCode] || [],
        prospects: [] as Prospect[],
      };
      setCache(cacheKey, result);
      return NextResponse.json(result);
    }

    const { data: rows, error } = await supabase
      .from("athletes")
      .select("id, primary_position, high_school, class_year, star_rating, zone, state, city, profile_id, profiles(full_name, avatar_url)")
      .in("zone", dbZones)
      .order("star_rating", { ascending: false, nullsFirst: false });

    if (error) {
      console.error("Zone detail query error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const athletes = rows ?? [];
    let blueChipCount = 0;
    const prospects: Prospect[] = athletes.map((a) => {
      if ((a.star_rating ?? 0) >= 4) blueChipCount++;
      const profileArr = a.profiles as unknown as { full_name: string; avatar_url: string | null }[] | null;
      const profile = profileArr?.[0] ?? null;
      return {
        id: a.id,
        full_name: profile?.full_name ?? "Unknown",
        position: a.primary_position,
        high_school: a.high_school,
        class_year: a.class_year,
        star_rating: a.star_rating ?? 0,
        zone_code: DB_ZONE_TO_UI[a.zone as string] ?? zoneCode,
        commitment_status: "uncommitted",
        committed_team: null,
        image_url: profile?.avatar_url || getPlaceholderImage(a.id),
      };
    });

    const zoneInfo: ZoneInfo = {
      zone_code: zoneCode,
      zone_name: ZONE_DISPLAY_NAMES[zoneCode],
      states: meta.states,
      metro_areas: meta.metro_areas,
      description: meta.description,
      total_recruits: athletes.length,
      blue_chip_count: blueChipCount,
      pending_alerts: 0,
      upcoming_events_30d: 0,
    };

    const result = {
      zone: zoneInfo,
      programs: PROGRAMS[zoneCode] || [],
      prospects,
    };

    setCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Zone API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
