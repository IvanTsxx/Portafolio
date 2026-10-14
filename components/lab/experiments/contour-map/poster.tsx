import {
  chainSegments,
  contourSegments,
  elevationMetres,
  formHeight,
  sampleField,
} from "./contours";

const width = 48;
const height = 27;
const samplesPerUnit = 2;
const levels = 20;
const benchmark = { x: -0.12, y: 0.13 } as const;

const field = sampleField(
  width * samplesPerUnit + 1,
  height * samplesPerUnit + 1,
  (column, row) =>
    formHeight(
      (column / samplesPerUnit - width / 2) / height,
      (height / 2 - row / samplesPerUnit) / height
    )
);

const coordinate = (value: number) =>
  Number((value / samplesPerUnit).toFixed(1)).toString();

const toPath = (level: number) =>
  chainSegments(contourSegments(field, level / levels))
    .map((line) => {
      const points: string[] = [];
      for (let index = 0; index < line.length; index += 2) {
        points.push(
          `${coordinate(line[index] ?? 0)} ${coordinate(line[index + 1] ?? 0)}`
        );
      }
      return `M${points.join("L")}`;
    })
    .join("");

let minorPath = "";
let indexPath = "";
for (let level = 1; level < levels; level += 1) {
  if (level % 5 === 0) {
    indexPath += toPath(level);
  } else {
    minorPath += toPath(level);
  }
}

const markX = width / 2 + benchmark.x * height;
const markY = height / 2 - benchmark.y * height;
const markMetres = elevationMetres(formHeight(benchmark.x, benchmark.y));

export const ContourMapPoster = () => (
  <svg
    aria-hidden
    className="size-full"
    preserveAspectRatio="xMidYMid slice"
    viewBox={`0 0 ${width} ${height}`}
  >
    <path
      className="stroke-ink"
      d={minorPath}
      fill="none"
      strokeOpacity={0.78}
      strokeWidth={0.09}
    />
    <path className="stroke-ink" d={indexPath} fill="none" strokeWidth={0.2} />
    <path
      className="fill-paper stroke-ink"
      d={`M${markX} ${markY - 0.9}l0.8 1.4h-1.6Z`}
      strokeWidth={0.12}
    />
    <text
      className="fill-ink stroke-paper font-mono"
      fontSize={1}
      paintOrder="stroke"
      strokeWidth={0.3}
      x={markX + 1.1}
      y={markY + 0.45}
    >
      BM {markMetres}
    </text>
  </svg>
);
