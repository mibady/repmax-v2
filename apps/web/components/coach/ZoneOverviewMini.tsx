'use client';

interface ZoneOverviewMiniProps {
  zone: string;
  activeRecruits: number;
  offersTotal: number;
}

export default function ZoneOverviewMini({
  zone,
  activeRecruits,
  offersTotal,
}: ZoneOverviewMiniProps) {
  return (
    <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-slate-400 text-lg">
          map
        </span>
        <h3 className="text-white font-semibold text-sm">Zone Overview</h3>
      </div>

      {/* Zone Badge */}
      <div className="mb-3">
        <span className="inline-block bg-primary/15 text-primary text-xs font-medium px-3 py-1 rounded-full">
          {zone}
        </span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white">{activeRecruits}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
            Active Recruits
          </p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white">{offersTotal}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
            Total Offers
          </p>
        </div>
      </div>

      {/* Decorative State Dots */}
      <div className="relative h-12 rounded-lg bg-white/[0.02] overflow-hidden">
        <div className="absolute w-2 h-2 rounded-full bg-primary/40 top-2 left-4" />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-primary/30 top-6 left-10" />
        <div className="absolute w-2.5 h-2.5 rounded-full bg-primary/50 top-3 left-[40%]" />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-primary/25 top-7 left-[55%]" />
        <div className="absolute w-2 h-2 rounded-full bg-primary/35 top-2 left-[70%]" />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-primary/20 top-5 left-[85%]" />
        <div className="absolute w-2 h-2 rounded-full bg-primary/45 top-8 left-[30%]" />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-primary/30 top-4 left-[90%]" />
      </div>
    </div>
  );
}
