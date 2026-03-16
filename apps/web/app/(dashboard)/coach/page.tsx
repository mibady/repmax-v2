'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCoachDashboard } from '@/lib/hooks';
import ComposeMessageModal from '@/components/modals/ComposeMessageModal';
import AthleteCard from '@/components/coach/AthleteCard';

function formatDate(dateStr: string): { month: string; day: string } {
  const date = new Date(dateStr);
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate().toString().padStart(2, '0');
  return { month, day };
}

function getEventPriorityStyles(priority?: string) {
  if (priority === 'high') {
    return 'bg-red-500/10 text-red-400 border-red-500/20';
  }
  return 'bg-[#333] text-text-muted border-[#444]';
}

export default function CoachDashboardPage() {
  const router = useRouter();
  const {
    coach,
    team,
    roster,
    calendarEvents,
    metrics,
    isLoading,
    error,
  } = useCoachDashboard();

  const [composeOpen, setComposeOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !team) {
      router.push('/coach/setup');
    }
  }, [isLoading, team, router]);

  const firstName = coach?.name?.split(' ')[0] || 'Coach';

  const athletesWithOffers = useMemo(
    () => roster.filter((a) => a.offers > 0).length,
    [roster]
  );

  const averageGpa = useMemo(() => {
    const withGpa = roster.filter((a) => a.gpa != null);
    if (withGpa.length === 0) return 0;
    return withGpa.reduce((sum, a) => sum + (a.gpa || 0), 0) / withGpa.length;
  }, [roster]);

  const committedCount = useMemo(
    () => roster.filter((a) => a.status === 'committed').length,
    [roster]
  );

  const classYearCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    roster.forEach((a) => {
      counts[a.classYear] = (counts[a.classYear] || 0) + 1;
    });
    const years = Object.keys(counts)
      .map(Number)
      .sort();
    const max = Math.max(...Object.values(counts), 1);
    return years.slice(-4).map((y) => ({
      year: y,
      count: counts[y],
      pct: (counts[y] / max) * 100,
    }));
  }, [roster]);

  const topAthletes = useMemo(
    () =>
      [...roster]
        .sort((a, b) => b.offers - a.offers || a.name.localeCompare(b.name))
        .slice(0, 8),
    [roster]
  );

  const topOffersAthletes = useMemo(
    () =>
      [...roster]
        .filter((a) => a.offers > 0)
        .sort((a, b) => b.offers - a.offers)
        .slice(0, 3),
    [roster]
  );

  const handleExportRoster = useCallback(() => {
    const csvContent = [
      ['Name', 'Position', 'Class', 'GPA', 'Offers', 'Status'].join(','),
      ...roster.map((a) =>
        [a.name, a.position, a.classYear, a.gpa || 'N/A', a.offers, a.status].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roster-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [roster]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load dashboard</h3>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-8 pb-10">
        {/* 1. Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, Coach {firstName}
          </h1>
          <p className="text-text-muted">
            {coach?.school || team?.school || ''}
            {team?.city && team?.state ? ` \u2014 ${team.city}, ${team.state}` : ''}
          </p>
        </div>

        {/* 2. Team Activity Banner */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/20 to-surface-dark border border-primary/20 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary">shield</span>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Team Overview
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              Your program at a glance
            </h3>
            <p className="text-gray-300 text-sm max-w-lg">
              {metrics?.totalAthletes || roster.length} athletes on roster &middot;{' '}
              {athletesWithOffers} with offers &middot;{' '}
              {metrics?.pendingTasks || 0} pending tasks
            </p>
          </div>
          <Link
            href="/coach/roster"
            className="relative z-10 bg-primary text-black hover:bg-primary/90 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
          >
            View Full Roster
          </Link>
        </div>

        {/* 3. Stats Grid (2+1 columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (col-span-2) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* 3a. Stat Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Roster Athletes Card */}
              <div className="bg-surface-dark p-5 rounded-xl border border-[#333] hover:border-[#444] transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 text-text-muted text-sm font-medium">
                    <span className="material-symbols-outlined text-[20px]">groups</span>
                    Roster Athletes
                  </div>
                  <Link href="/coach/roster" className="text-text-muted hover:text-white">
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </Link>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-4xl font-bold text-white">
                    {metrics?.totalAthletes ?? roster.length}
                  </div>
                  <div className="h-10 w-24 flex items-end gap-1 pb-1">
                    {classYearCounts.map((c) => (
                      <div
                        key={c.year}
                        className="flex-1 bg-primary/50 rounded-t-sm"
                        style={{ height: `${Math.max(c.pct, 10)}%` }}
                        title={`Class ${c.year}: ${c.count}`}
                      />
                    ))}
                    {classYearCounts.length === 0 && (
                      <>
                        <div className="flex-1 bg-primary/20 h-[20%] rounded-t-sm" />
                        <div className="flex-1 bg-primary/30 h-[40%] rounded-t-sm" />
                        <div className="flex-1 bg-primary/40 h-[60%] rounded-t-sm" />
                        <div className="flex-1 bg-primary/50 h-[80%] rounded-t-sm" />
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-xs text-text-muted">Total on roster</div>
              </div>

              {/* Offers Card */}
              <div className="bg-surface-dark p-5 rounded-xl border border-[#333] hover:border-[#444] transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 text-text-muted text-sm font-medium">
                    <span className="material-symbols-outlined text-[20px]">emoji_events</span>
                    Offers
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <div className="text-4xl font-bold text-white">
                    {metrics?.totalOffers ?? 0}
                  </div>
                  <div className="mb-1 text-sm text-text-muted">
                    {athletesWithOffers} athletes with offers
                  </div>
                </div>
                {topOffersAthletes.length > 0 && (
                  <div className="mt-4 flex -space-x-2 overflow-hidden">
                    {topOffersAthletes.map((athlete) =>
                      athlete.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={athlete.id}
                          alt={athlete.name}
                          className="inline-block size-8 rounded-full ring-2 ring-surface-dark object-cover"
                          src={athlete.avatarUrl}
                          width={32}
                          height={32}
                        />
                      ) : (
                        <div
                          key={athlete.id}
                          className="inline-flex size-8 rounded-full ring-2 ring-surface-dark bg-[#333] items-center justify-center text-xs font-medium text-white"
                        >
                          {athlete.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 3b. Calendar */}
            <div className="bg-surface-dark rounded-xl border border-[#333] overflow-hidden flex-1">
              <div className="p-5 border-b border-[#333] flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">calendar_month</span>
                  Recruiting Calendar
                </h3>
                <Link
                  href="/coach/calendar"
                  className="text-xs font-semibold text-primary hover:text-primary/80"
                >
                  View Full Schedule
                </Link>
              </div>
              <div className="p-0">
                {calendarEvents.length === 0 ? (
                  <div className="p-8 text-center text-text-muted">No upcoming events</div>
                ) : (
                  calendarEvents.map((event, index) => {
                    const { month, day } = formatDate(event.date);
                    const isLast = index === calendarEvents.length - 1;
                    return (
                      <div
                        key={event.id}
                        className={`flex items-center p-4 ${!isLast ? 'border-b border-[#333]' : ''} hover:bg-white/5 transition-colors`}
                      >
                        <div className="flex-shrink-0 w-16 text-center">
                          <div className="text-xs font-bold uppercase text-text-muted">
                            {month}
                          </div>
                          <div className="text-xl font-bold text-white">{day}</div>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="text-sm font-bold text-white">{event.title}</div>
                          <div className="text-xs text-text-muted">
                            {event.location || 'NCAA Event'}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getEventPriorityStyles(
                            (event as { priority?: string }).priority
                          )}`}
                        >
                          Upcoming
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column (col-span-1) */}
          <div className="flex flex-col gap-6">
            {/* 3c. Team Card */}
            <div className="bg-surface-dark rounded-xl border border-[#333] p-1 shadow-xl">
              <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-primary/10 to-primary/30" />
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  {team?.zone && (
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded text-xs font-bold text-primary uppercase tracking-wider">
                      {team.zone}
                    </div>
                  )}
                  <div className="size-10 bg-white rounded-full flex items-center justify-center ml-auto">
                    <span className="material-symbols-outlined text-black text-xl">shield</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black to-transparent">
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none mb-1">
                    {team?.name || 'My Team'}
                  </h2>
                  <p className="text-gray-400 text-sm mb-3">
                    {coach?.school || team?.school || ''}
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center border-t border-white/20 pt-3">
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase">Roster</div>
                      <div className="text-sm font-bold text-white">
                        {metrics?.totalAthletes ?? roster.length}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase">Avg GPA</div>
                      <div className="text-sm font-bold text-white">
                        {averageGpa > 0 ? averageGpa.toFixed(2) : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase">Committed</div>
                      <div className="text-sm font-bold text-white">{committedCount}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3 grid grid-cols-2 gap-3">
                <Link
                  href="/coach/roster"
                  className="flex items-center justify-center gap-2 bg-primary text-black font-bold py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">groups</span>
                  Manage Roster
                </Link>
                <Link
                  href="/coach/roster/new"
                  className="flex items-center justify-center gap-2 bg-[#333] text-white font-bold py-2 rounded-lg text-sm hover:bg-[#444] transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  Add Athlete
                </Link>
              </div>
            </div>

            {/* 3d. Quick Actions */}
            <div className="bg-surface-dark rounded-xl border border-[#333] p-5">
              <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider text-text-muted">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  href="/coach/tasks"
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-[#2A2A2E] hover:bg-[#333] border border-transparent hover:border-[#444] transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">add_task</span>
                    </div>
                    <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">
                      New Task
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-text-muted text-[18px]">
                    chevron_right
                  </span>
                </Link>
                <button
                  onClick={() => setComposeOpen(true)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-[#2A2A2E] hover:bg-[#333] border border-transparent hover:border-[#444] transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">mail</span>
                    </div>
                    <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">
                      Send Message
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-text-muted text-[18px]">
                    chevron_right
                  </span>
                </button>
                <button
                  onClick={handleExportRoster}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-[#2A2A2E] hover:bg-[#333] border border-transparent hover:border-[#444] transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">download</span>
                    </div>
                    <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">
                      Export Roster
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-text-muted text-[18px]">
                    chevron_right
                  </span>
                </button>
                <Link
                  href="/zone/map"
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-[#2A2A2E] hover:bg-[#333] border border-transparent hover:border-[#444] transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">map</span>
                    </div>
                    <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">
                      View Zone
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-text-muted text-[18px]">
                    chevron_right
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Roster Preview */}
        {topAthletes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">groups</span>
                Roster
              </h3>
              <Link
                href="/coach/roster"
                className="text-xs font-semibold text-primary hover:text-primary/80"
              >
                View All &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topAthletes.map((athlete) => (
                <AthleteCard key={athlete.id} athlete={athlete} />
              ))}
            </div>
            {roster.length > 8 && (
              <div className="mt-4 text-center">
                <Link
                  href="/coach/roster"
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  View all {roster.length} athletes &rarr;
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <ComposeMessageModal isOpen={composeOpen} onClose={() => setComposeOpen(false)} />
    </div>
  );
}
