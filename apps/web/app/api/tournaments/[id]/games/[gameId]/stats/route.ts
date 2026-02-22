import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const STAT_TYPES = [
  "passing_yards",
  "rushing_yards",
  "receiving_yards",
  "touchdowns",
  "tackles",
  "interceptions",
  "sacks",
  "field_goals",
  "punts",
] as const;

const playerStatSchema = z.object({
  registration_id: z.string().uuid(),
  player_name: z.string().min(1),
  stat_type: z.enum(STAT_TYPES),
  stat_value: z.number().min(0),
  athlete_id: z.string().uuid().optional().nullable(),
});

const bulkStatsSchema = z.array(playerStatSchema);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; gameId: string }> }
): Promise<NextResponse> {
  try {
    const { id: tournamentId, gameId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the user is the tournament organizer
    const { data: tournament } = await supabase
      .from("tournaments")
      .select("id, organizer_id")
      .eq("id", tournamentId)
      .single();

    if (!tournament || tournament.organizer_id !== user.id) {
      return NextResponse.json(
        { error: "Only the tournament organizer can record stats" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = bulkStatsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Insert the stats
    const statsToInsert = parsed.data.map((stat) => ({
      game_id: gameId,
      registration_id: stat.registration_id,
      player_name: stat.player_name,
      stat_type: stat.stat_type,
      stat_value: stat.stat_value,
    }));

    const { data: insertedStats, error: statsError } = await supabase
      .from("game_player_stats")
      .insert(statsToInsert)
      .select();

    if (statsError) {
      console.error("Stats insert error:", statsError);
      return NextResponse.json({ error: statsError.message }, { status: 500 });
    }

    // If athlete_id is provided, also update athlete_tournament_performance
    for (const stat of parsed.data) {
      if (stat.athlete_id) {
        // Verify athlete belongs to the registration school
        const { data: registration } = await supabase
          .from("tournament_registrations")
          .select("school_id")
          .eq("id", stat.registration_id)
          .single();

        const { data: athlete } = await supabase
          .from("athletes")
          .select("id")
          .eq("id", stat.athlete_id)
          .eq("school_id", registration?.school_id) // Assuming school_id exists on athlete record
          .maybeSingle();

        if (!athlete) {
          console.warn(`Sync skipped: Athlete ${stat.athlete_id} not verified for registration ${stat.registration_id}`);
          continue;
        }

        const { data: existingPerf } = await supabase
          .from("athlete_tournament_performance")
          .select("id, stats, games_played")
          .eq("athlete_id", stat.athlete_id)
          .eq("tournament_id", tournamentId)
          .maybeSingle();

        if (existingPerf) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const currentStats = (existingPerf.stats as any) || {};
          const newVal = (currentStats[stat.stat_type] || 0) + stat.stat_value;
          
          await supabase
            .from("athlete_tournament_performance")
            .update({
              stats: { ...currentStats, [stat.stat_type]: newVal },
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingPerf.id);
        } else {
          await supabase
            .from("athlete_tournament_performance")
            .insert({
              athlete_id: stat.athlete_id,
              tournament_id: tournamentId,
              games_played: 1,
              stats: { [stat.stat_type]: stat.stat_value },
            });
        }
      }
    }

    return NextResponse.json({ success: true, stats: insertedStats });
  } catch (error) {
    console.error("Game stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; gameId: string }> }
): Promise<NextResponse> {
  try {
    const { gameId } = await params;
    const supabase = await createClient();

    const { data: stats, error: statsError } = await supabase
      .from("game_player_stats")
      .select("*")
      .eq("game_id", gameId);

    if (statsError) {
      return NextResponse.json({ error: statsError.message }, { status: 500 });
    }

    return NextResponse.json({ stats: stats || [] });
  } catch (_error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
