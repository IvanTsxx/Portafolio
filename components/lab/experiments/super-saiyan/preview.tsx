"use client";

import { useId, useRef, useState } from "react";

import { stormDitherOptions } from "@/components/lab/dither-options";
import { ExperimentStage } from "@/components/lab/experiment-stage";
import { useThemeTones } from "@/components/lab/experiments/lunar-dither/use-theme-tones";
import {
  ActionControl,
  ControlTabs,
  SliderControl,
  SwitchControl,
  ToggleControl,
} from "@/components/lab/lab-controls";
import { useShowsOriginal } from "@/components/lab/source/stage-reveal";
import type { StageImage } from "@/components/lab/source/tone-chunk";
import { StageHint } from "@/components/lab/stage-hint";
import { useStageActivity } from "@/components/lab/use-stage-activity";
import { useViewSlot } from "@/components/scene/view-registry";
import type { StormDither } from "@/registry/ivan/components/storm-print/storm-print-material";
import { StormPrintScene } from "@/registry/ivan/components/storm-print/storm-print-scene";
import type { StormPrintMode } from "@/registry/ivan/components/storm-print/storm-print-scene";

const printOptions = [
  { label: "Ink", value: "ink" },
  { label: "Color", value: "color" },
] as const satisfies readonly { label: string; value: StormPrintMode }[];

const colorHoldForever = 8;

interface StormSettings {
  aura: number;
  auraRadius: number;
  cell: number;
  colorHold: number;
  contrast: number;
  dither: StormDither;
  flash: number;
  frequency: number;
  isLightning: boolean;
  print: StormPrintMode;
  rain: number;
  rainAngle: number;
  rainSpeed: number;
  threshold: number;
}

const defaultSettings: StormSettings = {
  aura: 1,
  auraRadius: 1,
  cell: 3,
  colorHold: 1.2,
  contrast: 1.35,
  dither: "bayer-8",
  flash: 1,
  frequency: 0.5,
  isLightning: true,
  print: "ink",
  rain: 1,
  rainAngle: 9,
  rainSpeed: 1,
  threshold: 0,
};

const signed = (value: number) => {
  const percent = Math.round(value * 100);
  return percent > 0 ? `+${percent}` : String(percent);
};

const percent = (value: number) => `${Math.round(value * 100)}%`;

const times = (value: number) => `${value.toFixed(2)}×`;

const formatHold = (value: number) =>
  value >= colorHoldForever ? "Hold" : `${value.toFixed(1)}s`;

const superSaiyanImage: StageImage = {
  focus: { x: 0.6, y: 0.4 },
  height: 490,
  path: "/experiments/super-saiyan.jpg",
  width: 735,
};

