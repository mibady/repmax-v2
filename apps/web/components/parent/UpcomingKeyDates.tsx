'use client';

import {
  FBS_PERIODS,
  PERIOD_COLORS,
  formatPeriodRange,
  type RecruitingPeriod,
} from '@/lib/data/ncaa-calendar';

interface UpcomingKeyDatesProps {
  classYear: number;
}

export function UpcomingKeyDates({ classYear }: UpcomingKeyDatesProps) {
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
