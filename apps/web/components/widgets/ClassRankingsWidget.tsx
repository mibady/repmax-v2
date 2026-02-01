'use client';

import Link from 'next/link';

interface ClassRanking {
  rank: number;
  school: string;
  logoGradient: string;
  commits: number;
  stars: { count: number; rating: number }[];
  isHighlighted?: boolean;
}

interface ClassRankingsWidgetProps {
  classYear?: number;
  rankings?: ClassRanking[];
}

const defaultRankings: ClassRanking[] = [
  {
    rank: 1,
    school: 'Texas A&M',
    logoGradient: 'from-red-800 to-red-600',
    commits: 24,
    stars: [
      { count: 1, rating: 5 },
      { count: 14, rating: 4 },
    ],
    isHighlighted: true,
  },
  {
    rank: 2,
    school: 'Kentucky',
    logoGradient: 'from-blue-600 to-blue-800',
    commits: 18,
    stars: [{ count: 6, rating: 4 }],
  },
  {
    rank: 3,
    school: 'Indiana',
    logoGradient: 'from-red-700 to-red-900',
    commits: 16,
    stars: [{ count: 4, rating: 4 }],
  },
  {
    rank: 4,
    school: 'Baylor',
    logoGradient: 'from-green-700 to-green-900',
    commits: 15,
    stars: [{ count: 3, rating: 4 }],
  },
  {
    rank: 5,
    school: 'Arizona',
    logoGradient: 'from-blue-700 to-red-700',
    commits: 14,
    stars: [{ count: 2, rating: 4 }],
  },
];

export default function ClassRankingsWidget({
  classYear = 2026,
  rankings = defaultRankings,
}: ClassRankingsWidgetProps) {
  return (
    <div className="w-full max-w-[450px] bg-background-dark border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 bg-surface-dark/50 backdrop-blur-sm">
        <h3 className="text-white text-lg font-bold leading-tight tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">school</span>
          {classYear} Class Rankings
        </h3>
      </div>

      {/* Table Container */}
      <div className="flex-1 w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="py-3 pl-5 pr-2 text-xs font-medium uppercase tracking-wider text-white/40 w-[10%]">
                Rank
              </th>
              <th className="py-3 px-2 text-xs font-medium uppercase tracking-wider text-white/40 w-[40%]">
                School
              </th>
              <th className="py-3 px-2 text-xs font-medium uppercase tracking-wider text-white/40 text-center w-[15%]">
                Commits
              </th>
              <th className="py-3 pl-2 pr-5 text-xs font-medium uppercase tracking-wider text-white/40 w-[35%] text-right">
                Stars
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {rankings.map((ranking) => (
              <tr
                key={ranking.rank}
                className={`transition-colors ${
                  ranking.isHighlighted
                    ? 'bg-primary/5 hover:bg-primary/10 relative group'
                    : 'hover:bg-white/[0.02]'
                }`}
              >
                <td className="py-3 pl-5 pr-2 font-medium relative">
                  {ranking.isHighlighted && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary"></div>
                  )}
                  <span
                    className={`font-mono ${
                      ranking.isHighlighted ? 'text-primary' : 'text-white/50'
                    }`}
                  >
                    #{ranking.rank}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <div
                      aria-hidden="true"
                      className="w-5 h-5 rounded-full bg-white/10 flex-shrink-0 overflow-hidden"
                    >
                      <div
                        className={`w-full h-full bg-gradient-to-br ${ranking.logoGradient}`}
                      ></div>
                    </div>
                    <span
                      className={`truncate max-w-[100px] ${
                        ranking.isHighlighted ? 'font-semibold text-white' : 'text-white/90'
                      }`}
                    >
                      {ranking.school}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-2 text-center">
                  <span
                    className={`font-mono ${
                      ranking.isHighlighted ? 'text-white/80' : 'text-white/60'
                    }`}
                  >
                    {ranking.commits}
                  </span>
                </td>
                <td className="py-3 pl-2 pr-5">
                  <div className="flex flex-col items-end gap-1.5">
                    {ranking.stars.map((star, idx) => (
                      <div
                        key={idx}
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          star.rating === 5
                            ? 'bg-primary/20 border border-primary/20 text-primary shadow-sm shadow-primary/5'
                            : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                        }`}
                      >
                        <span className="font-mono">{star.count}</span>
                        <span className="text-[9px]">✕</span>
                        <span>{star.rating}★</span>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/5 bg-surface-dark/30 flex justify-center">
        <Link
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          href="/rankings"
        >
          View full rankings
          <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
            arrow_forward
          </span>
        </Link>
      </div>
    </div>
  );
}
