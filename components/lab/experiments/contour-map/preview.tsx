"use client";

import type { MouseEvent } from "react";
import { useId, useMemo, useRef, useState } from "react";

import { ExperimentStage } from "@/components/lab/experiment-stage";
import {
  ActionControl,
  SliderControl,
  ToggleControl,
} from "@/components/lab/lab-controls";
import { sourceOptions } from "@/components/lab/source/tone-chunk";
import {
  releaseStagePointer,
  trackStagePointer,
  usePortraitTexture,
} from "@/components/lab/source/use-source";
import type { StagePointer } from "@/components/lab/source/use-source";
import { useStageActivity } from "@/components/lab/use-stage-activity";
import {
  requestSceneFrame,
  useViewSlot,
} from "@/components/scene/view-registry";
import { focusRingClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

import ContourView from "./contour-view";
import type { ContourSettings } from "./contour-view";
import { contourInterval, elevationMetres } from "./contours";
import { groundHeight, lumaGridFromImage } from "./ground";

const maxBenchmarks = 6;

interface Benchmark {
  id: number;
  x: number;
  y: number;
  metres: number;
}

const BenchmarkMark = ({ benchmark }: { benchmark: Benchmark }) => (
  <li
    className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center gap-1"
    style={{
      left: `${benchmark.x * 100}%`,
      top: `${(1 - benchmark.y) * 100}%`,
    }}
  >
    <span className="label text-ink border-ink bg-paper border px-1.5 py-0.5 tabular-nums">
      BM {benchmark.metres}
    </span>
    <svg aria-hidden className="text-ink size-3" viewBox="0 0 12 12">
      <path d="M6 1 11 11H1Z" fill="var(--paper)" stroke="currentColor" />
      <circle cx="6" cy="8" fill="currentColor" r="1.25" />
    </svg>
  </li>
);

const ContourMapPreview = () => {
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const [settings, setSettings] = useState<ContourSettings>({
    hillHeight: 0.35,
    levels: 20,
    source: "form",
  });
  const [benchmarks, setBenchmarks] = useState<readonly Benchmark[]>([]);
  const nextId = useRef(0);

  const field = useRef<HTMLButtonElement>(null);
  const slotId = useId();
  const pointer = useRef<StagePointer>({
    isHovering: false,
    x: 0.5,
    y: 0.5,
  });

  const portrait = usePortraitTexture(settings.source === "portrait");
  const portraitGrid = useMemo(
    () => (portrait ? lumaGridFromImage(portrait.image) : null),
    [portrait]
  );

  useViewSlot(
    slotId,
    field,
    <ContourView
      animate={activity === "running"}
      pointer={pointer}
      settings={settings}
    />
  );

  const dropBenchmark = (event: MouseEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const isKeyboard = event.detail === 0;
    const x = isKeyboard ? 0.5 : (event.clientX - bounds.left) / bounds.width;
    const y = isKeyboard
      ? 0.5
      : 1 - (event.clientY - bounds.top) / bounds.height;
    const aspect = bounds.width / Math.max(bounds.height, 1);
    const height = groundHeight(
      settings.source,
      { x: (x - 0.5) * aspect, y: y - 0.5 },
      aspect,
      portraitGrid
    );
    nextId.current += 1;
    const benchmark = {
      id: nextId.current,
      metres: elevationMetres(height),
      x,
      y,
    };
    setBenchmarks((current) => [...current, benchmark].slice(-maxBenchmarks));
    requestSceneFrame();
  };

  return (
    <ExperimentStage
      activity={activity}
      className="[&>p]:z-40 [&>span]:z-40"
      controls={
        <>
          <ToggleControl
            label="Source"
            onChange={(source) => {
              setSettings((current) => ({ ...current, source }));
              setBenchmarks([]);
            }}
            options={sourceOptions}
            value={settings.source}
          />
          <SliderControl
            format={(value) => `${contourInterval(value)} m`}
            hint="Every fifth line is an index contour."
            label="Interval"
            max={40}
            min={6}
            onChange={(levels) =>
              setSettings((current) => ({ ...current, levels }))
            }
            value={settings.levels}
          />
          <SliderControl
            format={(value) => `${elevationMetres(value)} m`}
            label="Hill height"
            max={0.6}
            min={0}
            onChange={(hillHeight) =>
              setSettings((current) => ({ ...current, hillHeight }))
            }
            step={0.05}
            value={settings.hillHeight}
          />
          <ActionControl
            actionLabel="Clear"
            disabled={benchmarks.length === 0}
            label={`Benchmarks ${benchmarks.length}/${maxBenchmarks}`}
            onAction={() => setBenchmarks([])}
          />
        </>
      }
      reducedNote="Reduced motion is on. The map holds a single frame. The hill jumps to the pointer without springing."
      stageLabel="Topographic contour map of a lit form with a hill that follows the pointer"
      stageRef={ref}
    >
      <button
        aria-label="Drop a benchmark"
        className={cn(
          focusRingClassName,
          "pointer-events-auto relative z-40 block size-full cursor-crosshair touch-pan-y focus-visible:ring-inset"
        )}
        onClick={dropBenchmark}
        onPointerLeave={() => releaseStagePointer(pointer.current)}
        onPointerMove={(event) => trackStagePointer(pointer.current, event)}
        ref={field}
        type="button"
      />
      <ol
        aria-label="Benchmarks"
        className="pointer-events-none absolute inset-0 z-40"
      >
        {benchmarks.map((benchmark) => (
          <BenchmarkMark benchmark={benchmark} key={benchmark.id} />
        ))}
      </ol>
    </ExperimentStage>
  );
};

export default ContourMapPreview;
