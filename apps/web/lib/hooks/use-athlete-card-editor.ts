"use client";

import { useCallback, useEffect, useState } from "react";

export interface AthleteCardData {
  // Identity
  athleteId: string;
  repmaxId: string;
  // Basic Info
  name: string;
  position: string;
  secondaryPosition: string;
  classYear: number;
  highSchool: string;
  city: string;
  state: string;
  bio: string;
  zone: string;
  avatarUrl: string;
  // Measurables
  height: string;
  weight: string;
  wingspan: string;
  fortyYard: string;
  benchPress: string;
  squat: string;
  vertical: string;
  // Academics
  gpa: string;
  sat: string;
  act: string;
  major: string;
  // Film
  hudlLink: string;
  youtubeLink: string;
  // New metrics
  tenYardSplit: string;
  fiveTenFive: string;
  broadJump: string;
  // Weighted GPA
  weightedGpa: string;
  // Text sections
  coachNotes: string;
  playerSummary: string;
  // Coach contact
  coachPhone: string;
  coachEmail: string;
  // Contact & Social
  phone: string;
  twitter: string;
  instagram: string;
  // Parent/Guardian 1
  parent1Name: string;
  parent1Phone: string;
  parent1Email: string;
  // Parent/Guardian 2
  parent2Name: string;
  parent2Phone: string;
  parent2Email: string;
  // Family
  siblingsInfo: string;
  // Team Info
  jerseyNumber: string;
  organizationName: string;
  // Additional Academics
  coreGpa: string;
  academicInterest: string;
  collegePriority: string;
  // Recruiting
  awards: string;
  otherSports: string;
  campsAttended: string;
  dreamSchools: string;
  // Equipment Sizes
  cleatSize: string;
  shirtSize: string;
  pantsSize: string;
  helmetSize: string;
  gloveSize: string;
}

interface UseAthleteCardEditorReturn {
  data: AthleteCardData | null;
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
  saveError: Error | null;
  updateField: (field: keyof AthleteCardData, value: string | number) => void;
  save: () => Promise<boolean>;
  profileCompletion: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _formatHeight(inches: number | null): string {
  if (!inches) return "";
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}"`;
}

function parseHeight(heightStr: string): number | null {
  const match = heightStr.match(/(\d+)'(\d+)"/);
  if (match) {
    return parseInt(match[1]) * 12 + parseInt(match[2]);
  }
  return null;
}

export function useAthleteCardEditor(): UseAthleteCardEditorReturn {
  const [data, setData] = useState<AthleteCardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [saveError, setSaveError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/athlete/card");

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load profile");
      }

      const responseData = await res.json();
      setData(responseData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      // Leave data as null so UI can show error state
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateField = useCallback(
    (field: keyof AthleteCardData, value: string | number) => {
      setData((prev) => {
        if (!prev) return prev;
        return { ...prev, [field]: value };
      });
    },
    []
  );

  const save = useCallback(async (): Promise<boolean> => {
    if (!data) return false;

    setIsSaving(true);
    setSaveError(null);

    try {
      const res = await fetch("/api/athlete/card", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          heightInches: parseHeight(data.height),
          weightLbs: data.weight ? parseInt(data.weight) : null,
          fortyYardDash: data.fortyYard ? parseFloat(data.fortyYard) : null,
          gpa: data.gpa ? parseFloat(data.gpa) : null,
          coreGpa: data.coreGpa || null,
        }),
      });

      if (!res.ok) {
        const responseData = await res.json();
        throw new Error(responseData.error || "Failed to save profile");
      }

      return true;
    } catch (err) {
      setSaveError(err instanceof Error ? err : new Error("Unknown error"));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [data]);

  // Calculate profile completion
  const profileCompletion = data
    ? Math.round(
        (Object.values(data).filter((v) => v !== "" && v !== null).length /
          Object.keys(data).length) *
          100
      )
    : 0;

  return {
    data,
    isLoading,
    isSaving,
    error,
    saveError,
    updateField,
    save,
    profileCompletion,
  };
}
