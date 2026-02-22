"use client";

import { useCallback, useEffect, useState } from "react";

export interface SchoolMemberDetail {
  id: string;
  profile_id: string;
  role: "admin" | "coach" | "staff";
  full_name: string | null;
  email: string | null;
  created_at: string;
}

interface UseSchoolMembersReturn {
  members: SchoolMemberDetail[];
  isLoading: boolean;
  error: Error | null;
  addMember: (email: string, role: "admin" | "coach" | "staff") => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  refetch: () => void;
}

export function useSchoolMembers(): UseSchoolMembersReturn {
  const [members, setMembers] = useState<SchoolMemberDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/schools/members");

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch members");
      }

      const data = await res.json();
      setMembers(data.members || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addMember = useCallback(async (email: string, role: "admin" | "coach" | "staff") => {
    setError(null);

    try {
      const res = await fetch("/api/schools/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add member");
      }

      await fetchMembers();
    } catch (err) {
      const memberError = err instanceof Error ? err : new Error("Unknown error");
      setError(memberError);
      throw memberError;
    }
  }, [fetchMembers]);

  const removeMember = useCallback(async (memberId: string) => {
    setError(null);

    try {
      const res = await fetch("/api/schools/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: memberId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove member");
      }

      await fetchMembers();
    } catch (err) {
      const memberError = err instanceof Error ? err : new Error("Unknown error");
      setError(memberError);
      throw memberError;
    }
  }, [fetchMembers]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    isLoading,
    error,
    addMember,
    removeMember,
    refetch: fetchMembers,
  };
}
