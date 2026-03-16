'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCoachDashboard } from '@/lib/hooks';
import AthleteCard from '@/components/coach/AthleteCard';

type FilterKey = 'all' | 'recruiting_ready' | 'needs_film' | 'academic_risk';

export default function CoachRecruitsPage() {
  const router = useRouter();
  const { team, roster, isLoading, error } = useCoachDashboard();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  // Recruitable athletes: have offers, are committed, or are actively being tracked
  const recruits = useMemo(
    () => roster.filter((a) => a.offers > 0 || a.status === 'committed' || a.status === 'active'),
    [roster]
  );

  const filteredRecruits = useMemo(() => {
    switch (activeFilter) {
      case 'recruiting_ready':
        return recruits.filter((a) => a.status === 'active' && a.offers > 0 && a.gpa != null && a.gpa >= 2.5);
      case 'needs_film':
        return recruits.filter((a) => a.status === 'active' && a.offers === 0);
      case 'academic_risk':
        return recruits.filter((a) => a.gpa != null && a.gpa < 2.5);
      default:
        return [...recruits].sort((a, b) => b.offers - a.offers || a.name.localeCompare(b.name));
    }
  }, [recruits, activeFilter]);

  const filters: { key: FilterKey; label: string; count: number }[] = [
    { key: 'all', label: 'All Recruits', count: recruits.length },
    { key: 'recruiting_ready', label: 'Recruiting Ready', count: recruits.filter((a) => a.status === 'active' && a.offers > 0 && a.gpa != null && a.gpa >= 2.5).length },
    { key: 'needs_film', label: 'Needs Film Update', count: recruits.filter((a) => a.status === 'active' && a.offers === 0).length },
    { key: 'academic_risk', label: 'Academic Risk', count: recruits.filter((a) => a.gpa != null && a.gpa < 2.5).length },
  ];

  // Redirect to setup if no team
  if (!isLoading && !team) {
    router.push('/coach/setup');
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading recruits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load recruits</h3>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Recruits</h1>
            <p className="text-sm text-white/40 mt-1">Athletes being actively tracked for college recruiting</p>
          </div>
          <Link
            href="/coach/roster"
            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            View Full Roster →
          </Link>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeFilter === f.key
                  ? 'bg-primary text-black'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
              }`}
            >
              {f.label}
              <span className={`ml-1.5 ${activeFilter === f.key ? 'text-black/60' : 'text-white/30'}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Athlete grid */}
        {filteredRecruits.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredRecruits.map((athlete) => (
              <AthleteCard key={athlete.id} athlete={athlete} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-white/30 text-sm">
            {recruits.length === 0
              ? 'No recruitable athletes yet. Add athletes to your roster to get started.'
              : 'No athletes match this filter'}
          </div>
        )}
      </div>
    </div>
  );
}
