import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const eventType = searchParams.get("event_type");
    const zone = searchParams.get("zone");

    let query = supabase
      .from("tournaments")
      .select(
        "id, name, description, start_date, end_date, location, teams_capacity, teams_registered, entry_fee_cents, registration_deadline, is_public, event_tier, status, event_type, zone"
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
    if (eventType) {
      query = query.eq("event_type", eventType);
    }
    if (zone) {
      query = query.eq("zone", zone);
    }

    const { data: tournaments, error } = await query;

    if (error) {
      console.error("Public tournaments fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get registration counts for each tournament
    const tournamentIds = (tournaments || []).map((t: { id: string }) => t.id);

    let registrationCounts: Record<string, number> = {};
    const prospectsByTournament: Record<string, Array<{ player_name: string; position: string | null; class_year: number | null }>> = {};

    if (tournamentIds.length > 0) {
      const { data: regData } = await supabase
        .from("tournament_registrations")
        .select("id, tournament_id")
        .in("tournament_id", tournamentIds);

      if (regData) {
        registrationCounts = regData.reduce(
          (acc: Record<string, number>, r: { tournament_id: string }) => {
            acc[r.tournament_id] = (acc[r.tournament_id] || 0) + 1;
            return acc;
          },
          {}
        );

        // Fetch roster players for prospect previews
        const regIds = regData.map((r: { id: string }) => r.id);
        if (regIds.length > 0) {
          const { data: rosterData } = await supabase
            .from("tournament_rosters")
            .select("registration_id, player_name, position, class_year")
            .in("registration_id", regIds)
            .limit(200);

          if (rosterData) {
            // Build a registration_id -> tournament_id map
            const regToTournament: Record<string, string> = {};
            for (const r of regData) {
              regToTournament[r.id] = r.tournament_id;
            }

            for (const player of rosterData) {
              const tid = regToTournament[player.registration_id];
              if (tid) {
                if (!prospectsByTournament[tid]) {
                  prospectsByTournament[tid] = [];
                }
                prospectsByTournament[tid].push({
                  player_name: player.player_name,
                  position: player.position,
                  class_year: player.class_year,
                });
              }
            }
          }
        }
      }
    }

    const enriched = (tournaments || []).map(
      (t: { id: string; teams_registered: number }) => ({
        ...t,
        registration_count:
          registrationCounts[t.id] || t.teams_registered || 0,
        prospects: prospectsByTournament[t.id] || [],
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
