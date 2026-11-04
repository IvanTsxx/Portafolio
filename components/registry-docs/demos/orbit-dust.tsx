"use client";

import { OrbitDustPoster } from "@/components/lab/experiments/orbit-dust/poster";
import { OrbitDust } from "@/components/registry-docs/demos/orbit-dust-view";
import { Playground } from "@/components/registry-docs/playground";
import type { Control } from "@/components/registry-docs/playground";
import { orbitDustDefaults } from "@/registry/ivan/components/orbit-dust/orbit-dust-material";

interface OrbitDustValues {
  radius: number;
  speed: number;
  thickness: number;
  turbulence: number;
}

const initialValues: OrbitDustValues = {
  radius: orbitDustDefaults.radius,
  speed: orbitDustDefaults.speed,
  thickness: orbitDustDefaults.thickness,
  turbulence: orbitDustDefaults.turbulence,
};

const controls: readonly Control<keyof OrbitDustValues>[] = [
  {
    key: "radius",
    kind: "range",
    label: "Radius",
    max: 2.2,
    min: 0.8,
    step: 0.1,
  },
  {
    key: "thickness",
    kind: "range",
    label: "Thickness",
    max: 0.3,
    min: 0,
    step: 0.01,
  },
  {
    key: "turbulence",
    kind: "range",
    label: "Turbulence",
    max: 1.5,
    min: 0,
    step: 0.05,
  },
  { key: "speed", kind: "range", label: "Speed", max: 3, min: 0, step: 0.1 },
];

export const Demo = () => (
  <Playground controls={controls} initialValues={initialValues}>
    {(values) => (
      <OrbitDust
        className="aspect-video w-96 max-w-full"
        radius={values.radius}
        speed={values.speed}
        thickness={values.thickness}
        turbulence={values.turbulence}
      />
    )}
  </Playground>
);

export const Thumbnail = () => (
  <div className="absolute inset-0">
    <OrbitDustPoster />
  </div>
);
