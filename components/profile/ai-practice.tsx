"use client";

import { useEffect, useId, useReducer, useRef, useState } from "react";
import type { Dispatch, RefObject } from "react";

import { AgentScene } from "@/components/scene/agent-scene";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type {
  SceneSchedule,
  SceneScheduleEvent,
} from "@/lib/agents/scene-schedule";
import {
  createSceneSchedule,
  msUntilAdvance,
  shownSceneIndex,
  stepSceneSchedule,
} from "@/lib/agents/scene-schedule";
import type { AgentSceneId } from "@/lib/agents/scenes";
import { aiPractice } from "@/lib/site/practice";
import { cn } from "@/lib/utils";

import { TickMark } from "./module";
import { PanelCount, SectionFrame } from "./section-frame";

type PracticeId = (typeof aiPractice)[number]["id"];

type PracticeTile =
  | { kind: "cell"; id: PracticeId; span: string }
  | { kind: "scene"; span: string };

const practiceTiles: readonly PracticeTile[] = [
  { id: "conductor", kind: "cell", span: "lg:col-span-4" },
  { id: "agents", kind: "cell", span: "lg:col-span-3" },
  { kind: "scene", span: "md:col-span-2 lg:col-span-5 lg:row-span-2" },
  { id: "skills", kind: "cell", span: "lg:col-span-3" },
  { id: "mcp", kind: "cell", span: "lg:col-span-4" },
  { id: "design-to-code", kind: "cell", span: "lg:col-span-6" },
  { id: "judgment", kind: "cell", span: "lg:col-span-6" },
];

const sceneForPractice: Partial<Record<PracticeId, AgentSceneId>> = {
  agents: "feature",
  "design-to-code": "figma-to-code",
  judgment: "debugging",
  mcp: "code-search",
  skills: "code-search",
};

const sceneCycle = [
  "feature",
  "code-search",
  "figma-to-code",
  "debugging",
] as const satisfies readonly AgentSceneId[];

const sceneCaptions = {
  "code-search": { code: "SC-02", jp: "探索", label: "Code search" },
  debugging: { code: "SC-04", jp: "調査", label: "Debugging" },
  feature: { code: "SC-01", jp: "機能", label: "Feature" },
  "figma-to-code": { code: "SC-03", jp: "変換", label: "Figma to code" },
} as const satisfies Record<
  AgentSceneId,
  { code: string; jp: string; label: string }
>;

const practiceById = new Map(
  aiPractice.map((entry, index) => [entry.id, { ...entry, index }])
);

const cellBody = "relative flex min-h-56 flex-col gap-3 p-4 md:p-5";

interface PracticeCellProps {
  id: PracticeId;
  span: string;
  isActive: boolean;
  sceneId: string;
  onPin: (id: PracticeId) => void;
  onRelease: () => void;
}

const PracticeCell = ({
  id,
  span,
  isActive,
  sceneId,
  onPin,
  onRelease,
}: PracticeCellProps) => {
  const entry = practiceById.get(id);
  if (!entry) {
    return null;
  }
  const content = (
    <>
      <TickMark />
      <p className="label flex items-baseline justify-between">
        <span className="text-mist tabular-nums">
          AI-{String(entry.index + 1).padStart(2, "0")}
        </span>
        <span className="jp text-mist">{entry.jp}</span>
      </p>
      <h3 className="text-ink text-xl leading-tight font-light tracking-tight text-balance">
        {entry.title}
      </h3>
      <p className="text-graphite max-w-xs text-sm leading-relaxed text-pretty">
        {entry.summary}
      </p>
      <span
        aria-hidden
        className={cn(
          "jp mt-auto text-6xl leading-none font-light transition-colors duration-300 select-none",
          isActive ? "text-graphite/50" : "text-graphite/25"
        )}
      >
        {entry.jp}
      </span>
    </>
  );
  const hasScene = sceneForPractice[id] !== undefined;
  return (
    <li
      className={cn(
        "border-rule border-r border-b transition-colors duration-300",
        isActive && "bg-paper-deep/40",
        span
      )}
    >
      {hasScene ? (
        <button
          aria-controls={sceneId}
          aria-pressed={isActive}
          className={cn(
            cellBody,
            "focus-visible:outline-ink size-full cursor-default text-left focus-visible:outline-1 focus-visible:-outline-offset-4"
          )}
          onBlur={onRelease}
          onClick={() => onPin(id)}
          onFocus={() => onPin(id)}
          onPointerEnter={() => onPin(id)}
          onPointerLeave={onRelease}
          type="button"
        >
          {content}
        </button>
      ) : (
        <div className={cellBody}>{content}</div>
      )}
    </li>
  );
};

