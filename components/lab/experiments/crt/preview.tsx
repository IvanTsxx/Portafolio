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

import CrtView from "./crt-view";
import type { CrtSettings } from "./crt-view";

const CrtPreview = () => {
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const [settings, setSettings] = useState<CrtSettings>({
    bandSpeed: 1,
    curvature: 12,
    lines: 96,
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
    <CrtView
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
            label="Curvature"
            max={30}
            min={0}
            onChange={(curvature) =>
              setSettings((current) => ({ ...current, curvature }))
            }
            step={1}
            value={settings.curvature}
          />
          <SliderControl
            format={(value) => `${value} lines`}
            label="Scanlines"
            max={160}
            min={48}
            onChange={(lines) =>
              setSettings((current) => ({ ...current, lines }))
            }
            step={4}
            value={settings.lines}
          />
          <SliderControl
            format={(value) => `${value.toFixed(1)}×`}
            label="Band speed"
            max={3}
            min={0}
            onChange={(bandSpeed) =>
              setSettings((current) => ({ ...current, bandSpeed }))
            }
            step={0.1}
            value={settings.bandSpeed}
          />
        </>
      }
      reducedNote="Reduced motion is on. The refresh band holds still and the pointer does not wobble the image."
      stageLabel="A lit form on a curved monitor printed as ink scanlines, wobbled by the pointer"
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

export default CrtPreview;
