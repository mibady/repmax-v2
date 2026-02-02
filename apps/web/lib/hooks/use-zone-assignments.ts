"use client";

import { useCallback, useEffect, useState } from "react";
import type { ZoneCode } from "@/lib/data/zone-data";

export interface ZoneAssignment {
  id: string;
  recruiterId: string;
  recruiterName: string;
  imageUrl: string | null;
  zoneCode: ZoneCode;
  assignedAt: string;
}

export interface AvailableRecruiter {
  id: string;
  name: string;
  imageUrl: string | null;
  title: string;
  school: string;
}

interface UseZoneAssignmentsReturn {
  assignments: Record<string, ZoneAssignment>;
  availableRecruiters: AvailableRecruiter[];
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
  lastSaved: string | null;
  refetch: () => Promise<void>;
  assignRecruiter: (zoneCode: ZoneCode, recruiterId: string) => Promise<boolean>;
  removeAssignment: (zoneCode: ZoneCode) => Promise<boolean>;
  saveAllAssignments: () => Promise<boolean>;
  getAssignmentForZone: (zoneCode: string) => { recruiter: string; imageUrl: string } | undefined;
  hasUnsavedChanges: boolean;
  setLocalAssignment: (zoneCode: ZoneCode, recruiter: AvailableRecruiter | null) => void;
}

export function useZoneAssignments(): UseZoneAssignmentsReturn {
  const [assignments, setAssignments] = useState<Record<string, ZoneAssignment>>({});
  const [localAssignments, setLocalAssignments] = useState<Record<string, ZoneAssignment | null>>({});
  const [availableRecruiters, setAvailableRecruiters] = useState<AvailableRecruiter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const fetchAssignments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/recruiter/assignments");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch assignments");
      }

      const data = await res.json();
      setAssignments(data.assignments || {});
      setAvailableRecruiters(data.availableRecruiters || []);
      setLastSaved(data.lastSaved || null);
      setLocalAssignments({}); // Reset local changes
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Set a local assignment (optimistic UI update before saving)
  const setLocalAssignment = useCallback((zoneCode: ZoneCode, recruiter: AvailableRecruiter | null) => {
    setLocalAssignments((prev) => ({
      ...prev,
      [zoneCode]: recruiter
        ? {
            id: `local-${recruiter.id}-${zoneCode}`,
            recruiterId: recruiter.id,
            recruiterName: recruiter.name,
            imageUrl: recruiter.imageUrl,
            zoneCode,
            assignedAt: new Date().toISOString(),
          }
        : null,
    }));
    setHasUnsavedChanges(true);
  }, []);

  const assignRecruiter = useCallback(async (zoneCode: ZoneCode, recruiterId: string): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/recruiter/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign",
          zoneCode,
          recruiterId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to assign recruiter");
      }

      // Refresh data after successful assignment
      await fetchAssignments();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [fetchAssignments]);

  const removeAssignment = useCallback(async (zoneCode: ZoneCode): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/recruiter/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove",
          zoneCode,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove assignment");
      }

      // Refresh data after successful removal
      await fetchAssignments();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [fetchAssignments]);

  const saveAllAssignments = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      // Merge local changes with existing assignments
      const mergedAssignments = { ...assignments };
      Object.entries(localAssignments).forEach(([zone, assignment]) => {
        if (assignment === null) {
          delete mergedAssignments[zone];
        } else {
          mergedAssignments[zone] = assignment;
        }
      });

      const res = await fetch("/api/recruiter/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_all",
          assignments: mergedAssignments,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save assignments");
      }

      const data = await res.json();
      setLastSaved(data.savedAt);
      setHasUnsavedChanges(false);
      setLocalAssignments({});

      // Apply local changes to state
      setAssignments(mergedAssignments);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [assignments, localAssignments]);

  // Get assignment for a zone, checking local changes first
  const getAssignmentForZone = useCallback(
    (zoneCode: string): { recruiter: string; imageUrl: string } | undefined => {
      // Check local changes first
      if (zoneCode in localAssignments) {
        const local = localAssignments[zoneCode];
        if (local === null) return undefined;
        return {
          recruiter: local.recruiterName,
          imageUrl: local.imageUrl || "",
        };
      }

      // Fall back to server data
      const assignment = assignments[zoneCode];
      if (!assignment) return undefined;

      return {
        recruiter: assignment.recruiterName,
        imageUrl: assignment.imageUrl || "",
      };
    },
    [assignments, localAssignments]
  );

  return {
    assignments,
    availableRecruiters,
    isLoading,
    isSaving,
    error,
    lastSaved,
    refetch: fetchAssignments,
    assignRecruiter,
    removeAssignment,
    saveAllAssignments,
    getAssignmentForZone,
    hasUnsavedChanges,
    setLocalAssignment,
  };
}
