'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  useBrackets,
  useTournamentDetail,
  type BracketSeed,
  type BracketGameRecord,
  type TournamentBracket,
} from '@/lib/hooks';

type BracketType = TournamentBracket['bracket_type'];

const BRACKET_TYPE_LABELS: Record<BracketType, string> = {
  single_elim: 'Single Elimination',
  double_elim: 'Double Elimination',
  round_robin: 'Round Robin',
  pool_play: 'Pool Play',
  pool_to_bracket: 'Pool to Bracket',
};

export default function ClubBracketsPage() {
  const { id } = useParams<{ id: string }>();
  const { tournament, registrations, isLoading: tournamentLoading } = useTournamentDetail(id);
  const { brackets, games, isLoading: bracketsLoading, createBracket } = useBrackets(id);

  const [bracketType, setBracketType] = useState<BracketType>('single_elim');
  const [bracketName, setBracketName] = useState('Main Bracket');
  const [poolSize, setPoolSize] = useState(4);
  const [advanceCount, setAdvanceCount] = useState(2);
  const [seeds, setSeeds] = useState<BracketSeed[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const isLoading = tournamentLoading || bracketsLoading;

  // Build seeds from approved registrations
  const initializeSeeds = useCallback(() => {
    const approved = (registrations || []).filter(
      (r) => r.payment_status === 'approved'
    );
    const newSeeds: BracketSeed[] = approved.map((r, idx) => ({
      registrationId: r.id,
      teamName: r.team_name || `Team ${idx + 1}`,
      seed: idx + 1,
    }));
    setSeeds(newSeeds);
  }, [registrations]);

  const handleMoveSeed = (index: number, direction: 'up' | 'down') => {
    const newSeeds = [...seeds];
    const swapIdx = direction === 'up' ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= newSeeds.length) return;

    // Swap positions and re-assign seed numbers
    [newSeeds[index], newSeeds[swapIdx]] = [newSeeds[swapIdx], newSeeds[index]];
    newSeeds.forEach((s, i) => { s.seed = i + 1; });
    setSeeds(newSeeds);
  };

  const handleGenerate = async () => {
    if (seeds.length < 2) return;
    setIsGenerating(true);

    const params: Parameters<typeof createBracket>[0] = {
      bracket_type: bracketType,
      name: bracketName,
      seeds,
    };

    if (bracketType === 'pool_play' || bracketType === 'pool_to_bracket') {
      params.pool_size = poolSize;
    }
    if (bracketType === 'pool_to_bracket') {
      params.advance_count = advanceCount;
    }

    await createBracket(params);
    setIsGenerating(false);
    setShowCreate(false);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading brackets...</p>
        </div>
      </div>
    );
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
          <h1 className="text-white text-2xl font-bold">Brackets</h1>
          <p className="text-gray-400 text-sm mt-1">{tournament?.name}</p>
        </div>
        {!showCreate && (
          <button
            onClick={() => {
              initializeSeeds();
              setShowCreate(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            New Bracket
          </button>
        )}
      </div>

      {/* Create Bracket Panel */}
      {showCreate && (
        <div className="bg-[#141414] border border-white/5 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-lg font-semibold">Create Bracket</h2>
            <button
              onClick={() => setShowCreate(false)}
              className="size-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-gray-400 text-lg">close</span>
            </button>
          </div>

          {/* Bracket Config */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">
                Bracket Name
              </label>
              <input
                type="text"
                value={bracketName}
                onChange={(e) => setBracketName(e.target.value)}
                className="w-full px-3 py-2 bg-[#1F1F22] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">
                Bracket Type
              </label>
              <select
                value={bracketType}
                onChange={(e) => setBracketType(e.target.value as BracketType)}
                className="w-full px-3 py-2 bg-[#1F1F22] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
              >
                {Object.entries(BRACKET_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {(bracketType === 'pool_play' || bracketType === 'pool_to_bracket') && (
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5">
                  Pool Size
                </label>
                <input
                  type="number"
                  min={2}
                  max={seeds.length}
                  value={poolSize}
                  onChange={(e) => setPoolSize(parseInt(e.target.value) || 4)}
                  className="w-full px-3 py-2 bg-[#1F1F22] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>
            )}

            {bracketType === 'pool_to_bracket' && (
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5">
                  Teams Advancing Per Pool
                </label>
                <input
                  type="number"
                  min={1}
                  max={poolSize - 1}
                  value={advanceCount}
                  onChange={(e) => setAdvanceCount(parseInt(e.target.value) || 2)}
                  className="w-full px-3 py-2 bg-[#1F1F22] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>
            )}
          </div>

          {/* Seed Teams */}
          <div>
            <h3 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">format_list_numbered</span>
              Seed Order ({seeds.length} teams)
            </h3>
            {seeds.length === 0 ? (
              <p className="text-gray-500 text-sm">No approved registrations to seed.</p>
            ) : (
              <div className="space-y-1.5 max-h-80 overflow-y-auto">
                {seeds.map((seed, idx) => (
                  <div
                    key={seed.registrationId}
                    className="flex items-center gap-3 px-3 py-2 bg-[#1F1F22] rounded-lg"
                  >
                    <span className="text-primary font-bold text-sm w-6 text-center">
                      {seed.seed}
                    </span>
                    <span className="text-white text-sm flex-1">{seed.teamName}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveSeed(idx, 'up')}
                        disabled={idx === 0}
                        className="size-7 rounded flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-20"
                      >
                        <span className="material-symbols-outlined text-gray-400 text-base">arrow_upward</span>
                      </button>
                      <button
                        onClick={() => handleMoveSeed(idx, 'down')}
                        disabled={idx === seeds.length - 1}
                        className="size-7 rounded flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-20"
                      >
                        <span className="material-symbols-outlined text-gray-400 text-base">arrow_downward</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Generate Button */}
          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || seeds.length < 2}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="size-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl">account_tree</span>
                  Generate Bracket
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Existing Brackets */}
      {brackets.length === 0 && !showCreate ? (
        <div className="bg-[#141414] border border-white/5 rounded-xl px-5 py-12 text-center">
          <span className="material-symbols-outlined text-slate-600 text-4xl mb-2">account_tree</span>
          <p className="text-slate-500 mb-1">No brackets created yet</p>
          <p className="text-slate-600 text-sm">Create a bracket to generate tournament matchups</p>
        </div>
      ) : (
        brackets.map((bracket) => {
          const bracketGames = games.filter((g) => g.bracket_id === bracket.id);
          return (
            <BracketView
              key={bracket.id}
              bracket={bracket}
              games={bracketGames}
            />
          );
        })
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bracket Visualization Component
// ---------------------------------------------------------------------------

function BracketView({
  bracket,
  games,
}: {
  bracket: TournamentBracket;
  games: BracketGameRecord[];
}) {
  const isElimination =
    bracket.bracket_type === 'single_elim' || bracket.bracket_type === 'double_elim';

  // Group games by round
  const roundMap = new Map<number, BracketGameRecord[]>();
  for (const game of games) {
    const existing = roundMap.get(game.round) || [];
    existing.push(game);
    roundMap.set(game.round, existing);
  }
  const roundNumbers = Array.from(roundMap.keys()).sort((a, b) => a - b);

  return (
    <div className="bg-[#141414] border border-white/5 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">account_tree</span>
            {bracket.name}
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">
            {BRACKET_TYPE_LABELS[bracket.bracket_type]} &middot; {games.length} games
          </p>
        </div>
        <span
          className={`px-2 py-0.5 text-xs font-medium rounded border ${
            bracket.status === 'active'
              ? 'bg-green-500/10 text-green-400 border-green-500/20'
              : bracket.status === 'completed'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
          }`}
        >
          {bracket.status.charAt(0).toUpperCase() + bracket.status.slice(1)}
        </span>
      </div>

      {isElimination ? (
        <EliminationBracketTree rounds={roundMap} roundNumbers={roundNumbers} />
      ) : (
        <RoundRobinGrid rounds={roundMap} roundNumbers={roundNumbers} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Elimination Bracket Tree (columns layout)
// ---------------------------------------------------------------------------

function EliminationBracketTree({
  rounds,
  roundNumbers,
}: {
  rounds: Map<number, BracketGameRecord[]>;
  roundNumbers: number[];
}) {
  if (roundNumbers.length === 0) {
    return <p className="text-gray-500 text-sm">No games generated.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-0 min-w-fit">
        {roundNumbers.map((roundNum, roundIdx) => {
          const roundGames = rounds.get(roundNum) || [];
          // Calculate vertical spacing to center-align with previous round
          const spacingMultiplier = Math.pow(2, roundIdx);

          return (
            <div key={roundNum} className="flex flex-col">
              {/* Round Header */}
              <div className="text-center mb-3 px-2">
                <span className="text-gray-500 text-xs font-medium">
                  {roundIdx === roundNumbers.length - 1 && roundNumbers.length > 1
                    ? 'Final'
                    : `Round ${roundNum}`}
                </span>
              </div>

              {/* Games */}
              <div
                className="flex flex-col justify-around flex-1"
                style={{ gap: `${(spacingMultiplier - 1) * 48 + 8}px` }}
              >
                {roundGames.map((game) => (
                  <GameCard key={game.id} game={game} showConnector={roundIdx > 0} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GameCard({
  game,
  showConnector,
  highlight,
}: {
  game: BracketGameRecord;
  showConnector?: boolean;
  highlight?: string | null;
}) {
  const homeName = game.home_reg?.team_name || (game.home_registration_id ? 'TBD' : 'BYE');
  const awayName = game.away_reg?.team_name || (game.away_registration_id ? 'TBD' : 'BYE');
  const isFinal = game.status === 'final';
  const homeWon = isFinal && game.home_score > game.away_score;
  const awayWon = isFinal && game.away_score > game.home_score;

  const homeHighlight = highlight && game.home_reg?.team_name === highlight;
  const awayHighlight = highlight && game.away_reg?.team_name === highlight;

  return (
    <div className="flex items-center">
      {showConnector && (
        <div className="w-4 border-t-2 border-white/10" />
      )}
      <div className="w-48 bg-[#1F1F22] border border-white/10 rounded-lg overflow-hidden shrink-0">
        {/* Game number header */}
        <div className="px-2 py-1 bg-white/5 flex items-center justify-between">
          <span className="text-gray-600 text-[10px] font-medium">
            G{game.game_number}
          </span>
          {game.status !== 'scheduled' && (
            <span
              className={`text-[10px] font-medium ${
                game.status === 'in_progress'
                  ? 'text-yellow-400'
                  : game.status === 'final'
                    ? 'text-green-400'
                    : 'text-gray-500'
              }`}
            >
              {game.status === 'in_progress' ? 'LIVE' : game.status.toUpperCase()}
            </span>
          )}
        </div>

        {/* Home team */}
        <div
          className={`px-2 py-1.5 flex items-center justify-between border-b border-white/5 ${
            homeHighlight ? 'bg-primary/10' : homeWon ? 'bg-green-500/5' : ''
          }`}
        >
          <span
            className={`text-xs truncate ${
              homeHighlight
                ? 'text-primary font-bold'
                : homeWon
                  ? 'text-white font-medium'
                  : 'text-gray-400'
            }`}
          >
            {homeName}
          </span>
          {isFinal && (
            <span className={`text-xs font-bold ml-2 ${homeWon ? 'text-white' : 'text-gray-600'}`}>
              {game.home_score}
            </span>
          )}
        </div>

        {/* Away team */}
        <div
          className={`px-2 py-1.5 flex items-center justify-between ${
            awayHighlight ? 'bg-primary/10' : awayWon ? 'bg-green-500/5' : ''
          }`}
        >
          <span
            className={`text-xs truncate ${
              awayHighlight
                ? 'text-primary font-bold'
                : awayWon
                  ? 'text-white font-medium'
                  : 'text-gray-400'
            }`}
          >
            {awayName}
          </span>
          {isFinal && (
            <span className={`text-xs font-bold ml-2 ${awayWon ? 'text-white' : 'text-gray-600'}`}>
              {game.away_score}
            </span>
          )}
        </div>
      </div>
      {/* Right connector line */}
      <div className="w-4 border-t-2 border-white/10" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Round Robin Grid
// ---------------------------------------------------------------------------

function RoundRobinGrid({
  rounds,
  roundNumbers,
}: {
  rounds: Map<number, BracketGameRecord[]>;
  roundNumbers: number[];
}) {
  if (roundNumbers.length === 0) {
    return <p className="text-gray-500 text-sm">No games generated.</p>;
  }

  return (
    <div className="space-y-4">
      {roundNumbers.map((roundNum) => {
        const roundGames = rounds.get(roundNum) || [];
        return (
          <div key={roundNum}>
            <h4 className="text-gray-400 text-xs font-medium mb-2">Round {roundNum}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {roundGames.map((game) => {
                const homeName = game.home_reg?.team_name || 'TBD';
                const awayName = game.away_reg?.team_name || 'TBD';
                return (
                  <div
                    key={game.id}
                    className="bg-[#1F1F22] border border-white/10 rounded-lg px-3 py-2 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-white">{homeName}</span>
                      <span className="text-gray-600 text-xs">vs</span>
                      <span className="text-white">{awayName}</span>
                    </div>
                    {game.status === 'final' && (
                      <span className="text-xs font-bold text-gray-400 ml-2">
                        {game.home_score} - {game.away_score}
                      </span>
                    )}
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
