"use client";

import { useId, useRef, useState } from "react";

import { ExperimentStage } from "@/components/lab/experiment-stage";
import { useForegroundLitTones } from "@/components/lab/experiments/lunar-dither/use-theme-tones";
import { SliderControl } from "@/components/lab/lab-controls";
import { useStageActivity } from "@/components/lab/use-stage-activity";
import { useViewSlot } from "@/components/scene/view-registry";
import {
  orbitDustDefaults,
  orbitDustLimits,
  resolveDustCount,
} from "@/registry/ivan/components/orbit-dust/orbit-dust-material";
import { OrbitDustScene } from "@/registry/ivan/components/orbit-dust/orbit-dust-scene";

interface DustSettings {
  count: number;
  radius: number;
  speed: number;
  thickness: number;
  turbulence: number;
}

const countStep = 10_000;

const OrbitDustPreview = () => {
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const [settings, setSettings] = useState<DustSettings>(() => ({
    count: Math.round(resolveDustCount() / countStep) * countStep,
    radius: orbitDustDefaults.radius,
    speed: orbitDustDefaults.speed,
    thickness: orbitDustDefaults.thickness,
    turbulence: orbitDustDefaults.turbulence,
  }));
  const tones = useForegroundLitTones();
  const field = useRef<HTMLDivElement>(null);
  const slotId = useId();

  useViewSlot(
    slotId,
    field,
    <OrbitDustScene
      {...settings}
      ink={tones.ink}
      paper={tones.paper}
      paused={activity !== "running"}
    />
  );

  return (
    <ExperimentStage
      activity={activity}
      controls={
        <>
          <SliderControl
            format={(value) => `${Math.round(value / 1000)}k`}
            label="Particles"
            max={orbitDustLimits.maxCount}
            min={orbitDustLimits.minCount}
            onChange={(count) =>
              setSettings((current) => ({ ...current, count }))
            }
            step={countStep}
            value={settings.count}
          />
          <SliderControl
            format={(value) => value.toFixed(1)}
            label="Radius"
            max={2.2}
            min={0.8}
            onChange={(radius) =>
              setSettings((current) => ({ ...current, radius }))
            }
            step={0.1}
            value={settings.radius}
          />
          <SliderControl
            format={(value) => value.toFixed(2)}
            label="Thickness"
            max={0.3}
            min={0}
            onChange={(thickness) =>
              setSettings((current) => ({ ...current, thickness }))
            }
            step={0.01}
            value={settings.thickness}
          />
          <SliderControl
            format={(value) => value.toFixed(2)}
            label="Turbulence"
            max={1.5}
            min={0}
            onChange={(turbulence) =>
              setSettings((current) => ({ ...current, turbulence }))
            }
            step={0.05}
            value={settings.turbulence}
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
        </>
      }
      reducedNote="Reduced motion is on. The ring holds a single frame. The gravity well jumps to the pointer without easing."
      stageLabel="A ring of dust orbiting a dark core, bent by a gravity well under the pointer"
      stageRef={ref}
    >
      <div
        className="pointer-events-auto size-full cursor-crosshair touch-pan-y"
        ref={field}
        style={{ backgroundColor: tones.ink }}
      />
    </ExperimentStage>
  );
};

export default OrbitDustPreview;
