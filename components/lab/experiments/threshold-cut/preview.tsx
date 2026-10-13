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

import CutView from "./cut-view";
import type { ThresholdCutSettings } from "./cut-view";

const ThresholdCutPreview = () => {
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const [settings, setSettings] = useState<ThresholdCutSettings>({
    roughness: 45,
    source: "form",
    sweep: 0.5,
    threshold: 50,
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
    <CutView
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
          <SliderControl
            format={(value) => `${value}%`}
            label="Threshold"
            max={80}
            min={20}
            onChange={(threshold) =>
              setSettings((current) => ({ ...current, threshold }))
            }
            step={1}
            value={settings.threshold}
          />
          <SliderControl
            format={(value) => `${value}%`}
            label="Roughness"
            max={100}
            min={0}
            onChange={(roughness) =>
              setSettings((current) => ({ ...current, roughness }))
            }
            step={1}
            value={settings.roughness}
          />
          <SliderControl
            format={(value) => `${value.toFixed(1)}×`}
            label="Sweep speed"
            max={2}
            min={0}
            onChange={(sweep) =>
              setSettings((current) => ({ ...current, sweep }))
            }
            step={0.1}
            value={settings.sweep}
          />
        </>
      }
      reducedNote="Reduced motion is on. The threshold holds still. The pointer still pushes it."
      stageLabel="A lit form cut to two tones like a rubber stamp, with a threshold that sweeps and bends at the pointer"
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

export default ThresholdCutPreview;
