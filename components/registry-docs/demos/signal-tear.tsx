"use client";

import { SignalTearPoster } from "@/components/lab/experiments/signal-tear/poster";
import { SignalTear } from "@/components/registry-docs/demos/signal-tear-view";
import { Playground } from "@/components/registry-docs/playground";
import type { Control } from "@/components/registry-docs/playground";
import { signalTearDefaults } from "@/registry/ivan/components/signal-tear/signal-tear-material";

const imageSrc = "/examples/dusk.jpg";

interface SignalTearValues {
  ghost: number;
  grain: number;
  tear: number;
}

const initialValues: SignalTearValues = {
  ghost: signalTearDefaults.ghost,
  grain: signalTearDefaults.grain,
  tear: signalTearDefaults.tear,
};

const controls: readonly Control<keyof SignalTearValues>[] = [
  { key: "tear", kind: "range", label: "Tear", max: 1, min: 0, step: 0.05 },
  { key: "ghost", kind: "range", label: "Ghost", max: 1, min: 0, step: 0.05 },
  { key: "grain", kind: "range", label: "Grain", max: 1, min: 0, step: 0.05 },
];

export const Demo = () => (
  <Playground controls={controls} initialValues={initialValues}>
    {(values) => (
      <SignalTear
        className="w-96 max-w-full"
        ghost={values.ghost}
        grain={values.grain}
        src={imageSrc}
        tear={values.tear}
      />
    )}
  </Playground>
);

export const Thumbnail = () => (
  <div className="absolute inset-0">
    <SignalTearPoster />
  </div>
);
