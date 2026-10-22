"use client";

import { useId, useRef, useState } from "react";

import { ExperimentStage } from "@/components/lab/experiment-stage";
import {
  SliderControl,
  SwitchControl,
  ToggleControl,
} from "@/components/lab/lab-controls";
import { useStageReveal } from "@/components/lab/source/stage-reveal";
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

import StippleView from "./stipple-view";
import type { StippleSettings } from "./stipple-view";

const CloudStipplePreview = () => {
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const { onReveal, reveal } = useStageReveal();
  const [settings, setSettings] = useState<StippleSettings>({
    boil: 6,
    contrast: 130,
    dot: 3,
    invert: true,
    source: "clouds",
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
    <StippleView
      reveal={reveal}
      animate={activity === "running"}
      pointer={pointer}
      settings={settings}
    />
  );

  return (
    <ExperimentStage
      activity={activity}
      onReveal={onReveal}
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
            label="Dot pitch"
            max={8}
            min={2}
            onChange={(dot) => setSettings((current) => ({ ...current, dot }))}
            step={0.5}
            value={settings.dot}
          />
          <SliderControl
            format={(value) => `${value}%`}
            label="Contrast"
            max={250}
            min={50}
            onChange={(contrast) =>
              setSettings((current) => ({ ...current, contrast }))
            }
            step={10}
            value={settings.contrast}
          />
          <SliderControl
            format={(value) => `${value}/s`}
            hint="How often the dots are reseeded. 0 holds them."
            label="Boil"
            max={24}
            min={0}
            onChange={(boil) =>
              setSettings((current) => ({ ...current, boil }))
            }
            value={settings.boil}
          />
          <SwitchControl
            checked={settings.invert}
            hint="Paper dots on an ink ground."
            label="Night print"
            onChange={(invert) =>
              setSettings((current) => ({ ...current, invert }))
            }
          />
        </>
      }
      reducedNote="Reduced motion is on. The dots hold still."
      stageLabel="A picture stippled in blue noise dots that brighten under the pointer"
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

export default CloudStipplePreview;
