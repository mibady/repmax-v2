"use client";

import { useMemo, useState } from "react";
import { useAdminEvents } from "@/lib/hooks/use-admin-events";

const EVENT_TYPES = [
  { value: "all", label: "All" },
  { value: "combine", label: "Combine", color: "bg-blue-500/20 text-blue-400" },
  { value: "deadline", label: "Deadline", color: "bg-red-500/20 text-red-400" },
  { value: "signing", label: "Signing", color: "bg-green-500/20 text-green-400" },
  { value: "platform", label: "Platform", color: "bg-purple-500/20 text-purple-400" },
  { value: "admin_task", label: "Admin Task", color: "bg-yellow-500/20 text-yellow-400" },
];

const TYPE_COLORS: Record<string, string> = {
  combine: "bg-blue-500/20 text-blue-400",
  deadline: "bg-red-500/20 text-red-400",
  signing: "bg-green-500/20 text-green-400",
  platform: "bg-purple-500/20 text-purple-400",
  admin_task: "bg-yellow-500/20 text-yellow-400",
};

const US_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminCalendarPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const { events, isLoading, error, createEvent } = useAdminEvents(typeFilter);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    event_date: "",
    event_type: "combine",
    linked_program: "",
    notes: "",
  });
  const [creating, setCreating] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const upcoming = events.filter((e) => e.event_date >= today).length;
    const thisMonthCount = events.filter((e) => {
      const d = new Date(e.event_date + "T00:00:00");
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;
    const typeCounts: Record<string, number> = {};
    events.forEach((e) => {
      typeCounts[e.event_type] = (typeCounts[e.event_type] || 0) + 1;
    });
    return { upcoming, thisMonthCount, typeCounts };
  }, [events, today]);

  const groupedEvents = useMemo(() => {
    const groups: Record<string, typeof events> = {};
    events.forEach((e) => {
      const d = new Date(e.event_date + "T00:00:00");
      const key = `${US_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return groups;
  }, [events]);

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.event_date) return;
    setCreating(true);
    try {
      await createEvent({
        title: formData.title,
        event_date: formData.event_date,
        event_type: formData.event_type,
        linked_program: formData.linked_program || undefined,
        notes: formData.notes || undefined,
      });
      setFormData({ title: "", event_date: "", event_type: "combine", linked_program: "", notes: "" });
      setShowForm(false);
    } finally {
      setCreating(false);
    }
  };

  const now = new Date();
  const currentMonthLabel = `${US_MONTHS[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Calendar & Events
            </h1>
            <p className="text-slate-400">Platform event management</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
          >
            <span className="material-symbols-outlined text-base align-middle mr-1">
              add
            </span>
            Add Event
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
            <p className="text-xs text-slate-400 mb-1">Upcoming</p>
            <p className="text-2xl font-bold text-white">{stats.upcoming}</p>
          </div>
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
            <p className="text-xs text-slate-400 mb-1">This Month</p>
            <p className="text-2xl font-bold text-white">{stats.thisMonthCount}</p>
          </div>
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
            <p className="text-xs text-slate-400 mb-1">Total Events</p>
            <p className="text-2xl font-bold text-white">{events.length}</p>
          </div>
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
            <p className="text-xs text-slate-400 mb-1">Event Types</p>
            <p className="text-2xl font-bold text-white">
              {Object.keys(stats.typeCounts).length}
            </p>
          </div>
        </div>

        {/* Current Month */}
        <p className="text-lg font-semibold text-white mb-4">{currentMonthLabel}</p>

        {/* Type Tabs */}
        <div className="flex gap-2 mb-6">
          {EVENT_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTypeFilter(t.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === t.value
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {t.label}
              {t.value !== "all" && stats.typeCounts[t.value] ? (
                <span className="ml-1 text-xs text-slate-500">
                  ({stats.typeCounts[t.value]})
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Add Event Form */}
        {showForm && (
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-6 mb-6 space-y-4">
            <h3 className="text-base font-medium text-white">New Event</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Event title..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-white/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Type
                </label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                >
                  {EVENT_TYPES.filter((t) => t.value !== "all").map((t) => (
                    <option key={t.value} value={t.value} className="bg-[#1F1F22]">
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Linked Program
                </label>
                <input
                  type="text"
                  value={formData.linked_program}
                  onChange={(e) => setFormData({ ...formData, linked_program: e.target.value })}
                  placeholder="Optional program name..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-white/20"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes..."
                rows={3}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={creating || !formData.title.trim() || !formData.event_date}
                className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Event"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-slate-400 hover:text-white text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Events List */}
        {isLoading ? (
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-500 mb-3 block animate-spin">
              progress_activity
            </span>
            <p className="text-slate-400">Loading events...</p>
          </div>
        ) : error ? (
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-red-400 mb-3 block">
              error
            </span>
            <p className="text-red-400">{error.message}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-500 mb-3 block">
              calendar_month
            </span>
            <p className="text-slate-400">No events found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEvents).map(([month, monthEvents]) => (
              <div key={month}>
                <h3 className="text-sm font-medium text-slate-400 mb-3">
                  {month}
                </h3>
                <div className="space-y-2">
                  {monthEvents.map((event) => {
                    const isPast = event.event_date < today;
                    return (
                      <div
                        key={event.id}
                        className={`bg-[#1F1F22] rounded-xl border border-white/5 p-4 flex items-center gap-4 ${
                          isPast ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex-shrink-0 w-16 text-center">
                          <p className="text-lg font-bold text-white">
                            {new Date(event.event_date + "T00:00:00").getDate()}
                          </p>
                          <p className="text-xs text-slate-400">
                            {US_MONTHS[new Date(event.event_date + "T00:00:00").getMonth()]?.slice(0, 3)}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-white truncate">
                              {event.title}
                            </h4>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                TYPE_COLORS[event.event_type] || TYPE_COLORS.combine
                              }`}
                            >
                              {event.event_type.replace("_", " ")}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span>{formatDate(event.event_date)}</span>
                            {event.linked_program && (
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">
                                  school
                                </span>
                                {event.linked_program}
                              </span>
                            )}
                          </div>
                          {event.notes && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                              {event.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
