"use client";

import { useCallback, useEffect, useState } from "react";

export interface Registration {
  id: string;
  tournament_id: string;
  school_id: string;
  team_name: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  payment_status: "pending" | "approved" | "rejected" | "waitlisted";
  amount_cents: number;
  platform_fee_cents: number;
  stripe_payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface RosterPlayer {
  id: string;
  registration_id: string;
  player_name: string;
  jersey_number: string | null;
  position: string | null;
  class_year: number | null;
}

interface NewPlayer {
  player_name: string;
  jersey_number?: string;
  position?: string;
  class_year?: number;
}

interface UseRegistrationsReturn {
  registrations: Registration[];
  roster: RosterPlayer[];
  isLoading: boolean;
  error: Error | null;
  register: (
    tournamentId: string,
    data: {
      school_id: string;
      team_name: string;
      contact_name: string;
      contact_email: string;
      contact_phone?: string;
    }
  ) => Promise<Registration | null>;
  submitRoster: (
    tournamentId: string,
    registrationId: string,
    players: NewPlayer[]
  ) => Promise<boolean>;
  fetchRoster: (
    tournamentId: string,
    registrationId: string
  ) => Promise<void>;
  refetch: () => void;
}

export function useRegistrations(
  schoolId: string | null
): UseRegistrationsReturn {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [roster, setRoster] = useState<RosterPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRegistrations = useCallback(async () => {
    if (!schoolId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch all registrations for the school using the new optimized endpoint
      const res = await fetch(`/api/tournaments/registrations`);
      if (!res.ok) {
        throw new Error("Failed to fetch registrations");
      }
      const data = await res.json();
      setRegistrations(data.registrations || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [schoolId]);

  const register = useCallback(
    async (
      tournamentId: string,
      data: {
        school_id: string;
        team_name: string;
        contact_name: string;
        contact_email: string;
        contact_phone?: string;
      }
    ): Promise<Registration | null> => {
      try {
        const res = await fetch(`/api/tournaments/${tournamentId}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Registration failed");
        }

        const registration = await res.json();
        setRegistrations((prev) => [...prev, registration]);
        return registration;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        return null;
      }
    },
    []
  );

  const fetchRoster = useCallback(
    async (tournamentId: string, registrationId: string) => {
      try {
        const res = await fetch(
          `/api/tournaments/${tournamentId}/roster?registration_id=${registrationId}`
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch roster");
        }

        const data = await res.json();
        setRoster(data.roster || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      }
    },
    []
  );

  const submitRoster = useCallback(
    async (
      tournamentId: string,
      registrationId: string,
      players: NewPlayer[]
    ): Promise<boolean> => {
      try {
        const res = await fetch(`/api/tournaments/${tournamentId}/roster`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            registration_id: registrationId,
            players,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to submit roster");
        }

        const data = await res.json();
        setRoster(data.roster || []);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        return false;
      }
    },
    []
  );

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  return {
    registrations,
    roster,
    isLoading,
    error,
    register,
    submitRoster,
    fetchRoster,
    refetch: fetchRegistrations,
  };
}
