"use client";

import { useCallback, useEffect, useState } from "react";

export interface ModerationUser {
  id: string;
  name: string;
  imageUrl: string;
}

export interface ModerationItem {
  id: string;
  user: ModerationUser;
  type: "photo" | "bio" | "film";
  flagReason: string;
  content?: string;
  reportedAt: string;
  reportedAgo: string;
  status: "pending" | "approved" | "warned" | "removed";
  matchConfidence?: string;
}

export interface ModerationStats {
  totalFlagged: number;
  pendingReview: number;
  resolvedToday: number;
}

interface UseAdminModerationParams {
  type?: "all" | "photo" | "bio" | "film";
  status?: "all" | "pending" | "approved" | "warned" | "removed";
}

interface UseAdminModerationReturn {
  items: ModerationItem[];
  stats: ModerationStats | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
  approveItem: (itemId: string) => Promise<boolean>;
  warnUser: (itemId: string, userId: string) => Promise<boolean>;
  removeContent: (itemId: string, contentType: string, userId: string) => Promise<boolean>;
}

export function useAdminModeration(
  params: UseAdminModerationParams = {}
): UseAdminModerationReturn {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { type = "all", status = "pending" } = params;

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({
        type,
        status,
      });

      const res = await fetch(`/api/admin/moderation?${searchParams}`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch moderation queue");
      }

      const data = await res.json();
      setItems(data.items || []);
      setStats(data.stats || null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [type, status]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const performAction = useCallback(
    async (
      itemId: string,
      action: "approve" | "warn" | "remove",
      contentType?: string,
      userId?: string
    ): Promise<boolean> => {
      try {
        const res = await fetch("/api/admin/moderation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId, action, contentType, userId }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `Failed to ${action} item`);
        }

        // Remove item from local state on success
        setItems((prev) => prev.filter((item) => item.id !== itemId));

        // Update stats
        setStats((prev) =>
          prev
            ? {
                ...prev,
                pendingReview: Math.max(0, prev.pendingReview - 1),
                resolvedToday: prev.resolvedToday + 1,
              }
            : null
        );

        return true;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(`Failed to ${action} item`);
        console.error(`Error ${action}ing item:`, err);
        setError(errorObj);
        return false;
      }
    },
    []
  );

  const approveItem = useCallback(
    async (itemId: string): Promise<boolean> => {
      return performAction(itemId, "approve");
    },
    [performAction]
  );

  const warnUser = useCallback(
    async (itemId: string, userId: string): Promise<boolean> => {
      return performAction(itemId, "warn", undefined, userId);
    },
    [performAction]
  );

  const removeContent = useCallback(
    async (
      itemId: string,
      contentType: string,
      userId: string
    ): Promise<boolean> => {
      return performAction(itemId, "remove", contentType, userId);
    },
    [performAction]
  );

  return {
    items,
    stats,
    isLoading,
    error,
    refresh: fetchItems,
    approveItem,
    warnUser,
    removeContent,
  };
}
