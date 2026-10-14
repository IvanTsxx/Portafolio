import { posterLight } from "@/components/lab/source/form-tone";
import { formRaster } from "@/components/lab/source/ink-raster";

import { createHatchPlanner, penAt, traceSpan } from "./hatch-plan";

const width = 48;
const height = 27;
const cell = 0.25;
const plotted = 0.72;

const planner = createHatchPlanner(
  formRaster(width / cell, height / cell, posterLight),
  cell,
  { angle: Math.PI / 4, layers: 3, pitch: 0.6 }
);
planner.step(() => true);
const { plan } = planner;
const cut = plan.timelineLength * plotted;

let inkPath = "";
const format = (value: number) => value.toFixed(1);
traceSpan(
  {
    lineTo: (x, y) => {
      inkPath += `L${format(x)} ${format(y)}`;
    },
    moveTo: (x, y) => {
      inkPath += `M${format(x)} ${format(y)}`;
    },
  },
  plan,
  0,
  cut
);
const pen = penAt(plan, cut) ?? { x: width / 2, y: height / 2 };

export const PlotterHatchingPoster = () => (
  <svg
    aria-hidden
    className="size-full"
    preserveAspectRatio="xMidYMid slice"
    viewBox={`0 0 ${width} ${height}`}
  >
    <path
      className="stroke-ink"
      d={inkPath}
      fill="none"
      strokeLinecap="round"
      strokeWidth={0.14}
    />
    <g className="stroke-ink" fill="none" strokeWidth={0.12}>
      <circle cx={pen.x} cy={pen.y} r={0.7} />
      <path
        d={`M${format(pen.x - 1.6)} ${format(pen.y)}h3.2M${format(pen.x)} ${format(pen.y - 1.6)}v3.2`}
      />
    </g>
  </svg>
);
