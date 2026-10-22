"use client";

import type { PointerEvent } from "react";
import { useId, useRef, useState } from "react";

import { ExperimentStage } from "@/components/lab/experiment-stage";
import {
  ActionControl,
  ControlTabs,
  SliderControl,
  SwitchControl,
  ToggleControl,
} from "@/components/lab/lab-controls";
import { useStageReveal } from "@/components/lab/source/stage-reveal";
import type { StageImage } from "@/components/lab/source/tone-chunk";
import {
  releaseStagePointer,
  trackStagePointer,
} from "@/components/lab/source/use-source";
import { useStageActivity } from "@/components/lab/use-stage-activity";
import {
  requestSceneFrame,
  useViewSlot,
} from "@/components/scene/view-registry";

import {
  colorHoldForever,
  defaultSettings,
  ditherOptions,
  duotoneOptions,
  printOptions,
} from "./settings";
import type { SuperSaiyanSettings } from "./settings";
import SuperSaiyanView from "./super-saiyan-view";
import type { KiPointer } from "./super-saiyan-view";

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
  const { onReveal, reveal } = useStageReveal();
  const [settings, setSettings] =
    useState<SuperSaiyanSettings>(defaultSettings);

  const field = useRef<HTMLDivElement>(null);
  const slotId = useId();
  const pointer = useRef<KiPointer>({
    isHovering: false,
    presses: 0,
    strikes: 0,
    x: 0.5,
    y: 0.5,
  });
  const isReduced = activity === "reduced";
  const isStill = isReduced || settings.isPaused;

  const set =
    <Key extends keyof SuperSaiyanSettings>(key: Key) =>
    (value: SuperSaiyanSettings[Key]) =>
      setSettings((current) => ({ ...current, [key]: value }));

  useViewSlot(
    slotId,
    field,
    <SuperSaiyanView
      reveal={reveal}
      animate={activity === "running"}
      pointer={pointer}
      settings={settings}
    />
  );

  const powerUp = (event: PointerEvent<HTMLDivElement>) => {
    trackStagePointer(pointer.current, event);
    pointer.current.presses += 1;
  };

  const strikeNow = () => {
    pointer.current.strikes += 1;
    requestSceneFrame();
  };

  const printTab = (
    <>
      <ToggleControl
        label="Dither"
        onChange={set("dither")}
        options={ditherOptions}
        value={settings.dither}
      />
      <ToggleControl
        hint={
          isReduced
            ? "Retro shows the color print without lightning."
            : undefined
        }
        label="Print"
        onChange={set("print")}
        options={printOptions}
        value={settings.print}
      />
      {settings.print === "duotone" ? (
        <ToggleControl
          label="Duotone ink"
          onChange={set("duotone")}
          options={duotoneOptions}
          value={settings.duotone}
        />
      ) : null}
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
      <SliderControl
        format={times}
        label="Gamma"
        max={2.2}
        min={0.45}
        onChange={set("gamma")}
        step={0.05}
        value={settings.gamma}
      />
      <SwitchControl
        checked={settings.isInverted}
        label="Invert"
        onChange={set("isInverted")}
      />
    </>
  );

  const stormTab = (
    <>
      <ActionControl
        actionLabel="Strike now"
        disabled={isStill}
        label="Lightning"
        onAction={strikeNow}
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
        onChange={set("intensity")}
        step={0.05}
        value={settings.intensity}
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
        onChange={set("rainAmount")}
        step={0.05}
        value={settings.rainAmount}
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
      <SwitchControl
        checked={settings.isPaused}
        disabled={isReduced}
        hint="Freezes rain and lightning. The aura still follows."
        label="Pause"
        onChange={set("isPaused")}
      />
    </>
  );

  const kiTab = (
    <>
      <SliderControl
        format={percent}
        hint="Click the frame to power up."
        label="Aura strength"
        max={1.5}
        min={0}
        onChange={set("auraStrength")}
        step={0.05}
        value={settings.auraStrength}
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
      onReveal={onReveal}
      before={superSaiyanImage}
      className="[&>p]:z-40 [&>span]:z-40"
      controls={
        <ControlTabs
          label="Control groups"
          tabs={[
            { content: printTab, label: "Print", value: "print" },
            { content: stormTab, label: "Storm", value: "storm" },
            { content: kiTab, label: "Ki", value: "ki" },
          ]}
        />
      }
      reducedNote="Reduced motion is on. One still frame. No lightning, no burst. Pick Retro to see the color print."
      stageLabel="Super Saiyan Goku in the rain, dithered in ink on paper, printed in color when lightning strikes, with a ki aura around the pointer"
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
