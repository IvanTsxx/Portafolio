"use client";

import { Playground } from "@/components/registry-docs/playground";
import type { Control } from "@/components/registry-docs/playground";
import {
  PagePeel,
  PagePeelTrigger,
} from "@/registry/ivan/components/page-peel/page-peel";

interface PeelValues {
  openAt: number;
}

const initialValues: PeelValues = { openAt: 25 };

const controls: readonly Control<keyof PeelValues>[] = [
  {
    key: "openAt",
    kind: "range",
    label: "Opens past",
    max: 50,
    min: 10,
    unit: " %",
  },
];

const DemoUnderside = () => (
  <div className="bg-foreground text-background flex h-full flex-col justify-end gap-2 p-6">
    <span className="label opacity-60">Underside · Sheet 1 of 1</span>
    <span className="display text-title">Drawn on the back</span>
  </div>
);

export const Demo = () => (
  <Playground controls={controls} initialValues={initialValues}>
    {(values) => (
      <PagePeel
        className="border-border-strong h-80 w-full max-w-xl border"
        openAt={values.openAt / 100}
        scope="container"
        underside={<DemoUnderside />}
      >
        <div className="bg-background flex h-full flex-col justify-between gap-6 p-6">
          <div className="flex flex-col gap-2">
            <span className="label text-faint">Page · 01</span>
            <p className="display text-title max-w-sm">
              Drag the corner. Let go early and it springs back.
            </p>
          </div>
          <PagePeelTrigger className="label text-muted-foreground hover:text-foreground w-fit transition-colors duration-200" />
        </div>
      </PagePeel>
    )}
  </Playground>
);

export const Thumbnail = () => (
  <div className="absolute inset-0 flex items-center justify-center p-6">
    <svg
      aria-hidden
      className="text-foreground h-full max-h-40 w-auto"
      fill="none"
      viewBox="0 0 160 120"
    >
      <path
        d="M8 8h144v64L104 112H8Z"
        fill="var(--background)"
        stroke="currentColor"
      />
      <path d="M152 72v40h-48Z" fill="currentColor" />
      <path
        d="M152 72 104 112l8.7-47.2Z"
        fill="var(--surface)"
        stroke="currentColor"
      />
      <path d="M20 24h64M20 34h88M20 44h48" stroke="currentColor" />
    </svg>
  </div>
);
