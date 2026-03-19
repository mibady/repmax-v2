/**
 * Calculate tournament standings from finalized games.
 * Upserts into tournament_standings table.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

interface GameRow {
  id: string;
  home_registration_id: string | null;
  away_registration_id: string | null;
  home_score: number;
  away_score: number;
  status: string;
}

interface StandingRecord {
  tournament_id: string;
  registration_id: string;
  wins: number;
  losses: number;
  ties: number;
  points_for: number;
  points_against: number;
}

export async function calculateStandings(
  supabase: SupabaseClient,
  tournamentId: string
): Promise<{ success: boolean; error?: string }> {
  // Fetch all finalized games for this tournament
  const { data: games, error: gamesError } = await supabase
    .from("tournament_games")
    .select("id, home_registration_id, away_registration_id, home_score, away_score, status")
    .eq("tournament_id", tournamentId)
    .eq("status", "final");

  if (gamesError) {
    return { success: false, error: gamesError.message };
  }

  if (!games || games.length === 0) {
    return { success: true };
  }

  // Aggregate standings per registration
  const map = new Map<string, Omit<StandingRecord, "tournament_id">>();

  function getOrCreate(regId: string) {
    if (!map.has(regId)) {
      map.set(regId, {
        registration_id: regId,
        wins: 0,
        losses: 0,
        ties: 0,
        points_for: 0,
        points_against: 0,
      });
    }
    return map.get(regId)!;
  }

  for (const game of games as GameRow[]) {
    if (!game.home_registration_id || !game.away_registration_id) continue;

    const home = getOrCreate(game.home_registration_id);
    const away = getOrCreate(game.away_registration_id);

    home.points_for += game.home_score;
    home.points_against += game.away_score;
    away.points_for += game.away_score;
    away.points_against += game.home_score;

    if (game.home_score > game.away_score) {
      home.wins += 1;
      away.losses += 1;
    } else if (game.home_score < game.away_score) {
      away.wins += 1;
      home.losses += 1;
    } else {
      home.ties += 1;
      away.ties += 1;
    }
  }

  // Upsert each standing
  const rows: StandingRecord[] = Array.from(map.values()).map((s) => ({
    tournament_id: tournamentId,
    ...s,
  }));

  if (rows.length === 0) return { success: true };

  const { error: upsertError } = await supabase
    .from("tournament_standings")
    .upsert(rows, {
      onConflict: "tournament_id,registration_id",
    });

  if (upsertError) {
    return { success: false, error: upsertError.message };
  }

  return { success: true };
}
