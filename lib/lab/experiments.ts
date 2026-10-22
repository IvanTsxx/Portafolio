import type { ComponentType } from "react";

import { AsciiLive } from "@/components/lab/experiments/ascii/live";
import { AsciiPoster } from "@/components/lab/experiments/ascii/poster";
import { CloudStippleLive } from "@/components/lab/experiments/cloud-stipple/live";
import { CloudStipplePoster } from "@/components/lab/experiments/cloud-stipple/poster";
import { DotGridLive } from "@/components/lab/experiments/dot-grid/live";
import { DotGridPoster } from "@/components/lab/experiments/dot-grid/poster";
import { EngravingLive } from "@/components/lab/experiments/engraving/live";
import { EngravingPoster } from "@/components/lab/experiments/engraving/poster";
import { SignalTearLive } from "@/components/lab/experiments/signal-tear/live";
import { SignalTearPoster } from "@/components/lab/experiments/signal-tear/poster";
import { SpeedSmearLive } from "@/components/lab/experiments/speed-smear/live";
import { SpeedSmearPoster } from "@/components/lab/experiments/speed-smear/poster";
import { SuperSaiyanLive } from "@/components/lab/experiments/super-saiyan/live";
import { SuperSaiyanPoster } from "@/components/lab/experiments/super-saiyan/poster";
import { labTopics } from "@/lib/lab/topics";
import type { LabTopic } from "@/lib/lab/topics";

