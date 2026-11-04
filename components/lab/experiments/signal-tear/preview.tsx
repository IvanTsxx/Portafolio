"use client";

import { useId, useRef, useState } from "react";

import { ExperimentStage } from "@/components/lab/experiment-stage";
import { useThemeTones } from "@/components/lab/experiments/lunar-dither/use-theme-tones";
import { SliderControl, ToggleControl } from "@/components/lab/lab-controls";
import { useShowsOriginal } from "@/components/lab/source/stage-reveal";
import {
  imageSourceOptions,
  sourceImages,
} from "@/components/lab/source/tone-chunk";
import type { SourceImage } from "@/components/lab/source/tone-chunk";
import { useStageActivity } from "@/components/lab/use-stage-activity";
import { useViewSlot } from "@/components/scene/view-registry";
import { SignalTearScene } from "@/registry/ivan/components/signal-tear/signal-tear-scene";

const percent = (value: number) => `${value}%`;

interface TearSettings {
  ghost: number;
  grain: number;
  source: SourceImage;
  tear: number;
}

const SignalTearPreview = () => {
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const [settings, setSettings] = useState<TearSettings>({
    ghost: 60,
    grain: 60,
    source: "messi",
    tear: 50,
  });
  const tones = useThemeTones();
  const showsOriginal = useShowsOriginal();
  const field = useRef<HTMLDivElement>(null);
  const slotId = useId();
  const { focus, path } = sourceImages[settings.source];

  useViewSlot(
    slotId,
    field,
    <group visible={!showsOriginal}>
      <SignalTearScene
        focus={focus}
        ghost={settings.ghost / 100}
        grain={settings.grain / 100}
        ink={tones.ink}
        paper={tones.paper}
        paused={activity !== "running"}
        src={path}
        tear={settings.tear / 100}
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
            format={percent}
            hint="Rows near the pointer tear first."
            label="Tear"
            max={100}
            min={0}
            onChange={(tear) =>
              setSettings((current) => ({ ...current, tear }))
            }
            step={5}
            value={settings.tear}
          />
          <SliderControl
            format={percent}
            label="Ghost"
            max={100}
            min={0}
            onChange={(ghost) =>
              setSettings((current) => ({ ...current, ghost }))
            }
            step={5}
            value={settings.ghost}
          />
          <SliderControl
            format={percent}
            label="Grain"
            max={100}
            min={0}
            onChange={(grain) =>
              setSettings((current) => ({ ...current, grain }))
            }
            step={5}
            value={settings.grain}
          />
        </>
      }
      reducedNote="Reduced motion is on. One torn frame holds still."
      stageLabel="A grainy picture whose rows tear sideways and leave light trails near the pointer"
      stageRef={ref}
    >
      <div
        className="pointer-events-auto size-full cursor-crosshair touch-pan-y"
        ref={field}
      />
    </ExperimentStage>
  );
};

export default SignalTearPreview;
