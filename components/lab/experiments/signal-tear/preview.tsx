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

import TearView from "./tear-view";
import type { TearSettings } from "./tear-view";

const percent = (value: number) => `${value}%`;

const SignalTearPreview = () => {
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const [settings, setSettings] = useState<TearSettings>({
    ghost: 60,
    grain: 60,
    source: "messi",
    tear: 50,
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
    <TearView
      animate={activity === "running"}
      pointer={pointer}
      settings={settings}
    />
  );

  return (
    <ExperimentStage
      activity={activity}
      before={sourceImages[settings.source]}
      className="[&>span]:z-40"
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
            format={percent}
            hint="Rows near the pointer tear first."
            label="Tear"
            max={100}
            min={0}
            onChange={(tear) =>
              setSettings((current) => ({ ...current, tear }))
            }
            step={5}
            value={settings.tear}
          />
          <SliderControl
            format={percent}
            label="Ghost"
            max={100}
            min={0}
            onChange={(ghost) =>
              setSettings((current) => ({ ...current, ghost }))
            }
            step={5}
            value={settings.ghost}
          />
          <SliderControl
            format={percent}
            label="Grain"
            max={100}
            min={0}
            onChange={(grain) =>
              setSettings((current) => ({ ...current, grain }))
            }
            step={5}
            value={settings.grain}
          />
        </>
      }
      reducedNote="Reduced motion is on. One torn frame holds still."
      stageLabel="A grainy picture whose rows tear sideways and leave light trails near the pointer"
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

export default SignalTearPreview;