export type ExperimentSlug =
  | "dot-grid"
  | "ascii"
  | "engraving"
  | "super-saiyan"
  | "speed-smear"
  | "signal-tear"
  | "cloud-stipple";

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
    index: "LAB-02",
    related: ["dot-grid", "engraving"],
    slug: "ascii",
    summary: "A picture typed in mono glyphs, read through a pointer scanner.",
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
  "cloud-stipple": {
    Poster: CloudStipplePoster,
    Preview: CloudStippleLive,
    hasControls: true,
    implementation: [
      "One full-viewport plane. Each cell reads a 64 px blue noise tile as its threshold.",
      "A dot lands in the cell when the picture is bright enough, jittered inside the cell so no grid shows.",
      "Boil reseeds the tile offset a few times a second. The pointer lifts the light under it.",
    ],
    index: "LAB-07",
    related: ["dot-grid", "signal-tear"],
    slug: "cloud-stipple",
    summary: "Clouds stippled in blue noise dots, after Joanie Lemercier.",
    technicalNotes: [
      "Blue noise keeps the dots evenly spaced at every tone, with no clumps and no pattern.",
      "The poster thresholds the same image against the same tile on the server.",
      "The render loop stops offscreen. Reduced motion holds one set of dots.",
    ],
    technologies: ["React Three Fiber", "GLSL", "Blue noise", "Stippling"],
    title: "Cloud stipple",
    topics: ["Shader", "WebGL", "Image"],
    year: 2026,
  },
  "dot-grid": {
    Poster: DotGridPoster,
    Preview: DotGridLive,
    hasControls: true,
    implementation: [
      "One full-viewport plane with a ShaderMaterial. Each pixel tests the dots of its own cell and the eight around it.",
      "Value noise or a picture sets each dot's radius. The lens springs toward the pointer in useFrame and pushes dots outward.",
      "With a picture, the lens also acts as the light, so tones shift as it moves.",
    ],
    index: "LAB-01",
    related: ["cloud-stipple", "ascii"],
    slug: "dot-grid",
    summary: "A halftone dot grid of a picture that swells around the pointer.",
    technicalNotes: [
      "It shares the site canvas, so the grid costs one draw call and no second WebGL context.",
      "The render loop stops offscreen. Reduced motion renders a single frame.",
    ],
    technologies: ["React Three Fiber", "Three.js", "GLSL", "ShaderMaterial"],
    title: "Dot grid",
    topics: ["Shader", "WebGL", "Motion"],
    year: 2026,
  },
  engraving: {
    Poster: EngravingPoster,
    Preview: EngravingLive,
    hasControls: true,
    implementation: [
      "One full-viewport plane. Each pixel measures its distance to the nearest line of a ruled field.",
      "A relief height shifts that field, so the lines bend over the form like a burin following it.",
      "Line width follows tone. Past 62% ink a second set crosses at 60°.",
    ],
    index: "LAB-03",
    related: ["ascii", "speed-smear"],
    slug: "engraving",
    summary: "Banknote line engraving of a picture, bent over its relief.",
    technicalNotes: [
      "Edges are antialiased with fwidth, so any pitch stays crisp without supersampling.",
      "A picture's relief is a blurred mip of its own luminance.",
      "The render loop stops offscreen. Reduced motion renders a single frame.",
    ],
    technologies: [
      "React Three Fiber",
      "GLSL",
      "ShaderMaterial",
      "Derivatives",
    ],
    title: "Engraving",
    topics: ["Shader", "WebGL", "Image"],
    year: 2026,
  },
  "signal-tear": {
    Poster: SignalTearPoster,
    Preview: SignalTearLive,
    hasControls: true,
    implementation: [
      "One full-viewport plane. Rows are grouped into bands of random height that reshuffle three times a second.",
      "Torn bands shift sideways. Rows near the pointer tear more often, and a fast pointer tears them all.",
      "Light drags to the right as a ghost trail, then a vignette and two octaves of grain finish the frame.",
    ],
    index: "LAB-06",
    related: ["speed-smear", "cloud-stipple"],
    slug: "signal-tear",
    summary:
      "A grainy frame whose rows tear and smear light, like a bad VHS still.",
    technicalNotes: [
      "Grain changes twelve times a second, so it reads as film rather than static.",
      "The ghost keeps the brightest decayed sample, so dark shapes never smear into light.",
      "The render loop stops offscreen. Reduced motion holds one torn frame.",
    ],
    technologies: ["React Three Fiber", "GLSL", "ShaderMaterial"],
    title: "Signal tear",
    topics: ["Shader", "WebGL", "Image"],
    year: 2026,
  },
  "speed-smear": {
    Poster: SpeedSmearPoster,
    Preview: SpeedSmearLive,
    hasControls: true,
    implementation: [
      "One full-viewport plane. An oval around the pointer averages 32 samples along the smear angle.",
      "Each streak of rows gets its own length, so the blur breaks into anime speed lines.",
      "Pointer speed adds to the smear and fades out, then an ordered dither prints the result.",
    ],
    index: "LAB-05",
    related: ["signal-tear", "super-saiyan"],
    slug: "speed-smear",
    summary:
      "A face smeared sideways by speed, the way anime draws a fast turn.",
    technicalNotes: [
      "Longer smears sample a coarser mip, so 32 taps stay smooth.",
      "Each picture carries a focal point, so the crop keeps the face on any stage shape.",
      "The render loop stops offscreen. Reduced motion holds the smear still.",
    ],
    technologies: ["React Three Fiber", "GLSL", "Bayer", "Motion blur"],
    title: "Speed smear",
    topics: ["Shader", "WebGL", "Image"],
    year: 2026,
  },
  "super-saiyan": {
    Poster: SuperSaiyanPoster,
    Preview: SuperSaiyanLive,
    hasControls: true,
    implementation: [
      "One full-viewport plane. Each cell samples the image at a mip matched to its size, sharpens it against a blurrier mip and runs a contrast and gamma curve.",
      "The threshold comes from Bayer 2×2, 4×4 or 8×8, a 64×64 blue-noise tile, or a 45° dot screen for halftone.",
      "A strike lifts the sky, draws a forked bolt in paper behind Goku and crossfades, cell by cell, to a color ordered dither in twelve inks taken from the image.",
      "The aura springs to the pointer and gathers on the hair silhouette. A click shakes the frame by whole cells and sends a burst ring that bends the image.",
    ],
    index: "LAB-04",
    related: ["speed-smear", "signal-tear"],
    slug: "super-saiyan",
    summary:
      "Goku in a storm, dithered live in ink. Lightning prints him in color.",
    technicalNotes: [
      "The palette is a median cut of the image, weighted toward saturated pixels. A script writes it next to the poster bitmap.",
      "The tone curve is one table shared by the shader and the poster script, so the card matches the live frame.",
      "Strikes stay three seconds apart and Strike now waits a second between bolts. Reduced motion draws one still frame with no flashes.",
      "Everything is one draw call. The render loop stops offscreen and nothing animates through React state.",
    ],
    technologies: [
      "React Three Fiber",
      "GLSL",
      "Bayer",
      "Blue noise",
      "Median cut",
    ],
    title: "Super Saiyan",
    topics: ["Shader", "WebGL", "Image"],
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
