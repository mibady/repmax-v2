'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import {
  getPeriodsForDate,
  getPeriodTintForDate,
  PERIOD_COLORS,
  PERIOD_DEFINITIONS,
  PERIOD_LABELS,
  DIVISION_INFO,
  ALL_DIVISIONS,
  formatPeriodRange,
  type PeriodType,
  type DivisionKey,
} from '@/lib/data/ncaa-calendar';
import { useRecruitingEvents } from '@/lib/hooks';

interface ContactLogEntry {
  id: string;
  date: string;
  athlete: string;
  type: string;
  notes: string;
}

const DEMO_CONTACT_LOG: ContactLogEntry[] = [
  { id: '1', date: '2026-03-15', athlete: 'Marcus Thompson', type: 'Phone Call', notes: 'Discussed OV schedule for April. Very interested.' },
  { id: '2', date: '2026-03-14', athlete: 'Jaylen Carter', type: 'Text', notes: 'Confirmed visit date. Flying in April 18.' },
  { id: '3', date: '2026-03-13', athlete: 'DeAndre Wilson', type: 'Email', notes: 'Sent academic requirements and scholarship info.' },
  { id: '4', date: '2026-03-12', athlete: 'Tyler Brooks', type: 'In-Person', notes: 'Home visit — met with family. Committed on spot.' },
  { id: '5', date: '2026-03-10', athlete: 'Chris Johnson', type: 'Phone Call', notes: 'Initial contact. Invited to junior day.' },
];

const CONTACT_TYPE_COLORS: Record<string, string> = {
  'Phone Call': 'bg-blue-500/15 text-blue-400',
  'Text': 'bg-green-500/15 text-green-400',
  'Email': 'bg-purple-500/15 text-purple-400',
  'In-Person': 'bg-primary/15 text-primary',
};

