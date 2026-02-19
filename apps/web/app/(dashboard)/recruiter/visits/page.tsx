'use client';

import Link from 'next/link';
import { useCampusVisits } from '@/lib/hooks';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CampusVisitsPage() {
  const { visits, stats, isLoading, error, getEventsForDay, updateVisit, cancelVisit, createVisit } = useCampusVisits();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    athlete_id: '',
    visit_date: '',
    visit_type: 'unofficial' as 'official' | 'unofficial',
    visit_time: '',
    notes: '',
  });

  // Calendar calculations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
  const todayDay = isCurrentMonth ? today.getDate() : -1;

  // Generate calendar days
  const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => daysInPrevMonth - firstDayOfMonth + i + 1);
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const remainingDays = 42 - (prevMonthDays.length + currentMonthDays.length);
  const nextMonthDays = Array.from({ length: remainingDays }, (_, i) => i + 1);

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const statsData = [
    { label: `Total Visits (${currentMonth.toLocaleDateString('en-US', { month: 'short' })})`, value: stats.totalVisits.toString(), icon: 'calendar_today', trend: null, isUp: true },
    { label: 'Official Visits', value: stats.officialVisits.toString(), icon: 'verified', trend: null, isUp: true },
    { label: 'Pending', value: stats.pendingVisits.toString(), icon: 'pending', trend: null, isUp: stats.pendingVisits === 0 },
    { label: 'Win Rate', value: `${stats.winRate}%`, icon: 'pie_chart', trend: null, isUp: true },
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-white leading-tight">Campus Visits</h1>
          <p className="text-sm text-[#A1A1AA]">
            Manage your recruiting calendar and upcoming prospect visits.
          </p>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-[#121214] text-sm font-bold hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span className="hidden sm:inline">Schedule Visit</span>
        </button>
      </div>

      {/* Scrollable Dashboard Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
              {error.message}
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((stat) => (
              <div
                key={stat.label}
                className="bg-[#1F1F22] rounded-xl p-5 border border-white/5 hover:border-primary/30 transition-colors group"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[#A1A1AA] text-sm font-medium">{stat.label}</p>
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-lg text-[20px]">
                    {stat.icon}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                  {stat.trend && (
                    <span
                      className={`text-xs font-medium flex items-center ${stat.isUp ? 'text-green-500' : 'text-red-500'}`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {stat.isUp ? 'trending_up' : 'trending_down'}
                      </span>
                      {stat.trend}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Dashboard Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-auto">
            {/* Calendar Section */}
            <div className="xl:col-span-8 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{monthName}</h3>
                <div className="flex gap-2">
                  <div className="flex items-center bg-[#1F1F22] rounded-lg p-1 border border-white/5">
                    <button
                      onClick={goToPrevMonth}
                      className="p-1 hover:text-white text-[#A1A1AA] rounded-md hover:bg-white/5"
                    >
                      <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </button>
                    <button
                      onClick={goToNextMonth}
                      className="p-1 hover:text-white text-[#A1A1AA] rounded-md hover:bg-white/5"
                    >
                      <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>
                  </div>
                  <div className="flex bg-[#1F1F22] rounded-lg p-1 border border-white/5 text-xs font-medium">
                    <button className="px-3 py-1 rounded-md bg-white/10 text-white">Month</button>
                    <button className="px-3 py-1 rounded-md text-[#A1A1AA] hover:text-white hover:bg-white/5">
                      Week
                    </button>
                    <button className="px-3 py-1 rounded-md text-[#A1A1AA] hover:text-white hover:bg-white/5">
                      Day
                    </button>
                  </div>
                </div>
              </div>

              {/* Calendar Card */}
              <div className="bg-[#1F1F22] rounded-xl border border-white/5 overflow-hidden shadow-sm">
                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.02]">
                  {daysOfWeek.map((day) => (
                    <div
                      key={day}
                      className="py-3 text-center text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 auto-rows-[minmax(100px,auto)] bg-[#1F1F22]">
                  {/* Previous Month Days */}
                  {prevMonthDays.map((day) => (
                    <div
                      key={`prev-${day}`}
                      className="border-b border-r border-white/5 p-2 text-[#A1A1AA]/30 bg-white/[0.01]"
                    >
                      {day}
                    </div>
                  ))}

                  {/* Current Month Days */}
                  {currentMonthDays.map((day) => {
                    const events = getEventsForDay(day);
                    const isToday = day === todayDay;

                    return (
                      <div
                        key={day}
                        className="border-b border-r border-white/5 p-2 relative group hover:bg-white/[0.02] transition-colors"
                      >
                        {isToday ? (
                          <div className="size-7 flex items-center justify-center rounded-full bg-primary text-[#121214] font-bold text-sm mb-1 shadow-lg shadow-primary/20">
                            {day}
                          </div>
                        ) : (
                          <span className="text-sm text-[#A1A1AA] font-medium block mb-1">{day}</span>
                        )}

                        {events.map((event, idx) => {
                          const bgColor =
                            event.type === 'official'
                              ? 'bg-primary/20 border-primary text-primary'
                              : event.type === 'unofficial'
                                ? 'bg-blue-500/20 border-blue-500 text-blue-200'
                                : 'bg-purple-500/20 border-purple-500 text-purple-200';

                          return (
                            <div
                              key={idx}
                              className={`${bgColor} border-l-2 rounded-r px-2 py-1 text-xs mb-1 cursor-pointer hover:brightness-110`}
                            >
                              <p className="font-semibold truncate">{event.title}</p>
                              {event.type !== 'event' && (
                                <p className="text-[10px] truncate opacity-70">
                                  {event.type === 'official' ? 'Official Visit' : 'Unofficial'}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}

                  {/* Next Month Days */}
                  {nextMonthDays.map((day) => (
                    <div
                      key={`next-${day}`}
                      className="border-b border-r border-white/5 p-2 text-[#A1A1AA]/30 bg-white/[0.01]"
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Key Legend */}
              <div className="flex gap-4 px-2">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-primary"></div>
                  <span className="text-xs text-[#A1A1AA]">Official Visit</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-[#A1A1AA]">Unofficial Visit</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-purple-500"></div>
                  <span className="text-xs text-[#A1A1AA]">Junior Day</span>
                </div>
              </div>
            </div>

            {/* Upcoming Visits Section */}
            <div className="xl:col-span-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Upcoming Visits</h3>
                <button disabled title="Coming soon" className="text-xs text-primary font-medium opacity-50 cursor-not-allowed">View All</button>
              </div>
              {visits.length === 0 ? (
                <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-8 text-center">
                  <span className="material-symbols-outlined text-4xl text-gray-600 mb-2">calendar_month</span>
                  <p className="text-gray-500">No upcoming visits scheduled.</p>
                  <p className="text-gray-600 text-sm mt-1">
                    Add athletes to your pipeline with &quot;Visit Scheduled&quot; status.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {visits.slice(0, 5).map((visit) => (
                    <div
                      key={visit.id}
                      className={`flex flex-col p-4 rounded-xl bg-[#1F1F22] border-l-4 ${
                        visit.visitType === 'official' ? 'border-primary' : 'border-blue-500'
                      } shadow-sm hover:shadow-md transition-all group`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          {visit.avatar ? (
                            <div
                              className="size-10 rounded-full bg-gray-600 bg-cover bg-center"
                              style={{ backgroundImage: `url('${visit.avatar}')` }}
                            />
                          ) : (
                            <div className="size-10 rounded-full bg-gray-700 flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {visit.athleteName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                          )}
                          <div>
                            <h4 className="text-sm font-bold text-white">{visit.athleteName}</h4>
                            <p className="text-xs text-[#A1A1AA]">
                              {visit.position} {visit.stars > 0 && `- ${visit.stars}*`}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            visit.status === 'confirmed'
                              ? 'bg-green-400/10 text-green-400 ring-green-400/20'
                              : 'bg-yellow-400/10 text-yellow-500 ring-yellow-400/20'
                          }`}
                        >
                          {visit.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-[#A1A1AA] gap-2">
                          <span
                            className={`material-symbols-outlined text-[16px] ${
                              visit.visitType === 'official' ? 'text-primary' : 'text-blue-500'
                            }`}
                          >
                            {visit.visitType === 'official' ? 'verified' : 'directions_walk'}
                          </span>
                          <span className="text-white">
                            {visit.visitType === 'official' ? 'Official Visit' : 'Unofficial Visit'}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-[#A1A1AA] gap-2">
                          <span className="material-symbols-outlined text-[16px]">schedule</span>
                          <span>
                            {visit.date} - {visit.time}
                          </span>
                        </div>
                        {visit.details && (
                          <div className="flex items-center text-xs text-[#A1A1AA] gap-2">
                            <span className="material-symbols-outlined text-[16px]">
                              {visit.visitType === 'official' ? 'flight' : 'location_on'}
                            </span>
                            <span>{visit.details}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                        {visit.status === 'pending' ? (
                          <>
                            <button
                              onClick={async () => {
                                const result = await updateVisit(visit.id, { status: 'confirmed' });
                                if (result.error) {
                                  alert(result.error);
                                }
                              }}
                              className="flex-1 rounded bg-primary/10 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition"
                            >
                              Confirm Visit
                            </button>
                            <button
                              onClick={async () => {
                                const result = await cancelVisit(visit.id);
                                if (result.error) {
                                  alert(result.error);
                                }
                              }}
                              className="rounded bg-white/5 px-3 py-1.5 text-[#A1A1AA] hover:text-white hover:bg-white/10 transition"
                              title="Cancel Visit"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <Link
                              href={`/recruiter/prospects/${visit.athleteId}`}
                              className="flex-1 rounded bg-white/5 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition text-center"
                            >
                              View Profile
                            </Link>
                            <button
                              onClick={async () => {
                                const result = await cancelVisit(visit.id);
                                if (result.error) {
                                  alert(result.error);
                                }
                              }}
                              className="rounded bg-white/5 px-3 py-1.5 text-[#A1A1AA] hover:text-white hover:bg-white/10 transition"
                              title="Cancel Visit"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Visit Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80" onClick={() => !isScheduling && setShowScheduleModal(false)} />
          <div className="relative z-10 w-full max-w-md mx-4 bg-[#1F1F22] border border-white/10 rounded-xl shadow-2xl">
            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="text-xl font-bold text-white">Schedule Campus Visit</h2>
              <button onClick={() => !isScheduling && setShowScheduleModal(false)} className="text-gray-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!scheduleForm.athlete_id || !scheduleForm.visit_date) return;
                setIsScheduling(true);
                try {
                  const result = await createVisit({
                    athlete_id: scheduleForm.athlete_id,
                    visit_date: scheduleForm.visit_date,
                    visit_type: scheduleForm.visit_type,
                    ...(scheduleForm.visit_time ? { visit_time: scheduleForm.visit_time } : {}),
                    ...(scheduleForm.notes ? { notes: scheduleForm.notes } : {}),
                  });
                  if (result.error) {
                    alert(result.error);
                  } else {
                    setShowScheduleModal(false);
                    setScheduleForm({ athlete_id: '', visit_date: '', visit_type: 'unofficial', visit_time: '', notes: '' });
                  }
                } finally {
                  setIsScheduling(false);
                }
              }}
              className="p-6 flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-400">Athlete ID <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={scheduleForm.athlete_id}
                  onChange={(e) => setScheduleForm(f => ({ ...f, athlete_id: e.target.value }))}
                  placeholder="Enter athlete ID"
                  required
                  className="w-full px-3 py-2.5 bg-[#2A2A2E] border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-400">Visit Date <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  value={scheduleForm.visit_date}
                  onChange={(e) => setScheduleForm(f => ({ ...f, visit_date: e.target.value }))}
                  required
                  className="w-full px-3 py-2.5 bg-[#2A2A2E] border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-400">Visit Type</label>
                <select
                  value={scheduleForm.visit_type}
                  onChange={(e) => setScheduleForm(f => ({ ...f, visit_type: e.target.value as 'official' | 'unofficial' }))}
                  className="w-full px-3 py-2.5 bg-[#2A2A2E] border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50"
                >
                  <option value="unofficial">Unofficial Visit</option>
                  <option value="official">Official Visit</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-400">Time</label>
                <input
                  type="time"
                  value={scheduleForm.visit_time}
                  onChange={(e) => setScheduleForm(f => ({ ...f, visit_time: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-[#2A2A2E] border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-400">Notes</label>
                <textarea
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Optional notes..."
                  rows={2}
                  className="w-full px-3 py-2.5 bg-[#2A2A2E] border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 mt-2">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="px-4 py-2.5 text-sm text-slate-400 hover:text-white" disabled={isScheduling}>Cancel</button>
                <button type="submit" disabled={isScheduling} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-black font-bold text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50">
                  {isScheduling && <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>}
                  Schedule Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #1f1f22;
        }
        ::-webkit-scrollbar-thumb {
          background: #433d28;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #d4af35;
        }
      `}</style>
    </div>
  );
}
