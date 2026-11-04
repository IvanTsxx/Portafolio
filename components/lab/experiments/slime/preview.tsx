"use client";

import { useState } from "react";

import { ExperimentStage } from "@/components/lab/experiment-stage";
import { SliderControl } from "@/components/lab/lab-controls";
import { useStageActivity } from "@/components/lab/use-stage-activity";
import { Slime } from "@/registry/ivan/components/slime/slime";
import { slimeDefaults } from "@/registry/ivan/components/slime/slime-material";

import { useSlimeTones } from "./use-slime-tones";

interface SlimeSettings {
  reach: number;
  veins: number;
  viscosity: number;
}

const stageLabel =
  "A glossy green slime that crawls around, drips, reaches for the pointer and splats when clicked";

const SlimePreview = () => {
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const [settings, setSettings] = useState<SlimeSettings>({
    reach: slimeDefaults.reach,
    veins: slimeDefaults.veins,
    viscosity: slimeDefaults.viscosity,
  });
  const tones = useSlimeTones();

  return (
    <ExperimentStage
      activity={activity}
      controls={
        <>
          <SliderControl
            format={(value) => `${value.toFixed(1)}×`}
            hint="How thick the goo is: slower crawl, heavier drips."
            label="Viscosity"
            max={2.5}
            min={0.4}
            onChange={(viscosity) =>
              setSettings((current) => ({ ...current, viscosity }))
            }
            step={0.1}
            value={settings.viscosity}
          />
          <SliderControl
            format={(value) => `${value.toFixed(1)}×`}
            hint="How far it reaches and stretches before it snaps."
            label="Reach"
            max={2}
            min={0.3}
            onChange={(reach) =>
              setSettings((current) => ({ ...current, reach }))
            }
            step={0.1}
            value={settings.reach}
          />
          <SliderControl
            format={(value) => `${Math.round(value * 100)}%`}
            label="Veins"
            max={2}
            min={0}
            onChange={(veins) =>
              setSettings((current) => ({ ...current, veins }))
            }
            step={0.1}
            value={settings.veins}
          />
        </>
      }
      reducedNote="Reduced motion is on. The slime holds one frame, mid-splat."
      stageLabel={stageLabel}
      stageRef={ref}
    >
      <Slime
        {...settings}
        className="aspect-auto size-full"
        glow={tones.glow}
        ink={tones.ink}
        label={stageLabel}
        night={tones.night}
        paper={tones.paper}
        paused={activity !== "running"}
      />
    </ExperimentStage>
  );
};

export default SlimePreview;
