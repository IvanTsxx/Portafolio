export type Player = "agent" | "human";

export type Cell = Player | null;

export type Board = readonly [
  Cell,
  Cell,
  Cell,
  Cell,
  Cell,
  Cell,
  Cell,
  Cell,
  Cell,
];

export const CELL_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;

export type CellIndex = (typeof CELL_INDICES)[number];

export type Line = readonly [CellIndex, CellIndex, CellIndex];

export const LINES: readonly Line[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export type GameStatus =
  | { kind: "playing"; turn: Player }
  | { kind: "won"; winner: Player; line: Line }
  | { kind: "draw" };

export interface Move {
  blocked: boolean;
  cell: CellIndex;
  player: Player;
}

export interface Score {
  agent: number;
  draws: number;
  human: number;
}

export interface GameState {
  board: Board;
  lastMove: Move | null;
  round: number;
  score: Score;
  starter: Player;
  status: GameStatus;
}

export type GameAction =
  | { type: "play"; player: Player; cell: CellIndex }
  | { type: "rematch" };

export const EMPTY_BOARD: Board = [
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
];

export const opponentOf = (player: Player): Player =>
  player === "agent" ? "human" : "agent";

export const isCellIndex = (value: number): value is CellIndex =>
  Number.isInteger(value) && value >= 0 && value <= 8;

export const rowOf = (cell: CellIndex) => Math.floor(cell / 3);

export const columnOf = (cell: CellIndex) => cell % 3;

export const emptyCells = (board: Board): CellIndex[] =>
  CELL_INDICES.filter((cell) => board[cell] === null);

export const place = (board: Board, cell: CellIndex, player: Player): Board => {
  const at = (index: CellIndex): Cell =>
    index === cell ? player : board[index];
  return [at(0), at(1), at(2), at(3), at(4), at(5), at(6), at(7), at(8)];
};

export const findWin = (
  board: Board
): { winner: Player; line: Line } | null => {
  for (const line of LINES) {
    const [a, b, c] = line;
    const owner = board[a];
    if (owner !== null && owner === board[b] && owner === board[c]) {
      return { line, winner: owner };
    }
  }
  return null;
};

export const statusOf = (board: Board, nextTurn: Player): GameStatus => {
  const win = findWin(board);
  if (win) {
    return { kind: "won", line: win.line, winner: win.winner };
  }
  if (emptyCells(board).length === 0) {
    return { kind: "draw" };
  }
  return { kind: "playing", turn: nextTurn };
};

const completesLine = (board: Board, cell: CellIndex, player: Player) =>
  board[cell] === null && findWin(place(board, cell, player)) !== null;

const ZERO_SCORE: Score = { agent: 0, draws: 0, human: 0 };

export const createGame = (
  starter: Player = "human",
  score: Score = ZERO_SCORE,
  round = 1
): GameState => ({
  board: EMPTY_BOARD,
  lastMove: null,
  round,
  score,
  starter,
  status: { kind: "playing", turn: starter },
});

const tally = (score: Score, status: GameStatus): Score => {
  if (status.kind === "won") {
    return { ...score, [status.winner]: score[status.winner] + 1 };
  }
  if (status.kind === "draw") {
    return { ...score, draws: score.draws + 1 };
  }
  return score;
};

export const gameReducer = (
  state: GameState,
  action: GameAction
): GameState => {
  switch (action.type) {
    case "play": {
      const { cell, player } = action;
      if (
        state.status.kind !== "playing" ||
        state.status.turn !== player ||
        state.board[cell] !== null
      ) {
        return state;
      }
      const board = place(state.board, cell, player);
      const status = statusOf(board, opponentOf(player));
      return {
        ...state,
        board,
        lastMove: {
          blocked: completesLine(state.board, cell, opponentOf(player)),
          cell,
          player,
        },
        score: tally(state.score, status),
        status,
      };
    }
    case "rematch": {
      if (state.status.kind === "playing") {
        return state;
      }
      return createGame(
        opponentOf(state.starter),
        state.score,
        state.round + 1
      );
    }
    default: {
      return state;
    }
  }
};

const WIN_SCORE = 10;

const minimax = (board: Board, turn: Player, depth: number): number => {
  const win = findWin(board);
  if (win) {
    return win.winner === "agent" ? WIN_SCORE - depth : depth - WIN_SCORE;
  }
  const open = emptyCells(board);
  if (open.length === 0) {
    return 0;
  }
  const scores = open.map((cell) =>
    minimax(place(board, cell, turn), opponentOf(turn), depth + 1)
  );
  return turn === "agent" ? Math.max(...scores) : Math.min(...scores);
};

export const rankAgentMoves = (
  board: Board
): { cell: CellIndex; score: number }[] =>
  emptyCells(board).map((cell) => ({
    cell,
    score: minimax(place(board, cell, "agent"), "human", 1),
  }));

export interface AgentPolicy {
  blunderChance: number;
  random: () => number;
}

export const DEFAULT_AGENT_POLICY: AgentPolicy = {
  blunderChance: 0.15,
  random: Math.random,
};

const pickFrom = <T>(items: readonly T[], random: () => number): T | null =>
  items[Math.min(items.length - 1, Math.floor(random() * items.length))] ??
  null;

export const chooseAgentMove = (
  board: Board,
  policy: AgentPolicy = DEFAULT_AGENT_POLICY
): CellIndex | null => {
  const ranked = rankAgentMoves(board);
  if (ranked.length === 0) {
    return null;
  }
  const best = Math.max(...ranked.map((move) => move.score));
  const optimal = ranked.filter((move) => move.score === best);
  const suboptimal = ranked.filter((move) => move.score < best);
  const blunders =
    suboptimal.length > 0 && policy.random() < policy.blunderChance;
  return pickFrom(blunders ? suboptimal : optimal, policy.random)?.cell ?? null;
};
