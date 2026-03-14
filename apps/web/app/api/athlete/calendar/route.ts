import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
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

    const { data: athlete } = await supabase
      .from("athletes")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (!athlete) {
      return NextResponse.json({ upcoming: [], past: [] });
    }

    const today = new Date().toISOString().split("T")[0];

    const [upcomingRes, pastRes] = await Promise.all([
      supabase
        .from("athlete_events")
        .select("*")
        .eq("athlete_id", athlete.id)
        .gte("event_date", today)
        .order("event_date", { ascending: true }),
      supabase
        .from("athlete_events")
        .select("*")
        .eq("athlete_id", athlete.id)
        .lt("event_date", today)
        .order("event_date", { ascending: false })
        .limit(20),
    ]);

    if (upcomingRes.error) {
      console.error("Error fetching upcoming events:", upcomingRes.error);
    }
    if (pastRes.error) {
      console.error("Error fetching past events:", pastRes.error);
    }

    return NextResponse.json({
      upcoming: upcomingRes.data || [],
      past: pastRes.data || [],
    });
  } catch (error) {
    console.error("Error in athlete calendar API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
