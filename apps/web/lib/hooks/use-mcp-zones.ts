"use client";

import { useState, useEffect, useCallback } from "react";
import type { ZoneInfo, Program, Prospect, CalendarContext, ZoneCode } from "@/lib/data/zone-data";

// Hook to fetch all zones data
export function useMcpZones() {
  const [zones, setZones] = useState<ZoneInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchZones = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/mcp/zones");
      if (!response.ok) {
        throw new Error("Failed to fetch zones");
      }

      const data = await response.json();
      setZones(data.zones || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  return { zones, isLoading, error, refetch: fetchZones };
}

// Hook to fetch single zone data with prospects
export function useMcpZone(zoneCode: ZoneCode | null) {
  const [zone, setZone] = useState<ZoneInfo | null>(null);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchZone = useCallback(async () => {
    if (!zoneCode) {
      setZone(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/mcp/zones/${zoneCode}`);
      if (!response.ok) {
        throw new Error("Failed to fetch zone data");
      }

      const data = await response.json();
      setZone(data.zone || null);
      setProspects(data.prospects || []);
      setPrograms(data.programs || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [zoneCode]);

  useEffect(() => {
    fetchZone();
  }, [fetchZone]);

  return { zone, prospects, programs, isLoading, error, refetch: fetchZone };
}

// Hook to fetch prospects by position
export function useMcpProspectsByPosition(position: string | null, limit = 20) {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProspects = useCallback(async () => {
    if (!position) {
      setProspects([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/mcp/prospects?position=${position}&limit=${limit}`);
      if (!response.ok) {
        throw new Error("Failed to fetch prospects");
      }

      const data = await response.json();
      setProspects(data.prospects || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [position, limit]);

  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

  return { prospects, isLoading, error, refetch: fetchProspects };
}

// Hook to fetch programs by state
export function useMcpPrograms(state: string | null, limit = 20) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrograms = useCallback(async () => {
    if (!state) {
      setPrograms([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/mcp/programs?state=${state}&limit=${limit}`);
      if (!response.ok) {
        throw new Error("Failed to fetch programs");
      }

      const data = await response.json();
      setPrograms(data.programs || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [state, limit]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  return { programs, isLoading, error, refetch: fetchPrograms };
}

// Hook to fetch recruiting calendar
export function useMcpCalendar() {
  const [calendar, setCalendar] = useState<CalendarContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCalendar = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/mcp/calendar");
      if (!response.ok) {
        throw new Error("Failed to fetch calendar");
      }

      const data = await response.json();
      setCalendar(data.calendar || null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  return { calendar, isLoading, error, refetch: fetchCalendar };
}