export default function CompliancePage() {
  const [selectedDivision, setSelectedDivision] = useState<DivisionKey>('FBS');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const { isLoading: eventsLoading, getUpcomingEvents } = useRecruitingEvents();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayPeriods = getPeriodsForDate(todayStr, selectedDivision === 'FBS' || selectedDivision === 'FCS' ? selectedDivision : 'FBS');
  const currentPeriod = todayPeriods[0] || null;

  const upcomingDeadlines = getUpcomingEvents(8);

  // Calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = useMemo(() => {
    const result: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      result.push(day);
      day = addDays(day, 1);
    }
    return result;
  }, [calendarStart, calendarEnd]);

  const handlePrev = useCallback(() => setCurrentMonth(d => subMonths(d, 1)), []);
  const handleNext = useCallback(() => setCurrentMonth(d => addMonths(d, 1)), []);
  const handleToday = useCallback(() => { setCurrentMonth(new Date()); setSelectedDay(new Date()); }, []);

  const selectedDateStr = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : null;
  const selectedPeriods = selectedDateStr ? getPeriodsForDate(selectedDateStr, selectedDivision === 'FBS' || selectedDivision === 'FCS' ? selectedDivision : 'FBS') : [];

  // Current division periods for the timeline
  const divisionPeriods = DIVISION_INFO[selectedDivision].periods;

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">gavel</span>
              NCAA Compliance
            </h1>
            <p className="text-sm text-white/40 mt-1">Track recruiting periods, contact rules, and stay compliant.</p>
          </div>
          {/* Division Selector */}
          <div className="flex bg-white/5 rounded-xl p-1 border border-[#333]">
            {(['FBS', 'FCS', 'D2', 'D3'] as DivisionKey[]).map(div => (
              <button
                key={div}
                onClick={() => setSelectedDivision(div)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedDivision === div ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                {DIVISION_INFO[div].label}
              </button>
            ))}
          </div>
        </div>

        {/* Current Period Banner */}
        {currentPeriod ? (
          <div className={`rounded-2xl border p-5 ${PERIOD_COLORS[currentPeriod.type].bg} ${PERIOD_COLORS[currentPeriod.type].border}`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${PERIOD_COLORS[currentPeriod.type].dot}`} />
                  <span className={`text-sm font-bold uppercase tracking-wider ${PERIOD_COLORS[currentPeriod.type].text}`}>
                    Current: {currentPeriod.label}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">{PERIOD_LABELS[currentPeriod.type]}</p>
                <p className="text-xs text-white/30 mt-1">
                  {formatPeriodRange(currentPeriod.start, currentPeriod.end)} · {DIVISION_INFO[selectedDivision].label}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-green-400 mb-1">Allowed</div>
                  <ul className="space-y-0.5">
                    {PERIOD_DEFINITIONS[currentPeriod.type].canDo.slice(0, 2).map((item, i) => (
                      <li key={i} className="text-[11px] text-gray-300 flex items-start gap-1">
                        <span className="material-symbols-outlined text-green-400 text-[12px] mt-0.5">check</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">Not Allowed</div>
                  <ul className="space-y-0.5">
                    {PERIOD_DEFINITIONS[currentPeriod.type].cantDo.slice(0, 2).map((item, i) => (
                      <li key={i} className="text-[11px] text-gray-300 flex items-start gap-1">
                        <span className="material-symbols-outlined text-red-400 text-[12px] mt-0.5">close</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
            <p className="text-sm text-white/40">No NCAA period data for today&apos;s date in {DIVISION_INFO[selectedDivision].label}.</p>
          </div>
        )}

        {/* Calendar + Upcoming */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 bg-[#1F1F22] rounded-xl border border-white/5 p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="bg-white/5 border border-[#333] rounded-xl px-3 py-2 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-primary">{format(currentMonth, 'MMM')}</div>
                  <div className="text-lg font-bold text-white leading-none">{format(currentMonth, 'yyyy')}</div>
                </div>
                <h3 className="text-xl font-bold text-white">{format(currentMonth, 'MMMM yyyy')}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleToday} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 border border-[#333] transition-colors">
                  Today
                </button>
                <div className="flex bg-white/5 rounded-lg border border-[#333]">
                  <button onClick={handlePrev} className="p-1.5 hover:bg-white/10 rounded-l-lg text-gray-400 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button onClick={handleNext} className="p-1.5 hover:bg-white/10 rounded-r-lg text-gray-400 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-[#333]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-[11px] font-bold uppercase tracking-wider text-gray-400 py-3">{d}</div>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 border-l border-[#333]">
              {days.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const inMonth = isSameMonth(day, currentMonth);
                const today = isToday(day);
                const selected = selectedDay ? isSameDay(day, selectedDay) : false;
                const divKey = selectedDivision === 'FBS' || selectedDivision === 'FCS' ? selectedDivision : 'FBS';
                const periodTint = getPeriodTintForDate(dateStr, divKey);

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDay(selected ? null : day)}
                    className={`relative min-h-[72px] border-r border-b border-[#333] p-1.5 text-left transition-colors ${
                      !inMonth ? 'bg-white/[0.02]' :
                      selected ? 'bg-primary/10' :
                      'hover:bg-white/[0.04]'
                    } ${periodTint && inMonth ? periodTint : ''}`}
                  >
                    <span className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${
                      today ? 'bg-primary text-black font-bold' :
                      !inMonth ? 'text-gray-700' :
                      selected ? 'text-primary font-bold' :
                      'text-gray-300'
                    }`}>
                      {format(day, 'd')}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Period Legend */}
            <div className="flex flex-wrap items-center gap-4 pt-4 mt-2 border-t border-[#333]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">NCAA Periods:</span>
              {(['contact', 'evaluation', 'quiet', 'dead'] as PeriodType[]).map(type => (
                <div key={type} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-sm ${PERIOD_COLORS[type].dot}`} />
                  <span className={`text-[10px] font-medium capitalize ${PERIOD_COLORS[type].text}`}>{type}</span>
                </div>
              ))}
            </div>

            {/* Selected day detail */}
            {selectedDay && (
              <div className="mt-4 bg-[#1a1a1e] rounded-2xl border border-[#333] p-5">
                <h4 className="text-base font-bold text-white">
                  {format(selectedDay, 'EEEE, MMMM d, yyyy')}
                </h4>
                {selectedPeriods.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {selectedPeriods.map((p, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${PERIOD_COLORS[p.type].bg} ${PERIOD_COLORS[p.type].text} ${PERIOD_COLORS[p.type].border}`}>
                          {p.label}
                        </span>
                        <span className="text-xs text-gray-500">{PERIOD_LABELS[p.type]}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">No NCAA period data for this date.</p>
                )}
              </div>
            )}
          </div>

          {/* Upcoming Deadlines */}
          <div className="space-y-4">
            <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-[18px]">event_upcoming</span>
                Upcoming Events
              </h3>
              {eventsLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-4">No upcoming events</p>
              ) : (
                <div className="space-y-2">
                  {upcomingDeadlines.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="flex-shrink-0 w-10 text-center">
                        <div className="text-[9px] font-bold uppercase text-primary">
                          {new Date(event.start_date).toLocaleString('en-US', { month: 'short' })}
                        </div>
                        <div className="text-sm font-bold text-white leading-tight">
                          {new Date(event.start_date).getDate()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/80 truncate">{event.title}</p>
                        <p className="text-[10px] text-white/30 capitalize">{event.event_type.replace('_', ' ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Period Timeline for Division */}
            <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-[18px]">timeline</span>
                {DIVISION_INFO[selectedDivision].label} Timeline
              </h3>
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {divisionPeriods.map((p, i) => {
                  const isCurrent = todayStr >= p.start && todayStr <= p.end;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${
                        isCurrent ? `${PERIOD_COLORS[p.type].bg} ${PERIOD_COLORS[p.type].border} border` : ''
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${PERIOD_COLORS[p.type].dot}`} />
                      <span className={`font-medium ${isCurrent ? PERIOD_COLORS[p.type].text : 'text-white/60'}`}>
                        {p.type.charAt(0).toUpperCase() + p.type.slice(1)}
                      </span>
                      <span className="text-white/20 ml-auto text-[10px] font-mono">
                        {formatPeriodRange(p.start, p.end)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* NCAA Period Definitions */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">shield</span>
            NCAA Recruiting Period Rules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['contact', 'evaluation', 'quiet', 'dead'] as PeriodType[]).map(type => {
              const def = PERIOD_DEFINITIONS[type];
              const colors = PERIOD_COLORS[type];
              return (
                <div key={type} className={`rounded-2xl border p-5 ${colors.bg} ${colors.border}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
                    <h3 className={`text-sm font-bold uppercase tracking-wider ${colors.text}`}>{def.title}</h3>
                  </div>
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">{def.definition}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-green-400 mb-1.5">Allowed</div>
                      <ul className="space-y-1">
                        {def.canDo.map((item, i) => (
                          <li key={i} className="text-[11px] text-gray-300 flex items-start gap-1.5">
                            <span className="material-symbols-outlined text-green-400 text-[12px] mt-0.5 flex-shrink-0">check</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1.5">Not Allowed</div>
                      <ul className="space-y-1">
                        {def.cantDo.map((item, i) => (
                          <li key={i} className="text-[11px] text-gray-300 flex items-start gap-1.5">
                            <span className="material-symbols-outlined text-red-400 text-[12px] mt-0.5 flex-shrink-0">close</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Download PDFs */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">download</span>
            Download Recruiting Calendars
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ALL_DIVISIONS.map((div: DivisionKey) => {
              const info = DIVISION_INFO[div];
              return (
                <a
                  key={div}
                  href={`/api/athlete/calendar/pdf?division=${div}`}
                  download
                  className="flex items-center gap-3 bg-white/5 border border-[#333] hover:border-primary/30 rounded-xl px-4 py-3 text-sm font-medium text-white hover:text-primary transition-colors group"
                >
                  <span className="material-symbols-outlined text-[20px] text-gray-500 group-hover:text-primary transition-colors">picture_as_pdf</span>
                  <div>
                    <div className="font-bold text-sm">{info.label}</div>
                    <div className="text-[10px] text-gray-500">{info.subtitle}</div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* Contact Log */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">call_log</span>
            Contact Log
          </h2>
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-white/30 py-3 px-4">Date</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-white/30 py-3 px-4">Athlete</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-white/30 py-3 px-4">Type</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-white/30 py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_CONTACT_LOG.map(entry => (
                  <tr key={entry.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-3 px-4 text-white/50 text-xs font-mono">
                      {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-white font-medium">{entry.athlete}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${CONTACT_TYPE_COLORS[entry.type] || 'bg-gray-500/15 text-gray-400'}`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white/50 text-xs max-w-xs truncate">{entry.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
