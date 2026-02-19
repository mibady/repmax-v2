"use client";

import { useCallback, useEffect, useState } from "react";

export interface NotificationPreferences {
  push: {
    profileViews: boolean;
    newOffers: boolean;
    shortlist: boolean;
    messages: boolean;
    calendar: boolean;
  };
  email: {
    digest: boolean;
    digestFrequency: "daily" | "weekly" | "monthly" | "never";
    deadlines: boolean;
    marketing: boolean;
  };
  inApp: {
    badge: boolean;
    sounds: boolean;
  };
  quietHours: {
    enabled: boolean;
    from: string;
    to: string;
  };
}

const defaultPreferences: NotificationPreferences = {
  push: {
    profileViews: true,
    newOffers: true,
    shortlist: false,
    messages: true,
    calendar: true,
  },
  email: {
    digest: true,
    digestFrequency: "weekly",
    deadlines: true,
    marketing: false,
  },
  inApp: {
    badge: true,
    sounds: false,
  },
  quietHours: {
    enabled: false,
    from: "22:00",
    to: "07:00",
  },
};

interface UseNotificationPreferencesReturn {
  preferences: NotificationPreferences;
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
  hasChanges: boolean;
  updatePreference: <
    S extends keyof NotificationPreferences,
    K extends keyof NotificationPreferences[S]
  >(
    section: S,
    key: K,
    value: NotificationPreferences[S][K]
  ) => void;
  savePreferences: () => Promise<void>;
  discardChanges: () => void;
}

export function useNotificationPreferences(): UseNotificationPreferencesReturn {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [originalPreferences, setOriginalPreferences] =
    useState<NotificationPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchPreferences = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/settings/notifications");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch preferences");
      }

      const data = await res.json();
      const prefs = data.preferences || defaultPreferences;
      setPreferences(prefs);
      setOriginalPreferences(prefs);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      // Leave preferences as-is so UI can show error state
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreference = useCallback(
    <
      S extends keyof NotificationPreferences,
      K extends keyof NotificationPreferences[S]
    >(
      section: S,
      key: K,
      value: NotificationPreferences[S][K]
    ) => {
      setPreferences((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value,
        },
      }));
      setHasChanges(true);
    },
    []
  );

  const savePreferences = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save preferences");
      }

      setOriginalPreferences(preferences);
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [preferences]);

  const discardChanges = useCallback(() => {
    setPreferences(originalPreferences);
    setHasChanges(false);
  }, [originalPreferences]);

  return {
    preferences,
    isLoading,
    isSaving,
    error,
    hasChanges,
    updatePreference,
    savePreferences,
    discardChanges,
  };
}
