'use client';

import { useTournamentStandings } from '@/lib/hooks/use-tournament-standings';
import { Loader2 } from 'lucide-react';

interface StandingsTabProps {
  tournamentId: string;
}

export default function StandingsTab({ tournamentId }: StandingsTabProps) {
  const { standings, isLoading } = useTournamentStandings(tournamentId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Tournament Standings</h3>
      </div>

      <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
        {standings.length === 0 ? (
          <div className="py-12 text-center">
            <span className="material-symbols-outlined text-gray-600 text-4xl mb-2">leaderboard</span>
            <p className="text-gray-500">Standings will appear once games are finalized.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-4 py-3 text-left text-gray-400 font-medium w-12">#</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Team</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">W</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">L</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">T</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">PF</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">PA</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {standings.map((s, idx) => {
                  const diff = s.points_for - s.points_against;
                  return (
                    <tr key={s.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-4 py-4 text-gray-500 font-mono">{idx + 1}</td>
                      <td className="px-4 py-4 text-white font-bold">{s.team_name || 'Unknown'}</td>
                      <td className="px-4 py-4 text-center text-green-400 font-mono font-bold">{s.wins}</td>
                      <td className="px-4 py-4 text-center text-red-400 font-mono font-bold">{s.losses}</td>
                      <td className="px-4 py-4 text-center text-gray-400 font-mono">{s.ties}</td>
                      <td className="px-4 py-4 text-center text-white font-mono">{s.points_for}</td>
                      <td className="px-4 py-4 text-center text-white font-mono">{s.points_against}</td>
                      <td className={`px-4 py-4 text-center font-mono font-bold ${
                        diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {diff > 0 ? '+' : ''}{diff}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
