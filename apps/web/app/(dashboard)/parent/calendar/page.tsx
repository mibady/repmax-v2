'use client';

import Link from 'next/link';
import {
  FBS_PERIODS,
  PERIOD_COLORS,
  PERIOD_DEFINITIONS,
  formatPeriodRange,
  type PeriodType,
} from '@/lib/data/ncaa-calendar';

export default function ParentCalendarPage() {
  const todayStr = new Date().toISOString().split('T')[0];

  // Find current period
  const currentPeriod = FBS_PERIODS.find(
    (p) => p.start <= todayStr && p.end >= todayStr
  );

  // Get upcoming periods (current + future, max 8)
  const upcoming = FBS_PERIODS.filter((p) => p.end >= todayStr).slice(0, 8);

  // Key signing dates for Class of 2026
  const classYear = 2026;
  const signingDates = [
    {
      date: `Dec 18, ${classYear - 1}`,
      title: 'Early Signing Period Opens',
      icon: 'draw',
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      date: `Feb 4, ${classYear}`,
      title: 'National Signing Day',
      icon: 'draw',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      date: 'Jun 15 (after soph. year)',
      title: 'D1 Contact Allowed',
      icon: 'phone_in_talk',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
  ];

  const periodTypes: PeriodType[] = ['contact', 'evaluation', 'quiet', 'dead'];

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Back Link */}
        <Link
          href="/parent"
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Recruiting Calendar</h1>
          <p className="text-slate-400 text-sm mt-1">
            NCAA D1 FBS recruiting periods &amp; key dates
          </p>
        </div>

        {/* Current Period Hero */}
        {currentPeriod && (
          <div
            className={`rounded-xl border p-6 mb-8 ${PERIOD_COLORS[currentPeriod.type].bg} ${PERIOD_COLORS[currentPeriod.type].border}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`size-3 rounded-full ${PERIOD_COLORS[currentPeriod.type].dot}`}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Current Period
              </span>
            </div>
            <h2
              className={`text-xl font-bold mb-1 ${PERIOD_COLORS[currentPeriod.type].text}`}
            >
              {currentPeriod.label}
            </h2>
            <p className="text-sm text-slate-400 mb-3">
              {formatPeriodRange(currentPeriod.start, currentPeriod.end)}
            </p>
            <p className="text-sm text-slate-300">
              {PERIOD_DEFINITIONS[currentPeriod.type].definition}
            </p>
            {currentPeriod.notes && (
              <p className="text-xs text-slate-500 mt-2 italic">
                {currentPeriod.notes}
              </p>
            )}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-green-400 mb-1.5">
                  What you CAN do:
                </p>
                <ul className="space-y-1">
                  {PERIOD_DEFINITIONS[currentPeriod.type].canDo.map((item) => (
                    <li
                      key={item}
                      className="text-xs text-slate-400 flex items-start gap-1.5"
                    >
                      <span className="material-symbols-outlined text-green-400 text-[14px] mt-0.5 shrink-0">
                        check_circle
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-red-400 mb-1.5">
                  What you CANNOT do:
                </p>
                <ul className="space-y-1">
                  {PERIOD_DEFINITIONS[currentPeriod.type].cantDo.map((item) => (
                    <li
                      key={item}
                      className="text-xs text-slate-400 flex items-start gap-1.5"
                    >
                      <span className="material-symbols-outlined text-red-400 text-[14px] mt-0.5 shrink-0">
                        cancel
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Upcoming Periods */}
          <div className="lg:col-span-2">
            <div className="bg-[#1F1F22] rounded-xl border border-white/5">
              <div className="p-5 border-b border-white/5">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    calendar_month
                  </span>
                  Upcoming Periods
                </h3>
              </div>
              <div className="divide-y divide-white/5">
                {upcoming.map((period, i) => {
                  const colors = PERIOD_COLORS[period.type];
                  const isCurrent =
                    period.start <= todayStr && period.end >= todayStr;
                  return (
                    <div
                      key={`${period.start}-${i}`}
                      className={`p-4 flex items-center gap-4 ${isCurrent ? 'bg-white/[0.03]' : ''}`}
                    >
                      <div
                        className={`size-3 rounded-full ${colors.dot} shrink-0`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold ${colors.text}`}
                          >
                            {period.label}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/10 text-white">
                              Now
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {formatPeriodRange(period.start, period.end)}
                        </p>
                        {period.notes && (
                          <p className="text-xs text-slate-600 mt-0.5">
                            {period.notes}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${colors.bg} ${colors.text} capitalize hidden sm:block`}
                      >
                        {period.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Key Dates + Period Reference */}
          <div className="space-y-6">
            {/* Key Signing Dates */}
            <div className="bg-[#1F1F22] rounded-xl border border-white/5">
              <div className="p-5 border-b border-white/5">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400">
                    draw
                  </span>
                  Key Signing Dates
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Class of {classYear}
                </p>
              </div>
              <div className="divide-y divide-white/5">
                {signingDates.map((d) => (
                  <div key={d.title} className="p-4 flex items-center gap-3">
                    <div
                      className={`size-9 rounded-lg ${d.bg} flex items-center justify-center`}
                    >
                      <span
                        className={`material-symbols-outlined text-[18px] ${d.color}`}
                      >
                        {d.icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">
                        {d.title}
                      </p>
                      <p className="text-xs text-slate-500">{d.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Period Reference Guide */}
            <div className="bg-[#1F1F22] rounded-xl border border-white/5">
              <div className="p-5 border-b border-white/5">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400">
                    info
                  </span>
                  Period Guide
                </h3>
              </div>
              <div className="divide-y divide-white/5">
                {periodTypes.map((type) => {
                  const colors = PERIOD_COLORS[type];
                  const def = PERIOD_DEFINITIONS[type];
                  return (
                    <div key={type} className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`size-2.5 rounded-full ${colors.dot}`}
                        />
                        <span
                          className={`text-sm font-semibold ${colors.text}`}
                        >
                          {def.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {type === 'contact' &&
                          'Coaches can visit you, call, and attend games.'}
                        {type === 'evaluation' &&
                          'Coaches can watch games but no in-person contact off-campus.'}
                        {type === 'quiet' &&
                          'Campus visits OK, but no off-campus contact.'}
                        {type === 'dead' &&
                          'No in-person contact or campus visits allowed.'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
