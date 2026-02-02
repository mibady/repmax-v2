"use client";

import { useState, useEffect, useCallback } from "react";

export type RecruitingZone = "West" | "Southwest" | "Midwest" | "Southeast" | "Northeast" | "Mid-Atlantic";
export type ActivityLevel = "low" | "moderate" | "high" | "very_high";

export interface ZoneActivity {
  zone: RecruitingZone;
  date: string;
  total_views: number;
  unique_athletes_viewed: number;
  unique_coaches_active: number;
  new_offers: number;
  new_commits: number;
  hot_positions: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  active_schools?: any[];
  activity_level: ActivityLevel;
  week_over_week_change: number;
}

interface UseZoneActivityOptions {
  zone?: RecruitingZone;
  days?: number;
}

export function useZoneActivity(options: UseZoneActivityOptions = {}) {
  const [data, setData] = useState<ZoneActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.zone) params.set("zone", options.zone);
      if (options.days) params.set("days", options.days.toString());

      const response = await fetch(`/api/zone/activity?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch zone activity");
      }

      const result = await response.json();
      setData(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [options.zone, options.days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

export interface ZoneDetail {
  zone: RecruitingZone;
  metadata: {
    states: string[];
    description: string;
  };
  activity: ZoneActivity;
  top_athletes: Array<{
    id: string;
    name: string;
    avatar: string | null;
    position: string;
    class_year: number;
    star_rating: number;
    state: string;
  }>;
  recent_offers: Array<{
    id: string;
    school: string;
    division: string;
    date: string;
    athlete: {
      id: string;
      name: string;
      position: string;
    };
  }>;
}

export function useZoneDetail(zone: RecruitingZone | null) {
  const [data, setData] = useState<ZoneDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!zone) {
      setData(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/zone/${encodeURIComponent(zone)}`);

      if (!response.ok) {
        throw new Error("Failed to fetch zone detail");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [zone]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
