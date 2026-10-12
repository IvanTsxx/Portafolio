import { columnOf, rowOf } from "./game";
import type { CellIndex, GameState } from "./game";

export type Mood =
  | "opening"
  | "waiting"
  | "thinking"
  | "blocking"
  | "winning"
  | "losing"
  | "draw";

type Lines = readonly [string, ...string[]];

export const AGENT_LINES = {
  blocking: ["not that line.", "blocked. try another.", "saw that coming."],
  draw: [
    "draw. the honest result.",
    "stalemate. well played.",
    "nine cells, no winner.",
  ],
  losing: [
    "noted. patching myself.",
    "you found the bug.",
    "fair. logging the loss.",
  ],
  opening: ["your move. i'll wait.", "board's clean. go.", "you first."],
  thinking: ["running minimax…", "walking the tree…", "scoring branches…"],
  waiting: ["your turn.", "go on.", "ok. your move."],
  winning: [
    "three in a row. gg.",
    "deterministic, sorry.",
    "line closed. rematch?",
  ],
} as const satisfies Record<Mood, Lines>;

export const MOOD_LABELS = {
  blocking: "Blocking",
  draw: "Draw",
  losing: "Agent lost",
  opening: "Your move",
  thinking: "Thinking",
  waiting: "Your move",
  winning: "Agent won",
} as const satisfies Record<Mood, string>;

export const moodOf = (state: GameState): Mood => {
  const { lastMove, status } = state;
  if (status.kind === "won") {
    return status.winner === "agent" ? "winning" : "losing";
  }
  if (status.kind === "draw") {
    return "draw";
  }
  if (status.turn === "agent") {
    return "thinking";
  }
  if (lastMove === null) {
    return "opening";
  }
  return lastMove.blocked ? "blocking" : "waiting";
};

const countMoves = (state: GameState) =>
  state.board.filter((cell) => cell !== null).length;

export const agentLine = (state: GameState): string => {
  const lines: Lines = AGENT_LINES[moodOf(state)];
  return lines[(state.round + countMoves(state)) % lines.length] ?? lines[0];
};

export const describeCell = (cell: CellIndex) =>
  `row ${rowOf(cell) + 1} column ${columnOf(cell) + 1}`;

export const announce = (state: GameState): string => {
  const { lastMove, status } = state;
  if (status.kind === "won") {
    return status.winner === "agent" ? "Agent wins." : "You win.";
  }
  if (status.kind === "draw") {
    return "Draw.";
  }
  if (status.turn === "agent") {
    return "Agent is thinking.";
  }
  if (lastMove?.player === "agent") {
    return `Agent took ${describeCell(lastMove.cell)}. Your turn.`;
  }
  return "Your turn. You play the cross.";
};
