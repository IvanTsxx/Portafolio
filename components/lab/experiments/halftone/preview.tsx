"use client";

import { useId, useRef, useState } from "react";

import { ExperimentStage } from "@/components/lab/experiment-stage";
import { SliderControl, ToggleControl } from "@/components/lab/lab-controls";
import { sourceOptions } from "@/components/lab/source/tone-chunk";
import {
  releaseStagePointer,
  trackStagePointer,
} from "@/components/lab/source/use-source";
import type { StagePointer } from "@/components/lab/source/use-source";
import { useStageActivity } from "@/components/lab/use-stage-activity";
import { useViewSlot } from "@/components/scene/view-registry";

import HalftoneView from "./halftone-view";
import type { HalftoneSettings } from "./halftone-view";

const markOptions = [
  { label: "Round", value: "round" },
  { label: "Line", value: "line" },
  { label: "Square", value: "square" },
] as const;

const HalftonePreview = () => {
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const [settings, setSettings] = useState<HalftoneSettings>({
    angle: 45,
    cell: 10,
    mark: "round",
    source: "form",
  });

  const field = useRef<HTMLDivElement>(null);
  const slotId = useId();
  const pointer = useRef<StagePointer>({
    isHovering: false,
    x: 0.5,
    y: 0.5,
  });

  useViewSlot(
    slotId,
    field,
    <HalftoneView
      animate={activity === "running"}
      pointer={pointer}
      settings={settings}
    />
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
            options={sourceOptions}
            value={settings.source}
          />
          <ToggleControl
            label="Mark"
            onChange={(mark) =>
              setSettings((current) => ({ ...current, mark }))
            }
            options={markOptions}
            value={settings.mark}
          />
          <SliderControl
            format={(value) => `${value}px`}
            label="Cell size"
            max={28}
            min={5}
            onChange={(cell) =>
              setSettings((current) => ({ ...current, cell }))
            }
            value={settings.cell}
          />
          <SliderControl
            format={(value) => `${value}°`}
            label="Screen angle"
            max={90}
            min={0}
            onChange={(angle) =>
              setSettings((current) => ({ ...current, angle }))
            }
            step={1}
            value={settings.angle}
          />
        </>
      }
      reducedNote="Reduced motion is on. The light holds still. It jumps to the pointer without easing."
      stageLabel="Halftone screen of a lit form that reorganizes around the pointer light"
      stageRef={ref}
    >
      <div
        className="pointer-events-auto size-full cursor-crosshair touch-pan-y"
        onPointerLeave={() => releaseStagePointer(pointer.current)}
        onPointerMove={(event) => trackStagePointer(pointer.current, event)}
        ref={field}
      />
    </ExperimentStage>
  );
};

export default HalftonePreview;
