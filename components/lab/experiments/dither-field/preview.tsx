"use client";

import type { PointerEvent } from "react";
import { useId, useRef, useState } from "react";

import { ExperimentStage } from "@/components/lab/experiment-stage";
import {
  SliderControl,
  SwitchControl,
  ToggleControl,
} from "@/components/lab/lab-controls";
import { useStageActivity } from "@/components/lab/use-stage-activity";
import {
  requestSceneFrame,
  useViewSlot,
} from "@/components/scene/view-registry";

import DitherView from "./dither-view";
import type { DitherPointer, DitherSettings } from "./dither-view";

const matrixOptions = [
  { label: "2×2", value: "2" },
  { label: "4×4", value: "4" },
  { label: "8×8", value: "8" },
] as const;

const trackPointer = (
  pointer: DitherPointer,
  event: PointerEvent<HTMLDivElement>
) => {
  const bounds = event.currentTarget.getBoundingClientRect();
  pointer.x = (event.clientX - bounds.left) / bounds.width;
  pointer.y = 1 - (event.clientY - bounds.top) / bounds.height;
  pointer.isHovering = true;
  requestSceneFrame();
};

const DitherFieldPreview = () => {
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const [settings, setSettings] = useState<DitherSettings>({
    accent: true,
    cell: 4,
    contrast: 1.6,
    matrix: "8",
  });

  const animate = activity === "running";
  const field = useRef<HTMLDivElement>(null);
  const slotId = useId();
  const pointer = useRef<DitherPointer>({
    isHovering: false,
    x: 0.5,
    y: 0.5,
  });

  useViewSlot(
    slotId,
    field,
    <DitherView animate={animate} pointer={pointer} settings={settings} />
  );

  return (
    <ExperimentStage
      activity={activity}
      className="[&>p]:z-40 [&>span]:z-40"
      controls={
        <>
          <SliderControl
            format={(value) => `${value}px`}
            label="Cell size"
            max={12}
            min={2}
            onChange={(cell) =>
              setSettings((current) => ({ ...current, cell }))
            }
            value={settings.cell}
          />
          <SliderControl
            format={(value) => value.toFixed(1)}
            label="Contrast"
            max={3}
            min={0.6}
            onChange={(contrast) =>
              setSettings((current) => ({ ...current, contrast }))
            }
            step={0.1}
            value={settings.contrast}
          />
          <ToggleControl
            hint="Larger matrices resolve more tone levels: 4, 16 or 64."
            label="Bayer matrix"
            onChange={(matrix) =>
              setSettings((current) => ({ ...current, matrix }))
            }
            options={matrixOptions}
            value={settings.matrix}
          />
          <SwitchControl
            checked={settings.accent}
            hint="Cells under the strongest pressure switch to clay."
            label="Clay accent"
            onChange={(accent) =>
              setSettings((current) => ({ ...current, accent }))
            }
          />
        </>
      }
      reducedNote="Reduced motion is on. The field holds a single frame and only redraws when a control changes."
      stageLabel="Dithered noise field that reacts to the pointer"
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

export default DitherFieldPreview;
