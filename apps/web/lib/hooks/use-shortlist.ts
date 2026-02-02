"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import {
  getShortlist,
  addToShortlist,
  removeFromShortlist,
  updateShortlistPriority,
  updateShortlistStatus,
  type PipelineStatus,
} from "@/lib/actions/shortlist-actions";
import type { Tables } from "@/types/database";

type ShortlistItem = Tables<"shortlists"> & {
  athlete: Tables<"athletes"> & {
    profile: Pick<Tables<"profiles">, "full_name" | "avatar_url"> | null;
  };
};

export function useShortlist() {
  const [shortlist, setShortlist] = useState<ShortlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchShortlist = useCallback(async () => {
    setIsLoading(true);
    const data = await getShortlist();
    setShortlist(data as ShortlistItem[]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchShortlist();
  }, [fetchShortlist]);

  const add = useCallback(
    async (athleteId: string, notes?: string) => {
      const result = await addToShortlist(athleteId, notes);
      if (!result.error) {
        startTransition(() => {
          fetchShortlist();
        });
      }
      return result;
    },
    [fetchShortlist]
  );

  const remove = useCallback(
    async (athleteId: string) => {
      const result = await removeFromShortlist(athleteId);
      if (!result.error) {
        startTransition(() => {
          fetchShortlist();
        });
      }
      return result;
    },
    [fetchShortlist]
  );

  const updatePriority = useCallback(
    async (athleteId: string, priority: "low" | "medium" | "high" | "top") => {
      const result = await updateShortlistPriority(athleteId, priority);
      if (!result.error) {
        startTransition(() => {
          fetchShortlist();
        });
      }
      return result;
    },
    [fetchShortlist]
  );

  const updateStatus = useCallback(
    async (athleteId: string, status: PipelineStatus) => {
      const result = await updateShortlistStatus(athleteId, status);
      if (!result.error) {
        startTransition(() => {
          fetchShortlist();
        });
      }
      return result;
    },
    [fetchShortlist]
  );

  const isInShortlist = useCallback(
    (athleteId: string) => {
      return shortlist.some((item) => item.athlete_id === athleteId);
    },
    [shortlist]
  );

  return {
    shortlist,
    isLoading,
    isPending,
    add,
    remove,
    updatePriority,
    updateStatus,
    isInShortlist,
    refetch: fetchShortlist,
  };
}

export type { PipelineStatus };
