"use client";

import { useCallback, useEffect, useState } from "react";

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
  status: "upcoming" | "active" | "completed";
  registration_count: number;
}

interface DateFilter {
  from: string | null;
  to: string | null;
}

interface UsePublicTournamentsReturn {
  tournaments: PublicTournament[];
  isLoading: boolean;
  error: Error | null;
  filters: DateFilter;
  setDateFilter: (from: string | null, to: string | null) => void;
  refetch: () => void;
}

export function usePublicTournaments(): UsePublicTournamentsReturn {
  const [tournaments, setTournaments] = useState<PublicTournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<DateFilter>({
    from: null,
    to: null,
  });

  const fetchTournaments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);

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
      setFilters({ from, to });
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
    refetch: fetchTournaments,
  };
}
