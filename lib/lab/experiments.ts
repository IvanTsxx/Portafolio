import type { ComponentType } from "react";

import { BlueprintIntersectionsPoster } from "@/components/lab/experiments/blueprint-intersections/poster";
import { BlueprintIntersections } from "@/components/lab/experiments/blueprint-intersections/preview";
import { DitherFieldLive } from "@/components/lab/experiments/dither-field/live";
import { DitherFieldPoster } from "@/components/lab/experiments/dither-field/poster";
import { DotGridLive } from "@/components/lab/experiments/dot-grid/live";
import { DotGridPoster } from "@/components/lab/experiments/dot-grid/poster";
import { ModuleAssemblyLive } from "@/components/lab/experiments/module-assembly/live";
import { ModuleAssemblyPoster } from "@/components/lab/experiments/module-assembly/poster";
import { SignalTypeLive } from "@/components/lab/experiments/signal-type/live";
import { SignalTypePoster } from "@/components/lab/experiments/signal-type/poster";
import { labTopics } from "@/lib/lab/topics";
import type { LabTopic } from "@/lib/lab/topics";

export type ExperimentSlug =
  | "dither-field"
  | "dot-grid"
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
      "A server-rendered grid of labels, each wrapping a hidden radio.",
      "The active cell takes anchor-name --lab-cell. Two hairlines position against it with anchor().",
    ],
    index: "LAB-03",
    related: ["module-assembly", "signal-type"],
    slug: "blueprint-intersections",
    summary: "A crosshair that follows any grid cell. CSS only.",
    technicalNotes: [
      "Without anchor positioning the hairlines hide and the cell highlight stays.",
      "Reduced motion removes the scroll entrance.",
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
      "One full-viewport plane with a ShaderMaterial. The fragment shader compares value noise against a recursive Bayer threshold.",
      "The pointer damps toward its target in useFrame and writes straight to a uniform.",
    ],
    index: "LAB-01",
    related: ["module-assembly", "signal-type"],
    slug: "dither-field",
    summary: "Bayer dithering over a noise field that reacts to the pointer.",
    technicalNotes: [
      "The render loop goes on-demand when the canvas leaves the viewport.",
      "Reduced motion renders a single frame.",
    ],
    technologies: ["React Three Fiber", "Three.js", "GLSL", "ShaderMaterial"],
    title: "Dither field",
    topics: ["Shader", "WebGL"],
    year: 2026,
  },
  "dot-grid": {
    Poster: DotGridPoster,
    Preview: DotGridLive,
    hasControls: true,
    implementation: [
      "One full-viewport plane with a ShaderMaterial. Each pixel tests the dots of its own cell and the eight around it.",
      "Value noise sets each dot's radius. The lens springs toward the pointer in useFrame and pushes dots outward.",
    ],
    index: "LAB-05",
    related: ["dither-field", "module-assembly"],
    slug: "dot-grid",
    summary: "A halftone dot grid that swells and parts around the pointer.",
    technicalNotes: [
      "It shares the site canvas, so the grid costs one draw call and no second WebGL context.",
      "The render loop stops offscreen. Reduced motion renders a single frame.",
    ],
    technologies: ["React Three Fiber", "Three.js", "GLSL", "ShaderMaterial"],
    title: "Dot grid",
    topics: ["Shader", "WebGL", "Motion"],
    year: 2026,
  },
  "module-assembly": {
    Poster: ModuleAssemblyPoster,
    Preview: ModuleAssemblyLive,
    hasControls: true,
    implementation: [
      "Every module is one instance of a single InstancedMesh, so a layout is one draw call.",
      "Each instance damps toward a target that mixes its scattered pose with its layout slot.",
    ],
    index: "LAB-04",
    related: ["dither-field", "blueprint-intersections"],
    slug: "module-assembly",
    summary: "Instanced modules that assemble into interface layouts.",
    technicalNotes: [
      "The scene renders on demand when offscreen or settled.",
      "Reduced motion jumps modules to their target pose.",
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
      "GSAP quickTo writes two custom properties per letter, so pointer moves need no React render.",
      "Wave mode is one repeating staggered timeline, paused whenever the stage is offscreen.",
    ],
    index: "LAB-02",
    related: ["blueprint-intersections", "dither-field"],
    slug: "signal-type",
    summary: "Variable-font width and weight driven by the pointer.",
    technicalNotes: [
      "The width axis changes layout, so the stage holds one short word.",
      "Reduced motion renders a fixed width ramp. Wave mode is off.",
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
