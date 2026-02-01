'use client';

import Link from 'next/link';

interface CalendarEvent {
  title: string;
  date: string;
  urgency: 'urgent' | 'upcoming' | 'future';
}

interface RecruitingCalendarWidgetProps {
  events?: CalendarEvent[];
  activeWindow?: string;
  showActiveWindow?: boolean;
}

const defaultEvents: CalendarEvent[] = [
  { title: 'Portal Window Closes', date: 'Jan 16', urgency: 'urgent' },
  { title: 'National Signing Day', date: 'Feb 5', urgency: 'upcoming' },
  { title: 'Spring Portal Opens', date: 'Apr 1', urgency: 'future' },
];

export default function RecruitingCalendarWidget({
  events = defaultEvents,
  activeWindow = 'Transfer Portal Window',
  showActiveWindow = true,
}: RecruitingCalendarWidgetProps) {
  return (
    <div className="w-[320px] shrink-0 rounded-2xl bg-[#1F1F22] p-5 shadow-2xl ring-1 ring-white/5">
      {/* Header Section */}
      <div className="mb-6 flex flex-col gap-3">
        <h2 className="text-xl font-bold tracking-tight text-white">Recruiting Calendar</h2>

        {/* Active Window Pill */}
        {showActiveWindow && activeWindow && (
          <div className="self-start">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1 text-green-400 ring-1 ring-inset ring-green-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider">{activeWindow}</span>
            </div>
          </div>
        )}
      </div>

      {/* Calendar Rows */}
      <div className="flex flex-col space-y-5">
        {events.map((event, idx) => (
          <div key={idx} className="group flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={`material-symbols-outlined text-[10px] shrink-0 ${
                  event.urgency === 'urgent' || event.urgency === 'upcoming'
                    ? 'text-red-500'
                    : 'text-gray-600'
                }`}
                style={{
                  fontVariationSettings:
                    event.urgency === 'urgent' || event.urgency === 'upcoming'
                      ? "'FILL' 1, 'wght' 700, 'GRAD' 0, 'opsz' 24"
                      : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                }}
              >
                {event.urgency === 'future' ? 'radio_button_unchecked' : 'circle'}
              </span>
              <p
                className={`truncate text-sm leading-tight ${
                  event.urgency === 'urgent'
                    ? 'font-bold text-white'
                    : event.urgency === 'upcoming'
                    ? 'font-medium text-gray-200'
                    : 'font-normal text-gray-500'
                }`}
              >
                {event.title}
              </p>
            </div>
            <div
              className={`shrink-0 ${
                event.urgency === 'urgent' ? 'rounded bg-red-500/10 px-1.5 py-0.5' : ''
              }`}
            >
              <p
                className={`font-mono text-xs font-medium ${
                  event.urgency === 'urgent'
                    ? 'text-red-500'
                    : event.urgency === 'upcoming'
                    ? 'text-orange-400'
                    : 'text-gray-500'
                }`}
              >
                {event.date}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Action */}
      <div className="mt-8 border-t border-white/5 pt-4 text-center">
        <Link
          className="group inline-flex items-center gap-1 text-xs font-medium text-primary transition-opacity hover:opacity-80"
          href="/calendar"
        >
          View Full Calendar
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </div>
    </div>
  );
}
