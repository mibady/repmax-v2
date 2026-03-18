'use client';

import Link from 'next/link';
import type { SchoolInterest } from '@/lib/hooks';

interface SchoolInterestTrackerProps {
  schools: SchoolInterest[];
}

const STATUS_DOT: Record<string, string> = {
  Offered: 'bg-green-400',
  'In Contact': 'bg-blue-400',
  Evaluating: 'bg-yellow-400',
  Following: 'bg-slate-400',
};

export function SchoolInterestTracker({ schools }: SchoolInterestTrackerProps) {
  return (
    <div className="bg-[#1F1F22] rounded-xl border border-white/5">
      <div className="p-5 border-b border-white/5 flex justify-between items-center">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">school</span>
          School Interest Tracker
        </h3>
        <Link href="/parent/schools" className="text-xs font-semibold text-primary hover:text-primary/80">
          View All
        </Link>
      </div>
      <div className="divide-y divide-white/5">
        {schools.length === 0 ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-slate-600 text-4xl mb-2">school</span>
            <p className="text-slate-500 text-sm">No schools tracking yet</p>
          </div>
        ) : (
          schools.map((school) => (
            <div key={school.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[20px]">sports_football</span>
                </div>
                <span className="text-sm font-medium text-white">{school.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${STATUS_DOT[school.status] || 'bg-slate-400'}`} />
                <span className={`text-xs font-bold px-2 py-1 rounded ${school.statusColor}`}>
                  {school.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
