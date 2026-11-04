"use client";

import { SuperSaiyanPoster } from "@/components/lab/experiments/super-saiyan/poster";
import { StormPrint } from "@/components/registry-docs/demos/storm-print-view";
import { Playground } from "@/components/registry-docs/playground";
import type { Control } from "@/components/registry-docs/playground";
import {
  stormDithers,
  stormPrintDefaults,
} from "@/registry/ivan/components/storm-print/storm-print-material";
import type { StormDither } from "@/registry/ivan/components/storm-print/storm-print-material";

const imageSrc = "/examples/dusk.jpg";

interface StormPrintValues {
  dither: string;
  frequency: number;
  lightning: boolean;
  rain: number;
}

const initialValues: StormPrintValues = {
  dither: stormPrintDefaults.dither,
  frequency: stormPrintDefaults.frequency,
  lightning: stormPrintDefaults.lightning,
  rain: stormPrintDefaults.rain,
};

const controls: readonly Control<keyof StormPrintValues>[] = [
  { key: "dither", kind: "choice", label: "Dither", options: stormDithers },
  { key: "rain", kind: "range", label: "Rain", max: 1, min: 0, step: 0.05 },
  {
    key: "frequency",
    kind: "range",
    label: "Strike rate",
    max: 1,
    min: 0,
    step: 0.05,
  },
  { key: "lightning", kind: "toggle", label: "Storm strikes" },
];

const ditherOf = (value: string): StormDither =>
  stormDithers.find((mode) => mode === value) ?? stormPrintDefaults.dither;

export const Demo = () => (
  <Playground controls={controls} initialValues={initialValues}>
    {(values, { runId }) => (
      <StormPrint
        className="w-96 max-w-full"
        dither={ditherOf(values.dither)}
        frequency={values.frequency}
        lightning={values.lightning}
        rain={values.rain}
        src={imageSrc}
        strikes={runId}
      />
    )}
  </Playground>
);

export const Thumbnail = () => (
  <div className="absolute inset-0">
    <SuperSaiyanPoster />
  </div>
);
