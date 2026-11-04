"use client";

import { VegetaPoster } from "@/components/lab/experiments/vegeta/poster";
import { BlastPrint } from "@/components/registry-docs/demos/blast-print-view";
import { Playground } from "@/components/registry-docs/playground";
import type { Control } from "@/components/registry-docs/playground";
import { blastPrintDefaults } from "@/registry/ivan/components/blast-print/blast-print-material";
import { orderedDithers } from "@/registry/ivan/lib/ordered-print";
import type { OrderedDither } from "@/registry/ivan/lib/ordered-print";

const imageSrc = "/examples/dusk.jpg";

interface BlastPrintValues {
  auraRadius: number;
  cell: number;
  dither: string;
}

const initialValues: BlastPrintValues = {
  auraRadius: blastPrintDefaults.auraRadius,
  cell: blastPrintDefaults.cell,
  dither: blastPrintDefaults.dither,
};

const controls: readonly Control<keyof BlastPrintValues>[] = [
  { key: "dither", kind: "choice", label: "Dither", options: orderedDithers },
  {
    key: "cell",
    kind: "range",
    label: "Cell size",
    max: 8,
    min: 2,
    unit: " px",
  },
  {
    key: "auraRadius",
    kind: "range",
    label: "Aura radius",
    max: 2,
    min: 0.5,
    step: 0.05,
  },
];

const ditherOf = (value: string): OrderedDither =>
  orderedDithers.find((mode) => mode === value) ?? blastPrintDefaults.dither;

export const Demo = () => (
  <Playground controls={controls} initialValues={initialValues}>
    {(values, { runId }) => (
      <BlastPrint
        auraRadius={values.auraRadius}
        blasts={runId}
        cell={values.cell}
        className="w-96 max-w-full"
        dither={ditherOf(values.dither)}
        src={imageSrc}
      />
    )}
  </Playground>
);

export const Thumbnail = () => (
  <div className="absolute inset-0">
    <VegetaPoster />
  </div>
);
