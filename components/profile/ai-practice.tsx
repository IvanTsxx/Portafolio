"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { RefObject } from "react";

import { AgentScene } from "@/components/scene/agent-scene";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
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
}

const PracticeCell = ({
  id,
  span,
  isActive,
  sceneId,
  onPin,
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
          onClick={() => onPin(id)}
          onFocus={() => onPin(id)}
          onPointerEnter={() => onPin(id)}
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

const useScrolledScene = (track: RefObject<HTMLElement | null>) => {
  const [scene, setScene] = useState<AgentSceneId>(sceneCycle[0]);

  useEffect(() => {
    const element = track.current;
    if (!element) {
      return;
    }
    let frame = 0;
    const measure = () => {
      frame = 0;
      const index = Math.floor(progressThrough(element) * sceneCycle.length);
      setScene(sceneCycle[index] ?? sceneCycle[0]);
    };
    const schedule = () => {
      if (frame === 0) {
        frame = requestAnimationFrame(measure);
      }
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [track]);

  return scene;
};

const SceneTile = ({
  id,
  scene,
  isCovered,
  onCovered,
  span,
}: {
  id: string;
  scene: AgentSceneId;
  isCovered: boolean;
  onCovered: () => void;
  span: string;
}) => {
  const caption = sceneCaptions[scene];
  return (
    <li
      className={cn(
        "border-rule bg-paper-deep/40 relative flex flex-col border-r border-b",
        span
      )}
      id={id}
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
              ? "ease-out-quart opacity-100 duration-150"
              : "ease-out-quint opacity-0 duration-300"
          )}
          onTransitionEnd={(event) => {
            if (event.propertyName === "opacity" && isCovered) {
              onCovered();
            }
          }}
        />
      </div>
      <p className="label border-rule flex items-baseline justify-between border-t px-4 py-2">
        <span className="flex items-baseline gap-2">
          <span className="text-mist tabular-nums">{caption.code}</span>
          <span aria-live="polite" className="text-ink">
            {caption.label}
          </span>
        </span>
        <span className="jp text-mist">{caption.jp}</span>
      </p>
    </li>
  );
};

export const AiPractice = () => {
  const grid = useRef<HTMLUListElement>(null);
  const sceneId = useId();
  const isReduced = useReducedMotion();
  const scrolledScene = useScrolledScene(grid);
  const [pin, setPin] = useState<{
    cell: PracticeId;
    scrolledScene: AgentSceneId;
  } | null>(null);
  const pinnedCell = pin?.scrolledScene === scrolledScene ? pin.cell : null;
  const pinnedScene = pinnedCell ? sceneForPractice[pinnedCell] : undefined;
  const requestedScene = pinnedScene ?? scrolledScene;
  const [shownScene, setShownScene] = useState<AgentSceneId>(requestedScene);

  if (isReduced && shownScene !== requestedScene) {
    setShownScene(requestedScene);
  }

  const isActiveCell = (id: PracticeId) =>
    pinnedCell ? pinnedCell === id : sceneForPractice[id] === scrolledScene;

  const pinCell = (cell: PracticeId) => setPin({ cell, scrolledScene });

  return (
    <SectionFrame
      aside={
        <PanelCount current={aiPractice.length} total={aiPractice.length} />
      }
      id="ai-practice"
      index="GH-08"
      jp="AI実務"
      label="AI practice"
    >
      <ul
        className="border-rule grid border-t border-l md:grid-cols-2 lg:grid-cols-12"
        ref={grid}
      >
        {practiceTiles.map((tile) =>
          tile.kind === "cell" ? (
            <PracticeCell
              id={tile.id}
              isActive={isActiveCell(tile.id)}
              key={tile.id}
              onPin={pinCell}
              sceneId={sceneId}
              span={tile.span}
            />
          ) : (
            <SceneTile
              id={sceneId}
              isCovered={shownScene !== requestedScene}
              key="scene"
              onCovered={() => setShownScene(requestedScene)}
              scene={shownScene}
              span={tile.span}
            />
          )
        )}
      </ul>
    </SectionFrame>
  );
};
