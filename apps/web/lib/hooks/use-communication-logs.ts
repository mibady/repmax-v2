"use client";

import { useCallback, useEffect, useState } from "react";

export interface CommunicationLog {
  id: string;
  prospect: {
    id: string;
    name: string;
    initials: string;
    gradientFrom: string;
    gradientTo: string;
    classYear: string;
  };
  type: "call" | "visit" | "email" | "message";
  summary: string;
  staff: {
    id: string;
    name: string;
    initials: string;
  };
  datetime: string;
  direction: "incoming" | "outgoing";
}

export interface StaffMember {
  id: string;
  name: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UseCommunicationLogsReturn {
  logs: CommunicationLog[];
  staffMembers: StaffMember[];
  pagination: Pagination;
  isLoading: boolean;
  error: Error | null;
  filters: {
    type: string;
    search: string;
    staff: string;
    dateFrom: string;
    dateTo: string;
  };
  setTypeFilter: (type: string) => void;
  setSearchFilter: (search: string) => void;
  setStaffFilter: (staff: string) => void;
  setDateFilter: (dateFrom: string, dateTo: string) => void;
  goToPage: (page: number) => void;
  refresh: () => void;
}

export function useCommunicationLogs(): UseCommunicationLogsReturn {
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState({
    type: "",
    search: "",
    staff: "",
    dateFrom: "",
    dateTo: "",
  });

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());

      if (filters.type) {
        params.set("type", filters.type);
      }
      if (filters.search) {
        params.set("search", filters.search);
      }
      if (filters.staff) {
        params.set("staff", filters.staff);
      }
      if (filters.dateFrom) {
        params.set("dateFrom", filters.dateFrom);
      }
      if (filters.dateTo) {
        params.set("dateTo", filters.dateTo);
      }

      const res = await fetch(`/api/recruiting/communications?${params}`);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch communications");
      }

      const data = await res.json();
      setLogs(data.logs);
      setStaffMembers(data.staffMembers || []);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, filters.type, filters.search, filters.staff, filters.dateFrom, filters.dateTo]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const setTypeFilter = useCallback((type: string) => {
    setFilters((prev) => ({ ...prev, type }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const setSearchFilter = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const setStaffFilter = useCallback((staff: string) => {
    setFilters((prev) => ({ ...prev, staff }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const setDateFilter = useCallback((dateFrom: string, dateTo: string) => {
    setFilters((prev) => ({ ...prev, dateFrom, dateTo }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    staffMembers,
    pagination,
    isLoading,
    error,
    filters,
    setTypeFilter,
    setSearchFilter,
    setStaffFilter,
    setDateFilter,
    goToPage,
    refresh,
  };
}
