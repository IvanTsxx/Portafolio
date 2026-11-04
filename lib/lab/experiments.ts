import type { ComponentType } from "react";

import { DustPortraitLive } from "@/components/lab/experiments/dust-portrait/live";
import { DustPortraitPoster } from "@/components/lab/experiments/dust-portrait/poster";
import { LunarDitherLive } from "@/components/lab/experiments/lunar-dither/live";
import { LunarDitherPoster } from "@/components/lab/experiments/lunar-dither/poster";
import { OrbitDustLive } from "@/components/lab/experiments/orbit-dust/live";
import { OrbitDustPoster } from "@/components/lab/experiments/orbit-dust/poster";
import { SignalTearLive } from "@/components/lab/experiments/signal-tear/live";
import { SignalTearPoster } from "@/components/lab/experiments/signal-tear/poster";
import { SlimeLive } from "@/components/lab/experiments/slime/live";
import { SlimePoster } from "@/components/lab/experiments/slime/poster";
import { SpeedSmearLive } from "@/components/lab/experiments/speed-smear/live";
import { SpeedSmearPoster } from "@/components/lab/experiments/speed-smear/poster";
import { SuperSaiyanLive } from "@/components/lab/experiments/super-saiyan/live";
import { SuperSaiyanPoster } from "@/components/lab/experiments/super-saiyan/poster";
import { VegetaLive } from "@/components/lab/experiments/vegeta/live";
import { VegetaPoster } from "@/components/lab/experiments/vegeta/poster";
import { labTopics } from "@/lib/lab/topics";
import type { LabTopic } from "@/lib/lab/topics";

export type ExperimentSlug =
  | "super-saiyan"
  | "speed-smear"
  | "signal-tear"
  | "slime"
  | "vegeta"
  | "lunar-dither"
  | "dust-portrait"
  | "orbit-dust";

export interface Experiment {
  slug: ExperimentSlug;
  index: string;
  title: string;
  summary: string;
  topics: readonly LabTopic[];
  technologies: readonly string[];
  year: number;
  sourceUrl?: string;
  registryItem?: string;
  hasOriginal?: boolean;
  hasControls: boolean;
  technicalNotes: readonly string[];
  implementation: readonly string[];
  related: readonly ExperimentSlug[];
  Poster: ComponentType;
  Preview: ComponentType;
}

