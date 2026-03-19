"use client";

import { useCallback, useEffect, useState } from "react";

export interface AdminNote {
  id: string;
  author_id: string;
  target_type: "athlete" | "program" | "coach" | "general";
  target_id: string | null;
  target_name: string | null;
  note_type: "internal" | "flag" | "update" | "task";
  content: string;
  visibility: "admin_only" | "admin_coach" | "admin_coach_parent";
  priority: "normal" | "high" | "urgent";
  created_at: string;
}

interface CreateNoteInput {
  target_type: string;
  target_id?: string;
  target_name?: string;
  note_type: string;
  content: string;
  visibility?: string;
  priority?: string;
}

interface UseAdminNotesReturn {
  notes: AdminNote[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
  createNote: (input: CreateNoteInput) => Promise<void>;
}

export function useAdminNotes(targetType?: string): UseAdminNotesReturn {
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = targetType ? `?target_type=${targetType}` : "";
      const res = await fetch(`/api/admin/notes${params}`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch notes");
      }

      const data = await res.json();
      setNotes(data.notes);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [targetType]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const createNote = useCallback(
    async (input: CreateNoteInput) => {
      const res = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create note");
      }

      await fetchNotes();
    },
    [fetchNotes]
  );

  return {
    notes,
    isLoading,
    error,
    refresh: fetchNotes,
    createNote,
  };
}
