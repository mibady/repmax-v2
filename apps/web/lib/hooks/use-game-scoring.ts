"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@repmax/shared/supabase";

export type ScoreEventType = 'touchdown' | 'field_goal' | 'safety' | 'extra_point' | 'two_point_conversion';

export interface ScoreEvent {
  id: string;
  game_id: string;
  event_type: ScoreEventType;
  registration_id: string | null;
  player_name: string | null;
  quarter: number;
  game_clock: string | null;
  points: number;
  description: string | null;
  created_at: string;
}

interface UseGameScoringReturn {
  events: ScoreEvent[];
  isLoading: boolean;
  error: Error | null;
  addEvent: (event: Omit<ScoreEvent, "id" | "created_at" | "game_id">) => Promise<ScoreEvent>;
  refetch: () => void;
}

export function useGameScoring(
  tournamentId: string | null,
  gameId: string | null
): UseGameScoringReturn {
  const [events, setEvents] = useState<ScoreEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!tournamentId || !gameId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/games/${gameId}/events`);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch score events");
      }

      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId, gameId]);

  const addEvent = async (eventData: Omit<ScoreEvent, "id" | "created_at" | "game_id">) => {
    if (!tournamentId || !gameId) throw new Error("Missing IDs");

    const res = await fetch(`/api/tournaments/${tournamentId}/games/${gameId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to add score event");
    }

    const result = await res.json();
    // Score event added successfully, score should be updated via trigger/API
    fetchEvents();
    return result;
  };

  useEffect(() => {
    fetchEvents();

    // Set up Realtime subscription for score events
    if (gameId) {
      const supabase = createClient();
      const channel = supabase
        .channel(`game-scores:${gameId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'game_score_events',
            filter: `game_id=eq.${gameId}`,
          },
          () => {
            fetchEvents();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchEvents, gameId]);

  return {
    events,
    isLoading,
    error,
    addEvent,
    refetch: fetchEvents,
  };
}
