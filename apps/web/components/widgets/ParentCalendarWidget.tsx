'use client';

interface CalendarEvent {
  icon: string;
  title: string;
  date: string;
  day: number;
  explanation: string;
}

interface ParentCalendarWidgetProps {
  month?: string;
  year?: number;
  events?: CalendarEvent[];
  highlightedDays?: number[];
  startOffset?: number;
  daysInMonth?: number;
}

const defaultEvents: CalendarEvent[] = [
  {
    icon: 'sync_alt',
    title: 'Transfer Portal Opens',
    date: 'Dec 4th',
    day: 4,
    explanation: 'College athletes can transfer schools starting today. This often frees up scholarship spots unexpectedly for high school recruits.',
  },
  {
    icon: 'ink_pen',
    title: 'National Signing Day',
    date: 'Dec 20th',
    day: 20,
    explanation: 'This is the early period when high school seniors officially commit to colleges. A signed National Letter of Intent (NLI) ends the recruiting process.',
  },
];

const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function ParentCalendarWidget({
  month = 'December',
  year = 2023,
  events = defaultEvents,
  highlightedDays = [4, 20],
  startOffset = 3, // Days to skip for first week (0 = Sunday)
  daysInMonth = 31,
}: ParentCalendarWidgetProps) {
  const renderCalendarDays = () => {
    const days = [];

    // Empty cells for offset
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-full"></div>);
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const isHighlighted = highlightedDays.includes(day);

      if (isHighlighted) {
        days.push(
          <button key={day} className="h-10 w-full flex items-center justify-center">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary text-[#232010] font-bold shadow-lg shadow-primary/20">
              {day}
            </div>
          </button>
        );
      } else {
        days.push(
          <button key={day} className="h-10 w-full text-white/60 text-sm font-medium hover:text-white transition-colors">
            {day}
          </button>
        );
      }
    }

    return days;
  };

  return (
    <div className="w-full max-w-5xl bg-[#2a2614] dark:bg-[#1C1A0D] rounded-xl border border-white/5 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-5 flex items-center justify-between">
        <div>
          <h3 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">Recruiting Timeline</h3>
          <p className="text-[#cbc290] text-sm mt-1">Key dates and educational context for the current cycle.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-primary"></span>
          <span className="text-xs text-white/60 font-medium uppercase tracking-wider">Live Updates</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Left Column: Visual Calendar */}
        <div className="lg:w-5/12 border-b lg:border-b-0 lg:border-r border-white/5 p-6 bg-[#232010]">
          <div className="flex flex-col gap-4">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between px-2 mb-2">
              <button className="hover:bg-white/5 p-2 rounded-full transition-colors">
                <span className="material-symbols-outlined text-white">chevron_left</span>
              </button>
              <p className="text-white text-lg font-bold leading-tight">{month} {year}</p>
              <button className="hover:bg-white/5 p-2 rounded-full transition-colors">
                <span className="material-symbols-outlined text-white">chevron_right</span>
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 mb-2">
              {daysOfWeek.map((day, idx) => (
                <p key={idx} className="text-[#cbc290] text-[11px] font-bold uppercase tracking-wider text-center">
                  {day}
                </p>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-y-2">
              {renderCalendarDays()}
            </div>
          </div>
        </div>

        {/* Right Column: Explainer List */}
        <div className="lg:w-7/12 p-6 flex flex-col gap-6">
          {events.map((event, idx) => (
            <div key={idx} className="group">
              <div className="flex gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#494322] text-white">
                    <span className="material-symbols-outlined text-[24px]">{event.icon}</span>
                  </div>
                </div>
                {/* Content */}
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between items-start">
                    <h4 className="text-white text-base font-semibold leading-normal">{event.title}</h4>
                    <span className="text-primary font-bold text-sm bg-primary/10 px-2 py-1 rounded">{event.date}</span>
                  </div>
                  {/* Explainer Box */}
                  <div className="mt-3 rounded-lg border border-blue-500/40 bg-[#1A1A1A] p-3 shadow-sm">
                    <div className="flex gap-3 items-start">
                      <span className="material-symbols-outlined text-blue-400 text-[18px] mt-0.5 shrink-0">info</span>
                      <p className="text-[11px] leading-relaxed text-gray-300 font-normal">
                        {event.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Meta / Footer of Widget */}
          <div className="mt-auto pt-4 border-t border-white/5">
            <div className="flex gap-2 items-center text-[#cbc290]/80">
              <span className="material-symbols-outlined text-[16px]">school</span>
              <p className="text-xs font-normal">Educational notes are highlighted in blue outlines.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
