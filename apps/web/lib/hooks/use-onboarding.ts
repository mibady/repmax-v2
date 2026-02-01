"use client";

import { useState, useEffect, useCallback } from "react";

export interface OnboardingProgress {
  id?: string;
  role?: string;
  current_step: number;
  completed_steps: number[];
  collected_data: Record<string, any>;
  chat_history: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp?: string;
  }>;
  started_at: string | null;
  completed_at: string | null;
  last_interaction_at?: string;
}

export function useOnboarding() {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [exists, setExists] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/onboarding/progress");

      if (!response.ok) {
        throw new Error("Failed to fetch onboarding progress");
      }

      const result = await response.json();
      setExists(result.exists);
      setProgress(result.progress);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const updateProgress = useCallback(async (data: {
    current_step?: number;
    completed_steps?: number[];
    collected_data?: Record<string, any>;
    chat_history?: Array<{ role: "user" | "assistant"; content: string }>;
    completed?: boolean;
  }) => {
    try {
      const response = await fetch("/api/onboarding/progress", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update onboarding progress");
      }

      const result = await response.json();
      setProgress(result.progress);
      setExists(true);
      return result.progress;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      throw err;
    }
  }, []);

  const addChatMessage = useCallback(async (role: "user" | "assistant", content: string) => {
    return updateProgress({
      chat_history: [{ role, content }],
    });
  }, [updateProgress]);

  const completeStep = useCallback(async (step: number) => {
    const currentCompleted = progress?.completed_steps || [];
    if (!currentCompleted.includes(step)) {
      return updateProgress({
        completed_steps: [...currentCompleted, step],
        current_step: step + 1,
      });
    }
  }, [progress, updateProgress]);

  const saveData = useCallback(async (data: Record<string, any>) => {
    return updateProgress({
      collected_data: data,
    });
  }, [updateProgress]);

  const completeOnboarding = useCallback(async () => {
    return updateProgress({
      completed: true,
    });
  }, [updateProgress]);

  return {
    progress,
    exists,
    isLoading,
    error,
    refetch: fetchProgress,
    updateProgress,
    addChatMessage,
    completeStep,
    saveData,
    completeOnboarding,
    isComplete: !!progress?.completed_at,
  };
}
