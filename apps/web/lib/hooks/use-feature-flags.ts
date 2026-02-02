"use client";

import { useCallback, useEffect, useState } from "react";

export type FlagStatus = "enabled" | "beta" | "disabled" | "canary";
export type FlagScope = "all" | "pro_team" | "staff" | "percentage";

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description?: string;
  status: FlagStatus;
  scope: FlagScope;
  rolloutPercentage: number;
  isNew?: boolean;
  icon: string;
  iconColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlagsFilter {
  search?: string;
  status?: "all" | "active" | "beta" | "deprecated";
}

interface UseFeatureFlagsReturn {
  flags: FeatureFlag[];
  total: number;
  filtered: number;
  isLoading: boolean;
  isUpdating: string | null; // ID of flag being updated
  error: Error | null;
  filter: FeatureFlagsFilter;
  setFilter: (filter: FeatureFlagsFilter) => void;
  toggleFlag: (id: string) => Promise<void>;
  updateFlagStatus: (id: string, status: FlagStatus) => Promise<void>;
  updateFlagScope: (id: string, scope: FlagScope) => Promise<void>;
  updateRolloutPercentage: (id: string, percentage: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useFeatureFlags(): UseFeatureFlagsReturn {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [total, setTotal] = useState(0);
  const [filtered, setFiltered] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<FeatureFlagsFilter>({
    search: "",
    status: "all",
  });

  const fetchFlags = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filter.search) params.set("search", filter.search);
      if (filter.status) params.set("status", filter.status);

      const res = await fetch(`/api/admin/feature-flags?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch feature flags");
      }

      const data = await res.json();
      setFlags(data.flags || []);
      setTotal(data.total || 0);
      setFiltered(data.filtered || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setFlags([]);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const updateFlag = useCallback(
    async (
      id: string,
      updates: {
        status?: FlagStatus;
        scope?: FlagScope;
        rolloutPercentage?: number;
      }
    ) => {
      setIsUpdating(id);
      setError(null);

      try {
        const res = await fetch("/api/admin/feature-flags", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...updates }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to update feature flag");
        }

        const data = await res.json();

        // Optimistically update local state
        setFlags((prev) =>
          prev.map((flag) => (flag.id === id ? data.flag : flag))
        );
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        throw err;
      } finally {
        setIsUpdating(null);
      }
    },
    []
  );

  const toggleFlag = useCallback(
    async (id: string) => {
      const flag = flags.find((f) => f.id === id);
      if (!flag) return;

      const isCurrentlyEnabled =
        flag.status === "enabled" ||
        flag.status === "beta" ||
        flag.status === "canary";
      const newStatus: FlagStatus = isCurrentlyEnabled ? "disabled" : "enabled";

      await updateFlag(id, { status: newStatus });
    },
    [flags, updateFlag]
  );

  const updateFlagStatus = useCallback(
    async (id: string, status: FlagStatus) => {
      await updateFlag(id, { status });
    },
    [updateFlag]
  );

  const updateFlagScope = useCallback(
    async (id: string, scope: FlagScope) => {
      await updateFlag(id, { scope });
    },
    [updateFlag]
  );

  const updateRolloutPercentage = useCallback(
    async (id: string, percentage: number) => {
      await updateFlag(id, { rolloutPercentage: percentage });
    },
    [updateFlag]
  );

  return {
    flags,
    total,
    filtered,
    isLoading,
    isUpdating,
    error,
    filter,
    setFilter,
    toggleFlag,
    updateFlagStatus,
    updateFlagScope,
    updateRolloutPercentage,
    refresh: fetchFlags,
  };
}

// Helper function to get display text for scope
export function getScopeDisplayText(scope: FlagScope): string {
  switch (scope) {
    case "all":
      return "All Users";
    case "pro_team":
      return "Pro & Team";
    case "staff":
      return "Staff Only";
    case "percentage":
      return "Percentage Rollout";
    default:
      return scope;
  }
}

// Helper function to determine if a flag is active (enabled/beta/canary)
export function isFlagActive(flag: FeatureFlag): boolean {
  return (
    flag.status === "enabled" ||
    flag.status === "beta" ||
    flag.status === "canary"
  );
}
