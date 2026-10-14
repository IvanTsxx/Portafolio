"use client";

import type { PointerEvent } from "react";
import { useId, useRef, useState } from "react";

import { ExperimentStage } from "@/components/lab/experiment-stage";
import {
  ActionControl,
  SliderControl,
  ToggleControl,
} from "@/components/lab/lab-controls";
import { useStageActivity } from "@/components/lab/use-stage-activity";
import {
  requestSceneFrame,
  useViewSlot,
} from "@/components/scene/view-registry";

import { dragTarget, releaseTarget } from "./fold-model";
import FoldView from "./fold-view";
import type { FoldGesture, FoldSettings } from "./fold-view";

const creaseOptions = [
  { label: "One", value: "one" },
  { label: "Two", value: "two" },
] as const;

const tapDistance = 6;

interface Drag {
  pointerId: number;
  startX: number;
  startTarget: number;
  distance: number;
}

const PaperFoldPreview = () => {
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const [settings, setSettings] = useState<FoldSettings>({
    creases: "two",
    stiffness: 140,
  });
  const [isFolded, setIsFolded] = useState(false);

  const field = useRef<HTMLDivElement>(null);
  const slotId = useId();
  const gesture = useRef<FoldGesture>({
    fold: { value: 0, velocity: 0 },
    sway: 0,
    swayAngle: { value: 0, velocity: 0 },
    target: 0,
  });
  const drag = useRef<Drag | null>(null);

  useViewSlot(
    slotId,
    field,
    <FoldView
      animate={activity === "running"}
      gesture={gesture}
      settings={settings}
    />
  );

  const settle = (target: number) => {
    gesture.current.target = target;
    setIsFolded(target === 1);
    requestSceneFrame();
  };

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      distance: 0,
      pointerId: event.pointerId,
      startTarget: gesture.current.fold.value,
      startX: event.clientX,
    };
  };

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    gesture.current.sway =
      ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const { current } = drag;
    if (current?.pointerId === event.pointerId) {
      const distance = event.clientX - current.startX;
      current.distance = Math.max(current.distance, Math.abs(distance));
      gesture.current.target = dragTarget(
        current.startTarget,
        distance,
        bounds.width
      );
    }
    requestSceneFrame();
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const { current } = drag;
    if (current?.pointerId !== event.pointerId) {
      return;
    }
    drag.current = null;
    if (current.distance < tapDistance) {
      settle(gesture.current.target >= 0.5 ? 0 : 1);
      return;
    }
    settle(
      releaseTarget(gesture.current.fold.value, gesture.current.fold.velocity)
    );
  };

  return (
    <ExperimentStage
      activity={activity}
      className="[&>p]:z-40 [&>span]:z-40"
      controls={
        <>
          <ToggleControl
            label="Creases"
            onChange={(creases) => {
              setSettings((current) => ({ ...current, creases }));
              requestSceneFrame();
            }}
            options={creaseOptions}
            value={settings.creases}
          />
          <SliderControl
            format={(value) => `${value}`}
            hint="Stiffer paper snaps shut faster and overshoots less."
            label="Stiffness"
            max={360}
            min={40}
            onChange={(stiffness) =>
              setSettings((current) => ({ ...current, stiffness }))
            }
            step={10}
            value={settings.stiffness}
          />
          <ActionControl
            actionLabel={isFolded ? "Unfold" : "Fold"}
            label="Sheet"
            onAction={() => settle(isFolded ? 0 : 1)}
          />
        </>
      }
      reducedNote="Reduced motion is on. The sheet jumps between open and folded without springing."
      stageLabel="A printed dossier page that folds along its creases when dragged"
      stageRef={ref}
    >
      <div
        className="pointer-events-auto size-full cursor-grab touch-pan-y active:cursor-grabbing"
        onPointerCancel={endDrag}
        onPointerDown={startDrag}
        onPointerLeave={() => {
          gesture.current.sway = 0;
          requestSceneFrame();
        }}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        ref={field}
      />
    </ExperimentStage>
  );
};

export default PaperFoldPreview;
