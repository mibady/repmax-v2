'use client';

import Link from 'next/link';
import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCoachDashboard } from '@/lib/hooks';
import ComposeMessageModal from '@/components/modals/ComposeMessageModal';
import RecruitingIntelFeed from '@/components/coach/RecruitingIntelFeed';
import AthleteDevelopmentStatus from '@/components/coach/AthleteDevelopmentStatus';
import ComplianceCalendar from '@/components/coach/ComplianceCalendar';
import AthleteCard from '@/components/coach/AthleteCard';

export default function CoachDashboardPage() {
  const router = useRouter();
  const {
    team,
    roster,
    tasks,
    colleges,
    activity,
    calendarEvents,
    isLoading,
    error,
    updateTask,
  } = useCoachDashboard();

  const [composeOpen, setComposeOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'recruiting_ready' | 'needs_film' | 'academic_risk'>('all');

  const filteredRoster = useMemo(() => {
    switch (activeFilter) {
      case 'recruiting_ready':
        return roster.filter((a) => a.status === 'active' && a.offers > 0 && a.gpa != null && a.gpa >= 2.5);
      case 'needs_film':
        return roster.filter((a) => a.status === 'active' && a.offers === 0);
      case 'academic_risk':
        return roster.filter((a) => a.gpa != null && a.gpa < 2.5);
      default:
        return [...roster].sort((a, b) => b.offers - a.offers || a.name.localeCompare(b.name));
    }
  }, [roster, activeFilter]);

  const displayedAthletes = filteredRoster.slice(0, 8);

  const filters: { key: 'all' | 'recruiting_ready' | 'needs_film' | 'academic_risk'; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: roster.length },
    { key: 'recruiting_ready', label: 'Recruiting Ready', count: roster.filter((a) => a.status === 'active' && a.offers > 0 && a.gpa != null && a.gpa >= 2.5).length },
    { key: 'needs_film', label: 'Needs Film', count: roster.filter((a) => a.status === 'active' && a.offers === 0).length },
    { key: 'academic_risk', label: 'Academic Risk', count: roster.filter((a) => a.gpa != null && a.gpa < 2.5).length },
  ];

  const pendingTasks = useMemo(
    () => tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').slice(0, 5),
    [tasks]
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

  // Redirect to setup if no team (after all hooks)
  if (!isLoading && !team) {
    router.push('/coach/setup');
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load dashboard</h3>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Row 1: Recruiting Intelligence + RepMax Insight */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecruitingIntelFeed activity={activity} colleges={colleges} />
          </div>
          <div className="space-y-4">
            {/* RepMax Insight Card */}
            <div className="bg-gradient-to-br from-primary/10 to-[#1F1F22] rounded-xl border border-primary/20 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
                <h3 className="text-sm font-semibold text-white">RepMax Insight</h3>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                {roster.length > 0
                  ? `${roster.filter((a) => a.offers === 0 && a.status === 'active').length} athletes need more college exposure. Consider uploading highlight reels and scheduling campus visits to increase offer velocity.`
                  : 'Add athletes to your roster to receive personalized recruiting recommendations.'}
              </p>
              <button className="mt-3 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                View Recommendations →
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Dev Status + Compliance Calendar | Today's Tasks | Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Col 1: Dev Status + Compliance Calendar */}
          <div className="space-y-4">
            <AthleteDevelopmentStatus roster={roster} />
            <ComplianceCalendar events={calendarEvents} />
          </div>

          {/* Col 2: Today's Tasks */}
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">task_alt</span>
                Today&apos;s Tasks
              </h3>
              <Link href="/coach/tasks" className="text-[10px] text-primary font-semibold hover:text-primary/80">
                View All →
              </Link>
            </div>
            {pendingTasks.length === 0 ? (
              <p className="text-sm text-white/30 py-4 text-center">No pending tasks</p>
            ) : (
              <div className="space-y-2">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <button
                      onClick={() => updateTask(task.id, 'completed')}
                      className="mt-0.5 size-4 rounded border border-white/20 flex-shrink-0 hover:border-primary hover:bg-primary/10 transition-colors flex items-center justify-center"
                    >
                      {task.status === 'in_progress' && (
                        <span className="size-2 rounded-sm bg-primary/60" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80 truncate">{task.title}</p>
                      {task.dueDate && (
                        <p className="text-[10px] text-white/30 mt-0.5">
                          Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                    {task.priority === 'high' && (
                      <span className="text-[9px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded uppercase">
                        High
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Col 3: Quick Actions */}
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
              Quick Actions
            </h3>
            <div className="space-y-2">
              <QuickAction
                icon="person_add"
                label="Add Athlete"
                color="bg-primary/10 text-primary"
                href="/coach/roster/new"
              />
              <QuickAction
                icon="add_task"
                label="New Task"
                color="bg-blue-500/10 text-blue-400"
                href="/coach/tasks"
              />
              <QuickAction
                icon="mail"
                label="Send Message"
                color="bg-green-500/10 text-green-400"
                onClick={() => setComposeOpen(true)}
              />
              <QuickAction
                icon="download"
                label="Export Roster"
                color="bg-purple-500/10 text-purple-400"
                onClick={handleExportRoster}
              />
              <QuickAction
                icon="map"
                label="View Zone"
                color="bg-orange-500/10 text-orange-400"
                href="/zone/map"
              />
            </div>
          </div>
        </div>

        {/* My Recruits */}
        {roster.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">star</span>
                My Recruits
              </h2>
              <Link
                href="/coach/recruits"
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    activeFilter === f.key
                      ? 'bg-primary text-black'
                      : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
                  }`}
                >
                  {f.label}
                  <span className={`ml-1.5 ${activeFilter === f.key ? 'text-black/60' : 'text-white/30'}`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayedAthletes.map((athlete) => (
                <AthleteCard key={athlete.id} athlete={athlete} />
              ))}
            </div>
            {filteredRoster.length === 0 && (
              <p className="text-center text-white/30 text-sm py-4">No athletes match this filter</p>
            )}
          </div>
        )}
      </div>

      <ComposeMessageModal isOpen={composeOpen} onClose={() => setComposeOpen(false)} />
    </div>
  );
}

function QuickAction({
  icon,
  label,
  color,
  href,
  onClick,
}: {
  icon: string;
  label: string;
  color: string;
  href?: string;
  onClick?: () => void;
}) {
  const content = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <div className={`size-8 rounded-lg ${color} flex items-center justify-center`}>
          <span className="material-symbols-outlined text-[16px]">{icon}</span>
        </div>
        <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
          {label}
        </span>
      </div>
      <span className="material-symbols-outlined text-white/20 text-[16px] group-hover:text-white/40 transition-colors">
        chevron_right
      </span>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex p-2 rounded-lg hover:bg-white/5 transition-colors group"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex w-full p-2 rounded-lg hover:bg-white/5 transition-colors group text-left"
    >
      {content}
    </button>
  );
}
