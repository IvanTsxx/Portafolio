"use client";

import { SpeedSmearPoster } from "@/components/lab/experiments/speed-smear/poster";
import { SpeedSmear } from "@/components/registry-docs/demos/speed-smear-view";
import { Playground } from "@/components/registry-docs/playground";
import type { Control } from "@/components/registry-docs/playground";
import { speedSmearDefaults } from "@/registry/ivan/components/speed-smear/speed-smear-material";

const imageSrc = "/examples/dusk.jpg";

interface SpeedSmearValues {
  angle: number;
  dither: boolean;
  reach: number;
  smear: number;
}

const initialValues: SpeedSmearValues = {
  angle: speedSmearDefaults.angle,
  dither: speedSmearDefaults.dither,
  reach: speedSmearDefaults.reach,
  smear: speedSmearDefaults.smear,
};

const controls: readonly Control<keyof SpeedSmearValues>[] = [
  { key: "smear", kind: "range", label: "Smear", max: 0.4, min: 0, step: 0.01 },
  {
    key: "reach",
    kind: "range",
    label: "Reach",
    max: 0.4,
    min: 0.06,
    step: 0.02,
  },
  {
    key: "angle",
    kind: "range",
    label: "Angle",
    max: 180,
    min: 0,
    step: 5,
    unit: "°",
  },
  { key: "dither", kind: "toggle", label: "Ordered dither" },
];

export const Demo = () => (
  <Playground controls={controls} initialValues={initialValues}>
    {(values) => (
      <SpeedSmear
        angle={values.angle}
        className="w-96 max-w-full"
        dither={values.dither}
        reach={values.reach}
        smear={values.smear}
        src={imageSrc}
      />
    )}
  </Playground>
);

export const Thumbnail = () => (
  <div className="absolute inset-0">
    <SpeedSmearPoster />
  </div>
);
