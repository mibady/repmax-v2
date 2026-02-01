"use client";

interface ClassRanking {
  team: string;
  total_commits: number;
  avg_rating: string;
  five_stars: number;
  four_stars: number;
  three_stars: number;
}

interface ClassRankingsProps {
  rankings: ClassRanking[];
  title?: string;
  classYear?: number;
  limit?: number;
  onTeamClick?: (team: ClassRanking) => void;
}

export function ClassRankings({
  rankings,
  title = "Recruiting Class Rankings",
  classYear = 2026,
  limit = 10,
  onTeamClick,
}: ClassRankingsProps) {
  const displayRankings = rankings.slice(0, limit);

  return (
    <div className="rounded-xl bg-surface-dark border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-rounded text-primary">leaderboard</span>
          <h3 className="text-sm font-bold text-white">{title}</h3>
        </div>
        <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold">
          Class of {classYear}
        </span>
      </div>

      {/* Table Header */}
      <div className="px-4 py-2 bg-white/5 border-b border-white/5 grid grid-cols-12 gap-2 text-xs text-text-grey uppercase tracking-wider">
        <div className="col-span-1">#</div>
        <div className="col-span-4">School</div>
        <div className="col-span-2 text-center">Commits</div>
        <div className="col-span-2 text-center">Avg</div>
        <div className="col-span-3 text-center">Stars</div>
      </div>

      {/* Rankings List */}
      <div className="divide-y divide-white/5">
        {displayRankings.map((team, idx) => (
          <button
            key={team.team}
            onClick={() => onTeamClick?.(team)}
            className="w-full px-4 py-3 grid grid-cols-12 gap-2 items-center hover:bg-white/5 transition-colors text-left"
          >
            {/* Rank */}
            <div className="col-span-1">
              <span
                className={`text-sm font-bold ${
                  idx === 0
                    ? "text-yellow-500"
                    : idx === 1
                    ? "text-gray-400"
                    : idx === 2
                    ? "text-amber-600"
                    : "text-text-grey"
                }`}
              >
                {idx + 1}
              </span>
            </div>

            {/* Team Name */}
            <div className="col-span-4">
              <p className="text-sm font-medium text-white truncate">{team.team}</p>
            </div>

            {/* Total Commits */}
            <div className="col-span-2 text-center">
              <span className="text-sm font-bold text-white">{team.total_commits}</span>
            </div>

            {/* Average Rating */}
            <div className="col-span-2 text-center">
              <span className="text-sm text-primary font-medium">
                {parseFloat(team.avg_rating).toFixed(1)}
              </span>
            </div>

            {/* Star Breakdown */}
            <div className="col-span-3 flex items-center justify-center gap-1">
              {team.five_stars > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-xs font-bold">
                  {team.five_stars}★5
                </span>
              )}
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-white text-xs">
                {team.four_stars}★4
              </span>
              <span className="px-1.5 py-0.5 rounded bg-white/5 text-text-grey text-xs">
                {team.three_stars}★3
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* View All */}
      {rankings.length > limit && (
        <div className="p-3 border-t border-white/10">
          <button className="w-full py-2 text-sm text-primary hover:text-primary-hover transition-colors">
            View Full Rankings →
          </button>
        </div>
      )}
    </div>
  );
}
