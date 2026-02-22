"use client";

import { useCallback, useEffect, useState } from "react";

export interface TournamentVenue {
  id: string;
  tournament_id: string;
  name: string;
  field_number: number | null;
  surface_type: "grass" | "turf" | "indoor" | null;
  capacity: number | null;
  location_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface AddVenueParams {
  name: string;
  field_number?: number | null;
  surface_type?: "grass" | "turf" | "indoor" | null;
  capacity?: number | null;
  location_notes?: string | null;
}

interface UseTournamentVenuesReturn {
  venues: TournamentVenue[];
  isLoading: boolean;
  error: Error | null;
  addVenue: (params: AddVenueParams) => Promise<boolean>;
  updateVenue: (venueId: string, params: AddVenueParams) => Promise<boolean>;
  removeVenue: (venueId: string) => Promise<boolean>;
  refetch: () => void;
}

export function useTournamentVenues(
  tournamentId: string | null
): UseTournamentVenuesReturn {
  const [venues, setVenues] = useState<TournamentVenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVenues = useCallback(async () => {
    if (!tournamentId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/venues`);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch venues");
      }

      const data = await res.json();
      setVenues(data.venues || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const addVenue = useCallback(
    async (params: AddVenueParams): Promise<boolean> => {
      if (!tournamentId) return false;

      try {
        const res = await fetch(
          `/api/tournaments/${tournamentId}/venues`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
          }
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to add venue");
        }

        await fetchVenues();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        return false;
      }
    },
    [tournamentId, fetchVenues]
  );

  const updateVenue = useCallback(
    async (venueId: string, params: AddVenueParams): Promise<boolean> => {
      if (!tournamentId) return false;

      try {
        const res = await fetch(
          `/api/tournaments/${tournamentId}/venues`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              venue_id: venueId,
              ...params,
            }),
          }
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to update venue");
        }

        await fetchVenues();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        return false;
      }
    },
    [tournamentId, fetchVenues]
  );

  const removeVenue = useCallback(
    async (venueId: string): Promise<boolean> => {
      if (!tournamentId) return false;

      try {
        const res = await fetch(
          `/api/tournaments/${tournamentId}/venues`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ venue_id: venueId }),
          }
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to delete venue");
        }

        await fetchVenues();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        return false;
      }
    },
    [tournamentId, fetchVenues]
  );

  return {
    venues,
    isLoading,
    error,
    addVenue,
    updateVenue,
    removeVenue,
    refetch: fetchVenues,
  };
}
