import { posterInkAt } from "@/components/lab/source/poster-tone";

import { glyphRamps } from "./ramps";

const columns = 96;
const rows = 32;
const glyphWidth = 0.6;
const width = columns * glyphWidth;
const ramp = [...glyphRamps.classic];

const glyphAt = (column: number, row: number) => {
  const x = (column + 0.5) * glyphWidth;
  const ink = posterInkAt("messi", x / width, (row + 0.5) / rows);
  return ramp[Math.min(Math.floor(ink * ramp.length), ramp.length - 1)] ?? " ";
};

const lines = Array.from({ length: rows }, (_, row) => {
  const text = Array.from({ length: columns }, (_unused, column) =>
    glyphAt(column, row)
  ).join("");
  const runs = [...text.matchAll(/\S+/gu)].map((match) => ({
    glyphs: match[0],
    x: (match.index * glyphWidth).toFixed(1),
  }));
  return { row, runs };
});

export const AsciiPoster = () => (
  <svg
    aria-hidden
    className="fill-ink size-full font-mono"
    preserveAspectRatio="xMidYMid slice"
    viewBox={`0 0 ${width} ${rows}`}
  >
    {lines.map(({ row, runs }) => (
      <text fontSize={1} key={`row-${String(row)}`} y={row + 0.8}>
        {runs.map(({ glyphs, x }) => (
          <tspan key={x} x={x}>
            {glyphs}
          </tspan>
        ))}
      </text>
    ))}
  </svg>
);
