import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  zone: z.enum(["West", "Southwest", "Midwest", "Southeast", "Northeast", "Mid-Atlantic"]).optional(),
  days: z.coerce.number().min(1).max(90).default(7),
});

// GET /api/zone/activity
// Returns zone activity metrics (Zone Pulse data)
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
      zone: searchParams.get("zone") as any || undefined,
      days: searchParams.get("days") || 7,
    });

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - params.days);

    // Build query
    let query = supabase
      .from("zone_activity")
      .select("*")
      .gte("date", startDate.toISOString().split("T")[0])
      .order("date", { ascending: false });

    if (params.zone) {
      query = query.eq("zone", params.zone);
    }

    const { data: activity, error: activityError } = await query;

    if (activityError) {
      console.error("Error fetching zone activity:", activityError);
      return NextResponse.json({ error: "Failed to fetch zone activity" }, { status: 500 });
    }

    // If no data, return empty with defaults
    if (!activity || activity.length === 0) {
      // Return mock data for development
      const zones = params.zone
        ? [params.zone]
        : ["West", "Southwest", "Midwest", "Southeast", "Northeast", "Mid-Atlantic"];

      const mockData = zones.map(zone => ({
        zone,
        date: new Date().toISOString().split("T")[0],
        total_views: Math.floor(Math.random() * 500) + 100,
        unique_athletes_viewed: Math.floor(Math.random() * 100) + 20,
        unique_coaches_active: Math.floor(Math.random() * 50) + 10,
        new_offers: Math.floor(Math.random() * 10),
        new_commits: Math.floor(Math.random() * 5),
        hot_positions: ["QB", "WR", "RB"].slice(0, Math.floor(Math.random() * 3) + 1),
        activity_level: ["moderate", "high", "very_high"][Math.floor(Math.random() * 3)],
        week_over_week_change: (Math.random() * 40 - 10).toFixed(1),
      }));

      return NextResponse.json({
        data: mockData,
        period_days: params.days,
        is_mock: true,
      });
    }

    // Aggregate by zone if getting all zones
    if (!params.zone) {
      const byZone: Record<string, typeof activity[0]> = {};
      activity.forEach(a => {
        if (!byZone[a.zone] || new Date(a.date) > new Date(byZone[a.zone].date)) {
          byZone[a.zone] = a;
        }
      });

      return NextResponse.json({
        data: Object.values(byZone),
        period_days: params.days,
        is_mock: false,
      });
    }

    return NextResponse.json({
      data: activity,
      period_days: params.days,
      is_mock: false,
    });
  } catch (error) {
    console.error("Zone activity API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid parameters", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
