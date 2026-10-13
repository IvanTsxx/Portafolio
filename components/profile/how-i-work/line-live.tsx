"use client";

import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent, ReactNode } from "react";

import {
  setFigureFocus,
  useFigureStation,
} from "@/components/iso/figure-stations";
import { CornerMarks } from "@/components/site/corner-marks";
import { workSteps } from "@/lib/site/practice";
import { cn } from "@/lib/utils";

import { holdStepOf, STATION_COUNT, wrap } from "./line-model";
import { toTransform, zShift } from "./line-view";
import { useLineMotion, WATCHED } from "./use-line-motion";

const STATION_ID = "how-i-work";
const STATION_TITLE = "Indexing table";

const CONTROLS = [
  { id: "run", label: "Run the line" },
  { id: "step", label: "Index one station" },
  { id: "hold", label: "Hold the line" },
] as const;

type ControlId = (typeof CONTROLS)[number]["id"];

const padStep = (step: number) => String(step + 1).padStart(2, "0");

const firstSentence = (text: string) => text.split(/(?<=\.)\s/u)[0] ?? text;

const stepOf = (index: number) => workSteps[wrap(index)] ?? workSteps[0];

const focusLine = (index: number) => {
  const step = stepOf(index);
  return `${step.title}: ${firstSentence(step.summary)}`;
};

const stationAt = (target: EventTarget | null) => {
  const element = target instanceof Element ? target : null;
  const station =
    element?.closest<SVGGElement>("[data-station]")?.dataset.station;
  return station === undefined ? null : Number(station);
};

const statusOf = ({
  hovered,
  isRunning,
  pinned,
  shown,
}: {
  hovered: number | null;
  isRunning: boolean;
  pinned: number | null;
  shown: number;
}) => {
  const place = `step ${shown + 1} of ${STATION_COUNT}`;
  if (hovered !== null) {
    return `station · ${place}`;
  }
  if (pinned !== null) {
    return pinned === shown
      ? `pinned · ${place}`
      : `to ${stepOf(pinned).title} · ${place}`;
  }
  return `${isRunning ? "running" : "held"} · ${place}`;
};

export interface LineLiveProps {
  caption: string;
  drawing: ReactNode;
  label: string;
}

