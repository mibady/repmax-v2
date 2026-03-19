"use client";

import { useCallback, useEffect, useState } from "react";

export interface AdminTask {
  id: string;
  title: string;
  details: string | null;
  assigned_to: string | null;
  assigned_name: string | null;
  priority: "normal" | "high" | "urgent";
  status: "open" | "in_progress" | "completed";
  due_date: string | null;
  linked_to: string | null;
  linked_type: string | null;
  created_by: string | null;
  created_at: string;
  completed_at: string | null;
}

interface CreateTaskInput {
  title: string;
  details?: string;
  assigned_name?: string;
  priority?: string;
  due_date?: string;
  linked_to?: string;
  linked_type?: string;
}

interface UpdateTaskInput {
  id: string;
  status: string;
}

interface UseAdminTasksReturn {
  tasks: AdminTask[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
  createTask: (input: CreateTaskInput) => Promise<void>;
  updateTask: (input: UpdateTaskInput) => Promise<void>;
}

export function useAdminTasks(): UseAdminTasksReturn {
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/tasks");

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch tasks");
      }

      const data = await res.json();
      setTasks(data.tasks);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(
    async (input: CreateTaskInput) => {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create task");
      }

      await fetchTasks();
    },
    [fetchTasks]
  );

  const updateTask = useCallback(
    async (input: UpdateTaskInput) => {
      const res = await fetch("/api/admin/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update task");
      }

      await fetchTasks();
    },
    [fetchTasks]
  );

  return {
    tasks,
    isLoading,
    error,
    refresh: fetchTasks,
    createTask,
    updateTask,
  };
}
