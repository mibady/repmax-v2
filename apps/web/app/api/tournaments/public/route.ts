import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let query = supabase
      .from("tournaments")
      .select(
        "id, name, description, start_date, end_date, location, teams_capacity, teams_registered, entry_fee_cents, registration_deadline, is_public, event_tier, status"
      )
      .eq("is_public", true)
      .order("start_date", { ascending: true });

    // Only show tournaments whose registration deadline hasn't passed (or has no deadline)
    const now = new Date().toISOString();
    query = query.or(`registration_deadline.gte."${now}",registration_deadline.is.null`);

    if (from) {
      query = query.gte("start_date", from);
    }
    if (to) {
      query = query.lte("start_date", to);
    }

    const { data: tournaments, error } = await query;

    if (error) {
      console.error("Public tournaments fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get registration counts for each tournament
    const tournamentIds = (tournaments || []).map((t: { id: string }) => t.id);

    let registrationCounts: Record<string, number> = {};
    if (tournamentIds.length > 0) {
      const { data: regData } = await supabase
        .from("tournament_registrations")
        .select("tournament_id")
        .in("tournament_id", tournamentIds);

      if (regData) {
        registrationCounts = regData.reduce(
          (acc: Record<string, number>, r: { tournament_id: string }) => {
            acc[r.tournament_id] = (acc[r.tournament_id] || 0) + 1;
            return acc;
          },
          {}
        );
      }
    }

    const enriched = (tournaments || []).map(
      (t: { id: string; teams_registered: number }) => ({
        ...t,
        registration_count:
          registrationCounts[t.id] || t.teams_registered || 0,
      })
    );

    return NextResponse.json({ tournaments: enriched });
  } catch (error) {
    console.error("Public tournaments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
