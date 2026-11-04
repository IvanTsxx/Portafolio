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
  "dust-portrait": promptOf("Dust portrait", [
    "Draw the cover crop of the source into a canvas at the stage's aspect, about 45k to 120k pixels, and make one GL point per pixel. Store the home position, luminance, a seed and a local edge strength. Skip pixels that match the ground.",
    "At rest, draw each point as a round dot in the mark tone whose area follows its tone, sized from the stage height over the row count, so the field reproduces the picture crisply.",
    "Track the pointer as a head mark plus ten trailing marks dropped every 45 ms. Each mark's strength rides a critically damped spring: quick rise under the pointer, about 800 ms to settle after it leaves.",
    "In the vertex shader, take the strongest mark within a ragged radius that reaches further to the right. Displace the point along 2D curl noise and toward +x, shrink and fade it a little, all scaled by that influence.",
    "Optionally let rare edge points shed and return on a slow pulse. Stop requesting frames once every mark is at rest. Expose density, dispersion and drift.",
  ]),
  "lunar-dither": promptOf("Lunar dither", [
    "Skip the source image: draw a unit sphere (160×120 segments) with one ShaderMaterial and a camera that fits it to 78% of the shorter side.",
    "Height per pixel from object-space position: three octaves of 3D cellular craters (3×3×3 cells, 68% of cells hold one) with a squared bowl, a flat floor at -0.72 and a Gaussian rim, plus fine fbm regolith. Darken low-frequency fbm maria.",
    "Bend the normal with dFdx and dFdy of the height. Light it with a mix of Lambert and Lommel-Seeliger, a smoothstep terminator, a cubed limb rim and faint earthshine.",
    "Print the tone through an 8×8 Bayer matrix in gl_FragCoord cells of pixelSize × devicePixelRatio, with per-pixel grain that reseeds 24 times a second.",
    "The light direction eases toward the pointer (azimuth and elevation from pointer x and y), and the moon spins slowly on a tilted axis. Expose pixel size, grain, crater scale and follow pointer.",
    "Clicking the moon bombards it: raycast an analytic sphere, convert the hit to object space and write it into a ring buffer of 32 vec4 uniforms (direction, birth time). In the shader, add each impact's bowl, rim and fading ejecta rays to the height, plus a short paper flash and a dithered shockwave ring that spreads for 600 ms. Draw the incoming meteor as one instanced, dithered quad that flies 180 ms to the hit. Under reduced motion, place the crater at once. Expose a clear button and an impact count.",
  ]),
  "orbit-dust": promptOf("Orbit dust", [
    "Skip the source image: draw 50k to 200k GL points, chosen from hardwareConcurrency and devicePixelRatio. Store only band, start angle, height and a seed per point.",
    "In the vertex shader, place each point on its orbit: angle = start + time × 0.42 × band^-1.5, height = gaussian × thickness, flared toward the outer edge. Carve two thin gaps in the band density.",
    "Add a curl-noise displacement from three value-noise potentials with analytic gradients, drifting slowly in time.",
    "Catch the pointer on the ring plane. Pull points within a Gaussian reach toward it and down, as a gravity well that eases in and out.",
    "Draw soft round sprites sized by perspective, in two tones, faded by depth, with additive blending on a dark ground and normal blending on a light one. Put a dark core sphere with a thin limb rim at the center. Expose count, radius, thickness, turbulence and speed.",
  ]),
  "signal-tear": promptOf("Signal tear", [
    "Group pixel rows into bands of random height (4 to 42 px) that reshuffle three times a second.",
    "Each band tears with a probability that rises near the pointer row (Gaussian, 0.16 of the height) and with pointer speed. A torn band shifts sideways by a random amount up to 25% of the height, plus a 1-row jitter.",
    "Ghost trail: take the brightest of 12 samples to the left, each faded by distance, and blend it in, so light smears to the right but dark shapes never smear into light.",
    "Finish with a vignette, a contrast curve smoothstep(0.03, 0.88) and two octaves of film grain that change twelve times a second.",
    "Expose tear, ghost and grain amounts.",
  ]),
  slime: promptOf("Slime", [
    "Skip the source image: use three's WebGPURenderer (three/webgpu, it falls back to WebGL2) in its own React Three Fiber Canvas, and draw one clip-space plane with a MeshBasicNodeMaterial whose colorNode is a TSL raymarcher. Set toneMapped false.",
    "Field: 22 spheres in a uniformArray of vec4 (center, radius), joined by a polynomial smooth minimum with k = 0.3 so lobes stay fused like thick gel, plus a tiny sine ripple. Six core spheres sit around one mass center with a breathing radius and ride slow springs, so they lag and stretch when it moves.",
    "The mass crawls toward random targets up to 25% past the stage edges with heavy drag. Against a wall it is pushed back by a soft spring and squashed on two underdamped scale springs, flat along the wall and wide across it; a hard hit flings two drops. Hovering lures it toward the pointer and bulges the near spheres.",
    "Ten drop spheres cycle through: hang off the underside and stretch until they pinch off, fall under gravity, stick half off-screen to the wall they hit, ooze down, then crawl back and fade into the mass. A click near the mass squashes it and flings six drops upward; a click away makes it lunge there. Near the mass, hover hooks a five-sphere strand and a tip to the pointer that trails, thins and snaps into a falling drop; dragging pulls a stiffer one. Latch presses so a tap between frames still counts.",
    "Before marching, intersect the ray with every live sphere (radius plus a margin) and march only from the nearest entry to the farthest exit, up to 72 steps. Shade the hit with thickness from three inward field samples, wrap diffuse, back-lit scatter where it is thin, a softbox and window reflection tinted by a thin-film cosine spectrum on the Fresnel rim, and a sharp highlight. Read thin noise ridges along the refracted ray as veins that brighten on a splat or a taut strand.",
    "Two theme tones plus one green: on a dark ground the body is ink with glowing green edges; on a light ground it is milky green with darker veins. Antialias the silhouette from the nearest miss. Expose viscosity, reach and veins.",
  ]),
  "speed-smear": promptOf("Speed smear", [
    "Around the pointer, build an oval mask: Gaussian with radius R across the smear direction and 1.6 R along it (R = 16% of the height).",
    "Split the frame into streaks 6 px tall, perpendicular to the smear. Each streak gets its own length multiplier between 0.45 and 1.55 from a hash.",
    "Smear length = (base + pointer speed kick) × mask × streak length. Average 32 samples of the source along the smear direction across that length, sampling a coarser mip as the smear grows.",
    "Add a faint per-streak brightness offset inside the mask. When the pointer moves fast, draw thin one-cell speed lines in the opposite tone on a few streaks, with frayed ends. Pointer speed adds to the smear with a fast attack and decays smoothly when the pointer stops.",
    "Run the shared tone curve, then push mid-tones toward ink or paper so flat areas do not print as grey checkerboard. Print through an 8×8 ordered (Bayer) dither at 2 px cells, with a toggle for continuous tone. Expose smear, reach and angle.",
  ]),
  "super-saiyan": promptOf("Super Saiyan", [
    "Print the image through an 8×8 Bayer or blue noise ordered dither in ink, with a tone curve that lifts the subject and crushes the background.",
    "Rain: three layers of slanted streaks drawn in dither cells over the sky.",
    "Every few seconds, a lightning strike flashes the sky, draws a forked bolt and reprints the frame in color, in 6×6-cell tiles ordered by distance from where the bolt lands plus a little hash jitter, in a 12-color palette median-cut from the image. Ease out over 0.3 s, hold, then fold back to ink from the far tiles in.",
    "An aura springs to the pointer as flame tongues: vertically stretched value noise scrolling upward, thresholded against a heat falloff that reaches higher above the pointer than below, lifting only the dark areas. A click drops the bolt at the pointer, shakes the frame by whole cells and sends a ring that bends the image as it expands.",
    "Keep strikes at least three seconds apart. Expose dither type, rain amount, strike rate and aura radius.",
  ]),
  vegeta: promptOf("Final Explosion", [
    "Print the image in ink through an 8×8 Bayer or 64×64 blue noise ordered dither at 3 px cells. Sharpen each cell against a blurrier mip and run a contrast curve first.",
    "A ki aura springs to the pointer (stiffness 120, damping 16) as flame tongues: upward-scrolling stretched noise thresholded against a heat falloff of about 24% of the height. Print the tongues in negative with a hard ink rim and keep their hot core positive. Release the aura while an explosion runs.",
    "On click, a ring with a ragged ink front expands from the click point over 0.3 s (cubic ease-out) and bleaches everything it passes to paper.",
    "Then 6×6-cell tiles reprint outward from the blast point (distance order plus a little hash jitter) over 0.75 s, in a 12-color ordered dither median-cut from the image. Hold the color 1.1 s, then fold back to ink from the far tiles in over 0.8 s. A new explosion waits until the reprint ends. Expose dither type, cell size, aura radius and a Detonate button.",
  ]),
} as const satisfies Record<ExperimentSlug, string>;
