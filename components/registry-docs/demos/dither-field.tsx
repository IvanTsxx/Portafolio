"use client";

import { Playground } from "@/components/registry-docs/playground";
import type { Control } from "@/components/registry-docs/playground";
import { DitherField } from "@/registry/ivan/ui/dither-field";
import type { DitherFieldProps } from "@/registry/ivan/ui/dither-field";

interface DitherFieldValues {
  anchor: NonNullable<DitherFieldProps["anchor"]>;
  animated: boolean;
  cellSize: number;
  density: number;
  interactive: boolean;
  seed: string;
}

const initialValues: DitherFieldValues = {
  anchor: "top-right",
  animated: true,
  cellSize: 4,
  density: 62,
  interactive: true,
  seed: "field",
};

const controls: readonly Control<keyof DitherFieldValues>[] = [
  {
    key: "anchor",
    kind: "choice",
    label: "Anchor",
    options: ["top-right", "top", "bottom", "center", "fill"],
  },
  {
    key: "density",
    kind: "range",
    label: "Density",
    max: 100,
    min: 10,
    unit: "%",
  },
  {
    key: "cellSize",
    kind: "range",
    label: "Cell",
    max: 12,
    min: 2,
    unit: " px",
  },
  { key: "seed", kind: "text", label: "Seed", maxLength: 16 },
  { key: "animated", kind: "toggle", label: "Animated" },
  { key: "interactive", kind: "toggle", label: "Pointer lens" },
];

export const Demo = () => (
  <Playground controls={controls} initialValues={initialValues}>
    {(values) => (
      <div className="relative isolate flex h-72 w-full items-end p-6">
        <DitherField
          anchor={values.anchor}
          animated={values.animated}
          cellSize={values.cellSize}
          className="opacity-60"
          density={values.density / 100}
          interactive={values.interactive}
          seed={values.seed || "field"}
        />
        <span className="font-mono text-xs tracking-widest uppercase">
          Move the pointer
        </span>
      </div>
    )}
  </Playground>
);

export const Thumbnail = () => (
  <div className="absolute inset-0 isolate">
    <DitherField className="opacity-60" interactive={false} seed="thumbnail" />
  </div>
);
