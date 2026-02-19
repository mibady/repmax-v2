'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useClubDashboard } from '@/lib/hooks';

function TournamentStatusBadge({ status }: { status: 'upcoming' | 'active' | 'completed' }) {
  const styles = {
    upcoming: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    active: 'bg-green-500/10 text-green-400 border-green-500/20',
    completed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };
  const labels = { upcoming: 'Upcoming', active: 'Active', completed: 'Completed' };
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export default function ClubEventsPage() {
  const { tournaments, isLoading, error } = useClubDashboard();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'active' | 'completed'>('all');

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load events</h3>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  const filtered = filter === 'all' ? tournaments : tournaments.filter(t => t.status === filter);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Tournaments</h1>
          <p className="text-gray-400 text-sm mt-1">{tournaments.length} total events</p>
        </div>
        <Link
          href="/club/events/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Create Tournament
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'upcoming', 'active', 'completed'] as const).map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filter === value
                ? 'bg-primary text-black'
                : 'bg-[#141414] text-gray-400 border border-white/5 hover:text-white'
            }`}
          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </button>
        ))}
      </div>

      {/* Tournament List */}
      <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
        <div className="divide-y divide-white/5">
          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <span className="material-symbols-outlined text-slate-600 text-4xl mb-2">event</span>
              <p className="text-slate-500">No tournaments yet</p>
              <Link
                href="/club/events/new"
                className="mt-3 inline-block text-primary text-sm font-medium hover:underline"
              >
                Create your first tournament
              </Link>
            </div>
          ) : (
            filtered.map((tournament) => (
              <div key={tournament.id} className="px-5 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-white font-semibold">{tournament.name}</h3>
                    <p className="text-gray-500 text-sm">{tournament.date}</p>
                  </div>
                  <TournamentStatusBadge status={tournament.status} />
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-gray-500 text-lg">location_on</span>
                    <span className="text-gray-400">{tournament.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-gray-500 text-lg">groups</span>
                    <span className="text-gray-400">
                      {tournament.registrations}/{tournament.capacity} registered
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-gray-500 text-lg">payments</span>
                    <span className="text-gray-400">${tournament.revenue.toLocaleString()}</span>
                  </div>
                </div>
                {/* Registration progress bar */}
                <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min((tournament.registrations / tournament.capacity) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
