'use client';

import Link from 'next/link';
import { useParentDashboard } from '@/lib/hooks';

const DIVISION_COLORS: Record<string, string> = {
  D1: 'text-green-400 bg-green-400/10',
  D2: 'text-blue-400 bg-blue-400/10',
  D3: 'text-purple-400 bg-purple-400/10',
  NAIA: 'text-yellow-400 bg-yellow-400/10',
  JUCO: 'text-slate-400 bg-slate-400/10',
};

export default function ParentSchoolsPage() {
  const { schools, offers, isLoading, error } = useParentDashboard();

  // Build a set of school names that have offered
  const offerSchools = new Map(offers.map((o) => [o.schoolName, o]));

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

        {/* Offers Section */}
        {offers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400">emoji_events</span>
              Scholarship Offers
              <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">{offers.length}</span>
            </h2>
            <div className="bg-[#1F1F22] rounded-xl border border-white/5 divide-y divide-white/5">
              {offers.map((offer) => {
                const divColor = DIVISION_COLORS[offer.division] || DIVISION_COLORS.JUCO;
                const date = new Date(offer.offerDate + 'T00:00:00');
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                return (
                  <div key={offer.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                    <div className="size-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-amber-400 text-[20px]">emoji_events</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{offer.schoolName}</span>
                        {offer.committed && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-green-400/10 text-green-400">Committed</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {offer.scholarshipType === 'full' ? 'Full Scholarship' : offer.scholarshipType === 'partial' ? 'Partial' : offer.scholarshipType} · Offered {dateStr}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${divColor}`}>
                      {offer.division}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* School Interest List */}
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-400">school</span>
          Schools Showing Interest
          <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">{schools.length}</span>
        </h2>
        {schools.length === 0 ? (
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-12 text-center">
            <span className="material-symbols-outlined text-slate-600 text-5xl mb-3">school</span>
            <h3 className="text-white font-semibold mb-1">No schools tracking yet</h3>
            <p className="text-slate-500 text-sm">Schools showing interest will appear here.</p>
          </div>
        ) : (
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 divide-y divide-white/5">
            {schools.map((school, index) => {
              const offer = offerSchools.get(school.name);
              return (
                <div key={school.id || index} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-[20px]">sports_football</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white">{school.name}</span>
                      {offer && (
                        <p className="text-xs text-amber-400 mt-0.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">emoji_events</span>
                          {offer.scholarshipType === 'full' ? 'Full scholarship offered' : 'Offer received'}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${school.statusColor}`}>
                    {school.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
