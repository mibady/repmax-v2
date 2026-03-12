'use client';

import Link from 'next/link';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCoachDashboard } from '@/lib/hooks';
import ComposeMessageModal from '@/components/modals/ComposeMessageModal';
import AthleteCard from '@/components/coach/AthleteCard';
import CoachFilterBar from '@/components/coach/CoachFilterBar';
import ZoneOverviewMini from '@/components/coach/ZoneOverviewMini';
import CoachTasksSidebar from '@/components/coach/CoachTasksSidebar';
import CoachActivityFeed from '@/components/coach/CoachActivityFeed';
import CoachCalendarSidebar from '@/components/coach/CoachCalendarSidebar';

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Active' },
  committed: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Committed' },
  transferred: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Transferred' },
  graduated: { bg: 'bg-slate-500/10', text: 'text-slate-400', label: 'Graduated' },
};

export default function CoachDashboardPage() {
  const router = useRouter();
  const {
    team,
    roster,
    tasks,
    activity,
    calendarEvents,
    metrics,
    isLoading,
    error,
    updateTask,
  } = useCoachDashboard();

  useEffect(() => {
    if (!isLoading && !team) {
      router.push('/coach/setup');
    }
  }, [isLoading, team, router]);

  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [filterPosition, setFilterPosition] = useState<string>('All');
  const [filterClass, setFilterClass] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('Name');
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'done'>('idle');
  const [composeOpen, setComposeOpen] = useState(false);

  const filteredRoster = useMemo(() => {
    let result = roster.filter((athlete) => {
      if (filterPosition !== 'All' && athlete.position !== filterPosition) return false;
      if (filterClass !== 'All' && athlete.classYear.toString() !== filterClass) return false;
      if (filterStatus !== 'All' && athlete.status !== filterStatus.toLowerCase()) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!athlete.name.toLowerCase().includes(q) && !athlete.position.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'Name': return a.name.localeCompare(b.name);
        case 'Position': return a.position.localeCompare(b.position);
        case 'Class': return a.classYear - b.classYear;
        case 'GPA': return (b.gpa ?? 0) - (a.gpa ?? 0);
        case 'Offers': return b.offers - a.offers;
        default: return 0;
      }
    });

    return result;
  }, [roster, filterPosition, filterClass, filterStatus, searchQuery, sortBy]);

  const handleFilterChange = useCallback((filter: string, value: string) => {
    switch (filter) {
      case 'position': setFilterPosition(value); break;
      case 'class': setFilterClass(value); break;
      case 'status': setFilterStatus(value); break;
    }
  }, []);

  const handleExportSelected = useCallback(() => {
    if (selectedAthletes.length === 0) return;
    setExportStatus('exporting');
    const selectedData = roster.filter(a => selectedAthletes.includes(a.id));
    const csvContent = [
      ['Name', 'Position', 'Class', 'GPA', 'Offers', 'Status'].join(','),
      ...selectedData.map(a => [a.name, a.position, a.classYear, a.gpa || 'N/A', a.offers, a.status].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roster-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportStatus('done');
    setTimeout(() => setExportStatus('idle'), 2000);
  }, [selectedAthletes, roster]);

  const handleSendToRecruiter = useCallback(() => {
    if (selectedAthletes.length === 0) return;
    setComposeOpen(true);
  }, [selectedAthletes]);

  const handleEditAthlete = useCallback((athleteId: string) => {
    window.location.href = `/coach/roster/${athleteId}/edit`;
  }, []);

  const handleToggleTask = useCallback(async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await updateTask(taskId, newStatus as 'pending' | 'in_progress' | 'completed');
  }, [updateTask]);

  const toggleSelect = (id: string) => {
    setSelectedAthletes((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedAthletes.length === filteredRoster.length) {
      setSelectedAthletes([]);
    } else {
      setSelectedAthletes(filteredRoster.map((a) => a.id));
    }
  };

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
    <div className="flex-1 overflow-auto">
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Stats Overview Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left: School Info + Stats */}
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-14 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl">shield</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{team?.name || 'My Team'}</h1>
                <p className="text-slate-400 text-sm">{team?.school || ''} {team?.city && team?.state ? `- ${team.city}, ${team.state}` : ''}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Athletes</p>
                <p className="text-2xl font-bold text-white">{metrics?.totalAthletes ?? roster.length}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">With Offers</p>
                <p className="text-2xl font-bold text-primary">{metrics?.totalOffers ?? roster.filter(a => a.offers > 0).length}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Committed</p>
                <p className="text-2xl font-bold text-blue-400">{metrics?.committedAthletes ?? roster.filter(a => a.status === 'committed').length}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Tasks</p>
                <p className="text-2xl font-bold text-yellow-400">{metrics?.pendingTasks ?? tasks.filter(t => t.status === 'pending').length}</p>
              </div>
            </div>
          </div>

          {/* Right: Zone Overview */}
          <ZoneOverviewMini
            zone={team?.zone || ''}
            activeRecruits={metrics?.activeAthletes ?? roster.filter(a => a.status === 'active').length}
            offersTotal={metrics?.totalOffers ?? roster.reduce((sum, a) => sum + a.offers, 0)}
          />
        </div>

        {/* Main Content: Sidebar + Roster */}
        <div className="flex gap-6">
          {/* Content Sidebar */}
          <aside className="hidden xl:flex flex-col gap-4 w-72 shrink-0">
            <CoachTasksSidebar
              tasks={tasks}
              onToggleTask={handleToggleTask}
            />
            <CoachActivityFeed activity={activity} />
            <CoachCalendarSidebar events={calendarEvents} />

            {/* Quick Actions */}
            <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">bolt</span>
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setComposeOpen(true)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary text-xl">mail</span>
                  <span className="text-[10px] text-slate-400 font-medium">Email</span>
                </button>
                <Link
                  href="/coach/tasks"
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary text-xl">add_task</span>
                  <span className="text-[10px] text-slate-400 font-medium">New Task</span>
                </Link>
                <Link
                  href="/coach/roster/new"
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary text-xl">person_add</span>
                  <span className="text-[10px] text-slate-400 font-medium">Add Athlete</span>
                </Link>
                <Link
                  href="/coach/roster"
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary text-xl">compare</span>
                  <span className="text-[10px] text-slate-400 font-medium">Compare</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Area */}
          <main className="flex-1 min-w-0">
            {/* Filter Bar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <CoachFilterBar
                filterPosition={filterPosition}
                filterClass={filterClass}
                filterStatus={filterStatus}
                searchQuery={searchQuery}
                viewMode={viewMode}
                sortBy={sortBy}
                onFilterChange={handleFilterChange}
                onViewModeChange={setViewMode}
                onSearchChange={setSearchQuery}
                onSortChange={setSortBy}
              />
              <div className="flex items-center gap-2">
                <Link
                  href="/coach/roster/new"
                  className="flex items-center gap-2 bg-primary text-black font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  Add Athlete
                </Link>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedAthletes.length > 0 && (
              <div className="mb-4 flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-2">
                <span className="text-sm text-primary font-medium">{selectedAthletes.length} selected</span>
                <button
                  onClick={handleExportSelected}
                  disabled={exportStatus === 'exporting'}
                  className="bg-primary/20 text-primary text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-primary/30 transition-colors disabled:opacity-50"
                >
                  {exportStatus === 'exporting' ? 'Exporting...' : exportStatus === 'done' ? 'Exported!' : 'Export'}
                </button>
                <button
                  onClick={handleSendToRecruiter}
                  className="bg-blue-500/20 text-blue-400 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                  Send to Recruiter
                </button>
              </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                {filteredRoster.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-16">
                    <span className="material-symbols-outlined text-slate-600 text-5xl mb-3">groups</span>
                    <p className="text-slate-500 text-lg">No athletes found</p>
                    <p className="text-slate-600 text-sm mt-1">Try adjusting your filters</p>
                  </div>
                ) : (
                  filteredRoster.map((athlete) => (
                    <AthleteCard key={athlete.id} athlete={athlete} />
                  ))
                )}
              </div>
            ) : (
              /* List View - Original Table */
              <div className="bg-[#1F1F22] rounded-xl border border-white/5">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedAthletes.length === filteredRoster.length && filteredRoster.length > 0}
                            onChange={toggleSelectAll}
                            className="rounded border-white/20 bg-transparent text-primary focus:ring-primary"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Athlete</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Position</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Class</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">GPA</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Offers</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredRoster.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-12 text-center">
                            <span className="material-symbols-outlined text-slate-600 text-4xl mb-2">groups</span>
                            <p className="text-slate-500">No athletes in roster</p>
                          </td>
                        </tr>
                      ) : (
                        filteredRoster.map((athlete) => (
                          <tr key={athlete.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedAthletes.includes(athlete.id)}
                                onChange={() => toggleSelect(athlete.id)}
                                className="rounded border-white/20 bg-transparent text-primary focus:ring-primary"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-[#2A2A2E] flex items-center justify-center text-white font-bold text-sm">
                                  {athlete.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                </div>
                                <span className="text-sm font-medium text-white">{athlete.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-white font-mono">{athlete.position}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-slate-400">{athlete.classYear}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-white font-mono">{athlete.gpa?.toFixed(1) || 'N/A'}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-white font-bold">{athlete.offers}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-bold px-2 py-1 rounded ${statusColors[athlete.status]?.bg || 'bg-slate-500/10'} ${statusColors[athlete.status]?.text || 'text-slate-400'}`}>
                                {statusColors[athlete.status]?.label || athlete.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/coach/roster/${athlete.id}`}
                                  className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                                </Link>
                                <button
                                  onClick={() => handleEditAthlete(athlete.id)}
                                  className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
      <ComposeMessageModal isOpen={composeOpen} onClose={() => setComposeOpen(false)} />
    </div>
  );
}
