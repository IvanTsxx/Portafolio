"use client";

import { useId, useRef, useState } from "react";

import { ExperimentStage } from "@/components/lab/experiment-stage";
import { SliderControl, ToggleControl } from "@/components/lab/lab-controls";
import {
  imageSourceOptions,
  sourceImages,
} from "@/components/lab/source/tone-chunk";
import {
  releaseStagePointer,
  trackStagePointer,
} from "@/components/lab/source/use-source";
import type { StagePointer } from "@/components/lab/source/use-source";
import { useStageActivity } from "@/components/lab/use-stage-activity";
import { useViewSlot } from "@/components/scene/view-registry";

import EngravingView from "./engraving-view";
import type { EngravingSettings } from "./engraving-view";

const EngravingPreview = () => {
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const [settings, setSettings] = useState<EngravingSettings>({
    angle: 30,
    follow: 70,
    pitch: 6,
    source: "ippo",
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
    <EngravingView
      animate={activity === "running"}
      pointer={pointer}
      settings={settings}
    />
  );

  return (
    <ExperimentStage
      activity={activity}
      before={sourceImages[settings.source]}
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
            label="Line pitch"
            max={14}
            min={3}
            onChange={(pitch) =>
              setSettings((current) => ({ ...current, pitch }))
            }
            step={0.5}
            value={settings.pitch}
          />
          <SliderControl
            format={(value) => `${value}°`}
            label="Angle"
            max={180}
            min={0}
            onChange={(angle) =>
              setSettings((current) => ({ ...current, angle }))
            }
            value={settings.angle}
          />
          <SliderControl
            format={(value) => `${value}%`}
            hint="How far each line bends over the relief."
            label="Contour follow"
            max={100}
            min={0}
            onChange={(follow) =>
              setSettings((current) => ({ ...current, follow }))
            }
            step={5}
            value={settings.follow}
          />
        </>
      }
      reducedNote="Reduced motion is on. The light holds still. It jumps to the pointer without easing."
      stageLabel="Line engraving of a lit form whose lines swell in shadow and bend over the relief"
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

export default EngravingPreview;
