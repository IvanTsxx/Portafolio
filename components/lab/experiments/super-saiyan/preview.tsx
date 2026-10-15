"use client";

import type { PointerEvent } from "react";
import { useId, useRef, useState } from "react";

import { ExperimentStage } from "@/components/lab/experiment-stage";
import {
  SliderControl,
  SwitchControl,
  ToggleControl,
} from "@/components/lab/lab-controls";
import {
  releaseStagePointer,
  trackStagePointer,
} from "@/components/lab/source/use-source";
import { useStageActivity } from "@/components/lab/use-stage-activity";
import { useViewSlot } from "@/components/scene/view-registry";

import SuperSaiyanView from "./super-saiyan-view";
import type { KiPointer, SuperSaiyanSettings } from "./super-saiyan-view";

const ditherOptions = [
  { label: "Bayer 8×8", value: "bayer" },
  { label: "Blue noise", value: "blue-noise" },
] as const;

const formatThreshold = (value: number) => {
  const percent = Math.round(value * 100);
  return percent > 0 ? `+${percent}` : String(percent);
};

const SuperSaiyanPreview = () => {
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const [settings, setSettings] = useState<SuperSaiyanSettings>({
    cell: 3,
    dither: "bayer",
    lightning: true,
    rain: true,
    threshold: 0,
  });

  const field = useRef<HTMLDivElement>(null);
  const slotId = useId();
  const pointer = useRef<KiPointer>({
    isHovering: false,
    presses: 0,
    x: 0.5,
    y: 0.5,
  });
  const isReduced = activity === "reduced";

  useViewSlot(
    slotId,
    field,
    <SuperSaiyanView
      animate={activity === "running"}
      pointer={pointer}
      settings={settings}
    />
  );

  const powerUp = (event: PointerEvent<HTMLDivElement>) => {
    trackStagePointer(pointer.current, event);
    pointer.current.presses += 1;
  };

  return (
    <ExperimentStage
      activity={activity}
      className="[&>p]:z-40 [&>span]:z-40"
      controls={
        <>
          <SliderControl
            format={(value) => `${value}px`}
            label="Cell size"
            max={8}
            min={2}
            onChange={(cell) =>
              setSettings((current) => ({ ...current, cell }))
            }
            value={settings.cell}
          />
          <SliderControl
            format={formatThreshold}
            hint="Raise it to ink more of the frame."
            label="Threshold"
            max={0.3}
            min={-0.3}
            onChange={(threshold) =>
              setSettings((current) => ({ ...current, threshold }))
            }
            step={0.02}
            value={settings.threshold}
          />
          <ToggleControl
            label="Dither"
            onChange={(dither) =>
              setSettings((current) => ({ ...current, dither }))
            }
            options={ditherOptions}
            value={settings.dither}
          />
          <SwitchControl
            checked={settings.rain}
            label="Rain"
            onChange={(rain) =>
              setSettings((current) => ({ ...current, rain }))
            }
          />
          <SwitchControl
            checked={settings.lightning && !isReduced}
            disabled={isReduced}
            hint={isReduced ? "Off while reduced motion is on." : undefined}
            label="Lightning"
            onChange={(lightning) =>
              setSettings((current) => ({ ...current, lightning }))
            }
          />
        </>
      }
      reducedNote="Reduced motion is on. One still frame. No lightning, no burst. The aura follows the pointer without springing."
      stageLabel="Super Saiyan Goku in the rain, dithered in ink on paper, with a ki aura around the pointer"
      stageRef={ref}
    >
      <div
        className="pointer-events-auto size-full cursor-crosshair touch-pan-y"
        onPointerDown={powerUp}
        onPointerLeave={() => releaseStagePointer(pointer.current)}
        onPointerMove={(event) => trackStagePointer(pointer.current, event)}
        ref={field}
      />
    </ExperimentStage>
  );
};

export default SuperSaiyanPreview;
