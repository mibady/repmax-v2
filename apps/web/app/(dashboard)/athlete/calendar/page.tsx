'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import {
  getPeriodsForDate,
  getPeriodTintForDate,
  PERIOD_COLORS,
  PERIOD_LABELS,
  PERIOD_DEFINITIONS,
  type PeriodType,
} from '@/lib/data/ncaa-calendar';

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
  { value: 'visit', label: 'Visit', icon: 'location_on', color: 'bg-blue-500 text-white' },
  { value: 'camp', label: 'Camp', icon: 'camping', color: 'bg-green-500 text-white' },
  { value: 'combine', label: 'Combine', icon: 'speed', color: 'bg-primary text-black' },
  { value: 'game', label: 'Game', icon: 'sports_football', color: 'bg-red-500 text-white' },
  { value: 'deadline', label: 'Deadline', icon: 'schedule', color: 'bg-orange-500 text-white' },
  { value: 'signing', label: 'Signing', icon: 'draw', color: 'bg-purple-500 text-white' },
  { value: 'other', label: 'Personal', icon: 'event', color: 'bg-gray-500 text-white' },
];

function getEventChipColor(type: string): string {
  return EVENT_TYPES.find(t => t.value === type)?.color || 'bg-gray-500 text-white';
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

function formatTime12(timeStr: string | null): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
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
    if (isOpen) {
      setEventDate(prefillDate || '');
      setTitle('');
      setEventType('other');
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

  // Check NCAA period for selected date
  const ncaaPeriods = eventDate ? getPeriodsForDate(eventDate) : [];

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

          {/* NCAA Period Alert */}
          {ncaaPeriods.length > 0 && (
            <div className={`mb-4 rounded-xl p-3 border ${PERIOD_COLORS[ncaaPeriods[0].type].bg} ${PERIOD_COLORS[ncaaPeriods[0].type].border}`}>
              <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${PERIOD_COLORS[ncaaPeriods[0].type].text}`}>
                NCAA {ncaaPeriods[0].label}
              </div>
              <p className="text-xs text-gray-400">{PERIOD_LABELS[ncaaPeriods[0].type]}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

// ─── Big Calendar Grid ─────────────────────────────────────────
function BigCalendar({
  allEvents,
  onDayClick,
  onDeleteEvent,
  showNcaaPeriods,
}: {
  allEvents: CalendarEvent[];
  onDayClick: (date: string) => void;
  onDeleteEvent: (id: string) => void;
  showNcaaPeriods: boolean;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  // Build days array
  const days = useMemo(() => {
    const result: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      result.push(day);
      day = addDays(day, 1);
    }
    return result;
  }, [calendarStart, calendarEnd]);

  // Events by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const e of allEvents) {
      if (!map[e.event_date]) map[e.event_date] = [];
      map[e.event_date].push(e);
    }
    return map;
  }, [allEvents]);

  const selectedDateStr = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : null;
  const selectedEvents = selectedDateStr ? (eventsByDate[selectedDateStr] || []) : [];
  const selectedNcaaPeriods = selectedDateStr ? getPeriodsForDate(selectedDateStr) : [];

  const handlePrev = useCallback(() => setCurrentMonth(d => subMonths(d, 1)), []);
  const handleNext = useCallback(() => setCurrentMonth(d => addMonths(d, 1)), []);
  const handleToday = useCallback(() => { setCurrentMonth(new Date()); setSelectedDay(new Date()); }, []);

  const eventCount = allEvents.length;

  return (
    <div className="space-y-0">
      {/* Calendar Header Bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-white/5 border border-[#333] rounded-xl px-3 py-2 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-primary">{format(currentMonth, 'MMM')}</div>
            <div className="text-lg font-bold text-white leading-none">{format(currentMonth, 'yyyy')}</div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{format(currentMonth, 'MMMM yyyy')}</h3>
            <p className="text-xs text-gray-500">{eventCount} events</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleToday} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 border border-[#333] transition-colors">
            Today
          </button>
          <div className="flex bg-white/5 rounded-lg border border-[#333]">
            <button onClick={handlePrev} className="p-1.5 hover:bg-white/10 rounded-l-lg text-gray-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button onClick={handleNext} className="p-1.5 hover:bg-white/10 rounded-r-lg text-gray-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-[#333]">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-[11px] font-bold uppercase tracking-wider text-gray-400 py-3">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border-l border-[#333]">
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDate[dateStr] || [];
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const selected = selectedDay ? isSameDay(day, selectedDay) : false;
          const periodTint = showNcaaPeriods ? getPeriodTintForDate(dateStr) : null;

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDay(selected ? null : day)}
              className={`relative min-h-[100px] border-r border-b border-[#333] p-1.5 text-left transition-colors ${
                !inMonth ? 'bg-white/[0.02]' :
                selected ? 'bg-primary/10' :
                'hover:bg-white/[0.04]'
              } ${periodTint && inMonth ? periodTint : ''}`}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${
                  today ? 'bg-primary text-black font-bold' :
                  !inMonth ? 'text-gray-700' :
                  selected ? 'text-primary font-bold' :
                  'text-gray-300'
                }`}>
                  {format(day, 'd')}
                </span>
              </div>

              {/* Event chips (max 3 visible) */}
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map(e => (
                  <div
                    key={e.id}
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded truncate leading-tight ${getEventChipColor(e.event_type)}`}
                    title={`${e.title}${e.event_time ? ` · ${formatTime12(e.event_time)}` : ''}`}
                  >
                    {e.title}{e.event_time ? ` ${formatTime12(e.event_time)}` : ''}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-gray-500 px-1.5 font-medium">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* NCAA Period Legend */}
      {showNcaaPeriods && (
        <div className="flex flex-wrap items-center gap-4 pt-4 mt-2 border-t border-[#333]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">NCAA Periods:</span>
          {(['contact', 'evaluation', 'quiet', 'dead'] as PeriodType[]).map(type => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm ${PERIOD_COLORS[type].dot}`} />
              <span className={`text-[10px] font-medium capitalize ${PERIOD_COLORS[type].text}`}>{type}</span>
            </div>
          ))}
        </div>
      )}

      {/* Selected day detail panel */}
      {selectedDay && (
        <div className="mt-4 bg-[#1a1a1e] rounded-2xl border border-[#333] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-white">
                {format(selectedDay, 'EEEE, MMMM d, yyyy')}
              </h4>
              {selectedNcaaPeriods.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  {selectedNcaaPeriods.map((p, i) => (
                    <span key={i} className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${PERIOD_COLORS[p.type].bg} ${PERIOD_COLORS[p.type].text} ${PERIOD_COLORS[p.type].border}`}>
                      {p.label}
                    </span>
                  ))}
                </div>
              )}
              {selectedNcaaPeriods.length > 0 && (
                <p className="text-xs text-gray-500 mt-1.5">{PERIOD_LABELS[selectedNcaaPeriods[0].type]}</p>
              )}
            </div>
            <button
              onClick={() => onDayClick(format(selectedDay, 'yyyy-MM-dd'))}
              className="flex items-center gap-1.5 bg-primary text-black font-bold px-3 py-2 rounded-xl text-xs hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add Event
            </button>
          </div>

          {selectedEvents.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No events on this day</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map(event => (
                <div key={event.id} className="flex items-center gap-3 bg-white/5 rounded-xl p-3 group hover:bg-white/[0.07] transition-colors">
                  <div className={`w-1 h-10 rounded-full flex-shrink-0 ${getEventChipColor(event.event_type).split(' ')[0]}`} />
                  <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0 ${getEventTypeColor(event.event_type)}`}>
                    <span className="material-symbols-outlined text-[18px]">{getEventTypeIcon(event.event_type)}</span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium truncate">{event.title}</div>
                    <div className="text-[11px] text-gray-500">
                      {getEventTypeLabel(event.event_type)}
                      {event.event_time && ` · ${formatTime12(event.event_time)}`}
                      {event.location && ` · ${event.location}`}
                    </div>
                    {event.description && (
                      <p className="text-[11px] text-gray-600 mt-0.5 truncate">{event.description}</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteEvent(event.id); }}
                    className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── List View ─────────────────────────────────────────────────
function EventRow({ event, onDelete }: { event: CalendarEvent; onDelete: (id: string) => void }) {
  const dateObj = parseISO(event.event_date);
  const ncaaPeriods = getPeriodsForDate(event.event_date);

  return (
    <div className="bg-surface-dark rounded-xl border border-[#333] hover:border-[#444] transition-colors p-5 flex items-start gap-4 group">
      {/* Date block */}
      <div className="flex-shrink-0 w-14 text-center">
        <div className={`text-[10px] font-bold uppercase ${event.priority === 'high' ? 'text-red-400' : 'text-gray-500'}`}>
          {format(dateObj, 'MMM')}
        </div>
        <div className="text-2xl font-bold text-white leading-tight">{format(dateObj, 'dd')}</div>
        <div className="text-[10px] text-gray-600">{format(dateObj, 'EEE')}</div>
      </div>

      {/* Color bar */}
      <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${getEventChipColor(event.event_type).split(' ')[0]}`} />

      {/* Event details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-white font-bold truncate">{event.title}</h3>
          {event.priority === 'high' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20 flex-shrink-0">
              High
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${getEventTypeColor(event.event_type)}`}>
            <span className="material-symbols-outlined text-[14px]">{getEventTypeIcon(event.event_type)}</span>
            {getEventTypeLabel(event.event_type)}
          </span>
          {event.event_time && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {formatTime12(event.event_time)}
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              {event.location}
            </span>
          )}
          {ncaaPeriods.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${PERIOD_COLORS[ncaaPeriods[0].type].bg} ${PERIOD_COLORS[ncaaPeriods[0].type].text} ${PERIOD_COLORS[ncaaPeriods[0].type].border}`}>
              NCAA {ncaaPeriods[0].type}
            </span>
          )}
        </div>
        {event.description && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{event.description}</p>
        )}
      </div>

      {/* Delete */}
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
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [modalOpen, setModalOpen] = useState(false);
  const [prefillDate, setPrefillDate] = useState<string | undefined>();
  const [showNcaaPeriods, setShowNcaaPeriods] = useState(true);

  const fetchEvents = useCallback(async () => {
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
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

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
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/athlete" className="text-gray-500 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </Link>
              <h1 className="text-2xl font-bold text-white">Recruiting Calendar</h1>
            </div>
            <p className="text-gray-500 text-sm ml-8">Visits, camps, combines, deadlines, and NCAA recruiting periods.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* NCAA toggle */}
            <button
              onClick={() => setShowNcaaPeriods(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                showNcaaPeriods
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-[#333] text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">shield</span>
              NCAA
            </button>
            {/* Add Event button */}
            <button
              onClick={() => { setPrefillDate(undefined); setModalOpen(true); }}
              className="flex items-center gap-2 bg-primary text-black font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Event
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Controls bar */}
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
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'list' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">list</span>
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'calendar' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">calendar_month</span>
              Calendar
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'calendar' ? (
          <BigCalendar
            allEvents={allEvents}
            onDayClick={openModalForDate}
            onDeleteEvent={handleDeleteEvent}
            showNcaaPeriods={showNcaaPeriods}
          />
        ) : (
          <>
            {displayEvents.length === 0 ? (
              <div className="bg-surface-dark rounded-xl border border-[#333] p-12 text-center">
                <span className="material-symbols-outlined text-[48px] text-white/10 mb-4">calendar_month</span>
                <h3 className="text-lg font-bold text-white mb-2">
                  {showPast ? 'No Past Events' : 'No Upcoming Events'}
                </h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
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

        {/* ─── NCAA Recruiting Periods Breakdown ──────────────── */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">shield</span>
                NCAA Recruiting Periods
              </h2>
              <p className="text-sm text-gray-500 mt-1">Know what coaches can and can&apos;t do during each period.</p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/api/athlete/calendar/pdf?division=FBS"
                download
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-[#333] text-gray-400 hover:text-white hover:border-primary/30 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                FBS PDF
              </a>
              <a
                href="/api/athlete/calendar/pdf?division=FCS"
                download
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-[#333] text-gray-400 hover:text-white hover:border-primary/30 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                FCS PDF
              </a>
            </div>
          </div>

          {/* Period Definitions Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['contact', 'evaluation', 'quiet', 'dead'] as PeriodType[]).map(type => {
              const def = PERIOD_DEFINITIONS[type];
              const colors = PERIOD_COLORS[type];
              return (
                <div key={type} className={`rounded-2xl border p-5 ${colors.bg} ${colors.border}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
                    <h3 className={`text-sm font-bold uppercase tracking-wider ${colors.text}`}>{def.title}</h3>
                  </div>
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">{def.definition}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-green-400 mb-1.5">You Can</div>
                      <ul className="space-y-1">
                        {def.canDo.map((item, i) => (
                          <li key={i} className="text-[11px] text-gray-300 flex items-start gap-1.5">
                            <span className="material-symbols-outlined text-green-400 text-[12px] mt-0.5 flex-shrink-0">check</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1.5">You Can&apos;t</div>
                      <ul className="space-y-1">
                        {def.cantDo.map((item, i) => (
                          <li key={i} className="text-[11px] text-gray-300 flex items-start gap-1.5">
                            <span className="material-symbols-outlined text-red-400 text-[12px] mt-0.5 flex-shrink-0">close</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Download PDFs */}
          <div className="flex flex-wrap gap-3">
            <a
              href="/api/athlete/calendar/pdf?division=FBS"
              download
              className="flex items-center gap-2 bg-white/5 border border-[#333] hover:border-primary/30 rounded-xl px-4 py-3 text-sm font-medium text-white hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
              <div>
                <div className="font-bold">FBS Recruiting Calendar</div>
                <div className="text-[10px] text-gray-500">D1 Bowl Subdivision • 2025-26</div>
              </div>
            </a>
            <a
              href="/api/athlete/calendar/pdf?division=FCS"
              download
              className="flex items-center gap-2 bg-white/5 border border-[#333] hover:border-primary/30 rounded-xl px-4 py-3 text-sm font-medium text-white hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
              <div>
                <div className="font-bold">FCS Recruiting Calendar</div>
                <div className="text-[10px] text-gray-500">D1 Championship Subdivision • 2025-26</div>
              </div>
            </a>
          </div>

          <p className="text-[10px] text-gray-600 text-center">
            Source: NCAA Division I Recruiting Calendars 2025-26. Always verify current rules at <a href="https://www.ncaa.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ncaa.org</a>.
          </p>
        </section>
      </div>

      <AddEventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddEvent}
        prefillDate={prefillDate}
      />
    </div>
  );
}
