import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import {
  singleElimination,
  doubleElimination,
  roundRobin,
  poolPlay,
  poolToBracket,
  type BracketTeam,
} from "@/lib/utils/bracket-generator";

const BRACKET_TYPES = [
  "single_elim",
  "double_elim",
  "round_robin",
  "pool_play",
  "pool_to_bracket",
] as const;

const createBracketSchema = z.object({
  bracket_type: z.enum(BRACKET_TYPES),
  name: z.string().min(1).max(255).default("Main Bracket"),
  seeds: z.array(
    z.object({
      registrationId: z.string().uuid(),
      teamName: z.string(),
      seed: z.number().int().positive(),
    })
  ),
  pool_size: z.number().int().min(2).optional(),
  advance_count: z.number().int().min(1).optional(),
});

// GET: Get brackets for tournament (with games)
export async function GET(
  _request: NextRequest,
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

    const { data: brackets, error: bracketError } = await supabase
      .from("tournament_brackets")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("created_at", { ascending: true });

    if (bracketError) {
      console.error("Brackets fetch error:", bracketError);
      return NextResponse.json(
        { error: bracketError.message },
        { status: 500 }
      );
    }

    // Fetch games for all brackets
    const bracketIds = (brackets || []).map((b) => b.id);
    let games: Record<string, unknown>[] = [];

    if (bracketIds.length > 0) {
      const { data: gameData, error: gameError } = await supabase
        .from("tournament_games")
        .select(
          `
          *,
          home_reg:tournament_registrations!tournament_games_home_registration_id_fkey(id, team_name),
          away_reg:tournament_registrations!tournament_games_away_registration_id_fkey(id, team_name),
          venue:tournament_venues(id, name, field_number)
        `
        )
        .in("bracket_id", bracketIds)
        .order("round", { ascending: true })
        .order("game_number", { ascending: true });

      if (gameError) {
        console.error("Games fetch error:", gameError);
        return NextResponse.json(
          { error: gameError.message },
          { status: 500 }
        );
      }

      games = gameData || [];
    }

    return NextResponse.json({ brackets: brackets || [], games });
  } catch (error) {
    console.error("Brackets GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create bracket and generate games
export async function POST(
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
      .from("tournaments")
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
        { error: "Only the tournament organizer can create brackets" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createBracketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { bracket_type, name, seeds, pool_size, advance_count } =
      parsed.data;

    // Validate pool_size and advance_count for pool formats
    if (
      (bracket_type === "pool_play" || bracket_type === "pool_to_bracket") &&
      !pool_size
    ) {
      return NextResponse.json(
        { error: "pool_size is required for pool-based bracket types" },
        { status: 400 }
      );
    }

    if (bracket_type === "pool_to_bracket" && !advance_count) {
      return NextResponse.json(
        {
          error:
            "advance_count is required for pool_to_bracket bracket type",
        },
        { status: 400 }
      );
    }

    // Generate bracket
    const bracketTeams: BracketTeam[] = seeds;
    let bracketResult;

    switch (bracket_type) {
      case "single_elim":
        bracketResult = singleElimination(bracketTeams);
        break;
      case "double_elim":
        bracketResult = doubleElimination(bracketTeams);
        break;
      case "round_robin":
        bracketResult = roundRobin(bracketTeams);
        break;
      case "pool_play":
        bracketResult = poolPlay(bracketTeams, pool_size!);
        break;
      case "pool_to_bracket":
        bracketResult = poolToBracket(
          bracketTeams,
          pool_size!,
          advance_count!
        );
        break;
    }

    // Insert bracket row
    const { data: bracket, error: bracketError } = await supabase
      .from("tournament_brackets")
      .insert({
        tournament_id: tournamentId,
        bracket_type,
        name,
        seeds: JSON.stringify(seeds),
        status: "draft",
      })
      .select()
      .single();

    if (bracketError || !bracket) {
      console.error("Bracket insert error:", bracketError);
      return NextResponse.json(
        { error: bracketError?.message || "Failed to create bracket" },
        { status: 500 }
      );
    }

    // Insert game rows from generated bracket
    const gameInserts: Array<{
      tournament_id: string;
      bracket_id: string;
      round: number;
      game_number: number;
      home_registration_id: string | null;
      away_registration_id: string | null;
      status: string;
    }> = [];

    for (const round of bracketResult.rounds) {
      for (const game of round) {
        // Only set registration IDs for real teams (not BYE or TBD)
        const homeId =
          game.homeTeam &&
          !game.homeTeam.registrationId.startsWith("pool-advance-")
            ? game.homeTeam.registrationId
            : null;
        const awayId =
          game.awayTeam &&
          !game.awayTeam.registrationId.startsWith("pool-advance-")
            ? game.awayTeam.registrationId
            : null;

        gameInserts.push({
          tournament_id: tournamentId,
          bracket_id: bracket.id,
          round: game.round,
          game_number: game.gameNumber,
          home_registration_id: homeId,
          away_registration_id: awayId,
          status: "scheduled",
        });
      }
    }

    if (gameInserts.length > 0) {
      const { error: gamesError } = await supabase
        .from("tournament_games")
        .insert(gameInserts);

      if (gamesError) {
        console.error("Games insert error:", gamesError);
        // Rollback: delete the bracket
        await supabase
          .from("tournament_brackets")
          .delete()
          .eq("id", bracket.id);
        return NextResponse.json(
          { error: gamesError.message },
          { status: 500 }
        );
      }
    }

    // Fetch the created games
    const { data: createdGames } = await supabase
      .from("tournament_games")
      .select("*")
      .eq("bracket_id", bracket.id)
      .order("round", { ascending: true })
      .order("game_number", { ascending: true });

    return NextResponse.json(
      {
        bracket,
        games: createdGames || [],
        total_games: bracketResult.totalGames,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bracket POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
