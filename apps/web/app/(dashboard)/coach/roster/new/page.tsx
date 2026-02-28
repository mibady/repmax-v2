'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useAthletes } from '@/lib/hooks';

export default function CoachRosterNewPage(): React.JSX.Element {
  const [filterPosition, setFilterPosition] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; type: 'success' | 'error'; message: string } | null>(null);

  const { athletes, isLoading, error } = useAthletes({
    position: filterPosition || undefined,
    class_year: filterClass ? Number(filterClass) : undefined,
    limit: 50,
  });

  const filteredAthletes = useMemo(() => {
    if (!searchQuery.trim()) return athletes;
    const q = searchQuery.toLowerCase();
    return athletes.filter((a) =>
      a.profile?.full_name?.toLowerCase().includes(q) ||
      a.primary_position?.toLowerCase().includes(q)
    );
  }, [athletes, searchQuery]);

  const handleAddToRoster = async (athleteId: string): Promise<void> => {
    setAddingId(athleteId);
    setFeedback(null);

    try {
      const res = await fetch('/api/coach/roster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ athlete_id: athleteId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add athlete');
      }

      setFeedback({ id: athleteId, type: 'success', message: 'Added to roster' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({
        id: athleteId,
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to add',
      });
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setAddingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading athletes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load athletes</h3>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/coach/roster" className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-4 transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Roster
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">Add Athlete to Roster</h1>
          <p className="text-slate-400">Search the athlete database and add to your roster</p>
        </div>

        {/* Search + Filters */}
        <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <span className="material-symbols-outlined text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-[20px]">search</span>
              <input
                type="text"
                placeholder="Search by name or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#2A2A2E] text-white text-sm rounded-lg pl-10 pr-3 py-2 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-500"
              />
            </div>
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="bg-[#2A2A2E] text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">All Positions</option>
              <option value="QB">QB</option>
              <option value="RB">RB</option>
              <option value="WR">WR</option>
              <option value="LB">LB</option>
              <option value="CB">CB</option>
              <option value="DE">DE</option>
              <option value="DT">DT</option>
              <option value="OL">OL</option>
              <option value="S">S</option>
              <option value="TE">TE</option>
            </select>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="bg-[#2A2A2E] text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">All Classes</option>
              <option value="2026">Class of 2026</option>
              <option value="2027">Class of 2027</option>
              <option value="2028">Class of 2028</option>
            </select>
          </div>
        </div>

        {/* Results Grid */}
        {filteredAthletes.length === 0 ? (
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-12 text-center">
            <span className="material-symbols-outlined text-slate-600 text-4xl mb-3">person_search</span>
            <h3 className="text-white font-semibold mb-1">No athletes found</h3>
            <p className="text-slate-400 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAthletes.map((athlete) => {
              const name = athlete.profile?.full_name || 'Unknown';
              const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2);
              const isAdding = addingId === athlete.id;
              const athleteFeedback = feedback?.id === athlete.id ? feedback : null;

              return (
                <div key={athlete.id} className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="size-12 rounded-full bg-[#2A2A2E] flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold text-sm truncate">{name}</h3>
                      <p className="text-slate-400 text-xs">
                        {athlete.primary_position || 'N/A'} &middot; Class of {athlete.class_year || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                    <span>GPA: {athlete.gpa?.toFixed(1) || 'N/A'}</span>
                    <span>Height: {athlete.height_inches ? `${Math.floor(athlete.height_inches / 12)}'${athlete.height_inches % 12}"` : 'N/A'}</span>
                    <span>Weight: {athlete.weight_lbs ? `${athlete.weight_lbs} lbs` : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddToRoster(athlete.id)}
                      disabled={isAdding || athleteFeedback?.type === 'success'}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-primary/20 text-primary text-sm font-medium px-3 py-2 rounded-lg hover:bg-primary/30 transition-colors disabled:opacity-50"
                    >
                      {isAdding ? (
                        <>
                          <div className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                          Adding...
                        </>
                      ) : athleteFeedback?.type === 'success' ? (
                        <>
                          <span className="material-symbols-outlined text-[16px]">check</span>
                          Added
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[16px]">person_add</span>
                          Add to Roster
                        </>
                      )}
                    </button>
                  </div>
                  {athleteFeedback?.type === 'error' && (
                    <p className="text-red-400 text-xs mt-2">{athleteFeedback.message}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
