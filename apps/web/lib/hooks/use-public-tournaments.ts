"use client";

import { useCallback, useEffect, useState } from "react";

export interface TournamentProspect {
  player_name: string;
  position: string | null;
  class_year: number | null;
}

export interface PublicTournament {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  location: string;
  teams_capacity: number;
  teams_registered: number;
  entry_fee_cents: number;
  registration_deadline: string | null;
  is_public: boolean;
  event_tier: string | null;
  event_type: string | null;
  zone: string | null;
  status: "upcoming" | "active" | "completed";
  registration_count: number;
  prospects: TournamentProspect[];
}

export type EventType = "tournament" | "showcase" | "camp" | "combine";
export type ZoneCode = "MIDWEST" | "NORTHEAST" | "PLAINS" | "SOUTHEAST" | "SOUTHWEST" | "WEST";

interface EventFilters {
  from: string | null;
  to: string | null;
  eventType: EventType | null;
  zone: ZoneCode | null;
}

interface UsePublicTournamentsReturn {
  tournaments: PublicTournament[];
  isLoading: boolean;
  error: Error | null;
  filters: EventFilters;
  setDateFilter: (from: string | null, to: string | null) => void;
  setEventTypeFilter: (eventType: EventType | null) => void;
  setZoneFilter: (zone: ZoneCode | null) => void;
  refetch: () => void;
}

export function usePublicTournaments(): UsePublicTournamentsReturn {
  const [tournaments, setTournaments] = useState<PublicTournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<EventFilters>({
    from: null,
    to: null,
    eventType: null,
    zone: null,
  });

  const fetchTournaments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      if (filters.eventType) params.set("event_type", filters.eventType);
      if (filters.zone) params.set("zone", filters.zone);

      const queryString = params.toString();
      const url = `/api/tournaments/public${queryString ? `?${queryString}` : ""}`;
      const res = await fetch(url);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch tournaments");
      }

      const data = await res.json();
      setTournaments(data.tournaments || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const setDateFilter = useCallback(
    (from: string | null, to: string | null) => {
      setFilters((prev) => ({ ...prev, from, to }));
    },
    []
  );

  const setEventTypeFilter = useCallback(
    (eventType: EventType | null) => {
      setFilters((prev) => ({ ...prev, eventType }));
    },
    []
  );

  const setZoneFilter = useCallback(
    (zone: ZoneCode | null) => {
      setFilters((prev) => ({ ...prev, zone }));
    },
    []
  );

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  return {
    tournaments,
    isLoading,
    error,
    filters,
    setDateFilter,
    setEventTypeFilter,
    setZoneFilter,
    refetch: fetchTournaments,
  };
}
