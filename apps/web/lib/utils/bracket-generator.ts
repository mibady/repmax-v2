/**
 * Bracket Generator — Pure functions for generating tournament brackets.
 *
 * Supports five bracket types:
 *  - Single Elimination (with BYE padding to next power of 2)
 *  - Double Elimination (winners + losers brackets)
 *  - Round Robin (every team plays every other)
 *  - Pool Play (divide into pools, round robin within each)
 *  - Pool to Bracket (pool play then single elim of top N per pool)
 */

export interface BracketTeam {
  registrationId: string;
  teamName: string;
  seed: number;
}

export interface BracketGame {
  round: number;
  gameNumber: number;
  homeTeam: BracketTeam | null; // null = BYE
  awayTeam: BracketTeam | null;
}

export interface BracketResult {
  rounds: BracketGame[][];
  totalGames: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the smallest power of 2 >= n */
function nextPowerOf2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/** Sort teams by seed ascending */
function sortedBySeeds(teams: BracketTeam[]): BracketTeam[] {
  return [...teams].sort((a, b) => a.seed - b.seed);
}

/**
 * Pad the team list with BYEs so total count equals `targetSize`.
 * BYEs are placed opposite the highest seeds so top seeds get the byes.
 */
function padWithByes(teams: BracketTeam[], targetSize: number): (BracketTeam | null)[] {
  const sorted = sortedBySeeds(teams);
  const padded: (BracketTeam | null)[] = new Array(targetSize).fill(null);

  // Standard bracket seeding placement:
  // Use the canonical bracket positions so seed 1 plays the lowest seed,
  // seed 2 plays the second-lowest, etc.
  const positions = bracketPositions(targetSize);
  for (let i = 0; i < sorted.length; i++) {
    padded[positions[i]] = sorted[i];
  }

  // Remaining nulls are BYEs — already in place
  return padded;
}

/**
 * Generate bracket seed positions for `size` teams.
 * Returns an array where index = seed rank (0-based), value = bracket slot.
 * Seed 1 at position 0, seed 2 at the opposite end, etc.
 */
function bracketPositions(size: number): number[] {
  if (size === 1) return [0];
  if (size === 2) return [0, 1];

  const result: number[] = new Array(size);
  result[0] = 0;
  result[1] = size - 1;

  // Fill recursively for each subsequent power-of-2 layer
  let placed = 2;
  let groupSize = size;

  while (placed < size) {
    groupSize = groupSize / 2;
    const newSeeds: number[] = [];
    for (let i = 0; i < placed; i++) {
      // Each existing seed's opponent goes at the mirrored position within their group
      const mirrorPos = result[i] + (result[i] % groupSize === 0 ? groupSize - 1 : -(groupSize - 1));
      // Only add if not already placed
      if (mirrorPos >= 0 && mirrorPos < size) {
        newSeeds.push(mirrorPos);
      }
    }
    for (const pos of newSeeds) {
      if (placed < size) {
        result[placed] = pos;
        placed++;
      }
    }

    // Safety break for non-standard sizes
    if (newSeeds.length === 0) break;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Single Elimination
// ---------------------------------------------------------------------------

export function singleElimination(teams: BracketTeam[]): BracketResult {
  if (teams.length < 2) {
    return { rounds: [], totalGames: 0 };
  }

  const size = nextPowerOf2(teams.length);
  const padded = padWithByes(teams, size);
  const rounds: BracketGame[][] = [];
  let gameCounter = 1;

  // Round 1: pair adjacent slots
  const round1: BracketGame[] = [];
  for (let i = 0; i < size; i += 2) {
    round1.push({
      round: 1,
      gameNumber: gameCounter++,
      homeTeam: padded[i],
      awayTeam: padded[i + 1],
    });
  }
  rounds.push(round1);

  // Subsequent rounds: number of games halves each round
  let gamesInRound = round1.length / 2;
  let roundNum = 2;
  while (gamesInRound >= 1) {
    const round: BracketGame[] = [];
    for (let i = 0; i < gamesInRound; i++) {
      round.push({
        round: roundNum,
        gameNumber: gameCounter++,
        homeTeam: null, // TBD — winners from previous round
        awayTeam: null,
      });
    }
    rounds.push(round);
    gamesInRound = gamesInRound / 2;
    roundNum++;
  }

  const totalGames = gameCounter - 1;
  return { rounds, totalGames };
}

// ---------------------------------------------------------------------------
// Double Elimination
// ---------------------------------------------------------------------------

export function doubleElimination(teams: BracketTeam[]): BracketResult {
  if (teams.length < 2) {
    return { rounds: [], totalGames: 0 };
  }

  const size = nextPowerOf2(teams.length);
  const padded = padWithByes(teams, size);
  const rounds: BracketGame[][] = [];
  let gameCounter = 1;

  // ---- Winners Bracket ----
  // Round 1 of winners bracket
  const wbRound1: BracketGame[] = [];
  for (let i = 0; i < size; i += 2) {
    wbRound1.push({
      round: 1,
      gameNumber: gameCounter++,
      homeTeam: padded[i],
      awayTeam: padded[i + 1],
    });
  }
  rounds.push(wbRound1);

  // Remaining winners bracket rounds
  let wbGames = wbRound1.length / 2;
  let wbRound = 2;
  while (wbGames >= 1) {
    const round: BracketGame[] = [];
    for (let i = 0; i < wbGames; i++) {
      round.push({
        round: wbRound,
        gameNumber: gameCounter++,
        homeTeam: null,
        awayTeam: null,
      });
    }
    rounds.push(round);
    wbGames = wbGames / 2;
    wbRound++;
  }

  // ---- Losers Bracket ----
  // Losers bracket has (2 * (winnersRounds - 1) - 1) rounds
  // Each pair of losers rounds: first round is losers vs losers, second is loser from winners drops down
  const winnersRoundCount = rounds.length;
  let lbTeamCount = wbRound1.length; // initial losers from round 1

  for (let lr = 0; lr < (winnersRoundCount - 1) * 2 - 1; lr++) {
    const round: BracketGame[] = [];
    const gamesThisRound = Math.max(1, Math.ceil(lbTeamCount / 2));

    for (let i = 0; i < gamesThisRound; i++) {
      round.push({
        round: wbRound + lr,
        gameNumber: gameCounter++,
        homeTeam: null,
        awayTeam: null,
      });
    }
    rounds.push(round);

    // Losers bracket: every other round the count halves
    if (lr % 2 === 0) {
      // Drop-down round — same number of teams
      lbTeamCount = gamesThisRound;
    } else {
      // Elimination round — halves
      lbTeamCount = Math.ceil(gamesThisRound / 2);
    }
  }

  // Grand Final (winners bracket champion vs losers bracket champion)
  rounds.push([
    {
      round: wbRound + (winnersRoundCount - 1) * 2 - 1,
      gameNumber: gameCounter++,
      homeTeam: null, // WB champion
      awayTeam: null, // LB champion
    },
  ]);

  const totalGames = gameCounter - 1;
  return { rounds, totalGames };
}

// ---------------------------------------------------------------------------
// Round Robin
// ---------------------------------------------------------------------------

export function roundRobin(teams: BracketTeam[]): BracketResult {
  if (teams.length < 2) {
    return { rounds: [], totalGames: 0 };
  }

  const sorted = sortedBySeeds(teams);
  const games: BracketGame[] = [];
  let gameCounter = 1;

  // Generate all N*(N-1)/2 pairings
  // Use the circle method for balanced round scheduling
  const teamList = [...sorted];
  // If odd number of teams, add a null BYE slot
  if (teamList.length % 2 !== 0) {
    teamList.push(null as unknown as BracketTeam);
  }

  const numRounds = teamList.length - 1;
  const halfSize = teamList.length / 2;

  for (let roundIdx = 0; roundIdx < numRounds; roundIdx++) {
    for (let i = 0; i < halfSize; i++) {
      const home = teamList[i];
      const away = teamList[teamList.length - 1 - i];

      // Skip BYE matchups
      if (!home || !away) continue;

      games.push({
        round: roundIdx + 1,
        gameNumber: gameCounter++,
        homeTeam: home,
        awayTeam: away,
      });
    }

    // Rotate: fix position 0, rotate the rest
    const last = teamList.pop()!;
    teamList.splice(1, 0, last);
  }

  // Group games into rounds for display
  const roundMap = new Map<number, BracketGame[]>();
  for (const game of games) {
    const existing = roundMap.get(game.round) || [];
    existing.push(game);
    roundMap.set(game.round, existing);
  }

  const rounds: BracketGame[][] = [];
  for (let r = 1; r <= numRounds; r++) {
    const roundGames = roundMap.get(r);
    if (roundGames && roundGames.length > 0) {
      rounds.push(roundGames);
    }
  }

  return { rounds, totalGames: gameCounter - 1 };
}

// ---------------------------------------------------------------------------
// Pool Play
// ---------------------------------------------------------------------------

export function poolPlay(teams: BracketTeam[], poolSize: number): BracketResult {
  if (teams.length < 2 || poolSize < 2) {
    return { rounds: [], totalGames: 0 };
  }

  const sorted = sortedBySeeds(teams);

  // Snake-seed teams into pools for balanced distribution
  // Pool 1 gets seeds 1,4,5,8,...  Pool 2 gets seeds 2,3,6,7,...
  const poolCount = Math.ceil(sorted.length / poolSize);
  const pools: BracketTeam[][] = Array.from({ length: poolCount }, () => []);

  for (let i = 0; i < sorted.length; i++) {
    const row = Math.floor(i / poolCount);
    const col = i % poolCount;
    // Snake: even rows go forward, odd rows go backward
    const poolIdx = row % 2 === 0 ? col : poolCount - 1 - col;
    pools[poolIdx].push(sorted[i]);
  }

  // Generate round robin within each pool
  const allRounds: BracketGame[][] = [];
  let gameCounter = 1;

  for (let poolIdx = 0; poolIdx < pools.length; poolIdx++) {
    const poolTeams = pools[poolIdx];
    if (poolTeams.length < 2) continue;

    const poolResult = roundRobin(poolTeams);

    // Merge into allRounds, offsetting game numbers
    for (let r = 0; r < poolResult.rounds.length; r++) {
      if (!allRounds[r]) {
        allRounds[r] = [];
      }
      for (const game of poolResult.rounds[r]) {
        allRounds[r].push({
          ...game,
          round: r + 1,
          gameNumber: gameCounter++,
        });
      }
    }
  }

  const totalGames = gameCounter - 1;
  return { rounds: allRounds, totalGames };
}

// ---------------------------------------------------------------------------
// Pool to Bracket
// ---------------------------------------------------------------------------

export function poolToBracket(
  teams: BracketTeam[],
  poolSize: number,
  advanceCount: number
): BracketResult {
  if (teams.length < 2 || poolSize < 2 || advanceCount < 1) {
    return { rounds: [], totalGames: 0 };
  }

  // Phase 1: Pool play
  const poolResult = poolPlay(teams, poolSize);

  // Phase 2: Single elimination bracket with placeholder advancing teams
  const poolCount = Math.ceil(teams.length / poolSize);
  const advancingTeamCount = poolCount * advanceCount;

  // Create placeholder advancing teams (actual teams TBD after pool play completes)
  const advancingTeams: BracketTeam[] = [];
  for (let i = 0; i < advancingTeamCount; i++) {
    advancingTeams.push({
      registrationId: `pool-advance-${i + 1}`,
      teamName: `Pool Winner ${i + 1}`,
      seed: i + 1,
    });
  }

  const bracketResult = singleElimination(advancingTeams);

  // Combine pool rounds + bracket rounds
  const combinedRounds: BracketGame[][] = [...poolResult.rounds];
  const poolRoundOffset = poolResult.rounds.length;
  let gameCounter = poolResult.totalGames + 1;

  for (const round of bracketResult.rounds) {
    const adjustedRound: BracketGame[] = round.map((game) => ({
      ...game,
      round: game.round + poolRoundOffset,
      gameNumber: gameCounter++,
    }));
    combinedRounds.push(adjustedRound);
  }

  const totalGames = gameCounter - 1;
  return { rounds: combinedRounds, totalGames };
}
