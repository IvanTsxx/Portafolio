import { formInkAt } from "@/components/lab/source/form-tone";

const width = 48;
const height = 27;
const radiusSteps = 10;
const maxRadius = Math.SQRT1_2;

const smoothstep = (edgeLow: number, edgeHigh: number, value: number) => {
  const amount = Math.min(
    Math.max((value - edgeLow) / (edgeHigh - edgeLow), 0),
    1
  );
  return amount * amount * (3 - 2 * amount);
};

const plates = [
  {
    angle: Math.PI / 4,
    className: "stroke-ink",
    coverage: (tone: number) => smoothstep(0.42, 1, tone),
    shift: { x: -0.18, y: 0.12 },
  },
  {
    angle: Math.PI / 12,
    className: "stroke-graphite",
    coverage: (tone: number) => tone * 0.72,
    shift: { x: 0.34, y: 0.22 },
  },
  {
    angle: (5 * Math.PI) / 12,
    className: "stroke-mist",
    coverage: (tone: number) => tone * 0.5,
    shift: { x: -0.12, y: -0.38 },
  },
] as const;

const dotRadius = (coverage: number) =>
  coverage <= Math.PI / 4
    ? Math.sqrt(coverage / Math.PI)
    : 0.5 + 0.2071 * ((coverage - Math.PI / 4) / (1 - Math.PI / 4)) ** 2.5;

const reach = Math.ceil(Math.hypot(width, height) / 2) + 1;

const platePaths = plates.map(({ angle, className, coverage, shift }) => {
  const strokes = Array.from({ length: radiusSteps }, () => "");
  for (let row = -reach; row < reach; row += 1) {
    for (let column = -reach; column < reach; column += 1) {
      const screenX = column + 0.5;
      const screenY = row + 0.5;
      const x =
        width / 2 + screenX * Math.cos(angle) - screenY * Math.sin(angle);
      const y =
        height / 2 + screenX * Math.sin(angle) + screenY * Math.cos(angle);
      if (x < -1 || x > width + 1 || y < -1 || y > height + 1) {
        continue;
      }
      const tone = formInkAt(
        (x - width / 2) / height,
        (height / 2 - y) / height
      );
      const step = Math.round(
        (dotRadius(coverage(tone)) / maxRadius) * (radiusSteps - 1)
      );
      if (step > 0) {
        strokes[step] +=
          `M${(x + shift.x).toFixed(2)} ${(y + shift.y).toFixed(2)}h0`;
      }
    }
  }
  return { className, strokes };
});

const dotWidth = (step: number) =>
  ((step / (radiusSteps - 1)) * maxRadius * 2).toFixed(3);

export const MisregistrationPoster = () => (
  <svg
    aria-hidden
    className="size-full"
    preserveAspectRatio="xMidYMid slice"
    viewBox={`0 0 ${width} ${height}`}
  >
    {platePaths.map(({ className, strokes }) => (
      <g className="mix-blend-multiply" key={className}>
        {strokes.map((path, step) =>
          path ? (
            <path
              className={className}
              d={path}
              fill="none"
              key={dotWidth(step)}
              strokeLinecap="round"
              strokeWidth={dotWidth(step)}
            />
          ) : null
        )}
      </g>
    ))}
  </svg>
);
