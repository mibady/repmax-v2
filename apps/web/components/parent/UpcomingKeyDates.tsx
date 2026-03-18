'use client';

import {
  FBS_PERIODS,
  PERIOD_COLORS,
  formatPeriodRange,
  type RecruitingPeriod,
} from '@/lib/data/ncaa-calendar';
import type { AthleteEvent } from '@/lib/hooks';

const EVENT_TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  visit: { icon: 'flight', color: 'text-blue-400' },
  camp: { icon: 'fitness_center', color: 'text-green-400' },
  combine: { icon: 'speed', color: 'text-purple-400' },
  game: { icon: 'sports_football', color: 'text-amber-400' },
  deadline: { icon: 'event_busy', color: 'text-red-400' },
  signing: { icon: 'draw', color: 'text-primary' },
  other: { icon: 'event', color: 'text-slate-400' },
};

interface UpcomingKeyDatesProps {
  classYear: number;
  athleteEvents?: AthleteEvent[];
}

export function UpcomingKeyDates({ classYear, athleteEvents }: UpcomingKeyDatesProps) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Get upcoming periods (current + next 4)
  const upcoming: RecruitingPeriod[] = [];
  let foundCurrent = false;

  for (const period of FBS_PERIODS) {
    if (period.end >= todayStr) {
      if (!foundCurrent && period.start <= todayStr) {
        foundCurrent = true;
      }
      upcoming.push(period);
      if (upcoming.length >= 5) break;
    }
  }

  // Key fixed dates
  const keyDates = [
    {
      date: `Dec 18, ${classYear - 1}`,
      label: 'Early Signing Period Opens',
      icon: 'draw',
      color: 'text-green-400',
    },
    {
      date: `Feb 4, ${classYear}`,
      label: 'Regular Signing Day',
      icon: 'draw',
      color: 'text-blue-400',
    },
    {
      date: `Jun 15 (after soph. year)`,
      label: 'D1 Contact Allowed',
      icon: 'phone_in_talk',
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="bg-[#1F1F22] rounded-xl border border-white/5">
      <div className="p-5 border-b border-white/5">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">event</span>
          NCAA Key Dates
        </h3>
        <p className="text-xs text-slate-500 mt-1">D1 FBS recruiting periods</p>
      </div>

      {/* Athlete Events */}
      {athleteEvents && athleteEvents.length > 0 && (
        <div className="border-b border-white/5">
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Your Upcoming Events</p>
          </div>
          <div className="divide-y divide-white/5">
            {athleteEvents.slice(0, 5).map((evt) => {
              const config = EVENT_TYPE_CONFIG[evt.eventType] || EVENT_TYPE_CONFIG.other;
              const date = new Date(evt.eventDate + 'T00:00:00');
              const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              return (
                <div key={evt.id} className={`p-4 flex items-center gap-3 ${evt.priority === 'high' ? 'bg-amber-500/[0.03]' : ''}`}>
                  <span className={`material-symbols-outlined text-[18px] ${config.color}`}>{config.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">{evt.title}</span>
                      {evt.priority === 'high' && (
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400">Priority</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {dateStr}{evt.eventTime ? ` · ${evt.eventTime}` : ''}{evt.location ? ` · ${evt.location}` : ''}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Current/Upcoming Periods */}
      <div className="divide-y divide-white/5">
        {upcoming.map((period, i) => {
          const colors = PERIOD_COLORS[period.type];
          const isCurrent = period.start <= todayStr && period.end >= todayStr;
          return (
            <div key={`${period.start}-${i}`} className={`p-4 flex items-center gap-3 ${isCurrent ? 'bg-white/[0.02]' : ''}`}>
              <div className={`size-2.5 rounded-full ${colors.dot} shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${colors.text}`}>{period.label}</span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/10 text-white">Now</span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{formatPeriodRange(period.start, period.end)}</p>
                {period.notes && (
                  <p className="text-xs text-slate-600 mt-0.5">{period.notes}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Key Signing Dates */}
      <div className="p-4 border-t border-white/5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Key Signing Dates</p>
        <div className="space-y-2">
          {keyDates.map((d) => (
            <div key={d.label} className="flex items-center gap-2">
              <span className={`material-symbols-outlined text-[16px] ${d.color}`}>{d.icon}</span>
              <span className="text-xs text-slate-300">{d.label}</span>
              <span className="text-xs text-slate-500 ml-auto">{d.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
