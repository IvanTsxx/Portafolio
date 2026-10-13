const columns = 48;
const rows = 27;
const lens = { radius: 6.5, x: 31, y: 11 } as const;

const toneAt = (column: number, row: number) => {
  const x = column / columns;
  const y = row / rows;
  const wave =
    Math.sin(x * 6.3 + y * 2.9) * 0.22 + Math.cos(y * 8.1 - x * 3.4) * 0.16;
  return Math.min(Math.max(0.5 + wave, 0), 1);
};

const radiusSteps = 8;
const maxRadius = 0.675;

const strokes = Array.from({ length: radiusSteps }, () => "");
for (let cellIndex = 0; cellIndex < columns * rows; cellIndex += 1) {
  const column = cellIndex % columns;
  const row = Math.floor(cellIndex / columns);
  const centerX = column + 0.5;
  const centerY = row + 0.5;
  const awayX = centerX - lens.x;
  const awayY = centerY - lens.y;
  const distance = Math.hypot(awayX, awayY);
  const falloff = Math.exp(-((distance / lens.radius) ** 2));
  const push = distance > 0 ? (falloff * 0.6) / distance : 0;
  const radius =
    0.5 * Math.min(0.12 + toneAt(column, row) * 0.78 + falloff * 0.55, 1.35);
  const step = Math.min(
    radiusSteps - 1,
    Math.round((radius / maxRadius) * (radiusSteps - 1))
  );
  const x = (centerX + awayX * push).toFixed(2);
  const y = (centerY + awayY * push).toFixed(2);
  strokes[step] += `M${x} ${y}h0`;
}

const dotWidth = (step: number) =>
  ((step / (radiusSteps - 1)) * maxRadius * 2).toFixed(3);

export const DotGridPoster = () => (
  <svg
    aria-hidden
    className="size-full"
    preserveAspectRatio="xMidYMid slice"
    viewBox={`0 0 ${columns} ${rows}`}
  >
    {strokes.map((path, step) =>
      path ? (
        <path
          className="stroke-ink"
          d={path}
          fill="none"
          key={dotWidth(step)}
          strokeLinecap="round"
          strokeWidth={dotWidth(step)}
        />
      ) : null
    )}
  </svg>
);
