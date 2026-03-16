'use client';

import { useMemo } from 'react';
import type { CalendarEvent } from '@/lib/hooks/use-coach-dashboard';

interface ComplianceCalendarProps {
  events: CalendarEvent[];
}

const PERIOD_COLORS: Record<string, string> = {
  contact: 'bg-green-500',
  dead: 'bg-red-500',
  evaluation: 'bg-blue-500',
  quiet: 'bg-yellow-500',
};

const PERIOD_LABELS: Record<string, string> = {
  contact: 'Contact',
  dead: 'Dead Period',
  evaluation: 'Evaluation',
  quiet: 'Quiet Period',
};

export default function ComplianceCalendar({ events }: ComplianceCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayDate = today.getDate();

  const { days, monthName, firstDayOffset } = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const name = new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' });

    // Map events to day numbers
    const eventDays = new Map<number, string>();
    events.forEach((e) => {
      const d = new Date(e.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        eventDays.set(d.getDate(), e.type?.toLowerCase() || 'contact');
      }
    });

    const dayArray = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      type: eventDays.get(i + 1) || null,
      isToday: i + 1 === todayDate,
    }));

    return { days: dayArray, monthName: name, firstDayOffset: firstDay };
  }, [year, month, todayDate, events]);

  return (
    <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">gavel</span>
          Compliance Calendar
        </h3>
        <span className="text-xs text-white/40">{monthName}</span>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[9px] text-white/30 font-medium py-0.5">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map(({ day, type, isToday }) => (
          <div
            key={day}
            className={`aspect-square flex items-center justify-center rounded text-[10px] font-medium relative ${
              isToday
                ? 'bg-primary text-black font-bold'
                : type
                  ? 'text-white'
                  : 'text-white/30'
            }`}
          >
            {day}
            {type && !isToday && (
              <span className={`absolute bottom-0.5 size-1 rounded-full ${PERIOD_COLORS[type] || 'bg-white/30'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
        {Object.entries(PERIOD_LABELS).slice(0, 3).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1">
            <span className={`size-2 rounded-full ${PERIOD_COLORS[key]}`} />
            <span className="text-[9px] text-white/40">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
