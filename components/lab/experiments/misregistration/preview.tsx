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

import PlateView from "./plate-view";
import type { MisregistrationSettings } from "./plate-view";

const plateOptions = [
  { label: "Two", value: "2" },
  { label: "Three", value: "3" },
] as const;

const MisregistrationPreview = () => {
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const [settings, setSettings] = useState<MisregistrationSettings>({
    cell: 9,
    drift: 8,
    plates: "3",
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
    <PlateView
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
            label="Plates"
            onChange={(plates) =>
              setSettings((current) => ({ ...current, plates }))
            }
            options={plateOptions}
            value={settings.plates}
          />
          <SliderControl
            format={(value) => `${value}px`}
            label="Drift"
            max={24}
            min={0}
            onChange={(drift) =>
              setSettings((current) => ({ ...current, drift }))
            }
            step={1}
            value={settings.drift}
          />
          <SliderControl
            format={(value) => `${value}px`}
            label="Cell size"
            max={20}
            min={5}
            onChange={(cell) =>
              setSettings((current) => ({ ...current, cell }))
            }
            value={settings.cell}
          />
        </>
      }
      reducedNote="Reduced motion is on. The plates hold still. Hovering registers them at once."
      stageLabel="Halftone ink plates printed out of register that align around the pointer"
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

export default MisregistrationPreview;
