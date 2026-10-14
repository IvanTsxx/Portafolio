"use client";

import { useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";

import { ExperimentStage } from "@/components/lab/experiment-stage";
import {
  ActionControl,
  SliderControl,
  ToggleControl,
} from "@/components/lab/lab-controls";
import { posterLight } from "@/components/lab/source/form-tone";
import type { LightPoint } from "@/components/lab/source/form-tone";
import { lightFromStage } from "@/components/lab/source/ink-raster";
import { sourceOptions } from "@/components/lab/source/tone-chunk";
import { usePortraitImage } from "@/components/lab/source/use-portrait-image";
import { useElementSize } from "@/components/lab/use-element-size";
import { useStageActivity } from "@/components/lab/use-stage-activity";

import { usePlotter } from "./use-plotter";
import type { PlotPhase, PlotSettings, PlotSurfaces } from "./use-plotter";

const penLabel = {
  done: "Replay",
  paused: "Play",
  plotting: "Pause",
} as const satisfies Record<PlotPhase, string>;

const lightAt = (event: PointerEvent<HTMLDivElement>) => {
  const bounds = event.currentTarget.getBoundingClientRect();
  return lightFromStage(
    {
      x: (event.clientX - bounds.left) / bounds.width,
      y: 1 - (event.clientY - bounds.top) / bounds.height,
    },
    bounds.width / Math.max(bounds.height, 1)
  );
};

const PlotterHatchingPreview = () => {
  const { activity, isOnscreen, isReduced, ref } =
    useStageActivity<HTMLDivElement>();
  const [settings, setSettings] = useState<PlotSettings>({
    layers: 3,
    pitch: 7,
    source: "form",
    speed: 1.5,
  });
  const [light, setLight] = useState<LightPoint>(posterLight);
  const canvas = useRef<HTMLCanvasElement>(null);
  const penHead = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLParagraphElement>(null);
  const surfaces = useMemo<PlotSurfaces>(
    () => ({ canvas, penHead, readout }),
    []
  );
  const field = useRef<HTMLDivElement>(null);
  const size = useElementSize(field);
  const portrait = usePortraitImage(settings.source === "portrait");
  const { phase, progress, scrub, togglePen } = usePlotter({
    isOnscreen,
    isReduced,
    light,
    portrait,
    settings,
    size,
    surfaces,
  });

  return (
    <ExperimentStage
      activity={activity}
      controls={
        <>
          <ToggleControl
            label="Source"
            onChange={(source) =>
              setSettings((current) => ({ ...current, source }))
            }
            options={sourceOptions}
            value={settings.source}
          />
          <SliderControl
            format={(value) => `${value} of 3`}
            hint="Each layer starts at a darker tone and turns the pen."
            label="Hatch layers"
            max={3}
            min={1}
            onChange={(layers) =>
              setSettings((current) => ({ ...current, layers }))
            }
            value={settings.layers}
          />
          <SliderControl
            format={(value) => `${value}px`}
            label="Line pitch"
            max={14}
            min={4}
            onChange={(pitch) =>
              setSettings((current) => ({ ...current, pitch }))
            }
            value={settings.pitch}
          />
          <SliderControl
            disabled={isReduced}
            format={(value) => `${value}×`}
            label="Pen speed"
            max={6}
            min={0.5}
            onChange={(speed) =>
              setSettings((current) => ({ ...current, speed }))
            }
            step={0.5}
            value={settings.speed}
          />
          <SliderControl
            format={(value) => `${value}%`}
            hint="Drag to scrub the plot. Click the stage to move the light and replot."
            label="Plotted"
            max={100}
            min={0}
            onChange={scrub}
            value={progress}
          />
          <ActionControl
            actionLabel={penLabel[phase]}
            disabled={isReduced}
            label="Pen"
            onAction={togglePen}
          />
        </>
      }
      reducedNote="Reduced motion is on. The finished plot draws in one frame. Scrub to see the stroke order."
      stageLabel="A pen plotter hatching a lit form stroke by stroke in up to three layers"
      stageRef={ref}
    >
      <div
        className="relative size-full cursor-crosshair touch-pan-y select-none"
        onPointerDown={(event) => setLight(lightAt(event))}
        ref={field}
      >
        <canvas
          aria-hidden
          className="text-ink absolute inset-0 size-full"
          ref={canvas}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-0"
          ref={penHead}
        >
          <span className="bg-ink absolute -top-3 left-0 h-6 w-px" />
          <span className="bg-ink absolute top-0 -left-3 h-px w-6" />
          <span className="border-ink absolute -top-1.5 -left-1.5 size-3 border" />
        </div>
        <p
          aria-live="off"
          className="label bg-paper/90 text-graphite border-rule-strong pointer-events-none absolute top-4 right-5 border px-2 py-1 tabular-nums"
          ref={readout}
        >
          Planning
        </p>
      </div>
    </ExperimentStage>
  );
};

export default PlotterHatchingPreview;
