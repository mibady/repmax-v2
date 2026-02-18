'use client';

import Link from 'next/link';
import { useState, useCallback, useMemo } from 'react';
import { useCoachDashboard } from '@/lib/hooks';
import ComposeMessageModal from '@/components/modals/ComposeMessageModal';

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Active' },
  committed: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Committed' },
  transferred: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Transferred' },
  graduated: { bg: 'bg-slate-500/10', text: 'text-slate-400', label: 'Graduated' },
};

export default function CoachDashboardPage() {
  const {
    roster,
    tasks,
    activity,
    metrics,
    isLoading,
    error,
    updateTask,
  } = useCoachDashboard();

  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'done'>('idle');
  const [composeOpen, setComposeOpen] = useState(false);

  const filteredRoster = useMemo(() => {
    return roster.filter((athlete) => {
      if (filterPosition !== 'all' && athlete.position !== filterPosition) return false;
      if (filterClass !== 'all' && athlete.classYear.toString() !== filterClass) return false;
      return true;
    });
  }, [roster, filterPosition, filterClass]);

  const handleExportSelected = useCallback(() => {
    if (selectedAthletes.length === 0) return;

    setExportStatus('exporting');

    // Get selected athlete data
    const selectedData = roster.filter(a => selectedAthletes.includes(a.id));
    const csvContent = [
      ['Name', 'Position', 'Class', 'GPA', 'Offers', 'Status'].join(','),
      ...selectedData.map(a => [a.name, a.position, a.classYear, a.gpa || 'N/A', a.offers, a.status].join(','))
    ].join('\n');

    // Create and download file
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
    window.location.href = `/dashboard/coach/roster/${athleteId}/edit`;
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSendAthlete = useCallback((athleteId: string) => {
    setComposeOpen(true);
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
      <div className="p-8 max-w-7xl mx-auto">
        {/* Team Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Team Roster</h1>
            <p className="text-slate-400">{metrics?.totalAthletes || roster.length} Athletes</p>
          </div>
          <Link
            href="/dashboard/coach/roster/new"
            className="flex items-center gap-2 bg-primary text-black font-bold px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Add Athlete
          </Link>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1F1F22] rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <span className="material-symbols-outlined text-[20px]">groups</span>
              Total Athletes
            </div>
            <span className="text-3xl font-bold text-white">{metrics?.totalAthletes || roster.length}</span>
          </div>
          <div className="bg-[#1F1F22] rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <span className="material-symbols-outlined text-[20px]">emoji_events</span>
              With Offers
            </div>
            <span className="text-3xl font-bold text-white">
              {roster.filter((a) => a.offers > 0).length}
            </span>
          </div>
          <div className="bg-[#1F1F22] rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              Committed
            </div>
            <span className="text-3xl font-bold text-white">
              {metrics?.committedAthletes || roster.filter((a) => a.status === 'committed').length}
            </span>
          </div>
          <div className="bg-[#1F1F22] rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <span className="material-symbols-outlined text-[20px]">task_alt</span>
              Pending Tasks
            </div>
            <span className="text-3xl font-bold text-white">{metrics?.pendingTasks || tasks.filter(t => t.status === 'pending').length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - Roster Grid */}
          <div className="lg:col-span-3">
            {/* Filters and Bulk Actions */}
            <div className="bg-[#1F1F22] rounded-xl border border-white/5 mb-6">
              <div className="p-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <select
                    value={filterPosition}
                    onChange={(e) => setFilterPosition(e.target.value)}
                    className="bg-[#2A2A2E] text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">All Positions</option>
                    <option value="QB">QB</option>
                    <option value="RB">RB</option>
                    <option value="WR">WR</option>
                    <option value="LB">LB</option>
                    <option value="CB">CB</option>
                  </select>
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="bg-[#2A2A2E] text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">All Classes</option>
                    <option value="2026">Class of 2026</option>
                    <option value="2027">Class of 2027</option>
                    <option value="2028">Class of 2028</option>
                  </select>
                </div>
                {selectedAthletes.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">{selectedAthletes.length} selected</span>
                    <button
                      onClick={handleExportSelected}
                      disabled={exportStatus === 'exporting'}
                      className="bg-primary/20 text-primary text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-primary/30 transition-colors disabled:opacity-50"
                    >
                      {exportStatus === 'exporting' ? 'Exporting...' : exportStatus === 'done' ? 'Exported!' : 'Export Selected'}
                    </button>
                    <button
                      onClick={handleSendToRecruiter}
                      className="bg-blue-500/20 text-blue-400 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      Send to Recruiter
                    </button>
                  </div>
                )}
              </div>

              {/* Roster Table */}
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
                                href={`/dashboard/coach/roster/${athlete.id}`}
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
                              <button
                                onClick={() => handleSendAthlete(athlete.id)}
                                className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">send</span>
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
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-6">
            {/* Team Tasks */}
            <div className="bg-[#1F1F22] rounded-xl border border-white/5">
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-bold text-white text-sm">Team Tasks</h3>
                <Link href="/dashboard/coach/tasks" className="text-xs text-primary hover:text-primary/80">View All</Link>
              </div>
              <div className="divide-y divide-white/5">
                {tasks.length === 0 ? (
                  <div className="p-6 text-center">
                    <span className="material-symbols-outlined text-slate-600 text-3xl mb-2">task_alt</span>
                    <p className="text-slate-500 text-sm">No tasks</p>
                  </div>
                ) : (
                  tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="p-3 flex items-center gap-3 hover:bg-white/5 transition-colors">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={() => handleToggleTask(task.id, task.status)}
                        className="rounded border-white/20 bg-transparent text-primary focus:ring-primary"
                      />
                      <span className={`text-sm flex-1 ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-white'}`}>
                        {task.title}
                      </span>
                      <span className={`size-2 rounded-full ${
                        task.priority === 'high' ? 'bg-red-400' :
                        task.priority === 'medium' ? 'bg-yellow-400' : 'bg-slate-400'
                      }`} />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#1F1F22] rounded-xl border border-white/5">
              <div className="p-4 border-b border-white/5">
                <h3 className="font-bold text-white text-sm">Recent Activity</h3>
              </div>
              <div className="divide-y divide-white/5">
                {activity.length === 0 ? (
                  <div className="p-6 text-center">
                    <span className="material-symbols-outlined text-slate-600 text-3xl mb-2">history</span>
                    <p className="text-slate-500 text-sm">No recent activity</p>
                  </div>
                ) : (
                  activity.slice(0, 5).map((item, index) => (
                    <div key={item.id || index} className="p-3 hover:bg-white/5 transition-colors">
                      <p className="text-sm text-white">{item.description}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ComposeMessageModal isOpen={composeOpen} onClose={() => setComposeOpen(false)} />
    </div>
  );
}
