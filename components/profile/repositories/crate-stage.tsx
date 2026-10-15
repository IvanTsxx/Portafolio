"use client";

import { useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

import { PanelStack } from "./panel-stack";
import type { RackItem } from "./panel-stack";
import { useRackFocus } from "./use-rack-focus";

const STRIP_REM = 1.75;
const LIP_REM = 2.5;
const BAND_REM = 3;
const REVEAL_PERCENT = 60;

const sleevePose = (index: number, active: number): CSSProperties => {
  const isTipped = index > active;
  return {
    transform: `translate3d(0, calc(${index * STRIP_REM}rem + ${isTipped ? REVEAL_PERCENT : 0}% - ${isTipped ? STRIP_REM : 0}rem), 0)`,
    zIndex: index + 1,
  };
};

const crateHeight = (count: number): CSSProperties => ({
  height: `calc(${Math.max(0, count - 2) * STRIP_REM + LIP_REM + BAND_REM}rem + ${REVEAL_PERCENT}cqw)`,
});

export const CrateStage = ({
  band,
  notes,
  sleeves,
}: {
  band: ReactNode;
  notes: readonly RackItem[];
  sleeves: readonly RackItem[];
}) => {
  const root = useRef<HTMLDivElement>(null);
  const active = useRackFocus(root, sleeves.length - 1) ?? 0;

  return (
    <div
      className="flex flex-col gap-6 lg:flex-row lg:items-end lg:gap-10"
      ref={root}
    >
      <div className="@container w-full max-w-80 shrink-0" data-build-block>
        <div
          className="relative overflow-clip"
          style={crateHeight(sleeves.length)}
        >
          <ul
            aria-label="Pinned repositories as records in a crate. Arrow keys flip through them."
            className="absolute inset-0"
          >
            {sleeves.map(({ id, node }, index) => (
              <li
                className="ease-out-quart absolute inset-x-3 top-0 aspect-square transition-transform duration-300 motion-reduce:transition-none"
                data-active={index === active || undefined}
                key={id}
                style={sleevePose(index, active)}
              >
                {node}
              </li>
            ))}
          </ul>
          <div
            aria-hidden
            className="border-ink bg-paper-deep absolute inset-x-0 bottom-0 z-50 flex h-12 items-center justify-between gap-4 border-x border-t-2 border-b px-3"
          >
            {band}
          </div>
        </div>
      </div>
      <PanelStack
        active={active}
        className="min-w-0 lg:flex-1"
        panels={notes}
      />
    </div>
  );
};
