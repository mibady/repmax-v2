import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Prospect } from "@/lib/data/zone-data";
import { DB_ZONE_TO_UI, UI_ZONE_TO_DB, getPlaceholderImage } from "@/lib/data/zone-data";
import { getCached, setCache } from "@/lib/utils/mcp-cache";

const querySchema = z.object({
  position: z.string().max(10).regex(/^[A-Za-z/]+$/).optional(),
  zone: z.enum(["MIDWEST", "NORTHEAST", "PLAINS", "SOUTHEAST", "SOUTHWEST", "WEST"]).optional(),
  minStars: z.coerce.number().int().min(0).max(5).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parsed = querySchema.safeParse({
      position: searchParams.get("position") || undefined,
      zone: searchParams.get("zone")?.toUpperCase() || undefined,
      minStars: searchParams.get("minStars") || "0",
      limit: searchParams.get("limit") || "20",
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query parameters", details: parsed.error.flatten() }, { status: 400 });
    }

    const { position, zone, minStars, limit } = parsed.data;

    const supabase = await createClient();

    const cacheKey = `prospects-${position || "all"}-${zone || "all"}-${minStars}-${limit}`;
    const cached = getCached<{ prospects: Prospect[]; total: number }>(cacheKey);
    if (cached) return NextResponse.json(cached);

    let query = supabase
      .from("athletes")
      .select("id, primary_position, high_school, class_year, star_rating, zone, state, city, profile_id, profiles(full_name, avatar_url)", { count: "exact" })
      .order("star_rating", { ascending: false, nullsFirst: false });

    if (position) {
      query = query.ilike("primary_position", position);
    }

    if (zone) {
      const dbZones = UI_ZONE_TO_DB[zone as keyof typeof UI_ZONE_TO_DB];
      if (dbZones && dbZones.length > 0) {
        query = query.in("zone", dbZones);
      }
    }

    if (minStars > 0) {
      query = query.gte("star_rating", minStars);
    }

    query = query.limit(limit);

    const { data: rows, count, error } = await query;

    if (error) {
      console.error("Prospects query error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const prospects: Prospect[] = (rows ?? []).map((a) => {
      const profileArr = a.profiles as unknown as { full_name: string; avatar_url: string | null }[] | null;
      const profile = profileArr?.[0] ?? null;
      return {
        id: a.id,
        full_name: profile?.full_name ?? "Unknown",
        position: a.primary_position,
        high_school: a.high_school,
        class_year: a.class_year,
        star_rating: a.star_rating ?? 0,
        zone_code: a.zone ? (DB_ZONE_TO_UI[a.zone as string] ?? "MIDWEST") : "MIDWEST",
        commitment_status: "uncommitted",
        committed_team: null,
        image_url: profile?.avatar_url || getPlaceholderImage(a.id),
      };
    });

    const result = {
      prospects,
      total: count ?? prospects.length,
    };

    setCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Prospects API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
