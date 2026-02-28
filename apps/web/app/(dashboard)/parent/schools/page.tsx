'use client';

import Link from 'next/link';
import { useParentDashboard } from '@/lib/hooks';

export default function ParentSchoolsPage() {
  const { schools, isLoading, error } = useParentDashboard();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading schools...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load schools</h3>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Back Link */}
        <Link href="/parent" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl font-bold text-white">College Interest</h1>
          <span className="text-sm font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
            {schools.length}
          </span>
        </div>

        {/* School List */}
        {schools.length === 0 ? (
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-12 text-center">
            <span className="material-symbols-outlined text-slate-600 text-5xl mb-3">school</span>
            <h3 className="text-white font-semibold mb-1">No schools tracking yet</h3>
            <p className="text-slate-500 text-sm">Schools showing interest will appear here.</p>
          </div>
        ) : (
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 divide-y divide-white/5">
            {schools.map((school, index) => (
              <div key={school.id || index} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[20px]">sports_football</span>
                  </div>
                  <span className="text-sm font-medium text-white">{school.name}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${school.statusColor}`}>
                  {school.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
