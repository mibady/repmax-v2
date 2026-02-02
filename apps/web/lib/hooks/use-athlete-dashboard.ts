"use client";

import { useCallback, useEffect, useState } from "react";

export interface AthleteProfile {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  classYear: number;
  position: string;
  school: string;
  city: string;
  state: string;
  zone: string;
  heightInches: number | null;
  weightLbs: number | null;
  fortyYardDash: number | null;
  gpa: number | null;
  avatarUrl: string | null;
  starRating: number;
}

export interface DashboardStats {
  profileViews: number;
  profileViewsChange: number;
  shortlistCount: number;
  offersCount: number;
  messagesUnread: number;
}

export interface ShortlistCoach {
  id: string;
  name: string;
  school: string;
  avatarUrl: string | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "signing" | "visit" | "camp" | "other";
  location?: string;
  priority?: "high" | "normal";
}

interface UseAthleteDashboardReturn {
  profile: AthleteProfile | null;
  stats: DashboardStats | null;
  shortlistCoaches: ShortlistCoach[];
  calendarEvents: CalendarEvent[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useAthleteDashboard(): UseAthleteDashboardReturn {
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [shortlistCoaches, setShortlistCoaches] = useState<ShortlistCoach[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/athlete/dashboard");

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch dashboard");
      }

      const data = await res.json();
      setProfile(data.profile || null);
      setStats(data.stats || null);
      setShortlistCoaches(data.shortlistCoaches || []);
      setCalendarEvents(data.calendarEvents || []);
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
    profile,
    stats,
    shortlistCoaches,
    calendarEvents,
    isLoading,
    error,
    refresh: fetchDashboard,
  };
}
