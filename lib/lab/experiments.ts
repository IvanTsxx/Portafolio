import type { ComponentType } from "react";

import { BlueprintIntersectionsPoster } from "@/components/lab/experiments/blueprint-intersections/poster";
import { BlueprintIntersections } from "@/components/lab/experiments/blueprint-intersections/preview";
import { DitherFieldLive } from "@/components/lab/experiments/dither-field/live";
import { DitherFieldPoster } from "@/components/lab/experiments/dither-field/poster";
import { ModuleAssemblyLive } from "@/components/lab/experiments/module-assembly/live";
import { ModuleAssemblyPoster } from "@/components/lab/experiments/module-assembly/poster";
import { SignalTypeLive } from "@/components/lab/experiments/signal-type/live";
import { SignalTypePoster } from "@/components/lab/experiments/signal-type/poster";
import { labTopics } from "@/lib/lab/topics";
import type { LabTopic } from "@/lib/lab/topics";

export type ExperimentSlug =
  | "dither-field"
  | "signal-type"
  | "blueprint-intersections"
  | "module-assembly";

export interface Experiment {
  slug: ExperimentSlug;
  index: string;
  title: string;
  summary: string;
  topics: readonly LabTopic[];
  technologies: readonly string[];
  year: number;
  sourceUrl?: string;
  hasControls: boolean;
  technicalNotes: readonly string[];
  implementation: readonly string[];
  related: readonly ExperimentSlug[];
  Poster: ComponentType;
  Preview: ComponentType;
}

const experimentsBySlug = {
  "blueprint-intersections": {
    Poster: BlueprintIntersectionsPoster,
    Preview: BlueprintIntersections,
    hasControls: false,
    implementation: [
      "A server-rendered grid of labels, each wrapping a hidden radio. The pinned cell lives in form state, not React.",
      "The hovered or checked cell takes anchor-name --lab-cell. Two hairlines and a coordinate tag position against it with anchor().",
      ":has() on the grid dims every other cell and swaps the readout. Rows reveal on a view() timeline.",
    ],
    index: "LAB-03",
    related: ["module-assembly", "signal-type"],
    slug: "blueprint-intersections",
    summary:
      "A crosshair that follows any grid cell with anchor positioning and :has(). No JavaScript.",
    technicalNotes: [
      "Without anchor positioning the per-cell highlight stays and the hairlines hide behind @supports.",
      "Without animation-timeline the sheet is fully visible, because the base state is the final state.",
      "Reduced motion removes the scroll entrance. Hover and pin still work.",
    ],
    technologies: [
      "CSS anchor positioning",
      ":has()",
      "Scroll-driven animations",
      "Server Components",
    ],
    title: "Blueprint intersections",
    topics: ["CSS", "UI"],
    year: 2026,
  },
  "dither-field": {
    Poster: DitherFieldPoster,
    Preview: DitherFieldLive,
    hasControls: true,
    implementation: [
      "One full-viewport plane with a custom ShaderMaterial. The fragment shader snaps to a cell grid and compares value noise against a recursive Bayer threshold.",
      "Matrix size is a uniform. bayer2, bayer4 and bayer8 share one 2x2 function, so switching costs no recompilation.",
      "The pointer damps toward its target in useFrame and writes straight to a uniform. React state changes only with the controls.",
    ],
    index: "LAB-01",
    related: ["module-assembly", "signal-type"],
    slug: "dither-field",
    summary: "Bayer dithering over a noise field that reacts to the pointer.",
    technicalNotes: [
      "Cell size is in CSS pixels and multiplied by the device pixel ratio inside the shader.",
      "The render loop goes on-demand when the canvas leaves the viewport.",
      "Reduced motion renders a single frame. The pointer still moves the wave.",
    ],
    technologies: ["React Three Fiber", "Three.js", "GLSL", "ShaderMaterial"],
    title: "Dither field",
    topics: ["Shader", "WebGL"],
    year: 2026,
  },
  "module-assembly": {
    Poster: ModuleAssemblyPoster,
    Preview: ModuleAssemblyLive,
    hasControls: true,
    implementation: [
      "Every module is one instance of a single InstancedMesh, so a layout is one draw call.",
      "Each instance damps toward a target that mixes its scattered pose with its layout slot. Switching layouts retargets the damping.",
      "Progress is staggered by instance index, so modules arrive in sequence.",
    ],
    index: "LAB-04",
    related: ["dither-field", "blueprint-intersections"],
    slug: "module-assembly",
    summary:
      "Instanced modules that assemble into interface layouts, scrubbed by hand or cycled.",
    technicalNotes: [
      "Matrices are composed into scratch objects reused across frames. The loop allocates nothing.",
      "The scene renders on demand when offscreen, or when every module has settled.",
      "Reduced motion jumps modules to their target pose and disables auto-cycle.",
    ],
    technologies: ["React Three Fiber", "Three.js", "InstancedMesh", "Drei"],
    title: "Module assembly",
    topics: ["3D", "WebGL", "UI"],
    year: 2026,
  },
  "signal-type": {
    Poster: SignalTypePoster,
    Preview: SignalTypeLive,
    hasControls: true,
    implementation: [
      "Each letter is a span whose font-variation-settings read two custom properties. GSAP quickTo writes them, so pointer moves need no React render.",
      "Letter centers are read once per pointer move, before GSAP writes on the next tick.",
      "Wave mode is one repeating staggered timeline, paused whenever the stage is offscreen.",
      "One useGSAP scope tied to the stage ref reverts every tween and listener when the word changes.",
    ],
    index: "LAB-02",
    related: ["blueprint-intersections", "dither-field"],
    slug: "signal-type",
    summary:
      "Variable-font width and weight driven by pointer proximity with GSAP, plus a wave mode.",
    technicalNotes: [
      "The width axis changes layout. It stays cheap because the stage holds one short word.",
      "Custom properties are set on leaf spans only, so descendants never recalculate style.",
      "Reduced motion renders a fixed width ramp with no tweening. Wave mode is off.",
    ],
    technologies: ["GSAP", "useGSAP", "Variable fonts", "Archivo"],
    title: "Signal type",
    topics: ["Typography", "GSAP", "Motion"],
    year: 2026,
  },
} as const satisfies Record<ExperimentSlug, Experiment>;

export const experiments: readonly Experiment[] = Object.values(
  experimentsBySlug
).toSorted((first, second) => first.index.localeCompare(second.index));

export const getExperiment = (slug: string): Experiment | undefined =>
  experiments.find((experiment) => experiment.slug === slug);

export const activeTopics: readonly LabTopic[] = labTopics.filter((topic) =>
  experiments.some((experiment) => experiment.topics.includes(topic))
);
