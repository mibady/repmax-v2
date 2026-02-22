'use client';

import { useState, useMemo } from 'react';
import { useGameScoring, type ScoreEventType } from '@/lib/hooks/use-game-scoring';
import { Loader2, X } from 'lucide-react';

interface ScoringModalProps {
  tournamentId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  game: any;
  onClose: () => void;
  onScoreUpdate: () => void;
}

const SCORE_TYPES: { type: ScoreEventType; label: string; points: number }[] = [
  { type: 'touchdown', label: 'Touchdown', points: 6 },
  { type: 'extra_point', label: 'Extra Point', points: 1 },
  { type: 'two_point_conversion', label: '2-Pt Conv', points: 2 },
  { type: 'field_goal', label: 'Field Goal', points: 3 },
  { type: 'safety', label: 'Safety', points: 2 },
];

export default function ScoringModal({ tournamentId, game, onClose, onScoreUpdate }: ScoringModalProps) {
  const { events, isLoading, addEvent } = useGameScoring(tournamentId, game.id);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [quarter, setQuarter] = useState(1);
  const [clock, setClock] = useState('');

  // Drive scores from event log to ensure they are always fresh
  const homeScore = useMemo(() => 
    events.filter(e => e.registration_id === game.home_registration_id)
          .reduce((sum, e) => sum + e.points, 0)
  , [events, game.home_registration_id]);

  const awayScore = useMemo(() => 
    events.filter(e => e.registration_id === game.away_registration_id)
          .reduce((sum, e) => sum + e.points, 0)
  , [events, game.away_registration_id]);

  async function handleAddScore(type: ScoreEventType, points: number) {
    if (!selectedTeam) return;

    setSubmitting(true);
    try {
      await addEvent({
        event_type: type,
        registration_id: selectedTeam,
        player_name: playerName || null,
        quarter,
        game_clock: clock || null,
        points,
        description: `${playerName ? playerName + ' ' : ''}${type.replaceAll('_', ' ')}`,
      });
      setPlayerName('');
      setClock('');
      onScoreUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
              #{game.game_number}
            </div>
            <div>
              <h2 className="text-white text-xl font-bold">Live Scoring</h2>
              <p className="text-gray-400 text-sm">Round {game.round} • {game.venue?.name || 'No Venue'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <X className="size-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Scoring Interface */}
          <div className="space-y-8">
            {/* Scoreboard */}
            <div className="grid grid-cols-3 gap-4 items-center bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <div className={`text-center p-4 rounded-xl transition-all cursor-pointer ${selectedTeam === game.home_registration_id ? 'bg-primary/10 border border-primary/30 ring-1 ring-primary/20' : 'border border-transparent hover:bg-white/5'}`}
                   onClick={() => setSelectedTeam(game.home_registration_id)}>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Home</p>
                <h3 className="text-white font-bold truncate mb-1">{game.home_reg?.team_name || 'Home'}</h3>
                <div className="text-5xl font-black text-white font-mono">{homeScore}</div>
              </div>
              
              <div className="text-center">
                <div className="bg-white/5 rounded-lg px-3 py-1 inline-block mb-2">
                  <span className="text-primary font-black text-sm">VS</span>
                </div>
                <div className="flex flex-col gap-2">
                  <select 
                    value={quarter} 
                    onChange={(e) => setQuarter(parseInt(e.target.value))}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none"
                  >
                    <option value={1}>Q1</option>
                    <option value={2}>Q2</option>
                    <option value={3}>Q3</option>
                    <option value={4}>Q4</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Clock" 
                    value={clock}
                    onChange={(e) => setClock(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none w-16 mx-auto text-center"
                  />
                </div>
              </div>

              <div className={`text-center p-4 rounded-xl transition-all cursor-pointer ${selectedTeam === game.away_registration_id ? 'bg-primary/10 border border-primary/30 ring-1 ring-primary/20' : 'border border-transparent hover:bg-white/5'}`}
                   onClick={() => setSelectedTeam(game.away_registration_id)}>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Away</p>
                <h3 className="text-white font-bold truncate mb-1">{game.away_reg?.team_name || 'Away'}</h3>
                <div className="text-5xl font-black text-white font-mono">{awayScore}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Scoring Player (Optional)</label>
                <input 
                  type="text" 
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="e.g. #12 John Doe"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {SCORE_TYPES.map((score) => (
                  <button
                    key={score.type}
                    onClick={() => handleAddScore(score.type, score.points)}
                    disabled={!selectedTeam || submitting}
                    className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all group disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="text-white font-bold mb-1">{score.label}</span>
                    <span className="text-primary font-black text-lg">+{score.points}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Event Log */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-white font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history</span>
                Play-by-Play
              </h3>
              <span className="text-[10px] text-gray-500 font-bold uppercase">{events.length} Events</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
              ) : events.length === 0 ? (
                <div className="text-center py-12 text-gray-600 italic">No scoring events yet</div>
              ) : (
                events.map((event) => {
                  const team = event.registration_id === game.home_registration_id ? 'HOME' : 'AWAY';
                  return (
                    <div key={event.id} className="flex gap-3 animate-in slide-in-from-top-2 duration-300">
                      <div className={`w-1 rounded-full ${team === 'HOME' ? 'bg-blue-500' : 'bg-red-500'}`} />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-gray-400">Q{event.quarter} {event.game_clock}</span>
                          <span className="text-xs font-black text-primary">+{event.points}</span>
                        </div>
                        <p className="text-white text-sm font-medium">{event.description}</p>
                        <p className={`text-[10px] font-black uppercase ${team === 'HOME' ? 'text-blue-400' : 'text-red-500'}`}>{team}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
          {!selectedTeam && (
            <p className="text-yellow-500/80 text-xs flex items-center gap-2 animate-pulse">
              <span className="material-symbols-outlined text-sm">info</span>
              Select a team to record score
            </p>
          )}
          <div className="flex-1" />
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
