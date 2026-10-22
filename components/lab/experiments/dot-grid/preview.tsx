"use client";

import type { PointerEvent } from "react";
import { useId, useRef, useState } from "react";

import { ExperimentStage } from "@/components/lab/experiment-stage";
import { SliderControl, ToggleControl } from "@/components/lab/lab-controls";
import { imageSourceOptions } from "@/components/lab/source/tone-chunk";
import { useStageActivity } from "@/components/lab/use-stage-activity";
import {
  requestSceneFrame,
  useViewSlot,
} from "@/components/scene/view-registry";

import DotView from "./dot-view";
import type { DotPointer, DotSettings } from "./dot-view";

const markOptions = [
  { label: "Round", value: "round" },
  { label: "Square", value: "square" },
] as const;

const trackPointer = (
  pointer: DotPointer,
  event: PointerEvent<HTMLDivElement>
) => {
  const bounds = event.currentTarget.getBoundingClientRect();
  pointer.x = (event.clientX - bounds.left) / bounds.width;
  pointer.y = 1 - (event.clientY - bounds.top) / bounds.height;
  pointer.isHovering = true;
  requestSceneFrame();
};

const DotGridPreview = () => {
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const [settings, setSettings] = useState<DotSettings>({
    cell: 12,
    lensRadius: 120,
    mark: "round",
    source: "rocky",
  });

  const animate = activity === "running";
  const field = useRef<HTMLDivElement>(null);
  const slotId = useId();
  const pointer = useRef<DotPointer>({
    isHovering: false,
    x: 0.5,
    y: 0.5,
  });

  useViewSlot(
    slotId,
    field,
    <DotView animate={animate} pointer={pointer} settings={settings} />
  );

  return (
    <ExperimentStage
      activity={activity}
      className="[&>p]:z-40 [&>span]:z-40"
      controls={
        <>
          <ToggleControl
            label="Source"
            onChange={(source) =>
              setSettings((current) => ({ ...current, source }))
            }
            options={imageSourceOptions}
            value={settings.source}
          />
          <SliderControl
            format={(value) => `${value}px`}
            label="Density"
            max={24}
            min={6}
            onChange={(cell) =>
              setSettings((current) => ({ ...current, cell }))
            }
            value={settings.cell}
          />
          <SliderControl
            format={(value) => `${value}px`}
            label="Lens radius"
            max={240}
            min={40}
            onChange={(lensRadius) =>
              setSettings((current) => ({ ...current, lensRadius }))
            }
            step={10}
            value={settings.lensRadius}
          />
          <ToggleControl
            label="Mark"
            onChange={(mark) =>
              setSettings((current) => ({ ...current, mark }))
            }
            options={markOptions}
            value={settings.mark}
          />
        </>
      }
      reducedNote="Reduced motion is on. The grid holds a single frame. The lens jumps to the pointer without springing."
      stageLabel="Halftone dot grid of a picture that swells around the pointer"
      stageRef={ref}
    >
      <div
        className="pointer-events-auto size-full cursor-crosshair touch-pan-y"
        onPointerLeave={() => {
          pointer.current.isHovering = false;
          requestSceneFrame();
        }}
        onPointerMove={(event) => trackPointer(pointer.current, event)}
        ref={field}
      />
    </ExperimentStage>
  );
};

export default DotGridPreview;
