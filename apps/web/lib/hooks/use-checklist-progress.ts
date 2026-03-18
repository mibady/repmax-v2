'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * SSR-safe localStorage-backed checklist progress hook.
 * Stores checked question IDs per checklist key.
 */
export function useChecklistProgress(key: string) {
  const storageKey = `repmax-${key}`;
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        setChecked(new Set(parsed));
      }
    } catch {
      // Ignore parse errors
    }
    setHydrated(true);
  }, [storageKey]);

  // Persist to localStorage on change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify([...checked]));
    } catch {
      // Ignore storage errors
    }
  }, [checked, hydrated, storageKey]);

  const toggle = useCallback((id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const isChecked = useCallback((id: string) => checked.has(id), [checked]);

  const reset = useCallback(() => {
    setChecked(new Set());
  }, []);

  const progress = useCallback(
    (totalIds: string[]) => {
      if (totalIds.length === 0) return 0;
      const done = totalIds.filter((id) => checked.has(id)).length;
      return Math.round((done / totalIds.length) * 100);
    },
    [checked]
  );

  const checkedCount = useCallback(
    (totalIds: string[]) => totalIds.filter((id) => checked.has(id)).length,
    [checked]
  );

  return { toggle, isChecked, reset, progress, checkedCount, checked, hydrated };
}
