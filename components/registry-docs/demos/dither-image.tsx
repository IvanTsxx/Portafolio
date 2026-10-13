"use client";

import { Playground } from "@/components/registry-docs/playground";
import type { Control } from "@/components/registry-docs/playground";
import { DitherImage } from "@/registry/ivan/ui/dither-image";

const portraitSrc = "/profile/portrait.jpg";

interface DitherImageValues {
  contrast: number;
  drift: number;
  pixelSize: number;
}

const initialValues: DitherImageValues = {
  contrast: 14,
  drift: 11,
  pixelSize: 2,
};

const controls: readonly Control<keyof DitherImageValues>[] = [
  { key: "pixelSize", kind: "range", label: "Pixel size", max: 8, min: 1 },
  { key: "contrast", kind: "range", label: "Contrast", max: 60, min: 0 },
  { key: "drift", kind: "range", label: "Drift", max: 40, min: 0, unit: " px" },
];

export const Demo = () => (
  <Playground controls={controls} initialValues={initialValues}>
    {(values) => (
      <DitherImage
        alt="Portrait of Ivo"
        className="w-56"
        contrast={values.contrast}
        drift={values.drift}
        pixelSize={values.pixelSize}
        src={portraitSrc}
      />
    )}
  </Playground>
);

export const Thumbnail = () => (
  <div className="absolute inset-0 flex items-center justify-center p-6">
    <DitherImage alt="" className="h-full" drift={0} src={portraitSrc} />
  </div>
);
