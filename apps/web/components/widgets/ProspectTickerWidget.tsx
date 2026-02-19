'use client';

import Link from 'next/link';

interface Prospect {
  name: string;
  position: string;
  school: string;
  stars: number;
}

interface ProspectTickerWidgetProps {
  zone?: string;
  prospects?: Prospect[];
  totalCount?: number;
  zoneColor?: 'purple' | 'red' | 'blue' | 'green' | 'orange';
}

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-0.5 text-primary">
      {[...Array(stars)].map((_, i) => (
        <span
          key={i}
          className="material-symbols-outlined text-[14px] leading-none"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          star
        </span>
      ))}
    </div>
  );
}

export default function ProspectTickerWidget({
  zone = 'West',
  prospects = [],
  totalCount = 81,
  zoneColor = 'purple',
}: ProspectTickerWidgetProps) {
  const colorClasses = {
    purple: 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]',
    red: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]',
    blue: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]',
    green: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]',
    orange: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]',
  };

  return (
    <div className="w-full max-w-[400px] flex flex-col gap-4">
      {/* Widget Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <h2 className="text-white text-lg font-bold tracking-tight">Top Uncommitted — {zone}</h2>
          <div className={`h-2 w-2 rounded-full ${colorClasses[zoneColor]}`}></div>
        </div>
      </div>

      {/* List Container */}
      <div className="flex flex-col gap-2">
        {prospects.map((prospect, idx) => (
          <div
            key={idx}
            className="group relative flex items-center justify-between bg-[#1A1A1A] hover:bg-[#252525] transition-colors duration-200 rounded-lg p-3 cursor-pointer border border-transparent hover:border-primary/20"
          >
            <div className="flex flex-col gap-1.5 overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-sm truncate">{prospect.name}</span>
                <span className="bg-[#4c1d95]/40 text-[#d8b4fe] text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-[#6b21a8]/50">
                  {prospect.position}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400 truncate max-w-[140px]">{prospect.school}</span>
                <StarRating stars={prospect.stars} />
              </div>
            </div>
            <div className="shrink-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform duration-200">
                chevron_right
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-2 px-1">
        <Link
          className="group flex items-center gap-1.5 text-sm font-medium text-primary hover:text-white transition-colors"
          href="/recruiter/prospects"
        >
          <span>View all {totalCount} zone prospects</span>
          <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
            arrow_right_alt
          </span>
        </Link>
      </div>
    </div>
  );
}
