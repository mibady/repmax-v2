"use client";

import { useState, useEffect, useCallback } from "react";

export interface ProfileViewSummary {
  total_views: number;
  unique_viewers: number;
  coach_views: number;
  period_days: number;
}

export interface ProfileView {
  id: string;
  athlete_id: string;
  viewer_id: string | null;
  viewer_role: string | null;
  viewer_school: string | null;
  viewer_division: string | null;
  viewer_state: string | null;
  viewer_zone: string | null;
  source: string | null;
  duration_seconds: number | null;
  created_at: string;
}

interface UseProfileViewsOptions {
  athleteId?: string;
  days?: number;
  groupBy?: "day" | "week" | "month" | "zone" | "school";
}

interface ProfileViewsResponse {
  summary: ProfileViewSummary;
  grouped: Record<string, number>;
  recent: ProfileView[];
}

export function useProfileViews(options: UseProfileViewsOptions = {}) {
  const [data, setData] = useState<ProfileViewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchViews = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.athleteId) params.set("athlete_id", options.athleteId);
      if (options.days) params.set("days", options.days.toString());
      if (options.groupBy) params.set("group_by", options.groupBy);

      const response = await fetch(`/api/analytics/profile-views?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch profile views");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [options.athleteId, options.days, options.groupBy]);

  useEffect(() => {
    fetchViews();
  }, [fetchViews]);

  return {
    summary: data?.summary,
    grouped: data?.grouped,
    recent: data?.recent,
    isLoading,
    error,
    refetch: fetchViews,
  };
}

export function useGeographicViews(options: { athleteId?: string; days?: number } = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.athleteId) params.set("athlete_id", options.athleteId);
      if (options.days) params.set("days", options.days.toString());

      const response = await fetch(`/api/analytics/geographic?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch geographic data");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [options.athleteId, options.days]);

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
