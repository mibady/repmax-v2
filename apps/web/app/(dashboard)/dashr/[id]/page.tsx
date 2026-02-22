'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { DashrEventType } from '@/lib/hooks';
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from '@/lib/constants/dashr';

interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  event_type: DashrEventType;
  start_date: string;
  end_date: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  capacity: number | null;
  price_cents: number;
  product_slug: string;
  booking_count: number;
  created_at: string;
}

interface UserBooking {
  id: string;
  status: 'pending' | 'confirmed' | 'canceled';
  quantity: number;
  created_at: string;
}

function EventDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [userBooking, setUserBooking] = useState<UserBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const checkoutStatus = searchParams.get('checkout');

  const fetchEvent = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/dashr/${eventId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch event');
      }

      const data = await res.json();
      setEvent(data.event || null);
      setUserBooking(data.userBooking || null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId, fetchEvent]);

  const handleBook = async () => {
    setBookingLoading(true);
    setBookingError(null);

    try {
      const res = await fetch(`/api/dashr/${eventId}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create booking');
      }

      const data = await res.json();
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      }
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Failed to book');
    } finally {
      setBookingLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Event Not Found</h3>
          <p className="text-slate-400 text-sm">{error?.message || 'This event does not exist or has been removed.'}</p>
          <Link
            href="/dashr"
            className="mt-4 inline-block text-primary text-sm font-medium hover:underline"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const remaining = event.capacity ? event.capacity - event.booking_count : null;
  const isSoldOut = remaining !== null && remaining <= 0;
  const priceDollars = event.price_cents / 100;
  const isIntensive = event.event_type === 'intensive';

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Back Link */}
      <Link
        href="/dashr"
        className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition-colors"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Back to Events
      </Link>

      {/* Checkout Status Banner */}
      {checkoutStatus === 'success' && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-green-400 text-2xl">check_circle</span>
          <div>
            <h3 className="text-white font-semibold">Booking Confirmed!</h3>
            <p className="text-gray-400 text-sm">Your spot has been reserved. You will receive a confirmation email shortly.</p>
          </div>
        </div>
      )}
      {checkoutStatus === 'canceled' && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-yellow-400 text-2xl">warning</span>
          <div>
            <h3 className="text-white font-semibold">Booking Canceled</h3>
            <p className="text-gray-400 text-sm">Your checkout was canceled. You can try again below.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-[#141414] border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-2.5 py-1 text-xs font-medium rounded border ${EVENT_TYPE_COLORS[event.event_type] || EVENT_TYPE_COLORS.combine}`}>
                {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-white mb-4">{event.title}</h1>

            {event.description && (
              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            )}
          </div>

          {/* Details Grid */}
          <div className="bg-[#141414] border border-white/5 rounded-xl p-6">
            <h2 className="text-white font-bold mb-4">Event Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">calendar_today</span>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Date</p>
                  <p className="text-white text-sm font-medium">
                    {new Date(event.start_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  {event.end_date && event.end_date !== event.start_date && (
                    <p className="text-gray-400 text-xs mt-0.5">
                      through {new Date(event.end_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </div>

              {event.location && (
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary">location_on</span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Location</p>
                    <p className="text-white text-sm font-medium">{event.location}</p>
                    {event.city && event.state && (
                      <p className="text-gray-400 text-xs mt-0.5">{event.city}, {event.state}</p>
                    )}
                  </div>
                </div>
              )}

              {event.capacity && (
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary">groups</span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Capacity</p>
                    <p className="text-white text-sm font-medium">
                      {event.booking_count} / {event.capacity} registered
                    </p>
                    {remaining !== null && (
                      <p className={`text-xs mt-0.5 ${remaining <= 5 ? 'text-red-400' : 'text-gray-400'}`}>
                        {remaining > 0 ? `${remaining} spots remaining` : 'Sold Out'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">payments</span>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Price</p>
                  <p className="text-white text-sm font-medium">
                    {priceDollars > 0 ? `$${priceDollars.toFixed(2)}` : 'Free'}
                    {isIntensive && priceDollars > 0 && ' / day'}
                  </p>
                </div>
              </div>
            </div>

            {/* Capacity Bar */}
            {event.capacity && (
              <div className="mt-6">
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isSoldOut ? 'bg-red-500' : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(100, (event.booking_count / event.capacity) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="space-y-4">
          <div className="bg-[#141414] border border-white/5 rounded-xl p-5 sticky top-6">
            {userBooking ? (
              <>
                <h3 className="text-white font-bold mb-3">Your Booking</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Status</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      userBooking.status === 'confirmed' ? 'bg-green-500/10 text-green-400' :
                      userBooking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {userBooking.status.charAt(0).toUpperCase() + userBooking.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Quantity</span>
                    <span className="text-white text-sm font-medium">{userBooking.quantity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Booked</span>
                    <span className="text-white text-sm">
                      {new Date(userBooking.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-400 text-lg">check_circle</span>
                    <span className="text-green-400 text-sm font-medium">You are registered for this event</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-white font-bold mb-3">Book This Event</h3>

                {/* Price Display */}
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-white">
                    ${priceDollars > 0 ? priceDollars.toFixed(0) : '0'}
                  </span>
                  {isIntensive && <span className="text-gray-400 text-sm">/ day</span>}
                </div>

                {/* Quantity Picker for Intensive */}
                {isIntensive && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Number of Days</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="size-10 rounded-lg bg-[#1F1F22] border border-white/10 text-white flex items-center justify-center hover:bg-white/5 transition-colors"
                      >
                        <span className="material-symbols-outlined">remove</span>
                      </button>
                      <span className="text-white font-bold text-lg w-8 text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(10, quantity + 1))}
                        className="size-10 rounded-lg bg-[#1F1F22] border border-white/10 text-white flex items-center justify-center hover:bg-white/5 transition-colors"
                      >
                        <span className="material-symbols-outlined">add</span>
                      </button>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      Total: ${(priceDollars * quantity).toFixed(0)}
                    </p>
                  </div>
                )}

                {/* Book Button */}
                <button
                  onClick={handleBook}
                  disabled={bookingLoading || isSoldOut}
                  className="w-full py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? 'Processing...' : isSoldOut ? 'Sold Out' : 'Book Now'}
                </button>

                {bookingError && (
                  <p className="text-red-400 text-sm mt-3">{bookingError}</p>
                )}

                {remaining !== null && remaining <= 10 && remaining > 0 && (
                  <p className="text-red-400 text-xs mt-3 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    Only {remaining} spots remaining
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashrEventDetailPage() {
  return (
    <React.Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    }>
      <EventDetailContent />
    </React.Suspense>
  );
}
