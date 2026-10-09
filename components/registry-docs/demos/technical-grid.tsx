"use client";

import { Playground } from "@/components/registry-docs/playground";
import type { Control } from "@/components/registry-docs/playground";
import { TechnicalGrid } from "@/registry/ivan/ui/technical-grid";
import type { TechnicalGridProps } from "@/registry/ivan/ui/technical-grid";

interface GridValues {
  animated: boolean;
  cellSize: number;
  fade: NonNullable<TechnicalGridProps["fade"]>;
  majorEvery: number;
  markers: boolean;
  nodes: number;
  scan: NonNullable<TechnicalGridProps["scan"]>;
  scanDuration: number;
  tone: NonNullable<TechnicalGridProps["tone"]>;
}

const initialValues: GridValues = {
  animated: true,
  cellSize: 32,
  fade: "none",
  majorEvery: 4,
  markers: true,
  nodes: 5,
  scan: "horizontal",
  scanDuration: 8,
  tone: "muted",
};

const controls: readonly Control<keyof GridValues>[] = [
  {
    key: "tone",
    kind: "choice",
    label: "Tone",
    options: ["muted", "strong", "clay"],
  },
  {
    key: "fade",
    kind: "choice",
    label: "Fade",
    options: ["none", "edges", "top", "bottom"],
  },
  {
    key: "scan",
    kind: "choice",
    label: "Scan",
    options: ["none", "horizontal", "vertical", "both"],
  },
  {
    key: "cellSize",
    kind: "range",
    label: "Cell size",
    max: 96,
    min: 16,
    step: 4,
    unit: " px",
  },
  { key: "majorEvery", kind: "range", label: "Major every", max: 8, min: 0 },
  { key: "nodes", kind: "range", label: "Nodes", max: 24, min: 0 },
  {
    key: "scanDuration",
    kind: "range",
    label: "Scan duration",
    max: 20,
    min: 2,
    unit: " s",
  },
  { key: "markers", kind: "toggle", label: "Corner marks" },
  { key: "animated", kind: "toggle", label: "Animated" },
];

export const Demo = () => (
  <Playground controls={controls} initialValues={initialValues}>
    {(values, { runId }) => (
      <TechnicalGrid
        {...values}
        caption="Sample"
        className="border-border bg-background h-72 w-full max-w-2xl border"
        key={runId}
        label={`Grid ${values.cellSize} px`}
      >
        <div className="flex h-full items-center justify-center">
          <p className="text-foreground font-mono text-xs tracking-widest uppercase">
            Calibration field
          </p>
        </div>
      </TechnicalGrid>
    )}
  </Playground>
);

export const Thumbnail = () => (
  <TechnicalGrid
    className="absolute inset-0"
    fade="edges"
    markers={false}
    nodes={6}
    scan="both"
    tone="strong"
  />
);
