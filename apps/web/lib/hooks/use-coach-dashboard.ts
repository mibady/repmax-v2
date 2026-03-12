"use client";

import { useCallback, useEffect, useState } from "react";

export interface CoachTeam {
  id: string;
  name: string;
  school: string;
  city: string;
  state: string;
  zone: string;
}

export interface RosterAthlete {
  id: string;
  name: string;
  position: string;
  classYear: number;
  gpa: number | null;
  offers: number;
  status: "active" | "committed" | "transferred" | "graduated";
  avatarUrl: string | null;
  heightInches: number | null;
  weightLbs: number | null;
  fortyTime: number | null;
  starRating: number | null;
  school: string | null;
  city: string | null;
  state: string | null;
  zone: string | null;
  verified: boolean;
}

export interface CoachTask {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed";
  athleteId: string | null;
  athleteName: string | null;
  createdAt: string;
}

export interface CoachNote {
  id: string;
  athleteId: string;
  athleteName: string;
  content: string;
  category: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  location: string | null;
}

export interface CoachActivityItem {
  id: string;
  type: string;
  description: string;
  athleteId: string;
  athleteName: string;
  timestamp: string;
}

export interface CoachMetrics {
  totalAthletes: number;
  activeAthletes: number;
  committedAthletes: number;
  pendingTasks: number;
  totalOffers: number;
}

interface UseCoachDashboardReturn {
  team: CoachTeam | null;
  roster: RosterAthlete[];
  tasks: CoachTask[];
  notes: CoachNote[];
  activity: CoachActivityItem[];
  calendarEvents: CalendarEvent[];
  metrics: CoachMetrics | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
  updateTask: (taskId: string, status: CoachTask["status"]) => Promise<void>;
}

export function useCoachDashboard(): UseCoachDashboardReturn {
  const [team, setTeam] = useState<CoachTeam | null>(null);
  const [roster, setRoster] = useState<RosterAthlete[]>([]);
  const [tasks, setTasks] = useState<CoachTask[]>([]);
  const [notes, setNotes] = useState<CoachNote[]>([]);
  const [activity, setActivity] = useState<CoachActivityItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [metrics, setMetrics] = useState<CoachMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/coach/dashboard");

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch coach dashboard");
      }

      const data = await res.json();
      setTeam(data.coach?.team || null);
      setRoster(data.roster || []);
      setTasks(data.tasks || []);
      setNotes(data.notes || []);
      setActivity(data.activity || []);
      setCalendarEvents(data.calendarEvents || []);
      setMetrics(data.metrics || null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (taskId: string, status: CoachTask["status"]) => {
    try {
      const res = await fetch(`/api/coach/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error("Failed to update task");
      }

      // Update local state
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status } : t))
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    team,
    roster,
    tasks,
    notes,
    activity,
    calendarEvents,
    metrics,
    isLoading,
    error,
    refresh: fetchDashboard,
    updateTask,
  };
}
