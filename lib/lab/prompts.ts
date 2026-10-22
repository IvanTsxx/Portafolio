import type { ExperimentSlug } from "@/lib/lab/experiments";

const shared = [
  "Target: apply it to the element I point at (an image, a video, a component screenshot or a whole section). If the target is DOM, render the effect over a snapshot or use the source image directly.",
  "Render it as one full-size fragment shader on a single plane (WebGL, React Three Fiber, OGL or a 2D canvas fallback). Cover-fit the source with a focal point so the subject stays in frame.",
  "Use two colors, an ink and a paper token from my theme, unless a step below says otherwise.",
  "Pause the render loop when the element is offscreen. With prefers-reduced-motion, render one still frame and make pointer effects jump instead of ease.",
];

const promptOf = (title: string, steps: readonly string[]) =>
  [
    `Recreate the "${title}" effect exactly as described below.`,
    "",
    ...shared.map((line) => `- ${line}`),
    "",
    "Effect:",
    ...steps.map((line, index) => `${index + 1}. ${line}`),
  ].join("\n");

export const experimentPrompts = {
  ascii: promptOf("ASCII scanner", [
    "Split the frame into a grid of monospace cells (cell height 12 px, width 0.6 of the height).",
    "Sample the source luminance at each cell center from a mipmap level that matches the cell footprint, and lightly relight it toward the pointer.",
    "Map darkness to a glyph ramp sorted by measured ink, lightest first: ' .:-=+*#%@'. Draw glyphs from a texture atlas rendered once in the monospace font.",
    "Around the pointer, a rectangular scanner of 13×7 cells either halves the cell size (sharp mode) or inverts ink and paper (negative mode), outlined by a 1 px ink frame.",
    "Expose controls for cell size, glyph set (including a custom 12-glyph set) and scanner mode.",
  ]),
  "cloud-stipple": promptOf("Cloud stipple", [
    "Split the frame into square cells of 3 px. Give each cell a threshold from a tiled 64×64 blue noise texture (void-and-cluster, nearest filtering, repeat).",
    "Jitter each dot center inside its cell by up to 14% of the cell, using a hash of the cell.",
    "Read the source luminance at the dot center, apply contrast around 0.5 (default 1.3×), and place a round dot of radius 0.34 cell when the luminance is above the threshold.",
    "Night print by default: ink ground with paper dots. Without it, paper ground with ink dots where the image is dark.",
    "Boil: offset the noise tile by a random whole-cell shift a few times per second so the dots reseed. Under the pointer, add a soft Gaussian glow (+0.45 luminance) that eases in on hover.",
  ]),
  "dot-grid": promptOf("Dot grid", [
    "Lay a square grid of 12 px cells. Each pixel tests the dot of its own cell and the 8 neighbors, so dots can grow past their cell.",
    "Dot radius = 0.5 cell × clamp(0.12 + tone × 0.78 + lens × 0.55, 0, 1.35), where tone is the source darkness at the cell center through a smoothstep(0.05, 0.95).",
    "A lens follows the pointer on a spring (stiffness 140, damping 13). Its Gaussian falloff (radius 120 px) swells dots and pushes their centers outward by up to 0.6 cell.",
    "With no pointer, the lens drifts on a slow Lissajous path at 55% strength. The lens position also acts as the light that relights the source.",
    "Antialias the dot edge over 0.75 device pixels. Offer round or square marks.",
  ]),
  engraving: promptOf("Engraving", [
    "Draw a field of parallel lines (pitch 6 px, angle 30°) as a distance function: for each pixel, distance to the nearest line, antialiased with fwidth.",
    "Line width follows the source darkness: from a 5% hairline up to 62% of the pitch. Past 62% darkness, add a second line set crossed at 60° whose width grows with the remaining darkness.",
    "Bend the lines over the image: shift the line coordinate by a relief value (a heavily blurred mip of the luminance) × 0.14 × follow, so lines curve like a burin following a form.",
    "The pointer acts as a light that relights the source, easing toward it.",
    "Expose line pitch, angle and contour follow.",
  ]),
  "signal-tear": promptOf("Signal tear", [
    "Group pixel rows into bands of random height (4 to 42 px) that reshuffle three times a second.",
    "Each band tears with a probability that rises near the pointer row (Gaussian, 0.16 of the height) and with pointer speed. A torn band shifts sideways by a random amount up to 25% of the height, plus a 1-row jitter.",
    "Ghost trail: take the brightest of 12 samples to the left, each faded by distance, and blend it in, so light smears to the right but dark shapes never smear into light.",
    "Finish with a vignette, a contrast curve smoothstep(0.03, 0.88) and two octaves of film grain that change twelve times a second.",
    "Expose tear, ghost and grain amounts.",
  ]),
  "speed-smear": promptOf("Speed smear", [
    "Around the pointer, build an oval mask: Gaussian with radius R across the smear direction and 1.6 R along it (R = 16% of the height).",
    "Split the frame into streaks 6 px tall, perpendicular to the smear. Each streak gets its own length multiplier between 0.45 and 1.55 from a hash.",
    "Smear length = (base + pointer speed kick) × mask × streak length. Average 32 samples of the source along the smear direction across that length, sampling a coarser mip as the smear grows.",
    "Add a faint per-streak brightness offset inside the mask so it reads as anime speed lines. Pointer speed adds to the smear and decays smoothly when the pointer stops.",
    "Print the result through an 8×8 ordered (Bayer) dither at 2 px cells, with a toggle for continuous tone. Expose smear, reach and angle.",
  ]),
  "super-saiyan": promptOf("Super Saiyan", [
    "Print the image through an 8×8 Bayer or blue noise ordered dither in ink, with a tone curve that lifts the subject and crushes the background.",
    "Rain: three layers of slanted streaks drawn in dither cells over the sky.",
    "Every few seconds, a lightning strike flashes the sky, draws a forked bolt behind the subject and crossfades cell by cell to a color dither in a 12-color palette median-cut from the image, then fades back to ink.",
    "An aura springs to the pointer and gathers on the brightest silhouette. A click shakes the frame by whole cells and sends a ring that bends the image as it expands.",
    "Keep strikes at least three seconds apart. Expose dither type, rain amount, strike rate and aura radius.",
  ]),
  vegeta: promptOf("Final Explosion", [
    "Print the image in ink through an 8×8 Bayer or 64×64 blue noise ordered dither at 3 px cells. Sharpen each cell against a blurrier mip and run a contrast curve first.",
    "A ki aura springs to the pointer (stiffness 120, damping 16). Inside a radius of 24% of the height, with a flame-noise edge, print in negative: swap ink and paper. Dither the edge so it stays soft and add a thin dark rim.",
    "Pulse the forehead mark every 1.4 s: inside a small ellipse, lower the tone where a blurrier mip reads dark, so the strokes thicken.",
    "On click, a ring with a ragged ink front expands from the click point over 0.6 s and bleaches everything it passes to paper.",
    "Then each cell reprints in hashed order over 1.1 s, in a 12-color ordered dither median-cut from the image. Hold the color 0.8 s, then crossfade back to ink cell by cell. A new explosion waits until the reprint ends. Expose dither type, cell size, aura radius and a Detonate button.",
  ]),
} as const satisfies Record<ExperimentSlug, string>;
