"use client";

import { useCallback, useEffect, useState } from "react";

export interface AdminEvent {
  id: string;
  title: string;
  event_date: string;
  event_type: string;
  linked_program: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export function useAdminEvents(typeFilter?: string) {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = typeFilter && typeFilter !== "all" ? `?type=${typeFilter}` : "";
      const res = await fetch(`/api/admin/events${params}`);
      if (!res.ok) throw new Error("Failed to fetch events");
      setEvents(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createEvent = useCallback(
    async (event: {
      title: string;
      event_date: string;
      event_type: string;
      linked_program?: string;
      notes?: string;
    }) => {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
      if (!res.ok) throw new Error("Failed to create event");
      const data = await res.json();
      await fetchData();
      return data;
    },
    [fetchData]
  );

  return { events, isLoading, error, refresh: fetchData, createEvent };
}
