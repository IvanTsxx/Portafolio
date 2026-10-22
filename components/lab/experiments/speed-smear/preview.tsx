"use client";

import { useId, useRef, useState } from "react";

import { ExperimentStage } from "@/components/lab/experiment-stage";
import {
  SliderControl,
  SwitchControl,
  ToggleControl,
} from "@/components/lab/lab-controls";
import { imageSourceOptions } from "@/components/lab/source/tone-chunk";
import {
  releaseStagePointer,
  trackStagePointer,
} from "@/components/lab/source/use-source";
import type { StagePointer } from "@/components/lab/source/use-source";
import { useStageActivity } from "@/components/lab/use-stage-activity";
import { useViewSlot } from "@/components/scene/view-registry";

import SmearView from "./smear-view";
import type { SmearSettings } from "./smear-view";

const SpeedSmearPreview = () => {
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const [settings, setSettings] = useState<SmearSettings>({
    angle: 0,
    dither: true,
    reach: 16,
    smear: 12,
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
    <SmearView
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
            options={imageSourceOptions}
            value={settings.source}
          />
          <SliderControl
            format={(value) => `${value}%`}
            hint="Moving the pointer fast adds more."
            label="Smear"
            max={40}
            min={0}
            onChange={(smear) =>
              setSettings((current) => ({ ...current, smear }))
            }
            value={settings.smear}
          />
          <SliderControl
            format={(value) => `${value}%`}
            label="Reach"
            max={40}
            min={6}
            onChange={(reach) =>
              setSettings((current) => ({ ...current, reach }))
            }
            value={settings.reach}
          />
          <SliderControl
            format={(value) => `${value}°`}
            label="Angle"
            max={180}
            min={0}
            onChange={(angle) =>
              setSettings((current) => ({ ...current, angle }))
            }
            step={5}
            value={settings.angle}
          />
          <SwitchControl
            checked={settings.dither}
            hint="Off shows the continuous tone."
            label="Ordered dither"
            onChange={(dither) =>
              setSettings((current) => ({ ...current, dither }))
            }
          />
        </>
      }
      reducedNote="Reduced motion is on. The smear holds still under the pointer."
      stageLabel="A picture smeared sideways around the pointer, like a head turning fast"
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

export default SpeedSmearPreview;
