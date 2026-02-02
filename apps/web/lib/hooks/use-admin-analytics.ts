"use client";

import { useCallback, useEffect, useState } from "react";

export interface KpiCard {
  id: string;
  label: string;
  value: string;
  change: number;
  isPositive: boolean;
}

export interface ProfileBucket {
  range: string;
  percentage: number;
}

export interface RoleDistribution {
  role: string;
  percentage: number;
  color: string;
}

export interface AdminAnalyticsData {
  kpiData: KpiCard[];
  roleDistribution: RoleDistribution[];
  profileCompleteness: ProfileBucket[];
  totalUsers: number;
  monthlyGrowth: Record<string, number>;
}

interface UseAdminAnalyticsReturn {
  data: AdminAnalyticsData | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useAdminAnalytics(): UseAdminAnalyticsReturn {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/analytics");

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch analytics");
      }

      const analyticsData = await res.json();
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchAnalytics,
  };
}