const experimentsBySlug = {
  "dust-portrait": {
    Poster: DustPortraitPoster,
    Preview: DustPortraitLive,
    hasControls: true,
    hasOriginal: false,
    implementation: [
      "The picture is drawn into a small canvas at the stage's shape, one pixel per grain. Each grain stores its home, its luminance, a seed and how sharp an edge it sits on.",
      "Grains print as round dots whose area follows the tone, so at rest the field reads as the picture and not as a cloud.",
      "The pointer leaves a trail of eleven marks. Each one rises and falls on a critically damped spring, and only those eleven numbers cross to the GPU.",
      "The vertex shader pushes grains near a mark along curl noise and blows them to the right, then lets them settle home as the mark fades.",
      "A click or tap stores its point and birth time in a ring of eight vec3 uniforms. A shockwave front eases out from it, and each grain kicks outward when the front reaches it, then falls home on a critically damped pulse.",
      "The ground draws the same front as a faint paper ring with a short flash at the center, so quick clicks stack into overlapping waves.",
    ],
    index: "LAB-14",
    registryItem: "dust-portrait",
    related: ["orbit-dust", "slime"],
    slug: "dust-portrait",
    summary:
      "A picture printed in dust that blows apart under the pointer and settles back.",
    technicalNotes: [
      "45k to 120k grains, picked from the pointer type and hardwareConcurrency, capped so no grain is smaller than 1.6 CSS px.",
      "Grains on the ground tone are dropped before upload, so a dark picture costs far less than its grid.",
      "The darker theme tone is the ground. The picture always prints as a positive, in either theme.",
      "When the dust has settled and idle shedding is off, the scene stops asking for frames. Reduced motion holds the picture still and never scatters or bursts it.",
    ],
    technologies: ["React Three Fiber", "GLSL", "Curl noise", "GPU points"],
    title: "Dust portrait",
    topics: ["Shader", "WebGL", "Image"],
    year: 2026,
  },
  "lunar-dither": {
    Poster: LunarDitherPoster,
    Preview: LunarDitherLive,
    hasControls: true,
    hasOriginal: false,
    implementation: [
      "A 160×120 sphere with one ShaderMaterial. Three octaves of cellular craters, a flat floor and a raised rim, give a height per pixel.",
      "The height bends the normal through screen-space derivatives, so relief costs one evaluation and no extra vertices.",
      "A soft terminator, a limb rim and a faint earthshine set the tone. An 8×8 Bayer matrix in gl_FragCoord cells prints it in two colors.",
      "The light eases toward the pointer in useFrame. Per-pixel grain shifts the threshold 24 times a second.",
      "A click raycasts an analytic unit sphere, not the 38k triangles, and stores the hit in object space in a vec4 ring of 32 uniforms: direction plus birth time.",
      "The shader adds each impact to the height: a bowl, a raised rim and ejecta rays that fade with age. A 180 ms streak, a paper flash and a dithered shockwave ring announce it.",
    ],
    index: "LAB-09",
    registryItem: "lunar-dither",
    related: ["orbit-dust", "slime"],
    slug: "lunar-dither",
    summary:
      "A cratered moon printed as an ordered dither, lit from the pointer.",
    technicalNotes: [
      "It shares the site canvas through a View, so the moon costs one draw call and no second WebGL context.",
      "Ink and paper come from the theme tokens. The darker one always takes the shadows.",
      "The render loop stops offscreen. Reduced motion renders a single frame with frozen grain, and clicks add the crater at once with no streak or ring.",
      "Craters live in object space, so they turn with the moon. The 33rd impact overwrites the oldest.",
      "On the home page the resting light follows tonight's real moon phase over Tucumán.",
    ],
    technologies: ["React Three Fiber", "Three.js", "GLSL", "Bayer"],
    title: "Lunar dither",
    topics: ["Shader", "WebGL", "Motion"],
    year: 2026,
  },
  "orbit-dust": {
    Poster: OrbitDustPoster,
    Preview: OrbitDustLive,
    hasControls: true,
    hasOriginal: false,
    implementation: [
      "Each particle stores only its orbit band, start angle, height and a seed. The vertex shader turns them into a position every frame, so the CPU never touches a particle.",
      "Angular velocity falls with the band as r^-1.5, so the inner ring laps the outer one like a Keplerian disc.",
      "Curl noise from three value-noise potentials with analytic gradients adds a divergence-free swirl.",
      "A hidden plane catches the pointer. Its hit point becomes a gravity well that pulls nearby dust in and down, eased in useFrame.",
    ],
    index: "LAB-13",
    registryItem: "orbit-dust",
    related: ["lunar-dither", "slime"],
    slug: "orbit-dust",
    summary:
      "A disc of dust orbiting a dark core, bent by a gravity well under the pointer.",
    technicalNotes: [
      "50k to 200k points, picked from hardwareConcurrency, devicePixelRatio and pointer type. Opacity scales with the count so density stays even.",
      "Light dust on a dark ground blends additively. On a light ground it switches to normal blending, so the ring prints in ink.",
      "Far particles fade with depth, and the core's limb catches a thin rim of light.",
      "The render loop stops offscreen. Reduced motion renders a single frame.",
    ],
    technologies: ["React Three Fiber", "Three.js", "GLSL", "Curl noise"],
    title: "Orbit dust",
    topics: ["Shader", "WebGL", "Motion"],
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
    index: "LAB-07",
    registryItem: "signal-tear",
    related: ["speed-smear"],
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
  slime: {
    Poster: SlimePoster,
    Preview: SlimeLive,
    hasControls: true,
    hasOriginal: false,
    implementation: [
      "One full-screen plane on a WebGPURenderer. A TSL node material raymarches 22 spheres joined by a wide smooth minimum, so every lobe stays fused like thick gel.",
      "Six core spheres hang off one mass that crawls toward random targets past the stage edges. It squashes flat against a wall, slides back and wobbles on a slow, underdamped spring.",
      "Ten drop spheres run a small life cycle: drip off the underside, fall, stick to a wall, ooze down and crawl back to merge. A click squashes the mass and flings six of them.",
      "Hovering lures the mass and pulls a strand to the pointer that trails behind and snaps into a drop. Dragging pulls a stiffer strand that drags the mass along.",
      "The light is faked in one pass: thickness from three inward samples, back-lit scatter where it is thin, a softbox and window reflection tinted by a thin-film spectrum, and noise veins read along the refracted ray.",
    ],
    index: "LAB-15",
    registryItem: "slime",
    related: ["orbit-dust", "lunar-dither"],
    slug: "slime",
    summary:
      "A thick green goo that crawls the stage, drips and splats on the walls. Hover and it reaches for you, click to splat it, drag to pull strands.",
    technicalNotes: [
      "WebGPU cannot share the site's WebGL canvas, so this one owns a Canvas that mounts only while the stage is in view. Without WebGPU, three falls back to WebGL2 with the same TSL graph.",
      "The physics is 22 spheres on the CPU. Only 22 vec4 uniforms cross to the GPU each frame.",
      "Each ray is tested against every live sphere first and marches only between the nearest entry and the farthest exit, so drops spread over the stage cost little. The edge is antialiased from the nearest miss.",
      "The veins and the scatter take the slime green. Quick clicks are latched, so a tap between two frames still splats. Reduced motion holds one frame, mid-splat.",
    ],
    technologies: ["React Three Fiber", "WebGPU", "TSL", "Raymarching"],
    title: "Slime",
    topics: ["Shader", "WebGPU", "Motion"],
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
    index: "LAB-06",
    registryItem: "speed-smear",
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
      "A strike lifts the dark areas, draws a forked bolt and reprints the frame in color, tile by tile outward from where the bolt lands, in twelve inks taken from the image.",
      "The aura springs to the pointer and rises as flame tongues in the dark areas. A click drops the bolt where you click, shakes the frame by whole cells and sends a burst ring that bends the image.",
    ],
    index: "LAB-01",
    registryItem: "storm-print",
    related: ["vegeta", "speed-smear"],
    slug: "super-saiyan",
    summary:
      "Goku in a storm, dithered live in ink. Lightning prints him in color.",
    technicalNotes: [
      "The palette is a median cut of the image, weighted toward saturated pixels. It runs in the browser on a small sample once the image loads.",
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
  vegeta: {
    Poster: VegetaPoster,
    Preview: VegetaLive,
    hasControls: true,
    implementation: [
      "The Super Saiyan print: each cell samples a mip matched to its size, sharpened against a blurrier mip, through Bayer or blue noise.",
      "A ki aura springs to the pointer as rising flame tongues printed in negative, with a hard ink rim and a paper core.",
      "A click sends a ring that bleaches the frame to paper. Tiles reprint outward from the blast point in twelve inks cut from the image, then fold back to ink from the edges in.",
    ],
    index: "LAB-02",
    registryItem: "blast-print",
    related: ["super-saiyan", "speed-smear"],
    slug: "vegeta",
    summary:
      "Majin Vegeta in ink. Final Explosion bleaches him and reprints him in color.",
    technicalNotes: [
      "Print, tone curve, blue noise and median cut are shared with Super Saiyan, so both frames dither the same way.",
      "A new explosion waits until the last one has reprinted. Reduced motion draws one still frame and never detonates.",
      "Everything is one draw call. The render loop stops offscreen and nothing animates through React state.",
    ],
    technologies: [
      "React Three Fiber",
      "GLSL",
      "Bayer",
      "Blue noise",
      "Median cut",
    ],
    title: "Final Explosion",
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
