"use client";

import type { PointerEvent } from "react";
import { useId, useRef, useState } from "react";

import { ExperimentStage } from "@/components/lab/experiment-stage";
import {
  ActionControl,
  SliderControl,
  ToggleControl,
} from "@/components/lab/lab-controls";
import { orderedDitherOptions } from "@/components/lab/source/ordered-print";
import {
  releaseStagePointer,
  trackStagePointer,
} from "@/components/lab/source/use-source";
import { useStageActivity } from "@/components/lab/use-stage-activity";
import {
  requestSceneFrame,
  useViewSlot,
} from "@/components/scene/view-registry";

import { defaultSettings, vegetaImage } from "./settings";
import type { VegetaSettings } from "./settings";
import VegetaView from "./vegeta-view";
import type { BlastPointer } from "./vegeta-view";

const signed = (value: number) => {
  const percent = Math.round(value * 100);
  return percent > 0 ? `+${percent}` : String(percent);
};

const percent = (value: number) => `${Math.round(value * 100)}%`;

const VegetaPreview = () => {
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const [settings, setSettings] = useState<VegetaSettings>(defaultSettings);

  const field = useRef<HTMLDivElement>(null);
  const slotId = useId();
  const pointer = useRef<BlastPointer>({
    blast: { x: 0.5, y: 0.5 },
    detonations: 0,
    isHovering: false,
    x: 0.5,
    y: 0.5,
  });
  const isReduced = activity === "reduced";

  const set =
    <Key extends keyof VegetaSettings>(key: Key) =>
    (value: VegetaSettings[Key]) =>
      setSettings((current) => ({ ...current, [key]: value }));

  useViewSlot(
    slotId,
    field,
    <VegetaView
      animate={activity === "running"}
      pointer={pointer}
      settings={settings}
    />
  );

  const detonateAt = (x: number, y: number) => {
    pointer.current.blast = { x, y };
    pointer.current.detonations += 1;
    requestSceneFrame();
  };

  const detonateHere = (event: PointerEvent<HTMLDivElement>) => {
    trackStagePointer(pointer.current, event);
    detonateAt(pointer.current.x, pointer.current.y);
  };

  return (
    <ExperimentStage
      activity={activity}
      before={vegetaImage}
      className="[&>span]:z-40"
      controls={
        <>
          <ActionControl
            actionLabel="Detonate"
            disabled={isReduced}
            label="Final Explosion"
            onAction={() => detonateAt(0.5, 0.5)}
          />
          <ToggleControl
            label="Dither"
            onChange={set("dither")}
            options={orderedDitherOptions}
            value={settings.dither}
          />
          <SliderControl
            format={(value) => `${value}px`}
            label="Cell size"
            max={8}
            min={2}
            onChange={set("cell")}
            value={settings.cell}
          />
          <SliderControl
            format={signed}
            hint="Raise it to ink more of the frame."
            label="Threshold"
            max={0.3}
            min={-0.3}
            onChange={set("threshold")}
            step={0.02}
            value={settings.threshold}
          />
          <SliderControl
            format={percent}
            hint="The aura prints in negative."
            label="Aura radius"
            max={2}
            min={0.5}
            onChange={set("auraRadius")}
            step={0.05}
            value={settings.auraRadius}
          />
        </>
      }
      reducedNote="Reduced motion is on. One still frame. No explosion. The aura jumps to the pointer."
      stageLabel="Majin Vegeta dithered in ink on paper, with a negative ki aura around the pointer and a Final Explosion that reprints him in color"
      stageRef={ref}
    >
      <div
        className="pointer-events-auto size-full cursor-crosshair touch-pan-y"
        onPointerDown={detonateHere}
        onPointerLeave={() => releaseStagePointer(pointer.current)}
        onPointerMove={(event) => trackStagePointer(pointer.current, event)}
        ref={field}
      />
    </ExperimentStage>
  );
};

export default VegetaPreview;
