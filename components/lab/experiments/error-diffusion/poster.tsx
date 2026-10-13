import { applyTone, diffuse, orderedDither, sphereRaster } from "./dither";

const columns = 64;
const rows = 36;
const split = 34;

const tone = applyTone(sphereRaster(columns, rows), {
  contrast: 1.15,
  threshold: 128,
});
const diffused = diffuse(tone, "floyd-steinberg", true);
const ordered = orderedDither(tone);

let inkPath = "";
for (let index = 0; index < columns * rows; index += 1) {
  const column = index % columns;
  const row = Math.floor(index / columns);
  const ink = column < split ? diffused[index] : ordered[index];
  if (ink) {
    inkPath += `M${column} ${row}h1v1h-1z`;
  }
}

export const ErrorDiffusionPoster = () => (
  <svg
    aria-hidden
    className="size-full [shape-rendering:crispEdges]"
    preserveAspectRatio="xMidYMid slice"
    viewBox={`0 0 ${columns} ${rows}`}
  >
    <path className="fill-ink" d={inkPath} />
    <rect className="fill-paper" height={rows} width={0.6} x={split - 0.3} />
    <rect className="fill-ink" height={rows} width={0.2} x={split - 0.1} />
    <rect
      className="fill-paper stroke-ink"
      height={3}
      strokeWidth={0.2}
      width={1.6}
      x={split - 0.8}
      y={rows / 2 - 1.5}
    />
  </svg>
);
