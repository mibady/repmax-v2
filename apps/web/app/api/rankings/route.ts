import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: Fetch power rankings (public, supports zone filter)
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const url = new URL(request.url);
    const zone = url.searchParams.get("zone");
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);

    let query = supabase
      .from("team_power_rankings")
      .select("*")
      .order("elo_rating", { ascending: false })
      .limit(limit);

    if (zone) {
      query = query.eq("zone", zone);
    }

    const { data: rankings, error } = await query;

    if (error) {
      console.error("Rankings fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rankings: rankings || [] });
  } catch (error) {
    console.error("Rankings GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
