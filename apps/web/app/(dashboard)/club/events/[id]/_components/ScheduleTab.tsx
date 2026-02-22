'use client';

import { useState } from 'react';
import { useTournamentSchedule } from '@/lib/hooks/use-tournament-schedule';
import { useTournamentVenues } from '@/lib/hooks/use-tournament-venues';
import { Loader2, Save, Trophy } from 'lucide-react';
import ScoringModal from './ScoringModal';

interface ScheduleTabProps {
  tournamentId: string;
}

interface Game {
  id: string;
  game_number: number;
  round: number;
  home_registration_id: string | null;
  away_registration_id: string | null;
  home_score: number;
  away_score: number;
  status: string;
  scheduled_at: string | null;
  venue_id: string | null;
  home_reg?: { team_name: string };
  away_reg?: { team_name: string };
  venue?: { name: string };
}

export default function ScheduleTab({ tournamentId }: ScheduleTabProps) {
  const { games, isLoading: gamesLoading, refetch, updateGame } = useTournamentSchedule(tournamentId);
  const { venues, isLoading: venuesLoading } = useTournamentVenues(tournamentId);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [scoringGame, setScoringGame] = useState<Game | null>(null);

  async function handleUpdateGame(gameId: string, venueId: string | null, scheduledAt: string | null) {
    setSavingId(gameId);
    try {
      const success = await updateGame({
        game_id: gameId,
        venue_id: venueId || null,
        scheduled_at: scheduledAt || null,
      });

      if (success) {
        refetch();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  }

  if (gamesLoading || venuesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Game Schedule</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => alert('PDF export coming soon!')}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Download PDF
          </button>
          <button 
            onClick={() => alert('Schedule publishing coming soon!')}
            className="px-4 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors text-sm"
          >
            Publish Schedule
          </button>
        </div>
      </div>

      <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
        {games.length === 0 ? (
          <div className="py-12 text-center">
            <span className="material-symbols-outlined text-gray-600 text-4xl mb-2">calendar_today</span>
            <p className="text-gray-500">No games scheduled yet. Generate a bracket first.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Game</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Round</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Matchup</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Score</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Venue</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Time</th>
                  <th className="px-4 py-3 text-right text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(games as any as Game[]).map((game) => (
                  <GameRow 
                    key={game.id} 
                    game={game} 
                    venues={venues} 
                    onSave={handleUpdateGame}
                    onScore={() => setScoringGame(game)}
                    isSaving={savingId === game.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {scoringGame && (
        <ScoringModal
          tournamentId={tournamentId}
          game={scoringGame}
          onClose={() => setScoringGame(null)}
          onScoreUpdate={refetch}
        />
      )}
    </div>
  );
}

function GameRow({ 
  game, 
  venues, 
  onSave,
  onScore,
  isSaving
}: { 
  game: Game; 
  venues: any[]; 
  onSave: (id: string, venueId: string | null, time: string | null) => void;
  onScore: () => void;
  isSaving: boolean;
}) {
  const [venueId, setVenueId] = useState(game.venue_id || '');
  const [time, setTime] = useState(game.scheduled_at ? new Date(game.scheduled_at).toISOString().slice(0, 16) : '');

  const hasChanges = venueId !== (game.venue_id || '') || time !== (game.scheduled_at ? new Date(game.scheduled_at).toISOString().slice(0, 16) : '');

  return (
    <tr className="hover:bg-white/[0.01] transition-colors group">
      <td className="px-4 py-4 text-white font-mono">#{game.game_number}</td>
      <td className="px-4 py-4 text-gray-400">Round {game.round}</td>
      <td className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-blue-500"></span>
            <span className="text-white font-medium">{game.home_reg?.team_name || 'TBD'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-red-500"></span>
            <span className="text-white font-medium">{game.away_reg?.team_name || 'TBD'}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2 font-mono text-lg font-bold">
          <span className="text-blue-400">{game.home_score}</span>
          <span className="text-gray-600">-</span>
          <span className="text-red-400">{game.away_score}</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <select
          value={venueId}
          onChange={(e) => setVenueId(e.target.value)}
          className="bg-[#1F1F22] border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Unassigned</option>
          {venues.map((v: any) => (
            <option key={v.id} value={v.id}>{v.name} {v.field_number ? `#${v.field_number}` : ''}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-4">
        <input
          type="datetime-local"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="bg-[#1F1F22] border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-primary"
        />
      </td>
      <td className="px-4 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {hasChanges && (
            <button
              onClick={() => onSave(game.id, venueId || null, time || null)}
              disabled={isSaving}
              className="p-1.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              title="Save Changes"
            >
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            </button>
          )}
          <button
            onClick={onScore}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors text-xs font-bold"
          >
            <Trophy className="size-3 text-primary" />
            Score
          </button>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            game.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400' :
            game.status === 'in_progress' ? 'bg-green-500/10 text-green-400' :
            'bg-gray-500/10 text-gray-400'
          }`}>
            {game.status}
          </span>
        </div>
      </td>
    </tr>
  );
}
