'use client';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  location?: string | null;
}

interface CoachCalendarSidebarProps {
  events: CalendarEvent[];
}

function getShortMonth(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short' });
}

function getDayNumber(dateStr: string): number {
  return new Date(dateStr).getDate();
}

function getCountdown(dateStr: string): string {
  const now = new Date();
  const eventDate = new Date(dateStr);
  const diffMs = eventDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return `In ${diffDays} days`;
}

function isSigningPeriod(type: string): boolean {
  return type.toLowerCase().includes('signing');
}

export default function CoachCalendarSidebar({
  events,
}: CoachCalendarSidebarProps) {
  const displayEvents = events.slice(0, 5);

  return (
    <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-slate-400 text-lg">
          calendar_today
        </span>
        <h3 className="text-white font-semibold text-sm">
          Recruiting Calendar
        </h3>
      </div>

      {/* Events List */}
      <div className="space-y-2">
        {displayEvents.map((event) => {
          const signing = isSigningPeriod(event.type);

          return (
            <div
              key={event.id}
              className={`flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors ${
                signing ? 'border-l-2 border-red-500' : ''
              }`}
            >
              {/* Date Badge */}
              <div
                className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0 ${
                  signing
                    ? 'bg-red-500/15 text-red-400'
                    : 'bg-white/5 text-white'
                }`}
              >
                <span className="text-sm font-bold leading-none">
                  {getDayNumber(event.date)}
                </span>
                <span className="text-[9px] uppercase text-slate-400 leading-none mt-0.5">
                  {getShortMonth(event.date)}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs font-medium truncate ${
                    signing ? 'text-red-400' : 'text-white'
                  }`}
                >
                  {event.title}
                </p>
                {event.location && (
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {event.location}
                  </p>
                )}
                <p
                  className={`text-[10px] mt-0.5 ${
                    signing ? 'text-red-400/70' : 'text-slate-500'
                  }`}
                >
                  {getCountdown(event.date)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* View Calendar Link */}
      <button className="block w-full text-center text-xs text-primary hover:text-primary/80 mt-3 transition-colors">
        View Calendar
      </button>
    </div>
  );
}
