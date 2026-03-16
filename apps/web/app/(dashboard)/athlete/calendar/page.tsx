'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  priority: string | null;
};

type ViewMode = 'list' | 'calendar';

const EVENT_TYPES = [
  { value: 'visit', label: 'Visit', icon: 'location_on' },
  { value: 'camp', label: 'Camp', icon: 'camping' },
  { value: 'combine', label: 'Combine', icon: 'speed' },
  { value: 'game', label: 'Game', icon: 'sports_football' },
  { value: 'deadline', label: 'Deadline', icon: 'schedule' },
  { value: 'signing', label: 'Signing', icon: 'draw' },
  { value: 'other', label: 'Personal', icon: 'event' },
];

function formatDate(dateStr: string): { month: string; day: string; year: string } {
  const date = new Date(dateStr + 'T00:00:00');
  return {
    month: date.toLocaleString('en-US', { month: 'short' }),
    day: date.getDate().toString().padStart(2, '0'),
    year: date.getFullYear().toString(),
  };
}

function formatTime(timeStr: string | null): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

function getEventTypeIcon(type: string): string {
  return EVENT_TYPES.find(t => t.value === type)?.icon || 'event';
}

function getEventTypeLabel(type: string): string {
  return EVENT_TYPES.find(t => t.value === type)?.label || type.charAt(0).toUpperCase() + type.slice(1);
}

function getEventTypeColor(type: string): string {
  switch (type) {
    case 'visit': return 'bg-blue-500/15 text-blue-400';
    case 'camp': return 'bg-green-500/15 text-green-400';
    case 'combine': return 'bg-primary/15 text-primary';
    case 'game': return 'bg-red-500/15 text-red-400';
    case 'deadline': return 'bg-orange-500/15 text-orange-400';
    case 'signing': return 'bg-purple-500/15 text-purple-400';
    default: return 'bg-gray-500/15 text-gray-400';
  }
}

function getEventDotColor(type: string): string {
  switch (type) {
    case 'visit': return 'bg-blue-400';
    case 'camp': return 'bg-green-400';
    case 'combine': return 'bg-primary';
    case 'game': return 'bg-red-400';
    case 'deadline': return 'bg-orange-400';
    case 'signing': return 'bg-purple-400';
    default: return 'bg-gray-400';
  }
}

