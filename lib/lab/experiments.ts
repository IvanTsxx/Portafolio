import type { ComponentType } from "react";

import { AsciiLive } from "@/components/lab/experiments/ascii/live";
import { AsciiPoster } from "@/components/lab/experiments/ascii/poster";
import { ContourMapLive } from "@/components/lab/experiments/contour-map/live";
import { ContourMapPoster } from "@/components/lab/experiments/contour-map/poster";
import { DitherFieldLive } from "@/components/lab/experiments/dither-field/live";
import { DitherFieldPoster } from "@/components/lab/experiments/dither-field/poster";
import { DotGridLive } from "@/components/lab/experiments/dot-grid/live";
import { DotGridPoster } from "@/components/lab/experiments/dot-grid/poster";
import { ErrorDiffusionLive } from "@/components/lab/experiments/error-diffusion/live";
import { ErrorDiffusionPoster } from "@/components/lab/experiments/error-diffusion/poster";
import { HalftoneLive } from "@/components/lab/experiments/halftone/live";
import { HalftonePoster } from "@/components/lab/experiments/halftone/poster";
import { MatrixRainLive } from "@/components/lab/experiments/matrix-rain/live";
import { MatrixRainPoster } from "@/components/lab/experiments/matrix-rain/poster";
import { PaperFoldLive } from "@/components/lab/experiments/paper-fold/live";
import { PaperFoldPoster } from "@/components/lab/experiments/paper-fold/poster";
import { SignalTypeLive } from "@/components/lab/experiments/signal-type/live";
import { SignalTypePoster } from "@/components/lab/experiments/signal-type/poster";
import { StampTypeLive } from "@/components/lab/experiments/stamp-type/live";
import { StampTypePoster } from "@/components/lab/experiments/stamp-type/poster";
import { labTopics } from "@/lib/lab/topics";
import type { LabTopic } from "@/lib/lab/topics";

