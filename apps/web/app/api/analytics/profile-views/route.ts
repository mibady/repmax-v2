import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  athlete_id: z.string().uuid().optional(),
  days: z.coerce.number().min(1).max(365).default(30),
  group_by: z.enum(["day", "week", "month", "zone", "school"]).default("day"),
});

// GET /api/analytics/profile-views
// Returns profile view analytics for an athlete
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
      group_by: searchParams.get("group_by") || "day",
    });

    // Get the athlete ID (either from param or from current user's athlete profile)
    let athleteId = params.athlete_id;

    if (!athleteId) {
      // Get current user's athlete profile
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

    // Get profile views with analytics
    const { data: views, error: viewsError } = await supabase
      .from("profile_views")
      .select("*")
      .eq("athlete_id", athleteId)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false });

    if (viewsError) {
      console.error("Error fetching profile views:", viewsError);
      return NextResponse.json({ error: "Failed to fetch views" }, { status: 500 });
    }

    // Calculate summary stats
    const totalViews = views?.length || 0;
    const uniqueViewers = new Set(views?.map(v => v.viewer_id).filter(Boolean)).size;
    const coachViews = views?.filter(v => v.viewer_role === "coach" || v.viewer_role === "recruiter").length || 0;

    // Group by the requested dimension
    const grouped: Record<string, number> = {};
    views?.forEach(view => {
      let key: string;
      switch (params.group_by) {
        case "zone":
          key = view.viewer_zone || "Unknown";
          break;
        case "school":
          key = view.viewer_school || "Unknown";
          break;
        case "week":
          const weekStart = new Date(view.created_at);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          key = weekStart.toISOString().split("T")[0];
          break;
        case "month":
          key = new Date(view.created_at).toISOString().slice(0, 7);
          break;
        default: // day
          key = new Date(view.created_at).toISOString().split("T")[0];
      }
      grouped[key] = (grouped[key] || 0) + 1;
    });

    return NextResponse.json({
      summary: {
        total_views: totalViews,
        unique_viewers: uniqueViewers,
        coach_views: coachViews,
        period_days: params.days,
      },
      grouped,
      recent: views?.slice(0, 10),
    });
  } catch (error) {
    console.error("Profile views API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid parameters", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
