import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  athlete_id: z.string().uuid().optional(),
  days: z.coerce.number().min(1).max(365).default(30),
});

// GET /api/analytics/geographic
// Returns geographic distribution of profile viewers
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const params = querySchema.parse({
      athlete_id: searchParams.get("athlete_id") || undefined,
      days: searchParams.get("days") || 30,
    });

    // Get the athlete ID
    let athleteId = params.athlete_id;

    if (!athleteId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      }

      const { data: athlete } = await supabase
        .from("athletes")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

      if (!athlete) {
        return NextResponse.json({ error: "Athlete profile not found" }, { status: 404 });
      }

      athleteId = athlete.id;
    }

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - params.days);

    // Get profile views with location data
    const { data: views, error: viewsError } = await supabase
      .from("profile_views")
      .select("viewer_state, viewer_zone, viewer_school, viewer_division, created_at")
      .eq("athlete_id", athleteId)
      .gte("created_at", startDate.toISOString())
      .not("viewer_zone", "is", null);

    if (viewsError) {
      console.error("Error fetching geographic data:", viewsError);
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }

    // Aggregate by zone
    const byZone: Record<string, { count: number; schools: Set<string>; divisions: Set<string> }> = {};
    const byState: Record<string, number> = {};
    const byDivision: Record<string, number> = {};

    views?.forEach(view => {
      // By zone
      if (view.viewer_zone) {
        if (!byZone[view.viewer_zone]) {
          byZone[view.viewer_zone] = { count: 0, schools: new Set(), divisions: new Set() };
        }
        byZone[view.viewer_zone].count++;
        if (view.viewer_school) byZone[view.viewer_zone].schools.add(view.viewer_school);
        if (view.viewer_division) byZone[view.viewer_zone].divisions.add(view.viewer_division);
      }

      // By state
      if (view.viewer_state) {
        byState[view.viewer_state] = (byState[view.viewer_state] || 0) + 1;
      }

      // By division
      if (view.viewer_division) {
        byDivision[view.viewer_division] = (byDivision[view.viewer_division] || 0) + 1;
      }
    });

    // Transform zone data for response
    const zoneData = Object.entries(byZone).map(([zone, data]) => ({
      zone,
      view_count: data.count,
      unique_schools: data.schools.size,
      schools: Array.from(data.schools).slice(0, 5),
      divisions: Array.from(data.divisions),
    })).sort((a, b) => b.view_count - a.view_count);

    return NextResponse.json({
      total_views: views?.length || 0,
      period_days: params.days,
      by_zone: zoneData,
      by_state: byState,
      by_division: byDivision,
      top_zone: zoneData[0]?.zone || null,
    });
  } catch (error) {
    console.error("Geographic analytics API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid parameters", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
