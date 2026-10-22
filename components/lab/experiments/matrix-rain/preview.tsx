"use client";

import type { PointerEvent } from "react";
import { useId, useRef, useState } from "react";

import { ExperimentStage } from "@/components/lab/experiment-stage";
import { SliderControl, ToggleControl } from "@/components/lab/lab-controls";
import { imageSourceOptions } from "@/components/lab/source/tone-chunk";
import { useStageActivity } from "@/components/lab/use-stage-activity";
import {
  requestSceneFrame,
  useViewSlot,
} from "@/components/scene/view-registry";

import RainView from "./rain-view";
import type { RainPointer, RainSettings } from "./rain-view";

const glyphOptions = [
  { label: "Binary", value: "binary" },
  { label: "Hex", value: "hex" },
  { label: "Kana", value: "kana" },
] as const;

const trackPointer = (
  pointer: RainPointer,
  event: PointerEvent<HTMLDivElement>
) => {
  const bounds = event.currentTarget.getBoundingClientRect();
  pointer.x = (event.clientX - bounds.left) / bounds.width;
  pointer.y = 1 - (event.clientY - bounds.top) / bounds.height;
  pointer.isHovering = true;
  requestSceneFrame();
};

const MatrixRainPreview = () => {
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const [settings, setSettings] = useState<RainSettings>({
    glyphs: "hex",
    pitch: 3,
    source: "vegeta",
    speed: 1,
    trail: 12,
  });

  const animate = activity === "running";
  const field = useRef<HTMLDivElement>(null);
  const slotId = useId();
  const pointer = useRef<RainPointer>({
    isHovering: false,
    x: 0.5,
    y: 0.5,
  });

  useViewSlot(
    slotId,
    field,
    <RainView animate={animate} pointer={pointer} settings={settings} />
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
            format={(value) => `${value}px`}
            label="Dot pitch"
            max={5}
            min={2}
            onChange={(pitch) =>
              setSettings((current) => ({ ...current, pitch }))
            }
            step={0.5}
            value={settings.pitch}
          />
          <SliderControl
            format={(value) => `${value.toFixed(1)}×`}
            label="Speed"
            max={3}
            min={0}
            onChange={(speed) =>
              setSettings((current) => ({ ...current, speed }))
            }
            step={0.1}
            value={settings.speed}
          />
          <SliderControl
            format={(value) => `${value} glyphs`}
            label="Trail"
            max={28}
            min={4}
            onChange={(trail) =>
              setSettings((current) => ({ ...current, trail }))
            }
            value={settings.trail}
          />
          <ToggleControl
            label="Glyphs"
            onChange={(glyphs) =>
              setSettings((current) => ({ ...current, glyphs }))
            }
            options={glyphOptions}
            value={settings.glyphs}
          />
        </>
      }
      reducedNote="Reduced motion is on. The rain holds a single frame. The pointer still parts it without easing."
      stageLabel="Digital rain of dot-matrix glyphs that parts around the pointer"
      stageRef={ref}
    >
      <div
        className="pointer-events-auto size-full cursor-crosshair touch-pan-y"
        onPointerLeave={() => {
          pointer.current.isHovering = false;
          requestSceneFrame();
        }}
        onPointerMove={(event) => trackPointer(pointer.current, event)}
        ref={field}
      />
    </ExperimentStage>
  );
};

export default MatrixRainPreview;
