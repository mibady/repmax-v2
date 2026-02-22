'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  useTournamentDetail,
  useBrackets,
  type BracketGameRecord,
  type TournamentBracket,
} from '@/lib/hooks';

const BRACKET_TYPE_LABELS: Record<TournamentBracket['bracket_type'], string> = {
  single_elim: 'Single Elimination',
  double_elim: 'Double Elimination',
  round_robin: 'Round Robin',
  pool_play: 'Pool Play',
  pool_to_bracket: 'Pool to Bracket',
};

export default function SchoolBracketPage() {
  const { id } = useParams<{ id: string }>();
  const { tournament, myRegistration, isLoading: tournamentLoading } = useTournamentDetail(id);
  const { brackets, games, isLoading: bracketsLoading } = useBrackets(id);

  const isLoading = tournamentLoading || bracketsLoading;

  // Get the school's team name for highlighting
  const myTeamName = myRegistration?.team_name ?? null;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading bracket...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-white text-2xl font-bold">Bracket</h1>
          <p className="text-gray-400 text-sm mt-1">{tournament?.name}</p>
        </div>
        {myTeamName && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
            <span className="material-symbols-outlined text-primary text-lg">school</span>
            <span className="text-primary text-sm font-medium">{myTeamName}</span>
          </div>
        )}
      </div>

      {/* Brackets */}
      {brackets.length === 0 ? (
        <div className="bg-[#141414] border border-white/5 rounded-xl px-5 py-12 text-center">
          <span className="material-symbols-outlined text-slate-600 text-4xl mb-2">account_tree</span>
          <p className="text-slate-500 mb-1">No brackets available yet</p>
          <p className="text-slate-600 text-sm">The organizer has not created brackets for this tournament.</p>
        </div>
      ) : (
        brackets.map((bracket) => {
          const bracketGames = games.filter((g) => g.bracket_id === bracket.id);
          return (
            <ReadOnlyBracketView
              key={bracket.id}
              bracket={bracket}
              games={bracketGames}
              highlightTeam={myTeamName}
            />
          );
        })
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Read-Only Bracket View
// ---------------------------------------------------------------------------

function ReadOnlyBracketView({
  bracket,
  games,
  highlightTeam,
}: {
  bracket: TournamentBracket;
  games: BracketGameRecord[];
  highlightTeam: string | null;
}) {
  const isElimination =
    bracket.bracket_type === 'single_elim' || bracket.bracket_type === 'double_elim';

  // Group games by round
  const { roundMap, roundNumbers } = useMemo(() => {
    const map = new Map<number, BracketGameRecord[]>();
    for (const game of games) {
      const existing = map.get(game.round) || [];
      existing.push(game);
      map.set(game.round, existing);
    }
    const numbers = Array.from(map.keys()).sort((a, b) => a - b);
    return { roundMap: map, roundNumbers: numbers };
  }, [games]);

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
        <ReadOnlyEliminationTree
          rounds={roundMap}
          roundNumbers={roundNumbers}
          highlightTeam={highlightTeam}
        />
      ) : (
        <ReadOnlyRoundRobinGrid
          rounds={roundMap}
          roundNumbers={roundNumbers}
          highlightTeam={highlightTeam}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Read-Only Elimination Bracket Tree
// ---------------------------------------------------------------------------

function ReadOnlyEliminationTree({
  rounds,
  roundNumbers,
  highlightTeam,
}: {
  rounds: Map<number, BracketGameRecord[]>;
  roundNumbers: number[];
  highlightTeam: string | null;
}) {
  if (roundNumbers.length === 0) {
    return <p className="text-gray-500 text-sm">No games in this bracket.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-0 min-w-fit">
        {roundNumbers.map((roundNum, roundIdx) => {
          const roundGames = rounds.get(roundNum) || [];
          const spacingMultiplier = Math.pow(2, roundIdx);

          return (
            <div key={roundNum} className="flex flex-col">
              <div className="text-center mb-3 px-2">
                <span className="text-gray-500 text-xs font-medium">
                  {roundIdx === roundNumbers.length - 1 && roundNumbers.length > 1
                    ? 'Final'
                    : `Round ${roundNum}`}
                </span>
              </div>

              <div
                className="flex flex-col justify-around flex-1"
                style={{ gap: `${(spacingMultiplier - 1) * 48 + 8}px` }}
              >
                {roundGames.map((game) => (
                  <ReadOnlyGameCard
                    key={game.id}
                    game={game}
                    showConnector={roundIdx > 0}
                    highlightTeam={highlightTeam}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReadOnlyGameCard({
  game,
  showConnector,
  highlightTeam,
}: {
  game: BracketGameRecord;
  showConnector?: boolean;
  highlightTeam: string | null;
}) {
  const homeName = game.home_reg?.team_name || (game.home_registration_id ? 'TBD' : 'BYE');
  const awayName = game.away_reg?.team_name || (game.away_registration_id ? 'TBD' : 'BYE');
  const isFinal = game.status === 'final';
  const homeWon = isFinal && game.home_score > game.away_score;
  const awayWon = isFinal && game.away_score > game.home_score;

  const homeHighlight = highlightTeam && homeName === highlightTeam;
  const awayHighlight = highlightTeam && awayName === highlightTeam;

  return (
    <div className="flex items-center">
      {showConnector && (
        <div className="w-4 border-t-2 border-white/10" />
      )}
      <div className="w-48 bg-[#1F1F22] border border-white/10 rounded-lg overflow-hidden shrink-0">
        {/* Game number header */}
        <div className="px-2 py-1 bg-white/5 flex items-center justify-between">
          <span className="text-gray-600 text-[10px] font-medium">G{game.game_number}</span>
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
      <div className="w-4 border-t-2 border-white/10" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Read-Only Round Robin Grid
// ---------------------------------------------------------------------------

function ReadOnlyRoundRobinGrid({
  rounds,
  roundNumbers,
  highlightTeam,
}: {
  rounds: Map<number, BracketGameRecord[]>;
  roundNumbers: number[];
  highlightTeam: string | null;
}) {
  if (roundNumbers.length === 0) {
    return <p className="text-gray-500 text-sm">No games in this bracket.</p>;
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
                const homeHighlight = highlightTeam && homeName === highlightTeam;
                const awayHighlight = highlightTeam && awayName === highlightTeam;
                const isMyGame = homeHighlight || awayHighlight;

                return (
                  <div
                    key={game.id}
                    className={`bg-[#1F1F22] border rounded-lg px-3 py-2 flex items-center justify-between ${
                      isMyGame
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className={
                          homeHighlight
                            ? 'text-primary font-bold'
                            : 'text-white'
                        }
                      >
                        {homeName}
                      </span>
                      <span className="text-gray-600 text-xs">vs</span>
                      <span
                        className={
                          awayHighlight
                            ? 'text-primary font-bold'
                            : 'text-white'
                        }
                      >
                        {awayName}
                      </span>
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
