"use client";

import { LunarDitherPoster } from "@/components/lab/experiments/lunar-dither/poster";
import { LunarDither } from "@/components/registry-docs/demos/lunar-dither-view";
import { Playground } from "@/components/registry-docs/playground";
import type { Control } from "@/components/registry-docs/playground";
import { lunarDitherDefaults } from "@/registry/ivan/components/lunar-dither/lunar-dither-material";

interface LunarDitherValues {
  craterScale: number;
  followPointer: boolean;
  grain: number;
  impacts: boolean;
  pixelSize: number;
}

const initialValues: LunarDitherValues = {
  craterScale: lunarDitherDefaults.craterScale,
  followPointer: lunarDitherDefaults.followPointer,
  grain: lunarDitherDefaults.grain,
  impacts: lunarDitherDefaults.impacts,
  pixelSize: lunarDitherDefaults.pixelSize,
};

const controls: readonly Control<keyof LunarDitherValues>[] = [
  {
    key: "pixelSize",
    kind: "range",
    label: "Pixel size",
    max: 6,
    min: 1,
    unit: " px",
  },
  { key: "grain", kind: "range", label: "Grain", max: 1, min: 0, step: 0.05 },
  {
    key: "craterScale",
    kind: "range",
    label: "Crater scale",
    max: 6,
    min: 1.5,
    step: 0.5,
  },
  { key: "followPointer", kind: "toggle", label: "Follow pointer" },
  { key: "impacts", kind: "toggle", label: "Click to bombard" },
];

export const Demo = () => (
  <Playground controls={controls} initialValues={initialValues}>
    {(values) => (
      <LunarDither
        className="w-72 max-w-full"
        craterScale={values.craterScale}
        followPointer={values.followPointer}
        grain={values.grain}
        impacts={values.impacts}
        pixelSize={values.pixelSize}
      />
    )}
  </Playground>
);

export const Thumbnail = () => (
  <div className="absolute inset-0">
    <LunarDitherPoster />
  </div>
);
