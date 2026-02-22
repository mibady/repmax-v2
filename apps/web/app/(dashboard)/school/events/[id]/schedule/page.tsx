'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTournamentDetail, useTournamentSchedule, type BracketGameRecord } from '@/lib/hooks';

const GAME_STATUS_STYLES: Record<string, string> = {
  scheduled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  in_progress: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  final: 'bg-green-500/10 text-green-400 border-green-500/20',
  postponed: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  canceled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function SchoolSchedulePage() {
  const { id } = useParams<{ id: string }>();
  const { tournament, myRegistration, isLoading: tournamentLoading } = useTournamentDetail(id);
  const { games, isLoading: gamesLoading } = useTournamentSchedule(id);

  const [myGamesOnly, setMyGamesOnly] = useState(false);

  const isLoading = tournamentLoading || gamesLoading;

  const myRegId = myRegistration?.id ?? null;

  // Filter and sort games
  const filteredGames = useMemo(() => {
    let result = [...games];

    if (myGamesOnly && myRegId) {
      result = result.filter(
        (g) =>
          g.home_registration_id === myRegId ||
          g.away_registration_id === myRegId
      );
    }

    return result.sort((a, b) => {
      if (a.scheduled_at && b.scheduled_at) {
        return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
      }
      if (a.scheduled_at) return -1;
      if (b.scheduled_at) return 1;
      return (a.game_number ?? 0) - (b.game_number ?? 0);
    });
  }, [games, myGamesOnly, myRegId]);

  // Group by date for timeline
  const gamesByDate = useMemo(() => {
    const map = new Map<string, BracketGameRecord[]>();
    for (const game of filteredGames) {
      const dateKey = game.scheduled_at
        ? new Date(game.scheduled_at).toLocaleDateString()
        : 'Unscheduled';
      const existing = map.get(dateKey) || [];
      existing.push(game);
      map.set(dateKey, existing);
    }
    return map;
  }, [filteredGames]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading schedule...</p>
        </div>
      </div>
    );
  }

  const myGamesCount = myRegId
    ? games.filter(
        (g) =>
          g.home_registration_id === myRegId ||
          g.away_registration_id === myRegId
      ).length
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/school/events/${id}`}
          className="size-10 rounded-lg bg-[#141414] border border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-gray-400">arrow_back</span>
        </Link>
        <div className="flex-1">
          <h1 className="text-white text-2xl font-bold">Schedule</h1>
          <p className="text-gray-400 text-sm mt-1">{tournament?.name}</p>
        </div>

        {/* My Games Toggle */}
        {myRegId && myGamesCount > 0 && (
          <button
            onClick={() => setMyGamesOnly(!myGamesOnly)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              myGamesOnly
                ? 'bg-primary text-black'
                : 'bg-[#141414] border border-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-lg">filter_alt</span>
            My Games ({myGamesCount})
          </button>
        )}
      </div>

      {/* Schedule Table */}
      {filteredGames.length === 0 ? (
        <div className="bg-[#141414] border border-white/5 rounded-xl px-5 py-12 text-center">
          <span className="material-symbols-outlined text-slate-600 text-4xl mb-2">schedule</span>
          <p className="text-slate-500 mb-1">
            {myGamesOnly ? 'No games found for your team' : 'No games scheduled yet'}
          </p>
          <p className="text-slate-600 text-sm">
            {myGamesOnly
              ? 'Try showing all games to see the full schedule.'
              : 'The organizer has not scheduled games yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(gamesByDate.entries()).map(([dateKey, dateGames]) => (
            <div key={dateKey}>
              <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">calendar_today</span>
                {dateKey}
              </h3>

              <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Time</th>
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Venue</th>
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Home</th>
                      <th className="px-4 py-3 text-center text-gray-400 font-medium">Score</th>
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Away</th>
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {dateGames.map((game) => {
                      const isMyGame =
                        myRegId &&
                        (game.home_registration_id === myRegId ||
                          game.away_registration_id === myRegId);
                      const homeName =
                        game.home_reg?.team_name ||
                        (game.home_registration_id ? 'TBD' : 'BYE');
                      const awayName =
                        game.away_reg?.team_name ||
                        (game.away_registration_id ? 'TBD' : 'BYE');
                      const timeStr = game.scheduled_at
                        ? new Date(game.scheduled_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '--';

                      return (
                        <tr
                          key={game.id}
                          className={`transition-colors ${
                            isMyGame
                              ? 'bg-primary/5 hover:bg-primary/10'
                              : 'hover:bg-white/[0.02]'
                          }`}
                        >
                          <td className="px-4 py-3 text-gray-400">{timeStr}</td>
                          <td className="px-4 py-3 text-gray-400">
                            {game.venue?.name || '--'}
                            {game.venue?.field_number
                              ? ` (F${game.venue.field_number})`
                              : ''}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-sm ${
                                isMyGame && game.home_registration_id === myRegId
                                  ? 'text-primary font-bold'
                                  : 'text-white'
                              }`}
                            >
                              {homeName}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-500 text-xs">
                            {game.status === 'final' || game.status === 'in_progress'
                              ? `${game.home_score} - ${game.away_score}`
                              : 'vs'}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-sm ${
                                isMyGame && game.away_registration_id === myRegId
                                  ? 'text-primary font-bold'
                                  : 'text-white'
                              }`}
                            >
                              {awayName}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded border ${
                                GAME_STATUS_STYLES[game.status] || GAME_STATUS_STYLES.scheduled
                              }`}
                            >
                              {game.status.charAt(0).toUpperCase() +
                                game.status.replace('_', ' ').slice(1)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