const progressThrough = (element: HTMLElement) => {
  const box = element.getBoundingClientRect();
  const start = window.innerHeight * 0.7;
  return Math.min(0.999, Math.max(0, (start - box.top) / box.height));
};

const scrollIndexOf = (element: HTMLElement) =>
  Math.floor(progressThrough(element) * sceneCycle.length);

const reduceSchedule = (schedule: SceneSchedule, event: SceneScheduleEvent) =>
  stepSceneSchedule(schedule, event, sceneCycle.length);

const useScrollQueue = (
  track: RefObject<HTMLElement | null>,
  dispatch: Dispatch<SceneScheduleEvent>,
  isEnabled: boolean
) => {
  useEffect(() => {
    const element = track.current;
    if (!(element && isEnabled)) {
      return;
    }
    let frame = 0;
    const measure = () => {
      frame = 0;
      dispatch({ index: scrollIndexOf(element), kind: "scroll" });
    };
    const schedule = () => {
      if (frame === 0) {
        frame = requestAnimationFrame(measure);
      }
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [dispatch, isEnabled, track]);
};

const useInView = (track: RefObject<HTMLElement | null>) => {
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const element = track.current;
    if (!element) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry?.isIntersecting ?? false),
      { threshold: 0.35 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [track]);
  return isInView;
};

const useSceneSchedule = (
  grid: RefObject<HTMLElement | null>,
  tile: RefObject<HTMLElement | null>,
  isReduced: boolean
) => {
  const [schedule, dispatch] = useReducer(reduceSchedule, null, () =>
    createSceneSchedule(0, 0)
  );
  const isInView = useInView(tile);
  const isAutoplaying = isInView && !isReduced && schedule.pinned === null;

  useScrollQueue(grid, dispatch, !isReduced);

  useEffect(() => {
    if (isInView) {
      dispatch({ kind: "wake", now: performance.now() });
    }
  }, [isInView]);

  useEffect(() => {
    if (!isAutoplaying) {
      return;
    }
    const timer = window.setTimeout(
      () => {
        dispatch({ kind: "tick", now: performance.now() });
      },
      msUntilAdvance(schedule, performance.now()) + 20
    );
    return () => window.clearTimeout(timer);
  }, [isAutoplaying, schedule]);

  return { dispatch, schedule };
};

const SceneTicks = ({ scene }: { scene: AgentSceneId }) => {
  const activeIndex = sceneCycle.indexOf(scene);
  return (
    <ol
      aria-label={`Scene ${activeIndex + 1} of ${sceneCycle.length}`}
      className="flex items-center gap-2"
    >
      {sceneCycle.map((entry, index) => (
        <li
          aria-current={entry === scene ? "step" : undefined}
          className="flex items-center gap-1"
          key={entry}
        >
          <span
            aria-hidden
            className={cn(
              "border-ink block h-1.5 w-3 border transition-colors duration-300 motion-reduce:transition-none",
              entry === scene ? "bg-ink" : "bg-transparent"
            )}
          />
          <span
            className={cn(
              "tabular-nums transition-colors duration-300 motion-reduce:transition-none",
              entry === scene ? "text-ink" : "text-mist"
            )}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </li>
      ))}
    </ol>
  );
};

const SceneTile = ({
  id,
  scene,
  isCovered,
  onCovered,
  span,
  ref,
}: {
  id: string;
  scene: AgentSceneId;
  isCovered: boolean;
  onCovered: () => void;
  span: string;
  ref: RefObject<HTMLLIElement | null>;
}) => {
  const caption = sceneCaptions[scene];
  return (
    <li
      className={cn(
        "border-rule bg-paper-deep/40 relative flex flex-col border-r border-b",
        span
      )}
      id={id}
      ref={ref}
    >
      <div className="relative flex-1">
        <AgentScene
          className="lg:aspect-auto lg:h-full lg:min-h-96"
          label={`${caption.label} scene: agents at work`}
          scene={scene}
        />
        <span
          aria-hidden
          className={cn(
            "bg-paper blueprint-grid pointer-events-none absolute inset-0 z-40 transition-opacity motion-reduce:transition-none",
            isCovered
              ? "ease-out-quart opacity-100 duration-200"
              : "ease-out-quint opacity-0 duration-500"
          )}
          onTransitionEnd={(event) => {
            if (event.propertyName === "opacity" && isCovered) {
              onCovered();
            }
          }}
        />
      </div>
      <div className="label border-rule flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t px-4 py-2">
        <p className="flex items-baseline gap-2">
          <span className="text-mist tabular-nums">{caption.code}</span>
          <span className="text-ink">{caption.label}</span>
          <span className="jp text-mist">{caption.jp}</span>
        </p>
        <SceneTicks scene={scene} />
      </div>
    </li>
  );
};

export const AiPractice = () => {
  const grid = useRef<HTMLUListElement>(null);
  const tile = useRef<HTMLLIElement>(null);
  const sceneId = useId();
  const isReduced = useReducedMotion();
  const { dispatch, schedule } = useSceneSchedule(grid, tile, isReduced);
  const [pinnedCell, setPinnedCell] = useState<PracticeId | null>(null);
  const requestedScene = sceneCycle[shownSceneIndex(schedule)] ?? sceneCycle[0];
  const [shownScene, setShownScene] = useState<AgentSceneId>(requestedScene);

  if (isReduced && shownScene !== requestedScene) {
    setShownScene(requestedScene);
  }

  const isActiveCell = (id: PracticeId) =>
    pinnedCell ? pinnedCell === id : sceneForPractice[id] === requestedScene;

  const pinCell = (cell: PracticeId) => {
    const scene = sceneForPractice[cell];
    if (!scene) {
      return;
    }
    setPinnedCell(cell);
    dispatch({
      index: sceneCycle.indexOf(scene),
      kind: "pin",
      now: performance.now(),
    });
  };

  const releaseCell = () => {
    setPinnedCell(null);
    dispatch({ kind: "unpin", now: performance.now() });
  };

  return (
    <SectionFrame
      aside={
        <PanelCount current={aiPractice.length} total={aiPractice.length} />
      }
      id="ai-practice"
      index="GH-09"
      jp="AI実務"
      label="AI practice"
    >
      <ul
        className="border-rule grid border-t border-l md:grid-cols-2 lg:grid-cols-12"
        ref={grid}
      >
        {practiceTiles.map((entry) =>
          entry.kind === "cell" ? (
            <PracticeCell
              id={entry.id}
              isActive={isActiveCell(entry.id)}
              key={entry.id}
              onPin={pinCell}
              onRelease={releaseCell}
              sceneId={sceneId}
              span={entry.span}
            />
          ) : (
            <SceneTile
              id={sceneId}
              isCovered={shownScene !== requestedScene}
              key="scene"
              onCovered={() => setShownScene(requestedScene)}
              ref={tile}
              scene={shownScene}
              span={entry.span}
            />
          )
        )}
      </ul>
    </SectionFrame>
  );
};
