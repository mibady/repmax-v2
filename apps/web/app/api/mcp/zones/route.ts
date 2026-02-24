import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ZoneCode, ZoneInfo } from "@/lib/data/zone-data";
import { DB_ZONE_TO_UI, ZONE_METADATA, ZONE_DISPLAY_NAMES } from "@/lib/data/zone-data";
import { getCached, setCache } from "@/lib/utils/mcp-cache";

const CACHE_KEY = "zones-list";

export async function GET() {
  try {
    const supabase = await createClient();

    const cached = getCached<{ zones: ZoneInfo[]; total: number }>(CACHE_KEY);
    if (cached) return NextResponse.json(cached);

    const { data: rows, error } = await supabase
      .from("athletes")
      .select("zone, star_rating")
      .not("zone", "is", null);

    if (error) {
      console.error("Zones query error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Aggregate by UI zone code
    const agg: Record<string, { total: number; blueChip: number }> = {};
    for (const row of rows ?? []) {
      const uiZone = DB_ZONE_TO_UI[row.zone as string];
      if (!uiZone) continue;
      if (!agg[uiZone]) agg[uiZone] = { total: 0, blueChip: 0 };
      agg[uiZone].total++;
      if ((row.star_rating ?? 0) >= 4) agg[uiZone].blueChip++;
    }

    const allZones: ZoneCode[] = ["MIDWEST", "NORTHEAST", "PLAINS", "SOUTHEAST", "SOUTHWEST", "WEST"];

    const zones: ZoneInfo[] = allZones.map((code) => {
      const meta = ZONE_METADATA[code];
      const counts = agg[code] || { total: 0, blueChip: 0 };
      return {
        zone_code: code,
        zone_name: ZONE_DISPLAY_NAMES[code],
        states: meta.states,
        metro_areas: meta.metro_areas,
        description: meta.description,
        total_recruits: counts.total,
        blue_chip_count: counts.blueChip,
        pending_alerts: 0,
        upcoming_events_30d: 0,
      };
    });

    const result = {
      zones,
      total: zones.reduce((sum, z) => sum + z.total_recruits, 0),
    };

    setCache(CACHE_KEY, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Zones API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
