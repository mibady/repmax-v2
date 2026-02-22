"use client";

import { useCallback, useEffect, useState } from "react";

export interface DashrBooking {
  id: string;
  event_id: string;
  quantity: number;
  status: "pending" | "confirmed" | "canceled";
  amount_cents: number;
  stripe_session_id: string | null;
  event_title: string | null;
  event_date: string | null;
  created_at: string;
}

interface UseDashrBookingsReturn {
  bookings: DashrBooking[];
  isLoading: boolean;
  error: Error | null;
  createBooking: (eventId: string, quantity?: number) => Promise<{ sessionUrl?: string }>;
  refetch: () => void;
}

export function useDashrBookings(): UseDashrBookingsReturn {
  const [bookings, setBookings] = useState<DashrBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/dashr/bookings");

      if (!res.ok) {
        // If 404 or no bookings endpoint, just return empty
        if (res.status === 404) {
          setBookings([]);
          return;
        }
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch bookings");
      }

      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBooking = useCallback(async (eventId: string, quantity: number = 1): Promise<{ sessionUrl?: string }> => {
    setError(null);

    try {
      const res = await fetch(`/api/dashr/${eventId}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create booking");
      }

      const data = await res.json();

      // Refresh bookings list after creating
      await fetchBookings();

      return { sessionUrl: data.sessionUrl };
    } catch (err) {
      const bookingError = err instanceof Error ? err : new Error("Unknown error");
      setError(bookingError);
      throw bookingError;
    }
  }, [fetchBookings]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    isLoading,
    error,
    createBooking,
    refetch: fetchBookings,
  };
}
