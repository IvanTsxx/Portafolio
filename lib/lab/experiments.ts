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
  description: string;
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
    description:
      "A blueprint sheet where every intersection is a target. Hovering a cell draws a crosshair through the whole sheet, clicking pins it, and the sheet assembles itself as it scrolls into view. There is no JavaScript in it: the page ships plain HTML and the browser does the rest.",
    hasControls: false,
    implementation: [
      "The sheet is a server-rendered grid of labels, each wrapping a visually hidden radio input. Checking one pins the crosshair because the selection lives in the form state, not in React.",
      "The hovered cell, or the checked one when nothing is hovered, takes anchor-name --lab-cell. Two hairlines and a coordinate tag are positioned against it with anchor(), so the crosshair follows any cell without a rule per row or column.",
      "The parent grid uses :has() to dim every other cell while one is active and to swap the readout between hover and pinned states.",
      "Rows reveal on a view() timeline set inline, so the entrance is driven by scroll position and never runs while the sheet is offscreen.",
    ],
    index: "LAB-03",
    related: ["module-assembly", "signal-type"],
    slug: "blueprint-intersections",
    summary:
      "A crosshair that follows any grid cell using anchor positioning and :has(), with zero JavaScript.",
    technicalNotes: [
      "Anchor positioning is required for the crosshair. Browsers without it keep the per-cell highlight and coordinates, and the hairlines stay hidden behind @supports.",
      "Scroll-driven entrances fall back to a fully visible sheet where animation-timeline is unsupported, because the base state is the final state.",
      "Under reduced motion the scroll entrance is removed; hover and pin still work since they change color, not position.",
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
    description:
      "A noise field rendered through an ordered Bayer matrix, the way print and early screens faked tone with two inks. The pointer pushes a pressure wave through the field, and the cells that cross the highest threshold switch to clay.",
    hasControls: true,
    implementation: [
      "One full-viewport plane with a custom ShaderMaterial. The fragment shader snaps gl_FragCoord to a cell grid, samples a fractal value-noise field at the cell center, and compares it against a recursive Bayer threshold.",
      "Matrix size is a uniform. bayer2, bayer4 and bayer8 are composed from the same 2x2 function, so switching matrices costs no recompilation.",
      "The pointer is damped toward its target inside useFrame and written straight to a uniform. React state only changes when a control changes.",
      "Ink, paper and clay come from the site tokens. The canvas renders flat, without tone mapping, so the two inks match the surrounding page exactly.",
    ],
    index: "LAB-01",
    related: ["module-assembly", "signal-type"],
    slug: "dither-field",
    summary:
      "Ordered Bayer dithering over a noise field that reacts to the pointer, in two inks and one clay accent.",
    technicalNotes: [
      "Dithering is resolution dependent, so cell size is expressed in CSS pixels and multiplied by the device pixel ratio inside the shader.",
      "The render loop switches to on-demand when the canvas leaves the viewport, which drops GPU work to zero while the page scrolls past it.",
      "Under reduced motion the field stops drifting and renders a single frame. The pointer still moves the wave because the user drives it.",
    ],
    technologies: ["React Three Fiber", "Three.js", "GLSL", "ShaderMaterial"],
    title: "Dither field",
    topics: ["Shader", "WebGL"],
    year: 2026,
  },
  "module-assembly": {
    Poster: ModuleAssemblyPoster,
    Preview: ModuleAssemblyLive,
    description:
      "Loose modules gather into a finished interface: a card, a stacked panel, a bento grid. A builder agent stands by with the parts. The assembly can be scrubbed by hand or left to cycle on its own.",
    hasControls: true,
    implementation: [
      "Every module is one instance of a single InstancedMesh, so a whole layout is one draw call. Layouts are plain arrays of rectangles that are padded to the same instance count.",
      "Each instance damps its position, rotation and scale toward a target that mixes its scattered pose with its layout slot. Switching layouts mid-assembly simply retargets the damping, so nothing snaps.",
      "Progress is staggered by instance index, which reads as modules arriving in sequence instead of a single morph.",
      "The agent is the shared Agent component used through its public props. It stays the only clay object in the scene.",
    ],
    index: "LAB-04",
    related: ["dither-field", "blueprint-intersections"],
    slug: "module-assembly",
    summary:
      "Instanced modules that assemble into interface layouts, scrubbed by hand or cycled automatically.",
    technicalNotes: [
      "Matrices are composed into scratch objects reused across frames, so the loop allocates nothing.",
      "The scene renders on demand when it is offscreen or when auto-cycle is off and every module has settled.",
      "Under reduced motion modules jump straight to their target pose and auto-cycle is unavailable.",
    ],
    technologies: ["React Three Fiber", "Three.js", "InstancedMesh", "Drei"],
    title: "Module assembly",
    topics: ["3D", "WebGL", "UI"],
    year: 2026,
  },
  "signal-type": {
    Poster: SignalTypePoster,
    Preview: SignalTypeLive,
    description:
      "A word set in Archivo whose width and weight axes respond to the pointer. Letters near the cursor stretch and thicken, letters further away condense. A wave mode drives the same axes on a loop, and the word can be reassembled from its letters.",
    hasControls: true,
    implementation: [
      "Each letter is a span whose font-variation-settings read two custom properties. GSAP quickTo setters write those properties, so pointer moves become damped tweens without a React render.",
      "Letter centers are read once per pointer move, before GSAP writes on the next tick, which keeps layout reads and writes in separate phases.",
      "Wave mode is a single repeating timeline staggered across letters. It is paused whenever the stage is offscreen.",
      "Everything lives in one useGSAP scope tied to the stage ref, so switching words reverts every tween and listener.",
    ],
    index: "LAB-02",
    related: ["blueprint-intersections", "dither-field"],
    slug: "signal-type",
    summary:
      "Variable-font width and weight driven by pointer proximity with GSAP, plus a looping wave mode.",
    technicalNotes: [
      "Changing the width axis changes layout. It stays cheap because the stage holds one short word and nothing else reflows around it.",
      "Custom properties are set on leaf spans only, so a change never forces style recalculation on descendants.",
      "Under reduced motion the word renders as a fixed width ramp with no tweening, and wave mode is disabled.",
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
