'use client';

import Link from 'next/link';

interface CoachTask {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  athleteName?: string | null;
}

interface CoachTasksSidebarProps {
  tasks: CoachTask[];
  onToggleTask: (taskId: string, currentStatus: string) => void;
}

const priorityDotColors: Record<CoachTask['priority'], string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-slate-400',
};

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return `${diffDays}d left`;
}

export default function CoachTasksSidebar({
  tasks,
  onToggleTask,
}: CoachTasksSidebarProps) {
  const sortedTasks = [...tasks]
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 5);

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;

  return (
    <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 text-lg">
            assignment
          </span>
          <h3 className="text-white font-semibold text-sm">Today&apos;s Tasks</h3>
          {pendingCount > 0 && (
            <span className="bg-primary/20 text-primary text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {sortedTasks.map((task) => {
          const overdue =
            task.status === 'pending' && !!task.dueDate && isOverdue(task.dueDate);

          return (
            <div
              key={task.id}
              className={`flex items-start gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors ${
                overdue ? 'border-l-2 border-red-400' : ''
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => onToggleTask(task.id, task.status)}
                className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                  task.status === 'completed'
                    ? 'bg-primary border-primary'
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                {task.status === 'completed' && (
                  <span className="material-symbols-outlined text-white text-xs">
                    check
                  </span>
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs font-medium truncate ${
                    task.status === 'completed'
                      ? 'text-slate-500 line-through'
                      : 'text-white'
                  }`}
                >
                  {task.title}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {/* Priority Dot */}
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${priorityDotColors[task.priority]}`}
                  />
                  <span
                    className={`text-[10px] ${
                      overdue ? 'text-red-400' : 'text-slate-500'
                    }`}
                  >
                    {task.dueDate ? formatDueDate(task.dueDate) : 'No date'}
                  </span>
                  {task.athleteName && (
                    <span className="text-[10px] text-slate-500">
                      &middot; {task.athleteName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All */}
      {tasks.length > 5 && (
        <Link
          href="/coach/tasks"
          className="block text-center text-xs text-primary hover:text-primary/80 mt-3 transition-colors"
        >
          View All Tasks
        </Link>
      )}
    </div>
  );
}
