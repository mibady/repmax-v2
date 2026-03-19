/**
 * ELO rating calculator for team power rankings.
 * Standard K-factor of 32 for youth sports (higher volatility = faster convergence).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

const K_FACTOR = 32;
const DEFAULT_ELO = 1500;

/**
 * Calculate expected win probability.
 */
function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculate new ELO ratings after a game.
 * Returns [newRatingA, newRatingB].
 */
export function calculateElo(
  ratingA: number,
  ratingB: number,
  result: "win" | "loss" | "tie"
): [number, number] {
  const expectedA = expectedScore(ratingA, ratingB);
  const expectedB = 1 - expectedA;

  let actualA: number;
  let actualB: number;

  switch (result) {
    case "win":
      actualA = 1;
      actualB = 0;
      break;
    case "loss":
      actualA = 0;
      actualB = 1;
      break;
    case "tie":
      actualA = 0.5;
      actualB = 0.5;
      break;
  }

  const newRatingA = Math.round((ratingA + K_FACTOR * (actualA - expectedA)) * 100) / 100;
  const newRatingB = Math.round((ratingB + K_FACTOR * (actualB - expectedB)) * 100) / 100;

  return [newRatingA, newRatingB];
}

/**
 * Update power rankings after a finalized game.
 * Creates/updates team_power_rankings and logs to elo_history.
 */
export async function updatePowerRankings(
  supabase: SupabaseClient,
  gameId: string,
  tournamentId: string,
  homeRegistrationId: string,
  awayRegistrationId: string,
  homeScore: number,
  awayScore: number
): Promise<{ success: boolean; error?: string }> {
  // Determine result from home team's perspective
  const result: "win" | "loss" | "tie" =
    homeScore > awayScore ? "win" : homeScore < awayScore ? "loss" : "tie";

  // Fetch tournament zone
  const { data: tournament } = await supabase
    .from("off_season_events")
    .select("zone")
    .eq("id", tournamentId)
    .single();

  const zone = tournament?.zone || null;

  // Get or create rankings for both teams
  const [homeRanking, awayRanking] = await Promise.all([
    getOrCreateRanking(supabase, homeRegistrationId, zone),
    getOrCreateRanking(supabase, awayRegistrationId, zone),
  ]);

  if (!homeRanking || !awayRanking) {
    return { success: false, error: "Failed to get/create team rankings" };
  }

  // Calculate new ELO
  const [newHomeElo, newAwayElo] = calculateElo(
    homeRanking.elo_rating,
    awayRanking.elo_rating,
    result
  );

  // Log ELO history
  const historyRows = [
    {
      registration_id: homeRegistrationId,
      game_id: gameId,
      elo_before: homeRanking.elo_rating,
      elo_after: newHomeElo,
      opponent_elo: awayRanking.elo_rating,
      result: result,
    },
    {
      registration_id: awayRegistrationId,
      game_id: gameId,
      elo_before: awayRanking.elo_rating,
      elo_after: newAwayElo,
      opponent_elo: homeRanking.elo_rating,
      result: result === "win" ? "loss" : result === "loss" ? "win" : "tie",
    },
  ];

  const { error: historyError } = await supabase
    .from("elo_history")
    .insert(historyRows);

  if (historyError) {
    console.error("ELO history insert error:", historyError);
  }

  // Update rankings
  const now = new Date().toISOString();

  await Promise.all([
    supabase
      .from("team_power_rankings")
      .update({
        elo_rating: newHomeElo,
        total_games: homeRanking.total_games + 1,
        wins: homeRanking.wins + (result === "win" ? 1 : 0),
        losses: homeRanking.losses + (result === "loss" ? 1 : 0),
        last_played_at: now,
        updated_at: now,
      })
      .eq("registration_id", homeRegistrationId),
    supabase
      .from("team_power_rankings")
      .update({
        elo_rating: newAwayElo,
        total_games: awayRanking.total_games + 1,
        wins: awayRanking.wins + (result === "loss" ? 1 : 0),
        losses: awayRanking.losses + (result === "win" ? 1 : 0),
        last_played_at: now,
        updated_at: now,
      })
      .eq("registration_id", awayRegistrationId),
  ]);

  return { success: true };
}

async function getOrCreateRanking(
  supabase: SupabaseClient,
  registrationId: string,
  zone: string | null
) {
  const { data: existing } = await supabase
    .from("team_power_rankings")
    .select("*")
    .eq("registration_id", registrationId)
    .maybeSingle();

  if (existing) return existing;

  // Get team name from registration
  const { data: reg } = await supabase
    .from("tournament_registrations")
    .select("team_name")
    .eq("id", registrationId)
    .single();

  const { data: created, error } = await supabase
    .from("team_power_rankings")
    .insert({
      registration_id: registrationId,
      team_name: reg?.team_name || "Unknown Team",
      elo_rating: DEFAULT_ELO,
      zone,
    })
    .select()
    .single();

  if (error) {
    console.error("Create ranking error:", error);
    return null;
  }

  return created;
}
