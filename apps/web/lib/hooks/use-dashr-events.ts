"use client";

import { useCallback, useEffect, useState } from "react";

export type DashrEventType = "combine" | "camp" | "clinic" | "intensive" | "blueprint";

export interface DashrEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: DashrEventType;
  start_date: string;
  end_date: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  capacity: number | null;
  price_cents: number;
  product_slug: string;
  is_published: boolean;
  booking_count: number;
  created_at: string;
}

interface DashrEventFilters {
  type: DashrEventType | null;
  from: string | null;
  to: string | null;
}

interface UseDashrEventsReturn {
  events: DashrEvent[];
  isLoading: boolean;
  error: Error | null;
  filters: DashrEventFilters;
  setTypeFilter: (type: DashrEventType | null) => void;
  setDateFilter: (from: string | null, to: string | null) => void;
  refetch: () => void;
}

export function useDashrEvents(): UseDashrEventsReturn {
  const [events, setEvents] = useState<DashrEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<DashrEventFilters>({
    type: null,
    from: null,
    to: null,
  });

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.type) params.set("type", filters.type);
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);

      const queryString = params.toString();
      const url = `/api/dashr${queryString ? `?${queryString}` : ""}`;
      const res = await fetch(url);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch events");
      }

      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const setTypeFilter = useCallback((type: DashrEventType | null) => {
    setFilters((prev) => ({ ...prev, type }));
  }, []);

  const setDateFilter = useCallback((from: string | null, to: string | null) => {
    setFilters((prev) => ({ ...prev, from, to }));
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    isLoading,
    error,
    filters,
    setTypeFilter,
    setDateFilter,
    refetch: fetchEvents,
  };
}
