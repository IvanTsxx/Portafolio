"use client";

import { useId, useRef, useState } from "react";

import { ExperimentStage } from "@/components/lab/experiment-stage";
import {
  ActionControl,
  SliderControl,
  SwitchControl,
} from "@/components/lab/lab-controls";
import { StageHint } from "@/components/lab/stage-hint";
import { useStageActivity } from "@/components/lab/use-stage-activity";
import { useViewSlot } from "@/components/scene/view-registry";
import { lunarDitherDefaults } from "@/registry/ivan/components/lunar-dither/lunar-dither-material";
import { LunarDitherScene } from "@/registry/ivan/components/lunar-dither/lunar-dither-scene";
import type { LunarDitherSceneHandle } from "@/registry/ivan/components/lunar-dither/lunar-dither-scene";

import { useThemeTones } from "./use-theme-tones";

interface LunarSettings {
  craterScale: number;
  followPointer: boolean;
  grain: number;
  pixelSize: number;
}

const LunarDitherPreview = () => {
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const [settings, setSettings] = useState<LunarSettings>({
    craterScale: lunarDitherDefaults.craterScale,
    followPointer: lunarDitherDefaults.followPointer,
    grain: lunarDitherDefaults.grain,
    pixelSize: lunarDitherDefaults.pixelSize,
  });
  const tones = useThemeTones();
  const field = useRef<HTMLDivElement>(null);
  const scene = useRef<LunarDitherSceneHandle>(null);
  const slotId = useId();
  const [impactCount, setImpactCount] = useState(0);

  useViewSlot(
    slotId,
    field,
    <LunarDitherScene
      {...settings}
      ink={tones.ink}
      paper={tones.paper}
      onImpact={() => setImpactCount((count) => count + 1)}
      paused={activity !== "running"}
      ref={scene}
    />
  );

  return (
    <ExperimentStage
      activity={activity}
      controls={
        <>
          <SliderControl
            format={(value) => `${value}px`}
            label="Pixel size"
            max={6}
            min={1}
            onChange={(pixelSize) =>
              setSettings((current) => ({ ...current, pixelSize }))
            }
            value={settings.pixelSize}
          />
          <SliderControl
            format={(value) => value.toFixed(2)}
            label="Grain"
            max={1}
            min={0}
            onChange={(grain) =>
              setSettings((current) => ({ ...current, grain }))
            }
            step={0.05}
            value={settings.grain}
          />
          <SliderControl
            format={(value) => value.toFixed(1)}
            label="Crater scale"
            max={6}
            min={1.5}
            onChange={(craterScale) =>
              setSettings((current) => ({ ...current, craterScale }))
            }
            step={0.5}
            value={settings.craterScale}
          />
          <SwitchControl
            checked={settings.followPointer}
            label="Follow pointer"
            onChange={(followPointer) =>
              setSettings((current) => ({ ...current, followPointer }))
            }
          />
          <ActionControl
            actionLabel="Clear craters"
            disabled={impactCount === 0}
            label={`Impacts ${String(impactCount).padStart(2, "0")}`}
            onAction={() => {
              scene.current?.clearImpacts();
              setImpactCount(0);
            }}
          />
        </>
      }
      reducedNote="Reduced motion is on. The moon holds a single frame with frozen grain. The light jumps to the pointer without easing. Clicks add craters at once, with no meteor or shockwave."
      stageLabel="A cratered moon printed as an ordered dither, lit from the pointer. Click it to drop a meteor and leave a crater."
      stageRef={ref}
    >
      <div
        className="pointer-events-auto size-full cursor-crosshair touch-pan-y"
        ref={field}
        style={{ backgroundColor: tones.ink }}
      />
      <StageHint
        isDismissed={impactCount > 0}
        label="Click to bombard"
        touchLabel="Tap to bombard"
      />
    </ExperimentStage>
  );
};

export default LunarDitherPreview;
