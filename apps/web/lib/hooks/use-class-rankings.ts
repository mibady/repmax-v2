"use client";

import { useState, useEffect, useCallback } from "react";

export interface ClassRanking {
  school_name: string;
  division: string;
  conference: string;
  class_year: number;
  overall_rank: number;
  conference_rank: number;
  total_commits: number;
  five_stars: number;
  four_stars: number;
  three_stars: number;
  avg_rating: string;
  points: string;
}

interface UseClassRankingsOptions {
  year?: number;
  division?: string;
  conference?: string;
  limit?: number;
}

export function useClassRankings(options: UseClassRankingsOptions = {}) {
  const [rankings, setRankings] = useState<ClassRanking[]>([]);
  const [year, setYear] = useState<number>(options.year || new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMock, setIsMock] = useState(false);

  const fetchRankings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.year) params.set("year", options.year.toString());
      if (options.division) params.set("division", options.division);
      if (options.conference) params.set("conference", options.conference);
      if (options.limit) params.set("limit", options.limit.toString());

      const response = await fetch(`/api/rankings/class?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch class rankings");
      }

      const result = await response.json();
      setRankings(result.rankings || []);
      setYear(result.year);
      setIsMock(result.is_mock || false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [options.year, options.division, options.conference, options.limit]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  return {
    rankings,
    year,
    isLoading,
    error,
    isMock,
    refetch: fetchRankings,
  };
}

export interface ProgramRanking {
  rank: number;
  school_name: string;
  division: string;
  conference: string;
  avg_rank: number;
  avg_points: string;
  total_commits: number;
  years_ranked: number;
}

interface UseProgramRankingsOptions {
  division?: string;
  conference?: string;
  metric?: "overall" | "recruiting" | "development" | "nfl_draft";
  limit?: number;
}

export function useProgramRankings(options: UseProgramRankingsOptions = {}) {
  const [programs, setPrograms] = useState<ProgramRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMock, setIsMock] = useState(false);

  const fetchRankings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.division) params.set("division", options.division);
      if (options.conference) params.set("conference", options.conference);
      if (options.metric) params.set("metric", options.metric);
      if (options.limit) params.set("limit", options.limit.toString());

      const response = await fetch(`/api/rankings/program?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch program rankings");
      }

      const result = await response.json();
      setPrograms(result.programs || []);
      setIsMock(result.is_mock || false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [options.division, options.conference, options.metric, options.limit]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  return {
    programs,
    isLoading,
    error,
    isMock,
    refetch: fetchRankings,
  };
}