// ─── Add Event Modal ───────────────────────────────────────────
function AddEventModal({
  isOpen,
  onClose,
  onSave,
  prefillDate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  prefillDate?: string;
}) {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('other');
  const [eventDate, setEventDate] = useState(prefillDate || '');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('normal');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && prefillDate) setEventDate(prefillDate);
  }, [isOpen, prefillDate]);

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setEventType('other');
      setEventDate(prefillDate || '');
      setEventTime('');
      setLocation('');
      setDescription('');
      setPriority('normal');
    }
  }, [isOpen, prefillDate]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !eventDate) return;
    setSaving(true);
    try {
      await onSave({
        title,
        event_type: eventType,
        event_date: eventDate,
        event_time: eventTime || null,
        location: location || null,
        description: description || null,
        priority,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-[#1a1a1a] border border-[#333] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Add Event</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Alabama Official Visit"
                className="w-full bg-white/5 border border-[#333] rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary/50"
                required
              />
            </div>

            {/* Event Type */}
            <div>
              <label className="text-xs font-medium text-gray-400 mb-2 block">Type *</label>
              <div className="grid grid-cols-4 gap-2">
                {EVENT_TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setEventType(t.value)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-colors ${
                      eventType === t.value
                        ? 'border-primary/50 bg-primary/10 text-primary'
                        : 'border-[#333] text-gray-500 hover:border-[#444] hover:text-gray-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1 block">Date *</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={e => setEventDate(e.target.value)}
                  className="w-full bg-white/5 border border-[#333] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50 [color-scheme:dark]"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1 block">Time</label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={e => setEventTime(e.target.value)}
                  className="w-full bg-white/5 border border-[#333] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50 [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Location</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Bryant-Denny Stadium"
                className="w-full bg-white/5 border border-[#333] rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary/50"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Notes</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Any details or reminders..."
                rows={3}
                className="w-full bg-white/5 border border-[#333] rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary/50 resize-none"
              />
            </div>

            {/* Priority */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-gray-400">Priority:</label>
              <button
                type="button"
                onClick={() => setPriority(p => p === 'high' ? 'normal' : 'high')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  priority === 'high'
                    ? 'bg-red-500/15 text-red-400 border-red-500/30'
                    : 'border-[#333] text-gray-500 hover:text-gray-300'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">priority_high</span>
                High Priority
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl border border-[#333] text-gray-400 text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !title || !eventDate}
                className="flex-1 px-4 py-3 rounded-xl bg-primary text-black text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="material-symbols-outlined text-[18px]">add</span>}
                Add Event
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Calendar Grid View ────────────────────────────────────────
function CalendarGrid({
  allEvents,
  onDayClick,
  onDeleteEvent,
}: {
  allEvents: CalendarEvent[];
  onDayClick: (date: string) => void;
  onDeleteEvent: (id: string) => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const monthLabel = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { date: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = month === 0 ? 12 : month;
      const y = month === 0 ? year - 1 : year;
      days.push({ date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, dayNum: d, isCurrentMonth: false });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ date: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, dayNum: d, isCurrentMonth: true });
    }
    // Next month padding
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = month + 2 > 12 ? 1 : month + 2;
      const y = month + 2 > 12 ? year + 1 : year;
      days.push({ date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, dayNum: d, isCurrentMonth: false });
    }
    return days;
  }, [currentMonth]);

  // Events grouped by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const e of allEvents) {
      if (!map[e.event_date]) map[e.event_date] = [];
      map[e.event_date].push(e);
    }
    return map;
  }, [allEvents]);

  const selectedEvents = selectedDay ? (eventsByDate[selectedDay] || []) : [];

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>
        <h3 className="text-lg font-bold text-white">{monthLabel}</h3>
        <button
          onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-600 py-2">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(({ date, dayNum, isCurrentMonth }) => {
          const dayEvents = eventsByDate[date] || [];
          const isToday = date === todayStr;
          const isSelected = date === selectedDay;

          return (
            <button
              key={date}
              onClick={() => {
                setSelectedDay(date === selectedDay ? null : date);
              }}
              className={`relative aspect-square rounded-xl p-1 flex flex-col items-center justify-start pt-2 transition-all text-sm ${
                !isCurrentMonth ? 'text-gray-700' :
                isSelected ? 'bg-primary/20 border border-primary/40 text-white' :
                isToday ? 'bg-white/10 text-white font-bold' :
                'text-gray-300 hover:bg-white/5'
              }`}
            >
              <span className={`text-xs ${isToday && !isSelected ? 'bg-primary text-black rounded-full w-6 h-6 flex items-center justify-center font-bold' : ''}`}>
                {dayNum}
              </span>
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                  {dayEvents.slice(0, 3).map(e => (
                    <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${getEventDotColor(e.event_type)}`} />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[8px] text-gray-500">+{dayEvents.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day events */}
      {selectedDay && (
        <div className="border-t border-[#333] pt-4 mt-4 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-white">
              {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h4>
            <button
              onClick={() => onDayClick(selectedDay)}
              className="flex items-center gap-1 text-xs text-primary font-medium hover:text-primary/80 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add Event
            </button>
          </div>
          {selectedEvents.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">No events on this day</p>
          ) : (
            selectedEvents.map(event => (
              <div key={event.id} className="bg-white/5 rounded-xl p-3 flex items-center gap-3 group">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${getEventTypeColor(event.event_type)}`}>
                  <span className="material-symbols-outlined text-[16px]">{getEventTypeIcon(event.event_type)}</span>
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-medium truncate">{event.title}</div>
                  <div className="text-[10px] text-gray-500">
                    {getEventTypeLabel(event.event_type)}
                    {event.event_time && ` · ${formatTime(event.event_time)}`}
                    {event.location && ` · ${event.location}`}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteEvent(event.id); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── List View (Event Row) ─────────────────────────────────────
function EventRow({ event, onDelete }: { event: CalendarEvent; onDelete: (id: string) => void }) {
  const { month, day } = formatDate(event.event_date);

  return (
    <div className="bg-surface-dark rounded-xl border border-[#333] hover:border-[#444] transition-colors p-5 flex items-start gap-5 group">
      {/* Date block */}
      <div className="flex-shrink-0 w-16 text-center">
        <div className={`text-xs font-bold uppercase ${event.priority === 'high' ? 'text-red-400' : 'text-text-muted'}`}>
          {month}
        </div>
        <div className="text-2xl font-bold text-white">{day}</div>
      </div>

      {/* Event details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-white font-bold truncate">{event.title}</h3>
          {event.priority === 'high' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
              High Priority
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-text-muted flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${getEventTypeColor(event.event_type)}`}>
            <span className="material-symbols-outlined text-[14px]">{getEventTypeIcon(event.event_type)}</span>
            {getEventTypeLabel(event.event_type)}
          </span>
          {event.location && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              {event.location}
            </span>
          )}
          {event.event_time && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {formatTime(event.event_time)}
            </span>
          )}
        </div>
        {event.description && (
          <p className="text-xs text-gray-400 mt-2 line-clamp-2">{event.description}</p>
        )}
      </div>

      {/* Delete button */}
      <button
        onClick={() => onDelete(event.id)}
        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all flex-shrink-0 mt-1"
      >
        <span className="material-symbols-outlined text-[20px]">delete</span>
      </button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function AthleteCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [modalOpen, setModalOpen] = useState(false);
  const [prefillDate, setPrefillDate] = useState<string | undefined>();

  async function fetchEvents() {
    try {
      const res = await fetch('/api/athlete/calendar');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to load events');
      }
      const data = await res.json();
      setEvents(data.upcoming || []);
      setPastEvents(data.past || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { fetchEvents(); }, []);

  async function handleAddEvent(event: Omit<CalendarEvent, 'id'>) {
    const res = await fetch('/api/athlete/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to create event');
    }
    await fetchEvents();
  }

  async function handleDeleteEvent(id: string) {
    const res = await fetch(`/api/athlete/calendar?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setEvents(prev => prev.filter(e => e.id !== id));
      setPastEvents(prev => prev.filter(e => e.id !== id));
    }
  }

  function openModalForDate(date: string) {
    setPrefillDate(date);
    setModalOpen(true);
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayEvents = showPast ? pastEvents : events;
  const allEvents = [...events, ...pastEvents];

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/athlete" className="text-text-muted hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </Link>
              <h1 className="text-3xl font-bold text-white">Recruiting Calendar</h1>
            </div>
            <p className="text-text-muted ml-8">Your visits, camps, combines, deadlines, and personal events.</p>
          </div>
          <button
            onClick={() => { setPrefillDate(undefined); setModalOpen(true); }}
            className="flex items-center gap-2 bg-primary text-black font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Event
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* View Toggle + List Filter */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {viewMode === 'list' && (
              <>
                <button
                  onClick={() => setShowPast(false)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    !showPast ? 'bg-primary text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Upcoming ({events.length})
                </button>
                <button
                  onClick={() => setShowPast(true)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    showPast ? 'bg-primary text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Past ({pastEvents.length})
                </button>
              </>
            )}
          </div>
          <div className="flex bg-white/5 rounded-xl p-1 border border-[#333]">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'calendar' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">calendar_month</span>
              Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'list' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">list</span>
              List
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'calendar' ? (
          <div className="bg-surface-dark rounded-2xl border border-[#333] p-6">
            <CalendarGrid
              allEvents={allEvents}
              onDayClick={openModalForDate}
              onDeleteEvent={handleDeleteEvent}
            />
          </div>
        ) : (
          <>
            {displayEvents.length === 0 ? (
              <div className="bg-surface-dark rounded-xl border border-[#333] p-12 text-center">
                <span className="material-symbols-outlined text-[48px] text-white/10 mb-4">calendar_month</span>
                <h3 className="text-lg font-bold text-white mb-2">
                  {showPast ? 'No Past Events' : 'No Upcoming Events'}
                </h3>
                <p className="text-text-muted text-sm max-w-md mx-auto mb-6">
                  {showPast
                    ? 'Your completed events will appear here.'
                    : 'Add your first event — visits, camps, games, or personal milestones.'}
                </p>
                <button
                  onClick={() => { setPrefillDate(undefined); setModalOpen(true); }}
                  className="inline-flex items-center gap-2 bg-primary text-black font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-primary/90 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add Event
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {displayEvents.map(event => (
                  <EventRow key={event.id} event={event} onDelete={handleDeleteEvent} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddEvent}
        prefillDate={prefillDate}
      />
    </div>
  );
}
