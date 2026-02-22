'use client';

import Link from 'next/link';
import { useDashrEvents } from '@/lib/hooks';
import type { DashrEventType } from '@/lib/hooks';
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from '@/lib/constants/dashr';

const ALL_TYPES: DashrEventType[] = ['combine', 'camp', 'clinic', 'intensive', 'blueprint'];

export default function DashrBrowsePage() {
  const { events, isLoading, error, filters, setTypeFilter } = useDashrEvents();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load events</h3>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="material-symbols-outlined text-primary text-3xl">speed</span>
          <h1 className="text-2xl font-bold text-white">Dashr Events</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Browse and book combines, camps, clinics, and training events
        </p>
      </div>

      {/* Type Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTypeFilter(null)}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            !filters.type
              ? 'bg-primary text-black'
              : 'bg-[#1F1F22] text-gray-400 hover:text-white border border-white/10'
          }`}
        >
          All Events
        </button>
        {ALL_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filters.type === type
                ? 'bg-primary text-black'
                : 'bg-[#1F1F22] text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            {EVENT_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="bg-[#141414] border border-white/5 rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-slate-600 text-5xl mb-3">event_busy</span>
          <h3 className="text-white font-semibold mb-2">No Events Found</h3>
          <p className="text-slate-400 text-sm">
            {filters.type
              ? `No ${EVENT_TYPE_LABELS[filters.type].toLowerCase()} events are currently available.`
              : 'No events are currently available. Check back soon.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => {
            const remaining = event.capacity ? event.capacity - event.booking_count : null;
            const priceDollars = event.price_cents / 100;

            return (
              <Link
                key={event.id}
                href={`/dashr/${event.id}`}
                className="bg-[#141414] border border-white/5 rounded-xl p-5 hover:border-primary/20 transition-all group"
              >
                {/* Type Badge */}
                <div className="mb-3">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded border ${EVENT_TYPE_COLORS[event.event_type as DashrEventType]}`}>
                    {EVENT_TYPE_LABELS[event.event_type as DashrEventType]}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-white font-bold mb-2 group-hover:text-primary transition-colors">
                  {event.title}
                </h3>

                {/* Description Preview */}
                {event.description && (
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{event.description}</p>
                )}

                {/* Date + Location */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <span className="material-symbols-outlined text-lg">calendar_today</span>
                    <span>
                      {new Date(event.start_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      {event.end_date && event.end_date !== event.start_date && (
                        <> - {new Date(event.end_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}</>
                      )}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <span className="material-symbols-outlined text-lg">location_on</span>
                      <span>
                        {event.location}
                        {event.city && event.state && `, ${event.city}, ${event.state}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Price + Capacity */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-white font-bold text-lg">
                    {priceDollars > 0 ? `$${priceDollars.toFixed(0)}` : 'Free'}
                  </span>
                  {remaining !== null && (
                    <span className={`text-xs font-medium ${
                      remaining <= 5 ? 'text-red-400' : remaining <= 20 ? 'text-yellow-400' : 'text-gray-400'
                    }`}>
                      {remaining > 0 ? `${remaining} spots left` : 'Sold Out'}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
