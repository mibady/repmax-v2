import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { calculateStandings } from "@/lib/utils/calculate-standings";
import { updatePowerRankings } from "@/lib/utils/elo-calculator";

const updateGameSchema = z.object({
  game_id: z.string().uuid(),
  venue_id: z.string().uuid().nullable().optional(),
  scheduled_at: z.string().datetime().nullable().optional(),
  status: z
    .enum(["scheduled", "in_progress", "final", "postponed", "canceled"])
    .optional(),
  home_score: z.number().int().min(0).optional(),
  away_score: z.number().int().min(0).optional(),
});

// GET: List games for tournament with team/venue details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: tournamentId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const bracketId = url.searchParams.get("bracket_id");

    let query = supabase
      .from("tournament_games")
      .select(
        `
        *,
        home_reg:tournament_registrations!tournament_games_home_registration_id_fkey(id, team_name, school_id),
        away_reg:tournament_registrations!tournament_games_away_registration_id_fkey(id, team_name, school_id),
        venue:tournament_venues(id, name, field_number, surface_type)
      `
      )
      .eq("tournament_id", tournamentId);

    if (bracketId) {
      query = query.eq("bracket_id", bracketId);
    }

    const { data: games, error } = await query
      .order("round", { ascending: true })
      .order("game_number", { ascending: true });

    if (error) {
      console.error("Games fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ games: games || [] });
  } catch (error) {
    console.error("Games GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: Update game (assign venue, schedule, update status/scores)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: tournamentId } = await params;
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
      .from("off_season_events")
      .select("id, organizer_id")
      .eq("id", tournamentId)
      .single();

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    if (tournament.organizer_id !== user.id) {
      return NextResponse.json(
        { error: "Only the tournament organizer can update games" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = updateGameSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { game_id, ...updateFields } = parsed.data;

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {};
    if (updateFields.venue_id !== undefined)
      updates.venue_id = updateFields.venue_id;
    if (updateFields.scheduled_at !== undefined)
      updates.scheduled_at = updateFields.scheduled_at;
    if (updateFields.status !== undefined) {
      updates.status = updateFields.status;
      // Set started_at / ended_at based on status transitions
      if (updateFields.status === "in_progress") {
        updates.started_at = new Date().toISOString();
      } else if (
        updateFields.status === "final" ||
        updateFields.status === "canceled"
      ) {
        updates.ended_at = new Date().toISOString();
      }
    }
    if (updateFields.home_score !== undefined)
      updates.home_score = updateFields.home_score;
    if (updateFields.away_score !== undefined)
      updates.away_score = updateFields.away_score;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const { data: game, error } = await supabase
      .from("tournament_games")
      .update(updates)
      .eq("id", game_id)
      .eq("tournament_id", tournamentId)
      .select(
        `
        *,
        home_reg:tournament_registrations!tournament_games_home_registration_id_fkey(id, team_name),
        away_reg:tournament_registrations!tournament_games_away_registration_id_fkey(id, team_name),
        venue:tournament_venues(id, name, field_number)
      `
      )
      .single();

    if (error) {
      console.error("Game update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // When a game goes final, recalculate standings and update power rankings
    if (parsed.data.status === "final" && game.home_registration_id && game.away_registration_id) {
      // Fire-and-forget: recalculate standings
      calculateStandings(supabase, tournamentId).catch((err) =>
        console.error("Standings calculation error:", err)
      );

      // Fire-and-forget: update ELO rankings
      updatePowerRankings(
        supabase,
        game.id,
        tournamentId,
        game.home_registration_id,
        game.away_registration_id,
        game.home_score,
        game.away_score
      ).catch((err) => console.error("ELO update error:", err));
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error("Game PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
