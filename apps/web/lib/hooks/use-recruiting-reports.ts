"use client";

import { useCallback, useEffect, useState } from "react";

export interface FunnelStage {
  stage: string;
  count: number;
  conversionRate: number;
}

export interface StaffMember {
  id: string;
  name: string;
  region: string;
  rank?: number;
  calls: number;
  emails: number;
  visits: number;
  commits: number;
  imageUrl: string;
}

export interface ZoneCoverageData {
  zone: string;
  prospects: number;
  height: string;
}

export interface ReportStats {
  communications: {
    value: number;
    change: number;
    changeType: "increase" | "decrease";
  };
  campusVisits: {
    value: number;
    comparison: string;
  };
  avgTimeToCommit: {
    value: string;
    change: number;
  };
}

interface UseRecruitingReportsReturn {
  funnel: FunnelStage[];
  stats: ReportStats | null;
  staffActivity: StaffMember[];
  zoneCoverage: ZoneCoverageData[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useRecruitingReports(): UseRecruitingReportsReturn {
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [staffActivity, setStaffActivity] = useState<StaffMember[]>([]);
  const [zoneCoverage, setZoneCoverage] = useState<ZoneCoverageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/recruiting/reports");

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch reports");
      }

      const data = await res.json();
      setFunnel(data.funnel || []);
      setStats(data.stats || null);
      setStaffActivity(data.staffActivity || []);
      setZoneCoverage(data.zoneCoverage || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    funnel,
    stats,
    staffActivity,
    zoneCoverage,
    isLoading,
    error,
    refresh: fetchReports,
  };
}
