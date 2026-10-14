import { posterLight } from "@/components/lab/source/form-tone";
import { formRaster } from "@/components/lab/source/ink-raster";

import {
  createStippleField,
  dotRadiusFor,
  isStippleSettled,
  relaxStipple,
  weightAt,
} from "./stipple-field";

const width = 48;
const height = 27;
const cell = 1 / 6;
const sizeSteps = 4;

const field = createStippleField(
  formRaster(width / cell, height / cell, posterLight),
  1400
);
while (!isStippleSettled(field) && field.iterations < 80) {
  relaxStipple(field, () => true);
}

const baseRadius = dotRadiusFor(field) * cell;
const dots = Array.from({ length: sizeSteps }, () => "");
for (let point = 0; point < field.count; point += 1) {
  const x = field.points[point * 2] ?? 0;
  const y = field.points[point * 2 + 1] ?? 0;
  const sizeStep = Math.min(
    Math.floor(weightAt(field, x, y) * sizeSteps),
    sizeSteps - 1
  );
  dots[sizeStep] += `M${(x * cell).toFixed(2)} ${(y * cell).toFixed(2)}h0`;
}

const diameterFor = (sizeStep: number) =>
  (baseRadius * 2 * (0.55 + (0.45 * (sizeStep + 1)) / sizeSteps)).toFixed(3);

export const StipplePoster = () => (
  <svg
    aria-hidden
    className="size-full"
    preserveAspectRatio="xMidYMid slice"
    viewBox={`0 0 ${width} ${height}`}
  >
    {dots.map((path, sizeStep) =>
      path ? (
        <path
          className="stroke-ink"
          d={path}
          fill="none"
          key={diameterFor(sizeStep)}
          strokeLinecap="round"
          strokeWidth={diameterFor(sizeStep)}
        />
      ) : null
    )}
  </svg>
);
