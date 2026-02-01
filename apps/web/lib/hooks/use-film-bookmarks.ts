"use client";

import { useState, useEffect, useCallback } from "react";

export interface FilmBookmark {
  id: string;
  highlight_id: string;
  timestamp_seconds: number;
  label: string | null;
  notes: string | null;
  rating: number | null;
  tags: string[] | null;
  created_at: string;
  highlight: {
    id: string;
    title: string;
    thumbnail: string | null;
    duration: number;
    athlete: {
      id: string;
      name: string;
      position: string;
    };
  };
}

interface UseFilmBookmarksOptions {
  highlightId?: string;
}

export function useFilmBookmarks(options: UseFilmBookmarksOptions = {}) {
  const [bookmarks, setBookmarks] = useState<FilmBookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBookmarks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.highlightId) params.set("highlight_id", options.highlightId);

      const response = await fetch(`/api/film/bookmarks?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch bookmarks");
      }

      const result = await response.json();
      setBookmarks(result.bookmarks || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [options.highlightId]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  return {
    bookmarks,
    isLoading,
    error,
    refetch: fetchBookmarks,
  };
}

interface CreateBookmarkData {
  highlight_id: string;
  timestamp_seconds: number;
  label?: string;
  notes?: string;
  rating?: number;
  tags?: string[];
}

export function useCreateFilmBookmark() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createBookmark = useCallback(async (data: CreateBookmarkData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/film/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create bookmark");
      }

      const result = await response.json();
      return result.bookmark;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createBookmark,
    isLoading,
    error,
  };
}
