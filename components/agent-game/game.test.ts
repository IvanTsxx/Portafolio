import { describe, expect, test } from "bun:test";

import {
  chooseAgentMove,
  createGame,
  emptyCells,
  EMPTY_BOARD,
  findWin,
  gameReducer,
  place,
  statusOf,
} from "./game";
import type { Board, Cell, CellIndex, GameState, Player } from "./game";

const A = "agent";
const H = "human";
const _ = null;

const board = (...cells: Cell[]) => cells as unknown as Board;

const play = (state: GameState, player: Player, cell: CellIndex) =>
  gameReducer(state, { cell, player, type: "play" });

describe("findWin", () => {
  test("detects each kind of line with its owner", () => {
    expect(findWin(board(H, H, H, _, A, _, A, _, _))).toEqual({
      line: [0, 1, 2],
      winner: H,
    });
    expect(findWin(board(A, H, _, A, H, _, A, _, _))).toEqual({
      line: [0, 3, 6],
      winner: A,
    });
    expect(findWin(board(_, H, A, H, A, _, A, _, H))).toEqual({
      line: [2, 4, 6],
      winner: A,
    });
  });

  test("returns null without three in a row", () => {
    expect(findWin(EMPTY_BOARD)).toBeNull();
    expect(findWin(board(H, A, H, _, _, _, _, _, _))).toBeNull();
  });
});

describe("statusOf", () => {
  test("reports a draw on a full board with no line", () => {
    expect(statusOf(board(H, A, H, H, A, A, A, H, H), A)).toEqual({
      kind: "draw",
    });
  });

  test("prefers a win over a full board", () => {
    expect(statusOf(board(H, H, H, A, A, H, A, H, A), A)).toEqual({
      kind: "won",
      line: [0, 1, 2],
      winner: H,
    });
  });

  test("keeps playing with the next turn while cells remain", () => {
    expect(statusOf(board(H, _, _, _, _, _, _, _, _), A)).toEqual({
      kind: "playing",
      turn: A,
    });
  });
});

describe("gameReducer", () => {
  test("human starts by default", () => {
    expect(createGame().status).toEqual({ kind: "playing", turn: H });
  });

  test("rejects a move on an occupied cell", () => {
    const afterHuman = play(createGame(), H, 4);
    const afterAgent = play(afterHuman, A, 0);
    expect(play(afterAgent, H, 4)).toBe(afterAgent);
    expect(play(afterAgent, H, 0)).toBe(afterAgent);
  });

  test("rejects a move out of turn", () => {
    const initial = createGame();
    expect(play(initial, A, 0)).toBe(initial);
    const afterHuman = play(initial, H, 0);
    expect(play(afterHuman, H, 1)).toBe(afterHuman);
  });

  test("rejects moves once the game is over", () => {
    let state = createGame();
    for (const [player, cell] of [
      [H, 0],
      [A, 3],
      [H, 1],
      [A, 4],
      [H, 2],
    ] as const) {
      state = play(state, player, cell);
    }
    expect(state.status).toEqual({ kind: "won", line: [0, 1, 2], winner: H });
    expect(play(state, A, 8)).toBe(state);
  });

  test("tallies the session score on a win and a draw", () => {
    let state = createGame();
    for (const [player, cell] of [
      [H, 0],
      [A, 3],
      [H, 1],
      [A, 4],
      [H, 2],
    ] as const) {
      state = play(state, player, cell);
    }
    expect(state.score).toEqual({ agent: 0, draws: 0, human: 1 });

    state = gameReducer(state, { type: "rematch" });
    for (const [player, cell] of [
      [A, 0],
      [H, 1],
      [A, 2],
      [H, 4],
      [A, 3],
      [H, 5],
      [A, 7],
      [H, 6],
      [A, 8],
    ] as const) {
      state = play(state, player, cell);
    }
    expect(state.status).toEqual({ kind: "draw" });
    expect(state.score).toEqual({ agent: 0, draws: 1, human: 1 });
  });

  test("rematch swaps the starter, clears the board and keeps the score", () => {
    let state = createGame();
    for (const [player, cell] of [
      [H, 0],
      [A, 3],
      [H, 1],
      [A, 4],
      [H, 2],
    ] as const) {
      state = play(state, player, cell);
    }
    const rematch = gameReducer(state, { type: "rematch" });
    expect(rematch.starter).toBe(A);
    expect(rematch.status).toEqual({ kind: "playing", turn: A });
    expect(rematch.board).toEqual(EMPTY_BOARD);
    expect(rematch.score).toEqual(state.score);
    expect(rematch.round).toBe(2);
    expect(gameReducer(rematch, { type: "rematch" })).toBe(rematch);
  });

  test("flags an agent move that blocks a human line", () => {
    let state = createGame();
    state = play(state, H, 0);
    state = play(state, A, 4);
    state = play(state, H, 1);
    state = play(state, A, 2);
    expect(state.lastMove).toEqual({ blocked: true, cell: 2, player: A });
    state = play(state, H, 3);
    expect(state.lastMove).toEqual({ blocked: false, cell: 3, player: H });
  });
});

const perfect = { blunderChance: 0, random: () => 0 };
const perfectLast = { blunderChance: 0, random: () => 0.999 };

const humanWinsReachable = (
  current: Board,
  turn: Player,
  policy: typeof perfect
): { games: number; humanWins: number } => {
  const status = statusOf(current, turn);
  if (status.kind === "won") {
    return { games: 1, humanWins: status.winner === H ? 1 : 0 };
  }
  if (status.kind === "draw") {
    return { games: 1, humanWins: 0 };
  }
  if (turn === A) {
    const cell = chooseAgentMove(current, policy);
    if (cell === null) {
      throw new Error("agent found no move on a playable board");
    }
    return humanWinsReachable(place(current, cell, A), H, policy);
  }
  return emptyCells(current).reduce(
    (total, cell) => {
      const branch = humanWinsReachable(place(current, cell, H), A, policy);
      return {
        games: total.games + branch.games,
        humanWins: total.humanWins + branch.humanWins,
      };
    },
    { games: 0, humanWins: 0 }
  );
};

describe("chooseAgentMove", () => {
  test("never loses across every human move sequence when it never blunders", () => {
    for (const policy of [perfect, perfectLast]) {
      for (const starter of [H, A] as const) {
        const result = humanWinsReachable(EMPTY_BOARD, starter, policy);
        expect(result.games).toBeGreaterThan(starter === H ? 100 : 10);
        expect(result.humanWins).toBe(0);
      }
    }
  });

  test("takes an immediate win over a block", () => {
    expect(chooseAgentMove(board(A, A, _, H, H, _, _, _, _), perfect)).toBe(2);
  });

  test("blocks an immediate human win", () => {
    expect(chooseAgentMove(board(H, H, _, _, A, _, _, _, _), perfect)).toBe(2);
  });

  test("plays a suboptimal move when it blunders", () => {
    const blunder = { blunderChance: 1, random: () => 0 };
    const cell = chooseAgentMove(board(H, H, _, _, A, _, _, _, _), blunder);
    expect(cell).not.toBe(2);
    expect(cell).not.toBeNull();
  });

  test("returns null on a full board", () => {
    expect(chooseAgentMove(board(H, A, H, H, A, A, A, H, H), perfect)).toBe(
      null
    );
  });
});
