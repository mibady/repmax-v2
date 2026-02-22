"use client";

import { useCallback, useEffect, useState } from "react";
import type { BracketGameRecord } from "./use-brackets";
import type { TournamentVenue } from "./use-tournament-venues";

interface UpdateGameParams {
  game_id: string;
  venue_id?: string | null;
  scheduled_at?: string | null;
  status?: "scheduled" | "in_progress" | "final" | "postponed" | "canceled";
  home_score?: number;
  away_score?: number;
}

interface UseTournamentScheduleReturn {
  games: BracketGameRecord[];
  isLoading: boolean;
  error: Error | null;
  updateGame: (params: UpdateGameParams) => Promise<boolean>;
  autoSchedule: (
    venues: TournamentVenue[],
    startTime: Date,
    gameDurationMinutes: number,
    gapMinutes: number
  ) => Promise<boolean>;
  refetch: () => void;
}

export function useTournamentSchedule(
  tournamentId: string | null
): UseTournamentScheduleReturn {
  const [games, setGames] = useState<BracketGameRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGames = useCallback(async () => {
    if (!tournamentId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/games`);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch games");
      }

      const data = await res.json();
      setGames(data.games || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const updateGame = useCallback(
    async (params: UpdateGameParams): Promise<boolean> => {
      if (!tournamentId) return false;

      try {
        const res = await fetch(`/api/tournaments/${tournamentId}/games`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to update game");
        }

        await fetchGames();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        return false;
      }
    },
    [tournamentId, fetchGames]
  );

  const autoSchedule = useCallback(
    async (
      venues: TournamentVenue[],
      startTime: Date,
      gameDurationMinutes: number,
      gapMinutes: number
    ): Promise<boolean> => {
      if (!tournamentId || venues.length === 0) return false;

      try {
        // Sort games by round then game_number
        const sortedGames = [...games].sort((a, b) => {
          if (a.round !== b.round) return a.round - b.round;
          return (a.game_number ?? 0) - (b.game_number ?? 0);
        });

        // Track next available time per venue
        const venueNextTime: Map<string, Date> = new Map();
        for (const venue of venues) {
          venueNextTime.set(venue.id, new Date(startTime));
        }

        const slotMs = (gameDurationMinutes + gapMinutes) * 60 * 1000;

        // Assign each game to the venue with the earliest available slot
        for (const game of sortedGames) {
          // Find venue with earliest available time
          let bestVenueId = venues[0].id;
          let bestTime = venueNextTime.get(venues[0].id)!;

          for (const venue of venues) {
            const nextTime = venueNextTime.get(venue.id)!;
            if (nextTime < bestTime) {
              bestTime = nextTime;
              bestVenueId = venue.id;
            }
          }

          const res = await fetch(
            `/api/tournaments/${tournamentId}/games`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                game_id: game.id,
                venue_id: bestVenueId,
                scheduled_at: bestTime.toISOString(),
              }),
            }
          );

          if (!res.ok) {
            const data = await res.json();
            throw new Error(
              data.error || `Failed to schedule game ${game.game_number}`
            );
          }

          // Advance that venue's next available time
          venueNextTime.set(
            bestVenueId,
            new Date(bestTime.getTime() + slotMs)
          );
        }

        await fetchGames();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        return false;
      }
    },
    [tournamentId, games, fetchGames]
  );

  return {
    games,
    isLoading,
    error,
    updateGame,
    autoSchedule,
    refetch: fetchGames,
  };
}
