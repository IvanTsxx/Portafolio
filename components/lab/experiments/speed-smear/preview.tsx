"use client";

import { useId, useRef, useState } from "react";

import { ExperimentStage } from "@/components/lab/experiment-stage";
import { useThemeTones } from "@/components/lab/experiments/lunar-dither/use-theme-tones";
import {
  SliderControl,
  SwitchControl,
  ToggleControl,
} from "@/components/lab/lab-controls";
import { useShowsOriginal } from "@/components/lab/source/stage-reveal";
import {
  imageSourceOptions,
  sourceImages,
} from "@/components/lab/source/tone-chunk";
import type { SourceImage } from "@/components/lab/source/tone-chunk";
import { StageHint } from "@/components/lab/stage-hint";
import { useStageActivity } from "@/components/lab/use-stage-activity";
import { useViewSlot } from "@/components/scene/view-registry";
import { SpeedSmearScene } from "@/registry/ivan/components/speed-smear/speed-smear-scene";

interface SmearSettings {
  angle: number;
  dither: boolean;
  reach: number;
  smear: number;
  source: SourceImage;
}

const SpeedSmearPreview = () => {
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const [settings, setSettings] = useState<SmearSettings>({
    angle: 0,
    dither: true,
    reach: 16,
    smear: 12,
    source: "ippo",
  });
  const tones = useThemeTones();
  const showsOriginal = useShowsOriginal();
  const field = useRef<HTMLDivElement>(null);
  const slotId = useId();
  const [hasInteracted, setHasInteracted] = useState(false);
  const { focus, path } = sourceImages[settings.source];

  useViewSlot(
    slotId,
    field,
    <group visible={!showsOriginal}>
      <SpeedSmearScene
        angle={settings.angle}
        dither={settings.dither}
        focus={focus}
        ink={tones.ink}
        paper={tones.paper}
        paused={activity !== "running"}
        reach={settings.reach / 100}
        smear={settings.smear / 100}
        src={path}
      />
    </group>
  );

  return (
    <ExperimentStage
      activity={activity}
      before={sourceImages[settings.source]}
      className="[&>span]:z-40"
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
        onPointerMove={(event) => {
          if (Math.abs(event.movementX) + Math.abs(event.movementY) > 24) {
            setHasInteracted(true);
          }
        }}
        ref={field}
      />
      <StageHint
        isDismissed={hasInteracted || showsOriginal}
        label="Move fast across the face"
        touchLabel="Drag across the face"
      />
    </ExperimentStage>
  );
};

export default SpeedSmearPreview;
