import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ registrations: [] });
    }

    const { data: membership } = await supabase
      .from("school_members")
      .select("school_id")
      .eq("profile_id", profile.id)
      .limit(1)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ registrations: [] });
    }

    const { data: registrations, error } = await supabase
      .from("tournament_registrations")
      .select(`
        *,
        tournament:tournaments(*),
        roster:tournament_rosters(count)
      `)
      .eq("school_id", membership.school_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Registrations fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Flatten and format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatted = (registrations || []).map((reg: any) => ({
      ...reg,
      tournament_name: reg.tournament?.name,
      tournament_date: reg.tournament?.start_date,
      tournament_location: reg.tournament?.location,
      roster_count: reg.roster?.[0]?.count || 0,
    }));

    return NextResponse.json({ registrations: formatted });
  } catch (error) {
    console.error("Schools/me/registrations GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
