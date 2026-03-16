'use client';

import { useMemo } from 'react';
import { useCoachDashboard } from '@/lib/hooks';

export default function CoachAnalyticsPage() {
  const { roster, calendarEvents, metrics, isLoading, error } = useCoachDashboard();

  // Offers by position group
  const offersByPosition = useMemo(() => {
    const posMap: Record<string, number> = {};
    roster.forEach((a) => {
      const pos = a.position || 'ATH';
      posMap[pos] = (posMap[pos] || 0) + a.offers;
    });
    return Object.entries(posMap)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [roster]);

  // GPA distribution
  const gpaDistribution = useMemo(() => {
    const buckets = [
      { label: '3.5+', min: 3.5, max: 5, count: 0 },
      { label: '3.0–3.5', min: 3.0, max: 3.5, count: 0 },
      { label: '2.5–3.0', min: 2.5, max: 3.0, count: 0 },
      { label: '2.0–2.5', min: 2.0, max: 2.5, count: 0 },
      { label: '<2.0', min: 0, max: 2.0, count: 0 },
    ];
    roster.forEach((a) => {
      if (a.gpa == null) return;
      const bucket = buckets.find((b) => a.gpa! >= b.min && a.gpa! < b.max);
      if (bucket) bucket.count++;
      else if (a.gpa >= 3.5) buckets[0].count++;
    });
    return buckets;
  }, [roster]);

  // Class year breakdown
  const classBreakdown = useMemo(() => {
    const counts: Record<number, { total: number; withOffers: number }> = {};
    roster.forEach((a) => {
      if (!counts[a.classYear]) counts[a.classYear] = { total: 0, withOffers: 0 };
      counts[a.classYear].total++;
      if (a.offers > 0) counts[a.classYear].withOffers++;
    });
    return Object.entries(counts)
      .map(([year, data]) => ({ year: Number(year), ...data }))
      .sort((a, b) => a.year - b.year);
  }, [roster]);

  // Upcoming events
  const upcomingEvents = calendarEvents.slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  const maxOffers = Math.max(...offersByPosition.map(([, c]) => c), 1);
  const maxGpa = Math.max(...gpaDistribution.map((b) => b.count), 1);
  const maxClass = Math.max(...classBreakdown.map((c) => c.total), 1);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white">Analytics</h2>
          <p className="text-sm text-white/40">Program performance metrics and insights</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Athletes" value={metrics?.totalAthletes ?? roster.length} icon="groups" />
          <StatCard label="Total Offers" value={metrics?.totalOffers ?? 0} icon="emoji_events" />
          <StatCard label="Committed" value={metrics?.committedAthletes ?? 0} icon="verified" />
          <StatCard label="Pending Tasks" value={metrics?.pendingTasks ?? 0} icon="task_alt" />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Offers by Position */}
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">bar_chart</span>
              Offers by Position
            </h3>
            {offersByPosition.length === 0 ? (
              <p className="text-sm text-white/30 py-8 text-center">No offer data</p>
            ) : (
              <div className="space-y-3">
                {offersByPosition.map(([pos, count]) => (
                  <div key={pos}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/60 font-medium">{pos}</span>
                      <span className="text-xs font-bold text-white">{count}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${(count / maxOffers) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GPA Distribution */}
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">school</span>
              GPA Distribution
            </h3>
            <div className="space-y-3">
              {gpaDistribution.map((bucket) => (
                <div key={bucket.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/60 font-medium">{bucket.label}</span>
                    <span className="text-xs font-bold text-white">{bucket.count}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        bucket.min >= 3.0 ? 'bg-green-500' :
                        bucket.min >= 2.5 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(bucket.count / maxGpa) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Class Year Breakdown */}
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">calendar_month</span>
              Athletes by Class Year
            </h3>
            {classBreakdown.length === 0 ? (
              <p className="text-sm text-white/30 py-8 text-center">No class data</p>
            ) : (
              <div className="space-y-3">
                {classBreakdown.map((c) => (
                  <div key={c.year}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/60 font-medium">Class of {c.year}</span>
                      <span className="text-xs text-white">
                        <span className="font-bold">{c.total}</span>
                        {c.withOffers > 0 && (
                          <span className="text-primary ml-1">({c.withOffers} w/ offers)</span>
                        )}
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${(c.total / maxClass) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">event</span>
              Upcoming Events
            </h3>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-white/30 py-8 text-center">No upcoming events</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => {
                  const d = new Date(event.date);
                  return (
                    <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="flex-shrink-0 w-10 text-center">
                        <div className="text-[9px] font-bold uppercase text-white/40">
                          {d.toLocaleString('en-US', { month: 'short' })}
                        </div>
                        <div className="text-base font-bold text-white">{d.getDate()}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/80 truncate">{event.title}</p>
                        <p className="text-[10px] text-white/30">{event.location || event.type}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-primary text-[18px]">{icon}</span>
        <span className="text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-2xl font-bold text-white">{value}</span>
    </div>
  );
}
