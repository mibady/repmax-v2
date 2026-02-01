"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";
import type { Tables } from "@/types/database";

type Athlete = Tables<"athletes"> & {
  profile: Tables<"profiles"> | null;
};

interface UseAthletesOptions {
  position?: string;
  state?: string;
  zone?: string;
  class_year?: number;
  min_stars?: number;
  verified?: boolean;
  limit?: number;
}

export function useAthletes(options: UseAthletesOptions = {}) {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAthletes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.position) params.set("position", options.position);
      if (options.state) params.set("state", options.state);
      if (options.zone) params.set("zone", options.zone);
      if (options.class_year) params.set("class_year", String(options.class_year));
      if (options.min_stars) params.set("min_stars", String(options.min_stars));
      if (options.verified !== undefined) params.set("verified", String(options.verified));
      if (options.limit) params.set("limit", String(options.limit));

      const res = await fetch(`/api/athletes?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch athletes");

      const data = await res.json();
      setAthletes(data.athletes || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [options.position, options.state, options.zone, options.class_year, options.min_stars, options.verified, options.limit]);

  useEffect(() => {
    fetchAthletes();
  }, [fetchAthletes]);

  return { athletes, total, isLoading, error, refetch: fetchAthletes };
}

export function useAthlete(id: string) {
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchAthlete() {
      setIsLoading(true);
      const supabase = createClient();

      const { data, error: err } = await supabase
        .from("athletes")
        .select(`*, profile:profiles(*)`)
        .eq("id", id)
        .single();

      if (err) {
        setError(new Error(err.message));
      } else {
        setAthlete(data as Athlete);
      }
      setIsLoading(false);
    }

    if (id) fetchAthlete();
  }, [id]);

  return { athlete, isLoading, error };
}
