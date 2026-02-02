"use client";

import { useCallback, useEffect, useState } from "react";

export interface ChildProfile {
  id: string;
  name: string;
  position: string;
  classYear: number;
  gpa: number | null;
  school: string;
  avatarUrl: string | null;
}

export interface ParentMetrics {
  profileViews: number;
  profileViewsChange: number;
  coachMessages: number;
  schoolsTracking: number;
  upcomingDeadlines: number;
}

export interface SchoolInterest {
  id: string;
  name: string;
  status: "High Interest" | "Following" | "Offered" | "Contacted";
  statusColor: string;
}

export interface ActivityItem {
  id: string;
  type: "view" | "message" | "update" | "shortlist";
  message: string;
  time: string;
  timestamp: string;
}

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: "visit" | "deadline" | "camp";
}

interface UseParentDashboardReturn {
  childProfile: ChildProfile | null;
  metrics: ParentMetrics | null;
  schools: SchoolInterest[];
  activity: ActivityItem[];
  calendarEvents: CalendarEvent[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useParentDashboard(): UseParentDashboardReturn {
  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [metrics, setMetrics] = useState<ParentMetrics | null>(null);
  const [schools, setSchools] = useState<SchoolInterest[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/parent/dashboard");

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch parent dashboard");
      }

      const data = await res.json();
      setChildProfile(data.childProfile || null);
      setMetrics(data.metrics || null);
      setSchools(data.schools || []);
      setActivity(data.activity || []);
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
    childProfile,
    metrics,
    schools,
    activity,
    calendarEvents,
    isLoading,
    error,
    refresh: fetchDashboard,
  };
}
