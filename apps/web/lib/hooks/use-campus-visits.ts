"use client";

import { useCallback, useEffect, useState } from "react";

export interface CampusVisit {
  id: string;
  athleteId: string;
  athleteName: string;
  position: string;
  stars: number;
  avatar: string | null;
  classYear: number;
  highSchool: string;
  state: string;
  visitType: "official" | "unofficial";
  status: "confirmed" | "pending" | "cancelled";
  date: string;
  time: string;
  details: string;
  rawDate: string;
}

export interface VisitStats {
  totalVisits: number;
  officialVisits: number;
  pendingVisits: number;
  winRate: number;
}

export interface CalendarEvent {
  day: number;
  title: string;
  type: "official" | "unofficial" | "event";
  time?: string;
  athleteId?: string;
}

interface UseCampusVisitsReturn {
  visits: CampusVisit[];
  stats: VisitStats;
  calendarEvents: CalendarEvent[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  getEventsForDay: (day: number) => CalendarEvent[];
  createVisit: (data: {
    athlete_id: string;
    visit_date: string;
    visit_type: "official" | "unofficial";
    visit_time?: string;
    notes?: string;
  }) => Promise<{ success?: boolean; error?: string }>;
  updateVisit: (
    id: string,
    data: {
      status?: "confirmed" | "pending" | "cancelled";
      visit_date?: string;
      visit_time?: string;
      visit_type?: "official" | "unofficial";
      notes?: string;
    }
  ) => Promise<{ success?: boolean; error?: string }>;
  cancelVisit: (id: string) => Promise<{ success?: boolean; error?: string }>;
}

const defaultStats: VisitStats = {
  totalVisits: 0,
  officialVisits: 0,
  pendingVisits: 0,
  winRate: 0,
};

export function useCampusVisits(): UseCampusVisitsReturn {
  const [visits, setVisits] = useState<CampusVisit[]>([]);
  const [stats, setStats] = useState<VisitStats>(defaultStats);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVisits = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/recruiting/visits");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch visits");
      }

      const data = await res.json();
      setVisits(data.visits || []);
      setStats(data.stats || defaultStats);
      setCalendarEvents(data.calendarEvents || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const getEventsForDay = useCallback(
    (day: number): CalendarEvent[] => {
      return calendarEvents.filter((e) => e.day === day);
    },
    [calendarEvents]
  );

  const createVisit = useCallback(
    async (data: {
      athlete_id: string;
      visit_date: string;
      visit_type: "official" | "unofficial";
      visit_time?: string;
      notes?: string;
    }) => {
      try {
        const res = await fetch("/api/recruiting/visits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (!res.ok) return { error: result.error || "Failed to create visit" };
        await fetchVisits();
        return { success: true };
      } catch {
        return { error: "Failed to create visit" };
      }
    },
    [fetchVisits]
  );

  const updateVisit = useCallback(
    async (
      id: string,
      data: {
        status?: "confirmed" | "pending" | "cancelled";
        visit_date?: string;
        visit_time?: string;
        visit_type?: "official" | "unofficial";
        notes?: string;
      }
    ) => {
      try {
        const res = await fetch("/api/recruiting/visits", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...data }),
        });
        const result = await res.json();
        if (!res.ok)
          return { error: result.error || "Failed to update visit" };
        await fetchVisits();
        return { success: true };
      } catch {
        return { error: "Failed to update visit" };
      }
    },
    [fetchVisits]
  );

  const cancelVisit = useCallback(
    async (id: string) => {
      return updateVisit(id, { status: "cancelled" });
    },
    [updateVisit]
  );

  return {
    visits,
    stats,
    calendarEvents,
    isLoading,
    error,
    refetch: fetchVisits,
    getEventsForDay,
    createVisit,
    updateVisit,
    cancelVisit,
  };
}
