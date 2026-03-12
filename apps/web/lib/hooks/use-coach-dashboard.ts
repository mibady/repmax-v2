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
  content: string;
  category: 'General' | 'Urgent' | 'Call Log' | 'Strategy';
  isPinned: boolean;
  athleteId: string | null;
  athleteName: string | null;
  createdAt: string;
}

export interface College {
  id: string;
  schoolName: string;
  temperature: 'Hot' | 'Warm' | 'Cold';
  prospectCount: number;
  scheduledVisits: number;
  notes?: string;
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
  colleges: College[];
  activity: CoachActivityItem[];
  calendarEvents: CalendarEvent[];
  metrics: CoachMetrics | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
  updateTask: (taskId: string, status: CoachTask["status"]) => Promise<void>;
  addNote: (note: { content: string; category: string; athleteId?: string }) => Promise<void>;
  toggleNotePin: (noteId: string) => Promise<void>;
  fetchColleges: () => Promise<void>;
}

export function useCoachDashboard(): UseCoachDashboardReturn {
  const [team, setTeam] = useState<CoachTeam | null>(null);
  const [roster, setRoster] = useState<RosterAthlete[]>([]);
  const [tasks, setTasks] = useState<CoachTask[]>([]);
  const [notes, setNotes] = useState<CoachNote[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [activity, setActivity] = useState<CoachActivityItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [metrics, setMetrics] = useState<CoachMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const categoryMap: Record<string, CoachNote['category']> = {
    general: 'General', urgent: 'Urgent', call_log: 'Call Log', strategy: 'Strategy',
  };

  const tempMap: Record<string, College['temperature']> = {
    hot: 'Hot', warm: 'Warm', cold: 'Cold',
  };

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch("/api/coach/notes");
      if (!res.ok) return;
      const data = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setNotes((data.notes || []).map((n: any) => ({
        ...n,
        category: categoryMap[n.category] || 'General',
      })));
    } catch { /* silent */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchColleges = useCallback(async () => {
    try {
      const res = await fetch("/api/coach/colleges");
      if (!res.ok) return;
      const data = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setColleges((data.colleges || []).map((c: any) => ({
        ...c,
        temperature: tempMap[c.temperature] || 'Warm',
      })));
    } catch { /* silent */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [dashRes] = await Promise.all([
        fetch("/api/coach/dashboard"),
        fetchNotes(),
        fetchColleges(),
      ]);

      if (!dashRes.ok) {
        const data = await dashRes.json();
        throw new Error(data.error || "Failed to fetch coach dashboard");
      }

      const data = await dashRes.json();
      setTeam(data.coach?.team || null);
      setRoster(data.roster || []);
      setTasks(data.tasks || []);
      setActivity(data.activity || []);
      setCalendarEvents(data.calendarEvents || []);
      setMetrics(data.metrics || null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [fetchNotes, fetchColleges]);

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

  const reverseCategoryMap: Record<string, string> = {
    General: 'general', Urgent: 'urgent', 'Call Log': 'call_log', Strategy: 'strategy',
  };

  const addNote = useCallback(async (note: { content: string; category: string; athleteId?: string }) => {
    try {
      const res = await fetch("/api/coach/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...note,
          category: reverseCategoryMap[note.category] || note.category.toLowerCase(),
        }),
      });
      if (!res.ok) throw new Error("Failed to add note");
      await fetchNotes();
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    }
  }, [fetchNotes]);

  const toggleNotePin = useCallback(async (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;
    try {
      const res = await fetch(`/api/coach/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !note.isPinned }),
      });
      if (!res.ok) throw new Error("Failed to toggle pin");
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, isPinned: !n.isPinned } : n))
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    }
  }, [notes]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    team,
    roster,
    tasks,
    notes,
    colleges,
    activity,
    calendarEvents,
    metrics,
    isLoading,
    error,
    refresh: fetchDashboard,
    updateTask,
    addNote,
    toggleNotePin,
    fetchColleges,
  };
}
