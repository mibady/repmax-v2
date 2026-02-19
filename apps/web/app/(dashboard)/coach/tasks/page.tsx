'use client';

import { useState, useMemo, useCallback } from 'react';
import { useCoachDashboard } from '@/lib/hooks';

const priorityDot: Record<string, string> = {
  high: 'bg-red-400',
  medium: 'bg-yellow-400',
  low: 'bg-slate-400',
};

export default function CoachTasksPage(): React.JSX.Element {
  const { tasks, updateTask, isLoading, error, refresh } = useCoachDashboard();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<string>('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
      return true;
    });
  }, [tasks, filterStatus, filterPriority]);

  const handleToggleTask = useCallback(async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await updateTask(taskId, newStatus as 'pending' | 'in_progress' | 'completed');
  }, [updateTask]);

  const handleCreateTask = async (): Promise<void> => {
    if (!newTitle.trim()) return;

    setCreating(true);
    setCreateError(null);

    try {
      const res = await fetch('/api/coach/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          priority: newPriority,
          due_date: newDueDate || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create task');
      }

      // Reset form and refresh
      setNewTitle('');
      setNewPriority('medium');
      setNewDueDate('');
      refresh();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load tasks</h3>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Team Tasks</h1>
          <p className="text-slate-400">{tasks.length} total tasks</p>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#2A2A2E] text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-[#2A2A2E] text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Task Cards */}
        {filteredTasks.length === 0 ? (
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-12 text-center mb-6">
            <span className="material-symbols-outlined text-slate-600 text-4xl mb-3">task_alt</span>
            <h3 className="text-white font-semibold mb-1">No tasks found</h3>
            <p className="text-slate-400 text-sm">Create a new task below or adjust your filters</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {filteredTasks.map((task) => (
              <div key={task.id} className="bg-[#1F1F22] rounded-xl border border-white/5 p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={() => handleToggleTask(task.id, task.status)}
                  className="rounded border-white/20 bg-transparent text-primary focus:ring-primary shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-white'}`}>
                      {task.title}
                    </span>
                    <span className={`size-2 rounded-full shrink-0 ${priorityDot[task.priority] || 'bg-slate-400'}`} />
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {task.dueDate && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                        {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    {task.athleteName && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">person</span>
                        {task.athleteName}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                  task.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                  task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-slate-500/10 text-slate-400'
                }`}>
                  {task.status === 'in_progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* New Task Section */}
        <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">add_task</span>
            New Task
          </h2>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Task title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && newTitle.trim()) handleCreateTask(); }}
                className="w-full bg-[#2A2A2E] text-white text-sm rounded-lg px-3 py-2.5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-500"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="bg-[#2A2A2E] text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="bg-[#2A2A2E] text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handleCreateTask}
                disabled={creating || !newTitle.trim()}
                className="flex items-center gap-2 bg-primary text-black font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <div className="size-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Add Task
                  </>
                )}
              </button>
            </div>
            {createError && (
              <p className="text-red-400 text-sm">{createError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
