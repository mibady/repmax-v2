"use client";

import { useCallback, useEffect, useState } from "react";

export interface TournamentDetail {
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
  platform_fee_rate: number;
  status: "upcoming" | "active" | "completed";
  organizer_id: string;
  registration_url: string | null;
  organizer_name: string | null;
  created_at: string;
  schedule_published?: boolean;
  waiver_text?: string | null;
  age_cutoff_date?: string | null;
  max_age_years?: number | null;
}

export interface TournamentRegistration {
  id: string;
  school_id: string;
  team_name: string | null;
  contact_name: string | null;
  contact_email: string | null;
  payment_status: "pending" | "approved" | "rejected" | "waitlisted";
  amount_cents: number;
  platform_fee_cents: number;
  created_at: string;
}

interface UseTournamentDetailReturn {
  tournament: TournamentDetail | null;
  registrations: TournamentRegistration[];
  myRegistration: TournamentRegistration | null;
  registrationCount: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTournamentDetail(
  tournamentId: string | null
): UseTournamentDetailReturn {
  const [tournament, setTournament] = useState<TournamentDetail | null>(null);
  const [registrations, setRegistrations] = useState<
    TournamentRegistration[]
  >([]);
  const [myRegistration, setMyRegistration] =
    useState<TournamentRegistration | null>(null);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!tournamentId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/tournaments/${tournamentId}`);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch tournament");
      }

      const data = await res.json();
      setTournament(data.tournament || null);
      setRegistrations(data.registrations || []);
      setMyRegistration(data.my_registration || null);
      setRegistrationCount(data.registration_count || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    tournament,
    registrations,
    myRegistration,
    registrationCount,
    isLoading,
    error,
    refetch: fetchDetail,
  };
}
