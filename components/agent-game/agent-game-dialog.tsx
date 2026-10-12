"use client";

import { ArrowsClockwiseIcon } from "@phosphor-icons/react";
import { useEffect, useReducer, useRef, useState } from "react";

import { CornerMarks } from "@/components/site/corner-marks";
import { technicalButtonVariants } from "@/components/site/styles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

import { chooseAgentMove, createGame, gameReducer, opponentOf } from "./game";
import type { CellIndex, Player, Score } from "./game";
import { GameBoard } from "./game-board";
import { agentLine, announce, MOOD_LABELS, moodOf } from "./voice";

const AGENT_THINK_MS = 650;
const HOME_CELL: CellIndex = 4;

const SCORE_COLUMNS = [
  { key: "agent", label: "Agent" },
  { key: "draws", label: "Draws" },
  { key: "human", label: "You" },
] as const satisfies readonly { key: keyof Score; label: string }[];

const STARTER_NOTES = {
  agent: "Agent starts next",
  human: "You start next",
} as const satisfies Record<Player, string>;

const twoDigits = (value: number) => String(value).padStart(2, "0");

export interface AgentGameDialogProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export const AgentGameDialog = ({
  onOpenChange,
  open,
}: AgentGameDialogProps) => {
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    createGame()
  );
  const [focusedCell, setFocusedCell] = useState<CellIndex>(HOME_CELL);
  const cellRefs = useRef(new Map<CellIndex, HTMLButtonElement>());
  const reducedMotion = useReducedMotion();

  const { board, round, score, status } = state;
  const agentToMove = status.kind === "playing" && status.turn === "agent";
  const mood = moodOf(state);

  useEffect(() => {
    if (!open || !agentToMove) {
      return;
    }
    const timer = window.setTimeout(
      () => {
        const cell = chooseAgentMove(board);
        if (cell !== null) {
          dispatch({ cell, player: "agent", type: "play" });
        }
      },
      reducedMotion ? 0 : AGENT_THINK_MS
    );
    return () => window.clearTimeout(timer);
  }, [agentToMove, board, open, reducedMotion]);

  const registerCell = (cell: CellIndex, element: HTMLButtonElement | null) => {
    if (element) {
      cellRefs.current.set(cell, element);
    } else {
      cellRefs.current.delete(cell);
    }
  };

  const focusCell = (cell: CellIndex) => {
    setFocusedCell(cell);
    cellRefs.current.get(cell)?.focus();
  };

  const rematch = () => {
    dispatch({ type: "rematch" });
    focusCell(HOME_CELL);
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className="ring-rule-strong gap-0 p-0 sm:max-w-sm"
        initialFocus={() => cellRefs.current.get(focusedCell) ?? true}
      >
        <CornerMarks />
        <header className="border-rule flex flex-col gap-2 border-b p-4 pr-12">
          <div className="label text-mist flex items-baseline gap-3">
            <span className="shrink-0 tabular-nums">[ AG-00 ]</span>
            <DialogTitle
              render={(props) => (
                <h2 {...props} className="text-ink m-0 shrink-0 font-normal">
                  Agent vs human
                </h2>
              )}
            />
            <span className="jp text-graphite shrink-0">対局</span>
            <span
              aria-hidden
              className="border-rule-strong mb-1 h-px min-w-4 flex-1 self-end border-b border-dotted"
            />
            <span className="text-graphite shrink-0 tabular-nums">
              R{twoDigits(round)}
            </span>
          </div>
          <DialogDescription className="text-graphite text-pretty">
            Three in a row. You play the cross, the agent plays the square.
          </DialogDescription>
        </header>

        <div className="border-rule flex min-h-16 items-start gap-3 border-b p-4">
          <span
            aria-hidden
            className={cn(
              "bg-ink mt-1 size-2 shrink-0",
              mood === "thinking" && "motion-safe:animate-pulse"
            )}
          />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="label text-mist">{MOOD_LABELS[mood]}</span>
            <p className="text-ink m-0 font-mono text-xs">{agentLine(state)}</p>
          </div>
        </div>

        <div className="blueprint-dots flex justify-center p-6">
          <GameBoard
            board={board}
            focusedCell={focusedCell}
            onFocusCell={focusCell}
            onPlay={(cell) => dispatch({ cell, player: "human", type: "play" })}
            registerCell={registerCell}
            status={status}
          />
        </div>

        <dl className="border-rule m-0 grid grid-cols-3 border-t">
          {SCORE_COLUMNS.map(({ key, label }) => (
            <div
              className="border-rule flex flex-col gap-1 border-r px-4 py-3 last:border-r-0"
              key={key}
            >
              <dt className="label text-mist">{label}</dt>
              <dd className="text-ink m-0 font-mono text-sm tabular-nums">
                {twoDigits(score[key])}
              </dd>
            </div>
          ))}
        </dl>

        <footer className="border-rule flex min-h-16 items-center justify-between gap-3 border-t p-4">
          {status.kind === "playing" ? (
            <span className="label text-mist">
              <span className="pointer-fine:hidden">Tap a cell to play</span>
              <span className="hidden pointer-fine:inline">
                Arrows move · Enter plays
              </span>
            </span>
          ) : (
            <>
              <span className="label text-mist">
                {STARTER_NOTES[opponentOf(state.starter)]}
              </span>
              <button
                className={technicalButtonVariants({ tone: "solid" })}
                onClick={rematch}
                type="button"
              >
                <ArrowsClockwiseIcon aria-hidden className="size-4" />
                Rematch
              </button>
            </>
          )}
        </footer>

        <p aria-live="polite" className="sr-only">
          {announce(state)}
        </p>
      </DialogContent>
    </Dialog>
  );
};