export type ExperimentSlug =
  | "dither-field"
  | "dot-grid"
  | "signal-type"
  | "matrix-rain"
  | "error-diffusion"
  | "halftone"
  | "ascii"
  | "paper-fold"
  | "contour-map"
  | "stamp-type";

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
  ascii: {
    Poster: AsciiPoster,
    Preview: AsciiLive,
    hasControls: true,
    implementation: [
      "Glyphs are drawn once in Geist Mono to a texture atlas and sorted by measured ink.",
      "A fragment shader picks each cell's glyph from the source tone and samples it from the atlas.",
      "Inside the scanner the grid halves its cell size or prints in negative.",
    ],
    index: "LAB-07",
    related: ["halftone", "signal-type"],
    slug: "ascii",
    summary: "A lit form typed in mono glyphs, read through a pointer scanner.",
    technicalNotes: [
      "The whole grid is one draw call. A new glyph set rebuilds only the atlas.",
      "Custom sets accept twelve characters. A space is always the lightest step.",
      "The render loop stops offscreen. Reduced motion renders a single frame.",
    ],
    technologies: ["React Three Fiber", "GLSL", "Canvas 2D", "Geist Mono"],
    title: "ASCII scanner",
    topics: ["Shader", "Typography", "WebGL"],
    year: 2026,
  },
  "contour-map": {
    Poster: ContourMapPoster,
    Preview: ContourMapLive,
    hasControls: true,
    implementation: [
      "One full-viewport plane. The fragment shader reads the source brightness as height and adds a Gaussian hill at the pointer.",
      "Lines come from fract(height × levels) divided by its screen-space derivative, so every line stays the same pixel width.",
      "A click reads the ground height on the CPU from the same function and drops a benchmark with its elevation.",
    ],
    index: "LAB-15",
    related: ["halftone", "dot-grid"],
    slug: "contour-map",
    summary:
      "A lit form surveyed as contour lines around a hill the pointer raises.",
    technicalNotes: [
      "Every fifth line is an index contour. The poster runs marching squares on the server.",
      "The portrait is read at a coarse mip, so its contours stay smooth.",
      "The render loop stops offscreen. Reduced motion renders a single frame.",
    ],
    technologies: ["React Three Fiber", "GLSL", "fwidth", "Marching squares"],
    title: "Contour map",
    topics: ["Shader", "WebGL", "Image"],
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
    related: ["dot-grid", "signal-type"],
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
    index: "LAB-03",
    related: ["dither-field", "signal-type"],
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
  "error-diffusion": {
    Poster: ErrorDiffusionPoster,
    Preview: ErrorDiffusionLive,
    hasControls: true,
    implementation: [
      "The source is downsampled to luminance on a 2D canvas. Contrast and threshold reshape it once per change.",
      "Each kernel is a table of offsets and weights. One loop spreads the error forward, mirrored on odd rows when serpentine.",
      "Both results paint into stacked canvases. The split is a clip-path, so dragging it never re-dithers.",
    ],
    index: "LAB-05",
    related: ["dither-field", "dot-grid"],
    slug: "error-diffusion",
    summary: "Error diffusion against ordered Bayer, split down the middle.",
    technicalNotes: [
      "Diffusion is sequential, so it runs on the CPU at a capped 160k pixels. The stage shows its time.",
      "It only reruns on a control change or resize, and not while offscreen. Nothing animates.",
    ],
    technologies: ["Canvas 2D", "TypedArrays", "Floyd–Steinberg", "Atkinson"],
    title: "Error diffusion",
    topics: ["Image"],
    year: 2026,
  },
  halftone: {
    Poster: HalftonePoster,
    Preview: HalftoneLive,
    hasControls: true,
    implementation: [
      "One full-viewport plane. The fragment shader rotates each pixel into screen space and tests the four nearest cells.",
      "Each cell reads the source tone at its center and sizes its mark so the inked area matches that tone.",
      "The source is a shaded sphere or the portrait relit from its own luminance slope. The pointer is the light.",
    ],
    index: "LAB-06",
    related: ["ascii", "dot-grid"],
    slug: "halftone",
    summary: "An amplitude-modulated print screen, relit by the pointer.",
    technicalNotes: [
      "Round, line and square marks share one loop. Only the coverage-to-size curve changes.",
      "The portrait is sampled at a mip level matched to the cell, so each mark averages its own area.",
      "The render loop stops offscreen. Reduced motion renders a single frame.",
    ],
    technologies: ["React Three Fiber", "Three.js", "GLSL", "ShaderMaterial"],
    title: "Halftone",
    topics: ["Shader", "WebGL"],
    year: 2026,
  },
  "matrix-rain": {
    Poster: MatrixRainPoster,
    Preview: MatrixRainLive,
    hasControls: true,
    implementation: [
      "One full-viewport plane with a ShaderMaterial. Each pixel finds its dot, then the glyph cell and column above it.",
      "Glyphs are box-filtered into a 6×8 texel atlas, one texel per dot. A Bayer threshold thins the trails.",
      "The pointer pushes columns sideways with a Gaussian falloff, so the rain parts around it.",
    ],
    index: "LAB-04",
    related: ["dot-grid", "dither-field"],
    slug: "matrix-rain",
    summary:
      "Digital rain printed as dot-matrix glyphs that part around the pointer.",
    technicalNotes: [
      "It shares the site canvas: one draw call, one texture lookup per pixel, no second WebGL context.",
      "The render loop stops offscreen. Reduced motion renders a single frame.",
    ],
    technologies: ["React Three Fiber", "Three.js", "GLSL", "DataTexture"],
    title: "Matrix rain",
    topics: ["Shader", "WebGL", "Motion"],
    year: 2026,
  },
  "paper-fold": {
    Poster: PaperFoldPoster,
    Preview: PaperFoldLive,
    hasControls: true,
    implementation: [
      "Each panel is one quad on a hinge group. A damped spring drives fold progress, and each hinge maps it to an angle.",
      "The fragment shader prints a halftone, rules and text bars in page space, so the print travels with its panel.",
      "Light comes from a fixed world direction. Each facet shades by its own normal, and the back shows a faint show-through.",
    ],
    index: "LAB-14",
    related: ["halftone", "dot-grid"],
    slug: "paper-fold",
    summary: "A printed dossier page that folds along its creases on a spring.",
    technicalNotes: [
      "Three quads and one shader program. No lights, shadows or textures.",
      "Dragging sets the spring target. Release snaps to open or shut, carrying the drag's velocity.",
      "The spring stops offscreen. Reduced motion jumps between states.",
    ],
    technologies: ["React Three Fiber", "Three.js", "GLSL", "Springs"],
    title: "Paper fold",
    topics: ["WebGL", "Shader", "Motion"],
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
    related: ["dither-field", "dot-grid"],
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
  "stamp-type": {
    Poster: StampTypePoster,
    Preview: StampTypeLive,
    hasControls: true,
    implementation: [
      "Each press draws its text in Geist Mono into its own row of a canvas atlas, so older prints keep their words.",
      "One full-viewport shader loops over twelve impressions. Noise sets ink pressure, rubber chips and the paper's tooth.",
      "The pad loses ink on every press. Prints fade until it is re-inked.",
    ],
    index: "LAB-16",
    related: ["ascii", "signal-type"],
    slug: "stamp-type",
    summary:
      "Mono type pressed like a rubber stamp, fading as the pad runs dry.",
    technicalNotes: [
      "Twelve impressions in one draw call. The thirteenth reuses the oldest slot.",
      "Ink pools at the rubber's edges, read from a blurred mip of the same glyph.",
      "Reduced motion prints each press at once, with no bloom.",
    ],
    technologies: ["React Three Fiber", "GLSL", "Canvas 2D", "Geist Mono"],
    title: "Stamp type",
    topics: ["Typography", "Shader", "WebGL"],
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
