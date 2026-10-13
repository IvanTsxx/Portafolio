"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import {
  setFigureFocus,
  useFigureStation,
} from "@/components/iso/figure-stations";
import type { FigureControl } from "@/components/iso/figure-stations";
import type { Projection } from "@/components/iso/iso-kit";
import { CornerMarks } from "@/components/site/corner-marks";

import type { Tenure } from "./career";
import { glanceText, spanText } from "./career";
import type { ClockParts } from "./clock-art";
import { ClockDrawing } from "./clock-drawing";
import type { Pocket } from "./clock-layout";
import { ClockReadout } from "./clock-readout";
import type { Shown } from "./clock-readout";
import { useClockMotion } from "./use-clock-motion";
import type { ClockNodes, DeskPhase } from "./use-clock-motion";
import { useClockTour } from "./use-clock-tour";

const STATION_ID = "experience";

const CONTROLS: readonly FigureControl[] = [
  { id: "next", label: "Punch the next card" },
  { id: "previous", label: "Punch the previous card" },
  { id: "return", label: "Return the card to its rack" },
];

const spokenOf = (tenure: Tenure) =>
  `${tenure.company}, ${tenure.role}, ${tenure.dates.replace("→", "to")}, ${spanText(tenure)}, ${tenure.type}`;

const punchedOf = (tenure: Tenure) => {
  const stack =
    tenure.stack.length > 0 ? ` Stack: ${tenure.stack.join(", ")}.` : "";
  return `${tenure.company} card punched. ${tenure.dates.replace("→", "to")}, ${spanText(tenure)}.${stack}`;
};

const shownOf = (
  peek: number | null,
  desk: { job: number | null; phase: DeskPhase }
): Shown => {
  if (desk.job !== null && desk.phase !== "home") {
    return { job: desk.job, kind: desk.phase === "held" ? "held" : "moving" };
  }
  return peek === null ? { kind: "idle" } : { job: peek, kind: "peek" };
};

const CardButtons = ({
  heldJob,
  onEscape,
  onPeek,
  onToggle,
  tenures,
}: {
  heldJob: number | null;
  onEscape: () => void;
  onPeek: (job: number | null) => void;
  onToggle: (job: number) => void;
  tenures: readonly Tenure[];
}) => (
  <ul aria-label="Time cards" className="sr-only">
    {tenures.map((tenure, index) => (
      <li key={tenure.id}>
        <button
          aria-label={spokenOf(tenure)}
          aria-pressed={heldJob === index}
          onBlur={() => onPeek(null)}
          onClick={() => onToggle(index)}
          onFocus={(event) => {
            if (event.currentTarget.matches(":focus-visible")) {
              onPeek(index);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              onEscape();
            }
          }}
          type="button"
        />
      </li>
    ))}
  </ul>
);

export interface ClockLiveProps {
  caption: string;
  mask: string;
  parts: ClockParts;
  pockets: readonly Pocket[];
  projection: Projection;
  tenures: readonly Tenure[];
}

