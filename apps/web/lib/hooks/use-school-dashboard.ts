"use client";

import { useCallback, useEffect, useState } from "react";

export interface School {
  id: string;
  name: string;
  slug: string;
  division: string | null;
  conference: string | null;
  city: string | null;
  state: string | null;
  tier_slug: string | null;
  logo_url: string | null;
  created_at: string;
}

export interface SchoolMember {
  id: string;
  profile_id: string;
  role: "admin" | "coach" | "staff";
  full_name: string | null;
  email: string | null;
  created_at: string;
}

export interface SchoolCredit {
  id: string;
  credit_type: string;
  balance: number;
}

interface UseSchoolDashboardReturn {
  school: School | null;
  members: SchoolMember[];
  credits: SchoolCredit[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useSchoolDashboard(): UseSchoolDashboardReturn {
  const [school, setSchool] = useState<School | null>(null);
  const [members, setMembers] = useState<SchoolMember[]>([]);
  const [credits, setCredits] = useState<SchoolCredit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/schools");

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch school data");
      }

      const data = await res.json();
      setSchool(data.school || null);
      setMembers(data.members || []);
      setCredits(data.credits || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    school,
    members,
    credits,
    isLoading,
    error,
    refetch: fetchDashboard,
  };
}
