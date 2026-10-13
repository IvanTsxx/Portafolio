import { formInkAt } from "@/components/lab/source/form-tone";

const width = 192;
const height = 108;
const threshold = 0.5;
const roughness = 0.45;

const hash = (x: number, y: number) => {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43_758.5453;
  return value - Math.floor(value);
};

const valueNoise = (x: number, y: number) => {
  const cellX = Math.floor(x);
  const cellY = Math.floor(y);
  const blendX = (x - cellX) ** 2 * (3 - 2 * (x - cellX));
  const blendY = (y - cellY) ** 2 * (3 - 2 * (y - cellY));
  const bottom =
    hash(cellX, cellY) + (hash(cellX + 1, cellY) - hash(cellX, cellY)) * blendX;
  const top =
    hash(cellX, cellY + 1) +
    (hash(cellX + 1, cellY + 1) - hash(cellX, cellY + 1)) * blendX;
  return bottom + (top - bottom) * blendY;
};

const isInked = (column: number, row: number) => {
  const x = (column + 0.5 - width / 2) / height;
  const y = (height / 2 - row - 0.5) / height;
  const chips =
    valueNoise(x * 22, y * 22) * 0.6 + valueNoise(x * 57, y * 57) * 0.4 - 0.5;
  const sweep = 0.13 * Math.sin(x * 2.2 - y * 1.1);
  return formInkAt(x, y) + chips * 0.38 * roughness > threshold + sweep;
};

let runs = "";
for (let row = 0; row < height; row += 1) {
  let start = -1;
  for (let column = 0; column <= width; column += 1) {
    const inked = column < width && isInked(column, row);
    if (inked && start < 0) {
      start = column;
    }
    if (!inked && start >= 0) {
      runs += `M${start} ${row}h${column - start}v1h${start - column}z`;
      start = -1;
    }
  }
}

export const ThresholdCutPoster = () => (
  <svg
    aria-hidden
    className="size-full"
    preserveAspectRatio="xMidYMid slice"
    viewBox={`0 0 ${width} ${height}`}
  >
    <path className="fill-ink" d={runs} />
  </svg>
);
