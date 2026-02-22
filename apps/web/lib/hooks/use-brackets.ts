"use client";

import { useCallback, useEffect, useState } from "react";

export interface BracketSeed {
  registrationId: string;
  teamName: string;
  seed: number;
}

export interface TournamentBracket {
  id: string;
  tournament_id: string;
  bracket_type:
    | "single_elim"
    | "double_elim"
    | "round_robin"
    | "pool_play"
    | "pool_to_bracket";
  name: string;
  seeds: string; // JSON string of BracketSeed[]
  status: "draft" | "active" | "completed";
  created_at: string;
  updated_at: string;
}

export interface BracketGameRecord {
  id: string;
  tournament_id: string;
  bracket_id: string | null;
  venue_id: string | null;
  round: number;
  game_number: number;
  home_registration_id: string | null;
  away_registration_id: string | null;
  home_score: number;
  away_score: number;
  status: "scheduled" | "in_progress" | "final" | "postponed" | "canceled";
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
  home_reg: { id: string; team_name: string | null } | null;
  away_reg: { id: string; team_name: string | null } | null;
  venue: {
    id: string;
    name: string;
    field_number: number | null;
  } | null;
}

interface CreateBracketParams {
  bracket_type: TournamentBracket["bracket_type"];
  name: string;
  seeds: BracketSeed[];
  pool_size?: number;
  advance_count?: number;
}

interface UseBracketsReturn {
  brackets: TournamentBracket[];
  games: BracketGameRecord[];
  isLoading: boolean;
  error: Error | null;
  createBracket: (params: CreateBracketParams) => Promise<boolean>;
  refetch: () => void;
}

export function useBrackets(
  tournamentId: string | null
): UseBracketsReturn {
  const [brackets, setBrackets] = useState<TournamentBracket[]>([]);
  const [games, setGames] = useState<BracketGameRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBrackets = useCallback(async () => {
    if (!tournamentId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/brackets`);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch brackets");
      }

      const data = await res.json();
      setBrackets(data.brackets || []);
      setGames(data.games || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchBrackets();
  }, [fetchBrackets]);

  const createBracket = useCallback(
    async (params: CreateBracketParams): Promise<boolean> => {
      if (!tournamentId) return false;

      try {
        const res = await fetch(
          `/api/tournaments/${tournamentId}/brackets`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
          }
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create bracket");
        }

        await fetchBrackets();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        return false;
      }
    },
    [tournamentId, fetchBrackets]
  );

  return {
    brackets,
    games,
    isLoading,
    error,
    createBracket,
    refetch: fetchBrackets,
  };
}
