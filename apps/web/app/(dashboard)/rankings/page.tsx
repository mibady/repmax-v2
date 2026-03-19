'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

interface PowerRanking {
  id: string;
  registration_id: string;
  team_name: string;
  elo_rating: number;
  zone: string | null;
  total_games: number;
  wins: number;
  losses: number;
  last_played_at: string | null;
}

const ZONES = ['West', 'Southwest', 'Midwest', 'Southeast', 'Northeast', 'Plains'];

export default function RankingsPage() {
  const [rankings, setRankings] = useState<PowerRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [zone, setZone] = useState<string>('');

  const fetchRankings = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (zone) params.set('zone', zone);
      params.set('limit', '100');

      const res = await fetch(`/api/rankings?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRankings(data.rankings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [zone]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Power Rankings</h1>
          <p className="text-sm text-muted-foreground mt-1">ELO-based team rankings across all tournaments</p>
        </div>
        <select
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          className="bg-[#141414] border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Zones</option>
          {ZONES.map((z) => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : rankings.length === 0 ? (
          <div className="py-12 text-center">
            <span className="material-symbols-outlined text-gray-600 text-4xl mb-2">emoji_events</span>
            <p className="text-muted-foreground">No rankings available yet. Rankings are generated after tournament games are finalized.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-muted-foreground font-medium w-16">Rank</th>
                  <th className="px-4 py-3 text-left text-muted-foreground font-medium">Team</th>
                  <th className="px-4 py-3 text-center text-muted-foreground font-medium">ELO</th>
                  <th className="px-4 py-3 text-center text-muted-foreground font-medium">W-L</th>
                  <th className="px-4 py-3 text-center text-muted-foreground font-medium">Games</th>
                  <th className="px-4 py-3 text-left text-muted-foreground font-medium">Zone</th>
                  <th className="px-4 py-3 text-left text-muted-foreground font-medium">Last Played</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rankings.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-4">
                      <span className={`font-mono font-bold ${
                        idx === 0 ? 'text-primary text-lg' :
                        idx <= 2 ? 'text-white' : 'text-muted-foreground'
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-white font-bold">{r.team_name}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-mono font-bold text-primary text-lg">{Math.round(r.elo_rating)}</span>
                    </td>
                    <td className="px-4 py-4 text-center font-mono">
                      <span className="text-green-400">{r.wins}</span>
                      <span className="text-muted-foreground">-</span>
                      <span className="text-red-400">{r.losses}</span>
                    </td>
                    <td className="px-4 py-4 text-center text-muted-foreground font-mono">{r.total_games}</td>
                    <td className="px-4 py-4">
                      {r.zone ? (
                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-gray-300">
                          {r.zone}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground text-xs">
                      {r.last_played_at ? new Date(r.last_played_at).toLocaleDateString() : '—'}
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
