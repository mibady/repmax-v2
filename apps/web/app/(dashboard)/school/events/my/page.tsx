'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

interface MyRegistration {
  id: string;
  tournament_id: string;
  tournament_name: string;
  tournament_date: string;
  tournament_location: string;
  team_name: string | null;
  payment_status: 'pending' | 'approved' | 'rejected' | 'waitlisted';
  roster_count: number;
  created_at: string;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    approved: 'bg-green-500/10 text-green-400 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    waitlisted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${styles[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function SchoolMyRegistrationsPage() {
  const [registrations, setRegistrations] = useState<MyRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMyRegistrations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all registrations using the new optimized endpoint
      const res = await fetch('/api/schools/me/registrations');
      if (!res.ok) {
        throw new Error('Failed to load registrations');
      }

      const data = await res.json();
      setRegistrations(data.registrations || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyRegistrations();
  }, [fetchMyRegistrations]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading registrations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load registrations</h3>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/school/events"
            className="size-10 rounded-lg bg-[#141414] border border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-gray-400">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">My Registrations</h1>
            <p className="text-gray-400 text-sm mt-1">
              {registrations.length} tournament registration{registrations.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Link
          href="/school/events"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">search</span>
          Browse Tournaments
        </Link>
      </div>

      {/* Registrations Table */}
      <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
        {registrations.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <span className="material-symbols-outlined text-slate-600 text-5xl mb-4">how_to_reg</span>
            <h3 className="text-white text-lg font-bold mb-2">No Registrations Yet</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
              Your school has not registered for any tournaments yet. Browse available tournaments to get started.
            </p>
            <Link
              href="/school/events"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">search</span>
              Browse Tournaments
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Tournament</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Team</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Roster</th>
                  <th className="px-4 py-3 text-right text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/school/events/${reg.tournament_id}`}
                        className="text-white font-medium hover:text-primary transition-colors"
                      >
                        {reg.tournament_name}
                      </Link>
                      <div className="text-gray-500 text-xs mt-0.5">{reg.tournament_location}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(reg.tournament_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-white">
                      {reg.team_name || 'Unnamed'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={reg.payment_status} />
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {reg.roster_count} player{reg.roster_count !== 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/school/events/${reg.tournament_id}`}
                        className="text-primary text-sm font-medium hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