const SuperSaiyanPreview = () => {
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const [settings, setSettings] = useState<StormSettings>(defaultSettings);
  const [strikes, setStrikes] = useState(0);
  const tones = useThemeTones();
  const showsOriginal = useShowsOriginal();
  const field = useRef<HTMLDivElement>(null);
  const slotId = useId();
  const [hasInteracted, setHasInteracted] = useState(false);
  const isReduced = activity === "reduced";

  const set =
    <Key extends keyof StormSettings>(key: Key) =>
    (value: StormSettings[Key]) =>
      setSettings((current) => ({ ...current, [key]: value }));

  useViewSlot(
    slotId,
    field,
    <group visible={!showsOriginal}>
      <StormPrintScene
        aura={settings.aura}
        auraRadius={settings.auraRadius}
        cell={settings.cell}
        colorHold={
          settings.colorHold >= colorHoldForever ? Infinity : settings.colorHold
        }
        contrast={settings.contrast}
        dither={settings.dither}
        flash={settings.flash}
        focus={superSaiyanImage.focus}
        frequency={settings.frequency}
        ink={tones.ink}
        lightning={settings.isLightning}
        paper={tones.paper}
        paused={activity !== "running"}
        print={settings.print}
        rain={settings.rain}
        rainAngle={settings.rainAngle}
        rainSpeed={settings.rainSpeed}
        src={superSaiyanImage.path}
        strikes={strikes}
        threshold={settings.threshold}
      />
    </group>
  );

  const printTab = (
    <>
      <ToggleControl
        label="Dither"
        onChange={set("dither")}
        options={stormDitherOptions}
        value={settings.dither}
      />
      <ToggleControl
        hint={
          isReduced
            ? "Color shows the color print without lightning."
            : undefined
        }
        label="Print"
        onChange={set("print")}
        options={printOptions}
        value={settings.print}
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
        format={times}
        label="Contrast"
        max={2.4}
        min={0.6}
        onChange={set("contrast")}
        step={0.05}
        value={settings.contrast}
      />
    </>
  );

  const stormTab = (
    <>
      <ActionControl
        actionLabel="Strike now"
        disabled={isReduced}
        label="Lightning"
        onAction={() => setStrikes((current) => current + 1)}
      />
      <SwitchControl
        checked={settings.isLightning && !isReduced}
        disabled={isReduced}
        hint={isReduced ? "Off while reduced motion is on." : undefined}
        label="Storm strikes"
        onChange={set("isLightning")}
      />
      <SliderControl
        disabled={isReduced}
        format={percent}
        hint="Strikes stay at least three seconds apart."
        label="Frequency"
        max={1}
        min={0}
        onChange={set("frequency")}
        step={0.05}
        value={settings.frequency}
      />
      <SliderControl
        disabled={isReduced}
        format={percent}
        label="Flash"
        max={1}
        min={0.2}
        onChange={set("flash")}
        step={0.05}
        value={settings.flash}
      />
      <SliderControl
        disabled={isReduced}
        format={formatHold}
        hint="How long a strike keeps the print in color."
        label="Color hold"
        max={colorHoldForever}
        min={0}
        onChange={set("colorHold")}
        step={0.2}
        value={settings.colorHold}
      />
      <SliderControl
        format={percent}
        label="Rain"
        max={1}
        min={0}
        onChange={set("rain")}
        step={0.05}
        value={settings.rain}
      />
      <SliderControl
        format={times}
        label="Rain speed"
        max={2.5}
        min={0.25}
        onChange={set("rainSpeed")}
        step={0.05}
        value={settings.rainSpeed}
      />
      <SliderControl
        format={(value) => `${value}°`}
        label="Rain angle"
        max={30}
        min={-30}
        onChange={set("rainAngle")}
        value={settings.rainAngle}
      />
    </>
  );

  const auraTab = (
    <>
      <SliderControl
        format={percent}
        hint="Click the frame to strike."
        label="Aura strength"
        max={1.5}
        min={0}
        onChange={set("aura")}
        step={0.05}
        value={settings.aura}
      />
      <SliderControl
        format={percent}
        label="Aura radius"
        max={2}
        min={0.5}
        onChange={set("auraRadius")}
        step={0.05}
        value={settings.auraRadius}
      />
    </>
  );

  return (
    <ExperimentStage
      activity={activity}
      before={superSaiyanImage}
      className="[&>span]:z-40"
      controls={
        <ControlTabs
          label="Control groups"
          tabs={[
            { content: printTab, label: "Print", value: "print" },
            { content: stormTab, label: "Storm", value: "storm" },
            { content: auraTab, label: "Aura", value: "aura" },
          ]}
        />
      }
      reducedNote="Reduced motion is on. One still frame. No lightning, no burst. Pick Color to see the color print."
      stageLabel="Super Saiyan Goku in the rain, dithered in ink on paper, printed in color when lightning strikes, with an aura around the pointer"
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
          label="Hover to flare, click to strike"
          touchLabel="Tap to strike"
        />
      )}
    </ExperimentStage>
  );
};

export default SuperSaiyanPreview;
