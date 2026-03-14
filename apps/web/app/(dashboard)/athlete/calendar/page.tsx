'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  priority: string | null;
};

function formatDate(dateStr: string): { month: string; day: string; year: string } {
  const date = new Date(dateStr + 'T00:00:00');
  return {
    month: date.toLocaleString('en-US', { month: 'short' }),
    day: date.getDate().toString().padStart(2, '0'),
    year: date.getFullYear().toString(),
  };
}

function formatTime(timeStr: string | null): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

function getEventTypeIcon(type: string): string {
  switch (type) {
    case 'visit': return 'location_on';
    case 'camp': return 'camping';
    case 'combine': return 'speed';
    case 'game': return 'sports_football';
    case 'deadline': return 'schedule';
    case 'signing': return 'draw';
    default: return 'event';
  }
}

function getEventTypeLabel(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function getEventTypeColor(type: string): string {
  switch (type) {
    case 'visit': return 'bg-blue-500/15 text-blue-400';
    case 'camp': return 'bg-green-500/15 text-green-400';
    case 'combine': return 'bg-primary/15 text-primary';
    case 'game': return 'bg-red-500/15 text-red-400';
    case 'deadline': return 'bg-orange-500/15 text-orange-400';
    case 'signing': return 'bg-purple-500/15 text-purple-400';
    default: return 'bg-gray-500/15 text-gray-400';
  }
}

export default function AthleteCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/athlete/calendar');
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to load events');
        }
        const data = await res.json();
        setEvents(data.upcoming || []);
        setPastEvents(data.past || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayEvents = showPast ? pastEvents : events;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-8 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/athlete" className="text-text-muted hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </Link>
              <h1 className="text-3xl font-bold text-white">Recruiting Calendar</h1>
            </div>
            <p className="text-text-muted ml-8">Your upcoming visits, camps, combines, and deadlines.</p>
          </div>
          <div className="flex items-center gap-2 bg-surface-dark border border-[#333] rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-primary text-[24px]">calendar_month</span>
            <div>
              <div className="text-2xl font-bold text-white">{events.length}</div>
              <div className="text-xs text-text-muted">Upcoming</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowPast(false)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !showPast ? 'bg-primary text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Upcoming ({events.length})
          </button>
          <button
            onClick={() => setShowPast(true)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              showPast ? 'bg-primary text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Past ({pastEvents.length})
          </button>
        </div>

        {/* Events List */}
        {displayEvents.length === 0 ? (
          <div className="bg-surface-dark rounded-xl border border-[#333] p-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-white/10 mb-4">calendar_month</span>
            <h3 className="text-lg font-bold text-white mb-2">
              {showPast ? 'No Past Events' : 'No Upcoming Events'}
            </h3>
            <p className="text-text-muted text-sm max-w-md mx-auto">
              {showPast
                ? 'Your completed events will appear here.'
                : 'Events will appear here as coaches schedule visits, camps, and combines through RepMax.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayEvents.map((event) => {
              const { month, day } = formatDate(event.event_date);
              return (
                <div
                  key={event.id}
                  className="bg-surface-dark rounded-xl border border-[#333] hover:border-[#444] transition-colors p-5 flex items-start gap-5"
                >
                  {/* Date block */}
                  <div className="flex-shrink-0 w-16 text-center">
                    <div className={`text-xs font-bold uppercase ${event.priority === 'high' ? 'text-red-400' : 'text-text-muted'}`}>
                      {month}
                    </div>
                    <div className="text-2xl font-bold text-white">{day}</div>
                  </div>

                  {/* Event details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold truncate">{event.title}</h3>
                      {event.priority === 'high' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                          High Priority
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-muted flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${getEventTypeColor(event.event_type)}`}>
                        <span className="material-symbols-outlined text-[14px]">{getEventTypeIcon(event.event_type)}</span>
                        {getEventTypeLabel(event.event_type)}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          {event.location}
                        </span>
                      )}
                      {event.event_time && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {formatTime(event.event_time)}
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2">{event.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
