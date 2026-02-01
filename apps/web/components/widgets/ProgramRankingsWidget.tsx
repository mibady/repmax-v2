'use client';

import Link from 'next/link';

interface Program {
  name: string;
  state: string;
  record: string;
  d1Count: number;
}

interface ProgramRankingsWidgetProps {
  zone?: string;
  programs?: Program[];
  zoneColor?: 'orange' | 'red' | 'blue' | 'green' | 'purple';
}

const defaultPrograms: Program[] = [
  { name: 'North Shore', state: 'TX', record: '15-1', d1Count: 162 },
  { name: 'Duncanville', state: 'TX', record: '14-1', d1Count: 145 },
  { name: 'Westlake', state: 'TX', record: '13-1', d1Count: 98 },
  { name: 'Bishop Gorman', state: 'NV', record: '12-0', d1Count: 110 },
];

export default function ProgramRankingsWidget({
  zone = 'Southwest',
  programs = defaultPrograms,
  zoneColor = 'orange',
}: ProgramRankingsWidgetProps) {
  const colorClasses = {
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
  };

  const pingColorClasses = {
    orange: 'bg-orange-400',
    red: 'bg-red-400',
    blue: 'bg-blue-400',
    green: 'bg-green-400',
    purple: 'bg-purple-400',
  };

  return (
    <div className="w-full max-w-[400px] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <h2 className="text-white text-lg font-bold leading-tight tracking-tight">
            🏫 Top Programs — {zone}
          </h2>
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pingColorClasses[zoneColor]} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colorClasses[zoneColor]}`}></span>
          </span>
        </div>
      </div>

      {/* Ranking List */}
      <div className="flex flex-col gap-3">
        {programs.map((program, idx) => (
          <Link
            key={idx}
            className="group flex items-center gap-4 bg-[#1A1A1A] hover:bg-[#252525] border border-transparent hover:border-primary/30 transition-all duration-200 rounded-lg p-4"
            href="#"
          >
            <div className="flex flex-col items-center justify-center w-8 shrink-0">
              <span className="text-primary font-mono text-xl font-bold">#{idx + 1}</span>
            </div>
            <div className="flex flex-col flex-1 gap-1">
              <div className="flex items-baseline gap-2">
                <span className="text-white font-bold text-base">{program.name}</span>
                <span className="text-xs font-bold bg-white/10 text-white/70 px-1.5 py-0.5 rounded">
                  {program.state}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-green-400 font-mono font-medium">{program.record}</span>
                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                <span className="text-primary font-mono font-medium">{program.d1Count} D1</span>
              </div>
            </div>
            <div className="shrink-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform duration-200">
                arrow_forward
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-end pt-2">
        <Link
          className="group flex items-center gap-1 text-sm font-medium text-primary hover:text-white transition-colors"
          href="#"
        >
          View all zone programs
          <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
            arrow_right_alt
          </span>
        </Link>
      </div>
    </div>
  );
}
