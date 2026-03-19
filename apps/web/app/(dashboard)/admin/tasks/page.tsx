"use client";

import { useState } from "react";
import { useAdminTasks, type AdminTask } from "@/lib/hooks/use-admin-tasks";

const STATUS_TABS = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
];

const PRIORITY_COLORS: Record<string, string> = {
  normal: "bg-slate-500/20 text-slate-400",
  high: "bg-yellow-500/20 text-yellow-400",
  urgent: "bg-red-500/20 text-red-400",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-500/20 text-blue-400",
  in_progress: "bg-amber-500/20 text-amber-400",
  completed: "bg-green-500/20 text-green-400",
};

function isDueDatePast(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate) < today;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function TaskCard({
  task,
  onToggleComplete,
}: {
  task: AdminTask;
  onToggleComplete: (task: AdminTask) => void;
}) {
  const isCompleted = task.status === "completed";
  const isPastDue = !isCompleted && isDueDatePast(task.due_date);

  return (
    <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggleComplete(task)}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            isCompleted
              ? "bg-green-500 border-green-500"
              : "border-slate-500 hover:border-slate-300"
          }`}
        >
          {isCompleted && (
            <span className="material-symbols-outlined text-sm text-white">
              check
            </span>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3
              className={`text-sm font-medium ${
                isCompleted
                  ? "text-slate-500 line-through"
                  : "text-white"
              }`}
            >
              {task.title}
            </h3>
            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority] || ""}`}
              >
                {task.priority}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[task.status] || ""}`}
              >
                {task.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {task.details && (
            <p
              className={`text-sm mb-2 ${
                isCompleted ? "text-slate-600" : "text-slate-400"
              }`}
            >
              {task.details.length > 150
                ? `${task.details.slice(0, 150)}...`
                : task.details}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-slate-500">
            {task.assigned_name && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  person
                </span>
                {task.assigned_name}
              </span>
            )}
            {task.due_date && (
              <span
                className={`flex items-center gap-1 ${
                  isPastDue ? "text-red-400" : ""
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  calendar_today
                </span>
                {formatDate(task.due_date)}
                {isPastDue && " (overdue)"}
              </span>
            )}
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                schedule
              </span>
              {formatDate(task.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddTaskForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: {
    title: string;
    details?: string;
    assigned_name?: string;
    priority?: string;
    due_date?: string;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [assignedName, setAssignedName] = useState("");
  const [priority, setPriority] = useState("normal");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        details: details.trim() || undefined,
        assigned_name: assignedName.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
      });
      setTitle("");
      setDetails("");
      setAssignedName("");
      setPriority("normal");
      setDueDate("");
      onCancel();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#1F1F22] rounded-xl border border-white/5 p-4 mb-4"
    >
      <div className="mb-3">
        <label className="text-xs font-medium text-slate-400 mb-1 block">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="w-full bg-[#16161A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600"
        />
      </div>
      <div className="mb-3">
        <label className="text-xs font-medium text-slate-400 mb-1 block">
          Details
        </label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Optional details..."
          rows={2}
          className="w-full bg-[#16161A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 resize-none"
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1 block">
            Assigned To
          </label>
          <input
            type="text"
            value={assignedName}
            onChange={(e) => setAssignedName(e.target.value)}
            placeholder="Name"
            className="w-full bg-[#16161A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1 block">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full bg-[#16161A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1 block">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-[#16161A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors"
        >
          {submitting ? "Creating..." : "Add Task"}
        </button>
      </div>
    </form>
  );
}

export default function AdminTasksPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const { tasks, isLoading, error, createTask, updateTask } = useAdminTasks();

  const filteredTasks =
    activeTab === "all"
      ? tasks
      : tasks.filter((t) => t.status === activeTab);

  const openCount = tasks.filter((t) => t.status === "open").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  const handleToggleComplete = async (task: AdminTask) => {
    const newStatus = task.status === "completed" ? "open" : "completed";
    await updateTask({ id: task.id, status: newStatus });
  };

  const handleCreateTask = async (data: {
    title: string;
    details?: string;
    assigned_name?: string;
    priority?: string;
    due_date?: string;
  }) => {
    await createTask(data);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Tasks & To-Do
            </h1>
            <p className="text-slate-400">Admin task management</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Add Task
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{openCount}</p>
            <p className="text-xs text-slate-400 mt-1">Open</p>
          </div>
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">
              {inProgressCount}
            </p>
            <p className="text-xs text-slate-400 mt-1">In Progress</p>
          </div>
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4 text-center">
            <p className="text-2xl font-bold text-green-400">
              {completedCount}
            </p>
            <p className="text-xs text-slate-400 mt-1">Completed</p>
          </div>
        </div>

        {/* Add Task Form */}
        {showForm && (
          <AddTaskForm
            onSubmit={handleCreateTask}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                activeTab === tab.value
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
            <p className="text-red-400 text-sm">{error.message}</p>
          </div>
        )}

        {isLoading ? (
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-500 mb-3 block animate-spin">
              progress_activity
            </span>
            <p className="text-slate-400">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-500 mb-3 block">
              checklist
            </span>
            <p className="text-slate-400">
              {activeTab === "all"
                ? "No tasks yet"
                : `No ${activeTab.replace(/_/g, " ")} tasks`}
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Click &quot;Add Task&quot; to create your first task
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