export const ClockLive = ({
  caption,
  mask,
  parts,
  pockets,
  projection,
  tenures,
}: ClockLiveProps) => {
  const count = tenures.length;
  const root = useRef<HTMLElement>(null);
  const consoleRef = useRef<SVGGElement>(null);
  const nodes = useRef<ClockNodes>({
    flightCards: [],
    hands: [],
    lever: [],
    rackCards: [],
  });
  const bind =
    (group: keyof ClockNodes, index: number) => (node: SVGElement | null) => {
      nodes.current[group][index] = node;
    };
  const homes = useMemo(() => pockets.map((pocket) => pocket.x), [pockets]);
  const ids = useMemo(() => tenures.map((tenure) => tenure.id), [tenures]);
  const currentJob = Math.max(
    0,
    tenures.findIndex((tenure) => tenure.isCurrent)
  );
  const [peek, setPeek] = useState<number | null>(null);
  const [desk, setDesk] = useState<{ job: number | null; phase: DeskPhase }>({
    job: null,
    phase: "home",
  });
  const [spoken, setSpoken] = useState("");
  const [isEngaged, setIsEngaged] = useState(false);
  const lastFed = useRef(currentJob);

  const onPhase = useCallback(
    (phase: DeskPhase, job: number | null) => {
      setDesk({ job, phase });
      const tenure = job === null ? undefined : tenures[job];
      if (phase === "held" && tenure) {
        setSpoken(punchedOf(tenure));
      }
      if (phase === "home") {
        setSpoken((before) => (before ? "Card back in its rack." : before));
      }
    },
    [tenures]
  );

  const motion = useClockMotion({ homes, nodes, onPhase, projection, root });

  const show = (job: number | null) => {
    setPeek(job);
    motion.preview(job);
  };

  const touch = useClockTour({
    count,
    current: currentJob,
    feed: motion.feed,
    isActive: motion.isVisible && !motion.isReduced && !isEngaged,
    preview: show,
    release: motion.release,
    root,
  });

  const peekByUser = (job: number | null) => {
    touch();
    show(job);
    const tenure = job === null ? undefined : tenures[job];
    setFigureFocus(
      STATION_ID,
      tenure ? `${tenure.company}: ${glanceText(tenure)}` : null
    );
  };

  const heldJob = desk.phase === "held" ? desk.job : null;

  const punch = (job: number) => {
    touch();
    lastFed.current = job;
    motion.feed(job);
  };

  const putBack = () => {
    touch();
    motion.release();
  };

  const toggle = (job: number) => {
    if (heldJob === job) {
      putBack();
      return;
    }
    punch(job);
  };

  const step = (by: number) => {
    const from = desk.job ?? lastFed.current;
    punch((from + by + count) % count);
  };

  useFigureStation({
    consoleRef,
    controls: CONTROLS,
    figureRef: root,
    id: STATION_ID,
    onOperate: (controlId) => {
      if (controlId === "next") {
        step(1);
      }
      if (controlId === "previous") {
        step(-1);
      }
      if (controlId === "return") {
        putBack();
      }
    },
    title: "Time clock",
  });

  return (
    <div
      className="flex flex-col"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsEngaged(false);
        }
      }}
      onFocus={() => {
        touch();
        setIsEngaged(true);
      }}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") {
          touch();
          setIsEngaged(true);
        }
      }}
      onPointerLeave={() => {
        touch();
        setIsEngaged(false);
      }}
    >
      <figure
        className="iso m-0 flex flex-col gap-2"
        data-build-block
        data-build-self
        ref={root}
      >
        <div className="border-rule-strong bg-paper has-[button:focus-visible]:outline-ink relative flex flex-col border outline-offset-4 has-[button:focus-visible]:outline-1">
          <CornerMarks />
          <div className="label text-graphite flex items-start justify-between gap-4 px-4 pt-3">
            <span className="tabular-nums">Fig 03</span>
            <span className="text-ink">Time clock</span>
          </div>
          <CardButtons
            heldJob={heldJob}
            onEscape={putBack}
            onPeek={peekByUser}
            onToggle={toggle}
            tenures={tenures}
          />
          <div className="-my-1 touch-pan-y overflow-hidden px-1 select-none sm:px-4">
            <ClockDrawing
              consoleRef={consoleRef}
              ids={ids}
              mask={mask}
              bind={bind}
              onCard={toggle}
              onConsole={() => step(1)}
              onPeek={peekByUser}
              parts={parts}
              peek={peek}
              pockets={pockets}
              projection={projection}
            />
          </div>
          <div className="flex flex-col gap-x-4 gap-y-2 px-4 pb-3 sm:flex-row sm:items-end sm:justify-between">
            <span className="label text-mist shrink-0">
              Hover a card · click to punch it
            </span>
            <ClockReadout
              current={tenures[currentJob]}
              shown={shownOf(peek, desk)}
              tenures={tenures}
            />
          </div>
          <p aria-live="polite" className="sr-only">
            {spoken}
          </p>
        </div>
        <figcaption className="text-graphite text-sm leading-relaxed text-pretty">
          {caption}
        </figcaption>
      </figure>
    </div>
  );
};
