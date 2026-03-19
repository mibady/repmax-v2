import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: Fetch standings for a tournament (public for public tournaments)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: tournamentId } = await params;
    const supabase = await createClient();

    // Fetch standings joined with registration team names
    const { data: standings, error } = await supabase
      .from("tournament_standings")
      .select(
        `
        *,
        registration:tournament_registrations!tournament_standings_registration_id_fkey(id, team_name)
      `
      )
      .eq("tournament_id", tournamentId)
      .order("wins", { ascending: false });

    if (error) {
      console.error("Standings fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Flatten team_name into each standing row
    const result = (standings || []).map((s) => ({
      id: s.id,
      tournament_id: s.tournament_id,
      registration_id: s.registration_id,
      wins: s.wins,
      losses: s.losses,
      ties: s.ties,
      points_for: s.points_for,
      points_against: s.points_against,
      created_at: s.created_at,
      updated_at: s.updated_at,
      team_name: (s.registration as { team_name: string | null } | null)?.team_name || "Unknown",
    }));

    // Sort by wins desc, then point differential desc
    result.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      const diffA = a.points_for - a.points_against;
      const diffB = b.points_for - b.points_against;
      return diffB - diffA;
    });

    return NextResponse.json({ standings: result });
  } catch (error) {
    console.error("Standings GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
