"use client";

import { useId, useRef, useState } from "react";

import { ExperimentStage } from "@/components/lab/experiment-stage";
import {
  SliderControl,
  SwitchControl,
  ToggleControl,
} from "@/components/lab/lab-controls";
import { useStageActivity } from "@/components/lab/use-stage-activity";
import {
  requestSceneFrame,
  useViewSlot,
} from "@/components/scene/view-registry";

import AssemblyView from "./assembly-view";
import type { AssemblyPointer } from "./assembly-view";
import type { ModuleLayout } from "./layouts";

const layoutOptions = [
  { label: "Card", value: "card" },
  { label: "Stack", value: "stack" },
  { label: "Bento", value: "bento" },
] as const;

const ModuleAssemblyPreview = () => {
  const { activity, isReduced, ref } = useStageActivity<HTMLDivElement>();
  const [layout, setLayout] = useState<ModuleLayout>("card");
  const [progress, setProgress] = useState(100);
  const [isAuto, setIsAuto] = useState(true);

  const isRunning = activity === "running";
  const autoActive = isAuto && !isReduced;
  const stage = useRef<HTMLDivElement>(null);
  const slotId = useId();
  const pointer = useRef<AssemblyPointer>({ x: 0 });

  useViewSlot(
    slotId,
    stage,
    <AssemblyView
      isAuto={autoActive}
      isReduced={isReduced}
      isRunning={isRunning}
      layout={layout}
      pointer={pointer}
      progress={progress / 100}
    />
  );

  return (
    <ExperimentStage
      activity={activity}
      className="blueprint-dots [&>p]:z-40 [&>span]:z-40"
      controls={
        <>
          <ToggleControl
            label="Layout"
            onChange={setLayout}
            options={layoutOptions}
            value={layout}
          />
          <SwitchControl
            checked={autoActive}
            disabled={isReduced}
            hint={
              isReduced
                ? "Unavailable under reduced motion."
                : "Cycles between scattered and assembled. Pauses offscreen."
            }
            label="Auto-cycle"
            onChange={setIsAuto}
          />
          <SliderControl
            disabled={autoActive}
            format={(value) => `${value}%`}
            hint={
              autoActive ? "Turn off auto-cycle to scrub by hand." : undefined
            }
            label="Assembly"
            max={100}
            min={0}
            onChange={setProgress}
            value={progress}
          />
        </>
      }
      reducedNote="Reduced motion is on. Modules jump straight to their pose and auto-cycle is off. Use the assembly slider to step through it."
      stageLabel="Instanced modules assembling into an interface layout next to a builder agent"
      stageRef={ref}
    >
      <div
        className="pointer-events-auto size-full touch-pan-y"
        onPointerMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          pointer.current.x =
            ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
          requestSceneFrame();
        }}
        ref={stage}
      />
    </ExperimentStage>
  );
};

export default ModuleAssemblyPreview;
