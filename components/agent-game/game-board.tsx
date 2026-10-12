"use client";

import { cva } from "class-variance-authority";
import type { KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

import { CELL_INDICES, columnOf, isCellIndex, rowOf } from "./game";
import type { Board, CellIndex, GameStatus, Player } from "./game";
import { describeCell } from "./voice";

type CellTone = "open" | "locked" | "filled" | "winning" | "faded";

const cellVariants = cva(
  "group ease-mechanical bg-popover focus-visible:outline-ink relative flex size-20 items-center justify-center transition-colors duration-100 outline-none focus-visible:outline-2 focus-visible:-outline-offset-4",
  {
    variants: {
      tone: {
        faded: "text-mist cursor-default",
        filled: "text-ink cursor-default",
        locked: "text-ink cursor-not-allowed",
        open: "text-ink pointer-fine:hover:bg-paper-deep cursor-pointer",
        winning: "bg-ink text-paper focus-visible:outline-paper cursor-default",
      } satisfies Record<CellTone, string>,
    },
  }
);

const markClassName =
  "size-8 animate-in fade-in-0 duration-150 ease-out motion-safe:zoom-in-90";

const HumanMark = ({ className }: { className?: string }) => (
  <svg
    aria-hidden
    className={cn(markClassName, className)}
    fill="none"
    stroke="currentColor"
    strokeLinecap="square"
    strokeWidth={2}
    viewBox="0 0 32 32"
  >
    <path d="M6 6 26 26M26 6 6 26" />
  </svg>
);

const AgentMark = () => (
  <svg
    aria-hidden
    className={markClassName}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 32 32"
  >
    <rect height="20" width="20" x="6" y="6" />
    <rect
      fill="currentColor"
      height="4"
      stroke="none"
      width="4"
      x="14"
      y="14"
    />
  </svg>
);

const MARKS = {
  agent: AgentMark,
  human: HumanMark,
} as const;

const ARROW_STEPS = {
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
  ArrowUp: [-1, 0],
} as const;

const isArrowKey = (key: string): key is keyof typeof ARROW_STEPS =>
  Object.hasOwn(ARROW_STEPS, key);

const stepFrom = (cell: CellIndex, key: string): CellIndex | null => {
  if (!isArrowKey(key)) {
    return null;
  }
  const step = ARROW_STEPS[key];
  const row = Math.min(2, Math.max(0, rowOf(cell) + step[0]));
  const column = Math.min(2, Math.max(0, columnOf(cell) + step[1]));
  const next = row * 3 + column;
  return isCellIndex(next) ? next : null;
};

const toneOf = (
  board: Board,
  cell: CellIndex,
  status: GameStatus,
  humanToMove: boolean
): CellTone => {
  if (status.kind === "won" && status.line.includes(cell)) {
    return "winning";
  }
  if (board[cell] !== null) {
    return status.kind === "playing" ? "filled" : "faded";
  }
  return humanToMove ? "open" : "locked";
};

const CELL_OWNER_NAMES = {
  agent: "agent",
  human: "you",
} as const satisfies Record<Player, string>;

const cellLabel = (board: Board, cell: CellIndex, winning: boolean) => {
  const owner = board[cell];
  const content = owner === null ? "empty" : CELL_OWNER_NAMES[owner];
  return `${describeCell(cell)}, ${content}${winning ? ", winning line" : ""}`;
};

export const GameBoard = ({
  board,
  focusedCell,
  onFocusCell,
  onPlay,
  registerCell,
  status,
}: {
  board: Board;
  focusedCell: CellIndex;
  onFocusCell: (cell: CellIndex) => void;
  onPlay: (cell: CellIndex) => void;
  registerCell: (cell: CellIndex, element: HTMLButtonElement | null) => void;
  status: GameStatus;
}) => {
  const humanToMove = status.kind === "playing" && status.turn === "human";

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const next = stepFrom(focusedCell, event.key);
    if (next === null) {
      return;
    }
    event.preventDefault();
    onFocusCell(next);
  };

  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="sr-only">Board</legend>
      <div className="bg-rule-strong border-rule-strong grid w-fit grid-cols-3 gap-px border">
        {CELL_INDICES.map((cell) => {
          const owner = board[cell];
          const tone = toneOf(board, cell, status, humanToMove);
          const playable = tone === "open";
          const Mark = owner ? MARKS[owner] : null;
          return (
            <button
              aria-disabled={!playable}
              aria-label={cellLabel(board, cell, tone === "winning")}
              className={cellVariants({ tone })}
              data-owner={owner ?? "empty"}
              data-tone={tone}
              key={cell}
              onClick={() => {
                if (playable) {
                  onPlay(cell);
                }
              }}
              onFocus={() => onFocusCell(cell)}
              onKeyDown={handleKeyDown}
              ref={(element) => registerCell(cell, element)}
              tabIndex={cell === focusedCell ? 0 : -1}
              type="button"
            >
              {Mark ? <Mark /> : null}
              {playable ? (
                <HumanMark className="absolute animate-none opacity-0 transition-opacity duration-100 pointer-fine:group-hover:opacity-20" />
              ) : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
};
