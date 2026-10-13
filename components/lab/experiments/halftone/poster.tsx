import { formInkAt } from "@/components/lab/source/form-tone";

const width = 48;
const height = 27;
const angle = Math.PI / 4;
const radiusSteps = 12;
const maxRadius = Math.SQRT1_2;

const dotRadius = (coverage: number) =>
  coverage <= Math.PI / 4
    ? Math.sqrt(coverage / Math.PI)
    : 0.5 + 0.2071 * ((coverage - Math.PI / 4) / (1 - Math.PI / 4)) ** 2.5;

const strokes = Array.from({ length: radiusSteps }, () => "");
const reach = Math.ceil(Math.hypot(width, height) / 2) + 1;
for (let row = -reach; row < reach; row += 1) {
  for (let column = -reach; column < reach; column += 1) {
    const screenX = column + 0.5;
    const screenY = row + 0.5;
    const x = width / 2 + screenX * Math.cos(angle) - screenY * Math.sin(angle);
    const y =
      height / 2 + screenX * Math.sin(angle) + screenY * Math.cos(angle);
    if (x < -1 || x > width + 1 || y < -1 || y > height + 1) {
      continue;
    }
    const coverage = formInkAt(
      (x - width / 2) / height,
      (height / 2 - y) / height
    );
    const step = Math.round(
      (dotRadius(coverage) / maxRadius) * (radiusSteps - 1)
    );
    if (step > 0) {
      strokes[step] += `M${x.toFixed(2)} ${y.toFixed(2)}h0`;
    }
  }
}

const dotWidth = (step: number) =>
  ((step / (radiusSteps - 1)) * maxRadius * 2).toFixed(3);

export const HalftonePoster = () => (
  <svg
    aria-hidden
    className="size-full"
    preserveAspectRatio="xMidYMid slice"
    viewBox={`0 0 ${width} ${height}`}
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
