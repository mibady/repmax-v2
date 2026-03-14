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
  getProgramsByZone,
} from "@/lib/data/zone-data";
import { getCached, setCache } from "@/lib/utils/mcp-cache";

const zoneSchema = z.enum(["MIDWEST", "NORTHEAST", "PLAINS", "SOUTHEAST", "SOUTHWEST", "WEST"]);

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
        programs: getProgramsByZone(zoneCode),
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
      programs: getProgramsByZone(zoneCode),
      prospects,
    };

    setCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Zone API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
