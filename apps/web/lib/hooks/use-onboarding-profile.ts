"use client";

import { useState, useEffect, useCallback } from "react";

export interface ProfileData {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
  created_at?: string;
}

export interface AthleteData {
  id: string;
  profile_id: string;
  high_school: string;
  city: string;
  state: string;
  zone: string | null;
  class_year: number;
  primary_position: string;
  secondary_position: string | null;
  height_inches: number | null;
  weight_lbs: number | null;
  forty_yard_time: number | null;
  vertical_inches: number | null;
  gpa: number | null;
  sat_score: number | null;
  act_score: number | null;
  ncaa_id: string | null;
  ncaa_cleared: boolean;
  verified?: boolean;
}

export interface CompletionData {
  percentage: number;
  completedFields: string[];
  totalFields: number;
  requiredComplete: boolean;
}

export interface OnboardingProfileData {
  profile: ProfileData | null;
  athlete: AthleteData | null;
  completion: CompletionData;
}

export interface ProfileUpdateData {
  // Basic profile info
  full_name?: string;
  avatar_url?: string | null;

  // Athlete-specific info
  high_school?: string;
  city?: string;
  state?: string;
  class_year?: number;
  primary_position?: string;
  secondary_position?: string | null;

  // Measurables
  height_inches?: number | null;
  weight_lbs?: number | null;
  forty_yard_time?: number | null;
  vertical_inches?: number | null;

  // Academics
  gpa?: number | null;
  sat_score?: number | null;
  act_score?: number | null;

  // NCAA
  ncaa_id?: string | null;
  ncaa_cleared?: boolean;
}

export function useOnboardingProfile() {
  const [data, setData] = useState<OnboardingProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/onboarding/profile");

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Not authenticated");
        }
        throw new Error("Failed to fetch profile data");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (updates: ProfileUpdateData) => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch("/api/onboarding/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const result = await response.json();

      // Update local state with new data
      setData({
        profile: result.profile,
        athlete: result.athlete,
        completion: result.completion,
      });

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Convenience method to update a single field
  const updateField = useCallback(async <K extends keyof ProfileUpdateData>(
    field: K,
    value: ProfileUpdateData[K]
  ) => {
    return updateProfile({ [field]: value } as ProfileUpdateData);
  }, [updateProfile]);

  // Helper to format height for display
  const formatHeight = useCallback((inches: number | null): string => {
    if (!inches) return "--";
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}"`;
  }, []);

  // Helper to parse height from feet/inches input
  const parseHeight = useCallback((feet: number, inches: number): number => {
    return feet * 12 + inches;
  }, []);

  return {
    // Data
    profile: data?.profile ?? null,
    athlete: data?.athlete ?? null,
    completion: data?.completion ?? { percentage: 0, completedFields: [], totalFields: 15, requiredComplete: false },

    // State
    isLoading,
    isSaving,
    error,

    // Actions
    refetch: fetchProfile,
    updateProfile,
    updateField,

    // Helpers
    formatHeight,
    parseHeight,

    // Computed
    isComplete: data?.completion?.requiredComplete ?? false,
    completionPercentage: data?.completion?.percentage ?? 0,
  };
}
