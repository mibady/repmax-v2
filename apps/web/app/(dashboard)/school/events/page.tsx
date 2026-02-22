'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePublicTournaments } from '@/lib/hooks';

export default function SchoolEventsPage() {
  const { tournaments, isLoading, error, filters, setDateFilter } = usePublicTournaments();
  const [fromDate, setFromDate] = useState(filters.from || '');
  const [toDate, setToDate] = useState(filters.to || '');

  function applyFilters() {
    setDateFilter(fromDate || null, toDate || null);
  }

  function clearFilters() {
    setFromDate('');
    setToDate('');
    setDateFilter(null, null);
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading tournaments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load tournaments</h3>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Browse Tournaments</h1>
          <p className="text-gray-400 text-sm mt-1">
            {tournaments.length} public tournament{tournaments.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <Link
          href="/school/events/my"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#141414] border border-white/5 text-white font-medium rounded-lg hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">assignment</span>
          My Registrations
        </Link>
      </div>

      {/* Date Filters */}
      <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-gray-400 text-xs font-medium mb-1">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-[#1F1F22] text-white border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs font-medium mb-1">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-[#1F1F22] text-white border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button
            onClick={applyFilters}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-black hover:bg-primary/90 transition-colors"
          >
            Apply
          </button>
          {(filters.from || filters.to) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Tournament Grid */}
      {tournaments.length === 0 ? (
        <div className="bg-[#141414] border border-white/5 rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-slate-600 text-5xl mb-4">event</span>
          <h3 className="text-white text-lg font-bold mb-2">No Tournaments Found</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            There are no public tournaments available at this time. Check back later or adjust your date filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tournaments.map((t) => {
            const entryFee = t.entry_fee_cents
              ? `$${(t.entry_fee_cents / 100).toFixed(0)}`
              : 'Free';
            const spotsLeft = t.teams_capacity - (t.registration_count || 0);

            return (
              <Link
                key={t.id}
                href={`/school/events/${t.id}`}
                className="bg-[#141414] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-white font-semibold group-hover:text-primary transition-colors">
                    {t.name}
                  </h3>
                  <span className="px-2 py-0.5 text-xs font-medium rounded border bg-primary/10 text-primary border-primary/20 shrink-0 ml-2">
                    {entryFee}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-500 text-lg">event</span>
                    <span className="text-gray-400">
                      {new Date(t.start_date).toLocaleDateString()} - {new Date(t.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-500 text-lg">location_on</span>
                    <span className="text-gray-400">{t.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-500 text-lg">groups</span>
                    <span className={`${spotsLeft <= 5 ? 'text-yellow-400' : 'text-gray-400'}`}>
                      {spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left` : 'Full'}
                    </span>
                  </div>
                  {t.registration_deadline && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-gray-500 text-lg">schedule</span>
                      <span className="text-gray-400">
                        Deadline: {new Date(t.registration_deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Capacity bar */}
                <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min(((t.registration_count || 0) / t.teams_capacity) * 100, 100)}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
