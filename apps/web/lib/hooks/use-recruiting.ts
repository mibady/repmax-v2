"use client";

import { useEffect, useState, useCallback } from "react";
import type { ZoneCode } from "@repmax/shared/zone";

// Zone data type
export interface ZoneData {
  zone_code: ZoneCode;
  zone_name: string;
  states: string[];
  state_count: number;
  metro_areas: string[];
  description: string;
  total_recruits: number;
  blue_chip_count: number;
  pending_alerts: number;
  upcoming_events_30d: number;
}

// Calendar data type
export interface CalendarData {
  currentPeriod: string;
  portalWindowOpen: boolean;
  portalWindowStart?: string;
  portalWindowEnd?: string;
  nextSigningDate?: string;
  daysUntilSigning: number;
  keyDates: Array<{ date: string; event: string }>;
}

// Class ranking type
export interface ClassRanking {
  team: string;
  total_commits: number;
  avg_rating: string;
  five_stars: number;
  four_stars: number;
  three_stars: number;
}

// Hook for fetching zones
export function useZones() {
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchZones = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/recruiting/zones");
      if (!res.ok) throw new Error("Failed to fetch zones");
      const data = await res.json();
      setZones(data.zones || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  return { zones, isLoading, error, refetch: fetchZones };
}

// Hook for fetching a single zone
export function useZone(zoneCode: ZoneCode) {
  const { zones, isLoading, error } = useZones();
  const zone = zones.find((z) => z.zone_code === zoneCode) || null;
  return { zone, isLoading, error };
}

// Hook for fetching calendar data
export function useRecruitingCalendar() {
  const [calendar, setCalendar] = useState<CalendarData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCalendar = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/recruiting/calendar");
      if (!res.ok) throw new Error("Failed to fetch calendar");
      const data = await res.json();
      setCalendar(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  return { calendar, isLoading, error, refetch: fetchCalendar };
}

// Hook for fetching class rankings
export function useClassRankings(limit?: number) {
  const [rankings, setRankings] = useState<ClassRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRankings = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = limit
        ? `/api/recruiting/class-rankings?limit=${limit}`
        : "/api/recruiting/class-rankings";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch class rankings");
      const data = await res.json();
      setRankings(data.rankings || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  return { rankings, isLoading, error, refetch: fetchRankings };
}
