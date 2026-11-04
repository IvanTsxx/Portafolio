"use client";

import { useId, useRef, useState } from "react";

import { orderedDitherOptions } from "@/components/lab/dither-options";
import { ExperimentStage } from "@/components/lab/experiment-stage";
import { useThemeTones } from "@/components/lab/experiments/lunar-dither/use-theme-tones";
import {
  ActionControl,
  SliderControl,
  ToggleControl,
} from "@/components/lab/lab-controls";
import { useShowsOriginal } from "@/components/lab/source/stage-reveal";
import { sourceImages } from "@/components/lab/source/tone-chunk";
import { StageHint } from "@/components/lab/stage-hint";
import { useStageActivity } from "@/components/lab/use-stage-activity";
import { useViewSlot } from "@/components/scene/view-registry";
import { BlastPrintScene } from "@/registry/ivan/components/blast-print/blast-print-scene";
import type { OrderedDither } from "@/registry/ivan/lib/ordered-print";

const vegetaImage = sourceImages.vegeta;

interface BlastSettings {
  auraRadius: number;
  cell: number;
  dither: OrderedDither;
  threshold: number;
}

const defaultSettings: BlastSettings = {
  auraRadius: 1,
  cell: 3,
  dither: "blue-noise",
  threshold: 0,
};

const signed = (value: number) => {
  const percent = Math.round(value * 100);
  return percent > 0 ? `+${percent}` : String(percent);
};

const percent = (value: number) => `${Math.round(value * 100)}%`;

const VegetaPreview = () => {
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const [settings, setSettings] = useState<BlastSettings>(defaultSettings);
  const [blasts, setBlasts] = useState(0);
  const tones = useThemeTones();
  const showsOriginal = useShowsOriginal();
  const field = useRef<HTMLDivElement>(null);
  const slotId = useId();
  const [hasInteracted, setHasInteracted] = useState(false);
  const isReduced = activity === "reduced";

  const set =
    <Key extends keyof BlastSettings>(key: Key) =>
    (value: BlastSettings[Key]) =>
      setSettings((current) => ({ ...current, [key]: value }));

  useViewSlot(
    slotId,
    field,
    <group visible={!showsOriginal}>
      <BlastPrintScene
        auraRadius={settings.auraRadius}
        blasts={blasts}
        cell={settings.cell}
        dither={settings.dither}
        focus={vegetaImage.focus}
        ink={tones.ink}
        paper={tones.paper}
        paused={activity !== "running"}
        src={vegetaImage.path}
        threshold={settings.threshold}
      />
    </group>
  );

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
            onAction={() => setBlasts((current) => current + 1)}
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
      stageLabel="Majin Vegeta dithered in ink on paper, with a negative aura around the pointer and a Final Explosion that reprints him in color"
      stageRef={ref}
    >
      <div
        className="pointer-events-auto size-full cursor-crosshair touch-pan-y"
        onPointerDown={() => setHasInteracted(true)}
        ref={field}
      />
      {isReduced ? null : (
        <StageHint
          isDismissed={hasInteracted || showsOriginal}
          label="Hover to charge, click to detonate"
          touchLabel="Tap to detonate"
        />
      )}
    </ExperimentStage>
  );
};

export default VegetaPreview;
