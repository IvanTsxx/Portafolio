const columns = 64;
const rows = 36;

const bayer4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
] as const;

const thresholdAt = (column: number, row: number) =>
  ((bayer4[row % 4]?.[column % 4] ?? 0) + 0.5) / 16;

const toneAt = (column: number, row: number) => {
  const x = column / columns;
  const y = row / rows;
  const wave =
    Math.sin(x * 7.1 + y * 3.3) * 0.18 + Math.cos(y * 9.4 - x * 2.2) * 0.14;
  const distance = Math.hypot((x - 0.66) * 1.6, y - 0.42);
  const pressure = Math.exp(-distance * distance * 14);
  return { pressure, tone: 0.32 + wave + pressure * 0.62 };
};

const cellPath = (column: number, row: number) => `M${column} ${row}h1v1h-1z`;

const paths = { hot: "", ink: "" };
for (let cellIndex = 0; cellIndex < columns * rows; cellIndex += 1) {
  const column = cellIndex % columns;
  const row = Math.floor(cellIndex / columns);
  const { tone, pressure } = toneAt(column, row);
  if (tone > thresholdAt(column, row)) {
    paths[pressure > 0.7 ? "hot" : "ink"] += cellPath(column, row);
  }
}

export const DitherFieldPoster = () => (
  <svg
    aria-hidden
    className="size-full [shape-rendering:crispEdges]"
    preserveAspectRatio="xMidYMid slice"
    viewBox={`0 0 ${columns} ${rows}`}
  >
    <path className="fill-muted-foreground/70" d={paths.ink} />
    <path className="fill-clay" d={paths.hot} />
  </svg>
);
