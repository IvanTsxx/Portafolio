"use client";

import { useId, useRef, useState } from "react";

import { ExperimentStage } from "@/components/lab/experiment-stage";
import { useForegroundLitTones } from "@/components/lab/experiments/lunar-dither/use-theme-tones";
import {
  SliderControl,
  SwitchControl,
  ToggleControl,
} from "@/components/lab/lab-controls";
import {
  imageSourceOptions,
  sourceImages,
} from "@/components/lab/source/tone-chunk";
import type { StageImage } from "@/components/lab/source/tone-chunk";
import { StageHint } from "@/components/lab/stage-hint";
import { useStageActivity } from "@/components/lab/use-stage-activity";
import { useViewSlot } from "@/components/scene/view-registry";
import { DustPortraitScene } from "@/registry/ivan/components/dust-portrait/dust-portrait-scene";

const dustSources = {
  ...sourceImages,
  avatar: {
    focus: { x: 0.5, y: 0.42 },
    height: 1254,
    path: "/profile/avatar.webp",
    width: 1254,
  },
} as const satisfies Record<string, StageImage>;

type DustSource = keyof typeof dustSources;

const dustSourceOptions = [
  { label: "Avatar", value: "avatar" },
  ...imageSourceOptions,
] as const satisfies readonly { label: string; value: DustSource }[];

interface DustSettings {
  density: number;
  dispersion: number;
  drift: number;
  idle: boolean;
  source: DustSource;
}

const DustPortraitPreview = () => {
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const [settings, setSettings] = useState<DustSettings>({
    density: 1,
    dispersion: 1,
    drift: 1,
    idle: true,
    source: "avatar",
  });
  const [hasInteracted, setHasInteracted] = useState(false);
  const tones = useForegroundLitTones();
  const field = useRef<HTMLDivElement>(null);
  const slotId = useId();
  const { focus, path } = dustSources[settings.source];

  useViewSlot(
    slotId,
    field,
    <DustPortraitScene
      density={settings.density}
      dispersion={settings.dispersion}
      drift={settings.drift}
      focus={focus}
      idle={settings.idle}
      ink={tones.ink}
      paper={tones.paper}
      paused={activity !== "running"}
      pointerTarget={field}
      src={path}
    />
  );

  return (
    <ExperimentStage
      activity={activity}
      className="[&>span]:z-40"
      controls={
        <>
          <ToggleControl
            label="Source"
            onChange={(source) =>
              setSettings((current) => ({ ...current, source }))
            }
            options={dustSourceOptions}
            value={settings.source}
          />
          <SliderControl
            format={(value) => `${value.toFixed(2)}×`}
            hint="Scales the device budget of 45k to 120k grains."
            label="Density"
            max={1.5}
            min={0.25}
            onChange={(density) =>
              setSettings((current) => ({ ...current, density }))
            }
            step={0.05}
            value={settings.density}
          />
          <SliderControl
            format={(value) => value.toFixed(2)}
            label="Dispersion"
            max={2}
            min={0}
            onChange={(dispersion) =>
              setSettings((current) => ({ ...current, dispersion }))
            }
            step={0.05}
            value={settings.dispersion}
          />
          <SliderControl
            format={(value) => value.toFixed(2)}
            hint="How far the dust blows to the right."
            label="Drift"
            max={2}
            min={0}
            onChange={(drift) =>
              setSettings((current) => ({ ...current, drift }))
            }
            step={0.05}
            value={settings.drift}
          />
          <SwitchControl
            checked={settings.idle}
            hint="A few edge grains shed and return on their own."
            label="Idle shed"
            onChange={(idle) =>
              setSettings((current) => ({ ...current, idle }))
            }
          />
        </>
      }
      reducedNote="Reduced motion is on. The picture holds still and never scatters or bursts."
      stageLabel="A picture printed in dust grains that scatter to the right under the pointer and burst outward on click"
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
        style={{ backgroundColor: tones.ink }}
      />
      <StageHint
        isDismissed={hasInteracted}
        label="Hover to scatter, click to burst"
        touchLabel="Drag to scatter, tap to burst"
      />
    </ExperimentStage>
  );
};

export default DustPortraitPreview;