export const LineLive = ({ caption, drawing, label }: LineLiveProps) => {
  const root = useRef<HTMLElement>(null);
  const consoleRef = useRef<Element | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [holdAt, setHoldAt] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [step, setStep] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const stopAt = pinned ?? holdAt;
  const motion = useLineMotion({
    onStep: setStep,
    root,
    soloStation: hovered,
    stopAt,
  });
  const shown = hovered ?? step;
  const shownStep = stepOf(shown);
  const spoken = pinned ?? step;

  const holdHere = () => holdStepOf(motion.lineNow(), WATCHED);

  const hover = (station: number | null) => {
    if (station === hovered) {
      return;
    }
    setHovered(station);
    if (station === null) {
      setFigureFocus(STATION_ID, null);
      if (isRunning && pinned === null) {
        setHoldAt(null);
      }
      return;
    }
    setFigureFocus(STATION_ID, focusLine(station));
    if (pinned === null && holdAt === null) {
      setHoldAt(holdHere());
    }
  };

  const pin = (station: number | null) => {
    setPinned(station);
    if (station === null) {
      setHoldAt(isRunning ? null : holdHere());
      setAnnouncement(isRunning ? "Line running" : "Line held");
      return;
    }
    if (motion.isReduced) {
      setStep(station);
    }
    const target = stepOf(station);
    setAnnouncement(`${target.title}: ${target.summary}`);
  };

  const togglePin = (station: number) =>
    pin(pinned === station ? null : station);

  const press = (control: ControlId) => {
    const index = CONTROLS.findIndex((entry) => entry.id === control);
    const button = root.current?.querySelector(`[data-control="${index}"]`);
    button?.setAttribute("transform", toTransform(zShift(-1)));
    window.setTimeout(() => button?.removeAttribute("transform"), 180);
  };

  const operate = (control: string) => {
    if (control === "run") {
      press("run");
      setIsRunning(true);
      setPinned(null);
      setHoldAt(null);
      setAnnouncement("Line running");
    } else if (control === "hold") {
      press("hold");
      setIsRunning(false);
      setPinned(null);
      const here = holdHere();
      setHoldAt(here);
      setAnnouncement(`Line held at ${stepOf(here).title}`);
    } else if (control === "step") {
      press("step");
      pin(wrap((pinned ?? holdHere()) + 1));
    }
  };

  useLayoutEffect(() => {
    consoleRef.current = root.current?.querySelector("[data-console]") ?? null;
  }, []);

  useFigureStation({
    consoleRef,
    controls: CONTROLS,
    figureRef: root,
    id: STATION_ID,
    onOperate: operate,
    title: STATION_TITLE,
  });

  useLayoutEffect(() => {
    const node = root.current;
    if (!node) {
      return;
    }
    for (const group of node.querySelectorAll<SVGGElement>("[data-station]")) {
      group.toggleAttribute(
        "data-on",
        hovered !== null && group.dataset.station === String(hovered)
      );
    }
    for (const puck of node.querySelectorAll('[data-piece="puck"]')) {
      const nest = puck.closest<SVGGElement>("[data-nest]")?.dataset.nest;
      puck.toggleAttribute(
        "data-on",
        hovered === null && nest === String(WATCHED)
      );
    }
  }, [hovered]);

  const onStagePointer = useEffectEvent((event: PointerEvent) => {
    if (event.type === "pointerleave") {
      hover(null);
    } else if (event.pointerType === "mouse") {
      hover(stationAt(event.target));
    }
  });

  const onStageClick = useEffectEvent((event: MouseEvent) => {
    const station = stationAt(event.target);
    if (station !== null) {
      togglePin(station);
    }
  });

  useEffect(() => {
    const node = stage.current;
    if (!node) {
      return;
    }
    const pointer = (event: PointerEvent) => onStagePointer(event);
    const click = (event: MouseEvent) => onStageClick(event);
    node.addEventListener("pointerover", pointer);
    node.addEventListener("pointerleave", pointer);
    node.addEventListener("click", click);
    return () => {
      node.removeEventListener("pointerover", pointer);
      node.removeEventListener("pointerleave", pointer);
      node.removeEventListener("click", click);
    };
  }, []);

  const releaseOnEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape" && pinned !== null) {
      pin(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <figure
        className="iso m-0 flex flex-col gap-2"
        data-build-block
        data-build-self
        ref={root}
      >
        <div className="border-rule-strong bg-paper has-[input:focus-visible]:outline-ink relative flex flex-col border outline-offset-4 has-[input:focus-visible]:outline-1">
          <CornerMarks />
          <div className="label text-graphite flex items-start justify-between gap-4 px-4 pt-3">
            <span className="tabular-nums">Fig 06</span>
            <span className="text-ink">{STATION_TITLE}</span>
          </div>
          <div
            className="-my-1 cursor-pointer touch-pan-y overflow-hidden px-1 select-none sm:px-4"
            ref={stage}
          >
            <input
              aria-label={label}
              aria-valuetext={`Step ${spoken + 1} of ${STATION_COUNT}, ${stepOf(spoken).title}: ${stepOf(spoken).summary}`}
              className="sr-only"
              max={STATION_COUNT}
              min={1}
              onChange={(event) => pin(Number(event.target.value) - 1)}
              onKeyDown={releaseOnEscape}
              step={1}
              type="range"
              value={(pinned ?? step) + 1}
            />
            {drawing}
          </div>
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 px-4 pb-3">
            <span className="label text-mist">
              Point at a station · click to send the part
            </span>
            <span
              className="ml-auto flex max-w-sm flex-col items-end gap-0.5 text-right"
              data-readout
            >
              <span className="label text-graphite tabular-nums">
                {statusOf({
                  hovered,
                  isRunning: isRunning && !motion.isReduced,
                  pinned,
                  shown,
                })}
              </span>
              <span className="text-ink text-sm leading-tight font-medium tracking-tight">
                {`${padStep(shown)} ${shownStep.title}`}
              </span>
              <span className="text-graphite text-sm leading-snug text-pretty">
                {shownStep.summary}
              </span>
            </span>
          </div>
        </div>
        <figcaption className="text-graphite text-sm leading-relaxed text-pretty">
          {caption}
        </figcaption>
      </figure>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <ol
        aria-label="Workflow steps"
        className="grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-6"
      >
        {workSteps.map((entry, index) => (
          <li className="flex" key={entry.id}>
            <button
              aria-pressed={pinned === index}
              className={cn(
                "border-rule focus-visible:outline-ink flex w-full cursor-pointer flex-col items-start gap-1 border px-3 py-2 text-left transition-colors duration-150 focus-visible:outline-1 focus-visible:-outline-offset-4",
                index === shown
                  ? "bg-paper-deep/50 text-ink"
                  : "text-graphite pointer-fine:hover:bg-paper-deep/25"
              )}
              onBlur={() => hover(null)}
              onClick={() => togglePin(index)}
              onFocus={() => hover(index)}
              onKeyDown={releaseOnEscape}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") {
                  hover(index);
                }
              }}
              onPointerLeave={() => hover(null)}
              type="button"
            >
              <span className="label text-mist flex w-full items-baseline justify-between tabular-nums">
                {`ST-${padStep(index)}`}
                <span className="jp">{entry.jp}</span>
              </span>
              <span className="text-base leading-tight font-light tracking-tight">
                {entry.title}
              </span>
              <span className="sr-only">{entry.summary}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
};
