"use client";

import { useState, useEffect, useCallback } from "react";

export type EventType =
  | "deadline"
  | "signing_period"
  | "visit"
  | "camp"
  | "showcase"
  | "evaluation"
  | "contact_period"
  | "dead_period";

export interface RecruitingEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: EventType;
  start_date: string;
  end_date: string | null;
  applies_to_divisions: string[] | null;
  applies_to_zones: string[] | null;
  applies_to_class_years: number[] | null;
  is_ncaa_official: boolean;
  ncaa_rule_reference: string | null;
  is_public: boolean;
  created_by: string | null;
}

interface UseRecruitingEventsOptions {
  startDate?: string;
  endDate?: string;
  eventType?: EventType;
  division?: string;
  classYear?: number;
}

export function useRecruitingEvents(options: UseRecruitingEventsOptions = {}) {
  const [events, setEvents] = useState<RecruitingEvent[]>([]);
  const [period, setPeriod] = useState<{ start: string; end: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMock, setIsMock] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.startDate) params.set("start_date", options.startDate);
      if (options.endDate) params.set("end_date", options.endDate);
      if (options.eventType) params.set("event_type", options.eventType);
      if (options.division) params.set("division", options.division);
      if (options.classYear) params.set("class_year", options.classYear.toString());

      const response = await fetch(`/api/recruiting/events?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch recruiting events");
      }

      const result = await response.json();
      setEvents(result.events || []);
      setPeriod(result.period);
      setIsMock(result.is_mock || false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [options.startDate, options.endDate, options.eventType, options.division, options.classYear]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Helper to get events for a specific month
  const getEventsForMonth = useCallback((year: number, month: number) => {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    return events.filter(event => {
      const eventStart = new Date(event.start_date);
      const eventEnd = event.end_date ? new Date(event.end_date) : eventStart;

      return (eventStart <= endOfMonth && eventEnd >= startOfMonth);
    });
  }, [events]);

  // Helper to get upcoming events
  const getUpcomingEvents = useCallback((limit: number = 5) => {
    const today = new Date().toISOString().split("T")[0];
    return events
      .filter(e => e.start_date >= today)
      .slice(0, limit);
  }, [events]);

  // Helper to categorize events by type
  const eventsByType = useCallback(() => {
    return events.reduce((acc, event) => {
      if (!acc[event.event_type]) {
        acc[event.event_type] = [];
      }
      acc[event.event_type].push(event);
      return acc;
    }, {} as Record<EventType, RecruitingEvent[]>);
  }, [events]);

  return {
    events,
    period,
    isLoading,
    error,
    isMock,
    refetch: fetchEvents,
    getEventsForMonth,
    getUpcomingEvents,
    eventsByType,
  };
}
