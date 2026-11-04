"use client";

import { SlimePoster } from "@/components/lab/experiments/slime/poster";
import { useSlimeTones } from "@/components/lab/experiments/slime/use-slime-tones";
import { Playground } from "@/components/registry-docs/playground";
import type { Control } from "@/components/registry-docs/playground";
import { Slime } from "@/registry/ivan/components/slime/slime";
import { slimeDefaults } from "@/registry/ivan/components/slime/slime-material";

interface SlimeValues {
  reach: number;
  veins: number;
  viscosity: number;
}

const initialValues: SlimeValues = {
  reach: slimeDefaults.reach,
  veins: slimeDefaults.veins,
  viscosity: slimeDefaults.viscosity,
};

const controls: readonly Control<keyof SlimeValues>[] = [
  {
    key: "viscosity",
    kind: "range",
    label: "Viscosity",
    max: 2.5,
    min: 0.4,
    step: 0.1,
  },
  { key: "reach", kind: "range", label: "Reach", max: 2, min: 0.3, step: 0.1 },
  { key: "veins", kind: "range", label: "Veins", max: 2, min: 0, step: 0.1 },
];

const ThemedSlime = (values: SlimeValues) => {
  const tones = useSlimeTones();
  return (
    <Slime
      {...values}
      className="aspect-video w-96 max-w-full"
      glow={tones.glow}
      ink={tones.ink}
      night={tones.night}
      paper={tones.paper}
    />
  );
};

export const Demo = () => (
  <Playground controls={controls} initialValues={initialValues}>
    {(values) => (
      <ThemedSlime
        reach={values.reach}
        veins={values.veins}
        viscosity={values.viscosity}
      />
    )}
  </Playground>
);

export const Thumbnail = () => (
  <div className="absolute inset-0">
    <SlimePoster />
  </div>
);
