"use client";

import { DustPortraitPoster } from "@/components/lab/experiments/dust-portrait/poster";
import { DustPortrait } from "@/components/registry-docs/demos/dust-portrait-view";
import { Playground } from "@/components/registry-docs/playground";
import type { Control } from "@/components/registry-docs/playground";
import { dustPortraitDefaults } from "@/registry/ivan/components/dust-portrait/dust-portrait-material";

const avatarSrc = "/profile/avatar.webp";

interface DustPortraitValues {
  density: number;
  dispersion: number;
  drift: number;
  idle: boolean;
}

const initialValues: DustPortraitValues = {
  density: dustPortraitDefaults.density,
  dispersion: dustPortraitDefaults.dispersion,
  drift: dustPortraitDefaults.drift,
  idle: dustPortraitDefaults.idle,
};

const controls: readonly Control<keyof DustPortraitValues>[] = [
  {
    key: "density",
    kind: "range",
    label: "Density",
    max: 1.5,
    min: 0.25,
    step: 0.05,
    unit: "×",
  },
  {
    key: "dispersion",
    kind: "range",
    label: "Dispersion",
    max: 2,
    min: 0,
    step: 0.05,
  },
  { key: "drift", kind: "range", label: "Drift", max: 2, min: 0, step: 0.05 },
  { key: "idle", kind: "toggle", label: "Idle shed" },
];

export const Demo = () => (
  <Playground controls={controls} initialValues={initialValues}>
    {(values) => (
      <DustPortrait
        className="w-96 max-w-full"
        density={values.density}
        dispersion={values.dispersion}
        drift={values.drift}
        focus={{ x: 0.5, y: 0.42 }}
        idle={values.idle}
        src={avatarSrc}
      />
    )}
  </Playground>
);

export const Thumbnail = () => (
  <div className="absolute inset-0">
    <DustPortraitPoster />
  </div>
);
