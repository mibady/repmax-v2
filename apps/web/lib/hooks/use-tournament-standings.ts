"use client";

import { useCallback, useEffect, useState } from "react";

export interface TournamentStanding {
  id: string;
  tournament_id: string;
  registration_id: string;
  wins: number;
  losses: number;
  ties: number;
  points_for: number;
  points_against: number;
  created_at: string;
  updated_at: string;
  team_name?: string;
}

interface UseTournamentStandingsReturn {
  standings: TournamentStanding[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTournamentStandings(
  tournamentId: string | null
): UseTournamentStandingsReturn {
  const [standings, setStandings] = useState<TournamentStanding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStandings = useCallback(async () => {
    if (!tournamentId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/standings`);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch standings");
      }

      const data = await res.json();
      setStandings(data.standings || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  return {
    standings,
    isLoading,
    error,
    refetch: fetchStandings,
  };
}
