'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useClubDashboard } from '@/lib/hooks';

function VerificationTypeBadge({ type }: { type: 'identity' | 'academic' | 'athletic' }) {
  const styles = {
    identity: 'bg-purple-500/10 text-purple-400',
    academic: 'bg-blue-500/10 text-blue-400',
    athletic: 'bg-orange-500/10 text-orange-400',
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${styles[type]}`}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

interface AthleteRow {
  athleteId: string;
  athleteName: string;
  types: Set<'identity' | 'academic' | 'athletic'>;
  firstSeen: string;
}

export default function ClubAthletesPage() {
  const { verifications, isLoading, error } = useClubDashboard();
  const [search, setSearch] = useState('');

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

  // Derive athletes from verifications grouped by athleteId
  const athleteMap = new Map<string, AthleteRow>();
  for (const v of verifications) {
    const existing = athleteMap.get(v.athleteId);
    if (existing) {
      existing.types.add(v.type);
    } else {
      athleteMap.set(v.athleteId, {
        athleteId: v.athleteId,
        athleteName: v.athleteName,
        types: new Set([v.type]),
        firstSeen: v.submittedAt,
      });
    }
  }

  const athletes = Array.from(athleteMap.values());
  const filtered = search
    ? athletes.filter(a => a.athleteName.toLowerCase().includes(search.toLowerCase()))
    : athletes;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/club"
            className="size-10 rounded-lg bg-[#141414] border border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-gray-400">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-white text-2xl font-bold">Athletes</h1>
            <p className="text-gray-400 text-sm mt-1">{athletes.length} registered athletes</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <span className="material-symbols-outlined text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 text-xl">
          search
        </span>
        <input
          type="text"
          placeholder="Search athletes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#141414] text-white border border-white/5 rounded-lg pl-10 pr-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Athletes Table */}
      <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <span className="material-symbols-outlined text-slate-600 text-4xl mb-2">groups</span>
            <p className="text-slate-500">
              {search ? 'No athletes match your search' : 'No athletes registered yet'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-5 py-3 text-left text-gray-400 text-xs font-medium uppercase tracking-wider">
                  Athlete
                </th>
                <th className="px-5 py-3 text-left text-gray-400 text-xs font-medium uppercase tracking-wider">
                  Verifications
                </th>
                <th className="px-5 py-3 text-left text-gray-400 text-xs font-medium uppercase tracking-wider">
                  First Seen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((athlete) => (
                <tr key={athlete.athleteId} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-sm">person</span>
                      </div>
                      <span className="text-white font-medium text-sm">{athlete.athleteName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5">
                      {(['identity', 'academic', 'athletic'] as const).map((type) =>
                        athlete.types.has(type) ? (
                          <VerificationTypeBadge key={type} type={type} />
                        ) : null
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-gray-400 text-sm">{athlete.firstSeen}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
