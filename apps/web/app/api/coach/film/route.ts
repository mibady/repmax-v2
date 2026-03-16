import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Find coach's team
    const { data: team } = await supabase
      .from("teams")
      .select("id, name")
      .eq("coach_profile_id", profile.id)
      .single();

    if (!team) {
      return NextResponse.json({ error: "No team found" }, { status: 404 });
    }

    // Get roster athlete IDs
    const { data: rosterRows } = await supabase
      .from("team_rosters")
      .select(`
        athlete:athletes(
          id,
          primary_position,
          profile:profiles(id, full_name)
        )
      `)
      .eq("team_id", team.id);

    const athleteMap = new Map<string, { name: string; position: string }>();
    const athleteProfileIds: string[] = [];

    for (const row of rosterRows || []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const a = row.athlete as any;
      if (!a) continue;
      const p = Array.isArray(a.profile) ? a.profile[0] : a.profile;
      if (p?.id) {
        athleteMap.set(p.id, {
          name: p.full_name || "Unknown",
          position: a.primary_position || "ATH",
        });
        athleteProfileIds.push(p.id);
      }
    }

    if (athleteProfileIds.length === 0) {
      return NextResponse.json({ highlights: [], teamName: team.name });
    }

    // Fetch highlights for all roster athletes
    const { data: highlights } = await supabase
      .from("highlights")
      .select("*")
      .in("athlete_id", athleteProfileIds)
      .order("created_at", { ascending: false });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enriched = (highlights || []).map((h: any) => {
      const info = athleteMap.get(h.athlete_id) || { name: "Unknown", position: "ATH" };
      return {
        ...h,
        athleteName: info.name,
        athletePosition: info.position,
      };
    });

    return NextResponse.json({ highlights: enriched, teamName: team.name });
  } catch (error) {
    console.error("Coach film error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
