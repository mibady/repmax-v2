"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import {
  getHighlight,
  incrementHighlightViews,
  type HighlightWithAthlete,
} from "@/lib/actions/highlight-actions";

interface BookmarkData {
  id: string;
  timestamp_seconds: number;
  label: string | null;
  notes: string | null;
  rating: number | null;
  tags: string[] | null;
  created_at: string;
  coach?: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface UseHighlightDetailReturn {
  highlight: HighlightWithAthlete | null;
  bookmarks: BookmarkData[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createBookmark: (data: {
    timestamp_seconds: number;
    label?: string;
    notes?: string;
    rating?: number;
    tags?: string[];
  }) => Promise<void>;
  formatTimestamp: (seconds: number) => string;
  formatHeight: (inches: number | null) => string;
}

export function useHighlightDetail(highlightId: string | null): UseHighlightDetailReturn {
  const [highlight, setHighlight] = useState<HighlightWithAthlete | null>(null);
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
const [_isPending, startTransition] = useTransition();

  const fetchData = useCallback(async () => {
    if (!highlightId) {
      setHighlight(null);
      setBookmarks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch highlight data using server action
      const highlightData = await getHighlight(highlightId);
      setHighlight(highlightData);

      // Increment view count
      if (highlightData) {
        startTransition(() => {
          incrementHighlightViews(highlightId);
        });
      }

      // Fetch bookmarks for this highlight
      const bookmarksRes = await fetch(`/api/film/bookmarks?highlight_id=${highlightId}`);
      if (bookmarksRes.ok) {
        const bookmarksData = await bookmarksRes.json();
        setBookmarks(bookmarksData.bookmarks || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch highlight"));
    } finally {
      setIsLoading(false);
    }
  }, [highlightId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createBookmark = useCallback(
    async (data: {
      timestamp_seconds: number;
      label?: string;
      notes?: string;
      rating?: number;
      tags?: string[];
    }) => {
      if (!highlightId) return;

      const res = await fetch("/api/film/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          highlight_id: highlightId,
          ...data,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create bookmark");
      }

      // Refetch bookmarks
      const bookmarksRes = await fetch(`/api/film/bookmarks?highlight_id=${highlightId}`);
      if (bookmarksRes.ok) {
        const bookmarksData = await bookmarksRes.json();
        setBookmarks(bookmarksData.bookmarks || []);
      }
    },
    [highlightId]
  );

  const formatTimestamp = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const formatHeight = useCallback((inches: number | null): string => {
    if (!inches) return "N/A";
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}"`;
  }, []);

  return {
    highlight,
    bookmarks,
    isLoading,
    error,
    refetch: fetchData,
    createBookmark,
    formatTimestamp,
    formatHeight,
  };
}
