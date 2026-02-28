'use client';

import Link from 'next/link';
import { useParentDashboard } from '@/lib/hooks';

export default function ParentCalendarPage() {
  const { calendarEvents, isLoading, error } = useParentDashboard();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load calendar</h3>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  const deadlineCount = calendarEvents.filter((e) => e.type === 'deadline').length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Back Link */}
        <Link href="/parent" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl font-bold text-white">Recruiting Calendar</h1>
          {deadlineCount > 0 && (
            <span className="text-sm font-bold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full">
              {deadlineCount} deadline{deadlineCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Event List */}
        {calendarEvents.length === 0 ? (
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-12 text-center">
            <span className="material-symbols-outlined text-slate-600 text-5xl mb-3">event</span>
            <h3 className="text-white font-semibold mb-1">No upcoming events</h3>
            <p className="text-slate-500 text-sm">Recruiting events and deadlines will appear here.</p>
          </div>
        ) : (
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 divide-y divide-white/5">
            {calendarEvents.map((event, index) => {
              const date = new Date(event.date);
              const month = date.toLocaleString('en-US', { month: 'short' });
              const day = date.getDate().toString().padStart(2, '0');
              return (
                <div key={event.id || index} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                  <div className="w-16 text-center">
                    <div className="text-xs font-bold uppercase text-slate-400">{month}</div>
                    <div className="text-xl font-bold text-white">{day}</div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{event.title}</p>
                    <p className="text-xs text-slate-500 capitalize">{event.type}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    event.type === 'deadline' ? 'bg-red-500/10 text-red-400' :
                    event.type === 'visit' ? 'bg-green-500/10 text-green-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    {event.type === 'deadline' ? 'Deadline' : event.type === 'visit' ? 'Visit' : 'Camp'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
