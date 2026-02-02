"use client";

import { useCallback, useEffect, useState } from "react";

export interface Tournament {
  id: string;
  name: string;
  date: string;
  startDate: string;
  endDate: string;
  location: string;
  registrations: number;
  capacity: number;
  revenue: number;
  status: "upcoming" | "active" | "completed";
}

export interface VerificationItem {
  id: string;
  athleteId: string;
  athleteName: string;
  type: "identity" | "academic" | "athletic";
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface PaymentItem {
  id: string;
  description: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  date: string;
  tournamentId: string | null;
}

export interface ClubMetrics {
  activeEvents: number;
  totalRegistrations: number;
  totalRevenue: number;
  pendingVerifications: number;
}

interface UseClubDashboardReturn {
  tournaments: Tournament[];
  verifications: VerificationItem[];
  payments: PaymentItem[];
  metrics: ClubMetrics | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useClubDashboard(): UseClubDashboardReturn {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [metrics, setMetrics] = useState<ClubMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/club/dashboard");

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch club dashboard");
      }

      const data = await res.json();
      setTournaments(data.tournaments || []);
      setVerifications(data.verifications || []);
      setPayments(data.payments || []);
      setMetrics(data.metrics || null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    tournaments,
    verifications,
    payments,
    metrics,
    isLoading,
    error,
    refresh: fetchDashboard,
  };
}
