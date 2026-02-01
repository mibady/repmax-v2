"use client";

interface KeyDate {
  date: string;
  event: string;
}

interface CalendarData {
  currentPeriod: string;
  portalWindowOpen: boolean;
  portalWindowStart?: string;
  portalWindowEnd?: string;
  nextSigningDate?: string;
  daysUntilSigning: number;
  keyDates: KeyDate[];
}

interface CalendarWidgetProps {
  data: CalendarData;
  variant?: "standard" | "parent";
}

// Parent-friendly explanations for recruiting terms
const parentExplanations: Record<string, string> = {
  "Transfer Portal Window":
    "This is when college athletes can officially enter the transfer portal to explore moving to different schools.",
  "Portal Window Closes":
    "After this date, athletes cannot enter the transfer portal until the next window opens.",
  "National Signing Day":
    "This is when high school seniors can officially sign their National Letter of Intent to commit to a college.",
  "Spring Portal Window Opens":
    "A second opportunity for college athletes to enter the transfer portal opens in spring.",
  "Early Signing Period":
    "High school seniors can sign their letter of intent early, before the traditional February signing day.",
  "Dead Period":
    "Coaches cannot have any in-person contact with recruits during this time. Focus on academics!",
  "Quiet Period":
    "Coaches can meet with recruits only on campus. No off-campus visits allowed.",
  "Contact Period":
    "Coaches can visit recruits anywhere and communicate freely.",
  "Evaluation Period":
    "Coaches can watch recruits compete but cannot have direct contact off campus.",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getDaysUntil(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getParentExplanation(event: string): string {
  return parentExplanations[event] || "An important date in the recruiting calendar.";
}

export function CalendarWidget({ data, variant = "standard" }: CalendarWidgetProps) {
  const isParentView = variant === "parent";

  return (
    <div className="rounded-xl bg-surface-dark border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-primary">calendar_month</span>
            <h3 className="text-lg font-bold text-white">Recruiting Calendar</h3>
          </div>
          {isParentView && (
            <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
              Parent View
            </span>
          )}
        </div>
      </div>

      {/* Current Period Banner */}
      <div className={`p-4 ${data.portalWindowOpen ? "bg-primary/10" : "bg-white/5"}`}>
        <div className="flex items-center gap-3">
          {data.portalWindowOpen && (
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          )}
          <div className="flex-1">
            <p className="text-sm font-bold text-white">{data.currentPeriod}</p>
            {isParentView && (
              <p className="text-xs text-text-grey mt-1">
                {getParentExplanation(data.currentPeriod)}
              </p>
            )}
            {data.portalWindowStart && data.portalWindowEnd && (
              <p className="text-xs text-text-grey mt-1">
                {formatDateShort(data.portalWindowStart)} - {formatDateShort(data.portalWindowEnd)}
              </p>
            )}
          </div>
          {data.portalWindowOpen && (
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase">
              Active
            </span>
          )}
        </div>
      </div>

      {/* Countdown to Next Signing */}
      {data.nextSigningDate && (
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-grey uppercase tracking-wider">
                {isParentView ? "Days Until Signing Day" : "Next Signing Day"}
              </p>
              <p className="text-sm text-white mt-1">{formatDate(data.nextSigningDate)}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">
                {data.daysUntilSigning <= 0 ? "Today!" : data.daysUntilSigning}
              </p>
              {data.daysUntilSigning > 0 && (
                <p className="text-xs text-text-grey">days</p>
              )}
            </div>
          </div>
          {isParentView && (
            <p className="text-xs text-text-grey mt-3 p-3 bg-white/5 rounded-lg">
              {getParentExplanation("National Signing Day")}
            </p>
          )}
        </div>
      )}

      {/* Key Dates */}
      <div className="p-4">
        <p className="text-xs text-text-grey uppercase tracking-wider mb-3">
          {isParentView ? "Upcoming Important Dates" : "Key Dates"}
        </p>
        <div className="space-y-3">
          {data.keyDates.map((item, idx) => {
            const daysUntil = getDaysUntil(item.date);
            const isPast = daysUntil < 0;
            const isSoon = daysUntil >= 0 && daysUntil <= 7;

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  isPast ? "bg-white/5 opacity-50" : isSoon ? "bg-primary/10" : "bg-white/5"
                }`}
              >
                <div className="text-center min-w-[50px]">
                  <p className="text-lg font-bold text-white">
                    {new Date(item.date).getDate()}
                  </p>
                  <p className="text-xs text-text-grey uppercase">
                    {new Date(item.date).toLocaleDateString("en-US", { month: "short" })}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{item.event}</p>
                  {isParentView && (
                    <p className="text-xs text-text-grey mt-1">
                      {getParentExplanation(item.event)}
                    </p>
                  )}
                  {!isPast && (
                    <p className="text-xs text-text-grey mt-1">
                      {daysUntil === 0
                        ? "Today"
                        : daysUntil === 1
                        ? "Tomorrow"
                        : `In ${daysUntil} days`}
                    </p>
                  )}
                </div>
                {isSoon && !isPast && (
                  <span className="material-symbols-rounded text-primary">
                    priority_high
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
