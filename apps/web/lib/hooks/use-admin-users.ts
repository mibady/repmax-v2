"use client";

import { useCallback, useEffect, useState } from "react";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  joinedDate: string;
  lastActive: string;
  isOnlineNow: boolean;
  status: "active" | "suspended" | "pending";
  imageUrl: string;
}

export interface UserStats {
  totalUsers: number;
  activeToday: number;
  newSignups: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UseAdminUsersParams {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface UseAdminUsersReturn {
  users: AdminUser[];
  stats: UserStats | null;
  pagination: Pagination | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
  updateUser: (userId: string, updates: { role?: string; status?: string }) => Promise<boolean>;
}

export function useAdminUsers(params: UseAdminUsersParams = {}): UseAdminUsersReturn {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { search = "", role = "all", status = "all", page = 1, limit = 10 } = params;

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({
        search,
        role,
        status,
        page: String(page),
        limit: String(limit),
      });

      const res = await fetch(`/api/admin/users?${searchParams}`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch users");
      }

      const data = await res.json();
      setUsers(data.users || []);
      setStats(data.stats || null);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [search, role, status, page, limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUser = useCallback(async (userId: string, updates: { role?: string; status?: string }): Promise<boolean> => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updates }),
      });

      if (!res.ok) {
        throw new Error("Failed to update user");
      }

      // Refresh the user list
      await fetchUsers();
      return true;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error("Failed to update user");
      console.error("Error updating user:", err);
      setError(errorObj);
      return false;
    }
  }, [fetchUsers]);

  return {
    users,
    stats,
    pagination,
    isLoading,
    error,
    refresh: fetchUsers,
    updateUser,
  };
}
