import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ZoneCode, ZoneInfo } from "@/lib/data/zone-data";
import { DB_ZONE_TO_UI, ZONE_METADATA, ZONE_DISPLAY_NAMES } from "@/lib/data/zone-data";

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get real athlete counts by zone
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

    return NextResponse.json({ zones });
  } catch (error) {
    console.error("Recruiting zones API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
