'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  useTournamentDetail,
  useTournamentSchedule,
  useTournamentVenues,
  type BracketGameRecord,
} from '@/lib/hooks';

type ViewMode = 'table' | 'timeline';

const GAME_STATUS_STYLES: Record<string, string> = {
  scheduled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  in_progress: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  final: 'bg-green-500/10 text-green-400 border-green-500/20',
  postponed: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  canceled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function ClubSchedulePage() {
  const { id } = useParams<{ id: string }>();
  const { tournament, isLoading: tournamentLoading } = useTournamentDetail(id);
  const { games, isLoading: gamesLoading, updateGame, autoSchedule } = useTournamentSchedule(id);
  const { venues, isLoading: venuesLoading } = useTournamentVenues(id);

  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [editVenue, setEditVenue] = useState('');
  const [editTime, setEditTime] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Auto-schedule state
  const [showAutoSchedule, setShowAutoSchedule] = useState(false);
  const [autoStartDate, setAutoStartDate] = useState('');
  const [autoStartTime, setAutoStartTime] = useState('08:00');
  const [autoDuration, setAutoDuration] = useState('90');
  const [autoGap, setAutoGap] = useState('30');
  const [isAutoScheduling, setIsAutoScheduling] = useState(false);

  const isLoading = tournamentLoading || gamesLoading || venuesLoading;

  const startEdit = (game: BracketGameRecord) => {
    setEditingGameId(game.id);
    setEditVenue(game.venue_id || '');
    setEditTime(
      game.scheduled_at
        ? new Date(game.scheduled_at).toISOString().slice(0, 16)
        : ''
    );
  };

  const handleSaveEdit = async () => {
    if (!editingGameId) return;
    setIsSaving(true);

    await updateGame({
      game_id: editingGameId,
      venue_id: editVenue || null,
      scheduled_at: editTime ? new Date(editTime).toISOString() : null,
    });

    setIsSaving(false);
    setEditingGameId(null);
  };

  const handleAutoSchedule = async () => {
    if (!autoStartDate || venues.length === 0) return;
    setIsAutoScheduling(true);

    const startTime = new Date(`${autoStartDate}T${autoStartTime}`);
    await autoSchedule(
      venues,
      startTime,
      parseInt(autoDuration) || 90,
      parseInt(autoGap) || 30
    );

    setIsAutoScheduling(false);
    setShowAutoSchedule(false);
  };

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

  // Sort games for display
  const sortedGames = [...games].sort((a, b) => {
    // Scheduled first, then by time, then by game number
    if (a.scheduled_at && b.scheduled_at) {
      return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
    }
    if (a.scheduled_at) return -1;
    if (b.scheduled_at) return 1;
    return (a.game_number ?? 0) - (b.game_number ?? 0);
  });

  // Group games by date for timeline view
  const gamesByDate = new Map<string, BracketGameRecord[]>();
  for (const game of sortedGames) {
    const dateKey = game.scheduled_at
      ? new Date(game.scheduled_at).toLocaleDateString()
      : 'Unscheduled';
    const existing = gamesByDate.get(dateKey) || [];
    existing.push(game);
    gamesByDate.set(dateKey, existing);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/club/events/${id}`}
          className="size-10 rounded-lg bg-[#141414] border border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-gray-400">arrow_back</span>
        </Link>
        <div className="flex-1">
          <h1 className="text-white text-2xl font-bold">Schedule</h1>
          <p className="text-gray-400 text-sm mt-1">{tournament?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-[#141414] border border-white/5 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Timeline
            </button>
          </div>

          <button
            onClick={() => setShowAutoSchedule(!showAutoSchedule)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">auto_fix_high</span>
            Auto-Schedule
          </button>
        </div>
      </div>

      {/* Auto-Schedule Panel */}
      {showAutoSchedule && (
        <div className="bg-[#141414] border border-white/5 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">auto_fix_high</span>
              Auto-Schedule Games
            </h2>
            <button
              onClick={() => setShowAutoSchedule(false)}
              className="size-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-gray-400 text-lg">close</span>
            </button>
          </div>

          {venues.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm">
                Add venues first before auto-scheduling.
              </p>
              <Link
                href={`/club/events/${id}/venues`}
                className="text-primary text-sm hover:underline mt-1 inline-block"
              >
                Go to Venues
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={autoStartDate}
                    onChange={(e) => setAutoStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F1F22] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={autoStartTime}
                    onChange={(e) => setAutoStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F1F22] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">
                    Game Duration (min)
                  </label>
                  <input
                    type="number"
                    min={15}
                    value={autoDuration}
                    onChange={(e) => setAutoDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F1F22] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">
                    Gap Between Games (min)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={autoGap}
                    onChange={(e) => setAutoGap(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F1F22] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {games.length} games across {venues.length} venue{venues.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={handleAutoSchedule}
                  disabled={isAutoScheduling || !autoStartDate}
                  className="flex items-center gap-2 px-5 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isAutoScheduling ? (
                    <>
                      <div className="size-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">schedule</span>
                      Apply Schedule
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Games */}
      {games.length === 0 ? (
        <div className="bg-[#141414] border border-white/5 rounded-xl px-5 py-12 text-center">
          <span className="material-symbols-outlined text-slate-600 text-4xl mb-2">schedule</span>
          <p className="text-slate-500 mb-1">No games to schedule</p>
          <p className="text-slate-600 text-sm">
            Generate a bracket first to create games.
          </p>
          <Link
            href={`/club/events/${id}/brackets`}
            className="text-primary text-sm hover:underline mt-2 inline-block"
          >
            Go to Brackets
          </Link>
        </div>
      ) : viewMode === 'table' ? (
        <ScheduleTable
          games={sortedGames}
          venues={venues}
          editingGameId={editingGameId}
          editVenue={editVenue}
          editTime={editTime}
          isSaving={isSaving}
          onStartEdit={startEdit}
          onEditVenue={setEditVenue}
          onEditTime={setEditTime}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={() => setEditingGameId(null)}
        />
      ) : (
        <ScheduleTimeline gamesByDate={gamesByDate} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Schedule Table View
// ---------------------------------------------------------------------------

function ScheduleTable({
  games,
  venues,
  editingGameId,
  editVenue,
  editTime,
  isSaving,
  onStartEdit,
  onEditVenue,
  onEditTime,
  onSaveEdit,
  onCancelEdit,
}: {
  games: BracketGameRecord[];
  venues: { id: string; name: string; field_number: number | null }[];
  editingGameId: string | null;
  editVenue: string;
  editTime: string;
  isSaving: boolean;
  onStartEdit: (game: BracketGameRecord) => void;
  onEditVenue: (v: string) => void;
  onEditTime: (t: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}) {
  return (
    <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Game</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Round</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Time</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Venue</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Home</th>
              <th className="px-4 py-3 text-center text-gray-400 font-medium">vs</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Away</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Status</th>
              <th className="px-4 py-3 text-right text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {games.map((game) => {
              const isEditing = editingGameId === game.id;
              const homeName = game.home_reg?.team_name || (game.home_registration_id ? 'TBD' : 'BYE');
              const awayName = game.away_reg?.team_name || (game.away_registration_id ? 'TBD' : 'BYE');
              const timeStr = game.scheduled_at
                ? new Date(game.scheduled_at).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '--';

              return (
                <tr key={game.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white font-medium">G{game.game_number}</td>
                  <td className="px-4 py-3 text-gray-400">R{game.round}</td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        value={editTime}
                        onChange={(e) => onEditTime(e.target.value)}
                        className="px-2 py-1 bg-[#1F1F22] border border-white/10 rounded text-white text-xs focus:outline-none focus:border-primary"
                      />
                    ) : (
                      <span className="text-gray-400">{timeStr}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <select
                        value={editVenue}
                        onChange={(e) => onEditVenue(e.target.value)}
                        className="px-2 py-1 bg-[#1F1F22] border border-white/10 rounded text-white text-xs focus:outline-none focus:border-primary"
                      >
                        <option value="">No venue</option>
                        {venues.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                            {v.field_number ? ` (Field ${v.field_number})` : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-400">
                        {game.venue?.name || '--'}
                        {game.venue?.field_number ? ` (F${game.venue.field_number})` : ''}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white">{homeName}</td>
                  <td className="px-4 py-3 text-center text-gray-600 text-xs">
                    {game.status === 'final'
                      ? `${game.home_score} - ${game.away_score}`
                      : 'vs'}
                  </td>
                  <td className="px-4 py-3 text-white">{awayName}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded border ${
                        GAME_STATUS_STYLES[game.status] || GAME_STATUS_STYLES.scheduled
                      }`}
                    >
                      {game.status.charAt(0).toUpperCase() + game.status.replace('_', ' ').slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={onSaveEdit}
                          disabled={isSaving}
                          className="px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={onCancelEdit}
                          className="px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onStartEdit(game)}
                        className="size-7 rounded flex items-center justify-center hover:bg-white/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-gray-400 text-base">edit</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Schedule Timeline View
// ---------------------------------------------------------------------------

function ScheduleTimeline({
  gamesByDate,
}: {
  gamesByDate: Map<string, BracketGameRecord[]>;
}) {
  const dateKeys = Array.from(gamesByDate.keys());

  return (
    <div className="space-y-6">
      {dateKeys.map((dateKey) => {
        const dateGames = gamesByDate.get(dateKey) || [];
        return (
          <div key={dateKey}>
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">calendar_today</span>
              {dateKey}
            </h3>
            <div className="relative pl-6 border-l-2 border-white/10 space-y-3">
              {dateGames.map((game) => {
                const homeName = game.home_reg?.team_name || 'TBD';
                const awayName = game.away_reg?.team_name || 'TBD';
                const timeStr = game.scheduled_at
                  ? new Date(game.scheduled_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '--';

                return (
                  <div key={game.id} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-[31px] top-3 size-3 rounded-full bg-[#141414] border-2 border-primary" />

                    <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-primary font-bold text-xs">G{game.game_number}</span>
                          <span className="text-gray-500 text-xs">R{game.round}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {game.venue && (
                            <span className="text-gray-500 text-xs flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">stadium</span>
                              {game.venue.name}
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded border ${
                              GAME_STATUS_STYLES[game.status] || GAME_STATUS_STYLES.scheduled
                            }`}
                          >
                            {game.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 text-xs w-14 shrink-0">{timeStr}</span>
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-white text-sm font-medium">{homeName}</span>
                          <span className="text-gray-600 text-xs">
                            {game.status === 'final'
                              ? `${game.home_score} - ${game.away_score}`
                              : 'vs'}
                          </span>
                          <span className="text-white text-sm font-medium">{awayName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
