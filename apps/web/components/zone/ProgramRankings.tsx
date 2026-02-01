"use client";

interface Program {
  name: string;
  state: string;
  zone: string;
  topProspects: number;
  fiveStars: number;
  fourStars: number;
  recentCommits: number;
}

interface ProgramRankingsProps {
  programs: Program[];
  title?: string;
  showZone?: boolean;
  limit?: number;
  onProgramClick?: (program: Program) => void;
}

export function ProgramRankings({
  programs,
  title = "Top High School Programs",
  showZone = true,
  limit = 10,
  onProgramClick,
}: ProgramRankingsProps) {
  const displayPrograms = programs.slice(0, limit);

  return (
    <div className="rounded-xl bg-surface-dark border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-rounded text-primary">school</span>
          <h3 className="text-sm font-bold text-white">{title}</h3>
        </div>
        <span className="text-xs text-text-grey">{programs.length} Programs</span>
      </div>

      {/* Table Header */}
      <div className="px-4 py-2 bg-white/5 border-b border-white/5 grid grid-cols-12 gap-2 text-xs text-text-grey uppercase tracking-wider">
        <div className="col-span-1">#</div>
        <div className="col-span-4">Program</div>
        {showZone && <div className="col-span-2">Zone</div>}
        <div className={showZone ? "col-span-2 text-center" : "col-span-3 text-center"}>
          5★
        </div>
        <div className={showZone ? "col-span-2 text-center" : "col-span-2 text-center"}>
          4★
        </div>
        <div className="col-span-1 text-center">Total</div>
      </div>

      {/* Rankings List */}
      <div className="divide-y divide-white/5">
        {displayPrograms.map((program, idx) => (
          <button
            key={program.name}
            onClick={() => onProgramClick?.(program)}
            className="w-full px-4 py-3 grid grid-cols-12 gap-2 items-center hover:bg-white/5 transition-colors text-left"
          >
            {/* Rank */}
            <div className="col-span-1">
              <span
                className={`text-sm font-bold ${
                  idx < 3 ? "text-primary" : "text-text-grey"
                }`}
              >
                {idx + 1}
              </span>
            </div>

            {/* Program Name */}
            <div className="col-span-4">
              <p className="text-sm font-medium text-white truncate">{program.name}</p>
              <p className="text-xs text-text-grey">{program.state}</p>
            </div>

            {/* Zone */}
            {showZone && (
              <div className="col-span-2">
                <span className="px-2 py-1 rounded text-xs bg-white/10 text-white">
                  {program.zone}
                </span>
              </div>
            )}

            {/* 5-Star Count */}
            <div className={showZone ? "col-span-2 text-center" : "col-span-3 text-center"}>
              <span className="text-sm font-bold text-primary">
                {program.fiveStars}
              </span>
            </div>

            {/* 4-Star Count */}
            <div className={showZone ? "col-span-2 text-center" : "col-span-2 text-center"}>
              <span className="text-sm text-white">{program.fourStars}</span>
            </div>

            {/* Total */}
            <div className="col-span-1 text-center">
              <span className="text-sm text-text-grey">{program.topProspects}</span>
            </div>
          </button>
        ))}
      </div>

      {/* View All */}
      {programs.length > limit && (
        <div className="p-3 border-t border-white/10">
          <button className="w-full py-2 text-sm text-primary hover:text-primary-hover transition-colors">
            View All {programs.length} Programs →
          </button>
        </div>
      )}
    </div>
  );
}
