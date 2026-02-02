"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import {
  getMyHighlights,
  getAthleteHighlights,
  createHighlight,
  updateHighlight,
  deleteHighlight,
  type Highlight,
} from "@/lib/actions/highlight-actions";

export function useHighlights(athleteId?: string) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchHighlights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = athleteId
        ? await getAthleteHighlights(athleteId)
        : await getMyHighlights();
      setHighlights(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch highlights"));
    } finally {
      setIsLoading(false);
    }
  }, [athleteId]);

  useEffect(() => {
    fetchHighlights();
  }, [fetchHighlights]);

  const add = useCallback(
    async (data: {
      title: string;
      description?: string;
      video_url: string;
      thumbnail_url?: string;
      duration_seconds?: number;
    }) => {
      const result = await createHighlight(data);
      if (!result.error) {
        startTransition(() => {
          fetchHighlights();
        });
      }
      return result;
    },
    [fetchHighlights]
  );

  const update = useCallback(
    async (
      highlightId: string,
      data: {
        title?: string;
        description?: string;
        thumbnail_url?: string;
      }
    ) => {
      const result = await updateHighlight(highlightId, data);
      if (!("error" in result)) {
        startTransition(() => {
          fetchHighlights();
        });
      }
      return result;
    },
    [fetchHighlights]
  );

  const remove = useCallback(
    async (highlightId: string) => {
      const result = await deleteHighlight(highlightId);
      if (!("error" in result)) {
        startTransition(() => {
          fetchHighlights();
        });
      }
      return result;
    },
    [fetchHighlights]
  );

  // Helper to format duration from seconds to MM:SS
  const formatDuration = useCallback((seconds: number | null): string => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Helper to format view count
  const formatViews = useCallback((views: number): string => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  }, []);

  return {
    highlights,
    isLoading,
    isPending,
    error,
    add,
    update,
    remove,
    refetch: fetchHighlights,
    formatDuration,
    formatViews,
  };
}

export type { Highlight };
